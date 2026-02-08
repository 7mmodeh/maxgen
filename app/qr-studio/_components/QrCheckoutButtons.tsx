"use client";

import Link from "next/link";
import { useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import ManageBillingButton from "./ManageBillingButton";

type QrStudioPlan = "monthly" | "onetime";

type CheckoutBody =
  | { kind: "qr_studio"; billing: QrStudioPlan }
  | { kind: "qr_print_pack" };

type Props = {
  authed: boolean;
  qrStudioPlan: QrStudioPlan | null;
  hasPrintPack: boolean;
};

function supabaseBrowser() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !anon) {
    throw new Error(
      "Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY",
    );
  }

  return createBrowserClient(url, anon);
}

async function startCheckout(body: CheckoutBody): Promise<void> {
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

function Badge({ children }: { children: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] text-white/80">
      {children}
    </span>
  );
}

export default function QrCheckoutButtons({
  authed,
  qrStudioPlan,
  hasPrintPack,
}: Props) {
  const [loading, setLoading] = useState<
    null | "monthly" | "onetime" | "printpack"
  >(null);
  const [err, setErr] = useState<string | null>(null);

  const hasMonthly = qrStudioPlan === "monthly";
  const hasOnetime = qrStudioPlan === "onetime";

  // Option 2 requirement:
  // If monthly is active, hide the one-time card entirely.
  const showOnetimeCard = !hasMonthly;

  async function run(
    label: "monthly" | "onetime" | "printpack",
    body: CheckoutBody,
  ) {
    setErr(null);
    setLoading(label);
    try {
      await startCheckout(body);
    } catch (e: unknown) {
      const msg = e instanceof Error ? e.message : String(e);
      if (msg === "NOT_AUTHENTICATED") {
        setErr(
          "Please log in to purchase. Access unlocks instantly after payment.",
        );
      } else {
        setErr(msg);
      }
      setLoading(null);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {!authed ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="text-sm font-semibold">Log in to purchase</div>
          <div className="mt-1 text-sm text-white/70">
            Create an account (or log in) and QR Studio unlocks automatically
            after payment.
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/login"
              className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium text-white hover:bg-white/10"
            >
              Create account
            </Link>
          </div>
        </div>
      ) : null}

      <div className="grid gap-3">
        {/* Monthly */}
        <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">Monthly</div>
                <Badge>Most popular</Badge>
                {hasMonthly ? <Badge>Active</Badge> : null}
              </div>
              <div className="mt-1 text-xs text-white/60">
                Best for ongoing use with rolling limits (7-day / 30-day).
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold">€7</div>
              <div className="text-xs text-white/60">per month</div>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 text-sm text-white/70">
            <li>
              <span className="font-semibold text-white">Templates:</span> T1–T3
            </li>
            <li>
              <span className="font-semibold text-white">Exports:</span> PNG
              1024 + SVG
            </li>
            <li>
              <span className="font-semibold text-white">Scan-safety:</span> ECC
              H + quiet zone
            </li>
          </ul>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            {hasMonthly ? (
              <button
                type="button"
                disabled
                className="w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 disabled:opacity-100 sm:w-auto"
              >
                Subscribed
              </button>
            ) : (
              <button
                type="button"
                onClick={() =>
                  run("monthly", { kind: "qr_studio", billing: "monthly" })
                }
                disabled={!authed || loading !== null}
                className="w-full rounded-md bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:opacity-95 disabled:opacity-60 sm:w-auto"
              >
                {loading === "monthly" ? "Redirecting…" : "Start monthly"}
              </button>
            )}

            {hasMonthly ? <ManageBillingButton /> : null}
          </div>
        </div>

        {/* One-time (hidden when monthly active) */}
        {showOnetimeCard ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <div className="text-sm font-semibold">One-time</div>
                  {hasOnetime ? (
                    <Badge>Purchased</Badge>
                  ) : (
                    <Badge>Pay once</Badge>
                  )}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Single project lifetime access (1 QR total).
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-semibold">€9</div>
                <div className="text-xs text-white/60">one-time</div>
              </div>
            </div>

            <ul className="mt-4 grid gap-2 text-sm text-white/70">
              <li>
                <span className="font-semibold text-white">Allowance:</span> 1
                project total
              </li>
              <li>
                <span className="font-semibold text-white">Templates:</span>{" "}
                T1–T3
              </li>
              <li>
                <span className="font-semibold text-white">Exports:</span> PNG
                1024 + SVG
              </li>
            </ul>

            <div className="mt-4">
              {hasOnetime ? (
                <button
                  type="button"
                  disabled
                  className="w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 disabled:opacity-100"
                >
                  Purchased
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    run("onetime", { kind: "qr_studio", billing: "onetime" })
                  }
                  disabled={!authed || loading !== null}
                  className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
                >
                  {loading === "onetime" ? "Redirecting…" : "Buy once"}
                </button>
              )}
            </div>
          </div>
        ) : null}

        {/* Print Pack add-on */}
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <div className="text-sm font-semibold">Print Pack</div>
                <Badge>Add-on</Badge>
                {hasPrintPack ? <Badge>Owned</Badge> : null}
              </div>
              <div className="mt-1 text-xs text-white/60">
                One-time upgrade for print-focused delivery (dashboard unlock).
              </div>
            </div>

            <div className="text-right">
              <div className="text-sm font-semibold">€19</div>
              <div className="text-xs text-white/60">one-time</div>
            </div>
          </div>

          <ul className="mt-4 grid gap-2 text-sm text-white/70">
            <li>
              <span className="font-semibold text-white">Use-case:</span>{" "}
              signage, menus, stickers, flyers
            </li>
            <li>
              <span className="font-semibold text-white">Access:</span> unlocked
              via entitlement (no manual steps)
            </li>
          </ul>

          <div className="mt-4">
            {hasPrintPack ? (
              <button
                type="button"
                disabled
                className="w-full rounded-md bg-white/10 px-4 py-2.5 text-sm font-semibold text-white/80 disabled:opacity-100"
              >
                Purchased
              </button>
            ) : (
              <button
                type="button"
                onClick={() => run("printpack", { kind: "qr_print_pack" })}
                disabled={!authed || loading !== null}
                className="w-full rounded-md border border-white/15 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white hover:bg-white/10 disabled:opacity-60"
              >
                {loading === "printpack" ? "Redirecting…" : "Add Print Pack"}
              </button>
            )}
          </div>
        </div>
      </div>

      {err ? (
        <div className="rounded-xl border border-rose-200/20 bg-rose-500/10 p-3 text-sm text-rose-200">
          {err}
        </div>
      ) : null}
    </div>
  );
}
