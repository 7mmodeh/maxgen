// src/lib/qr/print-pack.ts
import crypto from "crypto";
import { supabaseServer } from "@/src/lib/supabase/server";
import { renderPrintPackPdfs, type PrintPackSpec, type PrintPackFormat } from "@/src/lib/qr/print-render";
import type { QrProjectRow } from "@/src/lib/qr/render";

export type PrintPackManifestFile = {
  filename: string;
  path: string;
  bytes: number;
};

export type PrintPackManifest = Record<string, PrintPackManifestFile>;

export type PrintPackAssetRow = {
  id: string;
  user_id: string;
  project_id: string;
  generation_hash: string;
  spec: unknown;
  files: unknown;
  created_at?: string;
  updated_at?: string;
};

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function stableStringify(v: unknown): string {
  if (Array.isArray(v)) return `[${v.map(stableStringify).join(",")}]`;
  if (isRecord(v)) {
    const keys = Object.keys(v).sort();
    return `{${keys.map((k) => JSON.stringify(k) + ":" + stableStringify(v[k])).join(",")}}`;
  }
  return JSON.stringify(v);
}

export function normalizeSpec(input: PrintPackSpec, project: QrProjectRow): PrintPackSpec {
  const formats = (input.formats ?? []).filter(Boolean) as PrintPackFormat[];

  return {
    project_id: input.project_id,
    formats: formats.length ? Array.from(new Set(formats)) : ["business_card"],

    brand_name: (input.brand_name ?? project.business_name).trim(),
    person_name: (input.person_name ?? "").trim() || undefined,
    title: (input.title ?? "").trim() || undefined,
    phone: (input.phone ?? "").trim() || undefined,
    email: (input.email ?? "").trim() || undefined,
    website: (input.website ?? project.url).trim(),
    address: (input.address ?? "").trim() || undefined,

    theme: input.theme === "light" ? "light" : "dark",
    accent: "blue",
  };
}

export function generationHash(args: { projectId: string; spec: PrintPackSpec; templateVersion: number }): string {
  const payload = {
    project_id: args.projectId,
    template_version: args.templateVersion,
    spec: args.spec,
  };
  const s = stableStringify(payload);
  return crypto.createHash("sha256").update(s).digest("hex").slice(0, 32);
}

function storagePath(args: {
  userId: string;
  projectId: string;
  generationHash: string;
  filename: string;
}): string {
  return `print-pack/${args.userId}/${args.projectId}/${args.generationHash}/${args.filename}`;
}

export async function loadProjectOwned(projectId: string, userId: string): Promise<QrProjectRow | null> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) {
    console.error("[print-pack] loadProject error:", error);
    return null;
  }
  if (!data || data.user_id !== userId) return null;
  return data as QrProjectRow;
}

export async function getLatestAssetForProject(args: { projectId: string; userId: string }): Promise<PrintPackAssetRow | null> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("qr_print_pack_assets")
    .select("*")
    .eq("project_id", args.projectId)
    .eq("user_id", args.userId)
    .order("updated_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error("[print-pack] latest asset error:", error);
    return null;
  }
  return (data as PrintPackAssetRow) ?? null;
}

export async function getAssetById(args: { assetId: string; userId: string }): Promise<PrintPackAssetRow | null> {
  const sb = await supabaseServer();
  const { data, error } = await sb
    .from("qr_print_pack_assets")
    .select("*")
    .eq("id", args.assetId)
    .eq("user_id", args.userId)
    .maybeSingle();

  if (error) {
    console.error("[print-pack] get asset error:", error);
    return null;
  }
  return (data as PrintPackAssetRow) ?? null;
}

export async function ensureGeneratedAssets(args: {
  userId: string;
  project: QrProjectRow;
  spec: PrintPackSpec;
}): Promise<{ assetId: string; generationHash: string; files: PrintPackManifest }> {
  const sb = await supabaseServer();

  const norm = normalizeSpec(args.spec, args.project);
  const gh = generationHash({
    projectId: args.project.id,
    spec: norm,
    templateVersion: args.project.template_version,
  });

  // if exists by generation_hash, return it
  {
    const { data, error } = await sb
      .from("qr_print_pack_assets")
      .select("*")
      .eq("user_id", args.userId)
      .eq("project_id", args.project.id)
      .eq("generation_hash", gh)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error("[print-pack] lookup existing error:", error);
    } else if (data) {
      const row = data as PrintPackAssetRow;
      const files = (isRecord(row.files) ? row.files : {}) as PrintPackManifest;
      return { assetId: row.id, generationHash: gh, files };
    }
  }

  // render PDFs
  const rendered = await renderPrintPackPdfs(args.project, norm);

  // upload + build manifest
  const manifest: PrintPackManifest = {};
  for (const file of rendered) {
    const path = storagePath({
      userId: args.userId,
      projectId: args.project.id,
      generationHash: gh,
      filename: file.filename,
    });

    const { error: upErr } = await sb.storage
      .from("qr-print-pack")
      .upload(path, file.bytes, {
        contentType: "application/pdf",
        upsert: true,
        cacheControl: "3600",
      });

    if (upErr) {
      console.error("[print-pack] storage upload error:", upErr);
      throw new Error("storage_upload_failed");
    }

    manifest[file.key] = { filename: file.filename, path, bytes: file.bytes.byteLength };
  }

  // persist DB row
  const now = new Date().toISOString();
  const payload = {
    user_id: args.userId,
    project_id: args.project.id,
    generation_hash: gh,
    spec: norm as unknown,
    files: manifest as unknown,
    updated_at: now,
  };

  // We don’t assume an ON CONFLICT constraint name; insert then fallback to update.
  const ins = await sb.from("qr_print_pack_assets").insert(payload).select("id").maybeSingle();
  if (!ins.error && ins.data?.id) {
    return { assetId: String(ins.data.id), generationHash: gh, files: manifest };
  }

  // fallback: try update existing by (user_id, project_id, generation_hash) if insert failed due to unique constraint
  if (ins.error) {
    console.warn("[print-pack] insert failed, trying update:", ins.error);
  }

  const upd = await sb
    .from("qr_print_pack_assets")
    .update({ files: manifest as unknown, spec: norm as unknown, updated_at: now })
    .eq("user_id", args.userId)
    .eq("project_id", args.project.id)
    .eq("generation_hash", gh)
    .select("id")
    .maybeSingle();

  if (upd.error || !upd.data?.id) {
    console.error("[print-pack] upsert fallback failed:", upd.error);
    throw new Error("db_upsert_failed");
  }

  return { assetId: String(upd.data.id), generationHash: gh, files: manifest };
}
