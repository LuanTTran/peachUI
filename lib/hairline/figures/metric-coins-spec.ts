import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/metric-coins.js";

export const metricCoinsSpec: FigureSpec = {
  id: "metric-coins",
  label: "Three coins stacked — the top coin catches the bright edge at rest.",
  rest: "rest",
  range: [0, 0.15, 0.75],
  tour: [[148, 120], [160, 108], [172, 96], null],
  engine: mount,
};
