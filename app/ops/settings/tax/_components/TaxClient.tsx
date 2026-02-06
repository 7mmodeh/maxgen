"use client";

import { useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";
import {
  BUSINESS_LINES,
  VAT_FREQUENCIES,
  VAT_STATUSES,
  type BusinessLine,
  type VatStatus,
  type VatFilingFrequency,
} from "@/app/ops/settings/_lib/ops-constants";

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

type FormState = {
  business_line: BusinessLine;
  vat_status: VatStatus;
  vat_filing_frequency: VatFilingFrequency;
  vat_effective_from: string;
  corp_tax_rate: string;
  notes: string;
};

function normalizeVatStatus(v: string | null): VatStatus {
  return VAT_STATUSES.includes(v as VatStatus)
    ? (v as VatStatus)
    : "not_registered";
}

function normalizeVatFrequency(v: string | null): VatFilingFrequency {
  return VAT_FREQUENCIES.includes(v as VatFilingFrequency)
    ? (v as VatFilingFrequency)
    : "unknown";
}

function defaultForm(bl: BusinessLine): FormState {
  return {
    business_line: bl,
    vat_status: "not_registered",
    vat_filing_frequency: "unknown",
    vat_effective_from: "",
    corp_tax_rate: "12.5",
    notes: "",
  };
}

export default function TaxClient({ initialRows }: { initialRows: TaxRow[] }) {
  const rows = useMemo(() => initialRows, [initialRows]);

  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const existingByLine = new Map<BusinessLine, TaxRow>();
  for (const r of rows) {
    if (BUSINESS_LINES.includes(r.business_line as BusinessLine)) {
      existingByLine.set(r.business_line as BusinessLine, r);
    }
  }

  const [formByLine, setFormByLine] = useState<Record<BusinessLine, FormState>>(
    () => {
      const next = {} as Record<BusinessLine, FormState>;
      for (const bl of BUSINESS_LINES) {
        const existing = existingByLine.get(bl);
        next[bl] = existing
          ? {
              business_line: bl,
              vat_status: normalizeVatStatus(existing.vat_status),
              vat_filing_frequency: normalizeVatFrequency(
                existing.vat_filing_frequency,
              ),
              vat_effective_from: existing.vat_effective_from ?? "",
              corp_tax_rate: existing.corp_tax_rate ?? "12.5",
              notes: existing.notes ?? "",
            }
          : defaultForm(bl);
      }
      return next;
    },
  );

  async function saveLine(bl: BusinessLine) {
    setLoading(true);
    setMsg(null);
    try {
      const f = formByLine[bl];

      await authedPostJson("/api/ops/settings/tax/upsert", {
        business_line: f.business_line,
        vat_status: f.vat_status,
        vat_filing_frequency: f.vat_filing_frequency,
        vat_effective_from: f.vat_effective_from || null,
        corp_tax_rate: Number(f.corp_tax_rate),
        notes: f.notes,
      });

      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mt-10 space-y-6">
      {BUSINESS_LINES.map((bl) => {
        const f = formByLine[bl];
        const existing = existingByLine.get(bl);

        return (
          <section key={bl} className="rounded-xl border p-6">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-sm font-semibold">{bl}</div>
                <div className="mt-1 text-xs opacity-70">
                  {existing ? "Configured" : "Not configured yet"}
                </div>
              </div>

              <button
                disabled={loading}
                onClick={() => void saveLine(bl)}
                className="rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                Save
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-3">
              <label>
                <div className="text-xs opacity-70">VAT status</div>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={f.vat_status}
                  onChange={(e) =>
                    setFormByLine((s) => ({
                      ...s,
                      [bl]: {
                        ...s[bl],
                        vat_status: e.target.value as VatStatus,
                      },
                    }))
                  }
                >
                  {VAT_STATUSES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div className="text-xs opacity-70">VAT frequency</div>
                <select
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={f.vat_filing_frequency}
                  onChange={(e) =>
                    setFormByLine((s) => ({
                      ...s,
                      [bl]: {
                        ...s[bl],
                        vat_filing_frequency: e.target
                          .value as VatFilingFrequency,
                      },
                    }))
                  }
                >
                  {VAT_FREQUENCIES.map((v) => (
                    <option key={v} value={v}>
                      {v}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <div className="text-xs opacity-70">VAT effective from</div>
                <input
                  type="date"
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={f.vat_effective_from}
                  onChange={(e) =>
                    setFormByLine((s) => ({
                      ...s,
                      [bl]: {
                        ...s[bl],
                        vat_effective_from: e.target.value,
                      },
                    }))
                  }
                />
              </label>

              <label>
                <div className="text-xs opacity-70">Corp tax rate (%)</div>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  inputMode="decimal"
                  value={f.corp_tax_rate}
                  onChange={(e) =>
                    setFormByLine((s) => ({
                      ...s,
                      [bl]: {
                        ...s[bl],
                        corp_tax_rate: e.target.value,
                      },
                    }))
                  }
                />
              </label>

              <label className="md:col-span-2">
                <div className="text-xs opacity-70">Notes</div>
                <input
                  className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                  value={f.notes}
                  onChange={(e) =>
                    setFormByLine((s) => ({
                      ...s,
                      [bl]: { ...s[bl], notes: e.target.value },
                    }))
                  }
                />
              </label>
            </div>
          </section>
        );
      })}

      {msg && <div className="text-xs opacity-80">{msg}</div>}
    </div>
  );
}
