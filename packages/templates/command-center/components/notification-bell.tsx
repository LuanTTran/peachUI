"use client";

/**
 * Notification bell — the badge counts unread rows; opening the panel lists
 * them, clicking a row marks it read, "Mark all read" clears the rest.
 * The spec's `notification-bell` as a template-local composite.
 */

import { useState } from "react";
import { Bell, Check } from "reicon-react";
import { Badge } from "@/components/atoms/badge";
import {
  Dropdown,
  DropdownDivider,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/atoms/dropdown";
import type { HomeNotice } from "../data";
import { cx } from "@/lib/utils";

const TONE_DOT: Record<HomeNotice["tone"], string> = {
  warning: "bg-warning",
  accent: "bg-accent",
  success: "bg-green",
  muted: "bg-ink-3",
};

export function NotificationBell({
  notices,
  onMarkRead,
  onMarkAllRead,
}: {
  notices: HomeNotice[];
  onMarkRead: (id: string) => void;
  onMarkAllRead: () => void;
}) {
  const [open, setOpen] = useState(false);
  const unread = notices.filter((n) => n.unread).length;

  return (
    <Dropdown isOpen={open} onOpenChange={setOpen}>
      <DropdownTrigger
        aria-label={unread > 0 ? `Notifications, ${unread} unread` : "Notifications"}
        className="relative flex size-8 items-center justify-center rounded-2lg text-ink-2 transition-colors hover:bg-hover hover:text-ink"
      >
        <Bell className="size-4" aria-hidden />
        {unread > 0 ? (
          <Badge
            color="primary"
            className="absolute -right-0.5 -top-0.5 min-w-4 justify-center px-1"
          >
            {unread}
          </Badge>
        ) : null}
      </DropdownTrigger>
      <DropdownPopover
        aria-label="Notifications"
        placement="bottom end"
        offset={6}
        className="w-[min(320px,calc(100vw-24px))]"
      >
        <div className="flex items-center justify-between px-2 pt-1">
          <span className="text-body-medium text-ink">Notifications</span>
          {unread > 0 ? (
            <button
              type="button"
              onClick={onMarkAllRead}
              className="inline-flex min-h-7 items-center gap-1 rounded-control px-1.5 text-caption-1-medium text-ink-3 transition-colors hover:bg-hover hover:text-ink"
            >
              <Check className="size-3.5" aria-hidden />
              Mark all read
            </button>
          ) : null}
        </div>
        <DropdownDivider />
        {notices.map((notice) => (
          <DropdownItem
            key={notice.id}
            onSelect={() => {
              onMarkRead(notice.id);
              setOpen(false);
            }}
            className="items-start"
          >
            <span
              className={cx("mt-1.5 size-2 shrink-0 rounded-full", TONE_DOT[notice.tone])}
              aria-hidden
            />
            <span className="min-w-0 flex-1">
              <span
                className={cx(
                  "block truncate",
                  notice.unread ? "text-body-2-medium text-ink" : "text-body-2-regular text-ink-2",
                )}
              >
                {notice.title}
              </span>
              <span className="block truncate text-caption-1-regular text-ink-3">
                {notice.detail}
              </span>
            </span>
            <span className="shrink-0 pt-0.5 text-caption-2-regular tabular-nums text-ink-3">
              {notice.ago}
            </span>
          </DropdownItem>
        ))}
      </DropdownPopover>
    </Dropdown>
  );
}
