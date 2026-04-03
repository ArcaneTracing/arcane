"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { experimentsApi } from '@/api/experiments'
import { CreateExperimentRequest } from '@/types/experiments'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'
import { PaginationQuery } from '@/types/pagination'

export function useExperimentsQuery(projectId: string | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['experiments', organisationId, projectId],
    queryFn: () => experimentsApi.list(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId && isAuthenticated && !isAuthLoading,
  })
}

export function useCreateExperiment(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreateExperimentRequest) => experimentsApi.create(organisationId!, projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', organisationId, projectId] })
    },
  })
}

export function useDeleteExperiment(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => experimentsApi.delete(organisationId!, projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', organisationId, projectId] })
    },
  })
}

export function useExperimentQuery(projectId: string | undefined, experimentId: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['experiment', organisationId, projectId, experimentId],
    queryFn: () => experimentsApi.get(organisationId!, projectId!, experimentId!),
    enabled: !!organisationId && !!projectId && !!experimentId,
  })
}

export function useRerunExperiment(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (experimentId: string) => experimentsApi.rerun(organisationId!, projectId!, experimentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['experiments', organisationId, projectId] })
    },
  })
}

export function useExperimentResultsQuery(
  projectId: string | undefined,
  experimentId: string | undefined,
  paginationQuery?: PaginationQuery
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['experimentResults', organisationId, projectId, experimentId, paginationQuery],
    queryFn: () => experimentsApi.listResults(organisationId!, projectId!, experimentId!, paginationQuery),
    enabled: !!organisationId && !!projectId && !!experimentId,
  })
}

