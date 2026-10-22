import type { Metadata } from "next";
import { CommandCenterTemplate } from "@templates/command-center";

export const metadata: Metadata = {
  title: "Peach Home · command dashboard",
  description: "A full-screen founder's home base with brief, KPIs, deploys, and the agent task board, built from PeachUI components.",
};

export default function CommandCenterPage() {
  return <CommandCenterTemplate />;
}
