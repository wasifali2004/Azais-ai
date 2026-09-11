import { isDeployedEnvironment } from "../common/environment";

export type PolarServer = "sandbox" | "production";

export const POLAR_API_VERSION = "2026-04";

/**
 * A deployed app must never silently fall back to Polar Sandbox. Set
 * ALLOW_POLAR_SANDBOX_ON_DEPLOYMENT=true only for an intentional staging
 * deployment; local development still defaults to Sandbox.
 */
export function getPolarServer(): PolarServer {
  const configured = process.env.POLAR_SERVER?.trim().toLowerCase();
  if (configured && configured !== "sandbox" && configured !== "production") {
    throw new Error('POLAR_SERVER must be either "sandbox" or "production"');
  }

  if (
    isDeployedEnvironment() &&
    configured === "sandbox" &&
    process.env.ALLOW_POLAR_SANDBOX_ON_DEPLOYMENT !== "true"
  ) {
    return "production";
  }

  if (configured === "sandbox" || configured === "production") {
    return configured;
  }

  return isDeployedEnvironment() ? "production" : "sandbox";
}

/** The payment bypass is local-only, even if a stale Railway variable enables it. */
export function isDevSkipPaymentEnabled(): boolean {
  return !isDeployedEnvironment() && process.env.DEV_SKIP_PAYMENT === "true";
}

/** Pin the API contract used by the currently generated SDK models. */
export function polarRequestOptions(): { headers: Record<string, string> } {
  return { headers: { "Polar-Version": POLAR_API_VERSION } };
}
