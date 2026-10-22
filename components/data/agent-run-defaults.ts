import type {
  AgentRunModel,
  AgentRunSource,
  AgentRunTask,
} from "@/components/types";

/** Paste-ready defaults — swap for your API response in production. */
export const defaultAgentRunRequest = "Summarize the catalog 0.4 release";

export const defaultAgentRunBudgetTokens = 128_000;

export const defaultAgentRunSources: AgentRunSource[] = [
  {
    id: "release-thread",
    title: "Release thread",
    origin: "#releases",
    badge: "DOC",
    tokens: 8_400,
  },
  {
    id: "changelog",
    title: "changelog.md",
    origin: "peach-ui/catalog",
    badge: "MD",
    tokens: 12_600,
  },
  {
    id: "usage",
    title: "studio-analytics.csv",
    origin: "Analytics",
    badge: "CSV",
    tokens: 6_900,
  },
  {
    id: "playbook",
    title: "Adoption playbook.pdf",
    origin: "Docs",
    badge: "PDF",
    tokens: 13_300,
  },
];

export const defaultAgentRunModels: AgentRunModel[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    costPer1k: 0.018,
    p50Seconds: 0.82,
    fit: 0.94,
    note: "Best quality · 5.8× over budget",
  },
  {
    id: "gpt-5-2",
    name: "GPT-5.2",
    provider: "OpenAI",
    costPer1k: 0.012,
    p50Seconds: 0.61,
    fit: 0.81,
    note: "Balanced cost and quality",
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    costPer1k: 0.0028,
    p50Seconds: 0.34,
    fit: 0.52,
    note: "Cheapest · weakest on long context",
  },
];

export const defaultAgentRunWinnerId = "gpt-5-2";

export const defaultAgentRunTasks: AgentRunTask[] = [
  { id: "outline", title: "Outline the release", owner: "planner", seconds: 0.9 },
  { id: "draft", title: "Draft the summary", owner: "writer", seconds: 2.1 },
  { id: "verify", title: "Check numbers against analytics", owner: "validator", seconds: 1.4 },
  { id: "post", title: "Post to #releases", owner: "slack", seconds: 0.7 },
];

export const defaultAgentRunPolicy = "Balanced policy";
