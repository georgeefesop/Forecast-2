/**
 * Brand Colors
 * 
 * These values match the CSS variables defined in app/globals.css
 * Update both files when changing brand colors to keep them in sync.
 * 
 * For email templates, we need actual hex values (CSS variables don't work in emails).
 */

// Light theme colors (default for emails)
export const brandColors = {
  // Brand colors
  brand: "#6366f1", // --color-brand (indigo)
  brandAccent: "#8b5cf6", // --color-brand-accent (purple)
  
  // Background colors
  bgBase: "#ffffff", // --color-bg-base
  bgSurface: "#f9fafb", // --color-bg-surface
  bgElevated: "#ffffff", // --color-bg-elevated
  
  // Text colors
  textPrimary: "#111827", // --color-text-primary
  textSecondary: "#6b7280", // --color-text-secondary
  textTertiary: "#9ca3af", // --color-text-tertiary
  textInverse: "#ffffff", // --color-text-inverse
  
  // Border colors
  borderSubtle: "#e5e7eb", // --color-border-subtle
  borderDefault: "#d1d5db", // --color-border-default
  borderStrong: "#9ca3af", // --color-border-strong
  
  // Semantic colors
  semanticSuccess: "#10b981", // --color-semantic-success
  semanticWarning: "#f59e0b", // --color-semantic-warning
  semanticError: "#ef4444", // --color-semantic-error
  semanticInfo: "#3b82f6", // --color-semantic-info
} as const;

// Dark theme colors (for reference, emails typically use light theme)
export const brandColorsDark = {
  brand: "#818cf8", // --color-brand (lighter indigo for dark mode)
  brandAccent: "#a78bfa", // --color-brand-accent (lighter purple for dark mode)
  bgBase: "#0f172a",
  bgSurface: "#1e293b",
  textPrimary: "#f1f5f9",
  textSecondary: "#cbd5e1",
} as const;
