import type { AgentSourcePreview } from "@/components/primitives/agent-answer-turn";
import type { AgentRunTraceSource } from "@/components/primitives/agent-run-trace";
import type { StreamingSource, StreamingToken } from "@/components/primitives/streaming-text";

export const DEMO_USER_PROMPT =
  "Summarize yesterday's launch meeting and list what's still open before we send.";

export const DEMO_SEARCH_QUERY =
  "October 21 launch send date · customer onboarding feedback · pricing line";

export const DEMO_TRACE_SOURCES: AgentRunTraceSource[] = [
  { id: "ts1", label: "Notes — Launch sync", href: "https://notes.peach-ui.dev/" },
  { id: "ts2", label: "Studio — Customer threads", href: "https://studio.peach-ui.dev/" },
  { id: "ts3", label: "Docs — Pricing draft", href: "https://docs.peach-ui.dev/" },
  { id: "ts4", label: "Calendar — Send window", href: "https://calendar.peach-ui.dev/" },
];

export const DEMO_RUN_STEPS = [
  "Reading notes from the launch sync",
  "Pulling open questions from customer threads",
  "Checking October 21 against the send calendar",
  "Drafting the summary and reply outline",
];

export const DEMO_SOURCE_PREVIEWS: AgentSourcePreview[] = [
  {
    id: "sp1",
    index: 1,
    title: "Launch meeting notes",
    snippet: "October 21 is the send date. Onboarding should be shorter.",
    host: "notes.peach-ui.dev",
    href: "https://notes.peach-ui.dev/",
  },
  {
    id: "sp2",
    index: 2,
    title: "Customer questions",
    snippet: "Three threads ask for a shorter first week and a clearer price.",
    host: "studio.peach-ui.dev",
    href: "https://studio.peach-ui.dev/",
  },
  {
    id: "sp3",
    index: 3,
    title: "Pricing draft",
    snippet: "Final line item still marked TBD before external send.",
    host: "docs.peach-ui.dev",
    href: "https://docs.peach-ui.dev/",
  },
];

export const DEMO_STREAM_SOURCES: StreamingSource[] = [
  { name: "Meeting notes", domain: "notes.peach-ui.dev", href: "https://notes.peach-ui.dev/" },
  { name: "Customer threads", domain: "studio.peach-ui.dev", href: "https://studio.peach-ui.dev/" },
  { name: "Pricing draft", domain: "docs.peach-ui.dev", href: "https://docs.peach-ui.dev/" },
];

const lead =
  "The launch sync settled October 21 as the send date. Three customers asked for a shorter first week, and the reply draft is ready for review.";

function words(text: string): StreamingToken[] {
  return text.split(" ").map((word) => ({ text: word }));
}

export const DEMO_ANSWER_TOKENS: StreamingToken[] = [
  ...words(lead),
  { text: "", cite: true, citeIndex: 0, citeSuffix: " +1" },
  ...words("Still open before send:"),
  ...words("• the final pricing line"),
  { text: "", cite: true, citeIndex: 2 },
  ...words("• who sends the customer note"),
  { text: "", cite: true, citeIndex: 1, citeSuffix: " +1" },
  ...words("• whether onboarding ships in the same release"),
];

export const DEMO_ANSWER_TAIL = [
  "the final pricing line",
  "who sends the customer note",
  "whether onboarding ships in the same release",
] as const;

export const DEMO_FOLLOW_UPS = [
  "Draft the customer reply in a warmer tone",
  "List blockers for the October 21 send",
  "Compare this summary to last month's launch notes",
];

/** Plain text for copy actions */
export const DEMO_ANSWER =
  `${lead} Still open before send: the final pricing line, who sends the customer note, and whether onboarding ships in the same release.`;

export const DEMO_MORE_SOURCES = 2;
