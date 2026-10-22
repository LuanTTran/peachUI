import { CatalogSlugDocPage } from "@/components/showroom/catalog-slug-page";

type PageProps = { params: Promise<{ slug: string }> };

export default function BlockDemoPage({ params }: PageProps) {
  return <CatalogSlugDocPage tier="blocks" params={params} />;
}
