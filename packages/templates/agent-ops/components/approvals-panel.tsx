"use client";

/**
 * Approvals — every connector call the fleet is paused on, in the
 * shared ToolApproval block: review call by call, approve all, run.
 */

import { ToolApproval } from "@/components/blocks/tool-approval";
import { OPS_CONNECTORS } from "../data";

export function ApprovalsPanel() {
  return <ToolApproval connectors={OPS_CONNECTORS} />;
}
