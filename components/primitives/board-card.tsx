"use client";

import type { HTMLAttributes } from "react";
import { Folder } from "reicon-react";
import { Chip } from "@/components/atoms/chip";
import { AvatarStack } from "@/components/primitives/avatar-stack";
import { cx } from "@/lib/utils";

export type KanbanPriority = "low" | "medium" | "high" | "urgent";

export type BoardCardLabels = {
  priorityLow: string;
  priorityMedium: string;
  priorityHigh: string;
  priorityUrgent: string;
  since: (date: string) => string;
  completed: (date: string) => string;
};

export const defaultBoardCardLabels: BoardCardLabels = {
  priorityLow: "Low",
  priorityMedium: "Medium",
  priorityHigh: "High",
  priorityUrgent: "Urgent",
  since: (date) => `Since ${date}`,
  completed: (date) => `Completed ${date}`,
};

const priorityColor: Record<KanbanPriority, "cyan" | "yellow" | "orange" | "rose"> = {
  low: "cyan",
  medium: "yellow",
  high: "orange",
  urgent: "rose",
};

export type BoardCardProps = {
  title: string;
  ticket?: string;
  area?: string;
  priority?: KanbanPriority;
  project?: string;
  since?: string;
  completed?: string;
  assignees?: { name: string; src?: string }[];
  labels?: Partial<BoardCardLabels>;
  isDragging?: boolean;
  className?: string;
} & HTMLAttributes<HTMLElement>;

export function BoardCard({
  title,
  ticket,
  area,
  priority,
  project,
  since,
  completed,
  assignees = [],
  labels: labelsProp,
  isDragging = false,
  className,
  ...rest
}: BoardCardProps) {
  const labels = { ...defaultBoardCardLabels, ...labelsProp };
  const trailTicket = ticket;
  const trailArea = area;
  const footer = completed
    ? labels.completed(completed)
    : since
      ? labels.since(since)
      : null;

  const priorityLabel =
    priority === "low"
      ? labels.priorityLow
      : priority === "medium"
        ? labels.priorityMedium
        : priority === "high"
          ? labels.priorityHigh
          : priority === "urgent"
            ? labels.priorityUrgent
            : null;

  return (
    <article
      className={cx(
        "rounded-panel border border-line bg-surface p-2.5 shadow-hairline",
        "motion-safe:transition-[box-shadow,transform] motion-safe:duration-150 motion-reduce:transition-none",
        isDragging
          ? "scale-[1.02] shadow-md ring-2 ring-accent/25"
          : "motion-safe:hover:shadow-[var(--shadow-hairline),0_4px_12px_oklch(0_0_0/0.06)]",
        className,
      )}
      {...rest}
    >
      {(trailTicket || trailArea || assignees.length > 0) && (
        <div className="mb-2 flex items-start justify-between gap-2">
          {trailTicket || trailArea ? (
            <p className="min-w-0 truncate text-caption text-ink-3">
              {trailTicket ? (
                <span className="font-mono tabular-nums">{trailTicket}</span>
              ) : null}
              {trailTicket && trailArea ? <span aria-hidden> · </span> : null}
              {trailArea ? <span>{trailArea}</span> : null}
            </p>
          ) : (
            <span />
          )}
          {assignees.length > 0 ? (
            <AvatarStack items={assignees} size="sm" max={3} className="shrink-0" />
          ) : null}
        </div>
      )}

      {(priority || project) && (
        <div className="mb-2 flex flex-wrap items-center gap-1.5">
          {priority && priorityLabel ? (
            <Chip variant="caption" color={priorityColor[priority]} className="mx-0">
              {priorityLabel}
            </Chip>
          ) : null}
          {project ? (
            <span className="inline-flex max-w-full items-center gap-1 text-caption text-ink-3">
              <Folder className="size-3 shrink-0 opacity-70" aria-hidden />
              <span className="truncate">{project}</span>
            </span>
          ) : null}
        </div>
      )}

      <p className="text-body-medium text-pretty text-ink">{title}</p>

      {footer ? <p className="mt-2 text-caption text-ink-3">{footer}</p> : null}
    </article>
  );
}
