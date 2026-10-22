"use client";

import { useState } from "react";
import type { FigureSpec } from "@/lib/hairline/types";
import { drawersSpec } from "@/lib/hairline/figures/drawers-spec";
import { fadersSpec } from "@/lib/hairline/figures/faders-spec";
import { keysSpec } from "@/lib/hairline/figures/keys-spec";
import { dialSpec } from "@/lib/hairline/figures/dial-spec";
import { useHairlineFigure } from "@/lib/use-hairline-figure";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const SPECS: FigureSpec[] = [drawersSpec, fadersSpec, keysSpec, dialSpec];
const DWELL_MS = 6500;

/**
 * One figure's stage. Mounts the spec on the host div and plays its tour
 * once; unmounts clean when the loop keys past it.
 */
function FigureStage({ spec }: { spec: FigureSpec }) {
  const el = useHairlineFigure(spec, { play: true });

  return <div ref={el} className="doc-hero-fig-stage" />;
}

/**
 * Landing-page artwork: a rotating plate of Peach Hairline figures, authored
 * with hairline-create. Each one plays its tour on mount, then the loop
 * advances. Pointer still answers while it's on the plate.
 */
export function DrawersHero({ className }: { className?: string }) {
  const [index, setIndex] = useState(0);

  useMountEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % SPECS.length), DWELL_MS);
    return () => clearInterval(id);
  });

  const spec = SPECS[index];
  return (
    <div className={cx("doc-hero-fig", className)}>
      <FigureStage key={spec.id} spec={spec} />
    </div>
  );
}
