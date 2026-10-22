"use client";

/**
 * Approval gate — pending approvals render the shared PermissionGate
 * primitive (scope list + deny / allow once / always allow); resolved
 * approvals collapse to a one-line record of who decided.
 */

import { Check, X } from "reicon-react";
import { PermissionGate } from "@/components/primitives/permission-gate";
import { ToolChip } from "@/components/primitives/agent-inline-chips";
import type { OpsApproval } from "../data";
import { cx } from "@/lib/utils";

const GATE_LABELS: Record<
  OpsApproval["kind"],
  { title: string; resolved: string; deniedMessage: string }
> = {
  deploy: {
    title: "Approve deploy?",
    resolved: "Deploy approved",
    deniedMessage: "Deploy denied — the patch stays staged in Studio.",
  },
  tool: {
    title: "Allow tool call?",
    resolved: "Allowed for this run",
    deniedMessage: "Denied — the run stays blocked.",
  },
  permission: {
    title: "Grant access?",
    resolved: "Access granted for this run",
    deniedMessage: "Denied — the agent will try another approach.",
  },
};

export function ApprovalCard({
  approval,
  resolution,
  onResolve,
}: {
  approval: OpsApproval;
  /** Who decided and when, once state is no longer pending. */
  resolution?: string;
  onResolve: (approvalId: string, approved: boolean) => void;
}) {
  if (approval.state !== "pending") {
    const approved = approval.state === "approved";
    return (
      <div
        className={cx(
          "rounded-panel px-3 py-2.5 shadow-hairline",
          approved ? "bg-canvas" : "bg-inset",
        )}
      >
        <p className="flex items-center gap-1.5 text-caption-1-regular text-ink-2">
          {approved ? (
            <Check className="size-3.5 shrink-0 text-green" aria-hidden />
          ) : (
            <X className="size-3.5 shrink-0 text-red" aria-hidden />
          )}
          <ToolChip>{approval.toolName}</ToolChip>
          <span className="min-w-0 truncate">
            {resolution ?? (approved ? "Approved" : "Denied")}
          </span>
        </p>
      </div>
    );
  }

  return (
    <PermissionGate
      variant="embedded"
      toolName={approval.toolName}
      description={approval.summary}
      scopes={approval.scopes.map((scope, index) => ({
        id: `${approval.id}-scope-${index}`,
        label: `${scope.label} ${scope.value}`,
      }))}
      labels={{
        ...GATE_LABELS[approval.kind],
        subtitle: `${approval.risk === "high" ? "high risk · " : ""}this run`,
      }}
      onChoice={(choice) => onResolve(approval.id, choice !== "deny")}
    />
  );
}
