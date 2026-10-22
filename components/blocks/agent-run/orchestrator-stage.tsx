"use client";

/**
 * PeachUI — AgentRun · AgentOrchestratorStage (block part)
 * @tier block
 * @requires app/globals.css
 *
 * The run fans out into owned tasks; each ticks active → done
 * down the guide, then the settled line lands.
 */

import type { ReactNode } from "react";
import { Check } from "reicon-react";
import {
  ShimmerText,
  UNIT_ANIMATE,
  UNIT_INITIAL,
  UNIT_TRANSITION,
  useRevealMask,
} from "@/components/primitives/agent-log";
import { motion } from "@/components/lib/motion";
import { cx } from "@/lib/utils";
import type {
  AgentRunLabels,
  AgentRunTask,
} from "@/components/types";

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

function TaskGlyph({ status }: { status: "pending" | "active" | "done" }) {
  if (status === "done") {
    return <Check className="size-4 shrink-0 text-green" aria-hidden />;
  }
  if (status === "active") {
    return (
      <span
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none"
        aria-hidden
      />
    );
  }
  return (
    <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
      <span className="size-1.5 rounded-full bg-line-strong" />
    </span>
  );
}

export interface OrchestratorStageProps {
  tasks: AgentRunTask[];
  /** 0…tasks.length+1 — one beat per task, then the settled line. */
  revealed: number;
  /** False when the run has not reached this stage yet (pinned ahead). */
  live: boolean;
  labels: AgentRunLabels;
  reduced: boolean;
}

export function OrchestratorStage({
  tasks,
  revealed,
  live,
  labels,
  reduced,
}: OrchestratorStageProps) {
  const doneCount = Math.min(revealed, tasks.length);
  const settled = revealed > tasks.length;
  const totalSeconds = tasks.reduce((sum, task) => sum + task.seconds, 0);

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-center justify-between gap-3">
        <p className="text-body-2-medium text-ink-2">{labels.tasksLabel}</p>
        <span className="text-caption-1-regular tabular-nums text-ink-3">
          {doneCount} of {tasks.length}
        </span>
      </div>

      <ol className="flex flex-col rounded-lg bg-canvas p-1.5">
        {tasks.map((task, index) => {
          const status =
            index < doneCount ? "done" : live && index === doneCount ? "active" : "pending";
          const last = index === tasks.length - 1;
          return (
            <li key={task.id} className="flex flex-col">
              <div className="flex min-w-0 items-center gap-2.5 rounded-md px-2 py-1.5">
                <TaskGlyph status={status} />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-medium text-ink">
                    {status === "active" ? (
                      <ShimmerText>{task.title}</ShimmerText>
                    ) : (
                      task.title
                    )}
                  </span>
                </span>
                <span className="shrink-0 rounded-full bg-inset px-1.5 py-0.5 text-micro text-ink-3">
                  {task.owner}
                </span>
                <span className="w-10 shrink-0 text-end text-caption-1-regular tabular-nums text-ink-3">
                  {status === "done" ? `${task.seconds.toFixed(1)}s` : ""}
                </span>
              </div>
              {!last ? (
                <span className="flex h-3" aria-hidden>
                  <span className="ml-2 flex w-4 justify-center">
                    <span
                      className={cx(
                        "h-full w-px transition-colors duration-300",
                        status === "done" ? "bg-green" : "bg-line-strong/50",
                      )}
                    />
                  </span>
                </span>
              ) : null}
            </li>
          );
        })}
      </ol>

      {settled ? (
        <Reveal reduced={reduced}>
          <p className="flex items-center gap-2 px-0.5">
            <Check className="size-3.5 shrink-0 text-green" aria-hidden />
            <span className="text-body-2-medium text-ink">
              {labels.completeLine(tasks.length, `${totalSeconds.toFixed(1)}s`)}
            </span>
          </p>
        </Reveal>
      ) : null}
    </div>
  );
}
