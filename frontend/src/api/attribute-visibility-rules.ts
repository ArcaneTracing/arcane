import api from './api'
import type {
  AttributeVisibilityRuleResponse,
  CreateAttributeVisibilityRuleRequest,
  AddRolesToVisibilityRuleRequest,
  RemoveRolesFromVisibilityRuleRequest,
} from '@/types/attribute-visibility'

export const attributeVisibilityRulesApi = {
  async getAll(
    organisationId: string,
    projectId: string,
    signal?: AbortSignal
  ): Promise<AttributeVisibilityRuleResponse[]> {
    const { data } = await api.get<AttributeVisibilityRuleResponse[]>(
      `/v1/organisations/${organisationId}/projects/${projectId}/attribute-visibility-rules`,
      { signal }
    )
    return Array.isArray(data) ? data : []
  },

  async create(
    organisationId: string,
    projectId: string,
    body: CreateAttributeVisibilityRuleRequest
  ): Promise<AttributeVisibilityRuleResponse> {
    const { data } = await api.post<AttributeVisibilityRuleResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/attribute-visibility-rules`,
      body
    )
    return data
  },

  async addRoles(
    organisationId: string,
    projectId: string,
    ruleId: string,
    body: AddRolesToVisibilityRuleRequest
  ): Promise<AttributeVisibilityRuleResponse> {
    const { data } = await api.post<AttributeVisibilityRuleResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/attribute-visibility-rules/${ruleId}/roles`,
      body
    )
    return data
  },

  async removeRoles(
    organisationId: string,
    projectId: string,
    ruleId: string,
    body: RemoveRolesFromVisibilityRuleRequest
  ): Promise<AttributeVisibilityRuleResponse> {
    const { data } = await api.post<AttributeVisibilityRuleResponse>(
      `/v1/organisations/${organisationId}/projects/${projectId}/attribute-visibility-rules/${ruleId}/roles/remove`,
      body
    )
    return data
  },

  async delete(
    organisationId: string,
    projectId: string,
    ruleId: string
  ): Promise<void> {
    await api.delete(
      `/v1/organisations/${organisationId}/projects/${projectId}/attribute-visibility-rules/${ruleId}`
    )
  },
}
