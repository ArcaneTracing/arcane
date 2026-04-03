"use client"

import { useState } from "react"
import { useParams, useNavigate } from "@tanstack/react-router"
import { Button } from "@/components/ui/button"
import { ArrowLeft, Loader2, Pencil, Plus } from "lucide-react"
import { usePromptVersionsQuery, useLatestPromptVersionQuery, usePromptQuery } from "@/hooks/prompts/use-prompts-query"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PromptVersionsList } from "@/components/prompts/versions/prompt-versions-list"
import { PromptVersionView } from "@/components/prompts/versions/prompt-version-view"
import { EditPromptInfoModal } from "@/components/prompts/dialogs/edit-prompt-info-modal"
import { useQueryClient } from "@tanstack/react-query"
import { PagePermissionGuard } from "@/components/PagePermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import ForbiddenPage from "@/pages/forbidden/page"

function PromptDetailPageContent() {
  const { projectId, organisationId, promptId } = useParams({ from: "/appLayout/organisations/$organisationId/projects/$projectId/prompts/$promptId", strict: false })
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [editInfoOpen, setEditInfoOpen] = useState(false)

  const { data: versions = [], isLoading: isLoadingVersions, error: versionsError } = usePromptVersionsQuery(projectId, promptId)
  const { data: latestVersion = null, isLoading: isLoadingLatest, error: latestError } = useLatestPromptVersionQuery(projectId, promptId)
  const { data: prompt = null, isLoading: isLoadingPrompt } = usePromptQuery(projectId, promptId)
  
  const isLoading = isLoadingVersions || isLoadingLatest || isLoadingPrompt
  const error = versionsError?.message || latestError?.message || null
  
  const refetch = () => {
    if (organisationId && projectId && promptId) {
      queryClient.invalidateQueries({ queryKey: ['promptVersions', organisationId, projectId, promptId] })
      queryClient.invalidateQueries({ queryKey: ['latestPromptVersion', organisationId, projectId, promptId] })
      queryClient.invalidateQueries({ queryKey: ['prompt', organisationId, projectId, promptId] })
      queryClient.invalidateQueries({ queryKey: ['prompts', organisationId, projectId] })
    }
  }

  const handleNewVersion = () => {
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/prompts/$promptId/edit",
      params: { organisationId, projectId, promptId },
    })
  }

  const handleEditVersion = (versionId: string) => {
    navigate({
      to: "/organisations/$organisationId/projects/$projectId/prompts/$promptId/edit",
      params: { organisationId, projectId, promptId },
      search: { versionId },
    })
  }

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight mb-1.5 flex items-center gap-2">
              {prompt?.name ?? "Prompt"}
              {prompt && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setEditInfoOpen(true)}
                  title="Edit prompt name and description"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
              )}
            </h1>
            <p className="text-sm text-muted-foreground/60">
              {prompt?.description || "View and manage prompt versions."}
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            onClick={handleNewVersion}
            disabled={!prompt}
          >
            <Plus className="h-4 w-4 mr-2" />
            New Version
          </Button>
        </div>
        {prompt && (
          <EditPromptInfoModal
            prompt={prompt}
            open={editInfoOpen}
            onOpenChange={setEditInfoOpen}
            onSuccess={refetch}
            projectId={projectId}
          />
        )}
      </div>

      {(() => {
        if (isLoading) {
          return (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="animate-spin" />
            </div>
          )
        }
        if (error) {
          return (
            <div className="text-sm text-red-500 dark:text-red-400">
              Error: {error}
            </div>
          )
        }
        return (
        <Tabs defaultValue="versions" className="w-full">
          <TabsList>
            <TabsTrigger value="versions">Versions</TabsTrigger>
            {latestVersion && (
              <TabsTrigger value="latest">Latest Version</TabsTrigger>
            )}
          </TabsList>
          <TabsContent value="versions" className="mt-6">
            <PromptVersionsList 
              promptId={promptId}
              promptIdentifier={promptId}
              versions={versions}
              promotedVersionId={prompt?.promotedVersionId ?? null}
              projectId={projectId}
              onEditVersion={handleEditVersion}
            />
          </TabsContent>
          {latestVersion && (
            <TabsContent value="latest" className="mt-6">
              <PromptVersionView 
                promptId={promptId}
                promptIdentifier={promptId}
                version={latestVersion}
                promotedVersionId={prompt?.promotedVersionId ?? null}
                onRefresh={refetch}
                projectId={projectId}
                onEditVersion={() => handleEditVersion(latestVersion.id)}
              />
            </TabsContent>
          )}
        </Tabs>
        )
      })()}
    </div>
  )
}

export default function PromptDetailPage() {
  return (
    <PagePermissionGuard permission={PERMISSIONS.PROMPT.READ} fallback={<ForbiddenPage />}>
      <PromptDetailPageContent />
    </PagePermissionGuard>
  )
}