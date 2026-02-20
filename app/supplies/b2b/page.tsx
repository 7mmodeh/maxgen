// app/supplies/b2b/page.tsx
import type { Metadata } from "next";
import Link from "next/link";
import type { ReactNode } from "react";
import { FadeIn, Stagger, Item } from "../../../_components/motion";

export const metadata: Metadata = {
  title:
    "Maxgen Supplies — B2B Wholesale Portal (Ireland) | Maxgen Systems Ltd",
  description:
    "Trade-only B2B wholesale portal for mobile accessories operated by Maxgen Systems Ltd (Ireland). NACE 4652 aligned. Controlled SKUs, specification-locked procurement, invoice-based ordering.",
  alternates: { canonical: "/supplies/b2b" },
  robots: { index: true, follow: true },
  openGraph: {
    title: "Maxgen Supplies — B2B Wholesale Portal (Ireland)",
    description:
      "Trade-only B2B wholesale portal for mobile accessories. NACE 4652 aligned. Controlled SKUs, specification-locked procurement, invoice-based ordering.",
    url: "/supplies/b2b",
    type: "website",
  },
};

function Chip({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium tracking-wide text-white/90">
      {label}
    </span>
  );
}

function Divider() {
  return <div className="mx-auto my-10 h-px w-full max-w-6xl bg-white/10" />;
}

function Bullets({ items }: { items: readonly string[] }) {
  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {items.map((item) => (
        <li
          key={item}
          className="flex items-start gap-3 rounded-2xl border border-white/10 bg-white/5 p-4"
        >
          <span
            aria-hidden="true"
            className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-[color:var(--mx-light-accent)] shadow-[0_0_0_4px_rgba(56,189,248,0.10)]"
          />
          <span className="text-sm leading-6 text-white/85">{item}</span>
        </li>
      ))}
    </ul>
  );
}

function Section(props: {
  id?: string;
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  const { id, title, subtitle, children } = props;

  return (
    <section id={id} className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8">
      <FadeIn>
        <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
          <div className="flex items-start justify-between gap-6">
            <div className="max-w-3xl">
              <h2 className="mx-h2">{title}</h2>
              {subtitle ? (
                <p className="mx-lead mt-3 text-white/80">{subtitle}</p>
              ) : null}
            </div>
          </div>
          <div className="mt-6">{children}</div>
        </div>
      </FadeIn>
    </section>
  );
}

export default function SuppliesB2BPage() {
  const waHref =
    "https://wa.me/353833226565?text=Hi%20Maxgen%20Supplies%2C%20I%20want%20to%20enquire%20about%20B2B%20wholesale%20access%20and%20trade%20onboarding.";

  return (
    <main className="relative min-h-screen overflow-hidden">
      {/* Ambient background */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-48 left-1/2 h-[520px] w-[820px] -translate-x-1/2 rounded-full bg-[color:var(--mx-accent-blue)]/20 blur-[120px]" />
        <div className="absolute -bottom-56 right-[-120px] h-[520px] w-[520px] rounded-full bg-[color:var(--mx-light-accent)]/16 blur-[120px]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_60%)]" />
        <div className="absolute inset-0 opacity-30 [background-image:linear-gradient(to_right,rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:56px_56px]" />
      </div>

      {/* Header / Hero */}
      <header className="relative mx-auto w-full max-w-6xl px-4 pb-10 pt-16 sm:px-6 sm:pb-14 sm:pt-20 lg:px-8">
        <div className="flex flex-col gap-10">
          <FadeIn>
            <div className="flex flex-col gap-6">
              <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs text-white/80">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--mx-light-accent)]" />
                Operated by Maxgen Systems Ltd (Ireland)
              </div>

              <h1 className="mx-h1 max-w-4xl">
                Maxgen Supplies — B2B Wholesale Portal
                <span className="block text-white/70">
                  Trade-only supply of mobile accessories
                </span>
              </h1>

              <p className="mx-lead max-w-3xl text-white/80">
                A verified B2B portal designed for retailers, repair centres,
                and resellers, providing controlled catalogue access,
                specification-locked procurement, and invoice-based ordering
                aligned with{" "}
                <span className="font-semibold text-white">NACE 4652</span>.
              </p>

              <div className="flex flex-wrap gap-2">
                <Chip label="B2B only (no consumer sales)" />
                <Chip label="Trade prices shown ex. VAT" />
                <Chip label="Invoice-based ordering" />
                <Chip label="Controlled, locked SKUs" />
                <Chip label="NACE 4652 aligned" />
              </div>

              <div className="mt-2 flex flex-col gap-3 sm:flex-row">
                <Link
                  href="/supplies/apply"
                  className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Apply for a Trade Account
                </Link>

                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Request Wholesale Information
                </Link>

                <a
                  href={waHref}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  WhatsApp Business
                </a>
              </div>

              <p className="text-xs text-white/60">
                Note: This portal is established as part of trading commencement
                preparations while VAT registration is in process.
              </p>
            </div>
          </FadeIn>

          <Stagger>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  k: "Primary classification",
                  v: "NACE 4652",
                  d: "Wholesale of electronic and telecommunications equipment and parts.",
                },
                {
                  k: "Access model",
                  v: "Verified trade accounts",
                  d: "Approval required to view trade pricing and place orders.",
                },
                {
                  k: "Documentation",
                  v: "Invoice-first workflow",
                  d: "Order confirmation and records supported via invoice and dispatch documentation.",
                },
              ].map((x) => (
                <Item key={x.k}>
                  <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
                    <div className="text-xs font-semibold text-white/65">
                      {x.k}
                    </div>
                    <div className="mt-2 text-lg font-semibold text-white">
                      {x.v}
                    </div>
                    <div className="mt-2 text-sm text-white/75">{x.d}</div>
                  </div>
                </Item>
              ))}
            </div>
          </Stagger>
        </div>
      </header>

      <Divider />

      {/* 1. Corporate Overview */}
      <Section
        id="overview"
        title="Corporate overview"
        subtitle="A B2B wholesale division built for structured supply-chain control, documentation, and trade-only access."
      >
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <p className="mx-body text-white/85">
              Maxgen Supplies is a structured B2B wholesale division of Maxgen
              Systems Ltd (Ireland), established to supply verified businesses
              with controlled access to a curated catalogue of mobile
              accessories. The platform has been developed to support wholesale
              operations with documented procurement controls, invoice-based
              ordering, and trade-only access.
            </p>

            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="text-sm font-semibold text-white">
                Trade-only policy
              </div>
              <p className="mt-2 text-sm leading-6 text-white/75">
                Access is restricted to approved trade accounts. No
                direct-to-consumer (B2C) sales are conducted through Maxgen
                Supplies.
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
            <div className="text-sm font-semibold text-white">
              Operational posture
            </div>
            <ul className="mt-3 space-y-2 text-sm text-white/75">
              <li>• Verified onboarding and account approval</li>
              <li>• Locked specifications and supplier declarations</li>
              <li>• Trade pricing (ex. VAT) and invoice documentation</li>
              <li>• Dispatch records and order history tracking</li>
            </ul>
          </div>
        </div>
      </Section>

      <Divider />

      {/* 2. Scope of Wholesale Activity */}
      <Section
        id="scope"
        title="Scope of wholesale activity (NACE 4652 aligned)"
        subtitle="Product categories structured to match wholesale distribution of electronic and telecom accessories and parts."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Mobile device protection
            </div>
            <div className="mt-4">
              <Bullets
                items={[
                  "Clear tempered glass screen protectors (spec-locked)",
                  "Privacy tempered glass (28–30° privacy angle, spec-locked)",
                  "Camera lens protectors (9H tempered, spec-locked)",
                  "Case-friendly fitment and retail packaging requirements",
                ]}
              />
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Telecom & electronic accessories (supporting range)
            </div>
            <div className="mt-4">
              <Bullets
                items={[
                  "USB-C charging cables (retail packaged)",
                  "Lightning-compatible charging cables",
                  "Wall charging adapters",
                  "Wireless charging pads",
                  "Power banks",
                  "Accessory kits (SIM tools, connectors, packaged add-ons)",
                ]}
              />
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-white/10 bg-[color:var(--mx-accent-blue)]/10 p-6">
          <div className="text-sm font-semibold text-white">
            Classification note
          </div>
          <p className="mt-2 text-sm leading-6 text-white/80">
            Product range is positioned for wholesale supply of electronic and
            telecommunications equipment parts and accessories consistent with
            NACE 4652 classification.
          </p>
        </div>
      </Section>

      <Divider />

      {/* 3. Controlled SKU Framework */}
      <Section
        id="sku-control"
        title="Controlled SKU framework (specification-locked procurement)"
        subtitle="Core SKUs operate under locked technical specifications for quality consistency and supply-chain control."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Locked specifications (examples)
            </div>
            <ul className="mt-4 space-y-3 text-sm leading-6 text-white/80">
              <li>
                <span className="font-semibold text-white">
                  Clear tempered glass:
                </span>{" "}
                0.33mm only, full glue (no dot matrix), 2.5D edges, oleophobic
                coating, individual retail box.
              </li>
              <li>
                <span className="font-semibold text-white">Privacy glass:</span>{" "}
                0.33mm only, strict 28–30° privacy angle, full adhesive,
                individual retail box.
              </li>
              <li>
                <span className="font-semibold text-white">
                  Lens protectors:
                </span>{" "}
                9H tempered glass, full adhesive, single variant per SKU, retail
                boxed.
              </li>
              <li>
                <span className="font-semibold text-white">MagSafe rings:</span>{" "}
                metal ring (not plastic), high-strength adhesive (3M grade or
                equivalent), retail card/box packaging.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Supplier compliance requirement
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              Suppliers are required to confirm compliance with locked
              specifications before procurement approval. Unchecked
              confirmations invalidate acceptance, supporting consistent
              wholesale quality controls.
            </p>

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-semibold text-white/70">
                Reference document
              </div>
              <div className="mt-2 text-sm text-white/85">
                Maxgen Supplies — SKU Lock Sheet (v1.0)
              </div>
              <p className="mt-2 text-xs text-white/60">
                Internal procurement control document used for supplier
                onboarding and SKU acceptance.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* 4. Trade Account Model */}
      <Section
        id="trade-accounts"
        title="Trade account model"
        subtitle="A verification-first onboarding flow to ensure B2B-only access to pricing, ordering, and documentation."
      >
        <Stagger>
          <div className="grid gap-6 lg:grid-cols-3">
            {[
              {
                t: "1) Apply",
                d: "Submit business details (trading name, address, contact person, and trading evidence as applicable).",
              },
              {
                t: "2) Verify",
                d: "Review and approve account status (e.g., Pending → Approved). Controls access to trade pricing and ordering.",
              },
              {
                t: "3) Access",
                d: "Approved accounts can view trade catalogue, tiered pricing, and place orders under invoice documentation.",
              },
            ].map((x) => (
              <Item key={x.t}>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                  <div className="text-sm font-semibold text-white">{x.t}</div>
                  <p className="mt-2 text-sm leading-6 text-white/80">{x.d}</p>
                </div>
              </Item>
            ))}
          </div>
        </Stagger>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <Link
            href="/supplies/apply"
            className="inline-flex items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            Start Trade Application
          </Link>
          <Link
            href="/supplies"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            View Maxgen Supplies Overview
          </Link>
          <a
            href={waHref}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center justify-center rounded-2xl border border-white/12 bg-white/5 px-5 py-3 text-sm font-semibold text-white/90 transition hover:bg-white/8 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
          >
            WhatsApp Business
          </a>
        </div>
      </Section>

      <Divider />

      {/* 5. Pricing & VAT Position */}
      <Section
        id="vat"
        title="Pricing & VAT position"
        subtitle="Trade pricing is structured for wholesale operations; VAT registration is in process as part of trading commencement."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Trade pricing
            </div>
            <ul className="mt-4 space-y-2 text-sm text-white/80">
              <li>• Trade prices are displayed exclusive of VAT.</li>
              <li>
                • VAT treatment will be applied in accordance with Irish VAT
                rules upon activation.
              </li>
              <li>
                • Invoices will reflect VAT treatment as required under Irish/EU
                VAT legislation.
              </li>
            </ul>
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Status note (accuracy-first)
            </div>
            <p className="mt-3 text-sm leading-6 text-white/80">
              This portal is prepared as evidence of trade intent and
              operational readiness. Trading activity is intended to commence
              following completion of VAT registration formalities.
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-black/20 p-5">
              <div className="text-xs font-semibold text-white/70">
                Compliance posture
              </div>
              <p className="mt-2 text-xs leading-6 text-white/65">
                No claims are made on this page that VAT is currently being
                charged. VAT application is in process and will be applied as
                required once active.
              </p>
            </div>
          </div>
        </div>
      </Section>

      <Divider />

      {/* 6. Ordering & Documentation */}
      <Section
        id="ordering"
        title="Ordering & documentation structure"
        subtitle="An invoice-first ordering workflow designed for auditability, consistent records, and wholesale operations."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Ordering workflow
            </div>
            <Bullets
              items={[
                "Approved accounts place orders through the portal catalogue",
                "Order confirmation supported by invoice documentation",
                "Structured record-keeping for order history and fulfilment",
                "Dispatch documentation retained for operational records",
              ]}
            />
          </div>

          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <div className="text-sm font-semibold text-white">
              Records & controls
            </div>
            <Bullets
              items={[
                "Sequential invoice numbering (when active trading commences)",
                "Trade account linkage (who ordered, when, and under what pricing tier)",
                "SKU-level traceability for quality and supplier compliance",
                "Supportable audit trail for tax compliance needs",
              ]}
            />
          </div>
        </div>
      </Section>

      <Divider />

      {/* 7. Contact */}
      <section className="mx-auto w-full max-w-6xl px-4 pb-20 sm:px-6 lg:px-8">
        <FadeIn>
          <div className="rounded-3xl border border-white/10 bg-[color:var(--mx-surface)]/40 p-6 shadow-[0_0_0_1px_rgba(255,255,255,0.02),0_18px_60px_rgba(0,0,0,0.35)] sm:p-8 lg:p-10">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
              <div className="max-w-3xl">
                <h2 className="mx-h2">Contact</h2>
                <p className="mx-lead mt-3 text-white/80">
                  For trade onboarding, procurement discussions, or wholesale
                  information, contact us directly.
                </p>

                <div className="mt-6 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-white/65">
                      Email
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href="mailto:info@maxgensys.com"
                      >
                        info@maxgensys.com
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                    <div className="text-xs font-semibold text-white/65">
                      Phone
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href="tel:+353833226565"
                      >
                        +353 83 322 6565
                      </a>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-white/5 p-5 sm:col-span-2">
                    <div className="text-xs font-semibold text-white/65">
                      WhatsApp Business
                    </div>
                    <div className="mt-2 text-sm font-semibold text-white">
                      <a
                        className="underline decoration-white/20 underline-offset-4 hover:decoration-white/60"
                        href={waHref}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Message us on WhatsApp
                      </a>
                    </div>
                    <div className="mt-2 text-xs text-white/60">
                      Dublin, Ireland — Wholesale Division: Maxgen Supplies
                      (NACE 4652 aligned)
                    </div>
                  </div>
                </div>
              </div>

              <div className="rounded-3xl border border-white/10 bg-white/5 p-6 lg:w-[360px]">
                <div className="text-sm font-semibold text-white">
                  Next step
                </div>
                <p className="mt-2 text-sm leading-6 text-white/75">
                  Submit your trade details to request approval for catalogue
                  access and wholesale pricing.
                </p>
                <Link
                  href="/supplies/apply"
                  className="mt-5 inline-flex w-full items-center justify-center rounded-2xl bg-[color:var(--mx-cta)] px-5 py-3 text-sm font-semibold text-white shadow-[0_14px_40px_rgba(37,99,235,0.28)] transition hover:bg-[color:var(--mx-cta-hover)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                >
                  Apply for a Trade Account
                </Link>
                <p className="mt-3 text-xs text-white/55">
                  Verification-first access. No consumer checkout.
                </p>
              </div>
            </div>
          </div>
        </FadeIn>
      </section>
    </main>
  );
}
