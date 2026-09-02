export interface DBCharity {
  id: string;
  name: string;
  theme_id: string;
  geo: string;
  url: string;
}

export interface PortfolioAllocation {
  charity_id: string;
  charity_name: string;
  allocation_pct: number;
}

export function generatePortfolioFromDB(
  selectedThemes: string[],
  scope: "local" | "global" | "mix",
  allCharities: DBCharity[]
): PortfolioAllocation[] {
  if (selectedThemes.length === 0) return [];

  const ukCharities = allCharities.filter(
    (c) => c.geo === "UK_LOCAL" || c.geo === "UK_NATIONAL"
  );
  const globalCharities = allCharities.filter((c) => c.geo === "GLOBAL");

  const themeCount = selectedThemes.length;
  const charitiesPerTheme = themeCount === 1 ? 4 : themeCount === 2 ? 3 : 2;

  const selected: DBCharity[] = [];

  selectedThemes.forEach((themeId) => {
    let pool: DBCharity[];

    if (scope === "local") {
      pool = ukCharities.filter((c) => c.theme_id === themeId);
    } else if (scope === "global") {
      const themeUK = allCharities.filter(
        (c) => c.theme_id === themeId && c.geo === "UK_NATIONAL"
      );
      const themeGlobal = globalCharities;
      pool = [...themeUK, ...themeGlobal];
    } else {
      pool = allCharities.filter((c) => c.theme_id === themeId);
      const globals = globalCharities.filter(
        (c) => !pool.find((p) => p.id === c.id)
      );
      pool = [...pool, ...globals];
    }

    pool = pool.filter((c) => !selected.find((s) => s.id === c.id));
    const picks = pool.slice(0, charitiesPerTheme);
    selected.push(...picks);
  });

  if (selected.length < themeCount * charitiesPerTheme) {
    const remaining = allCharities.filter(
      (c) => !selected.find((s) => s.id === c.id)
    );
    const needed = Math.min(
      themeCount * charitiesPerTheme - selected.length,
      remaining.length
    );
    selected.push(...remaining.slice(0, needed));
  }

  const final = selected.slice(0, 8);
  if (final.length === 0) return [];

  // Weighted, not equal. An even split renders as identical slices, which makes
  // the one screen that best demonstrates allocation look like nothing was
  // allocated at all. These are a starting point the donor is meant to move.
  const weights = final.map((_, i) => 1 / (i + 1.55));
  const totalWeight = weights.reduce((a, b) => a + b, 0);
  const raw = weights.map((w) => (w / totalWeight) * 100);

  const rounded = raw.map((v) => Math.round(v * 10) / 10);
  const drift = +(100 - rounded.reduce((a, b) => a + b, 0)).toFixed(1);
  rounded[0] = +(rounded[0] + drift).toFixed(1);

  return final.map((charity, i) => ({
    charity_id: charity.id,
    charity_name: charity.name,
    allocation_pct: rounded[i],
  }));
}
