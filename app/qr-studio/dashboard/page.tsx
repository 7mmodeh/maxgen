import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  getQrStudioPlan,
  hasQrStudioEntitlement,
  type QrStudioPlan,
} from "@/src/lib/qr/entitlement";
import ResetCountdown from "../_components/ResetCountdown";

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

function addDaysIso(iso: string, days: number): string {
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return iso;
  return new Date(t + days * 24 * 60 * 60 * 1000).toISOString();
}

function maxIso(a: string | null, b: string | null): string | null {
  if (!a) return b;
  if (!b) return a;
  return Date.parse(a) >= Date.parse(b) ? a : b;
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

async function deleteProject(formData: FormData) {
  "use server";

  const projectId = String(formData.get("project_id") ?? "").trim();
  if (!projectId) redirect("/qr-studio/dashboard?delete=error");

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const { error } = await sb.from("qr_projects").delete().eq("id", projectId);

  if (error) {
    console.error("[qr delete] error:", error);
    redirect("/qr-studio/dashboard?delete=error");
  }

  redirect("/qr-studio/dashboard?delete=ok");
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
  if (!plan) redirect("/qr-studio#pricing");

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

  let canCreate = true;
  let createReason: string | null = null;

  // Countdown unlock timestamp (only computed when blocked)
  let unlockAtIso: string | null = null;

  if (plan === "onetime") {
    if (cAll >= 1) {
      canCreate = false;
      createReason =
        "One-time access allows exactly 1 project total (lifetime). Deleting does not restore this.";
      // No reset for lifetime one-time
      unlockAtIso = null;
    }
  } else {
    const blockedWeekly = c7 >= 5;
    const blockedMonthly = c30 >= 20;

    if (blockedWeekly || blockedMonthly) {
      canCreate = false;

      if (blockedWeekly) {
        createReason =
          "Weekly limit reached: max 5 new projects in a rolling 7-day window.";
      } else {
        createReason =
          "Monthly limit reached: max 20 new projects in a rolling 30-day window.";
      }

      // Compute unlock time(s) based on the oldest event within each blocking window.
      // Weekly unlock = oldest_in_7d + 7 days
      // Monthly unlock = oldest_in_30d + 30 days
      const [oldest7Res, oldest30Res] = await Promise.all([
        blockedWeekly
          ? sb
              .from("qr_usage_events")
              .select("created_at")
              .eq("user_id", user.id)
              .eq("event", "create")
              .gte("created_at", sevenDaysAgo)
              .order("created_at", { ascending: true })
              .limit(1)
          : Promise.resolve({ data: null as { created_at: string }[] | null }),
        blockedMonthly
          ? sb
              .from("qr_usage_events")
              .select("created_at")
              .eq("user_id", user.id)
              .eq("event", "create")
              .gte("created_at", thirtyDaysAgo)
              .order("created_at", { ascending: true })
              .limit(1)
          : Promise.resolve({ data: null as { created_at: string }[] | null }),
      ]);

      const oldest7 = oldest7Res.data?.[0]?.created_at ?? null;
      const oldest30 = oldest30Res.data?.[0]?.created_at ?? null;

      const weeklyUnlock = oldest7 ? addDaysIso(oldest7, 7) : null;
      const monthlyUnlock = oldest30 ? addDaysIso(oldest30, 30) : null;

      // If both limits are hit, choose the later unlock time (conservative, correct).
      unlockAtIso = maxIso(weeklyUnlock, monthlyUnlock);
    }
  }

  const { data: projects } = await sb
    .from("qr_projects")
    .select("id,business_name,url,template_id,template_version,updated_at")
    .order("updated_at", { ascending: false });

  const errCode = first(sp, "error");
  const errMsg = errorMessage(errCode);

  const del = first(sp, "delete");
  const deleteOk = del === "ok";
  const deleteErr = del === "error";

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

        {deleteOk ? (
          <div className="mt-6 rounded-2xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Project deleted. (Deletion does not restore creation allowance.)
          </div>
        ) : null}

        {deleteErr ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            Delete failed. Please try again.
          </div>
        ) : null}

        <section className="mt-8 grid gap-6 lg:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 lg:col-span-2">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm font-semibold">Your access</div>
                <div className="mt-1 text-xs text-white/60">
                  Plan is derived from server-side entitlements.
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
                  Applies only to one-time plan. Deleting does not restore it.
                </div>
              </div>
            </div>

            {!canCreate && createReason ? (
              <div className="mt-5 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                {createReason}
                {plan === "monthly" && unlockAtIso ? (
                  <ResetCountdown unlockAtIso={unlockAtIso} />
                ) : null}
                {plan === "onetime" ? (
                  <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-4 text-sm text-white/70">
                    <div className="font-semibold text-white">No reset</div>
                    One-time access is lifetime-limited (1 total create).
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Rules</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <span className="font-semibold text-white">Edits:</span> 1 edit
                per project (lifetime).
              </li>
              <li>
                <span className="font-semibold text-white">Delete:</span>{" "}
                allowed, does not restore allowance.
              </li>
              <li>
                <span className="font-semibold text-white">Output:</span> PNG
                1024 + clean SVG.
              </li>
            </ul>
          </div>
        </section>

        <section className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold">Your projects</h2>
            <span className="text-xs text-white/60">
              {projects?.length ?? 0} total
            </span>
          </div>

          <div className="mt-4 grid gap-3">
            {(projects ?? []).map((p) => (
              <div
                key={p.id}
                className="rounded-xl border border-white/10 bg-black/20 p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <Link href={`/qr-studio/${p.id}`} className="block">
                      <div className="text-sm font-semibold hover:underline">
                        {p.business_name}
                      </div>
                      <div className="mt-1 text-xs text-white/60 break-all">
                        {p.url}
                      </div>
                      <div className="mt-2 text-xs text-white/60">
                        {p.template_id} v{p.template_version}
                      </div>
                    </Link>
                  </div>

                  <div className="flex shrink-0 items-center gap-2">
                    <Link
                      href={`/qr-studio/${p.id}`}
                      className="rounded-md border border-white/15 bg-white/5 px-3 py-2 text-xs font-medium hover:bg-white/10"
                    >
                      Open
                    </Link>

                    <form action={deleteProject}>
                      <input type="hidden" name="project_id" value={p.id} />
                      <button
                        className="rounded-md border border-rose-400/30 bg-rose-400/10 px-3 py-2 text-xs font-semibold text-rose-100 hover:bg-rose-400/15"
                        type="submit"
                      >
                        Delete
                      </button>
                    </form>
                  </div>
                </div>
              </div>
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
