import { TraceDetailPageContainer } from "./trace-detail-page-container"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

export default function TraceDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.TRACE.READ} fallback={<ForbiddenPage />}>
      <TraceDetailPageContainer />
    </PagePermissionGuard>
  )
}
