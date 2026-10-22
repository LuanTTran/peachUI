"use client";

/**
 * Deploys — the DeployGate block (deploy stream → failure → gated
 * rollback) over a searchable, filterable deploy-history DataGrid.
 */

import { DeployGate } from "@/components/blocks/deploy-gate";
import { DataGrid, type DataGridColumn } from "@/components/primitives/data-grid";
import { DEPLOYS, type DeployRow } from "../data";

const COLUMNS: DataGridColumn<DeployRow>[] = [
  { key: "id", header: "Deploy", width: 130 },
  { key: "sha", header: "SHA", width: 90 },
  { key: "repo", header: "Repo", width: 170, filterable: true },
  { key: "env", header: "Env", width: 110, filterable: true },
  { key: "status", header: "Status", width: 120, filterable: true },
  { key: "duration", header: "Duration", width: 100, align: "end" },
  { key: "by", header: "Opened by", width: 110 },
  { key: "ago", header: "When", width: 100 },
];

export function DeploysPanel() {
  return (
    <div className="flex flex-col gap-4">
      <DeployGate />
      <DataGrid
        aria-label="Deploy history"
        data={DEPLOYS}
        columns={COLUMNS}
        getRowId={(row) => row.id}
        height={300}
        exportFileName="peach-deploys"
      />
    </div>
  );
}
