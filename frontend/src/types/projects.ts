
import { RoleResponse } from './rbac';

export interface ProjectResponse {
  id: string;
  name: string;
  description?: string;
  traceFilterAttributeName?: string;
  traceFilterAttributeValue?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  traceFilterAttributeName?: string;
  traceFilterAttributeValue?: string;
  userIds?: string[];
}

export interface UpdateProjectRequest {
  name?: string;
  description?: string;
  traceFilterAttributeName?: string;
  traceFilterAttributeValue?: string;
  userIds?: string[];
}

export interface InviteUserRequest {
  email: string;
  roleId?: string;
}

export interface DeleteUserRequest {
  email: string;
  roleId?: string;
}

export interface ProjectUserWithRolesResponse {
  id: string;
  email: string;
  name: string;
  roles: RoleResponse[];
}

export interface ProjectMessageResponse {
  message: string;
}

export interface AvailableUser {
  id?: string;
  email: string;
  name: string;
}