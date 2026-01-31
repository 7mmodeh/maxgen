import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { supabaseAdmin } from "@/src/lib/supabase-admin";

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

type PresenceOrderRow = {
  id: string;
  user_id: string;
  package_key: string;
  status: string;
  created_at: string;
  updated_at: string;
};

type ProfileRow = {
  user_id: string;
  email: string | null;
  role: UserRole;
};

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
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

  // Check role via service role to avoid RLS edge cases
  const { data: meProfile, error: meErr } = await supabaseAdmin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<ProfileRow | null>();

  if (meErr || !meProfile || !isAdmin(meProfile.role)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Access denied.</p>
        <Link
          href="/account"
          className="mt-6 inline-block underline underline-offset-4"
        >
          Go to Account
        </Link>
      </main>
    );
  }

  const { data: orders, error: ordersErr } = await supabaseAdmin
    .from("presence_orders")
    .select("id,user_id,package_key,status,created_at,updated_at")
    .order("created_at", { ascending: false })
    .limit(200)
    .returns<PresenceOrderRow[]>();

  if (ordersErr) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-4 text-sm opacity-80">Failed to load orders.</p>
        <pre className="mt-4 rounded-xl border p-4 text-xs overflow-auto">
          {String(ordersErr.message)}
        </pre>
      </main>
    );
  }

  const userIds = Array.from(new Set((orders ?? []).map((o) => o.user_id)));
  const { data: profiles } = await supabaseAdmin
    .from("profiles")
    .select("user_id,email,role")
    .in("user_id", userIds)
    .returns<ProfileRow[]>();

  const emailByUserId = new Map<string, string>();
  (profiles ?? []).forEach((p) => {
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
        <div className="flex gap-3">
          <Link
            href="/account"
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Account
          </Link>
        </div>
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
            {(orders ?? []).map((o) => (
              <tr key={o.id} className="border-b last:border-b-0">
                <td className="p-3 opacity-80 whitespace-nowrap">
                  {new Date(o.created_at).toLocaleString()}
                </td>
                <td className="p-3">
                  <div className="font-medium">
                    {emailByUserId.get(o.user_id) ?? o.user_id}
                  </div>
                </td>
                <td className="p-3">{o.package_key}</td>
                <td className="p-3">
                  <span className="rounded-full border px-2 py-1 text-xs">
                    {o.status}
                  </span>
                </td>
                <td className="p-3">
                  <Link
                    href={`/ops/presence/${o.id}`}
                    className="underline underline-offset-4"
                  >
                    Open
                  </Link>
                </td>
              </tr>
            ))}
            {(orders ?? []).length === 0 ? (
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
