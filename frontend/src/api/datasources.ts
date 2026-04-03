import api from './api'
import {
  DatasourceResponse,
  DatasourceListItemResponse,
  CreateDatasourceRequest,
  UpdateDatasourceRequest,
} from '@/types/datasources'

export const datasourcesApi = {
  async getAll(organisationId: string, signal?: AbortSignal): Promise<DatasourceResponse[]> {
    const { data } = await api.get<DatasourceResponse[]>(`/v1/organisations/${organisationId}/datasources`, { signal })
    return Array.isArray(data) ? data : []
  },

  async list(
    organisationId: string,
    signal?: AbortSignal
  ): Promise<DatasourceListItemResponse[]> {
    const { data } = await api.get<DatasourceListItemResponse[]>(
      `/v1/organisations/${organisationId}/datasources/list`,
      { signal }
    )
    return Array.isArray(data) ? data : []
  },

  async create(organisationId: string, data: CreateDatasourceRequest): Promise<DatasourceResponse> {
    const { data: datasource } = await api.post<DatasourceResponse>(
      `/v1/organisations/${organisationId}/datasources`,
      data
    )
    return datasource
  },

  async getById(organisationId: string, id: string, signal?: AbortSignal): Promise<DatasourceResponse> {
    const { data } = await api.get<DatasourceResponse>(
      `/v1/organisations/${organisationId}/datasources/${id}`,
      { signal }
    )
    return data
  },

  async update(organisationId: string, id: string, data: UpdateDatasourceRequest): Promise<DatasourceResponse> {
    const { data: datasource } = await api.put<DatasourceResponse>(
      `/v1/organisations/${organisationId}/datasources/${id}`,
      data
    )
    return datasource
  },

  async delete(organisationId: string, id: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/datasources/${id}`)
  },
}

