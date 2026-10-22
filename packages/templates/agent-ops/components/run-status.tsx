"use client";

/** Status glyph + chip shared by the runs list and run detail. */

import { AlertTriangle, Check, Eye, Hourglass, X } from "reicon-react";
import { Chip } from "@/components/atoms/chip";
import { Spinner } from "@/components/atoms/spinner";
import { RUN_STATUS_LABEL, type RunStatus } from "../data";
import { cx } from "@/lib/utils";

export function RunGlyph({ status, className }: { status: RunStatus; className?: string }) {
  const c = cx("size-3.5 shrink-0", className);
  if (status === "running") return <Spinner className={className} />;
  if (status === "done") return <Check className={cx(c, "text-green")} aria-hidden />;
  if (status === "failed") return <X className={cx(c, "text-red")} aria-hidden />;
  if (status === "review") return <Eye className={cx(c, "text-warning")} aria-hidden />;
  if (status === "blocked") return <AlertTriangle className={cx(c, "text-warning")} aria-hidden />;
  return <Hourglass className={cx(c, "text-ink-3")} aria-hidden />;
}

const STATUS_CHIP_COLOR: Record<RunStatus, "neutral" | "blue" | "yellow" | "orange" | "lime" | "rose"> = {
  queued: "neutral",
  running: "blue",
  review: "yellow",
  blocked: "orange",
  done: "lime",
  failed: "rose",
};

export function StatusPill({ status, className }: { status: RunStatus; className?: string }) {
  return (
    <Chip
      role="status"
      variant="caption"
      color={STATUS_CHIP_COLOR[status]}
      className={cx("gap-1.5 rounded-full", className)}
    >
      <RunGlyph status={status} />
      {RUN_STATUS_LABEL[status]}
    </Chip>
  );
}
