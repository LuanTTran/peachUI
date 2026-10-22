"use client";

/**
 * PeachUI — BreakdownCard (block)
 * @tier block
 * @deps agent-inline-chips, chip, pill-tab
 * @requires app/globals.css
 *
 * Segmented breakdown with context grid or compact share bar;
 * hover previews, click pins, aggregate hero by default.
 */

import { useMemo, useState } from "react";
import { ChevronDown } from "reicon-react";
import { Chip } from "@/components/atoms/chip";
import { PillTab, PillTabList } from "@/components/atoms/pill-tab";
import { ToolChip } from "@/components/primitives/agent-inline-chips";
import {
  barSegmentOpacity,
  breakdownBarSegmentMotion,
  breakdownGridTileMotion,
  breakdownRowMotion,
  gridTileFilter,
  gridTileOpacity,
} from "@/components/lib/breakdown-card-motion";
import { cx } from "@/lib/utils";

export type BreakdownContextSegmentId = "system" | "tools" | "files" | "conversation" | "memory";

export type BreakdownSegment = {
  id: string;
  label: string;
  value: number;
  /** Share of the breakdown total (0–1), drives bar segment width. */
  share: number;
};

export type BreakdownCardVariant = "context" | "compact";

export type BreakdownCardLayout = "standalone" | "embedded";

export type BreakdownTimeRange = "7d" | "30d" | "90d";

export type BreakdownTrend = {
  label: string;
  positive?: boolean;
};

export type BreakdownCardLabels = {
  title: string;
  ofTokens: (capLabel: string) => string;
  totalRevenue: string;
  segmentShare: (label: string, percent: number) => string;
  segmentOfWindow: (label: string, percent: number) => string;
  largest: (label: string) => string;
  left: (formatted: string) => string;
  newChat: string;
  compact: string;
  warning: string;
  filesDetail: string;
  timeRangeLabel: string;
};

export const defaultBreakdownCardLabels: BreakdownCardLabels = {
  title: "Context window",
  ofTokens: (cap) => `of ${cap} tokens`,
  totalRevenue: "Total revenue",
  segmentShare: (label, percent) => `${label} · ${percent}%`,
  segmentOfWindow: (label, percent) => `${label} · ${percent}% of the window`,
  largest: (label) => `Largest: ${label}`,
  left: (formatted) => `${formatted} left`,
  newChat: "New chat",
  compact: "Compact",
  warning: "Context is almost full. Compact or start a new chat.",
  filesDetail: "Launch deck, pricing sheet, and three thread exports.",
  timeRangeLabel: "Date range",
};

const CONTEXT_SEGMENT_TILE: Record<BreakdownContextSegmentId, string> = {
  system: "bg-ink",
  tools: "bg-ink-2",
  files: "bg-hover-2",
  conversation: "bg-accent",
  memory: "bg-schedule",
};

const COMPACT_SEGMENT_TILE = [
  "bg-accent",
  "bg-accent/80",
  "bg-schedule",
  "bg-hover-2",
  "bg-hover",
] as const;

const CONTEXT_ORDER: BreakdownContextSegmentId[] = [
  "system",
  "tools",
  "files",
  "conversation",
  "memory",
];

const GRID_CELLS = 128;
const TIME_RANGES: BreakdownTimeRange[] = ["7d", "30d", "90d"];

export function formatBreakdownTokens(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
  return String(Math.round(value));
}

export function formatBreakdownCurrency(value: number) {
  return `$${Math.round(value).toLocaleString("en-US")}`;
}

function sharePercent(share: number) {
  return Math.round(share * 100);
}

function segmentTileClass(variant: BreakdownCardVariant, id: string, index: number) {
  if (variant === "context" && id in CONTEXT_SEGMENT_TILE) {
    return CONTEXT_SEGMENT_TILE[id as BreakdownContextSegmentId];
  }
  return COMPACT_SEGMENT_TILE[index % COMPACT_SEGMENT_TILE.length];
}

function buildContextTiles(ratio: number, segments: BreakdownSegment[]) {
  const filled = Math.min(GRID_CELLS, Math.round(ratio * GRID_CELLS));
  const counts = CONTEXT_ORDER.map((id) => {
    const seg = segments.find((s) => s.id === id);
    if (!seg || filled === 0) return 0;
    return Math.max(0, Math.round(seg.share * filled));
  });
  let sum = counts.reduce((a, b) => a + b, 0);
  while (sum > filled) {
    const i = counts.findIndex((c) => c > 0);
    if (i < 0) break;
    counts[i] -= 1;
    sum -= 1;
  }
  while (sum < filled) {
    const i = CONTEXT_ORDER.indexOf("conversation");
    counts[i] += 1;
    sum += 1;
  }
  const list: (BreakdownContextSegmentId | undefined)[] = [];
  CONTEXT_ORDER.forEach((id, i) => {
    for (let n = 0; n < counts[i]; n++) list.push(id);
  });
  return { tiles: list, filledCount: filled };
}

export type BreakdownCardProps = {
  className?: string;
  variant: BreakdownCardVariant;
  layout?: BreakdownCardLayout;
  segments: BreakdownSegment[];
  interactive?: boolean;
  labels?: Partial<BreakdownCardLabels>;
  /** Context: tokens used toward cap. Compact: optional override for hero total. */
  totalValue?: number;
  /** Context only — window cap in tokens. */
  capValue?: number;
  model?: string;
  warningThreshold?: number;
  trend?: BreakdownTrend;
  timeRange?: BreakdownTimeRange;
  defaultTimeRange?: BreakdownTimeRange;
  onTimeRangeChange?: (range: BreakdownTimeRange) => void;
  formatValue?: (value: number) => string;
  onNewChat?: () => void;
  onCompact?: () => void;
};

export function BreakdownCard({
  className,
  variant,
  layout = "standalone",
  segments,
  interactive = true,
  labels: labelsProp,
  totalValue,
  capValue = 200_000,
  model = "claude-sonnet-5-5",
  warningThreshold = 0.85,
  trend,
  timeRange: timeRangeProp,
  defaultTimeRange = "7d",
  onTimeRangeChange,
  formatValue,
  onNewChat,
  onCompact,
}: BreakdownCardProps) {
  const labels = { ...defaultBreakdownCardLabels, ...labelsProp };
  const [filesOpen, setFilesOpen] = useState(false);
  const [pinnedId, setPinnedId] = useState<string | null>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const [timeRangeInternal, setTimeRangeInternal] = useState<BreakdownTimeRange>(defaultTimeRange);

  const timeRange = timeRangeProp ?? timeRangeInternal;
  const setTimeRange = (range: BreakdownTimeRange) => {
    onTimeRangeChange?.(range);
    if (timeRangeProp === undefined) setTimeRangeInternal(range);
  };

  const format =
    formatValue ??
    (variant === "compact" ? formatBreakdownCurrency : formatBreakdownTokens);

  const segmentSum = segments.reduce((sum, seg) => sum + seg.value, 0);
  const usedTotal = totalValue ?? segmentSum;
  const capRatio = variant === "context" && capValue > 0 ? usedTotal / capValue : 0;
  const capPercent = Math.round(capRatio * 100);
  const left = Math.max(0, capValue - usedTotal);
  const warn = variant === "context" && capRatio >= warningThreshold;

  /** Hover previews; pin holds when the pointer leaves. Hover always wins while over a row. */
  const emphasisId = interactive ? (hoverId ?? pinnedId) : null;
  const activeSegment = emphasisId ? segments.find((s) => s.id === emphasisId) : undefined;

  const largestSegment = segments.reduce(
    (best, seg) => (seg.share > best.share ? seg : best),
    segments[0],
  );

  const { tiles, filledCount } = useMemo(
    () => buildContextTiles(capRatio, segments),
    [capRatio, segments],
  );

  const embedded = layout === "embedded";

  const displayTitle =
    variant === "compact" && labels.title === defaultBreakdownCardLabels.title
      ? "Revenue by channel"
      : labels.title;

  const handlePin = (id: string) => {
    if (!interactive) return;
    setPinnedId((current) => (current === id ? null : id));
  };

  return (
    <article
      className={cx(
        embedded ? "bg-transparent" : "w-full max-w-[420px] rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className={cx(embedded ? "pb-3" : "border-b border-line-soft px-4 py-3")}>
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-body-strong text-balance text-ink">{displayTitle}</h3>
          {variant === "context" ? (
            <ToolChip className="text-[11px]">{model}</ToolChip>
          ) : (
            <PillTabList
              aria-label={labels.timeRangeLabel}
              className="h-7 shrink-0 gap-0.5 rounded-full bg-line/60 p-0.5"
            >
              {TIME_RANGES.map((range) => (
                <PillTab
                  key={range}
                  variant="segment"
                  isSelected={timeRange === range}
                  onSelect={() => setTimeRange(range)}
                  className="min-w-9 px-2 text-caption"
                >
                  {range}
                </PillTab>
              ))}
            </PillTabList>
          )}
        </div>

        <div className="mt-3 flex items-baseline justify-between gap-2">
          {variant === "context" ? (
            <>
              <p className="min-w-0">
                {activeSegment ? (
                  <>
                    <span className="text-metric tabular-nums">{format(activeSegment.value)}</span>
                    <span className="ms-1.5 text-body text-ink-3">{activeSegment.label}</span>
                  </>
                ) : (
                  <>
                    <span className="text-metric tabular-nums">{format(usedTotal)}</span>
                    <span className="ms-1.5 text-body text-ink-3">
                      {labels.ofTokens(formatBreakdownTokens(capValue))}
                    </span>
                  </>
                )}
              </p>
              <span
                className={cx(
                  "text-body-strong tabular-nums",
                  warn ? "text-warning" : "text-ink-2",
                )}
              >
                {capPercent}%
              </span>
            </>
          ) : (
            <>
              <div className="min-w-0">
                <p className="flex flex-wrap items-baseline gap-2">
                  <span className="text-metric tabular-nums">
                    {format(activeSegment?.value ?? usedTotal)}
                  </span>
                  {!activeSegment && trend ? (
                    <Chip variant="bold" color={trend.positive ? "lime" : "rose"}>
                      {trend.label}
                    </Chip>
                  ) : null}
                </p>
                <p className="mt-0.5 flex items-center gap-1.5 text-body text-ink-3">
                  {activeSegment ? (
                    <>
                      <span
                        className={cx(
                          "size-2 shrink-0 rounded-[2px]",
                          segmentTileClass(
                            variant,
                            activeSegment.id,
                            segments.findIndex((s) => s.id === activeSegment.id),
                          ),
                        )}
                        aria-hidden
                      />
                      <span>
                        {labels.segmentShare(activeSegment.label, sharePercent(activeSegment.share))}
                      </span>
                    </>
                  ) : (
                    labels.totalRevenue
                  )}
                </p>
              </div>
              {activeSegment ? (
                <span className="text-body-strong tabular-nums text-ink-2">
                  {sharePercent(activeSegment.share)}%
                </span>
              ) : null}
            </>
          )}
        </div>
      </div>

      <div className={cx(embedded ? "py-3" : "px-4 py-3")}>
        {variant === "context" ? (
          <div
            className="grid grid-cols-[repeat(32,minmax(0,1fr))] gap-0.5"
            role="img"
            aria-label={`Context usage ${capPercent} percent`}
          >
            {Array.from({ length: GRID_CELLS }, (_, index) => {
              const id = tiles[index];
              const filled = index < filledCount && id;
              return (
                <span
                  key={index}
                  className={cx(
                    "aspect-square rounded-[2px]",
                    breakdownGridTileMotion,
                    filled ? CONTEXT_SEGMENT_TILE[id] : "bg-hover/80",
                    gridTileOpacity(filled ? id : undefined, emphasisId),
                    gridTileFilter(filled ? id : undefined, emphasisId),
                  )}
                />
              );
            })}
          </div>
        ) : (
          <div
            className="flex h-2.5 w-full gap-0.5"
            role="img"
            aria-label="Revenue share by channel"
          >
            {segments.map((seg, index) => (
              <div
                key={seg.id}
                style={{ flexGrow: Math.max(seg.share, 0.001), flexBasis: 0 }}
                className={cx(
                  "min-w-0 rounded-full",
                  breakdownBarSegmentMotion,
                  segmentTileClass(variant, seg.id, index),
                  barSegmentOpacity(seg.id === emphasisId, Boolean(emphasisId)),
                )}
              />
            ))}
          </div>
        )}

        <ul
          className="mt-4 flex flex-col gap-1"
          onMouseLeave={interactive ? () => setHoverId(null) : undefined}
          onBlurCapture={
            interactive
              ? (event) => {
                  const next = event.relatedTarget;
                  if (next instanceof Node && event.currentTarget.contains(next)) return;
                  setHoverId(null);
                }
              : undefined
          }
        >
          {segments.map((seg, index) => {
            const isActive = emphasisId === seg.id;
            const isPinned = pinnedId === seg.id;
            const expandable = variant === "context" && seg.id === "files";
            const swatch = segmentTileClass(variant, seg.id, index);

            const labelRow = (
              <>
                <span className={cx("size-2.5 shrink-0 rounded-[2px]", swatch)} aria-hidden />
                <span
                  className={cx(
                    "min-w-0 flex-1 text-body",
                    isActive ? "font-medium text-ink" : "text-ink",
                  )}
                >
                  {seg.label}
                </span>
              </>
            );

            return (
              <li key={seg.id}>
                <div
                  className={cx(
                    "flex items-center gap-2 rounded-control px-1 py-1 -mx-1",
                    breakdownRowMotion,
                    interactive && isActive && "bg-hover",
                    interactive && isPinned && !isActive && "bg-hover/40",
                  )}
                  onMouseEnter={interactive ? () => setHoverId(seg.id) : undefined}
                >
                  {interactive ? (
                    <button
                      type="button"
                      className="flex min-w-0 flex-1 cursor-pointer items-center gap-2 rounded-control text-left"
                      onFocus={() => setHoverId(seg.id)}
                      onClick={() => handlePin(seg.id)}
                      aria-pressed={isPinned}
                    >
                      {labelRow}
                    </button>
                  ) : (
                    <div className="flex min-w-0 flex-1 items-center gap-2">{labelRow}</div>
                  )}
                  {variant === "context" && seg.id === "conversation" && onCompact ? (
                    <button
                      type="button"
                      onClick={onCompact}
                      className="shrink-0 text-caption font-medium text-ink-3 transition-colors duration-150 hover:text-ink"
                    >
                      {labels.compact}
                    </button>
                  ) : null}
                  <span
                    className={cx(
                      "shrink-0 tabular-nums text-body",
                      isActive ? "font-medium text-ink" : "text-ink-2",
                    )}
                  >
                    {format(seg.value)}
                  </span>
                  {variant === "compact" ? (
                    <span className="w-9 shrink-0 text-end tabular-nums text-body text-ink-3">
                      {sharePercent(seg.share)}%
                    </span>
                  ) : null}
                  {expandable ? (
                    <button
                      type="button"
                      aria-expanded={filesOpen}
                      aria-label={filesOpen ? "Hide files breakdown" : "Show files breakdown"}
                      onClick={() => setFilesOpen((open) => !open)}
                      className="flex size-6 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink"
                    >
                      <ChevronDown
                        className={cx("size-4 transition-transform duration-200", filesOpen && "rotate-180")}
                        aria-hidden
                      />
                    </button>
                  ) : variant === "context" ? (
                    <span className="size-6 shrink-0" aria-hidden />
                  ) : null}
                </div>
                {expandable && filesOpen ? (
                  <p className="mt-1 ps-4.5 text-caption text-pretty text-ink-3">{labels.filesDetail}</p>
                ) : null}
              </li>
            );
          })}
        </ul>
      </div>

      {warn ? (
        <p
          className={cx(
            "text-caption text-pretty text-warning",
            embedded ? "pb-2" : "border-t border-line-soft px-4 py-2",
          )}
        >
          {labels.warning}
        </p>
      ) : null}

      <div
        className={cx(
          "flex items-center justify-between gap-3 rounded-b-[inherit] bg-canvas",
          embedded ? "pt-2" : "border-t border-line-soft px-4 py-2.5",
        )}
      >
        <span className="text-caption text-pretty text-ink-3">
          {variant === "context" && activeSegment
            ? labels.segmentOfWindow(
                activeSegment.label,
                Math.round((activeSegment.value / capValue) * 1000) / 10,
              )
            : variant === "context"
              ? labels.left(formatBreakdownTokens(left))
              : labels.largest(largestSegment?.label ?? "")}
        </span>
        {variant === "context" && onNewChat ? (
          <button
            type="button"
            onClick={onNewChat}
            className="shrink-0 text-caption font-medium text-ink transition-colors duration-150 hover:text-ink-2"
          >
            {labels.newChat} →
          </button>
        ) : null}
      </div>
    </article>
  );
}
