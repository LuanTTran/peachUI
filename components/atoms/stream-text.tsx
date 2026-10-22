"use client";


import { useRef, useState } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type StreamTextProps = {
  text: string;
  charsPerTick?: number;
  tickMs?: number;
  blurTail?: number;
  caret?: boolean;
  className?: string;
  onProgress?: () => void;
  onDone?: () => void;
};

export function StreamText({
  text,
  charsPerTick = 2,
  tickMs = 16,
  blurTail = 6,
  caret = true,
  className,
  onProgress,
  onDone,
}: StreamTextProps) {
  const [count, setCount] = useState(0);
  const onProgressRef = useRef(onProgress);
  const onDoneRef = useRef(onDone);
  onProgressRef.current = onProgress;
  onDoneRef.current = onDone;

  useMountEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setCount(text.length);
      onDoneRef.current?.();
      return;
    }

    let shown = 0;
    const id = window.setInterval(() => {
      shown = Math.min(shown + charsPerTick, text.length);
      setCount(shown);
      onProgressRef.current?.();
      if (shown >= text.length) {
        window.clearInterval(id);
        onDoneRef.current?.();
      }
    }, tickMs);

    return () => window.clearInterval(id);
  });

  const streaming = count < text.length;
  const shown = text.slice(0, count);
  const split = streaming ? Math.max(0, shown.length - blurTail) : shown.length;

  return (
    <span className={cx("text-pretty", className)}>
      {shown.slice(0, split)}
      {split < shown.length ? <span className="stream-tail">{shown.slice(split)}</span> : null}
      {caret ? <span aria-hidden className={cx("stream-caret", streaming && "is-streaming")} /> : null}
    </span>
  );
}
