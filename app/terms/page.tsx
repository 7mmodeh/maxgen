// app/terms/page.tsx

import Link from "next/link";

export const metadata = {
  title: "Terms of Service | Maxgen Systems",
  description:
    "Global Terms of Service for maxgensys.com and Maxgen Systems products (Online Presence, QR Studio, and Supplies).",
};

function contactEmail(): string {
  return process.env.NEXT_PUBLIC_CONTACT_EMAIL || "info@maxgensys.com";
}

export default function TermsPage() {
  const email = contactEmail();

  return (
    <main className="mx-auto w-full max-w-4xl px-6 py-16">
      <header className="flex flex-col gap-3">
        <p className="text-xs opacity-80">Maxgen Systems</p>
        <h1 className="text-3xl font-semibold">Terms of Service</h1>
        <p className="text-sm opacity-80 max-w-2xl">
          These are the global Terms of Service for maxgensys.com and Maxgen
          Systems product lines, including Online Presence, QR Studio, and
          Supplies (invite-only).
        </p>

        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center">
          <Link href="/" className="underline underline-offset-4">
            Back to homepage
          </Link>
          <Link href="/privacy" className="underline underline-offset-4">
            View Privacy
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border p-5 text-sm opacity-85">
          <div>
            <span className="font-semibold">Provider:</span> MAXGEN SYSTEMS
            LIMITED (Ireland)
          </div>
          <div className="mt-1">
            <span className="font-semibold">Contact:</span>{" "}
            <a
              className="underline underline-offset-4"
              href={`mailto:${email}`}
            >
              {email}
            </a>
          </div>
          <div className="mt-1">
            <span className="font-semibold">Governing law:</span> Ireland
          </div>
        </div>
      </header>

      <section className="mt-10 grid gap-6">
        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">1) Scope and structure</h2>
          <p className="mt-3 text-sm opacity-85">
            Maxgen Systems operates multiple product lines. These global terms
            apply across the site and products unless a product page or
            documentation includes more specific terms for that product. Where
            product-specific terms conflict with these global terms, the
            product-specific terms take precedence for that product.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">2) Product lines</h2>
          <div className="mt-3 grid gap-4 text-sm opacity-85">
            <div>
              <div className="font-semibold">Online Presence</div>
              <div className="mt-1">
                Productized service packages with defined deliverables, scope,
                and boundaries. The authoritative details for scope and delivery
                are the Online Presence documentation pages (including scope,
                onboarding, and downloads).
              </div>
            </div>
            <div>
              <div className="font-semibold">QR Studio</div>
              <div className="mt-1">
                Self-serve static QR generation. QR Studio is designed for clean
                outputs and safe defaults. Any add-ons (such as Print Pack) are
                optional and do not change the product into a tracking service.
              </div>
            </div>
            <div>
              <div className="font-semibold">Supplies (invite-only)</div>
              <div className="mt-1">
                A controlled-access supply channel available only to approved
                partners. Availability, pricing, and onboarding are managed
                selectively.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">3) Accounts and eligibility</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>• You are responsible for maintaining account security.</li>
            <li>
              • You must provide accurate information when placing orders or
              submitting onboarding details.
            </li>
            <li>
              • We may suspend or restrict access if there is suspected fraud,
              misuse, or violation of these terms.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">
            4) Payments, subscriptions, and cancellations
          </h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • Prices are shown on the relevant product pages and may be
              updated over time.
            </li>
            <li>
              • Subscriptions (where offered) may be canceled by the customer.
              If a product uses “cancel at period end”, access typically
              continues until the end of the paid period.
            </li>
            <li>
              • One-time purchases grant access to the purchased product or
              add-on as described on the relevant product page.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">5) Acceptable use</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • Do not use our services for unlawful, deceptive, infringing, or
              harmful activities.
            </li>
            <li>
              • You are responsible for the content you upload or submit,
              including having rights to logos, trademarks, and materials.
            </li>
            <li>
              • We may remove content or restrict access where necessary to
              protect users, our services, or comply with legal obligations.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">
            6) Delivery and service expectations
          </h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • Delivery timelines, revisions, and inclusions for Online
              Presence are defined in the Online Presence documentation.
            </li>
            <li>
              • QR Studio outputs are generated based on user-provided inputs.
              You are responsible for verifying your destination URLs and any
              printed materials before wide deployment.
            </li>
            <li>
              • Supplies access is limited and may include additional
              onboarding/verification steps before activation.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">7) Intellectual property</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • You retain ownership of your content (logos, text, brand assets)
              that you provide.
            </li>
            <li>
              • Maxgen Systems retains ownership of its platform, templates,
              processes, and branding.
            </li>
            <li>
              • Where a deliverable is provided to you (e.g., a website build),
              ownership and handover expectations are described in the product
              documentation.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">8) Disclaimers</h2>
          <ul className="mt-3 space-y-2 text-sm opacity-85">
            <li>
              • Services are provided “as is” and “as available” to the extent
              permitted by law.
            </li>
            <li>
              • We do not guarantee business outcomes such as rankings, leads,
              or revenue unless explicitly stated in writing.
            </li>
            <li>
              • Third-party services (e.g., domain providers, email providers,
              calendar/booking providers) may be used as part of delivery and
              remain subject to their own terms.
            </li>
          </ul>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">9) Limitation of liability</h2>
          <p className="mt-3 text-sm opacity-85">
            To the extent permitted by law, Maxgen Systems Limited will not be
            liable for indirect, incidental, special, or consequential damages,
            or loss of profits, revenue, data, or business opportunities. Where
            liability cannot be excluded, it will be limited to the amount paid
            for the relevant product or service giving rise to the claim.
          </p>
        </div>

        <div className="rounded-2xl border p-6">
          <h2 className="text-lg font-semibold">10) Changes</h2>
          <p className="mt-3 text-sm opacity-85">
            We may update these Terms to reflect service improvements or legal
            changes. The latest version will be published on this page.
          </p>
        </div>
      </section>

      <footer className="mt-10 text-xs opacity-70">
        Delivered by MAXGEN SYSTEMS LIMITED (Ireland). Governed by Irish law.
      </footer>
    </main>
  );
}
