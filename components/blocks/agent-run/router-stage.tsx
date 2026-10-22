"use client";

/**
 * PeachUI — AgentRun · ModelRouterStage (block part)
 * @tier block
 * @requires app/globals.css
 *
 * Candidates sit dimmed while the router weighs each in turn —
 * the fit bar draws, the note lands — then the winner is picked.
 */

import { Check } from "reicon-react";
import { ShimmerText } from "@/components/primitives/agent-log";
import { cx } from "@/lib/utils";
import { formatEstimate } from "@/components/lib/agent-run-format";
import type {
  AgentRunLabels,
  AgentRunModel,
} from "@/components/types";

export interface RouterStageProps {
  models: AgentRunModel[];
  winnerId: string;
  /** Routing policy shown in the reason line, e.g. "Balanced policy". */
  policy: string;
  /** Packed context size, for the per-run cost estimate. */
  contextTokens: number;
  /** 0…models.length+1 — one beat per candidate, then the pick. */
  revealed: number;
  /** False when the run has not reached this stage yet (pinned ahead). */
  live: boolean;
  labels: AgentRunLabels;
}

export function RouterStage({
  models,
  winnerId,
  policy,
  contextTokens,
  revealed,
  live,
  labels,
}: RouterStageProps) {
  const picked = revealed > models.length;
  const winner = models.find((model) => model.id === winnerId) ?? models[0] ?? null;

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <p className="text-body-2-medium text-ink-2">{labels.candidatesLabel}</p>

      <ul className="flex flex-col gap-1 rounded-lg bg-canvas p-1.5">
        {models.map((model, index) => {
          const scored = revealed > index;
          const weighing = live && revealed === index;
          const isWinner = picked && model.id === winner?.id;
          return (
            <li
              key={model.id}
              className={cx(
                "flex flex-col gap-1 rounded-md px-2 py-2 transition-colors duration-200",
                isWinner ? "bg-surface shadow-xs" : "",
                !scored && !weighing ? "opacity-50" : "",
              )}
            >
              <div className="flex min-w-0 items-center gap-2.5">
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-medium text-ink">
                    {model.name}
                  </span>
                  <span className="block truncate text-caption-1-regular text-ink-3">
                    {model.provider} · p50 {model.p50Seconds.toFixed(2)}s · $
                    {model.costPer1k.toFixed(4)}/1K
                  </span>
                </span>
                <span className="flex w-16 shrink-0 items-center" aria-hidden>
                  <span className="h-1 w-full overflow-hidden rounded-full bg-line-soft">
                    <span
                      className={cx(
                        "block h-full rounded-full transition-[width] duration-500",
                        isWinner ? "bg-green" : "bg-schedule",
                      )}
                      style={{ width: `${scored ? model.fit * 100 : 0}%` }}
                    />
                  </span>
                </span>
                {isWinner ? (
                  <Check className="size-4 shrink-0 text-green" aria-hidden />
                ) : null}
              </div>
              <p className="min-h-4 pl-0.5 text-caption-1-regular text-ink-3">
                {weighing ? (
                  <ShimmerText>Weighing</ShimmerText>
                ) : scored ? (
                  model.note
                ) : null}
              </p>
            </li>
          );
        })}
      </ul>

      {picked && winner ? (
        <p
          className="flex items-center gap-2 px-0.5"
          style={{ animation: "fade-up 300ms cubic-bezier(0.23, 1, 0.32, 1) both" }}
        >
          <Check className="size-3.5 shrink-0 text-green" aria-hidden />
          <span className="text-body-2-medium text-ink">
            {labels.routedLine(
              winner.name,
              policy,
              formatEstimate(winner.costPer1k, contextTokens),
            )}
          </span>
        </p>
      ) : null}
    </div>
  );
}
