"use client";

/**
 * Peach Home — /command-center template.
 * The founder's home base, composed from the shared suite chrome:
 * DashboardSidebar as the product hub and PageMast for the greeting,
 * status chip, notification bell, and team presence. The body reads as a
 * story — a wide narrative column (overnight brief → KPIs → revenue → the
 * agent task board) beside a persistent action rail (waiting on you →
 * deploys → activity). Simulated: canned fixtures, timer-driven churn.
 */

import { useState } from "react";
import {
  BasketFilled,
  CoinsFilled,
  MoneyChangeFilled,
  UsersFilled,
} from "@/components/atoms/icons";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Chip } from "@/components/atoms/chip";
import { KanbanBoard, type KanbanCardData, type KanbanColumnData } from "@/components/blocks/kanban-board";
import { fadeUpStagger } from "@/components/lib/block-motion";
import { MorningBrief } from "@/components/blocks/morning-brief";
import { PageMast } from "@/components/blocks/page-mast";
import { AvatarStack } from "@/components/primitives/avatar-stack";
import { RevenueChartCard } from "@/components/primitives/revenue-chart-card";
import { StatCards, type Stat } from "@/components/primitives/stat-cards";
import { TimelineFeed } from "@/components/primitives/timeline-feed";
import { useMountEffect } from "@/lib/use-mount-effect";
import { PEOPLE } from "@templates/_shared/fixtures";
import {
  ACTIVITY,
  APPROVALS,
  BRIEF_ITEMS,
  BRIEF_SUMMARY,
  DEPLOY_STAGES,
  DEPLOYS,
  NOTIFICATIONS,
  REVENUE_DATA,
  STAT_META,
  STAT_TARGETS,
  TASK_COLUMNS,
  type StatTarget,
} from "./data";
import { DeploysCard } from "./components/deploys-card";
import { HomeNav } from "./components/home-nav";
import { NeedsYouCard, type ApprovalResolution, type LiveTask } from "./components/needs-you-card";
import { NotificationBell } from "./components/notification-bell";

const STAT_ICONS = [CoinsFilled, BasketFilled, UsersFilled, MoneyChangeFilled];

function formatStat(value: number, format: StatTarget["format"]) {
  if (format === "usd") return `$${value.toLocaleString("en-US")}`;
  if (format === "usd2") return `$${(value / 100).toFixed(2)}`;
  return value.toLocaleString("en-US");
}

/** Rolls every target from 0 with one rAF loop — the stat tiles count up on load. */
function useCountUpOnLoad(targets: number[], duration = 800) {
  const [display, setDisplay] = useState<number[]>(() => targets.map(() => 0));
  useMountEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setDisplay(targets);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - t0) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(targets.map((target) => Math.round(target * eased)));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  });
  return display;
}

/** Moves a card to the top of another column, patching fields like `completed`. */
function moveCard(
  columns: KanbanColumnData[],
  cardId: string,
  toColumn: string,
  patch?: Partial<KanbanCardData>,
): KanbanColumnData[] {
  const from = columns.find((col) => col.cards.some((card) => card.id === cardId));
  if (!from || from.id === toColumn) return columns;
  const card = from.cards.find((c) => c.id === cardId);
  if (!card) return columns;
  const moved = { ...card, ...patch };
  return columns.map((col) => {
    if (col.id === from.id) return { ...col, cards: col.cards.filter((c) => c.id !== cardId) };
    if (col.id === toColumn) return { ...col, cards: [moved, ...col.cards] };
    return col;
  });
}

export function CommandCenterTemplate() {
  const [navOpen, setNavOpen] = useState(false);
  const [columns, setColumns] = useState<KanbanColumnData[]>(TASK_COLUMNS);
  const [deploys, setDeploys] = useState(DEPLOYS);
  const [resolutions, setResolutions] = useState<Record<string, ApprovalResolution>>({});
  const [notices, setNotices] = useState(NOTIFICATIONS);
  const [liveTasks, setLiveTasks] = useState<LiveTask[]>([
    {
      id: "run-4216",
      title: "Nightly dependency audit",
      detail: "peach · nightly schedule",
      phase: "running",
      elapsedMs: 34_000,
    },
    {
      id: "run-4217",
      title: "Backfill search synonyms",
      detail: "stone · queued for a worker",
      phase: "idle",
      elapsedMs: 0,
    },
  ]);

  /* Fleet churn — the same beats the Ops console plays: the queued backfill
     picks up a worker, then the nightly audit settles into Done. */
  useMountEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const timers: number[] = [];
    const schedule = (fn: () => void, at: number) => {
      if (reduced) {
        fn();
        return;
      }
      timers.push(window.setTimeout(fn, at));
    };

    schedule(() => {
      setLiveTasks((tasks) =>
        tasks.map((task) =>
          task.id === "run-4217"
            ? { ...task, phase: "running", detail: "stone · worker-3" }
            : task,
        ),
      );
      setColumns((current) => moveCard(current, "run-4217", "running"));
    }, 5000);

    schedule(() => {
      setLiveTasks((tasks) =>
        tasks.map((task) =>
          task.id === "run-4216"
            ? { ...task, phase: "done", detail: "done · 1 advisory flagged" }
            : task,
        ),
      );
      setColumns((current) => moveCard(current, "run-4216", "done", { completed: "just now" }));
    }, 6400);

    if (reduced) return;
    const ticker = window.setInterval(() => {
      setLiveTasks((tasks) =>
        tasks.map((task) =>
          task.phase === "running" ? { ...task, elapsedMs: task.elapsedMs + 500 } : task,
        ),
      );
    }, 500);
    return () => {
      for (const id of timers) window.clearTimeout(id);
      window.clearInterval(ticker);
    };
  });

  /* Approvals — resolving a gate moves its card on the task board, and the
     banner approval takes deploy-4817 live. Mirrors the Ops resolution. */

  const handleResolve = (id: string, approved: boolean) => {
    const approval = APPROVALS.find((a) => a.id === id);
    if (!approval || resolutions[id]) return;
    setResolutions((current) => ({ ...current, [id]: approved ? "approved" : "denied" }));
    if (!approved) return;
    if (approval.runId === "run-4213") {
      setColumns((current) => moveCard(current, "run-4213", "done", { completed: "just now" }));
      setDeploys((current) =>
        current.map((deploy) =>
          deploy.id === "deploy-4817"
            ? { ...deploy, stage: "live", note: undefined, ago: "just now" }
            : deploy,
        ),
      );
      return;
    }
    setColumns((current) => moveCard(current, approval.runId, "running"));
  };

  /* Notifications */

  const markRead = (id: string) => {
    setNotices((current) =>
      current.map((notice) => (notice.id === id ? { ...notice, unread: false } : notice)),
    );
  };
  const markAllRead = () => {
    setNotices((current) => current.map((notice) => ({ ...notice, unread: false })));
  };

  /* derived */

  const pendingCount = APPROVALS.filter((a) => !resolutions[a.id]).length;
  const liveCount = liveTasks.filter((task) => task.phase !== "done").length;
  const deployStages = DEPLOY_STAGES.map((stage) => ({
    ...stage,
    count: deploys.filter((deploy) => deploy.stage === stage.id).length,
  }));

  const displays = useCountUpOnLoad(STAT_TARGETS.map((target) => target.target));
  const stats: Stat[] = STAT_META.map((meta, index) => ({
    icon: STAT_ICONS[index],
    label: meta.label,
    value: formatStat(displays[index], STAT_TARGETS[index].format),
    delta: meta.delta,
    deltaColor: meta.deltaColor,
    tone: meta.tone,
    figure: meta.figure,
    caption: meta.caption,
    hint: meta.hint,
  }));

  const needsYou = (
    <NeedsYouCard
      approvals={APPROVALS}
      resolutions={resolutions}
      liveTasks={liveTasks}
      onResolve={handleResolve}
    />
  );

  return (
    <div className="flex h-dvh w-full gap-2 overflow-hidden bg-page p-2 text-ink">
      {/* left rail — the shared dashboard sidebar as the product hub */}
      <HomeNav className="hidden lg:flex" pendingCount={pendingCount} />

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
            <HomeNav
              mobile
              className="h-full"
              pendingCount={pendingCount}
              onClose={() => setNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* center */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PageMast
          title="Peach Home"
          heading="Good morning, Devon"
          menuOpen={navOpen}
          onMenuClick={() => setNavOpen((open) => !open)}
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbItem>Peach</BreadcrumbItem>
              <BreadcrumbItem current>Home</BreadcrumbItem>
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
              <NotificationBell
                notices={notices}
                onMarkRead={markRead}
                onMarkAllRead={markAllRead}
              />
            </>
          }
        />

        <main aria-label="Peach Home" className="mt-2 min-h-0 flex-1 overflow-y-auto pb-2">
          <div className="flex flex-col gap-3 xl:flex-row xl:items-start">
            {/* narrative column — what happened, the numbers, the work */}
            <div className="flex min-w-0 flex-1 flex-col gap-3">
              <div style={fadeUpStagger(0)}>
                <MorningBrief summary={BRIEF_SUMMARY} items={BRIEF_ITEMS} />
              </div>
              {/* On small screens the approval queue stays right under the
                  brief; on xl it lives in the action rail. One controlled
                  card, two placements — the hidden copy never announces. */}
              <div className="xl:hidden" style={fadeUpStagger(1)}>
                {needsYou}
              </div>
              <div style={fadeUpStagger(2)}>
                <StatCards variant="footer" stats={stats} columns={4} />
              </div>
              <div style={fadeUpStagger(3)}>
                <RevenueChartCard data={REVENUE_DATA} title="Revenue" />
              </div>
              <div style={fadeUpStagger(4)}>
                <KanbanBoard
                  columns={columns}
                  onColumnsChange={setColumns}
                  notificationCount={pendingCount}
                  labels={{
                    boardTitle: "Agent tasks",
                    breadcrumbProduct: "Peach",
                    breadcrumbTeam: "Agent",
                    breadcrumbCurrent: "Task board",
                    newTicket: "New task",
                  }}
                />
              </div>
            </div>

            {/* action rail — act, ship, audit */}
            <aside className="flex min-w-0 flex-col gap-3 xl:w-[320px] xl:shrink-0">
              <div className="hidden xl:block" style={fadeUpStagger(1)}>
                {needsYou}
              </div>
              <div style={fadeUpStagger(2)}>
                <DeploysCard stages={deployStages} deploys={deploys} />
              </div>
              <div style={fadeUpStagger(3)}>
                <TimelineFeed header="Activity" entries={ACTIVITY} />
              </div>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
