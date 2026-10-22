# components/primitives/

Tier 2. Composed product patterns: multi-part surfaces built from atoms and shared helpers, still one file each. This is where most of the agent-specific material lives.

Copy a file plus the shared bits described in [components/README.md](../README.md#the-copy-contract).

## Index

- **Agent:** Agent thinking, Agent log, Agent inline chips, Composer loader, Loading state, Streaming text
- **Data display:** Data table, Data grid
- **Dashboard:** Stat cards, Orders chart, Revenue chart, Alerts card, Profile card
- **Settings:** Theme toggle

Primitives may import atoms, `components/lib` helpers (motion presets, menu styles), and `components/types` / `components/data` for shared types and defaults. Those imports are part of the copy surface: check the file's imports and copy what it needs, or check `deps` on the catalog page.

## Adding a primitive

1. `kebab-name.tsx`, named exports, props as a `XxxProps` interface. If the component has user-visible strings, consider a `XxxLabels` type with defaults so consumers can reword without forking.
2. Demo as `XxxDemo` in [`../catalog/primitive-demos.tsx`](../catalog/primitive-demos.tsx).
3. Registry entry via `primitive({ ... })` in [`lib/catalog/registry.tsx`](../../lib/catalog/registry.tsx).

The quality bar (tokens, a11y, copy) is in [CONTRIBUTING.md](../../CONTRIBUTING.md#the-bar).
