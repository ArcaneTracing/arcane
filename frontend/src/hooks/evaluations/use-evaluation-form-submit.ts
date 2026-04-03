import { CreateEvaluationRequest } from "@/types/evaluations";
import { EvaluationScope } from "@/types/enums";
import { ScoreResponse } from "@/types/scores";

export interface UseEvaluationFormSubmitParams {
  name: string;
  description: string;
  evaluationType: string;
  evaluationScope: EvaluationScope;
  selectedScoreIds: string[];
  datasetId: string;
  selectedExperimentIds: string[];
  scoreMappings: Record<string, Record<string, string>>;
  ragasModelConfigurationId: string;
  scores: ScoreResponse[];
  isRagasScore: (score: ScoreResponse) => boolean;
  experimentDatasetError: string;
}

export function buildEvaluationRequest(params: UseEvaluationFormSubmitParams): CreateEvaluationRequest {
  const {
    name,
    description,
    evaluationType,
    evaluationScope,
    selectedScoreIds,
    datasetId,
    selectedExperimentIds,
    scoreMappings,
    ragasModelConfigurationId,
    scores,
    isRagasScore,
    experimentDatasetError
  } = params;


  if (!name.trim()) {
    throw new Error('Please enter a name for the evaluation');
  }


  if (selectedScoreIds.length === 0) {
    throw new Error('Please select at least one score');
  }


  if (evaluationScope === 'DATASET' && !datasetId) {
    throw new Error('Please select a dataset');
  }

  if (evaluationScope === 'EXPERIMENT' && selectedExperimentIds.length === 0) {
    throw new Error('Please select at least one experiment');
  }


  if (experimentDatasetError) {
    throw new Error(experimentDatasetError);
  }


  const selectedRagasScores = selectedScoreIds.
  map((id) => scores.find((s) => s.id === id)).
  filter((score): score is ScoreResponse => !!score && isRagasScore(score));


  if (selectedRagasScores.length > 0 && !ragasModelConfigurationId) {
    throw new Error('Please select a RAGAS model configuration');
  }


  const scoreMappingsData: Record<string, Record<string, unknown>> = {};
  Object.keys(scoreMappings).forEach((scoreId) => {
    const mappings = scoreMappings[scoreId];
    const filteredMappings: Record<string, unknown> = {};
    Object.keys(mappings).forEach((variable) => {
      if (mappings[variable]?.trim()) {
        filteredMappings[variable] = mappings[variable].trim();
      }
    });
    if (Object.keys(filteredMappings).length > 0) {
      scoreMappingsData[scoreId] = filteredMappings;
    }
  });

  const requestData: CreateEvaluationRequest = {
    evaluationType,
    evaluationScope,
    name,
    ...(description.trim() ? { description } : {}),
    scoreIds: selectedScoreIds,
    ...(evaluationScope === 'DATASET' ? { datasetId } : { experimentIds: selectedExperimentIds }),
    ...(Object.keys(scoreMappingsData).length > 0 ? { scoreMappings: scoreMappingsData } : {}),
    ...(selectedRagasScores.length > 0 && ragasModelConfigurationId ? { ragasModelConfigurationId } : {})
  };

  return requestData;
}