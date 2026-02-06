"use client";

import { useEffect, useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";

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

type EnumsPayload = {
  business_lines: string[];
  frequencies: string[];
  statuses: string[];
};

type FormState = {
  id?: string;
  title: string;

  // Category is persisted as plain text (NOT enum)
  category_mode: "preset" | "custom";
  category_preset: string;
  category_custom: string;

  business_line: string;
  due_date: string;
  frequency: string;
  amount_estimate: string;
  status: string;
  notes: string;
};

const CATEGORY_PRESETS: string[] = [
  "Licensing",
  "Compliance",
  "Tax",
  "Insurance",
  "Payments",
  "Subscriptions",
  "Bills",
  "Domains & Hosting",
  "Legal",
  "Banking",
  "Operations",
  "Reporting",
  "Vendors",
];

function todayIso(): string {
  return new Date().toISOString().slice(0, 10);
}

function normalizeEnumList(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  return v.map((x) => String(x ?? "").trim()).filter((s) => s.length > 0);
}

function blankForm(): FormState {
  return {
    title: "",
    category_mode: "preset",
    category_preset: "Compliance",
    category_custom: "",
    business_line: "company",
    due_date: todayIso(),
    frequency: "annually",
    amount_estimate: "",
    status: "upcoming",
    notes: "",
  };
}

function deriveCategoryState(
  categoryRaw: string | null | undefined,
): Pick<FormState, "category_mode" | "category_preset" | "category_custom"> {
  const value = String(categoryRaw ?? "").trim();
  if (!value) {
    return {
      category_mode: "preset",
      category_preset: "Compliance",
      category_custom: "",
    };
  }
  const preset = CATEGORY_PRESETS.find(
    (c) => c.toLowerCase() === value.toLowerCase(),
  );
  if (preset) {
    return {
      category_mode: "preset",
      category_preset: preset,
      category_custom: "",
    };
  }
  return {
    category_mode: "custom",
    category_preset: "Compliance",
    category_custom: value,
  };
}

function categoryToText(f: FormState): string {
  if (f.category_mode === "custom")
    return String(f.category_custom ?? "").trim();
  return String(f.category_preset ?? "").trim();
}

export default function CalendarClient({
  initialRows,
}: {
  initialRows: CalRow[];
}) {
  const rows = useMemo(() => initialRows, [initialRows]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [enumsLoading, setEnumsLoading] = useState(true);
  const [enumsErr, setEnumsErr] = useState<string | null>(null);
  const [enums, setEnums] = useState<EnumsPayload>({
    business_lines: [],
    frequencies: [],
    statuses: [],
  });

  const [form, setForm] = useState<FormState>(blankForm());

  useEffect(() => {
    let cancelled = false;

    async function loadEnums() {
      setEnumsLoading(true);
      setEnumsErr(null);
      try {
        const res = await fetch("/api/ops/settings/calendar/enums", {
          method: "GET",
          credentials: "same-origin",
          headers: { "content-type": "application/json" },
        });

        if (!res.ok) {
          const text = await res.text();
          throw new Error(text || `Failed to load enums (${res.status})`);
        }

        const json = (await res.json()) as Partial<EnumsPayload>;
        const payload: EnumsPayload = {
          business_lines: normalizeEnumList(json.business_lines),
          frequencies: normalizeEnumList(json.frequencies),
          statuses: normalizeEnumList(json.statuses),
        };

        if (cancelled) return;
        setEnums(payload);

        // Ensure defaults are valid once enums arrive
        setForm((prev) => {
          const next = { ...prev };

          if (payload.business_lines.length > 0) {
            if (!payload.business_lines.includes(next.business_line)) {
              next.business_line = payload.business_lines.includes("company")
                ? "company"
                : payload.business_lines[0];
            }
          }

          if (payload.frequencies.length > 0) {
            if (!payload.frequencies.includes(next.frequency)) {
              next.frequency = payload.frequencies.includes("annually")
                ? "annually"
                : payload.frequencies[0];
            }
          }

          if (payload.statuses.length > 0) {
            if (!payload.statuses.includes(next.status)) {
              next.status = payload.statuses.includes("upcoming")
                ? "upcoming"
                : payload.statuses[0];
            }
          }

          return next;
        });
      } catch (e: unknown) {
        if (cancelled) return;
        setEnumsErr(e instanceof Error ? e.message : String(e));
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

  function editRow(r: CalRow) {
    const catState = deriveCategoryState(r.category);
    setForm({
      id: r.id,
      title: r.title ?? "",
      ...catState,
      business_line: r.business_line ?? "company",
      due_date: r.due_date ?? todayIso(),
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
      const title = String(form.title ?? "").trim();
      if (!title) throw new Error("Title is required.");

      const category = categoryToText(form);
      if (!category) throw new Error("Category is required.");

      const due = String(form.due_date ?? "").trim();
      if (!due) throw new Error("Due date required.");

      // Enforce DB-driven enum validity (client-side)
      if (
        enums.frequencies.length > 0 &&
        !enums.frequencies.includes(form.frequency)
      ) {
        throw new Error("Invalid frequency selection (not in enum).");
      }
      if (enums.statuses.length > 0 && !enums.statuses.includes(form.status)) {
        throw new Error("Invalid status selection (not in enum).");
      }
      if (
        enums.business_lines.length > 0 &&
        !enums.business_lines.includes(form.business_line)
      ) {
        throw new Error("Invalid business line selection (not in enum).");
      }

      await authedPostJson("/api/ops/settings/calendar/upsert", {
        id: form.id ?? null,
        title,
        category,
        business_line: form.business_line,
        due_date: due,
        frequency: String(form.frequency ?? "").trim(),
        amount_estimate: String(form.amount_estimate ?? "").trim()
          ? Number(form.amount_estimate)
          : null,
        status: String(form.status ?? "").trim(),
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

  const categoryPresetOptions = [...CATEGORY_PRESETS, "Custom…"];

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Items</h2>
          <div className="text-xs opacity-70">{rows.length} rows</div>
        </div>

        <div className="mt-2 text-xs opacity-70">
          Frequency and status are strict DB enums (select-only).
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
            onClick={resetForm}
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
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={
                form.category_mode === "custom"
                  ? "Custom…"
                  : form.category_preset
              }
              onChange={(e) => {
                const v = e.target.value;
                if (v === "Custom…") {
                  setForm((s) => ({ ...s, category_mode: "custom" }));
                } else {
                  setForm((s) => ({
                    ...s,
                    category_mode: "preset",
                    category_preset: v,
                    category_custom: "",
                  }));
                }
              }}
            >
              {categoryPresetOptions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {form.category_mode === "custom" ? (
              <input
                className="mt-2 w-full rounded-lg border px-3 py-2 text-sm"
                placeholder="Custom category…"
                value={form.category_custom}
                onChange={(e) =>
                  setForm((s) => ({ ...s, category_custom: e.target.value }))
                }
              />
            ) : null}
          </label>

          <label className="block">
            <div className="text-xs opacity-70">Business line</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.business_line}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  business_line: e.target.value,
                }))
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
            <div className="text-xs opacity-70">Frequency</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.frequency}
              onChange={(e) =>
                setForm((s) => ({ ...s, frequency: e.target.value }))
              }
              disabled={enumsLoading || !!enumsErr}
            >
              {(enums.frequencies.length
                ? enums.frequencies
                : ["annually"]
              ).map((f) => (
                <option key={f} value={f}>
                  {f}
                </option>
              ))}
            </select>
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
            <div className="text-xs opacity-70">Status</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.status}
              onChange={(e) =>
                setForm((s) => ({ ...s, status: e.target.value }))
              }
              disabled={enumsLoading || !!enumsErr}
            >
              {(enums.statuses.length ? enums.statuses : ["upcoming"]).map(
                (s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ),
              )}
            </select>
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
