"use client";

/**
 * PeachUI — BorderBeam
 * Animated accent border wrapper for composer surfaces.
 */

import type { CSSProperties, ReactNode } from "react";
import { cn } from "@/lib/utils";

export type BorderBeamSize = "sm" | "md" | "lg";
export type BorderBeamColorVariant = "accent" | "colorful" | "neutral";
export type BorderBeamPlacement = "inside" | "outside";
export type BorderBeamTheme = "light" | "dark";

export type SizeConfig = { pad: number; blur: number };

export const sizePresets: Record<BorderBeamSize, SizeConfig> = {
  sm: { pad: 1.25, blur: 0.6 },
  md: { pad: 1.5, blur: 0.8 },
  lg: { pad: 2, blur: 1 },
};

export type ThemeColors = {
  a: string;
  b: string;
  c: string;
};

export const themeColors: Record<BorderBeamTheme, ThemeColors> = {
  light: {
    a: "var(--color-accent-400)",
    b: "var(--color-accent-600)",
    c: "color-mix(in oklch, var(--color-accent-300) 70%, var(--color-accent-500))",
  },
  dark: {
    a: "var(--color-accent-300)",
    b: "var(--color-accent-500)",
    c: "color-mix(in oklch, var(--color-accent-200) 60%, var(--color-accent-400))",
  },
};

export const sizeThemePresets = sizePresets;

const colorfulLight: ThemeColors = {
  a: "var(--color-accent-400)",
  b: "#a855f7",
  c: "var(--color-accent-300)",
};

const colorfulDark: ThemeColors = {
  a: "var(--color-accent-300)",
  b: "#c084fc",
  c: "var(--color-accent-200)",
};

export type BorderBeamProps = {
  children: ReactNode;
  className?: string;
  size?: BorderBeamSize;
  colorVariant?: BorderBeamColorVariant;
  placement?: BorderBeamPlacement;
  strength?: number;
  active?: boolean;
  theme?: BorderBeamTheme;
  style?: CSSProperties;
};

export function BorderBeam({
  children,
  className,
  size = "md",
  colorVariant = "colorful",
  placement = "outside",
  strength = 1,
  active = true,
  theme = "light",
  style,
}: BorderBeamProps) {
  const { pad, blur } = sizePresets[size];
  const colors =
    colorVariant === "neutral"
      ? { a: "var(--line-strong)", b: "var(--ink-3)", c: "var(--line)" }
      : colorVariant === "accent"
        ? themeColors[theme]
        : theme === "dark"
          ? colorfulDark
          : colorfulLight;

  const opacity = Math.min(1, Math.max(0, strength));
  const ring = Math.max(1, pad);

  return (
    <div className={cn("relative isolate min-w-0", className)} style={style}>
      {active ? (
        <div
          aria-hidden
          className="pointer-events-none absolute overflow-hidden rounded-[inherit]"
          style={{
            inset: placement === "inside" ? ring : -ring,
            borderRadius: "inherit",
            opacity,
          }}
        >
          <div
            className="border-beam-spin absolute left-1/2 top-1/2 aspect-square w-[160%]"
            style={{
              background: `conic-gradient(from 0deg, transparent 0deg, transparent 268deg, ${colors.a} 300deg, ${colors.b} 328deg, ${colors.c} 348deg, transparent 360deg)`,
              filter: blur > 0 ? `blur(${blur}px)` : undefined,
            }}
          />
        </div>
      ) : null}
      <div className="relative z-[1] rounded-[inherit]">{children}</div>
    </div>
  );
}
