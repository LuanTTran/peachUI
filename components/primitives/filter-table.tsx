"use client";


import { useMemo, useState } from "react";
import { Chip } from "@/components/atoms/chip";
import { blockEaseCss } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

export type AuditOutcome = "denied" | "allowed" | "flagged";

export type FilterTableRow = {
  id: string;
  action: string;
  time: string;
  outcome: AuditOutcome;
  actor: string;
};

export type FilterTableLabels = {
  columns: { action: string; time: string; outcome: string; actor: string };
  filters: { all: string; denied: string; allowed: string; flagged: string };
};

const DEFAULT_ROWS: FilterTableRow[] = [
  {
    id: "1",
    action: "Export audit bundle",
    time: "Oct 14 · 08:41",
    outcome: "allowed",
    actor: "Maya Chen",
  },
  {
    id: "2",
    action: "Bulk role deny",
    time: "Oct 14 · 09:02",
    outcome: "denied",
    actor: "System policy",
  },
  {
    id: "3",
    action: "Session replay download",
    time: "Oct 14 · 09:11",
    outcome: "flagged",
    actor: "Alex Rivera",
  },
  {
    id: "4",
    action: "Retention window change",
    time: "Oct 14 · 09:22",
    outcome: "allowed",
    actor: "Jordan Lee",
  },
  {
    id: "5",
    action: "API key rotation",
    time: "Oct 14 · 09:35",
    outcome: "denied",
    actor: "Sam Okonkwo",
  },
];

const DEFAULT_LABELS: FilterTableLabels = {
  columns: { action: "Action", time: "Time", outcome: "Outcome", actor: "Actor" },
  filters: { all: "All", denied: "Denied", allowed: "Allowed", flagged: "Flagged" },
};

const OUTCOME_CHIP: Record<AuditOutcome, { color: "rose" | "lime" | "yellow" }> = {
  denied: { color: "rose" },
  allowed: { color: "lime" },
  flagged: { color: "yellow" },
};

export type AuditFilter = "all" | AuditOutcome;

const FILTER_DOTS: Partial<Record<AuditFilter, string>> = {
  denied: "bg-red",
  allowed: "bg-green",
  flagged: "bg-orange",
};

export type FilterTableProps = {
  rows?: FilterTableRow[];
  labels?: FilterTableLabels;
  className?: string;
  variant?: string;
  showFilters?: boolean;
  chrome?: "card" | "plain";
  filter?: AuditFilter;
  onFilterChange?: (filter: AuditFilter) => void;
  selectedId?: string;
  onSelect?: (id: string) => void;
};

export function FilterTable({
  rows = DEFAULT_ROWS,
  labels = DEFAULT_LABELS,
  className,
  showFilters = true,
  chrome = "card",
  filter: filterProp,
  onFilterChange,
  selectedId,
  onSelect,
}: FilterTableProps = {}) {
  const [internalFilter, setInternalFilter] = useState<AuditFilter>("all");
  const filter = filterProp ?? internalFilter;

  const setFilter = (next: AuditFilter) => {
    if (filterProp === undefined) setInternalFilter(next);
    onFilterChange?.(next);
  };

  const filters = useMemo(() => {
    const counts = { denied: 0, allowed: 0, flagged: 0 };
    for (const row of rows) {
      counts[row.outcome] += 1;
    }
    return [
      { key: "all" as const, label: labels.filters.all, count: rows.length },
      { key: "denied" as const, label: labels.filters.denied, dotClass: FILTER_DOTS.denied, count: counts.denied },
      { key: "allowed" as const, label: labels.filters.allowed, dotClass: FILTER_DOTS.allowed, count: counts.allowed },
      { key: "flagged" as const, label: labels.filters.flagged, dotClass: FILTER_DOTS.flagged, count: counts.flagged },
    ];
  }, [rows, labels.filters]);

  return (
    <div className={cx("w-full min-w-0", className)}>
      {showFilters ? (
      <div
        className="-mx-1 mb-1 flex items-center gap-1 overflow-x-auto px-1 py-1"
        style={{ scrollbarWidth: "none" }}
      >
        {filters.map((f) => {
          const active = filter === f.key;
          return (
            <button
              key={f.key}
              type="button"
              aria-pressed={active}
              onClick={() => setFilter(f.key)}
              className={cx(
                "flex h-6.5 shrink-0 items-center gap-1.5 rounded-full px-2.5 text-caption font-medium",
                "transition-[background-color,box-shadow,color] duration-200",
                active ? "bg-surface text-ink shadow-btn" : "text-ink-2 hover:bg-hover",
              )}
            >
              {f.dotClass ? <span className={cx("size-1.5 rounded-full", f.dotClass)} aria-hidden /> : null}
              {f.label}
              <span
                className={cx(
                  "rounded-[4px] px-1 text-micro tabular-nums",
                  active ? "bg-field text-ink-2" : "text-ink-3",
                )}
              >
                {f.count}
              </span>
            </button>
          );
        })}
      </div>
      ) : null}

      <div
        aria-label="Scrollable audit table"
        className={cx("overflow-x-auto", chrome === "card" && "rounded-card bg-surface shadow-card")}
        role="region"
        tabIndex={0}
        style={{ scrollbarWidth: "none" }}
      >
        <div className="min-w-[420px]">
          <div
            className="grid grid-cols-[minmax(0,1.3fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_minmax(0,0.9fr)] border-b border-[var(--grid-line)] text-meta font-medium text-ink-2"
          >
            <span className="border-r border-[var(--grid-line)] px-3 py-2">{labels.columns.action}</span>
            <span className="border-r border-[var(--grid-line)] px-3 py-2">{labels.columns.time}</span>
            <span className="border-r border-[var(--grid-line)] px-3 py-2">{labels.columns.outcome}</span>
            <span className="px-3 py-2">{labels.columns.actor}</span>
          </div>
          {rows.map((row) => {
            const shown = filter === "all" || row.outcome === filter;
            const chip = OUTCOME_CHIP[row.outcome];
            const selected = selectedId === row.id;
            const rowClass = cx(
              "grid w-full grid-cols-[minmax(0,1.3fr)_minmax(0,0.75fr)_minmax(0,0.85fr)_minmax(0,0.9fr)] border-b border-[var(--grid-line)] text-left text-body transition-colors duration-100",
              onSelect && "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
              selected ? "bg-canvas" : "bg-transparent hover:bg-hover",
            );
            const cells = (
              <>
                <span className="flex min-w-0 items-center border-r border-[var(--grid-line)] px-3 py-2">
                  <span className="truncate font-medium text-ink">{row.action}</span>
                </span>
                <span className="flex items-center whitespace-nowrap border-r border-[var(--grid-line)] px-3 py-2 text-ink-2 tabular-nums">
                  {row.time}
                </span>
                <span className="flex items-center border-r border-[var(--grid-line)] px-3 py-2">
                  <Chip variant="caption" color={chip.color}>
                    {labels.filters[row.outcome]}
                  </Chip>
                </span>
                <span className="flex min-w-0 items-center px-3 py-2 text-ink-2">
                  <span className="truncate">{row.actor}</span>
                </span>
              </>
            );
            return (
              <div
                key={row.id}
                inert={!shown}
                className="grid transition-[grid-template-rows,opacity] duration-300"
                style={{
                  gridTemplateRows: shown ? "1fr" : "0fr",
                  opacity: shown ? 1 : 0,
                  transitionTimingFunction: blockEaseCss,
                }}
              >
                <div className="overflow-hidden">
                  {onSelect ? (
                    <button
                      type="button"
                      aria-pressed={selected}
                      onClick={() => onSelect(row.id)}
                      className={rowClass}
                    >
                      {cells}
                    </button>
                  ) : (
                  <div className={rowClass}>
                    {cells}
                  </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
