import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "@/lib/utils";

export type StatusDotColor = "green" | "yellow" | "indigo" | "red" | "neutral";

export interface StatusDotProps extends HTMLAttributes<HTMLSpanElement> {
  color?: StatusDotColor;
  pulse?: boolean;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "inline-flex size-3 shrink-0 items-center justify-center rounded-full",
  halo: {
    green: "bg-green-muted",
    yellow: "bg-warning-muted",
    indigo: "bg-accent-muted",
    red: "bg-red-muted",
    neutral: "bg-hover-2",
  },
  dot: {
    green: "bg-green",
    yellow: "bg-warning",
    indigo: "bg-accent",
    red: "bg-red",
    neutral: "bg-ink-3",
  },
});

export function StatusDot({ color = "green", pulse = false, className, ref, ...props }: StatusDotProps) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={cx(
        styles.base,
        styles.halo[color],
        pulse && "motion-safe:animate-[status-breathe_1.8s_ease-in-out_infinite]",
        className,
      )}
      {...props}
    >
      <span className={cx("size-1.5 rounded-full", styles.dot[color])} />
    </span>
  );
}
