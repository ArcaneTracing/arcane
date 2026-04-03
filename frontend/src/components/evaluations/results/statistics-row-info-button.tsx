"use client"

import { InfoButton } from "@/components/shared/info-button"
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips"

function StatBlock({
  title,
  explanation,
  result,
}: Readonly<{
  title: string
  explanation: string
  result: string
}>) {
  return (
    <div className="mb-3 last:mb-0">
      <div className="font-medium">{title}</div>
      <div className="text-xs text-muted-foreground mt-0.5">{explanation}</div>
      <div className="text-xs mt-1">
        Result: <span className="font-mono">{result}</span>
      </div>
    </div>
  )
}

interface NumericStats {
  mean: number | null
  ci95_mean: { lower: number | null; upper: number | null }
  p50: number | null
  p10: number | null
  p90: number | null
  std: number | null
  variance: number | null
  n_scored: number
  n_total: number
}

function formatNum(v: number | null): string {
  return v === null ? "N/A" : v.toFixed(3)
}

function formatCI(ci: { lower: number | null; upper: number | null }): string {
  if (ci.lower === null || ci.upper === null) return "N/A"
  return `[${formatNum(ci.lower)}, ${formatNum(ci.upper)}]`
}

export function NumericStatsInfoButton({ stat }: Readonly<{ stat: NumericStats }>) {
  const hasData = stat.mean !== null && stat.ci95_mean.lower !== null && stat.ci95_mean.upper !== null
  if (!hasData) return null

  const content = (
    <div className="space-y-0 text-left">
      <StatBlock
        title="Mean"
        explanation={STATISTICS_TOOLTIPS.COLUMN_MEAN}
        result={formatNum(stat.mean)}
      />
      <StatBlock
        title="CI 95%"
        explanation={STATISTICS_TOOLTIPS.COLUMN_CI95}
        result={formatCI(stat.ci95_mean)}
      />
      <StatBlock
        title="Median"
        explanation={STATISTICS_TOOLTIPS.COLUMN_MEDIAN}
        result={formatNum(stat.p50)}
      />
      <StatBlock
        title="p10 / p90"
        explanation={STATISTICS_TOOLTIPS.P10_P90}
        result={`${formatNum(stat.p10)} / ${formatNum(stat.p90)}`}
      />
      <StatBlock
        title="Std Dev"
        explanation={STATISTICS_TOOLTIPS.COLUMN_STD_DEV}
        result={formatNum(stat.std)}
      />
      <StatBlock
        title="Variance"
        explanation={STATISTICS_TOOLTIPS.VARIANCE}
        result={formatNum(stat.variance)}
      />
      <StatBlock
        title="Scored"
        explanation={STATISTICS_TOOLTIPS.COLUMN_SCORED}
        result={`${stat.n_scored} / ${stat.n_total}`}
      />
    </div>
  )

  return (
    <InfoButton
      content={content}
      iconSize="sm"
      maxWidth="max-w-md"
    />
  )
}

interface OrdinalStats {
  median_category: string | null
  mode_code: string | null
  entropy: number | null
  num_distinct_categories: number
  n_scored: number
  n_total: number
  percentile_categories: { p10: string | null; p50: string | null; p90: string | null }
  counts_by_code: Record<string, number>
}

export function OrdinalStatsInfoButton({ stat }: Readonly<{ stat: OrdinalStats }>) {
  const content = (
    <div className="space-y-0 text-left">
      <StatBlock
        title="Median"
        explanation={STATISTICS_TOOLTIPS.COLUMN_MEDIAN_ORDINAL}
        result={stat.median_category || "N/A"}
      />
      <StatBlock
        title="Mode"
        explanation={STATISTICS_TOOLTIPS.COLUMN_MODE}
        result={stat.mode_code || "N/A"}
      />
      <StatBlock
        title="Percentiles (p10 / p90)"
        explanation={STATISTICS_TOOLTIPS.COLUMN_PERCENTILES}
        result={`${stat.percentile_categories.p10 || "N/A"} / ${stat.percentile_categories.p90 || "N/A"}`}
      />
      <StatBlock
        title="Entropy"
        explanation={STATISTICS_TOOLTIPS.COLUMN_ENTROPY}
        result={stat.entropy === null ? "N/A" : stat.entropy.toFixed(3)}
      />
      <StatBlock
        title="Categories"
        explanation={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES}
        result={String(stat.num_distinct_categories)}
      />
      <StatBlock
        title="Scored"
        explanation={STATISTICS_TOOLTIPS.COLUMN_SCORED}
        result={`${stat.n_scored} / ${stat.n_total}`}
      />
      {Object.keys(stat.counts_by_code).length > 0 && (
        <div className="mt-2 pt-2 border-t text-xs">
          <div className="font-medium mb-1">Counts by category</div>
          <div className="text-muted-foreground font-mono">
            {Object.entries(stat.counts_by_code)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <InfoButton
      content={content}
      iconSize="sm"
      maxWidth="max-w-md"
    />
  )
}

interface NominalStats {
  mode_code: string | null
  entropy: number | null
  num_distinct_categories: number
  n_scored: number
  n_total: number
  counts_by_code: Record<string, number>
}

export function NominalStatsInfoButton({ stat }: Readonly<{ stat: NominalStats }>) {
  const content = (
    <div className="space-y-0 text-left">
      <StatBlock
        title="Mode"
        explanation={STATISTICS_TOOLTIPS.COLUMN_MODE_NOMINAL}
        result={stat.mode_code || "N/A"}
      />
      <StatBlock
        title="Entropy"
        explanation={STATISTICS_TOOLTIPS.COLUMN_ENTROPY}
        result={stat.entropy === null ? "N/A" : stat.entropy.toFixed(3)}
      />
      <StatBlock
        title="Categories"
        explanation={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES_NOMINAL}
        result={String(stat.num_distinct_categories)}
      />
      <StatBlock
        title="Scored"
        explanation={STATISTICS_TOOLTIPS.COLUMN_SCORED}
        result={`${stat.n_scored} / ${stat.n_total}`}
      />
      {Object.keys(stat.counts_by_code).length > 0 && (
        <div className="mt-2 pt-2 border-t text-xs">
          <div className="font-medium mb-1">Counts by category</div>
          <div className="text-muted-foreground font-mono">
            {Object.entries(stat.counts_by_code)
              .map(([k, v]) => `${k}: ${v}`)
              .join(", ")}
          </div>
        </div>
      )}
    </div>
  )

  return (
    <InfoButton
      content={content}
      iconSize="sm"
      maxWidth="max-w-md"
    />
  )
}
