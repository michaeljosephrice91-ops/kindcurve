"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { TrendingUp, RotateCcw, Sparkles, Plus, Minus, Leaf } from "lucide-react";
import { useKindCurveStore } from "@/lib/store";
import {
  runEngine,
  DEFAULT_ENGINE_PARAMS,
  type EngineParams,
  type EngineResult,
} from "@/lib/compoundingEngine";
import { buildCharityProfiles } from "@/lib/demoData";
import { THEME_LABELS } from "@/lib/constants";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, Card, PageShell } from "@/components/ui/shared";

const HORIZON_MONTHS = 120;

/** Build an SVG polyline path from a series of values, normalised to the box. */
function sparkPath(values: number[], width: number, height: number): string {
  if (values.length < 2) return "";
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const span = max - min || 1;
  const stepX = width / (values.length - 1);
  return values
    .map((v, i) => {
      const x = i * stepX;
      const y = height - ((v - min) / span) * height;
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

export default function DashboardPage() {
  const router = useRouter();
  const { monthlyGift, charities, selectedThemes, reset } = useKindCurveStore();
  const [extra, setExtra] = useState(0);

  const charityProfiles = useMemo(
    () => buildCharityProfiles(charities),
    [charities]
  );

  const result: EngineResult | null = useMemo(() => {
    if (charityProfiles.length === 0) return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: monthlyGift,
      duration_months: HORIZON_MONTHS,
    };
    return runEngine(params, charityProfiles);
  }, [monthlyGift, charityProfiles]);

  const whatIfResult: EngineResult | null = useMemo(() => {
    if (charityProfiles.length === 0 || extra === 0) return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: monthlyGift + extra,
      duration_months: HORIZON_MONTHS,
    };
    return runEngine(params, charityProfiles);
  }, [monthlyGift, extra, charityProfiles]);

  // First-year cumulative impact for the sparkline.
  const sparkValues = useMemo(() => {
    if (!result) return [];
    return result.months
      .filter((m) => m.month <= 12)
      .map((m) => m.cumulative_impact);
  }, [result]);

  const impactDeltas = useMemo(() => {
    if (!result || !whatIfResult) return [];
    return result.charity_totals
      .map((ct) => {
        const more =
          whatIfResult.charity_totals.find((w) => w.charity_id === ct.charity_id)
            ?.total_impact || 0;
        return { ...ct, delta: more - ct.total_impact };
      })
      .filter((d) => d.delta > 0)
      .sort((a, b) => b.delta - a.delta);
  }, [result, whatIfResult]);

  const handleNewCurve = () => {
    reset();
    router.push("/onboarding/q1");
  };

  // Empty state — no portfolio in the store yet.
  if (!result) {
    return (
      <PageShell>
        <div className="min-h-screen flex flex-col items-center justify-center text-center">
          <KCLogo size={60} className="mb-6" />
          <h1 className="text-xl font-semibold mb-3">No Kind Curve yet</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mb-6 max-w-[300px]">
            Build your giving portfolio to see your projected impact dashboard.
          </p>
          <TealButton onClick={handleNewCurve}>Build your Kind Curve</TealButton>
        </div>
      </PageShell>
    );
  }

  const fiveYearScore = result.yearly_summaries[4]?.kind_score || 1;
  const tenYearTotal = Math.round(result.total_donated);
  const SPARK_W = 280;
  const SPARK_H = 64;

  return (
    <PageShell>
      <div className="flex items-center justify-between pt-3 pb-1">
        <KCLogo size={36} />
        <button
          onClick={handleNewCurve}
          className="flex items-center gap-1.5 text-gray-400 dark:text-gray-500 text-sm hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
        >
          <RotateCcw size={15} /> Start over
        </button>
      </div>

      <h1 className="text-2xl font-bold mt-4 mb-1">Your impact dashboard</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-5">
        Projected from your £{monthlyGift}/month Kind Curve.
      </p>

      {/* Key stats grid */}
      <div className="grid grid-cols-2 gap-2.5 mb-4">
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card className="!p-5 !bg-gradient-to-br !from-kc-teal/[0.08] !to-kc-cyan/[0.04] dark:!from-kc-teal/20 dark:!to-kc-cyan/10 !border-kc-teal/[0.15] dark:!border-kc-teal/30">
            <div className="text-[28px] font-bold text-kc-teal dark:text-kc-cyan">£{monthlyGift}</div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">Monthly commitment</div>
          </Card>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card className="!p-5">
            <div className="text-[28px] font-bold">{charities.length}</div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">Charities</div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card className="!p-5 !border-kc-purple/20 dark:!border-kc-purple/30">
            <div className="flex items-center gap-1.5">
              <Sparkles size={16} className="text-kc-purple" />
              <div className="text-[28px] font-bold text-kc-purple">
                {fiveYearScore.toFixed(2)}×
              </div>
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Kind Score (5-yr)
            </div>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="!p-5">
            <div className="text-[28px] font-bold text-kc-green">
              £{tenYearTotal.toLocaleString()}
            </div>
            <div className="text-[13px] text-gray-500 dark:text-gray-400 mt-0.5">
              Given over 10 years
            </div>
          </Card>
        </motion.div>
      </div>

      {/* Kind Score explanation */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="mb-4 !p-4 !bg-kc-purple/[0.04] dark:!bg-kc-purple/10 !border-kc-purple/10 dark:!border-kc-purple/20">
          <p className="text-[13px] text-gray-600 dark:text-gray-300 leading-relaxed">
            Your <span className="font-semibold text-kc-purple">Kind Score</span>{" "}
            shows how much further your giving goes when it&apos;s consistent. By
            year 5, your steady £{monthlyGift}/month is projected to generate{" "}
            <span className="font-bold text-kc-purple">{fiveYearScore.toFixed(2)}×</span>{" "}
            the impact of giving the same money sporadically.
          </p>
        </Card>
      </motion.div>

      {/* Inline SVG sparkline — first-year cumulative impact */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}>
        <Card className="mb-4 !p-5">
          <div className="flex justify-between items-center mb-3">
            <h3 className="text-[15px] font-semibold">Your Kind Curve</h3>
            <TrendingUp size={18} className="text-kc-green" />
          </div>
          <svg
            viewBox={`0 0 ${SPARK_W} ${SPARK_H}`}
            width="100%"
            height={SPARK_H}
            preserveAspectRatio="none"
            className="overflow-visible"
          >
            <defs>
              <linearGradient id="dashSpark" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22d3ee" stopOpacity={0.28} />
                <stop offset="100%" stopColor="#22d3ee" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            {sparkValues.length > 1 && (
              <>
                <path
                  d={`${sparkPath(sparkValues, SPARK_W, SPARK_H)} L${SPARK_W},${SPARK_H} L0,${SPARK_H} Z`}
                  fill="url(#dashSpark)"
                  stroke="none"
                />
                <path
                  d={sparkPath(sparkValues, SPARK_W, SPARK_H)}
                  fill="none"
                  stroke="#22d3ee"
                  strokeWidth={2}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  vectorEffect="non-scaling-stroke"
                />
              </>
            )}
          </svg>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
            £{(monthlyGift * 12).toLocaleString()} in year 1 · £
            {tenYearTotal.toLocaleString()} over 10 years
          </p>
        </Card>
      </motion.div>

      {/* "Give a little more" — numeric what-if (no chart) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}>
        <Card className="mb-4 !p-5 !border-kc-green/20 dark:!border-kc-green/30">
          <h3 className="text-[15px] font-semibold mb-3">What if you gave a little more?</h3>
          <div className="flex items-center justify-center gap-4 mb-2">
            <button
              onClick={() => setExtra((p) => Math.max(0, p - 5))}
              disabled={extra <= 0}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-30"
            >
              <Minus size={16} />
            </button>
            <div className="text-center min-w-[130px]">
              <div className="text-[13px] text-gray-400 dark:text-gray-500">Extra per month</div>
              <div className="text-[32px] font-bold text-kc-green leading-tight">+£{extra}</div>
              <div className="text-[13px] text-gray-400 dark:text-gray-500">
                £{monthlyGift + extra}/month total
              </div>
            </div>
            <button
              onClick={() => setExtra((p) => Math.min(100, p + 5))}
              className="w-10 h-10 rounded-full border border-gray-200 dark:border-gray-600 flex items-center justify-center transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
            >
              <Plus size={16} />
            </button>
          </div>

          {extra > 0 && impactDeltas.length > 0 && (
            <div className="mt-4 pt-3 border-t border-[#f0ebe0] dark:border-kc-border">
              <p className="text-[13px] font-semibold mb-2.5 text-kc-green">
                +£{extra}/month would add over 10 years:
              </p>
              <div className="space-y-1.5">
                {impactDeltas.slice(0, 4).map((d) => (
                  <div key={d.charity_id} className="flex justify-between text-sm">
                    <span className="text-gray-500 dark:text-gray-400 truncate mr-3">{d.name}</span>
                    <span className="font-semibold text-kc-green whitespace-nowrap">
                      +{Math.round(d.delta)} {d.impact_unit}
                    </span>
                  </div>
                ))}
              </div>
              <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-2.5">
                That&apos;s about £{(extra / 4.33).toFixed(2)} a week.
              </p>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Concrete projected outcomes (10 years) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
        <Card className="mb-4 !p-5">
          <h3 className="text-[15px] font-semibold mb-3">Projected impact (10 years)</h3>
          <div className="space-y-2">
            {result.charity_totals
              .slice()
              .sort((a, b) => b.total_impact - a.total_impact)
              .map((ct) => (
                <div key={ct.charity_id} className="flex items-center justify-between py-1">
                  <span className="text-sm text-gray-600 dark:text-gray-300 truncate mr-3">{ct.name}</span>
                  <span className="text-sm font-semibold text-kc-teal dark:text-kc-cyan whitespace-nowrap">
                    ~{Math.round(ct.total_impact).toLocaleString()} {ct.impact_unit}
                  </span>
                </div>
              ))}
          </div>
          <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3 border-t border-[#f0ebe0] dark:border-kc-border pt-2">
            Illustrative figures — assumed for the demo, not a guarantee of outcomes.
          </p>
        </Card>
      </motion.div>

      {/* Charities list */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.65 }}>
        <Card className="mb-4">
          <h3 className="text-[15px] font-semibold mb-3.5">Your charities</h3>
          {charities.map((c, i) => (
            <div
              key={c.name}
              className={`flex items-center justify-between py-2.5 ${
                i < charities.length - 1 ? "border-b border-[#f0ebe0] dark:border-kc-border" : ""
              }`}
            >
              <div>
                <p className="text-sm font-medium">{c.name}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500">
                  {c.allocation.toFixed(1)}% · £{((c.allocation / 100) * monthlyGift).toFixed(2)}/month
                </p>
              </div>
            </div>
          ))}
          {selectedThemes.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-3.5 pt-3 border-t border-[#f0ebe0] dark:border-kc-border">
              {selectedThemes.map((t) => (
                <span
                  key={t}
                  className="px-3 py-1 rounded-full border border-[#e8e4da] dark:border-kc-border text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-kc-border"
                >
                  {THEME_LABELS[t] || t}
                </span>
              ))}
            </div>
          )}
        </Card>
      </motion.div>

      {/* Why consistency matters */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}>
        <Card className="mb-4 !p-4">
          <div className="flex items-start gap-3">
            <Leaf size={20} className="text-kc-green mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-[13px] font-semibold mb-1">Why consistency matters</p>
              <p className="text-[12px] text-gray-500 dark:text-gray-400 leading-relaxed">
                Charities operate more efficiently with predictable income, and
                long-term donors become advocates who bring others in. Both effects
                compound — which is why your steady giving is projected to do more
                than the same money given in bursts.
              </p>
            </div>
          </div>
        </Card>
      </motion.div>

      <TealButton onClick={handleNewCurve} className="mb-4">
        Build a new Kind Curve
      </TealButton>
    </PageShell>
  );
}
