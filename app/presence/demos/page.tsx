import Image from "next/image";
import Link from "next/link";
import { listPresenceDemos } from "@/src/lib/presence-demo/templates";

export const dynamic = "force-dynamic";

export default function PresenceDemosIndexPage() {
  const demos = listPresenceDemos();

  return (
    <main className="min-h-screen bg-white">
      <header className="border-b border-neutral-200 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-3 px-4 py-5">
          <div className="min-w-0">
            <h1 className="truncate text-xl font-semibold tracking-tight text-neutral-900">
              Online Presence Demos
            </h1>
            <p className="mt-1 text-sm text-neutral-600">
              Client-grade landing page demos (premium layout +
              conversion-first).
            </p>
          </div>

          <div className="flex shrink-0 items-center gap-2">
            <Link
              href="/"
              className="rounded-xl border border-neutral-200 bg-white px-4 py-2 text-sm font-semibold text-neutral-900 hover:bg-neutral-50"
            >
              ← Back to Home
            </Link>
          </div>
        </div>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 py-8">
        <div className="grid gap-4 md:grid-cols-3">
          {demos.map((d) => {
            const cover = d.gallery[0]?.src ?? "/logo.png";
            const accent = d.theme.accent;

            return (
              <Link
                key={d.slug}
                href={`/presence/demos/${d.slug}`}
                className="group overflow-hidden rounded-3xl border border-neutral-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              >
                <div className="relative h-40 w-full bg-neutral-50">
                  <Image
                    src={cover}
                    alt={`${d.nicheLabel} demo cover`}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover"
                    priority={false}
                  />
                  <div
                    className="absolute left-4 top-4 rounded-full px-3 py-1 text-xs font-semibold"
                    style={{
                      background: "#ffffffcc",
                      color: "#0f172a",
                      border: "1px solid #e2e8f0",
                    }}
                  >
                    {d.theme.id.toUpperCase()} THEME
                  </div>
                  <div
                    className="absolute inset-x-0 bottom-0 h-1"
                    style={{ background: accent }}
                    aria-hidden="true"
                  />
                </div>

                <div className="p-5">
                  <p className="text-sm font-semibold text-neutral-900">
                    {d.nicheLabel}
                  </p>
                  <p className="mt-1 text-sm text-neutral-600">
                    Premium landing page demo with hero + quote form above the
                    fold.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {d.hero.badges.slice(0, 3).map((b) => (
                      <span
                        key={b}
                        className="rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-600"
                      >
                        {b}
                      </span>
                    ))}
                  </div>

                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-semibold">
                    <span style={{ color: accent }}>View demo</span>
                    <span
                      className="text-neutral-400 transition group-hover:translate-x-0.5"
                      aria-hidden="true"
                    >
                      →
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>

        <div className="mt-8 rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm">
          <p className="text-sm font-semibold text-neutral-900">Notes</p>
          <ul className="mt-3 list-disc pl-5 text-sm text-neutral-600">
            <li>
              These are demo layouts. Each client site will use the same
              structure but with their content.
            </li>
            <li>PDF deliverables are available inside each demo page.</li>
            <li>
              Routing from Online Presence product page → demos will be added
              later (per scope).
            </li>
          </ul>
        </div>
      </section>
    </main>
  );
}
