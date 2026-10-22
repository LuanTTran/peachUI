"use client";

import { useState } from "react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import { Chip } from "@/components/atoms/chip";
import { AnimatedNumber } from "@/lib/animated-number";
import { cx } from "@/lib/utils";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_FULL = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export type OrdersPoint = {
  label: string;
  current: number;
  previous: number;
};

export const ORDERS_DATA: OrdersPoint[] = [
  { label: "Jan", current: 1680, previous: 1510 },
  { label: "Feb", current: 1740, previous: 1480 },
  { label: "Mar", current: 1920, previous: 1650 },
  { label: "Apr", current: 1850, previous: 1620 },
  { label: "May", current: 2040, previous: 1710 },
  { label: "Jun", current: 2110, previous: 1760 },
  { label: "Jul", current: 2290, previous: 1840 },
  { label: "Aug", current: 2180, previous: 1890 },
  { label: "Sep", current: 2320, previous: 1930 },
  { label: "Oct", current: 2410, previous: 1970 },
  { label: "Nov", current: 2280, previous: 1810 },
  { label: "Dec", current: 2342, previous: 1798 },
];

const formatK = (value: number) => (value >= 1000 ? `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k` : `${value}`);

function describeDelta(current: number, previous: number) {
  if (previous === 0) return { label: "New", color: "neutral" as const };
  const change = ((current - previous) / previous) * 100;
  const rounded = Math.round(change * 10) / 10;
  if (rounded === 0) return { label: "0%", color: "neutral" as const };
  return {
    label: `${rounded > 0 ? "+" : ""}${rounded}%`,
    color: rounded > 0 ? ("lime" as const) : ("rose" as const),
  };
}

export function OrdersChartCard({
  data = ORDERS_DATA,
  title = "Orders",
  className,
}: {
  data?: OrdersPoint[];
  title?: string;
  className?: string;
} = {}) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const totalCurrent = data.reduce((sum, point) => sum + point.current, 0);
  const totalPrevious = data.reduce((sum, point) => sum + point.previous, 0);
  const hovering = activeIndex !== null && activeIndex < data.length;
  const point = hovering ? data[activeIndex] : null;

  const headlineValue = point ? point.current : totalCurrent;
  const comparison = point ? point.previous : totalPrevious;
  const delta = describeDelta(headlineValue, comparison);
  const monthIndex = point ? MONTHS.indexOf(point.label) : -1;
  const label = point ? (monthIndex >= 0 ? MONTHS_FULL[monthIndex] : point.label) : title;

  const yMax = Math.max(...data.map((d) => Math.max(d.current, d.previous)));

  return (
    <section
      className={cx(
        "flex h-[344px] min-w-0 flex-1 flex-col gap-6 rounded-2xl bg-canvas px-4 pt-4 pb-3",
        className,
      )}
    >
      <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 flex-col gap-0.5">
          <p className="w-full text-body-medium text-ink-2">{label}</p>
          <div className="flex w-full items-center gap-2">
            <AnimatedNumber
              value={headlineValue}
              format={(v) => Math.round(v).toLocaleString("en-US")}
              className="text-title-1-medium whitespace-nowrap text-ink"
            />
            <Chip variant="bold" color={delta.color}>
              {delta.label}
            </Chip>
          </div>
          <p className="text-body-2-medium text-ink-3 tabular-nums">
            {comparison.toLocaleString("en-US")} {point ? "a year earlier" : "last year"}
          </p>
        </div>
        <dl className="flex shrink-0 items-center gap-4 text-body-2-medium text-ink-2">
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-1-active" aria-hidden />
            <dt>This year</dt>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="size-2 rounded-full bg-chart-track" aria-hidden />
            <dt>Last year</dt>
          </div>
        </dl>
      </div>

      <div className="min-h-0 w-full flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={data}
            margin={{ top: 4, right: 6, bottom: 0, left: 0 }}
            barCategoryGap="28%"
            barGap={3}
            onMouseMove={(state) => {
              const index = Number(state?.activeTooltipIndex);
              if (state?.isTooltipActive && Number.isFinite(index)) setActiveIndex(index);
            }}
            onMouseLeave={() => setActiveIndex(null)}
          >
            <YAxis
              width={40}
              domain={[0, yMax * 1.1]}
              tickCount={4}
              tickFormatter={formatK}
              tickLine={false}
              axisLine={false}
              tick={{ fontSize: 12, fill: "var(--ink-3)" }}
            />
            <XAxis
              dataKey="label"
              tickLine={false}
              axisLine={false}
              tickMargin={12}
              interval="preserveStartEnd"
              tick={{ fontSize: 13, fill: "var(--ink-3)" }}
            />
            <Tooltip content={() => null} cursor={{ fill: "var(--chart-track)", opacity: 0.5 }} />
            <Bar
              dataKey="previous"
              fill="var(--chart-track)"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={450}
            />
            <Bar
              dataKey="current"
              fill="var(--chart-1-active)"
              radius={[4, 4, 0, 0]}
              isAnimationActive
              animationDuration={450}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
