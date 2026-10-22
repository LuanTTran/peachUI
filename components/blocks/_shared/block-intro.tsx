"use client";

/**
 * PeachUI — BlockIntro (block shared)
 * @tier block
 * @requires app/globals.css
 *
 * Word-stream intro, then children with a fade-up reveal.
 */

import { useState, type ReactNode } from "react";
import { fadeUpStyle } from "@/components/lib/block-motion";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const WORD_MS = 34;

export type BlockIntroProps = {
  intro: string;
  children?: ReactNode;
  className?: string;
  artifactClassName?: string;
  tone?: "ink" | "ink-2";
  /** Fires when the intro stream finishes. */
  onIntroDone?: () => void;
  /** Fires when children mount after the intro. */
  onReady?: () => void;
  /** When false, nothing renders. */
  active?: boolean;
};

function IntroStream({
  text,
  tone,
  onDone,
}: {
  text: string;
  tone: "ink" | "ink-2";
  onDone?: () => void;
}) {
  const words = text.split(" ");
  const [count, setCount] = useState(0);
  const streaming = count < words.length;

  useMountEffect(() => {
    let index = 0;
    const tick = () => {
      index += 1;
      setCount(index);
      if (index >= words.length) {
        onDone?.();
        return;
      }
      window.setTimeout(tick, WORD_MS);
    };
    window.setTimeout(tick, WORD_MS);
  });

  return (
    <p
      className={cx(
        "max-w-[620px] text-body text-pretty",
        tone === "ink" ? "text-ink" : "text-ink-2",
      )}
    >
      {words.slice(0, count).map((word, i) => (
        <span key={i} className="inline">
          {word}{" "}
        </span>
      ))}
      {streaming ? <span className="stream-caret is-streaming" aria-hidden /> : null}
    </p>
  );
}

export function BlockIntro({
  intro,
  children,
  className,
  artifactClassName,
  tone = "ink-2",
  onIntroDone,
  onReady,
  active = true,
}: BlockIntroProps) {
  const [ready, setReady] = useState(false);
  const [reduced, setReduced] = useState(false);

  useMountEffect(() => {
    if (!active) return;
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(isReduced);
    if (isReduced) {
      setReady(true);
      onIntroDone?.();
      onReady?.();
    }
  });

  const finishIntro = () => {
    onIntroDone?.();
    setReady(true);
    onReady?.();
  };

  if (!active) {
    return null;
  }

  const showChildren = ready && children != null;

  return (
    <div className={cx("min-w-0", className)}>
      {reduced ? (
        <p
          className={cx(
            "max-w-[620px] text-body text-pretty",
            tone === "ink" ? "text-ink" : "text-ink-2",
          )}
        >
          {intro}
        </p>
      ) : (
        <IntroStream text={intro} tone={tone} onDone={finishIntro} />
      )}
      {showChildren ? (
        <div className={cx("mt-5", artifactClassName)} style={reduced ? undefined : fadeUpStyle}>
          {children}
        </div>
      ) : null}
    </div>
  );
}
