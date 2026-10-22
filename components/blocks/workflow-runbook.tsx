"use client";

/**
 * PeachUI — WorkflowRunbook (block)
 * @tier block
 * @deps button, motion
 * @requires app/globals.css
 *
 * Review the steps in a runbook, run it, and watch each
 * step report back.
 */

import { useState, type ComponentType, type ReactNode } from "react";
import { Bolt, Check, Flag, Gear, Play, Route, Sparkle } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { ShimmerText } from "@/components/primitives/agent-log";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { useTicker } from "@/lib/use-ticker";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

type StepStatus = "pending" | "active" | "done";
type StepIcon = ComponentType<{ className?: string }>;

export interface RunbookStep {
  id: string;
  kind: string;
  title: string;
  caption: string;
  /** Prose shown in the rail while the step is selected. */
  detail: string;
  /** Result line shown once the step is done. */
  output: string;
  /** Simulated duration; defaults to the block's `stepMs`. */
  ms?: number;
}

const KIND_STYLE: Record<string, { tone: string; Icon: StepIcon }> = {
  Trigger: { tone: "bg-violet", Icon: Bolt },
  Agent: { tone: "bg-accent", Icon: Sparkle },
  Router: { tone: "bg-orange", Icon: Route },
  Tools: { tone: "bg-schedule", Icon: Gear },
  Complete: { tone: "bg-green", Icon: Flag },
};

const FALLBACK_KIND = { tone: "bg-ink-3", Icon: Gear };

const DEFAULT_STEPS: RunbookStep[] = [
  {
    id: "trigger",
    kind: "Trigger",
    title: "Pull request opened",
    caption: "peach-ui/catalog#482 · catalog refresh",
    detail: "Starts the run whenever a pull request opens against main.",
    output: "PR #482 opened against main",
    ms: 900,
  },
  {
    id: "plan",
    kind: "Agent",
    title: "Plan release checks",
    caption: "Reads the diff and picks the checks",
    detail: "The agent scans the changed files and queues the checks that apply.",
    output: "3 checks queued",
    ms: 1400,
  },
  {
    id: "route",
    kind: "Router",
    title: "Route by changed paths",
    caption: "primitives/* runs the full suite",
    detail: "Changes under primitives/* get Storybook diff, axe, and token lint. Anything else runs docs checks only.",
    output: "Full suite selected",
    ms: 1100,
  },
  {
    id: "tools",
    kind: "Tools",
    title: "Run verification suite",
    caption: "Storybook diff · axe · token lint",
    detail: "Runs the queued checks in parallel and collects any failures.",
    output: "3 checks passed",
    ms: 2200,
  },
  {
    id: "complete",
    kind: "Complete",
    title: "Post the summary",
    caption: "Updates the release thread",
    detail: "Posts pass or fail with links back to the pull request.",
    output: "Summary posted to the thread",
    ms: 1000,
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

function StepGlyph({ status }: { status: StepStatus }) {
  if (status === "done") {
    return <Check className="size-4 shrink-0 text-green" aria-hidden />;
  }
  if (status === "active") {
    return (
      <span
        className="size-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none"
        aria-hidden
      />
    );
  }
  return (
    <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
      <span className="size-1.5 rounded-full bg-line-strong" />
    </span>
  );
}

export interface WorkflowRunbookProps {
  className?: string;
  steps?: RunbookStep[];
  /** Milliseconds each simulated step takes. */
  stepMs?: number;
}

export function WorkflowRunbook({
  className,
  steps = DEFAULT_STEPS,
  stepMs = 1400,
}: WorkflowRunbookProps) {
  const reducedMotion = useReducedMotion();
  const [pickedId, setPickedId] = useState<string | null>(null);
  // -1 idle · 0..n-1 step running · n run complete
  const [runIndex, setRunIndex] = useState(-1);
  const [runCount, setRunCount] = useState(0);

  const running = runIndex >= 0 && runIndex < steps.length;
  const complete = steps.length > 0 && runIndex >= steps.length;
  const runLabel = `run_${(runCount * 0x14f2).toString(16).slice(-4)}`;
  const totalMs = steps.reduce((sum, step) => sum + (step.ms ?? stepMs), 0);
  const duration = `${(totalMs / 1000).toFixed(1)}s`;

  useTicker(
    () => setRunIndex((current) => current + 1),
    running ? (steps[runIndex]?.ms ?? stepMs) : null,
    runIndex,
  );

  const statusOf = (index: number): StepStatus =>
    index < runIndex ? "done" : index === runIndex && running ? "active" : "pending";

  const picked = steps.find((step) => step.id === pickedId) ?? null;
  const showSummary = complete && picked === null;
  const selected =
    picked ??
    (running ? steps[runIndex] : complete ? steps[steps.length - 1] : steps[0]) ??
    null;
  const selectedIndex = selected ? steps.indexOf(selected) : -1;
  const selectedStatus = selectedIndex >= 0 ? statusOf(selectedIndex) : "pending";
  const selectedKind = selected
    ? (KIND_STYLE[selected.kind] ?? FALLBACK_KIND)
    : FALLBACK_KIND;

  const start = () => {
    if (running || steps.length === 0) return;
    setPickedId(null);
    setRunCount((current) => current + 1);
    setRunIndex(reducedMotion ? steps.length : 0);
  };

  const status = complete
    ? {
        outcome: "Complete",
        subject: `${steps.length} ${steps.length === 1 ? "step" : "steps"} · ${duration}`,
      }
    : running
      ? { outcome: "Running", subject: steps[runIndex]?.title ?? "" }
      : { outcome: "Ready", subject: `${steps.length} ${steps.length === 1 ? "step" : "steps"}` };

  const footerKey = complete
    ? "complete"
    : running
      ? `running-${runIndex}`
      : "idle";

  return (
    <section
      aria-label="Workflow runbook"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Workflow runbook</h2>
            <Swap
              swapKey={footerKey}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2 tabular-nums"
            >
              {complete
                ? "Run complete"
                : running
                  ? `Step ${runIndex + 1} of ${steps.length}`
                  : `${steps.length} ${steps.length === 1 ? "step" : "steps"}`}
            </Swap>
          </div>

          <p className="text-body-regular text-pretty text-ink-2">
            Release checks that run on every pull request to main. Pick a step to
            inspect it.
          </p>

          <ol className="flex flex-col rounded-lg bg-canvas p-1.5">
            {steps.map((step, index) => {
              const stepStatus = statusOf(index);
              const isOpen = selected?.id === step.id;
              const kind = KIND_STYLE[step.kind] ?? FALLBACK_KIND;
              return (
                <li key={step.id} className="flex flex-col">
                  <button
                    type="button"
                    aria-pressed={isOpen}
                    onClick={() => setPickedId(step.id)}
                    className={cx(
                      "button-press-motion relative flex w-full items-center gap-2.5 rounded-md px-2 py-2 text-left",
                      "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-accent",
                      isOpen ? "bg-surface shadow-xs" : "hover:bg-hover-2",
                    )}
                  >
                    <span
                      className={cx(
                        "flex size-8 shrink-0 items-center justify-center rounded-lg text-surface",
                        kind.tone,
                      )}
                      aria-hidden
                    >
                      <kind.Icon className="size-4" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-body-medium text-ink">
                        {step.title}
                      </span>
                      <span className="block truncate text-body-2-regular text-ink-2">
                        {stepStatus === "done" ? step.output : step.caption}
                      </span>
                    </span>
                    <StepGlyph status={stepStatus} />
                    {stepStatus === "active" ? (
                      <motion.span
                        aria-hidden
                        initial={reducedMotion ? false : { scaleX: 0 }}
                        animate={{ scaleX: 1 }}
                        transition={motionInstantIfReduced(reducedMotion, {
                          duration: (step.ms ?? stepMs) / 1000,
                          ease: "linear" as const,
                        })}
                        className="absolute inset-x-2 bottom-0.5 h-0.5 origin-left rounded-full bg-accent"
                      />
                    ) : null}
                  </button>
                  {index < steps.length - 1 ? (
                    <span className="flex h-3.5" aria-hidden>
                      <span className="ml-2 flex w-8 justify-center">
                        <span
                          className={cx(
                            "h-full w-px transition-colors duration-300",
                            stepStatus === "done" ? "bg-green" : "bg-line-strong/50",
                          )}
                        />
                      </span>
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ol>
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">
            {showSummary ? "Run summary" : "Step"}
          </p>
          <Swap
            swapKey={showSummary ? "run-summary" : (selected?.id ?? "empty")}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {showSummary ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    Run complete
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-green-muted px-2 py-0.5 text-caption-1-medium text-green">
                    <Check className="size-3" aria-hidden />
                    {duration}
                  </span>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  {runLabel} · {steps.length}{" "}
                  {steps.length === 1 ? "step" : "steps"} · every check passed
                </p>
                <ul className="flex flex-col gap-1 rounded-lg bg-canvas p-1.5">
                  {steps.map((step) => (
                    <li key={step.id}>
                      <button
                        type="button"
                        onClick={() => setPickedId(step.id)}
                        className="button-press-motion flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left outline-none transition-colors duration-100 hover:bg-hover-2 focus-visible:ring-2 focus-visible:ring-accent"
                      >
                        <Check className="size-3.5 shrink-0 text-green" aria-hidden />
                        <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">
                          {step.title}
                        </span>
                        <span className="shrink-0 truncate text-caption-1-regular text-ink-3">
                          {step.output}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : selected ? (
              <>
                {complete ? (
                  <button
                    type="button"
                    onClick={() => setPickedId(null)}
                    className="w-fit text-body-2-medium text-accent transition-colors duration-100 hover:underline"
                  >
                    Run summary
                  </button>
                ) : null}
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    {selected.title}
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-canvas px-2 py-0.5 text-caption-1-medium text-ink-2">
                    <span
                      className={cx("size-1.5 rounded-full", selectedKind.tone)}
                      aria-hidden
                    />
                    {selected.kind}
                  </span>
                </div>
                <p className="text-body-2-regular text-ink-2">{selected.caption}</p>
                <p className="text-body-regular text-pretty text-ink-2">
                  {selected.detail}
                </p>
                <Swap
                  swapKey={selectedStatus}
                  reduced={reducedMotion}
                  className="rounded-lg bg-canvas px-3 py-2.5"
                >
                  <span className="flex items-center gap-2.5">
                    {selectedStatus === "done" ? (
                      <Check className="size-4 shrink-0 text-green" aria-hidden />
                    ) : selectedStatus === "active" ? (
                      <span
                        className="size-4 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none"
                        aria-hidden
                      />
                    ) : (
                      <span
                        className="flex size-4 shrink-0 items-center justify-center"
                        aria-hidden
                      >
                        <span className="size-1.5 rounded-full bg-line-strong" />
                      </span>
                    )}
                    <span className="min-w-0">
                      <span className="block text-body-2-medium text-ink">
                        {selectedStatus === "done"
                          ? selected.output
                          : selectedStatus === "active"
                            ? <ShimmerText>Running</ShimmerText>
                            : runIndex === -1
                              ? "Waits for a run"
                              : "Queued"}
                      </span>
                      <span className="block text-caption-1-regular text-ink-3">
                        Step {selectedIndex + 1} of {steps.length}
                        {runIndex >= 0 ? ` · ${runLabel}` : ""}
                        {selectedStatus === "done" ? " · Done" : ""}
                      </span>
                    </span>
                  </span>
                </Swap>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">No steps in this runbook.</p>
                <p className="text-body-regular text-ink-2">
                  Add a step and it shows up here.
                </p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            <span className="text-body-medium text-ink">{status.outcome}</span>
            <span className="text-ink-3"> · </span>
            <span className="text-ink-2">{status.subject}</span>
          </Swap>
        </div>
        <Button
          variant={complete ? "secondary" : "primary"}
          size="small"
          leadingIcon={running ? undefined : Play}
          onClick={start}
          disabled={running || steps.length === 0}
          className="shrink-0"
        >
          {complete ? "Run again" : running ? "Running" : "Run runbook"}
        </Button>
      </footer>
    </section>
  );
}
