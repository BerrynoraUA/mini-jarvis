import { cookies } from "next/headers";

import {
  ONBOARDING_COOKIE,
  parseOnboardingSession,
  type OnboardingSession,
} from "./onboarding";

const COOKIE_MAX_AGE = 60 * 60 * 24 * 30;

export async function getOnboardingSession(): Promise<OnboardingSession | null> {
  const store = await cookies();
  return parseOnboardingSession(store.get(ONBOARDING_COOKIE)?.value);
}

export async function saveOnboardingSession(
  session: OnboardingSession,
): Promise<void> {
  const store = await cookies();
  store.set(ONBOARDING_COOKIE, JSON.stringify(session), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE,
  });
}