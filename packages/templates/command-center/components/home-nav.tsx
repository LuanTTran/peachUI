"use client";

/**
 * Home navigation — the shared DashboardSidebar block configured as the
 * Peach suite hub. Home is the selected row; Studio, Ops, and Mail are real
 * routes so the home base actually links out to the rest of the story.
 * The Ops row carries the pending-approval count — the same gates the
 * "Waiting on you" rail resolves.
 */

import {
  Activity,
  Home,
  Inbox,
  Sparkle,
} from "reicon-react";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/blocks/sidebar/sidebar";

export function HomeNav({
  pendingCount,
  mobile,
  onClose,
  className,
}: {
  /** Pending approvals — badges the Peach Ops row. */
  pendingCount: number;
  mobile?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  const items: DashboardNavItem[] = [
    { key: "home", label: "Home", icon: Home },
    { key: "studio", label: "Peach Studio", icon: Sparkle, href: "/coding-agent" },
    {
      key: "ops",
      label: "Peach Ops",
      icon: Activity,
      href: "/agent-ops",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { key: "mail", label: "Peach Mail", icon: Inbox, href: "/inbox-triage" },
  ];

  return (
    <DashboardSidebar
      mobile={mobile}
      onClose={onClose}
      selected="home"
      items={items}
      className={className}
    />
  );
}
