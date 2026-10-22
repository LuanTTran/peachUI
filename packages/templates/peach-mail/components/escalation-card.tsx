"use client";

/**
 * Decision-first escalation: the agent won't draft past policy, so it
 * lays out the call instead. Picking an option hands the decision back —
 * the agent drafts around it.
 */

import { ShieldAlert } from "reicon-react";
import { Radio, RadioGroup } from "@/components/atoms/radio";
import type { EscalationOption } from "../data";
import { cx } from "@/lib/utils";

export function EscalationCard({
  summary,
  policy,
  options,
  chosenId,
  onChoose,
}: {
  summary: string;
  /** Policy rule the agent hit, rendered mono. */
  policy: string;
  options: EscalationOption[];
  chosenId?: string;
  onChoose: (id: string) => void;
}) {
  return (
    <article
      aria-label="Escalation"
      className="rounded-panel border border-line bg-surface shadow-hairline"
    >
      <div className="flex items-start gap-2.5 px-3 py-2.5">
        <span className="grid size-8 shrink-0 place-items-center rounded-lg bg-warning-muted text-warning">
          <ShieldAlert className="size-4" aria-hidden />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-body-2-medium text-ink">Needs your call</p>
          <p className="mt-0.5 text-body-2-regular text-pretty text-ink-2">{summary}</p>
          <p className="mt-1.5 font-mono text-caption-2-regular text-ink-3">{policy}</p>
        </div>
      </div>

      <RadioGroup
        aria-label="Decision options"
        value={chosenId}
        onChange={onChoose}
        className="gap-1.5 border-t border-line-soft px-3 py-2.5"
      >
        {options.map((option) => (
          <Radio
            key={option.id}
            value={option.id}
            size="sm"
            className={(state) =>
              cx(
                "w-full items-start gap-2.5 rounded-2lg border px-2.5 py-2 text-left",
                "transition-colors duration-100",
                state.isSelected
                  ? "border-accent-600 bg-accent-muted/40"
                  : "border-line hover:bg-hover",
              )
            }
          >
            <span className="flex min-w-0 flex-1 flex-col">
              <span className="text-body-2-medium text-ink">{option.label}</span>
              <span className="mt-0.5 text-caption-1-regular text-ink-3">
                {option.detail}
              </span>
            </span>
          </Radio>
        ))}
      </RadioGroup>

      {chosenId === undefined ? (
        <p className="px-3.5 pb-2.5 text-caption-2-regular text-ink-3">
          Pick one — Peach Agent drafts the reply around your decision.
        </p>
      ) : null}
    </article>
  );
}
