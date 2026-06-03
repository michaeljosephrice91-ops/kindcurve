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
}

export const DEMO_THEMES: DemoTheme[] = [
  { id: "local_hardship", label: "Local hardship",          icon: "Heart",         color: "#fb7185", sort_order: 1 },
  { id: "homelessness",   label: "Homelessness",            icon: "Home",          color: "#22d3ee", sort_order: 2 },
  { id: "children",       label: "Children & young people", icon: "GraduationCap", color: "#a855f7", sort_order: 3 },
  { id: "mental_health",  label: "Mental health",           icon: "Brain",         color: "#4cc9f0", sort_order: 4 },
  { id: "domestic_abuse", label: "Domestic abuse",          icon: "Shield",        color: "#f472b6", sort_order: 5 },
  { id: "climate",        label: "Climate & nature",        icon: "Leaf",          color: "#34d399", sort_order: 6 },
];

export const DEMO_CHARITIES: DemoCharity[] = [
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

/** All active charities — drop-in replacement for the Supabase fetch in q2. */
export function getDemoCharities(): DemoCharity[] {
  return DEMO_CHARITIES.filter((c) => c.active);
}
