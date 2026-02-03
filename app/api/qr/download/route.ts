// app/api/qr/download/route.ts
import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";
import { requireUser, hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
import {
  generateQrPng,
  generateQrSvg,
  type QrProjectRow,
} from "@/src/lib/qr/render";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

function bufferToArrayBuffer(buf: Buffer): ArrayBuffer {
  // Force a real ArrayBuffer (not SharedArrayBuffer) for strict TS setups.
  const ab = new ArrayBuffer(buf.byteLength);
  new Uint8Array(ab).set(buf);
  return ab;
}

export async function GET(req: Request) {
  const { user } = await requireUser();
  if (!user) return bad("Unauthorized", 401);

  const entitled = await hasQrStudioEntitlement(user.id);
  if (!entitled) return bad("Forbidden", 403);

  const url = new URL(req.url);
  const projectId = (url.searchParams.get("project_id") ?? "").trim();
  const format = (url.searchParams.get("format") ?? "").trim(); // png | svg

  if (!projectId) return bad("Missing project_id");
  if (format !== "png" && format !== "svg") return bad("Invalid format");

  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("qr_projects")
    .select("*")
    .eq("id", projectId)
    .maybeSingle();

  if (error) return bad("Failed to load project", 500);
  if (!data || data.user_id !== user.id) return bad("Not found", 404);

  const project = data as QrProjectRow;

  if (format === "svg") {
    const svg = await generateQrSvg(project);

    return new Response(svg, {
      status: 200,
      headers: {
        "Content-Type": "image/svg+xml; charset=utf-8",
        "Content-Disposition": `attachment; filename="qr-${project.id}.svg"`,
        "Cache-Control": "no-store",
      },
    });
  }

  const pngBuf = await generateQrPng(project);
  const ab = bufferToArrayBuffer(pngBuf);

  return new Response(ab, {
    status: 200,
    headers: {
      "Content-Type": "image/png",
      "Content-Disposition": `attachment; filename="qr-${project.id}.png"`,
      "Cache-Control": "no-store",
    },
  });
}
