"use client";

import { Sun, Moon } from "lucide-react";
import { useKindCurveStore } from "@/lib/store";

export function ThemeToggle() {
  const { darkMode, toggleDarkMode } = useKindCurveStore();

  return (
    <button
      onClick={toggleDarkMode}
      className="fixed top-4 right-4 z-50 w-10 h-10 rounded-full border flex items-center justify-center transition-colors
        bg-white border-[#e8e4da] dark:bg-kc-border dark:border-kc-border
        hover:shadow-md"
      aria-label="Toggle theme"
    >
      {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-slate-500" />}
    </button>
  );
}
