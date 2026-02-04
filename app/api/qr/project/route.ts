import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

function bad(msg: string, status = 400) {
  return NextResponse.json({ error: msg }, { status });
}

export async function DELETE(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get("id");
  if (!id) return bad("Missing id", 400);

  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  const user = data.user;

  if (error || !user) return bad("Unauthorized", 401);

  // Fetch project for ownership + helpful errors (RLS also enforced)
  const { data: proj, error: selErr } = await sb
    .from("qr_projects")
    .select("id,user_id")
    .eq("id", id)
    .maybeSingle();

  if (selErr) {
    console.error("[qr delete] select error:", selErr);
    return bad("Failed to load project", 500);
  }

  if (!proj) return bad("Not found", 404);
  if (proj.user_id !== user.id) return bad("Forbidden", 403);

  const { error: delErr } = await sb.from("qr_projects").delete().eq("id", id);

  if (delErr) {
    console.error("[qr delete] delete error:", delErr);
    return bad("Delete failed", 500);
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
