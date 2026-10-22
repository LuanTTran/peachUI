"use client";

import { createContext, useContext, useState } from "react";
import type { ReactNode } from "react";
import {
  Button as RACButton,
  CalendarCell,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHeader,
  CalendarHeaderCell,
  CalendarStateContext,
  RangeCalendarStateContext,
  useLocale,
} from "react-aria-components";
import type { CalendarCellRenderProps } from "react-aria-components";
import { CalendarDate, endOfWeek, getLocalTimeZone, isSameDay, startOfWeek, today } from "@internationalized/date";
import { cx } from "@/lib/utils";

type WeekStart = "sun" | "mon" | "tue" | "wed" | "thu" | "fri" | "sat";

const ComparisonHighlightContext = createContext<{ start: CalendarDate; end: CalendarDate } | null>(null);

export function ComparisonHighlight({
  range,
  children,
}: {
  range: { start: CalendarDate; end: CalendarDate } | null;
  children: ReactNode;
}) {
  return <ComparisonHighlightContext.Provider value={range}>{children}</ComparisonHighlightContext.Provider>;
}


export function ChevronLeft16({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={cx("", className)} aria-hidden>
      <path
        d="M9 4L5.70711 7.29289C5.31658 7.68342 5.31658 8.31658 5.70711 8.70711L9 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function ChevronRight16({ className }: { className?: string }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className={cx("", className)} aria-hidden>
      <path
        d="M7 4L10.2929 7.29289C10.6834 7.68342 10.6834 8.31658 10.2929 8.70711L7 12"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function formatTriggerDate(date: CalendarDate, locale?: string) {
  return new Intl.DateTimeFormat(locale, { month: "short", day: "numeric", year: "numeric" }).format(
    date.toDate(getLocalTimeZone()),
  );
}

export function formatChipDate(date: CalendarDate) {
  return `${String(date.day).padStart(2, "0")}/${String(date.month).padStart(2, "0")}/${date.year}`;
}

export function parseChipDate(text: string): CalendarDate | null {
  const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(text.trim());
  if (!match) return null;
  const day = Number(match[1]);
  const month = Number(match[2]);
  const year = Number(match[3]);
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  return new CalendarDate(year, month, day);
}

export function DayCell(
  props: CalendarCellRenderProps & {
    isRange: boolean;
    markToday?: boolean;
    firstDayOfWeek?: WeekStart;
  },
) {
  const { locale } = useLocale();
  const comparison = useContext(ComparisonHighlightContext);
  const { date, formattedDate, isSelected, isSelectionStart, isSelectionEnd, isHovered, isFocusVisible, isDisabled, isOutsideMonth, isRange, markToday, firstDayOfWeek } = props;

  if (isOutsideMonth) {
    return <div className="size-8" />;
  }

  const isWeekStart = isSameDay(date, startOfWeek(date, locale, firstDayOfWeek));
  const isWeekEnd = isSameDay(date, endOfWeek(date, locale, firstDayOfWeek));
  const inComparison = !!comparison && !isSelected && date.compare(comparison.start) >= 0 && date.compare(comparison.end) <= 0;
  const compareStart = !!comparison && inComparison && isSameDay(date, comparison.start);
  const compareEnd = !!comparison && inComparison && isSameDay(date, comparison.end);
  const compareSingle = compareStart && compareEnd;
  const compareRoundStart = compareStart || isWeekStart;
  const compareRoundEnd = compareEnd || isWeekEnd;
  const showToday = !!markToday && isSameDay(date, today(getLocalTimeZone()));

  const isSingleDay = isRange ? isSelectionStart && isSelectionEnd : isSelected;
  const isEdge = isRange ? isSelectionStart || isSelectionEnd : isSelected;

  const extendStart = isRange && isSelected && !isSelectionStart && !isWeekStart;
  const extendEnd = isRange && isSelected && !isSelectionEnd && !isWeekEnd;

  return (
    <div className="relative size-8">
      <span
        aria-hidden
        className={cx(
          "absolute inset-y-0 bg-hover-2 transition-[opacity,border-radius] duration-100 ease-out",
          compareStart ? "start-1/2" : inComparison && !isWeekStart ? "-start-1.5" : "start-0",
          compareEnd ? "end-1/2" : inComparison && !compareEnd && !isWeekEnd ? "-end-1.5" : "end-0",
          !compareStart && isWeekStart && "rounded-s-lg",
          !compareEnd && isWeekEnd && "rounded-e-lg",
          inComparison && !compareSingle ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cx(
          "absolute inset-0 bg-hover-2 ring-1 ring-inset ring-line transition-[opacity,border-radius] duration-100 ease-out",
          compareRoundStart && compareRoundEnd && "rounded-lg",
          compareRoundStart && !compareRoundEnd && "rounded-s-lg",
          compareRoundEnd && !compareRoundStart && "rounded-e-lg",
          inComparison && (compareStart || compareEnd) ? "opacity-100" : "opacity-0",
        )}
      />
      <span
        aria-hidden
        className={cx(
          "absolute inset-y-0 bg-accent-muted transition-[opacity,border-radius] duration-100 ease-out",
          isSelectionStart ? "start-1/2" : extendStart ? "-start-1.5" : "start-0",
          isSelectionEnd ? "end-1/2" : extendEnd ? "-end-1.5" : "end-0",
          !isSelectionStart && isWeekStart && "rounded-s-lg",
          !isSelectionEnd && isWeekEnd && "rounded-e-lg",
          isSelected && !isSingleDay ? "opacity-100" : "opacity-0",
        )}
      />
      <div
        className={cx(
          "relative flex size-8 items-center justify-center rounded-lg outline-none",
          !isSelected && isHovered && "bg-hover",
          "transition-colors duration-100 ease-out",
          isFocusVisible && "ring-2 ring-inset ring-accent",
        )}
      >
        <span
          aria-hidden
          className={cx(
            "absolute inset-0 bg-accent/35 transition-[opacity,border-radius] duration-100 ease-out",
            isSingleDay && "rounded-lg",
            isSelectionStart && !isSingleDay && "rounded-s-lg",
            isSelectionEnd && !isSingleDay && "rounded-e-lg",
            isEdge ? "opacity-100" : "opacity-0",
          )}
        />
        <span className={cx("relative text-body-medium text-ink", isDisabled && "text-ink-3")}>
          {formattedDate}
          {showToday && (
            <span
              aria-hidden
              className={cx(
                "absolute top-full left-1/2 mt-px size-1 -translate-x-1/2 rounded-full",
                isEdge ? "bg-surface" : "bg-accent",
              )}
            />
          )}
        </span>
      </div>
    </div>
  );
}

export function MonthPanel({
  offset,
  showPrev,
  showNext,
  bare = false,
  hideHeader = false,
  markToday = false,
  firstDayOfWeek,
}: {
  offset: number;
  showPrev?: boolean;
  showNext?: boolean;
  bare?: boolean;
  hideHeader?: boolean;
  markToday?: boolean;
  firstDayOfWeek?: WeekStart;
}) {
  const { locale } = useLocale();
  const rangeState = useContext(RangeCalendarStateContext);
  const singleState = useContext(CalendarStateContext);
  const state = rangeState ?? singleState;
  const isRange = rangeState != null;
  const panelDate = state ? state.visibleRange.start.add({ months: offset }) : null;
  const title = panelDate
    ? new Intl.DateTimeFormat(locale, { month: "long", year: "numeric" }).format(panelDate.toDate(getLocalTimeZone()))
    : "";

  return (
    <div className={bare ? "w-[296px] shrink-0" : "w-[326px] shrink-0 rounded-2xl bg-surface p-[15px] shadow-xs"}>
      <div className="flex flex-col gap-5">
        {!hideHeader && (
          <div className="flex items-center justify-between">
            {showPrev ? (
              <RACButton
                slot="previous"
                className="flex size-4 cursor-pointer items-center justify-center rounded-[3px] text-ink-2 outline-none transition-colors duration-150 ease hover:bg-hover"
              >
                <ChevronLeft16 />
              </RACButton>
            ) : (
              <span className="size-4" aria-hidden />
            )}
            <span className="flex-1 text-center text-body-medium text-ink">{title}</span>
            {showNext ? (
              <RACButton
                slot="next"
                className="flex size-4 cursor-pointer items-center justify-center rounded-[3px] text-ink-2 outline-none transition-colors duration-150 ease hover:bg-hover"
              >
                <ChevronRight16 />
              </RACButton>
            ) : (
              <span className="size-4" aria-hidden />
            )}
          </div>
        )}
        <CalendarGrid
          offset={{ months: offset }}
          weekdayStyle="short"
          className="-m-3 self-start border-separate outline-none"
          style={{ borderSpacing: "12px 12px" }}
        >
          <CalendarGridHeader>
            {(day) => (
              <CalendarHeaderCell className="size-6 pb-0 text-center text-body-medium text-ink-2">
                {day.slice(0, 2)}
              </CalendarHeaderCell>
            )}
          </CalendarGridHeader>
          <CalendarGridBody>
            {(date) => (
              <CalendarCell date={date} className="p-0 outline-none">
                {(cellProps) => (
                  <DayCell {...cellProps} isRange={isRange} markToday={markToday} firstDayOfWeek={firstDayOfWeek} />
                )}
              </CalendarCell>
            )}
          </CalendarGridBody>
        </CalendarGrid>
      </div>
    </div>
  );
}

export function DateChipInput({
  date,
  label,
  onCommit,
}: {
  date: CalendarDate;
  label: string;
  onCommit: (date: CalendarDate) => void;
}) {
  const formatted = formatChipDate(date);
  const [text, setText] = useState(formatted);
  const [syncedFrom, setSyncedFrom] = useState(formatted);

  if (formatted !== syncedFrom) {
    setSyncedFrom(formatted);
    setText(formatted);
  }

  const commit = () => {
    const parsed = parseChipDate(text);
    if (parsed) {
      onCommit(parsed);
    } else {
      setText(formatted);
    }
  };

  return (
    <input
      type="text"
      dir="ltr"
      inputMode="numeric"
      value={text}
      onChange={(event) => setText(event.target.value)}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") setText(formatted);
      }}
      aria-label={label}
      className="w-[104px] rounded-2lg border border-line bg-surface px-2 py-2 text-body-medium text-ink shadow-xs outline-none transition-colors duration-100 ease-out focus-visible:border-line-strong"
    />
  );
}

export const triggerButtonClassName = cx(
  "inline-flex shrink-0 cursor-pointer items-center gap-0.5 rounded-2lg border border-line bg-surface p-2 shadow-xs outline-none",
  "transition-[background-color,border-color,box-shadow] duration-150 ease",
  "hover:bg-hover hover:border-line-strong",
  "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
  "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-ink-3 disabled:shadow-none",
);

export const popoverClassName = cx(
  "origin-top rounded-3xl bg-canvas shadow-dropdown",
  "transition duration-150 ease-out",
  "data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:blur-[2px]",
  "data-[exiting]:opacity-0 data-[exiting]:scale-95 data-[exiting]:blur-[2px]",
);
