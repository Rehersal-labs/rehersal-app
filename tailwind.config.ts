import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        surface: {
          DEFAULT: "var(--surface)",
          elevated: "var(--surface-elevated)",
        },
        border: {
          subtle: "var(--border-subtle)",
          DEFAULT: "var(--border-default)",
        },
        foreground: {
          primary: "var(--text-primary)",
          secondary: "var(--text-secondary)",
          tertiary: "var(--text-tertiary)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--background)",
        },
        success: "var(--success)",
        critical: "var(--critical)",
      },
      fontFamily: {
        display: ["var(--font-fraunces)", "serif"],
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      fontSize: {
        "display-1": ["64px", { lineHeight: "1.05", letterSpacing: "-0.02em" }],
        "display-2": ["48px", { lineHeight: "1.1", letterSpacing: "-0.015em" }],
        h1: ["32px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        h2: ["24px", { lineHeight: "1.3", letterSpacing: "-0.005em" }],
        h3: ["18px", { lineHeight: "1.4" }],
        "body-lg": ["17px", { lineHeight: "1.6" }],
        body: ["15px", { lineHeight: "1.55" }],
        small: ["13px", { lineHeight: "1.5" }],
        caption: [
          "11px",
          { lineHeight: "1.4", letterSpacing: "0.05em" },
        ],
      },
      maxWidth: {
        app: "1280px",
        marketing: "1100px",
      },
      spacing: {
        sidebar: "240px",
      },
      boxShadow: {
        float: "0 12px 40px rgba(0,0,0,0.5)",
        "light-sm": "0 1px 2px rgba(10,12,30,0.06)",
        "light-lg": "0 8px 24px rgba(10,12,30,0.12)",
        "accent-glow": "0 0 28px rgba(124,106,247,0.35)",
        "card": "0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.04)",
        "card-hover": "0 8px 32px rgba(0,0,0,0.4), 0 0 0 1px rgba(124,106,247,0.2)",
      },
      transitionDuration: {
        standard: "180ms",
        slow: "320ms",
      },
      transitionTimingFunction: {
        reveal: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(4px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        pulseAccent: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-12px)" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.4" },
          "50%": { opacity: "0.8" },
        },
        "gradient-flow": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 320ms cubic-bezier(0.16, 1, 0.3, 1) forwards",
        "pulse-accent": "pulseAccent 1.5s ease-in-out infinite",
        float: "float 7s ease-in-out infinite",
        "float-slow": "float 10s ease-in-out infinite",
        "glow-pulse": "glow-pulse 3s ease-in-out infinite",
        "gradient-flow": "gradient-flow 8s ease infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
