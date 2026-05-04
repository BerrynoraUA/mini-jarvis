"use client";

import Link from "next/link";
import { AlertCircle, ArrowRight, ChevronLeft, Cloud, ShieldCheck } from "lucide-react";

import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mini-jarvis/ui";

export function Login({ error }: { error: string | null }) {
  return (
    <div className="min-h-screen bg-canvas px-6 py-10 text-foreground sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" /> Back home
          </Link>
          <div className="space-y-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Google-first access
            </span>
            <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
              Sign in once.
              <br />
              Save notes straight to Drive.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              Mini Jarvis uses your Google account for sign-in and creates a dedicated
              workspace in your Google Drive so notes stay in your own cloud.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-2">
            <div className="rounded-2xl border border-hairline bg-surface/50 p-4">
              <ShieldCheck className="mb-3 h-4 w-4 text-sage" />
              Google OAuth for identity and Drive access.
            </div>
            <div className="rounded-2xl border border-hairline bg-surface/50 p-4">
              <Cloud className="mb-3 h-4 w-4 text-sky" />
              Notes saved as markdown files in your Drive.
            </div>
          </div>
        </div>

        <Card className="border-hairline bg-background/90 shadow-none">
          <CardHeader>
            <CardTitle>Continue with Google</CardTitle>
            <CardDescription>
              Google Drive is the only storage option enabled in this first release.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error ? (
              <div className="rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                <div className="flex items-start gap-2">
                  <AlertCircle className="mt-0.5 h-4 w-4" />
                  <p>{decodeURIComponent(error)}</p>
                </div>
              </div>
            ) : null}
            <Button asChild className="w-full rounded-full" size="lg">
              <Link href="/api/auth/google">
                Sign in with Google <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <p className="text-sm leading-relaxed text-muted-foreground">
              You will be asked to grant access to create and manage Mini Jarvis files in
              your Google Drive.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
