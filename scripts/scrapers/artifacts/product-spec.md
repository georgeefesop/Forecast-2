# Product Specification: Fix Hydration Error in FadeIn Component

## 1. Overview

The user is experiencing a "Hydration failed" error. The error points to a mismatch between the server-rendered HTML (which has `style={{opacity:0}}` typical of the `FadeIn` value for unmounted states) and the client-rendered HTML (which expects a `div` with `grid` classes).

## 2. Problem Diagnosis

- **File:** `components/ui/fade-in.tsx`
- **Mechanism:** The `FadeIn` component likely uses a pattern `if (!isMounted) return <div style={{opacity:0}}>...</div>`.
- **Mismatch:** The error stack suggests a structural confusion where the "Grid" div in `page.tsx` is being confused with the `FadeIn` generic fallback, or the nesting is interpreted differently on server vs client.
- **Specific Observation:** The diff shows the client expects the `grid` class (from `page.tsx` line 67) but receives the `opacity:0` div (from `FadeIn` line 43). This hierarchy implies the React tree is desynchronized.

## 3. Proposed Solution

1. **Analyze `FadeIn`:** Check how it handles `isMounted`.
2. **Fix Hydration Pattern:** Instead of returning a completely different DOM node (or `null` styled wrapper) based on `isMounted` which can confuse React's node reconciliation if siblings are involved, use CSS opacity control or ensure the structure is identical (same wrapper div, just different style).
3. **Refactor `FadeIn`:**
    - Render the *same* root element (e.g., `motion.div` or just `div`) on both server and client.
    - Use `initial={{ opacity: 0 }}` and `animate={{ opacity: 1 }}` which Framer Motion handles gracefully during SSR (it renders the initial state).
    - Avoid the manual `if (!isMounted)` return if possible, or ensure the fallback div strictly mirrors the component's standard output structure.

## 4. Implementation Steps

1. Read `components/ui/fade-in.tsx`.
2. Modify `FadeIn` to remove the `isMounted` conditional return if it's causing tree mismatches, relying on Framer Motion's built-in SSR handlers or a more robust existence check.
3. Alternatively, if `isMounted` is necessary, ensure the returned `div` accepts and applies *all* props correctly and doesn't break hierarchy.
