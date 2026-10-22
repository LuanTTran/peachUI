import type { Metadata } from "next";
import { AgentOpsTemplate } from "@templates/agent-ops";

export const metadata: Metadata = {
  title: "Peach Ops · agent ops console",
  description: "A full-screen ops console for supervising agent runs, built from PeachUI components.",
};

export default function AgentOpsPage() {
  return <AgentOpsTemplate />;
}
