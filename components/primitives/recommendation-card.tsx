"use client";


import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { AnimatePresence, motion, motionInstantIfReduced, useReducedMotion } from "@/components/lib/motion";
import { cx } from "@/lib/utils";

export type RecommendationTone = "green" | "orange" | "muted";

export type RecommendationOption = {
  key: string;
  body: string;
  short: string;
  signal: 0 | 1 | 2 | 3;
  tone: RecommendationTone;
  label: string;
  cta: string;
  done: string;
};

export type RecommendationLabels = {
  title: string;
  showAlternatives: string;
  hideAlternatives: string;
  otherOptions: string;
};

const DEFAULT_LABELS: RecommendationLabels = {
  title: "Call Northwind about the renewal?",
  showAlternatives: "Show options",
  hideAlternatives: "Hide options",
  otherOptions: "Other options",
};

const DEFAULT_OPTIONS: RecommendationOption[] = [
  {
    key: "call",
    body: "Call Jordan Lee at Northwind. The renewal has been quiet for 11 days.",
    short: "Call Jordan Lee",
    signal: 3,
    tone: "green",
    label: "High confidence",
    cta: "Start the call",
    done: "Call started",
  },
  {
    key: "note",
    body: "Send Jordan a short note and ask whether Friday still works.",
    short: "Send a note",
    signal: 2,
    tone: "orange",
    label: "Needs review",
    cta: "Send the note",
    done: "Note queued",
  },
  {
    key: "later",
    body: "Leave Northwind until after standup and pick it up this afternoon.",
    short: "Leave it for later",
    signal: 0,
    tone: "muted",
    label: "No signal",
    cta: "Leave for later",
    done: "Left for later",
  },
];

const TONE_CLASS: Record<RecommendationTone, string> = {
  green: "bg-green",
  orange: "bg-orange",
  muted: "bg-ink-3",
};

const SWAP = { duration: 0.15, ease: "easeInOut" as const };

function Meter({ signal, tone }: { signal: number; tone: RecommendationTone }) {
  return (
    <span className="flex items-end gap-0.5" aria-hidden>
      {[0, 1, 2].map((bar) => (
        <span
          key={bar}
          className={cx(
            "w-1 rounded-full transition-colors duration-150",
            bar < signal ? TONE_CLASS[tone] : "bg-line-strong",
          )}
          style={{ height: 10 }}
        />
      ))}
    </span>
  );
}

export type RecommendationCardProps = {
  options?: RecommendationOption[];
  labels?: Partial<RecommendationLabels>;
  className?: string;
};

export function RecommendationCard({
  options = DEFAULT_OPTIONS,
  labels,
  className,
}: RecommendationCardProps) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const reduced = useReducedMotion() ?? false;
  const [selected, setSelected] = useState(0);
  const [open, setOpen] = useState(false);
  const [accepted, setAccepted] = useState(false);

  const active = options[Math.min(selected, options.length - 1)] ?? options[0];
  if (!active) return null;
  const others = options.map((option, index) => ({ option, index })).filter(({ index }) => index !== selected);

  return (
    <div className={cx("w-full overflow-hidden rounded-card bg-surface shadow-card", className)}>
      <div className="primitive-card-pad">
        <p className="text-body-strong text-ink">{copy.title}</p>
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={active.key}
            className="mt-1.5 min-h-12 text-body text-pretty text-ink-2"
            initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
            animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
            exit={reduced ? undefined : { opacity: 0, y: -4, filter: "blur(2px)" }}
            transition={motionInstantIfReduced(reduced, SWAP)}
          >
            {active.body}
          </motion.p>
        </AnimatePresence>
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-[250ms]"
        style={{
          gridTemplateRows: open ? "1fr" : "0fr",
          opacity: open ? 1 : 0,
          transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)",
        }}
      >
        <div className="overflow-hidden">
          <div className="border-t border-line bg-surface px-2 py-2">
            <p className="px-1.5 pb-1 text-meta font-medium text-ink-3">{copy.otherOptions}</p>
            {others.map(({ option, index }) => (
              <button
                key={option.key}
                type="button"
                onClick={() => {
                  setSelected(index);
                  setAccepted(false);
                }}
                className="flex min-h-9 w-full items-center gap-2.5 rounded-control px-1.5 py-1.5 text-left transition-colors duration-150 hover:bg-hover"
              >
                <Meter signal={option.signal} tone={option.tone} />
                <span className="min-w-0 flex-1 truncate text-meta text-ink">{option.short}</span>
                <span className="shrink-0 text-caption">{option.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="primitive-card-footer flex flex-wrap items-center justify-between gap-2 border-t border-line bg-surface">
        <span className="flex min-w-0 items-center gap-2">
          <Meter signal={active.signal} tone={active.tone} />
          <span className="truncate text-meta font-medium text-ink-2">{active.label}</span>
        </span>
        <span className="flex shrink-0 items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="small"
            className="group"
            aria-expanded={open}
            trailingIcon={Chevron}
            onClick={() => setOpen((current) => !current)}
          >
            {open ? copy.hideAlternatives : copy.showAlternatives}
          </Button>
          <Button
            type="button"
            variant={accepted ? "secondary" : "primary"}
            size="small"
            aria-pressed={accepted}
            onClick={() => setAccepted(true)}
          >
            {accepted ? active.done : active.cta}
          </Button>
        </span>
      </div>
    </div>
  );
}

function Chevron({ className }: { className?: string }) {
  return (
    <svg
      className={cx(
        className,
        "origin-center transition-transform duration-[250ms] group-aria-expanded:-scale-y-100",
      )}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
      style={{ transitionTimingFunction: "cubic-bezier(0.22, 1, 0.36, 1)" }}
    >
      <path d="M4 6.5 8 10.5 12 6.5" />
    </svg>
  );
}
