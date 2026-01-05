import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Primary green - exact from stitch_main_dashboard
        "primary": "#19e65e",
        "primary-hover": "#14cc52",
        "primary-dark": "#14b84b",
        
        // Backgrounds
        "background-light": "#f6f8f6",
        "background-dark": "#112116",
        
        // Surfaces
        "surface-light": "#ffffff",
        "surface-dark": "#1c2e24",
        
        // Text
        "text-main": "#111813",
        "text-secondary": "#63886f",
        
        // Accents
        "expense": "#ef4444",
        "danger": "#ef4444",
        "success": "#19e65e",
        "info": "#3b82f6",
        
        // Borders
        "border-light": "#e5e8e6",
        "border-dark": "#2a4030",
        "input-border": "#dce5df",
      },
      fontFamily: {
        "display": ["Manrope", "sans-serif"],
        "body": ["Manrope", "sans-serif"],
      },
      borderRadius: {
        "DEFAULT": "0.25rem",
        "lg": "0.5rem",
        "xl": "0.75rem",
        "2xl": "1rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
};
export default config;
