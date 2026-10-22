"use client";

import { useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { motion, useReducedMotion } from "@/components/lib/motion";
import { useTicker } from "@/lib/use-ticker";
import { AgentThinking } from "@/components/primitives/agent-thinking";
import { cx } from "@/lib/utils";

export const SOFT_EASE = [0.22, 1, 0.36, 1] as const;

const REVEAL_FADE_VAR = "--peach-reveal-fade";

const REVEAL_GRADIENT = `linear-gradient(to bottom, #000 calc(100% - var(${REVEAL_FADE_VAR}, 0px)), transparent calc(100% + 1px))`;

const REVEAL_MASK: CSSProperties = {
  WebkitMaskImage: REVEAL_GRADIENT,
  maskImage: REVEAL_GRADIENT,
};

export const UNIT_INITIAL = {
  opacity: 0,
  height: 0,
  y: 4,
  filter: "blur(6px)",
  [REVEAL_FADE_VAR]: "22px",
};

export const UNIT_ANIMATE = {
  opacity: 1,
  height: "auto",
  y: 0,
  filter: "blur(0px)",
  [REVEAL_FADE_VAR]: "0px",
};

export const UNIT_TRANSITION = {
  height: { duration: 0.38, ease: SOFT_EASE },
  opacity: { duration: 0.42, ease: SOFT_EASE },
  filter: { duration: 0.42, ease: SOFT_EASE },
  y: { duration: 0.42, ease: SOFT_EASE },
  [REVEAL_FADE_VAR]: { duration: 0.44, ease: SOFT_EASE },
};

export function useRevealMask(reduce: boolean) {
  const [revealing, setRevealing] = useState(!reduce);
  return {
    style: revealing ? REVEAL_MASK : undefined,
    onAnimationComplete: () => setRevealing(false),
  };
}

export function ShimmerText({
  children,
  className,
  style,
}: {
  children: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span aria-label={children} className={cx("agent-progress-loading-text", className)} style={style}>
      {children}
    </span>
  );
}

export interface RevealTickerOptions {
  total: number;
  run?: boolean;
  stepInterval?: number;
  startDelay?: number;
  revealed?: number;
  delayFor?: (index: number) => number;
  onComplete?: () => void;
}

export function useRevealTicker({
  total,
  run = true,
  stepInterval = 850,
  startDelay = 320,
  revealed: controlled,
  delayFor,
  onComplete,
}: RevealTickerOptions): number {
  const isControlled = controlled !== undefined;
  const [ticked, setTicked] = useState(0);
  const revealed = isControlled ? Math.max(0, Math.min(controlled, total)) : ticked;

  useTicker(
    () => setTicked((n) => n + 1),
    isControlled || !run || revealed >= total
      ? null
      : delayFor
        ? delayFor(revealed)
        : revealed === 0
          ? startDelay
          : stepInterval,
    revealed,
  );

  const complete = total > 0 && revealed >= total;
  useTicker(() => onComplete?.(), complete ? 0 : null, complete);

  return revealed;
}

const BRANCH_Y = 14;
const BRANCH_RADIUS = 6;
const BRANCH_WIDTH = 12;

const BRANCH_PATH = `M0.5 0 V${BRANCH_Y - BRANCH_RADIUS} Q0.5 ${BRANCH_Y} ${0.5 + BRANCH_RADIUS} ${BRANCH_Y} H11.5`;

const TAIL_TRANSITION = { duration: 0.12, ease: "linear" as const, delay: 0 };

const branchTransition = (first: boolean) => ({
  duration: 0.14,
  ease: "linear" as const,
  delay: first ? 0 : 0.12,
});

export function RowConnector({
  first,
  last,
  reduce,
}: {
  first: boolean;
  last: boolean;
  reduce: boolean;
}) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-y-0 start-0 w-3 text-line-strong"
    >
      <svg
        width={BRANCH_WIDTH}
        height={BRANCH_Y + 1}
        viewBox={`0 0 ${BRANCH_WIDTH} ${BRANCH_Y + 1}`}
        fill="none"
        className="absolute top-0 start-0 "
      >
        <motion.path
          d={BRANCH_PATH}
          stroke="currentColor"
          strokeWidth="1"
          initial={reduce ? false : { pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={branchTransition(first)}
        />
      </svg>
      {!last && (
        <motion.span
          className="absolute start-0 w-px origin-top bg-current"
          style={{ top: BRANCH_Y - BRANCH_RADIUS, bottom: 0 }}
          initial={reduce ? false : { scaleY: 0 }}
          animate={{ scaleY: 1 }}
          transition={TAIL_TRANSITION}
        />
      )}
    </span>
  );
}

export function GuideBridge({
  height,
  offset = 8,
  reduce,
}: {
  height: number;
  offset?: number;
  reduce: boolean;
}) {
  return (
    <motion.span
      aria-hidden
      className="pointer-events-none absolute w-px origin-top bg-current text-line-strong"
      style={{ top: -height, height, insetInlineStart: offset }}
      initial={reduce ? false : { scaleY: 0 }}
      animate={{ scaleY: 1 }}
      transition={TAIL_TRANSITION}
    />
  );
}

export function WorkingRow({
  label,
  reduce,
  className,
}: {
  label: string;
  reduce: boolean;
  className?: string;
}) {
  const mask = useRevealMask(reduce);
  return (
    <motion.div
      initial={reduce ? false : UNIT_INITIAL}
      animate={UNIT_ANIMATE}
      transition={UNIT_TRANSITION}
      {...mask}
      className={cx("overflow-hidden", className)}
    >
      <div className="py-1">
        <AgentThinking variant="stars" label={label} />
      </div>
    </motion.div>
  );
}

export function useLogMotion() {
  return useReducedMotion() ?? false;
}

export function LogRow({
  first,
  last,
  reduce,
  className,
  children,
}: {
  first: boolean;
  last: boolean;
  reduce: boolean;
  className?: string;
  children: ReactNode;
}) {
  const mask = useRevealMask(reduce);
  return (
    <motion.li
      initial={reduce ? false : UNIT_INITIAL}
      animate={UNIT_ANIMATE}
      transition={UNIT_TRANSITION}
      {...mask}
      className={cx("relative overflow-hidden ps-4", className)}
    >
      <RowConnector first={first} last={last} reduce={reduce} />
      {children}
    </motion.li>
  );
}
