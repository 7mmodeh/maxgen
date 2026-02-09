import PresenceDemoPage from "../[slug]/page";

export const dynamic = "force-dynamic";

export default function PaintingDemoPage() {
  return <PresenceDemoPage params={{ slug: "painting" }} />;
}
