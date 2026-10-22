"use client";

import { useRef, type RefObject } from "react";
import { createFigure } from "@/lib/hairline/create-figure";
import type { FigureSpec, HairlineMountOptions } from "@/lib/hairline/types";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountLayoutEffect } from "@/lib/use-mount-layout-effect";

type ScalarOptions = Omit<HairlineMountOptions, "onRead">;

type MountedFigure = {
  spec: FigureSpec;
  options: ScalarOptions;
  figure: ReturnType<typeof createFigure>;
};

function sameOptions(a: ScalarOptions, b: ScalarOptions) {
  return (
    a.intensity === b.intensity &&
    a.theme === b.theme &&
    a.label === b.label &&
    a.play === b.play
  );
}

/**
 * Mount a Hairline figure on the returned host ref, pre-paint. Remounts when
 * `spec` changes and pushes scalar option changes through `figure.update`.
 * `onRead` is trampolined through a ref, so a fresh callback identity never
 * re-syncs the DOM.
 */
export function useHairlineFigure(
  spec: FigureSpec,
  options: HairlineMountOptions = {},
): RefObject<HTMLDivElement | null> {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mountedRef = useRef<MountedFigure | null>(null);
  const onReadRef = useRef(options.onRead);
  const trampolineRef = useRef((text: string) => onReadRef.current?.(text));

  useDomLayout(() => {
    onReadRef.current = options.onRead;
    const host = hostRef.current;
    if (!host) return;
    const mounted = mountedRef.current;
    if (mounted && mounted.spec !== spec) {
      mounted.figure.destroy();
      mountedRef.current = null;
    }
    const next: ScalarOptions = {
      intensity: options.intensity,
      theme: options.theme,
      label: options.label,
      play: options.play,
    };
    if (!mountedRef.current) {
      mountedRef.current = {
        spec,
        options: next,
        figure: createFigure(spec, host, { ...options, onRead: trampolineRef.current }),
      };
      return;
    }
    if (!sameOptions(mountedRef.current.options, next)) {
      mountedRef.current.options = next;
      mountedRef.current.figure.update(next);
    }
  });

  useMountLayoutEffect(() => () => {
    mountedRef.current?.figure.destroy();
    mountedRef.current = null;
  });

  return hostRef;
}
