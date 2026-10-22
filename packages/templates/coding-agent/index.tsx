"use client";

/**
 * Peach Studio — /coding-agent template.
 * Devin-style chat-first shell: nav rail, thread, workspace panel.
 * Simulated: canned fixtures, timer-driven run, nothing persisted.
 */

import { useRef, useState, useSyncExternalStore } from "react";
import { ImageSparkle, Search, TestTube } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { fadeUpStagger } from "@/components/lib/block-motion";
import { PromptDeck } from "@/components/blocks/prompt-deck";
import { AgentComposer } from "@/components/primitives/agent-composer";
import { useMountEffect } from "@/lib/use-mount-effect";
import {
  APPROVED_NOTE,
  BANNER_ANSWER,
  BANNER_DIFF,
  BANNER_DIFF_B,
  BANNER_FILE,
  BANNER_RUN,
  CANNED_TURNS,
  GENERIC_ANSWER,
  HEADER_FILE,
  PAGE_FILE,
  REPO,
  REVISION_NOTE,
  SESSIONS,
  STUDIO_CATALOG,
  SUGGESTIONS,
  WORKSPACE_SEEDS,
  type AgentRun,
  type DiffPatch,
  type SessionStatus,
  type StudioFile,
  type Turn,
} from "./data";
import { ChatThread, type LiveRun } from "./components/chat-thread";
import { ColumnResizeHandle } from "./components/column-resize-handle";
import { OpsBridge } from "./components/ops-bridge";
import { StudioNav } from "./components/studio-nav";
import { TopBar, type RunStatus } from "./components/top-bar";
import { WorkspacePanel, type PanelTab } from "./components/workspace-panel";

/* ── state ─────────────────────────────────────────────── */

type Phase = "idle" | "running" | "answered";
type DiffStatus = "none" | "pending" | "approved" | "changes";

type SessionUi = {
  turns: Turn[];
  phase: Phase;
  progress: number;
  elapsedMs: number;
  settledMs?: number;
  streaming: boolean;
  sendCount: number;
  diff: DiffPatch | null;
  diffStatus: DiffStatus;
  diffVariant: "a" | "b";
  files: StudioFile[];
  openFileId: string;
  previewBanner: boolean;
  previewBadge: boolean;
};

const GENERIC_RUN: AgentRun = {
  steps: ["Read the request", "Queued it behind the current task"],
  sources: [{ id: "g1", label: "session context" }],
  agents: ["triage"],
  workedFor: "2.1s",
};

const EDITED_FILES = [HEADER_FILE, BANNER_FILE, PAGE_FILE];

function seedUi(id: string): SessionUi {
  const seed = WORKSPACE_SEEDS[id] ?? WORKSPACE_SEEDS.banner;
  return {
    turns: CANNED_TURNS[id] ?? [],
    phase: "idle",
    progress: 0,
    elapsedMs: 0,
    streaming: false,
    sendCount: 0,
    diff: seed.diff,
    diffStatus: seed.diffStatus,
    diffVariant: "a",
    files: seed.files,
    openFileId: seed.openFileId,
    previewBanner: seed.previewBanner,
    previewBadge: false,
  };
}

const SUGGESTION_ICONS = [ImageSparkle, Search, TestTube] as const;

/* resizable shell columns (desktop) */

const NAV_MIN = 200;
const NAV_DEFAULT = 248;
const NAV_MAX = 360;
/** Sidebar block's icon rail: 1px border + 11px padding + 36px items. */
const NAV_COLLAPSED = 60;
const PANEL_MIN = 320;
const PANEL_DEFAULT = 420;
const PANEL_MAX = 640;
/** Keep the center thread usable once both side columns are on screen. */
const CENTER_MIN = 480;

const subscribeViewportWidth = (onChange: () => void) => {
  window.addEventListener("resize", onChange);
  return () => window.removeEventListener("resize", onChange);
};

const SECTION_LABELS: Record<string, string> = {
  home: "Home",
  runs: "Runs",
  changes: "Changes",
  repos: "Repos",
  envs: "Environments",
  workflows: "Workflows",
};

/* ── template ──────────────────────────────────────────── */

export function CodingAgentTemplate() {
  const [section, setSection] = useState("chat");
  const [navOpen, setNavOpen] = useState(false);
  const [panelOpen, setPanelOpen] = useState(true);
  const [mobilePanelOpen, setMobilePanelOpen] = useState(false);
  const [panelTab, setPanelTab] = useState<PanelTab>("code");
  const [sessionId, setSessionId] = useState("banner");
  const [uiBySession, setUiBySession] = useState<Record<string, SessionUi>>(() =>
    Object.fromEntries(SESSIONS.map((session) => [session.id, seedUi(session.id)])),
  );
  const [draftSeed, setDraftSeed] = useState<string | undefined>();
  const [draftSeedVersion, setDraftSeedVersion] = useState(0);
  const [navWidth, setNavWidth] = useState(NAV_DEFAULT);
  const [navCollapsed, setNavCollapsed] = useState(false);
  const [panelWidth, setPanelWidth] = useState(PANEL_DEFAULT);
  const viewportWidth = useSyncExternalStore(
    subscribeViewportWidth,
    () => window.innerWidth,
    () => 1440,
  );
  const timersRef = useRef<number[]>([]);
  const elapsedTimerRef = useRef<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const ui = uiBySession[sessionId];
  const session = SESSIONS.find((s) => s.id === sessionId) ?? SESSIONS[0];
  const running = ui.phase === "running";

  // Collapsing only swaps the shown width — the user's chosen width survives.
  const navShown = navCollapsed ? NAV_COLLAPSED : navWidth;

  // The workspace caps itself so the thread keeps CENTER_MIN px; the stored
  // width is the user's intent, restored when the viewport grows again.
  const panelMax = Math.max(PANEL_MIN, Math.min(PANEL_MAX, viewportWidth - navShown - CENTER_MIN));
  const panelShown = Math.min(panelWidth, panelMax);

  const liveRun: LiveRun | undefined =
    ui.phase !== "idle"
      ? {
          turnId: `run-${ui.sendCount}`,
          running,
          progress: ui.progress,
          elapsedMs: ui.elapsedMs,
          settledMs: ui.settledMs,
          streaming: ui.streaming,
        }
      : undefined;

  const status: RunStatus = running
    ? "running"
    : ui.diffStatus === "pending"
      ? "review"
      : ui.diffStatus === "approved"
        ? "done"
        : session.status === "done"
          ? "done"
          : session.status === "blocked"
            ? "blocked"
            : "idle";

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

  useMountEffect(() => clearTimers);

  const scrollToBottom = () => {
    requestAnimationFrame(() => {
      const el = scrollRef.current;
      if (el) el.scrollTop = el.scrollHeight;
    });
  };

  const patchUi = (id: string, patch: Partial<SessionUi>) => {
    setUiBySession((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  /* run lifecycle */

  /** Bring an in-flight run to its settled state (used on session switch). */
  const settleSession = (id: string) => {
    const s = uiBySession[id];
    if (s.phase !== "running") return;
    patchUi(id, { phase: "answered", progress: 4, settledMs: 4800, streaming: false });
    applyAfterRun(id, s);
  };

  /** Side effects once a run settles: staged diff + panel auto-drive. */
  const applyAfterRun = (id: string, s: SessionUi) => {
    if (id !== "banner" || s.sendCount !== 1 || s.diffStatus !== "none") return;
    patchUi(id, {
      diff: BANNER_DIFF,
      diffStatus: "pending",
      files: EDITED_FILES,
      openFileId: "header",
    });
    if (id === sessionId) {
      setPanelOpen(true);
      setPanelTab("code");
    }
  };

  const handleSend = (text: string) => {
    const prompt = text.trim();
    if (!prompt || running) return;
    clearTimers();

    const sendCount = ui.sendCount + 1;
    const isBannerTask = sessionId === "banner" && sendCount === 1;
    const run = isBannerTask ? BANNER_RUN : GENERIC_RUN;
    const answer = isBannerTask ? BANNER_ANSWER : GENERIC_ANSWER;

    const userTurn: Turn = { id: `u-${sendCount}`, role: "user", text: prompt };
    const agentTurn: Turn = {
      id: `run-${sendCount}`,
      role: "agent",
      text: answer,
      run,
      reviewLink: isBannerTask,
    };

    const nextUi: SessionUi = {
      ...ui,
      turns: [...ui.turns, userTurn, agentTurn],
      phase: "running",
      progress: 0,
      elapsedMs: 0,
      settledMs: undefined,
      streaming: false,
      sendCount,
    };
    patchUi(sessionId, nextUi);
    scrollToBottom();

    const settle = () => {
      setUiBySession((current) => {
        const s = current[sessionId];
        const settled = { ...s, phase: "answered" as Phase, settledMs: 4800, streaming: true };
        const withEffects =
          sessionId === "banner" && s.sendCount === 1 && s.diffStatus === "none"
            ? { ...settled, diff: BANNER_DIFF, diffStatus: "pending" as DiffStatus, files: EDITED_FILES, openFileId: "header" }
            : settled;
        return { ...current, [sessionId]: withEffects };
      });
      setPanelOpen(true);
      setPanelTab("code");
      scrollToBottom();
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setUiBySession((current) => {
        const s = current[sessionId];
        return { ...current, [sessionId]: { ...s, progress: run.steps.length, elapsedMs: 4800 } };
      });
      settle();
      setUiBySession((current) => {
        const s = current[sessionId];
        return { ...current, [sessionId]: { ...s, streaming: false } };
      });
      return;
    }

    const started = performance.now();
    elapsedTimerRef.current = window.setInterval(() => {
      patchUi(sessionId, { elapsedMs: Math.floor(performance.now() - started) });
    }, 200);

    schedule(() => patchUi(sessionId, { progress: 1 }), 500);
    schedule(() => patchUi(sessionId, { progress: 2 }), 1400);
    schedule(() => patchUi(sessionId, { progress: 3 }), 2600);
    schedule(() => patchUi(sessionId, { progress: 4 }), 3600);
    schedule(() => {
      if (elapsedTimerRef.current) window.clearInterval(elapsedTimerRef.current);
      elapsedTimerRef.current = null;
      settle();
    }, 4400);
  };

  /* diff resolution */

  const handleApprove = () => {
    patchUi(sessionId, { diffStatus: "approved" });
    schedule(() => {
      patchUi(sessionId, { previewBanner: true, previewBadge: true });
      const noteTurn: Turn = {
        id: `note-${ui.sendCount}-approved`,
        role: "agent",
        text: APPROVED_NOTE,
      };
      setUiBySession((current) => {
        const s = current[sessionId];
        return { ...current, [sessionId]: { ...s, turns: [...s.turns, noteTurn] } };
      });
      scrollToBottom();
    }, 600);
  };

  const handleRequestChanges = () => {
    if (ui.diffVariant === "b") {
      patchUi(sessionId, { diffStatus: "changes" });
      return;
    }
    patchUi(sessionId, { diffStatus: "changes" });
    schedule(() => {
      const noteTurn: Turn = {
        id: `note-${ui.sendCount}-revision`,
        role: "agent",
        text: REVISION_NOTE,
      };
      setUiBySession((current) => {
        const s = current[sessionId];
        return {
          ...current,
          [sessionId]: {
            ...s,
            turns: [...s.turns, noteTurn],
            diff: BANNER_DIFF_B,
            diffVariant: "b" as const,
            diffStatus: "pending" as DiffStatus,
          },
        };
      });
      scrollToBottom();
    }, 900);
  };

  /* navigation */

  const handleSessionChange = (id: string) => {
    if (id === sessionId) return;
    clearTimers();
    settleSession(sessionId);
    setSessionId(id);
    setSection("chat");
    setNavOpen(false);
  };

  const handleSectionChange = (id: string) => {
    setSection(id);
    setNavOpen(false);
  };

  const handleNewSession = () => {
    clearTimers();
    setUiBySession((current) => ({ ...current, banner: seedUi("banner") }));
    setSessionId("banner");
    setSection("chat");
    setNavOpen(false);
  };

  const handleReview = () => {
    setPanelOpen(true);
    setMobilePanelOpen(true);
    setPanelTab("code");
  };

  const handleOpenPreview = (tab: PanelTab) => {
    setPanelTab(tab);
    if (tab === "preview") patchUi(sessionId, { previewBadge: false });
  };

  const sessionStatusList = SESSIONS.map((s) =>
    s.id === "banner" && uiBySession.banner.diffStatus === "approved"
      ? { ...s, status: "done" as SessionStatus }
      : s,
  );

  const workspacePanel = (mobile: boolean) => (
    <WorkspacePanel
      tab={panelTab}
      onTabChange={handleOpenPreview}
      onClose={mobile ? () => setMobilePanelOpen(false) : () => setPanelOpen(false)}
      files={ui.files}
      openFileId={ui.openFileId}
      onOpenFile={(id) => patchUi(sessionId, { openFileId: id })}
      diff={ui.diff}
      diffStatus={ui.diffStatus}
      onApprove={handleApprove}
      onRequestChanges={handleRequestChanges}
      previewBanner={ui.previewBanner}
      previewBadge={ui.previewBadge}
      className={mobile ? "h-full" : "my-3 me-3 shrink-0 max-lg:hidden"}
      style={mobile ? { width: "100%" } : { width: panelShown }}
    />
  );

  return (
    <div className="flex h-dvh w-full gap-1.5 overflow-hidden bg-page text-ink">
      {/* left rail — floating sidebar card */}
      <div className="hidden h-full shrink-0 py-3 ps-3 lg:block">
        <StudioNav
          activeSection={section}
          onSectionChange={handleSectionChange}
          sessions={sessionStatusList}
          activeSessionId={sessionId}
          onSessionChange={handleSessionChange}
          onNewSession={handleNewSession}
          collapsed={navCollapsed}
          onCollapsedChange={setNavCollapsed}
          style={{ width: navShown }}
        />
      </div>
      {navCollapsed ? null : (
        <ColumnResizeHandle
          side="nav"
          label="Resize sidebar"
          width={navWidth}
          min={NAV_MIN}
          max={NAV_MAX}
          defaultWidth={NAV_DEFAULT}
          onResize={setNavWidth}
        />
      )}

      {/* mobile nav sheet */}
      {navOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setNavOpen(false)}
          />
          <div className="relative h-full w-[min(100%,304px)] p-3">
            <StudioNav
              mobile
              activeSection={section}
              onSectionChange={handleSectionChange}
              sessions={sessionStatusList}
              activeSessionId={sessionId}
              onSessionChange={handleSessionChange}
              onNewSession={handleNewSession}
              onClose={() => setNavOpen(false)}
              style={{ width: "100%" }}
            />
          </div>
        </div>
      ) : null}

      {/* center */}
      <div className="flex min-w-0 flex-1 flex-col">
        <TopBar
          sessionTitle={section === "chat" ? session.title : (SECTION_LABELS[section] ?? session.title)}
          repo={REPO.name}
          branch={REPO.branch}
          status={status}
          panelOpen={panelOpen || mobilePanelOpen}
          onMenu={() => setNavOpen(true)}
          onHome={() => handleSectionChange("chat")}
          onTogglePanel={() => {
            setPanelOpen((open) => !open);
            setMobilePanelOpen((open) => !open);
          }}
        />

        <div className="flex min-h-0 flex-1 gap-1.5">
          <main className="flex min-w-0 flex-1 flex-col" aria-label="Session">
            {section === "chat" ? (
              <>
                <div ref={scrollRef} className="min-h-0 flex-1 overflow-y-auto">
                  {ui.turns.length === 0 ? (
                    <div className="mx-auto flex min-h-full w-full max-w-[720px] flex-col items-center justify-center px-4 py-10">
                      <h1 className="text-section-title text-ink">What should we build?</h1>

                      <PromptDeck
                        className="mt-6 max-w-[640px]"
                        variant="Rounded"
                        tall
                        placeholder="Ask Peach Agent, or @ to add context"
                        catalog={STUDIO_CATALOG}
                        draftSeed={draftSeed}
                        draftSeedVersion={draftSeedVersion}
                        disabled={running}
                        onSend={(text) => handleSend(text)}
                        branch={REPO.branch}
                        showConnectApps={false}
                        menusFlipUp="auto"
                      />

                      <div
                        className="mt-4 flex flex-col items-center"
                        role="group"
                        aria-label="Suggested prompts"
                      >
                        {SUGGESTIONS.map((suggestion, index) => {
                          const SuggestionIcon = SUGGESTION_ICONS[index] ?? Search;
                          return (
                            <button
                              key={suggestion}
                              type="button"
                              onClick={() => {
                                setDraftSeed(suggestion);
                                setDraftSeedVersion((v) => v + 1);
                              }}
                              className="inline-flex min-h-8 items-center gap-2 rounded-full bg-surface px-3 text-meta text-ink-2 shadow-hairline transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
                              style={fadeUpStagger(index)}
                            >
                              <SuggestionIcon className="size-3.5 text-ink-3" aria-hidden />
                              {suggestion}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ) : (
                    <ChatThread
                      turns={ui.turns}
                      live={liveRun}
                      onStreamDone={() => patchUi(sessionId, { streaming: false })}
                      onStreamTick={scrollToBottom}
                      onReview={handleReview}
                    />
                  )}
                </div>

                {ui.turns.length > 0 ? (
                  <footer className="shrink-0 px-3 pb-3 pt-1 sm:px-4">
                    <div className="mx-auto w-full max-w-[680px]">
                      <AgentComposer
                        variant="Rounded"
                        portalMenus
                        menusFlipUp="auto"
                        placeholder="Ask Peach Agent, or @ to add context"
                        catalog={STUDIO_CATALOG}
                        draftSeed={draftSeed}
                        draftSeedVersion={draftSeedVersion}
                        disabled={running}
                        onSend={(text) => handleSend(text)}
                        beamActive={running}
                      />
                    </div>
                  </footer>
                ) : null}
              </>
            ) : section === "runs" ? (
              <OpsBridge />
            ) : (
              <div className="flex flex-1 items-center justify-center px-6">
                <div className="max-w-[320px] text-center">
                  <p className="text-section-title text-ink">{SECTION_LABELS[section]}</p>
                  <Button
                    variant="secondary"
                    size="small"
                    onClick={() => setSection("chat")}
                    className="mt-3"
                  >
                    Back to Chat
                  </Button>
                </div>
              </div>
            )}
          </main>

          {/* desktop workspace column */}
          {panelOpen ? (
            <>
              <ColumnResizeHandle
                side="panel"
                label="Resize workspace panel"
                width={panelShown}
                min={PANEL_MIN}
                max={panelMax}
                defaultWidth={PANEL_DEFAULT}
                onResize={setPanelWidth}
              />
              {workspacePanel(false)}
            </>
          ) : null}
        </div>
      </div>

      {/* mobile workspace overlay */}
      {mobilePanelOpen ? (
        <div className="fixed inset-0 z-40 lg:hidden">
          <button
            type="button"
            aria-label="Close workspace"
            className="absolute inset-0 bg-ink/40"
            onClick={() => setMobilePanelOpen(false)}
          />
          <div className="absolute inset-y-0 right-0 w-[min(100%,420px)] p-3">{workspacePanel(true)}</div>
        </div>
      ) : null}
    </div>
  );
}
