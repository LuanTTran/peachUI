import type { FigureSpec } from "@/lib/hairline/types";
import { mount } from "@/lib/hairline/figures/file-spread.js";

export const fileSpreadSpec: FigureSpec = {
  id: "file-spread",
  label:
    "Three file cards: the centre fills the frame while the sides peek behind, then fan apart on open.",
  rest: "rest",
  range: [0.06, 0.2, 1],
  tour: [[168, 168], [200, 158], [232, 168], null],
  engine: mount,
};
