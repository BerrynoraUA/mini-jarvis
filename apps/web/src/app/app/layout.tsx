import { AppShell } from "@/components/app/shell";
import { getOnboardingSession } from "@/lib/onboarding.server";
import { isOnboardingComplete } from "@/lib/onboarding";
import { redirect } from "next/navigation";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getOnboardingSession();

  if (!session) {
    redirect("/register");
  }
  if (!isOnboardingComplete(session)) {
    redirect("/setup/storage");
  }

  return <AppShell session={session}>{children}</AppShell>;
}
