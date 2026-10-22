import type { AgentComposerCatalog } from "@/components/types";

/** Showcase-only CRM / Peachy story — not used by primitives. */
export const PEACHY_AGENT_COMPOSER_CATALOG: AgentComposerCatalog = {
  sources: [
    { key: "attach", name: "Add photos & files", desc: "Upload from your computer", glyph: "clip", attach: true },
    { key: "notes", name: "Past meeting notes", desc: "Attach a note or transcript", glyph: "layers", attach: true },
    { key: "calendar", name: "Calendar context", desc: "Upcoming events for prep", glyph: "calendar" },
    { key: "web", name: "Web search", desc: "Company and role research", glyph: "globe" },
    { key: "gmail", name: "Gmail", desc: "Read threads with contacts", brand: "gmail", connect: true },
  ],
  commands: [
    { key: "prep", name: "/prep", desc: "Draft talking points for an event" },
    { key: "follow-up", name: "/follow-up", desc: "Suggest a follow-up task" },
    { key: "summarize", name: "/summarize", desc: "Digest notes into structured memory" },
    { key: "research", name: "/research", desc: "Research a company for outreach" },
  ],
  models: [
    { key: "peach-1", name: "Peach 1", tag: "Flagship" },
    { key: "peach-lite", name: "Peach Lite", tag: "Fast" },
    { key: "peach-local", name: "Peach Local", tag: "Offline" },
  ],
  attachFileNames: ["mia-interview-notes.md", "coffee-chat-raw.txt", "panel-prep.docx"],
  dictationSample: "Follow up with Mia about the hiring loop and next steps",
};
