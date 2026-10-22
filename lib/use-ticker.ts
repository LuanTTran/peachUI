"use client";

import { useEffect, useRef } from "react";
import { useDomLayout } from "@/lib/use-dom-layout";

/**
 * Audited escape hatch — one managed timeout slot for timers and staged
 * reveals (spec §7.2, option c).
 *
 * - `delay === null` disarms the timer.
 * - A changed `delay` or `restartKey` re-arms it; unrelated renders never
 *   restart the countdown. For a tick chain, pass the chain position as
 *   `restartKey` so each step re-schedules; for a one-shot, the default
 *   (`delay` itself) is enough.
 * - The callback is mirrored every commit, so inline closures always run
 *   fresh and never by themselves re-arm the timer.
 */
export function useTicker(
  tick: () => void,
  delay: number | null,
  restartKey: unknown = delay,
) {
  const latest = useRef(tick);
  useDomLayout(() => {
    latest.current = tick;
  });

  useEffect(() => {
    if (delay === null) return;
    const id = window.setTimeout(() => latest.current(), delay);
    return () => window.clearTimeout(id);
  }, [delay, restartKey]);
}
