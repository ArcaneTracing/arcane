export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface Prompt {
  id: string;
  name: string;
  description: string | null;
  metadata: Record<string, unknown> | null;
  promotedVersionId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PromptVersion {
  id: string;
  promptId: string;
  promptName: string;
  versionName: string | null;
  description: string | null;
  modelConfigurationId: string;
  template: unknown;
  templateType: string;
  templateFormat: string;
  invocationParameters: unknown;
  tools: unknown | null;
  responseFormat: unknown | null;
  createdAt: string;
  updatedAt: string;
}

export interface Entity {
  id: string;
  name: string;
  description?: string;
  type: string;
  matchingAttributeName: string;
  matchingPatternType: string;
  matchingPattern?: string | null;
  matchingValue?: string | null;
  entityType: string;
  entityHighlights?: Array<{ title: string; key: string; valueType: string }>;
  messageMatching?: Record<string, unknown> | null;
  iconId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DatasourceListItem {
  id: string;
  name: string;
  description: string;
  type: string;
  source: string;
  isSearchByQueryEnabled: boolean;
  isSearchByAttributesEnabled: boolean;
  isGetAttributeNamesEnabled: boolean;
  isGetAttributeValuesEnabled: boolean;
}

export interface TraceSearchResponse {
  traces: Array<{
    traceID: string;
    rootServiceName?: string;
    rootTraceName?: string;
    startTimeUnixNano?: string;
    durationMs?: number;
    spanSet?: { spans?: unknown[]; matched?: number };
  }>;
}

export interface TraceResponse {
  batches: unknown[];
}

export interface DatasetListItem {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DatasetRow {
  id: string;
  values: string[];
}

export interface Dataset {
  id: string;
  name: string;
  description?: string;
  header: string[];
  rows: DatasetRow[];
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedDataset {
  id: string;
  name: string;
  description?: string;
  header: string[];
  data: DatasetRow[];
  pagination: PaginationMeta;
}

export interface Evaluation {
  id: string;
  projectId: string;
  evaluationType: string;
  evaluationScope: string;
  name: string;
  description?: string | null;
  datasetId?: string | null;
  metadata?: Record<string, unknown> | null;
  scoreMappings?: Record<string, Record<string, unknown>> | null;
  ragasModelConfigurationId?: string | null;
  scores: Array<{ id: string; description: string; scoringType: string }>;
  experiments: Array<{ id: string; promptVersionId: string; datasetId: string }>;
  createdAt: string;
  updatedAt: string;
}

export interface EvaluationResult {
  id: string;
  datasetRowId?: string | null;
  datasetRow?: DatasetRow | null;
  experimentResultId?: string | null;
  scoreResults: Array<{
    id: string;
    scoreId: string;
    value: number | null;
    reasoning?: string | null;
    status: string;
    datasetRowId?: string | null;
  }>;
  createdAt: string;
}

export interface ExperimentScores {
  experimentId: string;
  evaluationId: string;
  scoreResults: Array<{
    id: string;
    scoreId: string;
    value: number | null;
    reasoning?: string | null;
    status: string;
    datasetRowId?: string | null;
  }>;
  totalCount: number;
}

export interface Experiment {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  promptVersionId: string;
  datasetId: string;
  promptInputMappings: Record<string, string>;
  createdAt: string;
  updatedAt: string;
  results?: ExperimentResult[];
}

export interface ExperimentResult {
  id: string;
  datasetRowId: string;
  result: string | null;
  status: string;
  createdAt: string;
}

export interface CombinedExperimentResult {
  datasetRow: DatasetRow;
  experimentResult: string | null;
  experimentResultId: string;
  createdAt: string;
}

export interface PaginatedExperimentResults {
  data: CombinedExperimentResult[];
  pagination: PaginationMeta;
}

export interface SearchTracesParams {
  minDuration?: number;
  maxDuration?: number;
  start?: string;
  end?: string;
  limit?: number;
  q?: string;
  serviceName?: string;
  operationName?: string;
  attributes?: string;
  filterByAttributeExists?: string[];
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface CreateEvaluationParams {
  evaluationType: 'AUTOMATIC' | 'MANUAL';
  evaluationScope: 'DATASET' | 'EXPERIMENT';
  name: string;
  description?: string;
  scoreIds: string[];
  datasetId?: string;
  experimentIds?: string[];
  metadata?: Record<string, unknown>;
  scoreMappings?: Record<string, Record<string, unknown>>;
  ragasModelConfigurationId?: string;
}

export interface CreateEvaluationResultParams {
  datasetRowId?: string;
  experimentResultId?: string;
  scoreResults: Array<{ scoreId: string; value: number; reasoning?: string }>;
}

export interface CreateExperimentParams {
  name: string;
  description?: string | null;
  promptVersionId: string;
  datasetId: string;
  promptInputMappings?: Record<string, string>;
}

export interface CreateExperimentResultParams {
  datasetRowId: string;
  result: string;
}

export interface AddDatasetRowParams {
  values: string[];
}

export interface PendingScoreResult {
  id: string;
  scoreId: string;
  value: number | null;
  reasoning?: string | null;
  status: string;
  datasetRowId?: string | null;
  experimentResultId?: string | null;
}

export interface PaginatedPendingScoreResults {
  data: PendingScoreResult[];
  pagination: PaginationMeta;
}

export interface ListPendingScoreResultsOptions {
  experimentId?: string;
  page?: number;
  limit?: number;
}

export interface ImportScoreResultRow {
  datasetRowId?: string;
  experimentResultId?: string;
  value: number;
  reasoning?: string;
}

export interface ImportScoreResultsResponse {
  importedCount: number;
}
