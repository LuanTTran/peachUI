import type { HTMLAttributes, Ref } from "react";
import { cx, sortCx } from "@/lib/utils";


type SpinnerTone = "accent" | "ink";

export interface SpinnerProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: SpinnerTone;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "size-3 shrink-0 rounded-full border-[1.5px]",
  tone: {
    accent: "border-accent-ink/30 border-t-accent-ink",
    ink: "border-line-strong border-t-ink-2",
  },
});

export function Spinner({ tone = "accent", className, ref, ...props }: SpinnerProps) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={cx(styles.base, styles.tone[tone], className)}
      style={{ animation: "spin 700ms linear infinite" }}
      {...props}
    />
  );
}
