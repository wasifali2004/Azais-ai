import { getSession, readErrorMessage, updateStoredCredits, type Session } from "@/lib/auth-client";

// Trailing slash stripped so callers can safely do `${API_URL}/path` without
// risking a double slash if NEXT_PUBLIC_API_URL was set with one.
const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/+$/, "");

export type GenerationType = "IMAGE" | "VIDEO";
export type GenerationStatus = "PENDING" | "COMPLETE" | "FAILED";

export type GenerationSettings = {
  aspectRatio?: string;
  durationSeconds?: number;
};

export type Generation = {
  id: string;
  type: GenerationType;
  model: string;
  prompt: string;
  settings: GenerationSettings;
  status: GenerationStatus;
  outputUrl: string | null;
  userMessage: string | null;
  createdAt: string;
  updatedAt: string;
};

export type CatalogEntry = {
  id: string;
  type: GenerationType;
  tier: "FREE" | "PAID";
  unlocked: boolean;
  aspectRatios: string[];
  durations?: number[];
  creditsCost?: number;
  creditsPerSecond?: number;
};

export type ModelCatalog = { image: CatalogEntry[]; video: CatalogEntry[] };

export type HistoryPage = {
  items: Generation[];
  total: number;
  page: number;
  limit: number;
};

function authHeaders(session: Session): HeadersInit {
  return { Authorization: `Bearer ${session.accessToken}` };
}

function requireSession(): Session {
  const session = getSession();
  if (!session) {
    throw new Error("Not signed in");
  }
  return session;
}

export async function createGeneration(params: {
  type: GenerationType;
  model: string;
  prompt: string;
  settings?: GenerationSettings;
}): Promise<{ id: string }> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/generate`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(session) },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not start generation"));
  }
  return res.json();
}

export async function getGeneration(id: string): Promise<Generation> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/generation/${id}`, {
    headers: authHeaders(session),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not load generation"));
  }
  return res.json();
}

/** Polls GET /generation/:id until COMPLETE/FAILED, or throws on timeout. */
export async function pollGeneration(
  id: string,
  opts: { intervalMs?: number; timeoutMs?: number } = {},
): Promise<Generation> {
  const intervalMs = opts.intervalMs ?? 2500;
  const timeoutMs = opts.timeoutMs ?? 125_000;
  const startedAt = Date.now();

  for (;;) {
    const generation = await getGeneration(id);
    if (generation.status !== "PENDING") {
      return generation;
    }
    if (Date.now() - startedAt > timeoutMs) {
      throw new Error("Generation is taking longer than expected — check History shortly.");
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs));
  }
}

export async function getModelCatalog(): Promise<ModelCatalog> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/generation/models`, {
    headers: authHeaders(session),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not load models"));
  }
  return res.json();
}

export async function enhancePrompt(params: {
  prompt: string;
  mode: "enhance" | "variation";
  type: GenerationType;
}): Promise<{ prompt: string; remainingFree: number }> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/generation/enhance`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders(session) },
    body: JSON.stringify(params),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not rewrite that prompt"));
  }
  return res.json();
}

export async function getCreditsBalance(): Promise<number> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/credits/balance`, {
    headers: authHeaders(session),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not load credit balance"));
  }
  const data = (await res.json()) as { balance: number };
  updateStoredCredits(data.balance);
  return data.balance;
}

export async function getHistory(page = 1, limit = 20): Promise<HistoryPage> {
  const session = requireSession();
  const res = await fetch(`${API_URL}/history?page=${page}&limit=${limit}`, {
    headers: authHeaders(session),
  });
  if (!res.ok) {
    throw new Error(await readErrorMessage(res, "Could not load history"));
  }
  return res.json();
}
