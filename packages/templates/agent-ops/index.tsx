"use client";

/**
 * Peach Ops — /agent-ops template.
 * Air-traffic control for the same Peach Agent that works in Studio,
 * composed entirely from PeachUI primitives and blocks: DashboardSidebar
 * + PageMast chrome, a three-pane Runs surface (list → detail with a
 * Trace/Graph/Log switcher → context rail), and real section surfaces —
 * ToolApproval, DeployGate, AuditExplorer, DataGrid, StatCards, LiveLine,
 * TimelineFeed. Simulated: canned fixtures, timer-driven churn.
 */

import { useRef, useState } from "react";
import { SidebarRight } from "reicon-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Chip } from "@/components/atoms/chip";
import { IconButton } from "@/components/atoms/icon-button";
import { PageMast } from "@/components/blocks/page-mast";
import { AvatarStack } from "@/components/primitives/avatar-stack";
import type { TerminalLine } from "@/components/primitives/terminal-output";
import { useMountEffect } from "@/lib/use-mount-effect";
import { PEOPLE } from "@templates/_shared/fixtures";
import {
  RUNS,
  SECTION_LABELS,
  type ApprovalState,
  type OpsApproval,
  type OpsRun,
  type RunFilter,
  type RunStatus,
} from "./data";
import { ApprovalsPanel } from "./components/approvals-panel";
import { ContextRail } from "./components/context-rail";
import { DeploysPanel } from "./components/deploys-panel";
import { EnvsPanel } from "./components/envs-panel";
import { OpsNav } from "./components/ops-nav";
import { OverviewPanel } from "./components/overview-panel";
import { PoliciesPanel } from "./components/policies-panel";
import { SecretsPanel } from "./components/secrets-panel";
import { RunDetail, type RunNotice } from "./components/run-detail";
import { RunList, type RunListItem } from "./components/run-list";
import { cx } from "@/lib/utils";

/* ── state ─────────────────────────────────────────────── */

type RunUi = {
  status: RunStatus;
  /** Trace reveal — 0 (queued) through 4 (full). */
  progress: number;
  elapsedMs: number;
  settledMs?: number;
  log: TerminalLine[];
  approvals: Record<string, ApprovalState>;
  resolutions: Record<string, string>;
  notices: RunNotice[];
};

const SETTLED_PROGRESS = 4;

/** 34.0s under a minute; "4m 13s" above it. */
function formatRunTime(ms: number): string {
  if (ms < 60_000) return `${(ms / 1000).toFixed(1)}s`;
  const minutes = Math.floor(ms / 60_000);
  const seconds = Math.round((ms % 60_000) / 1000);
  return `${minutes}m ${seconds}s`;
}

function seedUi(run: OpsRun): RunUi {
  const settled = run.status === "done" || run.status === "failed";
  const paused = run.status === "review" || run.status === "blocked";
  return {
    status: run.status,
    progress: settled || paused ? SETTLED_PROGRESS : run.status === "running" ? 1 : 0,
    elapsedMs: run.elapsedSeed ?? 0,
    settledMs: undefined,
    log: run.log,
    approvals: {},
    resolutions: {},
    notices: [],
  };
}

/* Churn — extra log lines the fleet streams while you watch. */

const AUDIT_STREAM: { at: number; progress?: number; line: TerminalLine }[] = [
  { at: 1500, progress: 2, line: { text: "diffing 214 deps against the advisory feed…", tone: "muted" } },
  { at: 3000, progress: 3, line: { text: "⚠ lodash.pick 4.4.0 — moderate advisory" } },
  { at: 4600, progress: 4, line: { text: "✓ report drafted — 1 advisory, 213 clean", tone: "success" } },
  { at: 6200, line: { text: "✓ posted to #ops", tone: "success" } },
];

const BACKFILL_STREAM: { at: number; progress?: number; status?: RunStatus; line: TerminalLine }[] = [
  { at: 5000, status: "running", line: { text: "picked up by worker-3 · slot freed", tone: "muted" } },
  { at: 5400, line: { text: "$ peach run backfill --index synonyms --repo peach-ui/stone", tone: "muted" } },
  { at: 7000, progress: 1, line: { text: "reading synonym map…", tone: "muted" } },
  { at: 9000, progress: 2, line: { text: "✓ 1,204 terms diffed — 312 pairs to write", tone: "success" } },
];

/* ── template ──────────────────────────────────────────── */

export function AgentOpsTemplate() {
  const [section, setSection] = useState("runs");
  const [navOpen, setNavOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [filter, setFilter] = useState<RunFilter>("all");
  const [runId, setRunId] = useState("run-4213");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [uiByRun, setUiByRun] = useState<Record<string, RunUi>>(() =>
    Object.fromEntries(RUNS.map((run) => [run.id, seedUi(run)])),
  );
  const timersRef = useRef<number[]>([]);
  const elapsedTimerRef = useRef<number | null>(null);

  const run = RUNS.find((r) => r.id === runId) ?? RUNS[0];
  const ui = uiByRun[run.id];

  /* timers */

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
    if (elapsedTimerRef.current) window.clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = null;
  };

  const schedule = (fn: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  };

  const patchUi = (id: string, patch: Partial<RunUi>) => {
    setUiByRun((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  const appendLog = (id: string, lines: TerminalLine[]) => {
    setUiByRun((current) => ({
      ...current,
      [id]: { ...current[id], log: [...current[id].log, ...lines] },
    }));
  };

  /* fleet churn — queued runs pick up, running runs settle */

  useMountEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) {
      // Skip the ticker; land on the post-churn state immediately.
      setUiByRun((current) => ({
        ...current,
        "run-4216": {
          ...current["run-4216"],
          status: "done",
          progress: SETTLED_PROGRESS,
          settledMs: 52_000,
          log: [...current["run-4216"].log, ...AUDIT_STREAM.map((s) => s.line)],
        },
        "run-4217": {
          ...current["run-4217"],
          status: "running",
          progress: 2,
          log: [...current["run-4217"].log, ...BACKFILL_STREAM.map((s) => s.line)],
        },
      }));
      return clearTimers;
    }

    elapsedTimerRef.current = window.setInterval(() => {
      setUiByRun((current) =>
        Object.fromEntries(
          Object.entries(current).map(([id, u]) => [
            id,
            u.status === "running" ? { ...u, elapsedMs: u.elapsedMs + 500 } : u,
          ]),
        ),
      );
    }, 500);

    for (const step of AUDIT_STREAM) {
      schedule(() => {
        if (step.progress) patchUi("run-4216", { progress: step.progress });
        appendLog("run-4216", [step.line]);
      }, step.at);
    }
    schedule(() => {
      setUiByRun((current) => {
        const u = current["run-4216"];
        return {
          ...current,
          "run-4216": { ...u, status: "done", settledMs: u.elapsedMs },
        };
      });
    }, 6400);

    for (const step of BACKFILL_STREAM) {
      schedule(() => {
        if (step.status) patchUi("run-4217", { status: step.status });
        if (step.progress) patchUi("run-4217", { progress: step.progress });
        appendLog("run-4217", [step.line]);
      }, step.at);
    }

    return clearTimers;
  });

  /* approvals */

  const findApproval = (approvalId: string): { run: OpsRun; approval: OpsApproval } | null => {
    for (const r of RUNS) {
      const approval = r.approvals.find((a) => a.id === approvalId);
      if (approval) return { run: r, approval };
    }
    return null;
  };

  const handleResolve = (approvalId: string, approved: boolean) => {
    const found = findApproval(approvalId);
    if (!found) return;
    const { run: target, approval } = found;
    const targetUi = uiByRun[target.id];
    const state: ApprovalState = approved ? "approved" : "denied";
    const lines = approved ? approval.onApproveLines : approval.onDenyLines;
    const noticeText = approved ? approval.approveNotice : approval.denyNotice;

    patchUi(target.id, {
      approvals: { ...targetUi.approvals, [approvalId]: state },
      resolutions: {
        ...targetUi.resolutions,
        [approvalId]: `${approved ? "Approved" : "Denied"} by devon.lau · just now`,
      },
      status: approved ? "running" : "blocked",
      log: [...targetUi.log, ...(lines ?? [])],
      notices: noticeText
        ? [...targetUi.notices, { id: `${approvalId}-${state}`, text: noticeText }]
        : targetUi.notices,
    });

    if (approved) {
      schedule(() => {
        setUiByRun((current) => {
          const u = current[target.id];
          return {
            ...current,
            [target.id]: { ...u, status: "done", settledMs: u.elapsedMs },
          };
        });
      }, 1800);
    }
  };

  /* selection */

  const handleSelectRun = (id: string) => {
    setRunId(id);
    setSection("runs");
    setMobileDetail(true);
    setNavOpen(false);
  };

  const handleSectionChange = (id: string) => {
    setSection(id);
    setNavOpen(false);
    if (id === "runs") setMobileDetail(false);
  };

  /* derived */

  const effectiveApprovals = (r: OpsRun): OpsApproval[] =>
    r.approvals.map((a) => ({ ...a, state: uiByRun[r.id].approvals[a.id] ?? a.state }));

  const pendingCount = RUNS.reduce(
    (sum, r) => sum + effectiveApprovals(r).filter((a) => a.state === "pending").length,
    0,
  );
  const liveCount = RUNS.filter((r) => {
    const s = uiByRun[r.id].status;
    return s === "queued" || s === "running";
  }).length;

  const durationOf = (r: OpsRun): string => {
    const u = uiByRun[r.id];
    if (u.status === "running") return formatRunTime(u.elapsedMs);
    if (u.status === "queued") return "queued";
    if (u.status === "done" || u.status === "failed")
      return r.durationLabel !== "—" ? r.durationLabel : formatRunTime(u.settledMs ?? u.elapsedMs);
    return "paused";
  };

  const items: RunListItem[] = RUNS.map((r) => ({
    run: r,
    status: uiByRun[r.id].status,
    durationLabel: durationOf(r),
  }));

  const sectionLabel = SECTION_LABELS[section] ?? "Runs";

  return (
    <div className="flex h-dvh w-full gap-2 overflow-hidden bg-page p-2 text-ink">
      {/* left rail — the shared dashboard sidebar block */}
      <OpsNav
        className="hidden lg:flex"
        activeSection={section}
        onSectionChange={handleSectionChange}
        pendingCount={pendingCount}
        liveCount={liveCount}
      />

      {/* mobile nav sheet */}
      {navOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 cursor-pointer bg-ink/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="relative flex h-full p-3">
            <OpsNav
              mobile
              className="h-full"
              activeSection={section}
              onSectionChange={handleSectionChange}
              pendingCount={pendingCount}
              liveCount={liveCount}
              onClose={() => setNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* center */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PageMast
          title={sectionLabel}
          heading={sectionLabel}
          menuOpen={navOpen}
          onMenuClick={() => setNavOpen((open) => !open)}
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbItem onClick={() => handleSectionChange("overview")}>
                Peach Ops
              </BreadcrumbItem>
              {section === "runs" ? (
                <>
                  <BreadcrumbItem
                    current={!mobileDetail}
                    onClick={() => setMobileDetail(false)}
                  >
                    Runs
                  </BreadcrumbItem>
                  {mobileDetail ? (
                    <BreadcrumbItem current>
                      <span className="min-w-0 truncate">{run.title}</span>
                    </BreadcrumbItem>
                  ) : null}
                </>
              ) : (
                <BreadcrumbItem current>{sectionLabel}</BreadcrumbItem>
              )}
            </Breadcrumb>
          }
          actions={
            <>
              <Chip
                role="status"
                variant="caption"
                color={pendingCount > 0 ? "yellow" : "neutral"}
                className="hidden gap-1.5 rounded-full sm:inline-flex"
              >
                {pendingCount > 0 ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-warning"
                    style={{ animation: "status-breathe 1.6s ease-in-out infinite" }}
                    aria-hidden
                  />
                ) : null}
                {pendingCount > 0 ? `${pendingCount} waiting on you` : `${liveCount} live`}
              </Chip>
              <AvatarStack
                items={PEOPLE.map((p) => ({ name: p.name }))}
                size="xs"
                max={3}
                className="hidden md:flex"
              />
              {section === "runs" ? (
                <IconButton
                  icon={SidebarRight}
                  size="small"
                  aria-label={panelOpen ? "Hide context panel" : "Show context panel"}
                  aria-pressed={panelOpen}
                  onClick={() => setPanelOpen((open) => !open)}
                  className={cx(panelOpen && "border-line-strong bg-hover-2")}
                />
              ) : null}
            </>
          }
        />

        {section === "runs" ? (
          <div className="mt-2 flex min-h-0 flex-1 gap-2">
            <RunList
              items={items}
              filter={filter}
              onFilterChange={setFilter}
              activeId={run.id}
              onSelect={handleSelectRun}
              className={cx("w-[320px] shrink-0", mobileDetail && "max-lg:hidden")}
            />
            <main
              aria-label="Run detail"
              className={cx(
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-window bg-surface shadow-card",
                !mobileDetail && "max-lg:hidden",
              )}
            >
              <RunDetail
                key={run.id}
                run={run}
                status={ui.status}
                progress={ui.progress}
                elapsedMs={ui.elapsedMs}
                settledMs={ui.settledMs}
                durationLabel={durationOf(run)}
                log={ui.log}
                notices={ui.notices}
                approvals={effectiveApprovals(run)}
                resolutions={ui.resolutions}
                onResolveApproval={handleResolve}
              />
            </main>
            {panelOpen ? <ContextRail run={run} className="max-xl:hidden" /> : null}
          </div>
        ) : (
          <main
            className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2"
            aria-label={sectionLabel}
          >
            {section === "overview" ? <OverviewPanel liveCount={liveCount} pendingCount={pendingCount} runCount={RUNS.length} /> : null}
            {section === "approvals" ? <ApprovalsPanel /> : null}
            {section === "deploys" ? <DeploysPanel /> : null}
            {section === "envs" ? <EnvsPanel /> : null}
            {section === "secrets" ? <SecretsPanel /> : null}
            {section === "policies" ? <PoliciesPanel /> : null}
          </main>
        )}
      </div>
    </div>
  );
}
