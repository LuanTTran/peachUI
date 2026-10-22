/**
 * Peach Home — fixture data for the /command-center template.
 * Deterministic: no randomness, no dates that go stale.
 *
 * Fiction contract with /agent-ops and /coding-agent: the agent task board
 * tracks the same runs Ops shows, the approvals are the same gates, and the
 * revenue chart is Grove — the storefront the banner deploy is waiting on.
 */

import type { BriefItem } from "@/components/blocks/morning-brief";
import type { KanbanColumnData } from "@/components/blocks/kanban-board";
import type { PipelineStage } from "@/components/primitives/pipeline-strip";
import type { RevenuePoint } from "@/components/primitives/revenue-chart-card";
import type { TimelineEntry } from "@/components/primitives/timeline-feed";

/* ── Morning brief ─────────────────────────────────────── */

export const BRIEF_SUMMARY =
  "Peach Agent finished four tasks overnight. Three approvals are waiting on you.";

export const BRIEF_ITEMS: BriefItem[] = [
  {
    id: "overnight",
    title: "Four tasks shipped overnight",
    meta: "Peach Studio · grove and peach",
    tone: "accent",
    prose:
      "The button token migration is live on grove, the v0.4 changelog digest posted to #releases, and the nightly audit flagged one advisory.",
    bars: [
      { label: "Token migration", value: "shipped", pct: 100, tone: "accent" },
      { label: "v0.4 changelog", value: "posted", pct: 100, tone: "accent" },
      { label: "Dependency audit", value: "1 advisory", pct: 30, tone: "orange" },
    ],
    action: {
      body: "The lodash.pick advisory is moderate — the patch rides along with the next stone deploy.",
      cta: "Mark reviewed",
      done: "Reviewed",
    },
  },
  {
    id: "gates",
    title: "Three runs are paused on you",
    meta: "Peach Ops · deploy gate, env, secrets",
    tone: "orange",
    prose:
      "The free-shipping banner is staged at the production gate. PR-118 needs a preview env, and the checkout flake needs CI log access.",
    bars: [
      { label: "run-4213 · banner", value: "deploy gate", pct: 100, tone: "orange" },
      { label: "run-4215 · PR-118", value: "envs.create", pct: 80, tone: "orange" },
      { label: "run-4211 · flake", value: "secrets.read", pct: 60, tone: "orange" },
    ],
    action: {
      body: "The queue is below — approving the banner deploy puts it on grove.peach.dev.",
      cta: "Review the queue",
      done: "Queue reviewed",
    },
  },
  {
    id: "orders",
    title: "Grove orders up 14% this week",
    meta: "peach-ui/grove · storefront",
    tone: "green",
    prose:
      "Orders lifted after the checkout polish shipped. The banner should hold the trend once it clears the gate.",
    bars: [
      { label: "This week", value: "+14%", pct: 76, tone: "green" },
      { label: "Last week", value: "+3%", pct: 40, tone: "muted" },
    ],
    action: {
      body: "Nothing to do — the trend is healthy. Snooze this until next Monday's brief.",
      cta: "Snooze until Monday",
      done: "Snoozed",
    },
  },
];

/* ── KPI strip ─────────────────────────────────────────── */

export type StatTarget = {
  /** Raw value the count-up rolls to (cents for "usd2"). */
  target: number;
  format: "usd" | "usd2" | "int";
};

export const STAT_TARGETS: StatTarget[] = [
  { target: 48213, format: "usd" },
  { target: 2410, format: "int" },
  { target: 3418, format: "int" },
  { target: 41240, format: "usd2" },
];

export const STAT_META = [
  {
    label: "Gross revenue",
    delta: "12.4%",
    deltaColor: "lime" as const,
    tone: "accent" as const,
    figure: "revenue" as const,
    caption: "vs last month",
    hint: "Revenue across grove and peach subscriptions this month, before refunds. Compared to the same days last month.",
  },
  {
    label: "Storefront orders",
    delta: "14%",
    deltaColor: "lime" as const,
    tone: "schedule" as const,
    figure: "orders" as const,
    caption: "vs last month",
    hint: "Completed checkouts on grove.peach.dev this month. The banner deploy is expected to hold the trend.",
  },
  {
    label: "Active workspaces",
    delta: "8.1%",
    deltaColor: "lime" as const,
    tone: "violet" as const,
    figure: "customers" as const,
    caption: "vs last month",
    hint: "Workspaces with at least one session, run, or deploy in the last 30 days.",
  },
  {
    label: "Agent spend",
    delta: "31%",
    deltaColor: "neutral" as const,
    tone: "red" as const,
    figure: "refunds" as const,
    caption: "147 runs this month",
    hint: "Token and runtime cost for Peach Agent across Studio and Ops. Up because run volume is up 40%.",
  },
];

/* ── Revenue chart ─────────────────────────────────────── */

/** A year of Peach revenue — October matches the gross-revenue stat. */
export const REVENUE_DATA: RevenuePoint[] = [
  { label: "Jan", current: 31840, previous: 27210 },
  { label: "Feb", current: 33120, previous: 28060 },
  { label: "Mar", current: 35380, previous: 30950 },
  { label: "Apr", current: 34960, previous: 31240 },
  { label: "May", current: 38210, previous: 32880 },
  { label: "Jun", current: 40740, previous: 34020 },
  { label: "Jul", current: 42980, previous: 35760 },
  { label: "Aug", current: 44120, previous: 36030 },
  { label: "Sep", current: 46210, previous: 37190 },
  { label: "Oct", current: 48213, previous: 38480 },
  { label: "Nov", current: 47360, previous: 39160 },
  { label: "Dec", current: 49703, previous: 39924 },
];

/* ── Agent task board ──────────────────────────────────── */

export const TASK_COLUMNS: KanbanColumnData[] = [
  {
    id: "queued",
    title: "Queued",
    limit: 6,
    cards: [
      {
        id: "run-4217",
        ticket: "run-4217",
        area: "Search",
        priority: "low",
        project: "stone",
        title: "Backfill search synonyms",
        since: "just now",
        assignees: [{ name: "Devon Lau" }],
      },
      {
        id: "run-4219",
        ticket: "run-4219",
        area: "Digest",
        priority: "low",
        project: "peach",
        title: "Draft v0.4.1 release notes",
        since: "18m ago",
        assignees: [{ name: "Peach Agent" }],
      },
    ],
  },
  {
    id: "running",
    title: "Running",
    limit: 4,
    cards: [
      {
        id: "run-4216",
        ticket: "run-4216",
        area: "Audit",
        priority: "medium",
        project: "peach",
        title: "Nightly dependency audit",
        since: "12m ago",
        assignees: [{ name: "Peach Agent" }],
      },
    ],
  },
  {
    id: "needs-you",
    title: "Needs you",
    limit: 4,
    cards: [
      {
        id: "run-4213",
        ticket: "run-4213",
        area: "Deploy",
        priority: "urgent",
        project: "grove",
        title: "Free-shipping banner",
        since: "4m ago",
        assignees: [{ name: "Mara Okafor" }],
      },
      {
        id: "run-4215",
        ticket: "run-4215",
        area: "Env",
        priority: "high",
        project: "grove",
        title: "Provision preview env for PR-118",
        since: "9m ago",
        assignees: [{ name: "Jonas Reyes" }],
      },
      {
        id: "run-4211",
        ticket: "run-4211",
        area: "Flake",
        priority: "high",
        project: "grove",
        title: "Investigate flaky checkout test",
        since: "yesterday",
        assignees: [{ name: "Suki Tan" }],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    limit: 8,
    cards: [
      {
        id: "run-4209",
        ticket: "run-4209",
        area: "Tokens",
        priority: "medium",
        project: "grove",
        title: "Migrate buttons to new tokens",
        completed: "1h ago",
        assignees: [{ name: "Jonas Reyes" }],
      },
      {
        id: "run-4208",
        ticket: "run-4208",
        area: "Digest",
        priority: "low",
        project: "peach",
        title: "Changelog digest for v0.4",
        completed: "3h ago",
        assignees: [{ name: "Peach Agent" }],
      },
      {
        id: "run-4205",
        ticket: "run-4205",
        area: "Search",
        priority: "medium",
        project: "grove",
        title: "Reindex catalog search",
        completed: "yesterday",
        assignees: [{ name: "Peach Agent" }],
      },
    ],
  },
];

/* ── Approvals (mirrors the gates in /agent-ops) ───────── */

export type HomeApproval = {
  id: string;
  runId: string;
  title: string;
  tool: string;
  repo: string;
  risk: "high" | "low";
  ago: string;
  /** Shown on the collapsed row after the approval resolves. */
  approvedNote: string;
  deniedNote: string;
};

export const APPROVALS: HomeApproval[] = [
  {
    id: "ap-4213-deploy",
    runId: "run-4213",
    title: "Deploy grove storefront",
    tool: "deploy.production",
    repo: "peach-ui/grove",
    risk: "high",
    ago: "4m ago",
    approvedNote: "deploy-4817 went live",
    deniedNote: "deploy denied — patch stays staged",
  },
  {
    id: "ap-4215-env",
    runId: "run-4215",
    title: "Create preview environment",
    tool: "envs.create",
    repo: "peach-ui/grove",
    risk: "high",
    ago: "9m ago",
    approvedNote: "pr-118.preview.grove.dev is live",
    deniedNote: "env denied — run blocked",
  },
  {
    id: "ap-4211-secrets",
    runId: "run-4211",
    title: "Read CI failure logs",
    tool: "secrets.read",
    repo: "ci.peach.dev",
    risk: "high",
    ago: "yesterday",
    approvedNote: "findings posted to the Studio session",
    deniedNote: "denied — run stays paused",
  },
];

/* ── Deploys ───────────────────────────────────────────── */

export type DeployStageId = "queued" | "building" | "live" | "failed";

export type HomeDeploy = {
  id: string;
  stage: DeployStageId;
  repo: "grove" | "peach" | "stone";
  ref: string;
  label: string;
  ago: string;
  note?: string;
};

export const DEPLOY_STAGES: PipelineStage[] = [
  { id: "queued", label: "Queued", count: 1 },
  { id: "building", label: "Building", count: 1 },
  { id: "live", label: "Live", count: 4 },
  { id: "failed", label: "Failed", count: 1 },
];

export const DEPLOYS: HomeDeploy[] = [
  {
    id: "deploy-4817",
    stage: "queued",
    repo: "grove",
    ref: "promo-banner",
    label: "Free-shipping banner",
    ago: "4m ago",
    note: "waiting on approval",
  },
  {
    id: "deploy-4820",
    stage: "building",
    repo: "stone",
    ref: "main · c41d9aa",
    label: "Search synonyms",
    ago: "2m ago",
    note: "compiling",
  },
  {
    id: "deploy-4816",
    stage: "live",
    repo: "grove",
    ref: "main · a9f3c21",
    label: "Current production",
    ago: "26m ago",
  },
  {
    id: "deploy-4814",
    stage: "live",
    repo: "grove",
    ref: "main · 77b1e02",
    label: "Button token migration",
    ago: "1h ago",
  },
  {
    id: "deploy-4813",
    stage: "live",
    repo: "peach",
    ref: "main · f2c880d",
    label: "Docs refresh",
    ago: "2h ago",
  },
  {
    id: "deploy-4808",
    stage: "live",
    repo: "peach",
    ref: "main · 31aa7c9",
    label: "Billing usage meter fix",
    ago: "yesterday",
  },
  {
    id: "deploy-4809",
    stage: "failed",
    repo: "stone",
    ref: "main · 9d0be11",
    label: "API handler routes",
    ago: "2d ago",
    note: "typecheck failed",
  },
];

/* ── Activity feed ─────────────────────────────────────── */

export const ACTIVITY: TimelineEntry[] = [
  {
    id: "a1",
    title: "Peach Agent staged deploy-4817",
    detail: "grove · free-shipping banner",
    time: "4m",
    actor: "agent",
  },
  {
    id: "a2",
    title: "Mara asked for the banner in Studio",
    detail: "peach-ui/grove",
    time: "9m",
    actor: "human",
  },
  {
    id: "a3",
    title: "Nightly audit flagged lodash.pick",
    detail: "1 moderate advisory · peach",
    time: "12m",
    actor: "agent",
  },
  {
    id: "a4",
    title: "deploy-4816 went live",
    detail: "grove.peach.dev",
    time: "26m",
    actor: "system",
  },
  {
    id: "a5",
    title: "Jonas merged cart-v2",
    detail: "peach-ui/grove · PR-118",
    time: "31m",
    actor: "human",
  },
  {
    id: "a6",
    title: "Token migration deployed",
    detail: "deploy-4814 · approved by devon.lau",
    time: "1h",
    actor: "agent",
  },
  {
    id: "a7",
    title: "v0.4 changelog posted",
    detail: "#releases · 47 PRs summarized",
    time: "3h",
    actor: "agent",
  },
  {
    id: "a8",
    title: "Catalog search reindexed",
    detail: "grove · 1,204 terms",
    time: "yesterday",
    actor: "system",
  },
];

/* ── Notifications ─────────────────────────────────────── */

export type HomeNotice = {
  id: string;
  title: string;
  detail: string;
  ago: string;
  unread: boolean;
  tone: "warning" | "accent" | "success" | "muted";
};

export const NOTIFICATIONS: HomeNotice[] = [
  {
    id: "n1",
    title: "Deploy gate is waiting on you",
    detail: "run-4213 · grove · Peach Ops",
    ago: "4m",
    unread: true,
    tone: "warning",
  },
  {
    id: "n2",
    title: "Nightly audit flagged 1 advisory",
    detail: "lodash.pick · peach-ui/peach",
    ago: "12m",
    unread: true,
    tone: "accent",
  },
  {
    id: "n3",
    title: "Mara mentioned you in a session",
    detail: "Free-shipping banner · Peach Studio",
    ago: "26m",
    unread: true,
    tone: "accent",
  },
  {
    id: "n4",
    title: "deploy-4814 is live",
    detail: "grove.peach.dev",
    ago: "1h",
    unread: false,
    tone: "success",
  },
  {
    id: "n5",
    title: "Weekly digest is ready",
    detail: "Peach Mail · #releases",
    ago: "3h",
    unread: false,
    tone: "muted",
  },
];
