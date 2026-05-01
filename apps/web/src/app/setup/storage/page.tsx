import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, CheckCircle2, ChevronLeft } from "lucide-react";
import {
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@mini-jarvis/ui";

import {
  STORAGE_OPTIONS,
  getNextOnboardingHref,
  getPlanForStorage,
  isOnboardingComplete,
  isStorageChoice,
} from "@/lib/onboarding";
import { getOnboardingSession, saveOnboardingSession } from "@/lib/onboarding.server";

export default async function StorageSetupPage() {
  const session = await getOnboardingSession();
  if (!session) {
    redirect("/register");
  }
  if (isOnboardingComplete(session)) {
    redirect(getNextOnboardingHref(session));
  }

  async function chooseStorageAction(formData: FormData) {
    "use server";

    const current = await getOnboardingSession();
    if (!current) {
      redirect("/register");
    }

    const choice = formData.get("storage");
    if (!isStorageChoice(choice)) {
      throw new Error("Please choose a valid storage option.");
    }

    await saveOnboardingSession({
      ...current,
      plan: getPlanForStorage(choice),
      storageChoice: choice,
    });

    redirect("/app");
  }

  return (
    <div className="min-h-screen bg-canvas px-6 py-10 text-foreground sm:px-10">
      <div className="mx-auto flex max-w-6xl flex-col gap-8">
        <div className="space-y-4">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground transition hover:text-ink"
          >
            <ChevronLeft className="h-4 w-4" /> Back to registration
          </Link>
          <span className="text-[11px] font-medium uppercase tracking-[0.24em] text-muted-foreground">
            Step 2 of 2
          </span>
          <h1 className="font-display text-5xl leading-tight text-ink sm:text-6xl">
            Choose your storage.
          </h1>
          <p className="max-w-2xl text-base leading-relaxed text-muted-foreground">
            {session.name}, pick the version that fits. Free accounts bring your
            own storage. Paid accounts can use storage managed by Mini Jarvis.
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {STORAGE_OPTIONS.map((option) => {
            const selected = session.storageChoice === option.choice;

            return (
              <Card
                key={option.choice}
                className="flex h-full flex-col border-hairline bg-background/90 shadow-none"
              >
                <CardHeader>
                  <div className="flex items-center justify-between gap-3">
                    <CardTitle>{option.label}</CardTitle>
                    <span className="rounded-full bg-surface px-3 py-1 text-[11px] font-medium uppercase tracking-[0.18em] text-muted-foreground">
                      {option.tagline}
                    </span>
                  </div>
                  <CardDescription>{option.description}</CardDescription>
                </CardHeader>
                <CardContent className="mt-auto flex flex-col gap-4">
                  <div className="rounded-2xl border border-hairline bg-surface/40 p-4 text-sm text-muted-foreground">
                    Plan: {option.plan === "free" ? "Free" : "Paid"}
                  </div>
                  <form action={chooseStorageAction}>
                    <input type="hidden" name="storage" value={option.choice} />
                    <Button type="submit" className="w-full rounded-full">
                      {selected ? "Selected" : `Use ${option.label}`} <ArrowRight className="h-4 w-4" />
                    </Button>
                  </form>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="rounded-3xl border border-hairline bg-background/70 p-6 text-sm text-muted-foreground">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-4 w-4 text-sage" />
            <p>
              This first implementation stores the selected provider in your onboarding
              session and scopes your workspace by that choice. Provider-specific cloud
              adapters are the next integration step.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}