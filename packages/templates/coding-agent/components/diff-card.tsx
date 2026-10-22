"use client";

/**
 * Pending patch review — file summary, hunks, approve / request-changes.
 * Resolves in place to a one-line status.
 */

import { Button } from "@/components/atoms/button";
import { StatusDot } from "@/components/atoms/status-dot";
import { fadeUpStyle } from "@/components/lib/block-motion";
import { FileDiffIcon } from "./studio-icons";
import type { DiffPatch } from "../data";
import { cx } from "@/lib/utils";

export type DiffStatus = "pending" | "approved" | "changes";

const STATUS: Record<DiffStatus, { tone: "green" | "red" | "yellow"; label: string }> = {
  approved: { tone: "green", label: "Applied" },
  changes: { tone: "red", label: "Changes requested" },
  pending: { tone: "yellow", label: "Needs review" },
};

export function DiffCard({
  patch,
  status,
  onApprove,
  onRequestChanges,
}: {
  patch: DiffPatch;
  status: DiffStatus;
  onApprove: () => void;
  onRequestChanges: () => void;
}) {
  const pending = status === "pending";
  return (
    <section
      aria-label={patch.title}
      className="overflow-hidden rounded-card bg-surface shadow-card"
      style={fadeUpStyle}
    >
      <header className="flex items-center gap-2 border-b border-line px-3 py-2.5">
        <FileDiffIcon className="size-4 shrink-0 text-ink-3" />
        <span className="min-w-0 flex-1 truncate text-body-2-medium text-ink">{patch.title}</span>
        <span className="flex shrink-0 items-center gap-1.5 text-caption-1-regular text-ink-2">
          <StatusDot color={STATUS[status].tone} />
          {STATUS[status].label}
        </span>
      </header>

      <ul className="flex flex-wrap gap-x-3 gap-y-1 border-b border-line px-3 py-2">
        {patch.files.map((file) => (
          <li key={file.path} className="flex items-center gap-1.5 font-mono text-caption-2-regular text-ink-2">
            <span className="truncate">{file.path}</span>
            <span className="text-green">+{file.adds}</span>
            {file.dels > 0 ? <span className="text-red">−{file.dels}</span> : null}
          </li>
        ))}
      </ul>

      <div className="max-h-56 overflow-auto py-1 text-code">
        {patch.hunks.map((hunk) => (
          <div key={hunk.header}>
            <div className="bg-canvas px-3 py-1 text-caption-2-regular text-ink-3">{hunk.header}</div>
            {hunk.lines.map((line, i) => (
              <div
                key={i}
                className={cx(
                  "flex min-w-max pr-3",
                  line.kind === "add" && "bg-green-muted",
                  line.kind === "del" && "bg-red-muted",
                )}
              >
                <span
                  aria-hidden
                  className={cx(
                    "w-7 shrink-0 select-none text-center",
                    line.kind === "add" ? "text-green" : line.kind === "del" ? "text-red" : "text-ink-3",
                  )}
                >
                  {line.kind === "add" ? "+" : line.kind === "del" ? "−" : ""}
                </span>
                <span
                  className={cx(
                    "whitespace-pre",
                    line.kind === "add" && "text-green",
                    line.kind === "del" && "text-red",
                    line.kind === "ctx" && "text-ink-2",
                  )}
                >
                  {line.text || "\u00a0"}
                </span>
              </div>
            ))}
          </div>
        ))}
      </div>

      {pending ? (
        <footer className="flex items-center justify-end gap-1.5 border-t border-line px-3 py-2">
          <Button variant="secondary" size="small" onClick={onRequestChanges}>
            Request changes
          </Button>
          <Button variant="primary" size="small" onClick={onApprove}>
            Approve &amp; apply
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
