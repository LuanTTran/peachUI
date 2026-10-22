"use client";


import { useState } from "react";
import { AnimatePresence, motion, motionInstantIfReduced, useReducedMotion } from "@/components/lib/motion";
import { cx } from "@/lib/utils";

export type InsightBar = {
  label: string;
  value: string;
  pct: number;
  tone: "accent" | "green" | "orange" | "muted";
};

export type InsightPage = {
  key: string;
  kicker: string;
  prose: string;
  prompt: string;
  answer: string;
  bars: InsightBar[];
};

const DEFAULT_PAGES: InsightPage[] = [
  {
    key: "call",
    kicker: "Who is waiting",
    prose: "Three qualified accounts have had no reply for more than a week. Northwind is the oldest.",
    prompt: "Which account should I call first?",
    answer: "Call Northwind Labs. Jordan Lee has been waiting 11 days.",
    bars: [
      { label: "Northwind Labs", value: "11 days", pct: 100, tone: "orange" },
      { label: "Cedar Studio", value: "9 days", pct: 82, tone: "orange" },
      { label: "Lumen Stack", value: "8 days", pct: 73, tone: "accent" },
    ],
  },
  {
    key: "later",
    kicker: "What can wait",
    prose: "Standup is at 9:00, then the Northwind renewal at 9:30. Two leads have not been qualified.",
    prompt: "What can wait until afternoon?",
    answer: "Fieldnote and Paperweight are still leads. Leave them until after lunch.",
    bars: [
      { label: "Standup", value: "9:00", pct: 40, tone: "muted" },
      { label: "Northwind call", value: "9:30", pct: 70, tone: "accent" },
      { label: "Open leads", value: "2", pct: 55, tone: "green" },
    ],
  },
  {
    key: "moved",
    kicker: "What moved",
    prose: "Four deals changed stage overnight. Two proposals are still waiting on an answer.",
    prompt: "What should I answer first?",
    answer: "Harbor & Co asked two questions on the $48,000 proposal. Answer those before Overcast.",
    bars: [
      { label: "Lead", value: "3", pct: 60, tone: "muted" },
      { label: "Qualified", value: "3", pct: 60, tone: "orange" },
      { label: "Proposal", value: "2", pct: 40, tone: "accent" },
      { label: "Won", value: "2", pct: 40, tone: "green" },
    ],
  },
];

const TONE_CLASS: Record<InsightBar["tone"], string> = {
  accent: "bg-accent",
  green: "bg-green",
  orange: "bg-orange",
  muted: "bg-line-strong",
};

const ENTER = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };
export type InsightCardsLabels = {
  title: string;
  previous: string;
  next: string;
};

const DEFAULT_LABELS: InsightCardsLabels = {
  title: "Insights",
  previous: "Previous insight",
  next: "Next insight",
};

export type InsightCardsProps = {
  pages?: InsightPage[];
  labels?: Partial<InsightCardsLabels>;
  className?: string;
  initialKey?: string;
};

export function InsightCards({ pages = DEFAULT_PAGES, labels, className, initialKey }: InsightCardsProps) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const reduced = useReducedMotion() ?? false;
  const start = Math.max(0, pages.findIndex((item) => item.key === initialKey));
  const [index, setIndex] = useState(start);
  const [asked, setAsked] = useState<string | null>(null);
  const page = pages[index] ?? pages[0];
  if (!page) return null;

  const move = (direction: -1 | 1) => {
    setIndex((current) => (current + direction + pages.length) % pages.length);
  };

  return (
    <div className={cx("w-full max-w-xl", className)}>
      <div className="flex items-center justify-between">
        <span className="flex items-baseline gap-1.5">
          <span className="text-body-strong text-ink">{copy.title}</span>
          <span className="text-meta tabular-nums text-ink-3">{pages.length}</span>
        </span>
        <span className="flex items-center gap-0.5">
          <PagerButton label={copy.previous} direction="previous" onClick={() => move(-1)} />
          <PagerButton label={copy.next} direction="next" onClick={() => move(1)} />
        </span>
      </div>

      <AnimatePresence mode="wait" initial={false}>
        <motion.div
          key={page.key}
          initial={reduced ? false : { opacity: 0, y: 12, filter: "blur(3px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={reduced ? undefined : { opacity: 0 }}
          transition={motionInstantIfReduced(reduced, ENTER)}
        >
          <p className="mt-1 text-overline">{page.kicker}</p>
          <p className="mt-1 text-body text-pretty text-ink-2">{page.prose}</p>
          <ul className="mt-3 flex flex-col gap-2.5 rounded-control bg-inset p-2.5 shadow-hairline">
            {page.bars.map((bar, barIndex) => (
              <li key={bar.label}>
                <div className="mb-1 flex items-baseline justify-between gap-3">
                  <span className="min-w-0 truncate text-meta text-ink">{bar.label}</span>
                  <span className="shrink-0 text-meta tabular-nums text-ink-2">{bar.value}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-field">
                  <motion.div
                    className={cx("h-full rounded-full", TONE_CLASS[bar.tone])}
                    initial={reduced ? false : { width: 0 }}
                    animate={{ width: `${bar.pct}%` }}
                    transition={motionInstantIfReduced(reduced, {
                      duration: 0.5,
                      delay: barIndex * 0.04,
                      ease: [0.22, 1, 0.36, 1] as const,
                    })}
                  />
                </div>
              </li>
            ))}
          </ul>
          <div className="mt-3 min-h-9">
            {asked === page.key ? (
              <p className="text-body text-pretty text-ink">{page.answer}</p>
            ) : (
              <button
                type="button"
                onClick={() => setAsked(page.key)}
                className="rounded-full bg-surface px-3 py-1.5 text-left text-meta text-ink shadow-btn transition-[background-color,transform] duration-150 hover:bg-hover active:scale-[0.96]"
              >
                {page.prompt}
              </button>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

function PagerButton({
  label,
  direction,
  onClick,
}: {
  label: string;
  direction: "previous" | "next";
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      onClick={onClick}
      className="flex size-8 items-center justify-center rounded-control text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
        <path d={direction === "previous" ? "M15 18 9 12l6-6" : "M9 6l6 6-6 6"} />
      </svg>
    </button>
  );
}
