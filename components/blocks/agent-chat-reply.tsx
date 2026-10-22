"use client";

/**
 * Assistant turn for agent chat — run trace, then streamed answer with sources.
 * @tier block
 * @deps agent-run-trace, agent-answer-turn
 */

import { useState } from "react";
import { AgentAnswerTurn } from "@/components/primitives/agent-answer-turn";
import type { AgentSourcePreview } from "@/components/primitives/agent-answer-turn";
import { AgentRunTrace } from "@/components/primitives/agent-run-trace";
import type { AgentRunTraceSource } from "@/components/primitives/agent-run-trace";
import type { StreamingSource, StreamingToken } from "@/components/primitives/streaming-text";
import { cx } from "@/lib/utils";

export type AgentChatReplyPhase = "running" | "answered";

export type AgentChatReplyProps = {
  className?: string;
  phase: AgentChatReplyPhase;
  running: boolean;
  elapsedMs: number;
  traceProgress: number;
  settledMs?: number;
  searchQuery?: string;
  traceSources: AgentRunTraceSource[];
  runSteps: string[];
  moreSourcesCount?: number;
  sourcePreviews: AgentSourcePreview[];
  answerTokens: StreamingToken[];
  streamSources: StreamingSource[];
  followUps?: string[];
  answerStreamKey?: number | string;
  streaming?: boolean;
  onStreamDone?: () => void;
  onFollowUp?: (text: string, index: number) => void;
  answeredInMs?: number;
};

export function AgentChatReply({
  className,
  phase,
  running,
  elapsedMs,
  traceProgress,
  settledMs,
  searchQuery,
  traceSources,
  runSteps,
  moreSourcesCount,
  sourcePreviews,
  answerTokens,
  streamSources,
  followUps,
  answerStreamKey,
  streaming,
  onStreamDone,
  onFollowUp,
  answeredInMs,
}: AgentChatReplyProps) {
  const [runExpanded, setRunExpanded] = useState(false);
  const showAnswer = phase === "answered";
  const runCollapsed = showAnswer && !running && !runExpanded;
  const showTrace = running || runExpanded;

  const workedSeconds = ((settledMs ?? elapsedMs) / 1000).toFixed(1);

  return (
    <div className={cx("min-w-0", className)} role="status" aria-live="polite">
      {runCollapsed ? (
        <button
          type="button"
          className="flex w-full items-center justify-between gap-3 rounded-control px-1 py-1 text-left transition-colors duration-150 hover:bg-hover"
          onClick={() => setRunExpanded(true)}
          aria-expanded={false}
        >
          <span className="text-meta font-medium text-ink-2">
            Worked for <span className="tabular-nums text-ink">{workedSeconds}</span>s
          </span>
          <span className="shrink-0 text-caption text-ink-3">Show run</span>
        </button>
      ) : null}

      {showTrace ? (
        <div className={runCollapsed ? "hidden" : undefined}>
          <AgentRunTrace
            running={running}
            elapsedMs={elapsedMs}
            settledMs={settledMs}
            progress={traceProgress}
            query={searchQuery}
            sources={traceSources}
            steps={runSteps}
            moreSourcesCount={moreSourcesCount}
            activeLabel="Thinking"
            thinkingOrbs
            doneLabel={(seconds) => `Worked for ${seconds.toFixed(1)}s`}
          />
          {showAnswer && runExpanded ? (
            <button
              type="button"
              className="mt-1 text-caption text-ink-3 transition-colors duration-150 hover:text-ink-2"
              onClick={() => setRunExpanded(false)}
            >
              Hide run
            </button>
          ) : null}
        </div>
      ) : null}

      {showAnswer ? (
        <div className={cx(showTrace || runCollapsed ? "mt-4" : "")}>
          <AgentAnswerTurn
            streamKey={answerStreamKey}
            streaming={streaming}
            tokens={answerTokens}
            sourcePreviews={sourcePreviews}
            streamSources={streamSources}
            followUps={followUps}
            answeredInMs={answeredInMs}
            onStreamDone={onStreamDone}
            onFollowUp={onFollowUp}
          />
        </div>
      ) : null}
    </div>
  );
}
