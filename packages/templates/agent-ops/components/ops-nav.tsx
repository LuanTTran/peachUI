"use client";

/**
 * Ops navigation — the shared DashboardSidebar block configured with the
 * Ops sections. Runs is the only live section; the rest are demo stubs.
 * "Open Studio" routes back to the coding-agent screen.
 */

import { useRouter } from "next/navigation";
import {
  Activity,
  Grid,
  Key,
  Lock,
  Rocket,
  Server,
  ShieldCheck,
  Sparkle,
} from "reicon-react";
import {
  DashboardSidebar,
  type DashboardNavItem,
} from "@/components/blocks/sidebar/sidebar";

export function OpsNav({
  activeSection,
  onSectionChange,
  pendingCount,
  liveCount,
  mobile,
  onClose,
  className,
}: {
  activeSection: string;
  onSectionChange: (id: string) => void;
  /** Pending approvals — badges the Approvals row. */
  pendingCount: number;
  /** Queued + running runs — badges the Runs row. */
  liveCount: number;
  mobile?: boolean;
  onClose?: () => void;
  className?: string;
}) {
  const router = useRouter();

  const items: DashboardNavItem[] = [
    { key: "overview", label: "Overview", icon: Grid },
    {
      key: "runs",
      label: "Runs",
      icon: Activity,
      badge: liveCount > 0 ? liveCount : undefined,
    },
    {
      key: "approvals",
      label: "Approvals",
      icon: ShieldCheck,
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { key: "deploys", label: "Deploys", icon: Rocket },
    { key: "envs", label: "Environments", icon: Server },
    { key: "secrets", label: "Secrets", icon: Key },
    { key: "policies", label: "Policies", icon: Lock },
    { key: "studio", label: "Open Studio", icon: Sparkle, href: "/coding-agent" },
  ];

  const handleSelect = (key: string) => {
    if (key === "studio") {
      router.push("/coding-agent");
      return;
    }
    onSectionChange(key);
  };

  return (
    <DashboardSidebar
      mobile={mobile}
      onClose={onClose}
      selected={activeSection}
      onSelectedChange={handleSelect}
      items={items}
      className={className}
    />
  );
}
