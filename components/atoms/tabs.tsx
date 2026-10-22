"use client";

import type { ComponentType, ReactNode, Ref } from "react";
import {
  Tab as AriaTab,
  TabList as AriaTabList,
  TabPanel as AriaTabPanel,
  Tabs as AriaTabs,
} from "react-aria-components";
import type {
  TabListProps as AriaTabListProps,
  TabPanelProps as AriaTabPanelProps,
  TabProps as AriaTabProps,
  TabsProps as AriaTabsProps,
} from "react-aria-components";
import { useSelectionThumb } from "@/lib/use-selection-thumb";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface TabsProps extends AriaTabsProps {
  ref?: Ref<HTMLDivElement>;
}

export function Tabs({ className, ref, ...props }: TabsProps) {
  return (
    <AriaTabs
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "flex w-full flex-col gap-4",
          state.orientation === "vertical" && "flex-row",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}

export interface TabListProps<T extends object> extends AriaTabListProps<T> {
  ref?: Ref<HTMLDivElement>;
}

type Underline = { left: number; width: number };

export function TabList<T extends object>({ className, ref, ...props }: TabListProps<T>) {
  const [wrapperRef, underline] = useSelectionThumb<HTMLDivElement, Underline>({
    selector: "[role='tab'][data-selected]",
    items: "[role='tab']",
    attributes: ["data-selected"],
    measure: (_root, selected) =>
      selected && { left: selected.offsetLeft, width: selected.offsetWidth },
  });

  return (
    <div ref={wrapperRef} className="relative w-full">
      <AriaTabList
        ref={ref}
        {...props}
        className={(state) =>
          cx(
            "flex w-full items-center gap-1 border-b border-line",
            typeof className === "function" ? className(state) : className,
          )
        }
      />
      {underline && (
        <span
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-0 h-0.5 bg-accent-600 transition-[transform,width] duration-200 ease"
          style={{
            transform: `translateX(${underline.left}px)`,
            width: underline.width,
          }}
        />
      )}
    </div>
  );
}

export interface TabProps extends Omit<AriaTabProps, "children"> {
  children?: ReactNode;
  icon?: IconComponent;
  count?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function Tab({ className, children, icon: Icon, count, ref, ...props }: TabProps) {
  return (
    <AriaTab
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "relative inline-flex cursor-pointer items-center gap-2.5 px-2.5 py-2 whitespace-nowrap",
          "outline-none transition-colors duration-150 ease",
          "focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent",
          state.isDisabled && "cursor-not-allowed opacity-50",
          typeof className === "function" ? className(state) : className,
        )
      }
    >
      {({ isSelected }) => (
        <>
          <span
            className={cx(
              "inline-flex items-center gap-1.5",
              isSelected
                ? "text-body-medium text-accent-600"
                : "text-body-regular text-ink",
            )}
          >
            {Icon && <Icon className="size-4 shrink-0" aria-hidden />}
            {children}
          </span>
          {count != null && (
            <span
              className={cx(
                "inline-flex items-center justify-center rounded-sm px-1 py-px text-caption-1-medium whitespace-nowrap",
                isSelected
                  ? "bg-accent-muted text-accent-ink"
                  : "bg-ink/10 text-ink opacity-50",
              )}
            >
              {count}
            </span>
          )}
        </>
      )}
    </AriaTab>
  );
}

export interface TabPanelProps extends AriaTabPanelProps {
  ref?: Ref<HTMLDivElement>;
}

export function TabPanel({ className, ref, ...props }: TabPanelProps) {
  return (
    <AriaTabPanel
      ref={ref}
      {...props}
      className={(state) =>
        cx(
          "outline-none focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-accent",
          typeof className === "function" ? className(state) : className,
        )
      }
    />
  );
}
