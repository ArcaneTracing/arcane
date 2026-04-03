"use client";

import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";
import { ExperimentComparisonResponse } from "@/types/evaluations";
import { useExperimentScoresQuery } from "@/hooks/evaluations/use-evaluations-query";
import { Loader2 } from "lucide-react";

interface ScatterTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: {x: number;y: number;};}>;
}

function ScatterTooltipContent({ active, payload }: Readonly<ScatterTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const point = payload[0]?.payload;
  if (!point) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Experiment A</span>
          <span className="font-medium text-foreground">{Number(point.x).toFixed(4)}</span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">Experiment B</span>
          <span className="font-medium text-foreground">{Number(point.y).toFixed(4)}</span>
        </div>
      </div>
    </div>);

}

interface ComparisonScatterChartProps {
  comparison: ExperimentComparisonResponse;
  experimentAName: string;
  experimentBName: string;
  projectId: string;
  evaluationId: string;
  scoreId: string;
  experimentIdA: string;
  experimentIdB: string;
}

export function ComparisonScatterChart({
  comparison,
  experimentAName: _experimentAName,
  experimentBName: _experimentBName,
  projectId,
  evaluationId,
  scoreId,
  experimentIdA,
  experimentIdB
}: Readonly<ComparisonScatterChartProps>) {
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

  }


  const pairedData: Array<{x: number;y: number;}> = [];
  if (scoresA?.scoreResults && scoresB?.scoreResults) {

    const scoresAByRow = new Map<string, number>();
    const scoresBByRow = new Map<string, number>();

    scoresA.scoreResults.
    filter((sr) => sr.scoreId === scoreId && sr.value !== null && sr.datasetRowId).
    forEach((sr) => {
      const value = typeof sr.value === 'number' ? sr.value : Number.parseFloat(String(sr.value));
      if (!Number.isNaN(value) && sr.datasetRowId) {
        scoresAByRow.set(sr.datasetRowId, value);
      }
    });

    scoresB.scoreResults.
    filter((sr) => sr.scoreId === scoreId && sr.value !== null && sr.datasetRowId).
    forEach((sr) => {
      const value = typeof sr.value === 'number' ? sr.value : Number.parseFloat(String(sr.value));
      if (!Number.isNaN(value) && sr.datasetRowId) {
        scoresBByRow.set(sr.datasetRowId, value);
      }
    });


    scoresAByRow.forEach((valueA, rowId) => {
      const valueB = scoresBByRow.get(rowId);
      if (valueB !== undefined) {
        pairedData.push({ x: valueA, y: valueB });
      }
    });
  }

  if (pairedData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No paired data available for scatter plot
      </div>);

  }


  const allValues = [...pairedData.map((d) => d.x), ...pairedData.map((d) => d.y)];
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);
  const padding = (maxValue - minValue) * 0.1;

  return (
    <ResponsiveContainer width="100%" height={400}>
      <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis
          type="number"
          dataKey="x"
          name={experimentALabel}
          domain={[minValue - padding, maxValue + padding]}
          tickFormatter={(value) => Number(value).toFixed(4)}
          label={{ value: experimentALabel, position: 'insideBottom', offset: -5 }} />

        <YAxis
          type="number"
          dataKey="y"
          name={experimentBLabel}
          domain={[minValue - padding, maxValue + padding]}
          tickFormatter={(value) => Number(value).toFixed(4)}
          label={{ value: experimentBLabel, angle: -90, position: 'insideLeft' }} />

        <Tooltip cursor={false} content={ScatterTooltipContent} />
        <ReferenceLine
          y={minValue - padding}
          x={minValue - padding}
          stroke="#666"
          strokeDasharray="3 3" />

        <ReferenceLine
          y={maxValue + padding}
          x={maxValue + padding}
          stroke="#666"
          strokeDasharray="3 3" />

        {}
        <ReferenceLine
          segment={[{ x: minValue - padding, y: minValue - padding }, { x: maxValue + padding, y: maxValue + padding }]}
          stroke="#666"
          strokeDasharray="3 3" />

        <Scatter name="Paired Scores" data={pairedData} fill="#8884d8" />
      </ScatterChart>
    </ResponsiveContainer>);

}