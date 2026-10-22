"use client";

import { BranchDown, CloudDownload, ShieldCheck, UserAdd } from "reicon-react";
import {
  NotificationCenter,
  type NotificationCenterItem,
} from "@/components/blocks/notification-center/notification-center";

const notifications: NotificationCenterItem[] = [
  {
    id: "mention-notes",
    category: "mentions",
    group: "Today",
    title: "Bailey Lee left a note on Settings",
    description: "She suggested tightening the plan card copy before the release branch.",
    timestamp: "4m",
    unread: true,
    avatar: { alt: "Bailey Lee", initials: "BL", color: "blue" },
    actions: [
      { id: "reply", label: "Reply", variant: "primary" },
      { id: "view", label: "Open thread", variant: "secondary" },
    ],
  },
  {
    id: "backup-ready",
    category: "system",
    group: "Today",
    title: "Nightly export finished",
    description: "Your workspace snapshot from 02:00 UTC is ready to download.",
    timestamp: "22m",
    unread: true,
    status: "success",
    icon: CloudDownload,
    actions: [{ id: "download", label: "Download", variant: "primary" }],
  },
  {
    id: "project-invite",
    category: "activity",
    group: "Today",
    title: "You were added to Harbor",
    description: "Brexton Tran gave you editor access to the design tokens project.",
    timestamp: "2h",
    unread: true,
    icon: UserAdd,
    status: "information",
  },
  {
    id: "pull-request",
    category: "mentions",
    group: "Earlier this week",
    title: "Brexton Tran asked for a review",
    description: "PR #412 refreshes the notification row spacing and icon wells.",
    timestamp: "Tue",
    avatar: { alt: "Brexton Tran", initials: "BT", color: "lime" },
    actions: [{ id: "review", label: "Open diff", variant: "secondary" }],
  },
  {
    id: "security-check",
    category: "system",
    group: "Earlier this week",
    title: "Dependency scan passed",
    description: "No critical issues in the last weekly audit.",
    timestamp: "Sun",
    status: "success",
    icon: ShieldCheck,
  },
  {
    id: "deploy-failed",
    category: "system",
    group: "Earlier this week",
    title: "Staging deploy stopped",
    description: "The build failed while compiling the catalog routes.",
    timestamp: "Sat",
    unread: true,
    status: "error",
    icon: BranchDown,
    actions: [
      { id: "retry", label: "Retry deploy", variant: "primary" },
      { id: "logs", label: "View build log", variant: "secondary" },
    ],
  },
];

export function NotificationCenterDemo() {
  return <NotificationCenter notifications={notifications} />;
}
