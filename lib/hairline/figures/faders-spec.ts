import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/faders.js";

export const fadersSpec: FigureSpec = {
  id: "faders",
  label:
    "Four faders on a mixer strip: the one under the pointer follows its height and the rest settle back.",
  rest: "rest",
  range: [0.6, 1, 1.3],
  tour: [[150, 190], [196, 140], [248, 165], null],
  engine: mount,
};
