"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Trash2 } from "lucide-react"
import { AnnotateTraceDialog } from "@/components/annotation-queues/queue-view/annotate-trace-dialog"
import { DeleteTraceDialog } from "@/components/annotation-queues/queue-view/delete-trace-dialog"
import { QueuedTraceResponse } from "@/types/annotation-queue"
import { useQueryClient } from "@tanstack/react-query"
import { useRemoveTraceById } from "@/hooks/annotation-queues/use-annotation-queues-query"
import { useActionError } from "@/hooks/shared/use-action-error"
import { showSuccessToast } from "@/lib/toast"

interface TracesToAnnotateTabProps {
  projectId: string
  queueId: string
  traces: QueuedTraceResponse[]
}

export function TracesToAnnotateTab({ projectId, queueId, traces }: Readonly<TracesToAnnotateTabProps>) {
  const [traceToAnnotate, setTraceToAnnotate] = useState<QueuedTraceResponse | null>(null)
  const [traceToDelete, setTraceToDelete] = useState<QueuedTraceResponse | null>(null)
  const queryClient = useQueryClient()
  const fetchAnnotationQueue = () => {
    queryClient.invalidateQueries({ queryKey: ['annotationQueue', projectId, queueId] })
  }
  const removeTraceMutation = useRemoveTraceById(projectId)
  const deleteActionError = useActionError({ showToast: true })

  const handleAnnotate = (trace: QueuedTraceResponse) => {
    setTraceToAnnotate(trace)
  }

  const handleAnnotateComplete = async () => {
    setTraceToAnnotate(null)
    fetchAnnotationQueue()
  }

  const handleDelete = async () => {
    if (traceToDelete) {
      try {
        await removeTraceMutation.mutateAsync({
          queueId,
          queueTraceId: traceToDelete.id,
        })
        setTraceToDelete(null)
        showSuccessToast('Trace removed from queue successfully')
        fetchAnnotationQueue()
      } catch (error) {
        console.error("Error deleting trace:", error)
        deleteActionError.handleError(error)
      }
    }
  }
  
  const isDeleting = removeTraceMutation.isPending

  if (traces.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 border border-gray-100 dark:border-[#2A2A2A] rounded-lg bg-white dark:bg-[#0D0D0D]">
        <div className="text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">No traces to be annotated</p>
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
              <TableHead className="text-xs font-medium text-gray-900 dark:text-gray-100 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {traces.map((trace) => (
              <TableRow 
                key={trace.id}
                className="border-b border-gray-100 dark:border-[#2A2A2A] hover:bg-gray-50/50 dark:hover:bg-[#1F1F1F]/50"
              >
                <TableCell className="py-3">
                  <span className="text-xs font-medium text-gray-900 dark:text-gray-100">
                    {trace.otelTraceId}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 justify-end">
                    <Button
                      variant="default"
                      size="sm"
                      onClick={() => handleAnnotate(trace)}
                    >
                      Annotate
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                      onClick={() => setTraceToDelete(trace)}
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

      {traceToAnnotate && (
        <AnnotateTraceDialog
          projectId={projectId}
          queueId={queueId}
          traceId={traceToAnnotate.otelTraceId}
          datasourceId={traceToAnnotate.datasourceId}
          startDate={traceToAnnotate.startDate?.toString()}
          endDate={traceToAnnotate.endDate?.toString()}
          queueTraceId={traceToAnnotate.id}
          isOpen={!!traceToAnnotate}
          onClose={() => setTraceToAnnotate(null)}
          onComplete={handleAnnotateComplete}
        />
      )}

      <DeleteTraceDialog
        isOpen={!!traceToDelete}
        isLoading={isDeleting}
        onClose={() => setTraceToDelete(null)}
        onConfirm={handleDelete}
      />
    </>
  )
}

