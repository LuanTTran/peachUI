import { CatalogSlugDocPage } from "@/components/showroom/catalog-slug-page";

type PageProps = { params: Promise<{ slug: string }> };

export default function AtomDemoPage({ params }: PageProps) {
  return <CatalogSlugDocPage tier="atoms" params={params} />;
}
