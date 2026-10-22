import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/drawers.js";

export const drawersSpec: FigureSpec = {
  id: "drawers",
  label:
    "Twelve drawers in a parts cabinet: the one under the pointer slides open and its neighbours budge in turn.",
  rest: "rest",
  range: [0, 45, 90],
  tour: [[149, 171], [223, 244], [112, 114], null],
  engine: mount,
};
