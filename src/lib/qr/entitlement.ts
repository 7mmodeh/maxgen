// src/lib/qr/entitlement.ts
import { supabaseServer } from "@/src/lib/supabase/server";

export async function requireUser() {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return { user: null, supabase: sb };
  return { user: data.user, supabase: sb };
}

export async function hasQrStudioEntitlement(userId: string): Promise<boolean> {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("entitlements")
    .select("status")
    .eq("user_id", userId)
    .eq("product_key", "qr_studio")
    .eq("status", "active")
    .limit(1);

  if (error) {
    console.error("[qr entitlement] check failed:", error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}
