"use client";

import { useRef, useState } from "react";
import type { RefObject } from "react";
import { Calendar, Dialog, Popover, useLocale } from "react-aria-components";
import type { CalendarDate } from "@internationalized/date";
import { Calendar as CalendarIcon } from "reicon-react";
import { AnimatePresence, motion } from "motion/react";
import { Button } from "@/components/atoms/button";
import {
  DateChipInput,
  MonthPanel,
  formatTriggerDate,
  popoverClassName,
  triggerButtonClassName,
} from "@/components/atoms/date-picker-shared";
import { cx } from "@/lib/utils";
import { useDismissOnOutsidePress } from "@/lib/use-dismiss-on-outside-press";


export interface DatePickerProps {
  value?: CalendarDate | null;
  defaultValue?: CalendarDate | null;
  onChange?: (value: CalendarDate | null) => void;
  isDisabled?: boolean;
  className?: string;
  "aria-label"?: string;
  triggerRef?: RefObject<HTMLElement | null>;
  isOpen?: boolean;
  onOpenChange?: (isOpen: boolean) => void;
}

export function DatePicker({
  value,
  defaultValue = null,
  onChange,
  isDisabled,
  className,
  "aria-label": ariaLabel = "Date",
  triggerRef: externalTriggerRef,
  isOpen: controlledIsOpen,
  onOpenChange: controlledOnOpenChange,
}: DatePickerProps) {
  const { locale } = useLocale();
  const ownTriggerRef = useRef<HTMLButtonElement>(null);
  const triggerRef = externalTriggerRef ?? ownTriggerRef;
  const isExternal = externalTriggerRef !== undefined;
  const popoverRef = useRef<HTMLElement>(null);

  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = isExternal ? (controlledIsOpen ?? false) : internalOpen;
  const setIsOpen = isExternal ? (controlledOnOpenChange ?? (() => {})) : setInternalOpen;

  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<CalendarDate | null>(defaultValue);
  const committedValue = isControlled ? (value ?? null) : internalValue;

  const [pendingValue, setPendingValue] = useState<CalendarDate | null>(committedValue);
  const [openKey, setOpenKey] = useState(0);

  const [wasOpen, setWasOpen] = useState(isOpen);
  if (isOpen !== wasOpen) {
    setWasOpen(isOpen);
    if (isOpen) {
      setPendingValue(committedValue);
      setOpenKey((k) => k + 1);
    }
  }

  const commit = (next: CalendarDate | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setIsOpen(false);
  };

  const openChange = (open: boolean) => {
    setIsOpen(open);
  };

  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);

  return (
    <>
      {!isExternal && (
        <button
          ref={ownTriggerRef}
          type="button"
          disabled={isDisabled}
          onClick={() => openChange(!isOpen)}
          className={cx(triggerButtonClassName, className)}
        >
          <CalendarIcon className="size-5 shrink-0 text-ink" aria-hidden />
          <span className="flex items-center justify-center whitespace-nowrap px-1 text-body-medium text-ink">
            {committedValue ? formatTriggerDate(committedValue, locale) : "Select date"}
          </span>
        </button>
      )}
      <Popover
        ref={popoverRef}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={openChange}
        offset={4}
        placement="bottom end"
        isNonModal
        className={popoverClassName}
      >
        <Dialog aria-label={ariaLabel} className="outline-none">
          <Calendar key={openKey} aria-label={ariaLabel} value={pendingValue} onChange={setPendingValue}>
            <div className="flex flex-col pt-2 pe-2 pb-3 ps-2">
              <MonthPanel offset={0} showPrev showNext />
              <div className="flex items-center justify-between pt-3 pe-4 ps-4">
                <div>
                  <AnimatePresence>
                    {pendingValue && (
                      <motion.div
                        key="date-summary"
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -12 }}
                        transition={{ duration: 0.25, ease: [0.34, 1.2, 0.64, 1] }}
                      >
                        <DateChipInput date={pendingValue} label="Date" onCommit={setPendingValue} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
                <div className="flex items-center gap-2.5">
                  <Button
                    variant="secondary"
                    onClick={() => {
                      setPendingValue(committedValue);
                      setIsOpen(false);
                    }}
                  >
                    Cancel
                  </Button>
                  <Button onClick={() => commit(pendingValue)} disabled={!pendingValue}>
                    Apply
                  </Button>
                </div>
              </div>
            </div>
          </Calendar>
        </Dialog>
      </Popover>
    </>
  );
}
