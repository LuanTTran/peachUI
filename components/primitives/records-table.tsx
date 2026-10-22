"use client";


import { useMemo, useState } from "react";
import { Chip } from "@/components/atoms/chip";
import { cx } from "@/lib/utils";

export type DealStage = "lead" | "qualified" | "proposal" | "won";

export type DealRecord = {
  id: string;
  account: string;
  stage: DealStage;
  value: string;
  amount: number;
  owner: string;
  lastTouch: string;
  quietDays: number;
};

export type RecordsTableLabels = {
  account: string;
  stage: string;
  value: string;
  owner: string;
  lastTouch: string;
  stages: Record<DealStage, string>;
  quiet: string;
  summary: (count: number, stage: string) => string;
  empty: (stage: string) => string;
};

export const defaultDealRecords: DealRecord[] = [
  { id: "fieldnote", account: "Fieldnote", stage: "lead", value: "$9,200", amount: 9200, owner: "Maya Chen", lastTouch: "Yesterday", quietDays: 1 },
  { id: "paperweight", account: "Paperweight", stage: "lead", value: "$6,800", amount: 6800, owner: "Jordan Lee", lastTouch: "3 days ago", quietDays: 3 },
  { id: "sable", account: "Sable", stage: "lead", value: "$12,000", amount: 12000, owner: "Alex Rivera", lastTouch: "6 days ago", quietDays: 6 },
  { id: "northwind", account: "Northwind Labs", stage: "qualified", value: "$36,000", amount: 36000, owner: "Jordan Lee", lastTouch: "11 days ago", quietDays: 11 },
  { id: "cedar", account: "Cedar Studio", stage: "qualified", value: "$18,400", amount: 18400, owner: "Alex Rivera", lastTouch: "9 days ago", quietDays: 9 },
  { id: "lumen", account: "Lumen Stack", stage: "qualified", value: "$22,000", amount: 22000, owner: "Sam Okonkwo", lastTouch: "8 days ago", quietDays: 8 },
  { id: "harbor", account: "Harbor & Co", stage: "proposal", value: "$48,000", amount: 48000, owner: "Maya Chen", lastTouch: "2 days ago", quietDays: 2 },
  { id: "overcast", account: "Overcast", stage: "proposal", value: "$54,000", amount: 54000, owner: "Alex Rivera", lastTouch: "Yesterday", quietDays: 1 },
  { id: "kinfolk", account: "Kinfolk", stage: "won", value: "$27,500", amount: 27500, owner: "Sam Okonkwo", lastTouch: "Today", quietDays: 0 },
  { id: "brightline", account: "Brightline", stage: "won", value: "$41,000", amount: 41000, owner: "Maya Chen", lastTouch: "4 days ago", quietDays: 4 },
];

const DEFAULT_LABELS: RecordsTableLabels = {
  account: "Account",
  stage: "Stage",
  value: "Value",
  owner: "Owner",
  lastTouch: "Last touch",
  stages: { lead: "Lead", qualified: "Qualified", proposal: "Proposal", won: "Won" },
  quiet: "Quiet",
  summary: (count, stage) => (count === 1 ? `1 deal in ${stage}` : `${count} deals in ${stage}`),
  empty: (stage) => `No deals in ${stage}. Choose another stage.`,
};

const STAGE_CHIP: Record<DealStage, "neutral" | "yellow" | "blue" | "lime"> = {
  lead: "neutral",
  qualified: "yellow",
  proposal: "blue",
  won: "lime",
};

type SortKey = "account" | "amount" | "quietDays";

export type RecordsTableProps = {
  rows?: DealRecord[];
  stage?: DealStage;
  selectedId?: string;
  onSelect?: (id: string) => void;
  fill?: boolean;
  labels?: RecordsTableLabels;
  className?: string;
  showSummary?: boolean;
  chrome?: "card" | "plain";
};

export function RecordsTable({
  rows = defaultDealRecords,
  stage,
  selectedId,
  onSelect,
  fill = false,
  labels = DEFAULT_LABELS,
  className,
  showSummary = true,
  chrome = "card",
}: RecordsTableProps) {
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 }>({ key: "quietDays", dir: -1 });

  const stageLabel = stage ? labels.stages[stage] : "the pipeline";

  const visible = useMemo(() => {
    const filtered = stage ? rows.filter((row) => row.stage === stage) : rows;
    return [...filtered].sort((a, b) => {
      const value =
        sort.key === "account"
          ? a.account.localeCompare(b.account)
          : a[sort.key] - b[sort.key];
      return value * sort.dir;
    });
  }, [rows, stage, sort]);

  const toggleSort = (key: SortKey) => {
    setSort((current) => (current.key === key ? { key, dir: (current.dir * -1) as 1 | -1 } : { key, dir: 1 }));
  };

  return (
    <div className={cx("flex min-h-0 min-w-0 flex-col", fill && "h-full flex-1", className)}>
      {showSummary ? (
        <p className="mb-2 text-meta text-ink-2">{labels.summary(visible.length, stageLabel)}</p>
      ) : null}
      <div
        className={cx(
          "min-h-0 overflow-auto",
          chrome === "card" && "rounded-card bg-surface shadow-card",
          fill && "flex-1",
        )}
        role="region"
        aria-label="Deals"
        tabIndex={0}
      >
        <table className="w-full min-w-[640px] border-collapse text-left">
          <thead className="sticky top-0 z-10 bg-surface">
            <tr className="border-b border-[var(--grid-line)] text-meta font-medium text-ink-2">
              <SortHeader label={labels.account} active={sort.key === "account"} dir={sort.dir} onSort={() => toggleSort("account")} />
              <th scope="col" className="px-3 py-2 font-medium">{labels.stage}</th>
              <SortHeader label={labels.value} active={sort.key === "amount"} dir={sort.dir} onSort={() => toggleSort("amount")} align="end" />
              <th scope="col" className="px-3 py-2 font-medium">{labels.owner}</th>
              <SortHeader label={labels.lastTouch} active={sort.key === "quietDays"} dir={sort.dir} onSort={() => toggleSort("quietDays")} />
            </tr>
          </thead>
          <tbody>
            {visible.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-body text-pretty text-ink-2">
                  {labels.empty(stageLabel)}
                </td>
              </tr>
            ) : (
              visible.map((row) => {
                const selected = row.id === selectedId;
                const quiet = row.stage === "qualified" && row.quietDays >= 7;
                return (
                  <tr
                    key={row.id}
                    onClick={() => onSelect?.(row.id)}
                    className={cx(
                      "cursor-pointer border-b border-[var(--grid-line)] transition-colors duration-150",
                      selected ? "bg-accent-muted" : "hover:bg-hover",
                    )}
                  >
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-pressed={selected}
                        onClick={() => onSelect?.(row.id)}
                        className="max-w-full truncate text-left text-body-strong text-ink"
                      >
                        {row.account}
                      </button>
                    </td>
                    <td className="px-3 py-2">
                      <Chip variant="caption" color={STAGE_CHIP[row.stage]}>
                        {labels.stages[row.stage]}
                      </Chip>
                    </td>
                    <td className="px-3 py-2 text-end text-body tabular-nums text-ink">
                      {row.value}
                    </td>
                    <td className="px-3 py-2 text-body text-ink-2">
                      {row.owner}
                    </td>
                    <td className="px-3 py-2">
                      <span className="inline-flex items-center gap-2">
                        <span className="text-body tabular-nums text-ink-2">{row.lastTouch}</span>
                        {quiet ? (
                          <Chip variant="caption" color="yellow">
                            {labels.quiet}
                          </Chip>
                        ) : null}
                      </span>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SortHeader({
  label,
  active,
  dir,
  onSort,
  align = "start",
}: {
  label: string;
  active: boolean;
  dir: 1 | -1;
  onSort: () => void;
  align?: "start" | "end";
}) {
  return (
    <th scope="col" className={cx("px-3 py-2 font-medium", align === "end" && "text-end")} aria-sort={active ? (dir === 1 ? "ascending" : "descending") : "none"}>
      <button
        type="button"
        onClick={onSort}
        className={cx(
          "inline-flex items-center gap-1 text-meta font-medium text-ink-2 transition-colors duration-150 hover:text-ink",
          align === "end" && "ml-auto",
        )}
      >
        {label}
        <svg
          width="12"
          height="12"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden
          className={cx("transition-transform duration-150", active && dir === -1 && "rotate-180", !active && "opacity-40")}
        >
          <path d="M12 5v14M6 13l6 6 6-6" />
        </svg>
      </button>
    </th>
  );
}
