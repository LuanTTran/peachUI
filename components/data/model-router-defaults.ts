import type {
  ModelRoute,
  ModelRouterModel,
  ModelRouterProject,
  ModelRouterSummary,
} from "@/components/types";

/** Paste-ready defaults — swap for your API response in production. */
export const defaultModelRouterProjects: ModelRouterProject[] = [
  { id: "assistant-prod", label: "assistant-prod" },
  { id: "assistant-staging", label: "assistant-staging" },
  { id: "docs-preview", label: "docs-preview" },
];

export const defaultModelRouterModels: ModelRouterModel[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    color: "chart-1",
    costPer1k: 0.018,
  },
  {
    id: "gpt-5-2",
    name: "GPT-5.2",
    provider: "OpenAI",
    color: "chart-2",
    costPer1k: 0.012,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    color: "violet",
    costPer1k: 0.0028,
  },
  {
    id: "qwen3-32b",
    name: "Qwen3 32B",
    provider: "Alibaba",
    color: "schedule",
    costPer1k: 0.0009,
  },
];

export const defaultModelRouterRoutes: ModelRoute[] = [
  {
    id: "claude-opus-4-6",
    name: "Claude Opus 4.6",
    provider: "Anthropic",
    color: "chart-1",
    sharePercent: 17,
    p50Seconds: 0.82,
    p95Seconds: 1.94,
    costPer1k: 0.018,
    errorPercent: 0.42,
    throughputPerSec: 57,
  },
  {
    id: "gpt-5-2",
    name: "GPT-5.2",
    provider: "OpenAI",
    color: "chart-2",
    sharePercent: 42,
    p50Seconds: 0.61,
    p95Seconds: 1.31,
    costPer1k: 0.012,
    errorPercent: 0.38,
    throughputPerSec: 140,
  },
  {
    id: "claude-haiku-4-5",
    name: "Claude Haiku 4.5",
    provider: "Anthropic",
    color: "violet",
    sharePercent: 28,
    p50Seconds: 0.34,
    p95Seconds: 0.88,
    costPer1k: 0.0028,
    errorPercent: 0.55,
    throughputPerSec: 93,
  },
  {
    id: "qwen3-32b",
    name: "Qwen3 32B",
    provider: "Alibaba",
    color: "schedule",
    sharePercent: 13,
    p50Seconds: 0.48,
    p95Seconds: 1.12,
    costPer1k: 0.0009,
    errorPercent: 0.71,
    throughputPerSec: 43,
  },
];

export const defaultModelRouterSummary: ModelRouterSummary = {
  blendedCostPer1k: 0.0084,
  requestsPerSec: 333,
  p95Seconds: 1.26,
  errorPercent: 0.5,
};
