// app/qr-studio/[id]/print-pack/page.tsx

import Link from "next/link";
import { redirect } from "next/navigation";
import { supabaseServer } from "@/src/lib/supabase/server";
import {
  hasQrStudioEntitlement,
  hasQrPrintPackEntitlement,
} from "@/src/lib/qr/entitlement";
import {
  DEFAULT_PRINT_PACK_PAYLOAD,
  coercePrintPackPayload,
  isPrintTemplateId,
  type PrintTemplateId,
  type PrintPackPayload,
} from "@/src/lib/qr/print-pack-v2";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

type PrintPackRow = {
  project_id: string;
  user_id: string;
  print_template_id: string;
  payload: unknown;
  print_logo_path: string | null;
  created_at: string;
  updated_at: string;
};

async function savePrintPack(projectId: string, formData: FormData) {
  "use server";

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const entitledStudio = await hasQrStudioEntitlement(user.id);
  if (!entitledStudio) redirect("/qr-studio#pricing");

  const entitledPrint = await hasQrPrintPackEntitlement(user.id);
  if (!entitledPrint) redirect(`/qr-studio/${projectId}`);

  // Ownership check (RLS should enforce too; we want clean redirects)
  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("id,user_id")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr || !proj || proj.user_id !== user.id)
    redirect("/qr-studio/dashboard");

  const templateRaw = String(formData.get("print_template_id") ?? "").trim();
  if (!isPrintTemplateId(templateRaw)) {
    redirect(`/qr-studio/${projectId}/print-pack?error=invalid_template`);
  }

  const payload: PrintPackPayload = {
    business_name: String(formData.get("business_name") ?? "").trim(),
    role: String(formData.get("role") ?? "").trim(),
    phone: String(formData.get("phone") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    address: String(formData.get("address") ?? "").trim(),
    website: String(formData.get("website") ?? "").trim(),
    socials: String(formData.get("socials") ?? "").trim(),
  };

  const { error } = await sb.from("qr_print_pack_projects").upsert(
    {
      project_id: projectId,
      user_id: user.id,
      print_template_id: templateRaw,
      payload,
    },
    { onConflict: "project_id" },
  );

  if (error) {
    console.error("[print pack] upsert error:", error);
    redirect(`/qr-studio/${projectId}/print-pack?error=save_failed`);
  }

  redirect(`/qr-studio/${projectId}/print-pack?saved=ok`);
}

function errorMessage(code: string | null): string | null {
  switch (code) {
    case "invalid_template":
      return "Invalid print template. Choose Card, Flyer, Poster, or Label.";
    case "save_failed":
      return "Save failed. Please try again.";
    default:
      return null;
  }
}

export default async function PrintPackPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id: projectId } = await params;
  const sp = await searchParams;

  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;
  if (!user) redirect("/login");

  const entitledStudio = await hasQrStudioEntitlement(user.id);
  if (!entitledStudio) redirect("/qr-studio#pricing");

  const entitledPrint = await hasQrPrintPackEntitlement(user.id);
  if (!entitledPrint) redirect(`/qr-studio/${projectId}`);

  const { data: proj, error: projErr } = await sb
    .from("qr_projects")
    .select("id,user_id,business_name,url")
    .eq("id", projectId)
    .maybeSingle();

  if (projErr || !proj || proj.user_id !== user.id)
    redirect("/qr-studio/dashboard");

  const { data: pp } = await sb
    .from("qr_print_pack_projects")
    .select("*")
    .eq("project_id", projectId)
    .maybeSingle();

  const row = (pp as PrintPackRow | null) ?? null;

  const selectedTemplate: PrintTemplateId =
    row && isPrintTemplateId(row.print_template_id)
      ? row.print_template_id
      : "card";

  const payload = row
    ? coercePrintPackPayload(row.payload)
    : { ...DEFAULT_PRINT_PACK_PAYLOAD };
  const printLogoPath = row?.print_logo_path ?? null;

  const saved =
    typeof sp.saved === "string"
      ? sp.saved
      : Array.isArray(sp.saved)
        ? sp.saved[0]
        : null;
  const err =
    typeof sp.error === "string"
      ? sp.error
      : Array.isArray(sp.error)
        ? sp.error[0]
        : null;

  const errMsg = errorMessage(err);

  return (
    <main className="min-h-screen bg-[#0B1220] text-white">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="min-w-0">
            <div className="text-xs text-white/60">Maxgen QR Studio</div>
            <h1 className="mt-1 text-2xl font-semibold">
              Print Pack (Premium)
            </h1>
            <div className="mt-2 text-sm text-white/70 break-all">
              Project: {proj.business_name} · {proj.url}
            </div>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              href={`/qr-studio/${projectId}`}
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Back to Project
            </Link>
            <Link
              href="/qr-studio/dashboard"
              className="rounded-md border border-white/15 bg-white/5 px-4 py-2 text-sm font-medium hover:bg-white/10"
            >
              Dashboard
            </Link>
          </div>
        </div>

        <div className="mt-6 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
          Print Pack access is active for your account.
        </div>

        {saved === "ok" ? (
          <div className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 p-4 text-sm text-emerald-100">
            Saved.
          </div>
        ) : null}

        {errMsg ? (
          <div className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 p-4 text-sm text-rose-100">
            {errMsg}
          </div>
        ) : null}

        <div className="mt-8 grid gap-6 lg:grid-cols-5">
          <section className="lg:col-span-3 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Printable form (locked)</div>
            <div className="mt-1 text-xs text-white/60">
              Choose template + fill business info. No fonts/colors/design
              controls.
            </div>

            <form
              action={savePrintPack.bind(null, projectId)}
              className="mt-6 grid gap-4 md:grid-cols-2"
            >
              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Print template
                </label>
                <select
                  name="print_template_id"
                  defaultValue={selectedTemplate}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                >
                  <option value="card">Card</option>
                  <option value="flyer">Flyer</option>
                  <option value="poster">Poster</option>
                  <option value="label">Label</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Business name
                </label>
                <input
                  name="business_name"
                  defaultValue={payload.business_name}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Maxgen Systems Ltd"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70">
                  Role
                </label>
                <input
                  name="role"
                  defaultValue={payload.role}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Director / Owner"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70">
                  Phone
                </label>
                <input
                  name="phone"
                  defaultValue={payload.phone}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="+353 ..."
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70">
                  Email
                </label>
                <input
                  name="email"
                  defaultValue={payload.email}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="hello@maxgensys.com"
                />
              </div>

              <div>
                <label className="text-xs font-medium text-white/70">
                  Website
                </label>
                <input
                  name="website"
                  defaultValue={payload.website}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="https://maxgensys.com"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Address
                </label>
                <input
                  name="address"
                  defaultValue={payload.address}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="Dublin, Ireland"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-xs font-medium text-white/70">
                  Socials (single line)
                </label>
                <input
                  name="socials"
                  defaultValue={payload.socials}
                  className="mt-2 w-full rounded-md border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-white/25"
                  placeholder="LinkedIn: ... | IG: ..."
                />
              </div>

              <div className="md:col-span-2 flex justify-end">
                <button className="rounded-md bg-[#2563EB] px-4 py-2 text-sm font-semibold text-white hover:opacity-95">
                  Save
                </button>
              </div>
            </form>

            <div className="mt-8 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-sm font-semibold">Print logo (optional)</div>
              <div className="mt-1 text-xs text-white/60">
                Stored in private bucket{" "}
                <span className="font-mono">qr-logos</span>.
              </div>

              <form
                className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center"
                action="/api/qr/print-pack/logo"
                method="post"
                encType="multipart/form-data"
              >
                <input type="hidden" name="project_id" value={projectId} />
                <input
                  name="file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/svg+xml"
                  className="w-full text-sm text-white/80 file:mr-3 file:rounded-md file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-white hover:file:bg-white/15"
                  required
                />
                <button className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-black hover:opacity-95">
                  Upload
                </button>
              </form>

              {printLogoPath ? (
                <div className="mt-3 text-xs text-white/60">
                  Stored at:{" "}
                  <span className="font-mono text-white/80">
                    {printLogoPath}
                  </span>
                </div>
              ) : (
                <div className="mt-3 text-xs text-white/60">
                  No print logo uploaded.
                </div>
              )}
            </div>
          </section>

          <aside className="lg:col-span-2 rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold">Generate output</div>
            <div className="mt-2 text-xs text-white/60">
              Generates a locked print-ready PDF using:
              <ul className="mt-2 list-disc pl-5 space-y-1">
                <li>Template size + safe margins</li>
                <li>QR from your project</li>
                <li>Optional print logo (if uploaded)</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3">
              <a
                className="rounded-md bg-amber-300 px-4 py-2 text-sm font-semibold text-black hover:opacity-95"
                href={`/api/qr/print-pack/generate?project_id=${encodeURIComponent(projectId)}`}
              >
                Download PDF
              </a>

              <div className="rounded-xl border border-white/10 bg-black/20 p-4 text-xs text-white/70">
                Tip: Save first, then generate. The generator uses the latest
                saved data.
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
