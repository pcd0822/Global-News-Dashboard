import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        surface: "#faf8fc",
        card: "#ffffff",
        accent: "#8b9dc3",
        muted: "#7d8a9a",
        pastel: {
          mint: "#b8e0d2",
          lavender: "#d4c5f9",
          peach: "#ffdab9",
          sky: "#a8d4f0",
          pink: "#f5c6d6",
          sage: "#c5d1c7",
          cream: "#f5f0e8",
          lilac: "#e2d4f0",
        },
      },
      fontFamily: {
        sans: ["system-ui", "Segoe UI", "sans-serif"],
        mono: ["ui-monospace", "monospace"],
      },
    },
  },
  plugins: [],
};

export default config;
