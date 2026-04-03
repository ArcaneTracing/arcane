"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { datasourcesApi } from '@/api/datasources'
import type {
  DatasourceListItemResponse,
  CreateDatasourceRequest,
  UpdateDatasourceRequest,
} from '@/types/datasources'
import { useIsAuthenticated } from '@/hooks/useAuth'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'

export function useDatasourcesQuery() {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['datasources', organisationId],
    queryFn: () => datasourcesApi.getAll(organisationId!),
    enabled: !!organisationId && isAuthenticated && !isAuthLoading,
  })
}

export function useDatasourcesListQuery(options?: { enabled?: boolean }) {
  const { isAuthenticated, isLoading: isAuthLoading } = useIsAuthenticated()
  const organisationId = useOrganisationIdOrNull()

  return useQuery<DatasourceListItemResponse[]>({
    queryKey: ['datasources', 'list', organisationId],
    queryFn: ({ signal }) => datasourcesApi.list(organisationId!, signal),
    enabled: (options?.enabled ?? true) && !!organisationId && isAuthenticated && !isAuthLoading,
  })
}

export function useCreateDatasource(projectId: string | undefined) {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreateDatasourceRequest) => datasourcesApi.create(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources', organisationId] })
      queryClient.invalidateQueries({ queryKey: ['datasources', 'list', organisationId] })
    },
  })
}

export function useUpdateDatasource() {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateDatasourceRequest }) => 
      datasourcesApi.update(organisationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources', organisationId] })
      queryClient.invalidateQueries({ queryKey: ['datasources', 'list', organisationId] })
    },
  })
}

export function useDeleteDatasource() {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => datasourcesApi.delete(organisationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['datasources', organisationId] })
      queryClient.invalidateQueries({ queryKey: ['datasources', 'list', organisationId] })
    },
  })
}

