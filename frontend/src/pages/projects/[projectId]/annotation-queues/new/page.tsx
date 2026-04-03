import { AnnotationQueueForm } from "@/components/annotation-queues/form/annotation-queue-form"
import { useParams } from "@tanstack/react-router"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

function NewAnnotationQueuePageContent() {
  const { projectId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/annotation-queues/new", strict: false })

  return <AnnotationQueueForm projectId={projectId} />
}

export default function NewAnnotationQueuePage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.ANNOTATION_QUEUE.CREATE} fallback={<ForbiddenPage />}>
      <NewAnnotationQueuePageContent />
    </PagePermissionGuard>
  )
}

