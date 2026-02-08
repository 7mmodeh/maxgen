import { NextResponse } from "next/server";
import { supabaseServer } from "@/src/lib/supabase/server";
import { getSupabaseAdmin } from "@/src/lib/supabase-admin";

export const runtime = "nodejs";

type UserRole = "user" | "b2b_pending" | "b2b_approved" | "admin";
type BusinessLine = "company" | "qr_studio" | "supplies";

type ProfileRow = { user_id: string; email: string | null; role: UserRole };

function isAdmin(role: unknown): role is "admin" {
  return role === "admin";
}

function parseTextArray(v: unknown): string[] {
  if (!Array.isArray(v)) return [];
  const out: string[] = [];
  for (const x of v) {
    if (typeof x === "string") {
      const t = x.trim();
      if (t) out.push(t);
    }
  }
  return out;
}

function assertBusinessLine(v: unknown): BusinessLine | null {
  if (v === "company" || v === "qr_studio" || v === "supplies") return v;
  return null;
}

function isIsoDay(v: unknown): v is string {
  if (typeof v !== "string") return false;
  return /^\d{4}-\d{2}-\d{2}$/.test(v);
}

/**
 * Important:
 * ops_manual_sales.day appears to be GENERATED ALWAYS (derived from sale_at).
 * Therefore we must NOT insert day, only sale_at.
 *
 * We still accept `day` from the client and encode it into sale_at (midday UTC)
 * so that the derived local date remains stable.
 */
function saleAtFromDay(day: string): string {
  // Midday UTC minimizes DST/date-boundary surprises.
  return `${day}T12:00:00.000Z`;
}

export async function POST(req: Request) {
  const supabase = await supabaseServer();
  const { data: u } = await supabase.auth.getUser();
  const user = u.user;

  if (!user) {
    return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
  }

  const admin = getSupabaseAdmin();

  const meRes = await admin
    .from("profiles")
    .select("user_id,email,role")
    .eq("user_id", user.id)
    .maybeSingle();

  const me = meRes.data as ProfileRow | null;
  if (meRes.error || !me || !isAdmin(me.role)) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  const body: unknown = await req.json();

  const day =
    typeof body === "object" && body && "day" in body
      ? (body as { day: unknown }).day
      : null;

  const businessLineRaw =
    typeof body === "object" && body && "business_line" in body
      ? (body as { business_line: unknown }).business_line
      : null;

  const bankAccountId =
    typeof body === "object" && body && "bank_account_id" in body
      ? (body as { bank_account_id: unknown }).bank_account_id
      : null;

  const currencyRaw =
    typeof body === "object" && body && "currency" in body
      ? (body as { currency: unknown }).currency
      : null;

  const amountCentsRaw =
    typeof body === "object" && body && "amount_cents" in body
      ? (body as { amount_cents: unknown }).amount_cents
      : null;

  const paymentMethodRaw =
    typeof body === "object" && body && "payment_method" in body
      ? (body as { payment_method: unknown }).payment_method
      : null;

  const notesRaw =
    typeof body === "object" && body && "notes" in body
      ? (body as { notes: unknown }).notes
      : null;

  const tagsRaw =
    typeof body === "object" && body && "tags" in body
      ? (body as { tags: unknown }).tags
      : null;

  if (!isIsoDay(day)) {
    return NextResponse.json({ error: "Invalid day" }, { status: 400 });
  }

  const business_line = assertBusinessLine(businessLineRaw);
  if (!business_line) {
    return NextResponse.json(
      { error: "Invalid business_line" },
      { status: 400 },
    );
  }

  if (typeof bankAccountId !== "string" || !bankAccountId) {
    return NextResponse.json(
      { error: "Invalid bank_account_id" },
      { status: 400 },
    );
  }

  const currency =
    typeof currencyRaw === "string" && currencyRaw.trim()
      ? currencyRaw.trim().toLowerCase()
      : "unknown";

  const amount_cents =
    typeof amountCentsRaw === "number"
      ? Math.trunc(amountCentsRaw)
      : typeof amountCentsRaw === "string"
        ? Math.trunc(Number(amountCentsRaw))
        : 0;

  if (!Number.isFinite(amount_cents) || amount_cents <= 0) {
    return NextResponse.json(
      { error: "amount_cents must be > 0" },
      { status: 400 },
    );
  }

  const payment_method =
    typeof paymentMethodRaw === "string" && paymentMethodRaw.trim()
      ? paymentMethodRaw.trim()
      : "cash";

  const notes = typeof notesRaw === "string" ? notesRaw : "";
  const tags = parseTextArray(tagsRaw);

  const idempotencyKey = req.headers.get("x-idempotency-key");
  const related_entity_type = "manual_sale";
  const related_entity_id =
    typeof idempotencyKey === "string" && idempotencyKey.trim()
      ? `manual_sale:${idempotencyKey.trim()}`
      : null;

  // 1) Ledger entry (append-only)
  const amount = (amount_cents / 100).toFixed(2);

  const ledgerInsert = await admin
    .from("ops_ledger_entries")
    .insert({
      effective_date: day, // ledger uses the admin-selected day
      bank_account_id: bankAccountId,
      amount,
      entry_type: "customer_payment",
      category: "general",
      business_line,
      counterparty: null,
      payment_method,
      tags: tags.length > 0 ? tags : ["sales", "manual"],
      related_entity_type,
      related_entity_id,
      notes: notes || `Manual sale (${business_line})`,
      created_by: user.id,
    })
    .select("id")
    .single();

  if (ledgerInsert.error) {
    return NextResponse.json(
      { error: ledgerInsert.error.message },
      { status: 400 },
    );
  }

  const ledger_entry_id = ledgerInsert.data.id as string;

  // 2) Manual sale row linked to ledger entry
  // IMPORTANT: DO NOT insert `day` here (DB computes it from sale_at)
  const sale_at = saleAtFromDay(day);

  const manualInsert = await admin
    .from("ops_manual_sales")
    .insert({
      sale_at,
      business_line,
      bank_account_id: bankAccountId,
      amount_cents,
      currency,
      payment_method,
      notes: notes || "",
      tags: tags.length > 0 ? tags : ["sales", "manual"],
      created_by: user.id,
      ledger_entry_id,
    })
    .select("id")
    .single();

  if (manualInsert.error) {
    return NextResponse.json(
      { error: manualInsert.error.message },
      { status: 400 },
    );
  }

  const manual_sale_id = manualInsert.data.id as string;

  return NextResponse.json(
    { ok: true, ledger_entry_id, manual_sale_id },
    { status: 200 },
  );
}
