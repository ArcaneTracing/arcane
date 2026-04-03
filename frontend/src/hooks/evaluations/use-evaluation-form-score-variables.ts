import { useEffect, useState, useRef } from "react";
import { useQueryClient, QueryClient } from "@tanstack/react-query";
import { ScoreResponse } from "@/types/scores";
import { PromptVersionResponse } from "@/types/prompts";
import { extractVariablesFromPromptVersion } from "@/lib/prompt-utils";
import { scoresApi } from "@/api/scores";
import { promptsApi } from "@/api/prompts";
import { RAGAS_SCORES } from "@/components/evaluations/ragas-scores";
import { EvaluationResponse } from "@/types/evaluations";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";


const scoreQueryKey = (organisationId: string, projectId: string, scoreId: string) => ['score', organisationId, projectId, scoreId] as const;
const latestPromptVersionQueryKey = (organisationId: string, projectId: string, promptId: string) => ['latestPromptVersion', organisationId, projectId, promptId] as const;
const promptVersionsQueryKey = (organisationId: string, projectId: string, promptId: string) => ['promptVersions', organisationId, projectId, promptId] as const;
const promptVersionQueryKey = (organisationId: string, projectId: string, versionId: string) => ['promptVersion', organisationId, projectId, versionId] as const;

export interface UseEvaluationFormScoreVariablesReturn {
  scoreVariables: Record<string, string[]>;
  evaluatorPromptVersions: Record<string, PromptVersion>;
  isRagasScore: (score: ScoreResponse) => boolean;
}


function isRagasScore(score: Score): boolean {
  return score.scoringType === 'RAGAS';
}


function getRagasScoreFields(ragasScoreKey: string): string[] {
  const ragasScore = Object.values(RAGAS_SCORES).find((rs) => rs.id === ragasScoreKey);
  return ragasScore?.fields || [];
}


function handleRagasScoreVariables(
scoreId: string,
score: Score,
setScoreVariables: React.Dispatch<React.SetStateAction<Record<string, string[]>>>)
: boolean {
  if (!score.ragasScoreKey) {
    console.warn(`RAGAS score ${scoreId} missing ragasScoreKey`);
    return false;
  }

  const fields = getRagasScoreFields(score.ragasScoreKey);
  if (fields.length > 0) {
    setScoreVariables((prev) => ({ ...prev, [scoreId]: fields }));
    return true;
  }
  return false;
}
async function fetchPromptVersion(
queryClient: QueryClient,
organisationId: string,
projectId: string,
evaluatorPromptId: string)
: Promise<PromptVersionResponse | null> {
  try {

    return await queryClient.fetchQuery({
      queryKey: latestPromptVersionQueryKey(organisationId, projectId, evaluatorPromptId),
      queryFn: () => promptsApi.getLatestVersion(organisationId, projectId, evaluatorPromptId)
    });
  } catch {

    try {
      const promptVersions = await queryClient.fetchQuery({
        queryKey: promptVersionsQueryKey(organisationId, projectId, evaluatorPromptId),
        queryFn: () => promptsApi.listVersions(organisationId, projectId, evaluatorPromptId)
      });

      if (promptVersions.length === 0) {
        return null;
      }


      const latestVersion = promptVersions[promptVersions.length - 1];
      return await queryClient.fetchQuery({
        queryKey: promptVersionQueryKey(organisationId, projectId, latestVersion.id),
        queryFn: () => promptsApi.getVersionById(organisationId, projectId, latestVersion.id)
      });
    } catch (err) {
      console.error(`Failed to fetch evaluator prompt versions for prompt ${evaluatorPromptId}:`, err);
      return null;
    }
  }
}


async function handleEvaluatorPromptScore(
queryClient: QueryClient,
organisationId: string,
projectId: string,
scoreId: string,
fetchedScore: Score,
setScoreVariables: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
setEvaluatorPromptVersions: React.Dispatch<React.SetStateAction<Record<string, PromptVersion>>>)
: Promise<void> {
  const evaluatorPromptId = fetchedScore.evaluatorPrompt?.id;
  if (!evaluatorPromptId) {
    return;
  }

  const promptVersion = await fetchPromptVersion(queryClient, organisationId, projectId, evaluatorPromptId);
  if (!promptVersion) {
    return;
  }

  setEvaluatorPromptVersions((prev) => ({ ...prev, [scoreId]: promptVersion }));

  const vars = extractVariablesFromPromptVersion(promptVersion);
  if (vars.length > 0) {
    setScoreVariables((prev) => ({ ...prev, [scoreId]: vars }));
  }
}
async function fetchAndProcessScore(
queryClient: QueryClient,
organisationId: string,
projectId: string,
scoreId: string,
scores: ScoreResponse[],
setScoreVariables: React.Dispatch<React.SetStateAction<Record<string, string[]>>>,
setEvaluatorPromptVersions: React.Dispatch<React.SetStateAction<Record<string, PromptVersion>>>)
: Promise<void> {

  let score = scores.find((s) => s.id === scoreId);


  if (!score) {
    try {
      score = await queryClient.fetchQuery({
        queryKey: scoreQueryKey(organisationId, projectId, scoreId),
        queryFn: () => scoresApi.get(organisationId, projectId, scoreId)
      });
    } catch (err) {
      console.error(`Failed to fetch score ${scoreId}:`, err);
      return;
    }
  }

  if (!score) {
    return;
  }


  if (isRagasScore(score)) {
    handleRagasScoreVariables(scoreId, score, setScoreVariables);
    return;
  }


  await handleEvaluatorPromptScore(
    queryClient,
    organisationId,
    projectId,
    scoreId,
    score,
    setScoreVariables,
    setEvaluatorPromptVersions
  );
}


function cleanupStateEntries<T>(
state: Record<string, T>,
currentScoreIds: Set<string>)
: Record<string, T> | null {
  const newState = { ...state };
  let changed = false;

  Object.keys(newState).forEach((scoreId) => {
    if (!currentScoreIds.has(scoreId)) {
      delete newState[scoreId];
      changed = true;
    }
  });

  return changed ? newState : null;
}

export function useEvaluationFormScoreVariables(
projectId: string,
selectedScoreIds: string[],
scores: ScoreResponse[],
evaluation: EvaluationResponse | null | undefined)
: UseEvaluationFormScoreVariablesReturn {
  const [scoreVariables, setScoreVariables] = useState<Record<string, string[]>>({});
  const [evaluatorPromptVersions, setEvaluatorPromptVersions] = useState<Record<string, PromptVersionResponse>>({});
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();
  const fetchedScoresRef = useRef<Set<string>>(new Set());


  useEffect(() => {
    if (!organisationId || !projectId || selectedScoreIds.length === 0) {
      return;
    }
    const scoresToFetch = selectedScoreIds.filter((scoreId) => {

      if (fetchedScoresRef.current.has(scoreId)) {

        const hasVariables = scoreVariables[scoreId] && scoreVariables[scoreId].length > 0;
        return !hasVariables;
      }


      const score = scores.find((s) => s.id === scoreId);
      if (score) {

        if (isRagasScore(score)) {
          const hasVariables = scoreVariables[scoreId] && scoreVariables[scoreId].length > 0;
          return !hasVariables;
        }

        const hasVariables = scoreVariables[scoreId] && scoreVariables[scoreId].length > 0;
        return !hasVariables;
      }


      return true;
    });

    if (scoresToFetch.length === 0) {
      return;
    }
    if (!organisationId) return;


    scoresToFetch.forEach((scoreId) => fetchedScoresRef.current.add(scoreId));

    const fetchScoreDetails = async () => {

      await Promise.all(
        scoresToFetch.map((scoreId) =>
        fetchAndProcessScore(
          queryClient,
          organisationId,
          projectId,
          scoreId,
          scores,
          setScoreVariables,
          setEvaluatorPromptVersions
        )
        )
      );
    };

    fetchScoreDetails();

  }, [organisationId, projectId, selectedScoreIds.join(','), queryClient, scores.length]);


  useEffect(() => {
    const currentScoreIds = new Set(selectedScoreIds);


    fetchedScoresRef.current.forEach((scoreId) => {
      if (!currentScoreIds.has(scoreId)) {
        fetchedScoresRef.current.delete(scoreId);
      }
    });

    setScoreVariables((prev) => {
      const cleaned = cleanupStateEntries(prev, currentScoreIds);
      return cleaned || prev;
    });

    setEvaluatorPromptVersions((prev) => {
      const cleaned = cleanupStateEntries(prev, currentScoreIds);
      return cleaned || prev;
    });
  }, [selectedScoreIds]);


  useEffect(() => {
    if (!organisationId || !evaluation || !projectId) {
      return;
    }

    const initializeScoreVariables = async () => {
      for (const evalScore of evaluation.scores) {
        const score = scores.find((s) => s.id === evalScore.id);
        if (!score) continue;


        if (isRagasScore(score)) {
          handleRagasScoreVariables(score.id, score, setScoreVariables);
        } else {

          await fetchAndProcessScore(
            queryClient,
            organisationId,
            projectId,
            score.id,
            scores,
            setScoreVariables,
            setEvaluatorPromptVersions
          );
        }
      }
    };

    initializeScoreVariables();
  }, [organisationId, evaluation?.id, evaluation, scores, projectId, queryClient]);

  return {
    scoreVariables,
    evaluatorPromptVersions,
    isRagasScore
  };
}