import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { supabaseAdmin } from "@/src/lib/supabase-admin";
import PresenceStatusButtons from "../_components/PresenceStatusButtons";

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";

type ProfileRow = {
  user_id: string;
  email: string | null;
  role: UserRole;
};

type PresenceOrderRow = {
  id: string;
  user_id: string;
  package_key: string;
  status: string;
  onboarding: unknown;
  stripe_checkout_session_id: string | null;
  created_at: string;
  updated_at: string;
};

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

export default async function OpsPresenceDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Please sign in.</p>
        <Link
          href={`/login?next=${encodeURIComponent(`/ops/presence/${params.id}`)}`}
          className="mt-6 inline-block rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Sign in
        </Link>
      </main>
    );
  }

  const { data: meProfile } = await supabaseAdmin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle()
    .returns<ProfileRow | null>();

  if (!meProfile || !isAdmin(meProfile.role)) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Access denied.</p>
        <Link
          href="/account"
          className="mt-6 inline-block underline underline-offset-4"
        >
          Go to Account
        </Link>
      </main>
    );
  }

  const { data: order, error } = await supabaseAdmin
    .from("presence_orders")
    .select(
      "id,user_id,package_key,status,onboarding,stripe_checkout_session_id,created_at,updated_at",
    )
    .eq("id", params.id)
    .maybeSingle()
    .returns<PresenceOrderRow | null>();

  if (error || !order) {
    return (
      <main className="mx-auto w-full max-w-4xl px-6 py-16">
        <h1 className="text-2xl font-semibold">Presence Ops</h1>
        <p className="mt-2 text-sm opacity-80">Order not found.</p>
        <Link
          href="/ops/presence"
          className="mt-6 inline-block underline underline-offset-4"
        >
          Back to list
        </Link>
      </main>
    );
  }

  const { data: customerProfile } = await supabaseAdmin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", order.user_id)
    .maybeSingle()
    .returns<ProfileRow | null>();

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-16">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Presence Order</h1>
          <p className="mt-2 text-sm opacity-80">
            Admin fulfillment view — update status and copy onboarding.
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/ops/presence"
            className="rounded-lg border px-4 py-2 text-sm font-semibold"
          >
            Back to list
          </Link>
          <Link
            href="/account"
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
            <div className="pt-2">
              <span className="opacity-70">Checkout session:</span>
              <div className="mt-1 font-mono text-xs break-all opacity-90">
                {order.stripe_checkout_session_id ?? "—"}
              </div>
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
