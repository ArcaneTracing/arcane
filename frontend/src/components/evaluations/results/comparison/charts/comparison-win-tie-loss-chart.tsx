"use client";
import * as React from "react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { ExperimentComparisonResponse } from "@/types/evaluations";
import { isNumericComparison } from "@/lib/evaluations/statistics-helpers";
interface ComparisonWinTieLossChartProps {
  comparison: ExperimentComparisonResponse;
}
const COLORS = {
  win: "#22c55e",
  tie: "#6b7280",
  loss: "#ef4444"
};
interface WinTieLossTooltipContentProps {
  active?: boolean;
  payload?: Array<{payload?: {name: string;value: number;};}>;
}
function WinTieLossTooltipContent({ active, payload }: Readonly<WinTieLossTooltipContentProps>) {
  if (!active || !payload?.length) return null;
  const p = payload[0].payload;
  if (!p) return null;
  return (
    <div className="rounded-lg border bg-background px-3 py-2 shadow-md">
      <div className="grid gap-1 text-sm">
        <div className="flex justify-between gap-4">
          <span className="text-muted-foreground">{p.name}</span>
          <span className="font-medium text-foreground">{Number(p.value).toFixed(1)}%</span>
        </div>
      </div>
    </div>);
}
export function ComparisonWinTieLossChart({ comparison }: Readonly<ComparisonWinTieLossChartProps>) {
  const gradientId = React.useId().replaceAll(":", "");
  if (!isNumericComparison(comparison)) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        Win/Tie/Loss chart is only available for numeric comparisons
      </div>);
  }
  const num = comparison.numeric;
  if (num.win_rate === null || num.tie_rate === null || num.loss_rate === null) {
    return (
      <div className="flex items-center justify-center h-64 text-sm text-muted-foreground">
        No data available
      </div>);
  }
  const fillWin = `fillWinTieLossWin-${gradientId}`;
  const fillTie = `fillWinTieLossTie-${gradientId}`;
  const fillLoss = `fillWinTieLossLoss-${gradientId}`;
  const strokeWin = `strokeWinTieLossWin-${gradientId}`;
  const strokeTie = `strokeWinTieLossTie-${gradientId}`;
  const strokeLoss = `strokeWinTieLossLoss-${gradientId}`;
  const data = [
  { name: "Win", value: num.win_rate * 100, color: COLORS.win, fill: fillWin, stroke: strokeWin },
  { name: "Tie", value: num.tie_rate * 100, color: COLORS.tie, fill: fillTie, stroke: strokeTie },
  { name: "Loss", value: num.loss_rate * 100, color: COLORS.loss, fill: fillLoss, stroke: strokeLoss }];

  const renderLegend = (props: { payload?: Array<{ value: string; color: string; payload?: { name: string; value: number } }> }) => {
    const { payload } = props;
    if (!payload?.length) return null;
    return (
      <ul className="flex flex-wrap justify-center gap-4 mt-2">
        {payload.map((entry) => {
          const p = entry.payload ?? data.find((d) => d.name === entry.value);
          const pct = p ? Number(p.value).toFixed(1) : "";
          return (
            <li key={entry.value} className="flex items-center gap-2">
              <span
                className="inline-block w-3 h-3 rounded-sm shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-sm text-muted-foreground">
                {entry.value}: <span className="font-medium text-foreground">{pct}%</span>
              </span>
            </li>
          );
        })}
      </ul>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
          <defs>
          <radialGradient id={fillWin} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.win} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.win} stopOpacity={0.05} />
          </radialGradient>
          <radialGradient id={fillTie} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.tie} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.tie} stopOpacity={0.05} />
          </radialGradient>
          <radialGradient id={fillLoss} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.loss} stopOpacity={0.4} />
            <stop offset="95%" stopColor={COLORS.loss} stopOpacity={0.05} />
          </radialGradient>
          <radialGradient id={strokeWin} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.win} stopOpacity={0.9} />
            <stop offset="95%" stopColor={COLORS.win} stopOpacity={0.2} />
          </radialGradient>
          <radialGradient id={strokeTie} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.tie} stopOpacity={0.9} />
            <stop offset="95%" stopColor={COLORS.tie} stopOpacity={0.2} />
          </radialGradient>
          <radialGradient id={strokeLoss} cx="50%" cy="50%" r="50%" gradientUnits="userSpaceOnUse">
            <stop offset="5%" stopColor={COLORS.loss} stopOpacity={0.9} />
            <stop offset="95%" stopColor={COLORS.loss} stopOpacity={0.2} />
          </radialGradient>
        </defs>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius={80}
          dataKey="value">
          {data.map((entry) =>
          <Cell key={`cell-${entry.name}`} fill={`url(#${entry.fill})`} stroke={`url(#${entry.stroke})`} />
          )}
        </Pie>
        <Tooltip cursor={false}
          content={<WinTieLossTooltipContent />}
        />
        <Legend content={renderLegend} />
      </PieChart>
    </ResponsiveContainer>
  );
}