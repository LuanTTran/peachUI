import { Suspense } from "react";
import { notFound } from "next/navigation";
import { DocEntry } from "@/components/showroom/doc-entry";
import { entryBySlug } from "@/lib/catalog/registry";
import type { CatalogTier } from "@/lib/catalog/types";
import { readComponentSource } from "@/lib/read-source";

function CatalogEntryFallback() {
  return (
    <article className="doc-article" aria-busy="true">
      <header className="doc-article-header">
        <div className="mb-2 h-4 w-20 animate-pulse rounded bg-inset" />
        <div className="h-9 max-w-md w-2/3 animate-pulse rounded bg-inset" />
        <div className="mt-2 h-5 max-w-lg w-full animate-pulse rounded bg-inset" />
      </header>
      <div className="doc-demo min-h-48 animate-pulse rounded-card bg-inset" />
    </article>
  );
}

async function CatalogSlugDoc({
  tier,
  params,
}: {
  tier: CatalogTier;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const entry = entryBySlug(tier, slug);
  if (!entry) notFound();

  const source = await readComponentSource(entry.sourcePath);
  const Demo = entry.Demo;

  return (
    <DocEntry entry={entry} source={source}>
      <Demo />
    </DocEntry>
  );
}

export function CatalogSlugDocPage({
  tier,
  params,
}: {
  tier: CatalogTier;
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense fallback={<CatalogEntryFallback />}>
      <CatalogSlugDoc tier={tier} params={params} />
    </Suspense>
  );
}
