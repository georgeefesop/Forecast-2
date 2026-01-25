/**
 * Design Tokens System
 * 
 * All design values are defined here as tokens and mapped to CSS variables.
 * Components should use these tokens via Tailwind classes, never hardcoded values.
 */

export const designTokens = {
  spacing: {
    0.5: "0.125rem", // 2px
    1: "0.25rem",    // 4px
    1.5: "0.375rem", // 6px
    2: "0.5rem",     // 8px
    3: "0.75rem",    // 12px
    4: "1rem",       // 16px
    6: "1.5rem",     // 24px
    8: "2rem",       // 32px
    12: "3rem",      // 48px
    16: "4rem",      // 64px
    24: "6rem",      // 96px
    32: "8rem",      // 128px
    48: "12rem",     // 192px
    64: "16rem",     // 256px
  },
  radius: {
    sm: "0.25rem",   // 4px
    md: "0.5rem",    // 8px
    lg: "0.75rem",   // 12px
    xl: "1rem",      // 16px
    full: "9999px",
  },
  shadow: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
  },
  motion: {
    duration: {
      fast: "150ms",
      base: "200ms",
      slow: "300ms",
    },
    easing: {
      ease: "cubic-bezier(0.4, 0, 0.2, 1)",
      "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
      "ease-out": "cubic-bezier(0, 0, 0.2, 1)",
      "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
    },
  },
  typography: {
    lineHeight: {
      tight: "1.25",
      normal: "1.5",
      relaxed: "1.75",
    },
    fontWeight: {
      normal: "400",
      medium: "500",
      semibold: "600",
      bold: "700",
    },
  },
} as const;
