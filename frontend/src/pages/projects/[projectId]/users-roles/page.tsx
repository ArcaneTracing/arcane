import { UsersRolesPageContainer } from "./users-roles-page-container"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

export default function UsersRolesPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROJECT.MEMBERS_READ} fallback={<ForbiddenPage />}>
      <UsersRolesPageContainer />
    </PagePermissionGuard>
  )
}
