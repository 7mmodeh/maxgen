// src/lib/qr/entitlement.ts
import { supabaseServer } from "@/src/lib/supabase/server";

export type QrStudioPlan = "monthly" | "onetime";

export async function requireUser() {
  const sb = await supabaseServer();
  const { data, error } = await sb.auth.getUser();
  if (error || !data.user) return { user: null, supabase: sb };
  return { user: data.user, supabase: sb };
}

async function hasEntitlement(args: {
  userId: string;
  productKey: "qr_studio" | "qr_print_pack";
}): Promise<boolean> {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("entitlements")
    .select("id")
    .eq("user_id", args.userId)
    .eq("product_key", args.productKey)
    .eq("status", "active")
    .limit(1);

  if (error) {
    console.error("[qr entitlement] check failed:", error);
    return false;
  }
  return (data?.length ?? 0) > 0;
}

export async function hasQrStudioEntitlement(userId: string): Promise<boolean> {
  return hasEntitlement({ userId, productKey: "qr_studio" });
}

export async function hasQrPrintPackEntitlement(userId: string): Promise<boolean> {
  return hasEntitlement({ userId, productKey: "qr_print_pack" });
}

export async function hasQrStudioAndPrintPack(userId: string): Promise<boolean> {
  const [a, b] = await Promise.all([
    hasQrStudioEntitlement(userId),
    hasQrPrintPackEntitlement(userId),
  ]);
  return a && b;
}

export async function getQrStudioPlan(userId: string): Promise<QrStudioPlan | null> {
  const sb = await supabaseServer();

  const { data, error } = await sb
    .from("entitlements")
    .select("plan")
    .eq("user_id", userId)
    .eq("product_key", "qr_studio")
    .eq("status", "active")
    .order("plan", { ascending: true })
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
