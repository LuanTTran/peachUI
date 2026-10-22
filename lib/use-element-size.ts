"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";

export type ElementSize = { width: number; height: number };

/**
 * Mount-scoped `ResizeObserver` on one element. Returns `[ref, size]`;
 * `size` stays `null` until the observer reports its first box, so render
 * paths must handle the unmeasured frame (usually: render nothing sized
 * from it yet).
 */
export function useElementSize<E extends HTMLElement = HTMLDivElement>(): [
  RefObject<E | null>,
  ElementSize | null,
] {
  const ref = useRef<E | null>(null);
  const [size, setSize] = useState<ElementSize | null>(null);

  useMountEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(el);
    return () => observer.disconnect();
  });

  return [ref, size];
}
