"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

/** Overdamped spring — figures glide, never bounce. */
const NUMBER_SPRING = { stiffness: 90, damping: 24, restDelta: 0.01 } as const;

const formatInteger = (value: number) =>
  Math.round(value).toLocaleString("en-US");

/**
 * A number that springs to its new value when `value` changes — the shared
 * replacement for `useCountUp`. The spring subscribes during render, so a
 * `target.set` mid-render lands without an effect; the mount hook re-fires
 * the first set so the initial render counts up from zero.
 */
export function AnimatedNumber({
  value,
  format = formatInteger,
  className,
}: {
  value: number;
  format?: (value: number) => string;
  className?: string;
}) {
  const reduce = useReducedMotion();
  const target = useMotionValue(0);
  const spring = useSpring(target, NUMBER_SPRING);
  const text = useTransform(spring, (latest: number) => format(latest));

  /* Prop changes: the spring is already subscribed, so a set lands. The
   * MotionValue dedupes repeats, so the guard just avoids useless work. */
  if (target.get() !== value) target.set(value);

  /* First tick: set during render ran before attachFollow subscribed, so
   * re-fire now that the spring listens — counts up from zero once. */
  useMountEffect(() => {
    target.set(0);
    target.set(value);
  });

  if (reduce) return <span className={className}>{format(value)}</span>;
  return (
    <motion.span className={cx("tabular-nums", className)}>{text}</motion.span>
  );
}
