import type { Metadata } from "next";
import { fontDisplay, fontSans, fontMono } from "@mini-jarvis/config/fonts";
import { Providers } from "@/components/providers";
import "./globals.css";

export const metadata: Metadata = {
  title: "Mini Jarvis — A calmer way to work",
  description:
    "Notes, tasks, and ideas — at peace. A quietly powerful productivity & knowledge app.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${fontDisplay.variable} ${fontSans.variable} ${fontMono.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-background text-foreground"
        suppressHydrationWarning
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
