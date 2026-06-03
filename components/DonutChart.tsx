"use client";

/**
 * DonutChart — the portfolio allocation donut on the pie page.
 *
 * Same blank-chart-trap rule as ImpactChart: the whole chart is in ONE client
 * component importing recharts normally, lazy-loaded as a single unit by the
 * page. Do not split the recharts sub-components into separate dynamic imports.
 */

import { ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

export interface DonutDatum {
  name: string;
  value: number;
  color: string;
}

export default function DonutChart({
  data,
  size = 240,
}: {
  data: DonutDatum[];
  size?: number;
}) {
  return (
    <ResponsiveContainer width={size} height={size}>
      <PieChart>
        <Pie
          data={data}
          innerRadius={size * 0.29}
          outerRadius={size * 0.42}
          paddingAngle={2}
          dataKey="value"
          stroke="none"
        >
          {data.map((d, i) => (
            <Cell key={i} fill={d.color} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}
