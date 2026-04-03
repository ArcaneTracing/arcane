import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiKeysApi, ApiKeyStatusResponse } from '@/api/api-keys'

export function useApiKeyStatus(organisationId: string, projectId: string) {
  return useQuery({
    queryKey: ['api-keys', organisationId, projectId],
    queryFn: ({ signal }) =>
      apiKeysApi.getStatus(organisationId, projectId, signal),
    enabled: !!organisationId && !!projectId,
  })
}

export function useCreateOrRegenerateApiKey(
  organisationId: string,
  projectId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () =>
      apiKeysApi.createOrRegenerate(organisationId, projectId),
    onSuccess: () => {
      queryClient.setQueryData<ApiKeyStatusResponse>(
        ['api-keys', organisationId, projectId],
        (old) => ({ ...old, exists: true, createdAt: new Date().toISOString() })
      )
    },
  })
}

export function useRevokeApiKey(
  organisationId: string,
  projectId: string
) {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: () => apiKeysApi.revoke(organisationId, projectId),
    onSuccess: () => {
      queryClient.setQueryData<ApiKeyStatusResponse>(
        ['api-keys', organisationId, projectId],
        { exists: false }
      )
    },
  })
}
