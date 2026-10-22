"use client";

/**
 * PeachUI — AgentRun · ContextAssemblerStage (block part)
 * @tier block
 * @requires app/globals.css
 *
 * Sources arrive one at a time into the run's context window;
 * the token meter fills as each lands, then the pack beat settles.
 */

import type { ReactNode } from "react";
import { Check } from "reicon-react";
import {
  UNIT_ANIMATE,
  UNIT_INITIAL,
  UNIT_TRANSITION,
  useRevealMask,
} from "@/components/primitives/agent-log";
import { motion } from "@/components/lib/motion";
import { cx } from "@/lib/utils";
import { formatTokens } from "@/components/lib/agent-run-format";
import type {
  AgentRunLabels,
  AgentRunSource,
  AgentRunSourceBadge,
} from "@/components/types";

const BADGE_TONE: Record<AgentRunSourceBadge, string> = {
  PDF: "bg-red",
  CSV: "bg-green",
  MD: "bg-accent",
  DOC: "bg-orange",
};

function Reveal({ reduced, children }: { reduced: boolean; children: ReactNode }) {
  const mask = useRevealMask(reduced);
  return (
    <motion.div
      initial={reduced ? false : UNIT_INITIAL}
      animate={UNIT_ANIMATE}
      transition={UNIT_TRANSITION}
      {...mask}
      className="overflow-hidden"
    >
      {children}
    </motion.div>
  );
}

export interface ContextStageProps {
  sources: AgentRunSource[];
  budgetTokens: number;
  /** 0…sources.length+1 — one beat per source, then the pack beat. */
  revealed: number;
  labels: AgentRunLabels;
  reduced: boolean;
}

export function ContextStage({
  sources,
  budgetTokens,
  revealed,
  labels,
  reduced,
}: ContextStageProps) {
  const shown = sources.slice(0, Math.min(revealed, sources.length));
  const used = shown.reduce((sum, source) => sum + source.tokens, 0);
  const packed = revealed > sources.length;
  const fill = Math.min(used / budgetTokens, 1);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-2-medium text-ink-2">{labels.sourcesLabel}</p>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-caption-1-regular tabular-nums text-ink-3">
            {formatTokens(used)} / {formatTokens(budgetTokens)}
          </span>
          <span className="h-1 w-20 overflow-hidden rounded-full bg-line-soft" aria-hidden>
            <span
              className="block h-full rounded-full bg-violet transition-[width] duration-300"
              style={{ width: `${fill * 100}%` }}
            />
          </span>
        </div>
      </div>

      <ul className="flex flex-col gap-1 rounded-lg bg-canvas p-1.5">
        {shown.length === 0 ? (
          <li className="px-2 py-3 text-body-regular text-ink-3">
            Waiting for retrieval
          </li>
        ) : null}
        {shown.map((source) => (
          <li key={source.id}>
            <Reveal reduced={reduced}>
              <div className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5">
                <span
                  className={cx(
                    "flex size-5 shrink-0 items-center justify-center rounded-[4px] text-[10px] font-semibold text-white",
                    BADGE_TONE[source.badge],
                  )}
                  aria-hidden
                >
                  {source.badge[0]}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-medium text-ink">
                    {source.title}
                  </span>
                  <span className="block truncate text-caption-1-regular text-ink-3">
                    {source.origin}
                  </span>
                </span>
                <span className="shrink-0 text-caption-1-regular tabular-nums text-ink-3">
                  {formatTokens(source.tokens)}
                </span>
              </div>
            </Reveal>
          </li>
        ))}
      </ul>

      {packed ? (
        <Reveal reduced={reduced}>
          <p className="flex items-center gap-2 px-0.5">
            <Check className="size-3.5 shrink-0 text-green" aria-hidden />
            <span className="text-body-2-medium text-ink">
              {labels.packedLine(formatTokens(used), shown.length)}
            </span>
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
