"use client";

/**
 * PeachUI — SourceRail (block)
 * @tier block
 * @requires app/globals.css
 *
 * Research log of opened sources (separate from inline citations).
 */

import { useState } from "react";
import { cx } from "@/lib/utils";

export type SourceRailItem = {
  id: string;
  title: string;
  host?: string;
  snippet?: string;
  href?: string;
};

export type SourceRailLabels = {
  title: (count: number) => string;
  show: string;
  hide: string;
};

export const defaultSourceRailLabels: SourceRailLabels = {
  title: (count) => `Sources (${count})`,
  show: "Show sources",
  hide: "Hide sources",
};

export type SourceRailProps = {
  className?: string;
  items: SourceRailItem[];
  defaultOpen?: boolean;
  labels?: Partial<SourceRailLabels>;
};

export function SourceRail({ className, items, defaultOpen = true, labels: labelsProp }: SourceRailProps) {
  const labels = { ...defaultSourceRailLabels, ...labelsProp };
  const [open, setOpen] = useState(defaultOpen);

  if (items.length === 0) return null;

  return (
    <section className={cx("overflow-hidden rounded-card border border-line bg-surface shadow-hairline", className)}>
      <button
        type="button"
        className="flex min-h-11 w-full items-center justify-between px-3 py-2.5 text-left outline-none transition-colors duration-150 hover:bg-hover focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
      >
        <span className="text-meta font-medium text-ink">{labels.title(items.length)}</span>
        <span className="text-caption text-ink-3">{open ? labels.hide : labels.show}</span>
      </button>
      {open ? (
        <ul className="divide-y divide-line-soft border-t border-line-soft">
          {items.map((item) => (
            <li key={item.id} className="px-3 py-2.5">
              {item.href ? (
                <a href={item.href} className="text-meta font-medium text-accent underline decoration-accent/40 underline-offset-2 hover:text-accent-ink">
                  {item.title}
                </a>
              ) : (
                <p className="text-meta font-medium text-ink">{item.title}</p>
              )}
              {item.host ? <p className="mt-0.5 text-caption text-ink-3">{item.host}</p> : null}
              {item.snippet ? <p className="mt-1 text-body text-pretty text-ink-2">{item.snippet}</p> : null}
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
