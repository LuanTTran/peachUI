"use client";

/**
 * Thread column — search, select toggle, overnight brief, thread rows,
 * and the floating bulk bar when a selection is active.
 */

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Search, X } from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import { Chip } from "@/components/atoms/chip";
import { Input } from "@/components/atoms/input";
import { StatusDot } from "@/components/atoms/status-dot";
import { BulkActionBar } from "@/components/primitives/bulk-action-bar";
import {
  AGENT_STATUS_COLOR,
  AGENT_STATUS_LABEL,
  CUSTOMERS,
  type MailThread,
} from "../data";
import { cx } from "@/lib/utils";

export type ThreadListItem = {
  thread: MailThread;
  /** Whether a reply has been sent in this session (drives Sent folder). */
  sent: boolean;
  unread: boolean;
};

export function ThreadList({
  items,
  activeId,
  onSelect,
  selectedIds,
  onSelectedIdsChange,
  selectMode,
  onSelectModeChange,
  onBulkSend,
  onBulkSnooze,
  onBulkArchive,
  brief,
  className,
}: {
  items: ThreadListItem[];
  activeId?: string;
  onSelect: (id: string) => void;
  selectedIds: string[];
  onSelectedIdsChange: (ids: string[]) => void;
  selectMode: boolean;
  onSelectModeChange: (on: boolean) => void;
  onBulkSend: () => void;
  onBulkSnooze: () => void;
  onBulkArchive: () => void;
  /** Optional card rendered at the top of the scroll (the overnight brief). */
  brief?: React.ReactNode;
  className?: string;
}) {
  const reduced = useReducedMotion();
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();

  const visible = q
    ? items.filter(({ thread }) => {
        const customer = CUSTOMERS[thread.customerId];
        return (
          thread.subject.toLowerCase().includes(q) ||
          customer.name.toLowerCase().includes(q) ||
          customer.org.toLowerCase().includes(q)
        );
      })
    : items;

  const toggleSelected = (id: string) => {
    onSelectedIdsChange(
      selectedIds.includes(id)
        ? selectedIds.filter((sid) => sid !== id)
        : [...selectedIds, id],
    );
  };

  return (
    <section
      aria-label="Threads"
      className={cx(
        "relative flex min-h-0 w-full flex-col overflow-hidden rounded-window bg-surface shadow-card",
        className,
      )}
    >
      {/* search + select */}
      <div className="flex shrink-0 items-center gap-1.5 border-b border-line-soft px-3 py-2">
        <Input
          size="small"
          aria-label="Search mail"
          placeholder="Search mail"
          leadingIcon={Search}
          value={query}
          onChange={setQuery}
          className="min-w-0 flex-1"
        />
        <Button
          variant={selectMode ? "secondary" : "ghost"}
          size="small"
          leadingIcon={selectMode ? X : undefined}
          aria-pressed={selectMode}
          onClick={() => {
            onSelectModeChange(!selectMode);
            if (selectMode) onSelectedIdsChange([]);
          }}
          className="shrink-0"
        >
          {selectMode ? "Done" : "Select"}
        </Button>
      </div>

      {/* rows */}
      <ul className="min-h-0 flex-1 overflow-y-auto p-1.5">
        {brief ? <li className="mb-1.5">{brief}</li> : null}
        <AnimatePresence initial={false}>
          {visible.map(({ thread, unread }) => {
            const customer = CUSTOMERS[thread.customerId];
            const active = thread.id === activeId;
            const checked = selectedIds.includes(thread.id);
            return (
              <motion.li
                key={thread.id}
                layout={!reduced}
                exit={reduced ? { opacity: 0 } : { opacity: 0, x: -12, filter: "blur(2px)" }}
                transition={{ duration: 0.18, ease: "easeOut" }}
              >
                <div
                  className={cx(
                    "flex w-full items-start gap-2.5 rounded-2lg px-2 py-2 transition-colors duration-100",
                    active ? "bg-hover-2" : "hover:bg-hover",
                  )}
                >
                  {selectMode ? (
                    <Checkbox
                      size="md"
                      aria-label={`Select ${thread.subject}`}
                      isSelected={checked}
                      onChange={() => toggleSelected(thread.id)}
                      className="mt-1 shrink-0"
                    />
                  ) : null}
                  <button
                    type="button"
                    aria-current={active ? "true" : undefined}
                    onClick={() =>
                      selectMode ? toggleSelected(thread.id) : onSelect(thread.id)
                    }
                    className="flex min-w-0 flex-1 items-start gap-2.5 text-left"
                  >
                    <Avatar
                      size="sm"
                      color={customer.color}
                      initials={customer.initials}
                      className="mt-0.5"
                    />
                    <span className="min-w-0 flex-1">
                      <span className="flex items-baseline gap-2">
                        <span
                          className={cx(
                            "min-w-0 flex-1 truncate",
                            unread
                              ? "text-body-2-semibold text-ink"
                              : "text-body-2-medium text-ink-2",
                          )}
                        >
                          {customer.name}
                        </span>
                        <span className="shrink-0 text-caption-2-regular tabular-nums text-ink-3">
                          {thread.ago}
                        </span>
                      </span>
                      <span
                        className={cx(
                          "block truncate",
                          unread
                            ? "text-body-2-medium text-ink"
                            : "text-body-2-regular text-ink-2",
                        )}
                      >
                        {thread.subject}
                      </span>
                      <span className="mt-0.5 block truncate text-caption-1-regular text-ink-3">
                        {thread.snippet}
                      </span>
                      <span className="mt-1 flex items-center gap-1.5">
                        <Chip variant="caption" color={AGENT_STATUS_COLOR[thread.ai]}>
                          {AGENT_STATUS_LABEL[thread.ai]}
                        </Chip>
                        {thread.vip ? (
                          <Chip variant="caption" color="rose">
                            VIP
                          </Chip>
                        ) : null}
                        {unread ? <StatusDot color="indigo" className="ml-auto" /> : null}
                      </span>
                    </span>
                  </button>
                </div>
              </motion.li>
            );
          })}
        </AnimatePresence>
        {visible.length === 0 ? (
          <li className="px-3 py-8 text-center">
            <p className="text-body-2-medium text-ink-2">
              {q ? "Nothing matches." : "Queue clear."}
            </p>
            <p className="mt-0.5 text-caption-1-regular text-ink-3">
              {q ? "Try a sender, company, or subject." : "Peach Agent is watching the inbox."}
            </p>
          </li>
        ) : null}
      </ul>

      {/* bulk bar */}
      {selectedIds.length > 0 ? (
        <div className="pointer-events-none absolute inset-x-2 bottom-2">
          <BulkActionBar
            selectedCount={selectedIds.length}
            labels={{ approve: "Send drafts", export: "Snooze", deny: "Archive" }}
            onApprove={onBulkSend}
            onExport={onBulkSnooze}
            onDeny={onBulkArchive}
            className="pointer-events-auto shadow-overlay"
          />
        </div>
      ) : null}
    </section>
  );
}
