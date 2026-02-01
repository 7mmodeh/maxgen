// app/account/page.tsx

import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";

type EntitlementRow = {
  product_key: string;
  plan: string;
  status: string;
  expires_at: string | null;
  updated_at: string;
};

type PresenceOrderRow = {
  id: string;
  package_key: string;
  status: string;
  created_at: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEntitlementRow(value: unknown): value is EntitlementRow {
  if (!isRecord(value)) return false;
  return (
    typeof value.product_key === "string" &&
    typeof value.plan === "string" &&
    typeof value.status === "string" &&
    (typeof value.expires_at === "string" || value.expires_at === null) &&
    typeof value.updated_at === "string"
  );
}

function isPresenceOrderRow(value: unknown): value is PresenceOrderRow {
  if (!isRecord(value)) return false;
  return (
    typeof value.id === "string" &&
    typeof value.package_key === "string" &&
    typeof value.status === "string" &&
    typeof value.created_at === "string"
  );
}

function pickEntitlements(data: unknown): EntitlementRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isEntitlementRow);
}

function pickPresenceOrders(data: unknown): PresenceOrderRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isPresenceOrderRow);
}

export default async function AccountPage() {
  const supabase = await supabaseServer();

  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-2xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Account</h1>
        <p className="mt-2 text-sm opacity-80">You’re not signed in.</p>
        <div className="mt-6">
          <Link
            href="/login?next=/account"
            className="rounded-lg px-5 py-3 text-sm font-semibold"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            Sign in
          </Link>
        </div>
      </main>
    );
  }

  const [entRes, poRes] = await Promise.all([
    supabase
      .from("entitlements")
      .select("product_key,plan,status,expires_at,updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false }),
    supabase
      .from("presence_orders")
      .select("id,package_key,status,created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false }),
  ]);

  const entitlements = entRes.error ? [] : pickEntitlements(entRes.data);
  const presenceOrders = poRes.error ? [] : pickPresenceOrders(poRes.data);

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Account</h1>
          <p className="mt-2 text-sm opacity-80">
            Signed in as <span className="font-semibold">{user.email}</span>
          </p>
          <p className="mt-1 text-xs opacity-70">User ID: {user.id}</p>
        </div>

        <a
          href="/logout"
          className="rounded-lg border px-4 py-2 text-sm font-semibold"
        >
          Sign out
        </a>
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Entitlements</h2>
        <div className="mt-3 rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/10">
              <tr>
                <th className="text-left p-3">product_key</th>
                <th className="text-left p-3">plan</th>
                <th className="text-left p-3">status</th>
                <th className="text-left p-3">expires_at</th>
                <th className="text-left p-3">updated_at</th>
              </tr>
            </thead>
            <tbody>
              {entitlements.map((e, idx) => (
                <tr
                  key={`${e.product_key}-${e.plan}-${idx}`}
                  className="border-t"
                >
                  <td className="p-3 font-mono">{e.product_key}</td>
                  <td className="p-3">{e.plan}</td>
                  <td className="p-3">{e.status}</td>
                  <td className="p-3">{e.expires_at ?? "—"}</td>
                  <td className="p-3">
                    {new Date(e.updated_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {entitlements.length === 0 ? (
                <tr>
                  <td className="p-3 opacity-70" colSpan={5}>
                    No entitlements yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold">Online Presence Orders</h2>
        <div className="mt-3 rounded-xl border overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-black/10">
              <tr>
                <th className="text-left p-3">id</th>
                <th className="text-left p-3">package_key</th>
                <th className="text-left p-3">status</th>
                <th className="text-left p-3">created_at</th>
              </tr>
            </thead>
            <tbody>
              {presenceOrders.map((o) => (
                <tr key={o.id} className="border-t">
                  <td className="p-3 font-mono">{o.id}</td>
                  <td className="p-3">{o.package_key}</td>
                  <td className="p-3">{o.status}</td>
                  <td className="p-3">
                    {new Date(o.created_at).toLocaleString()}
                  </td>
                </tr>
              ))}
              {presenceOrders.length === 0 ? (
                <tr>
                  <td className="p-3 opacity-70" colSpan={4}>
                    No presence orders yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
