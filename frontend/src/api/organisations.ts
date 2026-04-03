import api from './api';
import {
  OrganisationResponse,
  CreateOrganisationRequest,
  UpdateOrganisationRequest,
  AddUserToOrganisationRequest,
  RemoveUserFromOrganisationRequest,
  OrganisationMessageResponse } from
'@/types/organisations';
import { RoleResponse, AssignRoleRequest, CreateRoleRequest, UpdateRoleRequest } from '@/types/rbac';
import { PaginatedAuditLogsResponse } from './audit-logs';

export interface OrganisationUser {
  id: string;
  email: string;
  name: string;
  role: RoleResponse;
}

export interface InviteUserToOrganisationRequest {
  email: string;
  roleId?: string;
}

export const organisationsApi = {
  async getAll(signal?: AbortSignal): Promise<OrganisationResponse[]> {
    const { data } = await api.get<OrganisationResponse[]>('/v1/organisations', { signal });
    return Array.isArray(data) ? data : [];
  },
  async getById(organisationId: string, signal?: AbortSignal): Promise<OrganisationResponse> {
    const { data } = await api.get<OrganisationResponse>(`/v1/organisations/${organisationId}`, { signal });
    return data;
  },
  async create(data: CreateOrganisationRequest, signal?: AbortSignal): Promise<OrganisationResponse> {
    const { data: organisation } = await api.post<OrganisationResponse>('/v1/organisations', data, { signal });
    return organisation;
  },
  async update(
  organisationId: string,
  data: UpdateOrganisationRequest,
  signal?: AbortSignal)
  : Promise<OrganisationResponse> {
    const { data: organisation } = await api.put<OrganisationResponse>(
      `/v1/organisations/${organisationId}`,
      data,
      { signal }
    );
    return organisation;
  },
  async delete(organisationId: string, signal?: AbortSignal): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}`, { signal });
  },
  async addUser(
  organisationId: string,
  data: AddUserToOrganisationRequest,
  signal?: AbortSignal)
  : Promise<OrganisationMessageResponse> {
    const { data: result } = await api.post<OrganisationMessageResponse>(`/v1/organisations/${organisationId}/users`, data, { signal });
    return result;
  },
  async removeUser(
  organisationId: string,
  data: RemoveUserFromOrganisationRequest,
  signal?: AbortSignal)
  : Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/users`, { data, signal });
  },
  async assignRole(
  organisationId: string,
  userId: string,
  data: AssignRoleRequest,
  signal?: AbortSignal)
  : Promise<OrganisationMessageResponse> {
    const { data: result } = await api.put<OrganisationMessageResponse>(
      `/v1/organisations/${organisationId}/users/${userId}/role`,
      data,
      { signal }
    );
    return result;
  },
  async getUserRole(
  organisationId: string,
  userId: string,
  signal?: AbortSignal)
  : Promise<RoleResponse> {
    const { data } = await api.get<RoleResponse>(
      `/v1/organisations/${organisationId}/users/${userId}/role`,
      { signal }
    );
    return data;
  },
  async getUsers(organisationId: string, signal?: AbortSignal): Promise<OrganisationUser[]> {
    const { data } = await api.get<OrganisationUser[]>(`/v1/organisations/${organisationId}/users`, { signal });
    return Array.isArray(data) ? data : [];
  },
  async inviteUser(
  organisationId: string,
  data: InviteUserToOrganisationRequest,
  signal?: AbortSignal)
  : Promise<OrganisationMessageResponse> {
    const { data: result } = await api.post<OrganisationMessageResponse>(
      `/v1/organisations/${organisationId}/users`,
      data,
      { signal }
    );
    return result;
  },
  async changeUserRole(
  organisationId: string,
  userId: string,
  roleId: string,
  signal?: AbortSignal)
  : Promise<OrganisationMessageResponse> {
    const { data: result } = await api.put<OrganisationMessageResponse>(
      `/v1/organisations/${organisationId}/users/${userId}/role`,
      { roleId },
      { signal }
    );
    return result;
  },
  async getRoles(organisationId: string, signal?: AbortSignal): Promise<RoleResponse[]> {
    const { data } = await api.get<RoleResponse[]>(`/v1/organisations/${organisationId}/roles`, { signal });
    return Array.isArray(data) ? data : [];
  },
  async createRole(
  organisationId: string,
  data: CreateRoleRequest,
  signal?: AbortSignal)
  : Promise<RoleResponse> {
    const { data: role } = await api.post<RoleResponse>(
      `/v1/organisations/${organisationId}/roles`,
      data,
      { signal }
    );
    return role;
  },
  async updateRole(
  organisationId: string,
  roleId: string,
  data: UpdateRoleRequest,
  signal?: AbortSignal)
  : Promise<RoleResponse> {
    const { data: role } = await api.put<RoleResponse>(
      `/v1/organisations/${organisationId}/roles/${roleId}`,
      data,
      { signal }
    );
    return role;
  },
  async deleteRole(organisationId: string, roleId: string, signal?: AbortSignal): Promise<void> {
    await api.delete(`/v1/organisations/${organisationId}/roles/${roleId}`, { signal });
  },
  async getRoleById(
  organisationId: string,
  roleId: string,
  signal?: AbortSignal)
  : Promise<RoleResponse> {
    const { data } = await api.get<RoleResponse>(
      `/v1/organisations/${organisationId}/roles/${roleId}`,
      { signal }
    );
    return data;
  },
  async getAuditLogs(
  organisationId: string,
  params?: {
    action?: string;
    cursor?: string;
    limit?: number;
  },
  signal?: AbortSignal)
  : Promise<PaginatedAuditLogsResponse> {
    const queryParams: Record<string, string> = {};
    if (params?.action) {
      queryParams.action = params.action;
    }
    if (params?.cursor) {
      queryParams.cursor = params.cursor;
    }
    if (params?.limit) {
      queryParams.limit = String(params.limit);
    } else {
      queryParams.limit = '50';
    }

    const { data } = await api.get<PaginatedAuditLogsResponse>(`/v1/organisations/${organisationId}/audit-logs`, {
      params: queryParams,
      signal
    });
    return data;
  }
};