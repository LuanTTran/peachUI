"use client";

/**
 * PeachUI — AnswerSheet (block)
 * @tier block
 * @deps button, tooltip
 * @requires app/globals.css
 */

import { Button } from "@/components/atoms/button";
import { StreamText } from "@/components/atoms/stream-text";
import { Tooltip, TooltipTrigger } from "@/components/atoms/tooltip";
import { cx } from "@/lib/utils";

export type AnswerCitation = {
  id: string;
  index: number;
  label: string;
  host?: string;
  preview?: string;
};

export type AnswerFeedback = "wrong" | "too-long" | "stale";

export type AnswerSheetLabels = {
  copy: string;
  copied: string;
  regenerate: string;
  feedbackWrong: string;
  feedbackTooLong: string;
  feedbackStale: string;
  citationPrefix: string;
};

export const defaultAnswerSheetLabels: AnswerSheetLabels = {
  copy: "Copy reply",
  copied: "Copied",
  regenerate: "Regenerate",
  feedbackWrong: "Wrong",
  feedbackTooLong: "Too long",
  feedbackStale: "Out of date",
  citationPrefix: "Source",
};

export type AnswerSheetVariant = "standalone" | "embedded";

export type AnswerSheetProps = {
  className?: string;
  variant?: AnswerSheetVariant;
  content: string;
  /** Remount StreamText when this changes. */
  streamKey?: number | string;
  streaming?: boolean;
  onStreamDone?: () => void;
  citations?: AnswerCitation[];
  feedback?: AnswerFeedback | null;
  onCopy?: () => void;
  onRegenerate?: () => void;
  onFeedback?: (value: AnswerFeedback) => void;
  labels?: Partial<AnswerSheetLabels>;
  copied?: boolean;
  answeredInMs?: number;
};

const FEEDBACK_OPTIONS: { id: AnswerFeedback; labelKey: keyof AnswerSheetLabels }[] = [
  { id: "wrong", labelKey: "feedbackWrong" },
  { id: "too-long", labelKey: "feedbackTooLong" },
  { id: "stale", labelKey: "feedbackStale" },
];

export function AnswerSheet({
  className,
  variant = "standalone",
  content,
  streamKey,
  streaming = false,
  onStreamDone,
  citations = [],
  feedback,
  onCopy,
  onRegenerate,
  onFeedback,
  labels: labelsProp,
  copied = false,
  answeredInMs,
}: AnswerSheetProps) {
  const labels = { ...defaultAnswerSheetLabels, ...labelsProp };

  const embedded = variant === "embedded";

  return (
    <article
      className={cx(
        embedded ? "bg-transparent p-4 pt-3" : "rounded-card border border-line bg-surface p-4 shadow-card",
        className,
      )}
    >
      <div className="text-body text-pretty text-ink">
        {streaming && content ? (
          <StreamText
            key={streamKey ?? content}
            text={content}
            className="text-body text-pretty text-ink"
            onDone={onStreamDone}
          />
        ) : (
          content
        )}
      </div>

      {citations.length > 0 && !streaming ? (
        <div className="mt-3 flex flex-wrap gap-1.5" role="list">
          {citations.map((c) => (
            <TooltipTrigger key={c.id} delay={0}>
              <button
                type="button"
                role="listitem"
                className="inline-flex items-center gap-1 rounded-md bg-accent-muted px-2 py-0.5 text-caption font-medium text-ink transition-[background-color] duration-150 hover:bg-hover"
              >
                <span className="tabular-nums text-accent-ink">[{c.index}]</span>
                <span className="max-w-[10rem] truncate">{c.label}</span>
              </button>
              <Tooltip className="max-w-xs text-pretty">
                <span className="block font-medium">{labels.citationPrefix} {c.index}</span>
                {c.host ? <span className="block text-ink-3">{c.host}</span> : null}
                {c.preview ? <span className="mt-1 block">{c.preview}</span> : null}
              </Tooltip>
            </TooltipTrigger>
          ))}
        </div>
      ) : null}

      <div
        className={cx(
          "mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line-soft pt-3 transition-opacity duration-300",
          streaming && "pointer-events-none opacity-0",
        )}
      >
        <div className="flex flex-wrap gap-2">
          {onCopy ? (
            <Button type="button" variant="secondary" size="small" onClick={onCopy}>
              {copied ? labels.copied : labels.copy}
            </Button>
          ) : null}
          {onRegenerate ? (
            <Button type="button" variant="ghost" size="small" onClick={onRegenerate}>
              {labels.regenerate}
            </Button>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {onFeedback ? (
            <div className="flex flex-wrap items-center gap-1" role="group" aria-label="Rate this reply">
              {FEEDBACK_OPTIONS.map((opt) => {
                const selected = feedback === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => onFeedback(opt.id)}
                    className={cx(
                      "rounded-md px-2 py-1 text-caption font-medium transition-[background-color,color] duration-150",
                      selected ? "bg-inset text-ink shadow-hairline" : "text-ink-3 hover:bg-hover hover:text-ink-2",
                    )}
                  >
                    {labels[opt.labelKey]}
                  </button>
                );
              })}
            </div>
          ) : null}
          {answeredInMs !== undefined ? (
            <span className="text-caption tabular-nums text-ink-3">
              Answered in {(answeredInMs / 1000).toFixed(1)}s
            </span>
          ) : null}
        </div>
      </div>
    </article>
  );
}
