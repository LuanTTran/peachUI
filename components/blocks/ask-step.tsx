"use client";

/**
 * PeachUI — AskStep (block)
 * @tier block
 * @deps button, checkbox, avatar, agent-inline-chips, kbd
 * @requires app/globals.css
 *
 * Human-in-the-loop approval: one action, metadata, deny or approve.
 */

import { useState } from "react";
import { Envelope } from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Kbd } from "@/components/atoms/kbd";
import { RiskChip } from "@/components/primitives/agent-inline-chips";
import { cx } from "@/lib/utils";

export type AskStepRecipient = {
  id: string;
  initials: string;
  color?: "neutral" | "blue" | "lime" | "pink";
};

export type AskStepMetaRow = {
  label: string;
  value: string;
};

export type AskStepLabels = {
  deny: string;
  approve: string;
  alwaysAllow: string;
  assistantLead: string;
};

export const defaultAskStepLabels: AskStepLabels = {
  deny: "Deny",
  approve: "Approve",
  alwaysAllow: "Always allow this action",
  assistantLead: "Ready when you are",
};

export type AskStepVariant = "standalone" | "embedded";

export type AskStepProps = {
  className?: string;
  variant?: AskStepVariant;
  assistantMessage?: string;
  title: string;
  subtitle?: string;
  riskLevel?: "low" | "medium" | "high";
  recipients?: AskStepRecipient[];
  recipientsSummary?: string;
  meta?: AskStepMetaRow[];
  defaultAlwaysAllow?: boolean;
  labels?: Partial<AskStepLabels>;
  onDeny?: () => void;
  onApprove?: (options: { alwaysAllow: boolean }) => void;
};

const DEFAULT_RECIPIENTS: AskStepRecipient[] = [
  { id: "m", initials: "M", color: "blue" },
  { id: "j", initials: "J", color: "lime" },
  { id: "s", initials: "S", color: "pink" },
  { id: "a", initials: "A", color: "neutral" },
];

export function AskStep({
  className,
  variant = "standalone",
  assistantMessage = "I drafted the October newsletter. Ready to send?",
  title,
  subtitle,
  riskLevel = "medium",
  recipients = DEFAULT_RECIPIENTS,
  recipientsSummary = "Mia, Jonas, Sara, Alex +38 more",
  meta,
  defaultAlwaysAllow = false,
  labels: labelsProp,
  onDeny,
  onApprove,
}: AskStepProps) {
  const labels = { ...defaultAskStepLabels, ...labelsProp };
  const [alwaysAllow, setAlwaysAllow] = useState(defaultAlwaysAllow);
  const embedded = variant === "embedded";

  const rows: AskStepMetaRow[] =
    meta ??
    [
      { label: "Subject", value: "What's new in October" },
      { label: "Send", value: "Today, 9:00 AM" },
    ];

  return (
    <div className={cx("w-full max-w-[480px]", className)}>
      {assistantMessage ? (
        <p className="mb-3 max-w-[42ch] text-body text-pretty text-ink-2">{assistantMessage}</p>
      ) : null}

      <div
        className={cx(
          embedded ? "rounded-panel border border-line bg-surface" : "rounded-card border border-line bg-surface shadow-card",
        )}
      >
        <div className="flex items-start gap-3 border-b border-line-soft px-3 py-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-control bg-inset text-ink shadow-hairline"
            aria-hidden
          >
            <Envelope className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-body-strong text-balance text-ink">{title}</h3>
            {subtitle ? <p className="mt-0.5 truncate text-caption text-ink-3">{subtitle}</p> : null}
          </div>
          <RiskChip level={riskLevel} />
        </div>

        <div className="mx-3 my-3 rounded-panel bg-canvas px-3 py-3">
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex -space-x-1.5" aria-hidden>
              {recipients.map((r) => (
                <Avatar key={r.id} size="sm" initials={r.initials} color={r.color} className="ring-2 ring-canvas" />
              ))}
            </div>
            <p className="min-w-0 text-caption text-ink-2">{recipientsSummary}</p>
          </div>
          <div className="mt-3 border-t border-line-soft pt-3">
            {rows.map((row) => (
              <div key={row.label} className="flex gap-3 py-1 text-caption">
                <span className="w-14 shrink-0 text-ink-3">{row.label}</span>
                <span className="min-w-0 text-ink">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="border-t border-line-soft px-3 py-2.5">
          <Checkbox size="sm" isSelected={alwaysAllow} onChange={setAlwaysAllow}>
            <span className="text-caption text-ink-2">{labels.alwaysAllow}</span>
          </Checkbox>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Button type="button" variant="ghost" size="small" className="gap-1.5" onClick={onDeny}>
          {labels.deny}
          <Kbd className="bg-transparent px-0.5 text-ink-3">Esc</Kbd>
        </Button>
        <Button
          type="button"
          variant="primary"
          size="small"
          className="gap-1.5"
          onClick={() => onApprove?.({ alwaysAllow })}
        >
          {labels.approve}
          <Kbd className="bg-ink/15 text-canvas">⌘ ↵</Kbd>
        </Button>
      </div>
    </div>
  );
}
