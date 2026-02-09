import Image from "next/image";
import Link from "next/link";
import { supabaseServer } from "@/src/lib/supabase/server";
import { FadeIn, Stagger, Item } from "../_components/motion";
import PresenceCheckoutButtons from "../_components/PresenceCheckoutButtons";

type PackageKey = "basic" | "booking" | "seo";

const DOCS_HUB_HREF = "/presence/docs";

const PACKAGE_TO_PRODUCT_KEY: Record<PackageKey, string> = {
  basic: "presence_basic",
  booking: "presence_booking",
  seo: "presence_seo",
};

const PACKAGES: Array<{
  key: PackageKey;
  title: string;
  subtitle: string;
  setupPrice: string;
  monthly?: string;
  monthlyNote?: string;
  includes: string[];
  achieves: string[];
  delivery: string;
  cta: string;
}> = [
  {
    key: "basic",
    title: "Basic Online Presence",
    subtitle: "Get visible. Get contacted. Look legitimate.",
    setupPrice: "€400 one-time",
    monthly: "€25/month",
    monthlyNote: "optional maintenance",
    includes: [
      "One-page professional website (mobile & desktop)",
      "Domain connection (or subdomain if needed)",
      "Contact form + click-to-call",
      "Google Business Profile setup",
      "Basic indexing",
    ],
    achieves: [
      "Your business becomes searchable",
      "Customers can contact you easily",
      "You look professional and trustworthy",
    ],
    delivery: "24–48 hours after onboarding",
    cta: "Get Online",
  },
  {
    key: "booking",
    title: "Presence + Booking System",
    subtitle: "Automate booking. Reduce manual handling.",
    setupPrice: "€900 one-time",
    monthly: "€50/month",
    monthlyNote: "optional maintenance",
    includes: [
      "Everything in Basic",
      "Online booking system",
      "Calendar sync",
      "Email/SMS/WhatsApp notifications",
      "Cancellation rules",
      "Automated confirmations",
    ],
    achieves: [
      "Less back-and-forth with customers",
      "Fewer missed bookings",
      "More organised day-to-day workflow",
    ],
    delivery: "24–48 hours after onboarding",
    cta: "Enable Bookings",
  },
  {
    key: "seo",
    title: "Local SEO & Growth Setup",
    subtitle: "Compete in local search with disciplined ongoing work.",
    setupPrice: "€2,000 one-time",
    monthly: "€250/month",
    monthlyNote: "mandatory ongoing work",
    includes: [
      "Everything above (presence + booking foundations)",
      "Local keyword research",
      "Service + city landing pages",
      "On-page SEO optimisation",
      "Google Business optimisation",
      "Review & citation setup",
    ],
    achieves: [
      "Competitive visibility in local search",
      "Sustainable traffic (not ads)",
      "Long-term positioning in your niche",
    ],
    delivery:
      "Initial setup begins after onboarding; ongoing monthly execution applies",
    cta: "Start Local Growth",
  },
];

const FAQ: Array<{ q: string; a: string }> = [
  {
    q: "Is this an agency service?",
    a: "No. This is a productized, fixed-scope system designed for fast delivery and predictable outcomes. No retainers, no vague marketing promises.",
  },
  {
    q: "Do you guarantee rankings or leads?",
    a: "No. SEO outcomes depend on competition, location, and consistency. We sell clean setup and disciplined execution—not guarantees.",
  },
  {
    q: "What do I own?",
    a: "You own your online presence assets and setup. If you stop monthly maintenance, you keep what was built. No lock-in.",
  },
  {
    q: "How fast is delivery?",
    a: "Typically 24–48 hours after you complete onboarding for Basic and Booking. SEO includes ongoing monthly execution after initial setup.",
  },
];

type EntitlementRow = {
  product_key: string;
  status: string;
  expires_at: string | null;
};

type PresenceOrderRow = {
  package_key: string;
  status: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isEntitlementRow(value: unknown): value is EntitlementRow {
  if (!isRecord(value)) return false;

  const productKey = value.product_key;
  const status = value.status;
  const expiresAt = value.expires_at;

  if (typeof productKey !== "string") return false;
  if (typeof status !== "string") return false;
  if (!(typeof expiresAt === "string" || expiresAt === null)) return false;

  return true;
}

function isPresenceOrderRow(value: unknown): value is PresenceOrderRow {
  if (!isRecord(value)) return false;

  const packageKey = value.package_key;
  const status = value.status;

  if (typeof packageKey !== "string") return false;
  if (typeof status !== "string") return false;

  return true;
}

function pickEntitlements(data: unknown): EntitlementRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isEntitlementRow);
}

function pickPresenceOrders(data: unknown): PresenceOrderRow[] {
  if (!Array.isArray(data)) return [];
  return data.filter(isPresenceOrderRow);
}

function isActiveEntitlement(row: EntitlementRow): boolean {
  if (row.status !== "active") return false;
  if (!row.expires_at) return true;

  const expiresAtMs = Date.parse(row.expires_at);
  if (Number.isNaN(expiresAtMs)) return false;
  return expiresAtMs > Date.now();
}

function hasNonCanceledOrder(
  orders: PresenceOrderRow[],
  key: PackageKey,
): boolean {
  return orders.some((o) => o.package_key === key && o.status !== "canceled");
}

const DEMOS: Array<{
  slug: string;
  niche: string;
  headline: string;
  coverSrc: string;
  bullets: readonly string[];
}> = [
  {
    slug: "gardening",
    niche: "Gardening & Tree Care",
    headline: "Premium lead-gen landing page built for local services.",
    coverSrc: "/presence-demos/gardening/garden1.jpg",
    bullets: [
      "Trust-first hero + quick facts",
      "WhatsApp/call CTAs in the right places",
      "Gallery proof + clean services blocks",
    ],
  },
  {
    slug: "waste-removal",
    niche: "Waste Removal",
    headline: "High-trust layout for multi-county coverage businesses.",
    coverSrc: "/presence-demos/waste-removal/waste1.jpg",
    bullets: [
      "Coverage clarity + conversion flow",
      "Fast enquiry capture (mobile-first)",
      "Premium trust blocks + testimonials",
    ],
  },
  {
    slug: "painting",
    niche: "Painting & Interiors",
    headline: "Premium look for higher-ticket, visual transformation work.",
    coverSrc: "/presence-demos/painting/paint1.jpg",
    bullets: [
      "Premium positioning + clean hierarchy",
      "Gallery proof (before/after friendly)",
      "Lead capture above the fold",
    ],
  },
];

export default async function OnlinePresencePage() {
  const supabase = await supabaseServer();
  const { data: userRes } = await supabase.auth.getUser();
  const user = userRes.user ?? null;

  const [entRes, poRes] = user
    ? await Promise.all([
        supabase
          .from("entitlements")
          .select("product_key,status,expires_at")
          .eq("user_id", user.id),
        supabase
          .from("presence_orders")
          .select("package_key,status")
          .eq("user_id", user.id),
      ])
    : [null, null];

  const entitlements =
    entRes && !entRes.error ? pickEntitlements(entRes.data) : [];
  const presenceOrders =
    poRes && !poRes.error ? pickPresenceOrders(poRes.data) : [];

  const entitlementActiveByProductKey = new Set<string>(
    entitlements.filter(isActiveEntitlement).map((e) => e.product_key),
  );

  return (
    <main style={{ background: "var(--mx-bg)", color: "var(--mx-text)" }}>
      <div className="relative overflow-hidden">
        {/* Subtle grid */}
        <div
          className="pointer-events-none absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.06) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(circle at 45% 10%, black 0%, transparent 55%)",
            WebkitMaskImage:
              "radial-gradient(circle at 45% 10%, black 0%, transparent 55%)",
          }}
        />

        {/* Ambient glows */}
        <div
          className="pointer-events-none absolute -top-48 right-[-20%] h-[520px] w-[520px] rounded-full blur-3xl opacity-40"
          style={{
            background:
              "radial-gradient(circle, var(--mx-cta) 0%, transparent 60%)",
          }}
        />
        <div
          className="pointer-events-none absolute top-48 left-[-18%] h-[520px] w-[520px] rounded-full blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(circle, var(--mx-light-accent) 0%, transparent 60%)",
          }}
        />

        {/* Nav */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
            <Link href="/" className="flex items-center gap-3">
              <div
                className="relative h-9 w-9 overflow-hidden rounded-md"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.10)",
                }}
              >
                <Image
                  src="/logo.png"
                  alt="Maxgen Systems"
                  fill
                  className="object-contain p-1.5"
                  priority
                />
              </div>

              <div className="leading-tight">
                <div className="text-sm font-semibold tracking-wide">
                  Maxgen Systems
                </div>
                <div className="text-xs mx-muted">Online Presence</div>
              </div>
            </Link>

            <div className="hidden sm:flex items-center gap-3">
              <span className="text-xs mx-muted opacity-50">•</span>
              <Link
                className="text-xs mx-muted hover:opacity-90"
                href="/#products"
              >
                View other products
              </Link>
            </div>
          </div>

          {/* Session + nav */}
          <div className="flex items-center gap-3">
            <nav className="hidden items-center gap-7 md:flex">
              <a className="text-sm mx-muted hover:opacity-90" href="#packages">
                Packages
              </a>
              <a
                className="text-sm mx-muted hover:opacity-90"
                href="#how-it-works"
              >
                How it works
              </a>
              <a className="text-sm mx-muted hover:opacity-90" href="#scope">
                Scope
              </a>
              <a className="text-sm mx-muted hover:opacity-90" href="#faq">
                FAQ
              </a>

              <Link
                href={DOCS_HUB_HREF}
                className="text-sm mx-muted hover:opacity-90"
              >
                Docs
              </Link>

              <a
                href="#packages"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                See packages
              </a>
            </nav>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={DOCS_HUB_HREF}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Docs
                </Link>

                <Link
                  href="/account"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Account
                </Link>
                <a
                  href="/logout"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Sign out
                </a>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href={DOCS_HUB_HREF}
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Docs
                </Link>
                <Link
                  href="/login?next=/online-presence"
                  className="rounded-lg border px-4 py-2 text-sm font-semibold"
                >
                  Sign in
                </Link>
              </div>
            )}
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-14 pt-10 md:pb-20 md:pt-14">
          <div className="grid gap-10 md:grid-cols-12 md:items-center">
            <div className="md:col-span-7">
              <FadeIn>
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                  style={{
                    borderColor: "rgba(255,255,255,0.10)",
                    background: "rgba(30,41,59,0.35)",
                    color: "rgba(156,163,175,0.95)",
                  }}
                >
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ background: "var(--mx-light-accent)" }}
                  />
                  Productized service — fixed scope, fast delivery
                </div>

                <h1 className="mt-5 mx-h1">
                  Professional online presence for{" "}
                  <span style={{ color: "var(--mx-light-accent)" }}>
                    local businesses
                  </span>
                  — fast, simple, owned by you.
                </h1>

                <p className="mt-4 max-w-xl mx-lead mx-muted">
                  If your business relies on WhatsApp, Facebook, or word of
                  mouth, you’re invisible to people actively searching for your
                  service. We fix discoverability + trust + lead capture without
                  ads, retainers, or vague promises.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#packages"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{ background: "var(--mx-cta)", color: "#fff" }}
                  >
                    Get Online
                  </a>

                  <Link
                    href={DOCS_HUB_HREF}
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(30,41,59,0.25)",
                    }}
                  >
                    Read the docs
                  </Link>

                  {user ? (
                    <Link
                      href="/account"
                      className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "rgba(255,255,255,0.9)",
                        background: "rgba(30,41,59,0.25)",
                      }}
                    >
                      View account
                    </Link>
                  ) : (
                    <Link
                      href="/login?next=/online-presence#packages"
                      className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "rgba(255,255,255,0.9)",
                        background: "rgba(30,41,59,0.25)",
                      }}
                    >
                      Sign in
                    </Link>
                  )}
                </div>

                <div className="mt-3 text-xs mx-muted">
                  Scope, delivery steps, and boundaries are documented for
                  clarity.
                </div>
              </FadeIn>

              <Stagger>
                <div className="mt-8 grid grid-cols-2 gap-4 md:max-w-xl">
                  {[
                    { k: "Ownership", v: "You keep what we build" },
                    { k: "Speed", v: "Live in 24–48 hours" },
                    { k: "Clarity", v: "Fixed scope, no surprises" },
                    { k: "Trust", v: "Google presence + lead capture" },
                  ].map((x) => (
                    <Item key={x.k}>
                      <div
                        className="rounded-xl p-4"
                        style={{
                          background: "rgba(30,41,59,0.35)",
                          border: "1px solid rgba(255,255,255,0.08)",
                        }}
                      >
                        <div className="text-sm font-semibold">{x.k}</div>
                        <div className="mt-1 text-xs leading-relaxed mx-muted">
                          {x.v}
                        </div>
                      </div>
                    </Item>
                  ))}
                </div>
              </Stagger>
            </div>

            {/* Right panel */}
            <div className="md:col-span-5">
              <FadeIn delay={0.08}>
                <div
                  className="rounded-2xl p-6"
                  style={{
                    background: "rgba(30,41,59,0.45)",
                    border: "1px solid rgba(255,255,255,0.10)",
                    boxShadow: "0 0 0 1px rgba(37,99,235,0.10) inset",
                  }}
                >
                  <div className="flex items-center justify-between">
                    <div className="text-sm font-semibold">What you get</div>
                    <div
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        background: "rgba(37,99,235,0.14)",
                        color: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(37,99,235,0.25)",
                      }}
                    >
                      Local-first
                    </div>
                  </div>

                  <div
                    className="mt-4 rounded-xl p-4"
                    style={{
                      background: "rgba(15,23,42,0.55)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="text-xs mx-muted">
                      Outcomes (no marketing noise)
                    </div>

                    <Stagger>
                      <div className="mt-3 space-y-3">
                        {[
                          {
                            t: "Discoverability",
                            d: "Show up when people search your service.",
                          },
                          {
                            t: "Trust",
                            d: "A professional presence that looks real.",
                          },
                          {
                            t: "Lead capture",
                            d: "Contactable on every device, instantly.",
                          },
                          {
                            t: "Bookings (optional)",
                            d: "Automate scheduling and confirmations.",
                          },
                        ].map((r) => (
                          <Item key={r.t}>
                            <div className="flex gap-3">
                              <div
                                className="mt-1 h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: "var(--mx-light-accent)",
                                }}
                              />
                              <div>
                                <div className="text-sm font-semibold">
                                  {r.t}
                                </div>
                                <div className="text-xs leading-relaxed mx-muted">
                                  {r.d}
                                </div>
                              </div>
                            </div>
                          </Item>
                        ))}
                      </div>
                    </Stagger>
                  </div>

                  <div className="mt-5 text-xs mx-muted leading-relaxed">
                    This is a productized service with fixed scope. SEO is sold
                    only as ongoing work, with no ranking guarantees.
                  </div>
                </div>

                <div
                  className="mt-4 rounded-2xl p-5"
                  style={{
                    background: "rgba(30,41,59,0.20)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="text-sm font-semibold">Delivery windows</div>
                  <p className="mt-2 text-xs leading-relaxed mx-muted">
                    Basic & Booking: typically live within 24–48 hours after
                    onboarding. SEO includes ongoing monthly execution after the
                    initial setup.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>

      {/* ✅ Live Demo Templates (inserted right below Hero) */}
      <section className="mx-auto w-full max-w-6xl px-6 pb-14">
        <FadeIn>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <div
                className="inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs"
                style={{
                  borderColor: "rgba(255,255,255,0.10)",
                  background: "rgba(30,41,59,0.35)",
                  color: "rgba(156,163,175,0.95)",
                }}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ background: "var(--mx-light-accent)" }}
                />
                See what customers actually get
              </div>

              <h2 className="mt-4 mx-h2">Live demo templates</h2>
              <p className="mt-2 mx-body mx-muted max-w-2xl">
                Open a real demo (mobile + desktop). These are premium layouts
                designed to convert WhatsApp/Facebook visitors into enquiries.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href="/presence/demos"
                className="rounded-lg border px-4 py-2 text-sm font-semibold"
                style={{
                  border: "1px solid rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(30,41,59,0.25)",
                }}
              >
                View all demos
              </Link>
              <a
                href="#packages"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                See packages
              </a>
            </div>
          </div>
        </FadeIn>

        <Stagger>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {DEMOS.map((demo) => (
              <Item key={demo.slug}>
                <div
                  className="group h-full overflow-hidden rounded-2xl"
                  style={{
                    background: "rgba(30,41,59,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                    transition: "transform 150ms ease, border-color 150ms ease",
                  }}
                >
                  <div className="relative aspect-[16/10] w-full overflow-hidden">
                    <Image
                      src={demo.coverSrc}
                      alt={`${demo.niche} demo cover`}
                      fill
                      sizes="(max-width: 768px) 100vw, 33vw"
                      className="object-cover transition duration-300 group-hover:scale-[1.02]"
                      priority={demo.slug === "gardening"}
                    />
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(to top, rgba(2,6,23,0.65) 0%, rgba(2,6,23,0) 60%)",
                      }}
                    />
                    <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-semibold text-white">
                          {demo.niche}
                        </div>
                        <div className="truncate text-xs text-white/70">
                          Premium landing template
                        </div>
                      </div>
                      <div
                        className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                        style={{
                          background: "rgba(15,23,42,0.55)",
                          border: "1px solid rgba(255,255,255,0.14)",
                          color: "rgba(255,255,255,0.92)",
                        }}
                      >
                        DEMO
                      </div>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="text-sm font-semibold">{demo.headline}</div>

                    <ul className="mt-4 space-y-2 text-xs leading-relaxed">
                      {demo.bullets.map((b) => (
                        <li key={b} className="flex gap-2">
                          <span
                            className="mt-1 h-2 w-2 rounded-full"
                            style={{ background: "var(--mx-light-accent)" }}
                          />
                          <span className="mx-muted" style={{ opacity: 0.95 }}>
                            {b}
                          </span>
                        </li>
                      ))}
                    </ul>

                    <div className="mt-5 grid gap-2">
                      <Link
                        href={`/presence/demos/${demo.slug}`}
                        className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                        style={{ background: "var(--mx-cta)", color: "#fff" }}
                      >
                        Open demo
                      </Link>
                      <Link
                        href="/presence/demos"
                        className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
                        style={{
                          border: "1px solid rgba(255,255,255,0.14)",
                          color: "rgba(255,255,255,0.9)",
                          background: "rgba(30,41,59,0.25)",
                        }}
                      >
                        View all demos
                      </Link>
                    </div>

                    <div className="mt-3 text-[11px] mx-muted leading-relaxed">
                      Demo content is placeholder. Real sites use your branding,
                      services, areas, and contact channels.
                    </div>
                  </div>
                </div>
              </Item>
            ))}
          </div>
        </Stagger>
      </section>

      {/* Packages */}
      <section id="packages" className="mx-auto w-full max-w-6xl px-6 py-14">
        <FadeIn>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mx-h2">Packages</h2>
              <p className="mt-2 mx-body mx-muted max-w-2xl">
                Fixed scope, fixed pricing, fast delivery. Choose the level of
                automation and competitiveness you need.
              </p>

              <div className="mt-3 text-sm">
                <Link
                  href={DOCS_HUB_HREF}
                  className="underline underline-offset-4 mx-muted hover:opacity-90"
                >
                  Read scope & delivery docs
                </Link>
              </div>
            </div>

            <div className="text-xs mx-muted">
              VAT not charged unless applicable.
            </div>
          </div>
        </FadeIn>

        <Stagger>
          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {PACKAGES.map((pkg) => {
              const productKey = PACKAGE_TO_PRODUCT_KEY[pkg.key];
              const entitled = entitlementActiveByProductKey.has(productKey);
              const hasOrder = hasNonCanceledOrder(presenceOrders, pkg.key);

              return (
                <Item key={pkg.key}>
                  <div
                    className="h-full rounded-2xl p-6 flex flex-col"
                    style={{
                      background: "rgba(30,41,59,0.35)",
                      border: "1px solid rgba(255,255,255,0.08)",
                    }}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-base font-semibold">
                          {pkg.title}
                        </div>
                        <div className="mt-1 text-xs mx-muted">
                          {pkg.subtitle}
                        </div>
                      </div>
                      <div
                        className="rounded-full px-3 py-1 text-xs"
                        style={{
                          background: "rgba(15,23,42,0.45)",
                          border: "1px solid rgba(255,255,255,0.10)",
                          color: "rgba(255,255,255,0.9)",
                        }}
                      >
                        {pkg.key.toUpperCase()}
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="text-sm font-semibold">
                        {pkg.setupPrice}
                      </div>
                      {pkg.monthly ? (
                        <div className="mt-1 text-xs mx-muted">
                          {pkg.monthly}{" "}
                          <span style={{ opacity: 0.9 }}>
                            — {pkg.monthlyNote}
                          </span>
                        </div>
                      ) : null}
                    </div>

                    <div
                      className="mt-5 rounded-xl p-4"
                      style={{
                        background: "rgba(15,23,42,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="text-xs mx-muted">Includes</div>
                      <ul className="mt-3 space-y-2 text-xs leading-relaxed">
                        {pkg.includes.map((x) => (
                          <li key={x} className="flex gap-2">
                            <span
                              className="mt-1 h-2 w-2 rounded-full"
                              style={{ background: "var(--mx-cta)" }}
                            />
                            <span
                              className="mx-muted"
                              style={{ opacity: 0.95 }}
                            >
                              {x}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4">
                      <div className="text-xs mx-muted">What this achieves</div>
                      <ul className="mt-2 space-y-2 text-xs leading-relaxed">
                        {pkg.achieves.map((x) => (
                          <li key={x} className="flex gap-2">
                            <span
                              className="mt-1 h-2 w-2 rounded-full"
                              style={{ background: "var(--mx-light-accent)" }}
                            />
                            <span
                              className="mx-muted"
                              style={{ opacity: 0.95 }}
                            >
                              {x}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 text-xs mx-muted">
                      <span className="font-semibold text-white">
                        Delivery:{" "}
                      </span>
                      {pkg.delivery}
                    </div>

                    <div className="mt-6">
                      {!user ? (
                        <Link
                          href="/login?next=/online-presence#packages"
                          className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
                          style={{
                            border: "1px solid rgba(255,255,255,0.14)",
                            color: "rgba(255,255,255,0.9)",
                            background: "rgba(30,41,59,0.25)",
                          }}
                        >
                          Sign in to purchase
                        </Link>
                      ) : entitled ? (
                        <div className="grid gap-2">
                          <div
                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
                            style={{
                              background: "rgba(34,197,94,0.14)",
                              border: "1px solid rgba(34,197,94,0.28)",
                              color: "rgba(255,255,255,0.92)",
                            }}
                          >
                            Purchased
                          </div>
                          <Link
                            href="/account"
                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
                            style={{
                              border: "1px solid rgba(255,255,255,0.14)",
                              color: "rgba(255,255,255,0.9)",
                              background: "rgba(30,41,59,0.25)",
                            }}
                          >
                            View plans / orders
                          </Link>
                        </div>
                      ) : hasOrder ? (
                        <div className="grid gap-2">
                          <Link
                            href="/presence"
                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                            style={{
                              background: "var(--mx-cta)",
                              color: "#fff",
                            }}
                          >
                            Continue onboarding
                          </Link>
                          <Link
                            href="/account"
                            className="inline-flex w-full items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold"
                            style={{
                              border: "1px solid rgba(255,255,255,0.14)",
                              color: "rgba(255,255,255,0.9)",
                              background: "rgba(30,41,59,0.25)",
                            }}
                          >
                            View orders
                          </Link>
                        </div>
                      ) : (
                        <PresenceCheckoutButtons
                          tier={pkg.key}
                          primaryLabel={pkg.cta}
                        />
                      )}

                      <div className="mt-3 text-[11px] mx-muted">
                        <Link
                          href={DOCS_HUB_HREF}
                          className="underline underline-offset-4 hover:opacity-90"
                        >
                          View scope & delivery docs
                        </Link>
                      </div>
                    </div>
                  </div>
                </Item>
              );
            })}
          </div>
        </Stagger>
      </section>

      {/* How it works */}
      <section
        id="how-it-works"
        className="mx-auto w-full max-w-6xl px-6 pb-14"
      >
        <FadeIn>
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(30,41,59,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="mx-h2">How it works</h2>
            <p className="mt-3 mx-body mx-muted max-w-3xl">
              Simple. Predictable. No back-and-forth.
            </p>

            <Stagger>
              <div className="mt-6 grid gap-4 md:grid-cols-4">
                {[
                  { t: "1) Choose package", d: "Pick Basic, Booking, or SEO." },
                  {
                    t: "2) Secure checkout",
                    d: "Online payment will be enabled next (Stripe).",
                  },
                  {
                    t: "3) Onboarding form",
                    d: "You submit details once. No long calls required.",
                  },
                  {
                    t: "4) Build & deploy",
                    d: "We publish and confirm delivery within the stated window.",
                  },
                ].map((x) => (
                  <Item key={x.t}>
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "rgba(15,23,42,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="text-base font-semibold">{x.t}</div>
                      <div className="mt-2 text-sm leading-relaxed mx-muted">
                        {x.d}
                      </div>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>
          </div>
        </FadeIn>
      </section>

      {/* Scope */}
      <section id="scope" className="mx-auto w-full max-w-6xl px-6 pb-14">
        <FadeIn>
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(30,41,59,0.20)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="mx-h2">Scope boundaries</h2>
            <p className="mt-3 mx-body mx-muted max-w-3xl">
              This is a fixed-scope productized service. To keep pricing fair
              and delivery fast, the following are not included by default.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(15,23,42,0.45)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-sm font-semibold">Not included</div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed mx-muted">
                  {[
                    "Custom website designs",
                    "Unlimited revisions",
                    "Advertising or paid traffic management",
                    "Guaranteed rankings or lead volume",
                    "Social media management",
                    "Content writing beyond agreed scope",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full"
                        style={{ background: "rgba(239,68,68,0.8)" }}
                      />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>

              <div
                className="rounded-2xl p-6"
                style={{
                  background: "rgba(15,23,42,0.45)",
                  border: "1px solid rgba(255,255,255,0.08)",
                }}
              >
                <div className="text-sm font-semibold">What you always get</div>
                <ul className="mt-3 space-y-2 text-xs leading-relaxed mx-muted">
                  {[
                    "Clear deliverables and fixed boundaries",
                    "A professional presence aligned with local services",
                    "Lead capture and contactability",
                    "Transparency (no hype, no guarantees)",
                    "Option to keep maintenance minimal or stop it",
                  ].map((x) => (
                    <li key={x} className="flex gap-2">
                      <span
                        className="mt-1 h-2 w-2 rounded-full"
                        style={{ background: "var(--mx-light-accent)" }}
                      />
                      {x}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-6 text-xs mx-muted leading-relaxed">
              SEO note: results depend on competition, location, reviews, and
              consistency. We sell execution—not guarantees.
            </div>
          </div>
        </FadeIn>
      </section>

      {/* FAQ */}
      <section id="faq" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <FadeIn>
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(30,41,59,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="mx-h2">FAQ</h2>

            <Stagger>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {FAQ.map((x) => (
                  <Item key={x.q}>
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "rgba(15,23,42,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="text-sm font-semibold">{x.q}</div>
                      <div className="mt-2 text-xs leading-relaxed mx-muted">
                        {x.a}
                      </div>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-xs mx-muted">
                Need a quick answer before buying?
              </div>
              <a
                href="mailto:info@maxgensys.com?subject=Online%20Presence%20-%20Question"
                className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                Email info@maxgensys.com
              </a>
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Footer */}
      <footer
        className="border-t px-6 py-10"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="text-xs mx-muted">
            © Maxgen Systems Limited. All rights reserved.
          </div>

          <div className="text-xs mx-muted">
            Maxgen Systems Limited (Ireland) — CRO: 806565 —{" "}
            <a
              href="mailto:info@maxgensys.com"
              className="underline underline-offset-4 hover:opacity-90"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              info@maxgensys.com
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
