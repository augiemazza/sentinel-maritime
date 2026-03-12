import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        "console-bg": "#060a10",
        "console-panel": "#0a1020",
        "console-border": "#1a2a40",
        "console-muted": "#2a3a50",
        "accent-cyan": "#00d4ff",
        "accent-amber": "#f59e0b",
        "accent-red": "#ef4444",
        "accent-green": "#22c55e",
        "text-primary": "#e2e8f0",
        "text-secondary": "#94a3b8",
        "text-muted": "#475569",
      },
      fontFamily: {
        mono: ["JetBrains Mono", "Fira Code", "ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
