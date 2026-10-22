"use client";

import { useState, useSyncExternalStore, type ComponentType, type ReactNode } from "react";
import { Bank, Bell, Box, Card, Folder, GraduationCap, Logout, Message, Palette, ShieldUser, Users } from "reicon-react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Popover as AriaPopover,
} from "react-aria-components";
import { ThemeToggle } from "@/components/primitives/theme-toggle";
import { Avatar } from "@/components/atoms/avatar";
import { Badge } from "@/components/atoms/badge";
import { ChevronDownSmall } from "@/components/atoms/chevrons";
import { cx } from "@/lib/utils";

/**
 * Figma source: sidebar profile menu (node 3823:3699).
 *
 * Dropdown opened from the sidebar's "Peach studio" card. Floats to the right of
 * the sidebar: white panel, 1px border/button/default, radius 16, p 10,
 * shadow/dropdown. Header (team avatar + name/email), three grouped sections of
 * sidebar-style rows separated by full-bleed dividers, and a "PeachUI" + version
 * footer. Rows mirror the sidebar nav item pattern (icon + label + optional
 * counter) but use the menu tokens from Figma (text/primary label,
 * background/primary/hover on hover + the selected row).
 */

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

type MenuRow = {
  icon: IconComponent;
  label: string;
  badge?: string;
  isSelected?: boolean;
};

type MenuGroup = {
  id: string;
  label?: string;
  items: MenuRow[];
};

const GROUPS: MenuGroup[] = [
  {
    id: "workspace",
    items: [
      { icon: Bank, label: "Workspace overview" },
      { icon: Folder, label: "Shared files" },
      { icon: Message, label: "Inbox", badge: "12" },
      { icon: Users, label: "Directory" },
    ],
  },
  {
    id: "company",
    label: "Organization",
    items: [
      { icon: Card, label: "Plans and invoices" },
      { icon: GraduationCap, label: "Legal profile" },
      { icon: Box, label: "Connected apps" },
    ],
  },
  {
    id: "personal",
    label: "You",
    items: [
      { icon: Bell, label: "Alert preferences" },
      { icon: ShieldUser, label: "Security" },
      { icon: Logout, label: "Sign out" },
    ],
  },
];

/** Label/chevron slot on the trigger: blurs + fades away as the rail collapses. */
function Collapsible({ collapsed, children }: { collapsed: boolean; children: ReactNode }) {
  return (
    <span
      className={cx(
        "flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,filter] duration-300 ease-in-out",
        collapsed ? "max-w-0 opacity-0 blur-[3px]" : "max-w-40 opacity-100 blur-0",
      )}
    >
      {children}
    </span>
  );
}

function TeamMenuItem({ icon: Icon, label, badge, isSelected, onSelect }: MenuRow & { onSelect: () => void }) {
  return (
    <AriaButton
      type="button"
      aria-current={isSelected ? "page" : undefined}
      onPress={onSelect}
      className={cx(
        "flex w-full cursor-pointer items-center gap-2.5 rounded-2lg p-2 text-start outline-none transition-colors",
        isSelected
          ? "bg-hover"
          : "hover:bg-hover focus-visible:bg-hover",
      )}
    >
      <span className="flex min-w-0 flex-1 items-center gap-2">
        <Icon className="size-5 shrink-0 text-ink-2" aria-hidden />
        <span className="truncate text-body-medium text-ink">{label}</span>
      </span>
      {badge && (
        <Badge
          color="neutral"
          className="bg-hover-2 text-ink-2"
        >
          {badge}
        </Badge>
      )}
    </AriaButton>
  );
}

const mobileSnapshot = () => window.matchMedia("(max-width: 639px)").matches;
const subscribeMobile = (listener: () => void) => {
  const query = window.matchMedia("(max-width: 639px)");
  query.addEventListener("change", listener);
  return () => query.removeEventListener("change", listener);
};

export function DashboardTeamMenu({
  collapsed = false,
  className,
  showThemeToggle = false,
}: {
  collapsed?: boolean;
  className?: string;
  /** Show appearance controls inside the menu instead of the sidebar. */
  showThemeToggle?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(false);
  // "right" placement assumes room to the sidebar's right (true in-flow on
  // desktop) — on mobile the sidebar can span the full viewport, so the
  // 265px panel would render off-screen. Below sm, drop into a plain
  // dropdown under the trigger instead.
  const isMobile = useSyncExternalStore(subscribeMobile, mobileSnapshot, () => false);

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton
        aria-label="Bailey Lee workspace"
        className={cx(
          "flex cursor-pointer overflow-hidden outline-none",
          "border-2 border-transparent hover:border-line-strong",
          "transition-[width,background-color,border-color,padding] duration-300 ease-in-out",
          "focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
          collapsed
            ? "size-9 items-center justify-start rounded-full bg-transparent p-0"
            : "w-full items-start justify-between rounded-xl bg-hover-2 py-2 pe-3 ps-2.5",
          className,
        )}
      >
        <span className="flex min-w-0 items-center gap-2">
          <Avatar size="md" color="blue" initials="BL" alt="Bailey Lee" />
          <Collapsible collapsed={collapsed}>
            <span className="flex min-w-0 flex-col items-start justify-center">
              <span className="text-body-medium whitespace-nowrap text-ink">Bailey Lee</span>
              <span className="text-body-regular whitespace-nowrap text-ink-2">bailey.lee@example.com</span>
            </span>
          </Collapsible>
        </span>
        <Collapsible collapsed={collapsed}>
          <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center self-start rounded-[3px] bg-line">
            <ChevronDownSmall
              className={cx("size-4 text-ink-2 transition-transform duration-200 ease", isOpen && "rotate-180")}
            />
          </span>
        </Collapsible>
      </AriaButton>

      <AriaPopover
        placement={isMobile ? "bottom start" : "right bottom"}
        offset={8}
        className={cx(
          "w-[265px] max-w-[calc(100vw-32px)] origin-bottom-left overflow-y-auto",
          "rounded-2xl border border-line bg-surface p-2.5 shadow-dropdown",
          "transition duration-150 ease-out",
          "data-[entering]:opacity-0 data-[entering]:scale-95 data-[entering]:blur-[2px]",
          "data-[exiting]:opacity-0 data-[exiting]:scale-95 data-[exiting]:blur-[2px]",
        )}
      >
        <AriaDialog aria-label="Workspace menu" className="flex flex-col gap-[7px] outline-none">
          {/* Header */}
          <div className="flex w-full items-center gap-2 px-2 pt-1">
            <Avatar size="md" color="blue" initials="BL" alt="Bailey Lee" />
            <div className="flex min-w-0 flex-col items-start justify-center">
              <span className="text-body-medium whitespace-nowrap text-ink">Bailey Lee</span>
              <span className="text-body-regular whitespace-nowrap text-ink-2">bailey.lee@example.com</span>
            </div>
          </div>

          {/* Grouped sidebar-style rows */}
          <div className="flex w-full flex-col">
            {GROUPS.map((group, index) => (
              <Group key={group.id} group={group} showDivider={index > 0} onSelect={() => setIsOpen(false)}>
                {showThemeToggle && group.id === "personal" && (
                  <div className="flex w-full items-center justify-between gap-2.5 rounded-2lg px-2 py-1">
                    <span className="flex min-w-0 flex-1 items-center gap-2">
                      <Palette className="size-5 shrink-0 text-ink-2" aria-hidden />
                      <span className="truncate text-body-medium text-ink">Appearance</span>
                    </span>
                    <ThemeToggle appearance="segmented" size="small" className="shrink-0" />
                  </div>
                )}
              </Group>
            ))}
          </div>

          {/* Footer */}
          <div className="flex w-full items-center justify-between px-2 pt-1 pb-2">
            <span className="text-body-2-medium whitespace-nowrap text-ink-3">PeachUI</span>
            <span className="inline-flex items-center justify-center rounded-sm bg-hover-2 px-1 py-px text-body-2-medium whitespace-nowrap text-ink-3">
              v1.0.1
            </span>
          </div>
        </AriaDialog>
      </AriaPopover>
    </AriaDialogTrigger>
  );
}

function Group({ group, showDivider, onSelect, children }: { group: MenuGroup; showDivider: boolean; onSelect: () => void; children?: ReactNode }) {
  return (
    <>
      {showDivider && <div className="-mx-2.5 my-2.5 h-px bg-line" />}
      <div className={cx("flex w-full flex-col gap-1", group.label && "gap-1.5 pt-1")}>
        {group.label && (
          <span className="px-2 text-body-medium text-ink-2">{group.label}</span>
        )}
        <div className="flex w-full flex-col gap-1">
          {group.items.map((item) => (
            <TeamMenuItem key={item.label} {...item} onSelect={onSelect} />
          ))}
          {children}
        </div>
      </div>
    </>
  );
}
