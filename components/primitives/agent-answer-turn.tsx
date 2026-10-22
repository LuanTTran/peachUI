"use client";


import { StreamingText, type StreamingSource, type StreamingToken } from "@/components/primitives/streaming-text";
import { cx } from "@/lib/utils";

export type AgentSourcePreview = {
  id: string;
  index: number;
  title: string;
  snippet: string;
  host: string;
  href: string;
};

export type AgentAnswerTurnProps = {
  className?: string;
  streamKey?: number | string;
  streaming?: boolean;
  tokens: StreamingToken[];
  sourcePreviews: AgentSourcePreview[];
  streamSources: StreamingSource[];
  followUps?: string[];
  answeredInMs?: number;
  onStreamDone?: () => void;
  onFollowUp?: (text: string, index: number) => void;
};

function AssistantMark() {
  return (
    <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-[9px] bg-ink text-surface shadow-hairline" aria-hidden>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
        <path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z" />
      </svg>
    </span>
  );
}

export function AgentAnswerTurn({
  className,
  streamKey,
  streaming = false,
  tokens,
  sourcePreviews,
  streamSources,
  followUps = [],
  answeredInMs,
  onStreamDone,
  onFollowUp,
}: AgentAnswerTurnProps) {
  const sourceCount = streamSources.length;

  return (
    <article className={cx("flex min-w-0 gap-3", className)} style={{ animation: "fade-up 400ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
      <AssistantMark />
      <div className="min-w-0 flex-1">
        <div className="flex gap-2 overflow-x-auto pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {sourcePreviews.map((source) => (
            <a
              key={source.id}
              href={source.href}
              target="_blank"
              rel="noreferrer"
              className="flex w-[min(100%,200px)] shrink-0 flex-col gap-1 rounded-panel border border-line bg-inset p-2.5 shadow-hairline transition-colors duration-150 hover:bg-hover"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="line-clamp-2 text-caption font-medium text-pretty text-ink">{source.title}</span>
                <span className="shrink-0 font-mono text-[10px] tabular-nums text-ink-3">{source.index}</span>
              </div>
              <p className="line-clamp-2 text-[11px] leading-snug text-pretty text-ink-3">{source.snippet}</p>
              <span className="truncate font-mono text-[10px] text-ink-3">{source.host}</span>
            </a>
          ))}
        </div>

        <div className="mt-3 flex items-center gap-2">
          <span className="text-meta font-medium text-ink-2">Answer</span>
        </div>

        <StreamingText
          key={streamKey}
          className="mt-1.5 max-w-none"
          content={tokens}
          sources={streamSources}
          followUps={followUps}
          loop={false}
          labels={{
            sources: sourceCount === 1 ? "1 source" : `${sourceCount} sources`,
            followUps: "Related",
            copy: "Copy reply",
            retry: "Regenerate",
          }}
          onDone={onStreamDone}
          onFollowUp={onFollowUp}
        />

        {answeredInMs !== undefined ? (
          <p className="mt-3 text-end text-caption tabular-nums text-ink-3">
            Answered in {(answeredInMs / 1000).toFixed(1)}s
          </p>
        ) : null}
      </div>
    </article>
  );
}
