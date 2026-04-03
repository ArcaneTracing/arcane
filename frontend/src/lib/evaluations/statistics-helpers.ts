import {
  DatasetStatisticsResponse,
  EvaluationStatisticsResponse,
  NumericDatasetStatisticsResponse,
  NumericEvaluationStatisticsResponse,
  NominalStatisticsResponse,
  OrdinalStatisticsResponse,
  ExperimentComparisonResponse } from
'@/types/evaluations';


export function isNumericStatistics(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: stats is (DatasetStatisticsResponse | EvaluationStatisticsResponse) & {numeric: NonNullable<DatasetStatisticsResponse['numeric']>;} {
  return stats.numeric !== null;
}

export function isNominalStatistics(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: stats is (DatasetStatisticsResponse | EvaluationStatisticsResponse) & {nominal: NonNullable<DatasetStatisticsResponse['nominal']>;} {
  return stats.nominal !== null;
}

export function isOrdinalStatistics(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: stats is (DatasetStatisticsResponse | EvaluationStatisticsResponse) & {ordinal: NonNullable<DatasetStatisticsResponse['ordinal']>;} {
  return stats.ordinal !== null;
}


export function isNumericComparison(
comparison: ExperimentComparisonResponse)
: comparison is ExperimentComparisonResponse & {numeric: NonNullable<ExperimentComparisonResponse['numeric']>;} {
  return comparison.numeric !== null;
}

export function isNominalComparison(
comparison: ExperimentComparisonResponse)
: comparison is ExperimentComparisonResponse & {nominal: NonNullable<ExperimentComparisonResponse['nominal']>;} {
  return comparison.nominal !== null;
}

export function isOrdinalComparison(
comparison: ExperimentComparisonResponse)
: comparison is ExperimentComparisonResponse & {ordinal: NonNullable<ExperimentComparisonResponse['ordinal']>;} {
  return comparison.ordinal !== null;
}


export function getNumericStats(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: NumericDatasetStatisticsResponse | NumericEvaluationStatisticsResponse | null {
  return stats.numeric;
}


export function getNominalStats(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: NominalStatisticsResponse | null {
  return stats.nominal;
}


export function getOrdinalStats(
stats: DatasetStatisticsResponse | EvaluationStatisticsResponse)
: OrdinalStatisticsResponse | null {
  return stats.ordinal;
}


export function getComparisonNPaired(comparison: ExperimentComparisonResponse): number {
  if (comparison.numeric) return comparison.numeric.n_paired;
  if (comparison.nominal) return comparison.nominal.n_paired;
  if (comparison.ordinal) return comparison.ordinal.n_paired;
  return 0;
}