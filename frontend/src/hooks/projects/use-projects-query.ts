"use client";

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { projectsApi } from '@/api/projects';
import { attributeVisibilityRulesApi } from '@/api/attribute-visibility-rules';
import { CreateProjectRequest, UpdateProjectRequest, InviteUserRequest } from '@/types/projects';
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation';
import { CreateRoleRequest, UpdateRoleRequest, AssignRoleRequest } from '@/types/rbac';
import type {
  CreateAttributeVisibilityRuleRequest,
  AddRolesToVisibilityRuleRequest,
  RemoveRolesFromVisibilityRuleRequest } from
'@/types/attribute-visibility';
import { authClient } from '@/lib/better-auth';
import { getProjectAuditLogs } from '@/api/audit-logs';

export function useProjectsQuery() {
  const organisationId = useOrganisationIdOrNull();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  return useQuery({
    queryKey: ['projects', organisationId],
    queryFn: () => projectsApi.getAll(organisationId!),
    // Wait for session to load and user to be authenticated before fetching projects
    enabled: !!organisationId && !sessionPending && !!session?.user
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.create(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ id, data }: {id: string;data: UpdateProjectRequest;}) =>
    projectsApi.update(organisationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: (id: string) => projectsApi.delete(organisationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useProjectQuery(projectId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();
  const { data: session, isPending: sessionPending } = authClient.useSession();

  return useQuery({
    queryKey: ['project', organisationId, projectId],
    queryFn: () => projectsApi.getById(organisationId!, projectId!),

    enabled: !!organisationId && !!projectId && !sessionPending && !!session?.user,
    retry: (failureCount, error: any) => {

      const status = error?.response?.status;
      if (status === 404 || status === 401 || status === 403) {
        return false;
      }

      return failureCount < 1;
    }
  });
}

export function useAvailableUsers(projectId: string) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['availableUsers', organisationId, projectId],
    queryFn: () => projectsApi.getAvailableUsers(organisationId!, projectId),
    enabled: !!organisationId && !!projectId
  });
}

export function useInviteUser() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, data }: {projectId: string;data: InviteUserRequest;}) =>
    projectsApi.inviteUser(organisationId!, projectId, data).then(() => undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
      queryClient.invalidateQueries({ queryKey: ['availableUsers', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['usersWithRoles', organisationId, variables.projectId] });
    }
  });
}

export function useRemoveUser() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, data }: {projectId: string;data: {email: string;roleId?: string;};}) =>
    projectsApi.removeUser(organisationId!, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
      queryClient.invalidateQueries({ queryKey: ['availableUsers', organisationId] });
    }
  });
}


export function useProjectRoles(projectId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['projectRoles', organisationId, projectId],
    queryFn: () => projectsApi.getRoles(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId
  });
}

export function useCreateProjectRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, data }: {projectId: string;data: CreateRoleRequest;}) =>
    projectsApi.createRole(organisationId!, projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectRoles', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useUpdateProjectRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, roleId, data }: {projectId: string;roleId: string;data: UpdateRoleRequest;}) =>
    projectsApi.updateRole(organisationId!, projectId, roleId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectRoles', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useDeleteProjectRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, roleId }: {projectId: string;roleId: string;}) =>
    projectsApi.deleteRole(organisationId!, projectId, roleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectRoles', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
    }
  });
}

export function useAssignRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, userId, data }: {projectId: string;userId: string;data: AssignRoleRequest;}) =>
    projectsApi.assignProjectRole(organisationId!, projectId, userId, data).then(() => undefined),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectRoles', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
      queryClient.invalidateQueries({ queryKey: ['usersWithRoles', organisationId, variables.projectId] });
    }
  });
}

export function useRemoveRole() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({ projectId, userId }: {projectId: string;userId: string;}) =>
    projectsApi.removeProjectRole(organisationId!, projectId, userId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['projectRoles', organisationId, variables.projectId] });
      queryClient.invalidateQueries({ queryKey: ['projects', organisationId] });
      queryClient.invalidateQueries({ queryKey: ['usersWithRoles', organisationId, variables.projectId] });
    }
  });
}

export function useUsersWithRoles(projectId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['usersWithRoles', organisationId, projectId],
    queryFn: () => projectsApi.getUsersWithRoles(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId
  });
}


export function useAttributeVisibilityRules(projectId: string | undefined) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['attributeVisibilityRules', organisationId, projectId],
    queryFn: () =>
    attributeVisibilityRulesApi.getAll(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId
  });
}

export function useCreateAttributeVisibilityRule() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({
      projectId,
      data
    }: {projectId: string;data: CreateAttributeVisibilityRuleRequest;}) =>
    attributeVisibilityRulesApi.create(organisationId!, projectId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attributeVisibilityRules', organisationId, variables.projectId]
      });
    }
  });
}

export function useAddRolesToVisibilityRule() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({
      projectId,
      ruleId,
      data
    }: {projectId: string;ruleId: string;data: AddRolesToVisibilityRuleRequest;}) =>
    attributeVisibilityRulesApi.addRoles(
      organisationId!,
      projectId,
      ruleId,
      data
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attributeVisibilityRules', organisationId, variables.projectId]
      });
    }
  });
}

export function useRemoveRolesFromVisibilityRule() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({
      projectId,
      ruleId,
      data
    }: {projectId: string;ruleId: string;data: RemoveRolesFromVisibilityRuleRequest;}) =>
    attributeVisibilityRulesApi.removeRoles(
      organisationId!,
      projectId,
      ruleId,
      data
    ),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attributeVisibilityRules', organisationId, variables.projectId]
      });
    }
  });
}

export function useDeleteAttributeVisibilityRule() {
  const queryClient = useQueryClient();
  const organisationId = useOrganisationIdOrNull();

  return useMutation({
    mutationFn: ({
      projectId,
      ruleId
    }: {projectId: string;ruleId: string;}) =>
    attributeVisibilityRulesApi.delete(organisationId!, projectId, ruleId),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: ['attributeVisibilityRules', organisationId, variables.projectId]
      });
    }
  });
}
export function useProjectAuditLogs(params: {
  projectId: string;
  action?: string;
  cursor?: string;
  limit?: number;
}) {
  const organisationId = useOrganisationIdOrNull();

  return useQuery({
    queryKey: ['project-audit-logs', organisationId, params.projectId, params.action, params.cursor],
    queryFn: () => getProjectAuditLogs({
      organisationId: organisationId!,
      projectId: params.projectId,
      action: params.action,
      cursor: params.cursor,
      limit: params.limit
    }),
    enabled: !!organisationId && !!params.projectId
  });
}