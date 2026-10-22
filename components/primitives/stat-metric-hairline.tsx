"use client";

import { forwardRef, useCallback, type ComponentPropsWithoutRef } from "react";
import { metricCoinsSpec } from "@/lib/hairline/figures/metric-coins-spec";
import { metricDoorwaySpec } from "@/lib/hairline/figures/metric-doorway-spec";
import { metricParcelsSpec } from "@/lib/hairline/figures/metric-parcels-spec";
import { metricReturnSpec } from "@/lib/hairline/figures/metric-return-spec";
import type { FigureSpec } from "@/lib/hairline/types";
import { useHairlineFigure } from "@/lib/use-hairline-figure";
import { cx } from "@/lib/utils";

export type StatMetricFigure = "revenue" | "orders" | "customers" | "refunds";

const SPECS: Record<StatMetricFigure, FigureSpec> = {
  revenue: metricCoinsSpec,
  orders: metricParcelsSpec,
  customers: metricDoorwaySpec,
  refunds: metricReturnSpec,
};

type StatMetricHairlineProps = Omit<ComponentPropsWithoutRef<"div">, "children"> & {
  figure: StatMetricFigure;
};

export const StatMetricHairline = forwardRef<HTMLDivElement, StatMetricHairlineProps>(
  function StatMetricHairline({ figure, className, style, ...attrs }, ref) {
    const hostRef = useHairlineFigure(SPECS[figure], {
      intensity: 0,
      theme: "auto",
      label: "",
    });

    const setRef = useCallback(
      (node: HTMLDivElement | null) => {
        hostRef.current = node;
        if (typeof ref === "function") ref(node);
        else if (ref) ref.current = node;
      },
      [ref, hostRef],
    );

    return (
      <div
        {...attrs}
        ref={setRef}
        aria-hidden
        className={cx(
          "pointer-events-none size-full [&_svg]:size-[128%] [&_svg]:translate-y-[-8%] [&_svg]:overflow-visible",
          className,
        )}
        style={style}
      />
    );
  },
);
