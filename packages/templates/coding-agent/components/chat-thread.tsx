"use client";

/**
 * Session thread — user bubbles, Peach Agent turns with run trace,
 * sub-agent chips, streamed answers, and review links into the workspace.
 */

import { ArrowRight, Check } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { Spinner } from "@/components/atoms/spinner";
import { StreamText } from "@/components/atoms/stream-text";
import { fadeInStyle, fadeUpStyle } from "@/components/lib/block-motion";
import { AgentRunTrace } from "@/components/primitives/agent-run-trace";
import { AgentThinking } from "@/components/primitives/agent-thinking";
import type { Turn } from "../data";

export type LiveRun = {
  turnId: string;
  running: boolean;
  progress: number;
  elapsedMs: number;
  settledMs?: number;
  streaming: boolean;
};

/** Sub-agents — spawn in order; last spawned spins while the run works. */
function AgentChips({ agents, spawned, settled }: { agents: string[]; spawned: number; settled: boolean }) {
  const visible = agents.slice(0, spawned);
  if (visible.length === 0) return null;
  return (
    <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-caption-1-regular">
      {visible.map((agent, index) => {
        const working = !settled && index === visible.length - 1;
        return (
          <span
            key={agent}
            className={working ? "inline-flex items-center gap-1.5 text-ink" : "inline-flex items-center gap-1.5 text-ink-2"}
            style={fadeInStyle}
          >
            {working ? <Spinner tone="ink" className="size-2.5" /> : <Check className="size-3 shrink-0 text-ink-3" aria-hidden />}
            {agent}
          </span>
        );
      })}
    </div>
  );
}

function UserTurn({ text }: { text: string }) {
  return (
    <div className="flex justify-end pl-8" style={fadeUpStyle}>
      <div className="max-w-[85%] rounded-panel bg-inset px-3.5 py-2 text-body text-pretty text-ink">
        {text}
      </div>
    </div>
  );
}

function AgentTurnView({
  turn,
  live,
  onStreamDone,
  onStreamTick,
  onReview,
}: {
  turn: Extract<Turn, { role: "agent" }>;
  live?: LiveRun;
  onStreamDone: () => void;
  onStreamTick: () => void;
  onReview: () => void;
}) {
  const isLive = live?.turnId === turn.id;
  const running = isLive && live.running;
  const progress = isLive ? live.progress : 4;
  // Sub-agents trickle in as the trace advances; canned turns show all done.
  const spawned = !turn.run ? 0 : isLive ? Math.min(turn.run.agents.length, Math.max(0, progress - 1)) : turn.run.agents.length;
  const settled = !running;
  const answerVisible = !isLive || (!live.running && turn.text.length > 0);

  return (
    <div className="min-w-0" style={fadeUpStyle}>
      {turn.run ? (
        <div>
          <AgentRunTrace
            running={running}
            elapsedMs={isLive ? live.elapsedMs : 0}
            settledMs={isLive ? live.settledMs : undefined}
            progress={progress}
            query={turn.run.query}
            sources={turn.run.sources}
            steps={turn.run.steps}
            activeLabel="Working"
            doneLabel={(seconds) => `Worked for ${turn.run ? turn.run.workedFor : seconds.toFixed(1) + "s"}`}
          />
          <AgentChips agents={turn.run.agents} spawned={spawned} settled={settled} />
        </div>
      ) : null}

      {running ? (
        <div className="mt-1.5" style={fadeUpStyle}>
          <AgentThinking
            variant="wave"
            tone="subtle"
            label="Thinking"
            labelClassName="text-caption-1-medium"
          />
        </div>
      ) : null}

      {answerVisible ? (
        <div className="mt-2 text-body text-pretty text-ink">
          {isLive && live.streaming ? (
            <StreamText text={turn.text} charsPerTick={3} tickMs={14} onDone={onStreamDone} onProgress={onStreamTick} caret={false} />
          ) : (
            turn.text
          )}
        </div>
      ) : null}

      {turn.reviewLink && (!isLive || settled) ? (
        <Button
          variant="secondary"
          size="small"
          trailingIcon={ArrowRight}
          onClick={onReview}
          className="mt-3"
        >
          Review changes
        </Button>
      ) : null}
    </div>
  );
}

export function ChatThread({
  turns,
  live,
  onStreamDone,
  onStreamTick,
  onReview,
}: {
  turns: Turn[];
  live?: LiveRun;
  onStreamDone: () => void;
  onStreamTick: () => void;
  onReview: () => void;
}) {
  return (
    <div className="mx-auto flex w-full max-w-[680px] flex-col gap-5 px-4 py-5">
      {turns.map((turn) =>
        turn.role === "user" ? (
          <UserTurn key={turn.id} text={turn.text} />
        ) : (
          <AgentTurnView
            key={turn.id}
            turn={turn}
            live={live}
            onStreamDone={onStreamDone}
            onStreamTick={onStreamTick}
            onReview={onReview}
          />
        ),
      )}
    </div>
  );
}
