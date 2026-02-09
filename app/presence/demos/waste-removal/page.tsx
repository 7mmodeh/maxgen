import PresenceDemoPage from "../[slug]/page";

export const dynamic = "force-dynamic";

export default function WasteRemovalDemoPage() {
  return <PresenceDemoPage params={{ slug: "waste-removal" }} />;
}
