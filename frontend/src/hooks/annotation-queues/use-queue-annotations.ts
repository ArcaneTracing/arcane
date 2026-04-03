"use client"

import { useAnnotationTemplateQuery, useCreateAnnotation, useUpdateAnnotation, useDeleteAnnotation } from './use-annotation-queues-query'
import { CreateAnnotationRequest, UpdateAnnotationRequest } from '@/api/annotation-queues'

export function useQueueAnnotations(
  projectId: string | undefined,
  queueId: string | undefined
) {
  const { data: template = null, isLoading: isTemplateLoading, error: templateError, refetch: fetchTemplate } = useAnnotationTemplateQuery(projectId, queueId)
  const createMutation = useCreateAnnotation(projectId, queueId)
  const updateMutation = useUpdateAnnotation(projectId, queueId)
  const deleteMutation = useDeleteAnnotation(projectId, queueId)

  return {
    template,
    isTemplateLoading,
    templateError: templateError?.message || null,
    fetchTemplate: async () => {
      await fetchTemplate()
    },
    isCreateLoading: createMutation.isPending,
    createError: createMutation.error?.message || null,
    createAnnotation: async (data: CreateAnnotationRequest) => {
      return await createMutation.mutateAsync(data)
    },
    isUpdateLoading: updateMutation.isPending,
    updateError: updateMutation.error?.message || null,
    updateAnnotation: async (annotationId: string, data: UpdateAnnotationRequest) => {
      return await updateMutation.mutateAsync({ annotationId, data })
    },
    isDeleteLoading: deleteMutation.isPending,
    deleteError: deleteMutation.error?.message || null,
    deleteAnnotation: async (annotationId: string) => {
      await deleteMutation.mutateAsync(annotationId)
    },
  }
}

