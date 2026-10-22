"use client";

/**
 * PeachUI — BillingUsage (block)
 * @tier block
 * @deps avatar-art, chip, live-line, motion
 * @requires app/globals.css
 *
 * Metered-billing card for one customer cycle. A canvas card holds two
 * raised trays: a "Metered usage" tray (token total, per-meter charges,
 * metered subtotal) and a spend tray (amount billed, margin chip, and a
 * LiveLine revenue curve against a hatched cost underlay). The card
 * header carries the customer; the tray footer carries the next charge.
 */

import { useRef, useState, type ReactNode } from "react";
import { Card } from "reicon-react";
import { AvatarArtGlyph, type AvatarArtId } from "@/components/atoms/avatar-art";
import { Chip } from "@/components/atoms/chip";
import {
  LiveLine,
  type LiveLinePoint,
} from "@/components/blocks/live-line";
import {
  liveLinePlot,
  paddedDomain,
  sampleMonotone,
  seriesInWindow,
} from "@/lib/chart/live-line-engine";
import { AnimatedNumber } from "@/lib/animated-number";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type { LiveLinePoint };

export type BillingUsageEvent = {
  id: string;
  /** Meter name as billed, e.g. "tokens.out". */
  label: string;
  quantity: number;
  /** Line-item charge in the account currency. */
  amount: number;
};

export type BillingUsageSeries = {
  /** Plotted live by LiveLine. */
  revenue: LiveLinePoint[];
  /** Drawn once as a dashed underlay. */
  cost: LiveLinePoint[];
};

export type BillingUsageCustomer = {
  name: string;
  email: string;
  avatarArt?: AvatarArtId;
};

export type BillingUsagePayment = {
  brand: string;
  last4: string;
  /** Charge date, e.g. "Nov 1". */
  due: string;
};

export type BillingUsageLabels = {
  title: string;
  cycle: string;
  meteredUsage: string;
  tokensThisCycle: string;
  meters: (count: number) => string;
  meteredTotal: string;
  billedToDate: string;
  marginOf: (percent: number) => string;
  includesSpend: string;
  defaultCard: string;
  nextChargeDue: (due: string) => string;
  legendBilled: string;
  legendSpend: string;
  chartAria: string;
};

export const defaultBillingUsageLabels: BillingUsageLabels = {
  title: "Billing & usage",
  cycle: "This cycle",
  meteredUsage: "Metered usage",
  tokensThisCycle: "tokens this cycle",
  meters: (count) => `${count} meters`,
  meteredTotal: "Metered total",
  billedToDate: "Billed to date",
  marginOf: (percent) => `${percent}% margin`,
  includesSpend: "model spend",
  defaultCard: "Default",
  nextChargeDue: (due) => `due ${due}`,
  legendBilled: "Billed",
  legendSpend: "Spend",
  chartAria: "Amount billed and model spend over the current cycle",
};

export type BillingUsageProps = {
  className?: string;
  customer: BillingUsageCustomer;
  payment: BillingUsagePayment;
  events: BillingUsageEvent[];
  series: BillingUsageSeries;
  tokensMetered: number;
  revenue: number;
  inferenceCost: number;
  /** Fraction 0–1; rendered as a percent chip. */
  grossMargin: number;
  cardCharge: number;
  /** Trailing chart window, in seconds. */
  window?: number;
  paused?: boolean;
  labels?: Partial<BillingUsageLabels>;
};

const formatUSD = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

const formatCompact = (value: number) =>
  value.toLocaleString("en-US", { notation: "compact", maximumFractionDigits: 2 });

const formatInteger = (value: number) =>
  Math.round(value).toLocaleString("en-US");

const formatMarginPercent = (value: number) => `${Math.round(value * 100)}%`;

export function BillingUsage({
  className,
  customer,
  payment,
  events,
  series,
  tokensMetered,
  revenue,
  inferenceCost,
  grossMargin,
  cardCharge,
  window: windowSecs = 30,
  paused = false,
  labels: labelsProp,
}: BillingUsageProps) {
  const labels = { ...defaultBillingUsageLabels, ...labelsProp };
  const meteredTotal = events.reduce((sum, event) => sum + event.amount, 0);

  return (
    <article
      className={cx(
        "w-full max-w-[880px] rounded-2-5xl bg-canvas p-2.5 shadow-card",
        className,
      )}
    >
      <header className="flex items-center justify-between gap-3 px-2.5 pb-2.5 pt-1.5">
        <div className="flex min-w-0 items-center gap-2.5">
          <AvatarArtGlyph
            id={customer.avatarArt ?? "beam"}
            className="size-9 shrink-0"
          />
          <div className="min-w-0">
            <h3 className="truncate text-body-strong text-ink">{customer.name}</h3>
            <p className="truncate text-caption text-ink-3">{customer.email}</p>
          </div>
        </div>
        <span className="shrink-0 rounded-full bg-surface px-2.5 py-1 text-caption text-ink-2 shadow-hairline">
          {labels.cycle}
        </span>
      </header>

      <div className="grid gap-2.5 sm:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
        <section
          aria-label={labels.meteredUsage}
          className="flex flex-col rounded-panel bg-surface shadow-hairline"
        >
          <div className="px-4 pb-3 pt-3.5">
            <p className="text-caption text-ink-3">{labels.meteredUsage}</p>
            <p className="mt-0.5 flex flex-wrap items-baseline gap-x-1.5">
              <AnimatedNumber
                value={tokensMetered}
                format={formatCompact}
                className="text-title-2-medium text-ink"
              />
              <span className="text-caption text-ink-3">
                {labels.tokensThisCycle}
              </span>
            </p>
          </div>

          <ul className="border-t border-line-soft px-4 py-1.5">
            {events.map((event) => (
              <li
                key={event.id}
                className="flex items-center justify-between gap-3 py-1.5"
              >
                <span className="min-w-0">
                  <span className="block truncate font-mono text-caption-1-medium text-ink">
                    {event.label}
                  </span>
                  <AnimatedNumber
                    value={event.quantity}
                    format={formatInteger}
                    className="block text-caption text-ink-3"
                  />
                </span>
                <AnimatedNumber
                  value={event.amount}
                  format={formatUSD}
                  className="shrink-0 text-body-2-medium text-ink"
                />
              </li>
            ))}
          </ul>

          <div className="mt-auto flex items-center justify-between gap-3 border-t border-line-soft px-4 py-2.5">
            <span className="text-caption text-ink-3">
              {labels.meters(events.length)}
            </span>
            <span className="flex items-baseline gap-1.5">
              <span className="text-caption text-ink-3">
                {labels.meteredTotal}
              </span>
              <AnimatedNumber
                value={meteredTotal}
                format={formatUSD}
                className="text-caption-1-medium text-ink"
              />
            </span>
          </div>
        </section>

        <section
          aria-label={labels.chartAria}
          className="flex min-h-[300px] flex-col rounded-panel bg-surface shadow-hairline"
        >
          <div className="px-4 pb-1 pt-3.5">
            <div className="flex items-center justify-between gap-3">
              <p className="text-caption text-ink-3">{labels.billedToDate}</p>
              <Chip variant="subtle" color="lime">
                <AnimatedNumber value={grossMargin} format={formatMarginPercent} />
                {" margin"}
              </Chip>
            </div>
            <p className="mt-0.5">
              <AnimatedNumber
                value={revenue}
                format={formatUSD}
                className="text-title-2-medium text-ink"
              />
            </p>
            <p className="mt-0.5 text-caption text-ink-3">
              {"Includes "}
              <AnimatedNumber value={inferenceCost} format={formatUSD} />
              {` ${labels.includesSpend}`}
            </p>
          </div>

          <div className="relative mx-2 mb-1 min-h-[170px] flex-1">
            <CostUnderlay
              revenue={series.revenue}
              cost={series.cost}
              window={windowSecs}
            />
            <LiveLine
              data={series.revenue}
              value={revenue}
              window={windowSecs}
              grid={false}
              badge={false}
              fill={false}
              paused={paused}
              formatValue={formatUSD}
              aria-label={labels.chartAria}
            />
          </div>

          <div className="flex items-center gap-5 border-t border-line-soft px-4 py-2">
            <LegendItem
              swatch={
                <span className="h-0.5 w-4 self-center rounded-full bg-chart-1-active" />
              }
              label={labels.legendBilled}
              value={revenue}
            />
            <LegendItem
              swatch={
                <span className="w-4 self-center border-t-2 border-dashed border-ink-3" />
              }
              label={labels.legendSpend}
              value={inferenceCost}
            />
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-line-soft px-4 py-2.5">
            <span className="flex min-w-0 items-center gap-2 text-body-2-regular text-ink-2">
              <Card className="size-4 shrink-0" strokeWidth={1.5} aria-hidden />
              <span className="truncate">
                {payment.brand} •••• {payment.last4}
              </span>
              <span className="shrink-0 text-caption text-ink-3">
                {labels.defaultCard}
              </span>
            </span>
            <span className="flex shrink-0 items-baseline gap-1.5">
              <AnimatedNumber
                value={cardCharge}
                format={formatUSD}
                className="text-headline-medium text-ink"
              />
              <span className="text-caption text-ink-3">
                {labels.nextChargeDue(payment.due)}
              </span>
            </span>
          </div>
        </section>
      </div>
    </article>
  );
}

function LegendItem({
  swatch,
  label,
  value,
}: {
  swatch: ReactNode;
  label: string;
  value: number;
}) {
  return (
    <span className="flex min-w-0 items-baseline gap-1.5">
      {swatch}
      <span className="text-caption text-ink-2">{label}</span>
      <AnimatedNumber
        value={value}
        format={formatUSD}
        className="text-caption text-ink-3"
      />
    </span>
  );
}

/**
 * Static cost series: a dashed line with a hatched well underneath,
 * behind the live revenue canvas. It uses LiveLine's plot frame
 * (`liveLinePlot`, no grid or badge) so both surfaces line up.
 */
function CostUnderlay({
  revenue,
  cost,
  window: windowSecs,
}: {
  revenue: LiveLinePoint[];
  cost: LiveLinePoint[];
  window: number;
}) {
  const hostRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ width: number; height: number } | null>(null);

  useMountEffect(() => {
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: entry.contentRect.width,
        height: entry.contentRect.height,
      });
    });
    observer.observe(host);
    return () => observer.disconnect();
  });

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0" aria-hidden>
      {size && cost.length > 1 ? (
        <CostUnderlaySvg
          width={size.width}
          height={size.height}
          revenue={revenue}
          cost={cost}
          windowSecs={windowSecs}
        />
      ) : null}
    </div>
  );
}

function CostUnderlaySvg({
  width,
  height,
  revenue,
  cost,
  windowSecs,
}: {
  width: number;
  height: number;
  revenue: LiveLinePoint[];
  cost: LiveLinePoint[];
  windowSecs: number;
}) {
  const plot = liveLinePlot(width, height);
  const plotLeft = plot.left;
  const plotRight = plot.right;
  const plotTop = plot.top;
  const plotBottom = plot.bottom;

  const revenueHead = revenue[revenue.length - 1];
  const end = cost[cost.length - 1]?.time ?? revenueHead?.time ?? 0;
  const start = end - windowSecs;

  const costHead = cost[cost.length - 1] ?? { time: end, value: 0 };
  const revenueWindow = revenueHead
    ? seriesInWindow(revenue, start, end, { time: end, value: revenueHead.value })
    : [];
  const costWindow = seriesInWindow(cost, start, end, {
    time: end,
    value: costHead.value,
  });

  let lo = costWindow[0]?.value ?? 0;
  let hi = lo;
  for (const point of costWindow) lo = Math.min(lo, point.value);
  for (const point of revenueWindow) hi = Math.max(hi, point.value);
  const domain = paddedDomain(lo, hi);

  const span = Math.max(domain.max - domain.min, 1e-6);
  const toX = (time: number) =>
    plotLeft + ((time - start) / windowSecs) * (plot.headX - plotLeft);
  const toY = (value: number) =>
    plotTop +
    (plotBottom - plotTop) -
    ((value - domain.min) / span) * (plotBottom - plotTop);

  const curve = sampleMonotone(costWindow);
  if (curve.length < 2) return null;
  const coords = curve.map((point) => ({
    x: toX(point.time),
    y: toY(point.value),
  }));
  const linePath = coords
    .map(
      (coord, index) =>
        `${index === 0 ? "M" : "L"}${coord.x.toFixed(1)},${coord.y.toFixed(1)}`,
    )
    .join("");
  const areaPath = `${linePath}L${coords[coords.length - 1].x.toFixed(1)},${plotBottom}L${coords[0].x.toFixed(1)},${plotBottom}Z`;
  const head = coords[coords.length - 1];

  return (
    <svg
      width={width}
      height={height}
      className="block animate-[fade-in_300ms_ease-out_both]"
    >
      <defs>
        <pattern
          id="billing-cost-hatch"
          width="5"
          height="5"
          patternUnits="userSpaceOnUse"
          patternTransform="rotate(45)"
        >
          <line
            x1="0"
            y1="0"
            x2="0"
            y2="5"
            stroke="var(--grid-line)"
            strokeWidth="1"
          />
        </pattern>
        <clipPath id="billing-cost-clip">
          <rect
            x={plotLeft}
            y={plotTop - 6}
            width={plotRight - plotLeft}
            height={plotBottom - plotTop + 12}
          />
        </clipPath>
      </defs>
      <g clipPath="url(#billing-cost-clip)">
        <path d={areaPath} fill="url(#billing-cost-hatch)" />
        <path
          d={linePath}
          fill="none"
          stroke="var(--ink-3)"
          strokeWidth="1.5"
          strokeDasharray="2 4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <circle
          cx={head.x}
          cy={head.y}
          r="3"
          fill="var(--surface)"
          stroke="var(--ink-3)"
          strokeWidth="1.5"
        />
      </g>
    </svg>
  );
}
