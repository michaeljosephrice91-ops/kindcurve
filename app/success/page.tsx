"use client";

import { useEffect, useState, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { CheckCircle, Sparkles } from "lucide-react";
import { useKindCurveStore } from "@/lib/store";
import {
  runEngine,
  DEFAULT_ENGINE_PARAMS,
  DEFAULT_IMPACT_PROFILES,
  type CharityImpactProfile,
  type EngineParams,
} from "@/lib/compoundingEngine";
import { THEME_LABELS } from "@/lib/constants";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, Card, PageShell } from "@/components/ui/shared";

export default function SuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const { selectedThemes, charities, monthlyGift, reset } = useKindCurveStore();
  const [confetti, setConfetti] = useState(false);

  useEffect(() => {
    // Trigger celebration animation
    const timer = setTimeout(() => setConfetti(true), 600);
    return () => clearTimeout(timer);
  }, []);

  // Build charity profiles for engine
  const charityProfiles: CharityImpactProfile[] = useMemo(
    () =>
      charities.map((c: any) => {
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

  // Run engine for first-year and five-year projections
  const projections = useMemo(() => {
    if (charityProfiles.length === 0) return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: monthlyGift,
      duration_months: 60,
    };
    const result = runEngine(params, charityProfiles);
    return {
      yearOne: result.yearly_summaries[0],
      yearFive: result.yearly_summaries[4],
      topImpacts: result.charity_totals
        .sort((a, b) => b.total_impact - a.total_impact)
        .slice(0, 3),
      fiveYearIEM: result.yearly_summaries[4]?.iem || 0,
    };
  }, [monthlyGift, charityProfiles]);

  const handleDashboard = () => {
    router.push("/dashboard");
  };

  return (
    <PageShell>
      <div className="text-center mt-8">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <KCLogo size={60} className="mx-auto" />
        </motion.div>

        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          className="mt-4 mb-3"
        >
          <CheckCircle
            size={52}
            className="text-kc-green mx-auto"
            strokeWidth={1.5}
          />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-[26px] font-bold mb-2"
        >
          Your Kind Curve is live
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-500 dark:text-gray-400 text-[15px] max-w-[340px] mx-auto mb-7 leading-relaxed"
        >
          Your first monthly donation is on its way. You&apos;ve built a giving
          portfolio that will compound over time.
        </motion.p>
      </div>

      {/* Portfolio summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <Card className="mb-3">
          <div className="flex justify-between py-2 border-b border-[#f0ebe0] dark:border-kc-border">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Monthly gift
            </span>
            <span className="text-kc-teal dark:text-kc-cyan text-base font-bold">
              £{monthlyGift}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#f0ebe0] dark:border-kc-border">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Charities supported
            </span>
            <span className="font-semibold">{charities.length}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#f0ebe0] dark:border-kc-border">
            <span className="text-gray-500 dark:text-gray-400 text-sm">
              Year 1 total
            </span>
            <span className="font-semibold text-kc-teal dark:text-kc-cyan">
              £{projections ? Math.round(projections.yearOne.donated) : monthlyGift * 12}
            </span>
          </div>
          {selectedThemes.length > 0 && (
            <div className="pt-3">
              <div className="flex flex-wrap gap-1.5">
                {selectedThemes.map((t: string) => (
                  <span
                    key={t}
                    className="px-3 py-1 rounded-full border border-[#e8e4da] dark:border-kc-border text-xs text-gray-500 dark:text-gray-400 bg-white dark:bg-kc-border"
                  >
                    {THEME_LABELS[t] || t}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      </motion.div>

      {/* Projected concrete impact */}
      {projections && projections.topImpacts.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <Card className="mb-3 !p-5 !bg-gradient-to-br !from-kc-teal/[0.06] !to-kc-cyan/[0.03] dark:!from-kc-teal/15 dark:!to-kc-cyan/8 !border-kc-teal/[0.12] dark:!border-kc-teal/25">
            <div className="flex items-center gap-2 mb-2.5">
              <Sparkles size={16} className="text-kc-teal dark:text-kc-cyan" />
              <h4 className="text-[14px] font-semibold">
                In 5 years, your Kind Curve is projected to:
              </h4>
            </div>
            <div className="space-y-2">
              {projections.topImpacts.map((ct) => (
                <div key={ct.charity_id} className="flex justify-between text-sm">
                  <span className="text-gray-600 dark:text-gray-300">
                    {ct.name}
                  </span>
                  <span className="font-semibold text-kc-teal dark:text-kc-cyan">
                    ~{Math.round(ct.total_impact)} {ct.impact_unit}
                  </span>
                </div>
              ))}
            </div>
            {projections.fiveYearIEM > 1 && (
              <p className="text-[12px] text-gray-500 dark:text-gray-400 mt-3 pt-2 border-t border-kc-teal/10 dark:border-kc-teal/20">
                By year 5, every £1 you give is projected to generate{" "}
                <span className="font-semibold text-kc-teal dark:text-kc-cyan">
                  £{projections.fiveYearIEM.toFixed(2)}
                </span>{" "}
                of impact through consistency.
              </p>
            )}
          </Card>
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
        className="mt-4"
      >
        <TealButton onClick={handleDashboard}>
          View your dashboard
        </TealButton>
      </motion.div>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.0 }}
        className="text-center text-[12px] text-gray-400 dark:text-gray-500 mt-4 mb-2"
      >
        You can adjust your portfolio or cancel at any time from your dashboard.
      </motion.p>
    </PageShell>
  );
}
