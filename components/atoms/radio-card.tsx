"use client";

import type { ReactNode, Ref } from "react";
import { Radio as AriaRadio } from "react-aria-components";
import type { RadioProps as AriaRadioProps } from "react-aria-components";
import { cx } from "@/lib/utils";
import { RadioDot } from "@/components/atoms/radio";

export interface RadioCardProps extends Omit<AriaRadioProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLLabelElement>;
}

export function RadioCard({ className, title, description, ref, ...props }: RadioCardProps) {
  return (
    <AriaRadio
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group flex w-full items-center justify-between gap-3 rounded-2lg border border-line py-3 pe-5 ps-4 select-none",
          "transition-colors duration-150 ease",
          state.isHovered && !state.isDisabled
            ? "bg-hover"
            : "bg-surface",
          state.isDisabled ? "cursor-not-allowed opacity-50" : "cursor-pointer",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {(state) => (
        <>
          <span className="flex min-w-0 flex-col gap-0.5">
            <span className="truncate text-body-medium text-ink">{title}</span>
            {description !== undefined && description !== null && (
              <span className="truncate text-body-regular text-ink-2">{description}</span>
            )}
          </span>
          <span className="flex shrink-0 items-center py-1">
            <RadioDot size="md" selected={state.isSelected} focusVisible={state.isFocusVisible} />
          </span>
        </>
      )}
    </AriaRadio>
  );
}
