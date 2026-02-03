// app/qr-studio/page.tsx
import Link from "next/link";
import QRCode from "qrcode";
import { supabaseServer } from "@/src/lib/supabase/server";
import { hasQrStudioEntitlement } from "@/src/lib/qr/entitlement";
import QrCheckoutButtons from "./_components/QrCheckoutButtons";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function demoSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    errorCorrectionLevel: "H",
    margin: 4,
    width: 220,
  });
}

export default async function QrStudioLandingPage() {
  const sb = await supabaseServer();
  const { data } = await sb.auth.getUser();
  const user = data.user ?? null;

  const entitled = user ? await hasQrStudioEntitlement(user.id) : false;

  // Demo previews (no DB dependency; deterministic)
  const [t1Svg, t2Svg, t3Svg] = await Promise.all([
    demoSvg("https://maxgensys.com/qr-demo-t1"),
    demoSvg("https://maxgensys.com/qr-demo-t2"),
    demoSvg("https://maxgensys.com/qr-demo-t3"),
  ]);

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12">
      {/* HERO */}
      <section className="grid gap-10 lg:grid-cols-2 lg:items-center">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs text-neutral-700">
            <span className="font-semibold">Static QR Studio</span>
            <span className="text-neutral-400">•</span>
            <span>ECC H • Quiet Zone • iOS + Android safe</span>
          </div>

          <h1 className="mt-5 text-4xl font-semibold tracking-tight">
            Professional QR codes that{" "}
            <span className="text-neutral-500">scan instantly</span>.
          </h1>

          <p className="mt-4 text-base text-neutral-600">
            Create clean, scanner-safe QR codes for your business, menu, flyer,
            or card. No tech knowledge needed — pick a template, add your link,
            download PNG/SVG.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            {entitled ? (
              <Link
                href="/qr-studio/dashboard"
                className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                Open Dashboard
              </Link>
            ) : (
              <a
                href="#pricing"
                className="rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white"
              >
                See Pricing
              </a>
            )}

            <Link
              href={user ? "/qr-studio/dashboard" : "/login"}
              className="rounded-md border border-neutral-300 bg-white px-5 py-2.5 text-sm font-medium text-neutral-900"
            >
              {user ? "My Projects" : "Log in"}
            </Link>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold">Built for scanning</div>
              <div className="mt-1 text-xs text-neutral-600">
                ECC H + quiet zone enforced.
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold">Locked templates</div>
              <div className="mt-1 text-xs text-neutral-600">
                No confusing design controls.
              </div>
            </div>
            <div className="rounded-xl border border-neutral-200 bg-white p-4">
              <div className="text-sm font-semibold">Instant downloads</div>
              <div className="mt-1 text-xs text-neutral-600">
                PNG 1024×1024 + SVG.
              </div>
            </div>
          </div>
        </div>

        {/* Right-side preview panel */}
        <div className="rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold">What you get</div>
            <div className="text-xs text-neutral-500">Preview samples</div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-neutral-200 p-4">
              <div
                className="mx-auto w-[160px]"
                dangerouslySetInnerHTML={{ __html: t1Svg }}
              />
              <div className="mt-3 text-sm font-semibold">T1 — Clean</div>
              <div className="mt-1 text-xs text-neutral-600">
                Minimal, professional QR.
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div
                className="mx-auto w-[160px]"
                dangerouslySetInnerHTML={{ __html: t2Svg }}
              />
              <div className="mt-3 text-sm font-semibold">T2 — Label</div>
              <div className="mt-1 text-xs text-neutral-600">
                Name + optional tagline.
              </div>
            </div>

            <div className="rounded-xl border border-neutral-200 p-4">
              <div
                className="mx-auto w-[160px]"
                dangerouslySetInnerHTML={{ __html: t3Svg }}
              />
              <div className="mt-3 text-sm font-semibold">T3 — Scan-max</div>
              <div className="mt-1 text-xs text-neutral-600">
                Highest scan reliability.
              </div>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-neutral-200 bg-neutral-50 p-4">
            <div className="text-sm font-semibold">3-step workflow</div>
            <ol className="mt-2 space-y-2 text-sm text-neutral-700">
              <li>
                <span className="font-semibold">1)</span> Choose a template.
              </li>
              <li>
                <span className="font-semibold">2)</span> Add your link +
                (optional) logo.
              </li>
              <li>
                <span className="font-semibold">3)</span> Download PNG/SVG and
                use anywhere.
              </li>
            </ol>
          </div>
        </div>
      </section>

      {/* PRICING */}
      <section id="pricing" className="mt-14">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">Pricing</h2>
            <p className="mt-2 text-sm text-neutral-600">
              Simple access. No confusing settings. Print Pack sold separately.
            </p>
          </div>
          {entitled ? (
            <Link
              href="/qr-studio/dashboard"
              className="rounded-md bg-black px-4 py-2 text-sm font-medium text-white"
            >
              Open Dashboard
            </Link>
          ) : null}
        </div>

        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <QrCheckoutButtons />
          <p className="mt-3 text-xs text-neutral-500">
            Note: QR Studio is static only. No redirects, no analytics, no
            dynamic updates.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="mt-14">
        <h2 className="text-2xl font-semibold">FAQ (plain English)</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="text-sm font-semibold">Will it scan reliably?</div>
            <div className="mt-2 text-sm text-neutral-600">
              Yes. We enforce ECC H and a proper quiet zone. Templates are
              locked to avoid scan-breaking designs.
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="text-sm font-semibold">Is it a “dynamic” QR?</div>
            <div className="mt-2 text-sm text-neutral-600">
              No. Your QR encodes your link directly. No redirects. No tracking.
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="text-sm font-semibold">Can I use my logo?</div>
            <div className="mt-2 text-sm text-neutral-600">
              Yes on templates T1/T2. Logos are limited to 22% for scanner
              safety. (T3 is scan-max and does not allow logos.)
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-6">
            <div className="text-sm font-semibold">What files do I get?</div>
            <div className="mt-2 text-sm text-neutral-600">
              PNG (1024×1024) and SVG downloads.
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER CTA */}
      <section className="mt-14 rounded-2xl border border-neutral-200 bg-black p-8 text-white">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xl font-semibold">
              Ready to generate your QR?
            </div>
            <div className="mt-1 text-sm text-neutral-200">
              Pay once or monthly. Create. Download. Done.
            </div>
          </div>
          <div className="flex gap-3">
            {entitled ? (
              <Link
                href="/qr-studio/dashboard"
                className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black"
              >
                Open Dashboard
              </Link>
            ) : (
              <a
                href="#pricing"
                className="rounded-md bg-white px-5 py-2.5 text-sm font-medium text-black"
              >
                Choose a plan
              </a>
            )}
            <Link
              href={user ? "/qr-studio/dashboard" : "/signup"}
              className="rounded-md border border-white/30 bg-transparent px-5 py-2.5 text-sm font-medium text-white"
            >
              {user ? "My Projects" : "Create account"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
