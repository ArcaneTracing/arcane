"use client";

import * as React from "react";
import { ComposedChart, Bar, XAxis, YAxis, Legend, Tooltip, CartesianGrid } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { EvaluationStatisticsResponse, ScoreResultResponse } from "@/types/evaluations";
import { useExperimentScoresQuery } from "@/hooks/evaluations/use-evaluations-query";
import { Loader2 } from "lucide-react";

interface DistributionTooltipContentProps {
  active?: boolean;
  payload?: Array<{dataKey?: string | number;name?: string;value?: string | number;}>;
  label?: string;
}

function DistributionTooltipContent({ active, payload, label }: Readonly<DistributionTooltipContentProps>) {
  if (!active || !payload?.length || label == null) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="mb-1 font-medium text-foreground">{label}</div>
        {payload.map((entry) =>
        <div key={entry.dataKey} className="flex justify-between gap-4">
            <span className="text-muted-foreground">{entry.name}</span>
            <span className="font-medium text-foreground">{entry.value}</span>
          </div>
        )}
      </div>
    </div>);

}

interface ComparisonDistributionChartProps {
  statisticsA: EvaluationStatisticsResponse | undefined;
  statisticsB: EvaluationStatisticsResponse | undefined;
  experimentAName: string;
  experimentBName: string;
  projectId: string;
  evaluationId: string;
  scoreId: string;
  experimentIdA: string;
  experimentIdB: string;
}

export function ComparisonDistributionChart({
  statisticsA,
  statisticsB,
  experimentAName: _experimentAName,
  experimentBName: _experimentBName,
  projectId,
  evaluationId,
  scoreId,
  experimentIdA,
  experimentIdB
}: Readonly<ComparisonDistributionChartProps>) {
  const gradientId = React.useId().replaceAll(":", "");
  const experimentALabel = "Experiment A";
  const experimentBLabel = "Experiment B";

  const { data: scoresA, isLoading: isLoadingA } = useExperimentScoresQuery(
    projectId,
    evaluationId,
    experimentIdA
  );
  const { data: scoresB, isLoading: isLoadingB } = useExperimentScoresQuery(
    projectId,
    evaluationId,
    experimentIdB
  );

  if (isLoadingA || isLoadingB) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>);

  }  const getNumericValues = (scoreResults: ScoreResultResponse[] | undefined): number[] => {
    if (!scoreResults) return [];
    return scoreResults.
    filter((sr) => sr.scoreId === scoreId && sr.value !== null).
    map((sr) => {
      const value = typeof sr.value === 'number' ? sr.value : Number.parseFloat(String(sr.value));
      return Number.isNaN(value) ? null : value;
    }).
    filter((v): v is number => v !== null);
  };

  const valuesA = scoresA?.scoreResults ? getNumericValues(scoresA.scoreResults) : [];
  const valuesB = scoresB?.scoreResults ? getNumericValues(scoresB.scoreResults) : [];

  if (valuesA.length === 0 && valuesB.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available for distribution chart
      </div>);

  }  const allValues = [...valuesA, ...valuesB];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const numBins = 20;

  if (minValue === maxValue) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        All scores are identical ({minValue.toFixed(4)}); cannot display distribution
      </div>);

  }

  const binWidth = (maxValue - minValue) / numBins;

  const createBins = (values: number[]) => {
    const bins = new Array(numBins).fill(0).map((_, i) => ({
      bin: i,
      start: minValue + i * binWidth,
      end: minValue + (i + 1) * binWidth,
      count: 0
    }));

    values.forEach((value) => {
      const binIndex = Math.min(Math.floor((value - minValue) / binWidth), numBins - 1);
      if (binIndex >= 0 && binIndex < numBins) {
        bins[binIndex].count++;
      }
    });

    return bins.map((bin) => ({
      range: `${bin.start.toFixed(2)}-${bin.end.toFixed(2)}`,
      [experimentALabel]: valuesA.filter((v) => v >= bin.start && v < bin.end).length,
      [experimentBLabel]: valuesB.filter((v) => v >= bin.start && v < bin.end).length
    }));
  };

  const histogramData = createBins(allValues);

  const chartConfig = {
    barA: { label: experimentALabel, color: "hsl(var(--chart-1))" },
    barB: { label: experimentBLabel, color: "#0920AA" }
  } satisfies ChartConfig;

  const fillBarA = `fillCompDistA-${gradientId}`;
  const fillBarB = `fillCompDistB-${gradientId}`;
  const strokeBarA = `strokeCompDistA-${gradientId}`;
  const strokeBarB = `strokeCompDistB-${gradientId}`;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
      <ComposedChart data={histogramData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
        <defs>
          <linearGradient id={fillBarA} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-barA)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-barA)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={fillBarB} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#0920AA" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#0920AA" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={strokeBarA} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-barA)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="var(--color-barA)" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id={strokeBarB} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#1537FF" stopOpacity={0.9} />
            <stop offset="95%" stopColor="#1537FF" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="range" angle={-45} textAnchor="end" height={100} />
        <YAxis />
        <Tooltip cursor={false} content={DistributionTooltipContent} />
        <Legend />
        <Bar dataKey={experimentALabel} fill={`url(#${fillBarA})`} stroke={`url(#${strokeBarA})`} />
        <Bar dataKey={experimentBLabel} fill={`url(#${fillBarB})`} stroke={`url(#${strokeBarB})`} />
      </ComposedChart>
    </ChartContainer>);

}