"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Globe, Scale } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useKindCurveStore } from "@/lib/store";
import { generatePortfolioFromDB } from "@/lib/portfolioGeneratorV2";
import { BackButton, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

const SCOPE_OPTIONS = [
  { value: "local" as const, label: "Local UK", Icon: MapPin, color: "#fb7185" },
  { value: "global" as const, label: "Global", Icon: Globe, color: "#22d3ee" },
  { value: "mix" as const, label: "A mix of both", Icon: Scale, color: "#4BB78F" },
];

export default function Q2Page() {
  const router = useRouter();
  const { selectedThemes, setScope, setCharities, setInitialCharities } =
    useKindCurveStore();

  const handleSelect = async (value: "local" | "global" | "mix") => {
    setScope(value);
    const supabase = createClient();

    // Fetch all charities from DB
    const { data: allCharities } = await supabase
      .from("charities")
      .select("id, name, theme_id, geo, url")
      .eq("active", true);

    if (!allCharities) return;

    // Generate portfolio
    const allocations = generatePortfolioFromDB(
      selectedThemes,
      value,
      allCharities
    );

    // Store in Zustand for the pie editor
    const charityData = allocations.map((a) => ({
      name: a.charity_name,
      allocation: a.allocation_pct,
      charity_id: a.charity_id,
    }));

    setCharities(charityData);
    setInitialCharities(charityData.map((c) => ({ ...c })));

    // Route to amount selection (Q3) instead of directly to pie
    router.push("/onboarding/q3");
  };

  return (
    <PageShell>
      <BackButton href="/onboarding/q1" />
      <ProgressBar currentStep={2} />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[28px] font-bold mt-4 mb-2"
      >
        How do you want to give?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 dark:text-gray-500 text-[15px] mb-7"
      >
        Choose the scope that feels right to you.
      </motion.p>

      <div className="flex flex-col gap-3">
        {SCOPE_OPTIONS.map((o, i) => (
          <motion.button
            key={o.value}
            initial={{ opacity: 0, x: -16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.15 + i * 0.08 }}
            onClick={() => handleSelect(o.value)}
            className="flex items-center gap-3.5 p-4 px-5 rounded-2xl text-left transition-all font-medium text-base cursor-pointer
              bg-white dark:bg-kc-card border border-[#e8e4da] dark:border-kc-border shadow-sm
              hover:border-kc-teal/40 dark:hover:border-kc-cyan/40"
          >
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: `${o.color}18` }}
            >
              <o.Icon size={20} color={o.color} />
            </div>
            {o.label}
          </motion.button>
        ))}
      </div>
    </PageShell>
  );
}
