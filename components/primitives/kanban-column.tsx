"use client";

import type { ReactNode, Ref } from "react";
import { More2, Plus } from "reicon-react";
import { IconButton } from "@/components/atoms/icon-button";
import { cx } from "@/lib/utils";

export type KanbanColumnLabels = {
  columnOptions: (columnTitle: string) => string;
  addCard: (columnTitle: string) => string;
};

export const defaultKanbanColumnLabels: KanbanColumnLabels = {
  columnOptions: (title) => `Column options for ${title}`,
  addCard: (title) => `Add a card to ${title}`,
};

export type KanbanColumnProps = {
  title: string;
  count?: number;
  limit?: number;
  labels?: Partial<KanbanColumnLabels>;
  isDropTarget?: boolean;
  innerRef?: Ref<HTMLDivElement>;
  className?: string;
  children: ReactNode;
};

export function KanbanColumn({
  title,
  count,
  limit,
  labels: labelsProp,
  isDropTarget = false,
  innerRef,
  className,
  children,
}: KanbanColumnProps) {
  const labels = { ...defaultKanbanColumnLabels, ...labelsProp };
  const n = count;
  const countLabel = limit != null && n != null ? `${n}/${limit}` : n != null ? String(n) : null;

  return (
    <section
      className={cx(
        "flex min-w-[min(100%,240px)] flex-1 flex-col rounded-panel bg-inset/80 shadow-hairline",
        "motion-safe:transition-[box-shadow,background-color] motion-safe:duration-200 motion-reduce:transition-none",
        isDropTarget && "bg-accent-muted/40 ring-1 ring-accent/30",
        className,
      )}
    >
      <header className="flex items-center gap-1 px-2 py-2">
        <h3 className="min-w-0 flex-1 truncate text-caption-1-semibold text-ink">{title}</h3>
        {countLabel ? (
          <span className="shrink-0 rounded-full px-1.5 py-0.5 font-mono text-[10px] tabular-nums text-ink-3">
            {countLabel}
          </span>
        ) : null}
        <IconButton
          icon={More2}
          size="small"
          aria-label={labels.columnOptions(title)}
          className="pointer-events-none opacity-50"
          tabIndex={-1}
          disabled
        />
        <IconButton
          icon={Plus}
          size="small"
          aria-label={labels.addCard(title)}
          className="pointer-events-none opacity-50"
          tabIndex={-1}
          disabled
        />
      </header>
      <div ref={innerRef} className="flex min-h-[120px] flex-col gap-2 px-2 pb-2">
        {children}
      </div>
    </section>
  );
}
