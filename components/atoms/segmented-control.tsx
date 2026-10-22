"use client";

import type { ReactNode, Ref } from "react";
import {
  ToggleButton as AriaToggleButton,
  ToggleButtonGroup as AriaToggleButtonGroup,
} from "react-aria-components";
import type {
  ToggleButtonGroupProps as AriaToggleButtonGroupProps,
  ToggleButtonProps as AriaToggleButtonProps,
} from "react-aria-components";
import { useSelectionThumb } from "@/lib/use-selection-thumb";
import { cx } from "@/lib/utils";

export type SegmentedControlVariant = "solid" | "plain";

export interface SegmentedControlProps
  extends Omit<AriaToggleButtonGroupProps, "selectionMode" | "disallowEmptySelection"> {
  children?: ReactNode;
  variant?: SegmentedControlVariant;
  ref?: Ref<HTMLDivElement>;
}

type Thumb = { left: number; top: number; width: number; height: number };

export function SegmentedControl({ className, children, variant = "solid", ref, ...props }: SegmentedControlProps) {
  const [innerRef, thumb] = useSelectionThumb<HTMLDivElement, Thumb>({
    selector: "[data-selected]",
    items: "button",
    attributes: ["data-selected"],
    measure: (_root, selected) =>
      selected && {
        left: selected.offsetLeft,
        top: selected.offsetTop,
        width: selected.offsetWidth,
        height: selected.offsetHeight,
      },
  });

  const setRefs = (node: HTMLDivElement | null) => {
    innerRef.current = node;
    if (typeof ref === "function") ref(node);
    else if (ref) (ref as { current: HTMLDivElement | null }).current = node;
  };

  return (
    <AriaToggleButtonGroup
      ref={setRefs}
      selectionMode="single"
      disallowEmptySelection
      {...props}
      className={(state) =>
        cx(
          "relative inline-flex items-start gap-0.5 rounded-2lg",
          variant === "solid" && "bg-canvas p-1",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {variant === "solid" && thumb && (
        <span
          aria-hidden
          className="pointer-events-none absolute left-0 top-0 rounded-md bg-surface shadow-2xs transition-[transform,width,height] duration-200 ease"
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      {children}
    </AriaToggleButtonGroup>
  );
}

export interface SegmentedControlItemProps extends Omit<AriaToggleButtonProps, "children"> {
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function SegmentedControlItem({
  className,
  children,
  ref,
  ...props
}: SegmentedControlItemProps) {
  return (
    <AriaToggleButton
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "relative z-10 inline-flex cursor-pointer items-center justify-center rounded-md px-2.5 py-1 text-center whitespace-nowrap",
          "transition-colors duration-200 ease",
          "outline-none focus-visible:ring-2 focus-visible:ring-accent",
          state.isSelected
            ? "text-body-medium text-ink"
            : "text-body-regular text-ink-2 hover:text-ink",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {children}
    </AriaToggleButton>
  );
}
