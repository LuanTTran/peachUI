"use client";


import { useState } from "react";
import { Checkbox } from "@/components/atoms/checkbox";
import { StatusDot } from "@/components/atoms/status-dot";
import { cx } from "@/lib/utils";

export type GroupedListItem = {
  id: string;
  title: string;
  meta?: string;
  status?: "green" | "yellow" | "indigo";
};

export type GroupedListSection = {
  id: string;
  title: string;
  items: GroupedListItem[];
};

const DEFAULT_SECTIONS: GroupedListSection[] = [
  {
    id: "urgent",
    title: "Urgent",
    items: [
      {
        id: "1",
        title: "API rate limit alert",
        meta: "studio.peach-ui.dev",
        status: "yellow",
      },
      {
        id: "2",
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
        id: "3",
        title: "SOC 2 evidence request",
        meta: "Northwind team",
        status: "indigo",
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    items: [
      {
        id: "4",
        title: "User provisioning batch",
        meta: "142 accounts",
        status: "green",
      },
    ],
  },
];

const DEFAULT_SELECTED = ["1", "2"];

export type GroupedListProps = {
  sections?: GroupedListSection[];
  className?: string;
  selectedIds?: string[];
  defaultSelectedIds?: string[];
  onSelectedIdsChange?: (ids: string[]) => void;
  variant?: string;
};

export function GroupedList({
  sections = DEFAULT_SECTIONS,
  className,
  selectedIds: selectedIdsProp,
  defaultSelectedIds = DEFAULT_SELECTED,
  onSelectedIdsChange,
}: GroupedListProps = {}) {
  const [internalSelected, setInternalSelected] = useState<string[]>(defaultSelectedIds);
  const selectedIds = selectedIdsProp ?? internalSelected;

  const setSelected = (next: string[]) => {
    if (selectedIdsProp === undefined) {
      setInternalSelected(next);
    }
    onSelectedIdsChange?.(next);
  };

  const toggle = (id: string, checked: boolean) => {
    const next = checked ? [...selectedIds, id] : selectedIds.filter((item) => item !== id);
    setSelected(next);
  };

  return (
    <div className={cx("flex flex-col gap-4", className)}>
      {sections.map((section) => (
        <section key={section.id}>
          <h3 className="sticky top-0 z-[1] bg-surface/95 py-1 text-body-2-medium text-ink-2 backdrop-blur-sm">
            {section.title}
          </h3>
          <ul className="mt-1 flex flex-col gap-1">
            {section.items.map((item) => {
              const checked = selectedIds.includes(item.id);
              return (
                <li key={item.id}>
                  <Checkbox
                    size="sm"
                    isSelected={checked}
                    onChange={(value) => toggle(item.id, value)}
                    className={cx(
                      "w-full rounded-control px-2 py-2 transition-colors duration-100",
                      checked ? "bg-hover" : "hover:bg-hover-2",
                    )}
                  >
                    <span className="flex min-w-0 flex-1 items-center gap-2.5">
                      {item.status ? <StatusDot color={item.status} className="shrink-0" /> : null}
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-medium text-ink">{item.title}</span>
                        {item.meta ? (
                          <span className="block truncate text-body-2-regular text-ink-2">
                            {item.meta}
                          </span>
                        ) : null}
                      </span>
                    </span>
                  </Checkbox>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
