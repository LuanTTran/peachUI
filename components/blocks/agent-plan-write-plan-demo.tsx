"use client";

/**
 * Catalog-only plan card for the Plan & write block demo.
 * Not a shipped block — illustrates plan mode before ask / draft / context.
 */

import { useState } from "react";
import { Clock, List, Plus, X } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { ToolChip } from "@/components/primitives/agent-inline-chips";
import { cx } from "@/lib/utils";

export type PlanDemoStep = {
  id: string;
  title: string;
  detail?: string;
  tools?: string[];
};

const DEMO_STEPS: PlanDemoStep[] = [
  { id: "1", title: "Pull Q3 revenue and ARR", detail: "Monthly revenue, ARR, and net retention", tools: ["stripe.query"] },
  { id: "2", title: "List open board asks", detail: "Linear issues tagged board-prep", tools: ["linear.search"] },
  { id: "3", title: "Draft the board memo", detail: "One page, metrics up front", tools: ["docs.write"] },
  { id: "4", title: "Attach charts from the deck", detail: "Export slides 4–7 as PNG", tools: ["slides.export"] },
  { id: "5", title: "Pause for your review", detail: "Human gate before send", tools: [] },
];

export type AgentPlanWritePlanDemoProps = {
  className?: string;
  steps?: PlanDemoStep[];
  onRun?: (stepIds: string[]) => void;
};

export function AgentPlanWritePlanDemo({
  className,
  steps = DEMO_STEPS,
  onRun,
}: AgentPlanWritePlanDemoProps) {
  const [enabled, setEnabled] = useState(() => new Set(steps.map((s) => s.id)));
  const [hoverId, setHoverId] = useState<string | null>(null);

  const toggle = (id: string) => {
    setEnabled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const run = () => {
    const ids = steps.filter((s) => enabled.has(s.id)).map((s) => s.id);
    onRun?.(ids);
  };

  return (
    <article
      className={cx(
        "w-full max-w-[480px] rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 border-b border-line-soft px-3 py-2.5 text-caption text-ink-3">
        <span className="inline-flex items-center gap-1.5">
          <List className="size-3.5" aria-hidden />
          Plan · {steps.length} steps
        </span>
        <span className="inline-flex items-center gap-1.5 tabular-nums">
          <Clock className="size-3.5" aria-hidden />
          ~2 min
        </span>
      </div>

      <div className="px-3 pt-3">
        <h3 className="text-section-title text-balance text-ink">Prepare the Q3 board update</h3>
      </div>

      <ol className="flex flex-col gap-0.5 p-2">
        {steps.map((step, index) => {
          const on = enabled.has(step.id);
          const hovered = hoverId === step.id;
          return (
            <li key={step.id}>
              <div
                className={cx(
                  "group flex items-start gap-2 rounded-control px-1.5 py-2 transition-colors duration-150",
                  on ? "bg-hover/50" : "opacity-60",
                  hovered && "bg-hover",
                )}
                onMouseEnter={() => setHoverId(step.id)}
                onMouseLeave={() => setHoverId(null)}
              >
                {hovered ? (
                  <span className="mt-1 flex w-4 shrink-0 cursor-grab text-ink-3" aria-hidden>⋮⋮</span>
                ) : (
                  <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-inset text-caption font-semibold tabular-nums text-ink-2 shadow-hairline">
                    {index + 1}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => toggle(step.id)}
                  className="min-w-0 flex-1 text-left"
                >
                  <span className="block text-body-strong text-ink">{step.title}</span>
                  {step.detail ? <span className="mt-0.5 block text-caption text-pretty text-ink-3">{step.detail}</span> : null}
                  {step.tools && step.tools.length > 0 ? (
                    <span className="mt-1.5 flex flex-wrap gap-1">
                      {step.tools.map((tool) => (
                        <ToolChip key={tool}>{tool}</ToolChip>
                      ))}
                    </span>
                  ) : null}
                </button>
                {hovered ? (
                  <button
                    type="button"
                    aria-label={`Remove step ${step.title}`}
                    className="mt-1 flex size-7 shrink-0 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover-2 hover:text-ink"
                    onClick={() => toggle(step.id)}
                  >
                    <X className="size-3.5" aria-hidden />
                  </button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>

      <button
        type="button"
        className="mx-2 mb-2 flex w-[calc(100%-1rem)] items-center gap-2 rounded-control border border-dashed border-line py-2 ps-2 text-caption text-ink-3 transition-colors duration-150 hover:border-line-strong hover:bg-hover hover:text-ink-2"
      >
        <span className="flex size-6 items-center justify-center rounded-full border border-dashed border-line">
          <Plus className="size-3.5" aria-hidden />
        </span>
        Add step
      </button>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-line-soft px-3 py-2.5">
        <p className="text-caption text-ink-3">Drag to reorder · double-click to rename</p>
        <div className="flex gap-2">
          <Button type="button" variant="ghost" size="small">Cancel</Button>
          <Button type="button" variant="primary" size="small" disabled={enabled.size === 0} onClick={run}>
            Run plan →
          </Button>
        </div>
      </div>
    </article>
  );
}
