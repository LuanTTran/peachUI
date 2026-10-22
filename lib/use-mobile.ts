"use client";

import { useSyncExternalStore } from "react";

/** Doc layout collapses the sidebar into the hamburger sheet at this width. */
export const MOBILE_QUERY = "(max-width: 768px)";

function subscribeMobile(onChange: () => void) {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const mobileSnapshot = () => window.matchMedia(MOBILE_QUERY).matches;

/**
 * Live flag for the mobile viewport (`MOBILE_QUERY`). The server snapshot is
 * `false`, so SSR paints the desktop chrome — pair with the matching
 * `max-width: 768px` rules in globals.css, which cover the pre-hydration
 * frame, and the first client render swaps in the mobile chrome.
 */
export function useIsMobile() {
  return useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);
}
