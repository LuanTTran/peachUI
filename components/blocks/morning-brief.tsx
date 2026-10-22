"use client";

/**
 * PeachUI — MorningBrief (block)
 * @tier block
 * @deps insight-cards, button, motion
 * @requires app/globals.css
 *
 * Scan what needs you, open one item for the read on it,
 * then take the first step.
 */

import { useState, type ReactNode } from "react";
import { Check } from "reicon-react";
import { Button } from "@/components/atoms/button";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { type InsightBar } from "@/components/primitives/insight-cards";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

const BAR_GROW = {
  duration: 0.5,
  ease: [0.22, 1, 0.36, 1] as const,
};

const TONE_CLASS: Record<InsightBar["tone"], string> = {
  accent: "bg-accent",
  green: "bg-green",
  orange: "bg-orange",
  muted: "bg-line-strong",
};

type BriefAction = {
  body: string;
  cta: string;
  done: string;
};

export type BriefItem = {
  id: string;
  title: string;
  meta: string;
  tone: InsightBar["tone"];
  prose: string;
  bars: InsightBar[];
  action: BriefAction;
};

const DEFAULT_SUMMARY = "Four deals moved overnight. Three things need you before noon.";

const DEFAULT_ITEMS: BriefItem[] = [
  {
    id: "renewal",
    title: "Northwind renewal",
    meta: "Qualified · $36,000",
    tone: "orange",
    prose: "Three qualified accounts have had no reply for more than a week. Northwind is the oldest.",
    bars: [
      { label: "Northwind Labs", value: "11 days", pct: 100, tone: "orange" },
      { label: "Cedar Studio", value: "9 days", pct: 82, tone: "orange" },
      { label: "Lumen Stack", value: "8 days", pct: 73, tone: "accent" },
    ],
    action: {
      body: "Call Jordan Lee first — the renewal is the oldest open thread.",
      cta: "Start the call",
      done: "Call started",
    },
  },
  {
    id: "harbor",
    title: "Harbor & Co proposal",
    meta: "Proposal · $48,000",
    tone: "accent",
    prose: "Harbor asked two questions on the $48,000 proposal yesterday. Answer before the quote goes stale.",
    bars: [
      { label: "Harbor & Co", value: "2 open", pct: 100, tone: "orange" },
      { label: "Overcast", value: "revised quote", pct: 55, tone: "accent" },
    ],
    action: {
      body: "Reply to Maya Chen with both answers before Overcast.",
      cta: "Open the reply",
      done: "Reply opened",
    },
  },
  {
    id: "leads",
    title: "Two leads unqualified",
    meta: "Fieldnote · Paperweight",
    tone: "muted",
    prose: "Standup is at 9:00, then the Northwind renewal at 9:30. The leads keep until after lunch.",
    bars: [
      { label: "Standup", value: "9:00", pct: 40, tone: "muted" },
      { label: "Northwind call", value: "9:30", pct: 70, tone: "accent" },
      { label: "Open leads", value: "2", pct: 55, tone: "green" },
    ],
    action: {
      body: "Leave Fieldnote and Paperweight until after lunch.",
      cta: "Defer to afternoon",
      done: "Deferred",
    },
  },
];

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export type MorningBriefProps = {
  className?: string;
  items?: BriefItem[];
  summary?: string;
};

export function MorningBrief({
  className,
  items = DEFAULT_ITEMS,
  summary = DEFAULT_SUMMARY,
}: MorningBriefProps) {
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState(() => items[0]?.id ?? "");
  const [doneIds, setDoneIds] = useState<string[]>([]);

  const open = items.find((item) => item.id === openId) ?? items[0] ?? null;
  const openDone = open !== null && doneIds.includes(open.id);
  const doneCount = items.filter((item) => doneIds.includes(item.id)).length;
  const allDone = items.length > 0 && doneCount === items.length;

  const confirm = () => {
    if (open && !openDone) setDoneIds((current) => [...current, open.id]);
  };

  const footerKey = !open ? "empty" : openDone ? `done-${open.id}` : open.id;

  return (
    <section
      aria-label="Morning brief"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Morning brief</h2>
            <Swap
              swapKey={allDone ? "all" : `done-${doneCount}`}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2 tabular-nums"
            >
              {allDone ? "All handled" : `${doneCount} of ${items.length} handled`}
            </Swap>
          </div>

          <p className="text-body-regular text-pretty text-ink-2">{summary}</p>

          <ul className="flex flex-col gap-1">
            {items.map((item) => {
              const isOpen = open?.id === item.id;
              const isDone = doneIds.includes(item.id);
              return (
                <li key={item.id}>
                  <button
                    type="button"
                    aria-pressed={isOpen}
                    onClick={() => setOpenId(item.id)}
                    className={cx(
                      "button-press-motion w-full rounded-lg px-2.5 py-2 text-left",
                      "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-accent",
                      isOpen ? "bg-canvas" : "hover:bg-hover-2",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span
                        className={cx("size-1.5 shrink-0 rounded-full", TONE_CLASS[item.tone])}
                        aria-hidden
                      />
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-medium text-ink">
                          {item.title}
                        </span>
                        <span className="block truncate text-body-2-regular text-ink-2">
                          {item.meta}
                        </span>
                      </span>
                      {isDone ? (
                        <Check className="size-4 shrink-0 text-green" aria-hidden />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Why now</p>
          <Swap
            swapKey={open?.id ?? "empty"}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {open ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">{open.title}</h3>
                  {openDone ? (
                    <span className="mt-0.5 inline-flex items-center gap-1 text-caption-1-medium text-green">
                      <Check className="size-3.5" aria-hidden />
                      Done
                    </span>
                  ) : null}
                </div>
                <p className="text-body-2-regular text-ink-2">{open.meta}</p>
                <p className="text-body-regular text-pretty text-ink-2">{open.prose}</p>
                <ul className="flex flex-col gap-2.5 rounded-lg bg-canvas px-3 py-3">
                  {open.bars.map((bar, barIndex) => (
                    <li key={bar.label}>
                      <div className="mb-1 flex items-baseline justify-between gap-3">
                        <span className="min-w-0 truncate text-body-2-regular text-ink">
                          {bar.label}
                        </span>
                        <span className="shrink-0 text-caption-1-regular tabular-nums text-ink-2">
                          {bar.value}
                        </span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-field">
                        <motion.div
                          className={cx("h-full rounded-full", TONE_CLASS[bar.tone])}
                          initial={reducedMotion ? false : { width: 0 }}
                          animate={{ width: `${bar.pct}%` }}
                          transition={motionInstantIfReduced(reducedMotion, {
                            ...BAR_GROW,
                            delay: barIndex * 0.04,
                          })}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
                <p className="text-body-2-regular text-pretty text-ink-2">{open.action.body}</p>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">Nothing needs you this morning.</p>
                <p className="text-body-regular text-ink-2">New items land here overnight.</p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {open ? (
              <>
                <span className="text-body-medium text-ink">
                  {openDone ? open.action.done : "Needs you"}
                </span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{open.title}</span>
              </>
            ) : (
              <span className="text-ink-2">No item open</span>
            )}
          </Swap>
        </div>
        <Button
          variant={openDone ? "secondary" : "primary"}
          size="small"
          leadingIcon={openDone ? Check : undefined}
          aria-pressed={openDone}
          onClick={confirm}
          disabled={!open || openDone}
          className="shrink-0"
        >
          {open ? (openDone ? open.action.done : open.action.cta) : "Take the first step"}
        </Button>
      </footer>
    </section>
  );
}
