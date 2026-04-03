"use client"

import { PromptVersionResponse } from "@/types/prompts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { ArrowUpCircle, Pencil } from "lucide-react"
import { modelConfigurationsApi } from "@/api/model-configurations"
import { useEffect, useState } from "react"
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation"
import { usePromoteVersion } from "@/hooks/prompts/use-prompts-query"

interface PromptVersionViewProps {
  promptId: string
  promptIdentifier: string
  version: PromptVersionResponse
  promotedVersionId: string | null
  onRefresh?: () => void
  onEditVersion?: () => void
  projectId: string
}

export function PromptVersionView({ promptId, promptIdentifier, version, promotedVersionId, onRefresh, onEditVersion, projectId }: Readonly<PromptVersionViewProps>) {
  const organisationId = useOrganisationIdOrNull()
  const promoteMutation = usePromoteVersion(projectId, promptIdentifier)
  const [modelConfig, setModelConfig] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (version.modelConfigurationId && organisationId) {
      setLoading(true)
      modelConfigurationsApi.getById(organisationId, version.modelConfigurationId)
        .then(config => {
          setModelConfig(config)
        })
        .catch(() => {
          setModelConfig(null)
        })
        .finally(() => {
          setLoading(false)
        })
    } else {
      setLoading(false)
    }
  }, [version.modelConfigurationId, organisationId])

  return (
    <div className="space-y-6">
      <Card className="border-gray-100 dark:border-[#2A2A2A]">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg flex items-center gap-2">
                {version.versionName !== undefined && version.versionName !== null ? `Version ${version.versionName}` : `Version ${version.id}`}
                {promotedVersionId === version.id && (
                  <Badge variant="secondary" className="text-xs">Promoted</Badge>
                )}
              </CardTitle>
              <CardDescription className="mt-1">
                {version.description || 'No description'}
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {onEditVersion && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onEditVersion}
                >
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              )}
              <Button
                variant="outline"
                size="sm"
                onClick={() => promoteMutation.mutate(version.id)}
                disabled={promoteMutation.isPending || promotedVersionId === version.id}
                title={promotedVersionId === version.id ? 'Already promoted' : 'Promote as latest'}
              >
                <ArrowUpCircle className="h-4 w-4 mr-2" />
                {promoteMutation.isPending && promoteMutation.variables === version.id ? 'Promoting...' : 'Promote'}
              </Button>
              {(() => {
                if (loading) return <Badge variant="outline">Loading...</Badge>
                if (modelConfig) return <Badge variant="outline">{modelConfig.name} ({modelConfig.configuration.modelName})</Badge>
                return <Badge variant="outline">Unknown Configuration</Badge>
              })()}
              <Badge variant="outline">{version.templateFormat}</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h3 className="text-sm font-medium mb-2">Template</h3>
            <ScrollArea className="h-[300px] w-full rounded-md border border-gray-200 dark:border-[#2A2A2A] p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(version.template, null, 2)}
              </pre>
            </ScrollArea>
          </div>

          <Separator />

          <div>
            <h3 className="text-sm font-medium mb-2">Invocation Parameters</h3>
            <ScrollArea className="h-[200px] w-full rounded-md border border-gray-200 dark:border-[#2A2A2A] p-4">
              <pre className="text-xs font-mono whitespace-pre-wrap">
                {JSON.stringify(version.invocationParameters, null, 2)}
              </pre>
            </ScrollArea>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <span className="font-medium">Created:</span> {new Date(version.createdAt).toLocaleString()}
            </div>
            <div>
              <span className="font-medium">Updated:</span> {new Date(version.updatedAt).toLocaleString()}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

