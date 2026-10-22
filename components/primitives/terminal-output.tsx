"use client";


import { useCallback, useState } from "react";
import type { CSSProperties } from "react";
import { useReducedMotion } from "@/components/lib/motion";
import { ShimmerText } from "@/components/primitives/agent-log";
import { useTicker } from "@/lib/use-ticker";
import { cx } from "@/lib/utils";

export type TerminalLine = { text: string; tone?: "muted" | "success" | "error" };

const DEMO_LINES: TerminalLine[] = [
  { text: "$ npm run export:tokens -- --release 0.4", tone: "muted" },
  { text: "> peach-ui@0.4.0 export:tokens" },
  { text: "> node scripts/export-warm-tokens.mjs" },
  { text: "" },
  { text: "Bundling warm tokens…", tone: "muted" },
  { text: "✓ 34 checks passed", tone: "success" },
  { text: "✓ wrote tokens/export.json", tone: "success" },
];

export type TerminalOutputLabels = {
  copy: string;
  copied: string;
  exit: string;
  running: string;
};

const DEFAULT_LABELS: TerminalOutputLabels = {
  copy: "Copy output",
  copied: "Copied",
  exit: "Exit 0",
  running: "Running",
};

function commonPrefixLength(a: TerminalLine[], b: TerminalLine[]) {
  let i = 0;
  while (i < a.length && i < b.length && a[i].text === b[i].text && a[i].tone === b[i].tone) i += 1;
  return i;
}

function toneClass(tone?: TerminalLine["tone"]) {
  if (tone === "success") return "text-green";
  if (tone === "error") return "text-red";
  if (tone === "muted") return "text-terminal-fg-muted";
  return "text-terminal-fg-subtle";
}

export type TerminalOutputProps = {
  command?: string;
  lines?: TerminalLine[];
  stream?: boolean;
  streamMs?: number;
  exitCode?: number | null;
  onDone?: () => void;
  labels?: Partial<TerminalOutputLabels>;
  chrome?: "card" | "plain";
  className?: string;
};

export function TerminalOutput({
  command = "npm run export:tokens",
  lines = DEMO_LINES,
  stream = false,
  streamMs = 45,
  exitCode = 0,
  onDone,
  labels,
  chrome = "card",
  className,
}: TerminalOutputProps) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const reduced = useReducedMotion();
  const streaming = stream && !reduced;
  const [visible, setVisible] = useState(() => (streaming ? 0 : lines.length));
  const [copied, setCopied] = useState(false);

  const [prev, setPrev] = useState({ lines, streaming });
  if (prev.lines !== lines || prev.streaming !== streaming) {
    const linesChanged = prev.lines !== lines;
    const prefix = commonPrefixLength(prev.lines, lines);
    setPrev({ lines, streaming });
    setVisible((current) =>
      !streaming ? lines.length : linesChanged ? Math.min(current, prefix) : current,
    );
  }

  useTicker(
    () => setVisible((current) => current + 1),
    streaming && visible < lines.length ? streamMs : null,
    visible,
  );

  const done = lines.length > 0 && visible >= lines.length;
  useTicker(() => onDone?.(), done ? 0 : null, done);

  const copyAll = useCallback(() => {
    const text = [`$ ${command}`, ...lines.map((line) => line.text)].join("\n");
    void navigator.clipboard?.writeText(text).then(() => {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1600);
    });
  }, [command, lines]);

  const exitLabel = !done || exitCode === null ? l.running : exitCode === 0 ? l.exit : `Exit ${exitCode}`;

  return (
    <div
      className={cx(
        "w-full overflow-hidden bg-terminal-bg text-terminal-fg",
        chrome === "card"
          ? "rounded-card border border-line shadow-card"
          : "rounded-lg",
        className,
      )}
    >
      <div
        className="flex items-center justify-between border-b px-3 py-2"
        style={{ borderColor: "var(--terminal-border)" }}
      >
        <span className="truncate font-mono text-gutter text-terminal-fg-muted">{command}</span>
        <button
          type="button"
          onClick={copyAll}
          className="ml-3 shrink-0 rounded-chip px-2 py-1 font-mono text-micro text-terminal-fg-subtle transition-colors hover:bg-[var(--terminal-hover)] hover:text-terminal-fg"
        >
          {copied ? l.copied : l.copy}
        </button>
      </div>
      <pre role="log" className="max-h-56 overflow-auto px-3 py-2.5 text-code">
        {lines.slice(0, visible).map((line, i) => (
          <div key={i} className={toneClass(line.tone)} style={{ animation: "fade-in 120ms ease both" }}>
            {line.text || "\u00a0"}
          </div>
        ))}
        {streaming && !done ? (
          <span
            aria-hidden
            className="inline-block h-3.5 w-1.5 translate-y-0.5 rounded-full"
            style={{ animation: "fade-in 150ms ease both", background: "var(--terminal-caret)" }}
          />
        ) : null}
      </pre>
      <div
        className="flex items-center justify-between border-t px-3 py-1.5 font-mono text-micro"
        style={{ borderColor: "var(--terminal-border)" }}
      >
        <span
          role="status"
          className={
            done && exitCode !== null
              ? exitCode === 0
                ? "text-green"
                : "text-red"
              : "text-terminal-fg-muted"
          }
        >
          {done && exitCode !== null ? (
            exitLabel
          ) : (
            <ShimmerText
              style={
                {
                  "--agent-shimmer-base": "var(--terminal-fg-muted)",
                  "--agent-shimmer-peak": "var(--terminal-fg)",
                } as CSSProperties
              }
            >
              {exitLabel}
            </ShimmerText>
          )}
        </span>
        <span className="text-terminal-fg-muted tabular-nums">
          {Math.round((visible / Math.max(lines.length, 1)) * 100)}%
        </span>
      </div>
    </div>
  );
}
