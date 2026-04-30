const sharedPreset = require("@mini-jarvis/config/tailwind-preset");

/** @type {import('tailwindcss').Config} */
module.exports = {
  // Tailwind v3 config for NativeWind v4.
  content: [
    "./App.tsx",
    "./index.ts",
    "./src/**/*.{ts,tsx}",
    "../../packages/ui-native/src/**/*.{ts,tsx}",
  ],
  presets: [sharedPreset],
};
