"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ExperimentComparisonResponse, EvaluationStatisticsResponse } from "@/types/evaluations";
import { InfoButton } from "@/components/shared/info-button";
import { COMPARISON_TOOLTIPS } from "@/lib/evaluations/statistics-tooltips";
import { ComparisonDeltaChart } from "./charts/comparison-delta-chart";
import { ComparisonWinTieLossChart } from "./charts/comparison-win-tie-loss-chart";
import { ComparisonScatterChart } from "./charts/comparison-scatter-chart";
import { ComparisonDistributionChart } from "./charts/comparison-distribution-chart";
import { NominalDistributionComparisonChart } from "./charts/nominal-distribution-comparison-chart";
import { NominalCategoryDeltaChart } from "./charts/nominal-category-delta-chart";
import { OrdinalDistributionComparisonChart } from "./charts/ordinal-distribution-comparison-chart";
import { OrdinalPassRateChart } from "./charts/ordinal-pass-rate-chart";
import { OrdinalTailRiskChart } from "./charts/ordinal-tail-risk-chart";
import { isNumericComparison, isNominalComparison, isOrdinalComparison } from "@/lib/evaluations/statistics-helpers";

interface ExperimentComparisonChartsProps {
  comparison: ExperimentComparisonResponse;
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

export function ExperimentComparisonCharts({
  comparison,
  statisticsA,
  statisticsB,
  experimentAName,
  experimentBName,
  projectId,
  evaluationId,
  scoreId,
  experimentIdA,
  experimentIdB
}: Readonly<ExperimentComparisonChartsProps>) {
  const isNumeric = isNumericComparison(comparison);
  const isNominal = isNominalComparison(comparison);
  const isOrdinal = isOrdinalComparison(comparison);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {}
      {isNumeric &&
      <>
          {}
          <Card className="bg-[#F9F8FD] dark:bg-[#151515] flex flex-col">
            <CardHeader className="shrink-0">
              <CardTitle className="flex items-center gap-1">
                Delta + Confidence Interval
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_DELTA_CI} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Mean delta (Experiment B - Experiment A) with 95% confidence interval
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-1 flex-col justify-center min-h-0">
              <ComparisonDeltaChart comparison={comparison} />
            </CardContent>
          </Card>

          {}
          <Card className="bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Win / Tie / Loss
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_WIN_TIE_LOSS} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Percentage of rows where Experiment B scores higher, ties, or scores lower than Experiment A
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonWinTieLossChart comparison={comparison} />
            </CardContent>
          </Card>

          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Paired Scatter
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_PAIRED_SCATTER} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Per-row paired metric scores with Experiment A on x-axis and Experiment B on y-axis
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ComparisonScatterChart
              comparison={comparison}
              experimentAName={experimentAName}
              experimentBName={experimentBName}
              projectId={projectId}
              evaluationId={evaluationId}
              scoreId={scoreId}
              experimentIdA={experimentIdA}
              experimentIdB={experimentIdB} />

            </CardContent>
          </Card>

          {}
          {(statisticsA || statisticsB) &&
        <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
              <CardHeader>
                <CardTitle className="flex items-center gap-1">
                  Score Distribution Overlay
                  <InfoButton content={COMPARISON_TOOLTIPS.CHART_DISTRIBUTION_OVERLAY} iconSize="sm" />
                </CardTitle>
                <CardDescription>
                  Overlaid distributions of metric scores for Experiment A and Experiment B
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ComparisonDistributionChart
              statisticsA={statisticsA}
              statisticsB={statisticsB}
              experimentAName={experimentAName}
              experimentBName={experimentBName}
              projectId={projectId}
              evaluationId={evaluationId}
              scoreId={scoreId}
              experimentIdA={experimentIdA}
              experimentIdB={experimentIdB} />

              </CardContent>
            </Card>
        }
        </>
      }

      {}
      {isNominal &&
      <>
          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Distribution Comparison
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_NOMINAL_DISTRIBUTION} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Side-by-side comparison of category proportions between Experiment A and Experiment B
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NominalDistributionComparisonChart
              comparison={comparison}
              statisticsA={statisticsA}
              statisticsB={statisticsB}
              experimentAName={experimentAName}
              experimentBName={experimentBName} />

            </CardContent>
          </Card>

          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Category Delta
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_CATEGORY_DELTA} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Change in proportion for each category (Experiment B - Experiment A) with confidence intervals
              </CardDescription>
            </CardHeader>
            <CardContent>
              <NominalCategoryDeltaChart comparison={comparison} />
            </CardContent>
          </Card>
        </>
      }

      {}
      {isOrdinal &&
      <>
          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Ordered Distribution Comparison
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_ORDINAL_DISTRIBUTION} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Category proportions sorted by rank order, showing distribution shift between Experiment A and Experiment B
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdinalDistributionComparisonChart
              comparison={comparison}
              statisticsA={statisticsA}
              statisticsB={statisticsB}
              experimentAName={experimentAName}
              experimentBName={experimentBName}
              projectId={projectId}
              scoreId={scoreId} />

            </CardContent>
          </Card>

          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Pass-Rate Comparison
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_PASS_RATE} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Comparison of pass-rate (proportion of results in acceptable categories) between experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdinalPassRateChart
              comparison={comparison}
              projectId={projectId}
              scoreId={scoreId} />

            </CardContent>
          </Card>

          {}
          <Card className="lg:col-span-2 bg-[#F9F8FD] dark:bg-[#151515]">
            <CardHeader>
              <CardTitle className="flex items-center gap-1">
                Tail-Risk Comparison
                <InfoButton content={COMPARISON_TOOLTIPS.CHART_TAIL_RISK} iconSize="sm" />
              </CardTitle>
              <CardDescription>
                Comparison of tail-risk (proportion of results below threshold rank) between experiments
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OrdinalTailRiskChart
              comparison={comparison}
              projectId={projectId}
              scoreId={scoreId} />

            </CardContent>
          </Card>
        </>
      }
    </div>);

}