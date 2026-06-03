"use client";

import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { KCLogo } from "@/components/KCLogo";
import { TealButton, PageShell } from "@/components/ui/shared";

export default function LandingPage() {
  const router = useRouter();

  const handleStart = () => {
    router.push("/onboarding/q1");
  };

  return (
    <PageShell>
      <div className="min-h-screen flex flex-col items-center justify-center text-center pb-16">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="mb-8"
        >
          <KCLogo size={90} />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-[32px] font-normal tracking-tight mb-4"
        >
          Giving, shaped by you.
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-gray-500 dark:text-gray-300 text-[17px] leading-relaxed max-w-[380px] mb-2"
        >
          Create your personalised charitable portfolio in seconds.
        </motion.p>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-gray-400 dark:text-gray-500 text-[15px] mb-10"
        >
          Guided by kindness, backed by impact.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="w-full"
        >
          <TealButton onClick={handleStart}>Start your journey</TealButton>
        </motion.div>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
          className="text-gray-400/70 dark:text-gray-600 text-[13px] mt-12"
        >
          No platform fees. You stay in control.
        </motion.p>
      </div>
    </PageShell>
  );
}
