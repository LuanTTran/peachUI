/**
 * Peach Mail — fixture data for the /inbox-triage template.
 * Deterministic: no randomness, no dates that go stale.
 *
 * Fiction contract with the other templates: senders are customers of Peach's
 * products. Lumen Robotics is the same account from the billing-usage block,
 * and the Grove banner bug is the same patch waiting on deploy approval in
 * /agent-ops (run-4213) and staged in /coding-agent.
 */

import type { AvatarProps } from "@/components/atoms/avatar";

/* ── Customers ─────────────────────────────────────────── */

export type MailCustomer = {
  id: string;
  /** Person who wrote in. */
  name: string;
  handle: string;
  /** Their company — the Peach customer. */
  org: string;
  /** Plan tier, shown in the sender card. */
  plan: string;
  initials: string;
  color: NonNullable<AvatarProps["color"]>;
};

export const CUSTOMERS: Record<string, MailCustomer> = {
  lumen: {
    id: "lumen",
    name: "Mia Chen",
    handle: "mia@lumen.dev",
    org: "Lumen Robotics",
    plan: "Scale plan",
    initials: "MC",
    color: "blue",
  },
  koda: {
    id: "koda",
    name: "Priya Nair",
    handle: "priya@kodahealth.com",
    org: "Koda Health",
    plan: "Scale plan · annual",
    initials: "PN",
    color: "pink",
  },
  fernleaf: {
    id: "fernleaf",
    name: "Theo Marsh",
    handle: "theo@fernleaf.co",
    org: "Fernleaf",
    plan: "Scale plan",
    initials: "TM",
    color: "pink",
  },
  grove: {
    id: "grove",
    name: "Ana Ruiz",
    handle: "ana.ruiz@postbox.co",
    org: "Grove customer",
    plan: "Storefront shopper",
    initials: "AR",
    color: "lime",
  },
  baltic: {
    id: "baltic",
    name: "Colm Duffy",
    handle: "colm@balticworks.io",
    org: "Baltic Works",
    plan: "Team plan",
    initials: "CD",
    color: "neutral",
  },
  papercrane: {
    id: "papercrane",
    name: "Rin Sato",
    handle: "rin@papercrane.studio",
    org: "Paper Crane",
    plan: "Scale plan",
    initials: "RS",
    color: "blue",
  },
  beam: {
    id: "beam",
    name: "Otto Weiss",
    handle: "ops@beamfreight.co",
    org: "Beam Freight",
    plan: "Team plan",
    initials: "OW",
    color: "pink",
  },
  helio: {
    id: "helio",
    name: "Sana Iqbal",
    handle: "sana@helio-grid.com",
    org: "Helio Grid",
    plan: "Scale plan",
    initials: "SI",
    color: "lime",
  },
  wren: {
    id: "wren",
    name: "Tamsin Vale",
    handle: "tamsin@wrenoptics.com",
    org: "Wren Optics",
    plan: "Team plan",
    initials: "TV",
    color: "neutral",
  },
};

/* ── Threads ───────────────────────────────────────────── */

export type QueueId = "needs-you" | "drafts" | "waiting" | "resolved" | "snoozed";

export type FolderId = QueueId | "all" | "sent";

/** AI chip rendered on the thread row. */
export type AgentStatus =
  | "draft-ready"
  | "needs-decision"
  | "triaged"
  | "waiting"
  | "auto-handled";

export type MessageFrom = "customer" | "agent" | "you" | "note";

export type MailMessage = {
  id: string;
  from: MessageFrom;
  /** Display author — customer name, "Peach Agent", "Suki Tan". */
  author: string;
  ago: string;
  body: string[];
};

export type EscalationOption = {
  id: string;
  label: string;
  detail: string;
  /** The reply the agent drafts once this decision is made. */
  draft: string;
};

export type MailDraft = {
  /** Why the agent wrote it this way — shown next to the draft. */
  hint: string;
  body: string;
};

export type MailThread = {
  id: string;
  queue: QueueId;
  customerId: keyof typeof CUSTOMERS;
  subject: string;
  /** One-line preview for the thread row. */
  snippet: string;
  ago: string;
  unread?: boolean;
  vip?: boolean;
  ai: AgentStatus;
  messages: MailMessage[];
  /** Canned reply the agent streams on demand. */
  draft?: MailDraft;
  /** Decision-first escalation — no draft until the human picks. */
  escalation?: {
    summary: string;
    /** Policy rule the agent hit, rendered mono. */
    policy: string;
    options: EscalationOption[];
  };
  /** Cross-link to the Studio session already working on this. */
  studioLink?: { sessionLabel: string; runId: string; status: string };
};

export const THREADS: MailThread[] = [
  {
    id: "th-lumen",
    queue: "drafts",
    customerId: "lumen",
    subject: "Unexpected charge — 2.1M tokens overage",
    snippet: "Our dashboards show we stayed under quota — can someone look before Nov 1?",
    ago: "41m ago",
    unread: true,
    ai: "draft-ready",
    messages: [
      {
        id: "lm1",
        from: "customer",
        author: "Mia Chen",
        ago: "2h ago",
        body: [
          "Hi — our invoice this cycle shows 2.1M tokens of overage at $214, but our usage panel shows we stayed under the included quota.",
          "Can someone look at this before the card is charged again on Nov 1?",
        ],
      },
      {
        id: "lm2",
        from: "customer",
        author: "Mia Chen",
        ago: "1h ago",
        body: [
          "Adding a screenshot of our usage panel — the spike on the 14th doesn't match any run we kicked off.",
        ],
      },
    ],
    draft: {
      hint: "Cites metered billing · resolves the credit",
      body: "Hi Mia — thanks for flagging this before Nov 1. The spike on the 14th is real usage, but it is tokens.cached, which should bill at the discounted rate. Your invoice metered it at the full rate — that is our bug, not your usage. I've credited the difference ($161) back to this cycle, so the Nov 1 charge will show $53 of overage instead of $214. The full breakdown is on your billing page under Metered usage. Sorry for the scare — cached-token metering should never surprise you like this.",
    },
  },
  {
    id: "th-koda",
    queue: "needs-you",
    customerId: "koda",
    subject: "Refund request — annual plan, 4 months in",
    snippet: "We'd like a refund on the unused months, about $480. Can you do that?",
    ago: "58m ago",
    unread: true,
    ai: "needs-decision",
    messages: [
      {
        id: "km1",
        from: "customer",
        author: "Priya Nair",
        ago: "58m ago",
        body: [
          "We're four months into an annual Scale plan and finance wants to move us to monthly billing.",
          "The annual discount makes a full switch messy — what we'd actually like is a refund on the unused months, about $480. Can you do that?",
        ],
      },
    ],
    escalation: {
      summary:
        "Priya is asking for a $480 refund on an annual contract. Self-serve refunds cap at $250 — anything above needs a human decision.",
      policy: "refunds.policy · cap $250",
      options: [
        {
          id: "full",
          label: "Refund $480 in full",
          detail: "Goodwill exception — keeps a Scale-plan customer happy.",
          draft: "Hi Priya — I've gone ahead and refunded the $480 for the unused months in full. You'll see it back on the card within 5 business days, and I've switched the workspace to monthly billing starting next cycle so finance gets the paper trail they asked for. The annual discount stays applied through the end of this billing period. Thanks for being straightforward about what you needed — it made this easy.",
        },
        {
          id: "prorated",
          label: "Refund $240, credit the rest",
          detail: "Half cash back, half workspace credit — splits the difference.",
          draft: "Hi Priya — here's what I can do: I've refunded $240 to the card for part of the unused months and applied the remaining $240 as credit on the workspace, which covers your next two monthly invoices in full. The workspace moves to monthly billing next cycle, so nothing changes operationally. If finance needs the refund as a single line item instead, tell me and I'll rework it.",
        },
        {
          id: "credit",
          label: "Decline refund, offer $480 credit",
          detail: "Stays inside policy — full value, no cash out.",
          draft: "Hi Priya — cash refunds on annual plans aren't something I can do past the grace window, but I don't want to leave you holding the difference. I've applied the full $480 as credit on the workspace — at Scale pricing that covers about four months of monthly billing, which is exactly what you were asking for. I've also flagged the switch to monthly for next cycle. If a credit genuinely doesn't work for finance, reply and I'll escalate to our billing team.",
        },
      ],
    },
  },
  {
    id: "th-fernleaf",
    queue: "drafts",
    customerId: "fernleaf",
    subject: "Honest check-in before renewal",
    snippet: "We're evaluating two alternatives — is team-level approvals on the roadmap?",
    ago: "1h ago",
    unread: true,
    vip: true,
    ai: "draft-ready",
    messages: [
      {
        id: "fm1",
        from: "customer",
        author: "Theo Marsh",
        ago: "1h ago",
        body: [
          "I'll be direct — we're evaluating two alternatives before our renewal in January.",
          "The agent runs are great, but approvals take too long when only one of us can approve. Is team-level approvals on the roadmap, or do we stay bottlenecked on Devon?",
        ],
      },
    ],
    draft: {
      hint: "Answers the roadmap question · offers a call",
      body: "Hi Theo — directness appreciated, so same back. Team-level approvals are real: delegated approver roles shipped to beta last week and hit general availability in December, ahead of your January renewal. Until then we can add a second admin seat to your workspace at no cost — Jonas can set that up today. Want 20 minutes next week to walk the beta? I'll send a couple of times.",
    },
  },
  {
    id: "th-grove",
    queue: "needs-you",
    customerId: "grove",
    subject: "Free-shipping banner covers the checkout button",
    snippet: "On my phone the new banner sits on top of the cart button — iPhone 14, Safari.",
    ago: "23m ago",
    unread: true,
    ai: "triaged",
    messages: [
      {
        id: "gm1",
        from: "customer",
        author: "Ana Ruiz",
        ago: "23m ago",
        body: [
          "Love the free shipping — but on my phone the new banner sits on top of the cart button and I can't check out.",
          "iPhone 14, Safari. Screenshot attached.",
        ],
      },
      {
        id: "gm2",
        from: "note",
        author: "Peach Agent",
        ago: "18m ago",
        body: [
          "Matched to run-4213 in Peach Studio — the banner patch is staged and waiting on a deploy approval. The overlap is a known sticky-offset bug under 390px viewports.",
        ],
      },
    ],
    studioLink: {
      sessionLabel: "Free-shipping banner",
      runId: "run-4213",
      status: "Awaiting deploy approval",
    },
    draft: {
      hint: "References run-4213 · sets expectations",
      body: "Hi Ana — sorry about that, and thanks for the screenshot. We found the bug: the banner's sticky offset overlaps the checkout button on screens under 390px. The fix is staged and ships with today's deploy — the banner will scroll away instead of pinning. I'll confirm here the moment it's live. Your cart is safe in the meantime.",
    },
  },
  {
    id: "th-wren",
    queue: "needs-you",
    customerId: "wren",
    subject: "Webhooks firing twice since this morning",
    snippet: "Every order.created event arrives doubled — started around 6am.",
    ago: "just now",
    unread: true,
    ai: "triaged",
    messages: [
      {
        id: "wm1",
        from: "customer",
        author: "Tamsin Vale",
        ago: "just now",
        body: [
          "Since about 6am every order.created webhook fires twice — same event id, ~300ms apart. Our handler is idempotent so nothing's broken, but it's doubling our downstream jobs. Did something change on your side?",
        ],
      },
      {
        id: "wm2",
        from: "note",
        author: "Peach Agent",
        ago: "just now",
        body: [
          "Checked the delivery log — duplicates correlate with the endpoint's retry window after this morning's edge rollout. No customer-side change detected.",
        ],
      },
    ],
    draft: {
      hint: "Confirms our side · gives a workaround",
      body: "Hi Tamsin — yes, something changed on our side. This morning's edge rollout shortened the ack window on webhook delivery, so slow endpoints get a retry even when the first delivery landed. Same event id both times, exactly as you saw. Two things: we've already rolled the ack window back for order.created, so the doubles should stop within the hour — and filtering on the event id stays the right guard either way. Sorry for the noise on your job queue.",
    },
  },
  {
    id: "th-baltic",
    queue: "waiting",
    customerId: "baltic",
    subject: "SAML SSO — attribute mapping",
    snippet: "Okta side is done — what attributes does Peach expect on the assertion?",
    ago: "yesterday",
    ai: "waiting",
    messages: [
      {
        id: "bm1",
        from: "customer",
        author: "Colm Duffy",
        ago: "yesterday",
        body: [
          "We're wiring up SAML for the workspace — Okta side is done. What attributes does Peach expect on the assertion?",
        ],
      },
      {
        id: "bm2",
        from: "agent",
        author: "Peach Agent",
        ago: "yesterday",
        body: [
          "Hi Colm — Peach reads three attributes off the assertion: email (required), displayName, and groups for role mapping. The exact attribute names are in your SSO settings under Attribute mapping, along with the ACS URL and entity ID for the Okta app.",
          "Once the first user signs in, the mapping shows up in the audit log so you can confirm it end to end.",
        ],
      },
    ],
    draft: {
      hint: "Gentle nudge · repeats the checklist",
      body: "Hi Colm — quick nudge in case this slipped. The three attributes (email, displayName, groups) and the ACS URL are under Attribute mapping in your SSO settings. If the first sign-in came back with a mapping error, paste it here and I'll take a look.",
    },
  },
  {
    id: "th-papercrane",
    queue: "waiting",
    customerId: "papercrane",
    subject: "Data residency for the EU workspace",
    snippet: "Before we commit — can our EU workspace pin storage to Frankfurt?",
    ago: "yesterday",
    ai: "waiting",
    messages: [
      {
        id: "pm1",
        from: "customer",
        author: "Rin Sato",
        ago: "2d ago",
        body: [
          "Before we commit — can our EU workspace pin storage to Frankfurt specifically, or is it just “EU region”? Compliance is asking.",
        ],
      },
      {
        id: "pm2",
        from: "agent",
        author: "Peach Agent",
        ago: "yesterday",
        body: [
          "Hi Rin — EU workspaces pin to eu-central-1 (Frankfurt) for primary storage, with replicas in eu-west-1 (Ireland). Backups stay in-region. If compliance needs the residency attestation, I can attach the current SOC 2 report — want me to?",
        ],
      },
    ],
    draft: {
      hint: "Offers the attestation directly",
      body: "Hi Rin — circling back on this. If it speeds things up with compliance, I can send the SOC 2 residency attestation today — it covers the Frankfurt primary and Ireland replica explicitly. Just say the word.",
    },
  },
  {
    id: "th-helio",
    queue: "resolved",
    customerId: "helio",
    subject: "Is deploy-4817 related to the API timeouts?",
    snippet: "Seeing 2s p95 on /v1/runs since about 9am — deploy this morning?",
    ago: "3h ago",
    ai: "auto-handled",
    messages: [
      {
        id: "hm1",
        from: "customer",
        author: "Sana Iqbal",
        ago: "3h ago",
        body: [
          "Seeing 2s p95 on /v1/runs since about 9am — did something deploy this morning?",
        ],
      },
      {
        id: "hm2",
        from: "agent",
        author: "Peach Agent",
        ago: "3h ago",
        body: [
          "Hi Sana — yes, deploy-4817 went out at 8:52 and briefly doubled cold-start time on /v1/runs while the new bundle warmed. p95 is back under 400ms as of 9:20. The timeline is on status.peach.dev if you need it for your own incident notes.",
        ],
      },
    ],
  },
  {
    id: "th-beam",
    queue: "resolved",
    customerId: "beam",
    subject: "Copy of the September invoice?",
    snippet: "Accounting needs a PDF of September's invoice for the books.",
    ago: "5h ago",
    ai: "auto-handled",
    messages: [
      {
        id: "em1",
        from: "customer",
        author: "Otto Weiss",
        ago: "5h ago",
        body: [
          "Accounting needs a PDF of September's invoice for the books — could you send one over?",
        ],
      },
      {
        id: "em2",
        from: "agent",
        author: "Peach Agent",
        ago: "5h ago",
        body: [
          "Hi Otto — attached the September invoice as a PDF, and your billing page keeps the full archive under Invoices if you ever need another month.",
        ],
      },
    ],
  },
];

/** Arrives live a few seconds after mount — moves into Needs you. */
export const LATE_THREAD_ID = "th-wren";

/* ── Labels & folders ──────────────────────────────────── */

export const AGENT_STATUS_LABEL: Record<AgentStatus, string> = {
  "draft-ready": "Draft ready",
  "needs-decision": "Decision needed",
  triaged: "Triaged",
  waiting: "Waiting",
  "auto-handled": "Auto-replied",
};

export const AGENT_STATUS_COLOR: Record<
  AgentStatus,
  "purple" | "yellow" | "blue" | "neutral" | "soft"
> = {
  "draft-ready": "purple",
  "needs-decision": "yellow",
  triaged: "blue",
  waiting: "neutral",
  "auto-handled": "soft",
};

export const FOLDER_LABEL: Record<FolderId, string> = {
  "needs-you": "Needs you",
  drafts: "Drafts to review",
  waiting: "Waiting",
  resolved: "Resolved",
  snoozed: "Snoozed",
  all: "All mail",
  sent: "Sent",
};

/** Tool stubs — same honesty pattern as the Ops nav. */
export const STUB_SECTION_LABEL: Record<string, string> = {
  customers: "Customers",
  automations: "Automations",
  insights: "Insights",
};

export type ThreadLike = { queue: QueueId; sent?: boolean };

export function inFolder<T extends ThreadLike>(thread: T, folder: FolderId): boolean {
  if (folder === "all") return true;
  if (folder === "sent") return thread.sent === true;
  return thread.queue === folder;
}

/* ── Overnight brief ───────────────────────────────────── */

export const OVERNIGHT_BRIEF = {
  headline: "23 threads handled overnight",
  breakdown: [
    { id: "replied", count: 12, label: "auto-replied" },
    { id: "drafted", count: 4, label: "drafted for review" },
    { id: "archived", count: 7, label: "archived" },
  ],
} as const;
