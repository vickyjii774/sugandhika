import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          light: "#7CB342", // Primary Accent Light Green
          dark: "#2E7D32",  // Deep Luxury Eco Green
          hover: "#1B5E20", // Extra Deep Green
          gold: "#D4AF37",  // Luxury Gold Accent
          cream: "#F9FBF7", // Soft Organic Background
          surface: "#FFFFFF",
          muted: "#F4F7F2",
          border: "#E2E8F0",
        },
      },
      borderRadius: {
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
      boxShadow: {
        soft: "0 4px 20px -2px rgba(46, 125, 50, 0.08)",
        card: "0 10px 30px -5px rgba(0, 0, 0, 0.05)",
        hover: "0 20px 40px -10px rgba(46, 125, 50, 0.15)",
        glass: "0 8px 32px 0 rgba(31, 38, 135, 0.07)",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(8px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        pulseSlow: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },
      animation: {
        fadeIn: "fadeIn 0.3s ease-out forwards",
        pulseSlow: "pulseSlow 3s infinite ease-in-out",
      },
    },
  },
  plugins: [],
};

export default config;
