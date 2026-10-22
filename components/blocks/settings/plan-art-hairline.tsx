"use client";

import { forwardRef, useCallback, type ComponentPropsWithoutRef } from "react";
import { planTiersSpec } from "@/lib/hairline/figures/plan-tiers-spec";
import type { HairlineMountOptions } from "@/lib/hairline/types";
import { useHairlineFigure } from "@/lib/use-hairline-figure";
import { cx } from "@/lib/utils";

type PlanArtHairlineProps = HairlineMountOptions &
  Omit<ComponentPropsWithoutRef<"div">, keyof HairlineMountOptions>;

/**
 * "Current plan" artwork: Peach Hairline figure (plan-tiers), authored with
 * hairline-create. Three blocks on a plinth; the centre reads as the active tier at rest.
 */
export const PlanArtHairline = forwardRef<HTMLDivElement, PlanArtHairlineProps>(
  function PlanArtHairline(
    { intensity, theme = "auto", label, onRead, play, className, style, ...attrs },
    ref,
  ) {
    const named = label ?? attrs["aria-label"];
    const hostRef = useHairlineFigure(planTiersSpec, {
      intensity,
      theme,
      label: named,
      play,
      onRead,
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
        className={cx("w-full [aspect-ratio:5/4]", className)}
        style={style}
      />
    );
  },
);
