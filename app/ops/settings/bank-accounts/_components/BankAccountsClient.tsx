"use client";

import { useMemo, useState } from "react";
import { authedPostJson } from "@/app/ops/settings/_lib/auth-fetch";
import {
  BANK_ACCOUNT_STATUSES,
  type BankAccountStatus,
} from "@/app/ops/settings/_lib/ops-constants";

type BankAccountRow = {
  id: string;
  name: string;
  currency: string;
  status: BankAccountStatus;
  opening_balance_amount: string;
  opening_balance_date: string;
  created_at: string;
  updated_at: string;
};

type CreateForm = {
  name: string;
  currency: string;
  opening_balance_amount: string;
  opening_balance_date: string;
};

function isValidBankAccountStatus(v: string): v is BankAccountStatus {
  return BANK_ACCOUNT_STATUSES.includes(v as BankAccountStatus);
}

export default function BankAccountsClient({
  initialAccounts,
}: {
  initialAccounts: BankAccountRow[];
}) {
  const accounts = useMemo(() => initialAccounts, [initialAccounts]);
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const [createForm, setCreateForm] = useState<CreateForm>({
    name: "",
    currency: "EUR",
    opening_balance_amount: "0",
    opening_balance_date: new Date().toISOString().slice(0, 10),
  });

  async function toggleArchive(id: string, nextStatus: BankAccountStatus) {
    setLoading(true);
    setMsg(null);
    try {
      await authedPostJson("/api/ops/settings/bank-accounts/archive", {
        id,
        status: nextStatus,
      });
      window.location.reload();
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  }

  async function createAccount() {
    setLoading(true);
    setMsg(null);
    try {
      if (!createForm.name.trim()) throw new Error("Name is required.");

      await authedPostJson("/api/ops/settings/bank-accounts/create", {
        name: createForm.name.trim(),
        currency: createForm.currency.trim(),
        opening_balance_amount: Number(createForm.opening_balance_amount),
        opening_balance_date: createForm.opening_balance_date,
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
        <h2 className="text-sm font-semibold">Accounts</h2>

        <div className="mt-4 overflow-auto rounded-xl border">
          <table className="w-full text-sm">
            <thead className="border-b bg-black/[0.02]">
              <tr>
                <th className="p-3">Name</th>
                <th className="p-3">Currency</th>
                <th className="p-3">Status</th>
                <th className="p-3">Opening</th>
                <th className="p-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {accounts.map((a) => {
                const nextStatus =
                  a.status === "active" ? "archived" : "active";

                return (
                  <tr key={a.id} className="border-b last:border-b-0">
                    <td className="p-3 font-medium">{a.name}</td>
                    <td className="p-3">{a.currency}</td>
                    <td className="p-3">{a.status}</td>
                    <td className="p-3">
                      {a.opening_balance_amount} on {a.opening_balance_date}
                    </td>
                    <td className="p-3">
                      {isValidBankAccountStatus(nextStatus) ? (
                        <button
                          disabled={loading}
                          onClick={() => void toggleArchive(a.id, nextStatus)}
                          className="underline underline-offset-4 text-xs disabled:opacity-60"
                        >
                          Set {nextStatus}
                        </button>
                      ) : (
                        <span className="text-xs opacity-70">n/a</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>

      <aside className="rounded-xl border p-6">
        <h2 className="text-sm font-semibold">Create new account</h2>

        <div className="mt-5 space-y-3 text-sm">
          <input
            className="w-full rounded-lg border px-3 py-2"
            placeholder="Name"
            value={createForm.name}
            onChange={(e) =>
              setCreateForm((s) => ({ ...s, name: e.target.value }))
            }
          />

          <input
            className="w-full rounded-lg border px-3 py-2"
            value={createForm.currency}
            onChange={(e) =>
              setCreateForm((s) => ({ ...s, currency: e.target.value }))
            }
          />

          <input
            className="w-full rounded-lg border px-3 py-2"
            inputMode="decimal"
            value={createForm.opening_balance_amount}
            onChange={(e) =>
              setCreateForm((s) => ({
                ...s,
                opening_balance_amount: e.target.value,
              }))
            }
          />

          <input
            type="date"
            className="w-full rounded-lg border px-3 py-2"
            value={createForm.opening_balance_date}
            onChange={(e) =>
              setCreateForm((s) => ({
                ...s,
                opening_balance_date: e.target.value,
              }))
            }
          />

          <button
            disabled={loading}
            onClick={() => void createAccount()}
            className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
            style={{ background: "var(--mx-cta)", color: "#fff" }}
          >
            Create
          </button>

          {msg && <div className="text-xs opacity-80">{msg}</div>}
        </div>
      </aside>
    </div>
  );
}
