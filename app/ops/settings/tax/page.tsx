// app/ops/settings/tax/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import TaxClient from "./_components/TaxClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";
type ProfileRow = { user_id: string; email: string | null; role: UserRole };

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

type TaxRow = {
  id: string;
  business_line: string;
  vat_status: string;
  vat_filing_frequency: string;
  vat_effective_from: string | null;
  corp_tax_rate: string;
  notes: string | null;
  updated_at: string;
};

export default async function OpsTaxPage() {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings / Tax</div>
          <h1 className="text-2xl font-semibold">Tax & VAT Awareness</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>

        <Link
          href="/login?next=/ops/settings/tax"
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
          <div className="text-xs opacity-60">Ops / Settings / Tax</div>
          <h1 className="text-2xl font-semibold">Tax & VAT Awareness</h1>
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

  const rowsRes = await admin
    .from("ops_tax_profile")
    .select(
      "id,business_line,vat_status,vat_filing_frequency,vat_effective_from,corp_tax_rate,notes,updated_at",
    )
    .order("business_line", { ascending: true });

  const rows = (rowsRes.data as TaxRow[] | null) ?? [];

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings / Tax</div>
          <h1 className="text-2xl font-semibold">Tax & VAT Awareness</h1>
          <p className="text-sm opacity-80">
            Awareness-only configuration. Not a filing engine.
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

      {rowsRes.error ? (
        <pre className="mt-6 rounded-xl border p-4 text-xs overflow-auto">
          {rowsRes.error.message}
        </pre>
      ) : (
        <TaxClient initialRows={rows} />
      )}
    </main>
  );
}
