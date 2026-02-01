import Link from "next/link";

export const metadata = {
  title: "Downloads | Maxgen Presence",
  description: "Download Maxgen Presence client documents (PDF).",
};

export default function PresenceDocsDownloadsPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-16">
      <header>
        <p className="text-xs opacity-70">Maxgen Presence</p>
        <h1 className="mt-2 text-3xl font-semibold">Downloads</h1>
        <p className="mt-3 text-sm opacity-80">
          Client-facing documents for review before purchase and onboarding.
        </p>

        <div className="mt-6">
          <Link href="/presence/docs" className="underline underline-offset-4">
            Back to overview
          </Link>
        </div>
      </header>

      <section className="mt-10 grid gap-4">
        <a
          className="rounded-2xl border p-6 hover:opacity-90 transition"
          href="/docs/maxgen-presence-sales-sheet.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <div className="text-lg font-semibold">1-Page Sales Sheet (PDF)</div>
          <div className="mt-2 text-sm opacity-80">
            Short, shareable overview for WhatsApp and email.
          </div>
        </a>

        <a
          className="rounded-2xl border p-6 hover:opacity-90 transition"
          href="/docs/maxgen-presence-handbook.pdf"
          target="_blank"
          rel="noreferrer"
        >
          <div className="text-lg font-semibold">Presence Handbook (PDF)</div>
          <div className="mt-2 text-sm opacity-80">
            Full documentation: scope, delivery, disclaimers, and integrity
            posture.
          </div>
        </a>
      </section>

      <footer className="mt-10 text-xs opacity-70">
        Delivered by MAXGEN SYSTEMS LIMITED (Ireland). Governed by Irish law.
      </footer>
    </main>
  );
}
