import type { Metadata } from "next";
import { PeachMailTemplate } from "@templates/peach-mail";

export const metadata: Metadata = {
  title: "Peach Mail · AI inbox triage",
  description: "A full-screen support inbox where the agent triages overnight and a human approves, built from PeachUI components.",
};

export default function PeachMailPage() {
  return <PeachMailTemplate />;
}
