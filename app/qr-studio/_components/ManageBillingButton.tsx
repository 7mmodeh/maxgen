"use client";

import { useState } from "react";

export default function ManageBillingButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null);
    setLoading(true);

    try {
      // Get access token from Supabase session cookie (SSR sessions are cookie-based),
      // but the portal route expects Bearer token.
      // We use @supabase/ssr browser client (same pattern as your checkout button).
      const { createBrowserClient } = await import("@supabase/ssr");

      const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
      const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
      const sb = createBrowserClient(url, anon);

      const { data } = await sb.auth.getSession();
      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/stripe/portal", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const json = (await res.json()) as { url?: string; error?: string };
      if (!res.ok || !json.url) {
        throw new Error(json.error || "Failed to open billing portal");
      }

      window.location.href = json.url;
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        onClick={run}
        disabled={loading}
        className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-semibold text-white hover:bg-white/10 disabled:opacity-60"
        type="button"
      >
        {loading ? "Opening billing…" : "Manage billing"}
      </button>
      {err ? <div className="text-xs text-rose-200">{err}</div> : null}
    </div>
  );
}
