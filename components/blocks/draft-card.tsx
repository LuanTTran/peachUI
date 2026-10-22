"use client";

/**
 * PeachUI — DraftCard (block)
 * @tier block
 * @deps button, stream-text, agent-inline-chips
 * @requires app/globals.css
 *
 * AI-suggested edits: inline track changes, accept or reject.
 */

import { useState } from "react";
import { ChevronLeft, ChevronRight, ImageSparkle } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { StreamText } from "@/components/atoms/stream-text";
import { EditChip } from "@/components/primitives/agent-inline-chips";
import { cx } from "@/lib/utils";

export type DraftEditPart =
  | { type: "text"; value: string }
  | { type: "remove"; value: string }
  | { type: "add"; value: string };

export type DraftSuggestion = {
  id: string;
  parts: DraftEditPart[];
};

export type DraftCardLabels = {
  suggestedBy: (hint: string) => string;
  suggestions: (count: number) => string;
  rejectAll: string;
  acceptAll: string;
  accept: string;
  reject: string;
  streamingLead: string;
};

export const defaultDraftCardLabels: DraftCardLabels = {
  suggestedBy: (hint) => `Suggested by AI · ${hint}`,
  suggestions: (count) => (count === 1 ? "1 suggestion" : `${count} suggestions`),
  rejectAll: "Reject all",
  acceptAll: "Accept all",
  accept: "Accept",
  reject: "Reject",
  streamingLead: "Updating draft…",
};

export type DraftCardVariant = "standalone" | "embedded";

export type DraftCardProps = {
  className?: string;
  variant?: DraftCardVariant;
  hint?: string;
  suggestions?: DraftSuggestion[];
  defaultIndex?: number;
  streaming?: boolean;
  streamText?: string;
  streamKey?: number | string;
  onStreamDone?: () => void;
  labels?: Partial<DraftCardLabels>;
  onAcceptAll?: () => void;
  onRejectAll?: () => void;
  onAcceptOne?: (id: string) => void;
  onRejectOne?: (id: string) => void;
};

const DEFAULT_SUGGESTIONS: DraftSuggestion[] = [
  {
    id: "shorter",
    parts: [
      { type: "text", value: "The October release is " },
      { type: "remove", value: "now available" },
      { type: "add", value: "live" },
      { type: "text", value: " for every workspace on your plan." },
    ],
  },
];

function renderParts(parts: DraftEditPart[]) {
  return parts.map((part, index) => {
    if (part.type === "text") return <span key={index}>{part.value}</span>;
    if (part.type === "remove") {
      return (
        <EditChip key={index} kind="remove">
          {part.value}
        </EditChip>
      );
    }
    return (
      <EditChip key={index} kind="add">
        {part.value}
      </EditChip>
    );
  });
}

export function DraftCard({
  className,
  variant = "standalone",
  hint = "Make it shorter",
  suggestions = DEFAULT_SUGGESTIONS,
  defaultIndex = 0,
  streaming = false,
  streamText,
  streamKey,
  onStreamDone,
  labels: labelsProp,
  onAcceptAll,
  onRejectAll,
  onAcceptOne,
  onRejectOne,
}: DraftCardProps) {
  const labels = { ...defaultDraftCardLabels, ...labelsProp };
  const [index, setIndex] = useState(defaultIndex);
  const [focusToolbar, setFocusToolbar] = useState(false);
  const embedded = variant === "embedded";
  const current = suggestions[index] ?? suggestions[0];
  const count = suggestions.length;

  const goPrev = () => setIndex((i) => (i <= 0 ? count - 1 : i - 1));
  const goNext = () => setIndex((i) => (i >= count - 1 ? 0 : i + 1));

  return (
    <article
      className={cx(
        embedded ? "w-full" : "w-full max-w-[520px] rounded-card border border-line bg-canvas p-1 shadow-card",
        className,
      )}
    >
      <div className="flex items-center gap-2 px-2 py-2 text-caption text-ink-3">
        <ImageSparkle className="size-3.5 shrink-0 text-ink-2" aria-hidden />
        <span className="text-pretty">{labels.suggestedBy(hint)}</span>
      </div>

      <div className="rounded-panel border border-line bg-surface px-3 py-3 shadow-hairline">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line-soft pb-3">
          <div className="flex items-center gap-2">
            <span
              className="flex size-6 items-center justify-center rounded-full bg-green-muted text-caption font-semibold tabular-nums text-green"
              aria-hidden
            >
              {count}
            </span>
            <span className="text-body-strong text-ink">{labels.suggestions(count)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              type="button"
              aria-label="Previous suggestion"
              onClick={goPrev}
              className="flex size-8 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink button-press-motion"
            >
              <ChevronLeft className="size-4" aria-hidden />
            </button>
            <button
              type="button"
              aria-label="Next suggestion"
              onClick={goNext}
              className="flex size-8 items-center justify-center rounded-control text-ink-3 transition-colors duration-150 hover:bg-hover hover:text-ink button-press-motion"
            >
              <ChevronRight className="size-4" aria-hidden />
            </button>
          </div>
          <div className="flex w-full flex-wrap justify-end gap-2 sm:ml-auto sm:w-auto">
            <Button type="button" variant="secondary" size="small" onClick={onRejectAll}>
              {labels.rejectAll}
            </Button>
            <Button type="button" variant="primary" size="small" onClick={onAcceptAll}>
              {labels.acceptAll}
            </Button>
          </div>
        </div>

        <div
          className="relative mt-3 text-body text-pretty text-ink"
          onFocus={() => setFocusToolbar(true)}
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setFocusToolbar(false);
          }}
        >
          {streaming && streamText ? (
            <p>
              <span className="text-ink-3">{labels.streamingLead} </span>
              <StreamText
                key={streamKey ?? streamText}
                text={streamText}
                className="text-body text-ink"
                onDone={onStreamDone}
              />
            </p>
          ) : current ? (
            <p>{renderParts(current.parts)}</p>
          ) : null}

          {focusToolbar && current && !streaming ? (
            <div
              className="absolute left-1/2 top-full z-10 mt-2 flex -translate-x-1/2 items-center gap-0 rounded-full bg-ink px-1 py-1 text-caption text-canvas shadow-overlay"
              role="toolbar"
              aria-label="Edit actions"
            >
              <button
                type="button"
                className="rounded-full px-2.5 py-1 transition-colors duration-150 hover:bg-hover/20"
                onClick={() => onAcceptOne?.(current.id)}
              >
                {labels.accept} <span className="text-ink-3">Y</span>
              </button>
              <span className="h-4 w-px bg-canvas/20" aria-hidden />
              <button
                type="button"
                className="rounded-full px-2.5 py-1 transition-colors duration-150 hover:bg-hover/20"
                onClick={() => onRejectOne?.(current.id)}
              >
                {labels.reject} <span className="text-ink-3">N</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </article>
  );
}
