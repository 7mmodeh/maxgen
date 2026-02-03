// app/qr-studio/_components/QrCheckoutButtons.tsx
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
  if (!token) throw new Error("Not authenticated");

  const res = await fetch("/api/stripe/checkout", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  const json = (await res.json()) as { url?: string; error?: string };
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Checkout failed");
  }

  window.location.href = json.url;
}

export default function QrCheckoutButtons() {
  const [loading, setLoading] = useState<null | string>(null);
  const [err, setErr] = useState<string | null>(null);

  async function run(label: string, body: unknown) {
    setErr(null);
    setLoading(label);
    try {
      await startCheckout(body);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      setErr(msg);
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <button
          onClick={() =>
            run("monthly", { kind: "qr_studio", billing: "monthly" })
          }
          disabled={!!loading}
          className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
        >
          {loading === "monthly" ? "Redirecting…" : "QR Studio — €7/month"}
        </button>

        <button
          onClick={() =>
            run("onetime", { kind: "qr_studio", billing: "onetime" })
          }
          disabled={!!loading}
          className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-60"
        >
          {loading === "onetime" ? "Redirecting…" : "QR Studio — €9 one-time"}
        </button>
      </div>

      <button
        onClick={() => run("printpack", { kind: "qr_print_pack" })}
        disabled={!!loading}
        className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-60"
      >
        {loading === "printpack" ? "Redirecting…" : "Print Pack — €19 one-time"}
      </button>

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
    </div>
  );
}
