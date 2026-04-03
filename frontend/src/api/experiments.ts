import api from './api';
import {
  ExperimentResponse,
  ExperimentResultResponse,
  CreateExperimentRequest,
  CreateExperimentResultRequest,
  PaginatedExperimentResultsResponse } from
'@/types/experiments';
import { PaginationQuery } from '@/types/pagination';

export const experimentsApi = {
  async list(organisationId: string, projectId: string, signal?: AbortSignal): Promise<ExperimentResponse[]> {
    const { data } = await api.get<ExperimentResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/experiments`, { signal });
    return Array.isArray(data) ? data : [];
  },
  async get(
  organisationId: string,
  projectId: string,
  experimentId: string,
  signal?: AbortSignal)
  : Promise<ExperimentResponse> {
    const { data } = await api.get<ExperimentResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments/${experimentId}`,
      { signal }
    );
    return data;
  },
  async create(
  organisationId: string,
  projectId: string,
  data: CreateExperimentRequest,
  signal?: AbortSignal)
  : Promise<ExperimentResponse> {
    const { data: experiment } = await api.post<ExperimentResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments`,
      data,
      { signal }
    );
    return experiment;
  },
  async delete(
  organisationId: string,
  projectId: string,
  experimentId: string,
  signal?: AbortSignal)
  : Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments/${experimentId}`,
      { signal }
    );
  },
  async listResults(
  organisationId: string,
  projectId: string,
  experimentId: string,
  paginationQuery?: PaginationQuery,
  signal?: AbortSignal)
  : Promise<PaginatedExperimentResultsResponse> {
    const { data } = await api.get<PaginatedExperimentResultsResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments/${experimentId}/results`,
      {
        params: paginationQuery,
        signal
      }
    );
    return data;
  },
  async createResult(
  organisationId: string,
  projectId: string,
  experimentId: string,
  data: CreateExperimentResultRequest,
  signal?: AbortSignal)
  : Promise<ExperimentResultResponse> {
    const { data: result } = await api.post<ExperimentResultResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments/${experimentId}/results`,
      data,
      { signal }
    );
    return result;
  },
  async rerun(
  organisationId: string,
  projectId: string,
  experimentId: string,
  signal?: AbortSignal)
  : Promise<ExperimentResponse> {
    const { data } = await api.post<ExperimentResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/experiments/${experimentId}/rerun`,
      {},
      { signal }
    );
    return data;
  }
};