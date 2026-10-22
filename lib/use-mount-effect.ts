"use client";

import { useEffect } from "react";

/** One-time mount sync with an external system (DOM, storage, widgets). */
export function useMountEffect(effect: () => void | (() => void)) {
  // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only by design
  useEffect(effect, []);
}
