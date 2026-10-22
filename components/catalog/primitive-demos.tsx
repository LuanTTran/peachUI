"use client";

import { useState } from "react";
import { Button } from "@/components/atoms/button";
import { AgentThinking } from "@/components/primitives/agent-thinking";
import { ShimmerText } from "@/components/primitives/agent-log";
import { ComposerLoader } from "@/components/primitives/composer-loader";
import { LoadingState } from "@/components/primitives/loading-state";
import { StreamingText } from "@/components/primitives/streaming-text";
import { DataGrid, type DataGridColumn } from "@/components/primitives/data-grid";
import { DataTableExample } from "@/components/primitives/data-table";
import { ImportantAlertsCard } from "@/components/primitives/important-alerts-card";
import { OrdersChartCard } from "@/components/primitives/orders-chart-card";
import { PatientInfoCard } from "@/components/primitives/patient-info-card";
import { RevenueChartCard } from "@/components/primitives/revenue-chart-card";
import { StatCards } from "@/components/primitives/stat-cards";
import { ThemeToggle } from "@/components/primitives/theme-toggle";
import { EditChip, RiskChip, ToolChip } from "@/components/primitives/agent-inline-chips";

export function AgentInlineChipsDemo() {
  return (
    <div className="flex max-w-md flex-col gap-4 text-body text-ink">
      <p>
        Pull metrics with <ToolChip>stripe.query</ToolChip> then file the memo with <ToolChip>docs.write</ToolChip>.
      </p>
      <p className="flex flex-wrap items-center gap-2">
        <RiskChip level="medium" />
        <RiskChip level="low" />
      </p>
      <p>
        The release is <EditChip kind="remove">now available</EditChip> <EditChip kind="add">live</EditChip> for your team.
      </p>
    </div>
  );
}

export function AgentThinkingDemo() {
  return (
    <div className="flex flex-col items-start gap-3.5">
      <AgentThinking variant="wave" label="Thinking" />
      <AgentThinking variant="spin" label="Searching the docs" showTimer={false} />
      <AgentThinking variant="bloom" label="Gathering context" showTimer={false} />
      <AgentThinking variant="sweep" label="Scanning files" showTimer={false} />
      <AgentThinking variant="stars" label="Reading files" showTimer={false} />
      <AgentThinking variant="infinity" label="Writing the answer" showTimer={false} />
      <AgentThinking variant="spin" label="Deploying" showTimer={false} pill />
    </div>
  );
}

export function AgentLogDemo() {
  return (
    <ul className="flex flex-col gap-2 text-body-medium text-ink-2">
      <li>Read 4 files in components/atoms</li>
      <li>Ran the type checker</li>
      <li>
        <ShimmerText>Updating the button variants</ShimmerText>
      </li>
    </ul>
  );
}

export function ComposerLoaderDemo() {
  const [active, setActive] = useState(true);
  return (
    <div className="flex w-full max-w-md flex-col items-start gap-4">
      <ComposerLoader active={active}>
        <div className="flex h-24 w-full items-start rounded-3xl border border-line bg-surface p-4 text-body-regular text-ink-3">
          Ask anything about your project
        </div>
      </ComposerLoader>
      <Button variant="secondary" size="small" onClick={() => setActive((on) => !on)}>
        {active ? "Stop loading" : "Start loading"}
      </Button>
    </div>
  );
}

export function LoadingStateDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <LoadingState variant="Drive" label="Drafting the reply" />
      <LoadingState variant="Dots" label="Reading the notes" />
      <LoadingState variant="Orbit" label="Checking the date" />
    </div>
  );
}

export function StreamingTextDemo() {
  return (
    <div className="w-full max-w-xl">
      <StreamingText />
    </div>
  );
}

export function ThemeToggleDemo() {
  return (
    <div className="flex flex-col items-start gap-4">
      <ThemeToggle appearance="segmented" />
      <div className="w-56 rounded-2xl bg-canvas p-2">
        <ThemeToggle />
      </div>
    </div>
  );
}

export function DataTableDemo() {
  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[760px]">
        <DataTableExample />
      </div>
    </div>
  );
}

type Renewal = { id: string; account: string; owner: string; region: string; stage: string; seats: number; arr: number; health: number };

const REGIONS = ["North America", "Europe", "Asia Pacific", "Latin America"];
const STAGES = ["Discovery", "Proposal", "Negotiation", "Committed", "Closed won"];
const OWNERS = ["Owen Park", "Tyler Hayes", "Marcus Johnson", "Daniel Kim", "Sarah Bennett"];
const ACCOUNTS = ["Northwind", "Lumen", "Cedar", "Brightline", "Harbor", "Pinecrest", "Atlas", "Summit"];
const currency = (value: number) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(value);
const compactNumber = (value: number) =>
  new Intl.NumberFormat("en-US", { notation: "compact", maximumFractionDigits: 1 }).format(value);

const RENEWAL_COLUMNS: DataGridColumn<Renewal>[] = [
  { key: "account", header: "Account", width: 200, validate: (value) => (String(value).trim() ? undefined : "Enter an account name.") },
  { key: "owner", header: "Owner", width: 160, type: "select", options: OWNERS },
  { key: "region", header: "Region", width: 160, type: "select", options: REGIONS },
  { key: "stage", header: "Stage", width: 140, type: "select", options: STAGES },
  { key: "seats", header: "Seats", width: 96, type: "number", min: 0, summary: "sum", formatSummary: compactNumber },
  { key: "arr", header: "ARR", width: 132, type: "number", min: 0, summary: "sum", format: (value) => currency(Number(value)), formatSummary: (value) => `$${compactNumber(value)}` },
  { key: "health", header: "Health", width: 104, type: "number", min: 0, max: 100, summary: "average", format: (value) => `${value}%`, formatSummary: (value) => `${value.toFixed(1)}%` },
];

function makeRenewals(count: number): Renewal[] {
  return Array.from({ length: count }, (_, i) => {
    const seats = 10 + ((i * 73 + 19) % 640);
    return {
      id: `renewal-${i}`,
      account: `${ACCOUNTS[i % ACCOUNTS.length]} ${Math.floor(i / ACCOUNTS.length) + 1}`,
      owner: OWNERS[(i * 3) % OWNERS.length],
      region: REGIONS[(i * 7) % REGIONS.length],
      stage: STAGES[(i * 13) % STAGES.length],
      seats,
      arr: seats * (240 + (i % 4) * 60),
      health: 35 + ((i * 17) % 66),
    };
  });
}

export function DataGridDemo() {
  const [data, setData] = useState(() => makeRenewals(500));
  return (
    <DataGrid
      aria-label="Renewals"
      data={data}
      columns={RENEWAL_COLUMNS}
      getRowId={(row) => row.id}
      onDataChange={setData}
      height={360}
      exportFileName="renewals.csv"
    />
  );
}

export function StatCardsDemo() {
  return (
    <div className="flex w-full flex-col gap-4">
      <StatCards columns={2} count={2} />
      <StatCards variant="footer" columns={2} count={2} />
    </div>
  );
}

export function OrdersChartCardDemo() {
  return (
    <div className="w-full max-w-[560px]">
      <OrdersChartCard />
    </div>
  );
}

export function RevenueChartCardDemo() {
  return (
    <div className="w-full max-w-[560px]">
      <RevenueChartCard />
    </div>
  );
}

export function ImportantAlertsCardDemo() {
  return (
    <div className="w-full max-w-[380px]">
      <ImportantAlertsCard />
    </div>
  );
}

export function PatientInfoCardDemo() {
  return (
    <div className="w-full max-w-[380px]">
      <PatientInfoCard />
    </div>
  );
}
