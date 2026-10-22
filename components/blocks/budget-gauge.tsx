"use client";

/**
 * PeachUI — BudgetGauge (block)
 * @tier block
 * @deps breakdown-card
 * @requires app/globals.css
 *
 * Context window usage: segmented breakdown and cap warning.
 * Non-interactive wrapper around BreakdownCard (context variant).
 */

import {
  BreakdownCard,
  defaultBreakdownCardLabels,
  type BreakdownSegment,
} from "@/components/blocks/breakdown-card";

export type BudgetSegmentId = "system" | "tools" | "files" | "conversation" | "memory";

export type BudgetSegment = {
  id: BudgetSegmentId;
  label: string;
  tokens: number;
  /** Share of used tokens (0–1), not of cap. */
  share: number;
};

export type BudgetGaugeLabels = {
  title: string;
  ofTokens: (capLabel: string) => string;
  left: (formatted: string) => string;
  newChat: string;
  compact: string;
  warning: string;
};

export const defaultBudgetGaugeLabels: BudgetGaugeLabels = {
  title: defaultBreakdownCardLabels.title,
  ofTokens: defaultBreakdownCardLabels.ofTokens,
  left: defaultBreakdownCardLabels.left,
  newChat: defaultBreakdownCardLabels.newChat,
  compact: defaultBreakdownCardLabels.compact,
  warning: defaultBreakdownCardLabels.warning,
};

export type BudgetGaugeVariant = "standalone" | "embedded";

export type BudgetGaugeProps = {
  className?: string;
  variant?: BudgetGaugeVariant;
  model?: string;
  usedTokens: number;
  capTokens: number;
  segments: BudgetSegment[];
  labels?: Partial<BudgetGaugeLabels>;
  warningThreshold?: number;
  onNewChat?: () => void;
  onCompact?: () => void;
};

function toBreakdownSegments(segments: BudgetSegment[]): BreakdownSegment[] {
  return segments.map((seg) => ({
    id: seg.id,
    label: seg.label,
    value: seg.tokens,
    share: seg.share,
  }));
}

export function BudgetGauge({
  className,
  variant = "standalone",
  model,
  usedTokens,
  capTokens,
  segments,
  labels: labelsProp,
  warningThreshold,
  onNewChat,
  onCompact,
}: BudgetGaugeProps) {
  return (
    <BreakdownCard
      className={className}
      variant="context"
      layout={variant === "embedded" ? "embedded" : "standalone"}
      interactive={false}
      model={model}
      totalValue={usedTokens}
      capValue={capTokens}
      segments={toBreakdownSegments(segments)}
      labels={labelsProp}
      warningThreshold={warningThreshold}
      onNewChat={onNewChat}
      onCompact={onCompact}
    />
  );
}
