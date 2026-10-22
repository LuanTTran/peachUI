"use client";

import { useState, type ReactNode } from "react";
import { More, Plus } from "reicon-react";
import { Chip } from "@/components/atoms/chip";
import { Button } from "@/components/atoms/button";
import { PillTab, PillTabList } from "@/components/atoms/pill-tab";
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/atoms/dropdown";
import { Switch } from "@/components/atoms/switch";
import { ChevronUpDownSmall } from "@/components/atoms/chevrons";
import { cx } from "@/lib/utils";
import { SettingsCard, SettingsRow, SettingsSectionLabel } from "@/components/blocks/settings/settings-rows";

/**
 * The settings modal's Tools page — MCP server management, structured after
 * the classic tools/servers settings layout: a scope switcher (per-project
 * pills), an Authentication toggle, the selected scope's server list, an
 * empty-state Team section, and the global Plugin servers.
 *
 * No Figma frame for this page — composed from the settings modal's own
 * recipes (SettingsCard/SettingsRow chrome, Switch, secondary Buttons, the
 * dropdown menu pattern) plus page-local pieces that follow the system:
 * icon tiles use the inbox-feed swatch pairs (bg-*-200 / text-*-700), the
 * status dot is ringed with the card background like the sidebar's badge
 * treatments, and the expandable tool list reuses the grid-rows grow
 * transition from the Storage table.
 */

/* ------------------------------------------------------------------- data */

type ServerStatus = "connected" | "error";

interface McpServer {
  id: string;
  name: string;
  /** Letter tile — bg/text pair from the swatch palette. */
  initial: string;
  tileClass: string;
  status: ServerStatus;
  /** e.g. "26 tools, 1 prompts, 104 resources enabled" */
  summary?: string;
  /** Names revealed by the expander chevron. */
  tools?: string[];
}

const SERVERS: Record<string, McpServer> = {
  astro: {
    id: "astro",
    name: "astro",
    initial: "A",
    tileClass: "bg-hover-2 text-ink-2",
    status: "error",
  },
  figma: {
    id: "figma",
    name: "Figma",
    initial: "F",
    tileClass: "bg-red-muted text-red",
    status: "connected",
    summary: "26 tools, 1 prompts, 104 resources enabled",
    tools: ["get_design_context", "get_metadata", "get_screenshot", "get_variable_defs", "create_new_file"],
  },
  paper: {
    id: "paper",
    name: "paper",
    initial: "P",
    tileClass: "bg-accent-muted text-accent-ink",
    status: "error",
  },
  posthog: {
    id: "posthog",
    name: "posthog",
    initial: "P",
    tileClass: "bg-warning-muted text-warning",
    status: "connected",
    summary: "521 tools, 173 resources enabled",
    tools: ["query_insights", "list_dashboards", "capture_event", "feature_flags", "session_recordings"],
  },
  vercel: {
    id: "vercel",
    name: "vercel",
    initial: "V",
    tileClass: "bg-ink text-page",
    status: "connected",
    summary: "30 tools, 13 prompts enabled",
    tools: ["list_deployments", "get_build_logs", "promote_deployment", "env_variables"],
  },
};

/** Per-scope server lists — switching a pill swaps the section below. */
const SCOPES: { id: string; label: string; servers: McpServer[] }[] = [
  { id: "home", label: "Home", servers: [SERVERS.astro, SERVERS.figma] },
  { id: "peach-ui", label: "peach-ui", servers: [SERVERS.figma, SERVERS.vercel] },
  { id: "ios-app", label: "ios-app", servers: [SERVERS.astro] },
  { id: "analytics", label: "analytics", servers: [SERVERS.posthog] },
  { id: "design-review", label: "Design review", servers: [SERVERS.figma] },
  { id: "sandbox", label: "sandbox", servers: [] },
  { id: "cloud", label: "Cloud", servers: [SERVERS.vercel, SERVERS.posthog] },
];

const PLUGIN_SERVERS: McpServer[] = [SERVERS.paper, SERVERS.posthog, SERVERS.vercel];

/* ----------------------------------------------------------------- pieces */

/** 32px rounded letter tile with a connection dot pinned to its corner,
 *  ringed in the card background so it reads as punched-through. */
function ServerTile({ server }: { server: McpServer }) {
  return (
    <span className="relative flex size-8 shrink-0 items-center justify-center rounded-lg">
      <span
        className={cx(
          "flex size-8 items-center justify-center rounded-lg text-body-2-medium",
          server.tileClass,
        )}
      >
        {server.initial}
      </span>
      <span
        aria-hidden
        className={cx(
          "absolute -bottom-0.5 -start-0.5 size-2.5 rounded-full ring-2 ring-canvas",
          server.status === "connected" ? "bg-green" : "bg-red",
        )}
      />
    </span>
  );
}

/** Bare "…" row action — quieter than IconButton on the grey card, same
 *  hover language as the sidebar rows. Opens the shared dropdown menu. */
function ServerMenu({ name }: { name: string }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <DropdownTrigger
        aria-label={`Actions for ${name}`}
        className={cx(
          "flex size-7 shrink-0 cursor-pointer items-center justify-center rounded-md",
          "text-ink-2 outline-none transition-colors duration-150 ease",
          "hover:bg-hover focus-visible:ring-2 focus-visible:ring-accent",
          isOpen && "bg-hover",
        )}
      >
        <More className="size-4 shrink-0" aria-hidden />
      </DropdownTrigger>
      <DropdownPopover aria-label={`Actions for ${name}`} placement="bottom end" className="w-[180px] p-2">
        <DropdownGroup>
          {["Show output", "Refresh tools", "Remove server"].map((label) => (
            <DropdownItem key={label} onSelect={() => setIsOpen(false)} className="px-2 py-1.5">
              <span className="truncate text-body-medium whitespace-nowrap text-ink">{label}</span>
            </DropdownItem>
          ))}
        </DropdownGroup>
      </DropdownPopover>
    </Dropdown>
  );
}

/** Quiet inline text action ("Sign out", "Show output"). */
function InlineAction({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(
        "cursor-pointer rounded-sm text-body-2-regular whitespace-nowrap text-ink-3",
        "outline-none transition-colors duration-150 ease",
        "hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-accent",
      )}
    >
      {children}
    </button>
  );
}

function ServerRow({ server }: { server: McpServer }) {
  const [expanded, setExpanded] = useState(false);
  return (
    <div className="border-b border-line py-2.5 pe-2.5 last:border-b-0">
      <div className="flex w-full items-center gap-2.5">
        <ServerTile server={server} />
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-baseline gap-2">
            <p className="text-body-medium whitespace-nowrap text-ink">{server.name}</p>
            <InlineAction>Sign out</InlineAction>
          </div>
          {server.status === "connected" ? (
            <div className="flex items-center gap-1">
              <p className="truncate text-body-2-regular text-ink-2">{server.summary}</p>
              {server.tools && (
                <button
                  type="button"
                  aria-label={`${expanded ? "Hide" : "Show"} ${server.name} tools`}
                  aria-expanded={expanded}
                  onClick={() => setExpanded((v) => !v)}
                  className={cx(
                    "flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-xs",
                    "text-ink-3 outline-none transition-colors duration-150 ease",
                    "hover:text-ink-2 focus-visible:ring-2 focus-visible:ring-accent",
                  )}
                >
                  <ChevronUpDownSmall className="size-4" aria-hidden />
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <p className="text-body-2-regular whitespace-nowrap text-ink-2">Error</p>
              <span className="text-body-2-regular text-ink-3">–</span>
              <InlineAction>Show output</InlineAction>
            </div>
          )}
        </div>
        <ServerMenu name={server.name} />
      </div>

      {/* Expandable tool chips — same grid-rows grow transition as the
          Storage table's new-row entrance, but as a two-way toggle. */}
      {server.tools && (
        <div
          className={cx(
            "grid transition-[grid-template-rows,opacity] duration-300 ease-out",
            expanded ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
          )}
        >
          <div className="overflow-hidden">
            <div className="flex flex-wrap gap-1.5 pt-2 ps-[42px]">
              {server.tools.map((tool) => (
                <Chip key={tool} variant="caption" color="soft">
                  {tool}
                </Chip>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function NewServerRow() {
  return (
    <button
      type="button"
      className={cx(
        "group flex w-full cursor-pointer items-center gap-2.5 py-2.5 pe-2.5 text-start",
        "outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
      )}
    >
      <span
        className={cx(
          "flex size-8 shrink-0 items-center justify-center rounded-lg bg-hover-2",
          "transition-colors duration-150 ease group-hover:bg-line",
        )}
      >
        <Plus className="size-5 shrink-0 text-ink-2" aria-hidden />
      </span>
      <span className="flex min-w-0 flex-col">
        <span className="text-body-medium whitespace-nowrap text-ink">New MCP Server</span>
        <span className="text-body-2-regular whitespace-nowrap text-ink-2">
          Add a Custom MCP Server
        </span>
      </span>
    </button>
  );
}

/* ------------------------------------------------------------------- page */

export function SettingsTools() {
  const [scopeId, setScopeId] = useState("home");
  const [waitForAuth, setWaitForAuth] = useState(true);
  const scope = SCOPES.find((s) => s.id === scopeId) ?? SCOPES[0];

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Scope switcher — the shared fully-rounded pill tabs (same component
          as the AI chat panel's Changes/Browser switcher). */}
      <PillTabList
        aria-label="Project scope"
        className="-mx-1 flex w-[calc(100%+8px)] overflow-x-auto px-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {SCOPES.map((s) => (
          <PillTab key={s.id} variant="gray" isSelected={s.id === scopeId} onSelect={() => setScopeId(s.id)}>
            {s.label}
          </PillTab>
        ))}
      </PillTabList>

      {/* Authentication */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel className="px-2">Authentication</SettingsSectionLabel>
        <SettingsCard>
          <SettingsRow
            label="Wait for MCP Authentication"
            description="Wait indefinitely to authenticate when prompted. When off, skip authentication prompts after 30 seconds."
          >
            <Switch isSelected={waitForAuth} onChange={setWaitForAuth} aria-label="Wait for MCP authentication" />
          </SettingsRow>
        </SettingsCard>
      </div>

      {/* Scope servers */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full flex-col gap-0.5">
          <SettingsSectionLabel className="px-2">{scope.label} MCP Servers</SettingsSectionLabel>
          <p className="w-full px-2 text-body-2-regular text-ink-3">
            Servers available from {scope.label}.
          </p>
        </div>
        <SettingsCard>
          {scope.servers.map((server) => (
            <ServerRow key={server.id} server={server} />
          ))}
          <NewServerRow />
        </SettingsCard>
      </div>

      {/* Team servers — empty state */}
      <div className="flex w-full flex-col gap-2">
        <div className="flex w-full items-end justify-between gap-3">
          <div className="flex min-w-0 flex-col gap-0.5">
            <SettingsSectionLabel className="px-2">Team MCP Servers</SettingsSectionLabel>
            <p className="w-full px-2 text-body-2-regular text-ink-3">
              Configured in the dashboard
            </p>
          </div>
          <Button variant="secondary" size="small" className="shrink-0">
            Manage
          </Button>
        </div>
        <div className="flex w-full flex-col items-center gap-3 rounded-2xl bg-canvas px-6 py-8">
          <div className="flex flex-col items-center gap-1 text-center">
            <p className="text-body-medium text-ink">No Team MCP Servers</p>
            <p className="max-w-[360px] text-body-2-regular text-ink-2">
              Configure MCP servers in the dashboard to make them available in PeachUI on desktop
              and in the cloud.
            </p>
          </div>
          <Button variant="secondary" size="small">
            Configure Team MCP Servers
          </Button>
        </div>
      </div>

      {/* Plugin servers */}
      <div className="flex w-full flex-col gap-2">
        <SettingsSectionLabel className="px-2">Plugin MCP Servers</SettingsSectionLabel>
        <SettingsCard>
          {PLUGIN_SERVERS.map((server) => (
            <ServerRow key={server.id} server={server} />
          ))}
        </SettingsCard>
      </div>
    </div>
  );
}
