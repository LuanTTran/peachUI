"use client";

/**
 * PeachUI — JumpField (block)
 * @tier block
 * @deps input (pattern), kbd, close-button
 * @requires app/globals.css
 *
 * Command palette for routes and tools. Modal overlay with filter,
 * grouped rows, and keyboard navigation (↑↓ move, ↵ run, esc close).
 */

import { useId, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { Search } from "reicon-react";
import { CloseButton } from "@/components/atoms/close-button";
import { Kbd } from "@/components/atoms/kbd";
import { AnimatePresence, motion } from "@/components/lib/motion";
import { cx } from "@/lib/utils";

export type JumpFieldItem = {
  id: string;
  label: string;
  hint?: string;
  group: string;
  keywords?: string[];
};

export type JumpFieldLabels = {
  placeholder: string;
  ariaLabel: string;
  dialogLabel: string;
  emptyTitle: string;
  emptyHint: string;
  footerHint: string;
  close: string;
};

export const defaultJumpFieldLabels: JumpFieldLabels = {
  placeholder: "Search commands…",
  ariaLabel: "Search commands",
  dialogLabel: "Jump field",
  emptyTitle: "No commands",
  emptyHint: "Try a different keyword",
  footerHint: "↑↓ navigate · ↵ run · esc close",
  close: "Close",
};

export const defaultJumpFieldItems: JumpFieldItem[] = [
  { id: "new-chat", label: "New chat", hint: "⌘N", group: "Actions" },
  { id: "attach", label: "Attach context", hint: "⌘U", group: "Actions" },
  { id: "model", label: "Switch model", hint: "⌘M", group: "Actions" },
  { id: "release", label: "Run release agent", group: "Agents", keywords: ["browser", "notes"] },
  { id: "export", label: "Draft token export helper", group: "Agents", keywords: ["code", "tokens"] },
  { id: "adoption", label: "Open adoption grid", group: "Workspace" },
  { id: "catalog", label: "Find primitive in catalog", group: "Workspace", keywords: ["search", "showcase"] },
  { id: "todos", label: "Morning to-dos", group: "Recents" },
  { id: "workload", label: "Workload summary", group: "Recents" },
];

export type JumpFieldProps = {
  isOpen: boolean;
  onClose: () => void;
  items?: JumpFieldItem[];
  labels?: Partial<JumpFieldLabels>;
  onSelect?: (item: JumpFieldItem) => void;
  className?: string;
};

function groupItems(items: JumpFieldItem[]) {
  const map = new Map<string, JumpFieldItem[]>();
  for (const item of items) {
    const list = map.get(item.group) ?? [];
    list.push(item);
    map.set(item.group, list);
  }
  return [...map.entries()];
}

export function JumpField({
  isOpen,
  onClose,
  items = defaultJumpFieldItems,
  labels: labelOverrides,
  onSelect,
  className,
}: JumpFieldProps) {
  const labels = { ...defaultJumpFieldLabels, ...labelOverrides };

  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <JumpFieldOverlay
          onClose={onClose}
          items={items}
          labels={labels}
          onSelect={onSelect}
          className={className}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * The dialog itself. Mount-gated by the parent, so every open is a fresh
 * instance: the query and the highlight reset on remount, the entrance
 * animation is the mount animation, and the input's `autoFocus` lands the
 * caret — no open choreography to choreograph.
 */
function JumpFieldOverlay({
  onClose,
  items,
  labels,
  onSelect,
  className,
}: {
  onClose: () => void;
  items: JumpFieldItem[];
  labels: JumpFieldLabels;
  onSelect?: (item: JumpFieldItem) => void;
  className?: string;
}) {
  const listId = useId();
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((item) => {
      const hay = [item.label, item.group, ...(item.keywords ?? [])].join(" ").toLowerCase();
      return hay.includes(q);
    });
  }, [items, query]);

  const groups = useMemo(() => groupItems(filtered), [filtered]);
  const orderedItems = useMemo(() => groups.flatMap(([, group]) => group), [groups]);
  const empty = query.trim().length > 0 && filtered.length === 0;
  // Derived clamp: the stored index may outrun a shrinking result set, so
  // every read goes through this instead of syncing state after the fact.
  const index = Math.min(activeIndex, Math.max(orderedItems.length - 1, 0));

  const runItem = (item: JumpFieldItem) => {
    onSelect?.(item);
    onClose();
  };

  const handleInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (orderedItems.length === 0) return;
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((i) => (i + 1) % orderedItems.length);
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((i) => (i - 1 + orderedItems.length) % orderedItems.length);
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = orderedItems[index];
      if (item) runItem(item);
    }
  };

  return (
    <div
      className="fixed inset-0 z-100 flex items-start justify-center p-4 pt-[min(12vh,96px)] sm:pt-[14vh]"
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          onClose();
        }
      }}
    >
      <motion.button
        type="button"
        aria-label={labels.close}
        className="absolute inset-0 cursor-pointer bg-ink/20"
        onClick={onClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />
      <motion.div
        role="dialog"
        aria-modal="true"
        aria-label={labels.dialogLabel}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.96, filter: "blur(2px)" }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className={cx(
          "relative z-10 w-full max-w-md overflow-hidden rounded-card border border-line bg-surface shadow-overlay",
          className,
        )}
      >
        <div className="flex h-11 items-center gap-2 border-b border-line px-3">
          <Search className="size-5 shrink-0 text-ink-3" aria-hidden />
          <input
            autoFocus
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={handleInputKeyDown}
            placeholder={labels.placeholder}
            aria-label={labels.ariaLabel}
            aria-controls={listId}
            aria-activedescendant={
              orderedItems[index] ? `${listId}-${orderedItems[index].id}` : undefined
            }
            className="min-w-0 flex-1 bg-transparent text-body-medium text-ink outline-none placeholder:text-ink-3"
          />
          <Kbd className="hidden sm:inline">⌘K</Kbd>
          <CloseButton size="2xs" aria-label={labels.close} onClick={onClose} className="bg-line" />
        </div>

        {empty ? (
          <div className="flex flex-col items-center gap-1 px-4 py-10">
            <span className="text-body-strong text-ink">{labels.emptyTitle}</span>
            <span className="text-meta text-ink-3">{labels.emptyHint}</span>
          </div>
        ) : (
          <div id={listId} role="listbox" className="max-h-[min(20rem,50vh)] overflow-y-auto p-1">
            {groups.map(([group, groupItems]) => (
              <div key={group} className="mb-1 last:mb-0">
                <p className="px-2 pb-1 pt-1.5 text-meta font-medium uppercase tracking-wide text-ink-3">
                  {group}
                </p>
                <ul className="flex flex-col gap-px">
                  {groupItems.map((item) => {
                    const itemIndex = orderedItems.findIndex((row) => row.id === item.id);
                    const active = orderedItems[index]?.id === item.id;
                    return (
                      <li key={item.id} role="presentation">
                        <button
                          id={`${listId}-${item.id}`}
                          type="button"
                          role="option"
                          aria-selected={active}
                          onMouseEnter={() => {
                            if (itemIndex >= 0) setActiveIndex(itemIndex);
                          }}
                          onClick={() => runItem(item)}
                          className={cx(
                            "button-press-motion flex h-9 w-full items-center justify-between gap-3 rounded-control px-2 text-left text-body text-ink",
                            active ? "bg-hover" : "hover:bg-hover",
                          )}
                        >
                          <span className="truncate">{item.label}</span>
                          {item.hint ? (
                            <kbd className="shrink-0 rounded-control bg-inset px-1.5 py-0.5 font-mono text-caption text-ink-3 shadow-hairline">
                              {item.hint}
                            </kbd>
                          ) : null}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        )}

        <div className="border-t border-line px-3 py-2 text-caption text-ink-3">{labels.footerHint}</div>
      </motion.div>
    </div>
  );
}
