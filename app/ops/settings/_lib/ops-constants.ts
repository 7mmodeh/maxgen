// app/ops/settings/_lib/ops-constants.ts

// Business lines are locked by your scope definition.
// These must match the enum values in public.business_line.
export const BUSINESS_LINES = ["company", "supplies", "qr_studio"] as const;
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

export const VAT_FREQUENCIES = [
  "monthly",
  "bi_monthly",
  "quarterly",
  "annually",
  "unknown",
] as const;
export type VatFilingFrequency = (typeof VAT_FREQUENCIES)[number];

// NOTE: ops_expenses.frequency / ops_expenses.category / ops_regulatory_calendar.frequency / ops_regulatory_calendar.status
// are USER-DEFINED enums in your DB, but their labels were not provided in the introspection output.
// We cannot query pg_enum via PostgREST, so we provide *conservative* defaults and allow manual entry.
export const DEFAULT_EXPENSE_FREQUENCIES = [
  "monthly",
  "quarterly",
  "annually",
  "one_time",
] as const;

export const DEFAULT_CALENDAR_FREQUENCIES = [
  "monthly",
  "quarterly",
  "annually",
  "one_time",
] as const;

export const DEFAULT_CALENDAR_STATUSES = [
  "upcoming",
  "due",
  "overdue",
  "done",
] as const;
