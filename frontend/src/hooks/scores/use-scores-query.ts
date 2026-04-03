"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { scoresApi } from '@/api/scores'
import { CreateScoreRequest, UpdateScoreRequest } from '@/types/scores'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'

export function useScoresQuery(projectId: string | undefined) {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['scores', organisationId, projectId],
    queryFn: () => scoresApi.list(organisationId!, projectId!),
    enabled: !!organisationId && !!projectId && isAuthenticated && !isAuthLoading,
  })
}

export function useScoreQuery(projectId: string | undefined, scoreId: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['score', organisationId, projectId, scoreId],
    queryFn: () => scoresApi.get(organisationId!, projectId!, scoreId!),
    enabled: !!organisationId && !!projectId && !!scoreId,
  })
}

export function useCreateScore(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreateScoreRequest) => scoresApi.create(organisationId!, projectId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', organisationId, projectId] })
    },
  })
}

export function useUpdateScore(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateScoreRequest }) => 
      scoresApi.update(organisationId!, projectId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', organisationId, projectId] })
    },
  })
}

export function useDeleteScore(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => scoresApi.delete(organisationId!, projectId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['scores', organisationId, projectId] })
    },
  })
}

