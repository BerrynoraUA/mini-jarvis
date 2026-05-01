import { Instrument_Serif, Inter, JetBrains_Mono } from "next/font/google";

/**
 * Web fonts via next/font. Apply the returned `variable` strings to <html>.
 *
 * Tokens in tailwind.css reference these via:
 *   --font-display: var(--font-instrument-serif);
 *   --font-sans: var(--font-inter);
 */

export const fontDisplay = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const fontSans = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const fontMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
});

export const fontVariables = [
  fontDisplay.variable,
  fontSans.variable,
  fontMono.variable,
].join(" ");
