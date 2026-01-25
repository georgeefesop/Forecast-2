# Design System Documentation

## Overview

The Forecast app uses a comprehensive design token system following industry best practices. All design decisions (colors, spacing, typography, shadows, motion, etc.) are centralized in a single source of truth.

## Structure

The design token system follows a hierarchical structure:

1. **Primitives**: Raw values (color palettes, spacing units)
2. **Semantic Tokens**: Contextual tokens (brand colors, semantic colors)
3. **Theme Tokens**: Light and dark theme variations

## File Structure

- **`lib/design-tokens.ts`**: Single source of truth for all design tokens
- **`app/globals.css`**: CSS variables mapped from tokens (for web usage)
- **`tailwind.config.ts`**: Tailwind configuration using CSS variables

## Token Categories

### Colors

#### Color Primitives
Raw color palettes organized by purpose:
- `indigo`: Brand primary colors (50-900 scale)
- `purple`: Brand accent colors (50-900 scale)
- `gray`: Neutral colors (50-900 scale)
- `success`, `warning`, `error`, `info`: Semantic color palettes

#### Semantic Colors
Contextual color tokens:
- **Brand**: `brand.primary`, `brand.accent`
- **Background**: `background.base`, `background.surface`, `background.elevated`, `background.overlay`
- **Text**: `text.primary`, `text.secondary`, `text.tertiary`, `text.inverse`
- **Border**: `border.subtle`, `border.default`, `border.strong`
- **Semantic**: `semantic.success`, `semantic.warning`, `semantic.error`, `semantic.info`

### Spacing

Based on a 4px base unit system:
- `0.5` = 2px
- `1` = 4px
- `2` = 8px
- `4` = 16px
- `8` = 32px
- `12` = 48px
- `16` = 64px
- `24` = 96px
- `32` = 128px
- `48` = 192px
- `64` = 256px

### Typography

- **Font Families**: `fontFamily.sans`, `fontFamily.mono`
- **Font Sizes**: `fontSize.xs` through `fontSize.5xl`
- **Font Weights**: `fontWeight.normal`, `medium`, `semibold`, `bold`
- **Line Heights**: `lineHeight.tight`, `normal`, `relaxed`
- **Letter Spacing**: `letterSpacing.tighter` through `wider`

### Border Radius

- `sm` = 4px
- `md` = 8px
- `lg` = 12px
- `xl` = 16px
- `full` = 9999px

### Shadows

Elevation system for depth:
- `sm`, `md`, `lg`, `xl`, `2xl`

### Motion

Animation and transition values:
- **Duration**: `fast` (150ms), `base` (200ms), `slow` (300ms)
- **Easing**: `ease`, `ease-in`, `ease-out`, `ease-in-out`

### Z-Index

Layering system:
- `base`, `dropdown`, `sticky`, `fixed`, `modalBackdrop`, `modal`, `popover`, `tooltip`

## Usage

### In TypeScript/JavaScript

```typescript
import { designTokens, getLightThemeColors } from "@/lib/design-tokens";

// Access tokens
const brandColor = designTokens.color.light.brand.primary;
const spacing = designTokens.spacing[4]; // "1rem"

// For email templates (returns actual hex values)
const colors = getLightThemeColors();
const emailBgColor = colors.bgBase; // "#ffffff"
```

### In CSS

Use CSS variables defined in `app/globals.css`:

```css
.my-component {
  background-color: var(--color-bg-surface);
  color: var(--color-text-primary);
  padding: var(--spacing-4);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
}
```

### In Tailwind

Use Tailwind classes mapped to CSS variables:

```tsx
<div className="bg-background-surface text-text-primary p-4 rounded-md shadow-md">
  Content
</div>
```

### In Email Templates

Email templates need actual hex values (CSS variables don't work in emails):

```typescript
import { getLightThemeColors } from "@/lib/design-tokens";

const colors = getLightThemeColors();
// Use colors.brand, colors.bgBase, etc. in email HTML
```

## Theming

The system supports light and dark themes:

- **Light Theme**: Default theme, optimized for light backgrounds
- **Dark Theme**: Activated via `.dark` class, uses lighter brand colors for better contrast

Both themes are defined in `lib/design-tokens.ts` and mapped to CSS variables in `app/globals.css`.

## Best Practices

1. **Never hardcode values**: Always use tokens from `design-tokens.ts`
2. **Use semantic tokens**: Prefer `color.brand.primary` over `colorPrimitives.indigo[500]`
3. **Maintain consistency**: Update tokens in one place, changes propagate everywhere
4. **For emails**: Use `getLightThemeColors()` helper to get actual hex values
5. **For components**: Use Tailwind classes or CSS variables

## Adding New Tokens

1. Add the token to `lib/design-tokens.ts`
2. If it's a color, add it to both `lightTheme` and `darkTheme`
3. Add corresponding CSS variable to `app/globals.css`
4. If needed, add Tailwind mapping in `tailwind.config.ts`
5. Update this documentation

## Migration Notes

- The old `lib/brand-colors.ts` file has been removed
- All color references now use `lib/design-tokens.ts`
- Email templates use `getLightThemeColors()` helper
- CSS variables remain the same (backward compatible)

## References

This design token system follows:
- [W3C Design Tokens Community Group Format](https://design-tokens.github.io/community-group/format/)
- [Material Design 3 Tokens](https://m3.material.io/foundations/design-tokens)
- [Atlassian Design System Tokens](https://atlassian.design/tokens/design-tokens)
