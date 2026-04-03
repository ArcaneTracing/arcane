"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger } from
"@/components/ui/tooltip";
import { EvaluationStatisticsResponse, EvaluationResponse } from "@/types/evaluations";
import { ExperimentResponse } from "@/types/experiments";
import { ScoreResponse } from "@/types/scores";
import { isNumericStatistics, isNominalStatistics, isOrdinalStatistics } from "@/lib/evaluations/statistics-helpers";
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";
import { InfoButton } from "@/components/shared/info-button";
import {
  NumericStatsInfoButton,
  OrdinalStatsInfoButton,
  NominalStatsInfoButton } from
"@/components/evaluations/results/statistics-row-info-button";

function ColumnHeaderTooltip({ label, content }: Readonly<{label: string;content: string;}>) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <InfoButton content={content} iconSize="sm" />
    </span>);

}

interface EvaluationStatisticsTableProps {
  statistics: EvaluationStatisticsResponse[];
  experiments: ExperimentResponse[];
  scores: ScoreResponse[];
  evaluation: EvaluationResponse;
}

export function EvaluationStatisticsTable({
  statistics,
  experiments,
  scores,
  evaluation
}: Readonly<EvaluationStatisticsTableProps>) {

  const experimentMap = new Map(experiments.map((exp) => [exp.id, exp]));
  const scoreMap = new Map(scores.map((score) => [score.id, score]));


  const experimentIds = Array.from(new Set(statistics.map((s) => s.experimentId)));
  const scoreIds = Array.from(new Set(statistics.map((s) => s.scoreId)));


  const statisticsMap = new Map<string, EvaluationStatisticsResponse>();
  statistics.forEach((stat) => {
    statisticsMap.set(`${stat.experimentId}:${stat.scoreId}`, stat);
  });


  const formatNumber = (value: number | null, decimals: number = 3): string => {
    if (value === null) return "N/A";
    return value.toFixed(decimals);
  };


  const formatCI = (ci: {lower: number | null;upper: number | null;}): string => {
    if (ci.lower === null || ci.upper === null) return "N/A";
    return `[${formatNumber(ci.lower)}, ${formatNumber(ci.upper)}]`;
  };


  const getExperimentName = (experimentId: string): string => {
    if (!experimentId) return "Unknown Experiment";
    const experiment = experimentMap.get(experimentId);
    if (experiment?.name) return experiment.name;

    const evalExperiment = evaluation.experiments.find((e) => e.id === experimentId);
    return evalExperiment ? `Experiment ${evalExperiment.id.slice(0, 8)}...` : experimentId.slice(0, 8);
  };


  const getScoreName = (scoreId: string): string => {
    if (!scoreId) return "Unknown Score";
    const score = scoreMap.get(scoreId);
    if (score?.name) return score.name;

    const evalScore = evaluation.scores.find((s) => s.id === scoreId);
    return evalScore?.name || scoreId.slice(0, 8);
  };


  const renderCellContent = (stat: EvaluationStatisticsResponse | undefined) => {
    if (!stat) return <span className="text-muted-foreground">N/A</span>;

    if (isNumericStatistics(stat)) {
      const num = stat.numeric;
      const hasData = num.mean !== null && num.ci95_mean.lower !== null && num.ci95_mean.upper !== null;
      if (!hasData) return <span className="text-muted-foreground">N/A</span>;
      return (
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <div className="font-medium">{formatNumber(num.mean)}</div>
            <div className="text-xs text-muted-foreground">{formatCI(num.ci95_mean)}</div>
          </div>
          <NumericStatsInfoButton stat={num} />
        </div>);

    }
    if (isOrdinalStatistics(stat)) {
      const ord = stat.ordinal;
      return (
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <div className="font-medium">Median: {ord.median_category || "N/A"}</div>
            <div className="text-xs text-muted-foreground">
              Mode: {ord.mode_code || "N/A"} • {ord.num_distinct_categories} categories
            </div>
          </div>
          <OrdinalStatsInfoButton stat={ord} />
        </div>);

    }
    if (isNominalStatistics(stat)) {
      const nom = stat.nominal;
      return (
        <div className="flex items-start gap-1">
          <div className="min-w-0 flex-1">
            <div className="font-medium">Mode: {nom.mode_code || "N/A"}</div>
            <div className="text-xs text-muted-foreground">
              {nom.num_distinct_categories} categories • {nom.n_scored} / {nom.n_total} scored
            </div>
          </div>
          <NominalStatsInfoButton stat={nom} />
        </div>);

    }
    return <span className="text-muted-foreground">N/A</span>;
  };


  const truncateText = (text: string | null | undefined, maxLength: number = 20): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };

  return (
    <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="min-w-[200px] border-r border-gray-200 dark:border-[#2A2A2A]">
                <ColumnHeaderTooltip label="Score" content={STATISTICS_TOOLTIPS.COLUMN_SCORE} />
              </TableHead>
              {experimentIds.map((experimentId) => {
              const fullName = getExperimentName(experimentId);
              const truncatedName = truncateText(fullName, 20);
              return (
                <TableHead
                  key={experimentId}
                  className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0">

                    <span className="inline-flex items-center gap-1">
                      {fullName.length > 20 ?
                    <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{truncatedName}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{fullName}</p>
                          </TooltipContent>
                        </Tooltip> :

                    fullName
                    }
                      <InfoButton
                      content={STATISTICS_TOOLTIPS.COLUMN_EXPERIMENT}
                      iconSize="sm" />

                    </span>
                  </TableHead>);

            })}
            </TableRow>
          </TableHeader>
          <TableBody>
            {scoreIds.length === 0 ?
          <TableRow>
                <TableCell colSpan={experimentIds.length + 1} className="h-24 text-center text-muted-foreground">
                  No scores found
                </TableCell>
              </TableRow> :

          scoreIds.map((scoreId) => {
            const scoreName = getScoreName(scoreId);
            const truncatedScoreName = truncateText(scoreName, 20);
            return (
              <TableRow key={scoreId}>
                    <TableCell className="font-medium border-r border-gray-200 dark:border-[#2A2A2A]">
                      {scoreName.length > 20 ?
                  <Tooltip>
                          <TooltipTrigger asChild>
                            <span className="cursor-help">{truncatedScoreName}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>{scoreName}</p>
                          </TooltipContent>
                        </Tooltip> :

                  scoreName
                  }
                    </TableCell>
                    {experimentIds.map((experimentId) => {
                  const stat = statisticsMap.get(`${experimentId}:${scoreId}`);

                  return (
                    <TableCell
                      key={experimentId}
                      className="border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0">

                          {renderCellContent(stat)}
                        </TableCell>);

                })}
                  </TableRow>);

          })
          }
          </TableBody>
        </Table>
      </div>);

}