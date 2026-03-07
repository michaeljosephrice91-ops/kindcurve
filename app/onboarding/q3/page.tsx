"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useKindCurveStore } from "@/lib/store";
import { BackButton, TealButton, Card, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

const TIERS = [
  { amount: 5, label: "£5", subtitle: "A steady start" },
  { amount: 15, label: "£15", subtitle: "Most popular", popular: true },
  { amount: 30, label: "£30", subtitle: "High impact" },
];

export default function Q3Page() {
  const router = useRouter();
  const { monthlyGift, setMonthlyGift } = useKindCurveStore();
  const [selectedTier, setSelectedTier] = useState<number | null>(
    TIERS.find((t) => t.amount === monthlyGift) ? monthlyGift : null
  );
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isCustom, setIsCustom] = useState(false);

  const effectiveAmount = isCustom ? parseFloat(customAmount) || 0 : selectedTier || 0;
  const isValid = effectiveAmount >= 2;

  const handleTierSelect = (amount: number) => {
    setSelectedTier(amount);
    setIsCustom(false);
    setCustomAmount("");
  };

  const handleCustomFocus = () => {
    setIsCustom(true);
    setSelectedTier(null);
  };

  const handleContinue = () => {
    if (!isValid) return;
    setMonthlyGift(effectiveAmount);
    router.push("/pie");
  };

  return (
    <PageShell>
      <BackButton href="/onboarding/q2" />
      <ProgressBar currentStep={3} />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[28px] font-bold mt-4 mb-2"
      >
        How much would you like to give?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 dark:text-gray-500 text-[15px] mb-7 leading-relaxed"
      >
        Set your monthly commitment. Most Kind Curve members give £15–30/month.
        You can change this anytime.
      </motion.p>

      <div className="flex flex-col gap-3 mb-5">
        {TIERS.map((tier, i) => (
          <motion.button
            key={tier.amount}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            onClick={() => handleTierSelect(tier.amount)}
            className={`relative flex items-center justify-between p-4 px-5 rounded-2xl text-left transition-all font-medium text-base
              ${
                !isCustom && selectedTier === tier.amount
                  ? "bg-[#FEFDF8] dark:bg-kc-border border-2 border-kc-teal dark:border-kc-cyan shadow-[0_0_12px_rgba(38,125,145,0.15)] dark:shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                  : "bg-white dark:bg-kc-card border border-[#e8e4da] dark:border-kc-border shadow-sm"
              }
              cursor-pointer
            `}
          >
            <div className="flex items-center gap-3.5">
              <div className="text-[22px] font-bold text-kc-teal dark:text-kc-cyan w-14">
                {tier.label}
              </div>
              <span className="text-gray-500 dark:text-gray-400 text-sm">
                {tier.subtitle}
              </span>
            </div>
            {tier.popular && (
              <span className="text-[11px] font-semibold text-kc-teal dark:text-kc-cyan bg-kc-teal/10 dark:bg-kc-cyan/10 px-2.5 py-1 rounded-full">
                Popular
              </span>
            )}
          </motion.button>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, x: -16 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ delay: 0.4 }}
      >
        <Card
          className={`mb-6 !p-4 ${
            isCustom
              ? "!border-2 !border-kc-teal dark:!border-kc-cyan !shadow-[0_0_12px_rgba(38,125,145,0.15)]"
              : ""
          }`}
        >
          <label className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 block">
            Or enter a custom amount
          </label>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-400 dark:text-gray-500">£</span>
            <input
              type="number"
              min="2"
              step="1"
              value={customAmount}
              onChange={(e) => {
                setCustomAmount(e.target.value);
                setIsCustom(true);
                setSelectedTier(null);
              }}
              onFocus={handleCustomFocus}
              placeholder="e.g. 20"
              className="flex-1 text-xl font-bold bg-transparent border-none outline-none placeholder:text-gray-300 dark:placeholder:text-gray-600 text-gray-900 dark:text-gray-100"
            />
            <span className="text-sm text-gray-400 dark:text-gray-500">/month</span>
          </div>
          {isCustom && customAmount && effectiveAmount < 2 && (
            <p className="text-xs text-kc-coral mt-2">Minimum amount is £2/month</p>
          )}
        </Card>
      </motion.div>

      {isValid && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center mb-5"
        >
          <p className="text-gray-400 dark:text-gray-500 text-[13px]">
            That&apos;s{" "}
            <span className="text-kc-teal dark:text-kc-cyan font-semibold">
              £{(effectiveAmount * 12).toFixed(0)}
            </span>{" "}
            of impact in your first year
          </p>
        </motion.div>
      )}

      <TealButton onClick={handleContinue} disabled={!isValid}>
        Next
      </TealButton>
    </PageShell>
  );
}
