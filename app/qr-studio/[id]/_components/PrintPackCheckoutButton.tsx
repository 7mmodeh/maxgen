// app/qr-studio/[id]/_components/PrintPackCheckoutButton.tsx
"use client";

import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createBrowserClient(url, anon);
}

async function startCheckout(body: unknown): Promise<void> {
  const sb = supabaseBrowser();
  const { data } = await sb.auth.getSession();
  const token = data.session?.access_token;
  if (!token) throw new Error("NOT_AUTHENTICATED");

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) throw new Error(json.error || "Checkout failed");
  window.location.href = json.url;
}

export default function PrintPackCheckoutButton() {
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function run() {
    setErr(null);
    setLoading(true);
    try {
      await startCheckout({ kind: "qr_print_pack" });
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(
        msg === "NOT_AUTHENTICATED"
          ? "Please log in to purchase Print Pack."
          : msg,
      );
      setLoading(false);
    }
  }

  return (
    <div>
      <button
        onClick={run}
        disabled={loading}
        className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60"
      >
        {loading ? "Redirecting…" : "Unlock Print Pack (€19)"}
      </button>
      {err ? <div className="mt-2 text-xs text-rose-200">{err}</div> : null}
    </div>
  );
}
