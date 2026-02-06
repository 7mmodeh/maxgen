// app/ops/settings/page.tsx
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

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

function CardLink({
  href,
  title,
  desc,
}: {
  href: string;
  title: string;
  desc: string;
}) {
  return (
    <Link
      href={href}
      prefetch={false}
      className="block rounded-xl border p-6 hover:bg-black/[0.02] transition"
    >
      <div className="text-sm font-semibold">{title}</div>
      <div className="mt-2 text-sm opacity-80">{desc}</div>
      <div className="mt-4 text-xs opacity-70 underline underline-offset-4">
        Open
      </div>
    </Link>
  );
}

export default async function OpsSettingsHome() {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings</div>
          <h1 className="text-2xl font-semibold">Ops Settings</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>

        <Link
          href="/login?next=/ops/settings"
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
          <div className="text-xs opacity-60">Ops / Settings</div>
          <h1 className="text-2xl font-semibold">Ops Settings</h1>
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

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">Ops / Settings</div>
          <h1 className="text-2xl font-semibold">Ops Settings</h1>
          <p className="text-sm opacity-80">
            Admin-only control plane for OPS-LEDGER-01 (no deletes).
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

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <CardLink
          href="/ops/settings/reserves"
          title="Reserves"
          desc="Emergency buffer, refund reserve, VAT reserve (awareness-only)."
        />
        <CardLink
          href="/ops/settings/tax"
          title="Tax & VAT Awareness"
          desc="VAT status and filing frequency per business line (awareness-only)."
        />
        <CardLink
          href="/ops/settings/bank-accounts"
          title="Bank Accounts"
          desc="Create accounts (super-admin), archive/unarchive (admin)."
        />
        <CardLink
          href="/ops/settings/expenses"
          title="Expenses"
          desc="Recurring bills and manual expenses with paid tracking."
        />
        <CardLink
          href="/ops/settings/calendar"
          title="Regulatory Calendar"
          desc="Compliance dates, reminders, and status awareness."
        />
      </div>
    </main>
  );
}
