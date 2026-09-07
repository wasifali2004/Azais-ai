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
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export function saveSession(session: Session) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
}

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function clearSession() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

export async function readErrorMessage(res: Response, fallback: string): Promise<string> {
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
