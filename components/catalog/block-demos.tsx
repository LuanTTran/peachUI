"use client";

import { useRef, useState } from "react";
import { cx } from "@/lib/utils";
import { Button } from "@/components/atoms/button";
import { LiveLine, type LiveLinePoint } from "@/components/blocks/live-line";
import { useMountEffect } from "@/lib/use-mount-effect";
import { AuthCard } from "@/components/blocks/auth/auth-card";
import { NotificationCenterDemo as NotificationCenterExample } from "@/components/blocks/notification-center/notification-center-demo";
import { SettingsGeneral } from "@/components/blocks/settings/settings-general";
import { SettingsModal } from "@/components/blocks/settings/settings-modal";
import { PromptDeck, type PromptDeckVariant } from "@/components/blocks/prompt-deck";
import type { AgentThinkingVariant } from "@/components/primitives/agent-thinking";
import { AgentChat } from "@/components/blocks/agent-chat";
import { AgentPlanWrite } from "@/components/blocks/agent-plan-write";
import { AppShell } from "@/components/blocks/app-shell";
import { DashboardSidebar } from "@/components/blocks/sidebar/sidebar";
import { Dashboard } from "@/components/blocks/dashboard";
import { MetricStrip, type MetricStripVariant } from "@/components/blocks/metric-strip";
import { RecordLedger } from "@/components/blocks/record-ledger";
import { Calendar } from "@/components/blocks/calendar";
import { Dropzone, type DropzoneItem } from "@/components/blocks/dropzone";
import { AskStep } from "@/components/blocks/ask-step";
import { StepperFormWorkspaceDemo } from "@/components/blocks/stepper-form";
import { getLocalTimeZone, today } from "@internationalized/date";
import { BudgetGauge, type BudgetSegment } from "@/components/blocks/budget-gauge";
import {
  BreakdownCard,
  type BreakdownCardVariant,
  type BreakdownSegment,
} from "@/components/blocks/breakdown-card";
import { ModelRouter } from "@/components/blocks/model-router/model-router";
import { DraftCard } from "@/components/blocks/draft-card";
import {
  KanbanBoard,
  defaultKanbanColumns,
} from "@/components/blocks/kanban-board";
import { ReviewQueue } from "@/components/blocks/review-queue";
import { InboxTriage } from "@/components/blocks/inbox-triage";
import { AuditExplorer } from "@/components/blocks/audit-explorer";
import { SalesPipeline } from "@/components/blocks/sales-pipeline";
import { MorningBrief } from "@/components/blocks/morning-brief";
import { ToolApproval } from "@/components/blocks/tool-approval";
import { ContextLibrary } from "@/components/blocks/context-library";
import { AnswerComparison } from "@/components/blocks/answer-comparison";
import { WorkflowRunbook } from "@/components/blocks/workflow-runbook";
import { AgentRun } from "@/components/blocks/agent-run/agent-run";
import { DeployGate } from "@/components/blocks/deploy-gate";
import {
  BillingUsage,
  type BillingUsageEvent,
  type BillingUsageSeries,
} from "@/components/blocks/billing-usage";
import { PillTab, PillTabList } from "@/components/atoms/pill-tab";

function seedRequests(): LiveLinePoint[] {
  const now = Date.now() / 1000;
  let current = 420;
  const points: LiveLinePoint[] = [];
  for (let i = 48; i >= 0; i -= 1) {
    current = Math.max(180, Math.min(860, current + (Math.random() - 0.42) * 22));
    points.push({ time: now - i * 0.45, value: current });
  }
  return points;
}

function useRequestStream() {
  const [data, setData] = useState(seedRequests);

  useMountEffect(() => {
    const tick = window.setInterval(() => {
      setData((prev) => {
        const last = prev[prev.length - 1]?.value ?? 420;
        const nextValue = Math.max(180, Math.min(860, last + (Math.random() - 0.42) * 28));
        const next = [...prev, { time: Date.now() / 1000, value: nextValue }];
        return next.length > 240 ? next.slice(-240) : next;
      });
    }, 320);
    return () => window.clearInterval(tick);
  });

  const value = data[data.length - 1]?.value ?? 420;
  return { data, value };
}

export { LiveLineDemo } from "@/components/catalog/live-line-showcase";

export function SidebarDemo() {
  const [selected, setSelected] = useState("home");

  return (
    <div className="w-full">
      <div className="h-[min(720px,85vh)] min-h-[480px] w-fit">
        <DashboardSidebar
          className="h-full"
          selected={selected}
          onSelectedChange={setSelected}
        />
      </div>
    </div>
  );
}

export function SettingsModalDemo() {
  const [open, setOpen] = useState(false);
  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-8">
      <Button variant="primary" className="shrink-0" onClick={() => setOpen(true)}>
        Open settings dialog
      </Button>
      <SettingsGeneral />
      <SettingsModal isOpen={open} onClose={() => setOpen(false)} />
    </div>
  );
}

export function NotificationCenterDemo() {
  return (
    <div className="w-full max-w-[400px]">
      <NotificationCenterExample />
    </div>
  );
}

function ShapeSwitch({
  value,
  onChange,
  className,
}: {
  value: PromptDeckVariant;
  onChange: (variant: PromptDeckVariant) => void;
  className?: string;
}) {
  return (
    <PillTabList
      aria-label="Composer shape"
      className={cx("mb-3 h-8 w-fit max-w-full gap-0.5 self-start rounded-full bg-line/60 p-0.5", className)}
    >
      {(["Pill", "Rounded"] as const).map((option) => (
        <PillTab
          key={option}
          variant="segment"
          isSelected={value === option}
          onSelect={() => onChange(option)}
          className="px-3"
        >
          {option === "Pill" ? "Pill" : "Round"}
        </PillTab>
      ))}
    </PillTabList>
  );
}

const THINKING_OPTIONS: { value: AgentThinkingVariant; label: string; working: string }[] = [
  { value: "wave", label: "Wave", working: "Thinking" },
  { value: "spin", label: "Spin", working: "Searching the docs" },
  { value: "bloom", label: "Bloom", working: "Gathering context" },
  { value: "sweep", label: "Sweep", working: "Scanning files" },
  { value: "stars", label: "Stars", working: "Reading files" },
  { value: "infinity", label: "Infinity", working: "Writing the answer" },
];

export function PromptDeckDemo() {
  const [variant, setVariant] = useState<PromptDeckVariant>("Pill");
  const [thinking, setThinking] = useState<(typeof THINKING_OPTIONS)[number]>(THINKING_OPTIONS[0]);
  const [working, setWorking] = useState(false);
  const stopTimer = useRef<number | undefined>(undefined);

  useMountEffect(() => () => window.clearTimeout(stopTimer.current));

  const simulateRun = () => {
    setWorking(true);
    window.clearTimeout(stopTimer.current);
    stopTimer.current = window.setTimeout(() => setWorking(false), 6000);
  };

  return (
    <div className="flex w-full max-w-3xl flex-col overflow-visible pb-40 pt-4 sm:pb-72">
      <div className="mx-auto w-full max-w-[680px]">
        <div className="mb-3 flex flex-wrap items-center gap-2">
          <ShapeSwitch value={variant} onChange={setVariant} className="mb-0" />
          <PillTabList
            aria-label="Thinking indicator"
            className="h-8 w-fit max-w-full gap-0.5 self-start overflow-x-auto overflow-y-hidden rounded-full bg-line/60 p-0.5 [scrollbar-width:none] max-sm:order-last [&::-webkit-scrollbar]:hidden"
          >
            {THINKING_OPTIONS.map((option) => (
              <PillTab
                key={option.value}
                variant="segment"
                isSelected={thinking.value === option.value}
                onSelect={() => setThinking(option)}
                className="px-3"
              >
                {option.label}
              </PillTab>
            ))}
          </PillTabList>
          <Button variant="secondary" size="small" onClick={simulateRun}>
            {working ? "Stop run" : "Simulate a run"}
          </Button>
        </div>
        <PromptDeck
          variant={variant}
          className="mx-0 max-w-none"
          working={working}
          workingVariant={thinking.value}
          workingLabel={thinking.working}
          onSend={simulateRun}
        />
      </div>
    </div>
  );
}

const MB = 1024 * 1024;

const DROPZONE_SEED: DropzoneItem[] = [
  { id: "report", name: "Q3-Board-Report.pdf", size: Math.round(4.2 * MB), status: "complete" },
  { id: "hero", name: "Hero-Shot.png", size: Math.round(2.6 * MB), loaded: Math.round(0.4 * MB), secondsLeft: 4, status: "uploading" },
  { id: "budget", name: "Budget-2027.xlsx", size: Math.round(1.3 * MB), loaded: Math.round(0.6 * MB), status: "error", error: "connection" },
  { id: "reel", name: "Product-Demo.pdf", size: Math.round(48 * MB), status: "error", error: "size" },
  { id: "cover", name: "Cover-Still.png", size: Math.round(1.8 * MB), loaded: Math.round(0.2 * MB), secondsLeft: 5, status: "uploading" },
];

export function DropzoneDemo() {
  // Copy-paste host: own the queue in state; Dropzone only validates drops and renders rows.
  const [items, setItems] = useState<DropzoneItem[]>(DROPZONE_SEED);

  // Demo-only: simulate upload progress. In production, drive `items` from your API / XHR.
  useMountEffect(() => {
    const timer = window.setInterval(() => {
      setItems((prev) => prev.map((item) => {
        if (item.status !== "uploading") return item;
        const loaded = Math.min(item.size, (item.loaded ?? 0) + Math.max(item.size * 0.08, 48 * 1024));
        if (loaded >= item.size) return { ...item, loaded: item.size, status: "complete", secondsLeft: 0 };
        const remaining = 1 - loaded / item.size;
        return { ...item, loaded, secondsLeft: Math.max(1, Math.round(remaining * 6)) };
      }));
    }, 480);
    return () => window.clearInterval(timer);
  });

  return (
    <div className="flex w-full justify-center py-6">
      <Dropzone
        items={items}
        onAdd={(files) => {
          setItems((prev) => [
            ...prev,
            ...files.map((file) => ({
              id: crypto.randomUUID(),
              name: file.name,
              size: file.size,
              loaded: 0,
              secondsLeft: 5,
              status: "uploading" as const,
            })),
          ]); // start your upload here; patch the same id with loaded / status / error
        }}
        onRemove={(id) => setItems((prev) => prev.filter((item) => item.id !== id))}
        onRetry={(id) => {
          setItems((prev) => prev.map((item) => (
            item.id === id ? { ...item, status: "uploading", error: undefined, secondsLeft: 4 } : item
          )));
        }}
        onClear={() => setItems([])}
      />
    </div>
  );
}

export function CalendarDemo() {
  const now = today(getLocalTimeZone());
  return (
    <div className="flex w-full items-start justify-center py-4">
      <Calendar
        aria-label="Report range"
        popoverPlacement="bottom"
        defaultCompare="previous-period"
        defaultHighlightComparison
        defaultValue={{ start: now.subtract({ days: 29 }), end: now }}
      />
    </div>
  );
}

export function AuthCardDemo() {
  return (
    <div className="flex w-full flex-col items-center gap-12">
      <AuthCard layout="inline" providers={["google", "apple", "github", "x"]} />
      <AuthCard mode="verify" email="bailey.lee@example.com" />
    </div>
  );
}

export function StepperFormDemo() {
  return (
    <div className="flex w-full justify-center py-6">
      <StepperFormWorkspaceDemo />
    </div>
  );
}

export function AgentChatDemo() {
  const [variant, setVariant] = useState<PromptDeckVariant>("Pill");
  return (
    <div className="flex w-full flex-col items-center overflow-visible pb-64 pt-2">
      <div className="w-full max-w-[680px]">
        <ShapeSwitch value={variant} onChange={setVariant} />
      </div>
      <AgentChat variant={variant} />
    </div>
  );
}

const PLAN_WRITE_SEGMENTS: BudgetSegment[] = [
  { id: "system", label: "System prompt", tokens: 4200, share: 0.024 },
  { id: "tools", label: "Tools", tokens: 12800, share: 0.073 },
  { id: "files", label: "Files", tokens: 46100, share: 0.262 },
  { id: "conversation", label: "Conversation", tokens: 108600, share: 0.618 },
  { id: "memory", label: "Memory", tokens: 3900, share: 0.022 },
];

const CONTEXT_BREAKDOWN_SEGMENTS: BreakdownSegment[] = [
  { id: "system", label: "System prompt", value: 4200, share: 0.024 },
  { id: "tools", label: "Tools", value: 12800, share: 0.073 },
  { id: "files", label: "Files", value: 46100, share: 0.262 },
  { id: "conversation", label: "Conversation", value: 108600, share: 0.618 },
  { id: "memory", label: "Memory", value: 3900, share: 0.022 },
];

const REVENUE_BREAKDOWN_SEGMENTS: BreakdownSegment[] = [
  { id: "direct", label: "Direct", value: 4820, share: 0.35 },
  { id: "organic", label: "Organic search", value: 3910, share: 0.29 },
  { id: "referrals", label: "Referrals", value: 2240, share: 0.16 },
  { id: "social", label: "Social", value: 1680, share: 0.12 },
  { id: "email", label: "Email", value: 940, share: 0.07 },
];

function BreakdownCardVariantSwitch({
  value,
  onChange,
}: {
  value: BreakdownCardVariant;
  onChange: (variant: BreakdownCardVariant) => void;
}) {
  return (
    <PillTabList
      aria-label="Breakdown layout"
      className="mb-3 h-8 w-fit max-w-full gap-0.5 self-start rounded-full bg-line/60 p-0.5"
    >
      {(
        [
          { id: "context" as const, label: "Context window" },
          { id: "compact" as const, label: "Compact" },
        ] as const
      ).map((option) => (
        <PillTab
          key={option.id}
          variant="segment"
          isSelected={value === option.id}
          onSelect={() => onChange(option.id)}
          className="px-3"
        >
          {option.label}
        </PillTab>
      ))}
    </PillTabList>
  );
}

export function BreakdownCardDemo() {
  const [variant, setVariant] = useState<BreakdownCardVariant>("context");

  return (
    <div className="flex w-full flex-col items-center py-4">
      <div className="w-full max-w-[420px]">
        <BreakdownCardVariantSwitch value={variant} onChange={setVariant} />
        {variant === "context" ? (
          <BreakdownCard
            variant="context"
            totalValue={175_600}
            capValue={200_000}
            segments={CONTEXT_BREAKDOWN_SEGMENTS}
            onNewChat={() => undefined}
            onCompact={() => undefined}
          />
        ) : (
          <BreakdownCard
            variant="compact"
            totalValue={13_590}
            segments={REVENUE_BREAKDOWN_SEGMENTS}
            trend={{ label: "+ 12.4%", positive: true }}
          />
        )}
      </div>
    </div>
  );
}

export function AppShellDemo() {
  return (
    <div className="w-full">
      <AppShell />
    </div>
  );
}

function MetricStripVariantSwitch({
  value,
  onChange,
}: {
  value: MetricStripVariant;
  onChange: (variant: MetricStripVariant) => void;
}) {
  return (
    <PillTabList
      aria-label="Metric strip layout"
      className="mb-3 h-8 w-fit max-w-full gap-0.5 self-start rounded-full bg-line/60 p-0.5"
    >
      {(["footer", "plain"] as const).map((option) => (
        <PillTab
          key={option}
          variant="segment"
          isSelected={value === option}
          onSelect={() => onChange(option)}
          className="px-3"
        >
          {option === "footer" ? "Footer band" : "Plain"}
        </PillTab>
      ))}
    </PillTabList>
  );
}

export function DashboardDemo() {
  const [metricVariant, setMetricVariant] = useState<MetricStripVariant>("footer");
  const requests = useRequestStream();

  return (
    <div className="flex w-full flex-col items-stretch">
      <MetricStripVariantSwitch value={metricVariant} onChange={setMetricVariant} />
      <Dashboard
        metricVariant={metricVariant}
        chart={
          <section className="overflow-hidden rounded-panel border border-line bg-surface shadow-hairline">
            <h2 className="px-4 pt-3 text-body-medium text-ink">Requests</h2>
            <div className="h-[180px]">
              <LiveLine
                data={requests.data}
                value={requests.value}
                aria-label="Requests per minute"
                formatValue={(sample) => Math.round(sample).toLocaleString("en-US")}
              />
            </div>
          </section>
        }
      />
      <details className="mt-12 w-full rounded-panel border border-line bg-canvas p-4">
        <summary className="cursor-pointer text-body-strong text-ink">Paste bundles</summary>
        <div className="mt-6 flex flex-col gap-10">
          <MetricStrip variant="footer" columns={2} count={4} />
          <MetricStrip variant="plain" columns={2} count={4} />
          <RecordLedger />
        </div>
      </details>
    </div>
  );
}

export function ModelRouterDemo() {
  return (
    <div className="flex w-full flex-col items-center overflow-visible pb-24 pt-2">
      <ModelRouter
        onSettings={() => undefined}
        onClose={() => undefined}
        onDeployPolicy={() => undefined}
      />
      <details className="mt-12 w-full max-w-[40rem] rounded-panel border border-line bg-canvas p-4">
        <summary className="cursor-pointer text-body-strong text-ink">Paste bundles</summary>
        <div className="mt-6">
          <ModelRouter variant="embedded" onDeployPolicy={() => undefined} />
        </div>
      </details>
    </div>
  );
}

export function KanbanBoardDemo() {
  const [columns, setColumns] = useState(defaultKanbanColumns);

  return (
    <div className="flex w-full flex-col items-stretch">
      <KanbanBoard columns={columns} onColumnsChange={setColumns} />
    </div>
  );
}

export function ReviewQueueDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <ReviewQueue />
    </div>
  );
}

export function InboxTriageDemo() {
  return (
    <div className="w-full">
      <InboxTriage />
    </div>
  );
}

export function AuditExplorerDemo() {
  return (
    <div className="w-full">
      <AuditExplorer />
    </div>
  );
}

export function SalesPipelineDemo() {
  return (
    <div className="w-full">
      <SalesPipeline />
    </div>
  );
}

export function MorningBriefDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <MorningBrief />
    </div>
  );
}

export function ToolApprovalDemo() {
  return (
    <div className="w-full">
      <ToolApproval />
    </div>
  );
}

export function ContextLibraryDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <ContextLibrary />
    </div>
  );
}

export function AnswerComparisonDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <AnswerComparison />
    </div>
  );
}

export function WorkflowRunbookDemo() {
  return (
    <div className="w-full">
      <WorkflowRunbook />
    </div>
  );
}

export function AgentRunDemo() {
  return (
    <div className="flex w-full max-w-4xl flex-col">
      <AgentRun />
    </div>
  );
}

export function DeployGateDemo() {
  return (
    <div className="flex w-full max-w-3xl flex-col">
      <DeployGate />
    </div>
  );
}

export function AgentPlanWriteDemo() {
  return (
    <div className="flex w-full flex-col items-center overflow-visible pb-24 pt-2">
      <AgentPlanWrite />
      <details className="mt-12 w-full max-w-[680px] rounded-panel border border-line bg-canvas p-4">
        <summary className="cursor-pointer text-body-strong text-ink">Paste bundles</summary>
        <div className="mt-6 flex flex-col gap-10">
          <AskStep title="Send campaign email" subtitle="October product update · Newsletter" />
          <DraftCard />
          <BudgetGauge usedTokens={175_600} capTokens={200_000} segments={PLAN_WRITE_SEGMENTS} />
        </div>
      </details>
    </div>
  );
}

/* Demo-only stream: billing accrues in half-second ticks, like a meter
 * rolling forward. In production, drive these props from your billing API. */

const BILLING_EVENT_RATES: Record<string, number> = {
  "evt-in": 5e-7,
  "evt-out": 2e-6,
  "evt-cached": 1e-7,
};

function seedBillingSeries(): BillingUsageSeries {
  const now = Date.now() / 1000;
  let revenue = 15_600;
  let cost = 5_480;
  const revenuePoints: LiveLinePoint[] = [];
  const costPoints: LiveLinePoint[] = [];
  for (let i = 60; i >= 0; i -= 1) {
    revenue += 22 + Math.random() * 48;
    cost += 14 + Math.random() * 26;
    revenuePoints.push({ time: now - i * 0.5, value: revenue });
    costPoints.push({ time: now - i * 0.5, value: cost });
  }
  return { revenue: revenuePoints, cost: costPoints };
}

function seedBillingEvents(): BillingUsageEvent[] {
  return [
    { id: "evt-in", label: "tokens.in", quantity: 412_543, amount: 0.21 },
    { id: "evt-out", label: "tokens.out", quantity: 129_284, amount: 0.26 },
    { id: "evt-cached", label: "tokens.cached", quantity: 89_410, amount: 0.01 },
  ];
}

function useBillingStream() {
  const [state, setState] = useState(() => ({
    tokens: 9_258_400_000,
    charge: 20_910,
    events: seedBillingEvents(),
    series: seedBillingSeries(),
  }));

  useMountEffect(() => {
    const tick = window.setInterval(() => {
      setState((prev) => {
        const lastRevenue = prev.series.revenue[prev.series.revenue.length - 1]?.value ?? 15_600;
        const lastCost = prev.series.cost[prev.series.cost.length - 1]?.value ?? 5_480;
        const revenueDelta = 2 + Math.random() * 14;
        const costDelta = 1 + Math.random() * 6;
        const time = Date.now() / 1000;
        const revenue = [...prev.series.revenue, { time, value: lastRevenue + revenueDelta }];
        const cost = [...prev.series.cost, { time, value: lastCost + costDelta }];
        return {
          tokens: prev.tokens + 400_000 + Math.random() * 1_600_000,
          charge: prev.charge + revenueDelta + Math.random() * 3,
          events: prev.events.map((event) => {
            const added = 600 + Math.random() * 3_400;
            return {
              ...event,
              quantity: event.quantity + added,
              amount: event.amount + added * (BILLING_EVENT_RATES[event.id] ?? 1e-6),
            };
          }),
          series: {
            revenue: revenue.length > 240 ? revenue.slice(-240) : revenue,
            cost: cost.length > 240 ? cost.slice(-240) : cost,
          },
        };
      });
    }, 500);
    return () => window.clearInterval(tick);
  });

  const revenue = state.series.revenue[state.series.revenue.length - 1]?.value ?? 0;
  const cost = state.series.cost[state.series.cost.length - 1]?.value ?? 0;
  const margin = revenue > 0 ? 1 - cost / revenue : 0;
  return { ...state, revenue, cost, margin };
}

export function BillingUsageDemo() {
  const billing = useBillingStream();

  return (
    <div className="flex w-full justify-center py-4">
      <BillingUsage
        customer={{ name: "Lumen Robotics", email: "mia@lumen.dev", avatarArt: "node" }}
        payment={{ brand: "Visa", last4: "4242", due: "Nov 1" }}
        events={billing.events}
        series={billing.series}
        tokensMetered={billing.tokens}
        revenue={billing.revenue}
        inferenceCost={billing.cost}
        grossMargin={billing.margin}
        cardCharge={billing.charge}
      />
    </div>
  );
}
