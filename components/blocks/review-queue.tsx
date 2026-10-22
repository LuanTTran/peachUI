"use client";

/**
 * PeachUI — ReviewQueue (block)
 * @tier block
 * @deps diff-table, selection-actions, block-intro
 * @requires app/globals.css
 *
 * Staged change batches with diffs and batch actions.
 */

import { useState } from "react";
import { BlockIntro } from "@/components/blocks/_shared/block-intro";
import { DiffTable } from "@/components/primitives/diff-table";
import { SelectionActions } from "@/components/primitives/selection-actions";
import { cx } from "@/lib/utils";

const DEFAULT_INTROS = [
  "First batch — access policy removals staged for review.",
  "Second batch — dependency bumps waiting on your sign-off.",
];

export type ReviewQueueProps = {
  className?: string;
  intros?: string[];
};

export function ReviewQueue({ className, intros = DEFAULT_INTROS }: ReviewQueueProps) {
  const [unlockedBatch, setUnlockedBatch] = useState(0);

  const onBatchSettled = (index: number) => {
    if (index < intros.length - 1) {
      setUnlockedBatch((current) => Math.max(current, index + 1));
    }
  };

  return (
    <div className={cx("flex min-w-0 flex-col gap-10", className)}>
      {intros.map((intro, index) => {
        if (index > unlockedBatch) {
          return null;
        }

        return (
          <BlockIntro key={index} intro={intro} active>
            <DiffTable onSettled={() => onBatchSettled(index)} />
          </BlockIntro>
        );
      })}
      <div className="max-w-2xl">
        <p className="mb-3 text-meta font-medium text-ink">Batch actions</p>
        <SelectionActions />
      </div>
    </div>
  );
}
