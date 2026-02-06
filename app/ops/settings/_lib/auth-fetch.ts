// app/ops/settings/_lib/auth-fetch.ts
"use client";

import { supabaseBrowser } from "@/src/lib/supabase/browser";

export async function authedPostJson<
  TResponse = unknown,
  TBody extends Record<string, unknown> = Record<string, unknown>
>(url: string, body: TBody): Promise<TResponse> {
  const { data, error } = await supabaseBrowser.auth.getSession();
  if (error) throw error;

  const token = data.session?.access_token;
  if (!token) throw new Error("Not authenticated");

  const res = await fetch(url, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(body),
  });

  // Some endpoints may return empty body; keep this helper resilient.
  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed (${res.status})`);

  if (!text) return undefined as TResponse;

  try {
    return JSON.parse(text) as TResponse;
  } catch {
    // If the endpoint returns plain text (rare), surface as string.
    return text as unknown as TResponse;
  }
}
