"use client";

/**
 * Overview — fleet KPIs (StatCards), live throughput (LiveLine), and
 * the recent-activity trail (TimelineFeed).
 */

import { useState } from "react";
import { Activity, Coins, Hourglass, ShieldCheck } from "reicon-react";
import { LiveLine, type LiveLinePoint } from "@/components/blocks/live-line";
import { MetricStrip } from "@/components/blocks/metric-strip";
import type { Stat } from "@/components/primitives/stat-cards";
import { TimelineFeed } from "@/components/primitives/timeline-feed";
import { useMountEffect } from "@/lib/use-mount-effect";
import { OPS_TIMELINE } from "../data";

function seedSeries(): LiveLinePoint[] {
  const now = Date.now() / 1000;
  const points: LiveLinePoint[] = [];
  for (let i = 96; i >= 0; i -= 1) {
    const time = now - i * 0.6;
    points.push({ time, value: 360 + Math.sin(time / 7) * 110 + Math.sin(time * 2.3) * 45 });
  }
  return points;
}

function useFleetStream() {
  const [data, setData] = useState(seedSeries);

  useMountEffect(() => {
    const tick = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1]?.value ?? 360;
        const nextValue = Math.max(140, Math.min(640, last + (Math.random() - 0.44) * 36));
        const next = [...prev, { time: Date.now() / 1000, value: nextValue }];
        return next.length > 240 ? next.slice(-240) : next;
      });
    }, 700);
    return () => window.clearInterval(tick);
  });

  const value = data[data.length - 1]?.value ?? 360;
  return { data, value };
}

export function OverviewPanel({
  liveCount,
  pendingCount,
  runCount,
}: {
  liveCount: number;
  pendingCount: number;
  runCount: number;
}) {
  const stream = useFleetStream();

  const stats: Stat[] = [
    {
      icon: Activity,
      label: "Live runs",
      value: String(liveCount),
      delta: "now",
      deltaColor: "neutral",
      tone: "accent",
      caption: "Queued + running across the fleet",
    },
    {
      icon: ShieldCheck,
      label: "Waiting on you",
      value: String(pendingCount),
      delta: pendingCount > 0 ? "act now" : "clear",
      deltaColor: pendingCount > 0 ? "rose" : "lime",
      tone: "red",
      caption: "Approvals paused on a person",
    },
    {
      icon: Hourglass,
      label: "Runs today",
      value: String(runCount),
      delta: "+3",
      deltaColor: "lime",
      tone: "schedule",
      caption: "vs. the same hours yesterday",
    },
    {
      icon: Coins,
      label: "Spend today",
      value: "$1.85",
      delta: "−12%",
      deltaColor: "lime",
      tone: "violet",
      caption: "vs. the same hours yesterday",
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <MetricStrip variant="footer" stats={stats} columns={4} />
      <section className="overflow-hidden rounded-3xl border border-line bg-surface shadow-xs">
        <div className="flex items-baseline justify-between gap-3 px-4 py-3.5">
          <h2 className="text-body-medium text-ink">Fleet throughput</h2>
          <p className="text-body-2-regular text-ink-2 tabular-nums">tokens / min</p>
        </div>
        <div className="h-[220px] border-t border-line">
          <LiveLine
            data={stream.data}
            value={stream.value}
            aria-label="Fleet throughput in tokens per minute"
            formatValue={(sample) => `${Math.round(sample).toLocaleString("en-US")} tok`}
            grid
            badge
          />
        </div>
      </section>
      <TimelineFeed header="Recent activity" entries={OPS_TIMELINE} />
    </div>
  );
}
