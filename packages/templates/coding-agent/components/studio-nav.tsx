"use client";

/**
 * Left navigation rail — workspace header, section nav, tools, sessions.
 * Collapses to the DashboardSidebar block's 60px icon rail: the width and
 * padding animate together (1px border + 11px padding = a 36px column), so
 * w-9 rows keep their gradient/hover fill edge-to-edge instead of clipping.
 * Selection is a measured thumb that slides between rows; labels collapse
 * via max-width + opacity + blur. Sessions are real; sections are demo stubs.
 */

import { type ComponentType, type CSSProperties, type ReactNode } from "react";
import {
  Box,
  Chat,
  History,
  Home,
  Kanban,
  Plus,
  Server,
  Wand,
  X,
} from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { buttonStyles } from "@/components/atoms/button";
import { SidebarFilled } from "@/components/atoms/icons";
import { Logo } from "@/components/atoms/logo";
import { StatusDot, type StatusDotColor } from "@/components/atoms/status-dot";
import {
  measureNavSelectionThumb,
  navSelectionThumbClass,
  sidebarNavScrollerClass,
  type NavSelectionThumb,
} from "@/components/lib/sidebar-nav-chrome";
import type { StudioSession, SessionStatus } from "../data";
import { useSelectionThumb } from "@/lib/use-selection-thumb";
import { cx } from "@/lib/utils";

type Icon = ComponentType<{ className?: string; "aria-hidden"?: boolean | "true" | "false" }>;
const SECTIONS: { id: string; label: string; icon: Icon; badge?: string }[] = [
  { id: "home", label: "Home", icon: Home },
  { id: "chat", label: "Chat", icon: Chat },
  { id: "runs", label: "Runs", icon: History, badge: "2" },
  { id: "changes", label: "Changes", icon: Kanban },
];

const TOOLS: { id: string; label: string; icon: Icon }[] = [
  { id: "repos", label: "Repos", icon: Box },
  { id: "envs", label: "Environments", icon: Server },
  { id: "workflows", label: "Workflows", icon: Wand },
];

const STATUS_TONE: Record<SessionStatus, StatusDotColor> = {
  live: "indigo",
  done: "green",
  blocked: "yellow",
};

const STATUS_LABEL: Record<SessionStatus, string> = {
  live: "Working",
  done: "Done",
  blocked: "Waiting on you",
};

/**
 * Collapsible label slot — the sidebar block's trick: icons stay pinned in
 * place while text blurs and shrinks to zero width, so nothing jumps centre.
 */
function Collapsible({ collapsed, children, className }: { collapsed: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        collapsed ? "max-w-0 opacity-0 blur-[3px]" : "max-w-full opacity-100 blur-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Selection thumb — measured like the sidebar block's NavRows, so the accent
 * fill always matches the row's live box (full-bleed in both rail states) and
 * glides between items instead of snapping.
 */
function ThumbRows({ children }: { children: ReactNode }) {
  const [ref, thumb] = useSelectionThumb<HTMLDivElement, NavSelectionThumb>({
    selector: '[data-nav-selected="true"]',
    items: "button",
    attributes: ["data-nav-selected"],
    measure: measureNavSelectionThumb,
  });

  return (
    <div ref={ref} className="relative flex w-full flex-col">
      {thumb ? (
        <span
          aria-hidden
          className={navSelectionThumbClass}
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      ) : null}
      {children}
    </div>
  );
}

/** Primary nav row — mirrors the sidebar block's NavItem. */
function NavRow({
  icon: RowIcon,
  label,
  badge,
  active,
  collapsed,
  onClick,
}: {
  icon: Icon;
  label: string;
  badge?: string;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? label : undefined}
        title={collapsed ? label : undefined}
        data-nav-selected={active ? "true" : undefined}
        onClick={onClick}
        className={cx(
          "button-press-motion relative z-10 flex items-center justify-between overflow-hidden rounded-2lg p-2 text-left",
          "transition-[width,background-color] duration-300 ease-in-out",
          collapsed ? "w-9" : "w-full",
          active ? "text-ink" : "text-ink-2 hover:bg-hover hover:text-ink",
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <RowIcon className="size-5 shrink-0" aria-hidden />
          <Collapsible collapsed={collapsed}>
            <span className="text-body-medium whitespace-nowrap">{label}</span>
          </Collapsible>
        </span>
        {badge ? (
          <Collapsible collapsed={collapsed}>
            <Badge color="neutral">{badge}</Badge>
          </Collapsible>
        ) : null}
      </button>
    </li>
  );
}

/** A session row — collapses to a w-9 square pinned on its status dot. */
function SessionRow({
  session,
  active,
  collapsed,
  onClick,
}: {
  session: StudioSession;
  active: boolean;
  collapsed: boolean;
  onClick: () => void;
}) {
  return (
    <li>
      <button
        type="button"
        aria-current={active ? "page" : undefined}
        aria-label={collapsed ? session.title : undefined}
        title={collapsed ? session.title : undefined}
        onClick={onClick}
        className={cx(
          "grid grid-cols-[12px_minmax(0,1fr)] gap-x-2 overflow-hidden rounded-2lg px-2 py-1.5 text-left",
          "transition-[width,background-color] duration-300 ease-in-out",
          collapsed ? "w-9" : "w-full",
          active ? "bg-hover" : "hover:bg-hover",
        )}
      >
        <span className="flex h-[18px] items-center">
          <StatusDot color={STATUS_TONE[session.status]} pulse={session.status === "live"} />
        </span>
        <Collapsible
          collapsed={collapsed}
          className={cx(
            "col-start-2 transition-[max-width,max-height,opacity,filter]",
            collapsed ? "max-h-[18px]" : "max-h-20",
          )}
        >
          <span className="min-w-0">
            <span
              className={cx(
                "block truncate leading-[18px]",
                active ? "text-body-2-medium text-ink" : "text-body-2-regular text-ink-2",
              )}
            >
              {session.title}
            </span>
            <span className="block truncate text-caption-2-regular text-ink-3">
              <span className="sr-only">{STATUS_LABEL[session.status]}, </span>
              {session.timeAgo}
            </span>
          </span>
        </Collapsible>
      </button>
    </li>
  );
}

/**
 * Group label — cross-fades to a short centred hairline in the rail so the
 * groups still read without text. Fixed height in both states: no jump.
 */
function GroupLabel({ collapsed, children }: { collapsed: boolean; children: string }) {
  return (
    <div className="relative mt-2 flex h-6 items-center px-2" aria-hidden={collapsed}>
      <span
        className={cx(
          "text-caption-1-medium whitespace-nowrap text-ink-3 transition-[opacity,filter] duration-300 ease-in-out",
          collapsed && "opacity-0 blur-[3px]",
        )}
      >
        {children}
      </span>
      <span
        aria-hidden
        className={cx(
          "absolute left-1/2 top-1/2 h-px w-4 -translate-x-1/2 -translate-y-1/2 bg-line transition-opacity duration-300 ease-in-out",
          collapsed ? "opacity-100" : "opacity-0",
        )}
      />
    </div>
  );
}

export function StudioNav({
  activeSection,
  onSectionChange,
  sessions,
  activeSessionId,
  onSessionChange,
  onNewSession,
  mobile,
  onClose,
  collapsed: collapsedProp = false,
  onCollapsedChange,
  style,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  sessions: StudioSession[];
  activeSessionId: string;
  onSessionChange: (id: string) => void;
  onNewSession: () => void;
  mobile?: boolean;
  onClose?: () => void;
  /** Desktop rail state — the mobile drawer is always expanded. */
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
  /** Desktop column width override (inline style wins over the default w-full). */
  style?: CSSProperties;
}) {
  const collapsed = !mobile && collapsedProp;

  return (
    <nav
      aria-label="Studio"
      style={style}
      className={cx(
        "flex h-full w-full shrink-0 flex-col overflow-hidden rounded-3xl border border-surface bg-canvas shadow-raised",
        "transition-[width,padding] duration-300 ease-in-out",
        // Collapsed rail mirrors the sidebar block: 1px border + 11px padding
        // leaves an exact 36px column, so w-9 rows fill it edge-to-edge.
        collapsed ? "px-[11px] py-3" : "p-3",
      )}
    >
      {/* Workspace identity + rail toggle. Collapsed, the column flips so the
          toggle rides on top and the mark stays centred below it. */}
      <div
        className={cx(
          "flex w-full pb-1 transition-[gap] duration-300 ease-in-out",
          collapsed ? "flex-col-reverse items-start justify-center gap-2.5" : "flex-row items-center justify-between",
        )}
      >
        <div
          className={cx(
            "flex min-w-0 items-center gap-2 transition-[gap] duration-300 ease-in-out",
            collapsed && "w-9 justify-center gap-0",
          )}
        >
          <Logo size={28} className="shrink-0" />
          <Collapsible collapsed={collapsed}>
            <span className="text-body-medium whitespace-nowrap text-ink">Peach Studio</span>
          </Collapsible>
        </div>
        {mobile ? (
          <button
            type="button"
            aria-label="Close navigation"
            onClick={onClose}
            className="flex size-7 items-center justify-center rounded-2lg text-ink-2 transition-colors hover:bg-hover hover:text-ink"
          >
            <X className="size-5" aria-hidden />
          </button>
        ) : (
          <button
            type="button"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
            onClick={() => onCollapsedChange?.(!collapsedProp)}
            className={cx(
              "button-press-motion flex cursor-pointer items-center justify-center rounded-2lg text-ink-2 transition-[width,color] duration-300 ease-in-out hover:bg-hover hover:text-ink",
              collapsed ? "h-9 w-9" : "h-7 w-7",
            )}
          >
            <SidebarFilled
              className={cx("size-5 transition-transform duration-300 ease-in-out", collapsed ? "" : "-scale-x-100")}
              aria-hidden
            />
          </button>
        )}
      </div>

      <div className="pb-1 pt-2">
        <button
          type="button"
          aria-label="New session"
          onClick={onNewSession}
          className={cx(
            buttonStyles.base,
            buttonStyles.size.small,
            buttonStyles.variant.secondary,
            "transition-[width,padding,gap] duration-300 ease-in-out",
            collapsed ? "w-9 gap-0 px-0" : "w-full",
          )}
        >
          <Plus className={cx(buttonStyles.icon.small)} aria-hidden />
          <Collapsible collapsed={collapsed}>
            <span className="whitespace-nowrap px-0.5">New session</span>
          </Collapsible>
        </button>
      </div>

      <div className={cx("min-h-0 flex-1 pt-1", sidebarNavScrollerClass(collapsed))}>
        {/* workspace sections + tools share one sliding selection thumb */}
        <ThumbRows>
          <ul className="flex flex-col gap-0.5">
            {SECTIONS.map((section) => (
              <NavRow
                key={section.id}
                icon={section.icon}
                label={section.label}
                badge={section.badge}
                active={activeSection === section.id}
                collapsed={collapsed}
                onClick={() => onSectionChange(section.id)}
              />
            ))}
          </ul>

          <GroupLabel collapsed={collapsed}>Tools</GroupLabel>
          <ul className="flex flex-col gap-0.5">
            {TOOLS.map((tool) => (
              <NavRow
                key={tool.id}
                icon={tool.icon}
                label={tool.label}
                active={activeSection === tool.id}
                collapsed={collapsed}
                onClick={() => onSectionChange(tool.id)}
              />
            ))}
          </ul>
        </ThumbRows>

        <GroupLabel collapsed={collapsed}>Sessions</GroupLabel>
        <ul className="flex flex-col gap-0.5">
          {sessions.map((session) => (
            <SessionRow
              key={session.id}
              session={session}
              active={session.id === activeSessionId}
              collapsed={collapsed}
              onClick={() => onSessionChange(session.id)}
            />
          ))}
        </ul>
      </div>

      {/* user footer — negative margins keep the divider full-bleed while the
          rail's padding collapses around the 36px column */}
      <div
        className={cx(
          "flex items-center border-t border-line pt-2.5 transition-[gap,margin,padding] duration-300 ease-in-out",
          collapsed ? "-mx-[11px] justify-center gap-0 px-[11px]" : "-mx-3 gap-2 px-3",
        )}
      >
        <Avatar size="sm" color="blue" initials="MO" className="shrink-0" />
        <Collapsible collapsed={collapsed} className="min-w-0 flex-1">
          <span className="block min-w-0">
            <span className="block truncate text-body-2-medium text-ink">Mara Okafor</span>
            <span className="block truncate text-caption-2-regular text-ink-3">mara.okafor</span>
          </span>
        </Collapsible>
        <Collapsible collapsed={collapsed}>
          <Badge color="neutral">Pro</Badge>
        </Collapsible>
      </div>
    </nav>
  );
}
