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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isPresenceOrder(value: unknown): value is PresenceOrder {
  if (!isRecord(value)) return false;

  const id = value.id;
  const packageKey = value.package_key;
  const status = value.status;
  const createdAt = value.created_at;

  if (typeof id !== "string") return false;
  if (typeof status !== "string") return false;
  if (typeof createdAt !== "string") return false;

  if (
    packageKey !== "basic" &&
    packageKey !== "booking" &&
    packageKey !== "seo"
  ) {
    return false;
  }

  const onboarding = value.onboarding;
  if (onboarding !== null && onboarding !== undefined) {
    if (!isRecord(onboarding)) return false;
  }

  return true;
}

function pickLatestPresenceOrder(data: unknown): PresenceOrder | null {
  if (!Array.isArray(data)) return null;
  const first = data[0];
  return isPresenceOrder(first) ? first : null;
}

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

  const { data, error } = await supabase
    .from("presence_orders")
    .select("id,package_key,status,onboarding,created_at")
    .order("created_at", { ascending: false })
    .limit(1);

  // No assumptions: if query errors or shape mismatch, treat as no order.
  const order = error ? null : pickLatestPresenceOrder(data);

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
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Account
        </Link>
      </div>

      {!order ? (
        <div className="mt-10 rounded-xl border p-6">
          <div className="text-sm font-semibold">No order found</div>
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
            <div className="mt-2 font-mono text-xs opacity-70">{order.id}</div>
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
