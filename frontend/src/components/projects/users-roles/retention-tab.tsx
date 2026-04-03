"use client"

import { useState, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Loader2, Info, AlertTriangle } from 'lucide-react'
import { useProjectRetention } from '@/hooks/retention/use-project-retention'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Alert, AlertDescription } from '@/components/ui/alert'

const DEFAULT_EVALUATION_RETENTION_DAYS = 90
const DEFAULT_EXPERIMENT_RETENTION_DAYS = 90
const MIN_RETENTION_DAYS = 7
const MAX_RETENTION_DAYS = 365

export interface RetentionTabProps {
  organisationId: string
  projectId: string
}

export function RetentionTab({
  organisationId,
  projectId,
}: Readonly<RetentionTabProps>) {
  const { data, isLoading, updateRetention, isUpdating } = useProjectRetention(
    organisationId,
    projectId
  )

  const [evaluationRetentionDays, setEvaluationRetentionDays] = useState<string>('')
  const [experimentRetentionDays, setExperimentRetentionDays] = useState<string>('')

  useEffect(() => {
    if (data) {
      setEvaluationRetentionDays(
        String(data.evaluationRetentionDays ?? DEFAULT_EVALUATION_RETENTION_DAYS)
      )
      setExperimentRetentionDays(
        String(data.experimentRetentionDays ?? DEFAULT_EXPERIMENT_RETENTION_DAYS)
      )
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const evalDays = Number.parseInt(evaluationRetentionDays, 10)
    const expDays = Number.parseInt(experimentRetentionDays, 10)

    if (
      Number.isNaN(evalDays) ||
      evalDays < MIN_RETENTION_DAYS ||
      evalDays > MAX_RETENTION_DAYS
    ) {
      return
    }
    if (
      Number.isNaN(expDays) ||
      expDays < MIN_RETENTION_DAYS ||
      expDays > MAX_RETENTION_DAYS
    ) {
      return
    }

    updateRetention({
      evaluationRetentionDays: evalDays,
      experimentRetentionDays: expDays,
    })
  }

  const currentEvalValue = data?.evaluationRetentionDays ?? DEFAULT_EVALUATION_RETENTION_DAYS
  const currentExpValue = data?.experimentRetentionDays ?? DEFAULT_EXPERIMENT_RETENTION_DAYS
  const hasChanges =
    Number.parseInt(evaluationRetentionDays, 10) !== currentEvalValue ||
    Number.parseInt(experimentRetentionDays, 10) !== currentExpValue

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-lg font-semibold mb-2">Data Retention Settings</h2>
        <p className="text-sm text-muted-foreground">
          Configure how long evaluations and experiments are retained before automatic deletion.
          These settings help manage storage costs.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="evaluation-retention">Evaluation Retention (days)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Evaluations and their score results will be automatically deleted after this
                    period. Older evaluations are deleted first.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="evaluation-retention"
            type="number"
            min={MIN_RETENTION_DAYS}
            max={MAX_RETENTION_DAYS}
            value={evaluationRetentionDays}
            onChange={(e) => setEvaluationRetentionDays(e.target.value)}
            placeholder={String(DEFAULT_EVALUATION_RETENTION_DAYS)}
          />
          <p className="text-xs text-muted-foreground">
            Minimum: {MIN_RETENTION_DAYS} days, Maximum: {MAX_RETENTION_DAYS} days. Default:{' '}
            {DEFAULT_EVALUATION_RETENTION_DAYS} days.
          </p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Label htmlFor="experiment-retention">Experiment Retention (days)</Label>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-4 w-4 text-muted-foreground cursor-help" />
                </TooltipTrigger>
                <TooltipContent>
                  <p className="max-w-xs">
                    Experiments and their results will be automatically deleted after this period.
                    Older experiments are deleted first.
                  </p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
          <Input
            id="experiment-retention"
            type="number"
            min={MIN_RETENTION_DAYS}
            max={MAX_RETENTION_DAYS}
            value={experimentRetentionDays}
            onChange={(e) => setExperimentRetentionDays(e.target.value)}
            placeholder={String(DEFAULT_EXPERIMENT_RETENTION_DAYS)}
          />
          <p className="text-xs text-muted-foreground">
            Minimum: {MIN_RETENTION_DAYS} days, Maximum: {MAX_RETENTION_DAYS} days. Default:{' '}
            {DEFAULT_EXPERIMENT_RETENTION_DAYS} days.
          </p>
        </div>

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            <strong>Important:</strong> Deleting experiments will also delete all evaluations that
            reference them, regardless of the evaluation retention period.
          </AlertDescription>
        </Alert>

        {hasChanges && (
          <div className="flex items-center gap-2">
            <Button type="submit" disabled={isUpdating}>
              {isUpdating && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              Save Changes
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setEvaluationRetentionDays(
                  String(data?.evaluationRetentionDays ?? DEFAULT_EVALUATION_RETENTION_DAYS)
                )
                setExperimentRetentionDays(
                  String(data?.experimentRetentionDays ?? DEFAULT_EXPERIMENT_RETENTION_DAYS)
                )
              }}
            >
              Cancel
            </Button>
          </div>
        )}
      </form>

      <div className="border-t pt-6">
        <h3 className="text-sm font-semibold mb-2">Current Settings</h3>
        <div className="space-y-1 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Evaluations:</span>
            <span className="font-medium">{currentEvalValue} days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Experiments:</span>
            <span className="font-medium">{currentExpValue} days</span>
          </div>
        </div>
      </div>
    </div>
  )
}
