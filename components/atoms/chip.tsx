import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "@/lib/utils";

type ChipVariant = "bold" | "subtle" | "caption";
type ChipColor = "orange" | "lime" | "rose" | "yellow" | "cyan" | "blue" | "purple" | "neutral" | "gray" | "soft";

export interface ChipProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: ChipVariant;
  color?: ChipColor;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "inline-flex items-center justify-center rounded-md px-1.5 whitespace-nowrap transition-[padding,font-size] duration-200 ease",
  variant: {
    bold: "py-0.5 text-body-medium",
    subtle: "py-1 text-body-medium",
    caption: "py-1 text-caption-1-medium",
  },
  color: {
    orange: "bg-warning-muted text-warning",
    lime: "bg-green-muted text-green",
    rose: "bg-red-muted text-red",
    yellow: "bg-warning-muted text-warning",
    cyan: "bg-schedule-muted text-schedule",
    blue: "bg-accent-muted text-accent-ink",
    purple: "bg-violet-muted text-violet",
    neutral: "bg-hover-2 text-ink-2",
    gray: "bg-canvas text-ink",
    soft: "bg-canvas text-ink-2",
  },
});

export function Chip({
  variant = "bold",
  color = "neutral",
  className,
  ref,
  ...props
}: ChipProps) {
  return (
    <span
      ref={ref}
      className={cx(styles.base, styles.variant[variant], styles.color[color], className)}
      {...props}
    />
  );
}
