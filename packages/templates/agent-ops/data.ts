/**
 * Peach Ops — fixture data for the /agent-ops template.
 * Deterministic: no randomness, no dates that go stale.
 *
 * Fiction contract with /coding-agent: the three Studio sessions appear here
 * as runs requested via Studio — same titles, same repo, same requesters.
 * Approving the banner deploy here is the same approval Studio waits on.
 */

import { Activity, Key, Rocket, Server } from "reicon-react";
import type { AgentRunSource, AgentRunTask } from "@/components/types";
import type { ApprovalConnector } from "@/components/blocks/tool-approval";
import type { AuditEvent } from "@/components/blocks/audit-explorer";
import type { TerminalLine } from "@/components/primitives/terminal-output";
import type { TimelineEntry } from "@/components/primitives/timeline-feed";
import { PEOPLE } from "@templates/_shared/fixtures";

/* ── Runs ──────────────────────────────────────────────── */

export type RunStatus = "queued" | "running" | "review" | "blocked" | "done" | "failed";

export type RunSource = "studio" | "schedule" | "api";

export type ApprovalKind = "deploy" | "permission" | "tool";
export type ApprovalState = "pending" | "approved" | "denied";

export type OpsApproval = {
  id: string;
  kind: ApprovalKind;
  /** The call the agent wants to make, e.g. deploy.production. */
  toolName: string;
  title: string;
  summary: string;
  /** Label/value scope rows, rendered mono. */
  scopes: { label: string; value: string }[];
  risk: "low" | "high";
  state: ApprovalState;
  /** Extra log lines appended when this approval resolves. */
  onApproveLines?: TerminalLine[];
  onDenyLines?: TerminalLine[];
  /** System notice shown in the run after resolving. */
  approveNotice?: string;
  denyNotice?: string;
};

export type OpsRun = {
  id: string;
  title: string;
  /** The request as it was phrased — feeds the orchestration graph's trigger. */
  request: string;
  repo: string;
  branch: string;
  /** PEOPLE id, or "system" for scheduled/API runs. */
  requesterId: string;
  source: RunSource;
  /** Links back to the Studio session that opened this run. */
  studioSessionId?: "banner" | "tokens" | "flaky";
  status: RunStatus;
  requestedAgo: string;
  /** Settled duration; running runs tick instead. */
  durationLabel: string;
  /** Elapsed work time when the screen opens — makes post-approval durations plausible. */
  elapsedSeed?: number;
  cost: string;
  tokens: string;
  steps: string[];
  sources: { id: string; label: string }[];
  agents: string[];
  logCommand: string;
  log: TerminalLine[];
  approvals: OpsApproval[];
};

export const RUNS: OpsRun[] = [
  {
    id: "run-4217",
    title: "Backfill search synonyms",
    request: "Backfill the search synonym index",
    repo: "peach-ui/stone",
    branch: "main",
    requesterId: "devon",
    source: "api",
    status: "queued",
    requestedAgo: "just now",
    durationLabel: "—",
    cost: "$0.00",
    tokens: "—",
    steps: [
      "Read the synonym map in stone/search/synonyms.json",
      "Diffed 1,204 catalog terms against the map",
      "Writing 312 new synonym pairs",
    ],
    sources: [
      { id: "q1", label: "stone/search/synonyms.json" },
      { id: "q2", label: "catalog · 1,204 terms" },
    ],
    agents: ["diff terms", "write pairs"],
    logCommand: "peach run --id run-4217",
    log: [{ text: "queued · waiting for a worker slot", tone: "muted" }],
    approvals: [],
  },
  {
    id: "run-4216",
    title: "Nightly dependency audit",
    request: "Audit dependencies against the advisory feed",
    repo: "peach-ui/peach",
    branch: "main",
    requesterId: "system",
    source: "schedule",
    status: "running",
    requestedAgo: "12m ago",
    durationLabel: "—",
    elapsedSeed: 34_000,
    cost: "$0.11",
    tokens: "44k",
    steps: [
      "Crawled package manifests across peach-ui/peach",
      "Diffed 214 deps against the advisory feed",
      "Flagged lodash.pick 4.4.0 — moderate advisory",
      "Drafted the audit report",
    ],
    sources: [
      { id: "n1", label: "package.json · 214 deps" },
      { id: "n2", label: "advisories.peach.dev" },
    ],
    agents: ["audit deps", "check advisories"],
    logCommand: "peach run --id run-4216",
    log: [
      { text: "$ peach run audit --scope deps --schedule nightly", tone: "muted" },
      { text: "run-4216 · scheduler · nightly-audit" },
      { text: "crawling manifests…", tone: "muted" },
      { text: "✓ 214 deps resolved", tone: "success" },
    ],
    approvals: [],
  },
  {
    id: "run-4215",
    title: "Provision preview env for PR-118",
    request: "Provision a preview environment for PR-118",
    repo: "peach-ui/grove",
    branch: "feat/cart-v2",
    requesterId: "jonas",
    source: "api",
    status: "review",
    requestedAgo: "9m ago",
    durationLabel: "—",
    elapsedSeed: 61_000,
    cost: "$0.07",
    tokens: "31k",
    steps: [
      "Read the PR-118 diff and its env requirements",
      "Planned env pr-118.preview.grove.dev",
      "Paused — env writes need approval",
    ],
    sources: [
      { id: "p1", label: "PR-118 · cart-v2" },
      { id: "p2", label: "envs/grove.preview.tf" },
    ],
    agents: ["plan env"],
    logCommand: "peach run --id run-4215",
    log: [
      { text: "$ peach run provision --pr 118 --env preview", tone: "muted" },
      { text: "run-4215 · api · requester jonas.reyes" },
      { text: "✓ parsed 9 changed files", tone: "success" },
      { text: "⚠ envs.create requires approval — paused", tone: "error" },
    ],
    approvals: [
      {
        id: "ap-4215-env",
        kind: "tool",
        toolName: "envs.create",
        title: "Create preview environment",
        summary:
          "Provisions pr-118.preview.grove.dev and copies preview-scoped secrets. The env auto-expires in 72 hours.",
        scopes: [
          { label: "Write", value: "envs.create" },
          { label: "Copy", value: "secrets.preview.*" },
          { label: "TTL", value: "72h" },
        ],
        risk: "high",
        state: "pending",
        onApproveLines: [
          { text: "✓ approved by devon.lau", tone: "success" },
          { text: "provisioning pr-118.preview.grove.dev…", tone: "muted" },
          { text: "✓ env live · secrets copied", tone: "success" },
        ],
        onDenyLines: [
          { text: "✗ envs.create denied by devon.lau", tone: "error" },
          { text: "run blocked — notify jonas.reyes", tone: "muted" },
        ],
        approveNotice: "pr-118.preview.grove.dev is live — expires in 72 hours.",
        denyNotice: "Provisioning denied — run blocked. Jonas Reyes has been notified.",
      },
    ],
  },
  {
    id: "run-4213",
    title: "Free-shipping banner",
    request: "Add a free-shipping banner to the storefront header",
    repo: "peach-ui/grove",
    branch: "main",
    requesterId: "mara",
    source: "studio",
    studioSessionId: "banner",
    status: "review",
    requestedAgo: "4m ago",
    durationLabel: "—",
    elapsedSeed: 252_000,
    cost: "$0.42",
    tokens: "182k",
    steps: [
      "Searched peach-ui/grove for the storefront header",
      "Read app/storefront/header.tsx and styles/header.css",
      "Drafted a patch: new PromoBanner component + header mount",
      "Ran typecheck on touched files — clean",
      "Opened the deploy gate — awaiting approval",
    ],
    sources: [
      { id: "f1", label: "app/storefront/header.tsx" },
      { id: "f2", label: "styles/header.css" },
      { id: "f3", label: "app/storefront/page.tsx" },
      { id: "f4", label: "grove.dev/design-system" },
    ],
    agents: ["explore codebase", "draft patch", "verify types"],
    logCommand: "peach run --id run-4213",
    log: [
      { text: '$ peach run "add a free-shipping banner" --repo peach-ui/grove', tone: "muted" },
      { text: "run-4213 · studio session · requester mara.okafor" },
      { text: "✓ located app/storefront/header.tsx", tone: "success" },
      { text: "✓ drafted promo-banner.tsx (+16)", tone: "success" },
      { text: "✓ typecheck clean — 2 files touched", tone: "success" },
      { text: "⚠ deploy.production requires approval — paused", tone: "error" },
    ],
    approvals: [
      {
        id: "ap-4213-deploy",
        kind: "deploy",
        toolName: "deploy.production",
        title: "Deploy grove storefront",
        summary:
          "Ships the approved banner patch to production. Two files changed; traffic stays on deploy-4816 until the health check passes.",
        scopes: [
          { label: "Write", value: "deploy.production" },
          { label: "Repo", value: "peach-ui/grove" },
          { label: "Reverts", value: "deploy-4816" },
        ],
        risk: "high",
        state: "pending",
        onApproveLines: [
          { text: "✓ approved by devon.lau", tone: "success" },
          { text: "$ shipit deploy --env production", tone: "muted" },
          { text: "deploy-4817 · promo-banner · a9f3c21" },
          { text: "✓ 214 checks passed", tone: "success" },
          { text: "✓ banner live on grove.peach.dev", tone: "success" },
        ],
        onDenyLines: [
          { text: "✗ deploy.production denied by devon.lau", tone: "error" },
          { text: "run blocked — patch stays staged in Studio", tone: "muted" },
        ],
        approveNotice: "deploy-4817 is live — the banner is up on grove.peach.dev.",
        denyNotice: "Deploy denied — run blocked. The banner patch stays staged in Studio.",
      },
    ],
  },
  {
    id: "run-4211",
    title: "Investigate flaky checkout test",
    request: "checkout.spec.ts flakes on CI — find the race",
    repo: "peach-ui/grove",
    branch: "main",
    requesterId: "suki",
    source: "studio",
    studioSessionId: "flaky",
    status: "blocked",
    requestedAgo: "yesterday",
    durationLabel: "—",
    elapsedSeed: 198_000,
    cost: "$0.58",
    tokens: "211k",
    steps: [
      "Reproduced the flake signature from the last 12 CI runs",
      "Traced the badge assertion to the optimistic cart update",
      "Asked for secrets.read to open the CI failure logs",
      "Paused — waiting on permission",
    ],
    sources: [
      { id: "fl1", label: "app/checkout/checkout.spec.ts" },
      { id: "fl2", label: "app/cart/use-cart.ts" },
      { id: "fl3", label: "ci runs · last 12" },
    ],
    agents: ["read CI logs", "trace the race"],
    logCommand: "peach run --id run-4211",
    log: [
      { text: '$ peach run "checkout.spec.ts flakes on CI" --repo peach-ui/grove', tone: "muted" },
      { text: "run-4211 · studio session · requester suki.tan" },
      { text: "✓ 12/12 failures match the badge race", tone: "success" },
      { text: "✗ secrets.read blocked by policy — approval required", tone: "error" },
      { text: "paused · waiting on devon.lau", tone: "muted" },
    ],
    approvals: [
      {
        id: "ap-4211-secrets",
        kind: "permission",
        toolName: "secrets.read",
        title: "Read CI failure logs",
        summary:
          "Opens the last 12 CI logs for checkout.spec.ts. Logs may contain scoped secrets; access expires when this run ends.",
        scopes: [
          { label: "Read", value: "secrets.ci.*" },
          { label: "On", value: "ci.peach.dev" },
          { label: "Expires", value: "end of run" },
        ],
        risk: "high",
        state: "pending",
        onApproveLines: [
          { text: "✓ secrets.read allowed by devon.lau", tone: "success" },
          { text: "✓ opened ci logs — badge race confirmed", tone: "success" },
          { text: "✓ wrote findings to the Studio session", tone: "success" },
        ],
        onDenyLines: [
          { text: "✗ secrets.read denied by devon.lau", tone: "error" },
          { text: "run stays paused — the agent will try another approach", tone: "muted" },
        ],
        approveNotice: "Permission granted — findings posted back to the Studio session.",
        denyNotice: "Denied — the run stays paused. The agent will try another approach.",
      },
    ],
  },
  {
    id: "run-4209",
    title: "Migrate buttons to new tokens",
    request: "Migrate buttons to the v3 token ramp",
    repo: "peach-ui/grove",
    branch: "main",
    requesterId: "jonas",
    source: "studio",
    studioSessionId: "tokens",
    status: "done",
    requestedAgo: "1h ago",
    durationLabel: "2m 41s",
    cost: "$0.36",
    tokens: "141k",
    steps: [
      "Mapped legacy --btn-* tokens to the v3 ramp",
      "Rewrote 14 usages in checkout.tsx and cart-drawer.tsx",
      "Ran typecheck on touched files — clean",
      "Deployed behind the deploy gate",
    ],
    sources: [
      { id: "tk1", label: "app/checkout/checkout.tsx" },
      { id: "tk2", label: "app/cart/cart-drawer.tsx" },
      { id: "tk3", label: "styles/tokens.css" },
    ],
    agents: ["map tokens", "rewrite usages", "verify types"],
    logCommand: "peach run --id run-4209",
    log: [
      { text: "$ peach run \"migrate buttons to v3 tokens\" --repo peach-ui/grove", tone: "muted" },
      { text: "run-4209 · studio session · requester jonas.reyes" },
      { text: "✓ 14 usages rewritten", tone: "success" },
      { text: "✓ typecheck clean", tone: "success" },
      { text: "✓ deploy.production approved by devon.lau", tone: "success" },
      { text: "✓ deploy-4814 live", tone: "success" },
    ],
    approvals: [
      {
        id: "ap-4209-deploy",
        kind: "deploy",
        toolName: "deploy.production",
        title: "Deploy grove storefront",
        summary: "Token migration patch shipped to production.",
        scopes: [
          { label: "Write", value: "deploy.production" },
          { label: "Repo", value: "peach-ui/grove" },
        ],
        risk: "high",
        state: "approved",
      },
    ],
  },
  {
    id: "run-4208",
    title: "Changelog digest for v0.4",
    request: "Write the v0.4 changelog digest",
    repo: "peach-ui/peach",
    branch: "main",
    requesterId: "system",
    source: "schedule",
    status: "done",
    requestedAgo: "3h ago",
    durationLabel: "38s",
    cost: "$0.09",
    tokens: "58k",
    steps: [
      "Collected 47 merged PRs since v0.3.9",
      "Grouped changes by area and flagged breaking notes",
      "Posted the digest to #releases",
    ],
    sources: [
      { id: "c1", label: "47 merged PRs" },
      { id: "c2", label: "#releases" },
    ],
    agents: ["collect PRs", "draft digest"],
    logCommand: "peach run --id run-4208",
    log: [
      { text: "$ peach run changelog --release v0.4", tone: "muted" },
      { text: "run-4208 · scheduler · release-digest" },
      { text: "✓ 47 PRs summarized", tone: "success" },
      { text: "✓ posted to #releases", tone: "success" },
    ],
    approvals: [],
  },
  {
    id: "run-4207",
    title: "Migrate stone API routes to handlers",
    request: "Migrate stone API routes to the new handler shape",
    repo: "peach-ui/stone",
    branch: "main",
    requesterId: "devon",
    source: "api",
    status: "failed",
    requestedAgo: "2d ago",
    durationLabel: "1m 12s",
    cost: "$0.22",
    tokens: "96k",
    steps: [
      "Enumerated 22 API routes in stone/api",
      "Rewrote 9 routes to the new handler shape",
      "Typecheck failed on routes/orders.ts — halted",
    ],
    sources: [
      { id: "s1", label: "stone/api · 22 routes" },
      { id: "s2", label: "routes/orders.ts" },
    ],
    agents: ["enumerate routes", "rewrite handlers"],
    logCommand: "peach run --id run-4207",
    log: [
      { text: "$ peach run migrate --target handlers --repo peach-ui/stone", tone: "muted" },
      { text: "run-4207 · api · requester devon.lau" },
      { text: "✓ 9 routes rewritten", tone: "success" },
      { text: "✗ typecheck failed — routes/orders.ts:41 type mismatch", tone: "error" },
      { text: "halted · partial patch discarded", tone: "muted" },
    ],
    approvals: [],
  },
];

/* ── Labels ─────────────────────────────────────────────── */

export const RUN_STATUS_LABEL: Record<RunStatus, string> = {
  queued: "Queued",
  running: "Running",
  review: "Needs approval",
  blocked: "Blocked",
  done: "Done",
  failed: "Failed",
};

export const RUN_SOURCE_LABEL: Record<RunSource, string> = {
  studio: "Peach Studio",
  schedule: "Schedule",
  api: "API",
};

/** Sessions in Studio that opened runs here — titles match data.ts there. */
export const STUDIO_SESSION_LABEL: Record<string, string> = {
  banner: "Free-shipping banner",
  tokens: "Migrate buttons to new tokens",
  flaky: "Investigate flaky checkout test",
};

export const SECTION_LABELS: Record<string, string> = {
  overview: "Overview",
  runs: "Runs",
  approvals: "Approvals",
  deploys: "Deploys",
  envs: "Environments",
  secrets: "Secrets",
  policies: "Policies",
};

export type RunFilter = "all" | "live" | "attention" | "done" | "failed";

export const FILTERS: { id: RunFilter; label: string }[] = [
  { id: "all", label: "All" },
  { id: "live", label: "Live" },
  { id: "attention", label: "Needs you" },
  { id: "done", label: "Done" },
  { id: "failed", label: "Failed" },
];

export function filterRuns<T extends { status: RunStatus }>(runs: T[], filter: RunFilter): T[] {
  if (filter === "live") return runs.filter((r) => r.status === "queued" || r.status === "running");
  if (filter === "attention") return runs.filter((r) => r.status === "review" || r.status === "blocked");
  if (filter === "done") return runs.filter((r) => r.status === "done");
  if (filter === "failed") return runs.filter((r) => r.status === "failed");
  return runs;
}

/* ── Orchestration graph (derived per run) ────────────── */

const SOURCE_BADGE: [RegExp, AgentRunSource["badge"]][] = [
  [/docs|\.md$/i, "MD"],
  [/catalog|feed|\.(csv|json)$/i, "CSV"],
  [/\.pdf$/i, "PDF"],
  [/./, "DOC"],
];

const SOURCE_SHARES = [0.42, 0.28, 0.18, 0.12];

/** "182k" → 182000; "—" → a plausible working set. */
function tokenCount(label: string): number {
  const match = /^([\d.]+)k$/.exec(label);
  if (match) return Math.round(Number(match[1]) * 1000);
  const num = Number(label);
  return Number.isFinite(num) && num > 0 ? num : 60_000;
}

/**
 * The shape AgentRun plays on the Graph tab: the request, the sources
 * the context assembler packs, and the tasks the orchestrator fans out.
 * Derived deterministically from the run's own fixtures.
 */
export function orchestrationOf(run: OpsRun): {
  request: string;
  sources: AgentRunSource[];
  tasks: AgentRunTask[];
  budgetTokens: number;
} {
  const total = tokenCount(run.tokens);
  const sources: AgentRunSource[] = run.sources.map((source, index) => ({
    id: source.id,
    title: source.label,
    origin: run.repo,
    badge: SOURCE_BADGE.find(([pattern]) => pattern.test(source.label))?.[1] ?? "DOC",
    tokens: Math.round((total * (SOURCE_SHARES[index] ?? 0.08)) / 100) * 100,
  }));
  const contextTokens = sources.reduce((sum, source) => sum + source.tokens, 0);
  const tasks: AgentRunTask[] = run.agents.map((owner, index) => ({
    id: `${run.id}-task-${index}`,
    title: run.steps[index + 1] ?? owner,
    owner,
    seconds: 0.8 + ((index * 7) % 4) * 0.6,
  }));
  tasks.push({
    id: `${run.id}-deliver`,
    title: run.steps[run.steps.length - 1] ?? "Deliver the result",
    owner: "peach-agent",
    seconds: 0.6,
  });
  return {
    request: run.request,
    sources,
    tasks,
    budgetTokens: Math.max(128_000, Math.ceil(contextTokens * 1.25)),
  };
}

/* ── Approvals section — ToolApproval connectors ──────── */

export const OPS_CONNECTORS: ApprovalConnector[] = [
  {
    id: "shipit",
    name: "Shipit",
    meta: "Deploys · Connected",
    job: "Production deploys",
    blurb: "Promotes builds and rolls them back when health checks fail.",
    tone: "bg-accent",
    Icon: Rocket,
    calls: [
      {
        id: "deploy-prod",
        name: "deploy.production",
        args: 'deploy.production({ image: "a9f3c21" })',
        writes: true,
        detail: "Promotes build a9f3c21 to production traffic.",
      },
      {
        id: "deploy-rollback",
        name: "deploy.rollback",
        args: 'deploy.rollback({ to: "deploy-4816" })',
        writes: true,
        detail: "Shifts traffic back to the previous deploy.",
      },
      {
        id: "deploys-list",
        name: "deploys.list",
        args: 'deploys.list({ env: "production", last: 10 })',
        writes: false,
        detail: "Reads the last ten production deploys.",
      },
    ],
  },
  {
    id: "envs",
    name: "Environments",
    meta: "Preview infra · Connected",
    job: "Preview envs",
    blurb: "Provisions and tears down PR preview environments.",
    tone: "bg-green",
    Icon: Server,
    calls: [
      {
        id: "envs-create",
        name: "envs.create",
        args: 'envs.create({ name: "pr-118.preview.grove.dev", ttl: "72h" })',
        writes: true,
        detail: "Provisions the PR-118 preview and copies preview-scoped secrets.",
      },
      {
        id: "envs-destroy",
        name: "envs.destroy",
        args: 'envs.destroy({ name: "pr-104.preview.grove.dev" })',
        writes: true,
        detail: "Tears down the expired PR-104 preview env.",
      },
      {
        id: "envs-list",
        name: "envs.list",
        args: 'envs.list({ repo: "peach-ui/grove" })',
        writes: false,
        detail: "Lists active preview environments for grove.",
      },
    ],
  },
  {
    id: "secrets",
    name: "Secrets vault",
    meta: "Vault · Connected",
    job: "Scoped reads",
    blurb: "Reads and rotates scoped secrets; access expires with the run.",
    tone: "bg-orange",
    Icon: Key,
    calls: [
      {
        id: "secrets-read",
        name: "secrets.read",
        args: 'secrets.read({ scope: "secrets.ci.*" })',
        writes: false,
        detail: "Opens CI-scoped secrets for one run.",
      },
      {
        id: "secrets-rotate",
        name: "secrets.rotate",
        args: 'secrets.rotate({ key: "prod-3" })',
        writes: true,
        detail: "Rotates prod-3 and re-issues it to bound services.",
      },
    ],
  },
  {
    id: "ci",
    name: "CI",
    meta: "Pipelines · Connected",
    job: "Failure logs",
    blurb: "Reads pipeline logs and re-queues jobs.",
    tone: "bg-ink",
    Icon: Activity,
    calls: [
      {
        id: "ci-logs",
        name: "ci.logs.read",
        args: 'ci.logs.read({ job: "checkout.spec.ts", last: 12 })',
        writes: false,
        detail: "Opens the last 12 CI failure logs.",
      },
      {
        id: "ci-retry",
        name: "ci.retry",
        args: 'ci.retry({ job: "typecheck", branch: "feat/cart-v2" })',
        writes: true,
        detail: "Re-queues the typecheck job on feat/cart-v2.",
      },
    ],
  },
];

/* ── Policies section — AuditExplorer events ──────────── */

export const POLICY_EVENTS: AuditEvent[] = [
  {
    id: "pol-secrets",
    action: "secrets.read on secrets.ci.*",
    time: "09:41",
    outcome: "flagged",
    actor: "run-4211 · secrets-gate",
    trail: [
      { id: "pol-secrets-1", title: "Access requested", detail: "run-4211 · suki.tan", time: "09:41", actor: "agent" },
      { id: "pol-secrets-2", title: "Scoped secrets flagged", detail: "secrets.ci.* contains scoped values", time: "09:41", actor: "system" },
      { id: "pol-secrets-3", title: "Held for a person", detail: "Waiting on devon.lau", time: "09:41", actor: "system" },
    ],
  },
  {
    id: "pol-deploy",
    action: "deploy.production promotion",
    time: "09:36",
    outcome: "allowed",
    actor: "run-4213 · deploy-gate",
    trail: [
      { id: "pol-deploy-1", title: "Promotion requested", detail: "deploy-4817 → production", time: "09:36", actor: "agent" },
      { id: "pol-deploy-2", title: "Approved by devon.lau", detail: "Two files changed", time: "09:36", actor: "human" },
      { id: "pol-deploy-3", title: "Policy allowed the deploy", detail: "Health check passed", time: "09:37", actor: "system" },
    ],
  },
  {
    id: "pol-envs",
    action: "envs.destroy on 3 preview envs",
    time: "08:58",
    outcome: "denied",
    actor: "scheduler · env-ttl",
    trail: [
      { id: "pol-envs-1", title: "Cleanup requested", detail: "Expired preview envs", time: "08:58", actor: "system" },
      { id: "pol-envs-2", title: "Denied: envs still referenced", detail: "2 open PRs point at pr-104", time: "08:58", actor: "system" },
    ],
  },
  {
    id: "pol-rotate",
    action: "API key rotation prod-3",
    time: "08:35",
    outcome: "denied",
    actor: "sam.okonkwo · key-rotation",
    trail: [
      { id: "pol-rotate-1", title: "Rotation requested", detail: "Key prod-3", time: "08:35", actor: "human" },
      { id: "pol-rotate-2", title: "Denied: key still in use", detail: "2 active clients", time: "08:35", actor: "system" },
    ],
  },
  {
    id: "pol-replay",
    action: "Session replay download",
    time: "08:12",
    outcome: "flagged",
    actor: "jonas.reyes · audit-export",
    trail: [
      { id: "pol-replay-1", title: "Replay requested", detail: "3 sessions", time: "08:12", actor: "human" },
      { id: "pol-replay-2", title: "Flagged for off-hours access", detail: "Held before download", time: "08:12", actor: "agent" },
    ],
  },
  {
    id: "pol-retention",
    action: "Retention window 90 → 180 days",
    time: "07:52",
    outcome: "allowed",
    actor: "devon.lau · retention",
    trail: [
      { id: "pol-retention-1", title: "Window proposed", detail: "90 → 180 days", time: "07:52", actor: "human" },
      { id: "pol-retention-2", title: "Policy allowed the change", detail: "Applied to the workspace", time: "07:52", actor: "system" },
    ],
  },
];

/* ── Deploys section — ledger rows ────────────────────── */

export type DeployRow = {
  id: string;
  sha: string;
  repo: string;
  env: string;
  status: string;
  duration: string;
  by: string;
  ago: string;
};

export const DEPLOYS: DeployRow[] = [
  { id: "deploy-4817", sha: "a9f3c21", repo: "peach-ui/grove", env: "production", status: "live", duration: "2m 12s", by: "run-4213", ago: "4m ago" },
  { id: "deploy-4816", sha: "b21e88a", repo: "peach-ui/grove", env: "production", status: "superseded", duration: "1m 58s", by: "run-4209", ago: "1h ago" },
  { id: "deploy-4815", sha: "77d4c02", repo: "peach-ui/stone", env: "production", status: "live", duration: "1m 44s", by: "run-4206", ago: "3h ago" },
  { id: "deploy-4814", sha: "c93aa10", repo: "peach-ui/grove", env: "production", status: "superseded", duration: "2m 03s", by: "run-4209", ago: "1h ago" },
  { id: "deploy-4811", sha: "5f0b77d", repo: "peach-ui/peach", env: "production", status: "rolled back", duration: "3m 31s", by: "run-4198", ago: "yesterday" },
  { id: "deploy-4808", sha: "e12c4f9", repo: "peach-ui/stone", env: "staging", status: "failed", duration: "48s", by: "run-4194", ago: "yesterday" },
];

/* ── Environments section — grid rows ─────────────────── */

export type EnvRow = {
  id: string;
  name: string;
  repo: string;
  branch: string;
  status: string;
  expires: string;
  deploy: string;
};

export const ENVS: EnvRow[] = [
  { id: "env-pr118", name: "pr-118.preview.grove.dev", repo: "peach-ui/grove", branch: "feat/cart-v2", status: "pending approval", expires: "—", deploy: "—" },
  { id: "env-pr104", name: "pr-104.preview.grove.dev", repo: "peach-ui/grove", branch: "feat/search-v2", status: "expired", expires: "expired", deploy: "deploy-4801" },
  { id: "env-staging", name: "staging.grove.dev", repo: "peach-ui/grove", branch: "main", status: "live", expires: "persistent", deploy: "deploy-4816" },
  { id: "env-stone", name: "staging.stone.dev", repo: "peach-ui/stone", branch: "main", status: "live", expires: "persistent", deploy: "deploy-4815" },
  { id: "env-peach", name: "preview.peach.dev", repo: "peach-ui/peach", branch: "main", status: "live", expires: "persistent", deploy: "deploy-4810" },
  { id: "env-pr97", name: "pr-97.preview.grove.dev", repo: "peach-ui/grove", branch: "fix/checkout-badge", status: "live", expires: "in 31h", deploy: "deploy-4809" },
];

/* ── Secrets section — grid rows ──────────────────────── */

export type SecretRow = {
  id: string;
  name: string;
  scope: string;
  rotated: string;
  expires: string;
  access: string;
  status: string;
};

export const SECRETS: SecretRow[] = [
  { id: "sec-stripe", name: "STRIPE_KEY_PROD", scope: "secrets.prod.*", rotated: "34d ago", expires: "in 56d", access: "deploy.production", status: "healthy" },
  { id: "sec-ci", name: "CI_FAILURE_LOGS", scope: "secrets.ci.*", rotated: "12d ago", expires: "in 18d", access: "run-4211 · held", status: "held" },
  { id: "sec-preview", name: "PREVIEW_DB_URL", scope: "secrets.preview.*", rotated: "8d ago", expires: "in 22d", access: "envs.create", status: "healthy" },
  { id: "sec-slack", name: "SLACK_BOT_TOKEN", scope: "secrets.chat.*", rotated: "88d ago", expires: "in 2d", access: "chat.postMessage", status: "rotation due" },
  { id: "sec-registry", name: "NPM_PUBLISH_TOKEN", scope: "secrets.release.*", rotated: "41d ago", expires: "in 49d", access: "release.publish", status: "healthy" },
];

/* ── Overview — fleet timeline ────────────────────────── */

export const OPS_TIMELINE: TimelineEntry[] = [
  { id: "ot-1", title: "deploy.production approved", detail: "devon.lau · run-4213", time: "09:36", actor: "human" },
  { id: "ot-2", title: "Nightly audit completed", detail: "1 advisory · 213 clean", time: "09:12", actor: "agent" },
  { id: "ot-3", title: "Run picked up", detail: "run-4217 · worker-3", time: "09:08", actor: "system" },
  { id: "ot-4", title: "secrets.read held by policy", detail: "run-4211 · waiting on devon.lau", time: "08:58", actor: "system" },
  { id: "ot-5", title: "Token migration deployed", detail: "deploy-4814 · run-4209", time: "08:31", actor: "agent" },
];

/** Run history for the context rail — opened event + the streamed log. */
export function runTimeline(run: OpsRun): TimelineEntry[] {
  const requester = PEOPLE.find((p) => p.id === run.requesterId);
  const opened =
    run.source === "studio" ? "Opened from Studio" : run.source === "schedule" ? "Scheduled" : "Requested via API";
  const entries: TimelineEntry[] = [
    {
      id: `${run.id}-open`,
      title: opened,
      detail: `${requester?.name ?? "Peach"} · ${run.requestedAgo}`,
      time: "start",
      actor: run.requesterId === "system" ? "system" : "human",
    },
  ];
  run.log.forEach((line, index) => {
    entries.push({
      id: `${run.id}-l${index}`,
      title: line.text.replace(/^[$✓✗] ?/, "").trim() || line.text,
      time: `+${(1.2 + index * 1.8).toFixed(1)}s`,
      actor: line.text.startsWith("$") ? "human" : "agent",
    });
  });
  return entries;
}
