"use client";

/**
 * ImpactChart — the consistency-page line chart.
 *
 * IMPORTANT (the blank-chart trap): the whole chart lives in ONE client
 * component that imports recharts normally. Recharts wires parents to children
 * via React.cloneElement, which breaks if each sub-component is its own lazy
 * `dynamic()` boundary — the chart then renders as a blank box. Lazy-load THIS
 * component instead (see app/consistency/page.tsx). Never go back to
 * per-subcomponent dynamic imports.
 */

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export interface ImpactChartDatum {
  year: string | number;
  kindCurve: number;
  irregular: number;
}

export default function ImpactChart({
  data,
  height = 200,
}: {
  data: ImpactChartDatum[];
  height?: number;
}) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data} margin={{ top: 5, right: 8, left: -8, bottom: 0 }}>
        <defs>
          <linearGradient id="kcGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#267D91" />
            <stop offset="100%" stopColor="#4BB78F" />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" strokeOpacity={0.5} />
        <XAxis
          dataKey="year"
          stroke="#9ca3af"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
        />
        <YAxis
          stroke="#9ca3af"
          tick={{ fontSize: 10, fill: "#9ca3af" }}
          tickLine={false}
          width={44}
        />
        <Tooltip
          contentStyle={{
            borderRadius: 12,
            fontSize: 13,
            border: "1px solid #e5e7eb",
            backgroundColor: "rgba(255,255,255,0.97)",
          }}
          formatter={(value: number, name: string) => [
            Math.round(value).toLocaleString(),
            name,
          ]}
        />
        <Line
          type="monotone"
          dataKey="kindCurve"
          name="Kind Curve"
          stroke="url(#kcGrad)"
          strokeWidth={3}
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="irregular"
          name="Irregular giving"
          stroke="#d1d5db"
          strokeWidth={2}
          strokeDasharray="5 5"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
