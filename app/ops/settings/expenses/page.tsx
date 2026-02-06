// app/ops/settings/expenses/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import ExpensesClient from "./_components/ExpensesClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";
type ProfileRow = { user_id: string; email: string | null; role: UserRole };
function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

type ExpenseRow = {
  id: string;
  business_line: string;
  name: string;
  category: string;
  amount_expected: string;
  frequency: string;
  due_date: string;
  paid_at: string | null;
  linked_ledger_entry_id: string | null;
  status: string;
  notes: string;
  updated_at: string;
};

export default async function OpsExpensesPage() {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings / Expenses</div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>
        <Link
          href="/login?next=/ops/settings/expenses"
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
          <div className="text-xs opacity-60">Ops / Settings / Expenses</div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm opacity-80">Access denied.</p>
        </header>
        <Link
          href="/ops/settings"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to Settings
        </Link>
      </main>
    );
  }

  // Prefer the status view if present
  const res = await admin
    .from("ops_expenses_status")
    .select("*")
    .order("due_date", { ascending: true });

  const rows = (res.data as ExpenseRow[] | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings / Expenses</div>
          <h1 className="text-2xl font-semibold">Expenses</h1>
          <p className="text-sm opacity-80">
            Manual expenses + recurring bills (no deletes).
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ops/settings"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Back
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

      {res.error ? (
        <pre className="mt-6 rounded-xl border p-4 text-xs overflow-auto">
          {res.error.message}
        </pre>
      ) : (
        <ExpensesClient initialRows={rows} />
      )}
    </main>
  );
}
