"use client";

import { useState } from "react";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import { ROUTES } from "@/src/config/routes";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/"
      : "/";

  async function signUp() {
    setLoading(true);
    try {
      const { data, error } = await supabaseBrowser.auth.signUp({
        email,
        password,
      });
      if (error) throw error;

      // Profile row creation:
      // We do NOT assume you have a DB trigger. This will succeed only if RLS allows it.
      if (data.user?.id) {
        const { error: pErr } = await supabaseBrowser.from("profiles").upsert({
          user_id: data.user.id,
          email,
        });
        if (pErr) {
          // Don’t block signup; but you should enforce profiles via DB trigger (recommended below).
          console.warn("profiles upsert failed:", pErr);
        }
      }

      window.location.href = next;
    } catch (e) {
      console.error(e);
      alert("Sign-up failed. Try a stronger password or a different email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm opacity-80">
        Use email + password. You can sign in at{" "}
        <span className="font-semibold">{ROUTES.login}</span>.
      </p>

      <div className="mt-6 space-y-3">
        <label className="block text-sm">Email</label>
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          autoComplete="email"
        />

        <label className="block text-sm">Password</label>
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          className="w-full rounded-lg border px-3 py-2 text-sm"
          autoComplete="new-password"
        />

        <button
          onClick={signUp}
          disabled={!email || !password || loading}
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          {loading ? "Creating…" : "Create account"}
        </button>

        <div className="pt-2 text-xs opacity-80">
          Already have an account?{" "}
          <a
            href={`${ROUTES.login}?next=${encodeURIComponent(next)}`}
            className="underline underline-offset-4"
          >
            Sign in
          </a>
        </div>
      </div>
    </main>
  );
}
