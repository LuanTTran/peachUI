"use client";


import { useRef, useState } from "react";
import { ShimmerText } from "@/components/primitives/agent-log";
import { AgentThinkingOrbs } from "@/components/primitives/agent-thinking";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type AgentRunTraceSource = {
  id: string;
  label: string;
  href?: string;
};

export type AgentRunTraceProps = {
  className?: string;
  running: boolean;
  elapsedMs: number;
  settledMs?: number;
  progress: number;
  searchLabel?: string;
  query?: string;
  sources?: AgentRunTraceSource[];
  steps?: string[];
  moreSourcesCount?: number;
  activeLabel?: string;
  /** Show drifting orbs beside the shimmered activeLabel while running. */
  thinkingOrbs?: boolean;
  doneLabel?: (seconds: number) => string;
  finishedLabel?: string;
};

const EASE = "cubic-bezier(0.22, 1, 0.36, 1)";

function GlobeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden>
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 12h17M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function Chevron({ open }: { open: boolean }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="shrink-0 text-ink-3 transition-transform duration-300"
      style={{ transform: open ? "rotate(180deg)" : "rotate(0deg)" }}
      aria-hidden
    >
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

export function AgentRunTrace({
  className,
  running,
  elapsedMs,
  settledMs,
  progress,
  searchLabel = "Searched",
  query,
  sources = [],
  steps = [],
  moreSourcesCount = 0,
  activeLabel = "Thinking",
  thinkingOrbs = false,
  doneLabel = (seconds) => `Worked for ${seconds.toFixed(1)}s`,
  finishedLabel = "Finished thinking",
}: AgentRunTraceProps) {
  const [manualExpanded, setManualExpanded] = useState<boolean | null>(null);
  const traceRef = useRef<HTMLDivElement>(null);
  const [lineHeight, setLineHeight] = useState(0);

  const working = running;
  const autoExpanded = working || progress > 0;
  const expanded = manualExpanded ?? autoExpanded;

  const showSearch = progress >= 1 && sources.length > 0;
  const visibleSources = showSearch ? Math.min(sources.length, Math.max(1, progress)) : 0;
  const visibleSteps =
    progress < 2 ? 0 : progress === 2 ? Math.min(1, steps.length) : progress === 3 ? Math.min(3, steps.length) : steps.length;

  const seconds = (settledMs ?? elapsedMs) / 1000;
  const headerDone = !working;

  useMountEffect(() => {
    const trace = traceRef.current;
    if (!trace) return;
    const observer = new ResizeObserver(() => setLineHeight(trace.offsetHeight));
    observer.observe(trace);
    return () => observer.disconnect();
  });

  return (
    <div className={cx("flex w-full min-w-0 flex-col", className)}>
      <button
        type="button"
        aria-expanded={expanded}
        onClick={() => setManualExpanded((current) => !(current ?? autoExpanded))}
        className="-ms-1.5 flex w-fit max-w-full items-center gap-2 rounded-control px-1.5 py-1 text-left transition-colors duration-150 hover:bg-hover"
      >
        <Chevron open={expanded} />
        <span role="status" className="min-w-0">
          {headerDone ? (
            <span className="text-meta font-medium text-ink-2" style={{ animation: "fade-in 350ms ease-out both" }}>
              {doneLabel(seconds)}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {thinkingOrbs ? <AgentThinkingOrbs className="text-ink-2" /> : null}
              <ShimmerText className="text-meta font-medium whitespace-nowrap">
                {activeLabel}
              </ShimmerText>
            </span>
          )}
        </span>
      </button>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-[380ms]"
        style={{
          gridTemplateRows: expanded ? "1fr" : "0fr",
          opacity: expanded ? 1 : 0,
          transitionTimingFunction: EASE,
        }}
      >
        <div className="overflow-hidden">
          <div className="relative mt-1 ms-[5px] ps-4">
            <span
              aria-hidden
              className="absolute start-[3px] w-px bg-line"
              style={{
                top: -8,
                height: lineHeight ? lineHeight - 2 : 0,
                transition: `height 500ms ${EASE}`,
              }}
            />
            <div ref={traceRef} className="flex flex-col gap-2 py-1">
              {showSearch ? (
                <div style={{ animation: `fade-up 300ms ${EASE} both` }}>
                  <div className="flex min-h-7 items-center gap-2 px-1.5 text-meta font-medium text-ink">
                    <span className="text-ink-3">
                      <GlobeIcon />
                    </span>
                    {searchLabel}
                  </div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5 px-0.5">
                    {sources.slice(0, visibleSources).map((source, index) => (
                      <a
                        key={source.id}
                        href={source.href}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex max-w-full min-h-7 items-center rounded-full bg-inset px-2.5 py-1 text-caption text-ink shadow-hairline transition-colors duration-150 hover:bg-hover hover:text-ink"
                        style={{ animation: `fade-up 280ms ${EASE} ${index * 60}ms both` }}
                      >
                        <span className="truncate">{source.label}</span>
                      </a>
                    ))}
                    {moreSourcesCount > 0 && progress >= 3 ? (
                      <span className="self-center px-1 text-caption text-ink-3" style={{ animation: "fade-in 300ms ease-out both" }}>
                        +{moreSourcesCount} more
                      </span>
                    ) : null}
                  </div>
                  {query ? (
                    <p className="mt-2 px-1.5 text-caption text-pretty text-ink-3">{query}</p>
                  ) : null}
                </div>
              ) : null}

              {steps.slice(0, visibleSteps).map((step, index) => {
                const isLast = index === visibleSteps - 1;
                const stepDone = !working || !isLast;
                return (
                  <div
                    key={step}
                    className="flex min-h-7 items-center gap-2 rounded-control px-1.5 py-0.5"
                    style={{ animation: `fade-up 320ms ${EASE} ${index * 70}ms both` }}
                  >
                    {stepDone ? (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
                        <path d="M20 6L9 17l-5-5" />
                      </svg>
                    ) : (
                      <span
                        className="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong border-t-ink-2"
                        style={{ animation: "spin 700ms linear infinite" }}
                        aria-hidden
                      />
                    )}
                    <span className="min-w-0 text-caption text-pretty text-ink-2">{step}</span>
                  </div>
                );
              })}

              {!working && progress >= 1 ? (
                <div
                  className="flex min-h-7 items-center gap-2 px-1.5 py-0.5"
                  style={{ animation: `fade-up 320ms ${EASE} both` }}
                >
                  <span className="flex size-4 shrink-0 items-center justify-center rounded-full bg-accent text-on-accent" aria-hidden>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 6L9 17l-5-5" />
                    </svg>
                  </span>
                  <span className="text-caption font-medium text-ink">{finishedLabel}</span>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
