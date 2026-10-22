# components/data/

Shared data used across the component tree. Two kinds of files live here:

- **Shipped defaults.** Things like `agent-composer-defaults.ts` or `social-providers.ts` are imported by copy-ready components themselves. If a component imports from `@/components/data/*`, that file is part of its copy surface.
- **Demo data.** Presets and fixtures used by `components/catalog/` demos to render realistic content.

Demo data follows the writing bar: realistic product-flavored content, `example.com` / `*.peach-ui.dev` domains, no lorem ipsum, no inside jokes in user-visible strings.
