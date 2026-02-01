// app/login/page.tsx

"use client";

import { useState } from "react";
import Link from "next/link";
import { supabaseBrowser } from "@/src/lib/supabase/browser";
import { ROUTES } from "@/src/config/routes";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const next =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("next") || "/"
      : "/";

  async function signIn() {
    setLoading(true);
    try {
      const { error } = await supabaseBrowser.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      window.location.href = next;
    } catch (e) {
      console.error(e);
      alert("Sign-in failed. Check email/password and try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="mx-auto w-full max-w-md px-6 py-16">
      <h1 className="text-2xl font-semibold">Sign in</h1>
      <p className="mt-2 text-sm opacity-80">
        One account for Online Presence, QR Studio, and Supplies.
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
          autoComplete="current-password"
        />

        <button
          onClick={signIn}
          disabled={!email || !password || loading}
          className="w-full rounded-lg px-4 py-2 text-sm font-semibold disabled:opacity-60"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="pt-2 text-xs opacity-80">
          Don’t have an account?{" "}
          <Link
            href={`${ROUTES.signup}?next=${encodeURIComponent(next)}`}
            className="underline underline-offset-4"
          >
            Create one
          </Link>
        </div>
      </div>
    </main>
  );
}
