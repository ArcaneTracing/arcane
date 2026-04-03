"use client";

import * as React from "react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ReferenceLine, Cell } from "recharts";
import { ChartContainer, type ChartConfig } from "@/components/ui/chart";
import { ExperimentComparisonResponse } from "@/types/evaluations";
import { isOrdinalComparison } from "@/lib/evaluations/statistics-helpers";
import { useScoreQuery } from "@/hooks/scores/use-scores-query";
import { Loader2 } from "lucide-react";

interface OrdinalTailRiskTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: {name: string;value: number;ciLower: number | null;ciUpper: number | null;};}>;
}

function OrdinalTailRiskTooltipContent({ active, payload }: Readonly<OrdinalTailRiskTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  const { name, value, ciLower, ciUpper } = p;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="mb-1 font-medium text-foreground">{name}</div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Value</span>
          <span className="font-medium text-foreground">{Number(value).toFixed(2)}%</span>
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

interface OrdinalTailRiskChartProps {
  comparison: ExperimentComparisonResponse;
  projectId: string;
  scoreId: string;
}

export function OrdinalTailRiskChart({
  comparison,
  projectId,
  scoreId
}: Readonly<OrdinalTailRiskChartProps>) {
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
        Tail-risk chart is only available for ordinal comparisons
      </div>);

  }

  const ordinal = comparison.ordinal;
  const ordinalConfig = score?.ordinalConfig;


  const hasThresholdRank = ordinalConfig?.threshold_rank !== undefined && ordinalConfig.threshold_rank !== null;
  const hasTailRiskData = ordinal.delta_tail_mass !== null && ordinal.delta_tail_mass !== undefined;

  if (!hasThresholdRank) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-medium mb-1">Tail-risk chart not available</p>
          <p className="text-xs">Configure <code className="px-1 py-0.5 bg-muted rounded">threshold_rank</code> in the score settings to enable tail-risk comparison.</p>
        </div>
      </div>);

  }

  if (!hasTailRiskData) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No tail-risk data available for comparison
      </div>);

  }

  const tailMass = ordinal.delta_tail_mass;


  const tailMassA = Number(tailMass.tail_mass_a) * 100;
  const tailMassB = Number(tailMass.tail_mass_b) * 100;
  const delta = Number(tailMass.delta) * 100;
  const ciLower = tailMass.ci.lower === null ? null : Number(tailMass.ci.lower) * 100;
  const ciUpper = tailMass.ci.upper === null ? null : Number(tailMass.ci.upper) * 100;


  if (Number.isNaN(tailMassA) || Number.isNaN(tailMassB) || Number.isNaN(delta)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Invalid tail-risk data: values are not numbers
      </div>);

  }


  if (tailMassA === 0 && tailMassB === 0 && delta === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        <div className="text-center">
          <p className="font-medium mb-1">No results below threshold rank</p>
          <p className="text-xs">
            None of the results from either experiment fall below the threshold rank:{" "}
            <span className="font-medium">{ordinalConfig.threshold_rank}</span>
          </p>
        </div>
      </div>);

  }

  const data = [
  {
    name: "Experiment A",
    value: tailMassA,
    ciLower: null,
    ciUpper: null
  },
  {
    name: "Experiment B",
    value: tailMassB,
    ciLower: null,
    ciUpper: null
  },
  {
    name: "Delta",
    value: delta,
    ciLower,
    ciUpper
  }];
  const allValues = [tailMassA, tailMassB, delta, ciLower, ciUpper].filter((v) => v !== null && !Number.isNaN(v)) as number[];
  if (allValues.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No valid tail-risk data available
      </div>);

  }
  const maxValue = Math.max(...allValues, 0);
  const minValue = Math.min(...allValues, 0);

  const yDomain: [number, number] = maxValue === 0 ?
  [0, 5] :
  [Math.max(0, minValue - Math.abs(maxValue) * 0.1), maxValue * 1.1];

  const chartConfig = {
    primary: { label: "Primary", color: "#FF1A35" },
    secondary: { label: "Secondary", color: "#4EFF2B" },
    barA: { label: "Experiment A", color: "hsl(var(--chart-2))" },
    barB: { label: "Experiment B", color: "#0920AA" }
  } satisfies ChartConfig;

  const fillPrimary = `fillTailRiskPrimary-${gradientId}`;
  const fillSecondary = `fillTailRiskSecondary-${gradientId}`;
  const fillBarA = `fillTailRiskBarA-${gradientId}`;
  const fillBarB = `fillTailRiskBarB-${gradientId}`;
  const strokePrimary = `strokeTailRiskPrimary-${gradientId}`;
  const strokeSecondary = `strokeTailRiskSecondary-${gradientId}`;
  const strokeBarA = `strokeTailRiskBarA-${gradientId}`;
  const strokeBarB = `strokeTailRiskBarB-${gradientId}`;

  return (
    <div className="space-y-4">
      <div className="text-xs text-muted-foreground">
        Threshold rank: <span className="font-medium">{ordinalConfig.threshold_rank}</span> (results below this rank are considered "bad")
      </div>
      <ChartContainer config={chartConfig} className="aspect-auto h-[300px] w-full">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <XAxis dataKey="name" />
          <YAxis
            label={{ value: "Proportion (%)", angle: -90, position: "insideLeft" }}
            domain={yDomain} />

          <defs>
            <linearGradient id={fillPrimary} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={fillSecondary} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={fillBarA} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-barA)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-barA)" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={fillBarB} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0920AA" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#0920AA" stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id={strokePrimary} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0.2} />
            </linearGradient>
            <linearGradient id={strokeSecondary} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-secondary)" stopOpacity={0.9} />
              <stop offset="95%" stopColor="var(--color-secondary)" stopOpacity={0.2} />
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
          <ReferenceLine y={0} stroke="#666" strokeDasharray="3 3" />
          <Tooltip cursor={false} content={OrdinalTailRiskTooltipContent} />
          <Bar dataKey="value">
            {data.map((entry) => {
              const isDelta = entry.name === "Delta";
              const isBarB = entry.name === "Experiment B";
              let fill: string;
              let stroke: string;
              if (isDelta) {
                fill = entry.value <= 0 ? `url(#${fillSecondary})` : `url(#${fillPrimary})`;
                stroke = entry.value <= 0 ? `url(#${strokeSecondary})` : `url(#${strokePrimary})`;
              } else if (isBarB) {
                fill = `url(#${fillBarB})`;
                stroke = `url(#${strokeBarB})`;
              } else {
                fill = `url(#${fillBarA})`;
                stroke = `url(#${strokeBarA})`;
              }
              return (
                <Cell key={`cell-${entry.name}`} fill={fill} stroke={stroke} />);

            })}
          </Bar>
        </BarChart>
      </ChartContainer>
      {data[2]?.ciLower !== null && data[2]?.ciUpper !== null &&
      <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <div>
              <span className="font-medium">Delta CI Lower:</span> {data[2].ciLower?.toFixed(2)}%
            </div>
            <div>
              <span className="font-medium">Delta CI Upper:</span> {data[2].ciUpper?.toFixed(2)}%
            </div>
          </div>
        </div>
      }
    </div>);

}