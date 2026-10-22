"use client";

/**
 * Context rail — where the run came from and what it costs.
 * On xl+ it sits in its own column; below xl `ContextSections` folds
 * into the run detail scroll.
 */

import Link from "next/link";
import { ArrowUpRight, Sparkle } from "reicon-react";
import { TimelineFeed } from "@/components/primitives/timeline-feed";
import { PEOPLE } from "@templates/_shared/fixtures";
import { RUN_SOURCE_LABEL, STUDIO_SESSION_LABEL, runTimeline, type OpsRun } from "../data";
import { cx } from "@/lib/utils";

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1.5 text-caption-1-regular">
      <span className="w-16 shrink-0 text-ink-3">{label}</span>
      <span className={cx("min-w-0 truncate text-ink", mono && "font-mono")}>
        {value}
      </span>
    </div>
  );
}

export function ContextSections({ run }: { run: OpsRun }) {
  const requester = PEOPLE.find((p) => p.id === run.requesterId);

  return (
    <div className="flex flex-col gap-5">
      {/* Studio origin — the session that opened this run */}
      {run.studioSessionId ? (
        <section aria-label="Origin">
          <p className="text-caption-1-medium text-ink-3">Opened from</p>
          <div className="mt-2 rounded-control bg-inset px-3 py-2.5">
            <p className="flex items-center gap-1.5 text-caption-1-medium text-ink">
              <Sparkle className="size-3.5 shrink-0 text-accent-ink" aria-hidden />
              Peach Studio
            </p>
            <p className="mt-1 truncate text-caption-2-regular text-ink-3">
              Session · {STUDIO_SESSION_LABEL[run.studioSessionId]}
            </p>
            <Link
              href="/coding-agent"
              className="button-press-motion mt-2 inline-flex min-h-7 items-center gap-1 rounded-full bg-surface px-2.5 text-caption-2-medium text-ink-2 shadow-btn transition-colors hover:bg-hover hover:text-ink"
            >
              Open session in Studio
              <ArrowUpRight className="size-3" aria-hidden />
            </Link>
          </div>
        </section>
      ) : null}

      {/* details */}
      <section aria-label="Run details">
        <p className="text-caption-1-medium text-ink-3">Details</p>
        <div className="mt-1 flex flex-col divide-y divide-line-soft">
          <DetailRow label="Requested" value={requester ? requester.name : RUN_SOURCE_LABEL[run.source]} />
          <DetailRow label="Source" value={RUN_SOURCE_LABEL[run.source]} />
          <DetailRow label="Repo" value={run.repo} mono />
          <DetailRow label="Branch" value={run.branch} mono />
          <DetailRow label="Cost" value={run.cost} mono />
          <DetailRow label="Tokens" value={run.tokens} mono />
        </div>
      </section>

      {/* activity — the run's own timeline */}
      <section aria-label="Activity">
        <p className="text-caption-1-medium text-ink-3">Activity</p>
        <div className="mt-2 rounded-control bg-inset">
          <TimelineFeed chrome="plain" showHeader={false} entries={runTimeline(run)} />
        </div>
      </section>
    </div>
  );
}

export function ContextRail({ run, className }: { run: OpsRun; className?: string }) {
  return (
    <aside
      aria-label="Run context"
      className={cx(
        "w-[300px] shrink-0 overflow-y-auto rounded-window bg-surface px-4 py-4 shadow-card",
        className,
      )}
    >
      <ContextSections run={run} />
    </aside>
  );
}
