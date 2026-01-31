import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const supabase = await supabaseServer();
  await supabase.auth.signOut();
  return NextResponse.redirect(new URL("/", url.origin));
}
