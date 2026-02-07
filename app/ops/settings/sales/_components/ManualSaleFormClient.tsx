"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

type BusinessLine = "company" | "qr_studio" | "supplies";
type PaymentMethod = "cash" | "bank_transfer" | "card_manual" | "other";

type BankAccount = {
  id: string;
  name: string;
  currency: string;
  status: string;
};

type Props = {
  accounts: BankAccount[];
};

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

function toCents(amount: string): number {
  const n = Number(String(amount).trim());
  if (!Number.isFinite(n)) return 0;
  return Math.round(n * 100);
}

function formatCurrencyLabel(input: string): string {
  const c = String(input || "").trim();
  if (!c) return "UNKNOWN";
  return c.toUpperCase();
}

export default function ManualSaleFormClient({ accounts }: Props) {
  const defaultAccountId = accounts[0]?.id ?? "";
  const defaultCurrency = accounts[0]?.currency ?? "eur";

  const [day, setDay] = useState<string>(isoDate(new Date()));
  const [businessLine, setBusinessLine] = useState<BusinessLine>("company");
  const [bankAccountId, setBankAccountId] = useState<string>(defaultAccountId);
  const [currency, setCurrency] = useState<string>(defaultCurrency);
  const [amount, setAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [notes, setNotes] = useState<string>("");
  const [tags, setTags] = useState<string>("sales,manual");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [result, setResult] = useState<
    | { ok: true; ledger_entry_id: string; manual_sale_id: string }
    | { ok: false; error: string }
    | null
  >(null);

  const accountById = useMemo(() => {
    const m = new Map<string, BankAccount>();
    for (const a of accounts) m.set(a.id, a);
    return m;
  }, [accounts]);

  function onAccountChange(nextId: string) {
    setBankAccountId(nextId);
    const acc = accountById.get(nextId);
    if (acc?.currency) setCurrency(String(acc.currency).toLowerCase());
  }

  async function submit() {
    setResult(null);

    const amountCents = toCents(amount);
    if (!day) {
      setResult({ ok: false, error: "Missing day" });
      return;
    }
    if (!bankAccountId) {
      setResult({ ok: false, error: "Missing bank account" });
      return;
    }
    if (amountCents <= 0) {
      setResult({ ok: false, error: "Amount must be > 0" });
      return;
    }
    if (!currency) {
      setResult({ ok: false, error: "Missing currency" });
      return;
    }

    const tagList = tags
      .split(",")
      .map((x) => x.trim())
      .filter((x) => x.length > 0);

    setIsSubmitting(true);
    try {
      const idempotencyKey =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(16).slice(2)}`;

      const res = await fetch("/api/ops/settings/sales/create", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-idempotency-key": idempotencyKey,
        },
        body: JSON.stringify({
          day,
          business_line: businessLine,
          bank_account_id: bankAccountId,
          currency: String(currency).toLowerCase(),
          amount_cents: amountCents,
          payment_method: paymentMethod,
          notes,
          tags: tagList,
        }),
      });

      const json: unknown = await res.json();
      if (!res.ok) {
        const msg =
          typeof json === "object" && json && "error" in json
            ? String((json as { error: unknown }).error)
            : `Request failed (${res.status})`;
        setResult({ ok: false, error: msg });
        return;
      }

      const parsed =
        typeof json === "object" && json
          ? (json as {
              ledger_entry_id?: unknown;
              manual_sale_id?: unknown;
            })
          : null;

      const ledger_entry_id =
        parsed?.ledger_entry_id && typeof parsed.ledger_entry_id === "string"
          ? parsed.ledger_entry_id
          : "";
      const manual_sale_id =
        parsed?.manual_sale_id && typeof parsed.manual_sale_id === "string"
          ? parsed.manual_sale_id
          : "";

      if (!ledger_entry_id || !manual_sale_id) {
        setResult({ ok: false, error: "Invalid response payload" });
        return;
      }

      setResult({ ok: true, ledger_entry_id, manual_sale_id });
      setAmount("");
      setNotes("");
    } catch (e: unknown) {
      setResult({
        ok: false,
        error: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="rounded-xl border p-6">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold">Manual sale</div>
          <div className="mt-1 text-xs opacity-70">
            This will create a ledger entry (customer_payment) and a manual sale
            record used by ops sales rollups.
          </div>
        </div>
        <Link
          href="/ops"
          prefetch={false}
          className="text-xs underline underline-offset-4"
        >
          Back to Ops
        </Link>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <label className="block">
          <div className="text-xs opacity-70">Day</div>
          <input
            type="date"
            value={day}
            onChange={(e) => setDay(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          />
        </label>

        <label className="block">
          <div className="text-xs opacity-70">Business line</div>
          <select
            value={businessLine}
            onChange={(e) => setBusinessLine(e.target.value as BusinessLine)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="company">company</option>
            <option value="qr_studio">qr_studio</option>
            <option value="supplies">supplies</option>
          </select>
        </label>

        <label className="block">
          <div className="text-xs opacity-70">Bank account</div>
          <select
            value={bankAccountId}
            onChange={(e) => onAccountChange(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} ({formatCurrencyLabel(a.currency)})
              </option>
            ))}
          </select>
        </label>

        <label className="block">
          <div className="text-xs opacity-70">Currency</div>
          <input
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="eur"
          />
        </label>

        <label className="block">
          <div className="text-xs opacity-70">Amount (e.g. 7.00)</div>
          <input
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="0.00"
            inputMode="decimal"
          />
        </label>

        <label className="block">
          <div className="text-xs opacity-70">Payment method</div>
          <select
            value={paymentMethod}
            onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
          >
            <option value="cash">cash</option>
            <option value="bank_transfer">bank_transfer</option>
            <option value="card_manual">card_manual</option>
            <option value="other">other</option>
          </select>
        </label>

        <label className="block md:col-span-2">
          <div className="text-xs opacity-70">Notes</div>
          <input
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="Optional"
          />
        </label>

        <label className="block md:col-span-2">
          <div className="text-xs opacity-70">Tags (comma separated)</div>
          <input
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
            placeholder="sales,manual"
          />
        </label>
      </div>

      <div className="mt-6 flex items-center gap-3">
        <button
          type="button"
          onClick={submit}
          disabled={isSubmitting}
          className="rounded-lg px-5 py-3 text-sm font-semibold"
          style={{
            background: "var(--mx-cta)",
            color: "#fff",
            opacity: isSubmitting ? 0.7 : 1,
          }}
        >
          {isSubmitting ? "Saving..." : "Create manual sale"}
        </button>

        {result?.ok ? (
          <div className="text-sm">
            ✅ Saved. ledger:{" "}
            <span className="font-mono text-xs">{result.ledger_entry_id}</span>{" "}
            • sale:{" "}
            <span className="font-mono text-xs">{result.manual_sale_id}</span>
          </div>
        ) : null}

        {result && !result.ok ? (
          <div className="text-sm text-red-700">❌ {result.error}</div>
        ) : null}
      </div>
    </div>
  );
}
