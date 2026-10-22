"use client";

/**
 * Reading pane — conversation, sender + linked-work context, and the
 * agent zone at the bottom (escalation, draft bar, draft, sent record).
 */

import Link from "next/link";
import type { ComponentType, ReactNode } from "react";
import {
  AlarmClock,
  Archive,
  ArrowUpRight,
  CheckRead,
  PenSparkle,
  Reply,
  Sparkle,
} from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Button, buttonStyles } from "@/components/atoms/button";
import { Chip } from "@/components/atoms/chip";
import {
  AGENT_STATUS_COLOR,
  AGENT_STATUS_LABEL,
  CUSTOMERS,
  type MailMessage,
  type MailThread,
} from "../data";
import { EscalationCard } from "./escalation-card";
import { ReplyDraft } from "./reply-draft";
import { cx } from "@/lib/utils";

export type ThreadUi = {
  queue: MailThread["queue"];
  /** idle → streaming → ready → sent */
  draft: "idle" | "streaming" | "ready" | "sent";
  draftText: string;
  /** Bumps on each draft request so StreamText re-runs for identical text. */
  draftNonce: number;
  decisionId?: string;
  sentBody?: string;
  unread: boolean;
};

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

function AgentAvatar() {
  return (
    <span
      className="grid size-6 shrink-0 place-items-center rounded-full bg-violet-muted text-violet"
      aria-hidden
    >
      <Sparkle className="size-3" />
    </span>
  );
}

/** Settled-queue strip at the foot of the pane — icon, message, action. */
function StatusRow({
  icon: StatusIcon,
  iconClassName,
  children,
  action,
}: {
  icon: Icon;
  iconClassName?: string;
  children: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-panel bg-canvas px-3 py-2.5">
      <p className="flex items-center gap-2 text-body-2-regular text-ink-2">
        <StatusIcon className={cx("size-4 text-ink-3", iconClassName)} aria-hidden />
        {children}
      </p>
      {action}
    </div>
  );
}

function MessageRow({ message, thread }: { message: MailMessage; thread: MailThread }) {
  const customer = CUSTOMERS[thread.customerId];

  if (message.from === "note") {
    return (
      <div className="mx-auto max-w-[520px] rounded-panel border border-dashed border-line bg-canvas/60 px-3 py-2">
        <p className="flex items-center gap-1.5 text-caption-2-medium text-violet">
          <Sparkle className="size-3 shrink-0" aria-hidden />
          {message.author} · triage note · {message.ago}
        </p>
        {message.body.map((para, i) => (
          <p key={i} className="mt-1 text-caption-1-regular text-ink-2">
            {para}
          </p>
        ))}
      </div>
    );
  }

  const isAgent = message.from === "agent";
  const isYou = message.from === "you";

  return (
    <div className="flex items-start gap-2.5">
      {isAgent ? (
        <AgentAvatar />
      ) : (
        <Avatar
          size="sm"
          color={isYou ? "blue" : customer.color}
          initials={isYou ? "ST" : customer.initials}
        />
      )}
      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-baseline gap-x-2">
          <span className="text-body-2-medium text-ink">
            {isYou ? "You" : message.author}
          </span>
          {isAgent ? (
            <span className="text-caption-2-medium text-violet">auto-replied</span>
          ) : null}
          <span className="text-caption-2-regular text-ink-3">{message.ago}</span>
        </p>
        <div
          className={cx(
            "mt-1 rounded-panel px-3 py-2.5 shadow-hairline",
            isAgent ? "bg-violet-muted/30" : isYou ? "bg-accent-muted/40" : "bg-canvas",
          )}
        >
          {message.body.map((para, i) => (
            <p
              key={i}
              className={cx("text-body-regular text-pretty text-ink", i > 0 && "mt-2")}
            >
              {para}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}

export function ReadingPane({
  thread,
  ui,
  onDraft,
  onStreamDone,
  onRegenerate,
  onDismissDraft,
  onSend,
  onDecision,
  onSnooze,
  onArchive,
  onReopen,
  onUnsnooze,
}: {
  thread: MailThread;
  ui: ThreadUi;
  onDraft: () => void;
  onStreamDone: () => void;
  onRegenerate: () => void;
  onDismissDraft: () => void;
  onSend: (body: string) => void;
  onDecision: (optionId: string) => void;
  onSnooze: () => void;
  onArchive: () => void;
  onReopen: () => void;
  onUnsnooze: () => void;
}) {
  const customer = CUSTOMERS[thread.customerId];
  const decided = thread.escalation?.options.find((o) => o.id === ui.decisionId);
  const draftHint = decided
    ? `Your call: ${decided.label}`
    : thread.draft?.hint;

  const messages: MailMessage[] = ui.sentBody
    ? [
        ...thread.messages,
        {
          id: `${thread.id}-sent`,
          from: "you",
          author: "Suki Tan",
          ago: "just now",
          body: [ui.sentBody],
        },
      ]
    : thread.messages;

  const settled = ui.queue === "resolved" || ui.queue === "snoozed";

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col">
      {/* thread header */}
      <div className="flex shrink-0 items-start gap-3 border-b border-line-soft px-4 py-3">
        <div className="min-w-0 flex-1">
          <h1 className="text-headline-semibold text-pretty text-ink">
            {thread.subject}
          </h1>
          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <Chip variant="caption" color={AGENT_STATUS_COLOR[thread.ai]}>
              {AGENT_STATUS_LABEL[thread.ai]}
            </Chip>
            {thread.vip ? (
              <Chip variant="caption" color="rose">
                VIP
              </Chip>
            ) : null}
            <span className="text-caption-2-regular text-ink-3">
              {customer.name} · {customer.org}
            </span>
          </div>
        </div>
        {!settled ? (
          <div className="flex shrink-0 items-center gap-1">
            <Button variant="secondary" size="small" leadingIcon={AlarmClock} onClick={onSnooze}>
              Snooze
            </Button>
            <Button variant="secondary" size="small" leadingIcon={Archive} onClick={onArchive}>
              Archive
            </Button>
          </div>
        ) : null}
      </div>

      {/* conversation */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto flex max-w-[720px] flex-col gap-4">
          {/* sender context */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 rounded-panel bg-canvas px-3 py-2">
            <span className="text-caption-1-medium text-ink">{customer.org}</span>
            <span className="text-caption-1-regular text-ink-3">{customer.plan}</span>
            <span className="font-mono text-caption-1-regular text-ink-3">{customer.handle}</span>
          </div>

          {/* linked Studio work */}
          {thread.studioLink ? (
            <div className="rounded-panel bg-canvas px-3 py-2.5">
              <p className="flex items-center gap-1.5 text-caption-1-medium text-ink">
                <Sparkle className="size-3.5 shrink-0 text-accent-ink" aria-hidden />
                Peach Studio · linked work
              </p>
              <p className="mt-1 truncate text-caption-1-regular text-ink-3">
                {thread.studioLink.sessionLabel} · {thread.studioLink.runId} ·{" "}
                {thread.studioLink.status}
              </p>
              <Link
                href="/coding-agent"
                className={cx(
                  buttonStyles.base,
                  buttonStyles.size.small,
                  buttonStyles.variant.secondary,
                  "mt-2",
                )}
              >
                <span className={buttonStyles.label.small}>Open in Studio</span>
                <ArrowUpRight className={buttonStyles.icon.small} aria-hidden />
              </Link>
            </div>
          ) : null}

          {messages.map((message) => (
            <MessageRow key={message.id} message={message} thread={thread} />
          ))}
        </div>
      </div>

      {/* agent zone */}
      <div className="shrink-0 border-t border-line-soft px-4 py-3">
        <div className="mx-auto max-w-[720px]">
          {ui.queue === "snoozed" ? (
            <StatusRow
              icon={AlarmClock}
              action={
                <Button variant="secondary" size="small" onClick={onUnsnooze}>
                  Unsnooze
                </Button>
              }
            >
              Snoozed — returns tomorrow morning.
            </StatusRow>
          ) : ui.draft === "sent" ? (
            <StatusRow
              icon={CheckRead}
              iconClassName="text-green"
              action={
                <Button variant="secondary" size="small" onClick={onReopen}>
                  Reopen
                </Button>
              }
            >
              Reply sent — thread resolved.
            </StatusRow>
          ) : ui.queue === "resolved" ? (
            <StatusRow
              icon={CheckRead}
              iconClassName="text-green"
              action={
                <Button variant="secondary" size="small" onClick={onReopen}>
                  Reopen
                </Button>
              }
            >
              Resolved{thread.ai === "auto-handled" ? " — handled by Peach Agent." : "."}
            </StatusRow>
          ) : ui.queue === "waiting" && ui.draft === "idle" ? (
            <StatusRow
              icon={Reply}
              action={
                thread.draft ? (
                  <Button variant="secondary" size="small" onClick={onDraft}>
                    Draft a follow-up
                  </Button>
                ) : undefined
              }
            >
              Waiting on {customer.name.split(" ")[0]} — agent replied {thread.ago}.
            </StatusRow>
          ) : ui.draft === "streaming" || ui.draft === "ready" ? (
            <ReplyDraft
              phase={ui.draft}
              hint={draftHint}
              text={ui.draftText}
              streamKey={ui.draftNonce}
              onStreamDone={onStreamDone}
              onRegenerate={onRegenerate}
              onDismiss={onDismissDraft}
              onSend={onSend}
            />
          ) : thread.escalation && ui.decisionId === undefined ? (
            <EscalationCard
              summary={thread.escalation.summary}
              policy={thread.escalation.policy}
              options={thread.escalation.options}
              chosenId={ui.decisionId}
              onChoose={onDecision}
            />
          ) : thread.draft || thread.escalation ? (
            <div className="flex items-center justify-between gap-3 rounded-panel border border-dashed border-line bg-canvas/60 px-3 py-2.5">
              <p className="flex items-center gap-2 text-body-2-regular text-ink-2">
                <PenSparkle className="size-4 text-violet" aria-hidden />
                Peach Agent can draft this reply.
              </p>
              <Button variant="secondary" size="small" onClick={onDraft}>
                Draft a reply
              </Button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
