import { ConversationsPageContainer } from "./conversations-page-container"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

export default function ConversationsPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.CONVERSATION.READ} fallback={<ForbiddenPage />}>
      <ConversationsPageContainer />
    </PagePermissionGuard>
  )
}
