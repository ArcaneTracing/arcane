import api from './api';
import {
  DatasetResponse,
  DatasetListItemResponse,
  CreateDatasetRequest,
  UpdateDatasetRequest,
  UpsertRowToDatasetRequest,
  DatasetRowResponse,
  DatasetHeaderResponse,
  PaginatedDatasetResponse } from
'@/types/datasets';
import { PaginationQuery } from '@/types/pagination';

export const datasetsApi = {
  async getAll(organisationId: string, projectId: string, signal?: AbortSignal): Promise<DatasetListItemResponse[]> {
    const { data } = await api.get<DatasetListItemResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets`, { signal });
    return Array.isArray(data) ? data : [];
  },

  async create(organisationId: string, projectId: string, data: CreateDatasetRequest): Promise<DatasetResponse> {
    const { data: dataset } = await api.post<DatasetResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets`, data);
    return dataset;
  },

  async update(organisationId: string, projectId: string, datasetId: string, data: UpdateDatasetRequest): Promise<DatasetResponse> {
    const { data: dataset } = await api.put<DatasetResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}`, data);
    return dataset;
  },

  async getById(
  organisationId: string,
  projectId: string,
  datasetId: string,
  paginationQuery?: PaginationQuery,
  signal?: AbortSignal)
  : Promise<PaginatedDatasetResponse> {
    const { data } = await api.get<PaginatedDatasetResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}`,
      {
        params: paginationQuery,
        signal
      }
    );
    return data;
  },

  async delete(organisationId: string, projectId: string, datasetId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}`);
  },

  async upsertRow(organisationId: string, projectId: string, datasetId: string, data: UpsertRowToDatasetRequest): Promise<DatasetRowResponse> {
    const { data: row } = await api.post<DatasetRowResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}/rows`, data);
    return row;
  },

  async getHeader(organisationId: string, projectId: string, datasetId: string, signal?: AbortSignal): Promise<string[]> {
    const { data } = await api.get<DatasetHeaderResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}/header`, { signal });
    return Array.isArray(data.header) ? data.header : [];
  },

  async import(organisationId: string, projectId: string, file: File, name: string, description?: string): Promise<DatasetResponse> {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('name', name);
    if (description) {
      formData.append('description', description);
    }

    const { data } = await api.post<DatasetResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      }
    });
    return data;
  },

  async export(organisationId: string, projectId: string, datasetId: string): Promise<{blob: Blob;filename: string;}> {
    const response = await api.get(`/v1/organisations/${organisationId}/projects/${projectId}/datasets/${datasetId}/export`, {
      responseType: 'blob'
    });
    let filename = 'dataset-export.csv';
    const contentDisposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
    if (contentDisposition) {

      const filenameMatch = contentDisposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (filenameMatch) {

        filename = filenameMatch[1].replaceAll(/(^["']|["']$)/g, '');
      }
    }

    return { blob: response.data, filename };
  }
};