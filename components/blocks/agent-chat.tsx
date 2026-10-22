"use client";

/**
 * PeachUI — AgentChat (block)
 * @tier block
 * @deps prompt-deck, agent-chat-reply
 * @requires app/globals.css
 *
 * Tray and thread: suggestion chips fill the prompt deck, then the run
 * and the reply stay in the same card. The composer does not change while
 * a reply is streaming.
 */

import { useRef, useState } from "react";
import { fadeUpStyle } from "@/components/lib/block-motion";
import { PromptDeck, type PromptDeckVariant } from "@/components/blocks/prompt-deck";
import { AgentChatReply } from "@/components/blocks/agent-chat-reply";
import {
  DEMO_ANSWER_TOKENS,
  DEMO_FOLLOW_UPS,
  DEMO_MORE_SOURCES,
  DEMO_RUN_STEPS,
  DEMO_SEARCH_QUERY,
  DEMO_SOURCE_PREVIEWS,
  DEMO_STREAM_SOURCES,
  DEMO_TRACE_SOURCES,
  DEMO_USER_PROMPT,
} from "@/components/data/agent-chat-demo-data";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

type ChatPhase = "idle" | "running" | "answered";

const SUGGESTIONS = [
  "Summarize yesterday's launch meeting",
  "Draft a reply to the customer note",
  "Plan the October launch",
] as const;

export type AgentChatProps = {
  className?: string;
  variant?: PromptDeckVariant;
};

export function AgentChat({ className, variant = "Pill" }: AgentChatProps) {
  const [phase, setPhase] = useState<ChatPhase>("idle");
  const [userMessage, setUserMessage] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [traceProgress, setTraceProgress] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [answeredInMs, setAnsweredInMs] = useState<number | undefined>();
  const [runId, setRunId] = useState(0);
  const [draftSeed, setDraftSeed] = useState<string | undefined>();
  const [draftSeedVersion, setDraftSeedVersion] = useState(0);
  const timersRef = useRef<number[]>([]);
  const elapsedTimerRef = useRef<number | null>(null);

  const clearTimers = () => {
    for (const id of timersRef.current) window.clearTimeout(id);
    timersRef.current = [];
  };

  const stopElapsed = () => {
    if (elapsedTimerRef.current) window.clearInterval(elapsedTimerRef.current);
    elapsedTimerRef.current = null;
  };

  const schedule = (fn: () => void, delay: number) => {
    const id = window.setTimeout(fn, delay);
    timersRef.current.push(id);
  };

  useMountEffect(() => {
    return () => {
      clearTimers();
      stopElapsed();
    };
  });

  const handleSend = (text: string) => {
    clearTimers();
    const prompt = text.trim() || DEMO_USER_PROMPT;
    setUserMessage(prompt);
    setRunId((id) => id + 1);
    setPhase("running");
    setStreaming(false);
    setTraceProgress(0);
    setElapsedMs(0);
    setAnsweredInMs(undefined);
    stopElapsed();
    const started = performance.now();
    elapsedTimerRef.current = window.setInterval(() => {
      setElapsedMs(Math.floor(performance.now() - started));
    }, 200);

    schedule(() => setTraceProgress(1), 400);
    schedule(() => setTraceProgress(2), 1000);
    schedule(() => setTraceProgress(3), 1800);
    schedule(() => setTraceProgress(4), 2600);

    const runMs = 3200;
    schedule(() => {
      stopElapsed();
      setPhase("answered");
      setAnsweredInMs(runMs);
      setStreaming(true);
    }, runMs);
  };

  const handleStreamDone = () => {
    setStreaming(false);
  };

  const fillDraft = (text: string) => {
    setDraftSeed(text);
    setDraftSeedVersion((version) => version + 1);
  };

  const handleFollowUp = (text: string) => {
    fillDraft(text);
  };

  return (
    <div className={cx("mx-auto w-full max-w-[680px]", className)}>
      <div className="rounded-[22px] bg-canvas p-1.5">
        <div className="flex h-[min(520px,56vh)] min-h-[300px] flex-col overflow-hidden rounded-card bg-surface shadow-hairline">
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-5">
            <div className="mx-auto flex w-full max-w-[640px] flex-col gap-5">
              {phase === "idle" && !userMessage ? (
                <div className="py-6">
                  <h2 className="text-section-title text-balance text-ink">What should we work on?</h2>
                  <p className="mt-2 max-w-[42ch] text-body text-pretty text-ink-3">
                    Pick a suggestion or write your own. The reply stays in this thread.
                  </p>
                </div>
              ) : null}

              {userMessage ? (
                <div className="flex justify-end pl-8" style={fadeUpStyle}>
                  <div className="max-w-[85%] rounded-panel bg-field px-3.5 py-2 text-body text-pretty text-ink shadow-hairline">
                    {userMessage}
                  </div>
                </div>
              ) : null}

              {phase !== "idle" ? (
                <AgentChatReply
                  key={runId}
                  phase={phase === "running" ? "running" : "answered"}
                  running={phase === "running"}
                  elapsedMs={elapsedMs}
                  settledMs={answeredInMs}
                  traceProgress={traceProgress}
                  searchQuery={DEMO_SEARCH_QUERY}
                  traceSources={DEMO_TRACE_SOURCES}
                  runSteps={DEMO_RUN_STEPS}
                  moreSourcesCount={DEMO_MORE_SOURCES}
                  sourcePreviews={DEMO_SOURCE_PREVIEWS}
                  answerTokens={DEMO_ANSWER_TOKENS}
                  streamSources={DEMO_STREAM_SOURCES}
                  followUps={[...DEMO_FOLLOW_UPS]}
                  answerStreamKey={runId}
                  streaming={streaming}
                  answeredInMs={answeredInMs}
                  onStreamDone={handleStreamDone}
                  onFollowUp={handleFollowUp}
                />
              ) : null}
            </div>
          </div>
        </div>

        <footer className="px-1 pb-1 pt-2">
          <div className="mb-2 flex flex-wrap gap-1.5" role="group" aria-label="Suggested prompts">
            {SUGGESTIONS.map((suggestion, index) => (
              <button
                key={suggestion}
                type="button"
                onClick={() => fillDraft(suggestion)}
                className="inline-flex min-h-8 items-center rounded-full bg-surface px-3 text-meta text-ink-2 shadow-hairline transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
                style={{ ...fadeUpStyle, animationDelay: `${index * 50}ms` }}
              >
                {suggestion}
              </button>
            ))}
          </div>
          <PromptDeck
            className="max-w-none"
            variant={variant}
            working={phase === "running"}
            workingLabel="Thinking"
            workingVariant="orbs"
            showConnectApps={false}
            draftSeed={draftSeed}
            draftSeedVersion={draftSeedVersion}
            onSend={(text) => handleSend(text)}
          />
        </footer>
      </div>
    </div>
  );
}
