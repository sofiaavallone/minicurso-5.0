import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        serif: ["var(--font-serif)", "serif"],
        display: ["var(--font-serif)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },
      colors: {
        capsule: {
          bg: "#fcf0f5",
          ink: "#151515",
          text: "#3f3a40",
          rose: "#d0386a",
          plum: "#6b1650",
          pink: "#d6336c",
          orange: "#FF6419",
        },
      },
    },
  },
  plugins: [],
};

export default config;
