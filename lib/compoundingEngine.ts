/**
 * Kind Curve Compounding Engine — V1
 *
 * Unified implementation combining:
 * - PDF model: annual increase formula D(y) = 12 × m₀ × (1+g)^y
 * - Spreadsheet engine: stability multiplier, referral multiplier, streak tracking
 * - Per-charity impact-per-£ ratios
 * - IEM (Impact Efficiency Multiplier) as signature metric
 *
 * Architecture: month-by-month simulation, one row per month, up to 120 months (10 years).
 * All parameters explicit and auditable — no black boxes.
 */

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CharityImpactProfile {
  charity_id: string;
  name: string;
  allocation_pct: number;
  /** Concrete impact per £1 donated (e.g. 0.5 = 0.5 malaria nets per £1) */
  impact_per_pound: number;
  /** Human-readable impact unit (e.g. "malaria nets", "crisis calls") */
  impact_unit: string;
}

export interface EngineParams {
  /** Base monthly donation in £ */
  monthly_amount: number;
  /** Annual increase rate (e.g. 0.03 = 3% per year). From PDF model. */
  annual_increase_rate: number;
  /** Stability bonus per consecutive month (e.g. 0.01). From spreadsheet. */
  stability_bonus_per_month: number;
  /** Months before referral/network effects kick in */
  referral_lag_months: number;
  /** Referral growth rate per year after lag */
  referral_rate: number;
  /** Network strength multiplier (0–1) */
  network_strength: number;
  /** Whether donor is Gift Aid eligible (25% uplift) */
  gift_aid: boolean;
  /** Regularity index (0–1, where 1 = gives every month) */
  regularity: number;
  /** Number of months to simulate */
  duration_months: number;
}

export interface MonthlySnapshot {
  month: number;
  /** Whether the donor gave this month */
  active: boolean;
  /** Actual donation this month (£) */
  donation: number;
  /** Donation after Gift Aid uplift */
  donation_effective: number;
  /** Consecutive months of giving (resets on miss) */
  streak: number;
  /** Stability multiplier: 1 + (bonus × (streak - 1)) */
  stability_multiplier: number;
  /** Referral multiplier: kicks in after lag period */
  referral_multiplier: number;
  /** Total impact this month (across all charities) */
  impact: number;
  /** Cumulative donations to date */
  cumulative_donations: number;
  /** Cumulative impact to date */
  cumulative_impact: number;
  /** Impact Efficiency Multiplier: cumulative_impact / cumulative_donations */
  iem: number;
  /** Per-charity impact breakdown this month */
  charity_impacts: CharityMonthImpact[];
}

export interface CharityMonthImpact {
  charity_id: string;
  name: string;
  donation: number;
  impact: number;
  impact_unit: string;
  cumulative_impact: number;
}

export interface EngineResult {
  months: MonthlySnapshot[];
  /** Summary stats */
  total_donated: number;
  total_donated_effective: number;
  total_impact: number;
  final_iem: number;
  final_streak: number;
  /** Per-charity cumulative totals */
  charity_totals: CharityTotal[];
  /** Year-by-year summaries for chart display */
  yearly_summaries: YearlySummary[];
}

export interface CharityTotal {
  charity_id: string;
  name: string;
  total_donated: number;
  total_impact: number;
  impact_unit: string;
}

export interface YearlySummary {
  year: number;
  donated: number;
  donated_effective: number;
  impact: number;
  iem: number;
  streak: number;
}

// ---------------------------------------------------------------------------
// Irregular giver simulation (for comparison)
// ---------------------------------------------------------------------------

export interface IrregularSnapshot {
  month: number;
  active: boolean;
  donation: number;
  cumulative_donations: number;
  cumulative_impact: number;
}

export interface ComparisonResult {
  kindCurve: EngineResult;
  irregular: IrregularSnapshot[];
}

// ---------------------------------------------------------------------------
// Default parameters
// ---------------------------------------------------------------------------

export const DEFAULT_ENGINE_PARAMS: Omit<EngineParams, "monthly_amount"> = {
  annual_increase_rate: 0.03,
  stability_bonus_per_month: 0.01,
  referral_lag_months: 12,
  referral_rate: 0.05,
  network_strength: 0.3,
  gift_aid: false,
  regularity: 1.0,
  duration_months: 120,
};

/**
 * Default impact profiles for charities without Supabase data.
 * These are conservative estimates. The report flags that these need
 * charity endorsement to be fully credible — for V1 they're clearly
 * labelled as estimates.
 */
export const DEFAULT_IMPACT_PROFILES: Record<string, { impact_per_pound: number; impact_unit: string }> = {
  // Climate & Environment
  "Cool Earth": { impact_per_pound: 0.004, impact_unit: "acres protected" },
  "Rainforest Trust": { impact_per_pound: 0.005, impact_unit: "acres protected" },
  "ClientEarth": { impact_per_pound: 0.1, impact_unit: "legal actions supported" },
  "The Woodland Trust": { impact_per_pound: 0.02, impact_unit: "trees planted" },
  "Friends of the Earth": { impact_per_pound: 0.1, impact_unit: "campaigns supported" },
  "Surfers Against Sewage": { impact_per_pound: 0.1, impact_unit: "beach cleans supported" },

  // Mental Health
  "Mind": { impact_per_pound: 0.15, impact_unit: "support sessions" },
  "Samaritans": { impact_per_pound: 0.2, impact_unit: "crisis calls supported" },
  "Young Minds": { impact_per_pound: 0.15, impact_unit: "young people supported" },
  "Mental Health Foundation": { impact_per_pound: 0.12, impact_unit: "people reached" },
  "Rethink Mental Illness": { impact_per_pound: 0.15, impact_unit: "people supported" },

  // Poverty & Basic Needs
  "Shelter": { impact_per_pound: 0.1, impact_unit: "advice sessions" },
  "Crisis": { impact_per_pound: 0.08, impact_unit: "people housed" },
  "Centrepoint": { impact_per_pound: 0.1, impact_unit: "young people supported" },
  "The Trussell Trust": { impact_per_pound: 0.3, impact_unit: "meals provided" },
  "Action Against Hunger": { impact_per_pound: 0.25, impact_unit: "meals provided" },
  "WaterAid": { impact_per_pound: 0.1, impact_unit: "people with clean water" },

  // Children & Education
  "Barnardo's": { impact_per_pound: 0.12, impact_unit: "children supported" },
  "NSPCC": { impact_per_pound: 0.1, impact_unit: "children protected" },
  "Save the Children": { impact_per_pound: 0.15, impact_unit: "children reached" },
  "UNICEF UK": { impact_per_pound: 0.2, impact_unit: "children supported" },
  "Malala Fund": { impact_per_pound: 0.08, impact_unit: "girls in education" },
  "The Children's Society": { impact_per_pound: 0.12, impact_unit: "children helped" },

  // Animals & Nature
  "RSPCA": { impact_per_pound: 0.1, impact_unit: "animals helped" },
  "Dogs Trust": { impact_per_pound: 0.08, impact_unit: "dogs cared for" },
  "WWF": { impact_per_pound: 0.005, impact_unit: "hectares protected" },
  "The Wildlife Trusts": { impact_per_pound: 0.01, impact_unit: "hectares managed" },
  "Born Free Foundation": { impact_per_pound: 0.05, impact_unit: "animals protected" },
  "Battersea Dogs & Cats Home": { impact_per_pound: 0.06, impact_unit: "animals rehomed" },

  // Multi-theme
  "Oxfam": { impact_per_pound: 0.15, impact_unit: "people helped" },
  "British Red Cross": { impact_per_pound: 0.12, impact_unit: "people assisted" },
  "Comic Relief": { impact_per_pound: 0.15, impact_unit: "lives changed" },

  // Against Malaria Foundation (from report example)
  "Against Malaria Foundation": { impact_per_pound: 0.5, impact_unit: "malaria nets" },
};

// ---------------------------------------------------------------------------
// Deterministic pseudo-random for irregular giver simulation
// ---------------------------------------------------------------------------

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807 + 0) % 2147483647;
    return s / 2147483647;
  };
}

// ---------------------------------------------------------------------------
// Core Engine
// ---------------------------------------------------------------------------

/**
 * Run the Kind Curve compounding engine.
 *
 * Simulates month-by-month giving with three compounding layers:
 * 1. Financial: annual increases on the base amount
 * 2. Impact: stability multiplier from streak consistency
 * 3. Behavioural: referral multiplier after lag period
 */
export function runEngine(
  params: EngineParams,
  charities: CharityImpactProfile[]
): EngineResult {
  const {
    monthly_amount,
    annual_increase_rate,
    stability_bonus_per_month,
    referral_lag_months,
    referral_rate,
    network_strength,
    gift_aid,
    regularity,
    duration_months,
  } = params;

  const giftAidMultiplier = gift_aid ? 1.25 : 1.0;

  // Ensure we have impact profiles for all charities
  const enrichedCharities = charities.map((c) => {
    const defaults = DEFAULT_IMPACT_PROFILES[c.name];
    return {
      ...c,
      impact_per_pound: c.impact_per_pound || defaults?.impact_per_pound || 0.1,
      impact_unit: c.impact_unit || defaults?.impact_unit || "impact units",
    };
  });

  // Cumulative per-charity tracking
  const charityCumulative: Record<string, number> = {};
  enrichedCharities.forEach((c) => {
    charityCumulative[c.charity_id || c.name] = 0;
  });

  const months: MonthlySnapshot[] = [];
  let streak = 0;
  let cumulativeDonations = 0;
  let cumulativeImpact = 0;

  // Deterministic regularity: use a pattern rather than randomness
  // regularity of 0.8 means donor gives 4 out of every 5 months
  const rand = seededRandom(42);

  for (let m = 1; m <= duration_months; m++) {
    // Determine if donor gives this month based on regularity
    const active = regularity >= 1.0 ? true : rand() < regularity;

    if (!active) {
      streak = 0;
      months.push({
        month: m,
        active: false,
        donation: 0,
        donation_effective: 0,
        streak: 0,
        stability_multiplier: 1,
        referral_multiplier: 1,
        impact: 0,
        cumulative_donations: cumulativeDonations,
        cumulative_impact: cumulativeImpact,
        iem: cumulativeDonations > 0 ? cumulativeImpact / cumulativeDonations : 0,
        charity_impacts: enrichedCharities.map((c) => ({
          charity_id: c.charity_id || c.name,
          name: c.name,
          donation: 0,
          impact: 0,
          impact_unit: c.impact_unit,
          cumulative_impact: charityCumulative[c.charity_id || c.name],
        })),
      });
      continue;
    }

    streak += 1;

    // Financial compounding: annual increase
    // D(y) = m₀ × (1+g)^floor((m-1)/12)
    const yearIndex = Math.floor((m - 1) / 12);
    const donation = monthly_amount * Math.pow(1 + annual_increase_rate, yearIndex);
    const donationEffective = donation * giftAidMultiplier;

    // Stability multiplier: rewards consecutive giving
    const stabilityMultiplier = 1 + stability_bonus_per_month * Math.max(0, streak - 1);

    // Referral multiplier: behavioural compounding after lag
    const monthsPastLag = Math.max(0, m - referral_lag_months);
    const referralMultiplier =
      1 + network_strength * (monthsPastLag / 12) * referral_rate;

    // Calculate per-charity impact
    let monthImpact = 0;
    const charityImpacts: CharityMonthImpact[] = enrichedCharities.map((c) => {
      const charityDonation = donationEffective * (c.allocation_pct / 100);
      const baseImpact = charityDonation * c.impact_per_pound;
      const compoundedImpact = baseImpact * stabilityMultiplier * referralMultiplier;

      const key = c.charity_id || c.name;
      charityCumulative[key] += compoundedImpact;
      monthImpact += compoundedImpact;

      return {
        charity_id: key,
        name: c.name,
        donation: charityDonation,
        impact: compoundedImpact,
        impact_unit: c.impact_unit,
        cumulative_impact: charityCumulative[key],
      };
    });

    cumulativeDonations += donationEffective;
    cumulativeImpact += monthImpact;

    months.push({
      month: m,
      active: true,
      donation,
      donation_effective: donationEffective,
      streak,
      stability_multiplier: stabilityMultiplier,
      referral_multiplier: referralMultiplier,
      impact: monthImpact,
      cumulative_donations: cumulativeDonations,
      cumulative_impact: cumulativeImpact,
      iem: cumulativeDonations > 0 ? cumulativeImpact / cumulativeDonations : 0,
      charity_impacts: charityImpacts,
    });
  }

  // Build charity totals
  const charityTotals: CharityTotal[] = enrichedCharities.map((c) => {
    const key = c.charity_id || c.name;
    const totalDonated = months.reduce(
      (sum, m) => sum + (m.charity_impacts.find((ci) => ci.charity_id === key)?.donation || 0),
      0
    );
    return {
      charity_id: key,
      name: c.name,
      total_donated: totalDonated,
      total_impact: charityCumulative[key],
      impact_unit: c.impact_unit,
    };
  });

  // Build yearly summaries
  const yearly: YearlySummary[] = [];
  for (let y = 0; y < Math.ceil(duration_months / 12); y++) {
    const yearMonths = months.filter(
      (m) => m.month > y * 12 && m.month <= (y + 1) * 12
    );
    const lastMonth = yearMonths[yearMonths.length - 1];
    yearly.push({
      year: y + 1,
      donated: yearMonths.reduce((s, m) => s + m.donation, 0),
      donated_effective: yearMonths.reduce((s, m) => s + m.donation_effective, 0),
      impact: yearMonths.reduce((s, m) => s + m.impact, 0),
      iem: lastMonth?.iem || 0,
      streak: lastMonth?.streak || 0,
    });
  }

  const lastMonth = months[months.length - 1];

  return {
    months,
    total_donated: months.reduce((s, m) => s + m.donation, 0),
    total_donated_effective: cumulativeDonations,
    total_impact: cumulativeImpact,
    final_iem: lastMonth?.iem || 0,
    final_streak: lastMonth?.streak || 0,
    charity_totals: charityTotals,
    yearly_summaries: yearly,
  };
}

// ---------------------------------------------------------------------------
// Irregular Giver Comparison
// ---------------------------------------------------------------------------

/**
 * Simulate an irregular giver for comparison.
 * Same total annual amount, but given sporadically with no streak benefits.
 * No stability bonus, no referral effect, no annual increases.
 */
export function runIrregularComparison(
  monthly_amount: number,
  charities: CharityImpactProfile[],
  duration_months: number = 120
): IrregularSnapshot[] {
  const rand = seededRandom(99);
  const snapshots: IrregularSnapshot[] = [];
  let cumDonations = 0;
  let cumImpact = 0;

  // Average impact per pound across portfolio
  const avgImpactPerPound =
    charities.reduce((sum, c) => {
      const defaults = DEFAULT_IMPACT_PROFILES[c.name];
      const ipp = c.impact_per_pound || defaults?.impact_per_pound || 0.1;
      return sum + ipp * (c.allocation_pct / 100);
    }, 0);

  for (let m = 1; m <= duration_months; m++) {
    // Irregular: ~60% chance of giving in any month, with variable amounts
    const gives = rand() < 0.6;
    // When they give, amount varies between 0.5x and 2x to maintain similar annual total
    const amount = gives ? monthly_amount * (0.5 + rand() * 1.5) : 0;
    const impact = amount * avgImpactPerPound; // No stability or referral bonus

    cumDonations += amount;
    cumImpact += impact;

    snapshots.push({
      month: m,
      active: gives,
      donation: amount,
      cumulative_donations: cumDonations,
      cumulative_impact: cumImpact,
    });
  }

  return snapshots;
}

// ---------------------------------------------------------------------------
// Comparison runner
// ---------------------------------------------------------------------------

/**
 * Run both Kind Curve and irregular simulations for side-by-side comparison.
 */
export function runComparison(
  params: EngineParams,
  charities: CharityImpactProfile[]
): ComparisonResult {
  return {
    kindCurve: runEngine(params, charities),
    irregular: runIrregularComparison(
      params.monthly_amount,
      charities,
      params.duration_months
    ),
  };
}

// ---------------------------------------------------------------------------
// Chart data helpers (drop-in replacements for old impactProjection.ts)
// ---------------------------------------------------------------------------

/**
 * Generate projection data for the consistency page chart.
 * This replaces the old generateProjectionData() with real engine output.
 */
export function generateProjectionData(
  monthly_amount: number = 15,
  charities: CharityImpactProfile[] = []
): { year: number; kindCurve: number; irregular: number }[] {
  // If no charities provided, use a default single-charity profile
  const portfolioCharities =
    charities.length > 0
      ? charities
      : [
          {
            charity_id: "default",
            name: "Default",
            allocation_pct: 100,
            impact_per_pound: 0.15,
            impact_unit: "impact units",
          },
        ];

  const params: EngineParams = {
    ...DEFAULT_ENGINE_PARAMS,
    monthly_amount,
  };

  const comparison = runComparison(params, portfolioCharities);

  // Return year-by-year for chart
  return comparison.kindCurve.yearly_summaries.map((ys, i) => ({
    year: ys.year,
    kindCurve: Math.round(ys.impact * 100) / 100,
    irregular: Math.round(
      (comparison.irregular
        .filter((m) => m.month > i * 12 && m.month <= (i + 1) * 12)
        .reduce((s, m) => s + m.cumulative_impact, 0) /
        Math.max(
          1,
          comparison.irregular.filter(
            (m) => m.month > i * 12 && m.month <= (i + 1) * 12
          ).length
        )) *
        100
    ) / 100,
  }));
}

/**
 * Generate sparkline data for the dashboard.
 * Replaces the old generateSparklineData() with real cumulative impact.
 */
export function generateSparklineData(
  monthly_amount: number = 15,
  charities: CharityImpactProfile[] = []
): { month: number; value: number }[] {
  const portfolioCharities =
    charities.length > 0
      ? charities
      : [
          {
            charity_id: "default",
            name: "Default",
            allocation_pct: 100,
            impact_per_pound: 0.15,
            impact_unit: "impact units",
          },
        ];

  const params: EngineParams = {
    ...DEFAULT_ENGINE_PARAMS,
    monthly_amount,
    duration_months: 12,
  };

  const result = runEngine(params, portfolioCharities);

  return result.months.map((m) => ({
    month: m.month,
    value: Math.round(m.cumulative_impact * 100) / 100,
  }));
}
