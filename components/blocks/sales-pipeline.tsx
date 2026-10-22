"use client";

/**
 * PeachUI — SalesPipeline (block)
 * @tier block
 * @deps records-table, recommendation-card, chip, button, motion
 * @requires app/globals.css
 *
 * Pick a stage, then a deal. The rail weighs the next step
 * and the footer takes it.
 */

import { useId, useState, type KeyboardEvent, type ReactNode } from "react";
import { Check } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import {
  defaultDealRecords,
  RecordsTable,
  type DealRecord,
  type DealStage,
} from "@/components/primitives/records-table";
import {
  type RecommendationOption,
  type RecommendationTone,
} from "@/components/primitives/recommendation-card";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

const PILL_MOVE = {
  duration: 0.25,
  ease: [0.22, 1, 0.36, 1] as const,
};

const STAGE_ORDER: DealStage[] = ["lead", "qualified", "proposal", "won"];

const STAGE_LABEL: Record<DealStage, string> = {
  lead: "Lead",
  qualified: "Qualified",
  proposal: "Proposal",
  won: "Won",
};

const STAGE_CHIP: Record<DealStage, "neutral" | "yellow" | "blue" | "lime"> = {
  lead: "neutral",
  qualified: "yellow",
  proposal: "blue",
  won: "lime",
};

const TONE_CLASS: Record<RecommendationTone, string> = {
  green: "bg-green",
  orange: "bg-orange",
  muted: "bg-ink-3",
};

type Beat = {
  hint: string;
  title: string;
  body: string;
  short: string;
  cta: string;
  done: string;
};

const BEATS: Record<string, Beat> = {
  northwind: {
    hint: "Northwind has been quiet for 11 days. A short call is the fastest way back into the renewal.",
    title: "Call Northwind about the renewal?",
    body: "Call Jordan Lee. The renewal has had no reply since last week.",
    short: "Call Jordan Lee",
    cta: "Start the call",
    done: "Call started",
  },
  cedar: {
    hint: "Cedar Studio went quiet after the demo. A note is enough to see if the trial is still open.",
    title: "Write Cedar Studio?",
    body: "Email Alex Rivera and ask if the trial still fits the design team.",
    short: "Email Alex Rivera",
    cta: "Send the email",
    done: "Email queued",
  },
  lumen: {
    hint: "Lumen Stack has not replied in 8 days. Check whether the budget review moved.",
    title: "Check in with Lumen Stack?",
    body: "Ask Sam Okonkwo if the budget review is still on the calendar.",
    short: "Ask about the review",
    cta: "Send the check-in",
    done: "Check-in queued",
  },
  harbor: {
    hint: "Harbor & Co is waiting on two answers in the proposal. Reply before the quote goes stale.",
    title: "Answer Harbor & Co?",
    body: "Reply to Maya Chen with the two open questions on the $48,000 proposal.",
    short: "Answer the proposal",
    cta: "Open the reply",
    done: "Reply opened",
  },
  overcast: {
    hint: "Overcast looked at the quote yesterday. Send the revised numbers while it is still fresh.",
    title: "Send Overcast the revised quote?",
    body: "Send Alex Rivera the updated quote before the end of the day.",
    short: "Send the revised quote",
    cta: "Send the quote",
    done: "Quote queued",
  },
  fieldnote: {
    hint: "Fieldnote came in yesterday and is still a lead. One question will tell you if it is real.",
    title: "Qualify Fieldnote?",
    body: "Ask Maya Chen who owns the decision, and whether they want a demo.",
    short: "Qualify the lead",
    cta: "Draft the question",
    done: "Question drafted",
  },
  kinfolk: {
    hint: "Kinfolk closed today. A thank-you keeps the handoff to onboarding clean.",
    title: "Thank Kinfolk?",
    body: "Send Sam Okonkwo a short thank-you and the onboarding link.",
    short: "Send a thank-you",
    cta: "Send thanks",
    done: "Thanks queued",
  },
};

function beatFor(deal: DealRecord): Beat {
  const known = BEATS[deal.id];
  if (known) return known;
  const stage = STAGE_LABEL[deal.stage];
  const when =
    deal.lastTouch === "Today" || deal.lastTouch === "Yesterday"
      ? deal.lastTouch.toLowerCase()
      : deal.lastTouch;
  return {
    hint: `${deal.account} is in ${stage}. Last touch was ${when}.`,
    title: `Follow up with ${deal.account}?`,
    body: `Send ${deal.owner} a note about ${deal.account}. Last touch was ${when}.`,
    short: `Note ${deal.owner}`,
    cta: "Send a note",
    done: "Note queued",
  };
}

function optionsFor(deal: DealRecord, beat: Beat): RecommendationOption[] {
  const stage = STAGE_LABEL[deal.stage];
  return [
    {
      key: "primary",
      body: beat.body,
      short: beat.short,
      signal: 3,
      tone: "green",
      label: "High confidence",
      cta: beat.cta,
      done: beat.done,
    },
    {
      key: "snooze",
      body: `Snooze ${deal.account} until Friday and keep ${deal.owner} as the owner.`,
      short: "Snooze until Friday",
      signal: 1,
      tone: "orange",
      label: "Needs review",
      cta: "Snooze until Friday",
      done: "Snoozed until Friday",
    },
    {
      key: "leave",
      body: `Leave ${deal.account} in ${stage} and pick it up after standup.`,
      short: "Leave it for later",
      signal: 0,
      tone: "muted",
      label: "No signal",
      cta: "Leave for later",
      done: "Left for later",
    },
  ];
}

function quietest(rows: DealRecord[]) {
  return [...rows].sort((a, b) => b.quietDays - a.quietDays)[0];
}

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

export type SalesPipelineProps = {
  className?: string;
  deals?: DealRecord[];
  /** When set, the rail hint stays on this sentence instead of following the selected deal. */
  hintText?: string;
};

export function SalesPipeline({
  className,
  deals = defaultDealRecords,
  hintText,
}: SalesPipelineProps) {
  const reducedMotion = useReducedMotion();
  const tabsId = useId();
  const [stage, setStage] = useState<DealStage>("qualified");
  const [pickedId, setPickedId] = useState<string | null>(null);
  const [optionKey, setOptionKey] = useState("primary");
  const [acceptedKey, setAcceptedKey] = useState<string | null>(null);

  const stages = STAGE_ORDER.map((id) => ({
    id,
    label: STAGE_LABEL[id],
    count: deals.filter((deal) => deal.stage === id).length,
  }));

  const inStage = deals.filter((deal) => deal.stage === stage);
  const stageAmount = inStage.reduce((sum, deal) => sum + deal.amount, 0);
  const selected = inStage.find((deal) => deal.id === pickedId) ?? quietest(inStage);
  const beat = selected ? beatFor(selected) : null;
  const options = selected && beat ? optionsFor(selected, beat) : [];
  const active = options.find((option) => option.key === optionKey) ?? options[0];
  const activeKey = selected && active ? `${selected.id}:${active.key}` : null;
  const accepted = activeKey !== null && acceptedKey === activeKey;
  const busiest = quietest(deals)?.stage;

  const selectStage = (next: DealStage) => {
    setStage(next);
    setPickedId(null);
    setOptionKey("primary");
    setAcceptedKey(null);
  };

  const selectDeal = (id: string) => {
    setPickedId(id);
    setOptionKey("primary");
    setAcceptedKey(null);
  };

  const selectOption = (key: string) => {
    setOptionKey(key);
    setAcceptedKey(null);
  };

  const confirm = () => {
    if (activeKey) setAcceptedKey(activeKey);
  };

  const onTabsKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = Math.max(0, STAGE_ORDER.indexOf(stage));
    let nextIndex = index;
    if (event.key === "ArrowRight") nextIndex = (index + 1) % STAGE_ORDER.length;
    else if (event.key === "ArrowLeft")
      nextIndex = (index - 1 + STAGE_ORDER.length) % STAGE_ORDER.length;
    else if (event.key === "Home") nextIndex = 0;
    else if (event.key === "End") nextIndex = STAGE_ORDER.length - 1;
    else return;
    event.preventDefault();
    const next = STAGE_ORDER[nextIndex] ?? "lead";
    selectStage(next);
    event.currentTarget
      .querySelector<HTMLButtonElement>(`[data-stage="${next}"]`)
      ?.focus();
  };

  const railKey = selected?.id ?? "empty";
  const footerKey = !selected
    ? "empty"
    : accepted
      ? `done-${activeKey}`
      : `${selected.id}-${active?.key ?? "none"}`;

  return (
    <section
      aria-label="Sales pipeline"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Pipeline</h2>
            <Swap
              swapKey={stage}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2 tabular-nums"
            >
              {inStage.length} {inStage.length === 1 ? "deal" : "deals"} · $
              {stageAmount.toLocaleString()}
            </Swap>
          </div>

          <div
            role="tablist"
            aria-label="Stage"
            onKeyDown={onTabsKeyDown}
            className="flex w-fit max-w-full items-center gap-0.5 overflow-x-auto rounded-full bg-canvas p-1"
          >
            {stages.map((item) => {
              const isActive = stage === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  role="tab"
                  id={`${tabsId}-${item.id}`}
                  data-stage={item.id}
                  aria-selected={isActive}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectStage(item.id)}
                  className={cx(
                    "button-press-motion relative flex h-8 shrink-0 items-center gap-1.5 rounded-full px-3",
                    "text-body-2-medium outline-none focus-visible:ring-2 focus-visible:ring-accent",
                    isActive ? "text-ink" : "text-ink-2 hover:text-ink",
                  )}
                >
                  {isActive ? (
                    <motion.span
                      layoutId={`${tabsId}-pill`}
                      aria-hidden
                      initial={false}
                      transition={{ layout: motionInstantIfReduced(reducedMotion, PILL_MOVE) }}
                      className="absolute inset-0 rounded-full bg-surface shadow-xs ring-1 ring-line"
                    />
                  ) : null}
                  <span className="relative">{item.label}</span>
                  <span className="relative inline-flex min-w-5 items-center justify-center rounded-md bg-hover-2 px-1 text-caption-1-medium text-ink-2 tabular-nums">
                    {item.count}
                  </span>
                </button>
              );
            })}
          </div>

          {inStage.length === 0 ? (
            <div className="flex min-h-40 flex-col items-start justify-center gap-2 rounded-lg bg-canvas px-4 py-6">
              <p className="text-body-medium text-ink">No deals in {STAGE_LABEL[stage]}</p>
              <p className="text-body-regular text-ink-2">
                Deals land here as they move through the pipeline.
              </p>
              {busiest && busiest !== stage ? (
                <Button
                  variant="secondary"
                  size="small"
                  className="mt-1"
                  onClick={() => selectStage(busiest)}
                >
                  See {STAGE_LABEL[busiest]} stage
                </Button>
              ) : null}
            </div>
          ) : (
            <RecordsTable
              rows={deals}
              stage={stage}
              chrome="plain"
              showSummary={false}
              selectedId={selected?.id}
              onSelect={selectDeal}
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Next step</p>
          <Swap swapKey={railKey} reduced={reducedMotion} className="flex min-w-0 flex-col gap-3">
            {selected && beat && active ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    {selected.account}
                  </h3>
                  <Chip variant="caption" color={STAGE_CHIP[selected.stage]} className="mt-0.5">
                    {STAGE_LABEL[selected.stage]}
                  </Chip>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  {selected.value}
                  <span className="text-ink-3"> · </span>
                  {selected.owner}
                  <span className="text-ink-3"> · </span>
                  <span className="tabular-nums">{selected.lastTouch}</span>
                </p>
                <p className="text-body-regular text-pretty text-ink-2">
                  {hintText ?? beat.hint}
                </p>
                <div className="flex flex-col gap-1 rounded-lg bg-canvas p-1.5">
                  {options.map((option) => {
                    const isActive = option.key === active.key;
                    return (
                      <button
                        key={option.key}
                        type="button"
                        aria-pressed={isActive}
                        onClick={() => selectOption(option.key)}
                        className={cx(
                          "button-press-motion flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left",
                          "outline-none transition-colors duration-150 focus-visible:ring-2 focus-visible:ring-accent",
                          isActive ? "bg-surface shadow-xs" : "hover:bg-hover-2",
                        )}
                      >
                        <Meter signal={option.signal} tone={option.tone} />
                        <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">
                          {option.short}
                        </span>
                        <span className="shrink-0 text-caption-1-regular text-ink-3">
                          {option.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
                <Swap
                  swapKey={active.key}
                  reduced={reducedMotion}
                  className="text-body-2-regular text-pretty text-ink-2"
                >
                  {active.body}
                </Swap>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">No deal open.</p>
                <p className="text-body-regular text-ink-2">
                  Pick a stage with deals and the next step shows up here.
                </p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {selected && active ? (
              <>
                <span className="text-body-medium text-ink">
                  {accepted ? active.done : STAGE_LABEL[selected.stage]}
                </span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{selected.account}</span>
                {accepted ? null : (
                  <>
                    <span className="text-ink-3"> · </span>
                    <span className="text-ink-2">{selected.value}</span>
                  </>
                )}
              </>
            ) : (
              <span className="text-ink-2">No deal open</span>
            )}
          </Swap>
        </div>
        <Button
          variant={accepted ? "secondary" : "primary"}
          size="small"
          leadingIcon={accepted ? Check : undefined}
          aria-pressed={accepted}
          onClick={confirm}
          disabled={!selected || !active || accepted}
          className="shrink-0"
        >
          {accepted ? active.done : (active?.cta ?? "Take the next step")}
        </Button>
      </footer>
    </section>
  );
}
