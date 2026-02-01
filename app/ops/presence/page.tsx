import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
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

type PresenceOrderListRow = {
  id: string;
  user_id: string;
  package_key: string;
  status: string;
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

function toDebugString(v: unknown): string {
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (typeof v === "string") return v.length ? v : "(empty string)";
  if (typeof v === "number" || typeof v === "boolean") return String(v);
  if (typeof v === "bigint") return v.toString();
  if (typeof v === "symbol") return v.toString();
  if (typeof v === "function") return "[function]";
  try {
    return JSON.stringify(v);
  } catch {
    return "[unserializable]";
  }
}

export default async function OpsPresenceListPage() {
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

  const admin = getSupabaseAdmin();

  const meRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle();

  const meProfile = meRes.data as ProfileRow | null;
  const meErr = meRes.error;

  if (meErr || !meProfile || !isAdmin(meProfile.role)) {
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

  const ordersRes = await admin
    .from("presence_orders")
    .select("id,user_id,package_key,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(200);

  const orders = (ordersRes.data as PresenceOrderListRow[] | null) ?? [];
  const ordersErr = ordersRes.error;

  if (ordersErr) {
    return (
      <main className="mx-auto w-full max-w-6xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-4 text-sm opacity-80">Failed to load orders.</p>
        <pre className="mt-4 rounded-xl border p-4 text-xs overflow-auto">
          {ordersErr.message}
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
  profiles.forEach((p) => {
    if (p.email) emailByUserId.set(p.user_id, p.email);
  });

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Presence Ops</h1>
          <p className="mt-2 text-sm opacity-80">
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
          <thead className="border-b">
            <tr className="text-left">
              <th className="p-3">Created</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Package</th>
              <th className="p-3">Status</th>
              <th className="p-3">Order</th>
            </tr>
          </thead>

          <tbody>
            {orders.map((o) => {
              // Deterministic safe guards:
              // - If id isn't a UUID, do NOT render a Link that can become "/undefined"
              const idIsValid = typeof o.id === "string" && isUuid(o.id);

              // Stable key: use id if present, otherwise fallback to a deterministic composite.
              // (No Math.random; no impure calls.)
              const rowKey = idIsValid
                ? o.id
                : `${o.user_id}:${o.created_at}:${o.package_key}`;

              return (
                <tr key={rowKey} className="border-b last:border-b-0">
                  <td className="p-3 opacity-80 whitespace-nowrap">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                  <td className="p-3 font-medium">
                    {emailByUserId.get(o.user_id) ?? o.user_id}
                  </td>
                  <td className="p-3">{o.package_key}</td>
                  <td className="p-3">
                    <span className="rounded-full border px-2 py-1 text-xs">
                      {o.status}
                    </span>
                  </td>
                  <td className="p-3">
                    <div className="space-y-1">
                      {idIsValid ? (
                        <OpenOrderButton id={o.id} />
                      ) : (
                        <span className="text-xs opacity-70">
                          BAD_ID:{" "}
                          <span className="font-mono">
                            {toDebugString(o.id)}
                          </span>
                        </span>
                      )}

                      <div className="text-[11px] opacity-60">
                        raw id:{" "}
                        <span className="font-mono">{toDebugString(o.id)}</span>
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}

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
