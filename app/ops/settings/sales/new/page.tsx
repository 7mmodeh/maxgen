import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import ManualSaleFormClient from "../_components/ManualSaleFormClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

type ProfileRow = {
  user_id: string;
  email: string | null;
  role: UserRole;
};

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

type BankAccountRow = {
  id: string;
  name: string;
  currency: string;
  status: string;
};

export default async function OpsNewManualSalePage() {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">
            Ops / Settings / Manual Sales
          </div>
          <h1 className="text-2xl font-semibold">New Manual Sale</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>
        <Link
          href="/login?next=/ops/settings/sales/new"
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

  const me = meRes.data as ProfileRow | null;

  if (meRes.error || !me || !isAdmin(me.role)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">
            Ops / Settings / Manual Sales
          </div>
          <h1 className="text-2xl font-semibold">New Manual Sale</h1>
          <p className="text-sm opacity-80">Access denied.</p>
        </header>
        <Link
          href="/account"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to Account
        </Link>
      </main>
    );
  }

  const accountsRes = await admin
    .from("ops_bank_accounts")
    .select("id,name,currency,status")
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (accountsRes.error) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <pre className="rounded-xl border p-4 text-xs overflow-auto">
          {accountsRes.error.message}
        </pre>
      </main>
    );
  }

  const accounts = (accountsRes.data as BankAccountRow[] | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">
            Ops / Settings / Manual Sales
          </div>
          <h1 className="text-2xl font-semibold">New Manual Sale</h1>
          <p className="text-sm opacity-80">
            Creates a ledger entry + canonical manual sale record.
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/ops"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Ops Dashboard
          </Link>
          <Link
            href="/ops/settings"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Settings
          </Link>
        </div>
      </div>

      <div className="mt-10">
        <ManualSaleFormClient accounts={accounts} />
      </div>
    </main>
  );
}
