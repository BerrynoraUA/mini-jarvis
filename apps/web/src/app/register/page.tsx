import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, ChevronLeft } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Input,
} from "@mini-jarvis/ui";

import { getOnboardingSession, saveOnboardingSession } from "@/lib/onboarding.server";
import { getNextOnboardingHref } from "@/lib/onboarding";

export default async function RegisterPage() {
  const session = await getOnboardingSession();
  if (session) {
    redirect(getNextOnboardingHref(session));
  }

  async function registerAction(formData: FormData) {
    "use server";

    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim().toLowerCase();

    if (!name || !email.includes("@")) {
      throw new Error("Please enter a valid name and email.");
    }

    await saveOnboardingSession({
      name,
      email,
      createdAt: new Date().toISOString(),
    });

    redirect("/setup/storage");
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-10 text-foreground sm:px-10">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl flex-col gap-8 lg:grid lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
        <div className="space-y-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" /> Back to landing
          </Link>
          <div className="space-y-4">
            <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
              Step 1 of 2
            </span>
            <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
              Register first.
              <br />
              Then decide where your workspace lives.
            </h1>
            <p className="max-w-xl text-base leading-relaxed text-muted-foreground">
              We start with a simple account profile, then let you choose whether
              your data stays in your own cloud or in managed storage.
            </p>
          </div>
          <div className="grid gap-3 text-sm text-muted-foreground sm:grid-cols-3">
            <div className="rounded-2xl border border-hairline bg-surface/50 p-4">
              Personal profile
            </div>
            <div className="rounded-2xl border border-hairline bg-surface/50 p-4">
              Storage choice
            </div>
            <div className="rounded-2xl border border-hairline bg-surface/50 p-4">
              Quiet workspace
            </div>
          </div>
        </div>

        <Card className="border-hairline bg-background/90 shadow-none">
          <CardHeader>
            <CardTitle>Create your account</CardTitle>
            <CardDescription>
              This is the first pass of onboarding for the web app.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={registerAction} className="flex flex-col gap-4">
              <label className="space-y-2 text-sm text-ink">
                <span>Name</span>
                <Input name="name" placeholder="Ada Lovelace" required />
              </label>
              <label className="space-y-2 text-sm text-ink">
                <span>Email</span>
                <Input
                  name="email"
                  type="email"
                  placeholder="ada@example.com"
                  required
                />
              </label>
              <Button type="submit" className="mt-2 rounded-full">
                Continue to storage <ArrowRight className="h-4 w-4" />
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}