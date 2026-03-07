import { create } from "zustand";
import { persist } from "zustand/middleware";

interface CharityAllocation {
  name: string;
  allocation: number;
  charity_id?: string;
}

interface KindCurveState {
  darkMode: boolean;
  toggleDarkMode: () => void;

  selectedThemes: string[];
  setSelectedThemes: (themes: string[]) => void;
  scope: string | null;
  setScope: (scope: string) => void;

  charities: CharityAllocation[];
  setCharities: (charities: CharityAllocation[]) => void;
  initialCharities: CharityAllocation[];
  setInitialCharities: (charities: CharityAllocation[]) => void;

  monthlyGift: number;
  setMonthlyGift: (amount: number) => void;

  reset: () => void;
}

export const useKindCurveStore = create<KindCurveState>()(
  persist(
    (set) => ({
      darkMode: false,
      toggleDarkMode: () => set((s) => ({ darkMode: !s.darkMode })),

      selectedThemes: [],
      setSelectedThemes: (themes) => set({ selectedThemes: themes }),
      scope: null,
      setScope: (scope) => set({ scope }),

      charities: [],
      setCharities: (charities) => set({ charities }),
      initialCharities: [],
      setInitialCharities: (charities) => set({ initialCharities: charities }),

      monthlyGift: 15,
      setMonthlyGift: (amount) => set({ monthlyGift: amount }),

      reset: () =>
        set({
          selectedThemes: [],
          scope: null,
          charities: [],
          initialCharities: [],
          monthlyGift: 15,
        }),
    }),
    { name: "kindcurve-store" }
  )
);
