"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ExperimentResponse } from "@/types/experiments"
import { FlaskConical, ArrowRight, Trash2, Play } from "lucide-react"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface ExperimentCardProps {
  experiment: ExperimentResponse
  onView: (experimentId: string) => void
  onRerun: (experiment: ExperimentResponse) => void
  onDelete: (experiment: ExperimentResponse) => void
  projectId?: string
}

export function ExperimentCard({ experiment, onView, onRerun, onDelete, projectId }: Readonly<ExperimentCardProps>) {
  const organisationId = useOrganisationId()
  const resultsCount = experiment.results?.length || 0

  return (
    <Card className="border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                <FlaskConical className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <CardTitle className="text-base font-semibold line-clamp-1 text-gray-900 dark:text-gray-100 mb-1.5">
                {experiment.name || 'Experiment'}
              </CardTitle>
              <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {experiment.description || (
                  <>
                    Prompt Version: {experiment.promptVersionId.substring(0, 8)}...
                    <br />
                    Dataset: {experiment.datasetId.substring(0, 8)}...
                    {resultsCount > 0 && (
                      <>
                        <br />
                        Results: {resultsCount}
                      </>
                    )}
                  </>
                )}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
              onClick={() => onView(experiment.id)}
            >
              Details
              <ArrowRight className="h-3 w-3" />
            </Button>
            <PermissionGuard
              permission={PERMISSIONS.EXPERIMENT.RERUN}
              organisationId={organisationId}
              projectId={projectId}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onRerun(experiment)
                }}
              >
                <span className="sr-only">Re-run</span>
                <Play className="h-4 w-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard
              permission={PERMISSIONS.EXPERIMENT.DELETE}
              organisationId={organisationId}
              projectId={projectId}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(experiment)
                }}
              >
                <span className="sr-only">Delete</span>
                <Trash2 className="h-4 w-4" />
              </Button>
            </PermissionGuard>
          </div>
        </div>
      </CardHeader>
    </Card>
  )
}

