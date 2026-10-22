"use client";

/**
 * Runs column — status filter chips + run rows.
 * Rows surface live status from the parent's churn state.
 */

import { PillTab, PillTabList } from "@/components/atoms/pill-tab";
import { FILTERS, RUN_SOURCE_LABEL, filterRuns, type OpsRun, type RunFilter, type RunStatus } from "../data";
import { PEOPLE } from "@templates/_shared/fixtures";
import { RunGlyph } from "./run-status";
import { cx } from "@/lib/utils";

export type RunListItem = {
  run: OpsRun;
  status: RunStatus;
  /** Live duration for ticking runs; settled runs use run.durationLabel. */
  durationLabel: string;
};

export function RunList({
  items,
  filter,
  onFilterChange,
  activeId,
  onSelect,
  className,
}: {
  items: RunListItem[];
  filter: RunFilter;
  onFilterChange: (filter: RunFilter) => void;
  activeId: string;
  onSelect: (id: string) => void;
  className?: string;
}) {
  const visible = filterRuns(items, filter);

  return (
    <section
      aria-label="Runs"
      className={cx(
        "flex min-h-0 w-full flex-col overflow-hidden rounded-window bg-surface shadow-card",
        className,
      )}
    >
      {/* filters */}
      <div className="shrink-0 border-b border-line-soft px-3 py-2">
        <PillTabList aria-label="Filter runs" className="flex-wrap">
          {FILTERS.map((f) => (
            <PillTab
              key={f.id}
              variant="gray"
              isSelected={filter === f.id}
              onSelect={() => onFilterChange(f.id)}
            >
              {f.label}
            </PillTab>
          ))}
        </PillTabList>
      </div>

      {/* rows */}
      <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {visible.map(({ run, status, durationLabel }) => {
          const active = run.id === activeId;
          const requester = PEOPLE.find((p) => p.id === run.requesterId);
          return (
            <li key={run.id}>
              <button
                type="button"
                aria-current={active ? "true" : undefined}
                onClick={() => onSelect(run.id)}
                className={cx(
                  "flex w-full items-start gap-2.5 rounded-control px-2 py-2 text-left transition-colors duration-100",
                  active ? "bg-hover-2" : "hover:bg-hover",
                )}
              >
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center">
                  <RunGlyph status={status} />
                </span>
                <span className="min-w-0 flex-1">
                  <span
                    className={cx(
                      "block truncate",
                      active ? "text-body-2-medium text-ink" : "text-body-2-regular text-ink-2",
                    )}
                  >
                    {run.title}
                  </span>
                  <span className="mt-0.5 block truncate text-caption-2-regular text-ink-3">
                    <span className="font-mono">{run.id}</span> · {run.repo} · {run.requestedAgo}
                  </span>
                  <span className="mt-0.5 flex items-center gap-1.5 text-caption-2-regular text-ink-3">
                    <span className="truncate">
                      {requester ? requester.name : RUN_SOURCE_LABEL[run.source]}
                    </span>
                    <span aria-hidden>·</span>
                    <span className="shrink-0 tabular-nums">{durationLabel}</span>
                  </span>
                </span>
              </button>
            </li>
          );
        })}
        {visible.length === 0 ? (
          <li className="px-3 py-8 text-center text-caption-1-regular text-ink-3">
            No runs in this state right now.
          </li>
        ) : null}
      </ul>
    </section>
  );
}
