import { useMemo } from "react";
import { EvaluationScope } from "@/types/enums";
import { ExperimentResponse } from "@/types/experiments";
import { useDatasetHeaderQuery } from "@/hooks/datasets/use-datasets-query";

export interface UseEvaluationFormDatasetsReturn {
  datasetHeaders: string[];
  loadingHeaders: boolean;
  experimentDatasetError: string;
  datasetsError?: unknown;
}

export function useEvaluationFormDatasets(
projectId: string,
evaluationScope: EvaluationScope,
datasetId: string,
selectedExperimentIds: string[],
experiments: ExperimentResponse[])
: UseEvaluationFormDatasetsReturn {

  const firstExperiment = useMemo(() =>
  experiments.find((e) => selectedExperimentIds.includes(e.id)),
  [experiments, selectedExperimentIds]
  );

  const targetDatasetId = (() => {
    if (evaluationScope === 'DATASET') return datasetId;
    if (evaluationScope === 'EXPERIMENT') return firstExperiment?.datasetId;
    return undefined;
  })();


  const { data: datasetHeadersData = [], isLoading: isLoadingHeaders, error: datasetsError } = useDatasetHeaderQuery(
    projectId,
    targetDatasetId
  );


  const datasetHeaders = useMemo(() => {
    if (evaluationScope === 'DATASET') {
      return datasetHeadersData;
    } else if (evaluationScope === 'EXPERIMENT' && datasetHeadersData.length > 0) {
      return [...datasetHeadersData, 'experiment_result'];
    }
    return [];
  }, [datasetHeadersData, evaluationScope]);


  const experimentDatasetError = useMemo(() => {
    if (evaluationScope === 'EXPERIMENT' && selectedExperimentIds.length > 0) {
      const selectedExperiments = experiments.filter((e) => selectedExperimentIds.includes(e.id));
      if (selectedExperiments.length > 0) {
        const firstDatasetId = selectedExperiments[0].datasetId;
        const allSameDataset = selectedExperiments.every((e) => e.datasetId === firstDatasetId);

        if (!allSameDataset) {
          return 'All selected experiments must use the same dataset';
        }
      }
    }
    return '';
  }, [evaluationScope, selectedExperimentIds, experiments]);

  return {
    datasetHeaders,
    loadingHeaders: isLoadingHeaders,
    experimentDatasetError,
    datasetsError
  };
}