"use client"

import * as React from "react"
import {
  ComposedChart,
  XAxis,
  YAxis,
  ReferenceLine,
  ReferenceArea,
  ReferenceDot,
  Tooltip,
} from "recharts"
import { useTheme } from "next-themes"
import { ChartContainer, type ChartConfig } from "@/components/ui/chart"
import { ExperimentComparisonResponse } from "@/types/evaluations"
import { isNumericComparison } from "@/lib/evaluations/statistics-helpers"

const chartConfig = {
  primary: { label: "Primary", color: "#FF1A35" },
  secondary: { label: "Secondary", color: "#4EFF2B" },
} satisfies ChartConfig

interface DeltaTooltipContentProps {
  active?: boolean
  ciLower: number
  ciUpper: number
  mean: number
}

function DeltaTooltipContent({ active, ciLower, ciUpper, mean }: Readonly<DeltaTooltipContentProps>) {
  if (!active) return null
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">CI Lower</span>
          <span className="font-medium text-foreground">{ciLower.toFixed(4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Mean</span>
          <span className="font-medium text-foreground">{mean.toFixed(4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">CI Upper</span>
          <span className="font-medium text-foreground">{ciUpper.toFixed(4)}</span>
        </div>
      </div>
    </div>
  )
}

interface ComparisonDeltaChartProps {
  comparison: ExperimentComparisonResponse
}

export function ComparisonDeltaChart({ comparison }: Readonly<ComparisonDeltaChartProps>) {
  const { resolvedTheme } = useTheme()
  const gradientId = React.useId().replaceAll(":", "")

  if (!isNumericComparison(comparison)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Delta chart is only available for numeric comparisons
      </div>
    )
  }

  const num = comparison.numeric

  if (num.delta_mean === null) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available
      </div>
    )
  }

  const hasCI = num.ci95_delta.lower !== null && num.ci95_delta.upper !== null
  const mean = num.delta_mean
  const ciLower = num.ci95_delta.lower ?? mean - 0.1
  const ciUpper = num.ci95_delta.upper ?? mean + 0.1
  const dataMin = Math.min(mean, ciLower, ciUpper, 0)
  const dataMax = Math.max(mean, ciLower, ciUpper, 0)
  const padding = Math.max((dataMax - dataMin) * 0.2, 0.1)
  const xMin = dataMin - padding
  const xMax = dataMax + padding
  const caterpillarData = [{ name: "Delta", mean, ciLower, ciUpper }]

  const meanColor = mean >= 0 ? "#22c55e" : "#FF1A35"
  let dotFill: string
  if (resolvedTheme === "dark") {
    dotFill = mean >= 0 ? "#ffffff" : "#FF1A35"
  } else {
    dotFill = mean >= 0 ? "#22c55e" : "#b91c1c"
  }
  const eps = (xMax - xMin) * 0.003
  let ciLineColor: string
  if (mean >= 0) {
    ciLineColor = "#22c55e"
  } else {
    ciLineColor = resolvedTheme === "light" ? "#b91c1c" : "#FF1A35"
  }

  return (
    <div className="space-y-4">
      <ChartContainer config={chartConfig} className="aspect-auto h-[120px] w-full">
        <ComposedChart
          layout="vertical"
          data={caterpillarData}
          margin={{ top: 20, right: 30, left: 20, bottom: 40 }}
        >
          <defs>
            <linearGradient id={`ciAreaGradient-${gradientId}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={meanColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={meanColor} stopOpacity={0.05} />
            </linearGradient>
          </defs>
          <XAxis
            type="number"
            domain={[xMin, xMax]}
            tickFormatter={(value) => Number(value).toFixed(4)}
            label={{ value: "Delta", position: "insideBottom", offset: -5 }}
          />
          <YAxis type="category" dataKey="name" width={50} tick={false} axisLine={false} tickLine={false} />
          <Tooltip
            cursor={false}
            content={
              <DeltaTooltipContent ciLower={ciLower} ciUpper={ciUpper} mean={mean} />
            }
          />
          <ReferenceArea
            x1={ciLower}
            x2={ciUpper}
            fill={`url(#ciAreaGradient-${gradientId})`}
            stroke="none"
          />
          <ReferenceArea
            x1={ciLower}
            x2={ciLower + eps}
            fill="none"
            stroke={ciLineColor}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <ReferenceLine
            x={ciLower}
            stroke="none"
            label={{
              value: `CI Lower (${ciLower.toFixed(4)})`,
              position: "top",
              fill: ciLineColor,
              fontSize: 11,
            }}
          />
          <ReferenceArea
            x1={ciUpper - eps}
            x2={ciUpper}
            fill="none"
            stroke={ciLineColor}
            strokeDasharray="4 4"
            strokeWidth={1.5}
          />
          <ReferenceLine
            x={ciUpper}
            stroke="none"
            label={{
              value: `CI Upper (${ciUpper.toFixed(4)})`,
              position: "top",
              fill: ciLineColor,
              fontSize: 11,
            }}
          />
          <ReferenceDot
            x={mean}
            y="Delta"
            r={6}
            fill={dotFill}
            stroke="none"
          />
        </ComposedChart>
      </ChartContainer>
      {hasCI && (
        <div className="text-center text-sm text-muted-foreground">
          <div className="flex items-center justify-center gap-4">
            <div>
              <span className="font-medium">CI Lower:</span> {num.ci95_delta.lower?.toFixed(4)}
            </div>
            <div>
              <span className="font-medium">Mean:</span> {mean.toFixed(4)}
            </div>
            <div>
              <span className="font-medium">CI Upper:</span> {num.ci95_delta.upper?.toFixed(4)}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
