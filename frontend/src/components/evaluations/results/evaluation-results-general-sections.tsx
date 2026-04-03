"use client"

import { Loader2 } from 'lucide-react'
import { Link } from '@tanstack/react-router'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { Badge } from '@/components/ui/badge'
import { EvaluationStatisticsTable } from './evaluation-statistics-table'
import { DatasetStatisticsTable } from './dataset-statistics-table'
import { SingleExperimentStatisticsTable } from './single-experiment-statistics-table'
import type {
  EvaluationResponse,
  DatasetStatisticsResponse,
  EvaluationStatisticsResponse,
} from '@/types/evaluations'
import type { ExperimentResponse } from '@/types/experiments'
import type { ScoreResponse } from '@/types/scores'

type ScoreBadgeProps = {
  score: { id: string; name?: string; description?: string }
  truncateTextFn: (text: string, maxLength?: number) => string
}

type EvaluationDetailsScoresSectionProps = {
  loadingRelated: boolean
  scores: ScoreResponse[]
  evaluation: EvaluationResponse
}

type EvaluationDetailsDatasetSectionProps = {
  loadingRelated: boolean
  dataset: { id: string; name: string } | null | undefined
  evaluation: EvaluationResponse
  organisationId: string | null
  projectId: string
}

type EvaluationDetailsExperimentsSectionProps = {
  loadingRelated: boolean
  experiments: ExperimentResponse[]
  evaluation: EvaluationResponse
  organisationId: string | null
  projectId: string
}

type EvaluationStatisticsContentProps = {
  isLoadingStatistics: boolean
  statisticsError: unknown
  statistics: DatasetStatisticsResponse[] | EvaluationStatisticsResponse[] | null | undefined
  isDatasetEvaluation: boolean
  hasSingleExperiment: boolean
  experiments: ExperimentResponse[]
  scores: ScoreResponse[]
  evaluation: EvaluationResponse
}

export function truncateText(text: string, maxLength = 30): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export function getStatisticsDescription(
  isDatasetEvaluation: boolean,
  hasSingleExperiment: boolean
): string {
  if (isDatasetEvaluation || hasSingleExperiment) {
    return 'Statistical analysis of score results'
  }
  return 'Statistical analysis of score results across experiments'
}

function ScoreBadge({ score, truncateTextFn }: Readonly<ScoreBadgeProps>) {
  const label = score.name ?? score.description ?? ''
  const truncatedName = truncateTextFn(label, 30)
  const displayName = label.length > 30 ? truncatedName : label
  return (
    <TooltipProvider key={score.id}>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className="inline-block">
            <Badge variant="outline" className="cursor-help">
              {displayName}
            </Badge>
          </span>
        </TooltipTrigger>
        {(score.name ?? score.description ?? '').length > 30 && (
          <TooltipContent>
            <p>{score.name ?? score.description}</p>
          </TooltipContent>
        )}
      </Tooltip>
    </TooltipProvider>
  )
}

export function EvaluationDetailsScoresSection({
  loadingRelated,
  scores,
  evaluation,
}: Readonly<EvaluationDetailsScoresSectionProps>) {
  if (loadingRelated && scores.length === 0) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    )
  }
  const scoresToShow = scores.length > 0 ? scores : evaluation.scores
  return (
    <div className="flex flex-wrap gap-2">
      {scoresToShow.map((score) => (
        <ScoreBadge key={score.id} score={score} truncateTextFn={truncateText} />
      ))}
    </div>
  )
}

export function EvaluationDetailsDatasetSection({
  loadingRelated,
  dataset,
  evaluation,
  organisationId,
  projectId,
}: Readonly<EvaluationDetailsDatasetSectionProps>) {
  if (loadingRelated) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    )
  }
  if (dataset) {
    const displayName = dataset.name.length > 30 ? truncateText(dataset.name, 30) : dataset.name
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Link
              to="/organisations/$organisationId/projects/$projectId/datasets/$datasetId"
              params={{ organisationId: organisationId as string, projectId, datasetId: dataset.id }}
              className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
            >
              {displayName}
            </Link>
          </TooltipTrigger>
          {dataset.name.length > 30 && (
            <TooltipContent>
              <p>{dataset.name}</p>
            </TooltipContent>
          )}
        </Tooltip>
      </TooltipProvider>
    )
  }
  return (
    <p className="text-sm text-gray-600 dark:text-gray-400 font-mono">
      {evaluation.datasetId}
    </p>
  )
}

export function EvaluationDetailsExperimentsSection({
  loadingRelated,
  experiments,
  evaluation,
  organisationId,
  projectId,
}: Readonly<EvaluationDetailsExperimentsSectionProps>) {
  if (loadingRelated) {
    return (
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm text-gray-500 dark:text-gray-400">Loading...</span>
      </div>
    )
  }
  if (experiments.length > 0) {
    return (
      <div className="flex flex-wrap gap-2">
        {experiments.map((experiment) => {
          const truncatedName = truncateText(experiment.name, 30)
          const displayName = experiment.name.length > 30 ? truncatedName : experiment.name
          return (
            <TooltipProvider key={experiment.id}>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Link
                    to="/organisations/$organisationId/projects/$projectId/experiments/$experimentId"
                    params={{ organisationId: organisationId as string, projectId, experimentId: experiment.id }}
                    className="text-sm font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 hover:underline"
                  >
                    {displayName}
                  </Link>
                </TooltipTrigger>
                {experiment.name.length > 30 && (
                  <TooltipContent>
                    <p>{experiment.name}</p>
                  </TooltipContent>
                )}
              </Tooltip>
            </TooltipProvider>
          )
        })}
      </div>
    )
  }
  return (
    <div className="flex flex-wrap gap-2">
      {evaluation.experiments.map((experiment) => (
        <span key={experiment.id} className="text-sm font-mono text-gray-600 dark:text-gray-400">
          {experiment.id.slice(0, 8)}...
        </span>
      ))}
    </div>
  )
}

export function EvaluationStatisticsContent({
  isLoadingStatistics,
  statisticsError,
  statistics,
  isDatasetEvaluation,
  hasSingleExperiment,
  experiments,
  scores,
  evaluation,
}: Readonly<EvaluationStatisticsContentProps>) {
  if (isLoadingStatistics) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin" data-testid="icon-loader2" />
      </div>
    )
  }
  if (statisticsError) {
    const message = statisticsError instanceof Error ? statisticsError.message : 'Unknown error'
    return (
      <div className="text-center py-12 text-sm text-red-500 dark:text-red-400">
        Error loading statistics: {message}
      </div>
    )
  }
  if (!statistics || statistics.length === 0) {
    return (
      <div className="text-center py-12 text-sm text-muted-foreground">
        No statistics available yet
      </div>
    )
  }
  if (isDatasetEvaluation) {
    return (
      <DatasetStatisticsTable
        statistics={statistics}
        scores={scores}
        evaluation={evaluation}
      />
    )
  }
  if (hasSingleExperiment) {
    return (
      <SingleExperimentStatisticsTable
        statistics={statistics}
        scores={scores}
        evaluation={evaluation}
        experimentId={evaluation.experiments[0].id}
      />
    )
  }
  return (
    <EvaluationStatisticsTable
      statistics={statistics}
      experiments={experiments}
      scores={scores}
      evaluation={evaluation}
    />
  )
}
