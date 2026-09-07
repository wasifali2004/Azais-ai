type ApiHealth = { status: string; timestamp?: string; error?: string };

async function getApiHealth(): Promise<ApiHealth> {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    return { status: "unreachable", error: "NEXT_PUBLIC_API_URL is not set" };
  }
  try {
    const res = await fetch(`${apiUrl}/health`, { cache: "no-store" });
    if (!res.ok) {
      return { status: "unreachable", error: `API responded with ${res.status}` };
    }
    return (await res.json()) as ApiHealth;
  } catch (err) {
    return { status: "unreachable", error: (err as Error).message };
  }
}

export default async function Home() {
  const health = await getApiHealth();
  const isOk = health.status === "ok";

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 p-8">
      <h1 className="text-3xl font-semibold">AzaisAi — scaffold</h1>
      <p className="text-white/60">apps/web talking to apps/api over HTTP</p>
      <div
        className={`rounded-lg border px-4 py-3 font-mono text-sm ${
          isOk ? "border-green-500/40 bg-green-500/10" : "border-red-500/40 bg-red-500/10"
        }`}
      >
        <pre>{JSON.stringify(health, null, 2)}</pre>
      </div>
    </main>
  );
}
