import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        kc: {
          cream: "#FFF9EB",
          teal: "#267D91",
          cyan: "#22d3ee",
          green: "#4BB78F",
          coral: "#E07060",
          purple: "#a855f7",
          pink: "#fb7185",
          sky: "#4cc9f0",
          dark: "#0a0a0a",
          card: "#111827",
          border: "#1e293b",
        },
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
      },
      borderRadius: {
        "2xl": "16px",
        "3xl": "20px",
      },
    },
  },
  plugins: [],
};
export default config;
