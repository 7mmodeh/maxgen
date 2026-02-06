// app/ops/settings/_lib/ops-constants.ts

// Business lines are locked by your scope definition.
// These must match the enum values in public.business_line.
export const BUSINESS_LINES = [
  "company",
  "supplies",
  "qr_studio",
  "online_presence",
] as const;
export type BusinessLine = (typeof BUSINESS_LINES)[number];

// Reserve kinds (must match enum backing ops_reserve_buckets.kind)
export const RESERVE_KINDS = ["percentage", "fixed"] as const;
export type ReserveKind = (typeof RESERVE_KINDS)[number];

// Bank account status (must match enum backing ops_bank_accounts.status)
export const BANK_ACCOUNT_STATUSES = ["active", "archived"] as const;
export type BankAccountStatus = (typeof BANK_ACCOUNT_STATUSES)[number];

// VAT enums were created in OPS-LEDGER-01E
export const VAT_STATUSES = ["not_registered", "pending", "registered"] as const;
export type VatStatus = (typeof VAT_STATUSES)[number];

// Align with DB enum evidence:
// vat_filing_frequency has: monthly | quarterly | annually
// Keep "unknown" as a safe UI fallback/default (even if not enum-backed).
export const VAT_FREQUENCIES = [
  "monthly",
  "quarterly",
  "annually",
  "unknown",
] as const;
export type VatFilingFrequency = (typeof VAT_FREQUENCIES)[number];

// NOTE:
// ops_expenses.frequency and ops_regulatory_calendar.frequency are backed by public.ops_frequency.
// Your enum labels: none | weekly | monthly | quarterly | annually
export const DEFAULT_EXPENSE_FREQUENCIES = [
  "none",
  "weekly",
  "monthly",
  "quarterly",
  "annually",
] as const;

export const DEFAULT_CALENDAR_FREQUENCIES = [
  "none",
  "weekly",
  "monthly",
  "quarterly",
  "annually",
] as const;

// Calendar status labels previously confirmed in your enum outputs.
export const DEFAULT_CALENDAR_STATUSES = [
  "upcoming",
  "due",
  "overdue",
  "done",
] as const;
