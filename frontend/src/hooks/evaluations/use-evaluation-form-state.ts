import { useState, useEffect } from "react";
import { EvaluationResponse } from "@/types/evaluations";
import { EvaluationType, EvaluationScope } from "@/types/enums";
import { DatasetListItemResponse } from "@/types/datasets";
import { useDatasetsQuery } from "@/hooks/datasets/use-datasets-query";

export interface UseEvaluationFormStateReturn {

  name: string;
  description: string;
  evaluationType: EvaluationType;
  evaluationScope: EvaluationScope;
  selectedScoreIds: string[];
  datasetId: string;
  selectedExperimentIds: string[];
  datasets: DatasetListItemResponse[];
  loadingDatasets: boolean;
  datasetsError?: unknown;
  ragasModelConfigurationId: string;


  setName: (name: string) => void;
  setDescription: (description: string) => void;
  setEvaluationScope: (scope: EvaluationScope) => void;
  setSelectedScoreIds: (ids: string[]) => void;
  setDatasetId: (datasetId: string) => void;
  setSelectedExperimentIds: (ids: string[]) => void;
  setRagasModelConfigurationId: (id: string) => void;


  handleScopeReset: () => void;
}

export function useEvaluationFormState(
evaluation: EvaluationResponse | null | undefined,
projectId: string)
: UseEvaluationFormStateReturn {
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [evaluationType, setEvaluationType] = useState<EvaluationType>(EvaluationType.AUTOMATIC);
  const [evaluationScope, setEvaluationScope] = useState<EvaluationScope>(EvaluationScope.DATASET);
  const [selectedScoreIds, setSelectedScoreIds] = useState<string[]>([]);
  const [datasetId, setDatasetId] = useState<string>('');
  const [selectedExperimentIds, setSelectedExperimentIds] = useState<string[]>([]);
  const [ragasModelConfigurationId, setRagasModelConfigurationId] = useState<string>('');


  const { data: datasets = [], isLoading: loadingDatasets, error: datasetsError } = useDatasetsQuery(projectId);


  useEffect(() => {
    if (evaluation) {
      setName(evaluation.name || '');
      setDescription(evaluation.description || '');
      setEvaluationType(EvaluationType.AUTOMATIC);
      setEvaluationScope(evaluation.evaluationScope);
      setSelectedScoreIds(evaluation.scores.map((s) => s.id));
      setDatasetId(evaluation.datasetId || '');
      setSelectedExperimentIds(evaluation.experiments.map((e) => e.id));
      setRagasModelConfigurationId(evaluation.ragasModelConfigurationId || '');
    }
  }, [evaluation?.id]);

  const handleScopeReset = () => {
    if (evaluationScope === 'DATASET') {
      setSelectedExperimentIds([]);
    } else {
      setDatasetId('');
    }
  };

  return {
    name,
    description,
    evaluationType,
    evaluationScope,
    selectedScoreIds,
    datasetId,
    selectedExperimentIds,
    datasets: datasets || [],
    loadingDatasets,
    datasetsError,
    ragasModelConfigurationId,
    setName,
    setDescription,
    setEvaluationScope,
    setSelectedScoreIds,
    setDatasetId,
    setSelectedExperimentIds,
    setRagasModelConfigurationId,
    handleScopeReset
  };
}