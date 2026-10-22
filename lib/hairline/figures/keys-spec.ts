import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/keys.js";

export const keysSpec: FigureSpec = {
  id: "keys",
  label:
    "Eleven keys on a low slab: the one under the pointer sinks and its neighbours dip in turn.",
  rest: "rest",
  range: [0, 45, 90],
  tour: [[168, 150], [226, 176], [200, 205], null],
  engine: mount,
};
