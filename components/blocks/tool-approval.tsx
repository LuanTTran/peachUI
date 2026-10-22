"use client";

/**
 * PeachUI — ToolApproval (block)
 * @tier block
 * @deps button, motion
 * @requires app/globals.css
 *
 * Pick a connector, review the calls it wants to run,
 * approve them one by one or all at once, then run.
 */

import { useState, type ComponentType, type ReactNode } from "react";
import { Check, Database, Kanban, Message, Search, Store, X } from "reicon-react";
import { Button } from "@/components/atoms/button";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

type CallDecision = "approved" | "denied";
type ConnectorIcon = ComponentType<{ className?: string }>;

export interface ToolCall {
  id: string;
  name: string;
  args: string;
  writes: boolean;
  detail: string;
}

export interface ApprovalConnector {
  id: string;
  name: string;
  meta: string;
  job: string;
  blurb: string;
  tone: string;
  Icon: ConnectorIcon;
  calls: ToolCall[];
}

const DEFAULT_CONNECTORS: ApprovalConnector[] = [
  {
    id: "shopify",
    name: "Shopify",
    meta: "Store · Connected",
    job: "Order sync",
    blurb: "Syncs orders, inventory, and refunds both ways.",
    tone: "bg-green",
    Icon: Store,
    calls: [
      {
        id: "orders",
        name: "orders.list",
        args: 'orders.list({ since: "7d", status: "open" })',
        writes: false,
        detail: "Reads 214 open orders from the last week.",
      },
      {
        id: "inventory",
        name: "inventory.set",
        args: 'inventory.set({ location: "main" })',
        writes: true,
        detail: "Writes reconciled stock levels back to the store.",
      },
      {
        id: "customers",
        name: "customers.tag",
        args: 'customers.tag({ segment: "vip" })',
        writes: true,
        detail: "Tags 38 customers in the VIP segment.",
      },
      {
        id: "refunds",
        name: "refunds.list",
        args: 'refunds.list({ since: "7d" })',
        writes: false,
        detail: "Reads 6 refunds from the same window.",
      },
    ],
  },
  {
    id: "postgres",
    name: "Postgres",
    meta: "Database · Connected",
    job: "Table backfill",
    blurb: "Backfills analytics tables on a schedule.",
    tone: "bg-accent",
    Icon: Database,
    calls: [
      {
        id: "select",
        name: "sql.select",
        args: "SELECT * FROM orders WHERE day = today",
        writes: false,
        detail: "Reads today's orders into the staging frame.",
      },
      {
        id: "insert",
        name: "sql.insert",
        args: "INSERT INTO analytics_daily (…)",
        writes: true,
        detail: "Writes 1,204 rows to analytics_daily.",
      },
    ],
  },
  {
    id: "slack",
    name: "Slack",
    meta: "Chat · Connected",
    job: "Weekly digest",
    blurb: "Posts digests and resolves teammates.",
    tone: "bg-orange",
    Icon: Message,
    calls: [
      {
        id: "post",
        name: "chat.postMessage",
        args: 'chat.postMessage({ channel: "#sales" })',
        writes: true,
        detail: "Posts the digest to #sales on Friday.",
      },
      {
        id: "lookup",
        name: "users.lookupByEmail",
        args: "users.lookupByEmail({ emails: owners })",
        writes: false,
        detail: "Resolves three deal owners to Slack handles.",
      },
    ],
  },
  {
    id: "linear",
    name: "Linear",
    meta: "Project management · Connected",
    job: "Issue sync",
    blurb: "Turns requests into issues and keeps status in sync.",
    tone: "bg-ink",
    Icon: Kanban,
    calls: [
      {
        id: "issues",
        name: "issues.create",
        args: 'issues.create({ team: "release", count: 3 })',
        writes: true,
        detail: "Opens three issues on the release board.",
      },
      {
        id: "cycles",
        name: "cycles.current",
        args: 'cycles.current({ team: "release" })',
        writes: false,
        detail: "Reads the active cycle to place the issues.",
      },
    ],
  },
];

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function connectorMeta(connector: ApprovalConnector, pending: number, ran: boolean) {
  if (ran) return "Ran";
  if (pending === 0) return "Reviewed";
  return `${pending} pending`;
}

export type ToolApprovalProps = {
  className?: string;
  connectors?: ApprovalConnector[];
};

export function ToolApproval({
  className,
  connectors = DEFAULT_CONNECTORS,
}: ToolApprovalProps) {
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState(() => connectors[0]?.id ?? "");
  const [decisions, setDecisions] = useState<Record<string, CallDecision>>({});
  const [ranIds, setRanIds] = useState<string[]>([]);
  const [query, setQuery] = useState("");

  const open = connectors.find((connector) => connector.id === openId) ?? connectors[0] ?? null;

  const visible = query
    ? connectors.filter((connector) =>
        connector.name.toLowerCase().includes(query.toLowerCase()),
      )
    : connectors;
  const needsApproval = visible.filter((connector) =>
    connector.calls.some((call) => !decisions[call.id]),
  );
  const reviewed = visible.filter((connector) =>
    connector.calls.every((call) => decisions[call.id]),
  );

  const pendingTotal = connectors.reduce(
    (sum, connector) => sum + connector.calls.filter((call) => !decisions[call.id]).length,
    0,
  );

  const pendingCalls = open ? open.calls.filter((call) => !decisions[call.id]) : [];
  const approvedCalls = open ? open.calls.filter((call) => decisions[call.id] === "approved") : [];
  const deniedCalls = open ? open.calls.filter((call) => decisions[call.id] === "denied") : [];
  const allDecided = open !== null && pendingCalls.length === 0;
  const ran = open !== null && ranIds.includes(open.id);

  const decide = (callId: string, decision: CallDecision) =>
    setDecisions((current) => ({ ...current, [callId]: decision }));

  const approveAll = () => {
    if (!open) return;
    setDecisions((current) => {
      const next = { ...current };
      for (const call of open.calls) if (!next[call.id]) next[call.id] = "approved";
      return next;
    });
  };

  const runApproved = () => {
    if (open && !ran) setRanIds((current) => [...current, open.id]);
  };

  const status: { outcome: string; subject: string } = !open
    ? { outcome: "", subject: "No connector open" }
    : ran
      ? { outcome: "Ran", subject: open.job }
      : pendingCalls.length > 0
        ? { outcome: `${pendingCalls.length} pending`, subject: open.job }
        : deniedCalls.length === open.calls.length
          ? { outcome: "Denied", subject: `${deniedCalls.length} calls` }
          : deniedCalls.length === 0
            ? { outcome: "Approved", subject: `${approvedCalls.length} calls` }
            : {
                outcome: `${approvedCalls.length} approved`,
                subject: `${deniedCalls.length} denied`,
              };

  const footerKey = !open
    ? "empty"
    : ran
      ? `ran-${open.id}`
      : `${open.id}-${pendingCalls.length}-${approvedCalls.length}-${deniedCalls.length}`;

  return (
    <section
      aria-label="Tool approval"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Tool approval</h2>
            <Swap
              swapKey={pendingTotal === 0 ? "all" : `pending-${pendingTotal}`}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2 tabular-nums"
            >
              {pendingTotal === 0 ? "All calls reviewed" : `${pendingTotal} calls waiting`}
            </Swap>
          </div>

          <p className="text-body-regular text-pretty text-ink-2">
            Connectors asked to run. Approve each call before it goes.
          </p>

          <div className="flex h-9 items-center gap-2 rounded-lg bg-canvas px-2.5">
            <Search className="size-4 shrink-0 text-ink-3" aria-hidden />
            <input
              type="text"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search connectors"
              aria-label="Search connectors"
              className="min-w-0 flex-1 bg-transparent text-body-regular text-ink outline-none placeholder:text-ink-3"
            />
            {query ? (
              <button
                type="button"
                aria-label="Clear search"
                onClick={() => setQuery("")}
                className="flex size-5 shrink-0 items-center justify-center rounded-full text-ink-3 transition-colors duration-100 hover:bg-hover-2 hover:text-ink"
              >
                <X className="size-3" aria-hidden />
              </button>
            ) : null}
          </div>

          {visible.length === 0 ? (
            <div className="flex flex-col items-start gap-1 rounded-lg bg-canvas px-3 py-4">
              <p className="text-body-medium text-ink">
                No connectors match &ldquo;{query}&rdquo;.
              </p>
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-body-2-medium text-accent transition-colors duration-100 hover:underline"
              >
                Show all
              </button>
            </div>
          ) : (
            [
              { label: "Needs approval", rows: needsApproval },
              { label: "Reviewed", rows: reviewed },
            ].map(
              (group) =>
                group.rows.length > 0 && (
                  <div key={group.label}>
                    <p className="px-2.5 pb-1 text-body-2-medium text-ink-3">{group.label}</p>
                    <ul className="flex flex-col gap-1">
                      {group.rows.map((connector) => {
                        const isOpen = open?.id === connector.id;
                        const pending = connector.calls.filter(
                          (call) => !decisions[call.id],
                        ).length;
                        const isRan = ranIds.includes(connector.id);
                        return (
                          <li key={connector.id}>
                            <button
                              type="button"
                              aria-pressed={isOpen}
                              onClick={() => setOpenId(connector.id)}
                              className={cx(
                                "button-press-motion w-full rounded-lg px-2.5 py-2 text-left",
                                "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-accent",
                                isOpen ? "bg-canvas" : "hover:bg-hover-2",
                              )}
                            >
                              <span className="flex min-w-0 items-center gap-2.5">
                                <span
                                  className={cx(
                                    "flex size-8 shrink-0 items-center justify-center rounded-lg text-surface",
                                    connector.tone,
                                  )}
                                  aria-hidden
                                >
                                  <connector.Icon className="size-4" />
                                </span>
                                <span className="min-w-0 flex-1">
                                  <span className="block truncate text-body-medium text-ink">
                                    {connector.name}
                                  </span>
                                  <span className="block truncate text-body-2-regular text-ink-2">
                                    {connector.job} ·{" "}
                                    {connectorMeta(connector, pending, isRan)}
                                  </span>
                                </span>
                                {pending === 0 ? (
                                  <Check className="size-4 shrink-0 text-green" aria-hidden />
                                ) : null}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                ),
            )
          )}
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Tool calls</p>
          <Swap
            swapKey={open?.id ?? "empty"}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {open ? (
              <>
                <div className="flex items-start gap-2.5">
                  <span
                    className={cx(
                      "flex size-9 shrink-0 items-center justify-center rounded-lg text-surface",
                      open.tone,
                    )}
                    aria-hidden
                  >
                    <open.Icon className="size-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="min-w-0 text-body-medium text-pretty text-ink">
                        {open.name}
                      </h3>
                      {ran ? (
                        <span className="inline-flex shrink-0 items-center gap-1 text-caption-1-medium text-green">
                          <Check className="size-3.5" aria-hidden />
                          Ran
                        </span>
                      ) : null}
                    </div>
                    <p className="text-body-2-regular text-ink-2">
                      {open.job} · {open.meta}
                    </p>
                  </div>
                </div>
                <p className="text-body-regular text-pretty text-ink-2">{open.blurb}</p>
                <ul className="flex flex-col gap-2">
                  {open.calls.map((call) => {
                    const decision = decisions[call.id];
                    return (
                      <li key={call.id} className="rounded-lg bg-canvas px-3 py-2.5">
                        <div className="flex items-center justify-between gap-2">
                          <span className="flex min-w-0 items-center gap-2">
                            <span className="truncate text-body-2-medium text-ink">
                              {call.name}
                            </span>
                            {call.writes ? (
                              <span className="shrink-0 rounded-full bg-orange-muted px-1.5 py-0.5 text-caption-1-medium text-orange">
                                Writes
                              </span>
                            ) : null}
                          </span>
                          <Swap
                            swapKey={decision ?? "pending"}
                            reduced={reducedMotion}
                            className="shrink-0"
                          >
                            {decision ? (
                              <button
                                type="button"
                                onClick={() =>
                                  setDecisions((current) => {
                                    const next = { ...current };
                                    delete next[call.id];
                                    return next;
                                  })
                                }
                                aria-label={`Undo ${decision} for ${call.name}`}
                                className={cx(
                                  "inline-flex items-center gap-1 text-caption-1-medium",
                                  decision === "approved" ? "text-green" : "text-ink-3",
                                )}
                              >
                                {decision === "approved" ? (
                                  <Check className="size-3.5" aria-hidden />
                                ) : (
                                  <X className="size-3.5" aria-hidden />
                                )}
                                {decision === "approved" ? "Approved" : "Denied"}
                              </button>
                            ) : (
                              <span className="flex items-center gap-1">
                                <Button
                                  size="xs"
                                  variant="secondary"
                                  onClick={() => decide(call.id, "approved")}
                                >
                                  Approve
                                </Button>
                                <Button
                                  size="xs"
                                  variant="ghost"
                                  onClick={() => decide(call.id, "denied")}
                                >
                                  Deny
                                </Button>
                              </span>
                            )}
                          </Swap>
                        </div>
                        <code className="mt-1.5 block truncate rounded-md bg-field px-2 py-1 font-mono text-caption-1-regular text-ink-2">
                          {call.args}
                        </code>
                        <p className="mt-1.5 text-body-2-regular text-ink-2">{call.detail}</p>
                      </li>
                    );
                  })}
                </ul>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">Nothing needs approval.</p>
                <p className="text-body-regular text-ink-2">
                  Tool calls land here when a connector asks to run.
                </p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {status.outcome ? (
              <>
                <span className="text-body-medium text-ink">{status.outcome}</span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{status.subject}</span>
              </>
            ) : (
              <span className="text-ink-2">{status.subject}</span>
            )}
          </Swap>
        </div>
        {ran ? (
          <Button variant="secondary" size="small" leadingIcon={Check} disabled className="shrink-0">
            Ran
          </Button>
        ) : allDecided ? (
          approvedCalls.length > 0 ? (
            <Button variant="primary" size="small" onClick={runApproved} className="shrink-0">
              Run approved calls
            </Button>
          ) : (
            <Button variant="secondary" size="small" disabled className="shrink-0">
              Nothing to run
            </Button>
          )
        ) : (
          <Button
            variant="primary"
            size="small"
            onClick={approveAll}
            disabled={!open}
            className="shrink-0"
          >
            Approve all
          </Button>
        )}
      </footer>
    </section>
  );
}
