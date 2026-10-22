"use client";

/**
 * PeachUI — InboxTriage (block)
 * @tier block
 * @deps grouped-list, button, motion
 * @requires app/globals.css
 *
 * Ops inbox: select rows, approve or deny them in place, and exports
 * leave only after a grant in the batch rail.
 */

import { useState, type ReactNode } from "react";
import { Check, Download, ShieldCheck } from "reicon-react";
import { Button } from "@/components/atoms/button";
import {
  AnimatePresence,
  iconSwapTransition,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import {
  GroupedList,
  type GroupedListItem,
  type GroupedListSection,
} from "@/components/primitives/grouped-list";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

const ACTIONS_IN = {
  duration: 0.18,
  ease: "easeOut" as const,
};

const DONE_SECTION_ID = "done";

const DEFAULT_SECTIONS: GroupedListSection[] = [
  {
    id: "urgent",
    title: "Urgent",
    items: [
      {
        id: "rate-limit",
        title: "API rate limit alert",
        meta: "studio.peach-ui.dev",
        status: "yellow",
      },
      {
        id: "export-job",
        title: "Failed export job",
        meta: "audit bundle",
        status: "yellow",
      },
    ],
  },
  {
    id: "waiting",
    title: "Waiting",
    items: [
      {
        id: "soc2",
        title: "SOC 2 evidence request",
        meta: "Northwind team",
        status: "indigo",
      },
      {
        id: "invoice",
        title: "Invoice approval",
        meta: "Acme Corp · $4,200",
        status: "indigo",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [
      {
        id: "provisioning",
        title: "User provisioning batch",
        meta: "142 accounts",
        status: "green",
      },
    ],
  },
];

type GrantState = "idle" | "open" | "allowed";
type ResultKind = "denied" | "approved" | "exported" | "export-denied";

type BatchResult = { kind: ResultKind; count: number };

function moveToDone(sections: GroupedListSection[], ids: string[]) {
  const moving = sections
    .flatMap((section) => section.items)
    .filter((item) => ids.includes(item.id))
    .map((item) => ({ ...item, status: "green" as const }));
  const next = sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !ids.includes(item.id)),
    }))
    .filter((section) => section.items.length > 0);
  const done = next.find((section) => section.id === DONE_SECTION_ID);
  if (done) done.items = [...done.items, ...moving];
  else next.push({ id: DONE_SECTION_ID, title: "Done", items: moving });
  return next;
}

function removeItems(sections: GroupedListSection[], ids: string[]) {
  return sections
    .map((section) => ({
      ...section,
      items: section.items.filter((item) => !ids.includes(item.id)),
    }))
    .filter((section) => section.items.length > 0);
}

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

export type InboxTriageProps = {
  className?: string;
  initialSections?: GroupedListSection[];
  exportFileName?: string;
};

export function InboxTriage({
  className,
  initialSections = DEFAULT_SECTIONS,
  exportFileName = "exports/inbox-batch.csv",
}: InboxTriageProps) {
  const reducedMotion = useReducedMotion();
  const [sections, setSections] = useState(initialSections);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [grant, setGrant] = useState<GrantState>("idle");
  const [result, setResult] = useState<BatchResult | null>(null);
  const [actionSeq, setActionSeq] = useState(0);

  const allItems = sections.flatMap((section) => section.items);
  const selectedItems = allItems.filter((item) => selectedIds.includes(item.id));
  const selectedCount = selectedItems.length;
  const openCount = allItems.filter(
    (item) => !sections.find((s) => s.id === DONE_SECTION_ID)?.items.includes(item),
  ).length;
  const doneCount = allItems.length - openCount;

  const recordResult = (next: BatchResult) => {
    setResult(next);
    setActionSeq((seq) => seq + 1);
  };

  const onSelectionChange = (next: string[]) => {
    setSelectedIds(next);
    if (next.length === 0 || grant === "allowed") setGrant("idle");
    if (next.length > 0) setResult(null);
  };

  const approveSelection = () => {
    if (selectedCount === 0) return;
    setSections((current) => moveToDone(current, selectedIds));
    setSelectedIds([]);
    setGrant("idle");
    recordResult({ kind: "approved", count: selectedCount });
  };

  const denySelection = () => {
    if (selectedCount === 0) return;
    setSections((current) => removeItems(current, selectedIds));
    setSelectedIds([]);
    setGrant("idle");
    recordResult({ kind: "denied", count: selectedCount });
  };

  const requestExport = () => {
    if (selectedCount === 0) return;
    setResult(null);
    setGrant("open");
  };

  const resolveGrant = (allowed: boolean) => {
    if (allowed) {
      setGrant("allowed");
      recordResult({ kind: "exported", count: selectedCount });
      return;
    }
    setGrant("idle");
    recordResult({ kind: "export-denied", count: selectedCount });
  };

  const railKey =
    grant !== "idle"
      ? "gate"
      : result !== null
        ? `result-${actionSeq}`
        : selectedCount > 0
          ? "sel"
          : "empty";

  const footerKey = result ? `res-${actionSeq}` : `tally-${openCount}-${doneCount}`;

  return (
    <section
      aria-label="Inbox triage"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <h2 className="text-body-medium text-ink">Inbox</h2>
              <Swap
                swapKey={selectedCount > 0 ? `sel-${selectedCount}` : "none"}
                reduced={reducedMotion}
                className="text-body-2-regular text-ink-2"
              >
                {selectedCount > 0 ? `${selectedCount} selected` : "Nothing selected"}
              </Swap>
            </div>
            <AnimatePresence initial={false}>
              {selectedCount > 0 ? (
                <motion.div
                  key="bulk-actions"
                  className="flex shrink-0 items-center gap-1.5"
                  initial={reducedMotion ? false : { opacity: 0, y: 4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{
                    opacity: 0,
                    y: -6,
                    transition: { duration: 0.12, ease: "easeIn" },
                  }}
                  transition={motionInstantIfReduced(reducedMotion, ACTIONS_IN)}
                >
                  <Button variant="secondary" size="small" onClick={denySelection}>
                    Deny
                  </Button>
                  <Button variant="primary" size="small" onClick={approveSelection}>
                    Approve
                  </Button>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>

          {allItems.length === 0 ? (
            <div className="flex min-h-40 flex-col items-start justify-center gap-2 rounded-lg bg-canvas px-4 py-6">
              <p className="text-body-medium text-ink">Inbox clear</p>
              <p className="text-body-regular text-ink-2">
                New items land here when they arrive.
              </p>
            </div>
          ) : (
            <GroupedList
              sections={sections}
              selectedIds={selectedIds}
              onSelectedIdsChange={onSelectionChange}
            />
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Batch</p>
          <Swap swapKey={railKey} reduced={reducedMotion} className="flex min-w-0 flex-col">
            {grant !== "idle" ? (
              <ExportGate
                items={selectedItems}
                resolved={grant === "allowed"}
                fileName={exportFileName}
                reduced={reducedMotion}
                onResolve={resolveGrant}
              />
            ) : result !== null ? (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                {result.kind === "denied" ? (
                  <>
                    <p className="text-body-medium text-ink">{result.count} items denied.</p>
                    <p className="text-body-regular text-ink-2">They’re out of the inbox.</p>
                  </>
                ) : result.kind === "approved" ? (
                  <>
                    <p className="text-body-medium text-ink">{result.count} items moved to Done.</p>
                    <p className="text-body-regular text-ink-2">The record stays below.</p>
                  </>
                ) : result.kind === "exported" ? (
                  <>
                    <p className="text-body-medium text-ink">{result.count} items exported.</p>
                    <p className="text-body-regular text-ink-2">
                      Written to {exportFileName}.
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-body-medium text-ink">Export denied.</p>
                    <p className="text-body-regular text-ink-2">
                      The items stay selected in the inbox.
                    </p>
                  </>
                )}
              </div>
            ) : selectedCount > 0 ? (
              <div className="flex min-w-0 flex-col gap-3">
                <h3 className="text-body-medium text-ink">
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.span
                      key={selectedCount}
                      className="inline-block align-baseline tabular-nums"
                      initial={
                        reducedMotion ? false : { opacity: 0, y: 6, filter: "blur(2px)" }
                      }
                      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                      exit={{ opacity: 0, y: -6, filter: "blur(2px)" }}
                      transition={motionInstantIfReduced(reducedMotion, TEXT_SWAP)}
                    >
                      {selectedCount}
                    </motion.span>
                  </AnimatePresence>{" "}
                  {selectedCount === 1 ? "item" : "items"} selected
                </h3>
                <div className="flex flex-col rounded-lg bg-canvas px-3 py-2">
                  {selectedItems.slice(0, 4).map((item) => (
                    <div key={item.id} className="flex items-baseline justify-between gap-3 py-1">
                      <span className="min-w-0 truncate text-body-2-regular text-ink">
                        {item.title}
                      </span>
                      <span className="shrink-0 text-caption-1-regular text-ink-3">{item.meta}</span>
                    </div>
                  ))}
                  {selectedCount > 4 ? (
                    <p className="py-1 text-caption-1-regular text-ink-3">
                      +{selectedCount - 4} more
                    </p>
                  ) : null}
                </div>
                <p className="text-caption-1-regular text-ink-3">
                  Approve moves them to Done. Export asks first.
                </p>
              </div>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">Select items to export or deny them.</p>
                <p className="text-body-regular text-ink-2">
                  Exports need a grant before they leave.
                </p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {result ? (
              <>
                <span className="text-body-medium text-ink">
                  {result.kind === "denied"
                    ? "Denied"
                    : result.kind === "approved"
                      ? "Done"
                      : result.kind === "exported"
                        ? "Exported"
                        : "Export denied"}
                </span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">
                  {result.kind === "export-denied"
                    ? `${result.count} items kept`
                    : `${result.count} items`}
                </span>
              </>
            ) : openCount === 0 && allItems.length > 0 ? (
              <span className="text-ink-2">Inbox clear — every item is done.</span>
            ) : (
              <>
                <span className="text-ink-2 tabular-nums">{openCount} open</span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2 tabular-nums">{doneCount} done</span>
              </>
            )}
          </Swap>
        </div>
        <Button
          variant="primary"
          size="small"
          leadingIcon={Download}
          onClick={requestExport}
          disabled={selectedCount === 0 || grant === "open"}
          className="shrink-0"
        >
          Export
        </Button>
      </footer>
    </section>
  );
}

function ExportGate({
  items,
  resolved,
  fileName,
  reduced,
  onResolve,
}: {
  items: GroupedListItem[];
  resolved: boolean;
  fileName: string;
  reduced: boolean | null;
  onResolve: (allowed: boolean) => void;
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex items-start gap-3">
        <span
          className="grid size-9 shrink-0 place-items-center rounded-lg bg-inset text-ink shadow-hairline"
          aria-hidden
        >
          <motion.span
            className="col-start-1 row-start-1 inline-flex"
            initial={false}
            animate={
              resolved
                ? { opacity: 0, scale: 0.25, filter: "blur(2px)" }
                : { opacity: 1, scale: 1, filter: "blur(0px)" }
            }
            transition={motionInstantIfReduced(reduced, iconSwapTransition)}
          >
            <ShieldCheck className="size-[18px]" />
          </motion.span>
          <motion.span
            className="col-start-1 row-start-1 inline-flex text-green"
            initial={false}
            animate={
              resolved
                ? { opacity: 1, scale: 1, filter: "blur(0px)" }
                : { opacity: 0, scale: 0.25, filter: "blur(2px)" }
            }
            transition={motionInstantIfReduced(reduced, iconSwapTransition)}
          >
            <Check className="size-[18px]" />
          </motion.span>
        </span>
        <div className="min-w-0 flex-1">
          <Swap swapKey={resolved ? "resolved" : "ask"} reduced={reduced}>
            <h3 className="text-body-medium text-pretty text-ink">
              {resolved ? "Export allowed" : `Export ${items.length} ${items.length === 1 ? "item" : "items"}?`}
            </h3>
          </Swap>
          <p className="mt-0.5 truncate text-caption-1-regular text-ink-3">
            inbox.export · this session
          </p>
        </div>
      </div>

      <Swap swapKey={resolved ? "resolved" : "ask"} reduced={reduced} className="flex flex-col gap-3">
        {resolved ? (
          <div className="rounded-lg bg-canvas px-3 py-3">
            <p className="text-body-regular text-pretty text-ink-2">
              {items.length} {items.length === 1 ? "item" : "items"} written to{" "}
              <span className="font-mono text-ink">{fileName}</span>.
            </p>
          </div>
        ) : (
          <>
            <div className="rounded-lg bg-canvas px-3 py-3">
              <p className="text-body-2-regular text-pretty text-ink-2">
                Writes a signed CSV of the selected records.
              </p>
              <div className="mt-3 flex flex-col border-t border-line-soft pt-3">
                {items.slice(0, 3).map((item) => (
                  <div key={item.id} className="flex gap-3 py-1 text-caption-1-regular">
                    <span className="w-10 shrink-0 text-ink-3">Read</span>
                    <span className="min-w-0 truncate font-mono text-ink">{item.title}</span>
                  </div>
                ))}
                {items.length > 3 ? (
                  <div className="flex gap-3 py-1 text-caption-1-regular">
                    <span className="w-10 shrink-0 text-ink-3">Read</span>
                    <span className="font-mono text-ink">+{items.length - 3} more</span>
                  </div>
                ) : null}
                <div className="flex gap-3 py-1 text-caption-1-regular">
                  <span className="w-10 shrink-0 text-ink-3">Write</span>
                  <span className="min-w-0 truncate font-mono text-ink">{fileName}</span>
                </div>
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Button variant="ghost" size="small" type="button" onClick={() => onResolve(false)}>
                Deny
              </Button>
              <Button variant="secondary" size="small" type="button" onClick={() => onResolve(true)}>
                Allow once
              </Button>
              <Button variant="primary" size="small" type="button" onClick={() => onResolve(true)}>
                Always allow
              </Button>
            </div>
          </>
        )}
      </Swap>
    </div>
  );
}
