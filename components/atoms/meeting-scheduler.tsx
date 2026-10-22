"use client";

import { useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { Calendar, Dialog, Popover } from "react-aria-components";
import { CalendarDate, getLocalTimeZone, today } from "@internationalized/date";
import { Calendar as CalendarIcon, Flag, Global, Video } from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Button } from "@/components/atoms/button";
import { ChevronDownSmall } from "@/components/atoms/chevrons";
import { MonthPanel, popoverClassName, triggerButtonClassName } from "@/components/atoms/date-picker-shared";
import { cx } from "@/lib/utils";
import { useMountEffect } from "@/lib/use-mount-effect";
import { useDismissOnOutsidePress } from "@/lib/use-dismiss-on-outside-press";

export interface MeetingSchedulerHost {
  name: string;
  email: string;
  avatarInitial: string;
}

export interface MeetingSchedulerDetails {
  title: string;
  description?: string;
  durationMinutes: number;
  language?: string;
  conferencing?: string;
}

export interface MeetingSchedulerValue {
  date: CalendarDate;
  time: string | null;
}

export interface MeetingSchedulerProps {
  host?: MeetingSchedulerHost;
  meeting?: MeetingSchedulerDetails;
  timezone?: string;
  value?: MeetingSchedulerValue | null;
  defaultValue?: MeetingSchedulerValue | null;
  onChange?: (value: MeetingSchedulerValue | null) => void;
  defaultOpen?: boolean;
  className?: string;
  "aria-label"?: string;
  triggerLabel?: string;
}

const DEFAULT_HOST: MeetingSchedulerHost = {
  name: "Alex Morgan",
  email: "alex@peach-ui.dev",
  avatarInitial: "M",
};

const DEFAULT_MEETING: MeetingSchedulerDetails = {
  title: "30 min intro meeting",
  description: "Let's discuss your design needs and how we can collaborate 🥳",
  durationMinutes: 30,
  language: "English",
  conferencing: "Google meet",
};

function useTimeSlots() {
  return useMemo(() => {
    const slots: string[] = [];
    for (let minutes = 9 * 60; minutes <= 18 * 60 + 30; minutes += 30) {
      const h = Math.floor(minutes / 60);
      const m = minutes % 60;
      slots.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
    return slots;
  }, []);
}

function formatTime(time: string, use24h: boolean) {
  const [h, m] = time.split(":").map(Number);
  if (use24h) return time;
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

function formatChipDateTime(value: MeetingSchedulerValue) {
  const date = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(
    value.date.toDate(getLocalTimeZone()),
  );
  return { date, time: value.time ?? "Select a time" };
}

function InfoRow({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-[5px] text-body-medium text-ink">
      {icon}
      {children}
    </div>
  );
}

function GlyphIcon({ icon: Icon }: { icon: typeof Global }) {
  return <Icon className="size-5 shrink-0 text-ink" aria-hidden />;
}

function HourFormatToggle({ use24h, onChange }: { use24h: boolean; onChange: (use24h: boolean) => void }) {
  return (
    <div className="flex shrink-0 items-start gap-0.5 rounded-2lg">
      {(["12h", "24h"] as const).map((label, i) => {
        const selected = i === 1 ? use24h : !use24h;
        return (
          <button
            key={label}
            type="button"
            onClick={() => onChange(i === 1)}
            className={cx(
              "cursor-pointer rounded-md px-2.5 py-1 text-body-medium transition-colors duration-150 ease",
              selected ? "bg-surface text-ink shadow-2xs" : "text-ink-2 hover:text-ink",
            )}
          >
            {label}
          </button>
        );
      })}
    </div>
  );
}

export function MeetingScheduler({
  host = DEFAULT_HOST,
  meeting = DEFAULT_MEETING,
  timezone = "Amsterdam",
  value,
  defaultValue = null,
  onChange,
  defaultOpen = false,
  className,
  "aria-label": ariaLabel = "Schedule meeting",
  triggerLabel = "Schedule a meeting",
}: MeetingSchedulerProps) {
  const triggerRef = useRef<HTMLButtonElement>(null);
  const popoverRef = useRef<HTMLElement>(null);
  const timeSlots = useTimeSlots();
  const isControlled = value !== undefined;
  const [internalValue, setInternalValue] = useState<MeetingSchedulerValue | null>(
    defaultValue ?? { date: today(getLocalTimeZone()), time: null },
  );
  const committedValue = isControlled ? value : internalValue;

  const [pendingValue, setPendingValue] = useState<MeetingSchedulerValue | null>(committedValue);
  const [use24h, setUse24h] = useState(true);
  const [isOpen, setIsOpen] = useState(false);
  useMountEffect(() => {
    if (defaultOpen && window.matchMedia("(min-width: 640px)").matches) setIsOpen(true);
  });

  const commit = (next: MeetingSchedulerValue | null) => {
    if (!isControlled) setInternalValue(next);
    onChange?.(next);
    setIsOpen(false);
  };

  useDismissOnOutsidePress(isOpen, () => setIsOpen(false), [triggerRef, popoverRef]);

  const chip = pendingValue ? formatChipDateTime(pendingValue) : null;
  const dayChip = pendingValue
    ? {
        weekday: new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(pendingValue.date.toDate(getLocalTimeZone())).slice(0, 2),
        day: pendingValue.date.day,
      }
    : null;

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        onClick={() => {
          if (!isOpen) setPendingValue(committedValue);
          setIsOpen((open) => !open);
        }}
        className={cx(triggerButtonClassName, className)}
      >
        <CalendarIcon className="size-5 shrink-0 text-ink" aria-hidden />
        <span className="flex items-center justify-center whitespace-nowrap px-1 text-body-medium text-ink">
          {triggerLabel}
        </span>
        <ChevronDownSmall
          className={cx("size-4 shrink-0 text-ink-2 transition-transform duration-200 ease", isOpen && "rotate-180")}
        />
      </button>
      <Popover
        ref={popoverRef}
        triggerRef={triggerRef}
        isOpen={isOpen}
        onOpenChange={setIsOpen}
        placement="bottom end"
        offset={8}
        isNonModal
        className={popoverClassName}
      >
        <Dialog aria-label={ariaLabel} className="outline-none">
          <Calendar
            aria-label={ariaLabel}
            value={pendingValue?.date ?? null}
            onChange={(date) => setPendingValue((prev) => ({ date, time: prev?.time ?? null }))}
          >
            <div className="flex h-[429px] gap-4">
              <div className="flex w-[207px] shrink-0 flex-col gap-4 py-4 ps-4">
                <div className="flex flex-col items-start gap-2">
                  <Avatar size="md" color="blue" initials={host.avatarInitial} />
                  <div className="flex flex-col text-body-medium">
                    <span className="text-ink">{host.name}</span>
                    <span className="text-ink-2">{host.email}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-1">
                  <p className="text-title-3-medium text-ink">{meeting.title}</p>
                  {meeting.description && (
                    <p className="text-body-2-medium text-ink-2">{meeting.description}</p>
                  )}
                </div>
                <div className="mt-auto flex flex-col gap-3">
                  <InfoRow icon={<GlyphIcon icon={Global} />}>{meeting.durationMinutes} minutes</InfoRow>
                  {meeting.language && <InfoRow icon={<GlyphIcon icon={Flag} />}>{meeting.language}</InfoRow>}
                  {meeting.conferencing && <InfoRow icon={<GlyphIcon icon={Video} />}>{meeting.conferencing}</InfoRow>}
                </div>
              </div>

              <div className="flex flex-col gap-3 pt-2 pb-3">
                <MonthPanel offset={0} showPrev showNext />
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 rounded-2lg border border-line bg-surface px-2 py-2 text-body-medium text-ink shadow-xs">
                    {chip && (
                      <>
                        <span>{chip.date}</span>
                        <span className="text-ink-2">{chip.time}</span>
                      </>
                    )}
                  </span>
                  <Button onClick={() => commit(pendingValue)} disabled={!pendingValue?.time}>
                    Send meeting
                  </Button>
                </div>
              </div>

              <div className="flex h-full w-[170px] shrink-0 flex-col gap-3 overflow-hidden pt-4 pe-4">
                <button
                  type="button"
                  className="flex cursor-pointer items-center justify-between rounded-2lg outline-none"
                >
                  <span className="flex items-center gap-[5px] text-body-medium text-ink">
                    <Global className="size-5 shrink-0 text-ink" aria-hidden />
                    {timezone}
                  </span>
                  <ChevronDownSmall className="size-4 shrink-0 text-ink-2" />
                </button>

                <div className="flex items-center justify-between">
                  {dayChip && (
                    <span className="inline-flex items-center gap-[3px] rounded-2lg bg-hover-2 px-2 py-1 text-body-medium">
                      <span className="text-ink">{dayChip.weekday}</span>
                      <span className="text-ink-2">{dayChip.day}</span>
                    </span>
                  )}
                  <HourFormatToggle use24h={use24h} onChange={setUse24h} />
                </div>

                <div
                  className="flex min-h-0 flex-1 flex-col gap-2 overflow-y-auto pb-3"
                  style={{
                    maskImage: "linear-gradient(to bottom, transparent, black 16px, black 100%)",
                    WebkitMaskImage: "linear-gradient(to bottom, transparent, black 16px, black 100%)",
                  }}
                >
                  {timeSlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() =>
                        setPendingValue((prev) => ({ date: prev?.date ?? today(getLocalTimeZone()), time: slot }))
                      }
                      className={cx(
                        "w-full shrink-0 cursor-pointer rounded-2lg px-2 py-1.5 text-center text-body-medium text-ink transition-colors duration-150 ease",
                        pendingValue?.time === slot
                          ? "bg-hover-2"
                          : "hover:bg-hover",
                      )}
                    >
                      {formatTime(slot, use24h)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </Calendar>
        </Dialog>
      </Popover>
    </>
  );
}
