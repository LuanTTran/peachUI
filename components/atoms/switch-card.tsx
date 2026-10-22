"use client";

import type { ComponentType, ReactNode, Ref } from "react";
import { Switch as AriaSwitch } from "react-aria-components";
import type { SwitchProps as AriaSwitchProps } from "react-aria-components";
import { cx } from "@/lib/utils";
import { SwitchTrack } from "@/components/atoms/switch";
import type { SwitchShape, SwitchSize } from "@/components/atoms/switch";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface SwitchCardProps extends Omit<AriaSwitchProps, "children"> {
  title: ReactNode;
  description?: ReactNode;
  icon?: IconComponent;
  size?: SwitchSize;
  shape?: SwitchShape;
  ref?: Ref<HTMLLabelElement>;
}

export function SwitchCard({
  className,
  title,
  description,
  icon: Icon,
  size = "md",
  shape = "pill",
  ref,
  ...props
}: SwitchCardProps) {
  return (
    <AriaSwitch
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "group flex w-full items-center justify-between gap-3 rounded-xl border border-line py-3 pe-5 ps-4 select-none",
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
          <span className="flex min-w-0 items-center gap-3">
            {Icon && <Icon className="size-6 shrink-0 text-ink-2" aria-hidden />}
            <span className="flex min-w-0 flex-col gap-0.5">
              <span className="truncate text-body-medium text-ink">{title}</span>
              {description !== undefined && description !== null && (
                <span className="truncate text-body-regular text-ink-2">{description}</span>
              )}
            </span>
          </span>
          <span className="flex shrink-0 items-center">
            <SwitchTrack state={state} size={size} shape={shape} />
          </span>
        </>
      )}
    </AriaSwitch>
  );
}
