import { useState, useEffect, useMemo } from 'react';
import { useQueries } from '@tanstack/react-query';
import { experimentsApi } from '@/api/experiments';
import { scoresApi } from '@/api/scores';
import { useExperimentScoresQuery, useDatasetResultsQuery, useExperimentResultsQuery } from '@/hooks/evaluations/use-evaluations-query';
import { useDatasetHeaderQuery } from '@/hooks/datasets/use-datasets-query';
import type { EvaluationResponse } from '@/types/evaluations';
import type { ExperimentResponse } from '@/types/experiments';
import type { ScoreResponse } from '@/types/scores';
import type { DetailedResultRow } from './evaluation-results-detailed-utils';
import { PaginationQuery } from '@/types/pagination';


type ScoreResultValue = {value: number | string | null;reasoning?: string | null;status: string;};

export function useEvaluationResultsDetailedData(
organisationId: string | null,
projectId: string,
evaluationId: string,
evaluation: EvaluationResponse,
paginationQuery?: PaginationQuery)
{
  const [selectedExperimentId, setSelectedExperimentId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  const isDatasetEvaluation = evaluation.evaluationScope === 'DATASET';
  const hasSingleExperiment =
  evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length === 1;

  useEffect(() => {
    if (hasSingleExperiment && !selectedExperimentId && evaluation.experiments.length > 0) {
      setSelectedExperimentId(evaluation.experiments[0].id);
    }
  }, [hasSingleExperiment, selectedExperimentId, evaluation.experiments]);

  const hasExperiments = evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 0;
  const experimentQueries = useQueries({
    queries: hasExperiments ?
    evaluation.experiments.map((exp) => ({
      queryKey: ['experiment', organisationId, projectId, exp.id],
      queryFn: () => experimentsApi.get(organisationId!, projectId, exp.id),
      enabled: !!organisationId && !!projectId && !!exp.id
    })) :
    []
  });

  const hasScores = evaluation.scores && evaluation.scores.length > 0;
  const scoreQueries = useQueries({
    queries: hasScores ?
    evaluation.scores.map((score) => ({
      queryKey: ['score', organisationId, projectId, score.id],
      queryFn: () => scoresApi.get(organisationId!, projectId, score.id),
      enabled: !!organisationId && !!projectId && !!score.id
    })) :
    []
  });

  const experiments = experimentQueries.
  map((q) => q.data).
  filter((exp): exp is ExperimentResponse => exp != null);
  const scores = scoreQueries.
  map((q) => q.data).
  filter((score): score is ScoreResponse => score != null);
  const loadingExperiments = experimentQueries.some((q) => q.isLoading);

  const selectedExperiment =
  experiments.find((exp) => exp.id === selectedExperimentId) ||
  evaluation.experiments.find((exp) => exp.id === selectedExperimentId);


  const { data: datasetHeader } = useDatasetHeaderQuery(
    projectId,
    selectedExperiment?.datasetId
  );

  const { isLoading: isLoadingExperimentScores } =
  useExperimentScoresQuery(projectId, evaluationId, selectedExperimentId || undefined);

  const datasetIdForQuery =
  evaluation.evaluationScope === 'DATASET' && evaluation.datasetId ? evaluation.datasetId : undefined;

  const { data: datasetForEvaluationHeader, isLoading: isLoadingDatasetForEvaluationHeader } = useDatasetHeaderQuery(
    projectId,
    datasetIdForQuery
  );


  const { data: datasetResultsData, isLoading: isLoadingDatasetResults } = useDatasetResultsQuery(
    projectId,
    isDatasetEvaluation ? evaluationId : undefined,
    paginationQuery
  );

  const experimentEvaluationId = isDatasetEvaluation ? undefined : evaluationId;
  const { data: experimentResultsData, isLoading: isLoadingEvaluationResults } = useExperimentResultsQuery(
    projectId,
    experimentEvaluationId,
    selectedExperimentId || undefined,
    paginationQuery
  );

  const datasetResults = datasetResultsData?.data || [];
  const experimentResults = experimentResultsData?.data || [];

  const isLoadingScores =
  isLoadingExperimentScores ||
  isLoadingEvaluationResults;
  const experimentCombinedRows: DetailedResultRow[] = useMemo(() => {
    if (experimentResults.length === 0 || isDatasetEvaluation) {
      return [];
    }

    return experimentResults.
    filter((er) => er.datasetRow).
    map((er) => {
      const scoreResultsMap = new Map<string, ScoreResultValue>();
      er.scoreResults.forEach((sr) => {
        scoreResultsMap.set(sr.scoreId, {
          value: sr.value,
          reasoning: sr.reasoning ?? undefined,
          status: sr.status || 'DONE'
        });
      });
      return {
        ...er.datasetRow!,
        experimentResult: er.experimentResult ?? undefined,
        scoreResults: scoreResultsMap,
        experimentResultId: er.experimentResultId ?? null
      };
    }).
    filter((row) => row.scoreResults.size > 0);
  }, [experimentResults, isDatasetEvaluation]);

  const datasetCombinedRows: DetailedResultRow[] = useMemo(() => {
    if (!isDatasetEvaluation || datasetResults.length === 0) {
      return [];
    }


    return datasetResults.
    filter((dr) => dr.datasetRow).
    map((dr) => {
      const scoreResultsMap = new Map<string, ScoreResultValue>();
      dr.scoreResults.forEach((sr) => {
        scoreResultsMap.set(sr.scoreId, {
          value: sr.value,
          reasoning: sr.reasoning ?? undefined,
          status: sr.status || 'DONE'
        });
      });
      return {
        ...dr.datasetRow!,
        experimentResult: undefined,
        scoreResults: scoreResultsMap
      };
    }).
    filter((row) => row.scoreResults.size > 0);
  }, [isDatasetEvaluation, datasetResults]);

  const combinedRows = isDatasetEvaluation ? datasetCombinedRows : experimentCombinedRows;

  const isLoadingData = isDatasetEvaluation ?
  isLoadingDatasetForEvaluationHeader || isLoadingDatasetResults :
  isLoadingScores;


  const paginationMeta = isDatasetEvaluation ?
  datasetResultsData?.pagination :
  experimentResultsData?.pagination;

  return {
    searchQuery,
    setSearchQuery,
    selectedExperimentId,
    setSelectedExperimentId,
    isDatasetEvaluation,
    hasSingleExperiment,
    hasExperiments,
    experiments,
    scores,
    loadingExperiments,
    datasetHeader,
    datasetForEvaluationHeader,
    combinedRows,
    isLoadingData,
    isLoadingScores,
    paginationMeta
  };
}