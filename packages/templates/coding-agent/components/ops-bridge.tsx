"use client";

/**
 * Runs section — the bridge to Peach Ops.
 * These sessions run on the Peach Agent fleet; Ops is where they're
 * supervised. Links out to the /agent-ops template.
 */

import Link from "next/link";
import { ArrowUpRight } from "reicon-react";
import { buttonStyles } from "@/components/atoms/button";
import { StatusDot, type StatusDotColor } from "@/components/atoms/status-dot";
import { cx } from "@/lib/utils";

const FLEET_RUNS: { id: string; title: string; status: string; note: string; tone: StatusDotColor }[] = [
  {
    id: "run-4213",
    title: "Free-shipping banner",
    status: "Needs approval",
    note: "Waiting on deploy.production",
    tone: "yellow",
  },
  {
    id: "run-4211",
    title: "Investigate flaky checkout test",
    status: "Blocked",
    note: "Paused on a secrets.read gate",
    tone: "yellow",
  },
  {
    id: "run-4209",
    title: "Migrate buttons to new tokens",
    status: "Done",
    note: "deploy-4814 live",
    tone: "green",
  },
];

export function OpsBridge() {
  return (
    <div className="flex flex-1 items-center justify-center px-6">
      <div className="w-full max-w-[440px]">
        <p className="text-section-title text-ink">Supervised in Peach Ops</p>

        <ul className="mt-5 divide-y divide-line-soft overflow-hidden rounded-card bg-surface text-left shadow-card">
          {FLEET_RUNS.map((run) => (
            <li key={run.id} className="flex items-center gap-3 px-4 py-3">
              <span className="min-w-0 flex-1">
                <span className="block truncate text-body-2-medium text-ink">{run.title}</span>
                <span className="mt-0.5 block truncate text-caption-1-regular text-ink-3">
                  <span className="font-mono text-caption-2-regular">{run.id}</span>
                  <span aria-hidden> · </span>
                  {run.note}
                </span>
              </span>
              <span className="flex shrink-0 items-center gap-1.5 text-caption-1-regular text-ink-2">
                <StatusDot color={run.tone} />
                {run.status}
              </span>
            </li>
          ))}
        </ul>

        <Link
          href="/agent-ops"
          className={cx(buttonStyles.base, buttonStyles.size.small, buttonStyles.variant.secondary, "mt-4")}
        >
          <span className={buttonStyles.label.small}>Open Peach Ops</span>
          <ArrowUpRight className={buttonStyles.icon.small} aria-hidden />
        </Link>
      </div>
    </div>
  );
}
