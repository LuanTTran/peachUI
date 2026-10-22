"use client";

/**
 * "Waiting on you" — the pending approval gates from Ops, resolvable in
 * place, plus a Live-now strip of WorkPulse rows for the running tasks.
 */

import Link from "next/link";
import { Check, X } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import type { RunPhase } from "@/components/types";
import { WorkPulse } from "@/components/blocks/work-pulse";
import type { HomeApproval } from "../data";
import { cx } from "@/lib/utils";

export type ApprovalResolution = "approved" | "denied";

export type LiveTask = {
  id: string;
  title: string;
  detail: string;
  phase: RunPhase;
  elapsedMs: number;
};

function ApprovalRow({
  approval,
  resolution,
  onResolve,
}: {
  approval: HomeApproval;
  resolution?: ApprovalResolution;
  onResolve: (id: string, approved: boolean) => void;
}) {
  if (resolution) {
    return (
      <li className="flex items-center gap-2 px-3 py-2.5" aria-live="polite">
        {resolution === "approved" ? (
          <Check className="size-4 shrink-0 text-green" aria-hidden />
        ) : (
          <X className="size-4 shrink-0 text-red" aria-hidden />
        )}
        <span className="min-w-0 flex-1 truncate text-body-2-regular text-ink-2">
          {resolution === "approved" ? approval.approvedNote : approval.deniedNote}
        </span>
        <span className="shrink-0 text-caption-2-regular text-ink-3">just now</span>
      </li>
    );
  }

  return (
    <li className="px-3 py-2.5">
      <div className="flex min-w-0 items-center gap-2">
        <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">
          {approval.title}
        </span>
        <Chip variant="caption" color={approval.risk === "high" ? "rose" : "neutral"}>
          {approval.risk === "high" ? "High risk" : "Low risk"}
        </Chip>
      </div>
      <p className="mt-0.5 truncate text-caption-1-regular text-ink-3">
        <span className="font-mono tabular-nums">{approval.tool}</span>
        <span aria-hidden> · </span>
        <Link
          href="/agent-ops"
          className="font-mono tabular-nums text-ink-3 underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
        >
          {approval.runId}
        </Link>
        <span aria-hidden> · </span>
        {approval.ago}
      </p>
      <div className="mt-2 flex items-center gap-1.5">
        <Button
          variant="primary"
          size="xs"
          onClick={() => onResolve(approval.id, true)}
          aria-label={`Approve ${approval.title}`}
        >
          Approve
        </Button>
        <Button
          variant="secondary"
          size="xs"
          onClick={() => onResolve(approval.id, false)}
          aria-label={`Deny ${approval.title}`}
        >
          Deny
        </Button>
      </div>
    </li>
  );
}

export function NeedsYouCard({
  approvals,
  resolutions,
  liveTasks,
  onResolve,
  className,
}: {
  approvals: HomeApproval[];
  resolutions: Record<string, ApprovalResolution>;
  liveTasks: LiveTask[];
  onResolve: (id: string, approved: boolean) => void;
  className?: string;
}) {
  const pending = approvals.filter((a) => !resolutions[a.id]).length;

  return (
    <section
      aria-label="Waiting on you"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-window bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line-soft px-3 py-2.5">
        <h3 className="text-body-medium text-ink">Waiting on you</h3>
        <span className="text-caption-1-regular tabular-nums text-ink-3" role="status">
          {pending > 0 ? `${pending} pending` : "All clear"}
        </span>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto">
        {approvals.length > 0 ? (
          <ul className="divide-y divide-line-soft">
            {approvals.map((approval) => (
              <ApprovalRow
                key={approval.id}
                approval={approval}
                resolution={resolutions[approval.id]}
                onResolve={onResolve}
              />
            ))}
          </ul>
        ) : null}
        {pending === 0 ? (
          <p className="px-3 py-2.5 text-caption-1-regular text-ink-3">
            Nothing is paused on a gate. New approvals land here as runs hit them.
          </p>
        ) : null}
      </div>

      <div className="border-t border-line-soft px-3 py-2.5">
        <p className="mb-1.5 text-caption-1-medium text-ink-3">Live now</p>
        <div className="flex flex-col gap-1">
          {liveTasks.map((task) => (
            <WorkPulse
              key={task.id}
              variant="status"
              phase={task.phase}
              label={task.title}
              subLabel={task.detail}
              elapsedMs={task.phase === "running" ? task.elapsedMs : undefined}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
