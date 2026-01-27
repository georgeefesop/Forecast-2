import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        background: {
          base: "var(--color-bg-base)",
          surface: "var(--color-bg-surface)",
          elevated: "var(--color-bg-elevated)",
          overlay: "var(--color-bg-overlay)",
        },
        text: {
          primary: "var(--color-text-primary)",
          secondary: "var(--color-text-secondary)",
          tertiary: "var(--color-text-tertiary)",
          inverse: "var(--color-text-inverse)",
        },
        border: {
          subtle: "var(--color-border-subtle)",
          default: "var(--color-border-default)",
          strong: "var(--color-border-strong)",
        },
        semantic: {
          success: "var(--color-semantic-success)",
          warning: "var(--color-semantic-warning)",
          error: "var(--color-semantic-error)",
          info: "var(--color-semantic-info)",
        },
        brand: {
          DEFAULT: "var(--color-brand)",
          accent: "var(--color-brand-accent)",
          "accent-hover": "var(--color-brand-accent-hover)",
          "accent-active": "var(--color-brand-accent-active)",
          parchment: "#EBE5DE",
        },
      },
      spacing: {
        0.5: "var(--spacing-0_5)",
        1: "var(--spacing-1)",
        1.5: "var(--spacing-1_5)",
        2: "var(--spacing-2)",
        3: "var(--spacing-3)",
        4: "var(--spacing-4)",
        6: "var(--spacing-6)",
        8: "var(--spacing-8)",
        12: "var(--spacing-12)",
        16: "var(--spacing-16)",
        24: "var(--spacing-24)",
        32: "var(--spacing-32)",
        48: "var(--spacing-48)",
        64: "var(--spacing-64)",
      },
      borderRadius: {
        sm: "var(--radius-sm)",
        md: "var(--radius-md)",
        lg: "var(--radius-lg)",
        xl: "var(--radius-xl)",
        full: "var(--radius-full)",
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        md: "var(--shadow-md)",
        lg: "var(--shadow-lg)",
        xl: "var(--shadow-xl)",
        "2xl": "var(--shadow-2xl)",
      },
      fontSize: {
        "fluid-xs": "clamp(0.75rem, 0.7rem + 0.25vw, 0.875rem)",
        "fluid-sm": "clamp(0.875rem, 0.8rem + 0.375vw, 1rem)",
        "fluid-base": "clamp(1rem, 0.95rem + 0.25vw, 1.125rem)",
        "fluid-lg": "clamp(1.125rem, 1rem + 0.625vw, 1.5rem)",
        "fluid-xl": "clamp(1.25rem, 1.1rem + 0.75vw, 1.875rem)",
        "fluid-2xl": "clamp(1.5rem, 1.3rem + 1vw, 2.25rem)",
        "fluid-3xl": "clamp(1.875rem, 1.6rem + 1.375vw, 3rem)",
        "fluid-4xl": "clamp(2.25rem, 2rem + 1.25vw, 3.75rem)",
      },
      transitionDuration: {
        fast: "var(--duration-fast)",
        base: "var(--duration-base)",
        slow: "var(--duration-slow)",
      },
      transitionTimingFunction: {
        ease: "var(--easing-ease)",
        "ease-in": "var(--easing-ease-in)",
        "ease-out": "var(--easing-ease-out)",
        "ease-in-out": "var(--easing-ease-in-out)",
      },
    },
  },
  plugins: [],
};
export default config;
