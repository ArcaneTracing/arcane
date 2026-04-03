"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { ExperimentComparisonResponse } from "@/types/evaluations";
import { isNominalComparison } from "@/lib/evaluations/statistics-helpers";

interface NominalCategoryDeltaTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: {category: string;delta: number;ciLower: number | null;ciUpper: number | null;};}>;
}

function NominalCategoryDeltaTooltipContent({ active, payload }: Readonly<NominalCategoryDeltaTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  const { category, delta, ciLower, ciUpper } = p;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="mb-1 font-medium text-foreground">{category}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Δ</span>
          <span className="font-medium text-foreground">{Number(delta).toFixed(2)}%</span>
        </div>
        {ciLower !== null && ciUpper !== null &&
        <div className="flex justify-between gap-4">
            <span className="text-muted-foreground">CI</span>
            <span className="font-medium text-foreground">[{Number(ciLower).toFixed(2)}%, {Number(ciUpper).toFixed(2)}%]</span>
          </div>
        }
      </div>
    </div>);

}

interface NominalCategoryDeltaChartProps {
  comparison: ExperimentComparisonResponse;
}

export function NominalCategoryDeltaChart({ comparison }: Readonly<NominalCategoryDeltaChartProps>) {
  const gradientId = React.useId().replaceAll(":", "");

  if (!isNominalComparison(comparison)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Category delta chart is only available for nominal comparisons
      </div>);

  }

  const nominal = comparison.nominal;

  if (!nominal.distribution_comparison || Object.keys(nominal.distribution_comparison).length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available
      </div>);

  }


  const categories = Object.keys(nominal.distribution_comparison);
  const data = categories.
  map((category) => {
    const dist = nominal.distribution_comparison[category];
    const hasCI = dist.ci_delta.lower !== null && dist.ci_delta.upper !== null;
    return {
      category,
      delta: dist.delta_proportion * 100,
      ciLower: hasCI ? dist.ci_delta.lower * 100 : null,
      ciUpper: hasCI ? dist.ci_delta.upper * 100 : null
    };
  }).
  sort((a, b) => b.delta - a.delta);

  const allCIZero = data.every(
    (d) => d.ciLower === 0 && d.ciUpper === 0
  );
  if (allCIZero) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Confidence intervals are zero for all categories; chart cannot be displayed
      </div>);

  }

  const chartConfig = {
    primary: { label: "Primary", color: "#FF1A35" },
    secondary: { label: "Secondary", color: "#4EFF2B" }
  } satisfies ChartConfig;

  const fillPrimary = `fillNominalDeltaPrimary-${gradientId}`;
  const fillSecondary = `fillNominalDeltaSecondary-${gradientId}`;
  const strokePrimary = `strokeNominalDeltaPrimary-${gradientId}`;
  const strokeSecondary = `strokeNominalDeltaSecondary-${gradientId}`;

  return (
    <ChartContainer config={chartConfig} className="aspect-auto w-full" style={{ height: Math.max(400, data.length * 40) }}>
      <BarChart
        data={data}
        layout="vertical"
        margin={{ top: 20, right: 30, left: 100, bottom: 20 }}>

        <defs>
          <linearGradient id={fillPrimary} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={fillSecondary} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.05} />
          </linearGradient>
          <linearGradient id={strokePrimary} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.2} />
          </linearGradient>
          <linearGradient id={strokeSecondary} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.9} />
            <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
          </linearGradient>
        </defs>
        <XAxis type="number" label={{ value: "Δ Proportion (%)", position: "insideBottom", offset: -5 }} />
        <YAxis
          type="category"
          dataKey="category"
          width={90} />

        <Tooltip cursor={false} content={NominalCategoryDeltaTooltipContent} />
        <ReferenceLine x={0} stroke="#666" strokeDasharray="3 3" />
        <Bar dataKey="delta">
          {data.map((entry) =>
          <Cell
            key={`cell-${entry.category}`}
            fill={entry.delta >= 0 ? `url(#${fillSecondary})` : `url(#${fillPrimary})`}
            stroke={entry.delta >= 0 ? `url(#${strokeSecondary})` : `url(#${strokePrimary})`} />

          )}
        </Bar>
      </BarChart>
    </ChartContainer>);

}