"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { ExperimentComparisonResponse, EvaluationStatisticsResponse } from "@/types/evaluations";
import { isNominalComparison } from "@/lib/evaluations/statistics-helpers";

interface NominalDistributionTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: Record<string, unknown>;}>;
  experimentAName: string;
  experimentBName: string;
}

function NominalDistributionTooltipContent({
  active,
  payload,
  experimentAName,
  experimentBName
}: Readonly<NominalDistributionTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  const propA = p[`${experimentAName} (%)`] as number | undefined;
  const propB = p[`${experimentBName} (%)`] as number | undefined;
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
      </div>
    </div>);

}

interface NominalDistributionComparisonChartProps {
  comparison: ExperimentComparisonResponse;
  statisticsA: EvaluationStatisticsResponse | undefined;
  statisticsB: EvaluationStatisticsResponse | undefined;
  experimentAName: string;
  experimentBName: string;
}

export function NominalDistributionComparisonChart({
  comparison,
  statisticsA,
  statisticsB,
  experimentAName,
  experimentBName
}: Readonly<NominalDistributionComparisonChartProps>) {
  const gradientId = React.useId().replaceAll(":", "");

  if (!isNominalComparison(comparison)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Distribution comparison chart is only available for nominal comparisons
      </div>);

  }

  const nominal = comparison.nominal;

  if (!nominal.distribution_comparison || Object.keys(nominal.distribution_comparison).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available
      </div>);

  }


  const countsA = statisticsA?.nominal?.counts_by_code || {};
  const countsB = statisticsB?.nominal?.counts_by_code || {};


  const categories = Object.keys(nominal.distribution_comparison);
  const data = categories.map((category) => {
    const dist = nominal.distribution_comparison[category];
    return {
      category,
      [`${experimentAName} (%)`]: dist.proportion_a * 100,
      [`${experimentBName} (%)`]: dist.proportion_b * 100,
      countA: countsA[category] || 0,
      countB: countsB[category] || 0
    };
  });

  const chartConfig = {
    barA: { label: experimentAName, color: "hsl(var(--chart-1))" },
    barB: { label: experimentBName, color: "#0920AA" }
  } satisfies ChartConfig;

  const fillBarA = `fillNominalDistA-${gradientId}`;
  const fillBarB = `fillNominalDistB-${gradientId}`;
  const strokeBarA = `strokeNominalDistA-${gradientId}`;
  const strokeBarB = `strokeNominalDistB-${gradientId}`;

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
          <NominalDistributionTooltipContent
            experimentAName={experimentAName}
            experimentBName={experimentBName} />

          } />

        <Legend />
        <Bar
          dataKey={`${experimentAName} (%)`}
          fill={`url(#${fillBarA})`}
          stroke={`url(#${strokeBarA})`}
          name={experimentAName} />

        <Bar
          dataKey={`${experimentBName} (%)`}
          fill={`url(#${fillBarB})`}
          stroke={`url(#${strokeBarB})`}
          name={experimentBName} />

      </BarChart>
    </ChartContainer>);

}