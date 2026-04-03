import { AnnotationQueueForm } from "@/components/annotation-queues/form/annotation-queue-form"
import { useParams } from "@tanstack/react-router"
import { useEffect, useState } from "react"
import { useAnnotationQueueQuery } from "@/hooks/annotation-queues/use-annotation-queues-query"
import { Loader2 } from "lucide-react"
import { AnnotationTemplateResponse } from "@/types/annotation-queue"
import { annotationQueuesApi } from "@/api/annotation-queues"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

function EditAnnotationQueuePageContent() {
  const { projectId, organisationId, queueId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/annotation-queues/edit/$queueId", strict: false })
  const { data: queue, isLoading: isFetchSingleLoading, error: queueError } = useAnnotationQueueQuery(projectId, queueId)
  const [template, setTemplate] = useState<AnnotationTemplateResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [isLoadingTemplate, setIsLoadingTemplate] = useState(false)

  useEffect(() => {
    if (organisationId && projectId && queueId && queue) {
      setIsLoadingTemplate(true)
      annotationQueuesApi.getTemplate(organisationId, projectId, queueId)
        .then(setTemplate)
        .catch((err) => {
          setError(err instanceof Error ? err.message : "Failed to load template")
        })
        .finally(() => {
          setIsLoadingTemplate(false)
        })
    }
  }, [organisationId, projectId, queueId, queue])

  const errorMessage = queueError?.message || error

  if (isFetchSingleLoading || isLoadingTemplate) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (errorMessage || !queue || !template) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Queue not found</h2>
          <p className="text-muted-foreground">
            {errorMessage || "The annotation queue you're looking for doesn't exist."}
          </p>
        </div>
      </div>
    )
  }

  return <AnnotationQueueForm projectId={projectId} queue={queue} template={template} />
}

export default function EditAnnotationQueuePage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.ANNOTATION_QUEUE.UPDATE} fallback={<ForbiddenPage />}>
      <EditAnnotationQueuePageContent />
    </PagePermissionGuard>
  )
}

