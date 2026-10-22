import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/metric-doorway.js";

export const metricDoorwaySpec: FigureSpec = {
  id: "metric-doorway",
  label: "Doorway with an ajar door — the door slab is bright at rest.",
  rest: "rest",
  range: [0, 0.4, 1.1],
  tour: [[150, 140], [168, 128], [150, 116], null],
  engine: mount,
};
