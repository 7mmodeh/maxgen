"use client";

import { useEffect, useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";

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

type EnumsPayload = {
  business_lines: string[];
  categories: string[];
  frequencies: string[];
};

type FormState = {
  id?: string;
  business_line: string;
  name: string;
  category: string;
  amount_expected: string;
  frequency: string;
  due_date: string;

  // status is TEXT in DB; we use preset + optional custom
  status_mode: "preset" | "custom";
  status_preset: string;
  status_custom: string;

  notes: string;
};

const STATUS_PRESETS: string[] = ["upcoming", "due", "overdue", "done"];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEnumList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter((s) => s.length > 0);
}

function deriveStatusState(
  statusRaw: string | null | undefined,
): Pick<FormState, "status_mode" | "status_preset" | "status_custom"> {
  const value = String(statusRaw ?? "").trim();
  if (!value) {
    return {
      status_mode: "preset",
      status_preset: "upcoming",
      status_custom: "",
    };
  }
  const preset = STATUS_PRESETS.find((s) => s === value);
  if (preset) {
    return { status_mode: "preset", status_preset: preset, status_custom: "" };
  }
  return {
    status_mode: "custom",
    status_preset: "upcoming",
    status_custom: value,
  };
}

function statusToText(f: FormState): string {
  if (f.status_mode === "custom") return String(f.status_custom ?? "").trim();
  return String(f.status_preset ?? "").trim();
}

function blankForm(): FormState {
  return {
    business_line: "company",
    name: "",
    category: "",
    amount_expected: "0",
    frequency: "",
    due_date: todayIso(),
    status_mode: "preset",
    status_preset: "upcoming",
    status_custom: "",
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

  const [enumsLoading, setEnumsLoading] = useState(true);
  const [enumsErr, setEnumsErr] = useState<string | null>(null);
  const [enums, setEnums] = useState<EnumsPayload>({
    business_lines: [],
    categories: [],
    frequencies: [],
  });

  const [form, setForm] = useState<FormState>(blankForm());

  useEffect(() => {
    let cancelled = false;

    async function loadEnums() {
      setEnumsLoading(true);
      setEnumsErr(null);
      try {
        const json = await authedPostJson<EnumsPayload>(
          "/api/ops/settings/expenses/enums",
          {},
        );

        const payload: EnumsPayload = {
          business_lines: normalizeEnumList(json.business_lines),
          categories: normalizeEnumList(json.categories),
          frequencies: normalizeEnumList(json.frequencies),
        };

        if (cancelled) return;
        setEnums(payload);

        // Set safe defaults after load
        setForm((prev) => {
          const next = { ...prev };

          if (payload.business_lines.length > 0) {
            if (!payload.business_lines.includes(next.business_line)) {
              next.business_line = payload.business_lines.includes("company")
                ? "company"
                : payload.business_lines[0];
            }
          }

          if (payload.categories.length > 0) {
            if (!payload.categories.includes(next.category)) {
              next.category = payload.categories[0];
            }
          }

          if (payload.frequencies.length > 0) {
            if (!payload.frequencies.includes(next.frequency)) {
              next.frequency = payload.frequencies.includes("monthly")
                ? "monthly"
                : payload.frequencies[0];
            }
          }

          return next;
        });
      } catch (e: unknown) {
        if (cancelled) return;
        const m = e instanceof Error ? e.message : String(e);
        setEnumsErr(m || "Failed to load enums.");
      } finally {
        if (!cancelled) setEnumsLoading(false);
      }
    }

    void loadEnums();
    return () => {
      cancelled = true;
    };
  }, []);

  function resetForm() {
    setForm(blankForm());
    setMsg(null);
  }

  function editRow(r: ExpenseRow) {
    const st = deriveStatusState(r.status);
    setForm({
      id: r.id,
      business_line: r.business_line ?? "company",
      name: r.name ?? "",
      category: r.category ?? "",
      amount_expected: r.amount_expected ?? "0",
      frequency: r.frequency ?? "",
      due_date: r.due_date ?? todayIso(),
      ...st,
      notes: r.notes ?? "",
    });
    setMsg(null);
  }

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      const name = String(form.name ?? "").trim();
      if (!name) throw new Error("Name is required.");

      const category = String(form.category ?? "").trim();
      if (!category) throw new Error("Category is required.");
      if (enums.categories.length > 0 && !enums.categories.includes(category)) {
        throw new Error("Invalid category selection (not in enum).");
      }

      const frequency = String(form.frequency ?? "").trim();
      if (!frequency) throw new Error("Frequency is required.");
      if (
        enums.frequencies.length > 0 &&
        !enums.frequencies.includes(frequency)
      ) {
        throw new Error("Invalid frequency selection (not in enum).");
      }

      const due = String(form.due_date ?? "").trim();
      if (!due) throw new Error("Due date is required.");

      const businessLine = String(form.business_line ?? "").trim();
      if (!businessLine) throw new Error("Business line is required.");
      if (
        enums.business_lines.length > 0 &&
        !enums.business_lines.includes(businessLine)
      ) {
        throw new Error("Invalid business line selection (not in enum).");
      }

      const status = statusToText(form);
      if (!status) throw new Error("Status is required.");

      await authedPostJson<{ ok: boolean }>(
        "/api/ops/settings/expenses/upsert",
        {
          id: form.id ?? null,
          business_line: businessLine,
          name,
          category,
          amount_expected: Number(form.amount_expected),
          frequency,
          due_date: due,
          status,
          notes: form.notes ?? "",
        },
      );

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
      await authedPostJson<{ ok: boolean }>(
        "/api/ops/settings/expenses/mark-paid",
        {
          id,
          paid_at: todayIso(),
          status: "done",
        },
      );
      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  const statusOptions = [...STATUS_PRESETS, "Custom…"];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Expenses</h2>
          <div className="text-xs opacity-70">{rows.length} rows</div>
        </div>

        <div className="mt-2 text-xs opacity-70">
          Category and frequency are strict DB enums (select-only). Status is
          text (preset + optional custom).
        </div>

        {enumsLoading ? (
          <div className="mt-4 rounded-xl border p-4 text-xs opacity-80">
            Loading enum options…
          </div>
        ) : enumsErr ? (
          <div className="mt-4 rounded-xl border p-4 text-xs">
            <div className="font-semibold">Enum load failed</div>
            <div className="mt-1 opacity-80">{enumsErr}</div>
          </div>
        ) : null}

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
            onClick={resetForm}
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
                setForm((s) => ({ ...s, business_line: e.target.value }))
              }
              disabled={enumsLoading || !!enumsErr}
            >
              {(enums.business_lines.length
                ? enums.business_lines
                : ["company"]
              ).map((b) => (
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
            <div className="text-xs opacity-70">Category</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.category}
              onChange={(e) =>
                setForm((s) => ({ ...s, category: e.target.value }))
              }
              disabled={enumsLoading || !!enumsErr}
            >
              {(enums.categories.length ? enums.categories : [""]).map((c) => (
                <option key={c || "__empty"} value={c}>
                  {c || "—"}
                </option>
              ))}
            </select>
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
            <div className="text-xs opacity-70">Frequency</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.frequency}
              onChange={(e) =>
                setForm((s) => ({ ...s, frequency: e.target.value }))
              }
              disabled={enumsLoading || !!enumsErr}
            >
              {(enums.frequencies.length ? enums.frequencies : [""]).map(
                (f) => (
                  <option key={f || "__empty"} value={f}>
                    {f || "—"}
                  </option>
                ),
              )}
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
            <div className="text-xs opacity-70">Status</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={
                form.status_mode === "custom" ? "Custom…" : form.status_preset
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "Custom…") {
                  setForm((s) => ({ ...s, status_mode: "custom" }));
                } else {
                  setForm((s) => ({
                    ...s,
                    status_mode: "preset",
                    status_preset: v,
                    status_custom: "",
                  }));
                }
              }}
            >
              {statusOptions.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>

            {form.status_mode === "custom" ? (
              <input
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Custom status…"
                value={form.status_custom}
                onChange={(e) =>
                  setForm((s) => ({ ...s, status_custom: e.target.value }))
                }
              />
            ) : null}
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
            disabled={loading || enumsLoading || !!enumsErr}
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
