"use client";

import type { ReactNode } from "react";
import {
  Label as AriaLabel,
  Slider as AriaSlider,
  SliderThumb as AriaSliderThumb,
  SliderTrack as AriaSliderTrack,
} from "react-aria-components";
import type { SliderProps as AriaSliderProps } from "react-aria-components";
import { cx } from "@/lib/utils";

type SliderValue = number | number[];

type SliderBaseProps<T extends SliderValue> = Omit<
  AriaSliderProps<T>,
  "children" | "className" | "orientation"
> & {
  label?: ReactNode;
  showTooltip?: boolean;
  formatValue?: (value: number, index: number) => ReactNode;
  className?: string;
};

export type SliderProps = SliderBaseProps<number> & {
  thumbLabel?: string;
};

export type RangeSliderProps = SliderBaseProps<number[]> & {
  thumbLabels?: [string, string];
};

type SliderBaseInternalProps<T extends SliderValue> = SliderBaseProps<T> & {
  thumbLabels: string[];
};

function SliderBase<T extends SliderValue>({
  className,
  label,
  showTooltip = true,
  formatValue,
  thumbLabels,
  ...props
}: SliderBaseInternalProps<T>) {
  return (
    <AriaSlider
      {...props}
      orientation="horizontal"
      className={({ isDisabled }) =>
        cx(
          "group flex w-full min-w-0 flex-col gap-2",
          isDisabled && "cursor-not-allowed opacity-50",
          className,
        )
      }
    >
      {({ state }) => {
        const isRange = state.values.length > 1;
        const startPercent = isRange ? state.getThumbPercent(0) : 0;
        const endPercent = state.getThumbPercent(state.values.length - 1);

        return (
          <>
            {label != null && (
              <AriaLabel className="text-body-medium text-ink">
                {label}
              </AriaLabel>
            )}

            <AriaSliderTrack
              className={cx(
                "relative h-8 w-full touch-none",
                showTooltip && "mt-8",
              )}
            >
              {({ isHovered }) => (
                <>
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-1/2 end-0 start-0 h-1.5 -translate-y-1/2 rounded-full",
                      "bg-hover-2 shadow-[inset_0_1px_1px_rgb(0_0_0/0.06)]",
                      "transition-colors duration-150 ease",
                      isHovered && "bg-line",
                    )}
                  />
                  <span
                    aria-hidden
                    className={cx(
                      "absolute top-1/2 h-1.5 -translate-y-1/2 rounded-full",
                      "bg-linear-to-r from-accent-500 to-accent-600",
                      "shadow-[inset_0_1px_0_rgb(255_255_255/0.24),0_1px_2px_rgb(4_80_226/0.16)]",
                    )}
                    style={{
                      insetInlineStart: `${startPercent * 100}%`,
                      insetInlineEnd: `${(1 - endPercent) * 100}%`,
                    }}
                  />

                  {state.values.map((value, index) => {
                    const valueLabel =
                      formatValue?.(value, index) ??
                      state.getThumbValueLabel(index);

                    return (
                      <AriaSliderThumb
                        key={index}
                        index={index}
                        aria-label={
                          thumbLabels[index] ??
                          (isRange ? `Value ${index + 1}` : "Value")
                        }
                        className={({
                          isDragging,
                          isHovered: isThumbHovered,
                          isFocusVisible,
                          isDisabled,
                        }) =>
                          cx(
                            "top-1/2 size-5 rounded-full border border-line outline-none",
                            "flex items-center justify-center bg-on-accent",
                            "shadow-[0_2px_4px_rgb(0_0_0/0.10),inset_0_1px_0_rgb(255_255_255/0.8)]",
                            "transition-[scale,box-shadow,border-color] duration-150 ease",
                            isThumbHovered && !isDragging && "scale-105 border-line-strong",
                            isDragging && "z-20 scale-110 border-accent-500 shadow-[0_3px_8px_color-mix(in_srgb,var(--color-accent-600)_22%,transparent)]",
                            isFocusVisible && "ring-2 ring-accent ring-offset-2",
                            isDisabled ? "cursor-not-allowed" : "cursor-grab active:cursor-grabbing",
                          )
                        }
                      >
                        {({ isDragging, isFocused }) => (
                          <>
                            {showTooltip && (
                              <span
                                aria-hidden
                                className={cx(
                                  "pointer-events-none absolute bottom-[calc(100%+9px)] left-1/2 -translate-x-1/2",
                                  "flex h-7 min-w-8 items-center justify-center rounded-lg border border-line",
                                  "bg-surface px-2 text-caption-1-medium whitespace-nowrap text-ink shadow-xs",
                                  "transition-[translate,box-shadow] duration-150 ease",
                                  (isDragging || isFocused) && "-translate-y-0.5 shadow-dropdown",
                                )}
                              >
                                {valueLabel}
                                <span
                                  aria-hidden
                                  className="absolute -bottom-[4.5px] left-1/2 size-2 -translate-x-1/2 rotate-45 border-r border-b border-line bg-surface"
                                />
                              </span>
                            )}
                            <span
                              aria-hidden
                              className={cx(
                                "size-2 rounded-full bg-linear-to-b from-accent-500 to-accent-600",
                                "shadow-[inset_0_1px_0_rgb(255_255_255/0.24)] transition-[filter] duration-150 ease",
                                (isDragging || isFocused) && "brightness-110",
                              )}
                            />
                          </>
                        )}
                      </AriaSliderThumb>
                    );
                  })}
                </>
              )}
            </AriaSliderTrack>
          </>
        );
      }}
    </AriaSlider>
  );
}

export function Slider({ thumbLabel = "Value", ...props }: SliderProps) {
  return <SliderBase {...props} thumbLabels={[thumbLabel]} />;
}

export function RangeSlider({
  thumbLabels = ["Minimum", "Maximum"],
  ...props
}: RangeSliderProps) {
  return <SliderBase {...props} thumbLabels={thumbLabels} />;
}
