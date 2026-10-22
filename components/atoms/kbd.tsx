import type { HTMLAttributes, Ref } from "react";
import { cx } from "@/lib/utils";

export interface KbdProps extends HTMLAttributes<HTMLElement> {
  ref?: Ref<HTMLElement>;
}

export function Kbd({ className, ref, ...props }: KbdProps) {
  return (
    <kbd
      ref={ref}
      className={cx(
        "inline-flex items-center justify-center rounded-full bg-hover-2 px-1 py-0.5 font-sans text-caption-1-semibold tracking-normal whitespace-nowrap text-ink-2",
        className,
      )}
      {...props}
    />
  );
}
