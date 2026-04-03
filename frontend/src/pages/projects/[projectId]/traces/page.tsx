import { TracesPageContainer } from "./container"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

export default function TracesPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.TRACE.READ} fallback={<ForbiddenPage />}>
      <TracesPageContainer />
    </PagePermissionGuard>
  )
}
