// app/ops/settings/reserves/_components/ReservesClient.tsx
"use client";

import { useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";
import {
  BUSINESS_LINES,
  RESERVE_KINDS,
  type BusinessLine,
  type ReserveKind,
} from "@/app/ops/settings/_lib/ops-constants";

type ReserveRow = {
  id: string;
  name: string;
  business_line: string;
  kind: string;
  percentage: string | null;
  fixed_amount: string | null;
  notes: string;
  updated_at: string;
};

type FormState = {
  id?: string;
  name: string;
  business_line: BusinessLine;
  kind: ReserveKind;
  percentage: string;
  fixed_amount: string;
  notes: string;
};

function toFormDefaults(): FormState {
  return {
    name: "",
    business_line: "company",
    kind: "fixed",
    percentage: "",
    fixed_amount: "",
    notes: "",
  };
}

export default function ReservesClient({
  initialReserves,
}: {
  initialReserves: ReserveRow[];
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(toFormDefaults());

  const reserves = useMemo(() => initialReserves, [initialReserves]);

  function loadPreset(preset: "emergency" | "refund" | "vat") {
    if (preset === "emergency") {
      setForm({
        id: undefined,
        name: "Emergency Buffer",
        business_line: "company",
        kind: "fixed",
        percentage: "",
        fixed_amount: "500",
        notes: "Awareness only.",
      });
    }
    if (preset === "refund") {
      setForm({
        id: undefined,
        name: "Refund Reserve (2%)",
        business_line: "company",
        kind: "percentage",
        percentage: "2",
        fixed_amount: "",
        notes: "Awareness only.",
      });
    }
    if (preset === "vat") {
      setForm({
        id: undefined,
        name: "VAT Reserve (0%)",
        business_line: "company",
        kind: "percentage",
        percentage: "0",
        fixed_amount: "",
        notes: "Keep at 0 until VAT registered.",
      });
    }
  }

  function editRow(r: ReserveRow) {
    setForm({
      id: r.id,
      name: r.name,
      business_line: (r.business_line as BusinessLine) ?? "company",
      kind: (r.kind as ReserveKind) ?? "fixed",
      percentage: r.percentage ?? "",
      fixed_amount: r.fixed_amount ?? "",
      notes: r.notes ?? "",
    });
    setMsg(null);
  }

  async function save() {
    setLoading(true);
    setMsg(null);
    try {
      if (!form.name.trim()) throw new Error("Name is required.");

      if (form.kind === "fixed") {
        if (!form.fixed_amount.trim())
          throw new Error("Fixed amount required.");
      }
      if (form.kind === "percentage") {
        if (!form.percentage.trim()) throw new Error("Percentage required.");
      }

      await authedPostJson("/api/ops/settings/reserves/upsert", {
        id: form.id ?? null,
        name: form.name.trim(),
        business_line: form.business_line,
        kind: form.kind,
        percentage: form.kind === "percentage" ? Number(form.percentage) : null,
        fixed_amount: form.kind === "fixed" ? Number(form.fixed_amount) : null,
        notes: form.notes ?? "",
      });

      window.location.reload();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      setMsg(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 grid gap-6 lg:grid-cols-3">
      <section className="rounded-xl border p-6 lg:col-span-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold">Existing reserves</h2>
          <div className="text-xs opacity-70">{reserves.length} rows</div>
        </div>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr className="text-left">
                <th className="p-3">Name</th>
                <th className="p-3">Line</th>
                <th className="p-3">Kind</th>
                <th className="p-3">Value</th>
                <th className="p-3">Edit</th>
              </tr>
            </thead>
            <tbody>
              {reserves.map((r) => (
                <tr key={r.id} className="border-b last:border-b-0">
                  <td className="p-3 font-medium">{r.name}</td>
                  <td className="p-3">{r.business_line}</td>
                  <td className="p-3">{r.kind}</td>
                  <td className="p-3">
                    {r.kind === "fixed"
                      ? `€${r.fixed_amount ?? "0"}`
                      : `${r.percentage ?? "0"}%`}
                  </td>
                  <td className="p-3">
                    <button
                      className="underline underline-offset-4 text-xs"
                      onClick={() => editRow(r)}
                    >
                      Edit
                    </button>
                  </td>
                </tr>
              ))}

              {reserves.length === 0 ? (
                <tr>
                  <td className="p-4 opacity-80" colSpan={5}>
                    No reserves yet.
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
              No deletes (Option A). Update values instead.
            </div>
          </div>
          <button
            className="text-xs underline underline-offset-4"
            onClick={() => setForm(toFormDefaults())}
          >
            Reset
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <button
            disabled={loading}
            onClick={() => loadPreset("emergency")}
            className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
          >
            Emergency
          </button>
          <button
            disabled={loading}
            onClick={() => loadPreset("refund")}
            className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
          >
            Refund 2%
          </button>
          <button
            disabled={loading}
            onClick={() => loadPreset("vat")}
            className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
          >
            VAT 0%
          </button>
        </div>

        <div className="mt-5 space-y-3 text-sm">
          <label className="block">
            <div className="text-xs opacity-70">Name</div>
            <input
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.name}
              onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
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
            <div className="text-xs opacity-70">Kind</div>
            <select
              className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
              value={form.kind}
              onChange={(e) =>
                setForm((s) => ({
                  ...s,
                  kind: e.target.value as ReserveKind,
                }))
              }
            >
              {RESERVE_KINDS.map((k) => (
                <option key={k} value={k}>
                  {k}
                </option>
              ))}
            </select>
          </label>

          {form.kind === "fixed" ? (
            <label className="block">
              <div className="text-xs opacity-70">Fixed amount (EUR)</div>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.fixed_amount}
                onChange={(e) =>
                  setForm((s) => ({ ...s, fixed_amount: e.target.value }))
                }
                inputMode="decimal"
              />
            </label>
          ) : (
            <label className="block">
              <div className="text-xs opacity-70">Percentage (%)</div>
              <input
                className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                value={form.percentage}
                onChange={(e) =>
                  setForm((s) => ({ ...s, percentage: e.target.value }))
                }
                inputMode="decimal"
              />
            </label>
          )}

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
