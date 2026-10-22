"use client";

import { useRef, useState, type ComponentProps } from "react";
import { Button } from "@/components/atoms/button";
import {
  LiveLine,
  type LiveLineOrder,
  type LiveLineOrderbook,
  type LiveLinePoint,
} from "@/components/blocks/live-line";
import { useMountEffect } from "@/lib/use-mount-effect";

type LiveLineConfig = Omit<
  ComponentProps<typeof LiveLine>,
  "data" | "value" | "paused" | "orderbook"
>;

type ShowcasePanel = {
  id: string;
  title: string;
  caption: string;
  heightClass: string;
  stream?: {
    intervalMs: number;
    seed: () => LiveLinePoint[];
    step: (last: number) => number;
    loadingMs?: number;
    /** Streams a synthetic order book alongside the line. */
    book?: boolean;
  };
  chart: LiveLineConfig;
};

const PANELS: ShowcasePanel[] = [
  {
    id: "requests",
    title: "Requests per minute",
    caption: "Filled dashboard line · neutral tone · loading handoff",
    heightClass: "h-[248px]",
    stream: {
      intervalMs: 320,
      loadingMs: 1200,
      seed: () => seedWalk(420, 72, 0.45, 180, 860, 0.42, 22),
      step: (last) => clamp(last + (Math.random() - 0.42) * 28, 180, 860),
    },
    chart: {
      tone: "neutral",
      scrub: true,
      formatValue: (v) => Math.round(v).toLocaleString("en-US"),
      "aria-label": "Requests per minute",
    },
  },
  {
    id: "errors",
    title: "Error rate",
    caption: "Semantic danger · snappier ease · momentum chip",
    heightClass: "h-[228px]",
    stream: {
      intervalMs: 400,
      seed: () => seedWalk(1.2, 64, 0.5, 0.2, 4.8, 0.52, 0.35),
      step: (last) => clamp(last + (Math.random() - 0.52) * 0.45, 0.15, 5.2),
    },
    chart: {
      tone: "danger",
      scrub: true,
      lerpSpeed: 0.12,
      formatValue: (v) => `${v.toFixed(2)}%`,
      "aria-label": "API error rate",
    },
  },
  {
    id: "latency",
    title: "p95 latency",
    caption: "Success tone · hairline stroke · slower catch-up",
    heightClass: "h-[228px]",
    stream: {
      intervalMs: 360,
      seed: () => seedWalk(142, 100, 0.48, 68, 280, 0.48, 12),
      step: (last) => clamp(last + (Math.random() - 0.48) * 18, 60, 320),
    },
    chart: {
      tone: "success",
      scrub: true,
      fill: false,
      lineWidth: 1.5,
      lerpSpeed: 0.05,
      window: 45,
      formatValue: (v) => `${Math.round(v)} ms`,
      "aria-label": "p95 latency",
    },
  },
  {
    id: "queue",
    title: "Queue depth",
    caption: "Warning tone · wide window · full grid and badge",
    heightClass: "h-[228px]",
    stream: {
      intervalMs: 280,
      seed: () => seedWalk(28, 160, 0.4, 4, 96, 0.55, 6),
      step: (last) => clamp(last + (Math.random() - 0.55) * 8, 2, 120),
    },
    chart: {
      tone: "warning",
      scrub: true,
      window: 60,
      formatValue: (v) => `${Math.round(v)} jobs`,
      "aria-label": "Queue depth",
    },
  },
  {
    id: "price",
    title: "Price",
    caption: "Value overlay · momentum colouring · scrub to read back",
    heightClass: "h-[276px]",
    stream: {
      intervalMs: 300,
      seed: () => seedWalk(2140, 80, 0.4, 900, 3400, 0.5, 60),
      step: (last) => clamp(last + (Math.random() - 0.5) * 70, 900, 3400),
    },
    chart: {
      tone: "neutral",
      badge: false,
      showValue: true,
      valueMomentumColor: true,
      formatValue: (v) => `$${v.toFixed(2)}`,
      "aria-label": "Asset price",
    },
  },
  {
    id: "orderbook",
    title: "Orderbook",
    caption: "Bid and ask sizes drift up behind the line · pace follows churn",
    heightClass: "h-[260px]",
    stream: {
      intervalMs: 420,
      book: true,
      seed: () => seedWalk(86400, 72, 0.45, 70000, 120000, 0.46, 900),
      step: (last) => clamp(last + (Math.random() - 0.46) * 1200, 70000, 120000),
    },
    chart: {
      tone: "neutral",
      formatValue: (v) => `$${Math.round(v).toLocaleString("en-US")}`,
      formatOrder: (size) =>
        `$${new Intl.NumberFormat("en-US", { maximumSignificantDigits: 2 }).format(size)}`,
      "aria-label": "Price with order book",
    },
  },
  {
    id: "empty",
    title: "Empty state",
    caption: "No samples yet · scrub and pause stay available for parity",
    heightClass: "h-[140px]",
    chart: {
      tone: "neutral",
      scrub: true,
      emptyText: "No data to display",
      "aria-label": "Metric awaiting data",
    },
  },
];

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

function seedWalk(
  start: number,
  count: number,
  stepSecs: number,
  min: number,
  max: number,
  bias: number,
  jitter: number,
): LiveLinePoint[] {
  const now = Date.now() / 1000;
  let current = start;
  const points: LiveLinePoint[] = [];
  for (let i = count; i >= 0; i -= 1) {
    current = clamp(current + (Math.random() - bias) * jitter, min, max);
    points.push({ time: now - i * stepSecs, value: current });
  }
  return points;
}

function makeBook(mid: number): LiveLineOrderbook {
  const side = (direction: 1 | -1): LiveLineOrder[] =>
    Array.from({ length: 8 }, (_, i) => [
      mid + direction * (i + 1) * mid * 0.0004,
      Math.round(10 ** (Math.random() * 2.2 - 0.3) * 100) / 100,
    ]);
  return { bids: side(-1), asks: side(1) };
}

function useMetricStream(
  stream: ShowcasePanel["stream"],
  paused: boolean,
): {
  data: LiveLinePoint[];
  value: number;
  loading: boolean;
  book: LiveLineOrderbook | undefined;
} {
  const [data, setData] = useState<LiveLinePoint[]>(() => stream?.seed() ?? []);
  const [book, setBook] = useState<LiveLineOrderbook | undefined>(undefined);
  const lastRef = useRef(data[data.length - 1]?.value ?? 0);
  const [loading, setLoading] = useState(Boolean(stream?.loadingMs));
  const pausedRef = useRef(paused);
  pausedRef.current = paused;

  useMountEffect(() => {
    if (!stream) return;
    const loadingTimer =
      stream.loadingMs !== undefined
        ? window.setTimeout(() => setLoading(false), stream.loadingMs)
        : undefined;

    const tick = window.setInterval(() => {
      if (pausedRef.current) return;
      const nextValue = stream.step(lastRef.current);
      lastRef.current = nextValue;
      if (stream.book) setBook(makeBook(nextValue));
      setData((prev) => {
        const next = [...prev, { time: Date.now() / 1000, value: nextValue }];
        return next.length > 240 ? next.slice(-240) : next;
      });
    }, stream.intervalMs);

    return () => {
      window.clearInterval(tick);
      if (loadingTimer !== undefined) window.clearTimeout(loadingTimer);
    };
  });

  const value = data[data.length - 1]?.value ?? 0;
  return { data: stream ? data : [], value, loading: stream ? loading : false, book };
}

function ShowcaseCard({ panel }: { panel: ShowcasePanel }) {
  const [paused, setPaused] = useState(false);
  const { data, value, loading, book } = useMetricStream(panel.stream, paused);
  const isEmpty = !panel.stream;

  return (
    <section className="overflow-hidden rounded-panel border border-line bg-surface shadow-hairline">
      <div className="flex flex-wrap items-start justify-between gap-3 border-b border-line-soft px-4 py-3">
        <div className="min-w-0">
          <h2 className="text-body-strong text-ink">{panel.title}</h2>
          <p className="mt-0.5 text-caption text-ink-3">{panel.caption}</p>
        </div>
        <Button variant="secondary" size="small" onClick={() => setPaused((on) => !on)}>
          {paused ? "Resume" : "Pause"}
        </Button>
      </div>
      <div className={`${panel.heightClass} px-4 pt-3 pb-1`}>
        <LiveLine
          {...panel.chart}
          orderbook={book}
          data={isEmpty ? [] : data}
          value={isEmpty ? 0 : value}
          loading={loading}
          paused={paused}
        />
      </div>
    </section>
  );
}

export function LiveLineDemo() {
  return (
    <div className="flex w-full max-w-[720px] flex-col gap-8 pb-4">
      {PANELS.map((panel) => (
        <ShowcaseCard key={panel.id} panel={panel} />
      ))}
    </div>
  );
}
