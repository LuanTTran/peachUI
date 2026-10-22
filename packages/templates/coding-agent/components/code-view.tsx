"use client";

/**
 * Fake code editor view — line numbers + hand-rolled token coloring.
 * Deterministic line tokenizer; no syntax-highlight dependency.
 */

import { cx } from "@/lib/utils";

type TokKind = "kw" | "str" | "com" | "tag" | "attr" | "num" | "plain";

const TOKEN_RE =
  /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(<\/?[A-Za-z][\w.]*|\/>?|\{|\})|([A-Za-z_$][\w$-]*)(?=\s*=)|(\b\d+(?:\.\d+)?\b)|(\b(?:import|from|export|function|return|const|type|default|async|await|new|if|else|typeof|interface|extends|let|var|test|expect)\b)/g;

const KIND_CLASS: Record<TokKind, string> = {
  kw: "text-accent-ink",
  str: "text-green",
  com: "text-ink-3 italic",
  tag: "text-violet",
  attr: "text-schedule",
  num: "text-warning",
  plain: "text-ink",
};

type Token = { text: string; kind: TokKind };

function tokenize(line: string): Token[] {
  const tokens: Token[] = [];
  let last = 0;
  TOKEN_RE.lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = TOKEN_RE.exec(line)) !== null) {
    if (match.index > last) tokens.push({ text: line.slice(last, match.index), kind: "plain" });
    const [, com, str, jsx, attr, num] = match;
    const kind: TokKind = com ? "com" : str ? "str" : jsx ? "tag" : attr ? "attr" : num ? "num" : "kw";
    tokens.push({ text: match[0], kind });
    last = match.index + match[0].length;
  }
  if (last < line.length) tokens.push({ text: line.slice(last), kind: "plain" });
  return tokens;
}

export function CodeView({ lines, className }: { lines: string[]; className?: string }) {
  return (
    <div className={cx("min-w-0 overflow-auto py-2 text-code", className)}>
      {lines.map((line, i) => (
        <div key={i} className="flex min-w-max items-start pr-4">
          <span className="w-10 shrink-0 select-none pr-3 text-right text-gutter text-ink-3" aria-hidden>
            {i + 1}
          </span>
          <span className="whitespace-pre">
            {line.length === 0 ? "\u00a0" : tokenize(line).map((tok, j) => (
              <span key={j} className={KIND_CLASS[tok.kind]}>
                {tok.text}
              </span>
            ))}
          </span>
        </div>
      ))}
    </div>
  );
}
