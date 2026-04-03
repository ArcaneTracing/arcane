import api from './api'

export interface ApiKeyStatusResponse {
  exists: boolean
  createdAt?: string
}

export interface CreateApiKeyResponse {
  apiKey: string
}

export const apiKeysApi = {
  async getStatus(
    organisationId: string,
    projectId: string,
    signal?: AbortSignal
  ): Promise<ApiKeyStatusResponse> {
    const { data } = await api.get<ApiKeyStatusResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/api-keys`,
      { signal }
    )
    return data
  },

  async createOrRegenerate(
    organisationId: string,
    projectId: string
  ): Promise<CreateApiKeyResponse> {
    const { data } = await api.post<CreateApiKeyResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/api-keys`
    )
    return data
  },

  async revoke(
    organisationId: string,
    projectId: string
  ): Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/api-keys`
    )
  },
}
