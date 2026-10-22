"use client";

/**
 * PeachUI — DeployGate (block)
 * @tier block
 * @deps button, terminal-output, loading-state, motion
 * @requires app/globals.css
 *
 * CI/CD safety: a deploy streams in the terminal, the failure opens a
 * permission gate, and the rollback runs only after approval.
 */

import { useCallback, useMemo, useState, type ReactNode } from "react";
import { AlertTriangle, Check, Refresh, ShieldCheck, Undo } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { LoadingState } from "@/components/primitives/loading-state";
import { ShimmerText } from "@/components/primitives/agent-log";
import {
  TerminalOutput,
  type TerminalLine,
} from "@/components/primitives/terminal-output";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

const STREAM_MS = 240;

const DEPLOY_LINES: TerminalLine[] = [
  { text: "$ shipit deploy --env production", tone: "muted" },
  { text: "deploy-4817 · v0.4.2 · a9f3c21" },
  { text: "Building bundle…", tone: "muted" },
  { text: "✓ 214 tests passed", tone: "success" },
  { text: "✓ pushed to production", tone: "success" },
  { text: "awaiting health check on /api/ready…", tone: "muted" },
];

const FAILURE_LINES: TerminalLine[] = [
  { text: "✗ health check failed — /api/ready returned 503", tone: "error" },
  { text: "error rate 12% · threshold 2%", tone: "error" },
  { text: "holding traffic on deploy-4816", tone: "muted" },
];

const ROLLBACK_LINES: TerminalLine[] = [
  { text: "$ shipit rollback --to deploy-4816", tone: "muted" },
  { text: "draining deploy-4817…", tone: "muted" },
  { text: "✓ traffic shifted to deploy-4816", tone: "success" },
  { text: "✓ health check green", tone: "success" },
];

const RELEASE_COMMITS = [
  { sha: "a9f3c21", title: "Catalog pricing tokens" },
  { sha: "f82b104", title: "Deploy gate block" },
  { sha: "17c0a9d", title: "Bump motion to v12" },
];

type Stage = "deploy" | "failed" | "gate" | "denied" | "rollback" | "rolled-back";

const RAIL_LABEL: Record<Stage, string> = {
  deploy: "Release",
  failed: "Failure",
  gate: "Approval",
  denied: "Denied",
  rollback: "Rollback",
  "rolled-back": "Result",
};

const FOOTER_STATUS: Record<Stage, { outcome: string; subject: string }> = {
  deploy: { outcome: "Deploying", subject: "deploy-4817 → production" },
  failed: { outcome: "Failed", subject: "health check on deploy-4817" },
  gate: { outcome: "Awaiting approval", subject: "deploy.rollback" },
  denied: { outcome: "Denied", subject: "deploy-4816 keeps serving" },
  rollback: { outcome: "Rolling back", subject: "deploy-4816" },
  "rolled-back": { outcome: "Rolled back", subject: "deploy-4816 live" },
};

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function DetailRow({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-baseline gap-3 py-1 text-caption-1-regular">
      <span className="w-14 shrink-0 text-ink-3">{label}</span>
      <span className={cx("min-w-0 truncate", mono ? "font-mono text-ink" : "text-ink")}>
        {value}
      </span>
    </div>
  );
}

function RollbackGate({ onResolve }: { onResolve: (allowed: boolean) => void }) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-inset text-ink shadow-hairline"
          aria-hidden
        >
          <ShieldCheck className="size-[18px]" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="text-body-medium text-pretty text-ink">
            Roll back to deploy-4816?
          </h3>
          <p className="mt-0.5 truncate text-caption-1-regular text-ink-3">
            deploy.rollback · this session
          </p>
        </div>
      </div>

      <div className="rounded-lg bg-canvas px-3 py-3">
        <p className="text-body-2-regular text-pretty text-ink-2">
          Shifts production traffic back to the previous deploy and quarantines
          deploy-4817.
        </p>
        <div className="mt-3 flex flex-col border-t border-line-soft pt-3">
          <DetailRow label="Traffic" value="production → deploy-4816" mono />
          <DetailRow label="Write" value="deploy.rollback" mono />
          <DetailRow label="Reverts" value="deploy-4817" mono />
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="small" type="button" onClick={() => onResolve(false)}>
          Deny
        </Button>
        <Button variant="secondary" size="small" type="button" onClick={() => onResolve(true)}>
          Allow once
        </Button>
        <Button variant="primary" size="small" type="button" onClick={() => onResolve(true)}>
          Always allow
        </Button>
      </div>
    </div>
  );
}

export type DeployGateProps = {
  className?: string;
};

export function DeployGate({ className }: DeployGateProps) {
  const reducedMotion = useReducedMotion();
  const [stage, setStage] = useState<Stage>("deploy");
  const [cycle, setCycle] = useState(0);

  const logPhase =
    stage === "deploy"
      ? "deploy"
      : stage === "rollback" || stage === "rolled-back"
        ? "rollback"
        : "failed";

  const lines = useMemo(
    () =>
      logPhase === "rollback"
        ? [...DEPLOY_LINES, ...FAILURE_LINES, ...ROLLBACK_LINES]
        : logPhase === "failed"
          ? [...DEPLOY_LINES, ...FAILURE_LINES]
          : DEPLOY_LINES,
    [logPhase],
  );

  const exitCode =
    logPhase === "failed"
      ? 1
      : logPhase === "rollback"
        ? stage === "rolled-back"
          ? 0
          : null
        : null;

  const onLogDone = useCallback(() => {
    setStage((current) => (current === "rollback" ? "rolled-back" : current));
  }, []);

  const redeploy = () => {
    setCycle((current) => current + 1);
    setStage("deploy");
  };

  const status = FOOTER_STATUS[stage];
  const inFlight = stage === "deploy" || stage === "rollback";

  const cta =
    stage === "deploy"
      ? {
          label: "Simulate failed deploy",
          variant: "primary" as const,
          icon: AlertTriangle,
          onClick: () => setStage("failed"),
        }
      : stage === "failed"
        ? {
            label: "Roll back",
            variant: "primary" as const,
            icon: Undo,
            onClick: () => setStage("gate"),
          }
        : stage === "gate"
          ? { label: "Roll back", variant: "primary" as const, icon: Undo, disabled: true }
          : stage === "denied"
            ? {
                label: "Review rollback",
                variant: "secondary" as const,
                onClick: () => setStage("gate"),
              }
            : stage === "rollback"
              ? { label: "Rolling back", variant: "primary" as const, disabled: true }
              : {
                  label: "Redeploy",
                  variant: "secondary" as const,
                  icon: Refresh,
                  onClick: redeploy,
                };

  return (
    <section
      aria-label="Deploy gate"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Deploy gate</h2>
            <Swap
              swapKey={stage === "deploy" ? "shipping" : "live"}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2"
            >
              {stage === "deploy"
                ? "deploy-4817 → production"
                : "deploy-4816 · production"}
            </Swap>
          </div>

          <p className="text-body-regular text-pretty text-ink-2">
            Shipping v0.4.2 to production. If the health check fails, the
            rollback asks first.
          </p>

          <TerminalOutput
            key={cycle}
            command="shipit deploy --env production"
            lines={lines}
            stream
            streamMs={STREAM_MS}
            exitCode={exitCode}
            onDone={onLogDone}
            chrome="plain"
          />
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">{RAIL_LABEL[stage]}</p>
          <Swap
            swapKey={stage}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {stage === "deploy" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    deploy-4817
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1.5 rounded-full bg-canvas px-2 py-0.5 text-caption-1-medium text-ink-2">
                    <span className="size-1.5 rounded-full bg-accent" aria-hidden />
                    production
                  </span>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  v0.4.2 · three commits from main
                </p>
                <ul className="flex flex-col gap-1 rounded-lg bg-canvas p-1.5">
                  {RELEASE_COMMITS.map((commit) => (
                    <li
                      key={commit.sha}
                      className="flex items-baseline gap-2.5 rounded-md px-2 py-1.5"
                    >
                      <span className="shrink-0 font-mono text-caption-1-regular text-ink-3">
                        {commit.sha}
                      </span>
                      <span className="min-w-0 truncate text-body-2-regular text-ink">
                        {commit.title}
                      </span>
                    </li>
                  ))}
                </ul>
                <p className="text-caption-1-regular text-ink-3">
                  Traffic stays on deploy-4816 until the health check passes.
                </p>
              </>
            ) : stage === "failed" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    Health check failed
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-red-muted px-2 py-0.5 text-caption-1-medium text-red">
                    Failed
                  </span>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  deploy-4817 · /api/ready returned 503
                </p>
                <div className="flex flex-col rounded-lg bg-canvas px-3 py-2">
                  <DetailRow label="Observed" value="12% errors · threshold 2%" mono />
                  <DetailRow label="Check" value="/api/ready" mono />
                  <DetailRow label="Live" value="deploy-4816" mono />
                </div>
                <p className="text-caption-1-regular text-ink-3">
                  Nothing was lost — deploy-4816 still serves production traffic.
                </p>
              </>
            ) : stage === "gate" ? (
              <RollbackGate onResolve={(allowed) => setStage(allowed ? "rollback" : "denied")} />
            ) : stage === "denied" ? (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">Rollback denied.</p>
                <p className="text-body-regular text-ink-2">
                  deploy-4816 keeps serving. Fix forward, or review the rollback
                  again.
                </p>
              </div>
            ) : stage === "rollback" ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    Restoring deploy-4816
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center rounded-full bg-canvas px-2 py-0.5 text-caption-1-medium text-ink-2">
                    approved
                  </span>
                </div>
                <div className="rounded-lg bg-canvas px-3 py-3">
                  <LoadingState label="Rolling back" variant="Dots" />
                  <p className="mt-2 text-body-2-regular text-pretty text-ink-2">
                    Traffic is shifting back. deploy-4817 stays quarantined for
                    inspection.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                    deploy-4816 live
                  </h3>
                  <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 rounded-full bg-green-muted px-2 py-0.5 text-caption-1-medium text-green">
                    <Check className="size-3" aria-hidden />
                    Done
                  </span>
                </div>
                <p className="text-body-2-regular text-ink-2">
                  Rollback finished. deploy-4817 is quarantined for inspection.
                </p>
                <div className="flex flex-col rounded-lg bg-canvas px-3 py-2">
                  <DetailRow label="Traffic" value="deploy-4816" mono />
                  <DetailRow label="Health" value="green" mono />
                  <DetailRow label="Reverted" value="deploy-4817" mono />
                </div>
              </>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={stage} reduced={reducedMotion} className="truncate">
            <span className="text-body-medium text-ink">
              {inFlight ? <ShimmerText>{status.outcome}</ShimmerText> : status.outcome}
            </span>
            <span className="text-ink-3"> · </span>
            <span className="text-ink-2">{status.subject}</span>
          </Swap>
        </div>
        <Button
          variant={cta.variant}
          size="small"
          leadingIcon={"icon" in cta ? cta.icon : undefined}
          onClick={"onClick" in cta ? cta.onClick : undefined}
          disabled={"disabled" in cta ? cta.disabled : false}
          className="shrink-0"
        >
          {cta.label}
        </Button>
      </footer>
    </section>
  );
}
