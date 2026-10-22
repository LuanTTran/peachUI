"use client";

/**
 * PeachUI — StepLog (block)
 * @tier block
 * @requires app/globals.css
 *
 * Collapsible multi-step run with pending / active / done / failed.
 */

import { useState } from "react";
import type { StepStatus } from "@/components/types";
import { TickCircleFilled } from "@/components/atoms/icons";
import { ShimmerText } from "@/components/primitives/agent-log";
import { cx } from "@/lib/utils";

export type StepLogItem = {
  id: string;
  label: string;
  status: StepStatus;
};

export type StepLogLabels = {
  expand: string;
  collapse: string;
  stepsLeft: (count: number) => string;
};

export const defaultStepLogLabels: StepLogLabels = {
  expand: "Show steps",
  collapse: "Hide steps",
  stepsLeft: (count) => (count === 1 ? "1 step left" : `${count} steps left`),
};

export type StepLogVariant = "standalone" | "embedded";

export type StepLogProps = {
  className?: string;
  variant?: StepLogVariant;
  steps: StepLogItem[];
  defaultOpen?: boolean;
  labels?: Partial<StepLogLabels>;
  footer?: string;
};

function StepGlyph({ status }: { status: StepStatus }) {
  if (status === "done") {
    return <TickCircleFilled className="size-4 shrink-0 text-green" aria-hidden />;
  }
  if (status === "failed") {
    return (
      <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-red-muted text-[10px] font-semibold text-red" aria-hidden>
        !
      </span>
    );
  }
  if (status === "active") {
    return (
      <span
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none"
        aria-hidden
      />
    );
  }
  return <span className="size-4 shrink-0 rounded-full border border-line bg-surface" aria-hidden />;
}

export function StepLog({
  className,
  variant = "standalone",
  steps,
  defaultOpen = true,
  labels: labelsProp,
  footer,
}: StepLogProps) {
  const labels = { ...defaultStepLogLabels, ...labelsProp };
  const [open, setOpen] = useState(defaultOpen);
  const remaining = steps.filter((s) => s.status === "pending" || s.status === "active").length;
  const embedded = variant === "embedded";

  const stepList = (
    <ul className={cx(embedded ? "px-4 py-2" : "border-t border-line-soft px-4 py-2")}>
      {steps.map((step) => (
        <li
          key={step.id}
          className={cx(
            "flex items-start gap-2.5",
            embedded ? "py-1.5" : "py-2",
            step.status === "pending" && "text-ink-3",
            step.status === "active" && "text-ink",
            step.status === "done" && "text-ink-2",
          )}
        >
          <StepGlyph status={step.status} />
          <span
            className={cx(
              "min-w-0 text-meta",
              step.status === "active" && "font-medium",
              step.status === "done" && "text-ink-2",
            )}
          >
            {step.status === "active" ? (
              <ShimmerText>{step.label}</ShimmerText>
            ) : (
              step.label
            )}
          </span>
        </li>
      ))}
    </ul>
  );

  if (embedded) {
    return (
      <div className={cx("min-w-0", className)} aria-label="Run steps">
        {open ? stepList : null}
        {footer ? (
          <p className="border-t border-line-soft px-4 py-2 text-caption tabular-nums text-ink-3">{footer}</p>
        ) : null}
      </div>
    );
  }

  return (
    <section
      className={cx("overflow-hidden rounded-card border border-line bg-surface shadow-card", className)}
      aria-label="Run steps"
    >
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between gap-3 px-4 py-3 text-left outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-body-strong text-balance text-ink tabular-nums">
          {remaining > 0 ? labels.stepsLeft(remaining) : "All steps complete"}
        </span>
        <span className="text-caption text-ink-3">{open ? labels.collapse : labels.expand}</span>
      </button>
      {open ? stepList : null}
      {footer ? (
        <p className="border-t border-line-soft px-4 py-2 text-caption text-ink-3">{footer}</p>
      ) : null}
    </section>
  );
}
