# components/catalog/

Demo wrappers for the doc site, not shipped components.

Each file exports `XxxDemo` components that render a component on its catalog page. `atom-demos.tsx`, `primitive-demos.tsx`, and `block-demos.tsx` map to the three tiers; the registry ([`lib/catalog/registry.tsx`](../../lib/catalog/registry.tsx)) wires each demo to its entry.

Keep demos focused: show the realistic variants and states someone would actually copy, not every prop combination. Demos use PeachUI copy conventions (sentence case, real-looking content, no lorem ipsum).

Nothing under `components/` should import from here.
