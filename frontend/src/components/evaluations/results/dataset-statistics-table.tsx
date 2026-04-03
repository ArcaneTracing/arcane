"use client";

import {
  Tooltip,
  TooltipContent,
  TooltipTrigger } from
"@/components/ui/tooltip";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow } from
"@/components/ui/table";
import { InfoButton } from "@/components/shared/info-button";
import { DatasetStatisticsResponse, EvaluationResponse } from "@/types/evaluations";
import { ScoreResponse } from "@/types/scores";
import { isNumericStatistics, isNominalStatistics, isOrdinalStatistics } from "@/lib/evaluations/statistics-helpers";
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";

function ColumnHeaderTooltip({ label, content }: Readonly<{label: string;content: string;}>) {
  return (
    <span className="inline-flex items-center gap-1">
      {label}
      <InfoButton content={content} iconSize="sm" />
    </span>);

}

interface DatasetStatisticsTableProps {
  statistics: DatasetStatisticsResponse[];
  scores: ScoreResponse[];
  evaluation: EvaluationResponse;
}

export function DatasetStatisticsTable({
  statistics,
  scores,
  evaluation
}: Readonly<DatasetStatisticsTableProps>) {

  const scoreMap = new Map(scores.map((score) => [score.id, score]));


  const scoreIds = Array.from(new Set(statistics.map((s) => s.scoreId)));


  const statisticsMap = new Map<string, DatasetStatisticsResponse>();
  statistics.forEach((stat) => {
    statisticsMap.set(stat.scoreId, stat);
  });


  const formatNumber = (value: number | null, decimals: number = 3): string => {
    if (value === null) return "N/A";
    return value.toFixed(decimals);
  };


  const formatCI = (ci: {lower: number | null;upper: number | null;}): string => {
    if (ci.lower === null || ci.upper === null) return "N/A";
    return `[${formatNumber(ci.lower)}, ${formatNumber(ci.upper)}]`;
  };


  const getScoreName = (scoreId: string): string => {
    if (!scoreId) return "Unknown Score";
    const score = scoreMap.get(scoreId);
    if (score?.name) return score.name;

    const evalScore = evaluation.scores.find((s) => s.id === scoreId);
    return evalScore?.name || scoreId.slice(0, 8);
  };


  const truncateText = (text: string | null | undefined, maxLength: number = 20): string => {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.slice(0, maxLength) + "...";
  };


  const renderNumericRow = (scoreId: string, stat: DatasetStatisticsResponse) => {
    const scoreName = getScoreName(scoreId);
    const truncatedScoreName = truncateText(scoreName, 20);
    const num = stat.numeric!;
    const hasData = num.mean !== null && num.ci95_mean.lower !== null && num.ci95_mean.upper !== null;

    return (
      <TableRow key={scoreId}>
        <TableCell className="font-medium border-r border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-1">
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
          </div>
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {hasData ? formatNumber(num.mean) : <span className="text-muted-foreground">N/A</span>}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A] text-xs text-muted-foreground">
          {hasData ? formatCI(num.ci95_mean) : "N/A"}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {num.p50 === null ? "N/A" : formatNumber(num.p50)}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {num.std === null ? "N/A" : formatNumber(num.std)}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0 text-xs text-muted-foreground">
          {`${num.n_scored} / ${num.n_total}`}
        </TableCell>
      </TableRow>);

  };


  const renderNominalRow = (scoreId: string, stat: DatasetStatisticsResponse) => {
    const scoreName = getScoreName(scoreId);
    const truncatedScoreName = truncateText(scoreName, 20);
    const nom = stat.nominal!;

    return (
      <TableRow key={scoreId}>
        <TableCell className="font-medium border-r border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-1">
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
          </div>
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {nom.mode_code || 'N/A'}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {formatNumber(nom.entropy)}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {nom.num_distinct_categories}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0 text-xs text-muted-foreground">
          {`${nom.n_scored} / ${nom.n_total}`}
        </TableCell>
      </TableRow>);

  };


  const renderOrdinalRow = (scoreId: string, stat: DatasetStatisticsResponse) => {
    const scoreName = getScoreName(scoreId);
    const truncatedScoreName = truncateText(scoreName, 20);
    const ord = stat.ordinal!;

    return (
      <TableRow key={scoreId}>
        <TableCell className="font-medium border-r border-gray-200 dark:border-[#2A2A2A]">
          <div className="flex items-center gap-1">
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
          </div>
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          <div className="font-medium">Median: {ord.median_category || 'N/A'}</div>
          <div className="text-xs text-muted-foreground">Mode: {ord.mode_code || 'N/A'}</div>
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A] text-xs text-muted-foreground">
          <div>p10: {ord.percentile_categories.p10 || 'N/A'}</div>
          <div>p90: {ord.percentile_categories.p90 || 'N/A'}</div>
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {formatNumber(ord.entropy)}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A]">
          {ord.num_distinct_categories}
        </TableCell>
        <TableCell className="border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0 text-xs text-muted-foreground">
          {`${ord.n_scored} / ${ord.n_total}`}
        </TableCell>
      </TableRow>);

  };


  const numericScoreIds = scoreIds.filter((id) => {
    const stat = statisticsMap.get(id);
    return stat && isNumericStatistics(stat);
  });
  const ordinalScoreIds = scoreIds.filter((id) => {
    const stat = statisticsMap.get(id);
    return stat && isOrdinalStatistics(stat);
  });
  const nominalScoreIds = scoreIds.filter((id) => {
    const stat = statisticsMap.get(id);
    return stat && isNominalStatistics(stat);
  });


  const renderNumericTable = () => {
    if (numericScoreIds.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
          Numeric & RAGAS Scores
          <InfoButton content={STATISTICS_TOOLTIPS.NUMERIC_SECTION} iconSize="sm" />
        </h3>
        <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Score" content={STATISTICS_TOOLTIPS.COLUMN_SCORE} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Mean" content={STATISTICS_TOOLTIPS.COLUMN_MEAN} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="CI 95%" content={STATISTICS_TOOLTIPS.COLUMN_CI95} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Median" content={STATISTICS_TOOLTIPS.COLUMN_MEDIAN} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Std Dev" content={STATISTICS_TOOLTIPS.COLUMN_STD_DEV} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0">
                  <ColumnHeaderTooltip label="Scored" content={STATISTICS_TOOLTIPS.COLUMN_SCORED} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {numericScoreIds.map((scoreId) => {
                const stat = statisticsMap.get(scoreId);
                if (!stat) return null;
                return renderNumericRow(scoreId, stat);
              })}
            </TableBody>
          </Table>
        </div>
      </div>);

  };


  const renderOrdinalTable = () => {
    if (ordinalScoreIds.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
          Ordinal Scores
          <InfoButton content={STATISTICS_TOOLTIPS.ORDINAL_SECTION} iconSize="sm" />
        </h3>
        <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Score" content={STATISTICS_TOOLTIPS.COLUMN_SCORE} />
                </TableHead>
                <TableHead className="min-w-[200px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Summary" content={STATISTICS_TOOLTIPS.COLUMN_ORDINAL_SUMMARY} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Percentiles" content={STATISTICS_TOOLTIPS.COLUMN_PERCENTILES} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Entropy" content={STATISTICS_TOOLTIPS.COLUMN_ENTROPY} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Categories" content={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0">
                  <ColumnHeaderTooltip label="Scored" content={STATISTICS_TOOLTIPS.COLUMN_SCORED} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ordinalScoreIds.map((scoreId) => {
                const stat = statisticsMap.get(scoreId);
                if (!stat) return null;
                return renderOrdinalRow(scoreId, stat);
              })}
            </TableBody>
          </Table>
        </div>
      </div>);

  };


  const renderNominalTable = () => {
    if (nominalScoreIds.length === 0) return null;

    return (
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 flex items-center gap-1">
          Nominal Scores
          <InfoButton content={STATISTICS_TOOLTIPS.NOMINAL_SECTION} iconSize="sm" />
        </h3>
        <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="min-w-[200px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Score" content={STATISTICS_TOOLTIPS.COLUMN_SCORE} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Mode" content={STATISTICS_TOOLTIPS.COLUMN_MODE_NOMINAL} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Entropy" content={STATISTICS_TOOLTIPS.COLUMN_ENTROPY} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A]">
                  <ColumnHeaderTooltip label="Categories" content={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES_NOMINAL} />
                </TableHead>
                <TableHead className="min-w-[150px] border-r border-gray-200 dark:border-[#2A2A2A] last:border-r-0">
                  <ColumnHeaderTooltip label="Scored" content={STATISTICS_TOOLTIPS.COLUMN_SCORED} />
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {nominalScoreIds.map((scoreId) => {
                const stat = statisticsMap.get(scoreId);
                if (!stat) return null;
                return renderNominalRow(scoreId, stat);
              })}
            </TableBody>
          </Table>
        </div>
      </div>);

  };

  if (scoreIds.length === 0) {
    return (
      <div className="rounded-lg border border-gray-100 dark:border-[#2A2A2A] bg-white dark:bg-[#0D0D0D] shadow-sm p-8 text-center text-muted-foreground">
        No scores found
      </div>);

  }

  return (
    <div className="space-y-6">
      {renderNumericTable()}
      {renderOrdinalTable()}
      {renderNominalTable()}
    </div>);

}