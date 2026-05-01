export const ONBOARDING_COOKIE = "mj-onboarding";

export type PlanTier = "free" | "paid";
export type StorageChoice = "google-drive" | "icloud" | "managed";

export interface OnboardingSession {
  name: string;
  email: string;
  createdAt: string;
  plan?: PlanTier;
  storageChoice?: StorageChoice;
}

export interface StorageOption {
  choice: StorageChoice;
  plan: PlanTier;
  label: string;
  tagline: string;
  description: string;
}

export const STORAGE_OPTIONS: StorageOption[] = [
  {
    choice: "google-drive",
    plan: "free",
    label: "Google Drive",
    tagline: "Free",
    description: "Use your own Google Drive as the home for notes and tasks.",
  },
  {
    choice: "icloud",
    plan: "free",
    label: "iCloud",
    tagline: "Free",
    description: "Keep your workspace tied to Apple storage for a personal setup.",
  },
  {
    choice: "managed",
    plan: "paid",
    label: "Mini Jarvis Cloud",
    tagline: "Paid",
    description: "Use managed storage hosted by us for a fully handled workspace.",
  },
];

export type ReadyOnboardingSession = OnboardingSession & {
  plan: PlanTier;
  storageChoice: StorageChoice;
};

export function isPlanTier(value: unknown): value is PlanTier {
  return value === "free" || value === "paid";
}

export function isStorageChoice(value: unknown): value is StorageChoice {
  return (
    value === "google-drive" || value === "icloud" || value === "managed"
  );
}

export function parseOnboardingSession(
  value: string | null | undefined,
): OnboardingSession | null {
  if (!value) return null;

  try {
    const parsed: unknown = JSON.parse(value);
    if (!parsed || typeof parsed !== "object") return null;

    const candidate = parsed as Record<string, unknown>;
    if (typeof candidate.name !== "string" || typeof candidate.email !== "string") {
      return null;
    }
    if (typeof candidate.createdAt !== "string") return null;
    if (candidate.plan !== undefined && !isPlanTier(candidate.plan)) return null;
    if (
      candidate.storageChoice !== undefined &&
      !isStorageChoice(candidate.storageChoice)
    ) {
      return null;
    }

    return {
      name: candidate.name,
      email: candidate.email,
      createdAt: candidate.createdAt,
      plan: candidate.plan,
      storageChoice: candidate.storageChoice,
    };
  } catch {
    return null;
  }
}

export function isOnboardingComplete(
  session: OnboardingSession | null,
): session is ReadyOnboardingSession {
  return Boolean(
    session &&
      isPlanTier(session.plan) &&
      isStorageChoice(session.storageChoice),
  );
}

export function getPlanForStorage(choice: StorageChoice): PlanTier {
  return choice === "managed" ? "paid" : "free";
}

export function getStorageOption(choice: StorageChoice): StorageOption {
  const option = STORAGE_OPTIONS.find((item) => item.choice === choice);
  if (!option) {
    throw new Error(`Unknown storage choice: ${choice}`);
  }
  return option;
}

export function getNextOnboardingHref(session: OnboardingSession | null): string {
  if (!session) return "/register";
  if (!isOnboardingComplete(session)) return "/setup/storage";
  return "/app";
}

export function getNextOnboardingLabel(session: OnboardingSession | null): string {
  if (!session) return "Register now";
  if (!isOnboardingComplete(session)) return "Choose storage";
  return "Open the app";
}