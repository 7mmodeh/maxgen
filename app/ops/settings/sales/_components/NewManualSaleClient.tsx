// app/ops/settings/sales/_components/NewManualSaleClient.tsx

"use client";

import { useMemo, useState } from "react";

type BankAccount = {
  id: string;
  name: string;
  currency: string;
  status: string;
};

type BusinessLine = "company" | "qr_studio" | "supplies";

type Props = {
  bankAccounts: BankAccount[];
  businessLines: BusinessLine[];
};

type SubmitState =
  | { status: "idle" }
  | { status: "loading" }
  | { status: "success"; message: string }
  | { status: "error"; message: string };

function clampCurrency(input: string): string {
  const c = String(input || "")
    .trim()
    .toLowerCase();
  return c || "eur";
}

function parseAmountToCents(input: string): number {
  const raw = String(input || "").trim();
  if (!raw) return 0;

  // Accept "7", "7.0", "7.00"
  const n = Number(raw);
  if (!Number.isFinite(n)) return 0;

  // Convert to cents safely
  return Math.max(0, Math.round(n * 100));
}

export default function NewManualSaleClient({
  bankAccounts,
  businessLines,
}: Props) {
  const defaultAccountId = bankAccounts[0]?.id ?? "";
  const defaultCurrency = clampCurrency(bankAccounts[0]?.currency ?? "eur");

  const [bankAccountId, setBankAccountId] = useState<string>(defaultAccountId);
  const [businessLine, setBusinessLine] = useState<BusinessLine>(
    businessLines[0] ?? "company",
  );
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("cash:eur");
  const [saleAt, setSaleAt] = useState<string>(""); // ISO-ish local
  const [notes, setNotes] = useState<string>("");

  const [state, setState] = useState<SubmitState>({ status: "idle" });

  const selectedAccount = useMemo(() => {
    return bankAccounts.find((a) => a.id === bankAccountId) ?? null;
  }, [bankAccounts, bankAccountId]);

  const effectiveCurrency = useMemo(() => {
    // Prefer the explicit currency field, otherwise infer from account
    const c = clampCurrency(currency);
    if (c !== "eur" && c !== "usd" && c !== "gbp") {
      // still allow any ISO currency codes; we don't hard restrict here
      return c;
    }
    return c;
  }, [currency]);

  const amountCents = useMemo(() => parseAmountToCents(amount), [amount]);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setState({ status: "loading" });

    if (!bankAccountId) {
      setState({ status: "error", message: "Please select a bank account." });
      return;
    }
    if (amountCents <= 0) {
      setState({
        status: "error",
        message: "Amount must be greater than zero.",
      });
      return;
    }
    const pm = String(paymentMethod || "").trim();
    if (!pm) {
      setState({
        status: "error",
        message: "Payment method is required (e.g. cash:eur).",
      });
      return;
    }

    const payload = {
      bank_account_id: bankAccountId,
      business_line: businessLine,
      amount_cents: amountCents,
      currency: effectiveCurrency,
      payment_method: pm,
      sale_at: saleAt ? new Date(saleAt).toISOString() : null,
      notes: String(notes || ""),
    };

    try {
      const res = await fetch("/api/ops/settings/sales/create", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json: unknown = await res.json();

      if (!res.ok) {
        const msg =
          typeof json === "object" && json
            ? String((json as { error?: unknown }).error ?? "Request failed")
            : "Request failed";
        setState({ status: "error", message: msg });
        return;
      }

      const message =
        typeof json === "object" && json
          ? String(
              (json as { message?: unknown }).message ??
                "Manual sale recorded.",
            )
          : "Manual sale recorded.";

      setState({ status: "success", message });

      // reset minimal
      setAmount("");
      setNotes("");
      setSaleAt("");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      setState({ status: "error", message: msg });
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Record a manual sale</div>
          <div className="mt-1 text-xs opacity-70">
            Writes to <span className="font-semibold">ops_manual_sales</span>{" "}
            (canonical) and inserts a matching{" "}
            <span className="font-semibold">ops_ledger_entries</span> row.
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <label className="space-y-1">
            <div className="text-xs opacity-70">Bank account</div>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={bankAccountId}
              onChange={(e) => {
                const id = e.target.value;
                setBankAccountId(id);
                const acc = bankAccounts.find((a) => a.id === id) ?? null;
                if (acc) setCurrency(clampCurrency(acc.currency));
              }}
            >
              {bankAccounts.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name} (
                  {String(a.currency || "").toUpperCase() || "UNKNOWN"})
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs opacity-70">Business line</div>
            <select
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={businessLine}
              onChange={(e) => setBusinessLine(e.target.value as BusinessLine)}
            >
              {businessLines.map((bl) => (
                <option key={bl} value={bl}>
                  {bl}
                </option>
              ))}
            </select>
          </label>

          <label className="space-y-1">
            <div className="text-xs opacity-70">Currency</div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="eur"
            />
            <div className="text-[11px] opacity-60">
              Lowercased in DB. Current account:{" "}
              <span className="font-semibold">
                {String(selectedAccount?.currency ?? "").toUpperCase() || "—"}
              </span>
            </div>
          </label>

          <label className="space-y-1">
            <div className="text-xs opacity-70">Amount (e.g. 7.00)</div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              inputMode="decimal"
              placeholder="0.00"
            />
            <div className="text-[11px] opacity-60">
              Stored as cents:{" "}
              <span className="font-semibold">{amountCents}</span>
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs opacity-70">Payment method</div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              placeholder="cash:eur"
            />
            <div className="text-[11px] opacity-60">
              Examples: <span className="font-semibold">cash:eur</span>,{" "}
              <span className="font-semibold">bank_transfer:eur</span>,{" "}
              <span className="font-semibold">card_in_person:eur</span>
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs opacity-70">Sale date/time (optional)</div>
            <input
              className="w-full rounded-lg border px-3 py-2 text-sm"
              type="datetime-local"
              value={saleAt}
              onChange={(e) => setSaleAt(e.target.value)}
            />
            <div className="text-[11px] opacity-60">
              If blank, server uses <span className="font-semibold">now()</span>
              . Day is computed in{" "}
              <span className="font-semibold">Europe/Dublin</span>.
            </div>
          </label>

          <label className="space-y-1 md:col-span-2">
            <div className="text-xs opacity-70">Notes</div>
            <textarea
              className="w-full rounded-lg border px-3 py-2 text-sm"
              rows={3}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Optional internal notes"
            />
          </label>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            disabled={state.status === "loading"}
            className="rounded-lg px-4 py-2 text-sm font-semibold"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            {state.status === "loading" ? "Saving..." : "Record sale"}
          </button>

          {state.status === "success" ? (
            <div className="text-sm text-emerald-700">{state.message}</div>
          ) : null}
          {state.status === "error" ? (
            <div className="text-sm text-red-700">{state.message}</div>
          ) : null}
        </div>
      </form>
    </div>
  );
}
