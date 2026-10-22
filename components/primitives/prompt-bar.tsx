"use client";

import {
  useState,
  useSyncExternalStore,
  type KeyboardEvent,
  type ReactNode,
  type RefObject,
} from "react";
import { BorderBeam, type BorderBeamSize } from "@/components/border-beam";
import { Button } from "@/components/atoms/button";
import { Textarea } from "@/components/atoms/textarea";
import type { PermissionMode } from "@/components/types";
import { AgentComposerIcon } from "@/components/primitives/agent-composer-icons";
import { readDocumentTheme, subscribeDocumentTheme } from "@/lib/document-theme";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";


export type PromptBarProps = {
  variant?: "Rounded" | "Pill";
  inset?: boolean;
  tall?: boolean;
  disabled?: boolean;
  placeholder?: string;
  listening?: boolean;
  beamActive?: boolean;
  beamSize?: BorderBeamSize;
  className?: string;
  leadingSlot?: ReactNode;
  value: string;
  onChange: (value: string) => void;
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
  inputRef: RefObject<HTMLTextAreaElement | null>;
  attachments: string[];
  onRemoveAttachment: (index: number) => void;
  canSend: boolean;
  onSend: () => void;
  permission: PermissionMode;
  requestApprovalLabel?: string;
  modelName: string;
  plusOpen: boolean;
  sourcesMenuOpen: boolean;
  modelOpen: boolean;
  permissionOpen: boolean;
  onPlusClick: () => void;
  onPermissionClick: () => void;
  onModelClick: () => void;
  onDictationClick: () => void;
  plusRef: RefObject<HTMLButtonElement | null>;
  modelRef: RefObject<HTMLButtonElement | null>;
  permissionRef: RefObject<HTMLButtonElement | null>;
};

export function PromptBar({
  variant = "Rounded",
  inset = false,
  tall = false,
  disabled = false,
  placeholder,
  listening = false,
  beamActive = true,
  beamSize = "sm",
  className,
  leadingSlot,
  value,
  onChange,
  onKeyDown,
  inputRef,
  attachments,
  onRemoveAttachment,
  canSend,
  onSend,
  permission,
  requestApprovalLabel = "Request approval",
  modelName,
  plusOpen,
  sourcesMenuOpen,
  modelOpen,
  permissionOpen,
  onPlusClick,
  onPermissionClick,
  onModelClick,
  onDictationClick,
  plusRef,
  modelRef,
  permissionRef,
}: PromptBarProps) {
  const beamTheme = useSyncExternalStore(subscribeDocumentTheme, readDocumentTheme, () => "dark" as const);
  const pill = variant === "Pill";
  const [grown, setGrown] = useState(false);

  useMountEffect(() => {
    const input = inputRef.current;
    if (!input) return;
    const observer = new ResizeObserver(() => {
      const line = parseFloat(window.getComputedStyle(input).lineHeight) || 20;
      const next = input.scrollHeight > line * 1.6;
      setGrown((current) => (current === next ? current : next));
    });
    observer.observe(input);
    return () => observer.disconnect();
  });

  const glowOn = beamActive;
  const frameRadius = pill
    ? attachments.length > 0 || grown
      ? "rounded-[24px]"
      : "rounded-full max-sm:rounded-[24px]"
    : "rounded-card";

  const plusButton = (
    <button
      ref={plusRef}
      type="button"
      aria-label="Add attachments and sources"
      aria-expanded={plusOpen}
      aria-haspopup="menu"
      disabled={disabled}
      onClick={onPlusClick}
      className={`flex size-7 shrink-0 items-center justify-center text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96] ${
        pill ? "rounded-full" : "rounded-[8px]"
      } ${sourcesMenuOpen ? "bg-hover text-ink" : ""}`}
    >
      <AgentComposerIcon size={16} strokeWidth={2}>
        <path d="M12 5v14M5 12h14" />
      </AgentComposerIcon>
    </button>
  );

  const approvalButton =
    tall && permission === "ask" ? (
      <Button
        type="button"
        variant="ghost"
        size="small"
        className="h-7 shrink-0 gap-1.5 text-ink-2"
        disabled={disabled}
      >
        <AgentComposerIcon size={14}>
          <path d="M7 11V6a2 2 0 0 1 4 0v5M11 11V4a2 2 0 0 1 4 0v7M15 11V7a2 2 0 0 1 4 0v8a5 5 0 0 1-5 5h-2a5 5 0 0 1-5-5v-3" />
        </AgentComposerIcon>
        {requestApprovalLabel}
      </Button>
    ) : null;

  const field = (
    <Textarea
      ref={inputRef}
      rows={tall ? 2 : 1}
      autoResize
      maxRows={6}
      fieldClassName="!bg-transparent !p-0 !ring-0 shadow-none"
      isDisabled={disabled}
      value={value}
      onChange={onChange}
      onKeyDown={onKeyDown}
      placeholder={listening ? "Listening…" : placeholder ?? "Write a message…"}
      aria-label="Prompt"
      className={pill ? "min-w-0 flex-1 max-sm:order-first max-sm:basis-full" : "w-full"}
      inputClassName={cx(
        "w-full border-0 bg-transparent shadow-none [overflow-wrap:anywhere] focus-visible:ring-0",
        "text-base leading-normal placeholder:text-ink-3 sm:text-meta sm:leading-snug sm:placeholder:text-caption-2-regular",
        pill ? "min-h-7 px-1 py-[5px] max-sm:min-h-9" : tall ? "min-h-11 px-1 pt-1" : "min-h-7 px-1 pt-0.5",
      )}
    />
  );

  const permissionButton = (
    <button
      ref={permissionRef}
      type="button"
      aria-expanded={permissionOpen}
      aria-haspopup="listbox"
      aria-label="Tool permission"
      disabled={disabled}
      onClick={onPermissionClick}
      className={cx(
        "flex h-7 shrink-0 items-center gap-1 px-1.5 text-meta font-medium text-ink-2 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink",
        pill ? "rounded-full" : "rounded-control",
        permissionOpen && "bg-hover text-ink",
        "active:scale-[0.96]",
      )}
    >
      {permission === "auto" ? "Auto" : permission === "ask" ? "Ask" : "Locked"}
      <span className="text-ink-3">
        <AgentComposerIcon size={11} strokeWidth={2.4}>
          <path d="M6 9l6 6 6-6" />
        </AgentComposerIcon>
      </span>
    </button>
  );

  const modelButton = (
    <button
      ref={modelRef}
      type="button"
      aria-expanded={modelOpen}
      aria-haspopup="listbox"
      aria-label="Choose model"
      disabled={disabled}
      onClick={onModelClick}
      className={cx(
        "flex h-7 shrink-0 items-center gap-1 px-1.5 text-meta font-medium text-ink-2 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]",
        pill ? "rounded-full" : "rounded-control",
        modelOpen && "bg-hover text-ink",
      )}
    >
      {modelName}
      <span className="text-ink-3">
        <AgentComposerIcon size={11} strokeWidth={2.4}>
          <path d="M6 9l6 6 6-6" />
        </AgentComposerIcon>
      </span>
    </button>
  );

  const micButton = (
    <button
      type="button"
      aria-label={listening ? "Stop dictation" : "Start dictation"}
      aria-pressed={listening}
      disabled={disabled}
      onClick={onDictationClick}
      className={`flex size-7 shrink-0 items-center justify-center transition-[background-color,color,transform] duration-150 active:scale-[0.96] max-sm:ms-auto ${
        pill ? "rounded-full" : "rounded-[8px]"
      } ${listening ? "prompt-mic-live bg-accent-muted text-ink" : "text-ink-3 hover:bg-hover hover:text-ink"}`}
    >
      {listening ? (
        <span className="flex h-3.5 items-center gap-[2.5px]" aria-hidden>
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="prompt-eq-bar w-[2.5px] rounded-full bg-current"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </span>
      ) : (
        <AgentComposerIcon size={15} strokeWidth={2}>
          <g>
            <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
            <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
          </g>
        </AgentComposerIcon>
      )}
    </button>
  );

  const sendButton = (
    <button
      type="button"
      aria-label="Send"
      disabled={!canSend}
      onClick={onSend}
      className={`flex size-7 shrink-0 items-center justify-center transition-[background-color,color,transform] duration-200 enabled:active:scale-[0.96] ${
        pill ? "rounded-full" : "rounded-[8px]"
      }`}
      style={{
        background: canSend ? "var(--ink)" : "var(--line-strong)",
        color: canSend ? "var(--surface)" : "var(--ink-2)",
      }}
    >
      <AgentComposerIcon size={16} strokeWidth={2.4}>
        <path d="M12 19V5M5 12l7-7 7 7" />
      </AgentComposerIcon>
    </button>
  );

  const shell = (
    <div
      className={`relative isolate flex w-full min-w-0 flex-col overflow-visible transition-[border-color,border-radius,box-shadow] duration-150 ${
        inset
          ? "gap-2 border-0 bg-transparent p-0 shadow-none"
          : `border bg-surface ${
              glowOn && !disabled ? "border-transparent shadow-sm" : "border-line shadow-card focus-within:border-line-strong"
            } ${tall ? "gap-2.5 p-3.5" : "gap-1.5 p-1.5"} ${frameRadius}`
      } ${disabled ? "opacity-55" : ""}`}
    >
      {leadingSlot}

      {attachments.length > 0 && (
        <div className={`flex flex-wrap gap-1.5 pt-0.5 ${pill ? "px-1" : "px-0.5"}`}>
          {attachments.map((file, i) => (
            <span
              key={`${file}-${i}`}
              className={`flex h-6.5 items-center gap-1.5 bg-field py-1 pr-1 pl-1.5 text-[11.5px] text-ink-2 shadow-hairline ${
                pill ? "rounded-full" : "rounded-chip"
              }`}
              style={{ animation: "pop-in 200ms cubic-bezier(0.23,1,0.32,1) both" }}
            >
              <AgentComposerIcon size={12}>
                <g>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <path d="M14 2v6h6" />
                </g>
              </AgentComposerIcon>
              <span className="max-w-36 truncate">{file}</span>
              <button
                type="button"
                aria-label={`Remove ${file}`}
                onClick={() => onRemoveAttachment(i)}
                className={`-my-1 flex size-6 items-center justify-center text-ink-3 transition-[background-color,color,transform] duration-100 hover:bg-line/70 hover:text-ink active:scale-[0.96] ${
                  pill ? "rounded-full" : "rounded-[5px]"
                }`}
              >
                <AgentComposerIcon size={10} strokeWidth={2.5}>
                  <path d="M18 6L6 18M6 6l12 12" />
                </AgentComposerIcon>
              </button>
            </span>
          ))}
        </div>
      )}

      {pill ? (
        <div className="flex items-end gap-1 max-sm:flex-wrap max-sm:gap-y-2">
          {plusButton}
          {approvalButton}
          {field}
          {permissionButton}
          {modelButton}
          {micButton}
          {sendButton}
        </div>
      ) : (
        <>
          {field}
          <div className="flex items-center gap-1">
            {plusButton}
            {approvalButton}
            <div className="ms-auto flex items-center gap-1">
              {permissionButton}
              {modelButton}
              {micButton}
              {sendButton}
            </div>
          </div>
        </>
      )}
    </div>
  );

  const body = inset ? (
    shell
  ) : (
    <BorderBeam
      size={beamSize}
      colorVariant="colorful"
      placement="outside"
      strength={0.82}
      active={glowOn && !disabled}
      theme={beamTheme}
      className={cx("block w-full min-w-0", frameRadius)}
    >
      {shell}
    </BorderBeam>
  );

  return <div className={cx("relative w-full min-w-0", className)}>{body}</div>;
}
