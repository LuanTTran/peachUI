"use client";


import { useState } from "react";
import { motion, motionInstantIfReduced, useReducedMotion } from "@/components/lib/motion";
import { fadeUpStagger } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

export type PipelineStage = {
  id: string;
  label: string;
  count: number;
};

const DEFAULT_STAGES: PipelineStage[] = [
  { id: "lead", label: "Lead", count: 3 },
  { id: "qualified", label: "Qualified", count: 3 },
  { id: "proposal", label: "Proposal", count: 2 },
  { id: "won", label: "Won", count: 2 },
];

export type PipelineStripProps = {
  stages?: PipelineStage[];
  activeId?: string;
  defaultActiveId?: string;
  onActiveChange?: (id: string) => void;
  className?: string;
};

const DIGIT_EASE = [0.34, 1.45, 0.64, 1] as const;

function StageCount({ value }: { value: number }) {
  const reduced = useReducedMotion() ?? false;
  const chars = String(value).split("");

  return (
    <span className="mt-1 inline-flex text-title-2-medium tabular-nums text-ink" aria-hidden>
      {chars.map((char, index) => {
        const stagger = index === chars.length - 1 ? 2 : index === chars.length - 2 ? 1 : 0;
        return (
          <motion.span
            key={`${value}-${index}`}
            className="inline-block"
            initial={reduced ? false : { y: 8, opacity: 0, filter: "blur(2px)" }}
            animate={{ y: 0, opacity: 1, filter: "blur(0px)" }}
            transition={motionInstantIfReduced(reduced, {
              duration: 0.5,
              delay: stagger * 0.07,
              ease: DIGIT_EASE,
            })}
          >
            {char}
          </motion.span>
        );
      })}
    </span>
  );
}

export function PipelineStrip({
  stages = DEFAULT_STAGES,
  activeId,
  defaultActiveId,
  onActiveChange,
  className,
}: PipelineStripProps) {
  const [uncontrolled, setUncontrolled] = useState(defaultActiveId ?? stages[0]?.id ?? "");
  const active = activeId ?? uncontrolled;

  const select = (id: string) => {
    if (activeId === undefined) setUncontrolled(id);
    onActiveChange?.(id);
  };

  const move = (from: number, direction: 1 | -1) => {
    const next = stages[(from + direction + stages.length) % stages.length];
    if (!next) return;
    select(next.id);
    document.getElementById(`pipeline-stage-${next.id}`)?.focus();
  };

  return (
    <div
      className={cx("flex gap-1 overflow-x-auto pb-1", className)}
      role="tablist"
      aria-label="Pipeline stages"
    >
      {stages.map((stage, index) => {
        const selected = stage.id === active;
        const dealLabel = stage.count === 1 ? "1 deal" : `${stage.count} deals`;
        return (
          <button
            key={stage.id}
            id={`pipeline-stage-${stage.id}`}
            type="button"
            role="tab"
            aria-selected={selected}
            tabIndex={selected ? 0 : -1}
            onClick={() => select(stage.id)}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight") {
                event.preventDefault();
                move(index, 1);
              } else if (event.key === "ArrowLeft") {
                event.preventDefault();
                move(index, -1);
              }
            }}
            style={fadeUpStagger(index)}
            className={cx(
              "flex min-w-[88px] flex-1 flex-col rounded-panel border px-2.5 py-2 text-left",
              "transition-[background-color,border-color,box-shadow] duration-[250ms]",
              selected
                ? "border-accent bg-accent-muted shadow-hairline"
                : "border-line bg-surface hover:bg-hover",
            )}
          >
            <span className="text-overline">{stage.label}</span>
            <StageCount value={stage.count} />
            <span className="sr-only">{dealLabel}</span>
          </button>
        );
      })}
    </div>
  );
}
