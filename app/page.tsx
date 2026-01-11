import Image from "next/image";
import { FadeIn, Stagger, Item } from "./_components/motion";

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

          <nav className="hidden items-center gap-7 md:flex">
            <a className="text-sm mx-muted hover:opacity-90" href="#approach">
              Approach
            </a>
            <a className="text-sm mx-muted hover:opacity-90" href="#principles">
              Principles
            </a>
            <a className="text-sm mx-muted hover:opacity-90" href="#contact">
              Contact
            </a>

            <a
              href="#contact"
              className="rounded-lg px-4 py-2 text-sm font-semibold transition"
              style={{ background: "var(--mx-cta)", color: "#fff" }}
            >
              Get in touch
            </a>
          </nav>
        </header>

        {/* Hero */}
        <section className="mx-auto w-full max-w-6xl px-6 pb-16 pt-10 md:pb-24 md:pt-14">
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
                  Maxgen Systems is a systems-driven parent company focused on
                  building and operating structured initiatives with enterprise
                  reliability, disciplined execution, and long-term value.
                </p>

                <div className="mt-7 flex flex-col gap-3 sm:flex-row sm:items-center">
                  <a
                    href="mailto:info@maxgensys.com"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{ background: "var(--mx-cta)", color: "#fff" }}
                  >
                    info@maxgensys.com
                  </a>

                  <a
                    href="#approach"
                    className="inline-flex items-center justify-center rounded-lg px-5 py-3 text-sm font-semibold transition"
                    style={{
                      border: "1px solid rgba(255,255,255,0.14)",
                      color: "rgba(255,255,255,0.9)",
                      background: "rgba(30,41,59,0.25)",
                    }}
                  >
                    Our approach
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
                      Core capabilities (abstract)
                    </div>

                    <Stagger>
                      <div className="mt-3 space-y-3">
                        {rightPanelRows.map((r) => (
                          <Item key={r.title}>
                            <div className="flex gap-3">
                              <div
                                className="mt-1 h-2.5 w-2.5 rounded-full"
                                style={{
                                  background: "var(--mx-light-accent)",
                                }}
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
                    Maxgen Systems is presented deliberately as a parent
                    framework. Specific verticals remain private until formal
                    launch and partner alignment.
                  </p>
                </div>
              </FadeIn>
            </div>
          </div>
        </section>
      </div>

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
                  For general inquiries or partnership discussions, reach out
                  via email. We keep the public footprint intentionally lean
                  until formal initiative announcements.
                </p>
              </div>

              <div className="md:col-span-5">
                <a
                  href="mailto:info@maxgensys.com"
                  className="block rounded-xl px-5 py-4 text-center text-sm font-semibold transition"
                  style={{ background: "var(--mx-cta)", color: "#fff" }}
                >
                  info@maxgensys.com
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
            © {new Date().getFullYear()} Maxgen Systems. All rights reserved.
          </div>
          <div className="text-xs mx-muted">
            Contact:{" "}
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
