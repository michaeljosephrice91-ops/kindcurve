"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Check, Lock, CreditCard } from "lucide-react";
import { useKindCurveStore } from "@/lib/store";
import { runEngine, DEFAULT_ENGINE_PARAMS, type EngineParams } from "@/lib/compoundingEngine";
import { buildCharityProfiles } from "@/lib/demoData";
import { THEME_LABELS } from "@/lib/constants";
import { KCLogo } from "@/components/KCLogo";
import { BackButton, TealButton, Card, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

export default function CommitPage() {
  const router = useRouter();
  const { selectedThemes, charities, monthlyGift } = useKindCurveStore();
  const [giftAid, setGiftAid] = useState(false);
  const [processing, setProcessing] = useState(false);

  const effectiveMonthly = giftAid ? monthlyGift * 1.25 : monthlyGift;

  // Engine-ready profiles from the user's portfolio + demo impact data.
  const charityProfiles = useMemo(
    () => buildCharityProfiles(charities),
    [charities]
  );

  // Year-1 projected impact preview (top 3 charities).
  const yearOneImpact = useMemo(() => {
    if (charityProfiles.length === 0) return [];
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: effectiveMonthly,
      duration_months: 12,
      gift_aid: false, // already folded into effectiveMonthly
    };
    return runEngine(params, charityProfiles)
      .charity_totals.sort((a, b) => b.total_impact - a.total_impact)
      .slice(0, 3);
  }, [effectiveMonthly, charityProfiles]);

  const handleConfirm = () => {
    // Simulated payment only — no money moves, no backend call.
    setProcessing(true);
    setTimeout(() => {
      router.push("/success");
    }, 1600);
  };

  return (
    <PageShell>
      <BackButton href="/consistency" />
      <ProgressBar currentStep={6} />

      <div className="text-center mt-3 mb-5">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <KCLogo size={50} className="mx-auto mb-3" />
        </motion.div>
        <h1 className="text-[26px] font-bold mb-1">Confirm your Kind Curve</h1>
        <p className="text-gray-500 dark:text-gray-400 text-[15px]">
          Review your portfolio and set up monthly giving.
        </p>
      </div>

      {/* Demonstration banner — unmissable, up top */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-4 rounded-2xl border border-amber-300/70 dark:border-amber-700/60 bg-amber-50 dark:bg-amber-900/15 px-4 py-3"
      >
        <p className="text-[13px] text-amber-800 dark:text-amber-300 leading-relaxed">
          <span className="font-semibold">Demonstration only</span> — no payment
          is taken and no money moves. This screen simulates the giving setup so
          you can see the full journey.
        </p>
      </motion.div>

      {/* Portfolio summary */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
        <Card className="mb-3">
          <div className="flex justify-between py-2 border-b border-[#f0ebe0] dark:border-kc-border">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Monthly gift</span>
            <span className="text-kc-teal dark:text-kc-cyan text-base font-bold">£{monthlyGift}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[#f0ebe0] dark:border-kc-border">
            <span className="text-gray-500 dark:text-gray-400 text-sm">Charities</span>
            <span className="font-semibold">{charities.length}</span>
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

      {/* Giving breakdown */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
        <Card className="mb-3">
          <h3 className="text-[15px] font-semibold mb-3">Your giving breakdown</h3>
          {charities.map((c, i) => (
            <div
              key={c.name}
              className={`flex justify-between py-1.5 text-sm ${
                i < charities.length - 1
                  ? "border-b border-[#f0ebe0] dark:border-kc-border"
                  : ""
              }`}
            >
              <span className="text-gray-600 dark:text-gray-300">{c.name}</span>
              <span className="text-kc-teal dark:text-kc-cyan font-semibold">
                £{((c.allocation / 100) * monthlyGift).toFixed(2)}/mo
              </span>
            </div>
          ))}
        </Card>
      </motion.div>

      {/* Gift Aid (cosmetic) */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
        <Card
          className={`mb-3 !p-5 transition-all ${
            giftAid
              ? "!border-kc-green/40 dark:!border-kc-green/50 !bg-kc-green/[0.04] dark:!bg-kc-green/10"
              : ""
          }`}
        >
          <button onClick={() => setGiftAid(!giftAid)} className="w-full text-left">
            <div className="flex items-start gap-3">
              <div
                className={`w-6 h-6 rounded-md border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                  giftAid
                    ? "bg-kc-green border-kc-green"
                    : "border-gray-300 dark:border-gray-600"
                }`}
              >
                {giftAid && <Check size={14} className="text-white" />}
              </div>
              <div>
                <p className="font-semibold text-[15px] mb-1">
                  Add Gift Aid <span className="text-kc-green font-bold">+25%</span>
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  UK taxpayers can add 25% at no extra cost. In the demo this just
                  shows how Gift Aid would lift your impact.
                </p>
                {giftAid && (
                  <p className="text-[13px] text-kc-green font-semibold mt-2">
                    Your £{monthlyGift}/month would become £{effectiveMonthly.toFixed(2)}/month
                    of impact — about £{(effectiveMonthly * 12).toFixed(0)} in year 1.
                  </p>
                )}
              </div>
            </div>
          </button>
        </Card>
      </motion.div>

      {/* Year 1 projected impact */}
      {yearOneImpact.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
          <Card className="mb-3 !p-5 !bg-gradient-to-br !from-kc-teal/[0.06] !to-kc-cyan/[0.03] dark:!from-kc-teal/15 dark:!to-kc-cyan/8 !border-kc-teal/[0.12] dark:!border-kc-teal/25">
            <h4 className="text-[14px] font-semibold mb-2 text-gray-600 dark:text-gray-300">
              Your projected year 1 impact
            </h4>
            <div className="space-y-1.5">
              {yearOneImpact.map((ct) => (
                <div key={ct.charity_id} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">{ct.name}</span>
                  <span className="font-semibold text-kc-teal dark:text-kc-cyan">
                    ~{Math.round(ct.total_impact)} {ct.impact_unit}
                  </span>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-gray-400 dark:text-gray-500 mt-3">
              Illustrative figures — assumed for the demo, not a guarantee.
            </p>
          </Card>
        </motion.div>
      )}

      {/* Inert "payment" surface — visually real, clearly disabled */}
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}>
        <Card className="mb-4 !p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-[15px] font-semibold flex items-center gap-2">
              <CreditCard size={16} className="text-kc-teal dark:text-kc-cyan" />
              Payment details
            </h3>
            <span className="text-[11px] text-gray-400 dark:text-gray-500 flex items-center gap-1">
              <Lock size={11} /> Disabled in demo
            </span>
          </div>
          <div className="space-y-2.5 pointer-events-none select-none opacity-60">
            <div className="h-11 rounded-xl border border-[#e8e4da] dark:border-kc-border flex items-center px-3.5 text-sm text-gray-400 dark:text-gray-500">
              Card number ···· ···· ···· ····
            </div>
            <div className="flex gap-2.5">
              <div className="flex-1 h-11 rounded-xl border border-[#e8e4da] dark:border-kc-border flex items-center px-3.5 text-sm text-gray-400 dark:text-gray-500">
                MM / YY
              </div>
              <div className="flex-1 h-11 rounded-xl border border-[#e8e4da] dark:border-kc-border flex items-center px-3.5 text-sm text-gray-400 dark:text-gray-500">
                CVC
              </div>
            </div>
          </div>
        </Card>
      </motion.div>

      <TealButton onClick={handleConfirm} disabled={processing}>
        {processing ? "Setting up your Kind Curve…" : `Confirm £${monthlyGift}/month giving`}
      </TealButton>

      <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 mt-3 mb-2 flex items-center justify-center gap-1.5">
        <Heart size={12} /> Demonstration only — no money is taken.
      </p>
    </PageShell>
  );
}
