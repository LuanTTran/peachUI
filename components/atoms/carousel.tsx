"use client";

import {
  Children,
  cloneElement,
  isValidElement,
  useRef,
  useState,
  type HTMLAttributes,
  type ReactNode,
  type Ref,
} from "react";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";
import { ChevronLeft, ChevronRight } from "reicon-react";
import { IconButton } from "@/components/atoms/icon-button";
import { cx } from "@/lib/utils";

export interface CarouselProps
  extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "onScroll"> {
  children: ReactNode;
  "aria-label": string;
  showArrows?: boolean;
  showDots?: boolean;
  align?: "start" | "center";
  gap?: number;
  ref?: Ref<HTMLDivElement>;
}

export interface CarouselItemProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function CarouselItem({ children, className, ref, ...props }: CarouselItemProps) {
  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="slide"
      className={cx("w-full shrink-0 snap-start", className)}
      {...props}
    >
      {children}
    </div>
  );
}

function scrollOffsetForItem(
  track: { left: number; right: number },
  item: { left: number; right: number },
  scrollLeft: number,
  align: "start" | "center" = "start",
): number {
  if (align === "center") return scrollLeft + (item.left + item.right - track.left - track.right) / 2;
  return scrollLeft + item.left - track.left;
}

export function Carousel({
  children,
  showArrows = true,
  showDots = true,
  align = "start",
  gap = 16,
  className,
  ref,
  ...props
}: CarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  const count = Children.toArray(children).filter(isValidElement).length;

  const items = () => Array.from(trackRef.current?.children ?? []) as HTMLElement[];

  const measure = () => {
    const track = trackRef.current;
    if (!track) return;

    const offset = Math.max(0, track.scrollLeft);
    const start = offset <= 1;
    const end = offset >= track.scrollWidth - track.clientWidth - 1;
    setAtStart(start);
    setAtEnd(end);

    const all = items();
    if (all.length === 0) return;

    if (end) {
      setActive(all.length - 1);
      return;
    }
    if (start) {
      setActive(0);
      return;
    }

    let nearest = 0;
    let shortest = Number.POSITIVE_INFINITY;
    all.forEach((item, index) => {
      const distance = Math.abs(scrollOffsetForItem(track.getBoundingClientRect(), item.getBoundingClientRect(), 0, align));
      if (distance < shortest) {
        shortest = distance;
        nearest = index;
      }
    });
    setActive(nearest);
  };

  const measureRef = useRef(measure);
  useDomLayout(() => {
    measureRef.current = measure;
  });

  useMountEffect(() => {
    const track = trackRef.current;
    if (!track) return;

    const observer = new ResizeObserver(() => measureRef.current());
    observer.observe(track);
    return () => observer.disconnect();
  });

  const scrollToIndex = (index: number) => {
    const track = trackRef.current;
    const target = items()[Math.max(0, Math.min(index, count - 1))];
    if (!track || !target) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const left = scrollOffsetForItem(track.getBoundingClientRect(), target.getBoundingClientRect(), track.scrollLeft, align);
    track.scrollTo({ left, behavior: reduce ? "auto" : "smooth" });
  };

  return (
    <div
      ref={ref}
      role="group"
      aria-roledescription="carousel"
      className={cx("flex w-full flex-col gap-4", className)}
      {...props}
    >
      {showArrows && count > 0 ? (
        <div className="flex items-center justify-end gap-2">
          <IconButton
            icon={ChevronLeft}
            size="small"
            aria-label="Previous slide"
            disabled={atStart}
            onClick={() => scrollToIndex(active - 1)}
          />
          <IconButton
            icon={ChevronRight}
            size="small"
            aria-label="Next slide"
            disabled={atEnd}
            onClick={() => scrollToIndex(active + 1)}
          />
        </div>
      ) : null}

      <div
        ref={trackRef}
        tabIndex={0}
        onScroll={measure}
        className={cx(
          "relative flex w-full overflow-x-auto overscroll-x-contain outline-none",
          "snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          align === "center" && "[&>*]:snap-center",
        )}
        style={{ gap }}
      >
        {Children.map(children, (child, index) =>
          isValidElement<CarouselItemProps>(child)
            ? cloneElement(child, { "aria-label": `${index + 1} of ${count}` })
            : child,
        )}
      </div>

      {showDots && count > 1 ? (
        <div className="flex items-center justify-center gap-1.5">
          {Array.from({ length: count }, (_, index) => (
            <button
              key={index}
              type="button"
              aria-label={`Go to slide ${index + 1}`}
              aria-current={index === active}
              onClick={() => scrollToIndex(index)}
              className={cx(
                "h-1.5 cursor-pointer rounded-full transition-all duration-200 ease-out",
                index === active
                  ? "w-4 bg-ink"
                  : "w-1.5 bg-hover-2 hover:bg-line-strong",
              )}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}
