import api from './api';
import { Permissions } from '@/lib/permissions';

export interface GetPermissionsParams {
  organisationId?: string;
  projectId?: string;
}


export async function getPermissions(
params?: GetPermissionsParams,
signal?: AbortSignal)
: Promise<Permissions> {
  const queryParams: Record<string, string> = {};

  if (params?.organisationId) {
    queryParams.organisationId = params.organisationId;
  }

  if (params?.projectId) {
    queryParams.projectId = params.projectId;
  }

  const { data } = await api.get<Permissions>('/v1/users/me/permissions', {
    params: Object.keys(queryParams).length > 0 ? queryParams : undefined,
    signal
  });
  return data;
}
export function getPermissionsCacheKey(
organisationId?: string,
projectId?: string)
: string {
  return `perms:${organisationId || 'global'}:${projectId || 'global'}`;
}
export function cachePermissions(
permissions: Permissions,
organisationId?: string,
projectId?: string)
: void {
  const cacheKey = getPermissionsCacheKey(organisationId, projectId);
  try {
    localStorage.setItem(cacheKey, JSON.stringify(permissions));

    localStorage.setItem(`${cacheKey}:timestamp`, Date.now().toString());
  } catch (error) {
    console.warn('Failed to cache permissions:', error);
  }
}
export function getCachedPermissions(
organisationId?: string,
projectId?: string)
: Permissions | null {
  const cacheKey = getPermissionsCacheKey(organisationId, projectId);
  try {
    const cached = localStorage.getItem(cacheKey);
    if (!cached) {
      return null;
    }


    const timestamp = localStorage.getItem(`${cacheKey}:timestamp`);
    if (timestamp) {
      const age = Date.now() - Number.parseInt(timestamp, 10);
      const maxAge = 15 * 60 * 1000;
      if (age > maxAge) {

        localStorage.removeItem(cacheKey);
        localStorage.removeItem(`${cacheKey}:timestamp`);
        return null;
      }
    }

    return JSON.parse(cached) as Permissions;
  } catch (error) {
    console.warn('Failed to get cached permissions:', error);
    return null;
  }
}
export function clearPermissionsCache(): void {
  try {
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('perms:')) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.warn('Failed to clear permissions cache:', error);
  }
}