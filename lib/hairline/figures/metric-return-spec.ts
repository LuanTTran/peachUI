import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/metric-return.js";

export const metricReturnSpec: FigureSpec = {
  id: "metric-return",
  label: "Counter with a parcel eased toward the return slot at rest.",
  rest: "rest",
  range: [0, 0.35, 1],
  tour: [[132, 150], [156, 142], [178, 136], null],
  engine: mount,
};
