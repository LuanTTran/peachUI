import Link from "next/link";
import type { CatalogEntry } from "@/lib/catalog/types";
import { tierLabel } from "@/lib/catalog/paths";
import { DemoStage } from "@/components/showroom/demo-stage";
import { SourcePanel } from "@/components/showroom/source-panel";

type DocEntryProps = {
  entry: CatalogEntry;
  source: string;
  children: React.ReactNode;
};

export function DocEntry({ entry, source, children }: DocEntryProps) {
  const wide = entry.demoLayout === "wide";

  return (
    <article className={wide ? "doc-article doc-article--wide" : "doc-article"}>
      <header className="doc-article-header">
        <p className="doc-article-kicker">
          {tierLabel(entry.tier)} · {entry.category}
        </p>
        <h1 className="doc-article-title">{entry.title}</h1>
        <p className="doc-article-lead">{entry.description}</p>
      </header>

      <section className="doc-demo" aria-label={`${entry.title} demo`}>
        <DemoStage wide={wide}>{children}</DemoStage>
      </section>

      {entry.composedOf && entry.composedOf.length > 0 ? (
        <section className="mt-10" aria-labelledby="doc-composed-heading">
          <h2 id="doc-composed-heading" className="text-body-strong text-ink">
            Built from
          </h2>
          <p className="mt-1 text-caption text-ink-3">
            Paste the block file plus these modules; they are not separate catalog entries.
          </p>
          <ul className="doc-composed-list">
            {entry.composedOf.map((part) => (
              <li key={`${part.role}-${part.path}`}>
                <span className="text-ink-2">{part.role}</span>
                {" · "}
                {part.href ? (
                  <Link href={part.href} className="doc-text-link font-mono text-[13px]">
                    {part.path}
                  </Link>
                ) : (
                  <span className="font-mono text-[13px] text-ink-3">{part.path}</span>
                )}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <SourcePanel source={source} deps={entry.deps} />
      <p className="doc-source-path">{entry.sourcePath}</p>
    </article>
  );
}
