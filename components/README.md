# components/

The PeachUI library. Everything in `atoms/`, `primitives/`, and `blocks/` is copy-ready: paste the file into your app and it's yours.

## Tiers

| Directory | What it is |
| --- | --- |
| [`atoms/`](atoms/) | Single-purpose controls: Button, Input, Select, Tooltip |
| [`primitives/`](primitives/) | Composed product patterns: Agent thinking, Data grid, Streaming text |
| [`blocks/`](blocks/) | Full-featured sections: Agent chat, Kanban board, Settings |

[`packages/templates/`](../packages/templates/) holds tier 4, whole product screens, kept separate because they're reference implementations rather than single-file drops.

## The copy contract

A file in `atoms/`, `primitives/`, or `blocks/` must compile standalone in a React 19 + Tailwind 4 + TypeScript app once you have:

1. The tokens from [`app/globals.css`](../app/globals.css) and [`app/typography.css`](../app/typography.css)
2. `cn`/`cx`/`sortCx` from [`lib/utils.ts`](../lib/utils.ts)
3. Whatever the file actually imports from `lib/` or `components/lib|types|data|border-beam`
4. The npm deps listed on the component's catalog page (same list lives in [`lib/catalog/registry.tsx`](../lib/catalog/registry.tsx))

No hidden sub-imports, no raw hex, no hard-coded font stacks. If a file breaks this contract, that's a bug worth an issue.

## Shared directories

| Directory | Role | Shipped? |
| --- | --- | --- |
| [`border-beam/`](border-beam/) | Animated border effect used by a few components | Yes, copy it when listed in `deps` |
| [`lib/`](lib/) | Helpers shipped components import: `motion` presets, `menu-styles`, format utils | Yes, copy what your component imports |
| [`types/`](types/) | Shared TypeScript types (`agent-composer`, `agent-run`, …) | Yes, same rule |
| [`data/`](data/) | Demo data and default props | Yes where a component imports it; mostly demo material |
| [`catalog/`](catalog/) | `XxxDemo` wrappers rendered on doc pages | No — doc site only |
| [`showroom/`](showroom/) | Doc-page chrome (source panel, doc entry) | No |

## Conventions

Kebab-case filenames, named exports, interfaces for props. Style with `globals.css` tokens and `typography.css` classes; never raw hex or `text-[13px]`. Full rules in [CONTRIBUTING.md](../CONTRIBUTING.md) and [AGENTS.md](../AGENTS.md).
