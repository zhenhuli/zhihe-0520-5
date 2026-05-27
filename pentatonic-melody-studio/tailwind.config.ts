import type { Config } from "tailwindcss";

export default {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        ink: {
          DEFAULT: "#2C1810",
          light: "#4A3728",
          dark: "#1A0F0A",
        },
        parchment: {
          DEFAULT: "#F5E6D3",
          light: "#FAF0E6",
          dark: "#E8D5C4",
        },
        vermilion: {
          DEFAULT: "#E34234",
          light: "#F06B5F",
          dark: "#C73228",
        },
        jade: {
          DEFAULT: "#00A86B",
          light: "#2DBF8A",
          dark: "#00875A",
        },
        gold: {
          DEFAULT: "#D4AF37",
          light: "#E5C158",
          dark: "#B8962E",
        },
        indigo: {
          DEFAULT: "#4B0082",
          light: "#6B2F9E",
          dark: "#3A0066",
        },
      },
      fontFamily: {
        chinese: ["\"Noto Serif SC\"", "serif"],
      },
      animation: {
        "pulse-slow": "pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite",
        "bounce-gentle": "bounce 2s infinite",
        "float": "float 6s ease-in-out infinite",
      },
      keyframes: {
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-10px)" },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
