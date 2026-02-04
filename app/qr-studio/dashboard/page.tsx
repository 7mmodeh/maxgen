import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  getQrStudioPlan,
  hasQrStudioEntitlement,
  type QrStudioPlan,
} from "@/src/lib/qr/entitlement";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type SearchParams = Record<string, string | string[] | undefined>;

function first(sp: SearchParams, key: string): string | null {
  const v = sp[key];
  if (!v) return null;
  return Array.isArray(v) ? (v[0] ?? null) : v;
}

function isoDaysAgo(days: number): string {
  const ms = days * 24 * 60 * 60 * 1000;
  return new Date(Date.now() - ms).toISOString();
}

function errorMessage(code: string | null): string | null {
  switch (code) {
    case "onetime_limit_reached":
      return "One-time access allows 1 QR project total (lifetime). You’ve already used it.";
    case "weekly_limit_reached":
      return "Weekly limit reached: max 5 new QR projects in a rolling 7-day window.";
    case "monthly_limit_reached":
      return "Monthly limit reached: max 20 new QR projects in a rolling 30-day window.";
    case "no_entitlement":
      return "No active QR Studio access found. Please purchase access to create projects.";
    case "create_failed":
      return "Could not create the project. Please try again.";
    default:
      return null;
  }
}

function planLabel(plan: QrStudioPlan): string {
  return plan === "monthly" ? "Monthly (€7/month)" : "One-time (€9)";
}

export default async function QrStudioDashboardPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio#pricing");

  const plan = await getQrStudioPlan(user.id);
  // If entitlement exists but plan is missing for any reason, we fail safely.
  if (!plan) redirect("/qr-studio#pricing");

  // Usage counts (rolling windows)
  const sevenDaysAgo = isoDaysAgo(7);
  const thirtyDaysAgo = isoDaysAgo(30);

  const [{ count: createdAll }, { count: created7 }, { count: created30 }] =
    await Promise.all([
      sb
        .from("qr_usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event", "create"),
      sb
        .from("qr_usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event", "create")
        .gte("created_at", sevenDaysAgo),
      sb
        .from("qr_usage_events")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .eq("event", "create")
        .gte("created_at", thirtyDaysAgo),
    ]);

  const cAll = createdAll ?? 0;
  const c7 = created7 ?? 0;
  const c30 = created30 ?? 0;

  // Can create logic (matches RPC rules)
  let canCreate = true;
  let createReason: string | null = null;

  if (plan === "onetime") {
    if (cAll >= 1) {
      canCreate = false;
      createReason =
        "One-time access allows exactly 1 project total (lifetime). Deleting does not restore this.";
    }
  } else {
    if (c7 >= 5) {
      canCreate = false;
      createReason =
        "Weekly limit reached: max 5 new projects in a rolling 7-day window.";
    } else if (c30 >= 20) {
      canCreate = false;
      createReason =
        "Monthly limit reached: max 20 new projects in a rolling 30-day window.";
    }
  }

  const { data: projects } = await sb
    .from("qr_projects")
    .select("id,business_name,url,template_id,template_version,updated_at")
    .order("updated_at", { ascending: false });

  const errCode = first(sp, "error");
  const errMsg = errorMessage(errCode);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">Dashboard</h1>
            <p className="mt-2 text-sm text-white/70">
              Create projects, download PNG/SVG. Templates T1–T3 only.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/qr-studio"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to product page
            </Link>

            {canCreate ? (
              <Link
                href="/qr-studio/new"
                className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              >
                Create QR Project
              </Link>
            ) : (
              <div
                className="rounded-md bg-white/10 px-4 py-2 text-sm font-semibold text-white/60"
                aria-disabled="true"
                title={createReason ?? undefined}
              >
                Create QR Project (locked)
              </div>
            )}
          </div>
        </div>

        {errMsg ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errMsg}
          </div>
        ) : null}

        {/* Rules + quotas */}
        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Your access</div>
                <div className="mt-1 text-xs text-white/60">
                  Plan is derived from server-side entitlements (Stripe is
                  source of truth in production).
                </div>
              </div>
              <div className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-xs text-white/80">
                {planLabel(plan)}
              </div>
            </div>

            <div className="mt-5 grid gap-3 md:grid-cols-2">
              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/60">
                  Create limit (weekly)
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {plan === "monthly" ? `${c7} / 5` : "—"}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Rolling 7-day window
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs text-white/60">
                  Create limit (monthly)
                </div>
                <div className="mt-1 text-lg font-semibold">
                  {plan === "monthly" ? `${c30} / 20` : "—"}
                </div>
                <div className="mt-1 text-xs text-white/60">
                  Rolling 30-day window
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4 md:col-span-2">
                <div className="text-xs text-white/60">
                  One-time creation (lifetime)
                </div>
                <div className="mt-1 text-lg font-semibold">{`${cAll} / 1`}</div>
                <div className="mt-1 text-xs text-white/60">
                  Applies only to the one-time plan. Deleting a project does not
                  restore this.
                </div>
              </div>
            </div>

            {!canCreate && createReason ? (
              <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                {createReason}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Rules (non-negotiable)</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <span className="font-semibold text-white">
                  Static QR only:
                </span>{" "}
                no redirects, no analytics, no tracking.
              </li>
              <li>
                <span className="font-semibold text-white">Templates:</span>{" "}
                T1–T3 only.
              </li>
              <li>
                <span className="font-semibold text-white">Edits:</span> each
                project can be edited{" "}
                <span className="font-semibold text-white">once</span>{" "}
                (lifetime). After that it locks.
              </li>
              <li>
                <span className="font-semibold text-white">Delete:</span>{" "}
                allowed for all users, but{" "}
                <span className="font-semibold text-white">does not</span>{" "}
                restore creation allowance.
              </li>
              <li>
                <span className="font-semibold text-white">Exports:</span> PNG
                1024×1024 + clean SVG.
              </li>
            </ul>
          </div>
        </section>

        {/* Projects */}
        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your projects</h2>
            <span className="text-xs text-white/60">
              {projects?.length ?? 0} total
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {(projects ?? []).map((p) => (
              <Link
                key={p.id}
                href={`/qr-studio/${p.id}`}
                className="rounded-xl border border-white/10 bg-black/20 p-4 hover:bg-black/30"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-semibold">
                      {p.business_name}
                    </div>
                    <div className="mt-1 text-xs text-white/60 break-all">
                      {p.url}
                    </div>
                  </div>
                  <div className="text-xs text-white/60">
                    {p.template_id} v{p.template_version}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {!projects || projects.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-white/15 bg-black/10 p-6 text-sm text-white/70">
              No projects yet. Create your first QR project.
            </div>
          ) : null}
        </section>
      </div>
    </main>
  );
}
