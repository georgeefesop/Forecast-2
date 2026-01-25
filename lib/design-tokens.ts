/**
 * Design Tokens System
 * 
 * Single source of truth for all design decisions in the Forecast app.
 * Follows industry best practices with hierarchical naming:
 * Foundation (type) → Property (UI element) → Modifier (purpose/state)
 * 
 * Structure:
 * - Primitives: Raw values (colors, spacing units, etc.)
 * - Semantic: Contextual tokens (brand, semantic colors, etc.)
 * - Component: Component-specific tokens (if needed)
 * 
 * Usage:
 * - CSS: Imported via app/globals.css as CSS variables
 * - TypeScript: Import tokens directly for email templates, etc.
 * - Tailwind: Mapped via tailwind.config.ts
 */

/**
 * Color Primitives
 * Raw color values used to build semantic tokens
 */
export const colorPrimitives = {
  // Brand colors
  indigo: {
    50: "#eef2ff",
    100: "#e0e7ff",
    200: "#c7d2fe",
    300: "#a5b4fc",
    400: "#818cf8",
    500: "#6366f1", // Primary brand color
    600: "#4f46e5",
    700: "#4338ca",
    800: "#3730a3",
    900: "#312e81",
  },
  purple: {
    50: "#faf5ff",
    100: "#f3e8ff",
    200: "#e9d5ff",
    300: "#d8b4fe",
    400: "#c084fc",
    500: "#a855f7",
    600: "#9333ea",
    700: "#7e22ce",
    800: "#6b21a8",
    900: "#581c87",
  },
  // Neutral grays
  gray: {
    50: "#f9fafb",
    100: "#f3f4f6",
    200: "#e5e7eb",
    300: "#d1d5db",
    400: "#9ca3af",
    500: "#6b7280",
    600: "#4b5563",
    700: "#374151",
    800: "#1f2937",
    900: "#111827",
  },
  // Semantic colors
  success: {
    50: "#ecfdf5",
    100: "#d1fae5",
    500: "#10b981",
    600: "#059669",
    700: "#047857",
  },
  warning: {
    50: "#fffbeb",
    100: "#fef3c7",
    500: "#f59e0b",
    600: "#d97706",
    700: "#b45309",
  },
  error: {
    50: "#fef2f2",
    100: "#fee2e2",
    500: "#ef4444",
    600: "#dc2626",
    700: "#b91c1c",
  },
  info: {
    50: "#eff6ff",
    100: "#dbeafe",
    500: "#3b82f6",
    600: "#2563eb",
    700: "#1d4ed8",
  },
} as const;

/**
 * Light Theme Tokens
 * Semantic tokens for light mode
 */
export const lightTheme = {
  color: {
    // Brand
    brand: {
      primary: colorPrimitives.indigo[500], // #6366f1
      accent: colorPrimitives.purple[500], // #a855f7 (was #8b5cf6, using standard purple-500)
    },
    // Background
    background: {
      base: colorPrimitives.gray[50], // #ffffff (white)
      surface: colorPrimitives.gray[50], // #f9fafb
      elevated: colorPrimitives.gray[50], // #ffffff
      overlay: "rgba(0, 0, 0, 0.5)",
    },
    // Text
    text: {
      primary: colorPrimitives.gray[900], // #111827
      secondary: colorPrimitives.gray[500], // #6b7280
      tertiary: colorPrimitives.gray[400], // #9ca3af
      inverse: colorPrimitives.gray[50], // #ffffff
    },
    // Border
    border: {
      subtle: colorPrimitives.gray[200], // #e5e7eb
      default: colorPrimitives.gray[300], // #d1d5db
      strong: colorPrimitives.gray[400], // #9ca3af
    },
    // Semantic
    semantic: {
      success: colorPrimitives.success[500], // #10b981
      warning: colorPrimitives.warning[500], // #f59e0b
      error: colorPrimitives.error[500], // #ef4444
      info: colorPrimitives.info[500], // #3b82f6
    },
  },
} as const;

/**
 * Dark Theme Tokens
 * Semantic tokens for dark mode
 */
export const darkTheme = {
  color: {
    // Brand (lighter for dark mode)
    brand: {
      primary: colorPrimitives.indigo[400], // #818cf8
      accent: colorPrimitives.purple[400], // #c084fc
    },
    // Background
    background: {
      base: "#0f172a", // slate-900
      surface: "#1e293b", // slate-800
      elevated: "#334155", // slate-700
      overlay: "rgba(0, 0, 0, 0.7)",
    },
    // Text
    text: {
      primary: "#f1f5f9", // slate-100
      secondary: "#cbd5e1", // slate-300
      tertiary: "#94a3b8", // slate-400
      inverse: "#0f172a", // slate-900
    },
    // Border
    border: {
      subtle: "#334155", // slate-700
      default: "#475569", // slate-600
      strong: "#64748b", // slate-500
    },
    // Semantic
    semantic: {
      success: "#22c55e", // green-500
      warning: "#fbbf24", // amber-400
      error: "#f87171", // red-400
      info: "#60a5fa", // blue-400
    },
  },
} as const;

/**
 * Spacing Tokens
 * Based on 4px base unit
 */
export const spacing = {
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
} as const;

/**
 * Border Radius Tokens
 */
export const radius = {
  sm: "0.25rem",   // 4px
  md: "0.5rem",    // 8px
  lg: "0.75rem",   // 12px
  xl: "1rem",      // 16px
  full: "9999px",
} as const;

/**
 * Shadow Tokens
 * Elevation system for depth
 */
export const shadow = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.25)",
} as const;

/**
 * Typography Tokens
 */
export const typography = {
  fontFamily: {
    sans: [
      "-apple-system",
      "BlinkMacSystemFont",
      "'Segoe UI'",
      "Roboto",
      "Oxygen",
      "Ubuntu",
      "Cantarell",
      "'Fira Sans'",
      "'Droid Sans'",
      "'Helvetica Neue'",
      "sans-serif",
    ].join(", "),
    mono: [
      "ui-monospace",
      "SFMono-Regular",
      "Menlo",
      "Monaco",
      "Consolas",
      "'Liberation Mono'",
      "'Courier New'",
      "monospace",
    ].join(", "),
  },
  fontSize: {
    xs: "0.75rem",    // 12px
    sm: "0.875rem",   // 14px
    base: "1rem",     // 16px
    lg: "1.125rem",   // 18px
    xl: "1.25rem",    // 20px
    "2xl": "1.5rem",  // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem",    // 48px
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
  lineHeight: {
    tight: "1.25",
    normal: "1.5",
    relaxed: "1.75",
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  },
} as const;

/**
 * Motion Tokens
 * Animation and transition values
 */
export const motion = {
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
} as const;

/**
 * Z-Index Tokens
 * Layering system
 */
export const zIndex = {
  base: 0,
  dropdown: 1000,
  sticky: 1020,
  fixed: 1030,
  modalBackdrop: 1040,
  modal: 1050,
  popover: 1060,
  tooltip: 1070,
} as const;

/**
 * Button & Toggle Design System
 * Comprehensive component tokens for interactive elements
 */
export const components = {
  button: {
    // Button variants
    variants: {
      default: {
        light: {
          bg: lightTheme.color.brand.primary,
          text: lightTheme.color.text.inverse,
          hover: "rgba(99, 102, 241, 0.9)", // brand/90
          active: "rgba(99, 102, 241, 0.8)",
          focus: "rgba(99, 102, 241, 0.2)",
        },
        dark: {
          bg: darkTheme.color.brand.primary,
          text: darkTheme.color.text.inverse,
          hover: "rgba(129, 140, 248, 0.9)",
          active: "rgba(129, 140, 248, 0.8)",
          focus: "rgba(129, 140, 248, 0.2)",
        },
      },
      outline: {
        light: {
          bg: "transparent",
          text: lightTheme.color.text.primary,
          border: lightTheme.color.border.default,
          hover: lightTheme.color.background.elevated,
          active: lightTheme.color.background.surface,
          focus: "rgba(99, 102, 241, 0.2)",
        },
        dark: {
          bg: "transparent",
          text: darkTheme.color.text.primary,
          border: darkTheme.color.border.default,
          hover: darkTheme.color.background.elevated,
          active: darkTheme.color.background.surface,
          focus: "rgba(129, 140, 248, 0.2)",
        },
      },
      secondary: {
        light: {
          bg: lightTheme.color.background.elevated,
          text: lightTheme.color.text.primary,
          hover: lightTheme.color.background.surface,
          active: lightTheme.color.background.elevated,
          focus: "rgba(99, 102, 241, 0.2)",
        },
        dark: {
          bg: darkTheme.color.background.elevated,
          text: darkTheme.color.text.primary,
          hover: darkTheme.color.background.surface,
          active: darkTheme.color.background.elevated,
          focus: "rgba(129, 140, 248, 0.2)",
        },
      },
      ghost: {
        light: {
          bg: "transparent",
          text: lightTheme.color.text.primary,
          hover: lightTheme.color.background.elevated,
          active: lightTheme.color.background.surface,
          focus: "rgba(99, 102, 241, 0.2)",
        },
        dark: {
          bg: "transparent",
          text: darkTheme.color.text.primary,
          hover: darkTheme.color.background.elevated,
          active: darkTheme.color.background.surface,
          focus: "rgba(129, 140, 248, 0.2)",
        },
      },
    },
    sizes: {
      sm: { height: "2.25rem", paddingX: "0.75rem", fontSize: "0.875rem" }, // 36px, 12px, 14px
      default: { height: "2.5rem", paddingX: "1rem", fontSize: "1rem" }, // 40px, 16px, 16px
      lg: { height: "2.75rem", paddingX: "2rem", fontSize: "1rem" }, // 44px, 32px, 16px
      icon: { height: "2.5rem", width: "2.5rem", fontSize: "1rem" }, // 40px square
    },
  },
  toggle: {
    // Toggle states
    states: {
      on: {
        light: {
          bg: lightTheme.color.semantic.success, // #10b981
          handle: lightTheme.color.text.inverse,
          border: lightTheme.color.semantic.success,
        },
        dark: {
          bg: darkTheme.color.semantic.success, // #22c55e
          handle: darkTheme.color.text.inverse,
          border: darkTheme.color.semantic.success,
        },
      },
      off: {
        light: {
          bg: colorPrimitives.gray[300], // #d1d5db
          handle: lightTheme.color.text.inverse,
          border: colorPrimitives.gray[400], // #9ca3af
        },
        dark: {
          bg: colorPrimitives.gray[600], // #4b5563
          handle: darkTheme.color.text.inverse,
          border: colorPrimitives.gray[500], // #6b7280
        },
      },
      disabled: {
        light: {
          bg: colorPrimitives.gray[200],
          handle: colorPrimitives.gray[400],
          opacity: 0.5,
        },
        dark: {
          bg: colorPrimitives.gray[700],
          handle: colorPrimitives.gray[500],
          opacity: 0.5,
        },
      },
      focus: {
        light: "rgba(16, 185, 129, 0.2)", // success/20
        dark: "rgba(34, 197, 94, 0.2)",
      },
    },
    sizes: {
      default: {
        width: "3rem", // 48px
        height: "1.75rem", // 28px
        handle: "1.5rem", // 24px
        handleOffset: "0.125rem", // 2px
      },
      sm: {
        width: "2.5rem", // 40px
        height: "1.5rem", // 24px
        handle: "1.25rem", // 20px
        handleOffset: "0.125rem", // 2px
      },
    },
  },
} as const;

/**
 * Complete Design Token System
 * Export all tokens in a structured format
 */
export const designTokens = {
  color: {
    primitives: colorPrimitives,
    light: lightTheme.color,
    dark: darkTheme.color,
  },
  spacing,
  radius,
  shadow,
  typography,
  motion,
  zIndex,
  components,
} as const;

/**
 * Helper: Get light theme colors (for email templates, etc.)
 * Returns actual hex values, not CSS variables
 */
export function getLightThemeColors() {
  return {
    brand: lightTheme.color.brand.primary,
    brandAccent: lightTheme.color.brand.accent,
    bgBase: "#ffffff", // Override to pure white for emails
    bgSurface: lightTheme.color.background.surface,
    bgElevated: "#ffffff",
    textPrimary: lightTheme.color.text.primary,
    textSecondary: lightTheme.color.text.secondary,
    textTertiary: lightTheme.color.text.tertiary,
    textInverse: lightTheme.color.text.inverse,
    borderSubtle: lightTheme.color.border.subtle,
    borderDefault: lightTheme.color.border.default,
    borderStrong: lightTheme.color.border.strong,
    semanticSuccess: lightTheme.color.semantic.success,
    semanticWarning: lightTheme.color.semantic.warning,
    semanticError: lightTheme.color.semantic.error,
    semanticInfo: lightTheme.color.semantic.info,
  };
}

/**
 * Type exports for TypeScript
 */
export type DesignTokens = typeof designTokens;
export type ColorPrimitives = typeof colorPrimitives;
export type LightTheme = typeof lightTheme;
export type DarkTheme = typeof darkTheme;
