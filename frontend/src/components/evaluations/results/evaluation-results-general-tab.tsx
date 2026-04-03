"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import { EvaluationResponse } from "@/types/evaluations"
import { useEvaluationStatisticsQuery, useDatasetStatisticsQuery } from "@/hooks/evaluations/use-evaluations-query"
import { useDatasetQuery } from "@/hooks/datasets/use-datasets-query"
import { useQueries } from "@tanstack/react-query"
import { experimentsApi } from "@/api/experiments"
import { scoresApi } from "@/api/scores"
import { ExperimentResponse } from "@/types/experiments"
import { ScoreResponse } from "@/types/scores"
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation"
import { InfoButton } from "@/components/shared/info-button"
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips"
import {
  EvaluationDetailsScoresSection,
  EvaluationDetailsDatasetSection,
  EvaluationDetailsExperimentsSection,
  EvaluationStatisticsContent,
  getStatisticsDescription,
} from "./evaluation-results-general-sections"

interface EvaluationResultsGeneralTabProps {
  projectId: string
  evaluationId: string
  evaluation: EvaluationResponse
}

function getDatasetIdForQuery(evaluation: EvaluationResponse): string | undefined {
  if (evaluation.evaluationScope !== 'DATASET') return undefined
  return evaluation.datasetId ?? undefined
}

function getExperimentQueries(evaluation: EvaluationResponse, organisationId: string | null, projectId: string) {
  const hasExperiments = evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 0
  if (!hasExperiments) return []
  return evaluation.experiments.map((exp) => ({
    queryKey: ['experiment', organisationId, projectId, exp.id],
    queryFn: () => experimentsApi.get(organisationId!, projectId, exp.id),
    enabled: !!organisationId && !!projectId && !!exp.id,
  }))
}

function getScoreQueries(evaluation: EvaluationResponse, organisationId: string | null, projectId: string) {
  const hasScores = evaluation.scores && evaluation.scores.length > 0
  if (!hasScores) return []
  return evaluation.scores.map((score) => ({
    queryKey: ['score', organisationId, projectId, score.id],
    queryFn: () => scoresApi.get(organisationId!, projectId, score.id),
    enabled: !!organisationId && !!projectId && !!score.id,
  }))
}

export function EvaluationResultsGeneralTab({
  projectId,
  evaluationId,
  evaluation,
}: Readonly<EvaluationResultsGeneralTabProps>) {
  const organisationId = useOrganisationIdOrNull()
  const isDatasetEvaluation = evaluation.evaluationScope === 'DATASET'
  const hasSingleExperiment =
    evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length === 1

  const { data: experimentStatistics, isLoading: isLoadingExperimentStatistics, error: experimentStatisticsError } =
    useEvaluationStatisticsQuery(projectId, isDatasetEvaluation ? undefined : evaluationId)
  const { data: datasetStatistics, isLoading: isLoadingDatasetStatistics, error: datasetStatisticsError } =
    useDatasetStatisticsQuery(projectId, isDatasetEvaluation ? evaluationId : undefined)

  const statistics = isDatasetEvaluation ? datasetStatistics : experimentStatistics
  const isLoadingStatistics = isDatasetEvaluation ? isLoadingDatasetStatistics : isLoadingExperimentStatistics
  const statisticsError = isDatasetEvaluation ? datasetStatisticsError : experimentStatisticsError

  const { data: dataset, isLoading: isLoadingDataset } = useDatasetQuery(
    projectId,
    getDatasetIdForQuery(evaluation)
  )

  const experimentQueries = useQueries({
    queries: getExperimentQueries(evaluation, organisationId, projectId),
  })
  const scoreQueries = useQueries({
    queries: getScoreQueries(evaluation, organisationId, projectId),
  })

  const experiments = experimentQueries
    .map((q) => q.data)
    .filter((exp): exp is ExperimentResponse => exp != null)
  const scores = scoreQueries
    .map((q) => q.data)
    .filter((score): score is ScoreResponse => score != null)
  const loadingRelated =
    isLoadingDataset ||
    experimentQueries.some((q) => q.isLoading) ||
    scoreQueries.some((q) => q.isLoading)

  const showDatasetSection =
    evaluation.evaluationScope === 'DATASET' && evaluation.datasetId
  const showExperimentsSection =
    evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 0

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Evaluation Details</CardTitle>
            <div className="flex gap-2">
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-help inline-flex">
                    <Badge variant="outline">{evaluation.evaluationType}</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{STATISTICS_TOOLTIPS.EVALUATION_TYPE}</p>
                </TooltipContent>
              </Tooltip>
              <Tooltip delayDuration={300}>
                <TooltipTrigger asChild>
                  <button type="button" className="cursor-help inline-flex">
                    <Badge variant="outline">{evaluation.evaluationScope}</Badge>
                  </button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{STATISTICS_TOOLTIPS.EVALUATION_SCOPE}</p>
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          <CardDescription className="mt-1">
            Created {new Date(evaluation.createdAt).toLocaleDateString()} • Updated{' '}
            {new Date(evaluation.updatedAt).toLocaleDateString()}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          <div>
            <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
              Scores
              <InfoButton content={STATISTICS_TOOLTIPS.SECTION_SCORES} iconSize="sm" />
            </h3>
            <EvaluationDetailsScoresSection
              loadingRelated={loadingRelated}
              scores={scores}
              evaluation={evaluation}
            />
          </div>

          {showDatasetSection && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                Dataset
                <InfoButton content={STATISTICS_TOOLTIPS.SECTION_DATASET} iconSize="sm" />
              </h3>
              <EvaluationDetailsDatasetSection
                loadingRelated={loadingRelated}
                dataset={dataset}
                evaluation={evaluation}
                organisationId={organisationId}
                projectId={projectId}
              />
            </div>
          )}

          {showExperimentsSection && (
            <div>
              <h3 className="text-sm font-medium mb-2 flex items-center gap-1">
                Experiments
                <InfoButton content={STATISTICS_TOOLTIPS.SECTION_EXPERIMENTS} iconSize="sm" />
              </h3>
              <EvaluationDetailsExperimentsSection
                loadingRelated={loadingRelated}
                experiments={experiments}
                evaluation={evaluation}
                organisationId={organisationId}
                projectId={projectId}
              />
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            Statistics
            <InfoButton content={STATISTICS_TOOLTIPS.STATISTICS_CARD} iconSize="md" />
          </CardTitle>
          <CardDescription>
            {getStatisticsDescription(isDatasetEvaluation, hasSingleExperiment)}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EvaluationStatisticsContent
            isLoadingStatistics={isLoadingStatistics}
            statisticsError={statisticsError}
            statistics={statistics}
            isDatasetEvaluation={isDatasetEvaluation}
            hasSingleExperiment={hasSingleExperiment}
            experiments={experiments}
            scores={scores}
            evaluation={evaluation}
          />
        </CardContent>
      </Card>
    </div>
  )
}
