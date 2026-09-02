"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { PieChart, CalendarCheck, Sprout } from "lucide-react";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, PageShell } from "@/components/ui/shared";

/**
 * Landing page.
 *
 * This is the first thing someone sees when the demo is sent to them as a
 * link, with nobody there to narrate it — so it has to state the CLAIM, not
 * just describe the feature, and be honest up front that nothing here moves
 * money.
 */

const MECHANISM = [
  {
    icon: PieChart,
    title: "You set the allocation",
    body: "Split one monthly gift across the causes you choose — the way you'd split a portfolio, not one charity at a time.",
  },
  {
    icon: CalendarCheck,
    title: "Charities can plan",
    body: "Predictable income costs less to raise and lets a charity commit further ahead than an unpredictable windfall does.",
  },
  {
    icon: Sprout,
    title: "The work keeps running",
    body: "Much of what giving funds — shelter, treatment, trees — carries on producing after the month it was paid for.",
  },
];

export default function LandingPage() {
  const router = useRouter();

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center text-center py-16">
        <motion.div
          initial={{ scale: 0.85, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="mb-7"
        >
          <KCLogo size={96} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="text-[32px] font-normal tracking-tight mb-4"
        >
          Giving, shaped by you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.25 }}
          className="text-gray-600 dark:text-gray-300 text-[17px] leading-relaxed max-w-[430px] mb-10"
        >
          A giving portfolio: you pick the causes, set the split, and commit
          monthly. Given steadily, the same money is worth more than it is
          given in bursts — and this shows you why.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="w-full max-w-[430px] text-left space-y-4 mb-10"
        >
          {MECHANISM.map(({ icon: Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <Icon
                size={18}
                className="text-kc-teal dark:text-kc-cyan shrink-0 mt-[3px]"
              />
              <div>
                <p className="text-[15px] font-medium leading-snug">{title}</p>
                <p className="text-[14px] leading-relaxed text-gray-500 dark:text-gray-400">
                  {body}
                </p>
              </div>
            </div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="w-full"
        >
          <TealButton onClick={() => router.push("/onboarding/q1")}>
            Build a giving portfolio
          </TealButton>
          <p className="text-gray-400 dark:text-gray-500 text-[13px] mt-3">
            Takes about two minutes.
          </p>
          <button
            onClick={() => router.push("/model")}
            className="mt-4 text-[13px] text-kc-teal dark:text-kc-cyan underline underline-offset-2"
          >
            Or read how the numbers are built
          </button>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="text-gray-400/80 dark:text-gray-600 text-[12.5px] leading-relaxed mt-12 max-w-[400px]"
        >
          A working demonstration. No account, no payment, no money moves.
          Charities shown are illustrative, and the impact figures are stated
          assumptions rather than measured results.
        </motion.p>
      </div>
    </PageShell>
  );
}
