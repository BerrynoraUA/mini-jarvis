/**
 * Mini Jarvis design tokens — single source of truth.
 *
 * These values are consumed by:
 *   - packages/config/src/tailwind.css (web, Tailwind v4 @theme)
 *   - packages/config/src/tailwind.preset.cjs (native, NativeWind v4 / Tailwind v3 preset)
 *   - any TS code that needs a token directly (charts, canvas, etc.)
 *
 * Naming follows the Quill-inspired language from the design references:
 * Canvas, Surface, Ink, Terracotta, Sage, Sky.
 */

export const palette = {
  canvas: "#FAF7F2", // warm off-white page background
  surface: "#F2EEE7", // soft beige card / panel background
  ink: "#1B1F2A", // near-black with cool undertone (primary text & buttons)
  terracotta: "#D4986A", // accent — warm clay
  sage: "#8FA68E", // accent — calm green
  sky: "#B5C7DC", // accent — quiet blue
  // Neutrals derived for borders, muted text, etc.
  mutedFg: "#6B6A66",
  hairline: "#E5DFD4",
} as const;

export const semantic = {
  background: palette.canvas,
  foreground: palette.ink,
  card: "#FFFFFF",
  cardForeground: palette.ink,
  popover: "#FFFFFF",
  popoverForeground: palette.ink,
  primary: palette.ink,
  primaryForeground: palette.canvas,
  secondary: palette.surface,
  secondaryForeground: palette.ink,
  muted: palette.surface,
  mutedForeground: palette.mutedFg,
  accent: palette.terracotta,
  accentForeground: palette.canvas,
  destructive: "#B23A3A",
  destructiveForeground: palette.canvas,
  border: palette.hairline,
  input: palette.hairline,
  ring: palette.ink,
} as const;

export const radii = {
  sm: "6px",
  md: "10px",
  lg: "14px",
  xl: "20px",
  "2xl": "28px",
  full: "9999px",
} as const;

export const fonts = {
  display: "var(--font-display)",
  sans: "var(--font-sans)",
  mono: "var(--font-mono)",
} as const;

export type PaletteToken = keyof typeof palette;
export type SemanticToken = keyof typeof semantic;
