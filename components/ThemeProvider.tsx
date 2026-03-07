"use client";

import { useEffect } from "react";
import { useKindCurveStore } from "@/lib/store";
import { ThemeToggle } from "./ThemeToggle";

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useKindCurveStore((s) => s.darkMode);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    document.body.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <>
      <ThemeToggle />
      {children}
    </>
  );
}
