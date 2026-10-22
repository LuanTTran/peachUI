"use client";

/**
 * Top chrome — mobile menu + mark, session breadcrumb, repo + branch chip,
 * presence, run status, theme toggle, panel toggle.
 * Floating shell: no hard bottom border; quiet caption-density labels.
 */

import type { ReactNode } from "react";
import { BranchUp, Menu, SidebarRight } from "reicon-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { StatusDot, type StatusDotColor } from "@/components/atoms/status-dot";
import { AvatarStack } from "@/components/primitives/avatar-stack";
import { ThemeToggle } from "@/components/primitives/theme-toggle";
import { PEOPLE } from "@templates/_shared/fixtures";
import { cx } from "@/lib/utils";

export type RunStatus = "idle" | "running" | "review" | "done" | "blocked";

const STATUS_LABEL: Record<RunStatus, string> = {
  idle: "Idle",
  running: "Working",
  review: "Awaiting review",
  done: "Done",
  blocked: "Waiting on you",
};

const STATUS_TONE: Record<RunStatus, StatusDotColor> = {
  idle: "neutral",
  running: "indigo",
  review: "yellow",
  done: "green",
  blocked: "yellow",
};

/** Ghost icon button — the sidebar block's utility-row chrome. */
function ChromeButton({
  label,
  pressed,
  onClick,
  className,
  children,
}: {
  label: string;
  pressed?: boolean;
  onClick: () => void;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      aria-pressed={pressed}
      onClick={onClick}
      className={cx(
        "button-press-motion flex size-8 items-center justify-center rounded-2lg transition-colors",
        pressed ? "bg-hover text-ink" : "text-ink-3 hover:bg-hover hover:text-ink",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TopBar({
  sessionTitle,
  repo,
  branch,
  status,
  panelOpen,
  onMenu,
  onHome,
  onTogglePanel,
}: {
  sessionTitle: string;
  repo: string;
  branch: string;
  status: RunStatus;
  panelOpen: boolean;
  onMenu: () => void;
  onHome: () => void;
  onTogglePanel: () => void;
}) {
  return (
    <header className="flex h-11 shrink-0 items-center gap-2 px-2 sm:px-3">
      <ChromeButton label="Open navigation" onClick={onMenu} className="lg:hidden">
        <Menu className="size-5" aria-hidden />
      </ChromeButton>

      <Breadcrumb className="w-auto min-w-0">
        <BreadcrumbItem onClick={onHome}>Chat</BreadcrumbItem>
        <BreadcrumbItem current className="min-w-0">
          <span className="block max-w-[32ch] truncate">{sessionTitle}</span>
        </BreadcrumbItem>
      </Breadcrumb>

      <span className="ml-2 hidden min-w-0 items-center gap-1.5 font-mono text-caption-2-regular text-ink-3 sm:inline-flex">
        <BranchUp className="size-3 shrink-0" aria-hidden />
        <span className="truncate">{repo}</span>
        <span aria-hidden>/</span>
        <span className="text-ink-2">{branch}</span>
      </span>

      <div className="ml-auto flex items-center gap-1.5">
        <span role="status" className="hidden items-center gap-1.5 px-1 text-caption-1-regular text-ink-2 sm:inline-flex">
          <StatusDot color={STATUS_TONE[status]} pulse={status === "running"} />
          {STATUS_LABEL[status]}
        </span>
        <AvatarStack items={PEOPLE.map((p) => ({ name: p.name }))} size="xs" max={3} className="hidden md:flex" />
        <span className="mx-0.5 hidden h-4 w-px bg-line sm:block" aria-hidden />
        <ThemeToggle collapsed className="size-8 rounded-2lg" />
        <ChromeButton
          label={panelOpen ? "Hide workspace panel" : "Show workspace panel"}
          pressed={panelOpen}
          onClick={onTogglePanel}
        >
          <SidebarRight className="size-5" aria-hidden />
        </ChromeButton>
      </div>
    </header>
  );
}
