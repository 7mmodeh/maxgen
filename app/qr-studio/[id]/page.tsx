// app/qr-studio/[id]/page.tsx
import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
import { generateQrSvg, type QrProjectRow } from "@/src/lib/qr/render";
import { isTemplateId, TEMPLATES_V1 } from "@/src/lib/qr/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function updateProject(id: string, formData: FormData) {
  "use server";

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio#pricing");

  const business_name = String(formData.get("business_name") ?? "").trim();
  const url = String(formData.get("url") ?? "").trim();
  const template_id = String(formData.get("template_id") ?? "").trim();
  const taglineRaw = String(formData.get("tagline") ?? "").trim();
  const tagline = taglineRaw.length ? taglineRaw : null;

  if (!business_name) throw new Error("Missing business_name");
  if (!url) throw new Error("Missing url");
  if (!isTemplateId(template_id)) throw new Error("Invalid template");

  const { error } = await sb
    .from("qr_projects")
    .update({ business_name, tagline, url, template_id })
    .eq("id", id);

  if (error) {
    console.error("[qr update] error:", error);
    throw new Error("Failed to update project");
  }

  redirect(`/qr-studio/${id}`);
}

export default async function QrProjectPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const sp = await searchParams;

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio#pricing");

  const { data: proj, error } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();
  if (error || !proj || proj.user_id !== user.id)
    redirect("/qr-studio/dashboard");

  const project = proj as QrProjectRow;
  const template = isTemplateId(project.template_id)
    ? TEMPLATES_V1[project.template_id]
    : null;

  // IMPORTANT: preview is small + responsive, not 1024px injected
  const svg = await generateQrSvg(project, { size: { width: 320 } });

  const uploadStatus = Array.isArray(sp.upload) ? sp.upload[0] : sp.upload;
  const uploadReason = Array.isArray(sp.reason) ? sp.reason[0] : sp.reason;

  const showOk = uploadStatus === "ok";
  const showErr = uploadStatus === "error";

  return (
    <main className="min-h-[calc(100vh-0px)] bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        {/* Header */}
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">
              {project.business_name}
            </h1>
            <div className="mt-2 text-sm text-white/70 break-all">
              {project.url}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href="/qr-studio/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to Dashboard
            </Link>

            <a
              className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95"
              href={`/api/qr/download?project_id=${project.id}&format=png`}
            >
              Download PNG (1024)
            </a>

            <a
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
              href={`/api/qr/download?project_id=${project.id}&format=svg`}
            >
              Download SVG
            </a>
          </div>
        </div>

        {/* Upload feedback */}
        {showOk ? (
          <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Logo uploaded successfully.
          </div>
        ) : null}

        {showErr ? (
          <div className="mt-6 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            Logo upload failed{uploadReason ? `: ${uploadReason}` : ""}.
          </div>
        ) : null}

        {/* Main grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          {/* Preview card */}
          <section className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold">Preview</div>
              <div className="text-xs text-white/60">
                {project.template_id} v{project.template_version}
              </div>
            </div>

            <div className="mt-5 rounded-xl bg-white p-4">
              <div
                className="mx-auto w-full max-w-[320px] [&>svg]:w-full [&>svg]:h-auto [&>svg]:block"
                dangerouslySetInnerHTML={{ __html: svg }}
              />
            </div>

            {template?.allowText ? (
              <div className="mt-4 text-center">
                <div className="text-sm font-semibold">
                  {project.business_name.slice(0, template.businessNameMax)}
                </div>
                {project.tagline ? (
                  <div className="mt-1 text-xs text-white/70">
                    {project.tagline.slice(0, template.taglineMax)}
                  </div>
                ) : null}
              </div>
            ) : (
              <div className="mt-4 text-xs text-white/60">
                T1/T3 do not render text.
              </div>
            )}

            <div className="mt-5 text-xs text-white/60">
              PNG includes logo overlay (T1/T2). SVG is clean QR only (v1).
            </div>
          </section>

          {/* Settings card */}
          <section className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Project settings</div>
            <div className="mt-1 text-xs text-white/60">
              Simple inputs. Locked templates. Scanner-safe output.
            </div>

            <form
              action={updateProject.bind(null, project.id)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Business name
                </label>
                <input
                  name="business_name"
                  required
                  defaultValue={project.business_name}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Tagline (optional)
                </label>
                <input
                  name="tagline"
                  defaultValue={project.tagline ?? ""}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                />
                {template?.allowText ? (
                  <div className="mt-2 text-xs text-white/60">
                    T2 limits: name {template.businessNameMax} chars, tagline{" "}
                    {template.taglineMax} chars.
                  </div>
                ) : null}
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">URL</label>
                <input
                  name="url"
                  required
                  defaultValue={project.url}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white placeholder:text-white/30 outline-none focus:border-white/25"
                />
                <div className="mt-2 text-xs text-white/60">
                  If you enter a domain without https://, it will normalize to
                  https:// in output.
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Template
                </label>
                <select
                  name="template_id"
                  defaultValue={project.template_id}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="T1">T1 — Clean</option>
                  <option value="T2">T2 — Clean + Label</option>
                  <option value="T3">T3 — Scan-max</option>
                </select>
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                  Save changes
                </button>
              </div>
            </form>

            {/* Logo upload */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-semibold">Logo</div>
                  <div className="mt-1 text-xs text-white/60">
                    Private storage. Limited to 22% for scan safety. (Not
                    allowed on T3.)
                  </div>
                </div>
              </div>

              {project.template_id === "T3" ? (
                <div className="mt-4 rounded-xl border border-amber-400/20 bg-amber-400/10 p-4 text-sm text-amber-100">
                  Template T3 is scan-max and does not allow logos.
                </div>
              ) : (
                <form
                  className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                  action="/api/qr/logo"
                  method="post"
                  encType="multipart/form-data"
                >
                  <input type="hidden" name="project_id" value={project.id} />
                  <input
                    name="file"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,image/svg+xml"
                    className="w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                    required
                  />
                  <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-95">
                    Upload logo
                  </button>
                </form>
              )}

              {project.logo_path ? (
                <div className="mt-3 text-xs text-white/60">
                  Stored at:{" "}
                  <span className="font-mono text-white/80">
                    {project.logo_path}
                  </span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-white/60">
                  No logo uploaded yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}
