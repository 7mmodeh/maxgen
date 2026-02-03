// app/qr-studio/new/page.tsx
import { redirect } from "next/navigation";
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
import { TEMPLATE_VERSION_V1 } from "@/src/lib/qr/templates";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function createProject(formData: FormData) {
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
  if (!["T1", "T2", "T3"].includes(template_id))
    throw new Error("Invalid template");

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

  if (error) {
    console.error("[qr create] error:", error);
    throw new Error("Failed to create project");
  }

  redirect(`/qr-studio/${created.id}`);
}

export default async function NewQrProjectPage() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user;

  if (!user) redirect("/login");

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) redirect("/qr-studio");

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-10">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Create QR Project</h1>
        <Link
          href="/qr-studio"
          className="text-sm text-neutral-600 hover:underline"
        >
          Back
        </Link>
      </div>

      <form
        action={createProject}
        className="mt-6 space-y-4 rounded-xl border border-neutral-200 bg-white p-6"
      >
        <div>
          <label className="text-sm font-medium">Business name</label>
          <input
            name="business_name"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Maxgen Systems Ltd"
          />
        </div>

        <div>
          <label className="text-sm font-medium">Tagline (optional)</label>
          <input
            name="tagline"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="Modern. Global. Systems."
          />
        </div>

        <div>
          <label className="text-sm font-medium">URL</label>
          <input
            name="url"
            required
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
            placeholder="https://maxgensys.com"
          />
          <p className="mt-1 text-xs text-neutral-500">
            If you enter a domain without https://, the renderer will normalize
            to https:// for safety.
          </p>
        </div>

        <div>
          <label className="text-sm font-medium">Template</label>
          <select
            name="template_id"
            defaultValue="T1"
            className="mt-1 w-full rounded-md border border-neutral-300 px-3 py-2 text-sm"
          >
            <option value="T1">T1 — Clean</option>
            <option value="T2">T2 — Clean + Label</option>
            <option value="T3">T3 — Scan-max</option>
          </select>
        </div>

        <button className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white">
          Create
        </button>
      </form>
    </main>
  );
}
