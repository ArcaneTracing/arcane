import api from './api';
import { OrganisationResponse } from '@/types/organisations';

export interface CreateOrganisationRequest {
  name: string;
}

export interface InstanceOwner {
  id: string;
  email: string;
  name: string;
}

export interface InstanceOwnersResponse {
  users: InstanceOwner[];
}

export interface SearchUser {
  id: string;
  email: string;
  name: string;
}

export interface SearchUsersResponse {
  users: SearchUser[];
}
export const adminApi = {
  async getAllOrganisations(signal?: AbortSignal): Promise<OrganisationResponse[]> {
    const { data } = await api.get<OrganisationResponse[]>('/v1/admin/organisations', { signal });
    return Array.isArray(data) ? data : [];
  },
  async createOrganisation(
  data: CreateOrganisationRequest,
  signal?: AbortSignal)
  : Promise<OrganisationResponse> {
    const { data: organisation } = await api.post<OrganisationResponse>('/v1/admin/organisations', data, { signal });
    return organisation;
  },
  async deleteOrganisation(organisationId: string, signal?: AbortSignal): Promise<void> {
    await api.delete(`/v1/admin/organisations/${organisationId}`, { signal });
  },
  async getInstanceOwners(signal?: AbortSignal): Promise<InstanceOwnersResponse> {
    const { data } = await api.get<InstanceOwnersResponse>('/v1/users/instance-owners', { signal });
    return data;
  },
  async addInstanceOwner(userId: string, signal?: AbortSignal): Promise<{message: string;}> {
    const { data } = await api.put<{message: string;}>(`/v1/users/${userId}/instance-role/owner`, {}, { signal });
    return data;
  },
  async removeInstanceOwner(userId: string, signal?: AbortSignal): Promise<void> {
    await api.delete(`/v1/users/${userId}/instance-role/owner`, { signal });
  },
  async searchUsersByEmail(
  email: string,
  signal?: AbortSignal)
  : Promise<SearchUsersResponse> {
    const { data } = await api.get<SearchUsersResponse>('/v1/admin/users/search', {
      params: { email },
      signal
    });
    return data;
  },
  async getAllUsers(signal?: AbortSignal): Promise<SearchUser[]> {
    const { data } = await api.get<SearchUser[]>('/v1/admin/users', { signal });
    return Array.isArray(data) ? data : [];
  },
  async deleteUser(userId: string, signal?: AbortSignal): Promise<void> {
    await api.delete(`/v1/admin/users/${userId}`, { signal });
  }
};