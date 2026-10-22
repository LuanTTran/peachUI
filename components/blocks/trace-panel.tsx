"use client";

/**
 * PeachUI — TracePanel (block)
 * @tier block
 * @deps agent-log, input
 * @requires app/globals.css
 *
 * Timer, search, source count, steps appearing one-by-one.
 */

import { Input } from "@/components/atoms/input";
import {
  LogRow,
  ShimmerText,
  useLogMotion,
  useRevealTicker,
} from "@/components/primitives/agent-log";
import { cx } from "@/lib/utils";

export type TraceStep = {
  id: string;
  label: string;
};

export type TracePanelLabels = {
  search: string;
  sources: (count: number) => string;
  elapsed: string;
};

export const defaultTracePanelLabels: TracePanelLabels = {
  search: "Search trace",
  sources: (count) => `${count} sources`,
  elapsed: "Elapsed",
};

export type TracePanelVariant = "standalone" | "embedded";

export type TracePanelProps = {
  className?: string;
  variant?: TracePanelVariant;
  /** Standalone panel only; hidden when `variant` is `embedded`. */
  showSearch?: boolean;
  steps: TraceStep[];
  /** How many steps are visible; omit to auto-reveal when `running`. */
  revealed?: number;
  running?: boolean;
  sourceCount?: number;
  elapsedMs?: number;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  workingLabel?: string;
  labels?: Partial<TracePanelLabels>;
};

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function TracePanel({
  className,
  variant = "standalone",
  showSearch,
  steps,
  revealed: revealedProp,
  running = false,
  sourceCount = 0,
  elapsedMs,
  searchValue = "",
  onSearchChange,
  workingLabel = "Thinking…",
  labels: labelsProp,
}: TracePanelProps) {
  const labels = { ...defaultTracePanelLabels, ...labelsProp };
  const reduce = useLogMotion();
  const autoRevealed = useRevealTicker({
    total: steps.length,
    run: running && revealedProp === undefined,
    stepInterval: 720,
    startDelay: 400,
  });
  const revealed = revealedProp ?? autoRevealed;
  const visible = steps.slice(0, revealed);
  const showWorking = running && revealed < steps.length;
  const searchOn = showSearch ?? variant === "standalone";
  const embedded = variant === "embedded";

  const traceList = (
    <ol className={cx("list-none", embedded ? "" : "mt-2")}>
      {visible.map((step, index) => (
        <LogRow
          key={step.id}
          first={index === 0}
          last={!showWorking && index === visible.length - 1}
          reduce={reduce}
        >
          <p className={cx("py-0.5", embedded ? "text-caption text-ink-2" : "py-1 text-meta text-ink")}>
            {step.label}
          </p>
        </LogRow>
      ))}
      {showWorking ? (
        <li className="relative overflow-hidden ps-4">
          <p className={cx(embedded ? "py-0.5 text-caption" : "py-1 text-meta")}>
            <ShimmerText>{workingLabel}</ShimmerText>
          </p>
        </li>
      ) : null}
    </ol>
  );

  if (embedded) {
    if (visible.length === 0 && !showWorking) return null;
    return (
      <div className={cx("border-b border-line-soft px-4 py-2", className)} aria-label="Run trace">
        {traceList}
      </div>
    );
  }

  return (
    <section
      className={cx("rounded-card border border-line bg-surface p-3 shadow-hairline", className)}
      aria-label="Run trace"
    >
      {searchOn ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-line-soft pb-3">
          <div className="min-w-[12rem] flex-1">
            <Input
              aria-label={labels.search}
              placeholder={labels.search}
              value={searchValue}
              onChange={onSearchChange}
              size="small"
            />
          </div>
          <span className="shrink-0 rounded-md bg-inset px-2 py-1 text-caption font-medium text-ink-2">
            {labels.sources(sourceCount)}
          </span>
          {elapsedMs !== undefined ? (
            <span className="shrink-0 text-caption tabular-nums text-ink-3">
              {labels.elapsed} {formatElapsed(elapsedMs)}
            </span>
          ) : null}
        </div>
      ) : null}

      {traceList}
    </section>
  );
}
