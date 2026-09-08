export type SessionUser = {
  id: string;
  email: string;
  plan: string;
  creditBalance: number;
  isVerified: boolean;
};

export type Session = {
  accessToken: string;
  user: SessionUser;
};

const STORAGE_KEY = "azaisai_session";
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000";
export const SESSION_EVENT = "azaisai:session";

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Reads the `exp` claim out of a JWT without verifying it — display/UX use only, never a security check. */
function isTokenExpired(token: string): boolean {
  try {
    const payload = token.split(".")[1];
    const json = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));
    return typeof json.exp === "number" && Date.now() >= json.exp * 1000;
  } catch {
    return false;
  }
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const session = JSON.parse(raw) as Session;
    if (isTokenExpired(session.accessToken)) {
      clearSession();
      return null;
    }
    return session;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function updateStoredCredits(creditBalance: number) {
  const session = getSession();
  if (!session) return;
  saveSession({ ...session, user: { ...session.user, creditBalance } });
}

export async function readErrorMessage(res: Response, fallback: string): Promise<string> {
  if (res.status === 401) {
    // The stored token was rejected server-side (expired/invalid) — drop it
    // so the UI stops claiming the user is signed in.
    clearSession();
    return "Your session has expired — sign in again to continue.";
  }
  const body = await res.json().catch(() => null);
  return (body?.message as string | undefined) ?? fallback;
}

export async function apiLogin(email: string, password: string): Promise<Session> {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Invalid email or password"));
  }
  return res.json();
}

export async function apiSignup(email: string, password: string): Promise<{ email: string }> {
  const res = await fetch(`${API_URL}/auth/signup`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not create your account"));
  }
  return res.json();
}

export async function apiVerifyEmail(email: string, code: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/verify-email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, code }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Invalid or expired verification code"));
  }
}

export async function apiResendCode(email: string): Promise<void> {
  const res = await fetch(`${API_URL}/auth/resend-code`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not resend the code"));
  }
}

export function googleAuthUrl(): string {
  return `${API_URL}/auth/google`;
}

export async function fetchProfile(accessToken: string): Promise<SessionUser> {
  const res = await fetch(`${API_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not load your account"));
  }
  return res.json();
}

export type SubscribableTier = "STARTER" | "PRO" | "BUSINESS";

/** Whether the backend is bypassing real Polar payments (dev/demo only). */
export async function fetchBillingConfig(): Promise<{ devSkipPayment: boolean }> {
  const res = await fetch(`${API_URL}/billing/config`);
  if (!res.ok) {
    return { devSkipPayment: false };
  }
  return res.json();
}

/** Creates a Polar checkout session for the signed-in user and returns its URL. */
export async function createCheckout(tier: SubscribableTier): Promise<string> {
  const session = getSession();
  if (!session) {
    throw new Error("Not signed in");
  }

  const res = await fetch(`${API_URL}/billing/checkout`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${session.accessToken}`,
    },
    body: JSON.stringify({ tier }),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not start checkout"));
  }

  const data = (await res.json()) as { url: string };
  return data.url;
}
