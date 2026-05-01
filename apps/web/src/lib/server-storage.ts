import path from "node:path";

import { createLocalStorage, type Storage } from "@mini-jarvis/storage";

import { getOnboardingSession } from "./onboarding.server";
import { isOnboardingComplete } from "./onboarding";

export class OnboardingRequiredError extends Error {
  constructor() {
    super("Onboarding is incomplete");
    this.name = "OnboardingRequiredError";
  }
}

function toSafeSegment(value: string): string {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 48) || "workspace";
}

export async function getRequestStorage(): Promise<Storage> {
  const session = await getOnboardingSession();
  if (!isOnboardingComplete(session)) {
    throw new OnboardingRequiredError();
  }

  const userKey = toSafeSegment(session.email);
  const root = path.resolve(
    process.cwd(),
    ".data",
    "users",
    userKey,
    session.storageChoice,
  );

  return createLocalStorage(root);
}