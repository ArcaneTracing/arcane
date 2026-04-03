import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { retentionApi, UpdateOrganisationRetentionRequest } from '@/api/retention'
import { showSuccessToast } from '@/lib/toast'
import { useActionError } from '@/hooks/shared/use-action-error'

export function useOrganisationRetention(organisationId: string) {
  const queryClient = useQueryClient()
  const actionError = useActionError({ showToast: true, showInline: false })

  const query = useQuery({
    queryKey: ['organisation-retention', organisationId],
    queryFn: ({ signal }) => retentionApi.getOrganisationRetention(organisationId, signal),
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateOrganisationRetentionRequest) =>
      retentionApi.updateOrganisationRetention(organisationId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organisation-retention', organisationId] })
      showSuccessToast('Retention settings updated successfully')
    },
    onError: (error) => {
      actionError.handleError(error)
    },
  })

  return {
    data: query.data,
    isLoading: query.isLoading,
    error: query.error,
    updateRetention: mutation.mutate,
    updateRetentionAsync: mutation.mutateAsync,
    isUpdating: mutation.isPending,
  }
}
