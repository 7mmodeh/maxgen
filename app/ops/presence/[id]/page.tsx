import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import PresenceStatusButtons from "../_components/PresenceStatusButtons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

type ProfileRow = {
  user_id: string;
  email: string | null;
  role: UserRole;
};

type PresenceOrderDetailRow = {
  id: string;
  user_id: string;
  package_key: string;
  status: string;
  onboarding: unknown;
  created_at: string;
  updated_at: string;
};

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (
    typeof v === "number" ||
    typeof v === "boolean" ||
    typeof v === "bigint"
  ) {
    return String(v);
  }
  try {
    return JSON.stringify(v);
  } catch {
    return "[unserializable]";
  }
}

function safeDecodeURIComponent(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

function toLocal(ts: string): string {
  const d = new Date(ts);
  return Number.isNaN(d.getTime()) ? ts : d.toLocaleString();
}

function statusLabel(status: string): string {
  return status.replaceAll("_", " ");
}

function statusClass(status: string): string {
  // Neutral, readable, no reliance on custom colors
  switch (status) {
    case "paid":
      return "border bg-white";
    case "onboarding_received":
      return "border bg-white";
    case "in_progress":
      return "border bg-white";
    case "delivered":
      return "border bg-white";
    case "canceled":
      return "border bg-white opacity-70";
    default:
      return "border bg-white";
  }
}

function asOnboardingObject(v: unknown): Record<string, unknown> | null {
  if (typeof v !== "object" || v === null) return null;
  if (Array.isArray(v)) return null;
  return v as Record<string, unknown>;
}

function prettyKey(k: string): string {
  return k.replaceAll("_", " ").trim();
}

function renderValue(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "string") return v;
  if (typeof v === "number" || typeof v === "boolean" || typeof v === "bigint")
    return String(v);
  try {
    return JSON.stringify(v);
  } catch {
    return "[unserializable]";
  }
}

export default async function OpsPresenceDetailPage({
  params,
}: {
  params: { id?: string };
}) {
  const rawId = params?.id ?? "";
  const decodedId = safeDecodeURIComponent(rawId).trim();

  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Please sign in.</p>
        <Link
          href="/login?next=/ops/presence"
          className="mt-6 inline-block rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (!decodedId || !isUuid(decodedId)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">
          Invalid order id (not a UUID).
        </p>

        <div className="mt-4 rounded-xl border p-4 text-xs overflow-auto space-y-2">
          <div>
            <span className="opacity-70">params.id (raw):</span>{" "}
            <span className="font-mono">{safeString(rawId)}</span>
          </div>
          <div>
            <span className="opacity-70">decoded:</span>{" "}
            <span className="font-mono">{safeString(decodedId)}</span>
          </div>
          <div>
            <span className="opacity-70">params object:</span>{" "}
            <span className="font-mono">{safeString(params)}</span>
          </div>
        </div>

        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const id = decodedId;
  const admin = getSupabaseAdmin();

  const meRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle();

  const meProfile = meRes.data as ProfileRow | null;

  if (meRes.error || !meProfile || !isAdmin(meProfile.role)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Access denied.</p>
        <Link
          href="/account"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Go to Account
        </Link>
      </main>
    );
  }

  const orderRes = await admin
    .from("presence_orders")
    .select("id,user_id,package_key,status,onboarding,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  const order = orderRes.data as PresenceOrderDetailRow | null;

  if (orderRes.error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Failed to load order.</p>
        <pre className="mt-4 rounded-xl border p-4 text-xs overflow-auto">
          {orderRes.error.message}
        </pre>
        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Order not found.</p>
        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const customerRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", order.user_id)
    .maybeSingle();

  const customerProfile = customerRes.data as ProfileRow | null;
  const customerEmail = customerProfile?.email ?? null;

  const onboardingObj = asOnboardingObject(order.onboarding);
  const onboardingEntries = onboardingObj
    ? Object.entries(onboardingObj)
        .map(([k, v]) => [k, renderValue(v)] as const)
        .filter(([, v]) => v.trim().length > 0)
        .sort((a, b) => a[0].localeCompare(b[0]))
    : [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-2xl font-semibold">Presence Order</h1>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${statusClass(
                order.status,
              )}`}
              title={order.status}
            >
              {statusLabel(order.status)}
            </span>
          </div>
          <p className="mt-2 text-sm opacity-80">
            Admin fulfillment view — order details, onboarding and status.
          </p>
          <div className="mt-2 text-xs opacity-70">
            <span className="font-mono">Order ID: {order.id}</span>
          </div>
        </div>

        <div className="flex shrink-0 gap-3">
          <Link
            href="/ops/presence"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Back to list
          </Link>
          <Link
            href="/account"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Account
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 lg:grid-cols-3">
        {/* Onboarding */}
        <section className="rounded-2xl border p-6 lg:col-span-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Onboarding</div>
              <div className="mt-1 text-xs opacity-70">
                Form fields captured from customer.
              </div>
            </div>
          </div>

          <div className="mt-5 overflow-hidden rounded-xl border">
            <table className="w-full text-sm">
              <tbody>
                {onboardingEntries.length > 0 ? (
                  onboardingEntries.map(([k, v]) => (
                    <tr key={k} className="border-b last:border-b-0">
                      <td className="w-48 p-3 align-top text-xs font-semibold opacity-70">
                        {prettyKey(k)}
                      </td>
                      <td className="p-3 whitespace-pre-wrap break-words">
                        {v}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="p-4 text-sm opacity-80">
                      No onboarding data stored yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <details className="mt-4 rounded-xl border p-4">
            <summary className="cursor-pointer text-sm font-semibold">
              Raw JSON
            </summary>
            <pre className="mt-3 overflow-auto rounded-xl border p-4 text-xs">
              {JSON.stringify(order.onboarding ?? {}, null, 2)}
            </pre>
          </details>
        </section>

        {/* Order info + actions */}
        <aside className="rounded-2xl border p-6">
          <div className="text-sm font-semibold">Order info</div>

          <dl className="mt-4 space-y-3 text-sm">
            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold opacity-70">Customer</dt>
              <dd className="break-words">
                {customerEmail ? (
                  <a
                    href={`mailto:${customerEmail}`}
                    className="underline underline-offset-4"
                  >
                    {customerEmail}
                  </a>
                ) : (
                  <span className="font-mono text-xs">{order.user_id}</span>
                )}
              </dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold opacity-70">Package</dt>
              <dd className="font-medium">{order.package_key}</dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold opacity-70">Status</dt>
              <dd className="font-medium">{statusLabel(order.status)}</dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold opacity-70">Created</dt>
              <dd>{toLocal(order.created_at)}</dd>
            </div>

            <div className="flex flex-col gap-1">
              <dt className="text-xs font-semibold opacity-70">Updated</dt>
              <dd>{toLocal(order.updated_at)}</dd>
            </div>
          </dl>

          <div className="mt-6">
            <PresenceStatusButtons
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </aside>
      </div>
    </main>
  );
}
