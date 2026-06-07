import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        court: {
          navy: "#155A8A",
          ocean: "#0D82A7",
          teal: "#0EA2A9",
          mint: "#10BFA0",
          green: "#86DA7A",
          mist: "#F4FBFA",
        },
      },
      boxShadow: {
        glow: "0 24px 80px rgba(16, 191, 160, 0.24)",
      },
    },
  },
  plugins: [],
};

export default config;
