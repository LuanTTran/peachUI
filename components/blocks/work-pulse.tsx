"use client";

/**
 * PeachUI — WorkPulse (block)
 * @tier block
 * @requires app/globals.css
 */

import type { RunPhase } from "@/components/types";
import { ShimmerText } from "@/components/primitives/agent-log";
import { cx } from "@/lib/utils";

export type WorkPulseVariant = "band" | "status" | "stripe" | "edge";

export type WorkPulseLabels = {
  idle: string;
  running: string;
  paused: string;
  done: string;
  failed: string;
};

export const defaultWorkPulseLabels: WorkPulseLabels = {
  idle: "Ready",
  running: "Working…",
  paused: "Paused",
  done: "Done",
  failed: "Something went wrong",
};

export type WorkPulseProps = {
  className?: string;
  phase: RunPhase;
  label?: string;
  subLabel?: string;
  elapsedMs?: number;
  variant?: WorkPulseVariant;
  labels?: Partial<WorkPulseLabels>;
};

function formatElapsed(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function WorkPulse({
  className,
  phase,
  label,
  subLabel,
  elapsedMs,
  variant = "band",
  labels: labelsProp,
}: WorkPulseProps) {
  const labels = { ...defaultWorkPulseLabels, ...labelsProp };
  const defaultLabel =
    phase === "running"
      ? labels.running
      : phase === "paused"
        ? labels.paused
        : phase === "done"
          ? labels.done
          : phase === "failed"
            ? labels.failed
            : labels.idle;

  const title = label ?? defaultLabel;
  const active = phase === "running" || phase === "paused";
  const titleEl =
    phase === "running" ? (
      <ShimmerText>{title}</ShimmerText>
    ) : (
      title
    );

  if (variant === "edge") {
    if (!active) return null;
    return (
      <div
        aria-hidden
        className={cx("work-pulse-band pointer-events-none absolute inset-x-0 top-0 h-0.5 bg-accent-muted", className)}
      />
    );
  }

  if (variant === "band") {
    return (
      <div
        className={cx(
          "relative overflow-hidden rounded-panel border border-line bg-surface shadow-hairline",
          className,
        )}
        role="status"
        aria-live="polite"
      >
        {active ? <div aria-hidden className="work-pulse-band absolute inset-x-0 top-0 h-0.5 bg-accent-muted" /> : null}
        <div className="flex items-center justify-between gap-3 px-3 py-2">
          <div className="min-w-0">
            <p className="truncate text-meta font-medium text-ink">{titleEl}</p>
            {subLabel ? <p className="truncate text-caption text-ink-3">{subLabel}</p> : null}
          </div>
          {elapsedMs !== undefined ? (
            <span className="shrink-0 text-caption tabular-nums text-ink-3">{formatElapsed(elapsedMs)}</span>
          ) : null}
        </div>
      </div>
    );
  }

  if (variant === "stripe") {
    return (
      <div
        className={cx("relative overflow-hidden rounded-control bg-inset px-3 py-2 shadow-hairline", className)}
        role="status"
        aria-live="polite"
      >
        {active ? <div aria-hidden className="work-pulse-stripe pointer-events-none absolute inset-0 opacity-40" /> : null}
        <p className="relative text-meta font-medium text-ink">{titleEl}</p>
      </div>
    );
  }

  return (
    <p className={cx("flex items-center gap-2 text-meta text-ink-2", className)} role="status" aria-live="polite">
      {active ? <span className="work-pulse-dot size-2 shrink-0 rounded-full bg-accent" aria-hidden /> : null}
      <span className="min-w-0 truncate font-medium text-ink">{titleEl}</span>
      {elapsedMs !== undefined ? (
        <span className="shrink-0 tabular-nums text-caption text-ink-3">{formatElapsed(elapsedMs)}</span>
      ) : null}
      {subLabel ? <span className="truncate text-caption text-ink-3">— {subLabel}</span> : null}
    </p>
  );
}
