"use client";


import {
  useCallback,
  useRef,
  useState,
  type ReactNode,
  type SVGProps,
} from "react";
import { Button } from "@/components/atoms/button";
import { StreamText } from "@/components/atoms/stream-text";
import { ShimmerText } from "@/components/primitives/agent-log";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const LEAD = "Warm tokens lead adoption across docs.peach-ui.dev. ";
const PICKED =
  "Ship the rename in the first release window so docs and agents stay aligned before the catalog push.";
const REWRITE =
  "Ship the warm token rename in the first release window so docs and agents stay aligned before the catalog push.";

export type SelectionText = {
  lead: string;
  original: string;
  rewrite: string;
};

export type SelectionAction = {
  id: string;
  icon: ReactNode;
  action?: string;
  busyLabel?: string;
};

export type SelectionActionSet = {
  primary: SelectionAction[];
  more: SelectionAction[];
};

export type SelectionActionsLabels = {
  keep: string;
  discard: string;
  placeholder: string;
};

const DEFAULT_TEXT: SelectionText = {
  lead: LEAD,
  original: PICKED,
  rewrite: REWRITE,
};

const DEFAULT_LABELS: SelectionActionsLabels = {
  keep: "Keep",
  discard: "Discard",
  placeholder: "Describe edits",
};

type Mode = "idle" | "thinking" | "streaming" | "result";

function ActionIcon({ className, children }: { className?: string; children: ReactNode }) {
  return (
    <span className={cx("inline-flex size-3.5 shrink-0 items-center justify-center", className)} aria-hidden>
      {children}
    </span>
  );
}

function StrokeIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" {...props} />
  );
}

const icons = {
  explain: (
    <ActionIcon>
      <StrokeIcon>
        <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
        <path d="M12 17h.01" />
        <circle cx="12" cy="12" r="10" />
      </StrokeIcon>
    </ActionIcon>
  ),
  improve: (
    <ActionIcon>
      <StrokeIcon>
        <path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z" />
      </StrokeIcon>
    </ActionIcon>
  ),
  shorten: (
    <ActionIcon>
      <StrokeIcon>
        <circle cx="6" cy="6" r="3" />
        <path d="M8.12 8.12 12 12" />
        <path d="M20 4 8.12 15.88" />
        <circle cx="6" cy="18" r="3" />
        <path d="M14.8 14.8 20 20" />
      </StrokeIcon>
    </ActionIcon>
  ),
  tone: (
    <ActionIcon>
      <StrokeIcon>
        <circle cx="12" cy="12" r="10" />
        <path d="M8 14s1.5 2 4 2 4-2 4-2" />
        <line x1="9" x2="9.01" y1="9" y2="9" />
        <line x1="15" x2="15.01" y1="9" y2="9" />
      </StrokeIcon>
    </ActionIcon>
  ),
  grammar: (
    <ActionIcon>
      <StrokeIcon>
        <path d="M4 20h16" />
        <path d="m6 16 6-12 6 12" />
        <path d="M8 12h8" />
      </StrokeIcon>
    </ActionIcon>
  ),
  send: (
    <ActionIcon className="size-4">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
        <path d="m5 12 7-7 7 7" />
        <path d="M12 19V5" />
      </svg>
    </ActionIcon>
  ),
  chevron: (
    <ActionIcon>
      <StrokeIcon>
        <path d="m9 18 6-6-6-6" />
      </StrokeIcon>
    </ActionIcon>
  ),
  check: (
    <ActionIcon>
      <StrokeIcon>
        <path d="M20 6 9 17l-5-5" />
      </StrokeIcon>
    </ActionIcon>
  ),
  close: (
    <ActionIcon>
      <StrokeIcon>
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
      </StrokeIcon>
    </ActionIcon>
  ),
  retry: (
    <ActionIcon>
      <StrokeIcon>
        <path d="M21 12a9 9 0 1 1-3-6.7" />
        <path d="M21 3v6h-6" />
      </StrokeIcon>
    </ActionIcon>
  ),
};

const primary =
  "inline-flex h-7 shrink-0 items-center gap-1 rounded-full bg-ink px-2.5 text-body-2-regular text-canvas shadow-hairline transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]";

const DEFAULT_ACTIONS: SelectionActionSet = {
  primary: [
    { id: "Explain", icon: icons.explain },
    { id: "Improve", icon: icons.improve, action: "Improve", busyLabel: "Improving" },
  ],
  more: [
    { id: "Shorten", icon: icons.shorten, action: "Shorten", busyLabel: "Shortening" },
    { id: "Tone", icon: icons.tone, action: "Change tone", busyLabel: "Changing tone" },
    { id: "Grammar", icon: icons.grammar, action: "Fix grammar" },
  ],
};

export type SelectionActionsProps = {
  variant?: string;
  text?: Partial<SelectionText>;
  actions?: SelectionActionSet;
  labels?: Partial<SelectionActionsLabels>;
  onAction?: (action: string) => void;
};

export function SelectionActions({
  text: textProp,
  actions = DEFAULT_ACTIONS,
  labels,
  onAction,
}: SelectionActionsProps = {}) {
  const passage = { ...DEFAULT_TEXT, ...textProp };
  const copy = { ...DEFAULT_LABELS, ...labels };
  const [shown, setShown] = useState(false);
  const [mode, setMode] = useState<Mode>("idle");
  const [action, setAction] = useState("Improve");
  const [prompt, setPrompt] = useState("");
  const [typingWidth, setTypingWidth] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0 });
  const [positioned, setPositioned] = useState(false);

  const hostRef = useRef<HTMLDivElement>(null);
  const selectionRef = useRef<HTMLSpanElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const frameRef = useRef<number | null>(null);
  const previousModeRef = useRef<Mode>("idle");
  const lastWidthRef = useRef(0);
  const widthAnimationRef = useRef<Animation | null>(null);
  const thinkTimerRef = useRef<number | null>(null);

  useMountEffect(() => {
    const timer = window.setTimeout(() => setShown(true), 280);
    return () => {
      window.clearTimeout(timer);
      if (thinkTimerRef.current !== null) window.clearTimeout(thinkTimerRef.current);
    };
  });

  const place = useCallback(() => {
    if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    frameRef.current = requestAnimationFrame(() => {
      const host = hostRef.current;
      const selection = selectionRef.current;
      if (!host || !selection) return;

      const bounds = selection.getBoundingClientRect();
      const lines = Array.from(selection.getClientRects());
      const lastLine = lines.at(-1);
      if (!lastLine) return;

      const hostBounds = host.getBoundingClientRect();
      const next = {
        x: Math.round(bounds.left - hostBounds.left + bounds.width / 2),
        y: Math.round(lastLine.bottom - hostBounds.top + 8),
      };

      setAnchor((current) =>
        current.x === next.x && current.y === next.y ? current : next,
      );
      setPositioned(true);
    });
  }, []);

  useMountEffect(() => {
    place();
    const host = hostRef.current;
    if (!host) return;
    const observer = new ResizeObserver(place);
    observer.observe(host);
    window.addEventListener("resize", place);
    return () => {
      observer.disconnect();
      window.removeEventListener("resize", place);
      if (frameRef.current !== null) cancelAnimationFrame(frameRef.current);
    };
  });

  useDomLayout(() => {
    const bar = barRef.current;
    const content = contentRef.current;
    if (!bar || !content) return;

    const nextWidth = Math.ceil(content.getBoundingClientRect().width) + 8;
    const previousWidth =
      lastWidthRef.current || Math.ceil(bar.getBoundingClientRect().width);

    if (
      previousModeRef.current !== mode &&
      Math.abs(nextWidth - previousWidth) > 1
    ) {
      widthAnimationRef.current?.cancel();
      const animation = bar.animate(
        [
          { width: `${previousWidth}px` },
          { width: `${nextWidth}px` },
        ],
        {
          duration: 320,
          easing: "cubic-bezier(0.23,1,0.32,1)",
        },
      );
      widthAnimationRef.current = animation;
      animation.onfinish = () => {
        lastWidthRef.current = nextWidth;
        widthAnimationRef.current = null;
      };
    } else if (widthAnimationRef.current?.playState !== "running") {
      lastWidthRef.current = nextWidth;
    }

    previousModeRef.current = mode;
  });

  useMountEffect(() => {
    const content = contentRef.current;
    if (!content) return;

    const observer = new ResizeObserver(() => {
      if (widthAnimationRef.current?.playState === "running") return;
      lastWidthRef.current =
        Math.ceil(content.getBoundingClientRect().width) + 8;
    });
    observer.observe(content);
    return () => {
      observer.disconnect();
      widthAnimationRef.current?.cancel();
    };
  });

  const run = (nextAction: string) => {
    setAction(nextAction);
    setExpanded(false);
    setMode("thinking");
    if (thinkTimerRef.current !== null) window.clearTimeout(thinkTimerRef.current);
    thinkTimerRef.current = window.setTimeout(() => {
      setMode("streaming");
      place();
    }, 700);
    onAction?.(nextAction);
    place();
  };

  const reset = () => {
    if (thinkTimerRef.current !== null) {
      window.clearTimeout(thinkTimerRef.current);
      thinkTimerRef.current = null;
    }
    setExpanded(false);
    setPrompt("");
    setTypingWidth(null);
    setAction("Improve");
    setMode("idle");
    place();
  };

  const busy = mode === "thinking" || mode === "streaming";
  const visible = shown && positioned;
  const hasPrompt = prompt.trim().length > 0;
  const busyLabelMap: Record<string, string> = {};
  for (const item of [...actions.primary, ...actions.more]) {
    if (item.action && item.busyLabel) busyLabelMap[item.action] = item.busyLabel;
  }
  const busyLabel = busyLabelMap[action] ?? "Editing";

  return (
    <div className="w-full max-w-[460px]">
      <div ref={hostRef} className="relative select-none pb-12">
        <p className="text-body leading-relaxed text-ink">
          {passage.lead}
          <span
            ref={selectionRef}
            className="box-decoration-clone rounded-[3px] bg-[color-mix(in_srgb,var(--accent)_14%,var(--surface))] text-ink dark:bg-accent-muted"
          >
            {mode === "idle" || mode === "thinking" ? (
              passage.original
            ) : mode === "streaming" ? (
              <StreamText
                text={passage.rewrite}
                onProgress={place}
                onDone={() => {
                  setMode("result");
                  place();
                }}
              />
            ) : (
              passage.rewrite
            )}
          </span>
        </p>

        <div
          className="absolute top-0 left-0 z-10"
          style={{
            transform: `translate3d(${anchor.x}px, ${anchor.y}px, 0) translateX(-50%)`,
            transition:
              "transform 320ms cubic-bezier(0.77,0,0.175,1), opacity 180ms ease-out",
            opacity: visible ? 1 : 0,
            pointerEvents: visible ? "auto" : "none",
            willChange: "transform",
          }}
        >
          <div
            ref={barRef}
            className="flex h-9 w-fit max-w-[calc(100vw-48px)] items-center justify-center gap-0.5 overflow-hidden rounded-full bg-surface p-1 font-sans font-normal text-ink shadow-overlay"
            style={{
              width:
                mode === "idle" && hasPrompt && typingWidth
                  ? typingWidth
                  : undefined,
              ...(visible
                ? {
                    animation:
                      "pop-in 220ms cubic-bezier(0.23,1,0.32,1) both",
                  }
                : {}),
            }}
          >
            <div
              ref={contentRef}
              className="flex w-fit shrink-0 items-center justify-center gap-0.5"
              style={{
                width:
                  mode === "idle" && hasPrompt && typingWidth
                    ? typingWidth - 8
                    : undefined,
              }}
            >
            {busy && (
              <span className="inline-flex h-7 items-center gap-1.5 whitespace-nowrap px-2.5 text-body font-normal text-ink-2">
                <span
                  className="size-3 shrink-0 rounded-full border-[1.5px] border-line-strong border-t-ink-2"
                  style={{ animation: "spin 700ms linear infinite" }}
                />
                <ShimmerText>{`${busyLabel}…`}</ShimmerText>
              </span>
            )}

            {mode === "result" && (
              <>
                <button
                  type="button"
                  onClick={reset}
                  className={primary}
                >
                  {icons.check}
                  {copy.keep}
                </button>
                <Button type="button" variant="ghost" size="xs" className="shrink-0" onClick={reset}>
                  {icons.close}
                  {copy.discard}
                </Button>
                <span className="mx-0.5 h-4 w-px shrink-0 bg-line" />
                <button
                  type="button"
                  aria-label="Try again"
                  onClick={() => run(action)}
                  className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover-2 hover:text-ink-2 active:scale-[0.96]"
                >
                  {icons.retry}
                </button>
              </>
            )}

            {mode === "idle" && (
              <>
                <div
                  className="flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-400"
                  style={{
                    maxWidth: expanded
                      ? 0
                      : hasPrompt && typingWidth
                        ? typingWidth - 40
                        : 145,
                    opacity: expanded ? 0 : 1,
                    transform: expanded ? "translateX(-8px)" : "translateX(0)",
                    transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                  }}
                >
                  <form
                    className="flex h-7 shrink-0 items-center transition-[width] duration-400"
                    style={{
                      width:
                        hasPrompt && typingWidth ? typingWidth - 40 : 145,
                      transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                    }}
                    onSubmit={(event) => {
                      event.preventDefault();
                      run(prompt.trim() || "Improve");
                    }}
                  >
                    <input
                      value={prompt}
                      onChange={(event) => {
                        const next = event.target.value;
                        if (!prompt.trim() && next.trim()) {
                          setTypingWidth(
                            Math.ceil(
                              barRef.current?.getBoundingClientRect().width ??
                                0,
                            ),
                          );
                        } else if (!next.trim()) {
                          setTypingWidth(null);
                        }
                        setPrompt(next);
                      }}
                      aria-label={copy.placeholder}
                      placeholder={copy.placeholder}
                      className="h-7 w-full border-0 bg-transparent pr-2.5 pl-3 text-body text-ink outline-none placeholder:text-ink-3"
                    />
                  </form>
                </div>

                <div
                  className="flex min-w-0 items-center gap-0.5 overflow-hidden transition-[max-width,opacity,transform] duration-400"
                  style={{
                    maxWidth: hasPrompt ? 0 : expanded ? 462 : 224,
                    opacity: hasPrompt ? 0 : 1,
                    transform: hasPrompt ? "translateX(-8px)" : "translateX(0)",
                    transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                  }}
                >
                  {!expanded && (
                    <span className="mx-1 h-4 w-px shrink-0 bg-line-strong" />
                  )}
                  {actions.primary.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="shrink-0"
                      onClick={item.action ? () => run(item.action!) : undefined}
                    >
                      {item.icon}
                      {item.id}
                    </Button>
                  ))}

                  <div
                    className="flex min-w-0 items-center gap-0.5 overflow-hidden transition-[max-width,opacity,margin] duration-400"
                    style={{
                      maxWidth: expanded ? 262 : 0,
                      opacity: expanded ? 1 : 0,
                      marginLeft: expanded ? 2 : 0,
                      transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                    }}
                  >
                  {actions.more.map((item) => (
                    <Button
                      key={item.id}
                      type="button"
                      variant="ghost"
                      size="xs"
                      className="shrink-0"
                      onClick={item.action ? () => run(item.action!) : undefined}
                    >
                      {item.icon}
                      {item.id}
                    </Button>
                  ))}
                  </div>

                  <span className="mx-0.5 h-4 w-px shrink-0 bg-line" />
                  <button
                    type="button"
                    aria-label={expanded ? "Show fewer actions" : "Show more actions"}
                    aria-expanded={expanded}
                    onClick={() => setExpanded((value) => !value)}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full text-ink transition-[background-color,transform] duration-200 hover:bg-hover active:scale-[0.96]"
                  >
                    <span
                      className="flex transition-transform duration-400"
                      style={{
                        transform: expanded ? "rotate(180deg)" : "rotate(0deg)",
                        transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                      }}
                    >
                      {icons.chevron}
                    </span>
                  </button>
                </div>

                <div
                  className="flex min-w-0 items-center overflow-hidden transition-[max-width,opacity,transform] duration-400"
                  style={{
                    maxWidth: hasPrompt ? 30 : 0,
                    opacity: hasPrompt ? 1 : 0,
                    transform: hasPrompt ? "scale(1)" : "scale(0.88)",
                    transitionTimingFunction: "cubic-bezier(0.23,1,0.32,1)",
                  }}
                >
                  <button
                    type="button"
                    aria-label="Send edit instruction"
                    onClick={() => run(prompt.trim())}
                    className="flex size-7 shrink-0 items-center justify-center rounded-full bg-ink text-surface transition-[opacity,transform] duration-200 active:scale-[0.94]"
                  >
                    {icons.send}
                  </button>
                </div>
              </>
            )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
