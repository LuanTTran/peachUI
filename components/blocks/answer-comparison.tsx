"use client";

/**
 * PeachUI — AnswerComparison (block)
 * @tier block
 * @deps button, motion
 * @requires app/globals.css
 *
 * Two retrievals answer the same question. Pick the winning
 * value on each conflicting field, then keep the merged answer.
 */

import { useState, type ReactNode } from "react";
import { Check, ChevronDown } from "reicon-react";
import { Button } from "@/components/atoms/button";
import {
  AnimatePresence,
  iconSwapTransition,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

type AnswerId = "a" | "b";

export interface ComparisonAnswer {
  id: AnswerId;
  label: string;
  source: string;
  body: string;
  tone: string;
}

export interface ComparisonField {
  id: string;
  label: string;
  a: string;
  /** Answer B's value. Omit when both answers agree. */
  b?: string;
}

const DEFAULT_QUESTION = "How long is the grace period when a team plan lapses?";

const DEFAULT_ANSWERS: ComparisonAnswer[] = [
  {
    id: "a",
    label: "Answer A",
    source: "Knowledge base",
    tone: "bg-accent",
    body: "Workspaces keep read access for 14 days after a lapse. Exports stay available and agent runs pause until billing is updated.",
  },
  {
    id: "b",
    label: "Answer B",
    source: "Billing docs",
    tone: "bg-orange",
    body: "Workspaces keep full access for 30 days after a lapse, then drop to read-only for 14 more. Agent runs pause at day 30.",
  },
];

const DEFAULT_FIELDS: ComparisonField[] = [
  {
    id: "grace",
    label: "Grace period",
    a: "14 days, read-only",
    b: "30 days, full access",
  },
  {
    id: "runs",
    label: "Agent runs",
    a: "Pause at the lapse",
    b: "Pause after day 30",
  },
  {
    id: "exports",
    label: "Exports",
    a: "Available the whole period",
    b: "Blocked once read-only",
  },
  { id: "downgrade", label: "Downgrade path", a: "Falls back to the free tier" },
  { id: "retention", label: "Data retention", a: "Kept for 90 days" },
];

function isConflict(field: ComparisonField) {
  return field.b !== undefined && field.b !== field.a;
}

function fieldValue(field: ComparisonField, id: AnswerId) {
  return id === "a" ? field.a : (field.b ?? field.a);
}

function toneText(tone: string) {
  return tone.replace(/^bg-/, "text-");
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

function AnswerTile({
  answer,
  className,
}: {
  answer: ComparisonAnswer;
  className?: string;
}) {
  return (
    <span
      className={cx(
        "flex size-5 shrink-0 items-center justify-center rounded-md text-caption-1-medium text-surface",
        answer.tone,
        className,
      )}
      aria-hidden
    >
      {answer.id.toUpperCase()}
    </span>
  );
}

function Pop({ reduced, children }: { reduced: boolean | null; children: ReactNode }) {
  return (
    <motion.span
      className="inline-flex shrink-0"
      initial={reduced ? false : { scale: 0.4, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={motionInstantIfReduced(reduced, iconSwapTransition)}
    >
      {children}
    </motion.span>
  );
}

function SourceHead({
  answer,
  open,
  onToggle,
}: {
  answer: ComparisonAnswer;
  open: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="min-w-0">
      <button
        type="button"
        aria-expanded={open}
        onClick={onToggle}
        className={cx(
          "button-press-motion flex w-full min-w-0 items-center gap-2 rounded-control px-2 py-1.5 text-left",
          "outline-none transition-colors duration-100 hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent",
        )}
      >
        <AnswerTile answer={answer} />
        <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">
          {answer.label}
          <span className="text-ink-3"> · </span>
          <span className="text-body-2-regular text-ink-2">{answer.source}</span>
        </span>
        <ChevronDown
          className={cx(
            "size-4 shrink-0 text-ink-3 transition-transform duration-150",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>
      <div
        className="grid transition-[grid-template-rows] duration-200 ease-out"
        style={{ gridTemplateRows: open ? "1fr" : "0fr" }}
      >
        <div className="overflow-hidden">
          <p className="px-2 pb-1 pt-1.5 text-caption-1-regular text-pretty text-ink-2">
            {answer.body}
          </p>
        </div>
      </div>
    </div>
  );
}

function ValueCell({
  field,
  answer,
  picked,
  reduced,
  onPick,
}: {
  field: ComparisonField;
  answer: ComparisonAnswer;
  picked: AnswerId | undefined;
  reduced: boolean | null;
  onPick: (fieldId: string, id: AnswerId) => void;
}) {
  const isPicked = picked === answer.id;
  const isLoser = picked !== undefined && !isPicked;
  return (
    <button
      type="button"
      aria-pressed={isPicked}
      onClick={() => onPick(field.id, answer.id)}
      className={cx(
        "button-press-motion flex w-full items-start gap-2 rounded-control px-2.5 py-2 text-left",
        "outline-none transition-[background-color,opacity] duration-150 focus-visible:ring-2 focus-visible:ring-accent",
        isPicked
          ? "bg-surface shadow-hairline"
          : isLoser
            ? "bg-inset opacity-55 hover:opacity-90"
            : "bg-inset shadow-hairline hover:bg-hover",
      )}
    >
      <AnswerTile answer={answer} className="size-4 rounded text-[9px]" />
      <span className="min-w-0 flex-1">
        <span className="block text-pretty text-body-2-medium text-ink">
          {fieldValue(field, answer.id)}
        </span>
        <span className="block truncate text-caption-1-regular text-ink-3">
          {answer.source}
        </span>
      </span>
      {isPicked ? (
        <Pop reduced={reduced}>
          <Check className={cx("mt-0.5 size-4", toneText(answer.tone))} aria-hidden />
        </Pop>
      ) : null}
    </button>
  );
}

export interface AnswerComparisonProps {
  className?: string;
  question?: string;
  /** Exactly two entries with ids "a" and "b" — field values pair with them. */
  answers?: ComparisonAnswer[];
  fields?: ComparisonField[];
}

export function AnswerComparison({
  className,
  question = DEFAULT_QUESTION,
  answers = DEFAULT_ANSWERS,
  fields = DEFAULT_FIELDS,
}: AnswerComparisonProps) {
  const reducedMotion = useReducedMotion();
  const conflicts = fields.filter(isConflict);
  const agreed = fields.filter((field) => !isConflict(field));

  const [picks, setPicks] = useState<Record<string, AnswerId>>({});
  const [merged, setMerged] = useState(false);
  const [openBodies, setOpenBodies] = useState<Partial<Record<AnswerId, boolean>>>({});

  const settled = conflicts.filter((field) => picks[field.id]).length;
  const unsettled = conflicts.length - settled;
  const nextUnsettled = conflicts.find((field) => !picks[field.id]);

  const answerFor = (id: AnswerId) =>
    answers.find((answer) => answer.id === id) ?? answers[0];

  const pick = (fieldId: string, id: AnswerId) => {
    if (picks[fieldId] === id) return;
    setPicks((current) => ({ ...current, [fieldId]: id }));
    setMerged(false);
  };

  const merge = () => setMerged(true);

  const status = merged
    ? {
        outcome: "Merged",
        subject:
          settled > 0
            ? `${settled} ${settled === 1 ? "field" : "fields"} settled`
            : "Agreed fields kept",
      }
    : unsettled === 0
      ? { outcome: "All fields settled", subject: "Ready to keep" }
      : {
          outcome: `${settled} of ${conflicts.length} settled`,
          subject: nextUnsettled?.label ?? "",
        };

  const footerKey = merged ? "merged" : `settled-${settled}-${unsettled}`;

  return (
    <section
      aria-label="Answer comparison"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className="primitive-card-bar flex items-baseline justify-between gap-3 border-b border-line">
        <h2 className="text-body-medium text-ink">Answer comparison</h2>
        <Swap
          swapKey={merged ? "merged" : `unsettled-${unsettled}`}
          reduced={reducedMotion}
          className="text-caption text-ink-3 tabular-nums"
        >
          {merged
            ? "Merged"
            : conflicts.length === 0
              ? "Answers agree"
              : unsettled === 0
                ? "All fields settled"
                : `${unsettled} ${unsettled === 1 ? "field" : "fields"} disagree`}
        </Swap>
      </div>

      <div className="primitive-card-pad flex flex-col gap-3 border-b border-line">
        <p className="text-body text-pretty text-ink-2">
          &ldquo;{question}&rdquo; — two sources answered.
        </p>
        <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">
          {answers.map((answer) => (
            <SourceHead
              key={answer.id}
              answer={answer}
              open={openBodies[answer.id] ?? false}
              onToggle={() =>
                setOpenBodies((current) => ({
                  ...current,
                  [answer.id]: !current[answer.id],
                }))
              }
            />
          ))}
        </div>
      </div>

      {conflicts.length > 0 ? (
        <div className="pb-1">
          <p className="px-3 pb-1 pt-3 text-caption font-medium text-ink-3">Disagree</p>
          <ul>
            {conflicts.map((field) => {
              const picked = picks[field.id];
              const winner = picked ? answerFor(picked) : null;
              return (
                <li key={field.id} className="border-b border-line px-3 py-3">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="text-body-medium text-ink">{field.label}</span>
                    <Swap
                      swapKey={picked ?? "open"}
                      reduced={reducedMotion}
                      className="text-caption-1-medium"
                    >
                      {winner ? (
                        <span
                          className={cx(
                            "inline-flex items-center gap-1",
                            toneText(winner.tone),
                          )}
                        >
                          <Check className="size-3.5" aria-hidden />
                          {winner.label}
                        </span>
                      ) : (
                        <span className="text-ink-3">Pick one</span>
                      )}
                    </Swap>
                  </div>
                  <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {answers.map((answer) => (
                      <ValueCell
                        key={answer.id}
                        field={field}
                        answer={answer}
                        picked={picked}
                        reduced={reducedMotion}
                        onPick={pick}
                      />
                    ))}
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      ) : null}

      {agreed.length > 0 ? (
        <div className="pb-1">
          <p className="px-3 pb-1 pt-3 text-caption font-medium text-ink-3">Agree</p>
          <ul>
            {agreed.map((field) => (
              <li
                key={field.id}
                className="flex items-baseline gap-2 px-3 py-2"
              >
                <Check className="size-3.5 shrink-0 translate-y-0.5 text-green" aria-hidden />
                <span className="min-w-0 flex-1 truncate">
                  <span className="text-body-2-medium text-ink-2">{field.label}</span>
                  <span className="text-ink-3"> · </span>
                  <span className="text-body-2-regular text-ink-3">{field.a}</span>
                </span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="border-t border-line">
        <div className="primitive-card-bar flex items-baseline justify-between gap-3">
          <p className="text-body-medium text-ink">Merged answer</p>
          {merged ? (
            <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-green-muted px-2 py-0.5 text-caption-1-medium text-green">
              <Check className="size-3" aria-hidden />
              Kept
            </span>
          ) : (
            <Swap
              swapKey={`${settled}-${conflicts.length}`}
              reduced={reducedMotion}
              className="text-caption text-ink-3 tabular-nums"
            >
              {conflicts.length === 0
                ? "No conflicts"
                : `${settled} of ${conflicts.length} settled`}
            </Swap>
          )}
        </div>
        <div className="primitive-card-pad pt-0">
          <ul className="flex flex-col gap-0.5 rounded-panel bg-canvas p-1.5">
            {fields.map((field) => {
              const conflict = isConflict(field);
              const winner = conflict ? picks[field.id] : undefined;
              const answer = winner ? answerFor(winner) : null;
              return (
                <li
                  key={field.id}
                  className="flex items-center gap-2 rounded-control px-2 py-1.5"
                >
                  {answer ? (
                    <AnswerTile answer={answer} className="size-4 rounded text-[9px]" />
                  ) : conflict ? (
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded bg-inset text-[9px] font-semibold text-ink-3 shadow-hairline"
                      aria-hidden
                    >
                      ?
                    </span>
                  ) : (
                    <span
                      className="flex size-4 shrink-0 items-center justify-center rounded bg-green-muted text-green"
                      aria-hidden
                    >
                      <Check className="size-3" />
                    </span>
                  )}
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-caption-1-regular text-ink-3">
                      {field.label}
                    </span>
                    <span
                      className={cx(
                        "block truncate text-body-2-medium",
                        conflict && !answer ? "text-ink-3" : "text-ink",
                      )}
                    >
                      {conflict
                        ? answer
                          ? fieldValue(field, answer.id)
                          : "Unresolved"
                        : field.a}
                    </span>
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <footer className="primitive-card-footer flex items-center justify-between gap-3 border-t border-line">
        <div className="min-w-0 flex-1 overflow-hidden text-body" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {status.outcome ? (
              <>
                <span className="text-body-medium text-ink">{status.outcome}</span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{status.subject}</span>
              </>
            ) : (
              <span className="text-ink-2">{status.subject}</span>
            )}
          </Swap>
        </div>
        <Button
          variant={merged ? "secondary" : "primary"}
          size="small"
          leadingIcon={merged ? Check : undefined}
          aria-pressed={merged}
          onClick={merge}
          disabled={merged || unsettled > 0}
          className="shrink-0"
        >
          {merged
            ? "Merged answer kept"
            : conflicts.length === 0
              ? "Keep an answer"
              : "Keep merged answer"}
        </Button>
      </footer>
    </section>
  );
}
