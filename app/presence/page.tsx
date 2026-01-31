import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import PresenceOnboardingForm from "./_components/PresenceOnboardingForm";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };

type PresenceOnboarding = Record<string, JsonValue>;

type PresenceOrder = {
  id: string;
  package_key: "basic" | "booking" | "seo";
  status: string;
  onboarding: PresenceOnboarding | null;
  created_at: string;
};

export default async function PresencePage() {
  const supabase = await supabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Online Presence</h1>
        <p className="mt-2 text-sm opacity-80">Please sign in to continue.</p>
        <Link
          href="/login?next=/presence"
          className="mt-6 inline-block rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Sign in
        </Link>
      </main>
    );
  }

  const { data: orders } = await supabase
    .from("presence_orders")
    .select("id,package_key,status,onboarding,created_at")
    .order("created_at", { ascending: false })
    .limit(1)
    .returns<PresenceOrder[]>();

  const order = orders?.[0] ?? null;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Online Presence</h1>
          <p className="mt-2 text-sm opacity-80">
            Submit onboarding once. We build and publish within your package
            window.
          </p>
        </div>
        <Link
          href="/account"
          className="rounded-lg px-4 py-2 text-sm font-semibold border"
        >
          Account
        </Link>
      </div>

      {!order ? (
        <div className="mt-10 rounded-xl border p-6">
          <div className="text-sm font-semibold">No paid order found</div>
          <p className="mt-2 text-sm opacity-80">
            Purchase a package first, then come back here to submit onboarding.
          </p>
          <Link
            href="/online-presence#packages"
            className="mt-4 inline-block rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            View packages
          </Link>
        </div>
      ) : (
        <div className="mt-10 space-y-6">
          <div className="rounded-xl border p-6">
            <div className="text-sm font-semibold">Your order</div>
            <div className="mt-2 text-sm opacity-80">
              Package:{" "}
              <span className="font-semibold">{order.package_key}</span> •
              Status: <span className="font-semibold">{order.status}</span>
            </div>
            <div className="mt-2 text-xs opacity-70 font-mono">{order.id}</div>
          </div>

          <PresenceOnboardingForm
            orderId={order.id}
            initial={order.onboarding ?? {}}
          />
        </div>
      )}
    </main>
  );
}
