import { Suspense } from "react";
import { DocLayout } from "@/components/showroom/doc-layout";
import { CATALOG } from "@/lib/catalog/registry";
import { TEMPLATES } from "@/lib/templates";

const navEntries = CATALOG.filter((e) => e.tier === "blocks").map(({ tier, slug, title }) => ({
  tier,
  slug,
  title,
}));

export default function DocsLayout({ children }: LayoutProps<"/">) {
  return (
    <Suspense fallback={<div className="min-h-dvh bg-page" />}>
      <DocLayout entries={navEntries} templates={TEMPLATES}>
        {children}
      </DocLayout>
    </Suspense>
  );
}
