import { cx } from "@/lib/utils";

export type NavSelectionThumb = {
  left: number;
  top: number;
  width: number;
  height: number;
};

/**
 * Primary nav scrollport inside the dashboard rail.
 * `overflow-y: auto` also clips on the x axis; negative margin + extra width
 * borrow the aside's horizontal padding so the selection pill's radius (and any
 * inset ring) are not shaved off. Matches aside `p-3` (12px → `-m-3` / +24px).
 */
export function sidebarNavScrollerClass(collapsed: boolean) {
  return cx(
    "sidebar-nav-scroller min-h-0 shrink grow-0 basis-auto",
    !collapsed && "sidebar-nav-scroller-expanded",
  );
}

/** Sliding selection fill — use `bg-nav-selection`, not `bg-gradient-accent`. */
export const navSelectionThumbClass = cx(
  "pointer-events-none absolute left-0 top-0 z-0 rounded-2lg bg-nav-selection",
  "transition-[transform,width,height] duration-300 ease-in-out",
);

export function measureNavSelectionThumb(
  container: HTMLElement,
  selectedEl: HTMLElement | null,
): NavSelectionThumb | null {
  if (!selectedEl) return null;
  return {
    left: 0,
    top: selectedEl.offsetTop,
    width: container.clientWidth,
    height: selectedEl.offsetHeight,
  };
}
