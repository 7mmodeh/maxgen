"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
type PresenceOnboarding = Record<string, JsonValue>;

type Props = {
  orderId: string;
  initial: PresenceOnboarding;
};

export default function PresenceOnboardingForm({ orderId, initial }: Props) {
  const [form, setForm] = useState<{
    business_name: string;
    phone: string;
    website: string;
    services: string;
    address: string;
    notes: string;
  }>({
    business_name:
      typeof initial.business_name === "string" ? initial.business_name : "",
    phone: typeof initial.phone === "string" ? initial.phone : "",
    website: typeof initial.website === "string" ? initial.website : "",
    services: typeof initial.services === "string" ? initial.services : "",
    address: typeof initial.address === "string" ? initial.address : "",
    notes: typeof initial.notes === "string" ? initial.notes : "",
  });

  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState<string | null>(null);

  async function save() {
    setSaving(true);
    setSaved(null);
    try {
      const { error } = await supabaseBrowser
        .from("presence_orders")
        .update({ onboarding: form })
        .eq("id", orderId);

      if (error) throw error;
      setSaved("Saved.");
    } catch (e) {
      console.error(e);
      setSaved("Save failed. Please try again.");
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
        <Field label="Business name">
          <input
            value={form.business_name}
            onChange={(e) =>
              setForm({ ...form, business_name: e.target.value })
            }
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Phone / WhatsApp">
          <input
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Existing website (optional)">
          <input
            value={form.website}
            onChange={(e) => setForm({ ...form, website: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Services (comma separated)">
          <textarea
            value={form.services}
            onChange={(e) => setForm({ ...form, services: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px]"
          />
        </Field>

        <Field label="Service area / address">
          <input
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm"
          />
        </Field>

        <Field label="Notes (anything important)">
          <textarea
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            className="w-full rounded-lg border px-3 py-2 text-sm min-h-[90px]"
          />
        </Field>

        <button
          onClick={save}
          disabled={saving}
          className="rounded-lg px-5 py-3 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          {saving ? "Saving…" : "Save onboarding"}
        </button>

        {saved ? <div className="text-xs opacity-80">{saved}</div> : null}
      </div>
    </div>
  );
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
