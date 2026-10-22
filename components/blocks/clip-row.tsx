"use client";

/**
 * PeachUI — ClipRow (block)
 * @tier block
 * @requires app/globals.css
 *
 * Attachment tiles above the composer — type mark, name, progress ring, remove.
 */

import type { ReactNode } from "react";
import { Chip } from "@/components/atoms/chip";
import { CloseButton } from "@/components/atoms/close-button";
import { cx } from "@/lib/utils";

export type ClipRowItem = {
  id: string;
  name: string;
  meta?: string;
  /** 0–1 upload progress; omit when complete */
  progress?: number;
  error?: string | null;
  typeLabel?: string;
};

export type ClipRowLabels = {
  overflow: string;
  retry: string;
  remove: string;
};

export const defaultClipRowLabels: ClipRowLabels = {
  overflow: "more files",
  retry: "Retry upload",
  remove: "Remove",
};

export type ClipRowProps = {
  className?: string;
  items: ClipRowItem[];
  maxVisible?: number;
  onRemove?: (id: string) => void;
  onRetry?: (id: string) => void;
  labels?: Partial<ClipRowLabels>;
};

function TypeMark({ label }: { label: string }) {
  return (
    <span className="text-[10px] font-semibold uppercase tracking-wide text-ink-3">{label}</span>
  );
}

function ClipProgressRing({
  progress,
  size,
  failed,
  children,
}: {
  progress: number;
  size: number;
  failed?: boolean;
  children: ReactNode;
}) {
  const stroke = failed ? "var(--red)" : "var(--accent)";
  const track = "var(--line-soft)";
  const r = (size - 4) / 2;
  const c = 2 * Math.PI * r;
  const offset = c * (1 - Math.min(1, Math.max(0, progress)));

  return (
    <span className="relative inline-flex shrink-0 items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="-rotate-90" aria-hidden>
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={2} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={stroke}
          strokeWidth={2}
          strokeDasharray={c}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center">{children}</span>
    </span>
  );
}

export function ClipRow({
  className,
  items,
  maxVisible = 6,
  onRemove,
  onRetry,
  labels: labelsProp,
}: ClipRowProps) {
  const labels = { ...defaultClipRowLabels, ...labelsProp };
  const visible = items.slice(0, maxVisible);
  const overflow = items.length - visible.length;

  if (items.length === 0) return null;

  return (
    <div className={cx("flex min-w-0 flex-wrap items-center gap-2", className)} role="list">
      {visible.map((item) => {
        const uploading = item.progress !== undefined && item.progress < 1;
        const failed = Boolean(item.error);
        const complete = item.progress === undefined || item.progress >= 1;

        return (
          <div
            key={item.id}
            role="listitem"
            className="flex max-w-full items-center gap-1.5"
            style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
          >
            <div
              className={cx(
                "inline-flex max-w-[min(100%,280px)] items-center gap-2 rounded-control bg-inset px-2 py-1.5 shadow-hairline",
                failed && "ring-1 ring-red/40",
              )}
            >
              <ClipProgressRing progress={complete ? 1 : item.progress ?? 0} size={uploading ? 32 : 28} failed={failed}>
                <TypeMark label={item.typeLabel ?? "FILE"} />
              </ClipProgressRing>
              <div className="min-w-0 flex-1">
                <p className="truncate text-meta font-medium text-ink">{item.name}</p>
                {item.meta || item.error ? (
                  <p className={cx("truncate text-caption", failed ? "text-red" : "text-ink-3")}>
                    {failed ? item.error : item.meta}
                  </p>
                ) : null}
              </div>
              {onRemove ? (
                <CloseButton
                  size="2xs"
                  aria-label={`${labels.remove} ${item.name}`}
                  onClick={() => onRemove(item.id)}
                />
              ) : null}
            </div>
            {failed && onRetry ? (
              <button
                type="button"
                className="inline-flex min-h-8 items-center rounded-control px-2 text-caption font-medium text-accent transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-accent-ink active:scale-[0.96]"
                onClick={() => onRetry(item.id)}
              >
                {labels.retry}
              </button>
            ) : null}
          </div>
        );
      })}
      {overflow > 0 ? (
        <Chip color="neutral" variant="caption" className="shrink-0">
          +{overflow} {labels.overflow}
        </Chip>
      ) : null}
    </div>
  );
}
