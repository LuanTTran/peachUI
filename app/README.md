# app/

The Next.js catalog site. Its job is to demo the library, so treat it as infrastructure, not product.

- **`(docs)/`** — the catalog: home, the `/library` index, and per-component pages at `/atoms/[slug]`, `/primitives/[slug]`, `/blocks/[slug]`. Slugs come from [`lib/catalog/registry.tsx`](../lib/catalog/registry.tsx).
- **`(templates)/`** — routes that mount the tier-4 template demos from `packages/templates/`.
- **`globals.css`** — the design token source of truth: colors, shadows, focus styles, and the `.dark` variant. Consumers copy this file; keep it tidy and self-contained.
- **`typography.css`** — the semantic type scale (`text-body-medium`, `text-caption-1-semibold`, …).
- **`layout.tsx`** — shell + the theme init script that reads `peach-ui-theme` before hydration.

The site imports components via `@/components/...` exactly like a consumer app would. It never imports from `sample/`.
