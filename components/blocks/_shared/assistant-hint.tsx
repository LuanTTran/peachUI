"use client";

/**
 * PeachUI — AssistantHint (block shared)
 * @tier block
 * @requires app/globals.css
 *
 * Slim word-stream hint for rails (audit explorer, sales pipeline).
 */

import { useState } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const WORD_MS = 34;

export type AssistantHintProps = {
  text: string;
  tone?: "ink" | "ink-2";
  className?: string;
  onDone?: () => void;
};

function HintStream({
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

export function AssistantHint({ text, tone = "ink-2", className, onDone }: AssistantHintProps) {
  const [reduced, setReduced] = useState(false);

  useMountEffect(() => {
    const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    setReduced(isReduced);
    if (isReduced) {
      onDone?.();
    }
  });

  if (reduced) {
    return (
      <p
        className={cx(
          "max-w-[620px] text-body text-pretty",
          tone === "ink" ? "text-ink" : "text-ink-2",
          className,
        )}
      >
        {text}
      </p>
    );
  }

  return (
    <div className={className}>
      <HintStream text={text} tone={tone} onDone={onDone} />
    </div>
  );
}
