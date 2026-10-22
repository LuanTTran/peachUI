import type { Metadata } from "next";
import { CodingAgentTemplate } from "@templates/coding-agent";

export const metadata: Metadata = {
  title: "Peach Studio · coding agent",
  description: "A full-screen coding agent chat built from PeachUI components.",
};

export default function CodingAgentPage() {
  return <CodingAgentTemplate />;
}
