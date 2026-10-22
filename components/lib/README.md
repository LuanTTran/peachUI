# components/lib/

Shared helpers that shipped components import. Part of the copy surface: if a component imports from `@/components/lib/*`, that helper goes with it.

- **`motion.ts`** — the sanctioned motion entry point. Re-exports `motion/react` plus shared easing/spring presets and `useReducedMotion` wrappers. Components import from here, not `motion/react` directly.
- **`block-motion.ts`** — CSS reveal helpers for blocks.
- **`menu-styles.ts`** — shared class fragments for dropdowns, selects, and comboboxes so every menu feels identical.
- **`agent-run-format.ts`**, **`data-grid-utils.ts`**, **`sidebar-nav-chrome.ts`**, **`breakdown-card-motion.ts`** — scoped helpers for the components named in them.
