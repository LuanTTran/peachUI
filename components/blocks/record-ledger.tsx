"use client";

/**
 * PeachUI — RecordLedger (block)
 * @tier block
 * @deps data-table (primitive, demo wiring)
 * @requires app/globals.css
 *
 * Filterable, sortable, selectable table surface for dashboard records.
 * Host-owned columns and row data land in a follow-up; catalog uses demo rows.
 */

import { DataTableExample } from "@/components/primitives/data-table";
import { cx } from "@/lib/utils";

export type RecordLedgerLabels = {
  title: string;
  subtitle: string;
};

export const defaultRecordLedgerLabels: RecordLedgerLabels = {
  title: "Team access",
  subtitle:
    "Review who can open each product area, spot invites that still need a response, and adjust seats before you share a link.",
};

/** Column definition for host-supplied tables (not wired yet). */
export type RecordLedgerColumn<TRecord> = {
  id: string;
  header: string;
  accessor?: (row: TRecord) => unknown;
};

export type RecordLedgerProps<TRecord = unknown> = {
  className?: string;
  title?: string;
  /** Shown under the title when provided. */
  subtitle?: string;
  labels?: Partial<RecordLedgerLabels>;
  // TODO: columns, rows, sorting, filters, selection, pagination callbacks
  columns?: RecordLedgerColumn<TRecord>[];
  rows?: TRecord[];
};

export function RecordLedger<TRecord = unknown>({
  className,
  title,
  subtitle,
  labels: labelsProp,
}: RecordLedgerProps<TRecord>) {
  const labels = { ...defaultRecordLedgerLabels, ...labelsProp };
  const heading = title ?? labels.title;
  const lead = subtitle ?? labels.subtitle;

  return (
    <section
      className={cx("flex w-full flex-col gap-3", className)}
      aria-labelledby="record-ledger-title"
    >
      <header className="flex flex-col gap-0.5 px-1">
        <h2 id="record-ledger-title" className="text-body-strong text-balance text-ink">
          {heading}
        </h2>
        <p className="max-w-[48ch] text-body text-pretty text-ink-3">{lead}</p>
      </header>

      {/* TODO: Render from `columns` + `rows` when the generic table API ships. */}
      <DataTableExample showSizeToggle={false} pageSize={10} preset="directory" />
    </section>
  );
}
