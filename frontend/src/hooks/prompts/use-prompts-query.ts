"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { promptsApi } from '@/api/prompts'
import { showSuccessToast } from '@/lib/toast'
import { CreatePromptRequestBody } from '@/types/prompts'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'

export function usePromptsQuery(projectId: string | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['prompts', organisationId, projectId],
    queryFn: () => promptsApi.list(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId && isAuthenticated && !isAuthLoading,
  })
}

export function usePromptVersionsQuery(projectId: string | undefined, promptIdentifier: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['promptVersions', organisationId, projectId, promptIdentifier],
    queryFn: () => promptsApi.listVersions(organisationId!, projectId!, promptIdentifier!),
    enabled: !!organisationId && !!projectId && !!promptIdentifier,
  })
}

export function useLatestPromptVersionQuery(projectId: string | undefined, promptIdentifier: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['latestPromptVersion', organisationId, projectId, promptIdentifier],
    queryFn: () => promptsApi.getLatestVersion(organisationId!, projectId!, promptIdentifier!),
    enabled: !!organisationId && !!projectId && !!promptIdentifier,
  })
}

export function useCreatePrompt(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreatePromptRequestBody) => promptsApi.create(organisationId!, projectId!, data),
    onSuccess: async (result) => {
      const keys = [
        ['prompts', organisationId, projectId],
        ['promptVersions', organisationId, projectId, result.promptId],
        ['latestPromptVersion', organisationId, projectId, result.promptId],
        ['prompt', organisationId, projectId, result.promptId],
      ] as const
      await Promise.all(keys.map((queryKey) => queryClient.invalidateQueries({ queryKey })))
    },
  })
}

export function useUpdatePrompt(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: { name?: string; description?: string } }) => 
      promptsApi.update(organisationId!, projectId!, id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['prompts', organisationId, projectId] })
      queryClient.invalidateQueries({ queryKey: ['promptVersions', organisationId, projectId, variables.id] })
      queryClient.invalidateQueries({ queryKey: ['latestPromptVersion', organisationId, projectId, variables.id] })
      queryClient.invalidateQueries({ queryKey: ['prompt', organisationId, projectId, variables.id] })
    },
  })
}

export function useDeletePrompt(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => promptsApi.delete(organisationId!, projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['prompts', organisationId, projectId] })
    },
  })
}

export function usePromptVersionQuery(projectId: string | undefined, promptVersionId: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['promptVersion', organisationId, projectId, promptVersionId],
    queryFn: () => promptsApi.getVersionById(organisationId!, projectId!, promptVersionId!),
    enabled: !!organisationId && !!projectId && !!promptVersionId,
  })
}

export function usePromptQuery(projectId: string | undefined, promptIdentifier: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['prompt', organisationId, projectId, promptIdentifier],
    queryFn: () => promptsApi.getById(organisationId!, projectId!, promptIdentifier!),
    enabled: !!organisationId && !!projectId && !!promptIdentifier,
  })
}

export function usePromoteVersion(projectId: string | undefined, promptIdentifier: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (versionId: string) =>
      promptsApi.promoteVersion(organisationId!, projectId!, promptIdentifier!, versionId),
    onSuccess: () => {
      showSuccessToast('Version promoted as latest')
      queryClient.invalidateQueries({ queryKey: ['prompts', organisationId, projectId] })
      queryClient.invalidateQueries({ queryKey: ['promptVersions', organisationId, projectId, promptIdentifier] })
      queryClient.invalidateQueries({ queryKey: ['latestPromptVersion', organisationId, projectId, promptIdentifier] })
      queryClient.invalidateQueries({ queryKey: ['prompt', organisationId, projectId, promptIdentifier] })
    },
  })
}

