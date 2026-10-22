import type { ComponentType } from "react";

export type CatalogTier = "atoms" | "primitives" | "blocks";

/** Region or module inside a block demo — shown on the doc page, not separate catalog entries. */
export type CatalogComposedPart = {
  role: string;
  path: string;
  /** When set, links to another catalog route (e.g. Prompt deck from Agent chat). */
  href?: string;
};

export type CatalogEntry = {
  slug: string;
  title: string;
  description: string;
  category: string;
  tier: CatalogTier;
  sourcePath: string;
  deps?: string[];
  composedOf?: CatalogComposedPart[];
  /** Full-width doc column for shell / dashboard previews (default `42rem`). */
  demoLayout?: "default" | "wide";
  Demo: ComponentType;
};
