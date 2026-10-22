"use client";

import { useState } from "react";
import type { ComponentType, CSSProperties } from "react";
import { cx } from "@/lib/utils";
import { useMountEffect } from "@/lib/use-mount-effect";


export type AgentThinkingVariant = "wave" | "spin" | "bloom" | "sweep" | "stars" | "infinity" | "orbs";
export type AgentThinkingTone = "subtle" | "default" | "primary" | "accent";

export interface AgentThinkingProps {
  variant?: AgentThinkingVariant;
  label?: string;
  tone?: AgentThinkingTone;
  shimmer?: boolean;
  showTimer?: boolean;
  pill?: boolean;
  className?: string;
  labelClassName?: string;
}

const TONE_COLORS: Record<AgentThinkingTone, string> = {
  subtle: "var(--ink-3)",
  default: "var(--ink-2)",
  primary: "var(--ink)",
  accent: "var(--color-accent-500)",
};

const VARIANT_TONE: Record<AgentThinkingVariant, AgentThinkingTone> = {
  wave: "default",
  spin: "default",
  bloom: "default",
  sweep: "default",
  stars: "subtle",
  infinity: "default",
  orbs: "default",
};


const WAVE_DOT_COUNT = 4;
const WAVE_PERIOD_MS = 1100;

function WaveIndicator() {
  return (
    <span aria-hidden className="flex shrink-0 items-center gap-[3px]">
      {Array.from({ length: WAVE_DOT_COUNT }, (_, i) => (
        <span
          key={i}
          className="peach-agent-thinking-wave-dot size-[3.5px] rounded-full bg-current opacity-60"
          style={{ animationDelay: `${(-i * WAVE_PERIOD_MS) / 7}ms` }}
        />
      ))}
    </span>
  );
}


function SpinIndicator() {
  return (
    <svg aria-hidden viewBox="0 0 16 16" className="size-4 shrink-0">
      <circle cx={8} cy={8} r={6.25} fill="none" stroke="currentColor" strokeWidth={1.5} opacity={0.2} />
      <circle
        cx={8}
        cy={8}
        r={6.25}
        pathLength={100}
        strokeDasharray="26 74"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.5}
        strokeLinecap="round"
        className="peach-agent-thinking-comet"
        style={{ animationDuration: "1.1s" }}
      />
    </svg>
  );
}


const BLOOM_RING_PERIOD_S = 1.8;

const BLOOM_RING_REST = [
  { scale: 0.45, opacity: 0.3 },
  { scale: 0.95, opacity: 0.12 },
];

function BloomIndicator() {
  return (
    <span aria-hidden className="relative block size-4 shrink-0">
      <span className="absolute inset-[5.5px] rounded-full bg-current opacity-90" />
      {BLOOM_RING_REST.map((rest, i) => (
        <span
          key={i}
          className="peach-agent-thinking-ring absolute inset-0 rounded-full border border-current"
          style={{
            animationDelay: `${(-i * BLOOM_RING_PERIOD_S) / 2}s`,
            transform: `scale(${rest.scale})`,
            opacity: rest.opacity,
          }}
        />
      ))}
    </span>
  );
}


function SweepIndicator() {
  return (
    <span
      aria-hidden
      className="relative block h-[13px] w-4 shrink-0 overflow-hidden rounded-[4px]"
      style={{ background: "color-mix(in oklab, currentColor 12%, transparent)" }}
    >
      <span
        className="peach-agent-thinking-scan absolute inset-y-0 left-0 w-[7px]"
        style={{
          background: "linear-gradient(90deg, transparent, currentColor, transparent)",
          transform: "translateX(4.5px)",
          opacity: 0.45,
          animationDelay: "-0.4s",
        }}
      />
    </span>
  );
}

const STAR_PERIOD_S = 1.4;
const STAR_SIZE = 14;
const STAR_COUNT = 5;
const STAR_LAYOUT = [
  { x: 50, y: 46, scale: 1 },
  { x: 18, y: 22, scale: 0.55 },
  { x: 82, y: 26, scale: 0.45 },
  { x: 78, y: 76, scale: 0.55 },
  { x: 22, y: 78, scale: 0.4 },
];
const STAR_PATH = "M12 0C13 7 17 11 24 12C17 13 13 17 12 24C11 17 7 13 0 12C7 11 11 7 12 0Z";

function StarsIndicator() {
  const box = STAR_SIZE * 1.5;
  return (
    <span
      aria-hidden
      className="peach-agent-thinking-stars relative block shrink-0"
      style={{ width: box, height: box }}
    >
      {STAR_LAYOUT.slice(0, STAR_COUNT).map((star, i) => {
        const size = STAR_SIZE * star.scale;
        return (
          <svg
            key={i}
            viewBox="0 0 24 24"
            className="peach-agent-thinking-star absolute"
            style={{
              width: size,
              height: size,
              left: `${star.x}%`,
              top: `${star.y}%`,
              marginLeft: -size / 2,
              marginTop: -size / 2,
              animationDuration: `${STAR_PERIOD_S}s`,
              animationDelay: `${(i * STAR_PERIOD_S * 0.7) / STAR_COUNT}s`,
            }}
          >
            <path d={STAR_PATH} fill="currentColor" />
          </svg>
        );
      })}
    </span>
  );
}

const INFINITY_WIDTH = 32;
const INFINITY_TRAIL = 11;
const INFINITY_STROKE = 2.75;
const INFINITY_DURATION_S = 1.2;
const INFINITY_PATH =
  "M28 14C33 5 47 5 47 14C47 23 33 23 28 14C23 5 9 5 9 14C9 23 23 23 28 14Z";

function InfinityIndicator() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 56 28"
      className="shrink-0"
      style={{ width: INFINITY_WIDTH, height: INFINITY_WIDTH / 2, margin: "0 -4px" }}
    >
      <path
        d={INFINITY_PATH}
        fill="none"
        stroke="currentColor"
        strokeWidth={INFINITY_STROKE}
        opacity={0.15}
      />
      <path
        d={INFINITY_PATH}
        pathLength={100}
        fill="none"
        stroke="currentColor"
        strokeWidth={INFINITY_STROKE}
        strokeLinecap="round"
        strokeDasharray={`${INFINITY_TRAIL} ${100 - INFINITY_TRAIL}`}
        className="peach-agent-thinking-comet"
        style={{ animationDuration: `${INFINITY_DURATION_S}s` }}
      />
    </svg>
  );
}

const ORB_BOX = 16;
const ORB_LAYOUT = [
  { size: 4, orbit: 6, durationS: 1.7, delayS: 0 },
  { size: 3, orbit: 4.5, durationS: 2.3, delayS: -0.9 },
  { size: 3.5, orbit: 3, durationS: 2.9, delayS: -1.6 },
];

export function AgentThinkingOrbs({ className }: { className?: string }) {
  return (
    <span aria-hidden className={cx("relative block shrink-0", className)} style={{ width: ORB_BOX, height: ORB_BOX }}>
      {ORB_LAYOUT.map((orb, index) => (
        <span
          key={index}
          className="peach-agent-thinking-orbit absolute inset-0"
          style={{
            transform: `rotate(${(index * 360) / ORB_LAYOUT.length}deg)`,
            animationDuration: `${orb.durationS}s`,
            animationDelay: `${orb.delayS}s`,
          }}
        >
          <span
            className="absolute rounded-full bg-current"
            style={{
              width: orb.size,
              height: orb.size,
              top: ORB_BOX / 2 - orb.orbit - orb.size / 2,
              left: ORB_BOX / 2 - orb.size / 2,
              boxShadow: "0 0 5px 0.5px currentColor",
            }}
          />
        </span>
      ))}
    </span>
  );
}

function ElapsedTimer() {
  const [elapsed, setElapsed] = useState(0);

  useMountEffect(() => {
    const started = performance.now();
    const id = window.setInterval(
      () => setElapsed((performance.now() - started) / 1000),
      100,
    );
    return () => window.clearInterval(id);
  });

  return (
    <span className="font-mono text-caption-1-regular text-ink-3 tabular-nums">
      {elapsed.toFixed(1)}s
    </span>
  );
}

const INDICATOR: Record<AgentThinkingVariant, ComponentType> = {
  wave: WaveIndicator,
  spin: SpinIndicator,
  bloom: BloomIndicator,
  sweep: SweepIndicator,
  stars: StarsIndicator,
  infinity: InfinityIndicator,
  orbs: AgentThinkingOrbs,
};

export function AgentThinking({
  variant = "wave",
  label = "Thinking",
  tone,
  shimmer = true,
  showTimer = true,
  pill = false,
  className,
  labelClassName,
}: AgentThinkingProps) {
  const color = TONE_COLORS[tone ?? VARIANT_TONE[variant]];
  const Indicator = INDICATOR[variant];

  return (
    <div
      role="status"
      className={cx(
        "flex items-center",
        pill
          ? "w-fit gap-2 rounded-full border border-line bg-surface px-2.5 py-1"
          : "gap-2.5",
        className,
      )}
      style={{ color, "--peach-agent-thinking-tone": color } as CSSProperties}
    >
      <Indicator />
      <span
        aria-label={label}
        className={cx(
          labelClassName ?? (pill ? "text-caption-1-medium" : "text-body-medium"),
          shimmer && "peach-agent-thinking-label",
        )}
      >
        {label}
      </span>
      {showTimer && <ElapsedTimer />}
    </div>
  );
}
