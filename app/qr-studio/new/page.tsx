// app/qr-studio/new/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  getQrStudioPlan,
  hasQrStudioEntitlement,
  type QrStudioPlan,
} from "@/src/lib/qr/entitlement";
import { TEMPLATE_VERSION_V1 } from "@/src/lib/qr/templates";

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

function normalizeUrl(input: string): string {
  const v = input.trim();
  if (!v) return v;
  if (/^https?:\/\//i.test(v)) return v;
  return `https://${v}`;
}

function extFromMime(mime: string): "png" | "jpg" | "webp" | "svg" | null {
  switch (mime) {
    case "image/png":
      return "png";
    case "image/jpeg":
      return "jpg";
    case "image/webp":
      return "webp";
    case "image/svg+xml":
      return "svg";
    default:
      return null;
  }
}

function errorMessage(code: string | null): string | null {
  switch (code) {
    case "missing_business_name":
      return "Business name is required.";
    case "missing_url":
      return "URL is required.";
    case "invalid_template":
      return "Invalid template. Please select T1, T2, or T3.";
    case "missing_legal_accept":
      return "You must confirm you’ve read the Terms and accept the Privacy Policy.";
    case "create_failed":
      return "Failed to create project. Please try again.";
    case "logo_not_allowed_t3":
      return "Logo is not allowed on template T3 (Scan-max). Choose T1 or T2.";
    case "logo_type_invalid":
      return "Logo type not supported. Use PNG, JPG, WEBP, or SVG.";
    default:
      return null;
  }
}

async function createProject(formData: FormData) {
  "use server";

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  // Mandatory legal acceptance (server-enforced)
  const legalAccept = String(formData.get("legal_accept") ?? "").trim();
  if (!legalAccept) redirect("/qr-studio/new?error=missing_legal_accept");

  // Entitlement gate (existing)
  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio/dashboard?error=no_entitlement");

  // Plan (monthly vs onetime) is authoritative for quotas
  const plan = (await getQrStudioPlan(user.id)) as QrStudioPlan | null;
  if (!plan) redirect("/qr-studio/dashboard?error=no_entitlement");

  const business_name = String(formData.get("business_name") ?? "").trim();
  const urlRaw = String(formData.get("url") ?? "").trim();
  const url = normalizeUrl(urlRaw);
  const template_id = String(formData.get("template_id") ?? "").trim();
  const taglineRaw = String(formData.get("tagline") ?? "").trim();
  const tagline = taglineRaw.length ? taglineRaw : null;

  if (!business_name) redirect("/qr-studio/new?error=missing_business_name");
  if (!url) redirect("/qr-studio/new?error=missing_url");
  if (!["T1", "T2", "T3"].includes(template_id))
    redirect("/qr-studio/new?error=invalid_template");

  // Optional logo upload at creation time
  const maybeLogo = formData.get("logo");
  const logo =
    maybeLogo instanceof File && maybeLogo.size > 0 ? maybeLogo : null;

  // Validate logo constraints BEFORE we create the project (to avoid phantom projects)
  let logoExt: "png" | "jpg" | "webp" | "svg" | null = null;

  if (logo) {
    if (template_id === "T3") {
      redirect("/qr-studio/new?error=logo_not_allowed_t3");
    }
    logoExt = extFromMime(logo.type);
    if (!logoExt) {
      redirect("/qr-studio/new?error=logo_type_invalid");
    }
  }

  // Quota enforcement (authoritative)
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

  if (plan === "onetime") {
    if (cAll >= 1) {
      redirect("/qr-studio/dashboard?error=onetime_limit_reached");
    }
  } else {
    if (c7 >= 5) {
      redirect("/qr-studio/dashboard?error=weekly_limit_reached");
    }
    if (c30 >= 20) {
      redirect("/qr-studio/dashboard?error=monthly_limit_reached");
    }
  }

  // Create the project
  const { data: created, error } = await sb
    .from("qr_projects")
    .insert({
      user_id: user.id,
      business_name,
      tagline,
      url,
      template_id,
      template_version: TEMPLATE_VERSION_V1,
      logo_path: null,
    })
    .select("id")
    .single();

  if (error || !created?.id) {
    console.error("[qr create] error:", error);
    redirect("/qr-studio/dashboard?error=create_failed");
  }

  const projectId = created.id as string;

  // Write usage event (authoritative accounting)
  const { error: usageErr } = await sb.from("qr_usage_events").insert({
    user_id: user.id,
    project_id: projectId,
    event: "create",
  });

  if (usageErr) {
    console.error("[qr usage] insert error:", usageErr);
    // Best-effort rollback so quota accounting cannot be bypassed
    await sb.from("qr_projects").delete().eq("id", projectId);
    redirect("/qr-studio/dashboard?error=create_failed");
  }

  // Upload logo if provided (non-blocking; quota already accounted for)
  if (logo && logoExt) {
    const objectPath = `logos/${user.id}/${projectId}.${logoExt}`;
    const bucket = sb.storage.from("qr-logos");

    const { error: upErr } = await bucket.upload(objectPath, logo, {
      contentType: logo.type,
      cacheControl: "3600",
    });

    if (upErr) {
      console.error("[qr create] logo upload error:", upErr);
      redirect(`/qr-studio/${projectId}?upload=error&reason=upload_failed`);
    }

    const { error: updErr } = await sb
      .from("qr_projects")
      .update({ logo_path: objectPath })
      .eq("id", projectId);

    if (updErr) {
      console.error("[qr create] logo_path update error:", updErr);
      redirect(`/qr-studio/${projectId}?upload=error&reason=logo_path_failed`);
    }

    redirect(`/qr-studio/${projectId}?upload=ok`);
  }

  redirect(`/qr-studio/${projectId}`);
}

export default async function NewQrProjectPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const sp = await searchParams;
  const errCode = first(sp, "error");
  const errMsg = errorMessage(errCode);

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio#pricing");

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">Create QR Project</h1>
            <p className="mt-2 text-sm text-white/70">
              Locked templates. Scanner-safe output. No design sliders.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/qr-studio/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to dashboard
            </Link>
          </div>
        </div>

        {errMsg ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errMsg}
          </div>
        ) : null}

        {/* Layout */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Form card */}
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Project details</div>
            <div className="mt-1 text-xs text-white/60">
              You can edit a project once (lifetime). After that, it locks.
            </div>

            <form
              action={createProject}
              encType="multipart/form-data"
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Business name
                </label>
                <input
                  name="business_name"
                  required
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                  placeholder="Maxgen Systems Ltd"
                  autoComplete="organization"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">URL</label>
                <input
                  name="url"
                  required
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                  placeholder="https://maxgensys.com"
                  autoComplete="url"
                />
                <div className="mt-2 text-xs text-white/60">
                  If you enter a domain without https://, it will normalize to
                  https:// automatically.
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Template
                </label>
                <select
                  name="template_id"
                  defaultValue="T1"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="T1">T1 — Clean (QR only)</option>
                  <option value="T2">T2 — Clean + label (name/tagline)</option>
                  <option value="T3">T3 — Scan-max (no logo)</option>
                </select>
                <div className="mt-2 text-xs text-white/60">
                  Templates are locked: no custom shapes, colors, analytics, or
                  redirects. T3 does not allow logos.
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Tagline (optional)
                </label>
                <input
                  name="tagline"
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                  placeholder="Modern. Global. Systems."
                />
                <div className="mt-2 text-xs text-white/60">
                  Tagline is displayed in{" "}
                  <span className="text-white/80">T2</span> only. T1/T3 do not
                  render text.
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Logo (optional)
                </label>
                <input
                  name="logo"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="mt-2 w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                />
                <div className="mt-2 text-xs text-white/60">
                  Recommended: square PNG with padding. For best scan
                  reliability, keep it simple. (Not allowed on T3.)
                </div>
              </div>

              {/* Mandatory legal consent */}
              <div className="md:col-span-2 rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="text-xs font-semibold text-white">
                  Legal acceptance (required)
                </div>
                <label className="mt-3 flex items-start gap-3 text-sm text-white/70">
                  <input
                    name="legal_accept"
                    type="checkbox"
                    required
                    className="mt-1 h-4 w-4 accent-[#2563EB]"
                  />
                  <span className="leading-6">
                    I’ve read the{" "}
                    <Link
                      href="/qr-studio#terms"
                      className="underline text-white/80 hover:text-white"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Terms
                    </Link>{" "}
                    and I accept the{" "}
                    <Link
                      href="/qr-studio#privacy"
                      className="underline text-white/80 hover:text-white"
                      target="_blank"
                      rel="noreferrer"
                    >
                      Privacy Policy
                    </Link>
                    .
                  </span>
                </label>
                <div className="mt-2 text-xs text-white/60">
                  This consent is required to create a QR project.
                </div>
              </div>

              <div className="md:col-span-2 flex items-center justify-end gap-3 pt-2">
                <Link
                  href="/qr-studio/dashboard"
                  className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
                >
                  Cancel
                </Link>
                <button className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                  Create project
                </button>
              </div>
            </form>
          </section>

          {/* Rules side card */}
          <aside className="rounded-2xl border border-white/10 bg-black/30 p-6">
            <div className="text-sm font-semibold">Rules (clear)</div>
            <ul className="mt-3 space-y-2 text-sm text-white/70">
              <li>
                <span className="font-semibold text-white">Static only:</span>{" "}
                no redirects, no analytics, no tracking.
              </li>
              <li>
                <span className="font-semibold text-white">Safety:</span> ECC H
                + enforced quiet zone.
              </li>
              <li>
                <span className="font-semibold text-white">Logos:</span> allowed
                on T1/T2 only (≤22%). Not allowed on T3.
              </li>
              <li>
                <span className="font-semibold text-white">Edit limit:</span> 1
                edit per project (lifetime), then locked.
              </li>
              <li>
                <span className="font-semibold text-white">Delete:</span>{" "}
                allowed, does not restore allowance.
              </li>
              <li>
                <span className="font-semibold text-white">Export:</span> PNG
                1024×1024 + clean SVG.
              </li>
            </ul>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/5 p-4">
              <div className="text-sm font-semibold">Tip</div>
              <div className="mt-2 text-sm text-white/70">
                For maximum trust, use your official business name and a short,
                readable link (homepage or booking page).
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs text-white/60">Legal</div>
              <div className="mt-2 flex flex-wrap gap-3 text-sm">
                <Link
                  href="/qr-studio#privacy"
                  className="text-white/70 hover:text-white underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Privacy
                </Link>
                <Link
                  href="/qr-studio#terms"
                  className="text-white/70 hover:text-white underline"
                  target="_blank"
                  rel="noreferrer"
                >
                  Terms
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
