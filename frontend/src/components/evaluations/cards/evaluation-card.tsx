"use client"

import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EvaluationResponse } from "@/types/evaluations"
import { ClipboardCheck, ArrowRight, Trash2, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { PermissionGuard } from "@/components/PermissionGuard"
import { PERMISSIONS } from "@/lib/permissions"
import { useOrganisationId } from "@/hooks/useOrganisation"

interface EvaluationCardProps {
  evaluation: EvaluationResponse
  onView: (evaluationId: string) => void
  onRerun: (evaluation: EvaluationResponse) => void
  onDelete: (evaluation: EvaluationResponse) => void
  projectId?: string
}

export function EvaluationCard({ evaluation, onView, onRerun, onDelete, projectId }: Readonly<EvaluationCardProps>) {
  const organisationId = useOrganisationId()
  const getScopeInfo = () => {
    if (evaluation.evaluationScope === 'DATASET') {
      return `Dataset: ${evaluation.datasetId ? 'Selected' : 'None'}`
    } else {
      return `${evaluation.experiments.length} experiment${evaluation.experiments.length === 1 ? '' : 's'}`
    }
  }

  return (
    <Card className="border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="flex-shrink-0 mt-1">
              <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-[#1A1A1A] flex items-center justify-center">
                <ClipboardCheck className="h-5 w-5 text-gray-600 dark:text-gray-400" />
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1.5">
                <CardTitle className="text-base font-semibold line-clamp-1 text-gray-900 dark:text-gray-100">
                  {evaluation.name}
                </CardTitle>
                <Badge variant="outline" className="text-xs">
                  {evaluation.evaluationType}
                </Badge>
                <Badge variant="outline" className="text-xs">
                  {evaluation.evaluationScope}
                </Badge>
              </div>
              <CardDescription className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                {evaluation.description || getScopeInfo()}
              </CardDescription>
              <div className="mt-1.5 text-xs text-gray-500 dark:text-gray-400">
                {evaluation.scores.length} score{evaluation.scores.length === 1 ? '' : 's'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-shrink-0">
            <PermissionGuard
              permission={PERMISSIONS.EVALUATION.RESULTS_READ}
              organisationId={organisationId}
              projectId={projectId}
            >
              <Button
                variant="ghost"
                size="sm"
                className="text-xs gap-1.5 text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-gray-100"
                onClick={() => onView(evaluation.id)}
              >
                Details
                <ArrowRight className="h-3 w-3" />
              </Button>
            </PermissionGuard>
            <PermissionGuard
              permission={PERMISSIONS.EVALUATION.RERUN}
              organisationId={organisationId}
              projectId={projectId}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onRerun(evaluation)
                }}
                title="Re-run evaluation"
              >
                <span className="sr-only">Re-run</span>
                <Play className="h-4 w-4" />
              </Button>
            </PermissionGuard>
            <PermissionGuard
              permission={PERMISSIONS.EVALUATION.DELETE}
              organisationId={organisationId}
              projectId={projectId}
            >
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-gray-500 hover:text-red-600 dark:text-gray-400 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/50"
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(evaluation)
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

