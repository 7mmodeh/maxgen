"use client";

import Link from "next/link";
import { useMemo } from "react";

type KPI = {
  activeAccounts: number;
  archivedAccounts: number;
  ledgerCount: number;
  ledger30Count: number;

  expectedCashByCurrency: Array<{ currency: string; amount: number }>;
  expectedCashTotal: number;

  reservesTotal: number;
  availableAfterReserves: number;

  expectedSpendNext30: number;

  calendarOverdueCount: number;
  expensesOverdueCount: number;

  ledgerSignedMode: "signed" | "unsigned-mapped";
  transferWarnings: number;
};

type Props = {
  kpis: KPI;
  sections: {
    accounts: Array<{
      id: string;
      name: string;
      currency: string;
      status: string;
      opening_balance_amount: number;
      expected_balance_amount: number;
    }>;
    calendarUpcoming: Array<{
      id: string;
      due_date: string;
      title: string;
      category: string;
      business_line: string;
      computed_status: string;
      amount_estimate: number;
    }>;
    expensesUpcoming: Array<{
      id: string;
      due_date: string;
      name: string;
      business_line: string;
      category: string;
      computed_status: string;
      amount_expected: number;
    }>;
    reserves: Array<{
      id: string;
      name: string;
      business_line: string;
      kind: string;
      reservedAmount: number;
      notes: string | null;
    }>;
    recent: Array<{
      id: string;
      effective_date: string;
      bank_account_id: string;
      entry_type: string;
      category: string;
      business_line: string;
      amount_raw: number;
      counterparty: string | null;
      payment_method: string | null;
      notes: string | null;
      created_at: string;
    }>;
  };
};

function formatMoney(value: number, currency?: string): string {
  const n = Number.isFinite(value) ? value : 0;

  // If currency is provided and looks valid, render as currency; otherwise show numeric.
  if (currency && currency !== "UNKNOWN") {
    try {
      return new Intl.NumberFormat(undefined, {
        style: "currency",
        currency,
        maximumFractionDigits: 2,
      }).format(n);
    } catch {
      // Fall through
    }
  }

  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
  }).format(n);
}

function pillClass(status: string): string {
  const s = String(status || "").toLowerCase();
  if (s === "overdue") return "bg-red-500/10 text-red-700 border-red-500/20";
  if (s === "due") return "bg-amber-500/10 text-amber-800 border-amber-500/20";
  if (s === "done")
    return "bg-emerald-500/10 text-emerald-800 border-emerald-500/20";
  return "bg-black/5 text-black/70 border-black/10";
}

export default function OpsDashboardClient({ kpis, sections }: Props) {
  const accountById = useMemo(() => {
    const m = new Map<string, { name: string; currency: string }>();
    for (const a of sections.accounts)
      m.set(a.id, { name: a.name, currency: a.currency });
    return m;
  }, [sections.accounts]);

  return (
    <div className="mt-8 space-y-10">
      {/* KPIs */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border p-5">
          <div className="text-xs opacity-70">Bank accounts</div>
          <div className="mt-2 text-2xl font-semibold">
            {kpis.activeAccounts}
          </div>
          <div className="mt-1 text-xs opacity-70">
            {kpis.archivedAccounts} archived
          </div>
          <div className="mt-4">
            <Link
              href="/ops/settings/bank-accounts"
              prefetch={false}
              className="text-xs underline underline-offset-4"
            >
              Manage bank accounts
            </Link>
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="text-xs opacity-70">Ledger activity</div>
          <div className="mt-2 text-2xl font-semibold">{kpis.ledgerCount}</div>
          <div className="mt-1 text-xs opacity-70">
            {kpis.ledger30Count} in last 30 days
          </div>
          <div className="mt-3 text-[11px] opacity-70">
            Mode: {kpis.ledgerSignedMode}
            {kpis.transferWarnings > 0 ? (
              <span className="ml-2">
                • transfer warnings: {kpis.transferWarnings}
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="text-xs opacity-70">Expected cash (internal)</div>
          <div className="mt-2 space-y-1">
            {kpis.expectedCashByCurrency.map((x) => (
              <div
                key={x.currency}
                className="flex items-baseline justify-between gap-3"
              >
                <div className="text-xs opacity-70">{x.currency}</div>
                <div className="text-lg font-semibold">
                  {formatMoney(x.amount, x.currency)}
                </div>
              </div>
            ))}
            {kpis.expectedCashByCurrency.length === 0 ? (
              <div className="text-sm opacity-70">No accounts yet</div>
            ) : null}
          </div>
          <div className="mt-3 text-xs opacity-70">
            Total: {formatMoney(kpis.expectedCashTotal)}
          </div>
        </div>

        <div className="rounded-xl border p-5">
          <div className="text-xs opacity-70">Reserves (virtual)</div>
          <div className="mt-2 text-2xl font-semibold">
            {formatMoney(kpis.reservesTotal)}
          </div>
          <div className="mt-1 text-xs opacity-70">
            Available after reserves:{" "}
            <span className="font-semibold">
              {formatMoney(kpis.availableAfterReserves)}
            </span>
          </div>
          <div className="mt-4">
            <Link
              href="/ops/settings/reserves"
              prefetch={false}
              className="text-xs underline underline-offset-4"
            >
              Manage reserves
            </Link>
          </div>
        </div>
      </section>

      {/* Upcoming */}
      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Regulatory calendar</div>
              <div className="mt-1 text-xs opacity-70">
                Upcoming next 30 days • Overdue:{" "}
                <span className="font-semibold">
                  {kpis.calendarOverdueCount}
                </span>
              </div>
            </div>
            <Link
              href="/ops/settings/calendar"
              prefetch={false}
              className="text-xs underline underline-offset-4"
            >
              Open calendar
            </Link>
          </div>

          <div className="mt-4 overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-black/[0.02]">
                <tr className="text-left">
                  <th className="p-3">Due</th>
                  <th className="p-3">Title</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sections.calendarUpcoming.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="p-3 whitespace-nowrap">{r.due_date}</td>
                    <td className="p-3">
                      <div className="font-medium">{r.title}</div>
                      <div className="mt-1 text-xs opacity-70">
                        {r.business_line} • {r.category}
                        {r.amount_estimate ? (
                          <span className="ml-2">
                            • {formatMoney(r.amount_estimate)}
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${pillClass(r.computed_status)}`}
                      >
                        {r.computed_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sections.calendarUpcoming.length === 0 ? (
                  <tr>
                    <td className="p-4 opacity-80" colSpan={3}>
                      No upcoming regulatory items.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>

        <div className="rounded-xl border p-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold">Expenses</div>
              <div className="mt-1 text-xs opacity-70">
                Upcoming next 30 days • Expected:{" "}
                <span className="font-semibold">
                  {formatMoney(kpis.expectedSpendNext30)}
                </span>{" "}
                • Overdue:{" "}
                <span className="font-semibold">
                  {kpis.expensesOverdueCount}
                </span>
              </div>
            </div>
            <Link
              href="/ops/settings/expenses"
              prefetch={false}
              className="text-xs underline underline-offset-4"
            >
              Open expenses
            </Link>
          </div>

          <div className="mt-4 overflow-auto rounded-xl border">
            <table className="w-full text-sm">
              <thead className="border-b bg-black/[0.02]">
                <tr className="text-left">
                  <th className="p-3">Due</th>
                  <th className="p-3">Name</th>
                  <th className="p-3">Amount</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody>
                {sections.expensesUpcoming.map((r) => (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="p-3 whitespace-nowrap">{r.due_date}</td>
                    <td className="p-3">
                      <div className="font-medium">{r.name}</div>
                      <div className="mt-1 text-xs opacity-70">
                        {r.business_line} • {r.category}
                      </div>
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatMoney(r.amount_expected)}
                    </td>
                    <td className="p-3">
                      <span
                        className={`inline-flex rounded-full border px-2 py-1 text-xs ${pillClass(r.computed_status)}`}
                      >
                        {r.computed_status}
                      </span>
                    </td>
                  </tr>
                ))}
                {sections.expensesUpcoming.length === 0 ? (
                  <tr>
                    <td className="p-4 opacity-80" colSpan={4}>
                      No upcoming expenses.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Reserves */}
      <section className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">
              Reserve buckets (virtual)
            </div>
            <div className="mt-1 text-xs opacity-70">
              Computed against expected cash total (internal).
            </div>
          </div>
          <Link
            href="/ops/settings/reserves"
            prefetch={false}
            className="text-xs underline underline-offset-4"
          >
            Manage reserves
          </Link>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Business line</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Reserved</th>
              </tr>
            </thead>
            <tbody>
              {sections.reserves.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-3">
                    <div className="font-medium">{r.name}</div>
                    {r.notes ? (
                      <div className="mt-1 text-xs opacity-70">{r.notes}</div>
                    ) : null}
                  </td>
                  <td className="p-3">{r.business_line}</td>
                  <td className="p-3">{r.kind}</td>
                  <td className="p-3 whitespace-nowrap">
                    {formatMoney(r.reservedAmount)}
                  </td>
                </tr>
              ))}
              {sections.reserves.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={4}>
                    No reserve buckets yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Accounts snapshot */}
      <section className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Accounts snapshot</div>
            <div className="mt-1 text-xs opacity-70">
              Opening vs expected (internal).
            </div>
          </div>
          <Link
            href="/ops/settings/bank-accounts"
            prefetch={false}
            className="text-xs underline underline-offset-4"
          >
            Manage accounts
          </Link>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Account</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Status</th>
                <th className="p-3">Opening</th>
                <th className="p-3">Expected</th>
              </tr>
            </thead>
            <tbody>
              {sections.accounts.map((a) => (
                <tr key={a.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium">{a.name}</td>
                  <td className="p-3">{a.currency || "UNKNOWN"}</td>
                  <td className="p-3">{a.status}</td>
                  <td className="p-3 whitespace-nowrap">
                    {formatMoney(a.opening_balance_amount, a.currency)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatMoney(a.expected_balance_amount, a.currency)}
                  </td>
                </tr>
              ))}
              {sections.accounts.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={5}>
                    No bank accounts yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      {/* Recent activity */}
      <section className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Recent ledger activity</div>
            <div className="mt-1 text-xs opacity-70">Latest 20 entries.</div>
          </div>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Date</th>
                <th className="p-3">Account</th>
                <th className="p-3">Type</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Notes</th>
              </tr>
            </thead>
            <tbody>
              {sections.recent.map((r) => {
                const acc = accountById.get(r.bank_account_id);
                const accName = acc?.name ?? r.bank_account_id;
                const cur = acc?.currency;

                return (
                  <tr key={r.id} className="border-b last:border-b-0">
                    <td className="p-3 whitespace-nowrap">
                      {r.effective_date}
                    </td>
                    <td className="p-3">
                      <div className="font-medium">{accName}</div>
                      <div className="mt-1 text-xs opacity-70">
                        {r.business_line} • {r.category}
                      </div>
                    </td>
                    <td className="p-3">{r.entry_type}</td>
                    <td className="p-3 whitespace-nowrap">
                      {formatMoney(r.amount_raw, cur)}
                    </td>
                    <td className="p-3">
                      <div className="text-xs opacity-80">
                        {r.counterparty ? `CP: ${r.counterparty}` : null}
                        {r.counterparty && r.payment_method ? " • " : null}
                        {r.payment_method ? `PM: ${r.payment_method}` : null}
                      </div>
                      {r.notes ? (
                        <div className="mt-1 text-xs opacity-70">{r.notes}</div>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
              {sections.recent.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={5}>
                    No ledger entries yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/ops/settings/calendar"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Calendar
          </Link>
          <Link
            href="/ops/settings/expenses"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Expenses
          </Link>
          <Link
            href="/ops/settings/reserves"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Reserves
          </Link>
          <Link
            href="/ops/settings/tax"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Tax
          </Link>
          <Link
            href="/ops/settings/bank-accounts"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Bank accounts
          </Link>
        </div>
      </section>
    </div>
  );
}
