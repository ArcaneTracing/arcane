import { useEffect, useState } from "react";
import { ScoreResponse } from "@/types/scores";
import { EvaluationResponse } from "@/types/evaluations";

type InitializeRagasMappingsParams = {
  evaluation: EvaluationResponse;
  scores: ScoreResponse[];
  newMappings: Record<string, Record<string, string>>;
  scoreMappings: EvaluationResponse['scoreMappings'];
  isRagasScore: (score: ScoreResponse) => boolean;
};

function initializeRagasMappings({
  evaluation,
  scores,
  newMappings,
  scoreMappings,
  isRagasScore
}: InitializeRagasMappingsParams): boolean {
  let changed = false;
  for (const evalScore of evaluation.scores) {
    const score = scores.find((s) => s.id === evalScore.id);
    if (!score || !isRagasScore(score)) continue;

    if (scoreMappings?.[score.id] && !newMappings[score.id]) {
      newMappings[score.id] = scoreMappings[score.id] as Record<string, string>;
      changed = true;
    } else if (!newMappings[score.id]) {
      newMappings[score.id] = {};
      changed = true;
    }
  }
  return changed;
}

type InitializeNonRagasMappingsParams = {
  scoreMappings: EvaluationResponse['scoreMappings'];
  scores: ScoreResponse[];
  newMappings: Record<string, Record<string, string>>;
  isRagasScore: (score: ScoreResponse) => boolean;
};

function initializeNonRagasMappings({
  scoreMappings,
  scores,
  newMappings,
  isRagasScore
}: InitializeNonRagasMappingsParams): boolean {
  if (!scoreMappings) return false;

  let changed = false;
  for (const scoreId of Object.keys(scoreMappings)) {
    const score = scores.find((s) => s.id === scoreId);
    if (score && !isRagasScore(score) && !newMappings[scoreId]) {
      newMappings[scoreId] = scoreMappings[scoreId] as Record<string, string>;
      changed = true;
    }
  }
  return changed;
}
export interface UseEvaluationFormScoreMappingsReturn {
  scoreMappings: Record<string, Record<string, string>>;
  customFieldValues: Record<string, Record<number, string>>;
  updateScoreMapping: (scoreId: string, variable: string, value: string) => void;
  handleScoreMappingFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  handleScoreCustomFieldChange: (scoreId: string, variableIndex: number, value: string) => void;
  getScoreMappingSelectValue: (scoreId: string, variable: string, variableIndex: number) => string;
}

export function useEvaluationFormScoreMappings(
selectedScoreIds: string[],
scoreVariables: Record<string, string[]>,
datasetHeaders: string[],
scores: ScoreResponse[],
evaluation: EvaluationResponse | null | undefined,
isRagasScore: (score: ScoreResponse) => boolean)
: UseEvaluationFormScoreMappingsReturn {
  const [scoreMappings, setScoreMappings] = useState<Record<string, Record<string, string>>>({});
  const [customFieldValues, setCustomFieldValues] = useState<Record<string, Record<number, string>>>({});


  useEffect(() => {
    Object.keys(scoreVariables).forEach((scoreId) => {
      if (scoreVariables[scoreId].length > 0) {
        setScoreMappings((prev) => {

          if (!prev[scoreId]) {
            return {
              ...prev,
              [scoreId]: {}
            };
          }
          return prev;
        });
      }
    });
  }, [scoreVariables]);


  useEffect(() => {
    const currentScoreIds = new Set(selectedScoreIds);

    setScoreMappings((prev) => {
      const newMappings = { ...prev };
      let changed = false;
      Object.keys(newMappings).forEach((scoreId) => {
        if (!currentScoreIds.has(scoreId)) {
          delete newMappings[scoreId];
          changed = true;
        }
      });
      return changed ? newMappings : prev;
    });

    setCustomFieldValues((prev) => {
      const newValues = { ...prev };
      let changed = false;
      Object.keys(newValues).forEach((scoreId) => {
        if (!currentScoreIds.has(scoreId)) {
          delete newValues[scoreId];
          changed = true;
        }
      });
      return changed ? newValues : prev;
    });
  }, [selectedScoreIds]);


  useEffect(() => {
    if (!evaluation) {
      return;
    }

    setScoreMappings((prev) => {
      const newMappings = { ...prev };
      const scoreMappings = evaluation.scoreMappings;

      const ragasChanged = initializeRagasMappings({
        evaluation,
        scores,
        newMappings,
        scoreMappings,
        isRagasScore
      });

      const nonRagasChanged = initializeNonRagasMappings({
        scoreMappings,
        scores,
        newMappings,
        isRagasScore
      });

      const changed = ragasChanged || nonRagasChanged;
      return changed ? newMappings : prev;
    });

  }, [evaluation?.id]);

  const updateScoreMapping = (scoreId: string, variable: string, value: string) => {
    setScoreMappings((prev) => ({
      ...prev,
      [scoreId]: {
        ...prev[scoreId],
        [variable]: value
      }
    }));
  };

  const handleScoreMappingFieldChange = (scoreId: string, variableIndex: number, value: string) => {
    const variable = scoreVariables[scoreId]?.[variableIndex];
    if (!variable) return;

    if (value === '__other__') {

      const currentValue = scoreMappings[scoreId]?.[variable] || '';
      if (!customFieldValues[scoreId]?.[variableIndex] && currentValue && !datasetHeaders.includes(currentValue)) {
        setCustomFieldValues((prev) => ({
          ...prev,
          [scoreId]: {
            ...prev[scoreId],
            [variableIndex]: currentValue
          }
        }));
      }
      updateScoreMapping(scoreId, variable, customFieldValues[scoreId]?.[variableIndex] || '');
    } else {

      setCustomFieldValues((prev) => {
        const newValues = { ...prev };
        if (newValues[scoreId]) {
          const scoreValues = { ...newValues[scoreId] };
          delete scoreValues[variableIndex];
          newValues[scoreId] = scoreValues;
        }
        return newValues;
      });
      updateScoreMapping(scoreId, variable, value);
    }
  };

  const handleScoreCustomFieldChange = (scoreId: string, variableIndex: number, value: string) => {
    setCustomFieldValues((prev) => ({
      ...prev,
      [scoreId]: {
        ...prev[scoreId],
        [variableIndex]: value
      }
    }));
    const variable = scoreVariables[scoreId]?.[variableIndex];
    if (variable) {
      updateScoreMapping(scoreId, variable, value);
    }
  };

  const getScoreMappingSelectValue = (scoreId: string, variable: string, variableIndex: number): string => {
    const mappingValue = scoreMappings[scoreId]?.[variable] || '';
    if (datasetHeaders.includes(mappingValue)) {
      return mappingValue;
    }

    if (mappingValue && mappingValue.trim() !== '') {
      return '__other__';
    }
    return '';
  };

  return {
    scoreMappings,
    customFieldValues,
    updateScoreMapping,
    handleScoreMappingFieldChange,
    handleScoreCustomFieldChange,
    getScoreMappingSelectValue
  };
}