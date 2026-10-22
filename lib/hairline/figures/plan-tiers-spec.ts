import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/plan-tiers.js";

export const planTiersSpec: FigureSpec = {
  id: "plan-tiers",
  label:
    "Three plan blocks on a plinth: the one under the pointer lifts, and its neighbours follow.",
  rest: "rest",
  range: [0.9, 1.4, 2.2],
  tour: [[120, 168], [200, 150], [280, 168], null],
  engine: mount,
};
