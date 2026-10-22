"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import { useMountLayoutEffect } from "@/lib/use-mount-layout-effect";

export interface SelectionThumbOptions<E extends HTMLElement, Thumb> {
  /** Selector matching the selected child inside the root (e.g. `"[data-selected]"`). */
  selector: string;
  /** Selector for the children whose own resize should retrigger measurement (tabs, rows, links). */
  items: string;
  /** MutationObserver `attributeFilter` — the selection-flag attributes that mark a change. */
  attributes: string[];
  /**
   * Read the thumb box from the current DOM. `selected` is null when nothing
   * matches `selector`; returning null hides the thumb. Captured at mount —
   * read everything you need from the two arguments, not from props.
   */
  measure: (root: E, selected: HTMLElement | null) => Thumb | null;
}

/**
 * Sliding selection thumb shared by pill tabs, segmented controls, underline
 * tabs, and nav rows. Measures the selected child's box before first paint,
 * then keeps it current through a `ResizeObserver` on the root + items and a
 * `MutationObserver` for selection-flag flips, label edits, and child
 * add/remove. Equal boxes are deduped so no-op mutations don't re-render.
 */
export function useSelectionThumb<E extends HTMLElement, Thumb>({
  selector,
  items,
  attributes,
  measure,
}: SelectionThumbOptions<E, Thumb>): [RefObject<E | null>, Thumb | null] {
  const ref = useRef<E | null>(null);
  const [thumb, setThumb] = useState<Thumb | null>(null);

  useMountLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const update = () => {
      const selected = el.querySelector<HTMLElement>(selector);
      const next = measure(el, selected);
      setThumb((prev) => (thumbEqual(prev, next) ? prev : next));
    };

    update();
    const ro = new ResizeObserver(update);
    ro.observe(el);
    const observeItems = () =>
      el.querySelectorAll(items).forEach((item) => ro.observe(item));
    observeItems();
    const mo = new MutationObserver(() => {
      observeItems();
      update();
    });
    mo.observe(el, {
      attributes: true,
      childList: true,
      characterData: true,
      subtree: true,
      attributeFilter: attributes,
    });
    return () => {
      mo.disconnect();
      ro.disconnect();
    };
  });

  return [ref, thumb];
}

/** Flat record equality — thumb boxes are `{ left, top, width, height, ... }`. */
function thumbEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true;
  if (!a || !b || typeof a !== "object" || typeof b !== "object") return false;
  const aKeys = Object.keys(a);
  const bKeys = Object.keys(b);
  return (
    aKeys.length === bKeys.length &&
    aKeys.every((key) =>
      Object.is(
        (a as Record<string, unknown>)[key],
        (b as Record<string, unknown>)[key],
      ),
    )
  );
}
