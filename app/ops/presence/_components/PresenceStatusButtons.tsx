// app/ops/presence/_components/PresenceStatusButtons.tsx

"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";

const STATUSES = [
  "paid",
  "onboarding_received",
  "in_progress",
  "delivered",
  "canceled",
] as const;
type PresenceStatus = (typeof STATUSES)[number];

export default function PresenceStatusButtons({
  orderId,
  currentStatus,
}: {
  orderId: string;
  currentStatus: string;
}) {
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  async function updateStatus(nextStatus: PresenceStatus) {
    setLoading(true);
    setMsg(null);
    try {
      const { data, error } = await supabaseBrowser.auth.getSession();
      if (error) throw error;

      const token = data.session?.access_token;
      if (!token) throw new Error("Not authenticated");

      const res = await fetch("/api/ops/presence/update-status", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ order_id: orderId, status: nextStatus }),
      });

      const text = await res.text();
      if (!res.ok) throw new Error(text);

      setMsg("Updated.");
      // hard refresh to reflect server data
      window.location.reload();
    } catch (e: unknown) {
      const m = e instanceof Error ? e.message : String(e);
      console.error(e);
      setMsg(m);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="rounded-xl border p-4">
      <div className="text-sm font-semibold">Update status</div>
      <div className="mt-2 text-xs opacity-80">Current: {currentStatus}</div>

      <div className="mt-4 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            disabled={loading}
            onClick={() => updateStatus(s)}
            className="rounded-lg border px-3 py-2 text-xs font-semibold disabled:opacity-60"
            style={{
              background:
                s === currentStatus ? "rgba(37,99,235,0.14)" : "transparent",
            }}
          >
            {s}
          </button>
        ))}
      </div>

      {msg ? <div className="mt-3 text-xs opacity-80">{msg}</div> : null}
    </div>
  );
}
