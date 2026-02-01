import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";
import PresenceStatusButtons from "../_components/PresenceStatusButtons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

type ProfileRow = {
  user_id: string;
  email: string | null;
  role: UserRole;
};

type PresenceOrderDetailRow = {
  id: string;
  user_id: string;
  package_key: string;
  status: string;
  onboarding: unknown;
  created_at: string;
  updated_at: string;
};

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

function isUuid(v: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    v,
  );
}

function safeString(v: unknown): string {
  if (typeof v === "string") return v;
  if (v === null) return "null";
  if (v === undefined) return "undefined";
  if (
    typeof v === "number" ||
    typeof v === "boolean" ||
    typeof v === "bigint"
  ) {
    return String(v);
  }
  try {
    return JSON.stringify(v);
  } catch {
    return "[unserializable]";
  }
}

function tryDecodeURIComponent(v: unknown): string {
  if (typeof v !== "string") return "undefined";
  try {
    return decodeURIComponent(v);
  } catch {
    return v;
  }
}

export default async function OpsPresenceDetailPage({
  params,
}: {
  params: { id?: string };
}) {
  // Unique fingerprint to prove which file is executing in production
  const FILE_FINGERPRINT = "OPS_PRESENCE_DETAIL_VERCEL_DEBUG_v3";

  const rawId = params?.id;
  const decodedId = tryDecodeURIComponent(rawId);

  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Please sign in.</p>
        <Link
          href="/login?next=/ops/presence"
          className="mt-6 inline-block rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Sign in
        </Link>
      </main>
    );
  }

  if (!isUuid(decodedId)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">
          Invalid order id (not a UUID).
        </p>
        <div className="font-mono text-xs">BUILD_MARKER: 2026-02-01T11:55Z</div>
        <div className="mt-2 font-mono text-xs">
          PATH_HINT: /ops/presence/[id]
        </div>

        <div className="mt-4 rounded-xl border p-4 text-xs overflow-auto space-y-2">
          <div className="font-mono opacity-70">{FILE_FINGERPRINT}</div>

          <div>
            <span className="opacity-70">params.id (raw):</span>{" "}
            <span className="font-mono">{safeString(rawId)}</span>
          </div>

          <div>
            <span className="opacity-70">decoded:</span>{" "}
            <span className="font-mono">{safeString(decodedId)}</span>
          </div>

          <div>
            <span className="opacity-70">params object:</span>{" "}
            <span className="font-mono">{safeString(params)}</span>
          </div>
        </div>

        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const id = decodedId;
  const admin = getSupabaseAdmin();

  const meRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle();

  const meProfile = meRes.data as ProfileRow | null;
  const meErr = meRes.error;

  if (meErr || !meProfile || !isAdmin(meProfile.role)) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Access denied.</p>
        <Link
          href="/account"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Go to Account
        </Link>
      </main>
    );
  }

  const orderRes = await admin
    .from("presence_orders")
    .select("id,user_id,package_key,status,onboarding,created_at,updated_at")
    .eq("id", id)
    .maybeSingle();

  const order = orderRes.data as PresenceOrderDetailRow | null;
  const orderErr = orderRes.error;

  if (orderErr) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Failed to load order.</p>
        <pre className="mt-4 rounded-xl border p-4 text-xs overflow-auto">
          {orderErr.message}
        </pre>
        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  if (!order) {
    return (
      <main className="mx-auto w-full max-w-5xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Order not found.</p>
        <Link
          href="/ops/presence"
          prefetch={false}
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const customerRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", order.user_id)
    .maybeSingle();

  const customerProfile = customerRes.data as ProfileRow | null;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Presence Order</h1>
          <p className="mt-2 text-sm opacity-80">Admin fulfillment view.</p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ops/presence"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Back to list
          </Link>
          <Link
            href="/account"
            prefetch={false}
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Account
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        <div className="rounded-xl border p-5 md:col-span-2">
          <div className="text-sm font-semibold">Onboarding</div>
          <pre className="mt-4 rounded-xl border p-4 text-xs overflow-auto">
            {JSON.stringify(order.onboarding ?? {}, null, 2)}
          </pre>
        </div>

        <div className="rounded-xl border p-5">
          <div className="text-sm font-semibold">Order info</div>
          <div className="mt-4 space-y-2 text-sm">
            <div>
              <span className="opacity-70">Customer:</span>{" "}
              <span className="font-medium">
                {customerProfile?.email ?? order.user_id}
              </span>
            </div>
            <div>
              <span className="opacity-70">Package:</span>{" "}
              <span className="font-medium">{order.package_key}</span>
            </div>
            <div>
              <span className="opacity-70">Status:</span>{" "}
              <span className="font-medium">{order.status}</span>
            </div>
            <div>
              <span className="opacity-70">Created:</span>{" "}
              {new Date(order.created_at).toLocaleString()}
            </div>
          </div>

          <div className="mt-6">
            <PresenceStatusButtons
              orderId={order.id}
              currentStatus={order.status}
            />
          </div>
        </div>
      </div>
    </main>
  );
}
