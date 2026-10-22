"use client";

/**
 * PeachUI — Dashboard (block)
 * @tier block
 * @deps app-shell, metric-strip, record-ledger
 * @requires app/globals.css
 *
 * Dashboard template (W4): shell frame, KPI strip, chart row, record ledger.
 */

import type { ReactNode } from "react";
import { AppShell } from "@/components/blocks/app-shell";
import { MetricStrip, type MetricStripVariant } from "@/components/blocks/metric-strip";
import { RecordLedger } from "@/components/blocks/record-ledger";

export type DashboardProps = {
  className?: string;
  metricVariant?: MetricStripVariant;
  /** Chart row between the KPI strip and the ledger. */
  chart?: ReactNode;
};

export function Dashboard({
  className,
  metricVariant = "footer",
  chart,
}: DashboardProps) {
  return (
    <AppShell className={className}>
      <MetricStrip variant={metricVariant} columns={4} count={4} />
      {chart}
      <RecordLedger />
    </AppShell>
  );
}
