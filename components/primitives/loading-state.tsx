"use client";


import { useState } from "react";
import { ShimmerText } from "@/components/primitives/agent-log";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type LoadingStateVariant = "Drive" | "Dots" | "Orbit";

const chevron = Array.from({ length: 9 }, (_, index) => {
  const row = Math.floor(index / 3);
  const column = index % 3;
  return (column + Math.abs(row - 1)) * 90;
});

const ORBIT_ORDER = [0, 1, 2, 5, 8, 7, 6, 3];
const orbit = Array.from({ length: 9 }, (_, index) => {
  const step = ORBIT_ORDER.indexOf(index);
  return step === -1 ? null : step * 110;
});

const PATTERNS: Record<LoadingStateVariant, { delays: (number | null)[]; dur: number; round: boolean }> = {
  Drive: { delays: chevron, dur: 650, round: false },
  Dots: { delays: chevron, dur: 650, round: true },
  Orbit: { delays: orbit, dur: 950, round: false },
};

function formatElapsed(deciseconds: number) {
  const total = deciseconds / 10;
  if (total < 60) return `${total.toFixed(1)}s`;
  const minutes = Math.floor(total / 60);
  return `${minutes}m ${(total % 60).toFixed(1)}s`;
}

export type LoadingStateProps = {
  label?: string;
  variant?: LoadingStateVariant;
  className?: string;
};

export function LoadingState({ label = "Drafting the reply", variant = "Drive", className }: LoadingStateProps) {
  const [deciseconds, setDeciseconds] = useState(0);
  const { delays, dur, round } = PATTERNS[variant];

  useMountEffect(() => {
    const id = window.setInterval(() => setDeciseconds((current) => current + 1), 100);
    return () => window.clearInterval(id);
  });

  return (
    <div role="status" className={cx("flex w-fit items-center gap-2.5", className)}>
      <span aria-hidden className="grid shrink-0 grid-cols-[repeat(3,4px)] gap-[1.5px]">
        {delays.map((delay, index) => (
          <span
            key={index}
            className={cx("size-1 bg-ink", round ? "rounded-full" : "rounded-[1px]")}
            style={{
              opacity: delay === null ? 0.07 : 0.15,
              animation: delay === null ? "none" : `pixel-on ${dur}ms ease-in-out ${delay}ms infinite`,
            }}
          />
        ))}
      </span>
      <ShimmerText className="text-meta font-medium">{label}</ShimmerText>
      <span className="font-mono text-caption tabular-nums">{formatElapsed(deciseconds)}</span>
    </div>
  );
}
