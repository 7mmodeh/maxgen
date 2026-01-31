import Link from "next/link";

export default function BillingCancelPage() {
  return (
    <main className="mx-auto w-full max-w-2xl px-6 py-16">
      <h1 className="text-2xl font-semibold">Checkout canceled</h1>
      <p className="mt-2 text-sm opacity-80">
        No payment was taken. You can try again anytime.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link
          href="/online-presence#packages"
          className="rounded-lg px-5 py-3 text-sm font-semibold"
          style={{ background: "var(--mx-cta)", color: "#fff" }}
        >
          Try again
        </Link>
        <a
          href="mailto:info@maxgensys.com?subject=Checkout%20Question"
          className="rounded-lg px-5 py-3 text-sm font-semibold border"
        >
          Email support
        </a>
      </div>
    </main>
  );
}
