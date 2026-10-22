"use client";

import { useId, useRef, useState } from "react";
import { routeFlow } from "@/components/lib/block-motion";
import { RouteDot } from "@/components/blocks/model-router/route-dot";
import type { ModelRoute } from "@/components/types";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const STROKE: Record<ModelRoute["color"], string> = {
  "chart-1": "var(--chart-1-active)",
  "chart-2": "var(--chart-2-active)",
  violet: "var(--violet)",
  schedule: "var(--schedule)",
};

const ROW = 26;
const ORIGIN_X = 8;
const DOT = 0.5;
const STROKE_W = 4;

function lanePath(y: number, originY: number, width: number) {
  const endX = width - 2;
  const bend = ORIGIN_X + width * 0.2;
  const flat = ORIGIN_X + width * 0.4;
  return `M ${ORIGIN_X} ${originY} C ${bend} ${originY}, ${flat} ${y}, ${endX} ${y}`;
}

export type GatewayVizProps = {
  routes: ModelRoute[];
  label: string;
  className?: string;
};

export function GatewayViz({ routes, label, className }: GatewayVizProps) {
  const rawId = useId().replace(/:/g, "");
  const fadeId = `gw-fade-${rawId}`;
  const maskId = `gw-mask-${rawId}`;
  const trackRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  useMountEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    const measure = () => {
      const next = Math.round(el.clientWidth);
      if (next > 0) setTrackWidth(next);
    };
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  });

  if (routes.length === 0) return null;

  const height = routes.length * ROW;
  const originY = height / 2;
  const maxThroughput = Math.max(...routes.map((route) => route.throughputPerSec), 1);

  return (
    <div className={cx("flex items-center gap-1.5", className)}>
      <p className="shrink-0 text-overline [writing-mode:vertical-rl]">{label}</p>
      <div ref={trackRef} className="min-w-0 flex-1" style={{ height }}>
        {trackWidth > 0 ? (
          <svg
            viewBox={`0 0 ${trackWidth} ${height}`}
            width={trackWidth}
            height={height}
            aria-hidden
          >
            <defs>
              <linearGradient id={fadeId} x1="0" y1="0" x2="1" y2="0">
                <stop offset="0" stopColor="white" stopOpacity="0" />
                <stop offset="0.05" stopColor="white" stopOpacity="0.2" />
                <stop offset="0.16" stopColor="white" stopOpacity="1" />
              </linearGradient>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width={trackWidth} height={height}>
                <rect width={trackWidth} height={height} fill={`url(#${fadeId})`} />
              </mask>
            </defs>

            <circle
              cx={ORIGIN_X}
              cy={originY}
              r={3.25}
              fill="none"
              stroke="var(--ink-3)"
              strokeWidth={1}
            />

            <g mask={`url(#${maskId})`}>
              {routes.map((route, index) => {
                const y = index * ROW + ROW / 2;
                const { gap, duration } = routeFlow(route.throughputPerSec / maxThroughput);
                const period = DOT + gap;

                return (
                  <path
                    key={route.id}
                    d={lanePath(y, originY, trackWidth)}
                    fill="none"
                    stroke={STROKE[route.color]}
                    strokeWidth={STROKE_W}
                    strokeLinecap="round"
                    className="route-flow"
                    style={{
                      strokeDasharray: `${DOT} ${gap}`,
                      ["--route-shift" as string]: `-${period}px`,
                      ["--route-duration" as string]: `${duration}s`,
                    }}
                  />
                );
              })}
            </g>
          </svg>
        ) : null}
      </div>
      <ul className="shrink-0" aria-label={label}>
        {routes.map((route) => (
          <li key={route.id} className="flex items-center gap-1.5" style={{ height: ROW }}>
            <RouteDot color={route.color} />
            <span className="hidden w-[7.25rem] truncate text-body-2-medium text-ink min-[520px]:inline">
              {route.name}
            </span>
            <span className="w-9 text-end font-mono text-micro tabular-nums text-ink-2">
              {route.throughputPerSec}/s
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
