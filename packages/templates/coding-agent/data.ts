/**
 * Peach Studio — fixture data for the /coding-agent template.
 * Deterministic: no randomness, no dates that go stale.
 */

import type { AgentComposerCatalog } from "@/components/types";

/* ── Chat model ─────────────────────────────────────────── */

export type TraceSource = { id: string; label: string };

export type AgentRun = {
  /** Progressive steps revealed by `progress`. */
  steps: string[];
  /** Files / sources surfaced as chips once the trace expands. */
  sources: TraceSource[];
  query?: string;
  /** Sub-agent chips that spawn mid-run, in spawn order. */
  agents: string[];
  workedFor: string;
};

export type Turn =
  | { id: string; role: "user"; text: string }
  | {
      id: string;
      role: "agent";
      text: string;
      run?: AgentRun;
      /** Inline affordance that scrolls attention to the workspace panel. */
      reviewLink?: boolean;
    };

export type SessionStatus = "live" | "done" | "blocked";

export type StudioSession = {
  id: string;
  title: string;
  status: SessionStatus;
  timeAgo: string;
};

export const SESSIONS: StudioSession[] = [
  { id: "banner", title: "Free-shipping banner", status: "live", timeAgo: "2m ago" },
  { id: "tokens", title: "Migrate buttons to new tokens", status: "done", timeAgo: "1h ago" },
  { id: "flaky", title: "Investigate flaky checkout test", status: "blocked", timeAgo: "yesterday" },
];

export const REPO = { name: "peach-ui/grove", branch: "main" } as const;

export const SUGGESTIONS = [
  "Add a free-shipping banner to the storefront header",
  "Find where the cart count is rendered",
  "Write a test for the promo banner",
] as const;

/* ── The scripted run for the live session ──────────────── */

export const BANNER_RUN: AgentRun = {
  steps: [
    "Searched peach-ui/grove for the storefront header",
    "Read app/storefront/header.tsx and styles/header.css",
    "Drafted a patch: new PromoBanner component + header mount",
    "Ran typecheck on touched files — clean",
  ],
  sources: [
    { id: "f1", label: "app/storefront/header.tsx" },
    { id: "f2", label: "styles/header.css" },
    { id: "f3", label: "app/storefront/page.tsx" },
    { id: "f4", label: "grove.dev/design-system" },
  ],
  query: "site header promo banner placement",
  agents: ["explore codebase", "draft patch", "verify types"],
  workedFor: "4.8s",
};

export const BANNER_ANSWER =
  "Done — the diff is ready for review. I added a PromoBanner component and mounted it at the top of the storefront header, so it renders above the nav on every page. Two files changed: header.tsx gets the mount, promo-banner.tsx is new.";

export const APPROVED_NOTE =
  "Applied the patch to the workspace. The banner is live in the preview — check the Preview tab.";

export const REVISION_NOTE =
  "Got it — reworking the banner. Revised diff: it now renders below the header row with a coupon code and a dismiss control.";

export const GENERIC_ANSWER =
  "On it. I've queued that as a follow-up to the current task — you'll see the workspace update shortly.";

/* ── Canned transcripts for the other sessions ──────────── */

export const TOKENS_TURNS: Turn[] = [
  { id: "t-u1", role: "user", text: "Migrate the checkout buttons to the new token names" },
  {
    id: "t-a1",
    role: "agent",
    text: "Migrated 14 button usages across checkout.tsx and cart-drawer.tsx. Old --btn-* aliases are gone; everything reads the v3 ramp now. Diff was approved and applied — typecheck is clean.",
    run: {
      steps: [
        "Mapped legacy --btn-* tokens to the v3 ramp",
        "Rewrote 14 usages in checkout.tsx and cart-drawer.tsx",
        "Ran typecheck on touched files — clean",
      ],
      sources: [
        { id: "tk1", label: "app/checkout/checkout.tsx" },
        { id: "tk2", label: "app/cart/cart-drawer.tsx" },
        { id: "tk3", label: "styles/tokens.css" },
      ],
      agents: ["map tokens", "rewrite usages", "verify types"],
      workedFor: "38.2s",
    },
    reviewLink: true,
  },
];

export const FLAKY_TURNS: Turn[] = [
  { id: "f-u1", role: "user", text: "checkout.spec.ts flakes on CI — figure out why" },
  {
    id: "f-a1",
    role: "agent",
    text: "I found the failure signature: the cart badge assertion races the optimistic update, but only under CI's slower clock — it never reproduces locally. Before I patch it, which fix do you want: a deterministic wait on the badge, or mock the clock in the spec?",
    run: {
      steps: [
        "Reproduced the flake signature from the last 12 CI runs",
        "Traced the badge assertion to the optimistic cart update",
        "Ruled out the API mock — failure is timing, not data",
      ],
      sources: [
        { id: "fl1", label: "app/checkout/checkout.spec.ts" },
        { id: "fl2", label: "app/cart/use-cart.ts" },
        { id: "fl3", label: "ci runs · last 12" },
      ],
      agents: ["read CI logs", "trace the race"],
      workedFor: "51.7s",
    },
  },
];

/* ── Composer catalog (coding-flavored) ─────────────────── */

export const STUDIO_CATALOG: AgentComposerCatalog = {
  sources: [
    { key: "attach", name: "Add photos & files", desc: "Upload from your computer", glyph: "clip", attach: true },
    { key: "header", name: "app/storefront/header.tsx", desc: "peach-ui/grove", glyph: "layers" },
    { key: "page", name: "app/storefront/page.tsx", desc: "peach-ui/grove", glyph: "layers" },
    { key: "tokens", name: "styles/tokens.css", desc: "peach-ui/grove", glyph: "layers" },
    { key: "repo", name: "peach-ui/grove", desc: "Whole repo as context", glyph: "layers" },
    { key: "slack", name: "Slack", desc: "Read and manage Slack", brand: "slack" },
    { key: "web", name: "Web search", desc: "Real-time docs and info", glyph: "globe" },
  ],
  commands: [
    { key: "diff", name: "/diff", desc: "Show pending workspace changes" },
    { key: "test", name: "/test", desc: "Run the storefront test suite" },
    { key: "review", name: "/review", desc: "Self-review the current patch" },
    { key: "explain", name: "/explain", desc: "Explain the selected file" },
  ],
  models: [
    { key: "peach-1", name: "Peach 1", tag: "Flagship" },
    { key: "peach-code", name: "Peach Code", tag: "Specialist" },
    { key: "peach-lite", name: "Peach Lite", tag: "Fast" },
  ],
  attachFileNames: ["header-screenshot.png", "storefront-mock.fig", "error-log.txt"],
  dictationSample: "Add a free-shipping banner to the storefront header",
};

/* ── Code view ──────────────────────────────────────────── */

export type StudioFile = {
  id: string;
  path: string;
  /** Marks files the agent touched in this session. */
  changed?: boolean;
  lines: string[];
};

export const HEADER_FILE: StudioFile = {
  id: "header",
  path: "app/storefront/header.tsx",
  changed: true,
  lines: [
    'import Link from "next/link";',
    'import { PromoBanner } from "./promo-banner";',
    'import { CartButton } from "./cart-button";',
    'import { SearchInput } from "./search-input";',
    "",
    "const NAV = [",
    '  { href: "/shop", label: "Shop" },',
    '  { href: "/collections", label: "Collections" },',
    '  { href: "/about", label: "About" },',
    "];",
    "",
    "export function StorefrontHeader() {",
    "  return (",
    "    <header className=\"site-header\">",
    "      <PromoBanner message=\"Free shipping over $75\" />",
    "      <div className=\"header-inner\">",
    "        <Link href=\"/\" className=\"wordmark\">",
    "          Grove",
    "        </Link>",
    "        <nav aria-label=\"Primary\">",
    "          {NAV.map((item) => (",
    "            <Link key={item.href} href={item.href}>",
    "              {item.label}",
    "            </Link>",
    "          ))}",
    "        </nav>",
    "        <div className=\"header-actions\">",
    "          <SearchInput placeholder=\"Search plants\" />",
    "          <CartButton count={2} />",
    "        </div>",
    "      </div>",
    "    </header>",
    "  );",
    "}",
  ],
};

/** header.tsx before the agent edits it — what the workspace starts with. */
export const HEADER_FILE_PRE: StudioFile = {
  id: "header",
  path: "app/storefront/header.tsx",
  lines: HEADER_FILE.lines.filter(
    (line) => !line.includes("PromoBanner"),
  ),
};

export const BANNER_FILE: StudioFile = {
  id: "promo-banner",
  path: "app/storefront/promo-banner.tsx",
  changed: true,
  lines: [
    '"use client";',
    "",
    "export function PromoBanner({",
    "  message,",
    "  dismissible = false,",
    "}: {",
    "  message: string;",
    "  dismissible?: boolean;",
    "}) {",
    "  return (",
    "    <p className=\"promo-banner\" role=\"status\">",
    "      <TruckIcon aria-hidden />",
    "      {message}",
    "      {dismissible && <DismissButton />}",
    "    </p>",
    "  );",
    "}",
  ],
};

export const PAGE_FILE: StudioFile = {
  id: "page",
  path: "app/storefront/page.tsx",
  lines: [
    'import { StorefrontHeader } from "./header";',
    'import { ProductGrid } from "./product-grid";',
    'import { getPlants } from "@/lib/catalog";',
    "",
    "export default async function StorefrontPage() {",
    "  const plants = await getPlants({ featured: true });",
    "  return (",
    "    <>",
    "      <StorefrontHeader />",
    "      <main>",
    "        <ProductGrid plants={plants} />",
    "      </main>",
    "    </>",
    "  );",
    "}",
  ],
};

export const CHECKOUT_FILE: StudioFile = {
  id: "checkout",
  path: "app/checkout/checkout.tsx",
  changed: true,
  lines: [
    'import { Button } from "@grove/ui";',
    "",
    "export function CheckoutActions() {",
    "  return (",
    "    <div className=\"checkout-actions\">",
    "      <Button variant=\"secondary\">Keep shopping</Button>",
    "      <Button variant=\"primary\">Place order</Button>",
    "    </div>",
    "  );",
    "}",
  ],
};

export const SPEC_FILE: StudioFile = {
  id: "spec",
  path: "app/checkout/checkout.spec.ts",
  changed: true,
  lines: [
    'import { render, screen } from "@testing-library/react";',
    'import { CheckoutFlow } from "./checkout-flow";',
    "",
    'test("cart badge reflects added items", async () => {',
    "  render(<CheckoutFlow />);",
    '  await user.click(screen.getByRole("button", { name: "Add" }));',
    '  expect(screen.getByLabelText("cart")).toHaveTextContent("1");',
    "});",
  ],
};

/* ── Diff payloads ──────────────────────────────────────── */

export type DiffLine = { kind: "ctx" | "add" | "del"; text: string };
export type DiffHunk = { header: string; lines: DiffLine[] };
export type DiffPatch = {
  id: string;
  title: string;
  files: { path: string; adds: number; dels: number }[];
  hunks: DiffHunk[];
};

export const BANNER_DIFF: DiffPatch = {
  id: "banner-a",
  title: "Add PromoBanner to the storefront header",
  files: [
    { path: "app/storefront/header.tsx", adds: 2, dels: 0 },
    { path: "app/storefront/promo-banner.tsx", adds: 16, dels: 0 },
  ],
  hunks: [
    {
      header: "app/storefront/header.tsx",
      lines: [
        { kind: "ctx", text: 'import Link from "next/link";' },
        { kind: "add", text: 'import { PromoBanner } from "./promo-banner";' },
        { kind: "ctx", text: 'import { CartButton } from "./cart-button";' },
        { kind: "ctx", text: "" },
        { kind: "ctx", text: "export function StorefrontHeader() {" },
        { kind: "ctx", text: "  return (" },
        { kind: "ctx", text: '    <header className="site-header">' },
        { kind: "add", text: '      <PromoBanner message="Free shipping over $75" />' },
        { kind: "ctx", text: '      <div className="header-inner">' },
      ],
    },
  ],
};

export const BANNER_DIFF_B: DiffPatch = {
  id: "banner-b",
  title: "Move the banner below the header row",
  files: [
    { path: "app/storefront/header.tsx", adds: 3, dels: 1 },
    { path: "app/storefront/promo-banner.tsx", adds: 16, dels: 0 },
  ],
  hunks: [
    {
      header: "app/storefront/header.tsx",
      lines: [
        { kind: "ctx", text: "        </nav>" },
        { kind: "ctx", text: "      </div>" },
        { kind: "del", text: '      <PromoBanner message="Free shipping over $75" />' },
        { kind: "add", text: '      <PromoBanner dismissible' },
        { kind: "add", text: '        message="Free shipping over $75 · code GROVE"' },
        { kind: "add", text: "      />" },
        { kind: "ctx", text: "    </header>" },
      ],
    },
  ],
};

export const TOKENS_DIFF: DiffPatch = {
  id: "tokens",
  title: "Migrate checkout buttons to v3 tokens",
  files: [{ path: "app/checkout/checkout.tsx", adds: 3, dels: 3 }],
  hunks: [
    {
      header: "app/checkout/checkout.tsx",
      lines: [
        { kind: "ctx", text: '      <Button variant="secondary">' },
        { kind: "del", text: "        className=\"btn-legacy\"" },
        { kind: "add", text: "        className=\"btn-quiet\"" },
        { kind: "ctx", text: "        Keep shopping" },
        { kind: "ctx", text: "      </Button>" },
        { kind: "del", text: "      <Button className=\"btn-checkout\">" },
        { kind: "add", text: "      <Button variant=\"primary\">" },
        { kind: "ctx", text: "        Place order" },
        { kind: "ctx", text: "      </Button>" },
      ],
    },
  ],
};

/* ── Per-session workspace state ────────────────────────── */

export type WorkspaceSeed = {
  files: StudioFile[];
  openFileId: string;
  diff: DiffPatch | null;
  diffStatus: "pending" | "approved" | "changes" | "none";
  previewBanner: boolean;
};

export const WORKSPACE_SEEDS: Record<string, WorkspaceSeed> = {
  banner: {
    files: [HEADER_FILE_PRE, PAGE_FILE],
    openFileId: "header",
    diff: null,
    diffStatus: "none",
    previewBanner: false,
  },
  tokens: {
    files: [CHECKOUT_FILE],
    openFileId: "checkout",
    diff: TOKENS_DIFF,
    diffStatus: "approved",
    previewBanner: false,
  },
  flaky: {
    files: [SPEC_FILE],
    openFileId: "spec",
    diff: null,
    diffStatus: "none",
    previewBanner: false,
  },
};

export const CANNED_TURNS: Record<string, Turn[]> = {
  banner: [],
  tokens: TOKENS_TURNS,
  flaky: FLAKY_TURNS,
};
