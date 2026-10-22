"use client";

/**
 * PeachUI — AuditExplorer (block)
 * @tier block
 * @deps filter-table, timeline-feed, chip, button, motion
 * @requires app/globals.css
 *
 * One day's audit: filter by outcome, open an event, read the trail
 * that cannot change, then export that record.
 */

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Download } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import {
  FilterTable,
  type AuditFilter,
  type AuditOutcome,
  type FilterTableRow,
} from "@/components/primitives/filter-table";
import { TimelineFeed, type TimelineEntry } from "@/components/primitives/timeline-feed";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

const PILL_MOVE = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const,
};

const FILTERS: { key: AuditFilter; label: string }[] = [
  { key: "all", label: "All" },
  { key: "denied", label: "Denied" },
  { key: "allowed", label: "Allowed" },
  { key: "flagged", label: "Flagged" },
];

const OUTCOME_CHIP: Record<AuditOutcome, "rose" | "lime" | "yellow"> = {
  denied: "rose",
  allowed: "lime",
  flagged: "yellow",
};

const OUTCOME_LABEL: Record<AuditOutcome, string> = {
  denied: "Denied",
  allowed: "Allowed",
  flagged: "Flagged",
};

export type AuditEvent = FilterTableRow & {
  trail: TimelineEntry[];
};

const DEFAULT_EVENTS: AuditEvent[] = [
  {
    id: "export",
    action: "Export audit bundle",
    time: "Oct 14 · 08:41",
    outcome: "allowed",
    actor: "Maya Chen",
    trail: [
      { id: "export-1", title: "Export requested", detail: "studio.peach-ui.dev/audit", time: "08:41", actor: "human" },
      { id: "export-2", title: "Bundle sealed", detail: "42 events", time: "08:41", actor: "system" },
      { id: "export-3", title: "Download opened", detail: "Maya Chen", time: "08:42", actor: "human" },
    ],
  },
  {
    id: "deny",
    action: "Bulk role deny",
    time: "Oct 14 · 09:02",
    outcome: "denied",
    actor: "System policy",
    trail: [
      { id: "deny-1", title: "Policy check started", detail: "Role: billing-admin", time: "09:02", actor: "system" },
      { id: "deny-2", title: "12 principals denied", detail: "Rule still in force", time: "09:02", actor: "system" },
    ],
  },
  {
    id: "replay",
    action: "Session replay download",
    time: "Oct 14 · 09:11",
    outcome: "flagged",
    actor: "Alex Rivera",
    trail: [
      { id: "replay-1", title: "Replay requested", detail: "3 sessions", time: "09:11", actor: "human" },
      { id: "replay-2", title: "Flagged for off-hours access", detail: "Held before download", time: "09:12", actor: "agent" },
      { id: "replay-3", title: "Held for review", detail: "Waiting on a person", time: "09:12", actor: "system" },
    ],
  },
  {
    id: "retention",
    action: "Retention window change",
    time: "Oct 14 · 09:22",
    outcome: "allowed",
    actor: "Jordan Lee",
    trail: [
      { id: "retention-1", title: "Window proposed", detail: "90 → 180 days", time: "09:22", actor: "human" },
      { id: "retention-2", title: "Policy allowed the change", detail: "Applied to the workspace", time: "09:22", actor: "system" },
    ],
  },
  {
    id: "rotation",
    action: "API key rotation",
    time: "Oct 14 · 09:35",
    outcome: "denied",
    actor: "Sam Okonkwo",
    trail: [
      { id: "rotation-1", title: "Rotation requested", detail: "Key prod-3", time: "09:35", actor: "human" },
      { id: "rotation-2", title: "Denied: key still in use", detail: "2 active clients", time: "09:35", actor: "system" },
    ],
  },
];

function visibleEvents(events: AuditEvent[], filter: AuditFilter) {
  if (filter === "all") return events;
  return events.filter((event) => event.outcome === filter);
}

function openingEventId(events: AuditEvent[]) {
  return events.find((event) => event.outcome === "flagged")?.id ?? events[0]?.id ?? "";
}

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export type AuditExplorerProps = {
  className?: string;
  events?: AuditEvent[];
  dateLabel?: string;
};

export function AuditExplorer({
  className,
  events = DEFAULT_EVENTS,
  dateLabel = "Oct 14",
}: AuditExplorerProps) {
  const reducedMotion = useReducedMotion();
  const tabsId = useId();
  const [filter, setFilter] = useState<AuditFilter>("all");
  const [selectedId, setSelectedId] = useState(() => openingEventId(events));
  const [exportedId, setExportedId] = useState<string | null>(null);
  const [exportTick, setExportTick] = useState(0);

  const counts = {
    all: events.length,
    denied: events.filter((event) => event.outcome === "denied").length,
    allowed: events.filter((event) => event.outcome === "allowed").length,
    flagged: events.filter((event) => event.outcome === "flagged").length,
  };
  const visible = visibleEvents(events, filter);
  const selected = events.find((event) => event.id === selectedId) ?? null;
  const exported = selected !== null && exportedId === selected.id;

  const selectFilter = (next: AuditFilter) => {
    setFilter(next);
    const nextVisible = visibleEvents(events, next);
    if (!nextVisible.some((event) => event.id === selectedId)) {
      setSelectedId(nextVisible[0]?.id ?? "");
      setExportedId(null);
    }
  };

  const selectEvent = (id: string) => {
    setSelectedId(id);
    setExportedId(null);
  };

  const onTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const keys = FILTERS.map((item) => item.key);
    const index = Math.max(0, keys.indexOf(filter));
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % keys.length;
    else if (event.key === "ArrowLeft") nextIndex = (index - 1 + keys.length) % keys.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = keys.length - 1;
    else return;
    event.preventDefault();
    const next = keys[nextIndex] ?? "all";
    selectFilter(next);
    event.currentTarget.querySelector<HTMLButtonElement>(`[data-filter="${next}"]`)?.focus();
  };

  const exportRecord = () => {
    if (!selected) return;
    setExportedId(selected.id);
    setExportTick((tick) => tick + 1);
  };

  const footerKey = !selected ? "empty" : exported ? `exported-${selected.id}-${exportTick}` : selected.id;
  const filterLabel = FILTERS.find((item) => item.key === filter)?.label ?? "All";

  return (
    <section
      aria-label="Audit explorer"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Events</h2>
            <p className="text-body-2-regular text-ink-2 tabular-nums">{dateLabel}</p>
          </div>

          <div
            role="tablist"
            aria-label="Outcome"
            onKeyDown={onTabsKeyDown}
            className="flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-canvas p-1"
          >
            {FILTERS.map((item) => {
              const active = filter === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  role="tab"
                  id={`${tabsId}-${item.key}`}
                  data-filter={item.key}
                  aria-selected={active}
                  tabIndex={active ? 0 : -1}
                  onClick={() => selectFilter(item.key)}
                  className={cx(
                    "button-press-motion relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3",
                    "text-body-2-medium outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    active ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {active ? (
                    <motion.span
                      layoutId={`${tabsId}-pill`}
                      aria-hidden
                      initial={false}
                      transition={{ layout: motionInstantIfReduced(reducedMotion, PILL_MOVE) }}
                      className="absolute inset-0 rounded-full bg-surface shadow-xs ring-1 ring-line"
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                  <span className="relative inline-flex min-w-5 items-center justify-center rounded-md bg-hover-2 px-1 text-caption-1-medium text-ink-2 tabular-nums">
                    {counts[item.key]}
                  </span>
                </button>
              );
            })}
          </div>

          {visible.length === 0 ? (
            <div className="flex min-h-40 flex-col items-start justify-center gap-2 rounded-lg bg-canvas px-4 py-6">
              <p className="text-body-medium text-ink">
                {filter === "all"
                  ? `No events on ${dateLabel}`
                  : `No ${filterLabel.toLowerCase()} events on ${dateLabel}`}
              </p>
              <p className="text-body-regular text-ink-2">
                {filter === "all"
                  ? "Events from this day show up here."
                  : `Nothing was ${filterLabel.toLowerCase()} on this day.`}
              </p>
              {filter !== "all" ? (
                <Button variant="secondary" size="small" className="mt-1" onClick={() => selectFilter("all")}>
                  Show all events
                </Button>
              ) : null}
            </div>
          ) : (
            <FilterTable
              rows={events}
              showFilters={false}
              chrome="plain"
              filter={filter}
              selectedId={selected?.id}
              onSelect={selectEvent}
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Record</p>
          <Swap
            swapKey={selected?.id ?? "empty"}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">{selected.action}</h3>
                  <Chip variant="caption" color={OUTCOME_CHIP[selected.outcome]} className="mt-0.5">
                    {OUTCOME_LABEL[selected.outcome]}
                  </Chip>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  {selected.actor}
                  <span className="text-ink-3"> · </span>
                  <span className="tabular-nums">{selected.time}</span>
                </p>
                <p className="text-caption-1-regular text-ink-3">This trail cannot be edited.</p>
                <div className="rounded-lg bg-canvas">
                  <TimelineFeed chrome="plain" showHeader={false} entries={selected.trail} />
                </div>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">Select an event to read its record.</p>
                <p className="text-body-regular text-ink-2">The trail stays as it was written.</p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {selected ? (
              <>
                <span className="text-body-medium text-ink">{exported ? "Exported" : OUTCOME_LABEL[selected.outcome]}</span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{selected.action}</span>
                {exported ? null : (
                  <>
                    <span className="text-ink-3"> · </span>
                    <span className="text-ink-2">{selected.actor}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-ink-2">No event open</span>
            )}
          </Swap>
        </div>
        <Button
          variant="primary"
          size="small"
          leadingIcon={Download}
          onClick={exportRecord}
          disabled={!selected}
          className="shrink-0"
        >
          Export record
        </Button>
      </footer>
    </section>
  );
}
