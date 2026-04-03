"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { ExperimentComparisonResponse, EvaluationStatisticsResponse } from "@/types/evaluations";
import { isOrdinalComparison } from "@/lib/evaluations/statistics-helpers";
import { useScoreQuery } from "@/hooks/scores/use-scores-query";
import { Loader2 } from "lucide-react";

interface OrdinalDistributionTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: Record<string, unknown>;}>;
  experimentAName: string;
  experimentBName: string;
}

function OrdinalDistributionTooltipContent({
  active,
  payload,
  experimentAName,
  experimentBName
}: Readonly<OrdinalDistributionTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  const propA = p[`${experimentAName} (%)`] as number | undefined;
  const propB = p[`${experimentBName} (%)`] as number | undefined;
  const delta = p.delta as number | undefined;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="mb-1 font-medium text-foreground">{p.category}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{experimentAName}</span>
          <span className="font-medium text-foreground">{Number(propA).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{experimentBName}</span>
          <span className="font-medium text-foreground">{Number(propB).toFixed(1)}%</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Δ</span>
          <span className="font-medium text-foreground">{Number(delta).toFixed(1)}%</span>
        </div>
      </div>
    </div>);

}

interface OrdinalDistributionComparisonChartProps {
  comparison: ExperimentComparisonResponse;
  statisticsA: EvaluationStatisticsResponse | undefined;
  statisticsB: EvaluationStatisticsResponse | undefined;
  experimentAName: string;
  experimentBName: string;
  projectId: string;
  scoreId: string;
}

export function OrdinalDistributionComparisonChart({
  comparison,
  statisticsA,
  statisticsB,
  experimentAName,
  experimentBName,
  projectId,
  scoreId
}: Readonly<OrdinalDistributionComparisonChartProps>) {
  const gradientId = React.useId().replaceAll(":", "");
  const { data: score, isLoading: isLoadingScore } = useScoreQuery(projectId, scoreId);

  if (isLoadingScore) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>);

  }

  if (!isOrdinalComparison(comparison)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Ordered distribution comparison chart is only available for ordinal comparisons
      </div>);

  }

  const ordinal = comparison.ordinal;

  if (!ordinal.distribution_comparison || Object.keys(ordinal.distribution_comparison).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available
      </div>);

  }


  const countsA = statisticsA?.ordinal?.counts_by_code || {};
  const countsB = statisticsB?.ordinal?.counts_by_code || {};


  const distributionCategories = Object.keys(ordinal.distribution_comparison);


  const scale = score?.scale || [];
  const categoryToLabel = new Map<string, string>();
  const categoryToValue = new Map<string, number>();


  distributionCategories.forEach((categoryKey) => {

    const byLabel = scale.find((s) => s.label === categoryKey);
    if (byLabel) {
      categoryToLabel.set(categoryKey, byLabel.label);
      categoryToValue.set(categoryKey, byLabel.value);
      return;
    }


    const categoryValue = Number(categoryKey);
    if (!Number.isNaN(categoryValue)) {
      const byValue = scale.find((s) => s.value === categoryValue);
      if (byValue) {
        categoryToLabel.set(categoryKey, byValue.label);
        categoryToValue.set(categoryKey, byValue.value);
        return;
      }
    }


    categoryToLabel.set(categoryKey, categoryKey);
    categoryToValue.set(categoryKey, categoryValue || 0);
  });


  const sortedCategories = [...distributionCategories].sort((a, b) => {
    const valueA = categoryToValue.get(a) ?? 0;
    const valueB = categoryToValue.get(b) ?? 0;
    return valueA - valueB;
  });


  const data = sortedCategories.map((categoryKey) => {
    const dist = ordinal.distribution_comparison[categoryKey];
    const label = categoryToLabel.get(categoryKey) || categoryKey;
    return {
      category: label,
      categoryKey,
      [`${experimentAName} (%)`]: dist.proportion_a * 100,
      [`${experimentBName} (%)`]: dist.proportion_b * 100,
      delta: dist.delta_proportion * 100,
      countA: countsA[categoryKey] || 0,
      countB: countsB[categoryKey] || 0
    };
  });

  const chartConfig = {
    barA: { label: experimentAName, color: "hsl(var(--chart-1))" },
    barB: { label: experimentBName, color: "#0920AA" }
  } satisfies ChartConfig;

  const fillBarA = `fillOrdinalDistA-${gradientId}`;
  const fillBarB = `fillOrdinalDistB-${gradientId}`;
  const strokeBarA = `strokeOrdinalDistA-${gradientId}`;
  const strokeBarB = `strokeOrdinalDistB-${gradientId}`;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto h-[400px] w-full">
      <BarChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>

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
        <XAxis
          dataKey="category"
          angle={-45}
          textAnchor="end"
          height={100}
          interval={0} />

        <YAxis
          label={{ value: "Proportion (%)", angle: -90, position: "insideLeft" }} />

        <Tooltip
          cursor={false}
          content={
          <OrdinalDistributionTooltipContent
            experimentAName={experimentAName}
            experimentBName={experimentBName} />

          } />

        <Legend />
        <Bar
          dataKey={`${experimentAName} (%)`}
          fill={`url(#${fillBarA})`}
          stroke={`url(#${strokeBarA})`}
          name={experimentAName}
          stackId="a" />

        <Bar
          dataKey={`${experimentBName} (%)`}
          fill={`url(#${fillBarB})`}
          stroke={`url(#${strokeBarB})`}
          name={experimentBName}
          stackId="a" />

      </BarChart>
    </ChartContainer>);

}