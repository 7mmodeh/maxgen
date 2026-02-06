// app/ops/settings/_lib/auth-fetch.ts
"use client";

import { supabaseBrowser } from "@/src/lib/supabase/browser";

export async function authedPostJson<TBody extends Record<string, unknown>>(
  url: string,
  body: TBody,
): Promise<void> {
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

  const text = await res.text();
  if (!res.ok) throw new Error(text || `Request failed (${res.status})`);
}
