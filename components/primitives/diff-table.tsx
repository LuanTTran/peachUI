"use client";


import { useRef, useState } from "react";
import { Button } from "@/components/atoms/button";
import { blockEaseCss } from "@/components/lib/block-motion";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const STAGE_DELAYS = [180, 260];

export type DiffRow = {
  key: string;
  id: string;
  dept: string;
  email: string;
  removed: boolean;
};

const DEFAULT_ROWS: DiffRow[] = [
  { key: "legacy", id: "LegacyButton", dept: "Deprecated", email: "design-system", removed: true },
  { key: "cold", id: "ColdSurface", dept: "Deprecated", email: "platform-ui", removed: true },
  { key: "warm", id: "WarmSurface", dept: "Tokens", email: "token-exports", removed: false },
];

const DOT: Record<string, string> = {
  Deprecated: "bg-ink-3",
  Tokens: "bg-accent",
  Seasonal: "bg-orange",
};

export type DiffTableLabels = {
  title: string;
  toggleHint: string;
  primitive: string;
  category: string;
  team: string;
  addedId: string;
  addedDept: string;
  addedTeam: string;
  includeAddedAria: string;
  apply: (count: number) => string;
  applied: (count: number) => string;
  removals: (count: number) => string;
  additions: (count: number) => string;
};

const DEFAULT_LABELS: DiffTableLabels = {
  title: "Proposed menu cleanup",
  toggleHint: "Click changed rows to toggle",
  primitive: "Primitive",
  category: "Category",
  team: "Team",
  addedId: "AgentDense",
  addedDept: "Primitives",
  addedTeam: "studio.peach-ui.dev",
  includeAddedAria: "Include adding AgentDense",
  apply: (count) => `Apply ${count} ${count === 1 ? "change" : "changes"}`,
  applied: (count) => `${count} ${count === 1 ? "edit" : "edits"} applied`,
  removals: (count) => `${count} ${count === 1 ? "removal" : "removals"}`,
  additions: (count) => `${count} ${count === 1 ? "addition" : "additions"}`,
};

function IncludedMark({ included, tone }: { included: boolean; tone: "red" | "green" }) {
  return (
    <span
      aria-hidden
      className={cx(
        "flex size-4.5 shrink-0 items-center justify-center rounded-[5px] transition-[background-color,color,transform] duration-150",
        included
          ? tone === "red"
            ? "bg-red text-white"
            : "bg-green text-white"
          : "bg-inset text-ink-3 shadow-hairline",
      )}
      style={{ transform: included ? "scale(1)" : "scale(0.92)" }}
    >
      {included ? (
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <path d="M20 6L9 17l-5-5" />
        </svg>
      ) : null}
    </span>
  );
}

export type DiffTableProps = {
  rows?: DiffRow[];
  labels?: Partial<DiffTableLabels>;
  variant?: string;
  onSettled?: () => void;
};

export function DiffTable({
  rows = DEFAULT_ROWS,
  labels: labelsProp,
  onSettled,
}: DiffTableProps = {}) {
  const labels = { ...DEFAULT_LABELS, ...labelsProp };
  const [stage, setStage] = useState(0);
  const settledRef = useRef(false);
  const tinted = stage >= 1;
  const settled = stage >= 2;
  const [accepted, setAccepted] = useState(false);
  const [edits, setEdits] = useState<Record<string, boolean>>({ legacy: true, cold: true, warm: true });

  useMountEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage(STAGE_DELAYS.length);
      if (!settledRef.current) {
        settledRef.current = true;
        onSettled?.();
      }
      return;
    }

    let delay = 0;
    const timers: number[] = [];
    STAGE_DELAYS.forEach((ms, index) => {
      delay += ms;
      timers.push(
        window.setTimeout(() => {
          setStage(index + 1);
          if (index === STAGE_DELAYS.length - 1 && !settledRef.current) {
            settledRef.current = true;
            onSettled?.();
          }
        }, delay),
      );
    });

    return () => timers.forEach((id) => window.clearTimeout(id));
  });

  const removals = ["legacy", "cold"].filter((key) => edits[key]).length;
  const additions = edits.warm ? 1 : 0;
  const showAdded = settled;

  const toggleEdit = (key: string) => setEdits((current) => ({ ...current, [key]: !current[key] }));

  const headers = [labels.primitive, labels.category, labels.team];

  return (
    <div className="w-full max-w-lg">
      <div className="relative overflow-hidden rounded-card bg-surface shadow-card">
        <div className="primitive-card-bar flex items-center justify-between border-b border-line">
          <span className="text-body-medium text-ink">{labels.title}</span>
          {settled && !accepted ? (
            <span className="text-caption text-ink-3">{labels.toggleHint}</span>
          ) : null}
        </div>

        <table className="w-full table-fixed border-collapse text-left">
          <colgroup>
            <col className="w-[34%]" />
            <col className="w-[30%]" />
            <col className="w-[36%]" />
          </colgroup>
          <thead>
            <tr className="border-b border-line">
              {headers.map((h) => (
                <th key={h} className="primitive-table-cell text-caption font-medium text-ink-3">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const out = row.removed && tinted && edits[row.key];
              const interactive = row.removed && settled && !accepted;
              return (
                <tr
                  key={row.key}
                  tabIndex={interactive ? 0 : undefined}
                  aria-selected={row.removed ? edits[row.key] : undefined}
                  onClick={interactive ? () => toggleEdit(row.key) : undefined}
                  onKeyDown={
                    interactive
                      ? (event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            toggleEdit(row.key);
                          }
                        }
                      : undefined
                  }
                  className={cx(
                    "border-b border-line transition-[background-color,filter,opacity] duration-150 last:border-0 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent",
                    interactive && "cursor-pointer hover:brightness-[0.985]",
                  )}
                  style={{ background: out ? "var(--red-muted)" : undefined }}
                >
                  <td
                    className="primitive-table-cell text-body-medium tabular-nums transition-colors duration-200"
                    style={{ color: out ? "var(--red)" : "var(--ink)" }}
                  >
                    {row.id}
                  </td>
                  <td className="primitive-table-cell">
                    <span
                      className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-inset px-2 text-caption font-medium shadow-hairline transition-opacity duration-200"
                      style={{ opacity: out ? 0.55 : 1 }}
                    >
                      <span className={`size-1.5 rounded-full ${DOT[row.dept] ?? "bg-ink-3"}`} />
                      <span className="text-ink-2">{row.dept}</span>
                    </span>
                  </td>
                  <td
                    className="primitive-table-cell text-body whitespace-nowrap transition-colors duration-200"
                    style={{
                      color: out ? "var(--red)" : "var(--ink-2)",
                      textDecorationLine: out ? "line-through" : "none",
                      textDecorationColor: "color-mix(in srgb, var(--red) 50%, transparent)",
                    }}
                  >
                    <span className="flex items-center justify-between gap-2">
                      <span className="min-w-0 truncate">{row.email}</span>
                      {row.removed && settled ? (
                        <IncludedMark included={edits[row.key]} tone="red" />
                      ) : null}
                    </span>
                  </td>
                </tr>
              );
            })}
            <tr>
              <td colSpan={3} className="p-0">
                <div
                  className="grid transition-[grid-template-rows,opacity] duration-200"
                  style={{
                    gridTemplateRows: showAdded ? "1fr" : "0fr",
                    opacity: showAdded ? 1 : 0,
                    transitionTimingFunction: blockEaseCss,
                  }}
                >
                  <div className="overflow-hidden">
                    <div
                      role="checkbox"
                      tabIndex={accepted ? -1 : 0}
                      aria-checked={edits.warm}
                      aria-label={labels.includeAddedAria}
                      onClick={accepted ? undefined : () => toggleEdit("warm")}
                      onKeyDown={
                        accepted
                          ? undefined
                          : (event) => {
                              if (event.key === "Enter" || event.key === " ") {
                                event.preventDefault();
                                toggleEdit("warm");
                              }
                            }
                      }
                      className={cx(
                        "grid grid-cols-[34%_30%_36%] items-center border-t border-line transition-[background-color,filter,opacity] duration-150 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-inset focus-visible:ring-accent",
                        !accepted && "cursor-pointer hover:brightness-[0.985]",
                      )}
                      style={{ background: edits.warm ? "var(--green-muted)" : undefined }}
                    >
                      <span
                        className="primitive-table-cell text-body-medium tabular-nums transition-colors duration-200"
                        style={{ color: edits.warm ? "var(--green)" : "var(--ink-3)" }}
                      >
                        {labels.addedId}
                      </span>
                      <span className="primitive-table-cell">
                        <span className="inline-flex h-5.5 items-center gap-1.5 rounded-full bg-surface px-2 text-caption font-medium shadow-hairline">
                          <span className="size-1.5 rounded-full bg-green" />
                          <span className="text-ink-2">{labels.addedDept}</span>
                        </span>
                      </span>
                      <span
                        className="primitive-table-cell text-body-medium transition-colors duration-200"
                        style={{ color: edits.warm ? "var(--green)" : "var(--ink-3)" }}
                      >
                        <span className="flex items-center justify-between gap-2">
                          <span className="min-w-0 truncate">{labels.addedTeam}</span>
                          <IncludedMark included={edits.warm} tone="green" />
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>

        {settled ? (
          <div
            className="primitive-card-footer flex min-h-11 items-center justify-between border-t border-line"
            style={{ animation: `fade-up 180ms ${blockEaseCss} both` }}
          >
            {accepted ? (
              <span
                className="inline-flex items-center gap-1.5 rounded-full bg-green-muted py-1 pr-2.5 pl-1 text-body font-medium text-green"
                style={{ animation: `pop-in 180ms ${blockEaseCss} both` }}
              >
                <span className="flex size-4.5 items-center justify-center rounded-full bg-green text-white">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </span>
                {labels.applied(removals + additions)}
              </span>
            ) : (
              <>
                <span className="text-caption tabular-nums text-ink-3">
                  {labels.removals(removals)} · {labels.additions(additions)}
                </span>
                <span className="flex items-center gap-1.5">
                  <Button
                    variant="primary"
                    size="small"
                    disabled={removals + additions === 0}
                    onClick={() => setAccepted(true)}
                  >
                    {labels.apply(removals + additions)}
                  </Button>
                </span>
              </>
            )}
          </div>
        ) : null}
      </div>
    </div>
  );
}
