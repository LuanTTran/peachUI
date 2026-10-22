/** Shared block motion. Matches the sample deck reveal timing. */
export const blockEase = [0.23, 1, 0.32, 1] as const;
export const blockEaseCss = "cubic-bezier(0.23, 1, 0.32, 1)";

export const fadeUpReveal = `fade-up 400ms ${blockEaseCss} both`;
export const fadeUpSlowReveal = `fade-up 450ms ${blockEaseCss} both`;
export const fadeInReveal = "fade-in 200ms ease-out both";

export const fadeUpStyle: { animation: string } = { animation: fadeUpReveal };
export const fadeUpSlowStyle: { animation: string } = { animation: fadeUpSlowReveal };
export const fadeInStyle: { animation: string } = { animation: fadeInReveal };

/** Drop target chrome (border / fill). */
export const zoneTransition = {
  duration: 0.2,
  ease: blockEase,
} as const;

/** Large stagger between sections of one infrequent entrance. */
export const blockStaggerMs = 80;

export function fadeUpStagger(index: number): { animation: string; animationDelay?: string } {
  return {
    animation: fadeUpReveal,
    ...(index > 0 ? { animationDelay: `${index * blockStaggerMs}ms` } : {}),
  };
}

/**
 * Continuous route particles. Linear, so the gap stays even.
 * `ratio` is this lane’s throughput against the busiest lane (0–1).
 * Returns the dash gap in px and the seconds to travel one dash period.
 */
export function routeFlow(ratio: number) {
  const t = Math.min(1, Math.max(0, ratio));
  const gap = 11 - t * 5;
  const pxPerSecond = 48 + t * 64;
  return {
    gap,
    duration: (0.5 + gap) / pxPerSecond,
  };
}
