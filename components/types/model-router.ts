export type ModelRouterPolicyMode = "cost" | "balanced" | "quality";

export type ModelRouteColor = "chart-1" | "chart-2" | "violet" | "schedule";

export type ModelRouterProject = {
  id: string;
  label: string;
};

export type ModelRouterModel = {
  id: string;
  name: string;
  provider: string;
  color: ModelRouteColor;
  costPer1k: number;
};

export type ModelRoute = {
  id: string;
  name: string;
  provider: string;
  color: ModelRouteColor;
  /** Traffic share shown in the table (0–100). */
  sharePercent: number;
  p50Seconds: number;
  p95Seconds: number;
  costPer1k: number;
  /** Error share (0–100). */
  errorPercent: number;
  /** Requests per second label on the gateway chart. */
  throughputPerSec: number;
};

export type ModelRouterSummary = {
  blendedCostPer1k: number;
  requestsPerSec: number;
  p95Seconds: number;
  errorPercent: number;
};

export type ModelRouterLabels = {
  title: string;
  blendedCost: string;
  requestsPerSec: string;
  p95: string;
  errors: string;
  gateway: string;
  routes: string;
  share: string;
  latency: string;
  costPer1k: string;
  errorsColumn: string;
  policyMode: string;
  costMode: string;
  balancedMode: string;
  qualityMode: string;
  fallback: string;
  whenModelFails: string;
  retryOn: string;
  deployPolicy: string;
  policyLive: (revision: string, environment: string) => string;
  projectLabel: string;
  settings: string;
  close: string;
  moreActions: string;
  modelPickerLabel: string;
};

export const defaultModelRouterLabels: ModelRouterLabels = {
  title: "Model router",
  blendedCost: "Blended cost",
  requestsPerSec: "req/s",
  p95: "P95",
  errors: "errors",
  gateway: "Gateway",
  routes: "Routes",
  share: "Share",
  latency: "P50 / P95 s",
  costPer1k: "$ / 1K",
  errorsColumn: "Errors",
  policyMode: "Routing priority",
  costMode: "Cost",
  balancedMode: "Balanced",
  qualityMode: "Quality",
  fallback: "Use backup routing",
  whenModelFails: "When",
  retryOn: "fails, retry on",
  deployPolicy: "Deploy policy",
  policyLive: (revision, environment) => `${revision} · Live on ${environment}`,
  projectLabel: "Project",
  settings: "Router settings",
  close: "Close model router",
  moreActions: "More actions",
  modelPickerLabel: "Choose a model",
};
