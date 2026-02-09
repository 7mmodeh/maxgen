import type { LayoutProps } from "./layout-types";

export default function QuoteCard(
  props: Pick<LayoutProps, "tpl" | "serviceOptions">,
) {
  const { tpl, serviceOptions } = props;

  return (
    <div
      className="rounded-3xl border bg-white p-6 shadow-sm sm:p-7"
      style={{
        borderColor: "var(--ring)",
        boxShadow: "var(--shadow)",
      }}
    >
      <p className="text-sm font-semibold" style={{ color: "var(--ink)" }}>
        Get a fast quote
      </p>
      <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>
        Send details — we’ll reply quickly with next steps.
      </p>

      <form className="mt-5 grid gap-4">
        <label className="grid gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Name
          </span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--ring)" }}
            placeholder="Your name"
            name="name"
            autoComplete="name"
          />
        </label>

        <label className="grid gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Phone
          </span>
          <input
            className="rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--ring)" }}
            placeholder="+353…"
            name="phone"
            autoComplete="tel"
          />
        </label>

        <label className="grid gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Service
          </span>
          <select
            className="rounded-xl border bg-white px-3 py-2 text-sm"
            style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
            name="service"
            defaultValue=""
          >
            <option value="" disabled>
              Select a service
            </option>
            {serviceOptions.map((opt) => (
              <option key={opt} value={opt}>
                {opt}
              </option>
            ))}
            <option value="Other">Other</option>
          </select>
        </label>

        <label className="grid gap-2">
          <span
            className="text-sm font-semibold"
            style={{ color: "var(--ink)" }}
          >
            Message
          </span>
          <textarea
            className="min-h-[110px] rounded-xl border px-3 py-2 text-sm"
            style={{ borderColor: "var(--ring)" }}
            placeholder="Tell us what you need (photos help)."
            name="message"
          />
        </label>

        <div className="grid gap-3">
          <a
            href={tpl.contact.whatsappHref}
            className="rounded-2xl px-5 py-3 text-center text-sm font-semibold text-white shadow-sm"
            style={{ background: "var(--accent)" }}
          >
            Send via WhatsApp
          </a>

          <a
            href={tpl.contact.phoneHref}
            className="rounded-2xl border bg-white px-5 py-3 text-center text-sm font-semibold"
            style={{ borderColor: "var(--ring)", color: "var(--ink)" }}
          >
            Or call now
          </a>

          <p className="text-xs" style={{ color: "var(--muted)" }}>
            Demo form only — your live site can route form submissions by email
            or CRM.
          </p>
        </div>
      </form>
    </div>
  );
}
