/**
 * PeachUI primitives — Motion entry point.
 *
 * Import from here (not `motion/react` directly) so copied primitives declare
 * a single peer: `motion`.
 *
 * @deps motion
 */

export {
  AnimatePresence,
  motion,
  useIsPresent,
  useReducedMotion,
} from "motion/react";

/** Aligns with `app/globals.css` `--ease-out-strong` and blocks `blockEase`. */
export const primitiveEase = [0.23, 1, 0.32, 1] as const;

/** Contextual icon enter/exit (better-ui): spring with no bounce. */
export const iconSwapTransition = {
  type: "spring" as const,
  duration: 0.3,
  bounce: 0,
};

/** Shared layoutId highlight (e.g. data-grid active cell). */
export const layoutHighlightSpring = {
  type: "spring" as const,
  stiffness: 480,
  damping: 38,
  mass: 0.7,
};

export function motionInstantIfReduced<T extends Record<string, unknown>>(
  reducedMotion: boolean | null,
  transition: T,
): T | { duration: 0 } {
  return reducedMotion ? { duration: 0 } : transition;
}
