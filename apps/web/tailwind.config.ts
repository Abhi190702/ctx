import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        card: "var(--card)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        ink: "#F3F3EF",
        panel: "#FFFFFF",
        line: "#E7E5DF",
        strongline: "#D8D6CE",
        mint: "#2A9D8F",
        "mint-dark": "#1F766D",
        "mint-soft": "#E7F5F2",
        sky: "#4F7FBF",
        amber: "#B7791F",
        rose: "#B42318"
      },
      boxShadow: {
        glow: "0 1px 2px rgba(24,24,23,0.04), 0 18px 48px rgba(24,24,23,0.08)"
      }
    }
  },
  plugins: []
};

export default config;
