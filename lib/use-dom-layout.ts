"use client";

import { useEffect, useLayoutEffect } from "react";

const isomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Audited escape hatch — runs `effect` pre-paint after EVERY commit.
 *
 * Reserved for per-commit DOM synchronization that has no event hook:
 * controlled-value DOM mutations (textarea auto-fit) and keeping a
 * latest-values ref current for mount-scoped listeners. Reach for event
 * handlers, `useMountLayoutEffect`, or `ResizeObserver` first — a render
 * that doesn't need to touch the DOM shouldn't.
 */
export function useDomLayout(effect: () => void | (() => void)) {
  isomorphicLayoutEffect(effect);
}
