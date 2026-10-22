"use client";

/**
 * PeachUI — PromptDeck (block)
 * @tier block
 * @deps agent-composer, connect-apps-strip, clip-row, border-beam
 * @requires app/globals.css
 *
 * Composer, context utils, and an optional connect-apps row.
 * Rounded and Pill are both supported. Menus open just under the bar.
 */

import { useMemo, useRef, useState, type ReactNode } from "react";
import { ClipRow, type ClipRowItem } from "@/components/blocks/clip-row";
import type { PermissionMode } from "@/components/types";
import type { AgentComposerCatalog } from "@/components/types";
import { ConnectAppsStrip } from "@/components/primitives/connect-apps-strip";
import { AgentComposer } from "@/components/primitives/agent-composer";
import { AgentThinking, type AgentThinkingVariant } from "@/components/primitives/agent-thinking";
import { AgentComposerIcon } from "@/components/primitives/agent-composer-icons";
import { PROMPT_BAR_DROPDOWN_MOTION, PROMPT_BAR_DROPDOWN_PANEL } from "@/components/primitives/prompt-bar-dropdown";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

function fileTypeLabel(name: string) {
  const ext = name.split(".").pop()?.toUpperCase();
  return ext && ext.length <= 4 ? ext : "FILE";
}

function attachmentsToClips(files: string[]): ClipRowItem[] {
  return files.map((name, index) => ({
    id: `${name}-${index}`,
    name,
    meta: "Ready to send",
    progress: 1,
    typeLabel: fileTypeLabel(name),
  }));
}

const PROJECTS = ["Launch", "Support", "Notes"] as const;
const AGENT_MODES = ["Agent", "Plan", "Ask"] as const;

export type PromptDeckVariant = "Rounded" | "Pill";

export type PromptDeckProps = {
  className?: string;
  variant?: PromptDeckVariant;
  permission?: PermissionMode;
  onPermissionChange?: (mode: PermissionMode) => void;
  placeholder?: string;
  onSend?: (text: string, attachments: string[]) => void;
  showConnectApps?: boolean;
  /** Replaces the composer draft. Pair with draftSeedVersion to apply the same text again. */
  draftSeed?: string;
  draftSeedVersion?: number;
  branch?: string;
  contextUsed?: number;
  /** Composer options passed through to AgentComposer. */
  catalog?: AgentComposerCatalog;
  disabled?: boolean;
  /** Show the agent-working indicator above the bar while a run is in flight. */
  working?: boolean;
  workingLabel?: string;
  workingVariant?: AgentThinkingVariant;
  beamActive?: boolean;
  tall?: boolean;
  /** Flip menus above the bar. "auto" picks the roomier side of the viewport. */
  menusFlipUp?: boolean | "auto";
};

export function PromptDeck({
  className,
  variant = "Pill",
  permission: permissionProp,
  onPermissionChange,
  placeholder = "Summarize a meeting or draft a reply",
  onSend,
  showConnectApps = true,
  draftSeed,
  draftSeedVersion,
  branch = "Main",
  contextUsed = 0.57,
  catalog,
  disabled = false,
  working = false,
  workingLabel = "Thinking",
  workingVariant = "wave",
  beamActive = true,
  tall = false,
  menusFlipUp = false,
}: PromptDeckProps) {
  const [permission, setPermission] = useState<PermissionMode>(permissionProp ?? "auto");
  const [attachmentNames, setAttachmentNames] = useState<string[]>([]);
  const activePermission = permissionProp ?? permission;

  const handlePermission = (mode: PermissionMode) => {
    if (permissionProp === undefined) setPermission(mode);
    onPermissionChange?.(mode);
  };

  const clips = useMemo(() => attachmentsToClips(attachmentNames), [attachmentNames]);

  const handleRemoveClip = (id: string) => {
    setAttachmentNames((current) => {
      const index = attachmentsToClips(current).findIndex((clip) => clip.id === id);
      if (index < 0) return current;
      return current.filter((_, i) => i !== index);
    });
  };

  const handleSend = (text: string, attachments: string[]) => {
    onSend?.(text, attachments);
    setAttachmentNames([]);
  };

  return (
    <div className={cx("mx-auto w-full max-w-[680px]", className)}>
      {clips.length > 0 ? <ClipRow className="mb-2 px-0.5" items={clips} onRemove={handleRemoveClip} /> : null}
      {working ? (
        <div className="mb-2 px-1.5" style={{ animation: "fade-up 300ms cubic-bezier(0.22, 1, 0.36, 1) both" }}>
          <AgentThinking variant={workingVariant} label={workingLabel} />
        </div>
      ) : null}
      <AgentComposer
        variant={variant}
        beamSize="sm"
        beamActive={beamActive}
        portalMenus
        menusFlipUp={menusFlipUp}
        tall={tall}
        disabled={disabled}
        placeholder={placeholder}
        permission={activePermission}
        onPermissionChange={handlePermission}
        onAttachmentsChange={setAttachmentNames}
        onSend={handleSend}
        draftSeed={draftSeed}
        draftSeedVersion={draftSeedVersion}
        catalog={catalog}
      />
      <PromptDeckUtils branch={branch} contextUsed={contextUsed} />
      {showConnectApps ? <ConnectAppsStrip className="mt-1 rounded-card px-2" /> : null}
    </div>
  );
}

function PromptDeckUtils({ branch, contextUsed }: { branch: string; contextUsed: number }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [project, setProject] = useState<(typeof PROJECTS)[number]>("Launch");
  const [mode, setMode] = useState<(typeof AGENT_MODES)[number]>("Agent");
  const [open, setOpen] = useState<"project" | "mode" | null>(null);

  useMountEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(null);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  });

  return (
    <div ref={rootRef} className="mt-2 flex flex-wrap items-center gap-x-1 gap-y-1 px-1.5 text-caption">
      <span className="inline-flex h-7 items-center gap-1.5 px-1.5">
        <AgentComposerIcon size={14} strokeWidth={1.8}>
          <g>
            <path d="M6 3v12" />
            <circle cx="18" cy="6" r="3" />
            <circle cx="6" cy="18" r="3" />
            <path d="M18 9a9 9 0 0 1-9 9" />
          </g>
        </AgentComposerIcon>
        {branch}
      </span>

      <UtilsMenu
        label="Project"
        value={project}
        open={open === "project"}
        onToggle={() => setOpen((current) => (current === "project" ? null : "project"))}
        options={PROJECTS}
        onSelect={(next) => {
          setProject(next);
          setOpen(null);
        }}
        icon={
          <AgentComposerIcon size={14} strokeWidth={1.8}>
            <path d="M3 7.5V6a2 2 0 0 1 2-2h4l2 2h8a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </AgentComposerIcon>
        }
      />

      <UtilsMenu
        label="Agent mode"
        value={mode}
        open={open === "mode"}
        onToggle={() => setOpen((current) => (current === "mode" ? null : "mode"))}
        options={AGENT_MODES}
        onSelect={(next) => {
          setMode(next);
          setOpen(null);
        }}
        icon={
          <AgentComposerIcon size={14} strokeWidth={1.8}>
            <path d="M6 16c5 0 7-8 12-8a4 4 0 0 1 0 8c-5 0-7-8-12-8a4 4 0 1 0 0 8" />
          </AgentComposerIcon>
        }
      />

      <ContextMeter className="ms-auto" value={contextUsed} />
    </div>
  );
}

function UtilsMenu<T extends string>({
  label,
  value,
  open,
  onToggle,
  options,
  onSelect,
  icon,
}: {
  label: string;
  value: T;
  open: boolean;
  onToggle: () => void;
  options: readonly T[];
  onSelect: (next: T) => void;
  icon: ReactNode;
}) {
  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        aria-label={`${label}, ${value}`}
        onMouseDown={(event) => event.preventDefault()}
        onClick={onToggle}
        className={cx(
          "inline-flex h-7 items-center gap-1.5 rounded-full px-1.5 text-ink-3 transition-[background-color,color,transform] duration-150 hover:bg-hover hover:text-ink active:scale-[0.96]",
          open && "bg-hover text-ink",
        )}
      >
        {icon}
        <span>{value}</span>
        <AgentComposerIcon size={11} strokeWidth={2.4}>
          <path d="M6 9l6 6 6-6" />
        </AgentComposerIcon>
      </button>
      {open ? (
        <div
          role="listbox"
          aria-label={label}
          className={cx("absolute left-0 top-full z-50 mt-1.5 w-44", PROMPT_BAR_DROPDOWN_PANEL)}
          style={{ animation: PROMPT_BAR_DROPDOWN_MOTION, transformOrigin: "top left" }}
        >
          {options.map((option) => (
            <button
              key={option}
              type="button"
              role="option"
              aria-selected={option === value}
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => onSelect(option)}
              className="flex min-h-9 w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-meta text-ink hover:bg-hover"
            >
              <span className="min-w-0 flex-1 truncate">{option}</span>
              {option === value ? (
                <AgentComposerIcon size={13} strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" />
                </AgentComposerIcon>
              ) : null}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function ContextMeter({ value, className }: { value: number; className?: string }) {
  const amount = Math.min(1, Math.max(0, value));
  const radius = 6.5;
  const circumference = 2 * Math.PI * radius;
  const percent = Math.round(amount * 100);

  return (
    <span className={cx("inline-flex h-7 items-center gap-1.5 px-1.5 tabular-nums text-ink-3", className)}>
      <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden>
        <circle cx="8" cy="8" r={radius} fill="none" stroke="var(--line)" strokeWidth="1.5" />
        <circle
          cx="8"
          cy="8"
          r={radius}
          fill="none"
          stroke="var(--ink-2)"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeDasharray={`${circumference * amount} ${circumference}`}
          transform="rotate(-90 8 8)"
        />
      </svg>
      <span>{percent}%</span>
    </span>
  );
}
