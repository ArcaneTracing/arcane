import { EvaluationResponse } from "@/types/evaluations";
import { EvaluationScope } from "@/types/enums";
import { ScoreResponse } from "@/types/scores";
import { ExperimentResponse } from "@/types/experiments";
import { DatasetListItemResponse } from "@/types/datasets";
import { PromptVersionResponse } from "@/types/prompts";
import { useScoresQuery } from "@/hooks/scores/use-scores-query";
import { useExperimentsQuery } from "@/hooks/experiments/use-experiments-query";
import { useEvaluationFormState } from "./use-evaluation-form-state";
import { useEvaluationFormDatasets } from "./use-evaluation-form-datasets";
import { useEvaluationFormScores } from "./use-evaluation-form-scores";

export interface UseEvaluationFormReturn {

  name: string;
  description: string;
  evaluationType: string;
  evaluationScope: EvaluationScope;
  selectedScoreIds: string[];
  datasetId: string;
  selectedExperimentIds: string[];
  datasets: DatasetListItemResponse[];
  loadingDatasets: boolean;
  scoreMappings: Record<string, Record<string, string>>;
  scoreVariables: Record<string, string[]>;
  evaluatorPromptVersions: Record<string, PromptVersionResponse>;
  datasetHeaders: string[];
  loadingHeaders: boolean;
  customFieldValues: Record<string, Record<number, string>>;
  experimentDatasetError: string;
  ragasModelConfigurationId: string;


  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setEvaluationScope: (scope: EvaluationScope) => void;
  setSelectedScoreIds: (ids: string[]) => void;
  setDatasetId: (datasetId: string) => void;
  setSelectedExperimentIds: (ids: string[]) => void;
  setRagasModelConfigurationId: (id: string) => void;


  isRagasScore: (score: ScoreResponse) => boolean;
  updateScoreMapping: (scoreId: string, variable: string, value: string) => void;
  handleScoreMappingFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  handleScoreCustomFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  getScoreMappingSelectValue: (scoreId: string, variable: string, variableIndex: number) => string;
  handleScopeReset: () => void;


  scores: ScoreResponse[];
  loadingScores: boolean;
  scoresError?: unknown;
  experiments: ExperimentResponse[];
  loadingExperiments: boolean;
  experimentsError?: unknown;
  datasetsError?: unknown;
}

export function useEvaluationForm(
evaluation: EvaluationResponse | null | undefined,
projectId: string)
: UseEvaluationFormReturn {
  const { data: scores = [], isLoading: loadingScores, error: scoresError } = useScoresQuery(projectId);
  const { data: experiments = [], isLoading: loadingExperiments, error: experimentsError } = useExperimentsQuery(projectId);

  const formState = useEvaluationFormState(evaluation, projectId);

  const datasetsState = useEvaluationFormDatasets(
    projectId,
    formState.evaluationScope,
    formState.datasetId,
    formState.selectedExperimentIds,
    experiments
  );

  const scoresState = useEvaluationFormScores(
    projectId,
    formState.selectedScoreIds,
    scores,
    datasetsState.datasetHeaders,
    evaluation
  );

  return {
    name: formState.name,
    description: formState.description,
    evaluationType: formState.evaluationType,
    evaluationScope: formState.evaluationScope,
    selectedScoreIds: formState.selectedScoreIds,
    datasetId: formState.datasetId,
    selectedExperimentIds: formState.selectedExperimentIds,
    datasets: formState.datasets,
    loadingDatasets: formState.loadingDatasets,
    scoreMappings: scoresState.scoreMappings,
    scoreVariables: scoresState.scoreVariables,
    evaluatorPromptVersions: scoresState.evaluatorPromptVersions,
    datasetHeaders: datasetsState.datasetHeaders,
    loadingHeaders: datasetsState.loadingHeaders,
    customFieldValues: scoresState.customFieldValues,
    experimentDatasetError: datasetsState.experimentDatasetError,
    ragasModelConfigurationId: formState.ragasModelConfigurationId,
    setName: formState.setName,
    setDescription: formState.setDescription,
    setEvaluationScope: formState.setEvaluationScope,
    setSelectedScoreIds: formState.setSelectedScoreIds,
    setDatasetId: formState.setDatasetId,
    setSelectedExperimentIds: formState.setSelectedExperimentIds,
    setRagasModelConfigurationId: formState.setRagasModelConfigurationId,
    isRagasScore: scoresState.isRagasScore,
    updateScoreMapping: scoresState.updateScoreMapping,
    handleScoreMappingFieldChange: scoresState.handleScoreMappingFieldChange,
    handleScoreCustomFieldChange: scoresState.handleScoreCustomFieldChange,
    getScoreMappingSelectValue: scoresState.getScoreMappingSelectValue,
    handleScopeReset: formState.handleScopeReset,
    scores,
    loadingScores,
    scoresError,
    experiments,
    loadingExperiments,
    experimentsError,
    datasetsError: datasetsState.datasetsError
  };
}