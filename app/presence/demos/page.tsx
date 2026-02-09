import Link from "next/link";
import { listPresenceDemos } from "@/src/lib/presence-demo/templates";
import { JSX } from "react";

export const dynamic = "force-dynamic";

export default function PresenceDemosGalleryPage(): JSX.Element {
  const demos = listPresenceDemos();

  return (
    <main className="mx-auto w-full max-w-6xl px-4 py-10">
      <header className="mb-8">
        <p className="text-sm text-neutral-500">Maxgen Systems</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Online Presence — Live Demos
        </h1>
        <p className="mt-2 max-w-2xl text-neutral-600">
          These are real working demo layouts showing what clients get:
          services, gallery, areas covered, and instant WhatsApp/call contact —
          all in one page.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {demos.map((d) => (
          <Link
            key={d.slug}
            href={`/presence/demos/${d.slug}`}
            className="group rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold tracking-tight">
                  {d.nicheLabel}
                </h2>
                <p className="mt-1 text-sm text-neutral-600">{d.tagline}</p>
              </div>
              <span className="rounded-full border border-neutral-200 px-3 py-1 text-xs text-neutral-600">
                View demo →
              </span>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {d.hero.badges.slice(0, 3).map((b) => (
                <span
                  key={b}
                  className="rounded-full bg-neutral-100 px-3 py-1 text-xs text-neutral-700"
                >
                  {b}
                </span>
              ))}
            </div>

            <div className="mt-6 text-xs text-neutral-500">
              Demo layout — content will be replaced with the client’s business
              details.
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}
