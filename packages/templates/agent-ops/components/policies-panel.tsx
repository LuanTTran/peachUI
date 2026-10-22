"use client";

/**
 * Policies — policy decisions in the shared AuditExplorer block:
 * filter by outcome, open an event, read the immutable trail, export.
 */

import { AuditExplorer } from "@/components/blocks/audit-explorer";
import { POLICY_EVENTS } from "../data";

export function PoliciesPanel() {
  return <AuditExplorer events={POLICY_EVENTS} dateLabel="Today" />;
}
