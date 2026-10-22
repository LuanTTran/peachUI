import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/metric-parcels.js";

export const metricParcelsSpec: FigureSpec = {
  id: "metric-parcels",
  label: "Three parcels in a queue — the front box reads first at rest.",
  rest: "rest",
  range: [0.9, 1.35, 2],
  tour: [[120, 168], [150, 160], [180, 168], null],
  engine: mount,
};
