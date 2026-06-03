/**
 * Kind Curve — local demo data.
 *
 * Replaces the Supabase `themes` and `charities` tables for the walkthrough.
 * No network, no env vars. Drives q1 (themes) and q2 (portfolio generation).
 *
 * NOTE: charity names are illustrative and do NOT represent real partner
 * organisations. This keeps the demo clear of any "named partner" implication.
 */

export interface DemoTheme {
  id: string;        // matches THEME_LABELS keys in lib/constants.ts
  label: string;
  icon: string;      // matches ICON_MAP keys in q1 (Heart, Brain, Leaf, GraduationCap, Home, Shield)
  color: string;
  sort_order: number;
}

export interface DemoCharity {
  id: string;
  name: string;
  theme_id: string;                       // matches a DemoTheme.id
  geo: "UK_LOCAL" | "UK_NATIONAL" | "GLOBAL";
  url: string;
  active: boolean;
  /** Concrete impact produced per £1 donated. ILLUSTRATIVE — assumed, not empirical. */
  impact_per_pound: number;
  /** Human-readable unit for the impact above (e.g. "nights of shelter"). */
  impact_unit: string;
}

/**
 * Per-theme impact assumptions used to give the demo concrete, themed outcomes.
 *
 * These figures are ILLUSTRATIVE placeholders for the walkthrough — they are
 * assumed for storytelling, NOT empirically derived or charity-endorsed. They
 * are kept here, in the open, so the model stays fully inspectable.
 *
 * impact_per_pound ≈ 1 / (assumed cost per unit). e.g. a "night of shelter"
 * assumed at ~£20 → 0.05 nights per £1.
 */
export const THEME_IMPACT: Record<string, { impact_per_pound: number; impact_unit: string }> = {
  local_hardship: { impact_per_pound: 0.4,  impact_unit: "meals provided" },      // ~£2.50/meal
  homelessness:   { impact_per_pound: 0.05, impact_unit: "nights of shelter" },   // ~£20/night
  children:       { impact_per_pound: 0.2,  impact_unit: "school days funded" },  // ~£5/day
  mental_health:  { impact_per_pound: 0.1,  impact_unit: "support sessions" },    // ~£10/session
  domestic_abuse: { impact_per_pound: 0.04, impact_unit: "safe nights" },         // ~£25/night
  climate:        { impact_per_pound: 1.0,  impact_unit: "trees planted" },       // ~£1/tree
};

/** Fallback used if a charity's theme has no impact mapping. */
export const FALLBACK_IMPACT = { impact_per_pound: 0.15, impact_unit: "people supported" };

export const DEMO_THEMES: DemoTheme[] = [
  { id: "local_hardship", label: "Local hardship",          icon: "Heart",         color: "#fb7185", sort_order: 1 },
  { id: "homelessness",   label: "Homelessness",            icon: "Home",          color: "#22d3ee", sort_order: 2 },
  { id: "children",       label: "Children & young people", icon: "GraduationCap", color: "#a855f7", sort_order: 3 },
  { id: "mental_health",  label: "Mental health",           icon: "Brain",         color: "#4cc9f0", sort_order: 4 },
  { id: "domestic_abuse", label: "Domestic abuse",          icon: "Shield",        color: "#f472b6", sort_order: 5 },
  { id: "climate",        label: "Climate & nature",        icon: "Leaf",          color: "#34d399", sort_order: 6 },
];

/** Raw seed (without impact fields — those are derived from THEME_IMPACT below). */
type RawCharity = Omit<DemoCharity, "impact_per_pound" | "impact_unit">;

/**
 * Geographic efficiency modifier (illustrative). Different delivery contexts
 * produce different cost-per-unit, so two charities in the same theme can show
 * slightly different impact-per-£. Kept explicit so the model is auditable.
 */
const GEO_EFFICIENCY: Record<DemoCharity["geo"], number> = {
  UK_LOCAL: 1.15,    // lean, local delivery
  UK_NATIONAL: 1.0,  // baseline
  GLOBAL: 1.3,       // lower cost-per-unit in many contexts
};

const RAW_CHARITIES: RawCharity[] = [
  // local_hardship
  { id: "lh1", name: "Northgate Community Fund", theme_id: "local_hardship", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "lh2", name: "The Doorstep Trust",       theme_id: "local_hardship", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "lh3", name: "Hearth & Table",           theme_id: "local_hardship", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "lh4", name: "Common Ground Relief",     theme_id: "local_hardship", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "lh5", name: "Open Hands International",  theme_id: "local_hardship", geo: "GLOBAL",      url: "#", active: true },
  { id: "lh6", name: "Everyday Aid Collective",  theme_id: "local_hardship", geo: "GLOBAL",      url: "#", active: true },

  // homelessness
  { id: "hl1", name: "Nighthaven Shelter",       theme_id: "homelessness", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "hl2", name: "Streetlight Outreach",     theme_id: "homelessness", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "hl3", name: "First Key Housing",        theme_id: "homelessness", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "hl4", name: "Roofline Foundation",      theme_id: "homelessness", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "hl5", name: "Safe Harbour International",theme_id: "homelessness", geo: "GLOBAL",     url: "#", active: true },
  { id: "hl6", name: "Shelter Worldwide",        theme_id: "homelessness", geo: "GLOBAL",      url: "#", active: true },

  // children
  { id: "ch1", name: "Brightpath Youth",         theme_id: "children", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "ch2", name: "Playfields UK",            theme_id: "children", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "ch3", name: "The Acorn Children's Trust",theme_id: "children", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "ch4", name: "LearnAhead",               theme_id: "children", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "ch5", name: "Global Childhood Fund",    theme_id: "children", geo: "GLOBAL",      url: "#", active: true },
  { id: "ch6", name: "Young Futures Worldwide",  theme_id: "children", geo: "GLOBAL",      url: "#", active: true },

  // mental_health
  { id: "mh1", name: "The Listening Line",       theme_id: "mental_health", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "mh2", name: "Headway Together",         theme_id: "mental_health", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "mh3", name: "Stillwater Mind",          theme_id: "mental_health", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "mh4", name: "Open Minds Alliance",      theme_id: "mental_health", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "mh5", name: "Mindbridge Global",        theme_id: "mental_health", geo: "GLOBAL",      url: "#", active: true },
  { id: "mh6", name: "Steady State Foundation",  theme_id: "mental_health", geo: "GLOBAL",      url: "#", active: true },

  // domestic_abuse
  { id: "da1", name: "Sanctuary Local",          theme_id: "domestic_abuse", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "da2", name: "The Refuge Line",          theme_id: "domestic_abuse", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "da3", name: "Haven House Network",      theme_id: "domestic_abuse", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "da4", name: "Safe Steps Trust",         theme_id: "domestic_abuse", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "da5", name: "Safe Passage International",theme_id: "domestic_abuse", geo: "GLOBAL",     url: "#", active: true },
  { id: "da6", name: "Shield & Shelter Global",  theme_id: "domestic_abuse", geo: "GLOBAL",      url: "#", active: true },

  // climate
  { id: "cl1", name: "Greenshoot Trust",         theme_id: "climate", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "cl2", name: "The Hedgerow Project",     theme_id: "climate", geo: "UK_LOCAL",    url: "#", active: true },
  { id: "cl3", name: "Rivers & Woods UK",        theme_id: "climate", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "cl4", name: "Coastline Guardians",      theme_id: "climate", geo: "UK_NATIONAL", url: "#", active: true },
  { id: "cl5", name: "Rainforest Futures",       theme_id: "climate", geo: "GLOBAL",      url: "#", active: true },
  { id: "cl6", name: "Blue Planet Coalition",    theme_id: "climate", geo: "GLOBAL",      url: "#", active: true },
];

/** Full charity records with derived, illustrative impact figures attached. */
export const DEMO_CHARITIES: DemoCharity[] = RAW_CHARITIES.map((c) => {
  const themeImpact = THEME_IMPACT[c.theme_id] ?? FALLBACK_IMPACT;
  return {
    ...c,
    impact_per_pound: +(themeImpact.impact_per_pound * GEO_EFFICIENCY[c.geo]).toFixed(4),
    impact_unit: themeImpact.impact_unit,
  };
});

const DEMO_CHARITY_BY_ID: Record<string, DemoCharity> = Object.fromEntries(
  DEMO_CHARITIES.map((c) => [c.id, c])
);

/** All active charities — drop-in replacement for the Supabase fetch in q2. */
export function getDemoCharities(): DemoCharity[] {
  return DEMO_CHARITIES.filter((c) => c.active);
}

/** Look up the illustrative impact profile for a charity by its demo id. */
export function impactForCharityId(
  charity_id?: string
): { impact_per_pound: number; impact_unit: string } {
  const c = charity_id ? DEMO_CHARITY_BY_ID[charity_id] : undefined;
  return c
    ? { impact_per_pound: c.impact_per_pound, impact_unit: c.impact_unit }
    : { ...FALLBACK_IMPACT };
}

/** A charity entry as held in the Zustand store. */
export interface StoreCharity {
  name: string;
  allocation: number;
  charity_id?: string;
}

/**
 * Build engine-ready impact profiles from the user's stored portfolio.
 * Single source of truth so every page (consistency, commit, success,
 * dashboard) feeds the compounding engine identical, demo-data-driven figures.
 */
export function buildCharityProfiles(charities: StoreCharity[]): {
  charity_id: string;
  name: string;
  allocation_pct: number;
  impact_per_pound: number;
  impact_unit: string;
}[] {
  return charities.map((c) => {
    const impact = impactForCharityId(c.charity_id);
    return {
      charity_id: c.charity_id || c.name,
      name: c.name,
      allocation_pct: c.allocation,
      impact_per_pound: impact.impact_per_pound,
      impact_unit: impact.impact_unit,
    };
  });
}
