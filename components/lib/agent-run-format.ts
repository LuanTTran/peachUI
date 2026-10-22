/** Shared formatters for the AgentRun stages. */

export function formatTokens(tokens: number) {
  return tokens >= 1000 ? `${(tokens / 1000).toFixed(1)}k` : `${tokens}`;
}

export function formatEstimate(costPer1k: number, tokens: number) {
  return `$${((costPer1k * tokens) / 1000).toFixed(2)}`;
}
