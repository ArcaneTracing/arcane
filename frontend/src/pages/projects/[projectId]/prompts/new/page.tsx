import { useParams, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { PromptForm } from "@/components/prompts/forms/prompt-form"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

function NewPromptPageContent() {
  const { projectId, organisationId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/prompts/new", strict: false })
  const navigate = useNavigate()

  return (
    <div className="p-10">
      <div className="mb-6">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate({ to: "/organisations/$organisationId/projects/$projectId/prompts", params: { organisationId, projectId } })}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Prompts
        </Button>
        <div className="flex items-center gap-4 mb-6">
          <div className="inline-flex shrink-0">
            <img src="/images/icons/new_project_icon.png" alt="New Prompt" className="h-24 w-24" />
          </div>
          <div className="text-left">
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5 dark:text-white">
              Create New Prompt
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Create a new prompt with an initial version.
            </p>
          </div>
        </div>
      </div>

      <div className="w-full">
        <PromptForm projectId={projectId} />
      </div>
    </div>
  )
}

export default function NewPromptPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROMPT.CREATE} fallback={<ForbiddenPage />}>
      <NewPromptPageContent />
    </PagePermissionGuard>
  )
}

