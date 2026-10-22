"use client";

/**
 * PeachUI — AgentRun (block)
 * @tier block
 * @deps button, agent-log, motion
 * @requires app/globals.css
 *
 * One request played through the agentic stack as a live run
 * graph: the trigger fires, the context assembler packs sources,
 * the model router weighs candidates, and the orchestrator fans
 * the work out to task nodes on a draggable canvas. Click a node
 * to open its detail sheet — it stays live while the run plays
 * underneath.
 *
 * Host wiring (example — replace defaults with your API):
 * // const run = await fetchRun(runId);
 * // <AgentRun request={run.request} sources={run.context} models={run.candidates} tasks={run.tasks} />
 */

import { Fragment, useCallback, useMemo, useState, type ReactNode } from "react";
import {
  AlertTriangle,
  Database,
  Flash,
  Hierarchy,
  Route,
  Send,
  Task,
  X,
} from "reicon-react";
import { Button } from "@/components/atoms/button";
import { ShimmerText, useRevealTicker } from "@/components/primitives/agent-log";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { ContextStage } from "@/components/blocks/agent-run/context-stage";
import { OrchestratorStage } from "@/components/blocks/agent-run/orchestrator-stage";
import { RouterStage } from "@/components/blocks/agent-run/router-stage";
import {
  RunCanvas,
  type FlowEdgeSpec,
  type FlowNodeSpec,
  type FlowNodeStatus,
} from "@/components/blocks/agent-run/run-canvas";
import {
  defaultAgentRunBudgetTokens,
  defaultAgentRunModels,
  defaultAgentRunPolicy,
  defaultAgentRunRequest,
  defaultAgentRunSources,
  defaultAgentRunTasks,
  defaultAgentRunWinnerId,
} from "@/components/data/agent-run-defaults";
import { formatEstimate, formatTokens } from "@/components/lib/agent-run-format";
import {
  defaultAgentRunLabels,
  type AgentRunLabels,
  type AgentRunModel,
  type AgentRunSource,
  type AgentRunTask,
} from "@/components/types";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

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

/** Inset card body — primary line over a muted caption. */
function NodeBody({ primary, caption }: { primary: ReactNode; caption?: ReactNode }) {
  return (
    <div className="flex min-w-0 flex-col gap-0.5">
      <div className="truncate text-body-2-medium text-ink">{primary}</div>
      {caption ? (
        <div className="truncate text-caption-1-regular text-ink-3">{caption}</div>
      ) : null}
    </div>
  );
}

/** Compact key/value rows for nodes without a dedicated stage panel. */
function DetailRows({ rows }: { rows: [string, ReactNode][] }) {
  return (
    <dl className="grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5">
      {rows.map(([label, value]) => (
        <Fragment key={label}>
          <dt className="text-caption-1-medium text-ink-3">{label}</dt>
          <dd className="min-w-0 text-body-2-regular text-ink">{value}</dd>
        </Fragment>
      ))}
    </dl>
  );
}

export interface AgentRunProps {
  className?: string;
  request?: string;
  sources?: AgentRunSource[];
  budgetTokens?: number;
  models?: AgentRunModel[];
  winnerId?: string;
  policy?: string;
  tasks?: AgentRunTask[];
  /** Start the run on mount; when false the footer button starts it. */
  autoPlay?: boolean;
  labels?: Partial<AgentRunLabels>;
}

export function AgentRun(props: AgentRunProps) {
  const [runIndex, setRunIndex] = useState(0);
  return (
    <AgentRunCard
      key={runIndex}
      runIndex={runIndex}
      onReplay={() => setRunIndex((current) => current + 1)}
      {...props}
    />
  );
}

function AgentRunCard({
  className,
  request = defaultAgentRunRequest,
  sources = defaultAgentRunSources,
  budgetTokens = defaultAgentRunBudgetTokens,
  models = defaultAgentRunModels,
  winnerId = defaultAgentRunWinnerId,
  policy = defaultAgentRunPolicy,
  tasks = defaultAgentRunTasks,
  autoPlay = true,
  labels: labelsProp,
  runIndex,
  onReplay,
}: AgentRunProps & { runIndex: number; onReplay: () => void }) {
  const labels = { ...defaultAgentRunLabels, ...labelsProp };
  const reduced = useReducedMotion();
  const [started, setStarted] = useState(autoPlay);
  const [selected, setSelected] = useState<string | null>(null);

  /* One beat per source + pack, per candidate + pick, per task + settle. */
  const unitCounts = [sources.length + 1, models.length + 1, tasks.length + 1];
  const bounds = [0, unitCounts[0], unitCounts[0] + unitCounts[1]];
  const total = unitCounts[0] + unitCounts[1] + unitCounts[2];

  const delays = useMemo(
    () => [
      ...sources.map(() => 460),
      720,
      ...models.map(() => 680),
      840,
      ...tasks.map((task) => 460 + task.seconds * 220),
      720,
    ],
    [sources, models, tasks],
  );
  const delayFor = useCallback((index: number) => delays[index] ?? 700, [delays]);

  const ticked = useRevealTicker({ total, run: started, delayFor });
  const progress = !started ? 0 : reduced ? total : ticked;

  const stageFill = (index: number) =>
    Math.min(Math.max(progress - (bounds[index] ?? 0), 0), unitCounts[index]);
  const liveStage = unitCounts.findIndex((_, i) => stageFill(i) < unitCounts[i]);
  const complete = started && liveStage === -1;
  const running = started && !complete;

  const contextFill = stageFill(0);
  const routerFill = stageFill(1);
  const orchFill = stageFill(2);
  const contextDone = contextFill >= unitCounts[0];
  const routerDone = routerFill >= unitCounts[1];
  const orchDone = orchFill >= unitCounts[2];
  const landed = Math.min(contextFill, sources.length);
  const weighed = routerFill;
  const picked = weighed > models.length;
  const tasksDone = Math.min(orchFill, tasks.length);

  const contextTokens = sources.reduce((sum, source) => sum + source.tokens, 0);
  const packedTokens = sources
    .slice(0, landed)
    .reduce((sum, source) => sum + source.tokens, 0);
  const winner = models.find((model) => model.id === winnerId) ?? models[0] ?? null;
  const current = models[Math.min(weighed, models.length - 1)] ?? null;
  const duration = `${tasks.reduce((sum, task) => sum + task.seconds, 0).toFixed(1)}s`;
  const runLabel = `run_${(0x14f2 * (runIndex + 1)).toString(16).slice(-4)}`;

  /* Reported per-node durations are the beats the stage actually waited. */
  const stageSeconds = [
    delays.slice(0, unitCounts[0]).reduce((s, d) => s + d, 0) / 1000,
    delays.slice(unitCounts[0], unitCounts[0] + unitCounts[1]).reduce((s, d) => s + d, 0) / 1000,
    delays.slice(unitCounts[0] + unitCounts[1]).reduce((s, d) => s + d, 0) / 1000,
  ];

  const fanOut = tasks.slice(0, -1);
  const deliverTask = tasks[tasks.length - 1] ?? null;

  const stageStatusOf = (
    done: boolean,
    stageIndex: number,
  ): FlowNodeStatus =>
    done ? "done" : started && liveStage === stageIndex ? "active" : "pending";

  const taskStatus = (index: number): FlowNodeStatus =>
    index < tasksDone
      ? "done"
      : started && liveStage === 2 && index === tasksDone
        ? "active"
        : "pending";

  const deliverStatus: FlowNodeStatus = deliverTask
    ? tasksDone >= tasks.length
      ? "done"
      : started && liveStage === 2 && tasksDone === tasks.length - 1
        ? "active"
        : "pending"
    : "skipped";

  const nodes: FlowNodeSpec[] = [
    {
      id: "trigger",
      role: "spine",
      w: 380,
      hue: "var(--warning)",
      kind: "Trigger",
      Icon: Flash,
      title: "Request received",
      status: !started ? "pending" : progress === 0 ? "active" : "done",
      statusText: !started ? "Ready" : progress === 0 ? "Firing" : `Done · ${(delayFor(0) / 1000).toFixed(1)}s`,
      body: <NodeBody primary={request} caption={`${labels.requestLabel} · manual run`} />,
    },
    {
      id: "context",
      role: "spine",
      w: 380,
      hue: "var(--violet)",
      kind: "Context",
      Icon: Database,
      title: "Context assembler",
      status: stageStatusOf(contextDone, 0),
      statusText: contextDone
        ? `Done · ${stageSeconds[0].toFixed(1)}s`
        : started && liveStage === 0
          ? "Packing"
          : "Queued",
      body: (
        <div className="flex flex-col gap-1.5">
          <p className="truncate text-body-2-medium text-ink">
            {contextDone ? (
              labels.packedLine(formatTokens(contextTokens), sources.length)
            ) : started && liveStage === 0 ? (
              <ShimmerText>{`Packing ${landed} of ${sources.length} sources`}</ShimmerText>
            ) : (
              "Waiting for retrieval"
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line-soft" aria-hidden>
              <span
                className="block h-full rounded-full bg-violet transition-[width] duration-300"
                style={{ width: `${Math.min(packedTokens / budgetTokens, 1) * 100}%` }}
              />
            </span>
            <span className="shrink-0 text-caption-2-regular tabular-nums text-ink-3">
              {formatTokens(packedTokens)} / {formatTokens(budgetTokens)}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "router",
      role: "spine",
      w: 380,
      hue: "var(--schedule)",
      kind: "Router",
      Icon: Route,
      title: "Model router",
      status: stageStatusOf(routerDone, 1),
      statusText: routerDone
        ? `Done · ${stageSeconds[1].toFixed(1)}s`
        : started && liveStage === 1
          ? "Routing"
          : "Queued",
      body: (
        <div className="flex flex-col gap-1.5">
          <p className="truncate text-body-2-medium text-ink">
            {picked && winner ? (
              winner.name
            ) : started && liveStage === 1 && current ? (
              <ShimmerText>{current.name}</ShimmerText>
            ) : (
              `${models.length} candidates`
            )}
          </p>
          <div className="flex items-center gap-2">
            <span className="h-1 min-w-0 flex-1 overflow-hidden rounded-full bg-line-soft" aria-hidden>
              <span
                className={cx(
                  "block h-full rounded-full transition-[width] duration-500",
                  picked ? "bg-green" : "bg-schedule",
                )}
                style={{
                  width: `${
                    (picked ? (winner?.fit ?? 0) : started && liveStage === 1 ? (current?.fit ?? 0) : 0) * 100
                  }%`,
                }}
              />
            </span>
            <span className="shrink-0 text-caption-2-regular tabular-nums text-ink-3">
              {picked && winner
                ? `est ${formatEstimate(winner.costPer1k, contextTokens)}`
                : policy}
            </span>
          </div>
        </div>
      ),
    },
    {
      id: "orchestrator",
      role: "spine",
      w: 380,
      hue: "var(--accent)",
      kind: "Agent",
      Icon: Hierarchy,
      title: "Orchestrator",
      status: stageStatusOf(orchDone, 2),
      statusText: orchDone
        ? `Done · ${stageSeconds[2].toFixed(1)}s`
        : started && liveStage === 2
          ? "Fanning out"
          : "Queued",
      body: (
        <NodeBody
          primary={
            orchDone ? (
              `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} settled`
            ) : started && liveStage === 2 ? (
              <ShimmerText>{`${tasksDone} of ${tasks.length} tasks settled`}</ShimmerText>
            ) : (
              "Standing by"
            )
          }
          caption={tasks.map((task) => task.owner).join(" · ")}
        />
      ),
    },
    ...fanOut.map((task, index) => ({
      id: task.id,
      role: "task" as const,
      w: 208,
      hue: "var(--accent)",
      Icon: Task,
      title: task.title,
      caption: task.owner,
      status: taskStatus(index),
      statusText:
        index < tasksDone
          ? `${task.seconds.toFixed(1)}s`
          : taskStatus(index) === "active"
            ? "Running"
            : "Queued",
    })),
    ...(deliverTask
      ? [
          {
            id: "deliver",
            role: "sink" as const,
            x: 0.3,
            w: 300,
            hue: "var(--green)",
            kind: "On success",
            Icon: Send,
            title: "Deliver",
            status: deliverStatus,
            statusText:
              deliverStatus === "done"
                ? `Done · ${deliverTask.seconds.toFixed(1)}s`
                : deliverStatus === "active"
                  ? "Sending"
                  : "Queued",
            body: <NodeBody primary={deliverTask.title} caption={deliverTask.owner} />,
          },
        ]
      : []),
    {
      id: "error",
      role: "sink",
      x: deliverTask ? 0.78 : 0.5,
      w: 280,
      hue: "var(--red)",
      kind: "On error",
      Icon: AlertTriangle,
      title: "Fallback",
      status: complete ? "skipped" : "pending",
      statusText: complete ? "Skipped" : "Standby",
      dimmed: true,
      body: <NodeBody primary="Retry 2×, then stop silently" caption="Logged to run history" />,
    },
  ];

  const statusById = Object.fromEntries(
    nodes.map((node) => [node.id, node.status]),
  ) as Record<string, FlowNodeStatus>;
  const hueById = Object.fromEntries(
    nodes.map((node) => [node.id, node.hue]),
  ) as Record<string, string>;

  const edge = (from: string, to: string): FlowEdgeSpec => ({
    from,
    to,
    /* Fan-out edges light as soon as the orchestrator emits the work. */
    tone:
      statusById[to] === "active"
        ? "flow"
        : from === "orchestrator"
          ? (started && liveStage === 2) || orchDone
            ? "lit"
            : "idle"
          : statusById[from] === "done"
            ? "lit"
            : "idle",
    hue: hueById[from],
  });

  const edges: FlowEdgeSpec[] = [
    edge("trigger", "context"),
    edge("context", "router"),
    edge("router", "orchestrator"),
    ...fanOut.map((task) => edge("orchestrator", task.id)),
    ...(deliverTask ? fanOut.map((task) => edge(task.id, "deliver")) : []),
    { from: "orchestrator", to: "error", tone: "error" },
  ];

  const stageStatus = (() => {
    if (!started) return { key: "ready", text: runLabel };
    if (complete) return { key: "complete", text: `${runLabel} · Complete` };
    const active = ["Assembling context", "Routing", "Orchestrating"][liveStage];
    return { key: `stage-${liveStage}`, text: `${runLabel} · ${active}` };
  })();

  const footerStatus = (() => {
    if (!started) return { key: "ready", outcome: "Ready", subject: request };
    if (complete)
      return {
        key: "complete",
        outcome: "Complete",
        subject: `${tasks.length} ${tasks.length === 1 ? "task" : "tasks"} · ${duration}`,
      };
    if (liveStage === 0)
      return {
        key: `context-${contextFill}`,
        outcome: "Assembling context",
        subject: `${landed} of ${sources.length} sources`,
      };
    if (liveStage === 1)
      return picked && winner
        ? { key: "routed", outcome: "Routed", subject: winner.name }
        : {
            key: `routing-${weighed}`,
            outcome: "Routing",
            subject: `weighing ${current?.name}`,
          };
    return {
      key: `task-${tasksDone}`,
      outcome: "Running",
      subject: tasks[Math.min(tasksDone, tasks.length - 1)]?.title ?? "",
    };
  })();

  const detailContent = (id: string): ReactNode => {
    if (id === "context")
      return (
        <ContextStage
          sources={sources}
          budgetTokens={budgetTokens}
          revealed={contextFill}
          labels={labels}
          reduced={reduced ?? false}
        />
      );
    if (id === "router")
      return (
        <RouterStage
          models={models}
          winnerId={winner?.id ?? ""}
          policy={policy}
          contextTokens={contextTokens}
          revealed={routerFill}
          live={liveStage === 1}
          labels={labels}
        />
      );
    if (id === "orchestrator")
      return (
        <OrchestratorStage
          tasks={tasks}
          revealed={orchFill}
          live={liveStage === 2}
          labels={labels}
          reduced={reduced ?? false}
        />
      );
    if (id === "trigger")
      return (
        <DetailRows
          rows={[
            ["Request", request],
            ["Source", "Manual run"],
            ["Run", runLabel],
          ]}
        />
      );
    if (id === "deliver" && deliverTask)
      return (
        <DetailRows
          rows={[
            ["Output", deliverTask.title],
            ["Owner", deliverTask.owner],
            ["Reported", `${deliverTask.seconds.toFixed(1)}s`],
          ]}
        />
      );
    if (id === "error")
      return (
        <DetailRows
          rows={[
            ["Policy", "Retry 2×, then stop silently"],
            ["Outcome", complete ? "Skipped — run succeeded" : "Standing by"],
          ]}
        />
      );
    const task = tasks.find((t) => t.id === id);
    if (task)
      return (
        <DetailRows
          rows={[
            ["Owner", task.owner],
            ["Reported", `${task.seconds.toFixed(1)}s`],
            ["Status", statusById[id] === "done" ? "Settled" : statusById[id] === "active" ? "Running" : "Queued"],
          ]}
        />
      );
    return null;
  };

  const selectedNode = nodes.find((node) => node.id === selected) ?? null;

  const detail = (
    <AnimatePresence>
      {selectedNode ? (
        <motion.div
          key={selectedNode.id}
          data-sheet
          initial={reduced ? false : { opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={motionInstantIfReduced(reduced, {
            type: "spring" as const,
            duration: 0.35,
            bounce: 0,
          })}
          className="absolute inset-x-3 bottom-3 z-30 flex max-h-[min(19rem,62%)] flex-col overflow-hidden rounded-panel bg-surface shadow-overlay"
        >
          <div className="flex shrink-0 items-center gap-2 border-b border-line px-3 py-2">
            <selectedNode.Icon className="size-4 shrink-0 text-ink-3" aria-hidden />
            <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">
              {selectedNode.title}
            </span>
            <span
              className={cx(
                "shrink-0 text-caption-2-regular tabular-nums",
                selectedNode.status === "done" ? "text-green" : "text-ink-3",
              )}
            >
              {selectedNode.statusText}
            </span>
            <button
              type="button"
              onClick={() => setSelected(null)}
              aria-label="Close node details"
              className="ml-1 flex size-6 shrink-0 items-center justify-center rounded-md text-ink-3 outline-none transition-colors duration-100 hover:bg-hover hover:text-ink focus-visible:ring-2 focus-visible:ring-accent"
            >
              <X className="size-3.5" aria-hidden />
            </button>
          </div>
          <div className="min-h-0 overflow-y-auto p-3">{detailContent(selectedNode.id)}</div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );

  const hud = (
    <div className="pointer-events-none absolute left-3 top-3 z-20 flex max-w-[calc(100%-1.5rem)] items-center gap-2 rounded-control border border-line bg-surface/90 px-2.5 py-1.5 shadow-xs backdrop-blur-sm">
      <span
        className={cx(
          "size-2 shrink-0 rounded-full",
          complete ? "bg-green" : running ? "animate-pulse bg-accent" : "bg-line-strong",
        )}
        aria-hidden
      />
      <span className="truncate text-caption-1-medium text-ink">{runLabel}</span>
      <span className="hidden truncate text-caption-2-regular tabular-nums text-ink-3 min-[460px]:block">
        {complete
          ? `Complete · ${duration}`
          : running
            ? ["Assembling context", "Routing", "Orchestrating"][liveStage]
            : "Not started"}
      </span>
    </div>
  );

  const hint = (
    <span className="pointer-events-none absolute right-3 top-3 z-20 hidden text-caption-2-regular text-ink-3 min-[520px]:block">
      Drag nodes to rearrange
    </span>
  );

  return (
    <section
      aria-label={labels.title}
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex items-baseline justify-between gap-3 px-4 py-3.5">
        <h2 className="text-body-medium text-ink">{labels.title}</h2>
        <Swap
          swapKey={stageStatus.key}
          reduced={reduced}
          className="text-body-2-regular text-ink-2 tabular-nums"
        >
          {stageStatus.text}
        </Swap>
      </div>

      <RunCanvas
        nodes={nodes}
        edges={edges}
        selectedId={selected}
        onSelect={setSelected}
        reduced={reduced ?? false}
        hud={hud}
        hint={hint}
        detail={detail}
        className="border-t border-line"
      />

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerStatus.key} reduced={reduced} className="truncate">
            <span className="text-body-medium text-ink">{footerStatus.outcome}</span>
            <span className="text-ink-3"> · </span>
            <span className="text-ink-2">{footerStatus.subject}</span>
          </Swap>
        </div>
        <Button
          variant={complete ? "secondary" : "primary"}
          size="small"
          onClick={complete ? onReplay : () => setStarted(true)}
          disabled={running}
          className="shrink-0"
        >
          {complete ? labels.replay : running ? labels.running : labels.run}
        </Button>
      </footer>
    </section>
  );
}

export type {
  AgentRunLabels,
  AgentRunModel,
  AgentRunSource,
  AgentRunSourceBadge,
  AgentRunStageId,
  AgentRunTask,
} from "@/components/types";
export { defaultAgentRunLabels } from "@/components/types";
export {
  defaultAgentRunBudgetTokens,
  defaultAgentRunModels,
  defaultAgentRunPolicy,
  defaultAgentRunRequest,
  defaultAgentRunSources,
  defaultAgentRunTasks,
  defaultAgentRunWinnerId,
} from "@/components/data/agent-run-defaults";
