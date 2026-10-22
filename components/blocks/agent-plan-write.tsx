"use client";

/**
 * PeachUI — AgentPlanWrite (block)
 * @tier block
 * @deps ask-step, budget-gauge, draft-card, agent-plan-write-plan-demo
 * @requires app/globals.css
 *
 * Plan and write surfaces in one thread-shaped demo: proposed plan,
 * approval, draft edits, and context budget (W2).
 */

import { useState } from "react";
import { fadeUpStyle } from "@/components/lib/block-motion";
import { AgentPlanWritePlanDemo } from "@/components/blocks/agent-plan-write-plan-demo";
import { AskStep } from "@/components/blocks/ask-step";
import { BreakdownCard, type BreakdownSegment } from "@/components/blocks/breakdown-card";
import { DraftCard } from "@/components/blocks/draft-card";
import { cx } from "@/lib/utils";

const DEMO_SEGMENTS: BreakdownSegment[] = [
  { id: "system", label: "System prompt", value: 4200, share: 0.024 },
  { id: "tools", label: "Tools", value: 12800, share: 0.073 },
  { id: "files", label: "Files", value: 46100, share: 0.262 },
  { id: "conversation", label: "Conversation", value: 108600, share: 0.618 },
  { id: "memory", label: "Memory", value: 3900, share: 0.022 },
];

export type AgentPlanWriteProps = {
  className?: string;
};

export function AgentPlanWrite({ className }: AgentPlanWriteProps) {
  const [planRan, setPlanRan] = useState(false);
  const [approved, setApproved] = useState(false);
  const [draftAccepted, setDraftAccepted] = useState(false);

  return (
    <div className={cx("mx-auto w-full max-w-[680px]", className)}>
      <div className="rounded-[22px] bg-canvas p-1.5">
        <div className="flex min-h-[320px] flex-col overflow-hidden rounded-card bg-surface shadow-hairline">
          <header className="border-b border-line-soft px-4 py-3">
            <h2 className="text-section-title text-balance text-ink">Plan & write</h2>
            <p className="mt-1 max-w-[48ch] text-body text-pretty text-ink-3">
              Modes between prompts: propose a plan, ask permission, co-edit a draft, and watch context fill up.
            </p>
          </header>

          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-8">
              <section aria-labelledby="plan-write-user">
                <div className="flex justify-end pl-8" style={fadeUpStyle}>
                  <div className="max-w-[85%] rounded-panel bg-field px-3.5 py-2 text-body text-pretty text-ink shadow-hairline">
                    Compare CRM pricing for our 10-person team and draft the October newsletter.
                  </div>
                </div>
              </section>

              <section aria-labelledby="plan-write-plan">
                <p id="plan-write-plan" className="mb-3 text-meta font-medium text-ink-2">Proposed plan</p>
                <AgentPlanWritePlanDemo onRun={() => setPlanRan(true)} />
              </section>

              {planRan ? (
                <section style={fadeUpStyle} aria-labelledby="plan-write-ask">
                  <p id="plan-write-ask" className="mb-3 text-meta font-medium text-ink-2">Permission</p>
                  <AskStep
                    variant="embedded"
                    title="Send campaign email"
                    subtitle="October product update · Newsletter"
                    onApprove={() => setApproved(true)}
                  />
                </section>
              ) : null}

              {approved ? (
                <section style={fadeUpStyle} aria-labelledby="plan-write-draft">
                  <p id="plan-write-draft" className="mb-3 text-meta font-medium text-ink-2">Draft</p>
                  <DraftCard
                    variant="embedded"
                    onAcceptAll={() => setDraftAccepted(true)}
                  />
                </section>
              ) : null}

              {draftAccepted ? (
                <section style={fadeUpStyle} aria-labelledby="plan-write-context">
                  <p id="plan-write-context" className="mb-3 text-meta font-medium text-ink-2">Context</p>
                  <BreakdownCard
                    variant="context"
                    layout="embedded"
                    totalValue={175_600}
                    capValue={200_000}
                    segments={DEMO_SEGMENTS}
                    onNewChat={() => undefined}
                    onCompact={() => undefined}
                  />
                </section>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
