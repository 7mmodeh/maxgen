// app/qr-studio/_components/QrCheckoutButtons.tsx
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
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
  if (!res.ok || !json.url) {
    throw new Error(json.error || "Checkout failed");
  }

  window.location.href = json.url;
}

export default function QrCheckoutButtons() {
  const [loading, setLoading] = useState<null | string>(null);
  const [err, setErr] = useState<string | null>(null);
  const [authed, setAuthed] = useState<boolean | null>(null);

  useEffect(() => {
    const run = async () => {
      const sb = supabaseBrowser();
      const { data } = await sb.auth.getSession();
      setAuthed(!!data.session?.access_token);
    };
    run().catch(() => setAuthed(false));
  }, []);

  async function run(label: string, body: unknown) {
    setErr(null);
    setLoading(label);
    try {
      await startCheckout(body);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "NOT_AUTHENTICATED") {
        setErr(
          "Please log in to purchase. Your account will unlock QR Studio instantly after payment.",
        );
      } else {
        setErr(msg);
      }
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm font-semibold">€7 / month</div>
          <div className="mt-1 text-xs text-neutral-600">
            Best for ongoing use.
          </div>
          <button
            onClick={() =>
              run("monthly", { kind: "qr_studio", billing: "monthly" })
            }
            disabled={!!loading}
            className="mt-3 w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          >
            {loading === "monthly" ? "Redirecting…" : "Start monthly"}
          </button>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm font-semibold">€9 one-time</div>
          <div className="mt-1 text-xs text-neutral-600">Pay once, use it.</div>
          <button
            onClick={() =>
              run("onetime", { kind: "qr_studio", billing: "onetime" })
            }
            disabled={!!loading}
            className="mt-3 w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-60"
          >
            {loading === "onetime" ? "Redirecting…" : "Buy once"}
          </button>
        </div>

        <div className="rounded-xl border border-neutral-200 bg-white p-4">
          <div className="text-sm font-semibold">€19 Print Pack</div>
          <div className="mt-1 text-xs text-neutral-600">Optional add-on.</div>
          <button
            onClick={() => run("printpack", { kind: "qr_print_pack" })}
            disabled={!!loading}
            className="mt-3 w-full rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900 disabled:opacity-60"
          >
            {loading === "printpack" ? "Redirecting…" : "Add Print Pack"}
          </button>
        </div>
      </div>

      {authed === false ? (
        <div className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <div className="font-semibold">Log in to purchase</div>
          <div className="mt-1 text-amber-800">
            Create an account (or log in) and you’ll unlock QR Studio
            automatically after payment.
          </div>
          <div className="mt-3 flex gap-2">
            <Link
              href="/login"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
            >
              Create account
            </Link>
          </div>
        </div>
      ) : null}

      {err ? <div className="text-sm text-red-600">{err}</div> : null}
    </div>
  );
}
