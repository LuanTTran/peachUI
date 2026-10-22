/** AgentRun — one request played through the three agentic systems. */

export type AgentRunStageId = "context" | "router" | "orchestrator";

export type AgentRunSourceBadge = "PDF" | "CSV" | "MD" | "DOC";

export interface AgentRunSource {
  id: string;
  title: string;
  /** Where the assembler pulled it from. */
  origin: string;
  badge: AgentRunSourceBadge;
  /** Tokens this source contributes to the run. */
  tokens: number;
}

export interface AgentRunModel {
  id: string;
  name: string;
  provider: string;
  costPer1k: number;
  p50Seconds: number;
  /** 0–1 fit drawn while the router weighs the candidate. */
  fit: number;
  /** Reason line shown once the candidate is weighed. */
  note: string;
}

export interface AgentRunTask {
  id: string;
  title: string;
  /** Sub-agent or tool that owns the task. */
  owner: string;
  /** Reported duration once the task settles. */
  seconds: number;
}

export type AgentRunLabels = {
  title: string;
  subtitle: string;
  requestLabel: string;
  stageStripLabel: string;
  sourcesLabel: string;
  candidatesLabel: string;
  tasksLabel: string;
  packedLine: (tokens: string, count: number) => string;
  routedLine: (model: string, policy: string, estimate: string) => string;
  completeLine: (count: number, seconds: string) => string;
  followLive: string;
  run: string;
  running: string;
  replay: string;
};

export const defaultAgentRunLabels: AgentRunLabels = {
  title: "Agent run",
  subtitle: "One request through the stack: context packed, a model picked, work fanned out.",
  requestLabel: "Request",
  stageStripLabel: "Run stages",
  sourcesLabel: "Sources",
  candidatesLabel: "Candidates · Balanced policy",
  tasksLabel: "Tasks",
  packedLine: (tokens, count) => `Packed ${tokens} across ${count} ${count === 1 ? "source" : "sources"}`,
  routedLine: (model, policy, estimate) => `Routed to ${model} · ${policy} · est. ${estimate}`,
  completeLine: (count, seconds) => `Complete · ${count} ${count === 1 ? "task" : "tasks"} · ${seconds}`,
  followLive: "Back to live",
  run: "Run",
  running: "Running",
  replay: "Replay run",
};
