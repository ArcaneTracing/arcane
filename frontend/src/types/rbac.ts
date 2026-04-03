
export interface RoleResponse {
  id: string;
  organisationId: string | null;
  projectId: string | null;
  name: string;
  description?: string;
  permissions: string[];
  isSystemRole: boolean;
  isInstanceLevel: boolean;
  canDelete: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateRoleRequest {
  name: string;
  description?: string;
  permissions: string[];
}

export interface UpdateRoleRequest {
  name?: string;
  description?: string;
  permissions?: string[];
}

export interface AssignRoleRequest {
  userId?: string;
  email?: string;
  roleId: string;
}

export interface RoleMessageResponse {
  message: string;
}

export interface PermissionsResponse {
  instance: string[];
  organisation: string[];
  project: string[];
  all: string[];
}

export interface InstanceOwnersResponse {
  userIds: string[];
}

export interface InstanceOwnerMessageResponse {
  message: string;
}