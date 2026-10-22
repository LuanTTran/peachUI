"use client";

/**
 * Overnight brief — what the agent did while the human was out.
 * Sits at the top of the thread list; expandable, dismissible.
 */

import { useState } from "react";
import { ChevronDown, Sparkle } from "reicon-react";
import { CloseButton } from "@/components/atoms/close-button";
import { IconButton } from "@/components/atoms/icon-button";
import { OVERNIGHT_BRIEF } from "../data";
import { cx } from "@/lib/utils";

export function OvernightBrief({
  needsYou,
  onDismiss,
}: {
  needsYou: number;
  onDismiss: () => void;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-panel border border-line-soft bg-canvas">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-violet-muted text-violet">
          <Sparkle className="size-3.5" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-caption-1-medium text-ink">{OVERNIGHT_BRIEF.headline}</p>
          <p className="text-caption-2-regular text-ink-3">
            {needsYou > 0 ? `${needsYou} need you` : "nothing needs you"}
          </p>
        </div>
        <IconButton
          icon={ChevronDown}
          size="small"
          aria-expanded={open}
          aria-label={open ? "Collapse overnight brief" : "Expand overnight brief"}
          onClick={() => setOpen((v) => !v)}
          className={cx(
            "size-7 border-0 bg-transparent shadow-none",
            "[&_svg]:transition-transform [&_svg]:duration-150",
            open && "[&_svg]:rotate-180",
          )}
        />
        <CloseButton
          size="sm"
          aria-label="Dismiss overnight brief"
          onClick={onDismiss}
        />
      </div>
      {open ? (
        <div className="flex flex-col border-t border-line-soft px-3 py-2">
          {OVERNIGHT_BRIEF.breakdown.map((row) => (
            <div key={row.id} className="flex items-baseline gap-2 py-1 text-caption-1-regular">
              <span className="w-6 shrink-0 tabular-nums text-caption-1-medium text-ink">
                {row.count}
              </span>
              <span className="min-w-0 truncate text-ink-3">{row.label}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
}
