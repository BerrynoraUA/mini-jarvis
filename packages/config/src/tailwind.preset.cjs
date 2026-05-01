/**
 * NativeWind / Tailwind v3 preset.
 *
 * Mirrors packages/config/src/tokens.ts so RN components can use the same
 * class names as the web (`bg-canvas`, `text-ink`, etc.).
 *
 * Consumed by apps/native/tailwind.config.js.
 */

/** @type {import('tailwindcss').Config} */
module.exports = {
  theme: {
    extend: {
      colors: {
        canvas: "#FAF7F2",
        surface: "#F2EEE7",
        ink: "#1B1F2A",
        terracotta: "#D4986A",
        sage: "#8FA68E",
        sky: "#B5C7DC",
        hairline: "#E5DFD4",
        "muted-fg": "#6B6A66",

        background: "#FAF7F2",
        foreground: "#1B1F2A",
        card: "#FFFFFF",
        "card-foreground": "#1B1F2A",
        primary: "#1B1F2A",
        "primary-foreground": "#FAF7F2",
        secondary: "#F2EEE7",
        "secondary-foreground": "#1B1F2A",
        muted: "#F2EEE7",
        "muted-foreground": "#6B6A66",
        accent: "#D4986A",
        "accent-foreground": "#FAF7F2",
        destructive: "#B23A3A",
        border: "#E5DFD4",
      },
      borderRadius: {
        sm: "6px",
        md: "10px",
        lg: "14px",
        xl: "20px",
        "2xl": "28px",
      },
      fontFamily: {
        display: ["InstrumentSerif", "serif"],
        sans: ["Inter", "system-ui", "sans-serif"],
      },
    },
  },
};
