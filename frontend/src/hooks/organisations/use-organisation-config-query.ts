"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { organisationsApi, InviteUserToOrganisationRequest } from '@/api/organisations';
import { CreateRoleRequest, UpdateRoleRequest } from '@/types/rbac';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
export function useOrganisationUsers() {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['organisation-users', organisationId],
    queryFn: () => organisationsApi.getUsers(organisationId!),
    enabled: !!organisationId
  });
}
export function useInviteOrganisationUser() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: InviteUserToOrganisationRequest) =>
    organisationsApi.inviteUser(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-users', organisationId] });
    }
  });
}
export function useChangeOrganisationUserRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ userId, roleId }: {userId: string;roleId: string;}) =>
    organisationsApi.changeUserRole(organisationId!, userId, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-users', organisationId] });
    }
  });
}
export function useRemoveOrganisationUser() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (email: string) =>
    organisationsApi.removeUser(organisationId!, { email }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-users', organisationId] });
    }
  });
}
export function useOrganisationRoles() {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['organisation-roles', organisationId],
    queryFn: () => organisationsApi.getRoles(organisationId!),
    enabled: !!organisationId
  });
}
export function useCreateOrganisationRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateRoleRequest) =>
    organisationsApi.createRole(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-roles', organisationId] });
    }
  });
}
export function useUpdateOrganisationRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ roleId, data }: {roleId: string;data: UpdateRoleRequest;}) =>
    organisationsApi.updateRole(organisationId!, roleId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-roles', organisationId] });
    }
  });
}
export function useDeleteOrganisationRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (roleId: string) =>
    organisationsApi.deleteRole(organisationId!, roleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-roles', organisationId] });
    }
  });
}
export function useOrganisationAuditLogs(params?: {
  action?: string;
  cursor?: string;
  limit?: number;
}) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['organisation-audit-logs', organisationId, params],
    queryFn: async () => {
      const response = await organisationsApi.getAuditLogs(organisationId!, params);
      return response;
    },
    enabled: !!organisationId,
    select: (data) => ({
      data: data?.data || [],
      nextCursor: data?.nextCursor || null,
      hasMore: data?.hasMore || false,
      limit: data?.limit || 50
    })
  });
}