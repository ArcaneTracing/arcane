import api from './api'
import {
  EntityResponse,
  CreateEntityRequest,
  UpdateEntityRequest,
} from '@/types/entities'

export const entitiesApi = {
  async getAll(organisationId: string, signal?: AbortSignal): Promise<EntityResponse[]> {
    const { data } = await api.get<EntityResponse[]>(`/v1/organisations/${organisationId}/entities`, { signal })
    return Array.isArray(data) ? data : []
  },

  async getById(organisationId: string, id: string, signal?: AbortSignal): Promise<EntityResponse> {
    const { data } = await api.get<EntityResponse>(`/v1/organisations/${organisationId}/entities/${id}`, { signal })
    return data
  },

  async create(organisationId: string, data: CreateEntityRequest): Promise<EntityResponse> {
    const { data: entity } = await api.post<EntityResponse>(`/v1/organisations/${organisationId}/entities`, data)
    return entity
  },

  async update(organisationId: string, id: string, data: UpdateEntityRequest): Promise<EntityResponse> {
    const { data: entity } = await api.put<EntityResponse>(`/v1/organisations/${organisationId}/entities/${id}`, data)
    return entity
  },

  async delete(organisationId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/entities/${id}`)
  },

  async export(organisationId: string): Promise<Blob> {
    const response = await api.get(`/v1/organisations/${organisationId}/entities/export`, {
      responseType: 'blob',
    })
    return response.data
  },

  async import(organisationId: string, file: File): Promise<EntityResponse[]> {
    const formData = new FormData()
    formData.append('file', file)

    const { data } = await api.post<EntityResponse[]>(`/v1/organisations/${organisationId}/entities/import`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return Array.isArray(data) ? data : []
  },
}

