# AGENTS.md

Context for coding agents working in this repo.

## What this is

PeachUI is a copy-first React component library. Files under `components/` are pasted into consumer apps, so every shipped file must compile standalone given `lib/utils.ts`, the tokens in `app/globals.css` + `app/typography.css`, and its declared deps. The Next.js app in `app/` is the catalog that demos the components, not the product itself.

## Commands

```bash
bun install   # deps
bun dev       # catalog at http://localhost:3000 (component index at /library)
bun run build
bun lint
```

## Layout

```text
app/                Next.js catalog site; globals.css + typography.css are the token source of truth
components/
  atoms/            Tier 1, single-purpose controls — copy-ready
  primitives/       Tier 2, composed product patterns — copy-ready
  blocks/           Tier 3, composed sections — copy-ready
  border-beam/      Shared animated-border dep
  lib/              Shared helpers shipped components import (motion presets, menu styles)
  types/            Shared TypeScript types
  data/             Demo data and shipped component defaults
  catalog/          Demo wrappers rendered on doc pages — not shipped
  showroom/         Doc-page chrome — not shipped
lib/
  utils.ts          cn / cx / sortCx — required by every component
  catalog/registry  Every component's slug, title, category, deps, sourcePath
packages/templates/ Tier 4, full product screens — reference only
sample/             Gitignored reference material — never import from here
docs/               The product north star (PRD.md)
```

## Rules for anything under `components/`

- **Tokens only.** No raw hex, no `text-[13px]` sizes. Use `globals.css` variables and the semantic type classes in `typography.css` (`text-body-medium`, `text-caption-1-semibold`).
- **Kebab-case filenames, named exports, TypeScript interfaces** for props. Match neighboring files.
- **Imports:** `@/lib/utils` for `cn`/`cx`; `@/components/lib/*`, `@/components/types/*`, `@/components/data/*` are allowed and count as part of the copy surface. Never import from `sample/` or `components/showroom`.
- **Motion:** import from `@/components/lib/motion`, not `motion/react` directly. No `transition-all`; respect `prefers-reduced-motion`.
- **Client boundaries:** `"use client"` only where the component needs the browser.
- **Effects:** avoid `useEffect` unless nothing else works. Derive state in render.
- **Interaction:** use `react-aria-components` for complex widgets (menus, dialogs, listboxes, sliders). Don't hand-roll them.
- **Copy:** sentence case; verb-first button labels; errors say how to fix; empty states orient the reader and give one next action.

## Adding a component

1. Create `components/{atoms|primitives|blocks}/kebab-name.tsx`.
2. Add a `XxxDemo` export in `components/catalog/{atom|primitive|block}-demos.tsx`.
3. Register it in `lib/catalog/registry.tsx` via `atom()`/`primitive()`/`block()` with slug, title, category, one-line description, `deps` (npm packages beyond react/tailwind; `"border-beam"` means copy that folder), and `Demo`.
4. Verify the file pastes cleanly into a minimal Next app with only the listed deps, and check light + dark.

Full contributor workflow: [CONTRIBUTING.md](CONTRIBUTING.md). User-facing overview: [README.md](README.md).

## Specs

- `docs/PRD.md` — positioning, tokens, taxonomy, quality bar. When a spec and the repo disagree, the repo wins.
