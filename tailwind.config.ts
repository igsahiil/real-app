import type { Config } from "tailwindcss";

export default {
  darkMode: "class",
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
        gold: {
          50: '#FDFBF7',
          100: '#FAF2D6',
          200: '#F4E4A3',
          300: '#EED66F',
          400: '#E5C439',
          500: '#D4AF37', // Brand Luxury Gold from RD Enterprise Logo
          600: '#B8860B', // Rich Deep Gold
          700: '#946B08',
          800: '#75540B',
          900: '#523B0B',
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
