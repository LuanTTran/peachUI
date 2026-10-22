"use client";

import { useState } from "react";
import { ChevronLeft16, ChevronRight16 } from "@/components/atoms/date-picker-shared";
import { cx } from "@/lib/utils";

const NAV_BUTTON = cx(
  "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[3px] text-ink-2 outline-none",
  "transition-colors duration-150 ease hover:bg-hover",
  "focus-visible:ring-2 focus-visible:ring-accent",
);

function AnimatedLabel({ label }: { label: string }) {
  const [current, setCurrent] = useState(label);
  const [previous, setPrevious] = useState<string | null>(null);

  if (label !== current) {
    setPrevious(current);
    setCurrent(label);
  }

  return (
    <span className="relative flex-1 overflow-hidden text-center text-body-medium whitespace-nowrap text-ink">
      <span className="invisible">{current}</span>
      {previous !== null && (
        <span
          key={`out-${previous}`}
          className="animate-label-out absolute inset-0 flex items-center justify-center"
          onAnimationEnd={() => setPrevious(null)}
        >
          {previous}
        </span>
      )}
      <span
        key={`in-${current}`}
        className={cx(
          "absolute inset-0 flex items-center justify-center",
          previous !== null && "animate-label-in",
        )}
      >
        {current}
      </span>
    </span>
  );
}

export function WeekRangePill({
  label,
  onPrev,
  onNext,
  className,
}: {
  label: string;
  onPrev?: () => void;
  onNext?: () => void;
  className?: string;
}) {
  const interactive = !!(onPrev || onNext);
  return (
    <div
      className={cx(
        "flex h-8 w-[151px] shrink-0 items-center justify-between gap-1 rounded-2lg border border-line bg-surface px-1 py-1 shadow-xs",
        className,
      )}
    >
      {interactive ? (
        <button type="button" aria-label="Previous" onClick={onPrev} className={NAV_BUTTON}>
          <ChevronLeft16 />
        </button>
      ) : (
        <span className="flex size-4 shrink-0 items-center justify-center text-ink-2" aria-hidden>
          <ChevronLeft16 />
        </span>
      )}
      {interactive ? (
        <AnimatedLabel label={label} />
      ) : (
        <span className="flex-1 text-center text-body-medium whitespace-nowrap text-ink">
          {label}
        </span>
      )}
      {interactive ? (
        <button type="button" aria-label="Next" onClick={onNext} className={NAV_BUTTON}>
          <ChevronRight16 />
        </button>
      ) : (
        <span className="flex size-4 shrink-0 items-center justify-center text-ink-2" aria-hidden>
          <ChevronRight16 />
        </span>
      )}
    </div>
  );
}
