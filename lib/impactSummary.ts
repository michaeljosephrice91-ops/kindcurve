import type { CharityTotal } from "./compoundingEngine";

/**
 * Impact aggregated by unit (which, in the demo data, maps one-to-one onto a
 * cause theme — every charity within a theme shares a unit).
 *
 * WHY THIS EXISTS: impact units are not comparable to each other. "276 meals"
 * is not more than "69 support sessions" — they measure different things at
 * different unit costs, so ranking charities by raw impact number is
 * meaningless and simply surfaces whichever theme has the cheapest unit.
 * Summing WITHIN a unit is valid; ordering is therefore by money allocated,
 * which is the one figure that is comparable across themes.
 */
export interface ImpactGroup {
  impact_unit: string;
  total_impact: number;
  total_donated: number;
  charity_count: number;
}

export function groupImpactByUnit(totals: CharityTotal[]): ImpactGroup[] {
  const map = new Map<string, ImpactGroup>();

  for (const t of totals) {
    const existing = map.get(t.impact_unit);
    if (existing) {
      existing.total_impact += t.total_impact;
      existing.total_donated += t.total_donated;
      existing.charity_count += 1;
    } else {
      map.set(t.impact_unit, {
        impact_unit: t.impact_unit,
        total_impact: t.total_impact,
        total_donated: t.total_donated,
        charity_count: 1,
      });
    }
  }

  return Array.from(map.values())
    .filter((g) => g.total_impact > 0)
    .sort((a, b) => b.total_donated - a.total_donated);
}

/** "6 charities" / "1 charity" */
export function charityCountLabel(n: number): string {
  return n === 1 ? "1 charity" : `${n} charities`;
}
