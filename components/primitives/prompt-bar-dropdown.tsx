"use client";

import { useRef, useState, type CSSProperties, type ReactNode, type RefObject } from "react";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";
import { createPortal } from "react-dom";

export const PROMPT_BAR_MENU_LAYER = "z-50";

export const PROMPT_BAR_DROPDOWN_PANEL =
  "overflow-hidden rounded-panel border border-line bg-surface p-1.5 shadow-overlay";

export const PROMPT_BAR_DROPDOWN_MOTION = "pop-in 180ms cubic-bezier(0.23,1,0.32,1) both";

function samePlacement(a: CSSProperties, b: CSSProperties) {
  return (
    a.top === b.top &&
    a.bottom === b.bottom &&
    a.left === b.left &&
    a.width === b.width &&
    a.position === b.position &&
    a.zIndex === b.zIndex
  );
}

export function usePromptBarDropdownPlacement(
  open: boolean,
  triggerRef: RefObject<HTMLElement | null>,
  width: number,
  flipUp: boolean | "auto",
  boundsRef?: RefObject<HTMLElement | null>,
) {
  const [style, setStyle] = useState<CSSProperties | null>(null);
  const placeRef = useRef<() => void>(() => {});

  const place = () => {
    const trigger = triggerRef.current;
    if (!open || !trigger) {
      setStyle((current) => (current === null ? current : null));
      return;
    }
    const triggerBox = trigger.getBoundingClientRect();
    const boundsBox = boundsRef?.current?.getBoundingClientRect() ?? triggerBox;
    const gap = 6;
    let left = triggerBox.left;
    if (boundsRef?.current) {
      left = Math.max(boundsBox.left, Math.min(left, boundsBox.right - width));
    }
    left = Math.max(8, Math.min(left, window.innerWidth - width - 8));

    const flip = flipUp === "auto" ? boundsBox.top > window.innerHeight - boundsBox.bottom : flipUp;

    if (flip) {
      const next: CSSProperties = {
        position: "fixed",
        bottom: window.innerHeight - boundsBox.top + gap,
        left,
        width,
        zIndex: 60,
      };
      setStyle((current) => (current && samePlacement(current, next) ? current : next));
      return;
    }

    const next: CSSProperties = {
      position: "fixed",
      top: boundsBox.bottom + gap,
      left,
      width,
      zIndex: 60,
    };
    setStyle((current) => (current && samePlacement(current, next) ? current : next));
  };

  useDomLayout(() => {
    placeRef.current = place;
    place();
  });

  useMountEffect(() => {
    const onMove = () => placeRef.current();
    window.addEventListener("resize", onMove);
    window.addEventListener("scroll", onMove, true);
    return () => {
      window.removeEventListener("resize", onMove);
      window.removeEventListener("scroll", onMove, true);
    };
  });

  return style;
}

export function PromptBarDropdown({
  open,
  portal,
  portalStyle,
  anchoredStyle,
  className,
  origin,
  children,
}: {
  open: boolean;
  portal: boolean;
  portalStyle: CSSProperties | null;
  anchoredStyle?: CSSProperties;
  className: string;
  origin: string;
  children: ReactNode;
}) {
  if (!open) return null;
  if (portal && !portalStyle) return null;

  const panel = (
    <div
      data-promptbar-menu
      className={className}
      style={{
        animation: PROMPT_BAR_DROPDOWN_MOTION,
        transformOrigin: origin,
        ...(portal ? portalStyle : anchoredStyle),
      }}
    >
      {children}
    </div>
  );

  if (portal) {
    return createPortal(panel, document.body);
  }
  return panel;
}
