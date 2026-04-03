import api from './api';

export interface OrganisationRetentionResponse {
  auditLogRetentionDays: number | null;
}

export interface ProjectRetentionResponse {
  evaluationRetentionDays: number | null;
  experimentRetentionDays: number | null;
}

export interface UpdateOrganisationRetentionRequest {
  auditLogRetentionDays?: number;
}

export interface UpdateProjectRetentionRequest {
  evaluationRetentionDays?: number;
  experimentRetentionDays?: number;
}

export const retentionApi = {
  async getOrganisationRetention(
  organisationId: string,
  signal?: AbortSignal)
  : Promise<OrganisationRetentionResponse> {
    const { data } = await api.get<OrganisationRetentionResponse>(
      `/v1/organisations/${organisationId}/retention`,
      { signal }
    );
    return data;
  },
  async updateOrganisationRetention(
  organisationId: string,
  data: UpdateOrganisationRetentionRequest,
  signal?: AbortSignal)
  : Promise<OrganisationRetentionResponse> {
    const { data: retention } = await api.put<OrganisationRetentionResponse>(
      `/v1/organisations/${organisationId}/retention`,
      data,
      { signal }
    );
    return retention;
  },
  async getProjectRetention(
  organisationId: string,
  projectId: string,
  signal?: AbortSignal)
  : Promise<ProjectRetentionResponse> {
    const { data } = await api.get<ProjectRetentionResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/retention`,
      { signal }
    );
    return data;
  },
  async updateProjectRetention(
  organisationId: string,
  projectId: string,
  data: UpdateProjectRetentionRequest,
  signal?: AbortSignal)
  : Promise<ProjectRetentionResponse> {
    const { data: retention } = await api.put<ProjectRetentionResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/retention`,
      data,
      { signal }
    );
    return retention;
  }
};