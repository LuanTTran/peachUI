"use client";

/**
 * Mail navigation — the shared DashboardSidebar block configured with the
 * agent queues, mail folders, and tool stubs. "Open Ops" routes to
 * /agent-ops, the control room for the same agent.
 */

import { useRouter } from "next/navigation";
import {
  Activity,
  AlarmClock,
  CheckRead,
  DirectSend,
  Inbox,
  InboxUnread,
  MessageTime,
  PenSparkle,
  Sparkle,
  Users,
  Wand,
} from "reicon-react";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/blocks/sidebar/sidebar";

export function MailNav({
  activeFolder,
  onFolderChange,
  needsYouCount,
  draftsCount,
  snoozedCount,
  mobile,
  onClose,
  className,
}: {
  activeFolder: string;
  onFolderChange: (id: string) => void;
  needsYouCount: number;
  draftsCount: number;
  snoozedCount: number;
  mobile?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  const router = useRouter();

  const items: DashboardNavItem[] = [
    {
      key: "needs-you",
      label: "Needs you",
      icon: InboxUnread,
      badge: needsYouCount > 0 ? needsYouCount : undefined,
    },
    {
      key: "drafts",
      label: "Drafts to review",
      icon: PenSparkle,
      badge: draftsCount > 0 ? draftsCount : undefined,
    },
    { key: "waiting", label: "Waiting", icon: MessageTime },
    { key: "resolved", label: "Resolved", icon: CheckRead },
    { key: "all", label: "All mail", icon: Inbox },
    {
      key: "snoozed",
      label: "Snoozed",
      icon: AlarmClock,
      badge: snoozedCount > 0 ? snoozedCount : undefined,
    },
    { key: "sent", label: "Sent", icon: DirectSend },
    { key: "customers", label: "Customers", icon: Users },
    { key: "automations", label: "Automations", icon: Wand },
    { key: "insights", label: "Insights", icon: Activity },
    { key: "ops", label: "Open Ops", icon: Sparkle, href: "/agent-ops" },
  ];

  const handleSelect = (key: string) => {
    if (key === "ops") {
      router.push("/agent-ops");
      return;
    }
    onFolderChange(key);
  };

  return (
    <DashboardSidebar
      mobile={mobile}
      onClose={onClose}
      selected={activeFolder}
      onSelectedChange={handleSelect}
      items={items}
      className={className}
    />
  );
}
