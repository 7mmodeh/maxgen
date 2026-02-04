import { supabaseServer } from "@/src/lib/supabase/server";

export type QrStudioPlan = "monthly" | "onetime";

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
    .select("id")
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

export async function getQrStudioPlan(userId: string): Promise<QrStudioPlan | null> {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("entitlements")
    .select("plan")
    .eq("user_id", userId)
    .eq("product_key", "qr_studio")
    .eq("status", "active")
    // Prefer monthly if both exist
    .order("plan", { ascending: true }) // "monthly" vs "onetime" ordering is not guaranteed
    .limit(10);

  if (error) {
    console.error("[qr entitlement] plan lookup failed:", error);
    return null;
  }

  const plans = (data ?? []).map((r) => String((r as { plan?: unknown }).plan ?? ""));

  if (plans.includes("monthly")) return "monthly";
  if (plans.includes("onetime")) return "onetime";
  return null;
}
