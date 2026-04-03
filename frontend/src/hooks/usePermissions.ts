import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import {
  getPermissions,
  getCachedPermissions,
  cachePermissions,
  GetPermissionsParams } from
'@/api/permissions';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
  isSuperAdmin } from
'@/lib/permissions';
import { authClient } from '@/lib/better-auth';

export interface UsePermissionsOptions extends GetPermissionsParams {
  enabled?: boolean;
  staleTime?: number;
  gcTime?: number;
}

export function usePermissions(options?: UsePermissionsOptions) {
  const { organisationId, projectId, enabled = true, staleTime = 5 * 60 * 1000, gcTime } = options || {};
  const { data: session, isPending: sessionPending } = authClient.useSession();


  const cachedPermissions = useMemo(() => {
    if (!enabled) return null;
    return getCachedPermissions(organisationId, projectId);
  }, [enabled, organisationId, projectId]);

  const query = useQuery({
    queryKey: ['permissions', { organisationId, projectId }],
    queryFn: async ({ signal }) => {
      const permissions = await getPermissions(
        { organisationId, projectId },
        signal
      );

      cachePermissions(permissions, organisationId, projectId);
      return permissions;
    },
    // Wait for session to load and user to be authenticated before fetching permissions
    enabled: enabled && !sessionPending && !!session?.user,
    staleTime,
    gcTime,
    initialData: cachedPermissions || undefined,
    retry: false,
    refetchOnMount: 'always'
  });


  const checkPermission = useMemo(
    () => (permission: string) =>
    hasPermission(query.data, permission),
    [query.data]
  );

  const checkAnyPermission = useMemo(
    () => (permissions: string[]) =>
    hasAnyPermission(query.data, permissions),
    [query.data]
  );

  const checkAllPermissions = useMemo(
    () => (permissions: string[]) =>
    hasAllPermissions(query.data, permissions),
    [query.data]
  );

  const checkIsSuperAdmin = useMemo(
    () => () => isSuperAdmin(query.data),
    [query.data]
  );

  return {
    permissions: query.data,
    isLoading: query.isLoading || sessionPending,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,

    hasPermission: checkPermission,
    hasAnyPermission: checkAnyPermission,
    hasAllPermissions: checkAllPermissions,
    isSuperAdmin: checkIsSuperAdmin
  };
}

export function useHasPermission(
permission: string,
options?: UsePermissionsOptions)
: boolean {
  const { hasPermission } = usePermissions(options);
  return hasPermission(permission);
}

export function useIsSuperAdmin(options?: Omit<UsePermissionsOptions, 'organisationId' | 'projectId'>): boolean {
  const { isSuperAdmin } = usePermissions(options);
  return isSuperAdmin();
}