import PresenceDemoRenderer from "../_components/PresenceDemoRenderer";

export const dynamic = "force-dynamic";

type PresenceDemoPageProps = {
  params: { slug: string };
};

export default function PresenceDemoPage(props: PresenceDemoPageProps) {
  return <PresenceDemoRenderer slug={props.params.slug} />;
}
