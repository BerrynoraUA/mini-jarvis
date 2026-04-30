import Link from "next/link";
import { Button } from "@mini-jarvis/ui";

export function MarketingHeader() {
  return (
    <header className="w-full px-6 sm:px-10">
      <div className="mx-auto flex h-20 w-full max-w-6xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex size-7 items-center justify-center rounded-full bg-ink text-canvas font-display text-sm">
            Q
          </span>
          <span className="font-display text-lg">Mini Jarvis</span>
        </Link>
        <nav className="hidden items-center gap-10 text-sm text-muted-foreground sm:flex">
          <a href="#design" className="hover:text-foreground">
            Design
          </a>
          <a href="#screens" className="hover:text-foreground">
            Screens
          </a>
          <a href="#system" className="hover:text-foreground">
            System
          </a>
        </nav>
        <Button asChild size="sm">
          <Link href="/app">Get early access</Link>
        </Button>
      </div>
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="w-full border-t border-border bg-canvas px-6 py-8 sm:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 text-sm text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-2">
          <span className="flex size-6 items-center justify-center rounded-full bg-ink text-canvas font-display text-xs">
            Q
          </span>
          <span>Mini Jarvis — Designed in calm. © 2026.</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#" className="hover:text-foreground">iOS</a>
          <a href="#" className="hover:text-foreground">macOS</a>
          <a href="#" className="hover:text-foreground">Web</a>
          <a href="#" className="hover:text-foreground">Press</a>
        </div>
      </div>
    </footer>
  );
}
