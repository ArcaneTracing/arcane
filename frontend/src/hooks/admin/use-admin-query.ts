"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi, CreateOrganisationRequest } from '@/api/admin';
import {
  getOrganisationAuditLogs,
  getInstanceOwnerAuditLogs,
  GetOrganisationAuditLogsParams,
  GetInstanceOwnerAuditLogsParams } from
'@/api/audit-logs';
import { useSetOrganisations, useSetCurrentOrganisation, useCurrentOrganisation } from '@/store/organisationStore';
export function useAdminOrganisations() {
  return useQuery({
    queryKey: ['admin', 'organisations'],
    queryFn: () => adminApi.getAllOrganisations()
  });
}
export function useCreateAdminOrganisation() {
  const queryClient = useQueryClient();
  const setOrganisations = useSetOrganisations();
  const setCurrentOrganisation = useSetCurrentOrganisation();
  const currentOrganisation = useCurrentOrganisation();

  return useMutation({
    mutationFn: (data: CreateOrganisationRequest) => adminApi.createOrganisation(data),
    onSuccess: async (newOrg) => {

      queryClient.invalidateQueries({ queryKey: ['admin', 'organisations'] });
      queryClient.invalidateQueries({ queryKey: ['organisations'] });
      const updatedOrgs = await adminApi.getAllOrganisations();
      setOrganisations(updatedOrgs);


      if (!currentOrganisation && updatedOrgs.length > 0) {
        setCurrentOrganisation(updatedOrgs[0]);
      }
    }
  });
}
export function useDeleteAdminOrganisation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (organisationId: string) => adminApi.deleteOrganisation(organisationId),
    onSuccess: (_, organisationId) => {

      queryClient.invalidateQueries({ queryKey: ['admin', 'organisations'] });
      queryClient.invalidateQueries({ queryKey: ['organisations'] });


      queryClient.removeQueries({
        predicate: (query) => {
          const queryKey = query.queryKey;
          if (!Array.isArray(queryKey)) return false;


          return queryKey.some((key) => {
            if (typeof key === 'string') {
              return key === organisationId;
            }
            if (typeof key === 'object' && key !== null) {

              if ('organisationId' in key && key.organisationId === organisationId) {
                return true;
              }

              return JSON.stringify(key).includes(organisationId);
            }
            return false;
          });
        }
      });


      queryClient.removeQueries({ queryKey: ['projects', organisationId] });
      queryClient.removeQueries({ queryKey: ['datasources', organisationId] });
      queryClient.removeQueries({ queryKey: ['entities', organisationId] });
      queryClient.removeQueries({ queryKey: ['model-configurations', organisationId] });
      queryClient.removeQueries({ queryKey: ['conversation-configurations', organisationId] });
      queryClient.removeQueries({ queryKey: ['permissions'] });
      queryClient.removeQueries({ queryKey: ['audit-logs', 'organisations'] });
    }
  });
}
export function useInstanceOwners() {
  return useQuery({
    queryKey: ['admin', 'instance-owners'],
    queryFn: () => adminApi.getInstanceOwners()
  });
}
export function useAddInstanceOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.addInstanceOwner(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'instance-owners'] });
    }
  });
}
export function useRemoveInstanceOwner() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.removeInstanceOwner(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'instance-owners'] });
    }
  });
}
export function useOrganisationAuditLogs(params?: GetOrganisationAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', 'organisations', params],
    queryFn: async () => {
      const response = await getOrganisationAuditLogs(params);
      return response;
    },
    select: (data) => ({
      data: data?.data || [],
      nextCursor: data?.nextCursor || null,
      hasMore: data?.hasMore || false,
      limit: data?.limit || 50
    })
  });
}
export function useInstanceOwnerAuditLogs(params?: GetInstanceOwnerAuditLogsParams) {
  return useQuery({
    queryKey: ['audit-logs', 'instance-owners', params],
    queryFn: async () => {
      const response = await getInstanceOwnerAuditLogs(params);
      return response;
    },
    select: (data) => ({
      data: data?.data || [],
      nextCursor: data?.nextCursor || null,
      hasMore: data?.hasMore || false,
      limit: data?.limit || 50
    })
  });
}
export function useSearchUsersByEmail(email: string, enabled: boolean = true) {
  return useQuery({
    queryKey: ['admin', 'users', 'search', email],
    queryFn: () => adminApi.searchUsersByEmail(email),
    enabled: enabled && email.trim().length >= 2,
    staleTime: 30000
  });
}
export function useAllUsers() {
  return useQuery({
    queryKey: ['admin', 'users'],
    queryFn: () => adminApi.getAllUsers()
  });
}
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (userId: string) => adminApi.deleteUser(userId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'instance-owners'] });
    }
  });
}