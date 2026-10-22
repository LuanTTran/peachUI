"use client";

import type { ComponentType, CSSProperties } from "react";
import { Basket, Box, ChatRound, Users } from "reicon-react";
import {
  ArrowDownCircleFilled,
  ArrowUpCircleFilled,
  BasketFilled,
  CoinsFilled,
  InfoCircleFilled,
  MinusCircleFilled,
  MoneyChangeFilled,
  UsersFilled,
} from "@/components/atoms/icons";
import { Focusable } from "react-aria-components";
import { Chip } from "@/components/atoms/chip";
import { Tooltip, TooltipTrigger } from "@/components/atoms/tooltip";
import {
  StatMetricHairline,
  type StatMetricFigure,
} from "@/components/primitives/stat-metric-hairline";
import { cx } from "@/lib/utils";


type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type StatCardsVariant = "plain" | "footer";

export type StatTone = "accent" | "schedule" | "violet" | "red";

export type Stat = {
  icon: IconComponent;
  label: string;
  value: string;
  delta: string;
  deltaColor: "lime" | "rose" | "neutral";
  tone?: StatTone;
  figure?: StatMetricFigure;
  caption?: string;
  hint?: string;
};

const DEFAULT_STATS: Stat[] = [
  { icon: Users, label: "Customers", value: "14,592", delta: "+5.3%", deltaColor: "lime" },
  { icon: Box, label: "Unit sold", value: "385", delta: "-2.1%", deltaColor: "rose" },
  { icon: Basket, label: "Orders", value: "1,394", delta: "0.00%", deltaColor: "neutral" },
  { icon: ChatRound, label: "Support tickets", value: "708", delta: "+12.8%", deltaColor: "lime" },
];

const DEFAULT_FOOTER_STATS: Stat[] = [
  {
    icon: CoinsFilled,
    label: "Total revenue",
    value: "$152,313.92",
    delta: "16%",
    deltaColor: "lime",
    tone: "accent",
    figure: "revenue",
    hint: "Gross revenue across every channel this month, before refunds. Compared to the same days last month.",
  },
  {
    icon: BasketFilled,
    label: "Total orders",
    value: "25,162",
    delta: "20%",
    deltaColor: "lime",
    tone: "schedule",
    figure: "orders",
    hint: "Completed checkouts this month, including repeat purchases. Compared to the same days last month.",
  },
  {
    icon: UsersFilled,
    label: "New customers",
    value: "3,847",
    delta: "8.1%",
    deltaColor: "lime",
    tone: "violet",
    figure: "customers",
    hint: "First-time buyers this month. Compared to the same days last month.",
  },
  {
    icon: MoneyChangeFilled,
    label: "Refunds",
    value: "$4,209.44",
    delta: "2.4%",
    deltaColor: "rose",
    tone: "red",
    figure: "refunds",
    hint: "Refunded order value this month. A drop is good — the pill turns red when refunds rise.",
  },
];

const GLOW_TOKEN: Record<StatTone, string> = {
  accent: "var(--accent-muted)",
  schedule: "var(--schedule-muted)",
  violet: "var(--violet-muted)",
  red: "var(--red-muted)",
};

function cornerGlowStyle(tone: StatTone): CSSProperties {
  const c = GLOW_TOKEN[tone];
  return {
    background: `radial-gradient(
      farthest-corner at 100% 0%,
      color-mix(in oklch, ${c} 58%, transparent) 0%,
      color-mix(in oklch, ${c} 34%, transparent) 20%,
      color-mix(in oklch, ${c} 18%, transparent) 38%,
      color-mix(in oklch, ${c} 7%, transparent) 54%,
      color-mix(in oklch, ${c} 2%, transparent) 66%,
      transparent 76%
    )`,
  };
}

const ART_EDGE_FADE = `linear-gradient(
  102deg,
  var(--surface) 0%,
  color-mix(in oklch, var(--surface) 92%, transparent) 14%,
  color-mix(in oklch, var(--surface) 55%, transparent) 32%,
  transparent 52%
)`;

const DELTA_STYLES: Record<
  Stat["deltaColor"],
  { icon: IconComponent; className: string; pill: string }
> = {
  lime: {
    icon: ArrowUpCircleFilled,
    className: "text-green",
    pill: "bg-green-muted",
  },
  rose: {
    icon: ArrowDownCircleFilled,
    className: "text-red",
    pill: "bg-red-muted",
  },
  neutral: {
    icon: MinusCircleFilled,
    className: "text-ink-2",
    pill: "bg-inset",
  },
};

function inferFigure(stat: Stat): StatMetricFigure {
  if (stat.figure) return stat.figure;
  const key = stat.label.toLowerCase();
  if (key.includes("revenue")) return "revenue";
  if (key.includes("order")) return "orders";
  if (key.includes("customer")) return "customers";
  return "refunds";
}

function DeltaPill({ delta, deltaColor }: Pick<Stat, "delta" | "deltaColor">) {
  const { icon: Icon, className, pill } = DELTA_STYLES[deltaColor];
  return (
    <span
      className={cx(
        "flex shrink-0 items-center gap-1 rounded-full py-0.5 pe-2 ps-1",
        pill,
      )}
    >
      <Icon className={cx("size-4 shrink-0", className)} aria-hidden />
      <span className={cx("text-body-medium whitespace-nowrap tabular-nums", className)}>
        {delta}
      </span>
    </span>
  );
}

function StatMetricTooltip({ label, hint }: { label: string; hint: string }) {
  return (
    <TooltipTrigger delay={250}>
      <Focusable>
        <button
          type="button"
          aria-label={`About ${label}`}
          className={cx(
            "inline-flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full text-ink-3 outline-none",
            "transition-colors duration-150 ease hover:text-ink-2 focus-visible:text-ink focus-visible:ring-2 focus-visible:ring-accent",
          )}
        >
          <InfoCircleFilled className="size-4" aria-hidden />
        </button>
      </Focusable>
      <Tooltip size="sm" placement="top" offset={8} className="max-w-[min(16rem,88vw)] text-pretty">
        {hint}
      </Tooltip>
    </TooltipTrigger>
  );
}

function PlainStatCard({ stat }: { stat: Stat }) {
  return (
    <section className="flex h-[132px] min-w-0 flex-col items-start justify-between rounded-2xl bg-canvas p-4">
      <span className="flex items-center rounded-md bg-surface p-1.5">
        <stat.icon className="size-5 shrink-0 text-ink" aria-hidden />
      </span>
      <div className="flex w-full flex-col gap-0.5">
        <p className="w-full text-body-medium text-ink-2">{stat.label}</p>
        <div className="flex w-full flex-wrap items-center gap-2">
          <p className="text-title-1-medium whitespace-nowrap text-ink">{stat.value}</p>
          <Chip variant="bold" color={stat.deltaColor}>
            {stat.delta}
          </Chip>
        </div>
      </div>
    </section>
  );
}

function FooterStatCard({ stat }: { stat: Stat }) {
  const tone = stat.tone ?? "accent";
  const figure = inferFigure(stat);

  return (
    <section
      className={cx(
        "@container/card relative isolate min-w-0 overflow-hidden rounded-card border border-line bg-surface shadow-hairline",
      )}
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-[18%] end-[-14%] z-0 aspect-square w-[min(62%,10.5rem)] max-w-none"
        style={cornerGlowStyle(tone)}
      />

      <div
        aria-hidden
        className="pointer-events-none absolute -top-2 end-[-0.35rem] z-[1] size-[6.75rem] @min-[11rem]/card:size-[7.5rem]"
      >
        <StatMetricHairline figure={figure} className="size-full" />
        <div className="absolute inset-0" style={{ background: ART_EDGE_FADE }} />
      </div>

      <div className="relative z-[2] flex min-w-0 flex-col gap-2 p-4 pe-[4.75rem] @min-[11rem]/card:pe-20">
        <div className="flex min-w-0 items-center gap-1">
          <p className="min-w-0 truncate text-body-medium text-ink-2">{stat.label}</p>
          {stat.hint ? <StatMetricTooltip label={stat.label} hint={stat.hint} /> : null}
        </div>

        <div className="flex min-w-0 flex-wrap items-baseline gap-x-2 gap-y-1">
          <p
            className={cx(
              "min-w-0 truncate text-title-1-medium text-ink tabular-nums",
              "@min-[9.5rem]/card:text-display-4-medium @min-[9.5rem]/card:whitespace-nowrap @min-[9.5rem]/card:overflow-visible",
            )}
            title={stat.value}
          >
            {stat.value}
          </p>
          <DeltaPill delta={stat.delta} deltaColor={stat.deltaColor} />
        </div>

        <p className="text-meta text-ink-3">{stat.caption ?? "From last month"}</p>
      </div>
    </section>
  );
}

export function StatCards({
  variant = "plain",
  stats,
  count,
  columns = 4,
  className,
}: {
  variant?: StatCardsVariant;
  stats?: Stat[];
  count?: number;
  columns?: 1 | 2 | 4;
  className?: string;
} = {}) {
  const items =
    stats ?? (variant === "footer" ? DEFAULT_FOOTER_STATS : DEFAULT_STATS);
  return (
    <div className={cx("@container/stat-cards w-full min-w-0", className)}>
      <div
        className={cx(
          "grid w-full min-w-0 gap-4",
          columns === 1
            ? "grid-cols-1"
            : variant === "footer"
              ? "grid-cols-1 @min-[22rem]/stat-cards:grid-cols-2"
              : "grid-cols-2",
          columns === 4 &&
            (variant === "footer"
              ? "@min-[52rem]/stat-cards:grid-cols-4"
              : "@min-[40rem]/stat-cards:grid-cols-4"),
        )}
      >
        {items.slice(0, count ?? items.length).map((stat) =>
          variant === "footer" ? (
            <FooterStatCard key={stat.label} stat={stat} />
          ) : (
            <PlainStatCard key={stat.label} stat={stat} />
          ),
        )}
      </div>
    </div>
  );
}
