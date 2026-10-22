"use client";

import { useRef, useState } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";

export type Footprint = { x: number; y: number; width: number; height: number };

/** Offset rect of `node` relative to `frame` via the offsetParent chain.
 *  Layout geometry only — transforms never leak in. Null when the chain
 *  leaves `frame` (e.g. position:fixed). */
function offsetRectIn(node: HTMLElement, frame: HTMLElement) {
  let x = 0;
  let y = 0;
  let cursor: HTMLElement | null = node;
  while (cursor && cursor !== frame) {
    x += cursor.offsetLeft;
    y += cursor.offsetTop;
    cursor = cursor.offsetParent as HTMLElement | null;
  }
  if (cursor !== frame) return null;
  return { x, y, width: node.offsetWidth, height: node.offsetHeight };
}

/**
 * Content footprint inside a fixed-width frame, in layout pixels. Wrappers
 * that span the full frame width (or have no box, e.g. display:contents) are
 * seen through; every other child's box joins the union. Falls back to the
 * frame's own box when nothing measurable is found.
 */
export function measureFootprint(frame: HTMLElement, frameW: number): Footprint {
  let left = Infinity;
  let top = Infinity;
  let right = -Infinity;
  let bottom = -Infinity;

  const walk = (node: Element) => {
    for (const child of Array.from(node.children)) {
      const el = child as HTMLElement;
      const w = el.offsetWidth || 0;
      const h = el.offsetHeight || 0;
      if (child.children.length > 0 && (w >= frameW - 1 || w === 0)) {
        walk(child);
        continue;
      }
      if (w === 0 && h === 0) continue;
      const rect = offsetRectIn(el, frame);
      if (!rect) continue;
      left = Math.min(left, rect.x);
      top = Math.min(top, rect.y);
      right = Math.max(right, rect.x + rect.width);
      bottom = Math.max(bottom, rect.y + rect.height);
    }
  };
  walk(frame);

  if (left > right || top > bottom) {
    return { x: 0, y: 0, width: frameW, height: frame.offsetHeight };
  }
  return { x: left, y: top, width: right - left, height: bottom - top };
}

/**
 * Footprint of content inside a fixed-width frame, kept current by a
 * ResizeObserver on the frame and its direct children. `initial` seeds the
 * first render (e.g. from a cache); `onMeasure` fires on every (re)measure.
 */
export function useMeasuredFootprint<T extends HTMLElement>(
  frameW: number,
  { initial = null, onMeasure }: { initial?: Footprint | null; onMeasure?: (f: Footprint) => void } = {},
) {
  const ref = useRef<T | null>(null);
  const [foot, setFoot] = useState<Footprint | null>(initial);

  useMountEffect(() => {
    const el = ref.current;
    if (!el) return;
    const update = () => {
      const next = measureFootprint(el, frameW);
      setFoot(next);
      onMeasure?.(next);
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    for (const child of Array.from(el.children)) observer.observe(child);
    return () => observer.disconnect();
  });

  return [ref, foot] as const;
}
