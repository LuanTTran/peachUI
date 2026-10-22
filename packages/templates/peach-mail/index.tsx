"use client";

/**
 * Peach Mail — /inbox-triage template.
 * AI inbox triage: the agent handled the queue overnight; the human
 * approves drafts, makes the calls policy can't, and watches counts drop.
 * Simulated: canned fixtures, one live arrival, nothing persisted.
 */

import { useRef, useState } from "react";
import {
  Notification,
  NotificationViewport,
} from "@/components/atoms/notification";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Button } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import { PageMast } from "@/components/blocks/page-mast";
import { AvatarStack } from "@/components/primitives/avatar-stack";
import { useMountEffect } from "@/lib/use-mount-effect";
import { PEOPLE } from "@templates/_shared/fixtures";
import {
  CUSTOMERS,
  FOLDER_LABEL,
  LATE_THREAD_ID,
  STUB_SECTION_LABEL,
  THREADS,
  inFolder,
  type FolderId,
  type MailThread,
} from "./data";
import { MailNav } from "./components/mail-nav";
import { OvernightBrief } from "./components/overnight-brief";
import { ReadingPane, type ThreadUi } from "./components/reading-pane";
import { ThreadList, type ThreadListItem } from "./components/thread-list";
import { cx } from "@/lib/utils";

/* ── state ─────────────────────────────────────────────── */

function seedUi(thread: MailThread): ThreadUi {
  return {
    queue: thread.queue,
    draft: thread.ai === "draft-ready" && thread.draft ? "ready" : "idle",
    draftText: thread.draft?.body ?? "",
    draftNonce: 0,
    decisionId: undefined,
    sentBody: undefined,
    unread: thread.unread === true,
  };
}

type Toast = { id: number; title: string; description: string; kind: "success" | "information" };

const LIVE_FOLDERS = new Set<string>([
  "needs-you",
  "drafts",
  "waiting",
  "resolved",
  "snoozed",
  "all",
  "sent",
]);

/* ── template ──────────────────────────────────────────── */

export function PeachMailTemplate() {
  const [folder, setFolder] = useState<string>("needs-you");
  const [navOpen, setNavOpen] = useState(false);
  const [threadId, setThreadId] = useState("th-koda");
  const [mobileDetail, setMobileDetail] = useState(false);
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [briefDismissed, setBriefDismissed] = useState(false);
  const [lateArrived, setLateArrived] = useState(false);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [uiByThread, setUiByThread] = useState<Record<string, ThreadUi>>(() =>
    Object.fromEntries(THREADS.map((t) => [t.id, seedUi(t)])),
  );
  const timersRef = useRef<number[]>([]);
  const toastSeq = useRef(0);

  const thread = THREADS.find((t) => t.id === threadId) ?? THREADS[0];
  const ui = uiByThread[thread.id];

  /* helpers */

  const patchUi = (id: string, patch: Partial<ThreadUi>) => {
    setUiByThread((current) => ({ ...current, [id]: { ...current[id], ...patch } }));
  };

  const pushToast = (title: string, description: string, kind: Toast["kind"]) => {
    toastSeq.current += 1;
    setToasts((current) => [...current, { id: toastSeq.current, title, description, kind }]);
  };

  const schedule = (fn: () => void, delay: number) => {
    timersRef.current.push(window.setTimeout(fn, delay));
  };

  /* live arrival — one new thread lands in Needs you while you watch */

  useMountEffect(() => {
    schedule(() => {
      setLateArrived(true);
      pushToast(
        "New mail needs you",
        "Wren Optics — webhooks firing twice since this morning",
        "information",
      );
    }, 7000);
    return () => {
      for (const id of timersRef.current) window.clearTimeout(id);
      timersRef.current = [];
    };
  });

  /* derived */

  const arrived = (t: MailThread) => t.id !== LATE_THREAD_ID || lateArrived;
  const liveThreads = THREADS.filter(arrived);

  const counts = (q: FolderId) =>
    liveThreads.filter((t) => inFolder({ queue: uiByThread[t.id].queue, sent: false }, q)).length;

  const needsYouCount = counts("needs-you");
  const draftsCount = counts("drafts");
  const snoozedCount = counts("snoozed");

  const items: ThreadListItem[] = liveThreads
    .filter((t) =>
      inFolder(
        { queue: uiByThread[t.id].queue, sent: uiByThread[t.id].sentBody !== undefined },
        folder as FolderId,
      ),
    )
    .map((t) => ({
      thread: t,
      sent: uiByThread[t.id].sentBody !== undefined,
      unread: uiByThread[t.id].unread,
    }));

  /* actions */

  const draftSource = (t: MailThread): string | null => {
    const u = uiByThread[t.id];
    if (t.escalation) {
      const option = t.escalation.options.find((o) => o.id === u.decisionId);
      return option ? option.draft : null;
    }
    return t.draft?.body ?? null;
  };

  const handleSelect = (id: string) => {
    setThreadId(id);
    setMobileDetail(true);
    patchUi(id, { unread: false });
  };

  const handleFolder = (id: string) => {
    setFolder(id);
    setNavOpen(false);
    setMobileDetail(false);
    setSelectMode(false);
    setSelectedIds([]);
    // Land on something sensible in the new folder.
    const first = liveThreads.find((t) =>
      inFolder(
        { queue: uiByThread[t.id].queue, sent: uiByThread[t.id].sentBody !== undefined },
        id as FolderId,
      ),
    );
    if (first) {
      setThreadId(first.id);
      patchUi(first.id, { unread: false });
    }
  };

  const handleDraft = (id: string) => {
    const t = THREADS.find((x) => x.id === id);
    if (!t) return;
    const text = draftSource(t);
    if (text === null) return;
    setUiByThread((current) => ({
      ...current,
      [id]: {
        ...current[id],
        draft: "streaming",
        draftText: text,
        draftNonce: current[id].draftNonce + 1,
      },
    }));
  };

  const handleDecision = (id: string, optionId: string) => {
    const t = THREADS.find((x) => x.id === id);
    const option = t?.escalation?.options.find((o) => o.id === optionId);
    if (!option) return;
    setUiByThread((current) => ({
      ...current,
      [id]: {
        ...current[id],
        decisionId: optionId,
        draft: "streaming",
        draftText: option.draft,
        draftNonce: current[id].draftNonce + 1,
      },
    }));
  };

  const handleSend = (id: string, body: string) => {
    const t = THREADS.find((x) => x.id === id);
    if (!t) return;
    patchUi(id, { queue: "resolved", draft: "sent", sentBody: body, unread: false });
    setSelectedIds((ids) => ids.filter((sid) => sid !== id));
    pushToast(
      `Reply sent to ${CUSTOMERS[t.customerId].name.split(" ")[0]}`,
      `${t.subject} — moved to Resolved`,
      "success",
    );
  };

  const handleSnooze = (id: string) => {
    patchUi(id, { queue: "snoozed" });
    setSelectedIds((ids) => ids.filter((sid) => sid !== id));
    pushToast("Thread snoozed", "It returns to Needs you tomorrow morning.", "information");
  };

  const handleArchive = (id: string) => {
    patchUi(id, { queue: "resolved" });
    setSelectedIds((ids) => ids.filter((sid) => sid !== id));
    pushToast("Thread archived", "Moved to Resolved without a reply.", "information");
  };

  const handleReopen = (id: string) => {
    patchUi(id, { queue: "needs-you", draft: "idle" });
    pushToast("Thread reopened", "Back in Needs you.", "information");
  };

  const handleUnsnooze = (id: string) => {
    patchUi(id, { queue: "needs-you" });
  };

  /* bulk */

  const bulkTargets = () => selectedIds.map((id) => id);

  const handleBulkSend = () => {
    let sent = 0;
    for (const id of bulkTargets()) {
      const u = uiByThread[id];
      const t = THREADS.find((x) => x.id === id);
      if (u.draft === "ready" && t) {
        patchUi(id, { queue: "resolved", draft: "sent", sentBody: u.draftText, unread: false });
        sent += 1;
      }
    }
    setSelectedIds([]);
    if (sent > 0) {
      pushToast(
        `${sent} ${sent === 1 ? "draft" : "drafts"} sent`,
        "Threads moved to Resolved.",
        "success",
      );
    }
  };

  const handleBulkSnooze = () => {
    for (const id of bulkTargets()) patchUi(id, { queue: "snoozed" });
    const n = selectedIds.length;
    setSelectedIds([]);
    if (n > 0) pushToast(`${n} ${n === 1 ? "thread" : "threads"} snoozed`, "They return tomorrow morning.", "information");
  };

  const handleBulkArchive = () => {
    for (const id of bulkTargets()) patchUi(id, { queue: "resolved" });
    const n = selectedIds.length;
    setSelectedIds([]);
    if (n > 0) pushToast(`${n} ${n === 1 ? "thread" : "threads"} archived`, "Moved to Resolved.", "information");
  };

  const isLiveFolder = LIVE_FOLDERS.has(folder);
  const folderLabel = FOLDER_LABEL[folder as FolderId] ?? STUB_SECTION_LABEL[folder] ?? "Mail";

  const showBrief =
    !briefDismissed && (folder === "needs-you" || folder === "all") && needsYouCount > 0;

  return (
    <div className="flex h-dvh w-full gap-2 overflow-hidden bg-page p-2 text-ink">
      {/* left rail — the shared dashboard sidebar block */}
      <MailNav
        className="hidden lg:flex"
        activeFolder={folder}
        onFolderChange={handleFolder}
        needsYouCount={needsYouCount}
        draftsCount={draftsCount}
        snoozedCount={snoozedCount}
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
            <MailNav
              mobile
              className="h-full"
              activeFolder={folder}
              onFolderChange={handleFolder}
              needsYouCount={needsYouCount}
              draftsCount={draftsCount}
              snoozedCount={snoozedCount}
              onClose={() => setNavOpen(false)}
            />
          </div>
        </div>
      ) : null}

      {/* center */}
      <div className="flex min-w-0 flex-1 flex-col">
        <PageMast
          title={folderLabel}
          heading={folderLabel}
          menuOpen={navOpen}
          onMenuClick={() => setNavOpen((open) => !open)}
          breadcrumb={
            <Breadcrumb>
              <BreadcrumbItem onClick={() => handleFolder("needs-you")}>
                Peach Mail
              </BreadcrumbItem>
              {isLiveFolder ? (
                <>
                  <BreadcrumbItem onClick={() => setMobileDetail(false)}>
                    {folderLabel}
                  </BreadcrumbItem>
                  <BreadcrumbItem current>
                    <span className="min-w-0 truncate">{thread.subject}</span>
                  </BreadcrumbItem>
                </>
              ) : (
                <BreadcrumbItem current>{folderLabel}</BreadcrumbItem>
              )}
            </Breadcrumb>
          }
          actions={
            <>
              <Chip
                role="status"
                variant="caption"
                color={needsYouCount > 0 ? "yellow" : "neutral"}
                className="hidden gap-1.5 rounded-full sm:inline-flex"
              >
                {needsYouCount > 0 ? (
                  <span
                    className="size-1.5 shrink-0 rounded-full bg-warning"
                    style={{ animation: "status-breathe 1.6s ease-in-out infinite" }}
                    aria-hidden
                  />
                ) : null}
                {needsYouCount > 0 ? `${needsYouCount} need you` : "Inbox clear"}
              </Chip>
              <AvatarStack
                items={PEOPLE.map((p) => ({ name: p.name }))}
                size="xs"
                max={3}
                className="hidden md:flex"
              />
            </>
          }
        />

        {isLiveFolder ? (
          <div className="mt-2 flex min-h-0 flex-1 gap-2">
            <ThreadList
              items={items}
              activeId={thread.id}
              onSelect={handleSelect}
              selectedIds={selectedIds}
              onSelectedIdsChange={setSelectedIds}
              selectMode={selectMode}
              onSelectModeChange={setSelectMode}
              onBulkSend={handleBulkSend}
              onBulkSnooze={handleBulkSnooze}
              onBulkArchive={handleBulkArchive}
              brief={
                showBrief ? (
                  <OvernightBrief
                    needsYou={needsYouCount}
                    onDismiss={() => setBriefDismissed(true)}
                  />
                ) : undefined
              }
              className={cx("w-[320px] shrink-0", mobileDetail && "max-lg:hidden")}
            />
            <main
              aria-label="Reading pane"
              className={cx(
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-window bg-surface shadow-card",
                !mobileDetail && "max-lg:hidden",
              )}
            >
              <ReadingPane
                key={thread.id}
                thread={thread}
                ui={ui}
                onDraft={() => handleDraft(thread.id)}
                onStreamDone={() => patchUi(thread.id, { draft: "ready" })}
                onRegenerate={() => handleDraft(thread.id)}
                onDismissDraft={() => patchUi(thread.id, { draft: "idle" })}
                onSend={(body) => handleSend(thread.id, body)}
                onDecision={(optionId) => handleDecision(thread.id, optionId)}
                onSnooze={() => handleSnooze(thread.id)}
                onArchive={() => handleArchive(thread.id)}
                onReopen={() => handleReopen(thread.id)}
                onUnsnooze={() => handleUnsnooze(thread.id)}
              />
            </main>
          </div>
        ) : (
          <main
            className="mt-2 flex min-h-0 flex-1 items-center justify-center rounded-window bg-surface px-6 shadow-card"
            aria-label="Section"
          >
            <div className="max-w-[320px] text-center">
              <p className="text-section-title text-ink">{STUB_SECTION_LABEL[folder]}</p>
              <p className="mt-2 text-body-regular text-pretty text-ink-3">
                This surface isn&apos;t part of the demo. The inbox lives in the queues.
              </p>
              <Button
                variant="secondary"
                size="small"
                onClick={() => handleFolder("needs-you")}
                className="mt-3"
              >
                Back to Needs you
              </Button>
            </div>
          </main>
        )}
      </div>

      {/* toasts */}
      <NotificationViewport position="bottom-end">
        {toasts.map((toast) => (
          <Notification
            key={toast.id}
            status={toast.kind}
            title={toast.title}
            description={toast.description}
            autoDismissDuration={4200}
            onDismiss={() =>
              setToasts((current) => current.filter((t) => t.id !== toast.id))
            }
          />
        ))}
      </NotificationViewport>
    </div>
  );
}
