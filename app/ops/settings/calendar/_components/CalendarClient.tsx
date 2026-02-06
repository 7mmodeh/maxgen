// app/ops/settings/calendar/_components/CalendarClient.tsx
"use client";

import { useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";
import {
  BUSINESS_LINES,
  DEFAULT_CALENDAR_FREQUENCIES,
  DEFAULT_CALENDAR_STATUSES,
  type BusinessLine,
} from "@/app/ops/settings/_lib/ops-constants";

type CalRow = {
  id: string;
  title: string;
  category: string;
  business_line: string;
  due_date: string;
  frequency: string;
  amount_estimate: string | null;
  status: string;
  linked_ledger_entry_id: string | null;
  notes: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  title: string;
  category: string;
  business_line: BusinessLine;
  due_date: string;
  frequency: string;
  amount_estimate: string;
  status: string;
  notes: string;
};

function blankForm(): FormState {
  return {
    title: "",
    category: "Compliance",
    business_line: "company",
    due_date: new Date().toISOString().slice(0, 10),
    frequency: "annually",
    amount_estimate: "",
    status: "upcoming",
    notes: "",
  };
}

export default function CalendarClient({
  initialRows,
}: {
  initialRows: CalRow[];
}) {
  const rows = useMemo(() => initialRows, [initialRows]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(blankForm());

  function editRow(r: CalRow) {
    setForm({
      id: r.id,
      title: r.title ?? "",
      category: r.category ?? "",
      business_line: (r.business_line as BusinessLine) ?? "company",
      due_date: r.due_date ?? new Date().toISOString().slice(0, 10),
      frequency: r.frequency ?? "annually",
      amount_estimate: r.amount_estimate ?? "",
      status: r.status ?? "upcoming",
      notes: r.notes ?? "",
    });
    setMsg(null);
  }

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      if (!form.title.trim()) throw new Error("Title is required.");
      if (!form.category.trim()) throw new Error("Category is required.");
      if (!form.frequency.trim())
        throw new Error("Frequency required (must match enum label).");
      if (!form.status.trim())
        throw new Error("Status required (must match enum label).");
      if (!form.due_date.trim()) throw new Error("Due date required.");

      await authedPostJson("/api/ops/settings/calendar/upsert", {
        id: form.id ?? null,
        title: form.title.trim(),
        category: form.category.trim(),
        business_line: form.business_line,
        due_date: form.due_date,
        frequency: form.frequency.trim(),
        amount_estimate: form.amount_estimate.trim()
          ? Number(form.amount_estimate)
          : null,
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

  async function markDone(id: string) {
    setLoading(true);
    setMsg(null);
    try {
      await authedPostJson("/api/ops/settings/calendar/mark-done", {
        id,
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
          <h2 className="text-sm font-semibold">Items</h2>
          <div className="text-xs opacity-70">{rows.length} rows</div>
        </div>

        <div className="mt-2 text-xs opacity-70">
          Note: <span className="font-semibold">frequency</span> and{" "}
          <span className="font-semibold">status</span> are DB enums. If you
          enter a value not in the enum, the API will error.
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Due</th>
                <th className="p-3">Title</th>
                <th className="p-3">Status</th>
                <th className="p-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-3 whitespace-nowrap">{r.due_date}</td>
                  <td className="p-3 font-medium">{r.title}</td>
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
                      onClick={() => void markDone(r.id)}
                    >
                      Mark done
                    </button>
                  </td>
                </tr>
              ))}
              {rows.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={4}>
                    No calendar items yet.
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
            <div className="text-xs opacity-70">Title</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.title}
              onChange={(e) =>
                setForm((s) => ({ ...s, title: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Category</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((s) => ({ ...s, category: e.target.value }))
              }
            />
          </label>

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
            <div className="text-xs opacity-70">Frequency (enum label)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.frequency}
              onChange={(e) =>
                setForm((s) => ({ ...s, frequency: e.target.value }))
              }
              list="cal-frequency-suggestions"
            />
            <datalist id="cal-frequency-suggestions">
              {DEFAULT_CALENDAR_FREQUENCIES.map((f) => (
                <option key={f} value={f} />
              ))}
            </datalist>
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Amount estimate</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              inputMode="decimal"
              value={form.amount_estimate}
              onChange={(e) =>
                setForm((s) => ({ ...s, amount_estimate: e.target.value }))
              }
            />
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Status (enum label)</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value }))
              }
              list="cal-status-suggestions"
            />
            <datalist id="cal-status-suggestions">
              {DEFAULT_CALENDAR_STATUSES.map((s) => (
                <option key={s} value={s} />
              ))}
            </datalist>
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
