
import { ExperimentResultStatus } from './enums';

export interface ExperimentResponse {
  id: string;
  projectId: string;
  name: string;
  description?: string | null;
  promptVersionId: string;
  datasetId: string;
  promptInputMappings: Record<string, string>;
  createdAt: Date;
  updatedAt: Date;
  results?: ExperimentResultResponse[];
}

export interface ExperimentResultResponse {
  id: string;
  datasetRowId: string;
  result: string | null;
  status: ExperimentResultStatus;
  createdAt: Date;
}

export interface CreateExperimentRequest {
  name: string;
  description?: string | null;
  promptVersionId: string;
  datasetId: string;
  promptInputMappings?: Record<string, string>;
}

export interface CreateExperimentResultRequest {
  datasetRowId: string;
  result: string;
}

export interface CombinedExperimentResultResponse {
  datasetRow: {
    id: string;
    values: string[];
  };
  experimentResult: string | null;
  experimentResultId: string;
  createdAt: Date;
}

export interface PaginatedExperimentResultsResponse {
  data: CombinedExperimentResultResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}