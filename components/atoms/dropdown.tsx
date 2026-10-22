"use client";

import { createContext, useContext, useRef, useState, type ComponentProps, type ReactNode, type RefObject } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import {
  MENU_ITEM,
  MENU_ITEM_ACTIVE,
  MENU_ITEM_INTERACTIVE,
  MENU_POPOVER_SURFACE,
  MENU_POPOVER_WIDTH,
} from "@/components/lib/menu-styles";
import { cx } from "@/lib/utils";
import { useDismissOnOutsidePress, useTriggerToggle } from "@/lib/use-dismiss-on-outside-press";

interface DropdownContextValue {
  triggerRef: RefObject<HTMLButtonElement | null>;
  popoverRef: RefObject<HTMLElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

export interface DropdownProps {
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
  children: ReactNode;
}

export function Dropdown({ isOpen: controlledOpen, onOpenChange, children }: DropdownProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const [uncontrolledOpen, setUncontrolledOpen] = useState(false);

  const isOpen = controlledOpen ?? uncontrolledOpen;
  const setOpen = (next: boolean) => {
    setUncontrolledOpen(next);
    onOpenChange?.(next);
  };

  useDismissOnOutsidePress(isOpen, () => setOpen(false), [triggerRef, popoverRef]);
  const allowOpenChange = useTriggerToggle(isOpen, triggerRef);

  return (
    <DropdownContext.Provider value={{ triggerRef, popoverRef }}>
      <AriaDialogTrigger isOpen={isOpen} onOpenChange={(o) => allowOpenChange(o) && setOpen(o)}>
        {children}
      </AriaDialogTrigger>
    </DropdownContext.Provider>
  );
}

export function DropdownTrigger({ className, ...props }: ComponentProps<typeof AriaButton>) {
  const context = useContext(DropdownContext);
  return (
    <AriaButton
      ref={context?.triggerRef}
      {...props}
      className={cx(
        "cursor-pointer outline-none focus-visible:ring-2 focus-visible:ring-accent",
        className as string,
      )}
    />
  );
}

export interface DropdownPopoverProps
  extends Pick<ComponentProps<typeof AriaPopover>, "placement" | "offset" | "crossOffset"> {
  "aria-label": string;
  className?: string;
  dialogClassName?: string;
  children: ReactNode;
}

export function DropdownPopover({
  "aria-label": ariaLabel,
  placement = "bottom start",
  offset = 4,
  crossOffset,
  className,
  dialogClassName,
  children,
}: DropdownPopoverProps) {
  const context = useContext(DropdownContext);
  return (
    <AriaPopover
      ref={context?.popoverRef}
      isNonModal
      placement={placement}
      offset={offset}
      crossOffset={crossOffset}
      className={cx(
        MENU_POPOVER_WIDTH,
        MENU_POPOVER_SURFACE,
        className,
      )}
    >
      <AriaDialog aria-label={ariaLabel} className={cx("flex flex-col gap-1 outline-none", dialogClassName)}>
        {children}
      </AriaDialog>
    </AriaPopover>
  );
}

export interface DropdownGroupProps {
  label?: string;
  className?: string;
  children: ReactNode;
}

export function DropdownGroup({ label, className, children }: DropdownGroupProps) {
  return (
    <div className={cx("flex w-full flex-col gap-1.5", label && "pt-1", className)}>
      {label && <span className="ps-2 text-body-medium text-ink-2">{label}</span>}
      <div className="flex w-full flex-col gap-1">{children}</div>
    </div>
  );
}

export interface DropdownItemProps {
  selected?: boolean;
  onSelect?: () => void;
  className?: string;
  children: ReactNode;
}

export function DropdownItem({ selected, onSelect, className, children }: DropdownItemProps) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onSelect}
      className={cx(
        MENU_ITEM,
        selected ? MENU_ITEM_ACTIVE : MENU_ITEM_INTERACTIVE,
        className,
      )}
    >
      {children}
    </button>
  );
}

export function DropdownDivider({ className }: { className?: string }) {
  return <div className={cx("-mx-2.5 my-1.5 h-px shrink-0 bg-line", className)} />;
}
