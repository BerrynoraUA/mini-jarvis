import Link from "next/link";
import { Button, Card, Input, Separator } from "@mini-jarvis/ui";
import { ArrowUpRight, Plus, Search } from "lucide-react";

import {
  MarketingHeader,
  MarketingFooter,
} from "@/components/marketing/chrome";
import {
  Section,
  Eyebrow,
  NumberLabel,
} from "@/components/marketing/section";
import { PhoneFrame } from "@/components/marketing/phone-frame";
import { PaletteSwatch } from "@/components/marketing/palette-swatch";
import {
  HomePreview,
  TasksPreview,
  NotePreview,
  LibraryPreview,
  SearchPreview,
} from "@/components/marketing/phone-previews";
import {
  getNextOnboardingHref,
  getNextOnboardingLabel,
} from "@/lib/onboarding";
import { getOnboardingSession } from "@/lib/onboarding.server";

export default async function MarketingHome() {
  const session = await getOnboardingSession();

  return (
    <>
      <MarketingHeader />

      {/* HERO */}
      <Section className="pt-8 pb-24 sm:pt-12 sm:pb-32">
        <div className="grid items-center gap-16 lg:grid-cols-[1.2fr_1fr]">
          <div>
            <Eyebrow>A calmer way to work</Eyebrow>
            <h1 className="mt-6 font-display text-[64px] leading-[1.02] tracking-tight sm:text-[80px]">
              Your tasks, notes,
              <br />
              and ideas — <em>at peace.</em>
            </h1>
            <p className="mt-8 max-w-md text-base leading-relaxed text-muted-foreground">
              Mini Jarvis is a quietly powerful productivity & knowledge app.
              Organise your day, capture what matters, and find anything in a
              single, distraction-free space.
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-3">
              <Button asChild>
                <Link href={getNextOnboardingHref(session)}>
                  {getNextOnboardingLabel(session)} <ArrowUpRight />
                </Link>
              </Button>
              <Button variant="outline">Watch the film</Button>
            </div>
            <div className="mt-16 flex items-center gap-6">
              <NumberLabel value="FEATURED IN" />
              <span className="font-display text-xl italic">Wallpaper*</span>
              <span className="font-display text-xl">Kinfolk</span>
              <span className="font-display text-xl">Dezeen</span>
            </div>
          </div>
          <div className="flex justify-center lg:justify-end">
            <PhoneFrame widthClassName="w-[300px]">
              <HomePreview />
            </PhoneFrame>
          </div>
        </div>
      </Section>

      {/* SCREENS */}
      <Section
        id="screens"
        className="bg-surface/50 py-24"
        containerClassName="space-y-16"
      >
        <div className="grid gap-10 sm:grid-cols-[1.5fr_1fr] sm:items-end">
          <h2 className="font-display text-5xl leading-tight tracking-tight sm:text-6xl">
            One ecosystem,
            <br />
            considered to the pixel.
          </h2>
          <p className="text-base leading-relaxed text-muted-foreground">
            Every surface follows the same quiet grammar — neutral palette,
            generous space, one clear action at a time.
          </p>
        </div>
        <div className="-mx-6 overflow-x-auto px-6 sm:mx-0 sm:px-0">
          <div className="flex min-w-max items-end gap-6">
            <PhoneFrame>
              <TasksPreview />
            </PhoneFrame>
            <PhoneFrame>
              <NotePreview />
            </PhoneFrame>
            <PhoneFrame>
              <LibraryPreview />
            </PhoneFrame>
            <PhoneFrame>
              <SearchPreview />
            </PhoneFrame>
          </div>
        </div>
      </Section>

      {/* PRINCIPLES */}
      <Section id="design" className="py-24" containerClassName="space-y-12">
        <div className="grid gap-10 sm:grid-cols-[1fr_2fr]">
          <div>
            <NumberLabel value="03 — PRINCIPLES" />
            <h2 className="mt-4 font-display text-5xl leading-[1.05] tracking-tight">
              A philosophy
              <br />
              of restraint.
            </h2>
          </div>
          <div className="grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {[
              {
                n: "01",
                title: "Calm by default",
                body: "Soft neutrals, hairline dividers, and breathable spacing — never shouting for attention.",
              },
              {
                n: "02",
                title: "One clear action",
                body: "Each screen leads with a single intent. The rest steps quietly into the background.",
              },
              {
                n: "03",
                title: "Speed as kindness",
                body: "Universal search, keyboard-first flows, and microinteractions tuned to feel instant.",
              },
              {
                n: "04",
                title: "Words that breathe",
                body: "An editorial serif for thought, a precise sans for action. Hierarchy through space, not weight.",
              },
            ].map((p) => (
              <div key={p.n}>
                <NumberLabel value={p.n} />
                <h3 className="mt-3 font-display text-2xl leading-tight">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {p.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* SYSTEM */}
      <Section
        id="system"
        className="bg-surface/40 py-24"
        containerClassName="space-y-12"
      >
        <div className="grid gap-10 sm:grid-cols-[1fr_2fr] sm:items-end">
          <div>
            <NumberLabel value="04 — SYSTEM" />
            <h2 className="mt-4 font-display text-5xl leading-tight tracking-tight">
              The quiet kit.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            A small, honest set of components — the same vocabulary across
            mobile, tablet, and desktop.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          {/* Palette + Typography */}
          <Card className="space-y-8 p-8">
            <div>
              <NumberLabel value="PALETTE" />
              <div className="mt-4 flex flex-wrap gap-4">
                <PaletteSwatch name="Canvas" hex="#FAF7F2" />
                <PaletteSwatch name="Surface" hex="#F2EEE7" />
                <PaletteSwatch name="Ink" hex="#1B1F2A" />
                <PaletteSwatch name="Terracotta" hex="#D4986A" />
                <PaletteSwatch name="Sage" hex="#8FA68E" />
                <PaletteSwatch name="Sky" hex="#B5C7DC" />
              </div>
            </div>
            <Separator />
            <div>
              <NumberLabel value="TYPOGRAPHY" />
              <div className="mt-4 grid grid-cols-[auto_1fr] items-center gap-x-4 gap-y-3">
                <span className="font-display text-5xl">Aa</span>
                <span className="text-xs text-muted-foreground">
                  Instrument Serif · Display
                </span>
                <span className="text-5xl font-medium">Aa</span>
                <span className="text-xs text-muted-foreground">
                  Inter · Interface
                </span>
              </div>
            </div>
          </Card>

          {/* Buttons / Input / Tags / Tasks */}
          <Card className="space-y-8 p-8">
            <div>
              <NumberLabel value="BUTTONS" />
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button>Primary</Button>
                <Button variant="outline">Secondary</Button>
                <Button variant="ghost">Ghost</Button>
                <Button size="icon">
                  <Plus />
                </Button>
              </div>
            </div>
            <div>
              <NumberLabel value="INPUT" />
              <div className="relative mt-4">
                <Search
                  size={14}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground"
                />
                <Input
                  placeholder="Search anything…"
                  className="pl-10"
                  readOnly
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 rounded bg-secondary px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </span>
              </div>
            </div>
            <div>
              <NumberLabel value="TAGS" />
              <div className="mt-4 flex flex-wrap gap-2 text-xs">
                {[
                  { label: "#design", c: "bg-accent/15" },
                  { label: "#reading", c: "bg-secondary" },
                  { label: "#research", c: "bg-sky/30" },
                  { label: "#ideas", c: "bg-sage/25" },
                ].map((t) => (
                  <span
                    key={t.label}
                    className={`rounded-full px-3 py-1 ${t.c}`}
                  >
                    {t.label}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <NumberLabel value="TASK ITEM" />
              <div className="mt-4 space-y-2">
                <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3">
                  <span className="size-4 rounded-full border border-foreground bg-foreground" />
                  <span className="text-sm text-muted-foreground line-through">
                    Define visual language
                  </span>
                </div>
                <div className="flex items-center gap-3 rounded-xl border border-border bg-canvas px-4 py-3">
                  <span className="size-4 rounded-full border border-border" />
                  <span className="text-sm">Ship onboarding flow</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </Section>

      <MarketingFooter />
    </>
  );
}
