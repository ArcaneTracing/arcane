
import { EvaluationType, EvaluationScope, ScoreResultStatus } from './enums';

export interface EvaluationScoreRefResponse {
  id: string;
  description: string;
  scoringType: string;
}

export interface EvaluationExperimentRefResponse {
  id: string;
  promptVersionId: string;
  datasetId: string;
}

export interface ScoreResultResponse {
  id: string;
  scoreId: string;
  value: number | string | null;
  reasoning?: string | null;
  status: ScoreResultStatus;
  datasetRowId?: string | null;
}

export interface EvaluationResultResponse {
  id: string;
  datasetRowId?: string | null;
  datasetRow?: {
    id: string;
    values: string[];
  } | null;
  experimentResultId?: string | null;
  experimentResult?: string | null;
  scoreResults: ScoreResultResponse[];
  createdAt: Date;
}

export interface EvaluationResponse {
  id: string;
  projectId: string;
  evaluationType: EvaluationType;
  evaluationScope: EvaluationScope;
  name: string;
  description?: string | null;
  datasetId?: string | null;
  metadata?: Record<string, unknown> | null;
  scoreMappings?: Record<string, Record<string, unknown>> | null;
  ragasModelConfigurationId?: string | null;
  scores: EvaluationScoreRefResponse[];
  experiments: EvaluationExperimentRefResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateEvaluationRequest {
  evaluationType: EvaluationType;
  evaluationScope: EvaluationScope;
  name: string;
  description?: string;
  scoreIds: string[];
  datasetId?: string;
  experimentIds?: string[];
  metadata?: Record<string, unknown>;
  scoreMappings?: Record<string, Record<string, unknown>>;
  ragasModelConfigurationId?: string;
}

export interface ScoreResultInputRequest {
  scoreId: string;
  value: number | string;
  reasoning?: string;
}

export interface CreateEvaluationResultRequest {
  datasetRowId?: string;
  experimentResultId?: string;
  scoreResults: ScoreResultInputRequest[];
}

export interface CompareExperimentsRequest {
  experimentIdA: string;
  experimentIdB: string;
  scoreId: string;
}

export interface ExperimentComparisonRequest {
  evaluationId: string;
  experimentIdA: string;
  experimentIdB: string;
  scoreId: string;
}

export interface ExperimentComparisonResponse {
  numeric: NumericComparisonResponse | null;
  nominal: NominalComparisonResponse | null;
  ordinal: OrdinalComparisonResponse | null;
}

export interface NumericComparisonResponse {
  n_paired: number;
  mean_a: number | null;
  mean_b: number | null;
  delta_mean: number | null;
  ci95_delta: {
    lower: number | null;
    upper: number | null;
  };
  p_value_permutation: number | null;
  cohens_dz: number | null;
  win_rate: number | null;
  loss_rate: number | null;
  tie_rate: number | null;
}

export interface NominalComparisonResponse {
  n_paired: number;
  distribution_comparison: Record<string, {
    proportion_a: number;
    proportion_b: number;
    delta_proportion: number;
    ci_delta: {lower: number;upper: number;};
  }>;
  bowker_test: {
    chi_squared: number | null;
    p_value: number | null;
    degrees_of_freedom: number | null;
  };
  cramers_v: number | null;
  entropy_difference: number | null;
  category_changes: {
    appeared_in_b: string[];
    disappeared_in_b: string[];
  } | null;
}

export interface OrdinalComparisonResponse extends NominalComparisonResponse {
  cdf_comparison: Record<string, {
    cdf_a: number;
    cdf_b: number;
    delta_cdf: number;
  }>;
  delta_pass_rate: {
    pass_rate_a: number;
    pass_rate_b: number;
    delta: number;
    ci: {
      lower: number | null;
      upper: number | null;
    };
  } | null;
  delta_tail_mass: {
    tail_mass_a: number;
    tail_mass_b: number;
    delta: number;
    ci: {
      lower: number | null;
      upper: number | null;
    };
  } | null;
  median_comparison: {
    median_a: string | null;
    median_b: string | null;
  };
  percentile_shift: {
    p50: {category_a: string | null;category_b: string | null;};
    p90: {category_a: string | null;category_b: string | null;};
  };
  wilcoxon_signed_rank: {
    w_statistic: number | null;
    p_value: number | null;
  };
  cliffs_delta: number | null;
  probability_of_superiority: number | null;
}

export interface ExperimentScoresResponse {
  experimentId: string;
  evaluationId: string;
  scoreResults: ScoreResultResponse[];
  totalCount: number;
}

export interface EvaluationStatisticsResponse {
  experimentId: string;
  scoreId: string;
  numeric: NumericEvaluationStatisticsResponse | null;
  nominal: NominalStatisticsResponse | null;
  ordinal: OrdinalStatisticsResponse | null;
}

export interface DatasetStatisticsResponse {
  datasetId: string;
  scoreId: string;
  numeric: NumericDatasetStatisticsResponse | null;
  nominal: NominalStatisticsResponse | null;
  ordinal: OrdinalStatisticsResponse | null;
}

export interface NumericEvaluationStatisticsResponse {
  mean: number | null;
  variance: number | null;
  std: number | null;
  p50: number | null;
  p10: number | null;
  p90: number | null;
  ci95_mean: {
    lower: number | null;
    upper: number | null;
  };
  n_total: number;
  n_scored: number;
}

export interface NumericDatasetStatisticsResponse {
  mean: number | null;
  variance: number | null;
  std: number | null;
  p50: number | null;
  p10: number | null;
  p90: number | null;
  ci95_mean: {
    lower: number | null;
    upper: number | null;
  };
  n_total: number;
  n_scored: number;
}

export interface NominalStatisticsResponse {
  scoreId?: string;
  n_total: number;
  n_scored: number;
  counts_by_code: Record<string, number>;
  proportions_by_code: Record<string, number>;
  ci_proportion_by_code: Record<string, {lower: number;upper: number;}>;
  mode_code: string | null;
  entropy: number | null;
  num_distinct_categories: number;
}

export interface OrdinalStatisticsResponse extends NominalStatisticsResponse {
  median_category: string | null;
  percentile_categories: {
    p10: string | null;
    p50: string | null;
    p90: string | null;
  };
  cdf: Record<string, number>;
  tail_mass_below: {
    threshold_rank: number;
    proportion: number;
    ci: {
      lower: number;
      upper: number;
    };
  } | null;
  pass_rate: {
    acceptable_set: string[];
    proportion: number;
    ci: {
      lower: number;
      upper: number;
    };
  } | null;
  iqr_rank: number | null;
}

export interface PaginatedEvaluationResultsResponse {
  data: EvaluationResultResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}