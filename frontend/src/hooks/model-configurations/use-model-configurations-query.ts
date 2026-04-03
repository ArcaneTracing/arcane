"use client"

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { modelConfigurationsApi } from '@/api/model-configurations'
import { CreateModelConfigurationRequest, UpdateModelConfigurationRequest } from '@/types/model-configuration'
import { useOrganisationIdOrNull } from '@/hooks/useOrganisation'

export function useModelConfigurationsQuery() {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['modelConfigurations', organisationId],
    queryFn: () => modelConfigurationsApi.getAll(organisationId!),
    enabled: !!organisationId,
  })
}

export function useModelConfigurationQuery(id: string | undefined) {
  const organisationId = useOrganisationIdOrNull()
  
  return useQuery({
    queryKey: ['modelConfiguration', organisationId, id],
    queryFn: () => modelConfigurationsApi.getById(organisationId!, id!),
    enabled: !!organisationId && !!id,
  })
}

export function useCreateModelConfiguration() {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (data: CreateModelConfigurationRequest) => modelConfigurationsApi.create(organisationId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfigurations', organisationId] })
    },
  })
}

export function useUpdateModelConfiguration() {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateModelConfigurationRequest }) => 
      modelConfigurationsApi.update(organisationId!, id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfigurations', organisationId] })
    },
  })
}

export function useDeleteModelConfiguration() {
  const queryClient = useQueryClient()
  const organisationId = useOrganisationIdOrNull()
  
  return useMutation({
    mutationFn: (id: string) => modelConfigurationsApi.delete(organisationId!, id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['modelConfigurations', organisationId] })
    },
  })
}

