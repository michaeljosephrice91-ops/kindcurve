"use client";

import { cn } from "@/lib/utils";

interface ProgressBarProps {
  currentStep: number;
  totalSteps?: number;
}

/**
 * Minimal progress bar for the onboarding flow.
 *
 * Steps:
 * 1 = Themes (Q1)
 * 2 = Scope (Q2)
 * 3 = Amount (Q3)
 * 4 = Portfolio (Pie)
 * 5 = Consistency
 * 6 = Commit
 */
export function ProgressBar({ currentStep, totalSteps = 6 }: ProgressBarProps) {
  return (
    <div className="flex gap-1.5 pt-4 pb-1">
      {Array.from({ length: totalSteps }, (_, i) => {
        const step = i + 1;
        const isActive = step === currentStep;
        const isComplete = step < currentStep;

        return (
          <div
            key={step}
            className={cn(
              "h-1 rounded-full flex-1 transition-all duration-300",
              isComplete
                ? "bg-kc-teal dark:bg-kc-cyan"
                : isActive
                ? "bg-kc-teal/60 dark:bg-kc-cyan/60"
                : "bg-gray-200 dark:bg-gray-700"
            )}
          />
        );
      })}
    </div>
  );
}
