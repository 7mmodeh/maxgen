import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import OpsDashboardClient from "./_components/OpsDashboardClient";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";
type ProfileRow = { user_id: string; email: string | null; role: UserRole };

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

type BankAccountRow = {
  id: string;
  name: string;
  currency: string;
  status: string;
  opening_balance_amount: string; // numeric -> string
  opening_balance_date: string; // date
  updated_at: string;
};

type LedgerEntryRow = {
  id: string;
  effective_date: string; // date
  bank_account_id: string;
  amount: string; // numeric -> string
  entry_type: string;
  category: string;
  business_line: string;
  counterparty: string | null;
  payment_method: string | null;
  tags: string[] | null;
  transfer_group_id: string | null;
  created_at: string; // timestamptz
  notes: string | null;
};

type ExpenseStatusRow = {
  id: string;
  business_line: string;
  name: string;
  category: string;
  amount_expected: string; // numeric -> string
  frequency: string;
  due_date: string; // date
  paid_at: string | null; // date
  status: string;
  computed_status: string;
};

type CalendarStatusRow = {
  id: string;
  title: string;
  category: string;
  business_line: string;
  due_date: string; // date
  frequency: string;
  amount_estimate: string | null; // numeric -> string
  status: string;
  computed_status: string;
};

type ReserveBucketRow = {
  id: string;
  name: string;
  business_line: string;
  kind: string; // ops_reserve_kind
  percentage: string | null; // numeric -> string
  fixed_amount: string | null; // numeric -> string
  notes: string | null;
  updated_at: string;
};

type SalesDailyRollupRow = {
  day: string; // date
  business_line: string; // business_line enum
  currency: string | null; // may be null if unknown
  amount_cents: number | string | null; // int/bigint -> might come as string depending on client
  sales_count: number | string | null; // optional
};

function toNumber(v: string | number | null | undefined): number {
  if (v === null || v === undefined) return 0;
  if (typeof v === "number") return Number.isFinite(v) ? v : 0;
  const n = Number(String(v));
  return Number.isFinite(n) ? n : 0;
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function addDaysIso(baseIso: string, days: number): string {
  const d = new Date(baseIso + "T00:00:00.000Z");
  d.setUTCDate(d.getUTCDate() + days);
  return isoDate(d);
}

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return isoDate(d);
}

async function fetchAll<T>(
  admin: ReturnType<typeof getSupabaseAdmin>,
  table: string,
  select: string,
  opts?: {
    orderBy?: { column: string; ascending?: boolean };
    pageSize?: number;
  },
): Promise<T[]> {
  const pageSize = opts?.pageSize ?? 1000;
  let from = 0;
  const out: T[] = [];

  for (;;) {
    let q = admin
      .from(table)
      .select(select)
      .range(from, from + pageSize - 1);

    if (opts?.orderBy) {
      q = q.order(opts.orderBy.column, {
        ascending: opts.orderBy.ascending ?? true,
      });
    }

    const res = await q;
    if (res.error) throw new Error(res.error.message);
    const rows = (res.data as T[] | null) ?? [];
    out.push(...rows);

    if (rows.length < pageSize) break;
    from += pageSize;
  }

  return out;
}

function computeSignedLedger(entries: LedgerEntryRow[]): {
  isSignedSource: boolean;
  signedById: Map<string, number>;
  transferWarnings: number;
} {
  const signedById = new Map<string, number>();
  let transferWarnings = 0;

  // Detect if any negative amounts exist.
  const anyNegative = entries.some((e) => toNumber(e.amount) < 0);

  // If signed, use raw amount.
  if (anyNegative) {
    for (const e of entries) signedById.set(e.id, toNumber(e.amount));
    return { isSignedSource: true, signedById, transferWarnings: 0 };
  }

  // Unsigned fallback: sign mapping by entry_type, with transfer handled by group.
  const inflow = new Set([
    "opening_balance",
    "customer_payment",
    "owner_funding",
  ]);
  const outflow = new Set([
    "supplier_payment",
    "expense",
    "subscription_fee",
    "refund",
    "tax_payment",
    "owner_withdrawal",
  ]);

  // Group transfers by transfer_group_id
  const transfers = new Map<string, LedgerEntryRow[]>();
  for (const e of entries) {
    if (e.entry_type === "transfer") {
      if (!e.transfer_group_id) {
        transferWarnings += 1;
        signedById.set(e.id, 0);
      } else {
        const arr = transfers.get(e.transfer_group_id) ?? [];
        arr.push(e);
        transfers.set(e.transfer_group_id, arr);
      }
    }
  }

  // Assign signs within each transfer group: first out (-), second in (+), alternating thereafter.
  for (const [, group] of transfers) {
    const sorted = [...group].sort((a, b) => {
      const ta = new Date(a.created_at).getTime();
      const tb = new Date(b.created_at).getTime();
      if (ta !== tb) return ta - tb;
      return a.id.localeCompare(b.id);
    });

    for (let i = 0; i < sorted.length; i += 1) {
      const e = sorted[i];
      const amt = toNumber(e.amount);
      const sign = i % 2 === 0 ? -1 : 1;
      signedById.set(e.id, sign * amt);
    }
  }

  // Non-transfer entries.
  for (const e of entries) {
    if (e.entry_type === "transfer") continue; // already handled
    const amt = toNumber(e.amount);

    if (outflow.has(e.entry_type)) {
      signedById.set(e.id, -1 * amt);
      continue;
    }
    if (inflow.has(e.entry_type)) {
      signedById.set(e.id, amt);
      continue;
    }

    // adjustment: allow negative if supplied, otherwise treat as + (since unsigned mode)
    if (e.entry_type === "adjustment") {
      signedById.set(e.id, amt);
      continue;
    }

    // Unknown types (should not happen): treat as +, but safe.
    signedById.set(e.id, amt);
  }

  return { isSignedSource: false, signedById, transferWarnings };
}

function computeExpectedCashByAccount(
  accounts: BankAccountRow[],
  entries: LedgerEntryRow[],
): {
  totalsByAccountId: Map<string, number>;
  totalsByCurrency: Map<string, number>;
  grandTotal: number;
  meta: { isSignedSource: boolean; transferWarnings: number };
} {
  const { isSignedSource, signedById, transferWarnings } =
    computeSignedLedger(entries);

  // Seed from ops_bank_accounts.opening_balance_amount (canonical for Option A)
  const totalsByAccountId = new Map<string, number>();
  for (const a of accounts) {
    totalsByAccountId.set(a.id, toNumber(a.opening_balance_amount));
  }

  for (const e of entries) {
    // ✅ FIX (Option A): prevent double-counting opening balance
    // because opening is already seeded from ops_bank_accounts.
    if (e.entry_type === "opening_balance") continue;

    const signed = signedById.get(e.id) ?? 0;
    const prev = totalsByAccountId.get(e.bank_account_id) ?? 0;
    totalsByAccountId.set(e.bank_account_id, prev + signed);
  }

  const totalsByCurrency = new Map<string, number>();
  let grandTotal = 0;

  for (const a of accounts) {
    const cur = String(a.currency ?? "").trim() || "UNKNOWN";
    const v = totalsByAccountId.get(a.id) ?? 0;
    totalsByCurrency.set(cur, (totalsByCurrency.get(cur) ?? 0) + v);
    grandTotal += v;
  }

  return {
    totalsByAccountId,
    totalsByCurrency,
    grandTotal,
    meta: { isSignedSource, transferWarnings },
  };
}

function computeReserves(
  reserveBuckets: ReserveBucketRow[],
  expectedCashTotal: number,
): {
  perBucketReserved: Array<{
    id: string;
    name: string;
    business_line: string;
    kind: string;
    reservedAmount: number;
    notes: string | null;
  }>;
  totalReserved: number;
} {
  const perBucketReserved: Array<{
    id: string;
    name: string;
    business_line: string;
    kind: string;
    reservedAmount: number;
    notes: string | null;
  }> = [];

  let totalReserved = 0;

  for (const b of reserveBuckets) {
    const kind = String(b.kind ?? "");
    let reserved = 0;

    if (kind === "fixed") {
      reserved = toNumber(b.fixed_amount);
    } else if (kind === "percentage") {
      const raw = toNumber(b.percentage);
      // Robust: allow 10 (meaning 10%) or 0.10 (meaning 10%)
      const pct = raw > 1 ? raw / 100 : raw;
      reserved = expectedCashTotal * pct;
    } else {
      reserved = 0;
    }

    totalReserved += reserved;
    perBucketReserved.push({
      id: b.id,
      name: b.name,
      business_line: b.business_line,
      kind,
      reservedAmount: reserved,
      notes: b.notes ?? null,
    });
  }

  return { perBucketReserved, totalReserved };
}

function groupSalesByCurrency(rows: SalesDailyRollupRow[]): Array<{
  currency: string;
  amount_cents: number;
}> {
  const m = new Map<string, number>();

  for (const r of rows) {
    const cur = String(r.currency ?? "").trim() || "UNKNOWN";
    const cents = Math.max(0, Math.trunc(toNumber(r.amount_cents)));
    if (cents <= 0) continue;
    m.set(cur, (m.get(cur) ?? 0) + cents);
  }

  return Array.from(m.entries())
    .map(([currency, amount_cents]) => ({ currency, amount_cents }))
    .sort((a, b) => a.currency.localeCompare(b.currency));
}

export default async function OpsDashboardPage() {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <header className="space-y-2">
          <div className="text-xs opacity-60">Ops</div>
          <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
          <p className="text-sm opacity-80">Please sign in.</p>
        </header>
        <Link
          href="/login?next=/ops"
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
          <div className="text-xs opacity-60">Ops</div>
          <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
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

  // Core reads
  const accountsRes = await admin
    .from("ops_bank_accounts")
    .select(
      "id,name,currency,status,opening_balance_amount,opening_balance_date,updated_at",
    )
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

  // Ledger counts (cheap)
  const since30 = daysAgoIso(30);
  const ledgerCountRes = await admin
    .from("ops_ledger_entries")
    .select("id", { count: "exact", head: true });

  const ledger30CountRes = await admin
    .from("ops_ledger_entries")
    .select("id", { count: "exact", head: true })
    .gte("effective_date", since30);

  const ledgerCount = ledgerCountRes.count ?? 0;
  const ledger30Count = ledger30CountRes.count ?? 0;

  // Fetch all ledger entries (batched) for internal expected cash calc.
  const ledgerEntries = await fetchAll<LedgerEntryRow>(
    admin,
    "ops_ledger_entries",
    [
      "id",
      "effective_date",
      "bank_account_id",
      "amount",
      "entry_type",
      "category",
      "business_line",
      "counterparty",
      "payment_method",
      "tags",
      "transfer_group_id",
      "created_at",
      "notes",
    ].join(","),
    {
      orderBy: { column: "created_at", ascending: true },
      pageSize: 1000,
    },
  );

  const expected = computeExpectedCashByAccount(accounts, ledgerEntries);

  const activeAccounts = accounts.filter((a) => a.status === "active").length;
  const archivedAccounts = accounts.filter(
    (a) => a.status === "archived",
  ).length;

  // Upcoming windows
  const today = isoDate(new Date());
  const next30 = addDaysIso(today, 30);

  const calendarUpcomingRes = await admin
    .from("ops_regulatory_calendar_status")
    .select(
      "id,title,category,business_line,due_date,frequency,amount_estimate,status,computed_status",
    )
    .gte("due_date", today)
    .lte("due_date", next30)
    .order("due_date", { ascending: true })
    .limit(50);

  const calendarOverdueRes = await admin
    .from("ops_regulatory_calendar_status")
    .select("id")
    .eq("computed_status", "overdue");

  const calendarUpcoming =
    (calendarUpcomingRes.data as CalendarStatusRow[] | null) ?? [];

  const calendarOverdueCount = Array.isArray(calendarOverdueRes.data)
    ? calendarOverdueRes.data.length
    : 0;

  const expensesUpcomingRes = await admin
    .from("ops_expenses_status")
    .select(
      "id,business_line,name,category,amount_expected,frequency,due_date,paid_at,status,computed_status",
    )
    .gte("due_date", today)
    .lte("due_date", next30)
    .order("due_date", { ascending: true })
    .limit(50);

  const expensesOverdueRes = await admin
    .from("ops_expenses_status")
    .select("id")
    .eq("computed_status", "overdue");

  const expensesUpcoming =
    (expensesUpcomingRes.data as ExpenseStatusRow[] | null) ?? [];

  const expensesOverdueCount = Array.isArray(expensesOverdueRes.data)
    ? expensesOverdueRes.data.length
    : 0;

  // Expected spend next 30
  const expectedSpendNext30 = expensesUpcoming.reduce(
    (sum, r) => sum + toNumber(r.amount_expected),
    0,
  );

  // Reserve buckets
  const reservesRes = await admin
    .from("ops_reserve_buckets")
    .select(
      "id,name,business_line,kind,percentage,fixed_amount,notes,updated_at",
    )
    .order("created_at", { ascending: true });

  const reserves = (reservesRes.data as ReserveBucketRow[] | null) ?? [];
  const reservesComputed = computeReserves(reserves, expected.grandTotal);
  const availableAfterReserves =
    expected.grandTotal - reservesComputed.totalReserved;

  // Recent activity
  const recentRes = await admin
    .from("ops_ledger_entries")
    .select(
      "id,effective_date,bank_account_id,amount,entry_type,category,business_line,counterparty,payment_method,transfer_group_id,created_at,notes",
    )
    .order("effective_date", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(20);

  const recent = (recentRes.data as LedgerEntryRow[] | null) ?? [];

  // -------------------------
  // SALES (OPS-LEDGER-02D)
  // -------------------------
  const salesSince30 = daysAgoIso(30);

  const sales30Res = await admin
    .from("ops_sales_daily_rollup")
    .select("day,business_line,currency,amount_cents,sales_count")
    .gte("day", salesSince30)
    .lte("day", today)
    .order("day", { ascending: true });

  const salesDaily = (sales30Res.data as SalesDailyRollupRow[] | null) ?? [];

  const sales7Since = daysAgoIso(7);
  const salesTodayRows = salesDaily.filter((r) => r.day === today);
  const sales7Rows = salesDaily.filter(
    (r) => r.day >= sales7Since && r.day <= today,
  );
  const sales30Rows = salesDaily;

  const sales30dByBusinessLine = new Map<string, number>();
  for (const r of sales30Rows) {
    const bl = String(r.business_line ?? "").trim() || "unknown";
    const amt = Math.max(0, Math.trunc(toNumber(r.amount_cents)));
    if (amt <= 0) continue;
    sales30dByBusinessLine.set(bl, (sales30dByBusinessLine.get(bl) ?? 0) + amt);
  }

  const currencies = Array.from(expected.totalsByCurrency.keys());
  const multiCurrency = currencies.filter((c) => c !== "UNKNOWN").length > 1;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-2">
          <div className="text-xs opacity-60">Ops</div>
          <h1 className="text-2xl font-semibold">Ops Dashboard</h1>
          <p className="text-sm opacity-80">
            Internal cash awareness (not statutory accounting).
          </p>
        </div>

        <div className="flex gap-3">
          <Link
            href="/ops/settings"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Settings
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

      {multiCurrency ? (
        <div className="mt-6 rounded-xl border p-4 text-sm">
          <div className="font-semibold">Multi-currency detected</div>
          <div className="mt-1 opacity-80">
            Expected cash totals are shown per currency. Reserve computations
            are based on the combined numeric total and may not be meaningful if
            you actively use multiple currencies.
          </div>
        </div>
      ) : null}

      <OpsDashboardClient
        kpis={{
          activeAccounts,
          archivedAccounts,
          ledgerCount,
          ledger30Count,
          expectedCashByCurrency: Array.from(
            expected.totalsByCurrency.entries(),
          ).map(([currency, amount]) => ({ currency, amount })),
          expectedCashTotal: expected.grandTotal,
          reservesTotal: reservesComputed.totalReserved,
          availableAfterReserves,
          expectedSpendNext30,
          calendarOverdueCount,
          expensesOverdueCount,
          ledgerSignedMode: expected.meta.isSignedSource
            ? "signed"
            : "unsigned-mapped",
          transferWarnings: expected.meta.transferWarnings,

          // ✅ Sales KPIs (canonical, cents) — matches OpsDashboardClient KPI type
          salesTodayByCurrency: groupSalesByCurrency(salesTodayRows),
          sales7dByCurrency: groupSalesByCurrency(sales7Rows),
          sales30dByCurrency: groupSalesByCurrency(sales30Rows),
          sales30dByBusinessLine: Array.from(
            sales30dByBusinessLine.entries(),
          ).map(([business_line, amount_cents]) => ({
            business_line,
            amount_cents,
          })),
        }}
        sections={{
          accounts: accounts.map((a) => ({
            id: a.id,
            name: a.name,
            currency: a.currency,
            status: a.status,
            opening_balance_amount: toNumber(a.opening_balance_amount),
            expected_balance_amount: expected.totalsByAccountId.get(a.id) ?? 0,
          })),
          calendarUpcoming: calendarUpcoming.map((c) => ({
            id: c.id,
            due_date: c.due_date,
            title: c.title,
            category: c.category,
            business_line: c.business_line,
            computed_status: c.computed_status || c.status,
            amount_estimate: toNumber(c.amount_estimate),
          })),
          expensesUpcoming: expensesUpcoming.map((e) => ({
            id: e.id,
            due_date: e.due_date,
            name: e.name,
            business_line: e.business_line,
            category: e.category,
            computed_status: e.computed_status || e.status,
            amount_expected: toNumber(e.amount_expected),
          })),
          reserves: reservesComputed.perBucketReserved,
          recent: recent.map((r) => ({
            id: r.id,
            effective_date: r.effective_date,
            bank_account_id: r.bank_account_id,
            entry_type: r.entry_type,
            category: r.category,
            business_line: r.business_line,
            amount_raw: toNumber(r.amount),
            counterparty: r.counterparty,
            payment_method: r.payment_method,
            notes: r.notes,
            created_at: r.created_at,
          })),

          // ✅ Sales daily series (cents)
          salesDaily: salesDaily.map((r) => ({
            day: r.day,
            business_line: String(r.business_line ?? ""),
            currency: String(r.currency ?? "UNKNOWN"),
            amount_cents: Math.max(0, Math.trunc(toNumber(r.amount_cents))),
            sales_count: Math.max(0, Math.trunc(toNumber(r.sales_count))),
          })),
        }}
      />
    </main>
  );
}
