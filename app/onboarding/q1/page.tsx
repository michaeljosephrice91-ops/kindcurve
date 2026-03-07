"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Heart, Brain, Leaf, GraduationCap, Home, Shield } from "lucide-react";
import { createClient } from "@/lib/supabaseClient";
import { useKindCurveStore } from "@/lib/store";
import { BackButton, TealButton, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

const ICON_MAP: Record<string, any> = {
  Heart, Brain, Leaf, GraduationCap, Home, Shield,
};

export default function Q1Page() {
  const router = useRouter();
  const { selectedThemes, setSelectedThemes } = useKindCurveStore();
  const [themes, setThemes] = useState<any[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase
      .from("themes")
      .select("*")
      .order("sort_order")
      .then(({ data }) => {
        if (data) setThemes(data);
      });
  }, []);

  const toggle = (key: string) => {
    if (selectedThemes.includes(key)) {
      setSelectedThemes(selectedThemes.filter((k: string) => k !== key));
    } else if (selectedThemes.length < 3) {
      setSelectedThemes([...selectedThemes, key]);
    }
  };

  return (
    <PageShell>
      <BackButton href="/" />
      <ProgressBar currentStep={1} />

      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="text-[28px] font-bold mt-4 mb-2"
      >
        What do you care about?
      </motion.h1>

      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="text-gray-400 dark:text-gray-500 text-[15px] mb-7"
      >
        Choose up to 3 themes that resonate with you.
      </motion.p>

      <div className="flex flex-col gap-3">
        {themes.map((t, i) => {
          const sel = selectedThemes.includes(t.id);
          const dis = !sel && selectedThemes.length >= 3;
          const Icon = ICON_MAP[t.icon] || Heart;
          return (
            <motion.button
              key={t.id}
              initial={{ opacity: 0, x: -16 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.15 + i * 0.06 }}
              onClick={() => !dis && toggle(t.id)}
              disabled={dis}
              className={`flex items-center gap-3.5 p-4 px-5 rounded-2xl text-left transition-all font-medium text-base
                ${sel
                  ? "bg-[#FEFDF8] dark:bg-kc-border border-2 border-kc-teal dark:border-kc-cyan shadow-[0_0_12px_rgba(38,125,145,0.15)] dark:shadow-[0_0_16px_rgba(34,211,238,0.2)]"
                  : "bg-white dark:bg-kc-card border border-[#e8e4da] dark:border-kc-border shadow-sm"
                }
                ${dis ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}
              `}
            >
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${t.color}18` }}
              >
                <Icon size={20} color={t.color} />
              </div>
              {t.label}
            </motion.button>
          );
        })}
      </div>

      <p className="text-center text-kc-cyan text-sm mt-5 mb-5">
        {selectedThemes.length} of 3 selected
      </p>

      <TealButton
        onClick={() => router.push("/onboarding/q2")}
        disabled={selectedThemes.length === 0}
      >
        Next
      </TealButton>
    </PageShell>
  );
}
