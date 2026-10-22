# Contributing to PeachUI

PeachUI is a copy-first component library. Every file in `components/` is meant to be pasted into someone else's app and kept working there. Contributions that make components easier to copy, read, and own are the ones that matter most.

## Setup

```bash
bun install
bun dev
```

Open [http://localhost:3000](http://localhost:3000). The component index is at `/library`. `npm`/`pnpm` work too; the scripts are standard `next` commands.

Before sending a PR, run:

```bash
bun lint
bun run build
```

## What to work on

- **New components** at any tier: atoms (single controls), primitives (product patterns), blocks (composed sections).
- **Fixes** to existing components: broken keyboard behavior, missing focus states, hard-coded colors, copy that doesn't follow the writing bar below.
- **Docs.** Corrections to this file, the README, or `docs/` specs are welcome.

If you're porting something large or adding a new tier of components, open an issue first so the shape is agreed on before the work.

## Adding a component

1. **Write the component** at `components/{atoms|primitives|blocks}/kebab-name.tsx`. Use named exports and TypeScript interfaces for props. Look at neighboring files for conventions (e.g. `components/atoms/button.tsx`, `components/primitives/data-grid.tsx`).

2. **Add a demo** in `components/catalog/{atom|primitive|block}-demos.tsx`. Export it as `XxxDemo`. The demo is what renders on the doc page, so show the realistic variants, not every edge case.

3. **Register it** in [`lib/catalog/registry.tsx`](lib/catalog/registry.tsx) using the `atom()`, `primitive()`, or `block()` helper:

   ```ts
   atom({
     slug: "my-thing",
     title: "My thing",
     category: "Actions",
     description: "One line describing what it does.",
     deps: [RAC, "motion"], // npm deps beyond react/tailwind; omit if none
     Demo: A.MyThingDemo,
   }),
   ```

   The `slug` determines the source path (`components/atoms/my-thing.tsx`) and the doc URL. The description shows in the catalog; keep it one line and sentence case.

4. **Verify the paste test.** Copy the file, `lib/utils.ts`, and the token sections of `app/globals.css` into a minimal Next.js app. It should compile and look right with only the listed deps installed. If it needs `border-beam`, list `"border-beam"` in `deps` so consumers know to copy `components/border-beam/` too.

5. **Check both themes.** Toggle light/dark on the doc page. Nothing should be light-only or dark-only.

## The bar

These are review criteria, not suggestions. The full rationale lives in [`docs/PRD.md`](docs/PRD.md).

**Styling**
- Style with tokens from `globals.css`. No raw hex values or `text-[13px]` sizes in components; use the semantic type classes from `typography.css` (`text-body-medium`, `text-caption-1-semibold`, …).
- Never `transition-all`. List the transitioned properties.
- Respect `prefers-reduced-motion`. Never make motion the only feedback.

**Accessibility**
- Keyboard-navigable, visible focus, correct ARIA on composite widgets (menus, tabs, dialogs, listboxes).
- `react-aria-components` is the default for anything with complex interaction. Don't hand-roll it.

**Writing**
- Sentence case on buttons, titles, and catalog descriptions.
- Buttons start with a verb naming the action ("Save draft", not "OK").
- Errors say how to fix the problem, next to the field that failed. No "Oops!".
- Empty states say what the place is and give one next action.

**React**
- Avoid `useEffect` unless nothing else works. Derive state in render; lift state only when a parent actually needs it.
- `"use client"` only where the component actually needs the browser.

**Dependencies**
- Keep the dep list small. Prefer CSS and tokens over a new package. If a component genuinely needs a library, list it in the registry `deps` so the doc page shows it.

## Layout rules

- Production code imports from `@/components/...` and `@/lib/utils`. Never import from `sample/`; it's gitignored reference material and doesn't ship.
- `components/showroom/` and `components/catalog/` are doc-site chrome. Shipped components don't depend on them.
- `packages/templates/` holds full-screen template demos. They're reference implementations, not registry entries.

## PRs

- Keep PRs scoped: one component or one fix, not a sweep.
- Include a demo for new components and note which deps you added.
- Screenshots of light + dark help reviewers.

## License

By contributing, you agree your work is licensed under the [MIT License](LICENSE).
