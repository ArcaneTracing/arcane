import api from './api'
import {
  ConversationConfigurationResponse,
  CreateConversationConfigurationRequest,
  UpdateConversationConfigurationRequest,
} from '@/types/conversation-configuration'

export const conversationApi = {
  async getAll(organisationId: string, signal?: AbortSignal): Promise<ConversationConfigurationResponse[]> {
    const { data } = await api.get<ConversationConfigurationResponse[]>(`/v1/organisations/${organisationId}/conversation-configurations`, { signal })
    return Array.isArray(data) ? data : []
  },

  async create(organisationId: string, data: CreateConversationConfigurationRequest): Promise<ConversationConfigurationResponse> {
    const { data: config } = await api.post<ConversationConfigurationResponse>(`/v1/organisations/${organisationId}/conversation-configurations`, data)
    return config
  },

  async update(organisationId: string, id: string, data: UpdateConversationConfigurationRequest): Promise<ConversationConfigurationResponse> {
    const { data: config } = await api.put<ConversationConfigurationResponse>(`/v1/organisations/${organisationId}/conversation-configurations/${id}`, data)
    return config
  },

  async delete(organisationId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/conversation-configurations/${id}`)
  },

  async export(organisationId: string): Promise<Blob> {
    const response = await api.get(`/v1/organisations/${organisationId}/conversation-configurations/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  async import(organisationId: string, file: File): Promise<ConversationConfigurationResponse[]> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<ConversationConfigurationResponse[]>(`/v1/organisations/${organisationId}/conversation-configurations/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return Array.isArray(data) ? data : []
  },
}

