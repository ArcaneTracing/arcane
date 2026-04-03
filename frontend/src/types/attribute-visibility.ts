import type { RoleResponse } from './rbac'

export interface AttributeVisibilityRuleResponse {
  id: string
  projectId: string
  attributeName: string
  hiddenRoleIds: string[]
  hiddenRoles: RoleResponse[]
  createdAt: string
  updatedAt: string
  createdById: string
  updatedById?: string | null
}

export interface CreateAttributeVisibilityRuleRequest {
  attributeName: string
  hiddenRoleIds: string[]
}

export interface AddRolesToVisibilityRuleRequest {
  roleIds: string[]
}

export interface RemoveRolesFromVisibilityRuleRequest {
  roleIds: string[]
}
