import api from './api'
import {
  ModelConfigurationResponse,
  CreateModelConfigurationRequest,
  UpdateModelConfigurationRequest,
} from '@/types/model-configuration'

export const modelConfigurationsApi = {
  async getAll(organisationId: string, signal?: AbortSignal): Promise<ModelConfigurationResponse[]> {
    const { data } = await api.get<ModelConfigurationResponse[]>(`/v1/organisations/${organisationId}/model-configurations`, { signal })
    return Array.isArray(data) ? data : []
  },

  async getById(organisationId: string, id: string, signal?: AbortSignal): Promise<ModelConfigurationResponse> {
    const { data } = await api.get<ModelConfigurationResponse>(`/v1/organisations/${organisationId}/model-configurations/${id}`, { signal })
    return data
  },

  async create(organisationId: string, data: CreateModelConfigurationRequest): Promise<ModelConfigurationResponse> {
    const { data: config } = await api.post<ModelConfigurationResponse>(`/v1/organisations/${organisationId}/model-configurations`, data)
    return config
  },

  async update(organisationId: string, id: string, data: UpdateModelConfigurationRequest): Promise<ModelConfigurationResponse> {
    const { data: config } = await api.put<ModelConfigurationResponse>(`/v1/organisations/${organisationId}/model-configurations/${id}`, data)
    return config
  },

  async delete(organisationId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/model-configurations/${id}`)
  },
}

