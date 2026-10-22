"use client";

/**
 * Secrets — scoped vault entries in the shared DataGrid: who can reach
 * each secret, rotation state, and which runs are holding access.
 */

import { DataGrid, type DataGridColumn } from "@/components/primitives/data-grid";
import { SECRETS, type SecretRow } from "../data";

const COLUMNS: DataGridColumn<SecretRow>[] = [
  { key: "name", header: "Secret", width: 200 },
  { key: "scope", header: "Scope", width: 160, filterable: true },
  { key: "rotated", header: "Rotated", width: 100 },
  { key: "expires", header: "Expires", width: 100 },
  { key: "access", header: "Access", width: 160 },
  { key: "status", header: "Status", width: 120, filterable: true },
];

export function SecretsPanel() {
  return (
    <DataGrid
      aria-label="Secrets"
      data={SECRETS}
      columns={COLUMNS}
      getRowId={(row) => row.id}
      height={280}
      exportFileName="peach-secrets"
    />
  );
}
