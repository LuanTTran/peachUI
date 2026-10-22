# PeachUI — Product Requirements Document (North Star)

| | |
| --- | --- |
| **Version** | 0.1 |
| **Status** | Draft |
| **Last updated** | October 9, 2026 |
| **Owner** | PeachUI maintainers |

---

## 1. Executive summary

**PeachUI** is an open-source React component library and live catalog. Components are ported and refined from the reference implementation in `sample/components`, styled with a PeachUI design system (tokens, typography, motion), and documented so anyone can **copy source into their app** or follow patterns without a heavy npm abstraction layer.

The public site is a Next.js app that **shows every component interactively**, exposes **copy-ready source**, and demonstrates **light and dark themes** aligned with **Cursor IDE–like** neutral chrome (achromatic surfaces, restrained accent, crisp hierarchy).

### Primary deliverables

| Deliverable | Description |
| --- | --- |
| **Design foundation** | `app/globals.css` — tokens, `@font-face` for `public/font`, Tailwind v4 `@theme`, `.dark` variant |
| **Component library** | Reusable React components (atoms → primitives → optional blocks) under a stable `components/` tree |
| **Catalog** | Browse, preview variants, copy code, toggle theme — modeled on `sample/components/site/` |
| **Open source** | Clear license, contribution path, no proprietary demo copy left in shipped examples |

---

## 2. Vision and positioning

### Vision

Make polished, agent-era and product UI **easy to steal**: small files, obvious tokens, copy-paste friendly React — not an opaque design-system package.

### Positioning

| Dimension | PeachUI |
| --- | --- |
| **vs shadcn** | Same “copy the file” ethos; PeachUI adds a cohesive **Peach** brand, **v3 token palette**, and **reference blocks** (chat, tables, kanban, etc.) from `sample/components` |
| **vs BoardUI sample** | PeachUI is the **brand-forward, OSS-facing** catalog; `sample/boardui-main` remains reference only unless explicitly ported |
| **Audience** | Frontend engineers, design engineers, and teams building dashboards, agents, and dense tools |

### One-line promise

> Cursor-clear interfaces with Peach warmth — copy the component, keep the craft.

---

## 3. Problem and opportunity

**Problem:** Teams want production-grade UI for AI and ops-heavy products without adopting a monolithic kit or re-deriving tokens, motion, and copy from scratch.

**Opportunity:** `sample/components` already encodes a full tiered library (~40+ atoms, ~50+ primitives, ~40+ blocks), a **v3 oklch token system** in `sample/components/globals.css`, and catalog UX (`Grid`, `Foundations`, `Nav`, theme sync). The root app is still the default Create Next App shell (`app/page.tsx`, Geist fonts, minimal `app/globals.css`).

**Gap to close:** Promote reference → **first-class `app/` + `components/`**, unify branding/copy, wire fonts from `public/font`, align theme with **explicit light/dark** (class-based, Cursor-style), and publish as OSS.

---

## 4. Goals and success metrics

### Goals (MVP → v1)

1. **Foundation parity:** Root `app/globals.css` carries the token model from `sample/components/globals.css`, adapted for PeachUI (colors “turned up” per brand direction in [§8.3](#83-visual-identity-direction)).
2. **Font story:** Declare `@font-face` for assets in `public/font/` and map `--font-peachy-sans` (and mono stack) into `@theme inline`; remove default Geist as the primary UI face in layout when PeachUI fonts are active.
3. **Component port:** Ship a **prioritized subset** of reference components with PeachUI copy and no broken `#/` or missing deps.
4. **Catalog:** Live grid with copy + code view (per `sample/components/site/Grid.tsx` behavior).
5. **Theming:** User-controlled **light / dark** with flash-free init (`ThemeSync` pattern), default sensible for dev tools audience (dark-friendly).
6. **OSS readiness:** LICENSE, README, contributing notes, and license-safe fonts/assets.

### Success metrics

| Metric | Target (6 months post-launch) |
| --- | --- |
| GitHub stars / forks | Community signal (set baseline at launch) |
| Copy actions on catalog | Track if analytics added; qualitatively “copy is primary CTA” |
| Time to first copied component | &lt; 5 minutes from README |
| Lighthouse a11y (catalog home) | ≥ 90 |
| Issue rate “component doesn’t compile standalone” | Trend down via registry + deps doc |

---

## 5. Non-goals (explicit)

- **Not** a mandatory npm UI package with semver API guarantees in v1 (copy-first; package later optional).
- **Not** replicating every whimsical block name/demo narrative from reference if it conflicts with PeachUI voice.
- **Not** bundling Apple SF Pro for redistribution without a **legal review** — see [§10.3](#103-font-licensing-risk).
- **Not** full parity with `sample/boardui-main` in MVP.
- **Not** a Figma-only design system without code.

---

## 6. Users and jobs-to-be-done

| Persona | Job |
| --- | --- |
| **Solo builder** | Drop a button, table, or chat composer into a Next app in one paste |
| **Design engineer** | Tune tokens once in CSS; all components inherit |
| **OSS contributor** | Add a primitive with registry entry + demo + a11y pass |
| **Agent/tooling team** | Reuse agent-specific primitives (composer, thinking state, tool chips) with consistent chrome |

---

## 7. Product principles (skills as quality bar)

These skills are **binding review criteria** for every component and page, not optional polish.

### 7.1 `better-ui`

- Concentric radii on nested surfaces; shadows for elevation, borders for structure/state.
- Press feedback `scale(0.96)` on buttons where motion is appropriate; `static` escape hatch.
- No `transition: all`; interruptible CSS transitions for state.
- Icons: `currentColor`, stroke matched to text weight, outline default / fill for active.
- Motion restraint on high-frequency interactions; never motion-only feedback.

### 7.2 `better-writing`

- **Voice:** One PeachUI voice — warm in empty/onboarding, neutral in settings, plain in errors.
- **Buttons:** Verb-first; destructive confirmations repeat the consequence.
- **Capitalization:** Sentence case default for buttons and most UI chrome.
- **Empty states:** Orient + one next action (replace reference “scoops/parlor” demo tone where it’s inside jokes).
- **Errors:** Fix instruction adjacent to field; no “Oops!”

### 7.3 `better-typography`

- Type scale via semantic tokens (`.text-body`, `.text-section-title`, etc. — port from reference CSS).
- `antialiased` on root; tabular nums on changing metrics.
- Headings: `text-wrap: balance`; descriptions: `text-wrap: pretty` where appropriate.
- Inputs **16px on mobile** (`text-base` then `sm:text-sm` pattern).
- Prefer **woff2** for web; if staying on OTF in repo short-term, document conversion path.

### 7.4 Related skills (apply when in scope)

- `better-accessibility` — focus rings, keyboard, ARIA on composites.
- `no-use-effect` — prefer patterns that avoid effect-heavy React; keep `ThemeSync`-style mount fixes only where necessary.
- `transitions-dev` / `transitions-polish` — when adding motion beyond reference.

---

## 8. Brand: PeachUI

### 8.1 Name and tone

- **Product name:** PeachUI (capital P, capital UI in prose: “PeachUI components”).
- **Domains in demos:** Use neutral placeholders (`docs.peach-ui.dev`, `studio.peach-ui.dev`) or generic examples — consistent with reference primitives, updated copy where needed.
- **Replace** internal/board-specific demo names in user-visible strings unless the block is explicitly marked “playful example.”

### 8.2 Copywriting guidelines (PeachUI-specific)

| Element | Guideline | Example |
| --- | --- | --- |
| Hero | Outcome-first, not feature laundry list | “Copy-ready React components for tools and agents” |
| Catalog CTAs | “Copy source”, “View code” | Not “Use this harness” unless rebranded |
| Theme toggle | “Light mode” / “Dark mode” | Accessible labels per reference |
| Storage key | `peach-ui-theme` | Migrate from reference `bui-theme` |

### 8.3 Visual identity direction

**Base:** Reference **v3 palette** — neutral achromatic chrome + semantic families (accent, schedule, green, red).

**“Tweak colors up” (PeachUI delta vs reference):**

1. **Accent:** Shift primary accent hue from pure ~252° blue toward a **peach–coral band (~25–45°)** or a **dual system**: peach primary + cool secondary for “schedule/info” — while keeping dark mode chroma restrained (match reference dark semantics).
2. **Light mode:** Slightly higher chroma on accent and muted fills (+0.01–0.02 oklch C) so UI feels alive on white surfaces without breaking neutral cards.
3. **Dark mode:** Keep **Cursor-like charcoal** (`--page` / `--canvas` / `--surface` ladder); accent reads as luminous, not neon.
4. **Gradients:** Preserve emphasis button gradients; retint tops/bottoms to match new accent/danger hues.

**Cursor light + dark alignment:**

| Aspect | Light (Cursor-like) | Dark (Cursor-like) |
| --- | --- | --- |
| Surfaces | Near-white page, subtle gray canvas | Layered charcoal, no hue cast on cards |
| Text | Graphite ink ramp | High ink / muted ink-2 / ink-3 |
| Accent | Used for focus, links, primary actions | Brighter accent, muted alpha backgrounds |
| Elevation | Hairline rings + soft shadow stacks | Light hairline rings on dark (per reference `.dark` shadow comments) |
| Theme switch | Class `.dark` on `<html>`, not `prefers-color-scheme` alone | Same; optional “system” later |

Implement via:

```css
@custom-variant dark (&:where(.dark, .dark *));
```

(as in `sample/components/globals.css`).

---

## 9. Design system specification

### 9.1 Token layers

1. **CSS variables** (`:root`, `.dark`) — source of truth for color, shadow, focus, gradients, terminal well.
2. **`@theme inline`** — expose Tailwind utilities (`bg-surface`, `text-ink-2`, `shadow-btn`, etc.).
3. **Component utilities** — `.primitive-*`, `.button-press-motion`, typography utilities in globals (port selectively from `sample/components/globals.css` to avoid copying unused block-specific CSS upfront).

### 9.2 `app/globals.css` requirements

| Requirement | Detail |
| --- | --- |
| Tailwind v4 | Keep `@import "tailwindcss";` |
| Font faces | `@font-face` for Regular/Medium/Bold in `public/font/` → family name `"SF Pro Display"` or **`Peach UI Sans`** if renamed for licensing |
| Theme mapping | `--font-sans: var(--font-peachy-sans)` in `@theme inline` |
| Body defaults | `font-family`, `background: var(--page)`, `color: var(--ink)`, antialiased |
| Theme switching | `.theme-switching` freeze utility (from reference toggle behavior) |
| Deprecate | Remove reliance on `--font-geist-*` in theme once Peach fonts load |

### 9.3 Typography stack

```css
--font-peachy-sans: "SF Pro Display", ui-sans-serif, system-ui, sans-serif;
--font-peachy-mono: ui-monospace, "SF Mono", Menlo, monospace;
```

Load faces from `/font/*.OTF` (MVP) with a **follow-up task** to convert to `.woff2` and subset weights actually used (400, 500, 600/700).

### 9.4 Spacing and density

Preserve reference control heights (e.g. button sm 32, md 36) and primitive spacing utilities — they match dense tool UIs (Cursor-adjacent).

---

## 10. Technical architecture

### 10.1 Repository layout (target)

```text
app/
  layout.tsx          # PeachUI metadata, font variables, ThemeSync
  globals.css         # Full token + base + shared utilities
  page.tsx            # Catalog shell or marketing + catalog
components/
  atoms/              # Button, Input, Badge, …
  primitives/         # ChatComposer, DataTable patterns, …
  blocks/             # Composed demos (optional tier)
  site/               # Nav, Grid, Foundations, ThemeToggle
lib/
  utils.ts            # cn()
  registry.ts         # Catalog entries
  meta.ts             # Nav sections
public/
  font/               # Self-hosted faces
  peach.webp          # Brand marks as needed
sample/               # Read-only reference (do not import in production paths)
```

**Rule:** Production imports come from `@/components/...`, not `sample/`.

### 10.2 Reference dependencies to resolve on port

Reference atoms use **class-variance-authority**, `#/lib/utils`, and occasionally **`@peachy/border-beam`**. Requirements:

- Add minimal deps to root `package.json` **or** inline/simplify exotic deps per component.
- Document each registry entry’s peer deps in the copied snippet header.

### 10.3 Font licensing (risk)

SF Pro in `public/font/` may **not** be redistributable in OSS. Requirements:

1. README section: font license and recommended **system-ui fallback**.
2. Prefer shipping **woff2 of an OSS face** (e.g. Inter, Geist, or a licensed variable font) for default public repo.
3. Optional `fonts/` gitignored local SF Pro for maintainers only.

### 10.4 Stack (locked)

- Next.js 16.x, React 19, Tailwind CSS 4, TypeScript, Bun (per `package.json`).
- Follow workspace `AGENTS.md` for Next.js API drift.

### 10.5 React patterns

- Prefer composition and server components where demos allow; `"use client"` only where needed.
- Apply **`no-use-effect`** skill; exceptions: theme hydration sync, resize observers in catalog grid (consider ref callbacks / observers without effect where feasible).

---

## 11. Component taxonomy and scope

Port order follows **dependency order** and **catalog impact**.

### Tier A — Atoms (foundation)

**Must ship MVP:** Button, Input, TextField, Label, FieldError, Checkbox, Switch, Radio, Select, Badge, Chip, StatusPill, Link, Separator, Tooltip, Dialog, Sheet, Tabs, Skeleton, Kbd, ProgressBar, IconButton, Toast (if used by catalog).

- **Source of truth:** `sample/components/atoms/*`
- **Acceptance:** Renders in light/dark; focus visible; variants match token names; demo copy PeachUI-neutral

### Tier B — Primitives (product patterns)

**MVP showcase (recommended):** EmptyState, CommandPalette, ChatComposer / AgenticComposer, ThinkingState, NotificationBell, BoardCard, MetricTiles, RecordsTable or FilterTable, TimelineFeed, CodeBlock, WorkspaceHeader.

**v1 expansion:** Remaining primitives in reference (diff tables, kanban columns, streaming text, permission gates, etc.).

### Tier C — Blocks (composed scenarios)

Optional for MVP; valuable for differentiation (agent workflows, review queues, dashboards). Port blocks **after** their primitive dependencies exist.

**Naming:** Keep file names from reference internally; **catalog titles** use plain language (“Review queue”, not “SwirlReview”) unless brand playfulness is intentional.

### Tier D — Site chrome

From `sample/components/site/`:

| Component | Purpose |
| --- | --- |
| `Foundations` | Token bento — update subtitle to PeachUI spec doc |
| `Grid` | Live demos + copy + code overlay |
| `Nav` | Scrollspy section nav |
| `ThemeToggle` + `ThemeSync` | Light/dark |
| `UseThisHarness` / hero | Rebrand to PeachUI onboarding copy |

---

## 12. Catalog experience (product surface)

### 12.1 Information architecture

1. **Hero** — What PeachUI is + link to GitHub + theme toggle
2. **Foundations** — Color, type, shadows, buttons
3. **Components** — Grouped: Forms, Overlays, Data display, Agent, Feedback
4. **Footer** — License, contribute, font note

### 12.2 Registry contract (`lib/registry.ts`)

Each entry:

```ts
{
  id: string;
  title: string;
  description: string;      // PeachUI copy, one line
  Demo: React.ComponentType;
  variants?: string[];
  sourcePath: string;       // for copy payload
  deps?: string[];          // npm/peers
}
```

### 12.3 Copy flow

- **Copy source** puts a **self-contained file** (or file + noted deps) on clipboard.
- **View code** opens overlay with syntax-friendly display (reuse reference UI).
- Copied code includes short header comment: PeachUI license + dependencies.

### 12.4 Accessibility of catalog

- Keyboard navigable nav and cards; focus trap in code overlay.
- Respect `prefers-reduced-motion` for staggered entrances (Foundations/grid).

---

## 13. Open-source strategy

| Topic | Requirement |
| --- | --- |
| **License** | MIT or Apache-2.0 (maintainer choice); SPDX in repo root |
| **README** | Replace create-next-app boilerplate with PeachUI quickstart, copy workflow, theme setup |
| **`private` flag** | Set `"private": false` before public launch |
| **Contributing** | Component checklist: tokens only (no raw hex), a11y, writing review, one registry entry |
| **Code of conduct** | Standard OSS |
| **Security** | No secrets in demos; safe external URLs |

**Distribution model (v1):** GitHub repo + deployed catalog (Vercel/Cloudflare Pages). Optional future: `npx peach-ui add button` CLI — **out of scope** for MVP.

---

## 14. Phased roadmap

### Phase 0 — Alignment (1 week)

- [ ] Approve accent direction (peach-primary vs blue-primary + peach secondary)
- [ ] Font/legal decision
- [ ] Final catalog IA and MVP component list

### Phase 1 — Foundation (1–2 weeks)

- [ ] Port/adapt tokens from `sample/components/globals.css` → `app/globals.css`
- [ ] `@font-face` + layout font wiring
- [ ] Theme toggle + sync + pre-hydration script in layout
- [ ] `lib/utils`, baseline eslint/tsconfig paths (`@/`)

### Phase 2 — Atoms MVP (2–3 weeks)

- [ ] Port Tier A atoms; unify imports
- [ ] `Foundations` page section live

### Phase 3 — Catalog (1–2 weeks)

- [ ] Registry + `Grid` + `Nav`
- [ ] Replace `app/page.tsx` with PeachUI catalog
- [ ] Metadata, OG, favicon

### Phase 4 — Primitives showcase (3–4 weeks)

- [ ] Tier B primitives with PeachUI demo data
- [ ] Rewrite reference microcopy in demos

### Phase 5 — OSS launch (1 week)

- [ ] LICENSE, README, CONTRIBUTING, font notice
- [ ] CI: lint + build
- [ ] Public deploy

### Phase 6 — v1 growth (ongoing)

- Blocks, more primitives, optional npm package, visual regression tests

---

## 15. Acceptance criteria (definition of done)

### Foundation

- [ ] Toggling theme updates all surfaces without flash; preference persists under `peach-ui-theme`
- [ ] No component uses hardcoded `#hex` except documented exceptions (e.g. white inset highlight on filled buttons)
- [ ] Light and dark match token spec screenshots in Foundations

### Each component

- [ ] Works in isolation when pasted per registry instructions
- [ ] Passes focus keyboard test
- [ ] Copy reviewed against `better-writing`
- [ ] Visual review against `better-ui` + `better-typography`

### Catalog

- [ ] Every listed component has working demo + copy
- [ ] Mobile layout usable (nav + grid)

### OSS

- [ ] `bun run build` clean; LICENSE file present

---

## 16. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| SF Pro redistribution | OSS fallback font + legal note; woff2 OSS primary |
| Reference `#/lib/registry` missing in repo | Recreate `lib/registry.ts` from component inventory |
| CSS file size if full globals paste | Split: `tokens.css`, `utilities.css`, `components/*.css` imports |
| Hidden deps (`cva`, border-beam) | Dependency matrix in README; simplify components |
| Demo copy too “inside baseball” | PeachUI writing pass on all registry descriptions |

---

## 17. Open decisions (need your call)

These block Phase 0 sign-off:

1. **Accent:** Full shift to **peach/coral primary**, or keep **blue accent** and add peach only in marketing/gradients?
2. **Font:** Ship **SF Pro in public repo** for MVP, or **system-ui + optional woff2** (e.g. Inter) for OSS from day one?
3. **Catalog default theme:** Dark default (Cursor-like) or light default?
4. **Blocks in MVP:** Include 2–3 hero blocks (e.g. agent composer + inbox triage) or atoms/primitives only?
5. **Token spec doc:** Add companion `docs/SPEC.md` for tokens-only reference, linked from Foundations?

---

## 18. Appendix: reference inventory map

| Reference path | PeachUI role |
| --- | --- |
| `sample/components/globals.css` | Token + utility source (~2000 LOC; port incrementally) |
| `sample/components/atoms/` | Tier A |
| `sample/components/primitives/` | Tier B |
| `sample/components/blocks/` | Tier C |
| `sample/components/site/` | Catalog chrome |
| `public/font/*.OTF` | Self-hosted sans (see licensing) |
| `app/globals.css` (today) | Replace/expand with PeachUI foundation |

---

This PRD is the **north star**: when choosing between a faster hack and token consistency, copy clarity, or OSS safety, **prefer the PRD**.
