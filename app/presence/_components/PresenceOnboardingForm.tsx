// app/presence/_components/PresenceOnboardingForm.tsx

"use client";

import React, { useMemo, useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
type PresenceOnboarding = Record<string, JsonValue>;

type Props = {
  orderId: string;
  initial: PresenceOnboarding;
};

type FormState = {
  business_name: string;
  phone: string;
  website: string;
  services: string;
  address: string;
  notes: string;
};

function getString(initial: PresenceOnboarding, key: keyof FormState): string {
  const v = initial[key];
  return typeof v === "string" ? v : "";
}

function isNonEmpty(value: string): boolean {
  return value.trim().length > 0;
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium">{label}</label>
      <div className="mt-2">{children}</div>
    </div>
  );
}

export default function PresenceOnboardingForm({ orderId, initial }: Props) {
  const initialState: FormState = useMemo(
    () => ({
      business_name: getString(initial, "business_name"),
      phone: getString(initial, "phone"),
      website: getString(initial, "website"),
      services: getString(initial, "services"),
      address: getString(initial, "address"),
      notes: getString(initial, "notes"),
    }),
    [initial],
  );

  const [form, setForm] = useState<FormState>(initialState);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{
    kind: "success" | "error";
    text: string;
  } | null>(null);

  const requiredMissing = useMemo(() => {
    const missing: Array<keyof FormState> = [];
    if (!isNonEmpty(form.business_name)) missing.push("business_name");
    if (!isNonEmpty(form.phone)) missing.push("phone");
    if (!isNonEmpty(form.services)) missing.push("services");
    if (!isNonEmpty(form.address)) missing.push("address");
    return missing;
  }, [form]);

  async function save() {
    setMessage(null);

    if (requiredMissing.length > 0) {
      setMessage({
        kind: "error",
        text: "Please fill the required fields: Business name, Phone, Services, Address.",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await supabaseBrowser
        .from("presence_orders")
        .update({ onboarding: form })
        .eq("id", orderId);

      if (error) throw error;

      setMessage({ kind: "success", text: "Saved." });
    } catch (e: unknown) {
      console.error(e);
      setMessage({ kind: "error", text: "Save failed. Please try again." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="rounded-xl border p-6">
      <div className="text-sm font-semibold">Onboarding</div>
      <p className="mt-2 text-sm opacity-80">
        Fill this once. We use it to build your site and listings.
      </p>

      <div className="mt-6 grid gap-4">
        <Field label="Business name *">
          <input
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
            autoComplete="organization"
          />
        </Field>

        <Field label="Phone / WhatsApp *">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            autoComplete="tel"
          />
        </Field>

        <Field label="Existing website (optional)">
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            autoComplete="url"
          />
        </Field>

        <Field label="Services (comma separated) *">
          <textarea
            value={form.services}
            onChange={(e) => setForm({ ...form, services: e.target.value })}
            className="w-full min-h-[90px] rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Service area / address *">
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
            autoComplete="street-address"
          />
        </Field>

        <Field label="Notes (anything important)">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full min-h-[90px] rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <button
          type="button"
          onClick={save}
          disabled={saving}
          className="rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          {saving ? "Saving…" : "Save onboarding"}
        </button>

        {message ? (
          <div className="text-xs" style={{ opacity: 0.85 }} aria-live="polite">
            {message.text}
          </div>
        ) : null}
      </div>
    </div>
  );
}
