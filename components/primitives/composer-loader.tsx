"use client";

import { useId } from "react";
import type { CSSProperties, ReactNode } from "react";
import { useElementSize } from "@/lib/use-element-size";
import { cx } from "@/lib/utils";

export interface ComposerLoaderProps {
  children: ReactNode;
  active?: boolean;
  colors?: [string, string, string, string];
  speed?: number;
  intensity?: number;
  bloom?: number;
  bloomStrength?: number;
  arc?: number;
  reverse?: boolean;
  radius?: number;
  line?: number;
  bloomOnly?: boolean;
  surface?: boolean;
  taper?: number;
  blend?: CSSProperties["mixBlendMode"];
  offset?: number;
  className?: string;
}

const DEFAULT_COLORS: [string, string, string, string] = [
  "#5eead4",
  "#46baec",
  "#e633a4",
  "#00faa7",
];

function hexTriplet(hex: string) {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

export function ComposerLoader({
  children,
  active = true,
  colors = DEFAULT_COLORS,
  speed = 4.5,
  intensity = 0.7,
  bloom = 16,
  bloomStrength = 0.3,
  arc = 120,
  reverse = false,
  radius,
  line = 2.5,
  bloomOnly = false,
  surface = true,
  taper = 0,
  blend,
  offset = 0,
  className,
}: ComposerLoaderProps) {
  const gradientId = `peach-cl-${useId().replace(/[^a-zA-Z0-9]/g, "")}`;
  const [clipRef, clipSize] = useElementSize<HTMLSpanElement>();
  const box = clipSize
    ? { w: Math.max(1, clipSize.width), h: Math.max(1, clipSize.height) }
    : { w: 640, h: 52 };

  const [c0, c1, c2, c3] = colors;
  const mid = `rgb(${hexTriplet(c1)
    .map((v, i) => Math.round((v + hexTriplet(c2)[i]) / 2))
    .join(",")})`;

  const band = (arc / 360) * 100;
  const rx = radius ?? box.h / 2;
  const cornerRadius = radius ?? 9999;
  const direction = reverse ? "reverse" : "normal";

  const cornerR = Math.min(rx, box.w / 2, box.h / 2);
  const perimeter = Math.max(1, 2 * (box.w + box.h) - 8 * cornerR + 2 * Math.PI * cornerR);
  const pxUnits = (px: number) => (px * 100) / perimeter;
  const dashPhase = (len: number, backPx: number) =>
    (reverse ? pxUnits(backPx) : len - band + pxUnits(backPx)) - offset * 100;

  const TAPER_STEPS = 14;
  const CRISP_BLUR = taper > 0 ? Math.max(0.5, line * 0.8) : 0.5;
  const stroke = (width: number, blur: number, opacity: number, dashLen: number, backPx: number) => {
    const copies = taper > 0 ? TAPER_STEPS : 1;
    return Array.from({ length: copies }, (_, index) => {
      const len = dashLen * (1 - (taper * index) / copies);
      const phase = dashPhase(dashLen, backPx) - (dashLen - len) / 2;
      return (
        <rect
          key={index}
          x={0}
          y={0}
          width={box.w}
          height={box.h}
          rx={rx}
          pathLength={100}
          fill="none"
          stroke={`url(#${gradientId})`}
          strokeWidth={width}
          strokeLinecap="round"
          strokeDasharray={`${len} ${100 - len}`}
          className="peach-composer-loader-rect"
          filter={blur > 0 ? `url(#${gradientId}-b${String(blur).replace(".", "_")})` : undefined}
          style={{
            opacity: opacity / copies,
            animation: `peach-composer-loader-dash ${speed}s linear ${(phase * speed) / 100}s infinite ${direction}`,
          }}
        />
      );
    });
  };

  const blurFilter = (radius: number) => (
    <filter
      key={radius}
      id={`${gradientId}-b${String(radius).replace(".", "_")}`}
      x="-50%"
      y="-50%"
      width="200%"
      height="200%"
    >
      <feGaussianBlur stdDeviation={radius} />
    </filter>
  );

  return (
    <div className={cx("relative", className)}>
      {surface && (
        <span
          aria-hidden
          className="absolute inset-0 bg-surface shadow-xs"
          style={{ borderRadius: cornerRadius }}
        />
      )}

      <span
        ref={clipRef}
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{
          borderRadius: cornerRadius,
          opacity: active ? 1 : 0,
          transition: "opacity 450ms ease",
          mixBlendMode: blend,
        }}
      >
        <svg
          width="100%"
          height="100%"
          viewBox={`0 0 ${box.w} ${box.h}`}
          preserveAspectRatio="none"
          style={{ opacity: intensity }}
        >
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor={c0} />
              <stop offset="30%" stopColor={c1} />
              <stop offset="50%" stopColor={mid} />
              <stop offset="70%" stopColor={c2} />
              <stop offset="100%" stopColor={c3} />
            </linearGradient>
            {[14, 6, CRISP_BLUR].map(blurFilter)}
          </defs>
          {bloom > 0 && stroke(bloom * 2, 14, bloomStrength, band * 0.9, bloom + 16)}
          {!bloomOnly && stroke(line * 3.2, 6, 0.8, band * 0.95, 10)}
          {!bloomOnly && stroke(line, CRISP_BLUR, 1, band, 0)}
        </svg>
      </span>

      <div className="relative">{children}</div>
    </div>
  );
}
