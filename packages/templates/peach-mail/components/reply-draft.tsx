"use client";

/**
 * Agent zone: the draft the agent wrote, ready for a human to send.
 * Streams via StreamText while drafting; Edit swaps in a textarea.
 */

import { useState } from "react";
import { PenSparkle, Refresh, Send } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { StreamText } from "@/components/atoms/stream-text";
import { Textarea } from "@/components/atoms/textarea";
import { cx } from "@/lib/utils";

export type DraftPhase = "streaming" | "ready";

export function ReplyDraft({
  phase,
  hint,
  text,
  streamKey,
  onStreamDone,
  onRegenerate,
  onSend,
  onDismiss,
}: {
  phase: DraftPhase;
  /** Why the agent wrote it this way, e.g. "Cites metered billing". */
  hint?: string;
  text: string;
  /** Changes when the same text should stream again (regenerate). */
  streamKey?: number | string;
  onStreamDone?: () => void;
  onRegenerate?: () => void;
  onSend: (body: string) => void;
  onDismiss?: () => void;
}) {
  const [editing, setEditing] = useState(false);
  const [edited, setEdited] = useState(text);
  const streaming = phase === "streaming";

  return (
    <article
      aria-label="Draft reply"
      className="rounded-panel border border-line bg-surface shadow-hairline"
    >
      <div className="flex items-center gap-2 border-b border-line-soft px-3 py-2">
        <PenSparkle className="size-3.5 shrink-0 text-violet" aria-hidden />
        <span className="min-w-0 flex-1 truncate text-caption-1-regular text-ink-3">
          <span className="text-caption-1-medium text-ink">Drafted by Peach Agent</span>
          {hint ? <span aria-hidden> · {hint}</span> : null}
        </span>
        {streaming ? (
          <span className="shrink-0 text-caption-2-medium text-violet">Drafting…</span>
        ) : null}
      </div>

      <div className="px-3 py-2.5">
        {editing ? (
          <Textarea
            aria-label="Edit draft reply"
            value={edited}
            onChange={setEdited}
            rows={6}
            autoResize
            fieldClassName="bg-canvas"
          />
        ) : streaming ? (
          <p className="text-body-regular text-ink">
            <StreamText
              key={`${streamKey ?? 0}-${text}`}
              text={text}
              charsPerTick={4}
              onDone={onStreamDone}
            />
          </p>
        ) : (
          <p className="whitespace-pre-line text-body-regular text-pretty text-ink">
            {edited}
          </p>
        )}
      </div>

      <div className="flex flex-wrap items-center justify-end gap-1.5 border-t border-line-soft px-3 py-2">
        {editing ? (
          <>
            <Button variant="ghost" size="small" onClick={() => { setEdited(text); setEditing(false); }}>
              Cancel
            </Button>
            <Button variant="secondary" size="small" onClick={() => setEditing(false)}>
              Done editing
            </Button>
          </>
        ) : (
          <>
            <Button
              variant="ghost"
              size="small"
              leadingIcon={Refresh}
              disabled={streaming}
              onClick={() => { setEdited(text); onRegenerate?.(); }}
            >
              Regenerate
            </Button>
            <Button
              variant="secondary"
              size="small"
              disabled={streaming}
              onClick={() => { setEdited(text); setEditing(true); }}
            >
              Edit
            </Button>
            {onDismiss ? (
              <Button variant="secondary" size="small" disabled={streaming} onClick={onDismiss}>
                Dismiss
              </Button>
            ) : null}
            <Button
              variant="primary"
              size="small"
              leadingIcon={Send}
              disabled={streaming}
              onClick={() => onSend(edited)}
              className={cx(streaming && "opacity-60")}
            >
              Approve &amp; send
            </Button>
          </>
        )}
      </div>
    </article>
  );
}
