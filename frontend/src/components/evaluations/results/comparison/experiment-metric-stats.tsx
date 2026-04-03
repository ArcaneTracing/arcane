"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { EvaluationStatisticsResponse } from "@/types/evaluations"
import { isNumericStatistics, isNominalStatistics, isOrdinalStatistics } from "@/lib/evaluations/statistics-helpers"
import { InfoButton } from "@/components/shared/info-button"
import { STATISTICS_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips"

interface ExperimentMetricStatsProps {
  experimentName: string
  statistics: EvaluationStatisticsResponse | undefined
  scoreName: string
}

export function ExperimentMetricStats({
  experimentName,
  statistics,
  scoreName,
}: Readonly<ExperimentMetricStatsProps>) {
  const formatNumber = (value: number | null, decimals: number = 3): string => {
    if (value === null) return "N/A"
    return value.toFixed(decimals)
  }

  const formatCI = (ci: { lower: number | null; upper: number | null }): string => {
    if (ci.lower === null || ci.upper === null) return "N/A"
    return `[${formatNumber(ci.lower)}, ${formatNumber(ci.upper)}]`
  }

  if (!statistics) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{experimentName}</CardTitle>
          <p className="text-sm text-muted-foreground">{scoreName}</p>
        </CardHeader>
        <CardContent>
          <div className="text-sm text-muted-foreground text-center py-4">
            No statistics available
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isNumericStatistics(statistics)) {
    const num = statistics.numeric
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{experimentName}</CardTitle>
          <p className="text-sm text-muted-foreground">{scoreName}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Mean
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_MEAN} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{formatNumber(num.mean)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              95% CI
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_CI95} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{formatCI(num.ci95_mean)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Std Dev
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_STD_DEV} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{formatNumber(num.std)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Scored Rows
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_SCORED} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{num.n_scored} / {num.n_total}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isNominalStatistics(statistics)) {
    const nom = statistics.nominal
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{experimentName}</CardTitle>
          <p className="text-sm text-muted-foreground">{scoreName}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Mode
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_MODE_NOMINAL} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{nom.mode_code || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Categories
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES_NOMINAL} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{nom.num_distinct_categories}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Entropy
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_ENTROPY} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{formatNumber(nom.entropy)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Scored Rows
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_SCORED} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{nom.n_scored} / {nom.n_total}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isOrdinalStatistics(statistics)) {
    const ord = statistics.ordinal
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">{experimentName}</CardTitle>
          <p className="text-sm text-muted-foreground">{scoreName}</p>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Median
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_MEDIAN_ORDINAL} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{ord.median_category || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Mode
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_MODE} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{ord.mode_code || 'N/A'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Categories
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_CATEGORIES} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{ord.num_distinct_categories}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-muted-foreground flex items-center gap-1">
              Scored Rows
              <InfoButton content={STATISTICS_TOOLTIPS.COLUMN_SCORED} iconSize="sm" />
            </span>
            <span className="text-sm font-medium">{ord.n_scored} / {ord.n_total}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{experimentName}</CardTitle>
        <p className="text-sm text-muted-foreground">{scoreName}</p>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground text-center py-4">
          Unknown statistics type
        </div>
      </CardContent>
    </Card>
  )
}

