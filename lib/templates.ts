export type TemplateEntry = {
  slug: string;
  title: string;
  product: string;
  tagline: string;
  packagePath: string;
  /** Catalog slugs this template is composed from. */
  builtWith: string[];
  status: "planned" | "wip" | "live";
};

export const TEMPLATES: TemplateEntry[] = [
  {
    slug: "coding-agent",
    title: "Coding agent",
    product: "Peach Studio",
    tagline: "A chat-first coding agent: prompt, trace, review the diff, ship.",
    packagePath: "packages/templates/coding-agent",
    builtWith: ["prompt-deck", "agent-chat", "sidebar", "tree-view", "avatar-stack", "theme-toggle", "status-dot", "chip", "streaming-text", "agent-thinking"],
    status: "live",
  },
  {
    slug: "agent-ops",
    title: "Agent ops console",
    product: "Peach Ops",
    tagline: "Watch the fleet: live runs, deploy gates, and the approvals agents wait on.",
    packagePath: "packages/templates/agent-ops",
    builtWith: ["sidebar", "page-mast", "agent-run", "tool-approval", "deploy-gate", "audit-explorer", "permission-gate", "agent-run-trace", "terminal-output", "data-grid", "timeline-feed", "metric-strip", "live-line", "agent-inline-chips", "segmented-control", "pill-tab", "avatar", "avatar-stack", "breadcrumb", "chip", "icon-button", "spinner", "status-dot", "button"],
    status: "live",
  },
  {
    slug: "inbox-triage",
    title: "AI inbox triage",
    product: "Peach Mail",
    tagline: "The agent cleared the inbox overnight — you approve the drafts and make the calls.",
    packagePath: "packages/templates/peach-mail",
    builtWith: ["sidebar", "page-mast", "bulk-action-bar", "stream-text", "notification", "avatar", "avatar-stack", "breadcrumb", "chip", "icon-button", "close-button", "input", "checkbox", "radio", "textarea", "status-dot", "button"],
    status: "live",
  },
  {
    slug: "command-center",
    title: "Command dashboard",
    product: "Peach Home",
    tagline: "The founder's home base: brief, KPIs, deploys, and the agent task board.",
    packagePath: "packages/templates/command-center",
    builtWith: ["sidebar", "page-mast", "morning-brief", "stat-cards", "revenue-chart-card", "kanban-board", "pipeline-strip", "timeline-feed", "work-pulse", "dropdown", "badge", "breadcrumb", "chip", "avatar", "avatar-stack", "theme-toggle", "status-dot", "button"],
    status: "live",
  },
];
