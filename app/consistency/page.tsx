"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useKindCurveStore } from "@/lib/store";
import {
  runEngine,
  runComparison,
  DEFAULT_ENGINE_PARAMS,
  DEFAULT_IMPACT_PROFILES,
  type CharityImpactProfile,
  type EngineParams,
} from "@/lib/compoundingEngine";
import { BackButton, TealButton, SecondaryButton, Card, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer),
const ResponsiveContainer = dynamic(
  () => import("recharts").then((m) => m.ResponsiveContainer) as any,
  { ssr: false }
);
const LineChart = dynamic(
  () => import("recharts").then((m) => m.LineChart) as any,
  { ssr: false }
);
const Line = dynamic(
  () => import("recharts").then((m) => m.Line) as any,
  { ssr: false }
);
const XAxis = dynamic(
  () => import("recharts").then((m) => m.XAxis) as any,
  { ssr: false }
);
const YAxis = dynamic(
  () => import("recharts").then((m) => m.YAxis) as any,
  { ssr: false }
);
const CartesianGrid = dynamic(
  () => import("recharts").then((m) => m.CartesianGrid) as any,
  { ssr: false }
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip) as any,
  { ssr: false }
);
);
const Tooltip = dynamic(
  () => import("recharts").then((m) => m.Tooltip),
  { ssr: false }
);

export default function ConsistencyPage() {
  const router = useRouter();
  const { monthlyGift, charities } = useKindCurveStore();

  // Build charity profiles from Zustand state + default impact data
  const charityProfiles: CharityImpactProfile[] = useMemo(
    () =>
      charities.map((c) => {
        const defaults = DEFAULT_IMPACT_PROFILES[c.name];
        return {
          charity_id: c.charity_id || c.name,
          name: c.name,
          allocation_pct: c.allocation,
          impact_per_pound: defaults?.impact_per_pound || 0.1,
          impact_unit: defaults?.impact_unit || "impact units",
        };
      }),
    [charities]
  );

  // Run the real engine
  const engineResult = useMemo(() => {
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: monthlyGift,
      duration_months: 120,
    };
    return runEngine(params, charityProfiles);
  }, [monthlyGift, charityProfiles]);

  // Run comparison for chart
  const comparison = useMemo(() => {
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: monthlyGift,
      duration_months: 120,
    };
    return runComparison(params, charityProfiles);
  }, [monthlyGift, charityProfiles]);

  // Chart data: yearly cumulative impact comparison
  const chartData = useMemo(() => {
    return engineResult.yearly_summaries.map((ys, i) => {
      // Get irregular cumulative at end of each year
      const irregularEndMonth = comparison.irregular[(i + 1) * 12 - 1];
      return {
        year: `Year ${ys.year}`,
        kindCurve: Math.round(ys.impact),
        irregular: irregularEndMonth
          ? Math.round(
              comparison.irregular
                .filter((m) => m.month > i * 12 && m.month <= (i + 1) * 12)
                .reduce((s, m) => s + (m.active ? m.donation * 0.1 : 0), 0)
            )
          : 0,
      };
    });
  }, [engineResult, comparison]);

  // Top 3 charity impact projections for the "concrete outcomes" section
  const topImpacts = useMemo(() => {
    return engineResult.charity_totals
      .filter((ct) => ct.total_impact > 0)
      .sort((a, b) => b.total_impact - a.total_impact)
      .slice(0, 3);
  }, [engineResult]);

  // 5-year snapshot
  const fiveYearSummary = engineResult.yearly_summaries[4]; // Year 5
  const oneYearSummary = engineResult.yearly_summaries[0]; // Year 1

  return (
    <PageShell>
      <BackButton href="/pie" />
      <ProgressBar currentStep={5} />

      <h1 className="text-[26px] font-bold mt-3 mb-2">The power of consistency</h1>
      <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mb-6">
        Your monthly kindness compounds into significantly more long-term impact than sporadic giving.
      </p>

      {/* Main comparison chart */}
      <Card className="mb-3 !p-5">
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-2">
          Projected impact over 10 years
        </p>
        <div className="flex gap-4 mb-3">
          <span className="flex items-center gap-1.5 text-xs">
            <span className="w-2.5 h-2.5 rounded-full bg-gradient-to-r from-kc-teal to-kc-green inline-block" />
            Kind Curve (consistent)
          </span>
          <span className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
            <span className="w-2.5 h-2.5 rounded-full bg-gray-300 dark:bg-gray-600 inline-block" />
            Irregular giving
          </span>
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <CartesianGrid
              strokeDasharray="3 3"
              className="stroke-gray-200 dark:stroke-gray-700"
            />
            <XAxis
              dataKey="year"
              className="text-[11px]"
              stroke="#9ca3af"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
            />
            <YAxis
              className="text-[11px]"
              stroke="#9ca3af"
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              label={{
                value: "Impact",
                angle: -90,
                position: "insideLeft",
                fill: "#9ca3af",
                fontSize: 11,
              }}
            />
            <Tooltip
              contentStyle={{
                borderRadius: 12,
                fontSize: 13,
                backgroundColor: "rgba(255,255,255,0.95)",
              }}
            />
            <defs>
              <linearGradient id="kcGrad" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#267D91" />
                <stop offset="100%" stopColor="#4BB78F" />
              </linearGradient>
            </defs>
            <Line
              type="monotone"
              dataKey="kindCurve"
              stroke="url(#kcGrad)"
              strokeWidth={3}
              dot={false}
              name="Kind Curve"
            />
            <Line
              type="monotone"
              dataKey="irregular"
              stroke="#d1d5db"
              strokeWidth={2}
              strokeDasharray="5 5"
              dot={false}
              name="Irregular"
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <p className="text-center text-gray-400 dark:text-gray-500 text-[13px] mb-5">
        Based on your £{monthlyGift}/month Kind Curve
      </p>

      {/* Concrete outcomes — powered by real engine */}
      {topImpacts.length > 0 && (
        <Card className="mb-3 !p-5 !bg-gradient-to-br !from-kc-teal/[0.06] !to-kc-cyan/[0.03] dark:!from-kc-teal/15 dark:!to-kc-cyan/8 !border-kc-teal/[0.12] dark:!border-kc-teal/25">
          <h4 className="text-[15px] font-semibold mb-3">
            In 5 years, your Kind Curve is projected to:
          </h4>
          <div className="space-y-2.5">
            {topImpacts.map((ct) => {
              // Get 5-year impact (months 1–60)
              const fiveYearImpact = engineResult.months
                .filter((m) => m.month <= 60)
                .reduce(
                  (sum, m) =>
                    sum +
                    (m.charity_impacts.find((ci) => ci.charity_id === ct.charity_id)
                      ?.impact || 0),
                  0
                );
              return (
                <div
                  key={ct.charity_id}
                  className="flex items-baseline justify-between"
                >
                  <span className="text-sm text-gray-600 dark:text-gray-300">
                    {ct.name}
                  </span>
                  <span className="text-sm font-semibold text-kc-teal dark:text-kc-cyan">
                    ~{Math.round(fiveYearImpact)} {ct.impact_unit}
                  </span>
                </div>
              );
            })}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
            Estimates based on published charity impact data. Not a guarantee.
          </p>
        </Card>
      )}

      {/* IEM teaser */}
      {fiveYearSummary && (
        <Card className="mb-3 !p-5">
          <h4 className="text-kc-teal dark:text-kc-cyan text-[15px] font-semibold mb-1.5">
            Consistency creates more from less
          </h4>
          <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed">
            By year 5, every £1 you give consistently is projected to generate{" "}
            <span className="text-kc-teal dark:text-kc-cyan font-semibold">
              £{fiveYearSummary.iem.toFixed(2)}
            </span>{" "}
            of impact. That&apos;s because charities operate more efficiently with
            predictable income, and your giving creates ripple effects over time.
          </p>
        </Card>
      )}

      <Card className="mb-3 !p-5">
        <h4 className="text-kc-teal dark:text-kc-cyan text-[15px] font-semibold mb-1.5">
          Your impact compounds
        </h4>
        <p className="text-gray-500 dark:text-gray-400 text-[13px] leading-relaxed">
          Like compound interest, consistent giving builds momentum. Your{" "}
          <span className="font-medium text-gray-700 dark:text-gray-200">
            £{monthlyGift}/month
          </span>{" "}
          becomes{" "}
          <span className="font-semibold text-kc-teal dark:text-kc-cyan">
            £{oneYearSummary ? Math.round(oneYearSummary.donated) : monthlyGift * 12}
          </span>{" "}
          in year 1 and{" "}
          <span className="font-semibold text-kc-teal dark:text-kc-cyan">
            £{Math.round(engineResult.total_donated)}
          </span>{" "}
          over 10 years — with impact that grows faster than the money.
        </p>
      </Card>

      <div className="flex gap-2.5 mt-6 mb-4">
        <TealButton onClick={() => router.push("/commit")}>
          Confirm your Kind Curve
        </TealButton>
      </div>
      <SecondaryButton onClick={() => router.push("/pie")}>
        Adjust my portfolio
      </SecondaryButton>
    </PageShell>
  );
}
