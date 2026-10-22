"use client";

/**
 * Environments — preview and staging envs in the shared DataGrid:
 * search, column filters, sort, resize, export.
 */

import { DataGrid, type DataGridColumn } from "@/components/primitives/data-grid";
import { ENVS, type EnvRow } from "../data";

const COLUMNS: DataGridColumn<EnvRow>[] = [
  { key: "name", header: "Environment", width: 240 },
  { key: "repo", header: "Repo", width: 170, filterable: true },
  { key: "branch", header: "Branch", width: 140 },
  { key: "status", header: "Status", width: 140, filterable: true },
  { key: "expires", header: "Expires", width: 110 },
  { key: "deploy", header: "Deploy", width: 120 },
];

export function EnvsPanel() {
  return (
    <DataGrid
      aria-label="Environments"
      data={ENVS}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      height={320}
      exportFileName="peach-envs"
    />
  );
}
