import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "../../packages/ui/src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        ink: "#090b10",
        panel: "#10141d",
        line: "#232a36",
        mint: "#8bf5cf",
        sky: "#8fc7ff",
        amber: "#ffd166",
        rose: "#ff8aa1"
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(139,245,207,0.12), 0 18px 70px rgba(0,0,0,0.35)"
      }
    }
  },
  plugins: []
};

export default config;
