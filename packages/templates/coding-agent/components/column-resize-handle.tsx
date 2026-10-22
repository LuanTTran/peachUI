"use client";

/**
 * Column resize handle — zero-width splitter overlaid on a panel seam.
 * Pointer drag (with capture), arrow keys, Home/End, double-click reset.
 * Desktop only: the wrapper hides itself below lg.
 */

import { useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const KEY_STEP = 16;

export function ColumnResizeHandle({
  side,
  label,
  width,
  min,
  max,
  defaultWidth,
  onResize,
}: {
  /** Which column the seam controls: nav widens rightward, panel widens leftward. */
  side: "nav" | "panel";
  label: string;
  /** Currently displayed column width in px. */
  width: number;
  min: number;
  max: number;
  defaultWidth: number;
  onResize: (width: number) => void;
}) {
  const [dragging, setDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; startX: number; startWidth: number } | null>(null);
  const direction = side === "nav" ? 1 : -1;
  const clamp = (value: number) => Math.round(Math.min(max, Math.max(min, value)));

  const endDrag = () => {
    if (!dragRef.current) return;
    dragRef.current = null;
    setDragging(false);
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  };

  // Restore document styles if the shell unmounts mid-drag.
  useMountEffect(() => () => {
    document.body.style.cursor = "";
    document.body.style.userSelect = "";
  });

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    event.currentTarget.focus();
    dragRef.current = { pointerId: event.pointerId, startX: event.clientX, startWidth: width };
    setDragging(true);
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    onResize(clamp(drag.startWidth + (event.clientX - drag.startX) * direction));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    const drag = dragRef.current;
    if (event.key === "Escape" && drag) {
      event.preventDefault();
      onResize(clamp(drag.startWidth));
      endDrag();
      return;
    }
    const step = event.shiftKey ? KEY_STEP * 4 : KEY_STEP;
    const next =
      event.key === "ArrowRight"
        ? width + step * direction
        : event.key === "ArrowLeft"
          ? width - step * direction
          : event.key === "Home"
            ? min
            : event.key === "End"
              ? max
              : null;
    if (next === null) return;
    event.preventDefault();
    onResize(clamp(next));
  };

  return (
    <div className="relative hidden w-0 shrink-0 self-stretch lg:block">
      <div
        role="separator"
        aria-label={label}
        aria-orientation="vertical"
        aria-valuemin={min}
        aria-valuemax={max}
        aria-valuenow={Math.round(width)}
        aria-valuetext={`${Math.round(width)} pixels`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onLostPointerCapture={endDrag}
        onKeyDown={handleKeyDown}
        onDoubleClick={() => onResize(defaultWidth)}
        className={cx(
          "absolute inset-y-0 -inset-x-1.5 cursor-col-resize touch-none outline-none",
          "after:absolute after:inset-y-0 after:left-1/2 after:w-0.5 after:-translate-x-1/2 after:bg-transparent after:transition-colors after:duration-100",
          dragging ? "after:bg-accent" : "hover:after:bg-accent focus-visible:after:bg-accent",
        )}
      />
    </div>
  );
}
