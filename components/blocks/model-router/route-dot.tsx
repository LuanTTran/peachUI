import type { HTMLAttributes, Ref } from "react";
import { cx } from "@/lib/utils";
import type { ModelRouteColor } from "@/components/types";

const HALO: Record<ModelRouteColor, string> = {
  "chart-1": "bg-chart-1/20",
  "chart-2": "bg-chart-2/20",
  violet: "bg-violet-muted",
  schedule: "bg-schedule-muted",
};

const CORE: Record<ModelRouteColor, string> = {
  "chart-1": "bg-chart-1-active",
  "chart-2": "bg-chart-2-active",
  violet: "bg-violet",
  schedule: "bg-schedule",
};

export type RouteDotProps = HTMLAttributes<HTMLSpanElement> & {
  color: ModelRouteColor;
  ref?: Ref<HTMLSpanElement>;
};

export function RouteDot({ color, className, ref, ...props }: RouteDotProps) {
  return (
    <span
      ref={ref}
      aria-hidden
      className={cx("inline-flex size-3 shrink-0 items-center justify-center rounded-full", HALO[color], className)}
      {...props}
    >
      <span className={cx("size-1.5 rounded-full", CORE[color])} />
    </span>
  );
}
