import Link from "next/link";
import { entriesForTier } from "@/lib/catalog/registry";
import { entryHref } from "@/lib/catalog/paths";
import { SITE } from "@/lib/site";

/** Catalog index — served at `/components` via rewrite (avoids `app/components` vs `/components` HMR clash). */
export default function ComponentsIndexPage() {
  return (
    <article className="doc-article">
      <header className="doc-article-header">
        <h1 className="doc-article-title">Blocks</h1>
        <p className="doc-article-lead">
          Composed blocks you can drop into a product: sidebar, settings modal, sign-in, dashboards, and agent surfaces. Each page shows a live preview and the source to copy.
        </p>
      </header>

      <section className="mb-8">
        <ul className="doc-index-list mt-2">
          {entriesForTier("blocks").map((entry) => (
            <li key={entry.slug}>
              <Link href={entryHref(entry)} className="doc-text-link">
                {entry.title}
              </Link>
              <span className="text-ink-3"> · {entry.description}</span>
            </li>
          ))}
        </ul>
      </section>

      <p className="doc-prose doc-prose-muted">
        <Link href="/" className="doc-text-link">{SITE.name}</Link>
      </p>
    </article>
  );
}
