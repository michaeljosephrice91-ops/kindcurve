"use client";

import { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Shield, Heart, Check } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
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
import { BackButton, TealButton, Card, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

export default function CommitPage() {
  const router = useRouter();
  const { selectedThemes, charities, monthlyGift, scope } = useKindCurveStore();
  const [giftAid, setGiftAid] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [user, setUser] = useState<any>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Check auth on mount
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      setAuthChecked(true);
    });
  }, []);

  const effectiveMonthly = giftAid ? monthlyGift * 1.25 : monthlyGift;

  // Build charity profiles for engine preview
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

  // Quick engine run for year-1 projections
  const yearOneImpact = useMemo(() => {
    if (charityProfiles.length === 0) return null;
    const params: EngineParams = {
      ...DEFAULT_ENGINE_PARAMS,
      monthly_amount: effectiveMonthly,
      duration_months: 12,
      gift_aid: false, // Already factored into effectiveMonthly
    };
    const result = runEngine(params, charityProfiles);
    return result.charity_totals
      .sort((a, b) => b.total_impact - a.total_impact)
      .slice(0, 3);
  }, [effectiveMonthly, charityProfiles]);

  const handleCommit = async () => {
    setError("");

    // If not logged in, redirect to signup with return path
    if (!user) {
      router.push("/signup?next=/commit");
      return;
    }

    setSaving(true);

    try {
      const supabase = createClient();

      // Deactivate any existing active portfolios
      await supabase
        .from("portfolios")
        .update({ is_active: false })
        .eq("user_id", user.id)
        .eq("is_active", true);

      // Create new portfolio
      const { data: portfolio, error: portError } = await supabase
        .from("portfolios")
        .insert({
          user_id: user.id,
          monthly_amount: monthlyGift,
          selected_themes: selectedThemes,
          scope: scope || "mix",
          is_active: true,
          gift_aid: giftAid,
          payment_status: "pending",
        })
        .select()
        .single();

      if (portError || !portfolio) {
        throw new Error(portError?.message || "Failed to save portfolio");
      }

      // Save allocations
      const allocations = charities
        .filter((c: any) => c.charity_id)
        .map((c: any) => ({
          portfolio_id: portfolio.id,
          charity_id: c.charity_id,
          allocation_pct: c.allocation,
        }));

      if (allocations.length > 0) {
        const { error: allocError } = await supabase
          .from("portfolio_allocations")
          .insert(allocations);

        if (allocError) {
          console.error("Error saving allocations:", allocError);
        }
      }

      // Create Stripe Checkout session
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          monthly_amount: monthlyGift,
          portfolio_id: portfolio.id,
          gift_aid: giftAid,
          charities: charities.map((c: any) => ({ name: c.name })),
        }),
      });

      const data = await res.json();

      if (data.url) {
        // Redirect to Stripe Checkout
        window.location.href = data.url;
      } else {
        throw new Error(data.error || "Failed to create checkout session");
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setSaving(false);
    }
  };

  if (!authChecked) {
    return (
      <PageShell>
        <div className="min-h-screen flex items-center justify-center">
          <p className="text-gray-400 dark:text-gray-500">Loading…</p>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell>
      <BackButton href="/consistency" />
      <ProgressBar currentStep={6} />

      <div className="text-center mt-3 mb-6">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
        >
          <KCLogo size={50} className="mx-auto mb-3" />
        </motion.div>
        <h1 className="text-[26px] font-bold mb-1">Confirm your Kind Curve</h1>
        <p className="text-gray-500 dark:text-gray-400 text-[15px]">
          Review your portfolio and set up monthly giving.
        </p>
      </div>

      {/* Portfolio summary */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
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
              Charities
            </span>
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

      {/* Charity breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <Card className="mb-3">
          <h3 className="text-[15px] font-semibold mb-3">Your giving breakdown</h3>
          {charities.map((c: any, i: number) => (
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

      {/* Gift Aid */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Card
          className={`mb-3 !p-5 cursor-pointer transition-all ${
            giftAid
              ? "!border-kc-green/40 dark:!border-kc-green/50 !bg-kc-green/[0.04] dark:!bg-kc-green/10"
              : ""
          }`}
        >
          <button
            onClick={() => setGiftAid(!giftAid)}
            className="w-full text-left"
          >
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
                  Add Gift Aid{" "}
                  <span className="text-kc-green font-bold">+25%</span>
                </p>
                <p className="text-[13px] text-gray-500 dark:text-gray-400 leading-relaxed">
                  I am a UK taxpayer and I understand that if I pay less Income
                  Tax and/or Capital Gains Tax in the current tax year than the
                  amount of Gift Aid claimed on all my donations, it is my
                  responsibility to pay any difference.
                </p>
                {giftAid && (
                  <p className="text-[13px] text-kc-green font-semibold mt-2">
                    Your £{monthlyGift}/month becomes £{effectiveMonthly.toFixed(2)}/month
                    of impact — that&apos;s £{(effectiveMonthly * 12).toFixed(0)} in year 1.
                  </p>
                )}
              </div>
            </div>
          </button>
        </Card>
      </motion.div>

      {/* Year 1 projected impact */}
      {yearOneImpact && yearOneImpact.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="mb-4 !p-5 !bg-gradient-to-br !from-kc-teal/[0.06] !to-kc-cyan/[0.03] dark:!from-kc-teal/15 dark:!to-kc-cyan/8 !border-kc-teal/[0.12] dark:!border-kc-teal/25">
            <h4 className="text-[14px] font-semibold mb-2 text-gray-600 dark:text-gray-300">
              Your projected year 1 impact
            </h4>
            <div className="space-y-1.5">
              {yearOneImpact.map((ct) => (
                <div key={ct.charity_id} className="flex justify-between text-sm">
                  <span className="text-gray-500 dark:text-gray-400">
                    {ct.name}
                  </span>
                  <span className="font-semibold text-kc-teal dark:text-kc-cyan">
                    ~{Math.round(ct.total_impact)} {ct.impact_unit}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        </motion.div>
      )}

      {/* Trust signals */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="flex items-center justify-center gap-4 mb-5 text-[12px] text-gray-400 dark:text-gray-500"
      >
        <span className="flex items-center gap-1">
          <Shield size={13} /> Secure payment
        </span>
        <span className="flex items-center gap-1">
          <Heart size={13} /> Cancel anytime
        </span>
      </motion.div>

      {/* Auth prompt if not logged in */}
      {!user && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card className="mb-4 !p-4 !border-amber-200 dark:!border-amber-800 !bg-amber-50/50 dark:!bg-amber-900/10">
            <p className="text-[13px] text-amber-700 dark:text-amber-400 leading-relaxed">
              You&apos;ll need to create an account to save your portfolio and
              set up monthly giving. It takes 30 seconds.
            </p>
          </Card>
        </motion.div>
      )}

      {error && (
        <p className="text-red-500 text-sm text-center mb-3">{error}</p>
      )}

      <TealButton onClick={handleCommit} disabled={saving}>
        {saving
          ? "Setting up…"
          : !user
          ? "Create account & set up giving"
          : `Set up £${monthlyGift}/month giving`}
      </TealButton>

      <p className="text-center text-[12px] text-gray-400 dark:text-gray-500 mt-3 mb-2">
        You&apos;ll be redirected to our secure payment partner (Stripe) to set
        up your monthly donation. You can cancel or adjust at any time.
      </p>
    </PageShell>
  );
}
