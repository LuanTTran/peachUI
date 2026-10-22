"use client";


import { useRef, useState, type ReactNode } from "react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const WORD_MS = 55;
const HOLD_MS = 3400;

export type StreamingToken = { text: string; cite?: boolean; citeIndex?: number; citeSuffix?: string };

export type StreamingSource = {
  name: string;
  domain: string;
  href: string;
};

export type StreamingTextLabels = {
  sources: string;
  followUps: string;
  copy: string;
  retry: string;
};

const DEFAULT_CONTENT: StreamingToken[] = [
  ..."The launch meeting settled October 21 as the send date. Three customers asked for a shorter onboarding."
    .split(" ")
    .map((text) => ({ text })),
  { text: "", cite: true },
  ..."The reply draft is ready for review.".split(" ").map((text) => ({ text })),
];

const DEFAULT_SOURCES: StreamingSource[] = [
  { name: "Launch meeting notes", domain: "notes.peach-ui.dev", href: "https://notes.peach-ui.dev/" },
  { name: "Customer questions", domain: "studio.peach-ui.dev", href: "https://studio.peach-ui.dev/" },
  { name: "Pricing draft", domain: "docs.peach-ui.dev", href: "https://docs.peach-ui.dev/" },
];

const DEFAULT_FOLLOW_UPS = ["Summarize the customer notes", "Draft the launch reply"];

const DEFAULT_LABELS: StreamingTextLabels = {
  sources: "3 sources",
  followUps: "Follow-ups",
  copy: "Copy reply",
  retry: "Try again",
};

function Mark({ children }: { children: ReactNode }) {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      {children}
    </svg>
  );
}

export type StreamingTextProps = {
  content?: StreamingToken[];
  sources?: StreamingSource[];
  followUps?: string[];
  labels?: Partial<StreamingTextLabels>;
  loop?: boolean;
  className?: string;
  onDone?: () => void;
  onFollowUp?: (text: string, index: number) => void;
};

export function StreamingText({
  content = DEFAULT_CONTENT,
  sources = DEFAULT_SOURCES,
  followUps = DEFAULT_FOLLOW_UPS,
  labels,
  loop = true,
  className,
  onDone,
  onFollowUp,
}: StreamingTextProps) {
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [count, setCount] = useState(0);
  const [sourcesOpen, setSourcesOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const countRef = useRef(0);
  const onDoneRef = useRef(onDone);
  const contentRef = useRef(content);
  const loopRef = useRef(loop);
  const restartRef = useRef<() => void>(() => {});
  onDoneRef.current = onDone;
  contentRef.current = content;
  loopRef.current = loop;

  const done = count >= content.length;
  const citeSource = (index: number) => sources[index] ?? sources[0];

  useMountEffect(() => {
    let timer = 0;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const step = () => {
      const length = contentRef.current.length;
      const finished = countRef.current >= length;
      timer = window.setTimeout(() => {
        if (finished && !loopRef.current) {
          onDoneRef.current?.();
          return;
        }
        const next = finished ? 0 : countRef.current + 1;
        countRef.current = next;
        setCount(next);
        if (!loopRef.current && next >= length) {
          onDoneRef.current?.();
          return;
        }
        if (finished) setSourcesOpen(false);
        step();
      }, finished ? HOLD_MS : WORD_MS);
    };

    const begin = () => {
      window.clearTimeout(timer);
      setSourcesOpen(false);
      if (reduced) {
        const length = contentRef.current.length;
        countRef.current = length;
        setCount(length);
        onDoneRef.current?.();
        return;
      }
      countRef.current = 0;
      setCount(0);
      step();
    };

    restartRef.current = begin;
    begin();
    return () => window.clearTimeout(timer);
  });

  const copyReply = () => {
    const text = content.map((token) => (token.cite ? "" : token.text)).join(" ").replace(/\s+/g, " ").trim();
    void navigator.clipboard?.writeText(text).then(() => setCopied(true));
  };

  return (
    <div className={cx("w-full max-w-xl", className)}>
      <p className="text-body text-pretty leading-relaxed text-ink">
        {content.slice(0, count).map((token, index) => {
          if (token.cite) {
            const cited = citeSource(token.citeIndex ?? 0);
            if (!cited) return null;
            const chipLabel = cited.name + (token.citeSuffix ?? "");
            return (
              <a
                key={index}
                href={cited.href}
                target="_blank"
                rel="noreferrer"
                className="mx-0.5 inline-flex h-5 max-w-[12rem] translate-y-[-1px] items-center truncate rounded-full bg-inset px-2 align-middle text-[11px] font-medium text-ink-2 shadow-hairline transition-colors duration-150 hover:bg-hover hover:text-ink"
                style={{ animation: "pop-in 250ms cubic-bezier(0.22, 1, 0.36, 1) both" }}
              >
                {chipLabel}
              </a>
            );
          }
          return <span key={index}>{token.text} </span>;
        })}
        {done ? null : (
          <span
            className="ml-0.5 inline-block h-3 w-0.5 translate-y-0.5 rounded-full bg-ink"
            style={{ animation: "caret-blink 1.06s step-end infinite" }}
            aria-hidden
          />
        )}
      </p>

      <div
        className="mt-2 flex items-center gap-0.5 transition-opacity duration-300"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        <button
          type="button"
          aria-label={copied ? "Copied" : copy.copy}
          onClick={copyReply}
          className="flex size-7 items-center justify-center rounded-control text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
        >
          <Mark>
            <rect x="9" y="9" width="12" height="12" rx="2.5" />
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
          </Mark>
        </button>
        <button
          type="button"
          aria-label={copy.retry}
          onClick={() => {
            setCopied(false);
            restartRef.current();
          }}
          className="flex size-7 items-center justify-center rounded-control text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]"
        >
          <Mark>
            <path d="M21 12a9 9 0 1 1-2.64-6.36M21 3v6h-6" />
          </Mark>
        </button>
        <button
          type="button"
          aria-expanded={sourcesOpen}
          onClick={() => setSourcesOpen((current) => !current)}
          className="ml-1 inline-flex min-h-7 items-center rounded-control px-1.5 text-caption text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
        >
          {copy.sources}
        </button>
      </div>

      <div
        className="grid transition-[grid-template-rows,opacity] duration-300 ease-out"
        style={{
          gridTemplateRows: done && sourcesOpen ? "1fr" : "0fr",
          opacity: done && sourcesOpen ? 1 : 0,
        }}
      >
        <div className="overflow-hidden">
          <ul className="mt-1.5 flex flex-col rounded-panel bg-inset p-1 shadow-hairline">
            {sources.map((source) => (
              <li key={source.domain}>
                <a
                  href={source.href}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 rounded-control px-1.5 py-1 text-meta text-ink-2 transition-colors duration-150 hover:bg-hover hover:text-ink"
                >
                  <span className="min-w-0 truncate">{source.name}</span>
                  <span className="ml-auto shrink-0 font-mono text-[11px] text-ink-3">{source.domain}</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div
        className="mt-2.5 transition-opacity duration-300"
        style={{ opacity: done ? 1 : 0, pointerEvents: done ? "auto" : "none" }}
      >
        <p className="text-meta font-medium text-ink-2">{copy.followUps}</p>
        <div className="mt-0.5 flex flex-col">
          {followUps.map((text, index) => (
            <button
              key={text}
              type="button"
              onClick={() => onFollowUp?.(text, index)}
              className="flex min-h-9 w-full items-center justify-between gap-2 border-b border-line-soft px-1.5 py-2 text-left text-meta text-pretty text-ink transition-colors duration-150 last:border-b-0 hover:bg-hover"
              style={
                done
                  ? { animation: `fade-up 350ms cubic-bezier(0.22, 1, 0.36, 1) ${index * 90}ms both` }
                  : { opacity: 0 }
              }
            >
              <span className="min-w-0">{text}</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="var(--ink-3)" strokeWidth="2" strokeLinecap="round" aria-hidden className="shrink-0">
                <path d="M5 12h14M13 6l6 6-6 6" />
              </svg>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
