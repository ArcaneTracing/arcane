import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { retentionApi, UpdateProjectRetentionRequest } from '@/api/retention'
import { showSuccessToast } from '@/lib/toast'
import { useActionError } from '@/hooks/shared/use-action-error'

export function useProjectRetention(organisationId: string, projectId: string) {
  const queryClient = useQueryClient()
  const actionError = useActionError({ showToast: true, showInline: false })

  const query = useQuery({
    queryKey: ['project-retention', organisationId, projectId],
    queryFn: ({ signal }) => retentionApi.getProjectRetention(organisationId, projectId, signal),
  })

  const mutation = useMutation({
    mutationFn: (data: UpdateProjectRetentionRequest) =>
      retentionApi.updateProjectRetention(organisationId, projectId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['project-retention', organisationId, projectId] })
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
