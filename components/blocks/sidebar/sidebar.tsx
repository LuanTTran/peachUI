"use client";

import {
  useCallback,
  useRef,
  useState,
  type ComponentType,
  type ReactNode,
} from "react";
import { Bank, Bullhorn, Calendar, Chat, FaceSmile, Headphones, Health, Home, ImageSparkle, Kanban, Search, Setting, X } from "reicon-react";
import { SidebarFilled } from "@/components/atoms/icons";
import { SettingsModal } from "@/components/blocks/settings/settings-modal";
import { ThemeToggle } from "@/components/primitives/theme-toggle";
import { Badge } from "@/components/atoms/badge";
import { CloseButton } from "@/components/atoms/close-button";
import { Kbd } from "@/components/atoms/kbd";
import { cx } from "@/lib/utils";
import {
  measureNavSelectionThumb,
  navSelectionThumbClass,
  sidebarNavScrollerClass,
  type NavSelectionThumb,
} from "@/components/lib/sidebar-nav-chrome";
import { DashboardTeamMenu } from "@/components/blocks/sidebar/sidebar-team-menu";
import { DashboardUserMenu } from "@/components/blocks/sidebar/sidebar-user-menu";
import { useSelectionThumb } from "@/lib/use-selection-thumb";
import { useDismissOnOutsidePress } from "@/lib/use-dismiss-on-outside-press";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";

/**
 * Figma sources:
 *   expanded  → dashboard 1 → Sidebar (node 3731:2934)
 *   collapsed → Sidebar (node 3768:3382)
 *
 * Floating sidebar panel. Expanded: 260px wide, p 12, radius/3xl (24px),
 * white 1px border, "Background/Sidebar Elevation" shadow, bg
 * background/secondary. Collapsed: 60px wide (36px icon items + 12px
 * padding); collapse button sits centered above the workspace avatar, quick
 * search becomes a 36px neutral-200 square, nav items become icon-only
 * squares, the team card reduces to its avatar.
 *
 * The two states morph into each other: the panel width animates while
 * labels / badges / kbd collapse via max-width + opacity.
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

/**
 * Collapsible text/badge slot: blurs + fades + shrinks away when the rail
 * closes, and blurs back in on expand. The icons/rows themselves stay pinned in
 * place — only these label/badge slots animate — so nothing jumps to center.
 */
function Collapsible({ collapsed, children, className }: { collapsed: boolean; children: ReactNode; className?: string }) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        // Expanded, the cap is the row itself: a fixed cap (it was 160px)
        // clipped any label wider than it, "Components and Blocks" included.
        collapsed ? "max-w-0 opacity-0 blur-[3px]" : "max-w-full opacity-100 blur-0",
        className,
      )}
    >
      {children}
    </span>
  );
}

function NavItem({
  icon: Icon,
  label,
  badge,
  isSelected = false,
  collapsed = false,
  href = "#",
  onClick,
}: {
  icon: IconComponent;
  label: string;
  badge?: ReactNode;
  isSelected?: boolean;
  collapsed?: boolean;
  href?: string;
  /** Action rows (e.g. Settings → modal) intercept the navigation. */
  onClick?: () => void;
}) {
  return (
    <a
      href={href}
      onClick={
        onClick
          ? (event) => {
              event.preventDefault();
              onClick();
            }
          : undefined
      }
      aria-current={isSelected ? "page" : undefined}
      aria-label={label}
      title={collapsed ? label : undefined}
      data-nav-selected={isSelected ? "true" : undefined}
      className={cx(
        "relative z-10 flex items-center justify-between overflow-hidden rounded-2lg p-2",
        "button-press-motion transition-[width,background-color] duration-300 ease-in-out",
        collapsed ? "w-9" : "w-full",
        isSelected ? "text-ink" : "text-ink-2 hover:bg-hover",
      )}
    >
      <span className="flex min-w-0 items-center gap-2">
        <Icon className="size-5 shrink-0" aria-hidden />
        <Collapsible collapsed={collapsed}>
          <span className="text-body-medium whitespace-nowrap">
            {label}
          </span>
        </Collapsible>
      </span>
      {badge && <Collapsible collapsed={collapsed}>{badge}</Collapsible>}
    </a>
  );
}

/** Compact icon-only action for the utilities strip: the same 36px hit area
 *  and hover treatment as a collapsed NavItem, so its icon stays aligned with
 *  the nav icons above it. */
function UtilityButton({
  icon: Icon,
  label,
  onClick,
}: {
  icon: IconComponent;
  label: string;
  onClick?: () => void;
}) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      onClick={onClick}
      className={cx(
        "button-press-motion flex size-9 cursor-pointer items-center justify-center rounded-2lg",
        "text-ink-2 transition-colors duration-150 ease",
        "hover:bg-hover hover:text-ink",
        "outline-none focus-visible:ring-2 focus-visible:ring-accent",
      )}
    >
      <Icon className="size-5 shrink-0" aria-hidden />
    </button>
  );
}

/** A primary navigation row. Rows without an `href` are decoration only. */
export interface DashboardNavItem {
  key: string;
  label: string;
  icon: IconComponent;
  href?: string;
  badge?: string | number;
}

/** Kept as a name for callers that typed their `selected` prop; any key works. */
export type DashboardNavKey = string;

/** Default navigation rows; pass your own `items` with `href`s to link them. */
export const DASHBOARD_NAV: DashboardNavItem[] = [
  { key: "home", label: "Overview", icon: Home, badge: 4 },
  { key: "projects", label: "Workspaces", icon: Kanban },
  { key: "campaigns", label: "Announcements", icon: Bullhorn },
  { key: "calendar", label: "Schedule", icon: Calendar },
  { key: "billing", label: "Invoices", icon: Bank },
  { key: "reports", label: "Insights", icon: Health },
  { key: "agents", label: "Runs", icon: Chat },
  { key: "images", label: "Assets", icon: ImageSparkle },
  { key: "profile", label: "Members", icon: FaceSmile },
];

/**
 * The primary rows. A component of its own so the closures over `collapsed`
 * and the search query live here: built inline in the sidebar, the compiler
 * could not tell they leave `mobile` untouched and dropped the sidebar's
 * manual memoization.
 */
function NavRows({
  items,
  query,
  selected,
  collapsed,
  secondaryMatch,
  onSelectItem,
}: {
  items: DashboardNavItem[];
  query: string;
  selected: string;
  collapsed: boolean;
  /** Whether Support or Settings matches, so "No results" only shows when nothing does. */
  secondaryMatch: boolean;
  onSelectItem?: (key: string) => void;
}) {
  const [navRef, thumb] = useSelectionThumb<HTMLDivElement, NavSelectionThumb>({
    selector: '[data-nav-selected="true"]',
    items: "a",
    attributes: ["data-nav-selected"],
    measure: measureNavSelectionThumb,
  });
  const shown = items.filter((item) => item.label.toLocaleLowerCase().includes(query));

  if (shown.length === 0 && !secondaryMatch && !collapsed) {
    return <p className="px-2 py-3 text-body-regular text-ink-3">No results</p>;
  }

  return (
    <div ref={navRef} className="relative flex w-full flex-col gap-1">
      {thumb && shown.some((item) => item.key === selected) && (
        <span
          aria-hidden
          className={navSelectionThumbClass}
          style={{
            transform: `translate(${thumb.left}px, ${thumb.top}px)`,
            width: thumb.width,
            height: thumb.height,
          }}
        />
      )}
      {shown.map((item) => {
        const isSelected = selected === item.key;
        return (
          <NavItem
            key={item.key}
            icon={item.icon}
            label={item.label}
            href={item.href}
            isSelected={isSelected}
            collapsed={collapsed}
            onClick={onSelectItem ? () => onSelectItem(item.key) : undefined}
            badge={
              item.badge !== undefined ? (
                <Badge color="neutral">{item.badge}</Badge>
              ) : undefined
            }
          />
        );
      })}
    </div>
  );
}

export function DashboardSidebar({
  mobile = false,
  onClose,
  fluid = false,
  showThemeToggle = true,
  selected = "home",
  onSelectedChange,
  items = DASHBOARD_NAV,
  flat = false,
  /** When set, quick search opens this callback instead of filtering nav in place (shell / jump field). */
  onQuickSearch,
  className,
}: {
  /** Rendered inside the mobile drawer: always expanded, close button instead of collapse. */
  mobile?: boolean;
  onClose?: () => void;
  /** Expanded width fills its container below `lg` instead of the fixed
   *  260px (e.g. the landing page, where the sidebar isn't in a drawer).
   *  Collapsed width stays the fixed 60px rail at every breakpoint — the
   *  whole point of collapsing is to shrink, so it must never get
   *  overridden back to full width. */
  fluid?: boolean;
  /** Hide the app-level theme control when the sidebar is used as marketing artwork. */
  showThemeToggle?: boolean;
  /** Which nav item shows the selected (primary accent gradient) state. */
  selected?: DashboardNavKey;
  /** Demo / shell: update selection on row click (no routing). */
  onSelectedChange?: (key: DashboardNavKey) => void;
  /** Primary navigation rows. The Pro dashboard's set unless a screen brings its own. */
  items?: DashboardNavItem[];
  /** Removes the floating panel treatment for a sidebar revealed beneath mobile content. */
  flat?: boolean;
  onQuickSearch?: () => void;
  className?: string;
} = {}) {
  const [collapsedState, setCollapsed] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [suppressUserHover, setSuppressUserHover] = useState(false);
  const [searchActive, setSearchActive] = useState(false);
  const [query, setQuery] = useState("");
  const searchTriggerRef = useRef<HTMLButtonElement>(null);
  const searchFieldRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const collapsed = mobile ? false : collapsedState;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const matches = (label: string) => label.toLocaleLowerCase().includes(normalizedQuery);
  const secondaryLabels = ["Support", "Settings"];
  const secondaryMatch = secondaryLabels.some(matches);

  const activateSearch = useCallback(() => {
    if (onQuickSearch) {
      onQuickSearch();
      return;
    }
    if (!mobile) setCollapsed(false);
    setSearchActive(true);
    // The input mounts on this commit; focus it once it's in the tree.
    window.requestAnimationFrame(() => searchInputRef.current?.focus());
  }, [mobile, onQuickSearch]);

  const deactivateSearch = useCallback((restoreFocus: boolean) => {
    setQuery("");
    setSearchActive(false);
    if (restoreFocus) {
      window.requestAnimationFrame(() => searchTriggerRef.current?.focus());
    }
  }, []);

  useDismissOnOutsidePress(searchActive, () => deactivateSearch(false), [searchFieldRef]);

  const activateSearchRef = useRef(activateSearch);
  useDomLayout(() => {
    activateSearchRef.current = activateSearch;
  });

  useMountEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLocaleLowerCase() === "l" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        activateSearchRef.current();
      }
    };

    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  const surface = flat ? "bg-page" : "bg-canvas";

  return (
    <aside
      className={cx(
        "flex h-full shrink-0 flex-col gap-3 overflow-hidden",
        flat
          ? "bg-page"
          : "rounded-3xl border border-surface bg-canvas shadow-raised",
        "transition-[width] duration-300 ease-in-out",
        // Collapsed rail keeps the 60px spec: 1px border + 11px padding on each
        // side leaves an exactly 36px column so the w-9 (36px) icon items center.
        collapsed
          ? "w-[60px] px-[11px] py-3"
          : fluid
            ? "w-full p-3 lg:w-[260px]"
            : "w-[260px] p-3",
        className,
      )}
    >
      {/* Top chrome never scrolls. Negative margin borrows the rail's padding so
          rings and hover pills are not clipped. */}
      <div
        className={cx(
          "-mx-3 -mt-3 flex w-[calc(100%+24px)] shrink-0 flex-col gap-3 p-3",
          surface,
        )}
      >
        {/* Workspace switcher / collapse control */}
        <div
          className={cx(
            "flex w-full transition-[gap] duration-300 ease-in-out",
            collapsed
              ? "flex-col-reverse items-start justify-center gap-2.5"
              : "flex-row items-center justify-between",
          )}
        >
          {/* The clip is here to hide the label as `max-width` animates shut,
              but it also cropped the trigger's hover pill down to four corner
              arcs. Same trick as the scroller: pad the clip box out by the
              pill's 8px reach and pull it back with a negative margin, so the
              widths below are 16px larger than the footprint they produce. */}
          <div
            className={cx(
              "-m-2 min-w-0 overflow-hidden p-2 transition-[max-width,opacity,transform] duration-300 ease-in-out",
              mobile && flat && searchActive
                ? "max-w-0 scale-95 opacity-0"
                : "max-w-[206px] scale-100 opacity-100",
            )}
          >
            <DashboardUserMenu
              collapsed={collapsed}
              suppressHover={suppressUserHover}
              onHoverSuppressionEnd={() => setSuppressUserHover(false)}
              avatarClassName={
                flat
                  ? "bg-hover-2 dark:bg-canvas"
                  : undefined
              }
            />
          </div>
          {mobile && flat ? (
            <div
              ref={searchFieldRef}
              className={cx(
                "flex h-9 items-center overflow-hidden rounded-full bg-hover-2 transition-[width,box-shadow] duration-300 ease-in-out",
                searchActive
                  ? "w-full gap-2 pe-2.5 ps-2 ring-2 ring-inset ring-line-strong"
                  : "w-9 gap-0 px-2",
              )}
            >
              <button
                ref={searchTriggerRef}
                type="button"
                aria-label="Search"
                onClick={activateSearch}
                className="flex size-5 shrink-0 cursor-pointer items-center justify-center text-ink-2"
              >
                <Search className="size-5" aria-hidden />
              </button>
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Filter template navigation"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    deactivateSearch(true);
                  }
                }}
                placeholder="Search..."
                tabIndex={searchActive ? 0 : -1}
                className={cx(
                  "min-w-0 bg-transparent text-body-medium tracking-[-0.015em] text-ink outline-none placeholder:text-ink-3",
                  "transition-[width,opacity] duration-200 ease-in-out",
                  searchActive
                    ? "w-full flex-1 opacity-100 delay-100"
                    : "pointer-events-none w-0 flex-none opacity-0 delay-0",
                )}
              />
              <CloseButton
                size="2xs"
                aria-label="Clear navigation search"
                onClick={() => deactivateSearch(true)}
                className={cx(
                  "shrink-0 bg-line transition-opacity duration-150",
                  searchActive ? "opacity-100 delay-150" : "pointer-events-none opacity-0 delay-0",
                )}
              />
            </div>
          ) : mobile ? (
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={onClose}
              className="cursor-pointer text-ink-2"
            >
              <X className="size-5" aria-hidden />
            </button>
          ) : (
            <button
              type="button"
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-expanded={!collapsed}
              onClick={() => {
                const isExpanding = collapsedState;
                if (!isExpanding) deactivateSearch(false);
                setCollapsed(!collapsedState);
                setSuppressUserHover(isExpanding);
              }}
              className={cx(
                "cursor-pointer text-ink-2 transition-transform duration-300 ease-in-out",
                collapsed && "flex w-9 items-center justify-center",
              )}
            >
              <SidebarFilled
                className={cx("size-5 transition-transform duration-300 ease-in-out", collapsed ? "" : "-scale-x-100 ")}
                aria-hidden
              />
            </button>
          )}
        </div>

        {/* Quick search */}
        {!flat && (onQuickSearch || !(searchActive && !collapsed) ? (
            <div
              ref={searchFieldRef}
              className="flex w-full items-center gap-2 rounded-full bg-hover-2 py-2 pe-2.5 ps-2 ring-2 ring-inset ring-line-strong transition-[background-color,box-shadow] duration-[var(--input-transition-ms)] ease"
            >
              <Search className="size-5 shrink-0 text-ink-2" aria-hidden />
              <input
                ref={searchInputRef}
                type="search"
                aria-label="Filter template navigation"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    event.preventDefault();
                    deactivateSearch(true);
                  }
                }}
                placeholder="Search navigation…"
                className="min-w-0 flex-1 bg-transparent text-body-medium text-ink outline-none placeholder:text-ink-3"
              />
              <CloseButton
                size="2xs"
                aria-label="Clear navigation search"
                onClick={() => deactivateSearch(true)}
                className="bg-line"
              />
            </div>
          ) : (
            <button
              ref={searchTriggerRef}
              type="button"
              aria-label="Quick search"
              title={collapsed ? "Quick search" : undefined}
              onClick={activateSearch}
              className={cx(
                "flex cursor-pointer items-center gap-2 p-2 hover:bg-line/55",
                "transition-[width,border-radius,background-color] duration-300 ease-in-out",
                collapsed
                  ? "w-9 rounded-full bg-hover-2"
                  : "w-full rounded-full bg-hover-2",
              )}
            >
              <span className={cx("flex min-w-0 items-center gap-2", !collapsed && "flex-1")}>
                <Search className="size-5 shrink-0 text-ink-2" aria-hidden />
                <Collapsible collapsed={collapsed}>
                  <span className="text-body-medium whitespace-nowrap text-ink-2">
                    Quick search
                  </span>
                </Collapsible>
              </span>
              <Collapsible collapsed={collapsed}>
                <Kbd>⌘L</Kbd>
              </Collapsible>
            </button>
          ))}
      </div>

      {/* Primary shrinks and scrolls only when the rail is short; utilities are
          a single 36px icon strip pinned underneath (a vertical stack when the
          rail is collapsed), so they cost the nav one row instead of three. */}
      <div className="flex min-h-0 flex-1 flex-col gap-1">
        <nav aria-label="Primary" className={sidebarNavScrollerClass(collapsed)}>
          <NavRows
            items={items}
            query={normalizedQuery}
            selected={selected}
            collapsed={collapsed}
            secondaryMatch={secondaryMatch}
            onSelectItem={onSelectedChange}
          />
        </nav>

        <nav
          aria-label="Utilities"
          className={cx(
            "relative z-10 flex shrink-0 gap-1",
            collapsed ? "flex-col" : "flex-row px-0.5",
            surface,
          )}
        >
          {matches("Support") && (
            <UtilityButton icon={Headphones} label="Support" />
          )}
          {matches("Settings") && (
            <UtilityButton
              icon={Setting}
              label="Settings"
              onClick={() => setSettingsOpen(true)}
            />
          )}
          {showThemeToggle ? (
            <ThemeToggle
              collapsed
              className={flat ? "!bg-canvas" : undefined}
            />
          ) : null}
        </nav>
      </div>

      {/* Team card → opens the profile menu next to the sidebar */}
      <DashboardTeamMenu
        collapsed={collapsed}
        className={flat ? "!bg-canvas" : undefined}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </aside>
  );
}
