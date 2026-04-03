"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { evaluationsApi } from '@/api/evaluations'
import { CreateEvaluationRequest } from '@/types/evaluations'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'
import { PaginationQuery } from '@/types/pagination'

export function useEvaluationsQuery(projectId: string | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['evaluations', organisationId, projectId],
    queryFn: () => evaluationsApi.list(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId && isAuthenticated && !isAuthLoading,
  })
}

export function useEvaluationQuery(projectId: string | undefined, evaluationId: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['evaluation', organisationId, projectId, evaluationId],
    queryFn: () => evaluationsApi.get(organisationId!, projectId!, evaluationId!),
    enabled: !!organisationId && !!projectId && !!evaluationId,
  })
}

export function useCreateEvaluation(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreateEvaluationRequest) => evaluationsApi.create(organisationId!, projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', organisationId, projectId] })
    },
  })
}

export function useRerunEvaluation(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => evaluationsApi.rerun(organisationId!, projectId!, id),
    onSuccess: (_, evaluationId) => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', organisationId, projectId] })
      queryClient.invalidateQueries({ queryKey: ['evaluation', organisationId, projectId, evaluationId] })
    },
  })
}

export function useDeleteEvaluation(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => evaluationsApi.delete(organisationId!, projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evaluations', organisationId, projectId] })
    },
  })
}

export function useEvaluationStatisticsQuery(
  projectId: string | undefined,
  evaluationId: string | undefined
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['evaluation-statistics', organisationId, projectId, evaluationId],
    queryFn: () => evaluationsApi.getStatisticsForExperiments(organisationId!, projectId!, evaluationId!),
    enabled: !!organisationId && !!projectId && !!evaluationId,
  })
}

export function useExperimentScoresQuery(
  projectId: string | undefined,
  evaluationId: string | undefined,
  experimentId: string | undefined
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['experiment-scores', organisationId, projectId, evaluationId, experimentId],
    queryFn: () => evaluationsApi.getExperimentScores(organisationId!, projectId!, evaluationId!, experimentId!),
    enabled: !!organisationId && !!projectId && !!evaluationId && !!experimentId,
  })
}

export function useExperimentComparisonQuery(
  projectId: string | undefined,
  evaluationId: string | undefined,
  scoreId: string | undefined,
  experimentIdA: string | undefined,
  experimentIdB: string | undefined
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['experiment-comparison', organisationId, projectId, evaluationId, scoreId, experimentIdA, experimentIdB],
    queryFn: () => evaluationsApi.compareExperiments(organisationId!, projectId!, evaluationId!, {
      scoreId: scoreId!,
      experimentIdA: experimentIdA!,
      experimentIdB: experimentIdB!,
    }),
    enabled: !!organisationId && !!projectId && !!evaluationId && !!scoreId && !!experimentIdA && !!experimentIdB && experimentIdA !== experimentIdB,
  })
}

export function useDatasetStatisticsQuery(
  projectId: string | undefined,
  evaluationId: string | undefined
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['dataset-statistics', organisationId, projectId, evaluationId],
    queryFn: () => evaluationsApi.getStatisticsForDataset(organisationId!, projectId!, evaluationId!),
    enabled: !!organisationId && !!projectId && !!evaluationId,
  })
}

export function useDatasetResultsQuery(
  projectId: string | undefined,
  evaluationId: string | undefined,
  paginationQuery?: PaginationQuery
) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['dataset-results', organisationId, projectId, evaluationId, paginationQuery],
    queryFn: () => evaluationsApi.listResultsForDataset(organisationId!, projectId!, evaluationId!, paginationQuery),
    enabled: !!organisationId && !!projectId && !!evaluationId,
  })
}

export function useExperimentResultsQuery(
  projectId: string | undefined,
  evaluationId: string | undefined,
  experimentId: string | undefined,
  paginationQuery?: PaginationQuery
) {
  const organisationId = useOrganisationIdOrNull()

  return useQuery({
    queryKey: ['experiment-results', organisationId, projectId, evaluationId, experimentId, paginationQuery],
    queryFn: () =>
      evaluationsApi.listResultsForExperiments(organisationId!, projectId!, evaluationId!, experimentId!, paginationQuery),
    enabled: !!organisationId && !!projectId && !!evaluationId && !!experimentId,
  })
}

