// app/page.tsx

import Image from "next/image";
import Link from "next/link";
import { FadeIn, Stagger, Item } from "./_components/motion";

function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@maxgensys.com";
}

function mailtoHref(args: { subject: string; body?: string }): string {
  const email = contactEmail();
  const subject = encodeURIComponent(args.subject);
  const body = encodeURIComponent(args.body ?? "");
  const query = body
    ? `?subject=${subject}&body=${body}`
    : `?subject=${subject}`;
  return `mailto:${email}${query}`;
}

type ProductCard = {
  title: string;
  subtitle: string;
  statusLabel: string;
  statusTone: "live" | "invite";
  bullets: readonly string[];
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  footnote?: string;
  media: {
    posterSrc: string; // e.g. "/products/qr-studio.png"
    videoSrc: string; // e.g. "/products/qr-studio.mp4"
    alt: string;
  };
};

function isInternalHref(href: string): boolean {
  // internal routes are relative to site root: "/..."
  return href.startsWith("/") && !href.startsWith("//");
}

function CtaLink(props: {
  href: string;
  className: string;
  style?: React.CSSProperties;
  children: React.ReactNode;
}) {
  const { href, className, style, children } = props;

  if (isInternalHref(href)) {
    return (
      <Link href={href} className={className} style={style}>
        {children}
      </Link>
    );
  }

  // mailto:, #hash, https://... etc
  const isExternal = href.startsWith("http://") || href.startsWith("https://");
  return (
    <a
      href={href}
      className={className}
      style={style}
      {...(isExternal ? { target: "_blank", rel: "noreferrer" } : null)}
    >
      {children}
    </a>
  );
}

export default function Home() {
  const heroCards = [
    { k: "Architecture", v: "Systems-first foundations" },
    { k: "Governance", v: "Repeatable operating standards" },
    { k: "Execution", v: "Measured, reliable delivery" },
    { k: "Scale", v: "Built for future verticals" },
  ] as const;

  const rightPanelRows = [
    {
      title: "Structured initiatives",
      desc: "Independent ventures with shared governance.",
    },
    {
      title: "Enterprise discipline",
      desc: "Compliance-minded, operationally rigorous.",
    },
    {
      title: "Modern infrastructure",
      desc: "Technology-enabled, scalable by default.",
    },
    {
      title: "Risk-controlled growth",
      desc: "Repeatable execution, measurable outcomes.",
    },
  ] as const;

  const approachBlocks = [
    {
      title: "Foundation-first architecture",
      body: "Each initiative is built on robust infrastructure, clear interfaces, and clean operational boundaries.",
    },
    {
      title: "Governance and standardization",
      body: "Shared policies, controls, and performance standards reduce risk and improve execution predictability.",
    },
    {
      title: "Measured rollout and scaling",
      body: "We prioritize controlled expansion and evidence-based iteration—built for longevity, not noise.",
    },
  ] as const;

  const principles = [
    {
      t: "Reliability over velocity",
      d: "We prioritize repeatable operations and stable delivery.",
    },
    {
      t: "Clarity over complexity",
      d: "Simple interfaces, explicit responsibilities, clean governance.",
    },
    {
      t: "Scale with control",
      d: "Expansion is structured, measured, and risk-aware.",
    },
  ] as const;

  const products: readonly ProductCard[] = [
    {
      title: "Online Presence",
      subtitle:
        "Productized online presence packages for local businesses — fixed scope, fast delivery, owned by you.",
      statusLabel: "Live",
      statusTone: "live",
      bullets: [
        "Professional website + contact capture",
        "Booking + scheduling (optional package)",
        "SEO foundations (optional package)",
        "Clear docs: scope, delivery, and boundaries",
      ],
      primaryCta: { label: "View packages", href: "/online-presence" },
      secondaryCta: { label: "Read docs", href: "/presence/docs" },
      footnote:
        "Best for freelancers, sole traders, and small teams who need credibility and conversions quickly.",
      media: {
        posterSrc: "/products/online-presence.png",
        videoSrc: "/products/online-presence.mp4",
        alt: "Online Presence preview",
      },
    },
    {
      title: "QR Studio",
      subtitle:
        "Clean, scanner-safe static QR codes with locked templates and instant export (PNG + SVG).",
      statusLabel: "Live",
      statusTone: "live",
      bullets: [
        "Static QR only (no tracking / no redirects)",
        "Templates T1–T3 (scanner-safe defaults)",
        "PNG 1024×1024 + clean SVG",
        "Optional Print Pack add-on",
      ],
      primaryCta: { label: "Open QR Studio", href: "/qr-studio" },
      secondaryCta: { label: "View pricing", href: "/qr-studio#pricing" },
      footnote:
        "Best for menus, signage, flyers, stickers, shop displays, and clean brand presentation.",
      media: {
        posterSrc: "/products/qr-studio.png",
        videoSrc: "/products/qr-studio.mp4",
        alt: "QR Studio preview",
      },
    },
    {
      title: "Supplies",
      subtitle:
        "B2B sourcing channel for selected partners. Controlled onboarding, verified accounts, and curated inventory.",
      statusLabel: "Invite-only",
      statusTone: "invite",
      bullets: [
        "Private access (approved accounts only)",
        "Wholesale / B2B supply workflows",
        "Account verification and controlled pricing",
        "Limited onboarding capacity",
      ],
      primaryCta: {
        label: "Request access",
        href: mailtoHref({
          subject: "Supplies — Request Access",
          body: "Hi Maxgen Systems,\n\nI would like to request access to Supplies.\n\nBusiness name:\nWebsite (if any):\nIndustry:\nWhat products are you sourcing?\nEstimated monthly volume:\n\nThanks,",
        }),
      },
      secondaryCta: { label: "Contact", href: "#contact" },
      footnote:
        "Supplies is intentionally not public. Access is granted to approved partners only.",
      media: {
        posterSrc: "/products/supplies.png",
        videoSrc: "/products/supplies.mp4",
        alt: "Supplies preview",
      },
    },
  ] as const;

  const email = contactEmail();

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
              "radial-gradient(circle at 40% 20%, black 0%, transparent 55%)",
            WebkitMaskImage:
              "radial-gradient(circle at 40% 20%, black 0%, transparent 55%)",
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
          className="pointer-events-none absolute top-40 left-[-15%] h-[520px] w-[520px] rounded-full blur-3xl opacity-35"
          style={{
            background:
              "radial-gradient(circle, var(--mx-light-accent) 0%, transparent 60%)",
          }}
        />

        {/* Nav */}
        <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
          <div className="flex items-center gap-3">
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
              <div className="text-xs mx-muted">
                Systems. Scale. Reliability.
              </div>
            </div>
          </div>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-7 md:flex">
            <a className="text-sm mx-muted hover:opacity-90" href="#products">
              Products
            </a>
            <a className="text-sm mx-muted hover:opacity-90" href="#approach">
              Approach
            </a>
            <a className="text-sm mx-muted hover:opacity-90" href="#principles">
              Principles
            </a>
            <a className="text-sm mx-muted hover:opacity-90" href="#contact">
              Contact
            </a>

            <div className="ml-2 flex items-center gap-3">
              <Link className="text-sm mx-muted hover:opacity-90" href="/login">
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-lg border px-3 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(30,41,59,0.25)",
                }}
              >
                Signup
              </Link>

              <a
                href="#products"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                Explore products
              </a>
            </div>
          </nav>

          {/* Mobile auth + CTA (top-right) */}
          <div className="flex items-center gap-2 md:hidden">
            <Link
              href="/login"
              className="rounded-lg border px-3 py-2 text-xs font-semibold transition"
              style={{
                borderColor: "rgba(255,255,255,0.14)",
                color: "rgba(255,255,255,0.9)",
                background: "rgba(30,41,59,0.25)",
              }}
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-lg px-3 py-2 text-xs font-semibold transition"
              style={{ background: "var(--mx-cta)", color: "#fff" }}
            >
              Signup
            </Link>
          </div>
        </header>

        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-12 pt-10 md:pb-18 md:pt-14">
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
                  Parent-company framework — modular by design
                </div>

                <h1 className="mt-5 mx-h1">
                  Engineering systems that{" "}
                  <span style={{ color: "var(--mx-light-accent)" }}>
                    scale with certainty
                  </span>
                  .
                </h1>

                <p className="mt-4 max-w-xl mx-lead mx-muted">
                  Maxgen Systems builds and operates structured product lines
                  with disciplined execution, clear scope, and a reliability
                  posture designed for longevity.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="#products"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{ background: "var(--mx-cta)", color: "#fff" }}
                  >
                    Explore products
                  </a>

                  <a
                    href="#contact"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(30,41,59,0.25)",
                    }}
                  >
                    Contact
                  </a>
                </div>
              </FadeIn>

              <Stagger>
                <div className="mt-8 grid grid-cols-2 gap-4 md:max-w-xl">
                  {heroCards.map((x) => (
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
                    <div className="text-sm font-semibold">System Overview</div>
                    <div
                      className="rounded-full px-3 py-1 text-xs"
                      style={{
                        background: "rgba(37,99,235,0.14)",
                        color: "rgba(255,255,255,0.9)",
                        border: "1px solid rgba(37,99,235,0.25)",
                      }}
                    >
                      Operational Ready
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
                      Core capabilities (overview)
                    </div>

                    <Stagger>
                      <div className="mt-3 space-y-3">
                        {rightPanelRows.map((r) => (
                          <Item key={r.title}>
                            <div className="flex gap-3">
                              <div
                                className="mt-1 h-2.5 w-2.5 rounded-full"
                                style={{ background: "var(--mx-light-accent)" }}
                              />
                              <div>
                                <div className="text-sm font-semibold">
                                  {r.title}
                                </div>
                                <div className="text-xs leading-relaxed mx-muted">
                                  {r.desc}
                                </div>
                              </div>
                            </div>
                          </Item>
                        ))}
                      </div>
                    </Stagger>
                  </div>

                  <div className="mt-5 grid grid-cols-2 gap-3 text-xs mx-muted">
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(15,23,42,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="font-semibold text-white">
                        Reliability
                      </div>
                      <div className="mt-1">
                        Operational clarity & stability
                      </div>
                    </div>
                    <div
                      className="rounded-xl p-3"
                      style={{
                        background: "rgba(15,23,42,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="font-semibold text-white">
                        Scalability
                      </div>
                      <div className="mt-1">
                        Designed for multi-vertical growth
                      </div>
                    </div>
                  </div>
                </div>

                <div
                  className="mt-4 rounded-2xl p-5"
                  style={{
                    background: "rgba(30,41,59,0.20)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="text-sm font-semibold">Positioning</div>
                  <p className="mt-2 text-xs leading-relaxed mx-muted">
                    Maxgen Systems operates multiple lines under one governed
                    framework. Each product has clear boundaries, defined
                    delivery, and a consistent standard of execution.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>

      {/* Products */}
      <section id="products" className="mx-auto w-full max-w-6xl px-6 py-16">
        <FadeIn>
          <div className="flex flex-col gap-3 md:flex-row md:items-end md:justify-between">
            <div>
              <h2 className="mx-h2">Products & Business Lines</h2>
              <p className="mt-3 mx-body mx-muted max-w-2xl">
                Choose a line based on your objective: visibility and leads,
                clean QR deployment, or invite-only supply workflows.
              </p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <a
                href={mailtoHref({
                  subject: "General inquiry — Maxgen Systems",
                  body: "Hi Maxgen Systems,\n\nI have a question about your products.\n\nMy request:\n\nThanks,",
                })}
                className="rounded-lg border px-4 py-2 text-sm font-semibold transition"
                style={{
                  borderColor: "rgba(255,255,255,0.14)",
                  color: "rgba(255,255,255,0.9)",
                  background: "rgba(30,41,59,0.25)",
                }}
              >
                Ask a question
              </a>

              <a
                href="#contact"
                className="rounded-lg px-4 py-2 text-sm font-semibold transition"
                style={{ background: "var(--mx-cta)", color: "#fff" }}
              >
                Contact
              </a>
            </div>
          </div>
        </FadeIn>

        <Stagger>
          <div className="mt-8 grid gap-4 md:grid-cols-3">
            {products.map((p) => (
              <Item key={p.title}>
                {/* group enables hover reveal */}
                <div
                  className="group h-full rounded-2xl p-6"
                  style={{
                    background: "rgba(30,41,59,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  {/* Media */}
                  <div
                    className="relative mb-5 overflow-hidden rounded-xl"
                    style={{
                      border: "1px solid rgba(255,255,255,0.08)",
                      background: "rgba(15,23,42,0.55)",
                    }}
                  >
                    {/* 16:9 aspect */}
                    <div
                      className="relative w-full"
                      style={{ paddingTop: "56.25%" }}
                    >
                      <Image
                        src={p.media.posterSrc}
                        alt={p.media.alt}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover"
                        priority={p.title === "Online Presence"}
                      />

                      {/* Hover video overlay */}
                      <video
                        className={[
                          "absolute inset-0 h-full w-full object-cover",
                          "opacity-0 transition-opacity duration-200",
                          "group-hover:opacity-100 group-focus-within:opacity-100",
                          "motion-reduce:hidden",
                        ].join(" ")}
                        src={p.media.videoSrc}
                        muted
                        loop
                        playsInline
                        preload="metadata"
                        autoPlay
                      />
                      {/* subtle overlay for readability */}
                      <div
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(to top, rgba(11,18,32,0.40), rgba(11,18,32,0.05) 60%, rgba(11,18,32,0.00))",
                        }}
                      />
                    </div>
                  </div>

                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="text-base font-semibold">{p.title}</div>
                      <div className="mt-2 text-sm leading-relaxed mx-muted">
                        {p.subtitle}
                      </div>
                    </div>

                    <div
                      className="shrink-0 rounded-full px-3 py-1 text-xs"
                      style={{
                        background:
                          p.statusTone === "live"
                            ? "rgba(37,99,235,0.14)"
                            : "rgba(255,255,255,0.08)",
                        border:
                          p.statusTone === "live"
                            ? "1px solid rgba(37,99,235,0.25)"
                            : "1px solid rgba(255,255,255,0.12)",
                        color: "rgba(255,255,255,0.9)",
                      }}
                    >
                      {p.statusLabel}
                    </div>
                  </div>

                  <ul className="mt-5 space-y-2 text-sm mx-muted">
                    {p.bullets.map((b) => (
                      <li key={b} className="flex gap-2">
                        <span
                          className="mt-2 h-1.5 w-1.5 rounded-full"
                          style={{ background: "var(--mx-light-accent)" }}
                        />
                        <span>{b}</span>
                      </li>
                    ))}
                  </ul>

                  {p.footnote ? (
                    <div className="mt-5 text-xs leading-relaxed mx-muted">
                      {p.footnote}
                    </div>
                  ) : null}

                  <div className="mt-6 flex flex-col gap-2">
                    <CtaLink
                      href={p.primaryCta.href}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition"
                      style={{ background: "var(--mx-cta)", color: "#fff" }}
                    >
                      {p.primaryCta.label}
                    </CtaLink>

                    <CtaLink
                      href={p.secondaryCta.href}
                      className="inline-flex items-center justify-center rounded-lg px-4 py-2 text-sm font-semibold transition"
                      style={{
                        border: "1px solid rgba(255,255,255,0.14)",
                        color: "rgba(255,255,255,0.9)",
                        background: "rgba(30,41,59,0.25)",
                      }}
                    >
                      {p.secondaryCta.label}
                    </CtaLink>
                  </div>

                  {/* tiny hint */}
                  <div className="mt-3 text-[11px] mx-muted opacity-80">
                    Hover to preview.
                  </div>
                </div>
              </Item>
            ))}
          </div>
        </Stagger>

        <FadeIn delay={0.08}>
          <div
            className="mt-8 rounded-2xl p-6"
            style={{
              background: "rgba(15,23,42,0.45)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="text-sm font-semibold">How to start</div>
            <div className="mt-3 grid gap-3 md:grid-cols-3">
              {[
                {
                  t: "1) Pick a product",
                  d: "Choose the line that matches your outcome: visibility, QR deployment, or invite-only supply.",
                },
                {
                  t: "2) Follow the flow",
                  d: "Use the docs and routing inside each product. Scope and instructions are always explicit.",
                },
                {
                  t: "3) Deliver & support",
                  d: "You can contact us anytime using the official company email for help or clarifications.",
                },
              ].map((x) => (
                <div
                  key={x.t}
                  className="rounded-xl p-4"
                  style={{
                    background: "rgba(30,41,59,0.35)",
                    border: "1px solid rgba(255,255,255,0.08)",
                  }}
                >
                  <div className="text-sm font-semibold">{x.t}</div>
                  <div className="mt-2 text-xs leading-relaxed mx-muted">
                    {x.d}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </FadeIn>
      </section>

      {/* Approach */}
      <section id="approach" className="mx-auto w-full max-w-6xl px-6 py-16">
        <div className="grid gap-10 md:grid-cols-12">
          <div className="md:col-span-5">
            <FadeIn>
              <h2 className="mx-h2">A systems-grade approach</h2>
              <p className="mt-3 mx-body mx-muted">
                We operate with a parent-company mindset: build durable
                foundations, enforce quality standards, and scale initiatives
                through repeatable execution.
              </p>
            </FadeIn>
          </div>

          <div className="md:col-span-7">
            <Stagger>
              <div className="grid gap-4">
                {approachBlocks.map((b) => (
                  <Item key={b.title}>
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "rgba(30,41,59,0.35)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className="mt-1 h-3 w-3 rounded-full"
                          style={{ background: "var(--mx-cta)" }}
                        />
                        <div>
                          <div className="text-base font-semibold">
                            {b.title}
                          </div>
                          <div className="mt-2 text-sm leading-relaxed mx-muted">
                            {b.body}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>
          </div>
        </div>
      </section>

      {/* Principles */}
      <section id="principles" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <FadeIn>
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(30,41,59,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <h2 className="mx-h2">Principles</h2>

            <Stagger>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {principles.map((p) => (
                  <Item key={p.t}>
                    <div
                      className="rounded-2xl p-6"
                      style={{
                        background: "rgba(15,23,42,0.45)",
                        border: "1px solid rgba(255,255,255,0.08)",
                      }}
                    >
                      <div className="text-base font-semibold">{p.t}</div>
                      <div className="mt-2 text-sm leading-relaxed mx-muted">
                        {p.d}
                      </div>
                    </div>
                  </Item>
                ))}
              </div>
            </Stagger>
          </div>
        </FadeIn>
      </section>

      {/* Contact */}
      <section id="contact" className="mx-auto w-full max-w-6xl px-6 pb-20">
        <FadeIn>
          <div
            className="rounded-2xl p-8 md:p-10"
            style={{
              background: "rgba(30,41,59,0.35)",
              border: "1px solid rgba(255,255,255,0.08)",
            }}
          >
            <div className="grid gap-8 md:grid-cols-12 md:items-center">
              <div className="md:col-span-7">
                <h2 className="mx-h2">Contact</h2>
                <p className="mt-3 mx-body mx-muted">
                  For general inquiries, support questions, or partnership
                  discussions, contact us by email.
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href={mailtoHref({
                      subject: "Inquiry — Maxgen Systems",
                      body: "Hi Maxgen Systems,\n\nI’m contacting you about:\n\n- Product / line:\n- My question:\n\nThanks,",
                    })}
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(30,41,59,0.25)",
                    }}
                  >
                    Email us
                  </a>

                  <Link
                    href="/terms"
                    className="text-sm mx-muted hover:opacity-90"
                  >
                    Terms
                  </Link>
                  <Link
                    href="/privacy"
                    className="text-sm mx-muted hover:opacity-90"
                  >
                    Privacy
                  </Link>
                </div>
              </div>

              <div className="md:col-span-5">
                <a
                  href={`mailto:${encodeURIComponent(email)}`}
                  className="block rounded-xl px-5 py-4 text-center text-sm font-semibold transition"
                  style={{ background: "var(--mx-cta)", color: "#fff" }}
                >
                  {email}
                </a>
                <div className="mt-3 text-center text-xs mx-muted">
                  maxgensys.com
                </div>
              </div>
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
            © {new Date().getFullYear()} Maxgen Systems Limited. All rights
            reserved.
          </div>

          <div className="flex flex-wrap items-center gap-4 text-xs mx-muted">
            <Link
              href="/privacy"
              className="underline underline-offset-4 hover:opacity-90"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Privacy
            </Link>
            <Link
              href="/terms"
              className="underline underline-offset-4 hover:opacity-90"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              Terms
            </Link>
            <span>•</span>
            <span>Maxgen Systems Limited (Ireland) — CRO: 806565</span>
            <span>•</span>
            <a
              href={`mailto:${encodeURIComponent(email)}`}
              className="underline underline-offset-4 hover:opacity-90"
              style={{ color: "rgba(255,255,255,0.9)" }}
            >
              {email}
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}
