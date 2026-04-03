import api from './api';
import {
  EvaluationResponse,
  CreateEvaluationRequest,
  EvaluationResultResponse,
  CreateEvaluationResultRequest,
  EvaluationStatisticsResponse,
  ExperimentScoresResponse,
  CompareExperimentsRequest,
  ExperimentComparisonResponse,
  DatasetStatisticsResponse,
  PaginatedEvaluationResultsResponse } from
'@/types/evaluations';
import { PaginationQuery } from '@/types/pagination';

export const evaluationsApi = {
  async list(organisationId: string, projectId: string, signal?: AbortSignal): Promise<EvaluationResponse[]> {
    const { data } = await api.get<EvaluationResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/evaluations`, { signal });
    return Array.isArray(data) ? data : [];
  },
  async get(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  signal?: AbortSignal)
  : Promise<EvaluationResponse> {
    const { data } = await api.get<EvaluationResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}`,
      { signal }
    );
    return data;
  },
  async create(
  organisationId: string,
  projectId: string,
  data: CreateEvaluationRequest,
  signal?: AbortSignal)
  : Promise<EvaluationResponse> {
    const { data: evaluation } = await api.post<EvaluationResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations`,
      data,
      { signal }
    );
    return evaluation;
  },
  async rerun(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  signal?: AbortSignal)
  : Promise<EvaluationResponse> {
    const { data } = await api.post<EvaluationResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/rerun`,
      {},
      { signal }
    );
    return data;
  },
  async delete(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  signal?: AbortSignal)
  : Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}`,
      { signal }
    );
  },
  async createResult(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  data: CreateEvaluationResultRequest,
  signal?: AbortSignal)
  : Promise<EvaluationResultResponse> {
    const { data: result } = await api.post<EvaluationResultResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/results`,
      data,
      { signal }
    );
    return result;
  },

  async listResultsForExperiments(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  experimentId: string,
  paginationQuery?: PaginationQuery,
  signal?: AbortSignal)
  : Promise<PaginatedEvaluationResultsResponse> {
    const { data } = await api.get<PaginatedEvaluationResultsResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/experiments/${experimentId}/results`,
      {
        params: paginationQuery,
        signal
      }
    );
    return data;
  },
  async listResultsForDataset(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  paginationQuery?: PaginationQuery,
  signal?: AbortSignal)
  : Promise<PaginatedEvaluationResultsResponse> {
    const { data } = await api.get<PaginatedEvaluationResultsResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/datasets/results`,
      {
        params: paginationQuery,
        signal
      }
    );
    return data;
  },
  async getStatisticsForExperiments(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  signal?: AbortSignal)
  : Promise<EvaluationStatisticsResponse[]> {
    const { data } = await api.get<EvaluationStatisticsResponse[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/experiments/statistics`,
      { signal }
    );
    return Array.isArray(data) ? data : [];
  },
  async getStatisticsForDataset(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  signal?: AbortSignal)
  : Promise<DatasetStatisticsResponse[]> {
    const { data } = await api.get<DatasetStatisticsResponse[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/datasets/statistics`,
      { signal }
    );
    return Array.isArray(data) ? data : [];
  },
  async getExperimentScores(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  experimentId: string,
  signal?: AbortSignal)
  : Promise<ExperimentScoresResponse> {
    const { data } = await api.get<ExperimentScoresResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/experiments/${experimentId}/scores`,
      { signal }
    );
    return data;
  },
  async importScoreResults(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  scoreId: string,
  data: {results: Array<{datasetRowId?: string;experimentResultId?: string;value: number;reasoning?: string;}>;},
  signal?: AbortSignal)
  : Promise<{importedCount: number;}> {
    const { data: result } = await api.post<{importedCount: number;}>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/scores/${scoreId}/import`,
      data,
      { signal }
    );
    return result;
  },
  async compareExperiments(
  organisationId: string,
  projectId: string,
  evaluationId: string,
  data: CompareExperimentsRequest,
  signal?: AbortSignal)
  : Promise<ExperimentComparisonResponse> {
    const { data: result } = await api.post<ExperimentComparisonResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/evaluations/${evaluationId}/compare-experiments`,
      data,
      { signal }
    );
    return result;
  }
};