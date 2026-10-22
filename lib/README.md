# lib/

Site-level utilities. Two things matter to consumers; the rest is catalog internals.

## Copy these

- **`utils.ts`** — `cn`/`cx` (clsx + tailwind-merge extended for the PeachUI type scale) and `sortCx`. Every component assumes these exist. Requires the `clsx` and `tailwind-merge` packages.

## Catalog internals

- **`catalog/`** — the registry (`registry.tsx`, `types.ts`, `paths.ts`): every component's slug, title, category, description, deps, and source path. This is the machine-readable manifest of the library.
- **`templates.ts`** — metadata for the tier-4 template routes.
- **`chart/`**, **`hairline/`** — engines behind the Live line block and hairline illustrations.
- **`use-*.ts`** — hooks the catalog and some components use (`use-mount-effect`, `use-element-size`, …).
- **`document-theme.ts`**, **`site.ts`**, **`read-source.ts`** — theme plumbing, site metadata, and the source-file loader for doc pages.
