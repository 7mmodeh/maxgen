import type React from "react";
import Link from "next/link";
import { getPresenceDemo } from "@/src/lib/presence-demo/templates";
import type { LayoutId } from "@/src/lib/presence-demo/types";
import type { CssVars } from "../[slug]/_components/layouts/layout-types";

import LayoutLpPremium from "../[slug]/_components/layouts/LayoutLpPremium";
import LayoutSplitModern from "../[slug]/_components/layouts/LayoutSplitModern";
import LayoutCleanClassic from "../[slug]/_components/layouts/LayoutCleanClassic";

type Props = {
  slug: string;
};

function safeServiceOptions(titles: readonly string[]): readonly string[] {
  const uniq = Array.from(new Set(titles.map((t) => t.trim()).filter(Boolean)));
  return uniq.slice(0, 8);
}

function buildVars(args: {
  accent: string;
  accentSoft: string;
  ink: string;
  muted: string;
  ring: string;
  themeId: string;
}): CssVars {
  return {
    ["--accent"]: args.accent,
    ["--accentSoft"]: args.accentSoft,
    ["--accentSoft2"]: args.themeId === "premium" ? "#fff7ed" : args.accentSoft,
    ["--ink"]: args.ink,
    ["--muted"]: args.muted,
    ["--ring"]: args.ring,
    ["--shadow"]: "0 20px 60px rgba(2, 6, 23, 0.10)",
  };
}

function renderLayout(
  layoutId: LayoutId,
  props: {
    vars: CssVars;
    tpl: NonNullable<ReturnType<typeof getPresenceDemo>>;
    serviceOptions: readonly string[];
  },
) {
  const { tpl, vars, serviceOptions } = props;

  if (layoutId === "lp_premium") {
    return (
      <LayoutLpPremium tpl={tpl} vars={vars} serviceOptions={serviceOptions} />
    );
  }

  if (layoutId === "split_modern") {
    return (
      <LayoutSplitModern
        tpl={tpl}
        vars={vars}
        serviceOptions={serviceOptions}
      />
    );
  }

  return (
    <LayoutCleanClassic tpl={tpl} vars={vars} serviceOptions={serviceOptions} />
  );
}

export default function PresenceDemoRenderer(props: Props) {
  const tpl = getPresenceDemo(props.slug);

  if (!tpl) {
    return (
      <main className="mx-auto w-full max-w-4xl px-4 py-10">
        <h1 className="text-2xl font-semibold">Demo not found</h1>
        <p className="mt-2 text-neutral-600">This demo slug does not exist.</p>
        <div className="mt-6 flex gap-4">
          <Link
            className="text-sm text-neutral-700 hover:underline"
            href="/presence/demos"
          >
            ← Back to demos
          </Link>
          <Link className="text-sm text-neutral-700 hover:underline" href="/">
            Home
          </Link>
        </div>
      </main>
    );
  }

  const vars = buildVars({
    accent: tpl.theme.accent,
    accentSoft: tpl.theme.accentSoft,
    ink: tpl.theme.ink,
    muted: tpl.theme.muted,
    ring: tpl.theme.ring,
    themeId: tpl.theme.id,
  });

  const serviceOptions = safeServiceOptions(tpl.services.map((s) => s.title));

  return renderLayout(tpl.layoutId, { tpl, vars, serviceOptions });
}
