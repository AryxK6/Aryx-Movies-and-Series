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
        background: "#0a0a0a",
        brand: {
          DEFAULT: "#e50914",
          dark: "#b20710",
        },
        surface: {
          DEFAULT: "#141414",
          light: "#1f1f1f",
          lighter: "#2a2a2a",
        },
      },
    },
  },
  plugins: [],
};

export default config;
