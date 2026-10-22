"use client";

/**
 * PeachUI — ContextLibrary (block)
 * @tier block
 * @deps button, motion
 * @requires app/globals.css
 *
 * Retrieved chunks for the session. Open one to read it,
 * pin what the next run should keep.
 */

import { useState, type ReactNode } from "react";
import { Check, X } from "reicon-react";
import { Button } from "@/components/atoms/button";
import {
  AnimatePresence,
  motion,
  motionInstantIfReduced,
  useReducedMotion,
} from "@/components/lib/motion";
import { cx } from "@/lib/utils";

const TEXT_SWAP = {
  duration: 0.15,
  ease: "easeInOut" as const,
};

type ChunkBadge = "PDF" | "CSV" | "MD" | "DOC";

const BADGE_TONE: Record<ChunkBadge, string> = {
  PDF: "bg-red",
  CSV: "bg-green",
  MD: "bg-accent",
  DOC: "bg-orange",
};

export interface ContextChunk {
  id: string;
  title: string;
  source: string;
  badge: ChunkBadge;
  chars: string;
  match: string;
  body: string;
}

const DEFAULT_CHUNKS: ContextChunk[] = [
  {
    id: "release-rule",
    title: "Pin a release before agent runs",
    source: "Adoption playbook.pdf",
    badge: "PDF",
    chars: "1,240 chars",
    match: "Matched 'release checklist'",
    body: "Teams must pin a Peach UI release before agent runs can write to their token bundle. The pin lives in the workspace config and applies to every run until it is lifted.",
  },
  {
    id: "usage-export",
    title: "Q4 catalog usage",
    source: "studio-analytics.csv",
    badge: "CSV",
    chars: "890 chars",
    match: "Matched 'usage table'",
    body: "PromptBar +18% weekly views, TaskRows +6%, Flowchart −11%. Primitives under 40 weekly views are flagged for review before the next catalog cut.",
  },
  {
    id: "token-notes",
    title: "Token migration notes",
    source: "tokens-v04.md",
    badge: "MD",
    chars: "2,310 chars",
    match: "Matched 'token rename'",
    body: "Release 0.4 renames three warm surface tokens. Surface, field, and inset map one-to-one; the shadow tokens merge into a single elevation scale.",
  },
  {
    id: "eval-runbook",
    title: "Weekly eval runbook",
    source: "eval-runbook.doc",
    badge: "DOC",
    chars: "1,760 chars",
    match: "Matched 'eval schedule'",
    body: "Evals run Monday at 09:00 against the golden set. A failure opens a ticket on the release board and blocks catalog publishes until triaged.",
  },
];

function Swap({
  swapKey,
  reduced,
  children,
  className,
}: {
  swapKey: string;
  reduced: boolean | null;
  children: ReactNode;
  className?: string;
}) {
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={swapKey}
        className={className}
        initial={reduced ? false : { opacity: 0, y: 4, filter: "blur(2px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        exit={{ opacity: 0, y: -4, filter: "blur(2px)" }}
        transition={motionInstantIfReduced(reduced, TEXT_SWAP)}
        style={{ willChange: "transform, filter, opacity" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

function SourceBadge({ chunk }: { chunk: ContextChunk }) {
  return (
    <span className="inline-flex min-w-0 items-center gap-1.5 text-body-2-regular text-ink-2">
      <span
        className={cx(
          "flex size-4 shrink-0 items-center justify-center rounded-[4px] text-[9px] font-semibold text-white",
          BADGE_TONE[chunk.badge],
        )}
        aria-hidden
      >
        {chunk.badge[0]}
      </span>
      <span className="truncate">{chunk.source}</span>
    </span>
  );
}

export type ContextLibraryProps = {
  className?: string;
  chunks?: ContextChunk[];
  initialPinned?: string[];
};

export function ContextLibrary({
  className,
  chunks = DEFAULT_CHUNKS,
  initialPinned = ["release-rule"],
}: ContextLibraryProps) {
  const reducedMotion = useReducedMotion();
  const [openId, setOpenId] = useState(() => chunks[0]?.id ?? "");
  const [pinnedIds, setPinnedIds] = useState<string[]>(initialPinned);

  const open = chunks.find((chunk) => chunk.id === openId) ?? chunks[0] ?? null;
  const openPinned = open !== null && pinnedIds.includes(open.id);

  const togglePin = () => {
    if (!open) return;
    setPinnedIds((current) =>
      current.includes(open.id)
        ? current.filter((id) => id !== open.id)
        : [...current, open.id],
    );
  };

  const footerKey = !open ? "empty" : `${open.id}-${openPinned ? "pinned" : "loose"}`;

  return (
    <section
      aria-label="Context library"
      className={cx(
        "flex min-w-0 flex-col overflow-hidden rounded-3xl border border-line bg-surface shadow-xs",
        className,
      )}
    >
      <div className="flex min-w-0 flex-col lg:flex-row">
        <div className="flex min-w-0 flex-1 flex-col gap-3 p-4">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-body-medium text-ink">Context library</h2>
            <Swap
              swapKey={`pinned-${pinnedIds.length}`}
              reduced={reducedMotion}
              className="text-body-2-regular text-ink-2 tabular-nums"
            >
              {chunks.length === 0
                ? "No chunks yet"
                : `${pinnedIds.length} of ${chunks.length} pinned`}
            </Swap>
          </div>

          <p className="text-body-regular text-pretty text-ink-2">
            Retrieved for this session. Pin what the next run should keep.
          </p>

          <ul className="flex flex-col gap-1">
            {chunks.map((chunk) => {
              const isOpen = open?.id === chunk.id;
              const isPinned = pinnedIds.includes(chunk.id);
              return (
                <li key={chunk.id}>
                  <button
                    type="button"
                    aria-pressed={isOpen}
                    onClick={() => setOpenId(chunk.id)}
                    className={cx(
                      "button-press-motion w-full rounded-lg px-2.5 py-2 text-left",
                      "outline-none transition-colors duration-100 focus-visible:ring-2 focus-visible:ring-accent",
                      isOpen ? "bg-canvas" : "hover:bg-hover-2",
                    )}
                  >
                    <span className="flex min-w-0 items-center gap-2.5">
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-body-medium text-ink">
                          {chunk.title}
                        </span>
                        <span className="block truncate text-body-2-regular text-ink-2">
                          {chunk.source} · {chunk.chars}
                        </span>
                      </span>
                      {isPinned ? (
                        <Check className="size-4 shrink-0 text-green" aria-hidden />
                      ) : null}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        <aside className="flex min-w-0 flex-col gap-3 border-t border-line p-4 lg:w-[min(100%,340px)] lg:shrink-0 lg:border-t-0 lg:border-l">
          <p className="text-body-2-medium text-ink-2">Chunk</p>
          <Swap
            swapKey={open?.id ?? "empty"}
            reduced={reducedMotion}
            className="flex min-w-0 flex-col gap-3"
          >
            {open ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <h3 className="min-w-0 text-body-medium text-pretty text-ink">{open.title}</h3>
                  {openPinned ? (
                    <span className="mt-0.5 inline-flex shrink-0 items-center gap-1 text-caption-1-medium text-green">
                      <Check className="size-3.5" aria-hidden />
                      In session
                    </span>
                  ) : null}
                </div>
                <div className="flex items-center justify-between gap-3">
                  <SourceBadge chunk={open} />
                  <span className="shrink-0 text-caption-1-regular tabular-nums text-ink-3">
                    {open.chars}
                  </span>
                </div>
                <p className="rounded-lg bg-canvas px-3 py-3 text-body-regular text-pretty text-ink-2">
                  {open.body}
                </p>
                <p className="text-body-2-regular text-ink-3">{open.match}</p>
              </>
            ) : (
              <div className="flex min-h-40 flex-col justify-center gap-1">
                <p className="text-body-medium text-ink">The library is empty.</p>
                <p className="text-body-regular text-ink-2">
                  Retrieved chunks land here after a run.
                </p>
              </div>
            )}
          </Swap>
        </aside>
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-line px-4 py-3">
        <div className="min-w-0 flex-1 overflow-hidden text-body-regular" aria-live="polite">
          <Swap swapKey={footerKey} reduced={reducedMotion} className="truncate">
            {open ? (
              <>
                <span className="text-body-medium text-ink">
                  {openPinned ? "Pinned" : "Retrieved"}
                </span>
                <span className="text-ink-3"> · </span>
                <span className="text-ink-2">{open.title}</span>
              </>
            ) : (
              <span className="text-ink-2">No chunk open</span>
            )}
          </Swap>
        </div>
        <Button
          variant={openPinned ? "secondary" : "primary"}
          size="small"
          leadingIcon={openPinned ? X : undefined}
          onClick={togglePin}
          disabled={!open}
          className="shrink-0"
        >
          {openPinned ? "Remove from session" : "Pin to session"}
        </Button>
      </footer>
    </section>
  );
}
