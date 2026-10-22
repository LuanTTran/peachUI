import { CatalogSlugDocPage } from "@/components/showroom/catalog-slug-page";

type PageProps = { params: Promise<{ slug: string }> };

export default function PrimitiveDemoPage({ params }: PageProps) {
  return <CatalogSlugDocPage tier="primitives" params={params} />;
}
