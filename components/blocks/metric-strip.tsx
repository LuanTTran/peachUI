"use client";

/**
 * PeachUI — MetricStrip (block)
 * @tier block
 * @deps stat-cards (primitive)
 * @requires app/globals.css
 *
 * KPI row with delta chips — plain compact tiles or footer comparison band.
 */

import {
  StatCards,
  type Stat,
  type StatCardsVariant,
} from "@/components/primitives/stat-cards";
import { cx } from "@/lib/utils";

export type MetricStripVariant = StatCardsVariant;

export type MetricStripProps = {
  className?: string;
  variant?: MetricStripVariant;
  stats?: Stat[];
  /** How many metrics to show from the start of `stats` or the default set. */
  count?: number;
  columns?: 1 | 2 | 4;
};

export function MetricStrip({
  className,
  variant = "footer",
  stats,
  count,
  columns = 4,
}: MetricStripProps) {
  return (
    <section
      aria-label="Key metrics"
      className={cx("w-full", className)}
    >
      <StatCards
        variant={variant}
        stats={stats}
        count={count}
        columns={columns}
      />
    </section>
  );
}
