"use client";

/**
 * Deploy pipeline — PipelineStrip picks a stage, the rows below show the
 * deploys sitting in it. Deploy ids link back to the Ops console.
 */

import { useState } from "react";
import Link from "next/link";
import { Rocket } from "reicon-react";
import { StatusDot, type StatusDotColor } from "@/components/atoms/status-dot";
import {
  PipelineStrip,
  type PipelineStage,
} from "@/components/primitives/pipeline-strip";
import type { DeployStageId, HomeDeploy } from "../data";
import { cx } from "@/lib/utils";

const STAGE_DOT: Record<DeployStageId, StatusDotColor> = {
  queued: "yellow",
  building: "indigo",
  live: "green",
  failed: "red",
};

function DeployRow({ deploy }: { deploy: HomeDeploy }) {
  return (
    <li className="flex min-w-0 items-center gap-2.5 px-3 py-2">
      <StatusDot
        color={STAGE_DOT[deploy.stage]}
        pulse={deploy.stage === "building"}
      />
      <span className="min-w-0 flex-1">
        <span className="block truncate text-body-2-medium text-ink">
          {deploy.label}
        </span>
        <span className="block truncate text-caption-1-regular text-ink-3">
          <Link
            href="/agent-ops"
            className="font-mono tabular-nums text-ink-3 underline decoration-line-strong underline-offset-2 transition-colors hover:text-ink"
          >
            {deploy.id}
          </Link>
          <span aria-hidden> · </span>
          {deploy.repo} · {deploy.ref}
          {deploy.note ? (
            <>
              <span aria-hidden> · </span>
              {deploy.note}
            </>
          ) : null}
        </span>
      </span>
      <span className="shrink-0 text-caption-2-regular tabular-nums text-ink-3">
        {deploy.ago}
      </span>
    </li>
  );
}

export function DeploysCard({
  stages,
  deploys,
  className,
}: {
  stages: PipelineStage[];
  deploys: HomeDeploy[];
  className?: string;
}) {
  const [stage, setStage] = useState<DeployStageId>("queued");
  const rows = deploys.filter((deploy) => deploy.stage === stage);
  const label = stages.find((s) => s.id === stage)?.label ?? stage;

  return (
    <section
      aria-label="Deploy pipeline"
      className={cx(
        "flex min-w-0 flex-col rounded-window bg-surface shadow-card",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-line-soft px-3 py-2.5">
        <h3 className="flex items-center gap-1.5 text-body-medium text-ink">
          <Rocket className="size-4 text-ink-3" aria-hidden />
          Deploys
        </h3>
        <Link
          href="/agent-ops"
          className="text-caption-1-regular text-ink-3 transition-colors hover:text-ink"
        >
          All deploys
        </Link>
      </div>

      <div className="px-3 pt-3">
        <PipelineStrip
          stages={stages}
          activeId={stage}
          onActiveChange={(id) => setStage(id as DeployStageId)}
        />
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto pb-1 pt-1">
        {rows.length > 0 ? (
          <ul className="divide-y divide-line-soft" aria-label={`${label} deploys`}>
            {rows.map((deploy) => (
              <DeployRow key={deploy.id} deploy={deploy} />
            ))}
          </ul>
        ) : (
          <p className="px-3 py-4 text-caption-1-regular text-ink-3">
            Nothing {label.toLowerCase()} right now.
          </p>
        )}
      </div>
    </section>
  );
}
