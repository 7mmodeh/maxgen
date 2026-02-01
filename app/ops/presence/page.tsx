import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import PresenceStatusButtons from "./_components/PresenceStatusButtons";
import OpenOrderButton from "./_components/OpenOrderButton";

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

type PresenceOrderListRow = Omit<PresenceOrderDetailRow, "onboarding">;

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function safeDecodeURIComponent(v: string): string {
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

type SearchParamsShape = { id?: string | string[] };

function isPromiseLike<T>(v: unknown): v is PromiseLike<T> {
  if (typeof v !== "object" || v === null) return false;
  const maybe = v as { then?: unknown };
  return typeof maybe.then === "function";
}

async function resolveSearchParams(
  input: unknown,
): Promise<SearchParamsShape | null> {
  if (isPromiseLike<SearchParamsShape>(input)) {
    const awaited = await input;
    return typeof awaited === "object" && awaited !== null ? awaited : null;
  }
  if (typeof input === "object" && input !== null) {
    return input as SearchParamsShape;
  }
  return null;
}

function pickFirstId(v: unknown): string | null {
  if (typeof v === "string") return v;
  if (Array.isArray(v) && v.length > 0 && typeof v[0] === "string") return v[0];
  return null;
}

function toTitle(s: string): string {
  return s
    .replace(/_/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/^\w/, (c) => c.toUpperCase());
}

function statusBadgeClasses(status: string): string {
  // Keep it simple and deterministic without assumptions about status values beyond your check constraint.
  // (No new deps; just utility classes.)
  const base =
    "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold";
  if (status === "paid") return `${base} border-amber-300 bg-black-50`;
  if (status === "onboarding_received")
    return `${base} border-sky-300 bg-black-50`;
  if (status === "in_progress") return `${base} border-blue-300 bg-black-50`;
  if (status === "delivered") return `${base} border-emerald-300 bg-black-50`;
  if (status === "canceled") return `${base} border-rose-300 bg-rose-50`;
  return `${base} border-gray-300 bg-black-50`;
}

function toOnboardingEntries(
  onboarding: unknown,
): Array<{ key: string; value: string }> {
  if (onboarding === null || onboarding === undefined) return [];

  if (typeof onboarding === "object" && !Array.isArray(onboarding)) {
    const rec = onboarding as Record<string, unknown>;
    const keys = Object.keys(rec).sort((a, b) => a.localeCompare(b));
    return keys.map((k) => {
      const v = rec[k];
      if (v === null || v === undefined) return { key: k, value: "—" };
      if (typeof v === "string") return { key: k, value: v.trim() || "—" };
      if (
        typeof v === "number" ||
        typeof v === "boolean" ||
        typeof v === "bigint"
      )
        return { key: k, value: String(v) };

      try {
        return { key: k, value: JSON.stringify(v) };
      } catch {
        return { key: k, value: "[unserializable]" };
      }
    });
  }

  // Non-object onboarding (unexpected but possible)
  try {
    return [{ key: "value", value: JSON.stringify(onboarding) }];
  } catch {
    return [{ key: "value", value: "[unserializable]" }];
  }
}

export default async function OpsPresencePage(props: {
  searchParams?: unknown;
}) {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Presence Ops</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>

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

  const admin = getSupabaseAdmin();

  // Admin gate
  const meRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle();

  const meProfile = meRes.data as ProfileRow | null;

  if (meRes.error || !meProfile || !isAdmin(meProfile.role)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold">Presence Ops</h1>
          <p className="text-sm opacity-80">Access denied.</p>
        </header>

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

  // ✅ IMPORTANT: searchParams may be a Promise in your Next.js runtime
  const sp = await resolveSearchParams(props.searchParams);
  const rawId = pickFirstId(sp?.id);
  const decodedId = rawId ? safeDecodeURIComponent(rawId).trim() : null;

  // -------------------------
  // DETAIL VIEW: /ops/presence?id=<uuid>
  // -------------------------
  if (decodedId) {
    if (!isUuid(decodedId)) {
      return (
        <main className="mx-auto w-full max-w-5xl px-6 py-16">
          <header className="space-y-2">
            <div className="text-xs opacity-60">Ops / Presence / Order</div>
            <h1 className="text-2xl font-semibold">Presence Ops</h1>
            <p className="text-sm opacity-80">Invalid order id (not a UUID).</p>
          </header>

          <div className="mt-6 rounded-xl border p-4 text-xs overflow-auto space-y-2">
            <div>
              <span className="opacity-70">raw:</span>{" "}
              <span className="font-mono">{rawId ?? "null"}</span>
            </div>
            <div>
              <span className="opacity-70">decoded:</span>{" "}
              <span className="font-mono">{decodedId}</span>
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

    const orderRes = await admin
      .from("presence_orders")
      .select("id,user_id,package_key,status,onboarding,created_at,updated_at")
      .eq("id", decodedId)
      .maybeSingle();

    const order = orderRes.data as PresenceOrderDetailRow | null;

    if (orderRes.error) {
      return (
        <main className="mx-auto w-full max-w-5xl px-6 py-16">
          <header className="space-y-2">
            <div className="text-xs opacity-60">Ops / Presence / Order</div>
            <h1 className="text-2xl font-semibold">Presence Ops</h1>
            <p className="text-sm opacity-80">Failed to load order.</p>
          </header>

          <pre className="mt-6 rounded-xl border p-4 text-xs overflow-auto">
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
          <header className="space-y-2">
            <div className="text-xs opacity-60">Ops / Presence / Order</div>
            <h1 className="text-2xl font-semibold">Presence Ops</h1>
            <p className="text-sm opacity-80">Order not found.</p>
          </header>

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

    const onboardingEntries = toOnboardingEntries(order.onboarding);

    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2">
            <div className="text-xs opacity-60">Ops / Presence / Order</div>
            <h1 className="text-2xl font-semibold">Presence Order</h1>
            <div className="flex flex-wrap items-center gap-3 text-sm">
              <span className="opacity-80">Admin fulfillment view</span>
              <span className={statusBadgeClasses(order.status)}>
                {toTitle(order.status)}
              </span>
            </div>
          </div>

          <div className="flex gap-3">
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
          <section className="rounded-xl border p-6 lg:col-span-2">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold">Onboarding details</h2>
              <span className="text-xs opacity-60 font-mono">{order.id}</span>
            </div>

            {onboardingEntries.length > 0 ? (
              <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                {onboardingEntries.map(({ key, value }) => (
                  <div key={key} className="rounded-lg border p-4">
                    <dt className="text-xs opacity-70">{toTitle(key)}</dt>
                    <dd className="mt-1 font-medium break-words">
                      {value || "—"}
                    </dd>
                  </div>
                ))}
              </dl>
            ) : (
              <div className="mt-5 rounded-lg border p-4 text-sm opacity-80">
                No onboarding data yet.
              </div>
            )}

            <details className="mt-5 rounded-lg border p-4">
              <summary className="cursor-pointer text-sm font-semibold">
                Raw onboarding JSON
              </summary>
              <pre className="mt-3 text-xs overflow-auto">
                {JSON.stringify(order.onboarding ?? {}, null, 2)}
              </pre>
            </details>
          </section>

          {/* Summary + status actions */}
          <aside className="space-y-6">
            <section className="rounded-xl border p-6">
              <h2 className="text-sm font-semibold">Order summary</h2>

              <div className="mt-4 space-y-3 text-sm">
                <div className="flex items-start justify-between gap-3">
                  <span className="opacity-70">Customer</span>
                  <span className="font-medium text-right break-words">
                    {customerProfile?.email ?? order.user_id}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="opacity-70">Package</span>
                  <span className="font-medium text-right">
                    {order.package_key}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="opacity-70">Status</span>
                  <span className={statusBadgeClasses(order.status)}>
                    {toTitle(order.status)}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="opacity-70">Created</span>
                  <span className="font-medium text-right whitespace-nowrap">
                    {new Date(order.created_at).toLocaleString()}
                  </span>
                </div>

                <div className="flex items-start justify-between gap-3">
                  <span className="opacity-70">Updated</span>
                  <span className="font-medium text-right whitespace-nowrap">
                    {new Date(order.updated_at).toLocaleString()}
                  </span>
                </div>
              </div>
            </section>

            <section className="rounded-xl border p-0 overflow-hidden">
              <PresenceStatusButtons
                orderId={order.id}
                currentStatus={order.status}
              />
            </section>
          </aside>
        </div>
      </main>
    );
  }

  // -------------------------
  // LIST VIEW: /ops/presence
  // -------------------------
  const ordersRes = await admin
    .from("presence_orders")
    .select("id,user_id,package_key,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (ordersRes.data as PresenceOrderListRow[] | null) ?? [];

  if (ordersRes.error) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">Ops / Presence</div>
          <h1 className="text-2xl font-semibold">Presence Ops</h1>
          <p className="text-sm opacity-80">Failed to load orders.</p>
        </header>

        <pre className="mt-6 rounded-xl border p-4 text-xs overflow-auto">
          {ordersRes.error.message}
        </pre>
      </main>
    );
  }

  const userIds = Array.from(new Set(orders.map((o) => o.user_id)));

  const profilesRes =
    userIds.length > 0
      ? await admin
          .from("profiles")
          .select("user_id,email,role")
          .in("user_id", userIds)
      : { data: [], error: null };

  const profiles = (profilesRes.data as ProfileRow[] | null) ?? [];
  const emailByUserId = new Map<string, string>();
  for (const p of profiles) {
    if (p.email) emailByUserId.set(p.user_id, p.email);
  }

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">Ops / Presence</div>
          <h1 className="text-2xl font-semibold">Presence Ops</h1>
          <p className="text-sm opacity-80">
            Internal fulfillment queue — paid orders → onboarding → delivery.
          </p>
        </div>

        <Link
          href="/account"
          prefetch={false}
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Account
        </Link>
      </div>

      <div className="mt-10 overflow-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="border-b bg-black/[0.02]">
            <tr className="text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Package</th>
              <th className="p-3">Status</th>
              <th className="p-3">Order</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b last:border-b-0">
                <td className="p-3 opacity-80 whitespace-nowrap">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="p-3 font-medium">
                  {emailByUserId.get(o.user_id) ?? o.user_id}
                </td>
                <td className="p-3">{o.package_key}</td>
                <td className="p-3">
                  <span className={statusBadgeClasses(o.status)}>
                    {toTitle(o.status)}
                  </span>
                </td>
                <td className="p-3">
                  <OpenOrderButton id={o.id} />
                </td>
              </tr>
            ))}

            {orders.length === 0 ? (
              <tr>
                <td className="p-4 opacity-80" colSpan={5}>
                  No orders yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </main>
  );
}
