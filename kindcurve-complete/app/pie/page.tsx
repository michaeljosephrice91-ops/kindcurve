"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect } from "react";
import dynamic2 from "next/dynamic";
import { RotateCcw } from "lucide-react";
import { useKindCurveStore } from "@/lib/store";
import { PIE_COLORS } from "@/lib/constants";
import { BackButton, TealButton, Card, PageShell } from "@/components/ui/shared";
import { ProgressBar } from "@/components/ProgressBar";

const ResponsiveContainer = dynamic2(
  () => import("recharts").then((m) => m.ResponsiveContainer),
  { ssr: false }
);
const PieChart = dynamic2(
  () => import("recharts").then((m) => m.PieChart),
  { ssr: false }
);
const Pie = dynamic2(
  () => import("recharts").then((m) => m.Pie),
  { ssr: false }
);
const Cell = dynamic2(
  () => import("recharts").then((m) => m.Cell),
  { ssr: false }
);

function PiePageInner() {
  const [mounted, setMounted] = useState(false);
  const { charities, setCharities, initialCharities, monthlyGift } = useKindCurveStore();
  const [isCustom, setIsCustom] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const total = charities.reduce((s, c) => s + c.allocation, 0);

  const handleChange = (idx: number, newVal: number) => {
    setIsCustom(true);
    const clamped = Math.max(0, Math.min(100, newVal));
    const arr = charities.map((c) => ({ ...c }));
    const old = arr[idx].allocation;
    arr[idx].allocation = clamped;
    const diff = old - clamped;

    if (diff !== 0 && arr.length > 1) {
      const otherIdx = arr.map((_, i) => i).filter((i) => i !== idx);
      const otherTotal = otherIdx.reduce((s, i) => s + arr[i].allocation, 0);
      let rem = diff;

      otherIdx.forEach((i, j) => {
        if (j === otherIdx.length - 1) {
          arr[i].allocation = Math.max(0, +(arr[i].allocation + rem).toFixed(2));
        } else {
          const adj = otherTotal > 0
            ? +(diff * (arr[i].allocation / otherTotal)).toFixed(2)
            : +(diff / otherIdx.length).toFixed(2);
          arr[i].allocation = Math.max(0, +(arr[i].allocation + adj).toFixed(2));
          rem -= adj;
        }
      });

      const tt = arr.reduce((s, c) => s + c.allocation, 0);
      if (Math.abs(tt - 100) > 0.01) {
        arr[0].allocation = +(arr[0].allocation + (100 - tt)).toFixed(2);
      }
    }
    setCharities(arr);
  };

  const resetToRecommended = () => {
    if (initialCharities.length) {
      setCharities(initialCharities.map((c) => ({ ...c })));
      setIsCustom(false);
    }
  };

  const equalSplit = () => {
    const eq = +(100 / charities.length).toFixed(2);
    setCharities(
      charities.map((c, i) => ({
        ...c,
        allocation: i === 0 ? +(eq + (100 - eq * charities.length)).toFixed(2) : eq,
      }))
    );
    setIsCustom(true);
  };

  const pieData = charities.map((c, i) => ({
    name: c.name,
    value: c.allocation,
    color: PIE_COLORS[i % PIE_COLORS.length],
  }));

  if (!mounted || !charities.length) {
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
      <BackButton href="/onboarding/q3" />
      <ProgressBar currentStep={4} />

      <h1 className="text-[26px] font-bold mt-3 mb-1">Your Kind Curve Pie</h1>
      <p className="text-gray-500 dark:text-gray-400 text-sm mb-0.5">
        {isCustom ? "Custom allocations" : "Recommended allocations"}
      </p>
      <p className="text-gray-400 dark:text-gray-500 text-[13px] mb-5">
        Adjust the sliders to customize your giving mix.
      </p>

      <Card className="mb-4 !p-5 dark:!bg-[#0f172a] dark:!border-[#1e3a4a]">
        <div className="flex justify-center">
          <ResponsiveContainer width={240} height={240}>
            <PieChart>
              <Pie data={pieData} innerRadius={70} outerRadius={100} paddingAngle={2} dataKey="value" stroke="none">
                {pieData.map((e, i) => (
                  <Cell key={i} fill={e.color} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <div className="flex gap-2.5 mb-4">
        <button onClick={resetToRecommended} className="flex-1 py-2.5 px-3 rounded-full border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-[13px] font-semibold text-gray-500 dark:text-gray-400 flex items-center justify-center gap-1.5 transition-colors">
          <RotateCcw size={14} /> Reset to recommended
        </button>
        <button onClick={equalSplit} className="flex-1 py-2.5 px-3 rounded-full border border-[#e8e4da] dark:border-kc-border bg-white dark:bg-kc-card text-[13px] font-semibold text-gray-500 dark:text-gray-400 transition-colors">
          Equal split
        </button>
      </div>

      <Card className="mb-4">
        <h3 className="text-[15px] font-semibold mb-4">Edit allocations</h3>
        {charities.map((c, i) => (
          <div key={c.name} className={i < charities.length - 1 ? "mb-5" : ""}>
            <div className="flex items-center justify-between mb-1.5">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full" style={{ background: PIE_COLORS[i % PIE_COLORS.length] }} />
                <span className="text-sm">{c.name}</span>
              </div>
              <div className="flex items-center gap-1">
                <input
                  type="number" min="0" max="100" step="0.1"
                  value={c.allocation.toFixed(1)}
                  onChange={(e) => handleChange(i, parseFloat(e.target.value) || 0)}
                  className="w-[52px] text-right border border-gray-200 dark:border-gray-600 rounded-md px-1.5 py-1 text-[13px] bg-[#fafaf8] dark:bg-kc-border dark:text-gray-200"
                />
                <span className="text-[13px] text-gray-400">%</span>
              </div>
            </div>
            <input
              type="range" min="0" max="100" step="0.5"
              value={c.allocation}
              onChange={(e) => handleChange(i, parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
        ))}
        <div className="border-t border-[#f0ebe0] dark:border-kc-border mt-4 pt-3 flex justify-between text-sm">
          <span className="text-gray-500 dark:text-gray-400">Total:</span>
          <span className={`font-semibold ${Math.abs(total - 100) < 0.2 ? "text-kc-cyan" : "text-red-500"}`}>
            {total.toFixed(1)}%
          </span>
        </div>
      </Card>

      <Card className="mb-6 !bg-gradient-to-br !from-kc-teal/[0.08] !to-kc-cyan/[0.04] dark:!from-kc-teal/20 dark:!to-kc-cyan/10 !border-kc-teal/[0.15] dark:!border-kc-teal/30">
        <h3 className="text-[17px] font-bold mb-1">Your monthly gift: £{monthlyGift}</h3>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-3.5">
          How your £{monthlyGift} is divided:
        </p>
        {charities.map((c) => (
          <div key={c.name} className="flex justify-between py-0.5 text-sm">
            <span>{c.name}</span>
            <span className="text-kc-teal dark:text-kc-cyan font-semibold">
              £{((c.allocation / 100) * monthlyGift).toFixed(2)}
            </span>
          </div>
        ))}
      </Card>

      <TealButton onClick={() => window.location.href = "/consistency"}>Continue</TealButton>
    </PageShell>
  );
}

export default function PiePage() {
  return <PiePageInner />;
}
