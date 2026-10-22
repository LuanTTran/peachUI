import type { CatalogEntry, CatalogTier } from "@/lib/catalog/types";

/** Full catalog index (atoms, primitives, blocks). */
export const CATALOG_TIERS: CatalogTier[] = ["atoms", "primitives", "blocks"];

/** Doc sidebar — blocks only while the blocks vertical is the focus. */
export const DOC_NAV_TIERS: CatalogTier[] = ["blocks"];

const TIER_LABELS: Record<CatalogTier, string> = {
  atoms: "Atoms",
  primitives: "Primitives",
  blocks: "Blocks",
};

export function entryHref(entry: Pick<CatalogEntry, "tier" | "slug">) {
  if (entry.tier === "blocks") return `/blocks/${entry.slug}`;
  if (entry.tier === "atoms") return `/atoms/${entry.slug}`;
  return `/primitives/${entry.slug}`;
}

export function entryFullHref(entry: Pick<CatalogEntry, "tier" | "slug">) {
  return `${entryHref(entry)}/full`;
}

export function tierLabel(tier: CatalogTier) {
  return TIER_LABELS[tier];
}
