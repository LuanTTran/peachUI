"use client";

import type { ComponentType, HTMLAttributes, ReactNode, Ref } from "react";
import { useSelectionThumb } from "@/lib/use-selection-thumb";
import { cx, sortCx } from "@/lib/utils";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type PillTabVariant = "blue" | "gray" | "segment";

const styles = sortCx({
  radius: {
    blue: "rounded-full",
    gray: "rounded-2lg",
    segment: "rounded-full",
  },
  thumb: {
    blue: "bg-accent-muted",
    gray: "bg-hover-2",
    segment: "bg-surface shadow-hairline",
  },
  hover: {
    blue: "bg-hover",
    gray: "bg-hover",
    segment: "bg-hover",
  },
  selectedIcon: {
    blue: "text-accent-500",
    gray: "text-ink",
    segment: "text-ink",
  },
  selectedLabel: {
    blue: "text-accent-500",
    gray: "text-ink",
    segment: "text-ink",
  },
});

type Thumb = {
  left: number;
  top: number;
  width: number;
  height: number;
  variant: PillTabVariant;
};

export interface PillTabListProps extends HTMLAttributes<HTMLDivElement> {
  ref?: Ref<HTMLDivElement>;
}

export function PillTabList({ children, className, ref, ...props }: PillTabListProps) {
  const [innerRef, thumb] = useSelectionThumb<HTMLDivElement, Thumb>({
    selector: "[data-pill-selected]",
    items: "button",
    attributes: ["data-pill-selected"],
    measure: (_root, selected) =>
      selected && {
        left: selected.offsetLeft,
        top: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
        variant:
          selected.dataset.pillVariant === "gray"
            ? "gray"
            : selected.dataset.pillVariant === "segment"
              ? "segment"
              : "blue",
      },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  return (
    <div
      ref={setRefs}
      role="group"
      className={cx("relative inline-flex items-center gap-1", className)}
      {...props}
    >
      {thumb && (
        <span
          aria-hidden
          className={cx(
            "pointer-events-none absolute left-0 top-0",
            "transition-[transform,width,height] duration-300",
            "[transition-timing-function:cubic-bezier(0.34,1.2,0.64,1)]",
            styles.radius[thumb.variant],
            styles.thumb[thumb.variant],
          )}
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      {children}
    </div>
  );
}

export function PillTab({
  variant = "blue",
  icon: Icon,
  isSelected,
  onSelect,
  children,
  className,
}: {
  variant?: PillTabVariant;
  icon?: IconComponent;
  isSelected: boolean;
  onSelect: () => void;
  children: ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      data-pill-selected={isSelected ? "" : undefined}
      data-pill-variant={variant}
      onClick={onSelect}
      className={cx(
        "group relative z-10 flex shrink-0 cursor-pointer items-center gap-1 px-2 py-[5px]",
        styles.radius[variant],
        "outline-none transition-colors duration-150 ease",
        "focus-visible:ring-2 focus-visible:ring-accent",
        className,
      )}
    >
      <span
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0 opacity-0",
          "transition-opacity duration-200 ease-out",
          styles.radius[variant],
          styles.hover[variant],
          !isSelected && "group-hover:opacity-100",
        )}
      />
      {Icon && (
        <Icon
          className={cx(
            "relative z-10 size-5 shrink-0",
            isSelected ? styles.selectedIcon[variant] : "text-ink-2",
          )}
          aria-hidden
        />
      )}
      <span
        className={cx(
          "relative z-10 text-body-medium whitespace-nowrap",
          isSelected ? styles.selectedLabel[variant] : "text-ink-2",
        )}
      >
        {children}
      </span>
    </button>
  );
}
