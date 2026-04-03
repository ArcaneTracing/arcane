"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperimentComparisonResponse } from "@/types/evaluations";
import { Badge } from "@/components/ui/badge";
import { isNumericComparison, isNominalComparison, isOrdinalComparison } from "@/lib/evaluations/statistics-helpers";
import { InfoButton } from "@/components/shared/info-button";
import { COMPARISON_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";

interface ExperimentComparisonStatsProps {
  comparison: ExperimentComparisonResponse;
  experimentAName: string;
  experimentBName: string;
}

export function ExperimentComparisonStats({
  comparison,
  experimentAName,
  experimentBName
}: Readonly<ExperimentComparisonStatsProps>) {
  const formatNumber = (value: number | null, decimals: number = 3): string => {
    if (value === null) return "N/A";
    return value.toFixed(decimals);
  };

  const formatCI = (ci: {lower: number | null;upper: number | null;}): string => {
    if (ci.lower === null || ci.upper === null) return "N/A";
    return `[${formatNumber(ci.lower)}, ${formatNumber(ci.upper)}]`;
  };

  const formatPercentage = (value: number | null): string => {
    if (value === null) return "N/A";
    return `${(value * 100).toFixed(1)}%`;
  };

  const getPValueSignificance = (pValue: number | null): {label: string;variant: "default" | "secondary" | "destructive" | "outline";} => {
    if (pValue === null) return { label: "N/A", variant: "outline" };
    if (pValue < 0.001) return { label: "***", variant: "default" };
    if (pValue < 0.01) return { label: "**", variant: "default" };
    if (pValue < 0.05) return { label: "*", variant: "default" };
    return { label: "ns", variant: "outline" };
  };


  const renderNumericStats = () => {
    if (!comparison.numeric) return null;
    const num = comparison.numeric;
    const pValueInfo = getPValueSignificance(num.p_value_permutation);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Stats (Experiment B vs Experiment A)</CardTitle>
          <CardDescription>
            Statistical comparison results for paired dataset rows (Numeric)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Mean (Experiment A)
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_MEAN_A} iconSize="sm" />
              </div>
              <div className="text-lg font-semibold">{formatNumber(num.mean_a)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Mean (Experiment B)
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_MEAN_B} iconSize="sm" />
              </div>
              <div className="text-lg font-semibold">{formatNumber(num.mean_b)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Mean Delta (B - A)
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_MEAN_DELTA} iconSize="sm" />
              </div>
              <div className="text-lg font-semibold">
                {num.delta_mean !== null && num.delta_mean > 0 ? "+" : ""}
                {formatNumber(num.delta_mean)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                95% CI of Delta
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_CI95_DELTA} iconSize="sm" />
              </div>
              <div className="text-sm font-medium">{formatCI(num.ci95_delta)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                P-value
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_P_VALUE} iconSize="sm" />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">{formatNumber(num.p_value_permutation)}</span>
                <Badge variant={pValueInfo.variant}>{pValueInfo.label}</Badge>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Effect Size (Cohen's dz)
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_COHENS_DZ} iconSize="sm" />
              </div>
              <div className="text-sm font-medium">{formatNumber(num.cohens_dz)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Win Rate
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_WIN_RATE} iconSize="sm" />
              </div>
              <div className="text-sm font-medium text-green-600 dark:text-green-400">
                {formatPercentage(num.win_rate)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Tie Rate
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_TIE_RATE} iconSize="sm" />
              </div>
              <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {formatPercentage(num.tie_rate)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Loss Rate
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_LOSS_RATE} iconSize="sm" />
              </div>
              <div className="text-sm font-medium text-red-600 dark:text-red-400">
                {formatPercentage(num.loss_rate)}
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                Paired Rows
                <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_N_PAIRED} iconSize="sm" />
              </div>
              <div className="text-sm font-medium">{num.n_paired}</div>
            </div>
          </div>
        </CardContent>
      </Card>);

  };


  const renderNominalStats = () => {
    if (!comparison.nominal) return null;
    const nom = comparison.nominal;
    const pValueInfo = getPValueSignificance(nom.bowker_test.p_value);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Stats (Experiment B vs Experiment A)</CardTitle>
          <CardDescription>
            Statistical comparison results for paired dataset rows (Nominal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Paired Rows
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_N_PAIRED} iconSize="sm" />
                </div>
                <div className="text-lg font-semibold">{nom.n_paired}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Cramér's V
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_CRAMERS_V} iconSize="sm" />
                </div>
                <div className="text-sm font-medium">{formatNumber(nom.cramers_v)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Bowker's test P-value
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_BOWKER_P} iconSize="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(nom.bowker_test.p_value)}</span>
                  <Badge variant={pValueInfo.variant}>{pValueInfo.label}</Badge>
                </div>
              </div>
              {nom.entropy_difference !== null && nom.entropy_difference !== undefined &&
              <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    Entropy Difference
                    <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_ENTROPY_DIFF} iconSize="sm" />
                  </div>
                  <div className="text-sm font-medium">{formatNumber(nom.entropy_difference)}</div>
                </div>
              }
            </div>
            
            {Object.keys(nom.distribution_comparison).length > 0 &&
            <div className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-1">
                  Distribution Comparison by Category
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_DISTRIBUTION} iconSize="sm" />
                </div>
                <div className="space-y-2">
                  {Object.entries(nom.distribution_comparison).map(([category, comp]) =>
                <div key={category} className="border rounded p-2">
                      <div className="font-medium">{category}</div>
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-1">
                        <div>Prop A: {formatPercentage(comp.proportion_a)}</div>
                        <div>Prop B: {formatPercentage(comp.proportion_b)}</div>
                        <div>Delta: {formatPercentage(comp.delta_proportion)}</div>
                        <div>CI: {formatCI(comp.ci_delta)}</div>
                      </div>
                    </div>
                )}
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>);

  };


  const renderOrdinalStats = () => {
    if (!comparison.ordinal) return null;
    const ord = comparison.ordinal;
    const pValueInfo = getPValueSignificance(ord.wilcoxon_signed_rank.p_value);

    return (
      <Card>
        <CardHeader>
          <CardTitle>Comparison Stats (Experiment B vs Experiment A)</CardTitle>
          <CardDescription>
            Statistical comparison results for paired dataset rows (Ordinal)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Paired Rows
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_N_PAIRED} iconSize="sm" />
                </div>
                <div className="text-lg font-semibold">{ord.n_paired}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Cramér's V
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_CRAMERS_V} iconSize="sm" />
                </div>
                <div className="text-sm font-medium">{formatNumber(ord.cramers_v)}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Wilcoxon signed-rank P-value
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_WILCOXON_SIGNED_RANK_P} iconSize="sm" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{formatNumber(ord.wilcoxon_signed_rank.p_value)}</span>
                  <Badge variant={pValueInfo.variant}>{pValueInfo.label}</Badge>
                </div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Median (A)
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_MEDIAN} iconSize="sm" />
                </div>
                <div className="text-sm font-medium">{ord.median_comparison.median_a || 'N/A'}</div>
              </div>
              <div className="space-y-2">
                <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                  Median (B)
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_MEDIAN} iconSize="sm" />
                </div>
                <div className="text-sm font-medium">{ord.median_comparison.median_b || 'N/A'}</div>
              </div>
              {ord.cliffs_delta !== null &&
              <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    Cliff's Delta
                    <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_CLIFFS_DELTA} iconSize="sm" />
                  </div>
                  <div className="text-sm font-medium">{formatNumber(ord.cliffs_delta)}</div>
                </div>
              }
              {ord.probability_of_superiority !== null &&
              <div className="space-y-2">
                  <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                    Probability of Superiority
                    <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_PROB_SUPERIORITY} iconSize="sm" />
                  </div>
                  <div className="text-sm font-medium">{formatPercentage(ord.probability_of_superiority)}</div>
                </div>
              }
            </div>

            {Object.keys(ord.distribution_comparison).length > 0 &&
            <div className="space-y-2">
                <div className="text-sm font-medium flex items-center gap-1">
                  Distribution Comparison by Category
                  <InfoButton content={COMPARISON_TOOLTIPS.COMPARISON_DISTRIBUTION} iconSize="sm" />
                </div>
                <div className="space-y-2">
                  {Object.entries(ord.distribution_comparison).map(([category, comp]) =>
                <div key={category} className="border rounded p-2">
                      <div className="font-medium">{category}</div>
                      <div className="text-xs text-muted-foreground grid grid-cols-2 gap-2 mt-1">
                        <div>Prop A: {formatPercentage(comp.proportion_a)}</div>
                        <div>Prop B: {formatPercentage(comp.proportion_b)}</div>
                        <div>Delta: {formatPercentage(comp.delta_proportion)}</div>
                        <div>CI: {formatCI(comp.ci_delta)}</div>
                      </div>
                    </div>
                )}
                </div>
              </div>
            }
          </div>
        </CardContent>
      </Card>);

  };

  if (isNumericComparison(comparison)) {
    return renderNumericStats();
  } else if (isOrdinalComparison(comparison)) {
    return renderOrdinalStats();
  } else if (isNominalComparison(comparison)) {
    return renderNominalStats();
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Comparison Stats</CardTitle>
        <CardDescription>No comparison data available</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="text-sm text-muted-foreground">Unable to determine comparison type</div>
      </CardContent>
    </Card>);

}