import type { EvaluationResponse, EvaluationResultResponse } from '@/types/evaluations';
import type { ScoreResponse } from '@/types/scores';
import type { DatasetRowResponse } from '@/types/datasets';

export type ScoreResultValue = {
  value: number | string | null;
  reasoning?: string | null;
  status: string;
};

export interface DetailedResultRow extends DatasetRowResponse {
  experimentResult?: string;
  scoreResults: Map<string, ScoreResultValue>;

  experimentResultId?: string | null;
}

export function isManualScore(score: {evaluatorPrompt?: {id?: string;} | null;scoringType?: string;}): boolean {
  return !score.evaluatorPrompt?.id && score.scoringType !== "RAGAS";
}

export function getScoreName(
scoreId: string,
scores: ScoreResponse[],
evaluation: EvaluationResponse)
: string {
  const score = scores.find((s) => s.id === scoreId);
  if (score) return score.name;
  const evalScore = evaluation.scores.find((s) => s.id === scoreId);
  const name = evalScore && 'name' in evalScore ? evalScore.name : evalScore?.description;
  return name ?? scoreId.slice(0, 8);
}

export function formatScoreValue(value: number | string | null): string {
  if (value === null) return 'N/A';
  if (typeof value === 'number') return value.toFixed(3);
  return String(value);
}

export function buildExperimentCombinedRows(
datasetRows: DatasetRowResponse[],
experimentResults: {datasetRowId: string;result?: string;}[],
scoreResultsByRowId: Map<string, Map<string, ScoreResultValue>>)
: DetailedResultRow[] {
  return datasetRows.
  map((row) => {
    const experimentResult = experimentResults.find((r) => r.datasetRowId === row.id);
    const scoreResultsMap = scoreResultsByRowId.get(row.id) || new Map();
    return {
      ...row,
      experimentResult: experimentResult?.result,
      scoreResults: scoreResultsMap
    };
  }).
  filter((row) => row.experimentResult !== undefined || row.scoreResults.size > 0);
}

export function buildDatasetCombinedRows(
datasetRows: DatasetRowResponse[],
datasetResultsByRowId: Map<string, EvaluationResultResponse>)
: DetailedResultRow[] {
  return datasetRows.
  map((row) => {
    const datasetResult = datasetResultsByRowId.get(row.id);
    const scoreResultsMap = new Map<string, ScoreResultValue>();
    if (datasetResult) {
      datasetResult.scoreResults.forEach((sr) => {
        scoreResultsMap.set(sr.scoreId, {
          value: sr.value,
          reasoning: sr.reasoning ?? undefined,
          status: sr.status || 'DONE'
        });
      });
    }
    return {
      ...row,
      experimentResult: undefined,
      scoreResults: scoreResultsMap
    };
  }).
  filter((row) => row.scoreResults.size > 0);
}


export function buildDatasetCombinedRowsFromPaginated(
evaluationResults: EvaluationResultResponse[])
: DetailedResultRow[] {
  return [];
}


export function buildExperimentCombinedRowsFromPaginated(
evaluationResults: EvaluationResultResponse[],
scoreResultsByRowId: Map<string, Map<string, ScoreResultValue>>)
: DetailedResultRow[] {

  return [];
}

export function getDetailedDescription(
isDatasetEvaluation: boolean,
hasSingleExperiment: boolean)
: string {
  if (isDatasetEvaluation || hasSingleExperiment) {
    return 'View individual score results for each dataset row';
  }
  return 'View individual score results for each experiment. Select an experiment to view its results.';
}

export function filterDetailedRows(
rows: DetailedResultRow[],
searchQuery: string,
hasSingleExperiment: boolean)
: DetailedResultRow[] {
  if (!searchQuery) return rows;
  const searchLower = searchQuery.toLowerCase();
  return rows.filter((row) => {
    const matchesDatasetValues = row.values.some((value) =>
    value?.toLowerCase().includes(searchLower)
    );
    const matchesExperimentResult =
    !hasSingleExperiment && row.experimentResult?.toLowerCase().includes(searchLower) || false;
    return matchesDatasetValues || matchesExperimentResult;
  });
}