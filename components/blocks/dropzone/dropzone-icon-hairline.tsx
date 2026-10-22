"use client";

import { forwardRef, useCallback, type ComponentPropsWithoutRef } from "react";
import { fileSpreadSpec } from "@/lib/hairline/figures/file-spread-spec";
import type { HairlineMountOptions } from "@/lib/hairline/types";
import { useHairlineFigure } from "@/lib/use-hairline-figure";
import { cx } from "@/lib/utils";

type DropzoneIconHairlineProps = HairlineMountOptions &
  Omit<ComponentPropsWithoutRef<"div">, keyof HairlineMountOptions>;

/**
 * Dropzone invite icon: Hairline file-spread figure (authored with hairline-create).
 * `intensity` 0 = stacked rest; 1 = full fan — tie it to hover, focus, or drag-over on the parent target.
 */
export const DropzoneIconHairline = forwardRef<HTMLDivElement, DropzoneIconHairlineProps>(
  function DropzoneIconHairline(
    { intensity, theme = "auto", play, className, style, ...attrs },
    ref,
  ) {
    const hostRef = useHairlineFigure(fileSpreadSpec, {
      intensity,
      theme,
      label: "",
      play,
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
          "pointer-events-none size-[3.25rem] [&_svg]:size-[118%] [&_svg]:-translate-y-[4%] [&_svg]:overflow-visible",
          className,
        )}
        style={style}
      />
    );
  },
);
