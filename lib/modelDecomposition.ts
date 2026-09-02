import {
  runEngine,
  DEFAULT_ENGINE_PARAMS,
  type EngineParams,
  type CharityImpactProfile,
} from "./compoundingEngine";

/**
 * Decomposes the Kind Score into the layers that produce it.
 *
 * The engine multiplies three effects together, which makes the headline
 * number impossible to interrogate: you cannot tell which part is arithmetic
 * and which part is conjecture. This runs the same engine four times, adding
 * one layer at a time, so each layer's contribution is the difference it
 * makes rather than an assertion about it.
 *
 * That distinction is the point. Gift Aid is statutory. An annual uplift is a
 * decision the donor makes. The efficiency and network effects are real in
 * direction and invented in magnitude — and a reader is entitled to see which
 * is which before being asked to believe a total.
 */

export type Provenance = "statutory" | "donor" | "directional" | "assumed";

export interface Layer {
  key: string;
  label: string;
  /** One line on what the layer claims. */
  claim: string;
  /** How much of the final score this layer is responsible for. */
  contribution: number;
  provenance: Provenance;
  /** What would have to be true for this layer to hold. */
  test: string;
}

export interface Decomposition {
  /** Kind Score with every layer on — the headline figure. */
  total: number;
  /** Kind Score with both behavioural layers switched off. */
  floor: number;
  layers: Layer[];
  /** Total given over the horizon, in £. */
  totalGiven: number;
}

export const PROVENANCE_LABEL: Record<Provenance, string> = {
  statutory: "Statutory",
  donor: "Set by the donor",
  directional: "Evidenced in direction, assumed in size",
  assumed: "Assumed",
};

export const PROVENANCE_NOTE: Record<Provenance, string> = {
  statutory: "Fixed in law. Not a modelling choice.",
  donor: "A decision the donor makes, not a claim about the world.",
  directional:
    "The effect is well documented; the number attached to it here is not.",
  assumed: "No evidence base. Included because it is plausible, not because it is shown.",
};

function scoreAt(
  params: EngineParams,
  charities: CharityImpactProfile[],
  months: number
): number {
  const result = runEngine({ ...params, duration_months: months }, charities);
  const snap = result.months[Math.min(months, result.months.length) - 1];
  return snap?.kind_score ?? 1;
}

export function decompose(
  monthlyAmount: number,
  charities: CharityImpactProfile[],
  overrides: Partial<EngineParams> = {},
  months = 60
): Decomposition {
  const base: EngineParams = {
    ...DEFAULT_ENGINE_PARAMS,
    ...overrides,
    monthly_amount: monthlyAmount,
    duration_months: months,
  };

  // Each rung adds one layer to the one below it.
  const flat = { ...base, annual_increase_rate: 0, stability_bonus_per_month: 0, network_strength: 0 };
  const withUplift = { ...flat, annual_increase_rate: base.annual_increase_rate };
  const withStability = { ...withUplift, stability_bonus_per_month: base.stability_bonus_per_month };
  const withNetwork = { ...withStability, network_strength: base.network_strength };

  const sFlat = scoreAt(flat, charities, months);
  const sUplift = scoreAt(withUplift, charities, months);
  const sStability = scoreAt(withStability, charities, months);
  const sNetwork = scoreAt(withNetwork, charities, months);

  const full = runEngine(withNetwork, charities);

  return {
    total: sNetwork,
    floor: sUplift,
    totalGiven: full.total_donated,
    layers: [
      {
        key: "base",
        label: "The money itself",
        claim: "What the same monthly gift buys with no effects of any kind.",
        contribution: sFlat,
        provenance: "statutory",
        test: "Nothing to prove — this is the arithmetic of the gift, plus Gift Aid where it applies.",
      },
      {
        key: "uplift",
        label: "Annual uplift",
        claim: "The donor raises their gift a little each year.",
        contribution: sUplift - sFlat,
        provenance: "donor",
        test: "Requires donors to actually accept the increase rather than cancel. Measurable from day one.",
      },
      {
        key: "stability",
        label: "Charity efficiency",
        claim: "Predictable income costs a charity less to raise and lets it plan further ahead.",
        contribution: sStability - sUplift,
        provenance: "directional",
        test: "Requires charity partners to report cost-per-pound-raised against regular versus irregular income.",
      },
      {
        key: "network",
        label: "Network effect",
        claim: "Long-term donors bring other donors in.",
        contribution: sNetwork - sStability,
        provenance: "assumed",
        test: "Requires a live referral rate from real users. Cannot be known before launch.",
      },
    ],
  };
}
