import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./content/**/*.{html,md}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        hub: {
          bg: "#0f1117",
          card: "#181b22",
          "card-hover": "#1f242e",
          subcard: "#13161c",
          "subcard-hover": "#1c212b",
          border: "#272d3b",
          "border-hover": "#3d465c",
          primary: "#f0f3f6",
          secondary: "#949eb2",
          muted: "#5e687e",
          green: "#00ff88",
          blue: "#38bdf8",
          purple: "#a855f7",
          amber: "#f59e0b",
          red: "#ef4444",
        },
      },
      fontFamily: {
        sans: ["var(--font-inter)", "Inter", "-apple-system", "BlinkMacSystemFont", "sans-serif"],
        mono: ["var(--font-jetbrains-mono)", "JetBrains Mono", "monospace"],
      },
      borderRadius: {
        card: "14px",
        btn: "10px",
      },
      boxShadow: {
        glow: "0 0 25px rgba(0, 255, 136, 0.15)",
        "glow-blue": "0 0 25px rgba(56, 189, 248, 0.2)",
      },
    },
  },
  plugins: [],
};

export default config;
