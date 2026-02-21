// app/supplies/apply/_components/TradeApplyForm.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { FadeIn, Stagger, Item } from "../../../_components/motion";

type SelectOption = { value: string; label: string };

const BUSINESS_TYPES: readonly SelectOption[] = [
  { value: "retailer", label: "Retail Shop" },
  { value: "repair", label: "Phone Repair Centre" },
  { value: "online", label: "Online Reseller" },
  { value: "wholesale", label: "Wholesale / Distributor" },
  { value: "other", label: "Other (specify in notes)" },
] as const;

const EST_VOLUME: readonly SelectOption[] = [
  { value: "under_500", label: "Under €500 / month" },
  { value: "500_2000", label: "€500 – €2,000 / month" },
  { value: "2000_5000", label: "€2,000 – €5,000 / month" },
  { value: "5000_10000", label: "€5,000 – €10,000 / month" },
  { value: "over_10000", label: "Over €10,000 / month" },
] as const;

type FormState = {
  businessLegalName: string;
  tradingName: string;
  croNumber: string;
  vatNumber: string;
  tradingAddress: string;
  contactName: string;
  contactRole: string;
  phone: string;
  email: string;
  website: string;
  businessType: string;
  estMonthlyVolume: string;
  notes: string;
};

const WHATSAPP_URL = "https://wa.me/353833226565";
const WHATSAPP_PREFILL =
  "https://wa.me/353833226565?text=Hi%20Maxgen%20Supplies%2C%20I%20want%20to%20apply%20for%20a%20B2B%20trade%20account.%20Please%20advise%20the%20next%20steps.";

function WhatsAppIcon(props: { className?: string }) {
  const { className } = props;
  return (
    <svg
      className={className}
      viewBox="0 0 32 32"
      aria-hidden="true"
      focusable="false"
    >
      <path
        fill="currentColor"
        d="M19.11 17.41c-.27-.14-1.6-.79-1.85-.88-.25-.09-.43-.14-.61.14-.18.27-.7.88-.86 1.06-.16.18-.32.2-.59.07-.27-.14-1.15-.42-2.19-1.34-.81-.72-1.36-1.61-1.52-1.88-.16-.27-.02-.41.12-.55.12-.12.27-.32.41-.48.14-.16.18-.27.27-.45.09-.18.05-.34-.02-.48-.07-.14-.61-1.47-.84-2.01-.22-.53-.45-.46-.61-.47h-.52c-.18 0-.48.07-.73.34-.25.27-.95.93-.95 2.27 0 1.34.98 2.63 1.12 2.81.14.18 1.92 2.93 4.65 4.11.65.28 1.16.45 1.55.57.65.21 1.25.18 1.72.11.52-.08 1.6-.65 1.83-1.28.23-.63.23-1.17.16-1.28-.07-.11-.25-.18-.52-.32z"
      />
      <path
        fill="currentColor"
        d="M16.02 5.33c-5.88 0-10.67 4.79-10.67 10.67 0 1.88.49 3.72 1.42 5.34L5.18 26.6l5.42-1.54c1.56.85 3.31 1.3 5.42 1.3 5.88 0 10.67-4.79 10.67-10.67 0-5.88-4.79-10.67-10.67-10.67zm0 19.2c-1.88 0-3.61-.54-5.05-1.46l-.36-.23-3.21.91.94-3.12-.24-.36c-.98-1.48-1.5-3.2-1.5-4.98 0-5.1 4.15-9.25 9.25-9.25 5.1 0 9.25 4.15 9.25 9.25 0 5.1-4.15 9.25-9.25 9.25z"
      />
    </svg>
  );
}

function mailtoHref(args: { subject: string; body?: string }): string {
  const email = "info@maxgensys.com";
  const subject = encodeURIComponent(args.subject);
  const body = encodeURIComponent(args.body ?? "");
  const query = body
    ? `?subject=${subject}&body=${body}`
    : `?subject=${subject}`;
  return `mailto:${email}${query}`;
}

function buildMailBody(state: FormState): string {
  const lines: string[] = [
    "Trade Account Application (B2B) — Maxgen Supplies",
    "",
    "1) Business Details",
    `Legal business name: ${state.businessLegalName || "-"}`,
    `Trading name (if different): ${state.tradingName || "-"}`,
    `Business type: ${state.businessType || "-"}`,
    `CRO number (if any): ${state.croNumber || "-"}`,
    `VAT number (if any): ${state.vatNumber || "-"}`,
    `Website (optional): ${state.website || "-"}`,
    "",
    "2) Trading Address",
    state.tradingAddress ? state.tradingAddress : "-",
    "",
    "3) Contact Person",
    `Name: ${state.contactName || "-"}`,
    `Role/Position: ${state.contactRole || "-"}`,
    `Phone: ${state.phone || "-"}`,
    `Email: ${state.email || "-"}`,
    "",
    "4) Commercial / Ordering",
    `Estimated monthly volume: ${state.estMonthlyVolume || "-"}`,
    "",
    "5) Notes / Requirements",
    state.notes ? state.notes : "-",
    "",
    "Compliance acknowledgement:",
    "- B2B only (no consumer sales)",
    "- Verification-first access to catalogue & trade pricing",
    "- Invoice-based ordering structure",
    "",
    "Submitted via: maxgensys.com/supplies/apply",
  ];

  return lines.join("\n");
}

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
      {label}
    </span>
  );
}

function Divider() {
  return <div className="my-10 h-px w-full bg-white/10" />;
}

function Field(props: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  placeholder?: string;
  required?: boolean;
  type?: "text" | "email" | "tel" | "url";
  hint?: string;
}) {
  const {
    label,
    name,
    value,
    onChange,
    placeholder,
    required,
    type = "text",
    hint,
  } = props;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-white/90">
          {label} {required ? <span className="text-white/60">*</span> : null}
        </span>
        {hint ? <span className="text-xs text-white/55">{hint}</span> : null}
      </div>
      <input
        name={String(name)}
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20 focus:ring-2 focus:ring-white/10"
      />
    </label>
  );
}

function SelectField(props: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  options: readonly SelectOption[];
  required?: boolean;
  hint?: string;
}) {
  const { label, name, value, onChange, options, required, hint } = props;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-white/90">
          {label} {required ? <span className="text-white/60">*</span> : null}
        </span>
        {hint ? <span className="text-xs text-white/55">{hint}</span> : null}
      </div>
      <select
        name={String(name)}
        required={required}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        className="mt-2 w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none focus:border-white/20 focus:ring-2 focus:ring-white/10"
      >
        <option value="" disabled>
          Select…
        </option>
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function TextArea(props: {
  label: string;
  name: keyof FormState;
  value: string;
  onChange: (name: keyof FormState, value: string) => void;
  placeholder?: string;
  hint?: string;
}) {
  const { label, name, value, onChange, placeholder, hint } = props;

  return (
    <label className="block">
      <div className="flex items-baseline justify-between gap-3">
        <span className="text-sm font-semibold text-white/90">{label}</span>
        {hint ? <span className="text-xs text-white/55">{hint}</span> : null}
      </div>
      <textarea
        name={String(name)}
        value={value}
        onChange={(e) => onChange(name, e.target.value)}
        placeholder={placeholder}
        rows={5}
        className="mt-2 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/90 outline-none placeholder:text-white/35 focus:border-white/20 focus:ring-2 focus:ring-white/10"
      />
    </label>
  );
}

export default function TradeApplyForm() {
  const [state, setState] = useState<FormState>({
    businessLegalName: "",
    tradingName: "",
    croNumber: "",
    vatNumber: "",
    tradingAddress: "",
    contactName: "",
    contactRole: "",
    phone: "",
    email: "",
    website: "",
    businessType: "",
    estMonthlyVolume: "",
    notes: "",
  });

  const onChange = (name: keyof FormState, value: string) => {
    setState((prev) => ({ ...prev, [name]: value }));
  };

  const submitHref = useMemo(() => {
    const body = buildMailBody(state);
    return mailtoHref({
      subject: "Maxgen Supplies — Trade Account Application",
      body,
    });
  }, [state]);

  return (
    <FadeIn>
      <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 sm:p-8 lg:p-10 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)]">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <h2 className="mx-h2">Application details</h2>
            <p className="mx-body mt-3 text-white/80">
              Provide accurate business details so we can verify eligibility and
              approve trade access.
            </p>
            <div className="mt-4 flex flex-wrap gap-2">
              <Chip label="B2B only" />
              <Chip label="Trade prices ex. VAT" />
              <Chip label="Verification-first access" />
              <Chip label="Invoice-based ordering" />
            </div>
          </div>

          <div className="rounded-3xl border border-white/10 bg-white/5 p-5 lg:w-[360px]">
            <div className="text-sm font-semibold text-white">
              What happens next
            </div>
            <Stagger>
              <div className="mt-4 space-y-3 text-sm leading-6 text-white/75">
                {[
                  "We review your details and verify trade eligibility.",
                  "Approved accounts receive catalogue access and trade pricing.",
                  "Ordering operates on invoice-based documentation workflow.",
                ].map((t) => (
                  <Item key={t}>
                    <div className="flex gap-3">
                      <div
                        className="mt-2 h-1.5 w-1.5 rounded-full"
                        style={{ background: "var(--mx-light-accent)" }}
                      />
                      <div>{t}</div>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="text-xs font-semibold text-white/70">
                WhatsApp Business
              </div>
              <a
                href={WHATSAPP_PREFILL}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex w-full items-center justify-center gap-2 rounded-2xl border border-white/12 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
              >
                <WhatsAppIcon className="h-4 w-4" />
                Message on WhatsApp
              </a>
              <div className="mt-2 text-xs text-white/55">
                {WHATSAPP_URL} • +353 83 322 6565
              </div>
            </div>
          </div>
        </div>

        <Divider />

        <div className="grid gap-6 sm:grid-cols-2">
          <Field
            label="Legal business name"
            name="businessLegalName"
            required
            value={state.businessLegalName}
            onChange={onChange}
            placeholder="e.g., ABC Mobile Repairs Ltd"
          />
          <Field
            label="Trading name (optional)"
            name="tradingName"
            value={state.tradingName}
            onChange={onChange}
            placeholder="e.g., ABC Repairs"
          />

          <SelectField
            label="Business type"
            name="businessType"
            required
            value={state.businessType}
            onChange={onChange}
            options={BUSINESS_TYPES}
          />

          <SelectField
            label="Estimated monthly volume"
            name="estMonthlyVolume"
            required
            value={state.estMonthlyVolume}
            onChange={onChange}
            options={EST_VOLUME}
            hint="Rough estimate is fine"
          />

          <Field
            label="CRO number (optional)"
            name="croNumber"
            value={state.croNumber}
            onChange={onChange}
            placeholder="e.g., 806565"
          />
          <Field
            label="VAT number (optional)"
            name="vatNumber"
            value={state.vatNumber}
            onChange={onChange}
            placeholder="e.g., IE1234567X"
          />

          <Field
            label="Website (optional)"
            name="website"
            type="url"
            value={state.website}
            onChange={onChange}
            placeholder="https://…"
          />

          <div className="sm:col-span-2">
            <TextArea
              label="Trading address"
              name="tradingAddress"
              hint="Include Eircode if available"
              value={state.tradingAddress}
              onChange={onChange}
              placeholder="Street, area, city, county, Eircode"
            />
          </div>

          <Field
            label="Contact person name"
            name="contactName"
            required
            value={state.contactName}
            onChange={onChange}
            placeholder="Full name"
          />
          <Field
            label="Role / position"
            name="contactRole"
            required
            value={state.contactRole}
            onChange={onChange}
            placeholder="Owner, Manager, Buyer…"
          />

          <Field
            label="Phone"
            name="phone"
            required
            type="tel"
            value={state.phone}
            onChange={onChange}
            placeholder="+353…"
          />
          <Field
            label="Email"
            name="email"
            required
            type="email"
            value={state.email}
            onChange={onChange}
            placeholder="name@business.com"
          />

          <div className="sm:col-span-2">
            <TextArea
              label="Notes / requirements (optional)"
              name="notes"
              value={state.notes}
              onChange={onChange}
              placeholder="Focus SKUs, iPhone models, packaging requirements, delivery preferences, etc."
            />
          </div>
        </div>

        <Divider />

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <a
            href={submitHref}
            className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Submit application (Email)
          </a>

          <div className="flex flex-col gap-2 sm:items-end">
            <div className="text-xs text-white/55">
              Opens your email client with a formatted application.
            </div>
            <Link
              href="/supplies/contact"
              className="text-xs font-semibold text-white/80 underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
            >
              Prefer to contact us first?
            </Link>
          </div>
        </div>
      </div>
    </FadeIn>
  );
}
