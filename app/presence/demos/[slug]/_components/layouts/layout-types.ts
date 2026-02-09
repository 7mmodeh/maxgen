import type React from "react";
import type { PresenceDemoTemplate } from "../../../../../../src/lib/presence-demo/types";

export type CssVars = React.CSSProperties & {
  ["--accent"]?: string;
  ["--accentSoft"]?: string;
  ["--accentSoft2"]?: string;
  ["--ink"]?: string;
  ["--muted"]?: string;
  ["--ring"]?: string;
  ["--shadow"]?: string;
};

export type LayoutProps = {
  tpl: PresenceDemoTemplate;
  vars: CssVars;
  serviceOptions: readonly string[];
};
