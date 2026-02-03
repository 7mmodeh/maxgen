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
  if (!entitled) redirect("/qr-studio");

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio");

  const { data: proj, error } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    console.error("[qr project] load error:", error);
    redirect("/qr-studio");
  }

  if (!proj || proj.user_id !== user.id) redirect("/qr-studio");

  const project = proj as QrProjectRow;
  const template = isTemplateId(project.template_id)
    ? TEMPLATES_V1[project.template_id]
    : null;

  const svg = await generateQrSvg(project);

  return (
    <main className="mx-auto w-full max-w-5xl px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">{project.business_name}</h1>
          <p className="mt-2 text-sm text-neutral-600">{project.url}</p>
        </div>
        <Link
          href="/qr-studio"
          className="text-sm text-neutral-600 hover:underline"
        >
          Back
        </Link>
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        {/* Preview */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Preview</h2>
          <div className="mt-4 flex flex-col items-center">
            <div
              className="w-[280px] rounded-md border border-neutral-200 bg-white p-3"
              // SVG comes from our server generator
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {template?.allowText ? (
              <div className="mt-3 w-[280px] text-center">
                <div className="text-sm font-semibold">
                  {project.business_name.slice(0, template.businessNameMax)}
                </div>
                {project.tagline ? (
                  <div className="mt-1 text-xs text-neutral-600">
                    {project.tagline.slice(0, template.taglineMax)}
                  </div>
                ) : null}
              </div>
            ) : null}
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            <a
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
              href={`/api/qr/download?project_id=${project.id}&format=png`}
            >
              Download PNG (1024)
            </a>
            <a
              className="rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900"
              href={`/api/qr/download?project_id=${project.id}&format=svg`}
            >
              Download SVG
            </a>
          </div>

          <p className="mt-3 text-xs text-neutral-500">
            PNG includes logo overlay (if uploaded and template allows). SVG is
            clean QR only (v1).
          </p>
        </section>

        {/* Edit + Logo */}
        <section className="rounded-xl border border-neutral-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Project settings</h2>

          <form
            action={updateProject.bind(null, project.id)}
            className="mt-4 space-y-4"
          >
            <div>
              <label className="text-sm font-medium">Business name</label>
              <input
                name="business_name"
                required
                defaultValue={project.business_name}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Tagline (optional)</label>
              <input
                name="tagline"
                defaultValue={project.tagline ?? ""}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
              {template?.allowText ? (
                <p className="mt-1 text-xs text-neutral-500">
                  T2 limits: name {template.businessNameMax} chars, tagline{" "}
                  {template.taglineMax} chars.
                </p>
              ) : (
                <p className="mt-1 text-xs text-neutral-500">
                  T1/T3 don’t render text.
                </p>
              )}
            </div>

            <div>
              <label className="text-sm font-medium">URL</label>
              <input
                name="url"
                required
                defaultValue={project.url}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Template</label>
              <select
                name="template_id"
                defaultValue={project.template_id}
                className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
              >
                <option value="T1">T1 — Clean</option>
                <option value="T2">T2 — Clean + Label</option>
                <option value="T3">T3 — Scan-max</option>
              </select>
            </div>

            <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
              Save changes
            </button>
          </form>

          <div className="mt-8 border-t border-neutral-200 pt-6">
            <h3 className="text-sm font-semibold">Logo upload</h3>
            <p className="mt-1 text-xs text-neutral-500">
              Logos are stored privately in Supabase Storage (qr-logos). Only
              your account can access your files.
            </p>

            {project.template_id === "T3" ? (
              <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                T3 doesn’t allow logos (scan-max).
              </div>
            ) : (
              <form
                className="mt-3 flex flex-col gap-2"
                action="/api/qr/logo"
                method="post"
                encType="multipart/form-data"
              >
                <input type="hidden" name="project_id" value={project.id} />
                <input
                  name="file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="text-sm"
                  required
                />
                <button className="w-fit rounded-md border border-neutral-300 bg-white px-4 py-2 text-sm font-medium text-neutral-900">
                  Upload logo
                </button>
              </form>
            )}

            {project.logo_path ? (
              <p className="mt-3 text-xs text-neutral-500">
                Stored at:{" "}
                <span className="font-mono">{project.logo_path}</span>
              </p>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}
