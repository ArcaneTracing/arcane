
export interface DatasetResponse {
  id: string;
  name: string;
  description?: string;
  header: string[];
  rows: DatasetRowResponse[];
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetListItemResponse {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DatasetRowResponse {
  id: string;
  values: string[];
}

export interface DatasetHeaderResponse {
  header: string[];
}

export interface CreateDatasetRequest {
  name: string;
  description?: string;
  header: string[];
}

export interface UpdateDatasetRequest {
  name?: string;
  description?: string;
}

export interface UpsertRowToDatasetRequest {
  values: string[];
}

export interface DatasetMessageResponse {
  message: string;
}

export interface PaginatedDatasetResponse {
  id: string;
  name: string;
  description?: string;
  header: string[];
  data: DatasetRowResponse[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  };
}