import Link from "next/link";
import { SITE } from "@/lib/site";
import { DrawersHero } from "@/components/showroom/drawers-hero";

export default function HomePage() {
  return (
    <article className="doc-article doc-article--home">
      <div className="doc-hero">
        <div className="doc-hero-copy">
          <header className="doc-article-header">
            <h1 className="doc-article-title">{SITE.name}</h1>
            <p className="doc-article-lead">{SITE.tagline}</p>
          </header>
          <p className="doc-prose">
            &ldquo;THIS IS NOT ANOTHER UI LIBRARY.&rdquo; 
            <br/>
            1ST - NO INSTALLATION NEEDED ( so you wont be affraid of supply chain attacks)
            <br/>
            2ND - COPY & PASTE READY COMPONENTS ( no copyright, no licensing issues )
            <br/>
            3RD - AGENTS FRIENDLY E2E INTEGRATION DOCS ( make your life easier )
          </p>
          <p className="doc-prose">
            My philosophy: your TOKENS are better spent on business logic and tests
            than on rebuilding a dropdown for the ninth time. 
            Save your TOKENS and still make your UIs premium. 
          </p>
          <p className="doc-prose">
            Browse a block, try it live, then copy the files into your app. Open the{" "}
            <Link href="/components" className="doc-text-link">blocks overview</Link>{" "}
            or jump in from the sidebar.
          </p>
        </div>
        <DrawersHero />
      </div>
    </article>
  );
}
