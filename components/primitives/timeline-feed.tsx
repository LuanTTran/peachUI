"use client";


import { cx } from "@/lib/utils";

export type TimelineActor = "human" | "system" | "agent";

export type TimelineEntry = {
  id: string;
  title: string;
  detail?: string;
  time: string;
  actor?: TimelineActor;
};

const DEFAULT_ENTRIES: TimelineEntry[] = [
  {
    id: "1",
    title: "Policy export opened",
    detail: "studio.peach-ui.dev/audit",
    time: "08:41",
    actor: "human",
  },
  {
    id: "2",
    title: "Bulk deny rule applied",
    detail: "12 principals",
    time: "09:02",
    actor: "system",
  },
  {
    id: "3",
    title: "Agent reviewed flagged logins",
    detail: "3 sessions",
    time: "09:15",
    actor: "agent",
  },
  {
    id: "4",
    title: "Retention window extended",
    detail: "90 → 180 days",
    time: "09:22",
    actor: "human",
  },
];

function actorDotClass(actor: TimelineEntry["actor"]) {
  if (actor === "agent") return "bg-accent";
  if (actor === "human") return "bg-accent";
  return "bg-ink-3";
}

export type TimelineFeedProps = {
  entries?: TimelineEntry[];
  header?: string;
  className?: string;
  variant?: string;
  chrome?: "card" | "plain";
  showHeader?: boolean;
};

export function TimelineFeed({
  entries = DEFAULT_ENTRIES,
  header = "Audit log",
  className,
  chrome = "card",
  showHeader = true,
}: TimelineFeedProps = {}) {
  return (
    <div
      className={cx(
        "w-full",
        chrome === "card" && "overflow-hidden rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      {showHeader ? (
        <div className="border-b border-line px-3 py-2.5">
          <h3 className="text-body font-semibold text-ink">{header}</h3>
        </div>
      ) : null}
      <ol className="relative px-3 py-2">
        {entries.map((entry, i) => (
          <li key={entry.id} className="relative flex gap-3 pb-4 last:pb-2">
            {i < entries.length - 1 ? (
              <span
                className="absolute left-[5px] top-3 h-[calc(100%-4px)] w-px bg-line"
                aria-hidden
              />
            ) : null}
            <span
              className={cx("relative z-[1] mt-1 size-2.5 shrink-0 rounded-full", actorDotClass(entry.actor))}
              aria-hidden
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-2">
                <span className="text-body font-medium text-ink">{entry.title}</span>
                <time className="shrink-0 font-mono text-micro tabular-nums text-ink-3">{entry.time}</time>
              </div>
              {entry.detail ? <p className="mt-0.5 text-caption text-ink-3">{entry.detail}</p> : null}
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}
