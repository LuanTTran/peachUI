"use client";

/**
 * Run detail — sticky identity header with a Trace / Graph / Log view
 * switcher. Pending approvals stay pinned above the views: the gate is
 * the point of the screen. Graph renders the AgentRun orchestration
 * canvas; Log is the streamed terminal.
 */

import { useMemo, useState } from "react";
import { BranchUp, Check } from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { SegmentedControl, SegmentedControlItem } from "@/components/atoms/segmented-control";
import { Spinner } from "@/components/atoms/spinner";
import { AgentRun } from "@/components/blocks/agent-run/agent-run";
import {
  defaultAgentRunModels,
  defaultAgentRunPolicy,
  defaultAgentRunWinnerId,
} from "@/components/data/agent-run-defaults";
import { AgentRunTrace } from "@/components/primitives/agent-run-trace";
import { ToolChip } from "@/components/primitives/agent-inline-chips";
import { TerminalOutput, type TerminalLine } from "@/components/primitives/terminal-output";
import { PEOPLE } from "@templates/_shared/fixtures";
import {
  RUN_SOURCE_LABEL,
  orchestrationOf,
  type OpsApproval,
  type OpsRun,
  type RunStatus,
} from "../data";
import { ApprovalCard } from "./approval-card";
import { StatusPill } from "./run-status";
import { ContextSections } from "./context-rail";

type RunView = "trace" | "graph" | "log";

function AgentChips({ agents, settled }: { agents: string[]; settled: boolean }) {
  if (agents.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap gap-1.5">
      {agents.map((agent, index) => {
        const working = !settled && index === agents.length - 1;
        return (
          <ToolChip key={agent}>
            <span className="inline-flex items-center gap-1.5">
              {working ? (
                <Spinner tone="ink" className="size-2.5" />
              ) : (
                <Check className="size-2.5 shrink-0 text-green" aria-hidden />
              )}
              {agent}
            </span>
          </ToolChip>
        );
      })}
    </div>
  );
}

export type RunNotice = { id: string; text: string };

export function RunDetail({
  run,
  status,
  progress,
  elapsedMs,
  settledMs,
  durationLabel,
  log,
  notices,
  approvals,
  resolutions,
  onResolveApproval,
}: {
  run: OpsRun;
  status: RunStatus;
  progress: number;
  elapsedMs: number;
  settledMs?: number;
  durationLabel: string;
  log: TerminalLine[];
  notices: RunNotice[];
  approvals: OpsApproval[];
  resolutions: Record<string, string>;
  onResolveApproval: (approvalId: string, approved: boolean) => void;
}) {
  const [view, setView] = useState<RunView>("trace");
  const requester = PEOPLE.find((p) => p.id === run.requesterId);
  const running = status === "running" || status === "queued";
  const pending = approvals.filter((a) => a.state === "pending");
  const exitCode = status === "done" ? 0 : status === "failed" ? 1 : null;
  const graph = useMemo(() => orchestrationOf(run), [run]);

  return (
    <div className="min-h-0 flex-1 overflow-y-auto">
      {/* header — sticky so run identity + view switcher survive the scroll */}
      <div className="sticky top-0 z-10 border-b border-line bg-surface/80 px-4 py-4 backdrop-blur-sm sm:px-5">
        <div className="flex flex-wrap items-center gap-2">
          <StatusPill status={status} />
          <span className="font-mono text-caption-2-regular text-ink-3">{run.id}</span>
        </div>
        <h1 className="mt-1.5 text-headline-medium text-pretty text-ink">{run.title}</h1>
        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-caption-1-regular text-ink-3">
          <span className="inline-flex items-center gap-1.5">
            {requester ? (
              <>
                <Avatar size="xs" color="blue" initials={requester.initials} />
                <span className="text-ink-2">{requester.name}</span>
              </>
            ) : (
              <span className="text-ink-2">{RUN_SOURCE_LABEL[run.source]}</span>
            )}
            <span aria-hidden>·</span>
            {RUN_SOURCE_LABEL[run.source]}
          </span>
          <span className="inline-flex items-center gap-1 font-mono">
            <BranchUp className="size-3" aria-hidden />
            {run.repo}
            <span className="text-ink-3">·</span>
            {run.branch}
          </span>
          <span className="tabular-nums">{durationLabel}</span>
          <span className="tabular-nums">
            {run.cost} · {run.tokens} tokens
          </span>
        </div>
        <SegmentedControl
          aria-label="Run view"
          className="mt-3"
          selectedKeys={[view]}
          onSelectionChange={(keys) => {
            const next = [...keys][0];
            if (next === "trace" || next === "graph" || next === "log") setView(next);
          }}
        >
          <SegmentedControlItem id="trace">Trace</SegmentedControlItem>
          <SegmentedControlItem id="graph">Graph</SegmentedControlItem>
          <SegmentedControlItem id="log">Log</SegmentedControlItem>
        </SegmentedControl>
      </div>

      <div className="flex flex-col gap-5 px-4 py-4 sm:px-5">
        {/* approvals — the gate this run is paused on, reachable from every view */}
        {approvals.length > 0 ? (
          <section aria-label="Approvals">
            <p className="text-caption-1-medium text-ink-3">
              {pending.length > 0 ? "Needs you" : "Decisions"}
            </p>
            <div className="mt-2 flex flex-col gap-2">
              {approvals.map((approval) => (
                <ApprovalCard
                  key={approval.id}
                  approval={approval}
                  resolution={resolutions[approval.id]}
                  onResolve={onResolveApproval}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* system notices */}
        {notices.length > 0 ? (
          <div aria-live="polite" className="flex flex-col gap-1.5">
            {notices.map((notice) => (
              <p
                key={notice.id}
                className="rounded-control bg-inset px-3 py-2 text-caption-1-regular text-pretty text-ink-2 shadow-hairline"
                style={{ animation: "fade-up 280ms var(--ease-out-strong) both" }}
              >
                {notice.text}
              </p>
            ))}
          </div>
        ) : null}

        {/* views */}
        {view === "trace" ? (
          <section aria-label="Agent trace">
            <AgentRunTrace
              running={running}
              elapsedMs={elapsedMs}
              settledMs={settledMs}
              progress={progress}
              sources={run.sources}
              steps={run.steps}
              activeLabel={status === "queued" ? "Queued" : status === "blocked" ? "Paused" : status === "review" ? "Awaiting approval" : "Working"}
              doneLabel={() =>
                status === "failed"
                  ? `Failed after ${durationLabel}`
                  : status === "blocked" || status === "review"
                    ? "Paused — awaiting approval"
                    : `Worked for ${durationLabel}`
              }
              finishedLabel={status === "failed" ? "Halted" : status === "blocked" ? "Paused" : "Finished"}
            />
            <AgentChips agents={run.agents} settled={!running} />
          </section>
        ) : view === "graph" ? (
          <section aria-label="Orchestration graph">
            <AgentRun
              request={graph.request}
              sources={graph.sources}
              tasks={graph.tasks}
              budgetTokens={graph.budgetTokens}
              models={defaultAgentRunModels}
              winnerId={defaultAgentRunWinnerId}
              policy={defaultAgentRunPolicy}
              autoPlay={running}
            />
          </section>
        ) : (
          <section aria-label="Run log">
            <TerminalOutput
              command={run.logCommand}
              lines={log}
              stream={status === "running"}
              streamMs={140}
              exitCode={exitCode}
              chrome="plain"
              labels={{ running: status === "blocked" || status === "review" ? "Paused" : status === "queued" ? "Queued" : "Running" }}
            />
          </section>
        )}

        {/* context folds into the scroll below xl */}
        <div className="border-t border-line-soft pt-4 xl:hidden">
          <ContextSections run={run} />
        </div>
      </div>
    </div>
  );
}
