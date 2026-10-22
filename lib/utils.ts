import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

/**
 * Every `text-{family}-{weight}` style from app/typography.css must be listed,
 * otherwise tailwind-merge reads it as a text color and drops it next to a real
 * color such as `text-ink`.
 */
const TEXT_FAMILIES = [
  "large-title",
  "display-1",
  "display-2",
  "display-3",
  "display-4",
  "title-1",
  "title-2",
  "title-3",
  "headline",
  "body",
  "body-2",
  "caption-1",
  "caption-2",
] as const;

const TEXT_WEIGHTS = ["light", "regular", "medium", "semibold", "bold"] as const;

const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: TEXT_FAMILIES.flatMap((family) => TEXT_WEIGHTS.map((weight) => `${family}-${weight}`)) },
      ],
    },
  },
});

/** Merge Tailwind classes; last write wins on conflicts. */
export const cx = twMerge;

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** Identity helper so Tailwind IntelliSense sorts classes inside style objects. */
export function sortCx<
  T extends Record<
    string,
    string | number | Record<string, string | number | Record<string, string | number>>
  >,
>(classes: T): T {
  return classes;
}
