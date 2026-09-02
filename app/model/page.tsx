"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { useKindCurveStore } from "@/lib/store";
import { buildCharityProfiles, DEMO_CHARITIES } from "@/lib/demoData";
import { DEFAULT_ENGINE_PARAMS } from "@/lib/compoundingEngine";
import {
  decompose,
  PROVENANCE_LABEL,
  PROVENANCE_NOTE,
  type Provenance,
} from "@/lib/modelDecomposition";
import { KCLogo } from "@/components/KCLogo";
import { BackButton, Card, PageShell } from "@/components/ui/shared";

/**
 * The model page.
 *
 * Every giving product asserts that consistency compounds. This one shows its
 * working: which part of the headline figure is arithmetic, which is a donor
 * decision, and which is conjecture — with the dials exposed so a sceptical
 * reader can set the speculative parts to zero and see what survives.
 */

const LAYER_COLOUR: Record<string, string> = {
  base: "#267D91",
  uplift: "#4BB78F",
  stability: "#5FA8B8",
  network: "#E07060",
};

const PROVENANCE_STYLE: Record<Provenance, string> = {
  statutory: "bg-[#267D91]/10 text-[#1d5e6d] dark:bg-[#267D91]/25 dark:text-[#8fd0dd]",
  donor: "bg-[#4BB78F]/12 text-[#2c7a5f] dark:bg-[#4BB78F]/25 dark:text-[#8fe0c2]",
  directional: "bg-[#C9A87C]/20 text-[#7a5f38] dark:bg-[#C9A87C]/25 dark:text-[#e0c9a4]",
  assumed: "bg-[#E07060]/12 text-[#9c4436] dark:bg-[#E07060]/25 dark:text-[#f0a99c]",
};

/** A fallback portfolio so the page stands alone when opened from a link. */
const FALLBACK = DEMO_CHARITIES.slice(0, 4).map((c) => ({
  name: c.name,
  allocation: 25,
  charity_id: c.id,
}));

function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (v: number) => string;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-baseline justify-between">
        <span className="text-[13px] text-gray-600 dark:text-gray-300">{label}</span>
        <span className="text-[13px] font-semibold tabular-nums text-kc-teal dark:text-kc-cyan">
          {format(value)}
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full"
        aria-label={label}
      />
    </div>
  );
}

export default function ModelPage() {
  const router = useRouter();
  const { charities, monthlyGift } = useKindCurveStore();

  const [uplift, setUplift] = useState(DEFAULT_ENGINE_PARAMS.annual_increase_rate);
  const [stability, setStability] = useState(
    DEFAULT_ENGINE_PARAMS.stability_bonus_per_month
  );
  const [network, setNetwork] = useState(DEFAULT_ENGINE_PARAMS.network_strength);
  const [regularity, setRegularity] = useState(1);

  const profiles = useMemo(
    () => buildCharityProfiles(charities.length ? charities : FALLBACK),
    [charities]
  );

  const model = useMemo(
    () =>
      decompose(monthlyGift || 15, profiles, {
        annual_increase_rate: uplift,
        stability_bonus_per_month: stability,
        network_strength: network,
        regularity,
      }),
    [monthlyGift, profiles, uplift, stability, network, regularity]
  );

  const speculative = model.total - model.floor;
  const lift = model.total - 1;

  return (
    <PageShell>
      <BackButton href="/dashboard" />

      <div className="flex items-center gap-2.5 mt-3 mb-1">
        <KCLogo size={26} />
        <h1 className="text-[26px] font-bold">How the number is built</h1>
      </div>
      <p className="text-[15px] leading-relaxed text-gray-500 dark:text-gray-400 mb-6">
        Kind Curve claims that steady giving does more than the same money given in
        bursts. This page is that claim taken apart — what each part contributes,
        how much of it is arithmetic, and how much is us guessing. Move anything you
        disagree with.
      </p>

      {/* Headline, decomposed */}
      <Card className="mb-3 !p-5">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-[38px] font-bold leading-none text-kc-teal dark:text-kc-cyan tabular-nums">
            {model.total.toFixed(2)}×
          </span>
          <span className="text-[13px] text-gray-500 dark:text-gray-400">
            over five years
          </span>
        </div>
        <p className="text-[13px] text-gray-500 dark:text-gray-400 mb-4">
          against the same £{monthlyGift || 15} a month with none of the effects below.
        </p>

        {/* The lift, decomposed. The base 1.00x is excluded deliberately —
            including it swamps the bar and hides the part under argument. */}
        <p className="text-[12px] font-medium text-gray-500 dark:text-gray-400 mb-1.5">
          Where the {lift >= 0 ? "+" : ""}
          {lift.toFixed(2)}× of lift comes from
        </p>
        <div className="flex h-9 w-full overflow-hidden rounded-lg mb-2.5 bg-[#f0ebe0] dark:bg-kc-border">
          {model.layers
            .filter((l) => l.key !== "base")
            .map((l) => {
              const pct = lift > 0 ? (l.contribution / lift) * 100 : 0;
              if (pct <= 0.4) return null;
              return (
                <div
                  key={l.key}
                  style={{ width: `${pct}%`, background: LAYER_COLOUR[l.key] }}
                  title={`${l.label}: ${l.contribution.toFixed(3)}×`}
                />
              );
            })}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {model.layers.filter((l) => l.key !== "base").map((l) => (
            <span key={l.key} className="flex items-center gap-1.5 text-[12px]">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full"
                style={{ background: LAYER_COLOUR[l.key] }}
              />
              <span className="text-gray-600 dark:text-gray-300">{l.label}</span>
              <span className="tabular-nums text-gray-400 dark:text-gray-500">
                {l.contribution >= 0 ? "+" : ""}
                {l.contribution.toFixed(3)}
              </span>
            </span>
          ))}
        </div>
      </Card>

      {/* The honest floor */}
      <Card className="mb-3 !p-5 !bg-gradient-to-br !from-kc-teal/[0.06] !to-kc-cyan/[0.03] dark:!from-kc-teal/15 dark:!to-kc-cyan/8 !border-kc-teal/[0.12] dark:!border-kc-teal/25">
        <h3 className="text-[15px] font-semibold mb-2">If you believe none of it</h3>
        <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-300">
          Set both behavioural effects to zero and the score is{" "}
          <span className="font-semibold text-kc-teal dark:text-kc-cyan tabular-nums">
            {model.floor.toFixed(2)}×
          </span>
          . That part is arithmetic — a gift that rises each year, plus Gift Aid.
          The remaining{" "}
          <span className="font-semibold tabular-nums">
            {speculative.toFixed(2)}×
          </span>{" "}
          {speculative > 0 ? (
            <>
              is {Math.round((speculative / Math.max(lift, 0.0001)) * 100)}% of the
              total lift and rests on the two claims below that we have not yet
              proven.
            </>
          ) : (
            <>is what the behavioural claims are currently contributing: nothing.</>
          )}
        </p>
      </Card>

      {/* Layers */}
      <h2 className="text-[15px] font-semibold mt-5 mb-2.5">The four layers</h2>
      {model.layers.map((l) => (
        <Card key={l.key} className="mb-2.5 !p-4">
          <div className="flex items-start justify-between gap-3 mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="inline-block h-2.5 w-2.5 rounded-full shrink-0"
                style={{ background: LAYER_COLOUR[l.key] }}
              />
              <span className="text-[14.5px] font-semibold">{l.label}</span>
            </div>
            <span className="text-[13px] font-semibold tabular-nums text-kc-teal dark:text-kc-cyan whitespace-nowrap">
              {l.contribution >= 0 ? "+" : ""}
              {l.contribution.toFixed(3)}×
            </span>
          </div>
          <p className="text-[13px] leading-relaxed text-gray-600 dark:text-gray-300 mb-2">
            {l.claim}
          </p>
          <span
            className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-medium ${PROVENANCE_STYLE[l.provenance]}`}
          >
            {PROVENANCE_LABEL[l.provenance]}
          </span>
          <p className="text-[12px] leading-relaxed text-gray-400 dark:text-gray-500 mt-2">
            {PROVENANCE_NOTE[l.provenance]} <span className="italic">{l.test}</span>
          </p>
        </Card>
      ))}

      {/* Dials */}
      <h2 className="text-[15px] font-semibold mt-5 mb-2.5">Disagree with us</h2>
      <Card className="mb-3 !p-5">
        <div className="flex flex-col gap-4">
          <Slider
            label="Annual uplift in the gift"
            value={uplift}
            min={0}
            max={0.1}
            step={0.005}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            onChange={setUplift}
          />
          <Slider
            label="Charity efficiency gain per consecutive month"
            value={stability}
            min={0}
            max={0.02}
            step={0.001}
            format={(v) => `${(v * 100).toFixed(1)}%`}
            onChange={setStability}
          />
          <Slider
            label="Network strength"
            value={network}
            min={0}
            max={1}
            step={0.05}
            format={(v) => v.toFixed(2)}
            onChange={setNetwork}
          />
          <Slider
            label="Months given out of every twelve"
            value={regularity}
            min={0.4}
            max={1}
            step={0.05}
            format={(v) => `${Math.round(v * 12)} of 12`}
            onChange={setRegularity}
          />
        </div>
        <button
          onClick={() => {
            setUplift(DEFAULT_ENGINE_PARAMS.annual_increase_rate);
            setStability(DEFAULT_ENGINE_PARAMS.stability_bonus_per_month);
            setNetwork(DEFAULT_ENGINE_PARAMS.network_strength);
            setRegularity(1);
          }}
          className="mt-4 text-[12.5px] text-kc-teal dark:text-kc-cyan underline underline-offset-2"
        >
          Reset to our assumptions
        </button>
      </Card>

      {/* What we'd have to prove */}
      <Card className="mb-4 !p-5">
        <h3 className="text-[15px] font-semibold mb-2">What we would have to prove</h3>
        <p className="text-[13.5px] leading-relaxed text-gray-600 dark:text-gray-300">
          The efficiency claim is testable with charity partners today: cost per pound
          raised against regular versus irregular income. The network claim is not
          testable before launch — it needs a real referral rate from real donors. Both
          are held separately here so neither can quietly inflate the other, and so a
          reader can discount either one without discarding the whole model.
        </p>
        <p className="text-[12px] leading-relaxed text-gray-400 dark:text-gray-500 mt-3 pt-2.5 border-t border-[#f0ebe0] dark:border-kc-border">
          Impact-per-pound figures are illustrative assumptions for this demonstration
          and are not supplied or endorsed by any charity.
        </p>
      </Card>

      <button
        onClick={() => router.push("/dashboard")}
        className="mb-10 text-[13px] text-kc-teal dark:text-kc-cyan underline underline-offset-2"
      >
        Back to the dashboard
      </button>
    </PageShell>
  );
}
