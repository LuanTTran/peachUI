"use client";

import {
  useId,
  useRef,
  useState,
  type ClipboardEvent,
  type KeyboardEvent,
  type Ref,
} from "react";
import { cx } from "@/lib/utils";

export interface InputOtpProps {
  length?: number;
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;
  onComplete?: (value: string) => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  groupEvery?: number;
  "aria-label"?: string;
  className?: string;
  ref?: Ref<HTMLDivElement>;
}

const DIGITS_ONLY = /\D/g;

export function InputOtp({
  length = 6,
  value,
  defaultValue = "",
  onChange,
  onComplete,
  isDisabled = false,
  isInvalid = false,
  groupEvery,
  "aria-label": ariaLabel = "One-time code",
  className,
  ref,
}: InputOtpProps) {
  const groupId = useId();
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);
  const [internal, setInternal] = useState(defaultValue.replace(DIGITS_ONLY, "").slice(0, length));

  const controlled = value !== undefined;
  const code = (controlled ? value : internal).replace(DIGITS_ONLY, "").slice(0, length);

  const commit = (next: string) => {
    const clean = next.replace(DIGITS_ONLY, "").slice(0, length);
    if (!controlled) setInternal(clean);
    onChange?.(clean);
    if (clean.length === length) onComplete?.(clean);
  };

  const focusBox = (index: number) => {
    const target = inputsRef.current[Math.max(0, Math.min(index, length - 1))];
    target?.focus();
    target?.select();
  };

  const writeFrom = (index: number, digits: string) => {
    const clean = digits.replace(DIGITS_ONLY, "");
    if (clean === "") return;

    const chars = code.padEnd(length, " ").split("");
    for (let offset = 0; offset < clean.length && index + offset < length; offset += 1) {
      chars[index + offset] = clean[offset];
    }
    commit(chars.join("").trimEnd());
    focusBox(index + clean.length);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>, index: number) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      if (code[index]) {
        const chars = code.padEnd(length, " ").split("");
        chars[index] = " ";
        commit(chars.join("").trimEnd());
        return;
      }
      const chars = code.padEnd(length, " ").split("");
      chars[Math.max(0, index - 1)] = " ";
      commit(chars.join("").trimEnd());
      focusBox(index - 1);
      return;
    }

    if (event.key === "ArrowLeft") {
      event.preventDefault();
      focusBox(index - 1);
    } else if (event.key === "ArrowRight") {
      event.preventDefault();
      focusBox(index + 1);
    }
  };

  const onPaste = (event: ClipboardEvent<HTMLInputElement>, index: number) => {
    event.preventDefault();
    writeFrom(index, event.clipboardData.getData("text"));
  };

  return (
    <div
      ref={ref}
      role="group"
      dir="ltr"
      aria-label={ariaLabel}
      className={cx("flex items-center gap-2", className)}
    >
      {Array.from({ length }, (_, index) => {
        const filled = code[index] ?? "";
        const gapBefore = groupEvery !== undefined && index > 0 && index % groupEvery === 0;

        return (
          /* basis-12 holds the 48px box; shrink + min-w-0 let it squeeze
           * below that on narrow cards, aspect-square keeps it square. */
          <div key={index} className={cx("flex min-w-0 basis-12 items-center", gapBefore && "ms-3")}>
            <input
              ref={(node) => {
                inputsRef.current[index] = node;
              }}
              id={`${groupId}-${index}`}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={length}
              disabled={isDisabled}
              aria-label={`Digit ${index + 1} of ${length}`}
              aria-invalid={isInvalid || undefined}
              value={filled}
              onChange={(event) => writeFrom(index, event.target.value)}
              onKeyDown={(event) => onKeyDown(event, index)}
              onPaste={(event) => onPaste(event, index)}
              onFocus={(event) => event.target.select()}
              className={cx(
                "aspect-square w-full min-w-0 rounded-2lg text-center font-mono text-title-3-medium tabular-nums",
                "bg-surface text-ink",
                "border border-line shadow-xs",
                "transition-[background-color,border-color,box-shadow] duration-150 ease outline-none",
                "hover:border-line-strong",
                "focus-visible:border-accent focus-visible:ring-2 focus-visible:ring-accent",
                isInvalid &&
                  "border-red bg-red-muted text-red hover:border-red",
                isDisabled &&
                  "cursor-not-allowed bg-disabled-bg text-ink-3 shadow-none",
              )}
            />
          </div>
        );
      })}
    </div>
  );
}
