"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Eye, Pencil, Trash2, ExternalLink } from "lucide-react"
import { AnnotationResponse } from "@/types/annotation-queue"
import { DeleteAnnotationDialog } from "@/components/annotation-queues/queue-view/delete-annotation-dialog"
import { AnnotateTraceDialog } from "@/components/annotation-queues/queue-view/annotate-trace-dialog"
import { useQueueAnnotations } from "@/hooks/annotation-queues/use-queue-annotations"
import { useQueryClient } from "@tanstack/react-query"
import { useNavigate } from "@tanstack/react-router"
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"

const defaultDatasourceId = "57697495-4065-44ab-b180-a3894e6f6682"

interface AnnotatedTracesTabProps {
  projectId: string
  queueId: string
  annotations: AnnotationResponse[]
}

export function AnnotatedTracesTab({ projectId, queueId, annotations }: Readonly<AnnotatedTracesTabProps>) {
  const [annotationToDelete, setAnnotationToDelete] = useState<string | null>(null)
  const [selectedAnnotation, setSelectedAnnotation] = useState<AnnotationResponse | null>(null)
  const [isViewMode, setIsViewMode] = useState(false)
  const queryClient = useQueryClient()
  const navigate = useNavigate()
  const organisationId = useOrganisationIdOrNull()
  const fetchAnnotationQueue = () => {
    queryClient.invalidateQueries({ queryKey: ['annotationQueue', projectId, queueId] })
  }
  const { deleteAnnotation, isDeleteLoading } = useQueueAnnotations(projectId, queueId)
  const deleteActionError = useActionError({ showToast: true })

  const handleViewTrace = (annotation: AnnotationResponse, e: React.MouseEvent) => {
    e.stopPropagation()
    const otelTraceId = annotation.otelTraceId || annotation.traceId
    const datasourceId = annotation.datasourceId || defaultDatasourceId
    if (otelTraceId && datasourceId && organisationId && projectId) {
      navigate({
        to: "/organisations/$organisationId/projects/$projectId/traces/$datasourceId/$traceId",
        params: { organisationId, projectId, datasourceId, traceId: otelTraceId }
      })
    }
  }

  const handleView = (annotation: AnnotationResponse) => {
    setSelectedAnnotation(annotation)
    setIsViewMode(true)
  }

  const handleEdit = (annotation: AnnotationResponse) => {
    setSelectedAnnotation(annotation)
    setIsViewMode(false)
  }

  const handleAnnotationComplete = async () => {
    setSelectedAnnotation(null)
    setIsViewMode(false)
    fetchAnnotationQueue()
  }

  const handleDelete = async () => {
    if (annotationToDelete) {
      try {
        await deleteAnnotation(annotationToDelete)
        setAnnotationToDelete(null)
        showSuccessToast('Annotation deleted successfully')
        fetchAnnotationQueue()
      } catch (error) {
        console.error("Error deleting annotation:", error)
        deleteActionError.handleError(error)
      }
    }
  }

  if (annotations.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-100 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0D0D0D]">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No annotated traces found</p>
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Trace ID</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100">Answers</TableHead>
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {annotations.map((annotation) => (
              <TableRow 
                key={annotation.id}
                className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50"
              >
                <TableCell className="py-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                      {annotation.otelTraceId || annotation.traceId || 'N/A'}
                    </span>
                    {(annotation.otelTraceId || annotation.traceId) && (annotation.datasourceId || defaultDatasourceId) && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-gray-400 hover:text-gray-900 dark:hover:text-gray-100"
                        onClick={(e) => handleViewTrace(annotation, e)}
                        title="View trace"
                      >
                        <ExternalLink className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-xs text-gray-600 dark:text-gray-400">
                  {annotation.answers?.length || 0} answer{annotation.answers?.length === 1 ? '' : 's'}
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1 justify-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
                      onClick={() => handleView(annotation)}
                    >
                      <span className="sr-only">View</span>
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-100 hover:bg-gray-100/80 dark:hover:bg-[#1F1F1F]/80"
                      onClick={() => handleEdit(annotation)}
                    >
                      <span className="sr-only">Edit</span>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => setAnnotationToDelete(annotation.id)}
                    >
                      <span className="sr-only">Delete</span>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <DeleteAnnotationDialog
        isOpen={!!annotationToDelete}
        isLoading={isDeleteLoading}
        onClose={() => setAnnotationToDelete(null)}
        onConfirm={handleDelete}
      />

      {selectedAnnotation && (selectedAnnotation.datasourceId || defaultDatasourceId) && (selectedAnnotation.otelTraceId || selectedAnnotation.traceId) && (
        <AnnotateTraceDialog
          projectId={projectId}
          queueId={queueId}
          traceId={selectedAnnotation.otelTraceId || selectedAnnotation.traceId || ""}
          datasourceId={selectedAnnotation.datasourceId || defaultDatasourceId}
          startDate={selectedAnnotation.startDate?.toString()}
          endDate={selectedAnnotation.endDate?.toString()}
          isOpen={!!selectedAnnotation}
          onClose={() => {
            setSelectedAnnotation(null)
            setIsViewMode(false)
          }}
          onComplete={handleAnnotationComplete}
          existingAnnotation={selectedAnnotation}
          queueTraceId={selectedAnnotation.id}
          readOnly={isViewMode}
        />
      )}
    </>
  )
}

