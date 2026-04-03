import api from './api';
import {
  PromptResponse,
  PromptVersionResponse,
  CreatePromptRequestBody,
  UpdatePromptRequest,
  RunPromptRequest,
  RunPromptResponse } from
'@/types/prompts';

export const promptsApi = {
  async list(organisationId: string, projectId: string, signal?: AbortSignal): Promise<PromptResponse[]> {
    const { data } = await api.get<{data: PromptResponse[];} | PromptResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/prompts`, { signal });

    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },
  async listVersions(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  signal?: AbortSignal)
  : Promise<PromptVersionResponse[]> {
    const { data } = await api.get<{data: PromptVersionResponse[];} | PromptVersionResponse[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}/versions`,
      { signal }
    );

    if (Array.isArray(data)) {
      return data;
    }
    if (data && typeof data === 'object' && 'data' in data && Array.isArray(data.data)) {
      return data.data;
    }
    return [];
  },
  async getLatestVersion(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  signal?: AbortSignal)
  : Promise<PromptVersionResponse> {
    const { data } = await api.get<{data: PromptVersionResponse;} | PromptVersionResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}/latest`,
      { signal }
    );

    if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
      return data.data;
    }
    return data as PromptVersionResponse;
  },
  async create(
  organisationId: string,
  projectId: string,
  data: CreatePromptRequestBody,
  signal?: AbortSignal)
  : Promise<PromptVersionResponse> {
    const { data: result } = await api.post<PromptVersionResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts`,
      data,
      { signal }
    );
    return result;
  },
  async getVersionById(
  organisationId: string,
  projectId: string,
  promptVersionId: string,
  signal?: AbortSignal)
  : Promise<PromptVersionResponse> {
    const { data } = await api.get<{data: PromptVersionResponse;} | PromptVersionResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompt_versions/${promptVersionId}`,
      { signal }
    );
    if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
      return data.data;
    }
    return data as PromptVersionResponse;
  },
  async update(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  data: UpdatePromptRequest,
  signal?: AbortSignal)
  : Promise<PromptResponse> {
    const { data: result } = await api.patch<PromptResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}`,
      data,
      { signal }
    );
    return result;
  },
  async getById(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  signal?: AbortSignal)
  : Promise<PromptResponse> {
    const { data } = await api.get<{data: PromptResponse;} | PromptResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}`,
      { signal }
    );
    if (data && typeof data === 'object' && 'data' in data && !Array.isArray(data)) {
      return data.data;
    }
    return data as PromptResponse;
  },
  async promoteVersion(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  versionId: string,
  signal?: AbortSignal)
  : Promise<void> {
    await api.post(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}/versions/${versionId}/promote`,
      {},
      { signal }
    );
  },
  async delete(
  organisationId: string,
  projectId: string,
  promptIdentifier: string,
  signal?: AbortSignal)
  : Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/${encodeURIComponent(promptIdentifier)}`,
      { signal }
    );
  },
  async run(
  organisationId: string,
  projectId: string,
  data: RunPromptRequest,
  signal?: AbortSignal)
  : Promise<RunPromptResponse> {
    const { data: result } = await api.post<RunPromptResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/prompts/run`,
      data,
      { signal }
    );
    return result;
  }

};