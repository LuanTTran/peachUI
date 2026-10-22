"use client";

import { useEffect, useLayoutEffect } from "react";

const isomorphicLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * One-time pre-paint mount sync — the layout-effect counterpart of
 * `useMountEffect`. For DOM measurement or widget mounts that must land
 * before the browser paints (selection thumbs, figure mounts).
 */
export function useMountLayoutEffect(effect: () => void | (() => void)) {
  isomorphicLayoutEffect(effect, []);
}
