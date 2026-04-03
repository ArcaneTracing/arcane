import api from './api';
import {
  ProjectResponse,
  CreateProjectRequest,
  UpdateProjectRequest,
  InviteUserRequest,
  DeleteUserRequest,
  ProjectUserWithRolesResponse,
  ProjectMessageResponse,
  AvailableUser } from
'@/types/projects';
import { RoleResponse, CreateRoleRequest, UpdateRoleRequest, AssignRoleRequest } from '@/types/rbac';

export const projectsApi = {
  async getAll(organisationId: string, signal?: AbortSignal): Promise<ProjectResponse[]> {
    const { data } = await api.get<ProjectResponse[]>(`/v1/organisations/${organisationId}/projects`, { signal });
    return Array.isArray(data) ? data : [];
  },

  async create(organisationId: string, data: CreateProjectRequest): Promise<ProjectResponse> {
    const { data: project } = await api.post<ProjectResponse>(`/v1/organisations/${organisationId}/projects`, data);
    return project;
  },

  async update(organisationId: string, projectId: string, data: UpdateProjectRequest): Promise<ProjectResponse> {
    const { data: project } = await api.put<ProjectResponse>(`/v1/organisations/${organisationId}/projects/${projectId}`, data);
    return project;
  },

  async delete(organisationId: string, projectId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}`);
  },

  async getById(organisationId: string, projectId: string, signal?: AbortSignal): Promise<ProjectResponse> {
    const { data } = await api.get<ProjectResponse>(`/v1/organisations/${organisationId}/projects/${projectId}`, { signal });
    return data;
  },

  async getAvailableUsers(organisationId: string, projectId: string, signal?: AbortSignal): Promise<AvailableUser[]> {
    const { data } = await api.get<AvailableUser[]>(`/v1/organisations/${organisationId}/projects/${projectId}/members/available`, { signal });
    return Array.isArray(data) ? data : [];
  },

  async inviteUser(organisationId: string, projectId: string, data: InviteUserRequest): Promise<ProjectMessageResponse> {
    const { data: result } = await api.post<ProjectMessageResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/members`, data);
    return result;
  },

  async removeUser(organisationId: string, projectId: string, data: DeleteUserRequest): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/members`, { data });
  },

  async getUsersWithRoles(organisationId: string, projectId: string, signal?: AbortSignal): Promise<ProjectUserWithRolesResponse[]> {
    const { data } = await api.get<ProjectUserWithRolesResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/members`, { signal });
    return Array.isArray(data) ? data : [];
  },


  async getRoles(organisationId: string, projectId: string, signal?: AbortSignal): Promise<RoleResponse[]> {
    const { data } = await api.get<RoleResponse[]>(`/v1/organisations/${organisationId}/projects/${projectId}/roles`, { signal });
    return Array.isArray(data) ? data : [];
  },

  async createRole(organisationId: string, projectId: string, data: CreateRoleRequest): Promise<RoleResponse> {
    const { data: role } = await api.post<RoleResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/roles`, data);
    return role;
  },

  async updateRole(organisationId: string, projectId: string, roleId: string, data: UpdateRoleRequest): Promise<RoleResponse> {
    const { data: role } = await api.put<RoleResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/roles/${roleId}`, data);
    return role;
  },

  async deleteRole(organisationId: string, projectId: string, roleId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/roles/${roleId}`);
  },

  async getRoleById(organisationId: string, projectId: string, roleId: string, signal?: AbortSignal): Promise<RoleResponse> {
    const { data } = await api.get<RoleResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/roles/${roleId}`, { signal });
    return data;
  },

  async assignProjectRole(organisationId: string, projectId: string, userId: string, data: AssignRoleRequest): Promise<ProjectMessageResponse> {
    const { data: result } = await api.put<ProjectMessageResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/members/${userId}/role`, data);
    return result;
  },

  async getUserProjectRole(organisationId: string, projectId: string, userId: string, signal?: AbortSignal): Promise<RoleResponse> {
    const { data } = await api.get<RoleResponse>(`/v1/organisations/${organisationId}/projects/${projectId}/members/${userId}/role`, { signal });
    return data;
  },

  async removeProjectRole(organisationId: string, projectId: string, userId: string): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/projects/${projectId}/members/${userId}/role`);
  }
};