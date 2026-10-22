"use client";

import { ArrowLeft, ArrowRight } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { useElementSize } from "@/lib/use-element-size";
import { cx } from "@/lib/utils";

export interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
  siblingCount?: number;
  className?: string;
  previousLabel?: string;
  nextLabel?: string;
  "aria-label"?: string;
}

const DOTS = "dots";

function range(start: number, end: number): number[] {
  return Array.from({ length: end - start + 1 }, (_, i) => start + i);
}

function paginationRange(
  current: number,
  total: number,
  sibling: number,
): (number | typeof DOTS)[] {
  const totalPageNumbers = sibling * 2 + 5;
  if (totalPageNumbers >= total) return range(1, total);

  const leftSibling = Math.max(current - sibling, 1);
  const rightSibling = Math.min(current + sibling, total);
  const showLeftDots = leftSibling > 2;
  const showRightDots = rightSibling < total - 2;

  if (!showLeftDots && showRightDots) {
    return [...range(1, 3 + 2 * sibling), DOTS, total];
  }
  if (showLeftDots && !showRightDots) {
    return [1, DOTS, ...range(total - (2 + 2 * sibling), total)];
  }
  return [1, DOTS, ...range(leftSibling, rightSibling), DOTS, total];
}

const cell = "flex size-8 shrink-0 items-center justify-center rounded-lg text-body-medium";

const COMPACT_WIDTH = 420;

export function Pagination({
  page,
  totalPages,
  onChange,
  siblingCount = 1,
  className,
  previousLabel = "Previous",
  nextLabel = "Next",
  "aria-label": ariaLabel = "Pagination",
}: PaginationProps) {
  const [navRef, navSize] = useElementSize<HTMLElement>();
  const isCompact = navSize !== null && navSize.width < COMPACT_WIDTH;
  if (totalPages <= 1) return null;
  const pages = paginationRange(page, totalPages, isCompact ? 0 : siblingCount);

  return (
    <nav
      ref={navRef}
      aria-label={ariaLabel}
      className={cx("flex w-full items-center justify-between gap-2", className)}
    >
      <Button
        variant="secondary"
        size="small"
        iconOnly={isCompact}
        leadingIcon={ArrowLeft}
        aria-label={isCompact ? previousLabel : undefined}
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
      >
        {isCompact ? undefined : previousLabel}
      </Button>

      <ul className="flex min-w-0 items-center gap-0.5">
        {pages.map((item, i) =>
          item === DOTS ? (
            <li
              key={`dots-${i}`}
              aria-hidden
              className={cx(cell, "text-ink-3")}
            >
              …
            </li>
          ) : (
            <li key={item}>
              <button
                type="button"
                aria-label={`Go to page ${item}`}
                aria-current={item === page ? "page" : undefined}
                onClick={() => onChange(item)}
                className={cx(
                  cell,
                  "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
                  item === page
                    ? "border border-line bg-surface text-ink shadow-xs"
                    : "text-ink-2 hover:bg-hover hover:text-ink",
                )}
              >
                {item}
              </button>
            </li>
          ),
        )}
      </ul>

      <Button
        variant="secondary"
        size="small"
        iconOnly={isCompact}
        leadingIcon={isCompact ? ArrowRight : undefined}
        trailingIcon={isCompact ? undefined : ArrowRight}
        aria-label={isCompact ? nextLabel : undefined}
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
      >
        {isCompact ? undefined : nextLabel}
      </Button>
    </nav>
  );
}
