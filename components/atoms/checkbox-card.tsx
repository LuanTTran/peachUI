"use client";

import type { ReactNode, Ref } from "react";
import { Checkbox as AriaCheckbox } from "react-aria-components";
import type { CheckboxProps as AriaCheckboxProps } from "react-aria-components";
import { cx } from "@/lib/utils";
import { CheckboxGlyph } from "@/components/atoms/checkbox-glyph";

export interface CheckboxCardProps extends Omit<AriaCheckboxProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  ref?: Ref<HTMLLabelElement>;
}

export function CheckboxCard({
  className,
  title,
  description,
  ref,
  ...props
}: CheckboxCardProps) {
  return (
    <AriaCheckbox
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
            <CheckboxGlyph state={state} />
          </span>
        </>
      )}
    </AriaCheckbox>
  );
}
