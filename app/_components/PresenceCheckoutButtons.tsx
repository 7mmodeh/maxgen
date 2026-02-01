// app/_components/PresenceCheckoutButtons.tsx

"use client";

import { useMemo, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import { ROUTES } from "@/src/config/routes";

type PackageKey = "basic" | "booking" | "seo";
type PlanChoice = "onetime" | "monthly";

type Props = {
  tier: PackageKey;
  primaryLabel: string;
};

export default function PresenceCheckoutButtons({ tier, primaryLabel }: Props) {
  const [loading, setLoading] = useState<null | PlanChoice>(null);

  const canHaveOptionalMonthly = useMemo(
    () => tier === "basic" || tier === "booking",
    [tier],
  );

  async function startCheckout(choice: PlanChoice) {
    setLoading(choice);
    try {
      const { data, error } = await supabaseBrowser.auth.getSession();
      if (error) throw error;

      const accessToken = data.session?.access_token;
      if (!accessToken) {
        const next = encodeURIComponent("/online-presence#packages");
        window.location.href = `${ROUTES.login}?next=${next}`;
        return;
      }

      const body =
        tier === "seo"
          ? ({ kind: "presence", tier: "seo" } as const)
          : ({
              kind: "presence",
              tier,
              withMonthly: choice === "monthly",
            } as const);

      const res = await fetch("/api/stripe/checkout", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(`Checkout failed (${res.status}): ${txt}`);
      }

      const json = (await res.json()) as { url?: string };
      if (!json.url) throw new Error("Checkout did not return a url");
      window.location.href = json.url;
    } catch (e) {
      console.error(e);
      alert("Could not start checkout. Please try again.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="mt-6 flex flex-col gap-3">
      <button
        type="button"
        onClick={() => startCheckout(tier === "seo" ? "monthly" : "onetime")}
        disabled={loading !== null}
        className="rounded-lg px-4 py-3 text-sm font-semibold text-center transition disabled:opacity-60"
        style={{ background: "var(--mx-cta)", color: "#fff" }}
      >
        {loading ? "Redirecting…" : primaryLabel}
      </button>

      {canHaveOptionalMonthly ? (
        <button
          type="button"
          onClick={() => startCheckout("monthly")}
          disabled={loading !== null}
          className="rounded-lg px-4 py-3 text-sm font-semibold text-center transition disabled:opacity-60"
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.9)",
            background: "rgba(30,41,59,0.25)",
          }}
        >
          {loading ? "Redirecting…" : "Add monthly maintenance"}
        </button>
      ) : (
        <a
          href="mailto:info@maxgensys.com?subject=Online%20Presence%20-%20Question"
          className="rounded-lg px-4 py-3 text-sm font-semibold text-center transition"
          style={{
            border: "1px solid rgba(255,255,255,0.14)",
            color: "rgba(255,255,255,0.9)",
            background: "rgba(30,41,59,0.25)",
          }}
        >
          Ask before buying
        </a>
      )}

      <div className="text-[11px] mx-muted leading-relaxed">
        Payments are processed securely by Stripe. No SEO ranking guarantees.
      </div>
    </div>
  );
}
