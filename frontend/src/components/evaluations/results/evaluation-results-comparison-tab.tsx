"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue } from
"@/components/ui/select";
import { EvaluationResponse } from "@/types/evaluations";
import { useExperimentComparisonQuery, useEvaluationStatisticsQuery } from "@/hooks/evaluations/use-evaluations-query";
import { useQueries } from "@tanstack/react-query";
import { experimentsApi } from "@/api/experiments";
import { scoresApi } from "@/api/scores";
import { ExperimentResponse } from "@/types/experiments";
import { ScoreResponse } from "@/types/scores";
import { ExperimentComparisonStats } from "@/components/evaluations/results/comparison/experiment-comparison-stats";
import { ExperimentComparisonCharts } from "@/components/evaluations/results/comparison/experiment-comparison-charts";
import { ExperimentMetricStats } from "@/components/evaluations/results/comparison/experiment-metric-stats";
import { getComparisonNPaired } from "@/lib/evaluations/statistics-helpers";
import { useOrganisationIdOrNull } from "@/hooks/useOrganisation";
import { InfoButton } from "@/components/shared/info-button";
import { COMPARISON_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";

interface EvaluationResultsComparisonTabProps {
  projectId: string;
  evaluationId: string;
  evaluation: EvaluationResponse;
}

export function EvaluationResultsComparisonTab({
  projectId,
  evaluationId,
  evaluation
}: Readonly<EvaluationResultsComparisonTabProps>) {
  const organisationId = useOrganisationIdOrNull();
  const [experimentIdA, setExperimentIdA] = useState<string>("");
  const [experimentIdB, setExperimentIdB] = useState<string>("");
  const [selectedScoreId, setSelectedScoreId] = useState<string>("");


  const experimentQueries = useQueries({
    queries: evaluation?.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 0 ?
    evaluation.experiments.map((exp) => ({
      queryKey: ['experiment', organisationId, projectId, exp.id],
      queryFn: () => experimentsApi.get(organisationId!, projectId, exp.id),
      enabled: !!organisationId && !!projectId && !!exp.id
    })) :
    []
  });


  const scoreQueries = useQueries({
    queries: evaluation?.scores && evaluation.scores.length > 0 ?
    evaluation.scores.map((score) => ({
      queryKey: ['score', organisationId, projectId, score.id],
      queryFn: () => scoresApi.get(organisationId!, projectId, score.id),
      enabled: !!organisationId && !!projectId && !!score.id
    })) :
    []
  });

  const experiments = experimentQueries.map((q) => q.data).filter((exp): exp is ExperimentResponse => exp !== null && exp !== undefined);
  const scores = scoreQueries.map((q) => q.data).filter((score): score is ScoreResponse => score !== null && score !== undefined);
  const loadingExperiments = experimentQueries.some((q) => q.isLoading);
  const loadingScores = scoreQueries.some((q) => q.isLoading);


  const { data: statisticsA } = useEvaluationStatisticsQuery(projectId, evaluationId);
  const { data: statisticsB } = useEvaluationStatisticsQuery(projectId, evaluationId);


  const { data: comparison, isLoading: isLoadingComparison, error: comparisonError } =
  useExperimentComparisonQuery(
    projectId,
    evaluationId,
    selectedScoreId || undefined,
    experimentIdA || undefined,
    experimentIdB || undefined
  );


  const statsA = statisticsA?.find(
    (stat) => stat.experimentId === experimentIdA && stat.scoreId === selectedScoreId
  );


  const statsB = statisticsB?.find(
    (stat) => stat.experimentId === experimentIdB && stat.scoreId === selectedScoreId
  );


  const getScoreName = (scoreId: string): string => {
    const score = scores.find((s) => s.id === scoreId);
    if (score) return score.name;
    const evalScore = evaluation.scores.find((s) => s.id === scoreId);
    return evalScore ? evalScore.name : scoreId.slice(0, 8);
  };


  const hasExperiments = evaluation.evaluationScope === 'EXPERIMENT' && evaluation.experiments.length > 0;
  const canCompare = hasExperiments && experimentIdA && experimentIdB && selectedScoreId && experimentIdA !== experimentIdB;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-1">
            Experiment Comparison
            <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_CARD} iconSize="md" />
          </CardTitle>
          <CardDescription>
            Compare metrics between two experiments
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {hasExperiments ?
          <>
              {}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Experiment A
                    <InfoButton content={COMPARISON_TOOLTIPS.SELECTOR_EXPERIMENT_A} iconSize="sm" />
                  </label>
                  <Select
                  value={experimentIdA}
                  onValueChange={setExperimentIdA}
                  disabled={loadingExperiments}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select experiment A..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                      if (loadingExperiments) {
                        return (
                          <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                              </div>
                            </SelectItem>);

                      }
                      if (experiments.length > 0) {
                        return experiments.map((experiment) =>
                        <SelectItem key={experiment.id} value={experiment.id}>
                              {experiment.name}
                            </SelectItem>
                        );
                      }
                      return evaluation.experiments.map((experiment) =>
                      <SelectItem key={experiment.id} value={experiment.id}>
                            Experiment {experiment.id.slice(0, 8)}...
                          </SelectItem>
                      );
                    })()}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Experiment B
                    <InfoButton content={COMPARISON_TOOLTIPS.SELECTOR_EXPERIMENT_B} iconSize="sm" />
                  </label>
                  <Select
                  value={experimentIdB}
                  onValueChange={setExperimentIdB}
                  disabled={loadingExperiments}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select experiment B..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                      if (loadingExperiments) {
                        return (
                          <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                              </div>
                            </SelectItem>);

                      }
                      if (experiments.length > 0) {
                        return experiments.
                        filter((exp) => exp.id !== experimentIdA).
                        map((experiment) =>
                        <SelectItem key={experiment.id} value={experiment.id}>
                                {experiment.name}
                              </SelectItem>
                        );
                      }
                      return evaluation.experiments.
                      filter((exp) => exp.id !== experimentIdA).
                      map((experiment) =>
                      <SelectItem key={experiment.id} value={experiment.id}>
                              Experiment {experiment.id.slice(0, 8)}...
                            </SelectItem>
                      );
                    })()}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium flex items-center gap-1">
                    Score
                    <InfoButton content={COMPARISON_TOOLTIPS.SELECTOR_SCORE} iconSize="sm" />
                  </label>
                  <Select
                  value={selectedScoreId}
                  onValueChange={setSelectedScoreId}
                  disabled={loadingScores}>

                    <SelectTrigger>
                      <SelectValue placeholder="Select score..." />
                    </SelectTrigger>
                    <SelectContent>
                      {(() => {
                      if (loadingScores) {
                        return (
                          <SelectItem value="loading" disabled>
                              <div className="flex items-center gap-2">
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Loading...
                              </div>
                            </SelectItem>);

                      }
                      if (scores.length > 0) {
                        return scores.map((score) =>
                        <SelectItem key={score.id} value={score.id}>
                              {score.name}
                            </SelectItem>
                        );
                      }
                      return evaluation.scores.map((score) =>
                      <SelectItem key={score.id} value={score.id}>
                            {score.name}
                          </SelectItem>
                      );
                    })()}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {}
              {canCompare ?
            <>
                  {(() => {
                if (isLoadingComparison) {
                  return (
                    <div className="flex items-center justify-center py-12">
                          <Loader2 className="h-6 w-6 animate-spin" />
                        </div>);

                }
                if (comparisonError) {
                  return (
                    <div className="text-center py-12 text-sm text-red-500 dark:text-red-400">
                          Error loading comparison: {comparisonError instanceof Error ? comparisonError.message : 'Unknown error'}
                        </div>);

                }
                if (comparison && getComparisonNPaired(comparison) > 0) {
                  return (
                    <div className="space-y-6">
                      {}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <ExperimentMetricStats
                          experimentName="Experiment A"
                          statistics={statsA}
                          scoreName={getScoreName(selectedScoreId)} />

                        <ExperimentMetricStats
                          experimentName="Experiment B"
                          statistics={statsB}
                          scoreName={getScoreName(selectedScoreId)} />

                      </div>

                      {}
                      <ExperimentComparisonStats
                        comparison={comparison}
                        experimentAName="Experiment A"
                        experimentBName="Experiment B" />


                      {}
                      <ExperimentComparisonCharts
                        comparison={comparison}
                        statisticsA={statsA}
                        statisticsB={statsB}
                        experimentAName="Experiment A"
                        experimentBName="Experiment B"
                        projectId={projectId}
                        evaluationId={evaluationId}
                        scoreId={selectedScoreId}
                        experimentIdA={experimentIdA}
                        experimentIdB={experimentIdB} />

                    </div>);

                }
                return (
                  <div className="text-center py-12 text-sm text-muted-foreground">
                        No paired data available for comparison. Both experiments need to have scored results for the selected score.
                      </div>);

              })()}
                </> :

            <div className="text-center py-12 text-sm text-muted-foreground">
                  Please select two different experiments and a score to compare
                </div>
            }
            </> :

          <div className="text-center py-12 text-muted-foreground">
              This evaluation does not include experiments. Comparison is only available for experiment-based evaluations.
            </div>
          }
        </CardContent>
      </Card>
    </div>);

}