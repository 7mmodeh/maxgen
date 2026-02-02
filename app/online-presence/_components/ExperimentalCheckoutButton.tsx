"use client";

import { supabaseBrowser } from "@/src/lib/supabase/browser";

type Props = {
  className?: string;
  style?: React.CSSProperties;
};

export default function ExperimentalCheckoutButton({
  className,
  style,
}: Props) {
  return (
    <button
      type="button"
      className={className}
      style={style}
      onClick={async () => {
        const { data } = await supabaseBrowser.auth.getSession();
        const token = data.session?.access_token;

        if (!token) {
          window.location.href = "/login?next=/online-presence";
          return;
        }

        const res = await fetch("/api/stripe/checkout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ kind: "experimental_eur1" }),
        });

        const json = (await res.json()) as { url?: string; error?: string };

        if (!res.ok || !json.url) {
          alert(json.error ?? "Checkout failed");
          return;
        }

        window.location.href = json.url;
      }}
    >
      Experimental €1 Checkout
    </button>
  );
}
