"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import {
  Button as AriaButton,
  Dialog,
  DialogTrigger,
  Popover,
  RangeCalendar,
  useLocale,
} from "react-aria-components";
import {
  CalendarDate,
  endOfMonth,
  getLocalTimeZone,
  isSameDay,
  startOfMonth,
  startOfYear,
  today,
} from "@internationalized/date";
import { Calendar as CalendarIcon } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  ChevronRight16,
  ComparisonHighlight,
  MonthPanel,
  formatTriggerDate,
  popoverClassName,
  triggerButtonClassName,
} from "@/components/atoms/date-picker-shared";
import { SegmentedControl, SegmentedControlItem } from "@/components/atoms/segmented-control";
import { cx } from "@/lib/utils";
import { useDismissOnOutsidePress, useTriggerToggle } from "@/lib/use-dismiss-on-outside-press";

/**
 * @tier block
 *
 * Analytics range calendar. Composes the date-picker month grid
 * (`MonthPanel` in `date-picker-shared`) and adds the preset column,
 * comparison control, and apply footer.
 *
 * Keyboard: preset buttons and the compare switcher are tabbable; arrow keys
 * move inside the month grid and the compare control; Escape closes; Apply
 * commits the pending range. The checkbox paints the comparison window on
 * the grid and does not change the committed range by itself.
 *
 * Weeks start on Sunday.
 */

export interface CalendarRange {
  start: CalendarDate;
  end: CalendarDate;
}

export type CalendarCompare = "off" | "previous-period" | "previous-year";

export interface CalendarProps {
  value?: CalendarRange | null;
  defaultValue?: CalendarRange | null;
  onChange?: (value: CalendarRange | null) => void;
  compare?: CalendarCompare;
  defaultCompare?: CalendarCompare;
  onCompareChange?: (compare: CalendarCompare) => void;
  /** When true, the comparison window is filled on the month grid. */
  highlightComparison?: boolean;
  defaultHighlightComparison?: boolean;
  onHighlightComparisonChange?: (highlight: boolean) => void;
  isDisabled?: boolean;
  defaultOpen?: boolean;
  /** Popover anchor relative to the trigger (React Aria `placement`). */
  popoverPlacement?: "bottom" | "bottom start" | "bottom end";
  className?: string;
  "aria-label"?: string;
  placeholder?: string;
}

const WEEK_START = "sun" as const;

const mobileSnapshot = () => window.matchMedia("(max-width: 767px)").matches;
const subscribeMobile = (listener: () => void) => {
  const query = window.matchMedia("(max-width: 767px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

function inclusiveDays(value: CalendarRange) {
  const tz = getLocalTimeZone();
  const ms = value.end.toDate(tz).getTime() - value.start.toDate(tz).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

function presetRanges(now: CalendarDate) {
  const lastMonth = now.subtract({ months: 1 });
  const quarterStartMonth = Math.floor((now.month - 1) / 3) * 3 + 1;
  const quarterStart = new CalendarDate(now.year, quarterStartMonth, 1);
  return [
    { label: "Today", range: { start: now, end: now } },
    { label: "Yesterday", range: { start: now.subtract({ days: 1 }), end: now.subtract({ days: 1 }) } },
    { label: "Last 7 days", range: { start: now.subtract({ days: 6 }), end: now } },
    { label: "Last 30 days", range: { start: now.subtract({ days: 29 }), end: now } },
    { label: "Last 90 days", range: { start: now.subtract({ days: 89 }), end: now } },
    { label: "This month", range: { start: startOfMonth(now), end: endOfMonth(now) } },
    { label: "Last month", range: { start: startOfMonth(lastMonth), end: endOfMonth(lastMonth) } },
    { label: "This quarter", range: { start: quarterStart, end: endOfMonth(quarterStart.add({ months: 2 })) } },
    { label: "Year to date", range: { start: startOfYear(now), end: now } },
  ];
}

function rangesMatch(value: CalendarRange | null, range: CalendarRange) {
  return !!value && isSameDay(value.start, range.start) && isSameDay(value.end, range.end);
}

function comparisonFor(range: CalendarRange, mode: CalendarCompare): CalendarRange | null {
  if (mode === "off") return null;
  if (mode === "previous-year") {
    return { start: range.start.subtract({ years: 1 }), end: range.end.subtract({ years: 1 }) };
  }
  const length = inclusiveDays(range);
  const end = range.start.subtract({ days: 1 });
  return { start: end.subtract({ days: length - 1 }), end };
}

function rangeLabel(range: CalendarRange, locale: string) {
  return `${formatTriggerDate(range.start, locale)} – ${formatTriggerDate(range.end, locale)}`;
}

function dayCountLabel(days: number) {
  return days === 1 ? "1 day" : `${days} days`;
}

export function Calendar({
  value,
  defaultValue = null,
  onChange,
  compare,
  defaultCompare = "off",
  onCompareChange,
  highlightComparison,
  defaultHighlightComparison = true,
  onHighlightComparisonChange,
  isDisabled,
  defaultOpen = false,
  popoverPlacement = "bottom start",
  className,
  "aria-label": ariaLabel = "Date range",
  placeholder = "Select dates",
}: CalendarProps) {
  const { locale } = useLocale();
  const compareLabelId = useId();
  const valueControlled = value !== undefined;
  const compareControlled = compare !== undefined;
  const highlightControlled = highlightComparison !== undefined;

  const [internalValue, setInternalValue] = useState<CalendarRange | null>(defaultValue);
  const [internalCompare, setInternalCompare] = useState<CalendarCompare>(defaultCompare);
  const [internalHighlight, setInternalHighlight] = useState(defaultHighlightComparison);

  const committedValue = valueControlled ? (value ?? null) : internalValue;
  const committedCompare = compareControlled ? compare : internalCompare;
  const committedHighlight = highlightControlled ? highlightComparison : internalHighlight;

  const [pendingValue, setPendingValue] = useState<CalendarRange | null>(committedValue);
  const [pendingCompare, setPendingCompare] = useState<CalendarCompare>(committedCompare);
  const [pendingHighlight, setPendingHighlight] = useState(committedHighlight);
  const [isOpen, setIsOpen] = useState(defaultOpen);
  // Below md the panel drops to a single month; visibleDuration follows so
  // the prev/next chevrons page one month at a time instead of two.
  const isMobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);
  const allowOpenChange = useTriggerToggle(isOpen, triggerRef);

  const now = today(getLocalTimeZone());
  const presets = presetRanges(now);
  const custom = !!pendingValue && presets.every((preset) => !rangesMatch(pendingValue, preset.range));
  const pendingComparison = pendingValue ? comparisonFor(pendingValue, pendingCompare) : null;
  const committedComparison = committedValue ? comparisonFor(committedValue, committedCompare) : null;
  const painted = pendingHighlight ? pendingComparison : null;

  const resetPending = () => {
    setPendingValue(committedValue);
    setPendingCompare(committedCompare);
    setPendingHighlight(committedHighlight);
  };

  const commit = () => {
    if (!valueControlled) setInternalValue(pendingValue);
    if (!compareControlled) setInternalCompare(pendingCompare);
    if (!highlightControlled) setInternalHighlight(pendingHighlight);
    onChange?.(pendingValue);
    onCompareChange?.(pendingCompare);
    onHighlightComparisonChange?.(pendingHighlight);
  };

  return (
    <DialogTrigger
      isOpen={isOpen}
      onOpenChange={(open) => {
        if (!allowOpenChange(open)) return;
        if (open) resetPending();
        setIsOpen(open);
      }}
    >
      <AriaButton ref={triggerRef} isDisabled={isDisabled} className={cx(triggerButtonClassName, "h-auto", className)}>
        <CalendarIcon className="size-5 shrink-0 text-ink" aria-hidden />
        <span className="flex min-w-0 flex-col items-start px-1">
          <span className="text-body-medium whitespace-nowrap text-ink">
            {committedValue ? rangeLabel(committedValue, locale) : placeholder}
          </span>
          {committedComparison && (
            <span className="text-caption whitespace-nowrap">vs. {rangeLabel(committedComparison, locale)}</span>
          )}
        </span>
        <ChevronRight16 className={cx("text-ink-3 transition-transform duration-150", isOpen ? "-rotate-90" : "rotate-90")} />
      </AriaButton>
      <Popover
        ref={popoverRef}
        offset={8}
        placement={popoverPlacement}
        containerPadding={12}
        isNonModal
        className={cx(
          popoverClassName,
          // On md+, React Aria's inline max-height (space left under the
          // trigger) would clip the fixed two-month layout, so `!` overrides
          // it up to the containerPadding box. Below md we keep React Aria's
          // cap so the panel stays on-screen and scrolls internally.
          "max-w-[calc(100vw-1.5rem)] overflow-y-auto md:max-h-[calc(100dvh-1.5rem)]!",
        )}
      >
        <Dialog aria-label={ariaLabel} className="outline-none">
          {({ close }) => (
            <RangeCalendar
              aria-label={ariaLabel}
              firstDayOfWeek={WEEK_START}
              visibleDuration={{ months: isMobile ? 1 : 2 }}
              selectionAlignment="start"
              value={pendingValue}
              onChange={setPendingValue}
            >
              <ComparisonHighlight range={painted}>
                <div className="flex flex-col">
                  {/* Below md the presets become a horizontal strip and the
                   * calendar a single month; on md+ the original rail + pair. */}
                  <div className="flex flex-col md:flex-row md:gap-3">
                    <div
                      className="shrink-0 overflow-x-auto px-3 pt-3 md:w-[148px] md:overflow-visible md:px-0 md:ps-4 md:pt-4"
                      role="group"
                      aria-label="Date presets"
                    >
                      <div className="flex gap-1 md:flex-col">
                        {presets.map((preset) => {
                          const selected = rangesMatch(pendingValue, preset.range);
                          return (
                            <button
                              key={preset.label}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setPendingValue(preset.range)}
                              className={cx(
                                "button-press-motion min-h-8 shrink-0 cursor-pointer whitespace-nowrap rounded-2lg px-2 py-1.5 text-start text-body-medium text-ink outline-none",
                                "focus-visible:ring-2 focus-visible:ring-accent md:w-full",
                                selected ? "bg-hover-2" : "hover:bg-hover",
                              )}
                            >
                              {preset.label}
                            </button>
                          );
                        })}
                        <p
                          aria-current={custom ? "true" : undefined}
                          className={cx(
                            "min-h-8 shrink-0 whitespace-nowrap rounded-2lg px-2 py-1.5 text-start text-body-medium text-ink md:w-full",
                            custom ? "bg-hover-2" : "text-ink-2",
                          )}
                        >
                          Custom
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 overflow-x-auto p-2 md:overflow-visible md:p-0 md:pe-2 md:pt-2">
                      <MonthPanel offset={0} showPrev showNext={isMobile} markToday firstDayOfWeek={WEEK_START} />
                      {!isMobile && <MonthPanel offset={1} showNext markToday firstDayOfWeek={WEEK_START} />}
                    </div>
                  </div>
                  <div className="flex flex-col gap-4 px-4 pt-3 pb-4 md:flex-row md:items-end md:justify-between md:gap-6">
                    <div className="flex min-w-0 flex-col gap-3">
                      {pendingValue && (
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-body-medium whitespace-nowrap text-ink">{rangeLabel(pendingValue, locale)}</span>
                          <span className="rounded-full bg-hover-2 px-2 py-0.5 text-caption tabular-nums">
                            {dayCountLabel(inclusiveDays(pendingValue))}
                          </span>
                        </div>
                      )}
                      <div className="flex flex-col items-start gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-meta" id={compareLabelId}>Compare</span>
                          <SegmentedControl
                            className="max-w-full overflow-x-auto"
                            aria-labelledby={compareLabelId}
                            selectedKeys={new Set([pendingCompare])}
                            onSelectionChange={(keys) => {
                              const next = [...keys][0];
                              if (next === "off" || next === "previous-period" || next === "previous-year") {
                                setPendingCompare(next);
                              }
                            }}
                          >
                            <SegmentedControlItem id="off">Off</SegmentedControlItem>
                            <SegmentedControlItem id="previous-period">Previous period</SegmentedControlItem>
                            <SegmentedControlItem id="previous-year">Previous year</SegmentedControlItem>
                          </SegmentedControl>
                        </div>
                        {pendingComparison && (
                          <Checkbox
                            size="sm"
                            isSelected={pendingHighlight}
                            onChange={setPendingHighlight}
                          >
                            <span className="sr-only">Show on calendar, </span>
                            vs. {rangeLabel(pendingComparison, locale)}
                          </Checkbox>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center justify-end gap-2">
                      <Button
                        variant="secondary"
                        onClick={() => {
                          resetPending();
                          close();
                        }}
                      >
                        Cancel
                      </Button>
                      <Button
                        onClick={() => {
                          commit();
                          close();
                        }}
                        disabled={!pendingValue}
                      >
                        Apply
                      </Button>
                    </div>
                  </div>
                </div>
              </ComparisonHighlight>
            </RangeCalendar>
          )}
        </Dialog>
      </Popover>
    </DialogTrigger>
  );
}
