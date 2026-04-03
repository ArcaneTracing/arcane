import api from './api';
import {
  ScoreResponse,
  CreateScoreRequest,
  UpdateScoreRequest } from
'@/types/scores';

export const scoresApi = {
  async list(organisationId: string, projectId: string, signal?: AbortSignal): Promise<ScoreResponse[]> {
    const { data } = await api.get<ScoreResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/scores`, {
      signal
    });
    return Array.isArray(data) ? data : [];
  },
  async get(
  organisationId: string,
  projectId: string,
  scoreId: string,
  signal?: AbortSignal)
  : Promise<ScoreResponse> {
    const { data } = await api.get<ScoreResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/scores/${scoreId}`,
      { signal }
    );
    return data;
  },
  async create(
  organisationId: string,
  projectId: string,
  data: CreateScoreRequest,
  signal?: AbortSignal)
  : Promise<ScoreResponse> {
    const { data: score } = await api.post<ScoreResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/scores`,
      data,
      { signal }
    );
    return score;
  },
  async update(
  organisationId: string,
  projectId: string,
  scoreId: string,
  data: UpdateScoreRequest,
  signal?: AbortSignal)
  : Promise<ScoreResponse> {
    const { data: score } = await api.put<ScoreResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/scores/${scoreId}`,
      data,
      { signal }
    );
    return score;
  },
  async delete(
  organisationId: string,
  projectId: string,
  scoreId: string,
  signal?: AbortSignal)
  : Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/scores/${scoreId}`,
      { signal }
    );
  }
};