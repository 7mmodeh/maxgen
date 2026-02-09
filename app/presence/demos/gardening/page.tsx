import PresenceDemoPage from "../[slug]/page";

export const dynamic = "force-dynamic";

export default function GardeningDemoPage() {
  return <PresenceDemoPage params={{ slug: "gardening" }} />;
}
