import { useEffect } from "react"
import { useNavigate, useParams } from "@tanstack/react-router"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

function ProjectPageContent() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId" })
  const navigate = useNavigate()

  useEffect(() => {
    if (!organisationId) return
    navigate({ to: "/organisations/$organisationId/projects/$projectId/traces", params: { organisationId, projectId } })
  }, [organisationId, projectId, navigate])

  return null
}

export default function ProjectPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROJECT.READ} fallback={<ForbiddenPage />}>
      <ProjectPageContent />
    </PagePermissionGuard>
  )
} 