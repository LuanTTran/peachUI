"use client";


import { Button } from "@/components/atoms/button";
import { cx } from "@/lib/utils";

export type BulkActionBarLabels = {
  deny: string;
  export: string;
  approve: string;
};

const DEFAULT_LABELS: BulkActionBarLabels = {
  deny: "Deny",
  export: "Export",
  approve: "Approve",
};

export type BulkActionBarProps = {
  selectedCount?: number;
  labels?: Partial<BulkActionBarLabels>;
  onApprove?: () => void;
  onDeny?: () => void;
  onExport?: () => void;
  className?: string;
  variant?: string;
};

export function BulkActionBar({
  selectedCount = 0,
  labels: labelsProp,
  onApprove,
  onDeny,
  onExport,
  className,
}: BulkActionBarProps = {}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };

  if (selectedCount <= 0) {
    return null;
  }

  return (
    <div
      className={cx(
        "flex flex-wrap items-center justify-between gap-2 rounded-full border border-line bg-surface px-3 py-1.5 shadow-card",
        className,
      )}
      role="toolbar"
      aria-label="Bulk actions"
    >
      <span className="text-caption font-medium text-ink">
        <span className="font-mono tabular-nums">{selectedCount}</span> selected
      </span>
      <div className="flex flex-wrap gap-1">
        <Button type="button" variant="secondary" size="small" onClick={onDeny}>
          {labels.deny}
        </Button>
        <Button type="button" variant="secondary" size="small" onClick={onExport}>
          {labels.export}
        </Button>
        <Button type="button" variant="primary" size="small" onClick={onApprove}>
          {labels.approve}
        </Button>
      </div>
    </div>
  );
}
