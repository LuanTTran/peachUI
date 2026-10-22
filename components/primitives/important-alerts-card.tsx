"use client";

import { useState } from "react";
import { Health } from "reicon-react";
import { BodyFilled, HeartPulseFilled, MoonFilled, PillFilled, TestTubeFilled } from "@/components/atoms/icons";
import type { ComponentType } from "react";
import { WeekRangePill } from "@/components/primitives/week-range-pill";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;

type Alert = { icon: IconComponent; iconBg: string; title: string; description: string; date: string };

const ALERTS: Alert[] = [
  {
    icon: HeartPulseFilled,
    iconBg: "bg-red",
    title: "High Heart rate",
    description:
      "Your heart rate rose above 120 BPM while you seemed to be inactive for 10 minutes starting at 8:59 AM, 12 June.",
    date: "June, 12",
  },
  {
    icon: Health,
    iconBg: "bg-warning",
    title: "Medical ID",
    description: "Your emergency contact and allergy information was updated in your Medical ID.",
    date: "June, 9",
  },
  {
    icon: TestTubeFilled,
    iconBg: "bg-green",
    title: "Lab results ready",
    description: "Your latest blood panel ordered by Dr. Mattheus Clarkson is back — cholesterol and glucose are within the normal range.",
    date: "June, 9",
  },
  {
    icon: PillFilled,
    iconBg: "bg-accent",
    title: "Medication reminder",
    description: "You missed your 9:00 AM dose of Metoprolol. Take it as soon as possible unless your next dose is near.",
    date: "June, 8",
  },
  {
    icon: MoonFilled,
    iconBg: "bg-violet",
    title: "Irregular sleep",
    description: "Your bedtime shifted by more than 2 hours on 3 of the last 7 nights, which can affect your sleep score.",
    date: "June, 6",
  },
  {
    icon: BodyFilled,
    iconBg: "bg-schedule",
    title: "Low blood oxygen",
    description: "Your blood oxygen dipped to 93% for a short period during sleep on the night of 4 June.",
    date: "June, 5",
  },
];

const ALERTS_THIS_WEEK_COUNT = 12;

export function ImportantAlertsCard({ className }: { className?: string } = {}) {
  const [scrolled, setScrolled] = useState(false);

  return (
    <section
      className={cx(
        "flex h-[330px] w-full min-w-0 flex-col gap-4 overflow-hidden rounded-[20px] border border-canvas bg-canvas px-2.5 pt-2.5",
        className,
      )}
    >
      <div className="flex w-full items-start justify-between gap-2 px-1.5 pt-1.5">
        <div className="flex min-w-0 flex-1 flex-col gap-0.5">
          <p className="text-body-medium text-ink-2">Important alerts</p>
          <div className="flex items-baseline gap-1">
            <p className="text-title-1-medium whitespace-nowrap text-ink tabular-nums">
              {ALERTS_THIS_WEEK_COUNT}
            </p>
            <span className="text-caption-1-medium whitespace-nowrap text-ink-2">this week</span>
          </div>
        </div>
        <WeekRangePill label="29 Jun - 5 Jul" />
      </div>

      <div className="relative min-h-0 w-full flex-1">
        <div
          className="flex h-full w-full flex-col gap-2.5 overflow-y-auto overscroll-contain pb-2.5"
          onScroll={(e) => setScrolled(e.currentTarget.scrollTop > 0)}
        >
          {ALERTS.map((alert, index) => (
            <div
              key={`${alert.title}-${index}`}
              className="relative flex w-full shrink-0 flex-col gap-2 rounded-2lg bg-surface p-2.5"
            >
              <span className={cx("flex size-8 shrink-0 items-center justify-center rounded-full", alert.iconBg)}>
                <alert.icon className="size-[18px] text-on-accent" aria-hidden />
              </span>
              <div className="flex flex-col gap-0.5">
                <p className="text-body-medium whitespace-nowrap text-ink">{alert.title}</p>
                <p className="text-body-2-regular text-ink-2">{alert.description}</p>
              </div>
              <span className="absolute top-2.5 end-2.5 rounded-md bg-canvas px-1.5 py-px text-body-medium whitespace-nowrap text-ink-2">
                {alert.date}
              </span>
            </div>
          ))}
        </div>
        <div
          aria-hidden
          className={cx(
            "pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-canvas to-transparent",
            "transition-opacity duration-200 ease-out",
            scrolled ? "opacity-100" : "opacity-0",
          )}
        />
      </div>
    </section>
  );
}
