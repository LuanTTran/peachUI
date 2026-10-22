"use client";

import { useCallback, useState } from "react";

export function SourcePanel({ source, deps }: { source: string; deps?: string[] }) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(source).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1600);
    });
  }, [source]);

  return (
    <div className="doc-source-actions">
      <button type="button" className="doc-source-button" onClick={copy}>
        {copied ? "Copied" : "Copy source"}
      </button>
      <button type="button" className="doc-source-button" onClick={() => setOpen(true)}>
        View code
      </button>

      {open ? (
        <div className="doc-code-overlay" role="dialog" aria-modal="true" aria-label="Component source">
          <button type="button" className="doc-code-overlay-backdrop" aria-label="Close" onClick={() => setOpen(false)} />
          <div className="doc-code-overlay-panel">
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <p className="text-body-strong text-ink">Source</p>
              <button type="button" className="doc-source-button" onClick={() => setOpen(false)}>Close</button>
            </div>
            {deps && deps.length > 0 ? (
              <p className="border-b border-line px-4 py-2 text-caption text-ink-3">
                Dependencies: {deps.join(", ")}
              </p>
            ) : null}
            <pre className="doc-code-pre overflow-auto p-4 text-[12px] leading-relaxed">
              <code>{source}</code>
            </pre>
          </div>
        </div>
      ) : null}
    </div>
  );
}
