import { blockEaseCss } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

/** Bar + grid emphasis — proportional widths; opacity only (transitions-dev: quick in, block ease). */
export const breakdownEmphasisMs = 220;

const emphasisEase = `[transition-timing-function:${blockEaseCss}]`;

export const breakdownBarSegmentMotion = cx(
  "motion-safe:transition-[opacity,filter]",
  "motion-safe:duration-200",
  emphasisEase,
  "motion-reduce:transition-none",
);

export const breakdownGridTileMotion = cx(
  "motion-safe:transition-opacity",
  "motion-safe:duration-200",
  emphasisEase,
  "motion-reduce:transition-none",
);

/** Row chrome: fast hover-in; no extra delay on hover-out (transitions-polish). */
export const breakdownRowMotion = cx(
  "motion-safe:transition-colors",
  "motion-safe:duration-150",
  "motion-safe:ease-out",
  "motion-reduce:transition-none",
);

export function barSegmentOpacity(isHighlighted: boolean, hasHighlight: boolean): string {
  if (!hasHighlight) return "opacity-100";
  return isHighlighted ? "opacity-100 saturate-150" : "opacity-[0.38]";
}

export function gridTileOpacity(tileSegmentId: string | undefined, highlightId: string | null): string {
  if (!highlightId || !tileSegmentId) return "opacity-100";
  return tileSegmentId === highlightId ? "opacity-100" : "opacity-[0.32]";
}

export function gridTileFilter(tileSegmentId: string | undefined, highlightId: string | null): string {
  if (!highlightId || !tileSegmentId) return "";
  return tileSegmentId === highlightId ? "motion-safe:brightness-110" : "motion-safe:brightness-95";
}
