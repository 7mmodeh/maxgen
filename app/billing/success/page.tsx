import Link from "next/link";

export default function BillingSuccessPage({
  searchParams,
}: {
  searchParams?: { session_id?: string };
}) {
  const sessionId = searchParams?.session_id ?? null;

  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Payment successful</h1>
      <p className="mt-2 text-sm opacity-80">
        Thanks — your purchase is being activated. If this is a subscription,
        access may take a few seconds to reflect.
      </p>

      {sessionId ? (
        <div className="mt-6 rounded-xl border p-4 text-sm">
          <div className="opacity-70">Stripe session</div>
          <div className="font-mono break-all">{sessionId}</div>
        </div>
      ) : null}

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/account"
          className="rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Go to Account
        </Link>
        <Link
          href="/online-presence"
          className="rounded-lg px-5 py-3 text-sm font-semibold border"
        >
          Back to Online Presence
        </Link>
      </div>
    </main>
  );
}
