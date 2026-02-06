// app/ops/settings/expenses/_components/ExpensesClient.tsx
"use client";

import { useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";
import {
  BUSINESS_LINES,
  DEFAULT_EXPENSE_FREQUENCIES,
  type BusinessLine,
} from "@/app/ops/settings/_lib/ops-constants";

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

type FormState = {
  id?: string;
  business_line: BusinessLine;
  name: string;
  category: string;
  amount_expected: string;
  frequency: string;
  due_date: string;
  status: string;
  notes: string;
};

function blankForm(): FormState {
  return {
    business_line: "company",
    name: "",
    category: "general",
    amount_expected: "0",
    frequency: "monthly",
    due_date: new Date().toISOString().slice(0, 10),
    status: "upcoming",
    notes: "",
  };
}

export default function ExpensesClient({
  initialRows,
}: {
  initialRows: ExpenseRow[];
}) {
  const rows = useMemo(() => initialRows, [initialRows]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());

  function editRow(r: ExpenseRow) {
    setForm({
      id: r.id,
      business_line: (r.business_line as BusinessLine) ?? "company",
      name: r.name ?? "",
      category: r.category ?? "general",
      amount_expected: r.amount_expected ?? "0",
      frequency: r.frequency ?? "monthly",
      due_date: r.due_date ?? new Date().toISOString().slice(0, 10),
      status: r.status ?? "upcoming",
      notes: r.notes ?? "",
    });
    setMsg(null);
  }

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      if (!form.name.trim()) throw new Error("Name is required.");
      if (!form.category.trim())
        throw new Error("Category is required (must match enum label).");
      if (!form.frequency.trim())
        throw new Error("Frequency is required (must match enum label).");
      if (!form.due_date.trim()) throw new Error("Due date is required.");
      if (!form.status.trim()) throw new Error("Status is required.");

      await authedPostJson("/api/ops/settings/expenses/upsert", {
        id: form.id ?? null,
        business_line: form.business_line,
        name: form.name.trim(),
        category: form.category.trim(),
        amount_expected: Number(form.amount_expected),
        frequency: form.frequency.trim(),
        due_date: form.due_date,
        status: form.status.trim(),
        notes: form.notes ?? "",
      });

      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function markPaid(id: string) {
    setLoading(true);
    setMsg(null);
    try {
      await authedPostJson("/api/ops/settings/expenses/mark-paid", {
        id,
        paid_at: new Date().toISOString().slice(0, 10),
        status: "done",
      });
      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Expenses</h2>
          <div className="text-xs opacity-70">{rows.length} rows</div>
        </div>

        <div className="mt-2 text-xs opacity-70">
          Note: <span className="font-semibold">category</span> and{" "}
          <span className="font-semibold">frequency</span> are DB enums. If you
          enter a value not in the enum, the API will error.
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Due</th>
                <th className="p-3">Name</th>
                <th className="p-3">Amount</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-3 whitespace-nowrap">{r.due_date}</td>
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.amount_expected}</td>
                  <td className="p-3">{r.status}</td>
                  <td className="p-3 flex gap-3">
                    <button
                      className="underline underline-offset-4 text-xs"
                      onClick={() => editRow(r)}
                    >
                      Edit
                    </button>
                    <button
                      disabled={loading}
                      className="underline underline-offset-4 text-xs disabled:opacity-60"
                      onClick={() => void markPaid(r.id)}
                    >
                      Mark paid
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={5}>
                    No expenses yet.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-xl border p-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold">Create / Edit</h2>
            <div className="mt-1 text-xs opacity-70">
              No deletes (Option A).
            </div>
          </div>
          <button
            className="text-xs underline underline-offset-4"
            onClick={() => setForm(blankForm())}
          >
            Reset
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <label className="block">
            <div className="text-xs opacity-70">Business line</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.business_line}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  business_line: e.target.value as BusinessLine,
                }))
              }
            >
              {BUSINESS_LINES.map((b) => (
                <option key={b} value={b}>
                  {b}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Name</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Category (enum label)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((s) => ({ ...s, category: e.target.value }))
              }
              placeholder="e.g. general"
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Amount expected</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              inputMode="decimal"
              value={form.amount_expected}
              onChange={(e) =>
                setForm((s) => ({ ...s, amount_expected: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Frequency (enum label)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.frequency}
              onChange={(e) =>
                setForm((s) => ({ ...s, frequency: e.target.value }))
              }
              list="expense-frequency-suggestions"
            />
            <datalist id="expense-frequency-suggestions">
              {DEFAULT_EXPENSE_FREQUENCIES.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Due date</div>
            <input
              type="date"
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.due_date}
              onChange={(e) =>
                setForm((s) => ({ ...s, due_date: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Status (text)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Notes</div>
            <textarea
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.notes}
              onChange={(e) =>
                setForm((s) => ({ ...s, notes: e.target.value }))
              }
              rows={3}
            />
          </label>

          <button
            disabled={loading}
            onClick={() => void save()}
            className="mt-2 w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            {loading ? "Saving..." : "Save"}
          </button>

          {msg ? <div className="text-xs opacity-80">{msg}</div> : null}
        </div>
      </aside>
    </div>
  );
}
