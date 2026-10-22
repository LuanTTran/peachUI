import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/dial.js";

export const dialSpec: FigureSpec = {
  id: "dial",
  label:
    "A dial on a plate, ringed by ticks: it turns to face the pointer and the nearest tick lights.",
  rest: "rest",
  range: [0, 15, 45],
  tour: [[200, 96], [268, 190], [160, 210], null],
  engine: mount,
};
