import type { AgentComposerCatalog } from "@/components/types";

/** Default demo catalogs — edit this file after copy-paste into your app. */
export const DEFAULT_AGENT_COMPOSER_CATALOG: AgentComposerCatalog = {
  sources: [
    { key: "attach", name: "Add photos & files", desc: "Upload from your computer", glyph: "clip", attach: true },
    { key: "metrics", name: "Studio metrics", desc: "Adoption and agent run stats", glyph: "chart" },
    { key: "catalog", name: "Primitive catalog", desc: "48 components, tags, links", glyph: "layers" },
    { key: "web", name: "Web search", desc: "Real-time news and info", glyph: "globe" },
    { key: "figma", name: "Figma", desc: "Design-to-code workflows", brand: "figma" },
    { key: "slack", name: "Slack", desc: "Read and manage Slack", brand: "slack" },
    { key: "gmail", name: "Gmail", desc: "Read and manage Gmail", brand: "gmail", connect: true },
  ],
  commands: [
    { key: "compare", name: "/compare", desc: "Tokens vs. last release" },
    { key: "release-plan", name: "/release-plan", desc: "Draft a release checklist" },
    { key: "export", name: "/export", desc: "Build a token export bundle" },
    { key: "draft-email", name: "/draft-email", desc: "Write an adoption outreach email" },
    { key: "summarize", name: "/summarize", desc: "Digest the thread so far" },
  ],
  models: [
    { key: "peach-1", name: "Peach 1", tag: "Flagship" },
    { key: "peach-lite", name: "Peach Lite", tag: "Fast" },
    { key: "peach-local", name: "Peach Local", tag: "Offline" },
  ],
  attachFileNames: ["showcase-screenshot.png", "release-notes.md", "token-export.json"],
  dictationSample: "Compare warm token usage to the last release",
};
