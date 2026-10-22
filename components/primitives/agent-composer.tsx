"use client";

import {
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import type { PermissionMode } from "@/components/types";
import { DEFAULT_AGENT_COMPOSER_CATALOG } from "@/components/data/agent-composer-defaults";
import {
  AGENT_COMPOSER_BRANDS,
  AGENT_COMPOSER_GLYPHS,
  AgentComposerIcon,
} from "@/components/primitives/agent-composer-icons";
import type {
  AgentComposerCatalog,
  AgentComposerMenuRow,
  AgentComposerModel,
} from "@/components/types";
import { PromptBar } from "@/components/primitives/prompt-bar";
import {
  PROMPT_BAR_DROPDOWN_PANEL,
  PROMPT_BAR_MENU_LAYER,
  PromptBarDropdown,
  usePromptBarDropdownPlacement,
} from "@/components/primitives/prompt-bar-dropdown";
import type { BorderBeamSize } from "@/components/border-beam";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";


function MenuSectionLabel({ children }: { children: ReactNode }) {
  return (
    <p className="px-2 pb-0.5 pt-1 text-[10.5px] font-medium uppercase tracking-[0.07em] text-ink-3">
      {children}
    </p>
  );
}

function MenuHint({ children }: { children: ReactNode }) {
  return (
    <div className="mt-1 border-t border-line px-2.5 py-2 text-[11px] leading-snug text-ink-3">{children}</div>
  );
}

const PERMISSION_LABELS: Record<PermissionMode, string> = {
  auto: "Auto",
  ask: "Ask",
  locked: "Locked",
};

function parseToken(draft: string): { kind: "at" | "slash"; query: string; start: number } | null {
  const match = /(^|\s)([@/])([\w-]*)$/.exec(draft);
  if (!match) return null;
  return {
    kind: match[2] === "@" ? "at" : "slash",
    query: match[3].toLowerCase(),
    start: match.index + match[1].length,
  };
}

export type AgentComposerProps = {
  variant?: "Rounded" | "Pill";
  inset?: boolean;
  tall?: boolean;
  placeholder?: string;
  beamActive?: boolean;
  beamSize?: BorderBeamSize;
  portalMenus?: boolean;
  menusFlipUp?: boolean | "auto";
  disabled?: boolean;
  draftSeed?: string;
  draftSeedVersion?: number;
  leadingSlot?: ReactNode;
  permission?: PermissionMode;
  onPermissionChange?: (mode: PermissionMode) => void;
  requestApprovalLabel?: string;
  onSend?: (text: string, attachments: string[]) => void;
  onAttachmentsChange?: (attachments: string[]) => void;
  className?: string;
  catalog?: AgentComposerCatalog;
};

export function AgentComposer({
  variant = "Rounded",
  inset = false,
  tall = false,
  placeholder,
  beamActive = true,
  beamSize = "sm",
  portalMenus = false,
  menusFlipUp = false,
  disabled = false,
  draftSeed,
  draftSeedVersion = 0,
  leadingSlot,
  permission = "auto",
  onPermissionChange,
  requestApprovalLabel = "Request approval",
  onSend,
  onAttachmentsChange,
  className,
  catalog = DEFAULT_AGENT_COMPOSER_CATALOG,
}: AgentComposerProps) {
  const { sources: catalogSources, commands: catalogCommands, models: catalogModels, attachFileNames: attachPool } =
    catalog;
  const dictationSample = catalog.dictationSample;

  const [draft, setDraft] = useState("");
  const [dismissed, setDismissed] = useState(false);
  const [plusOpen, setPlusOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);
  const [model, setModel] = useState(catalogModels[1] ?? catalogModels[0]);
  const [attachments, setAttachmentsState] = useState<string[]>([]);
  const attachmentsRef = useRef<string[]>([]);
  const setAttachments = (next: string[] | ((current: string[]) => string[])) => {
    const resolved = typeof next === "function" ? next(attachmentsRef.current) : next;
    attachmentsRef.current = resolved;
    setAttachmentsState(resolved);
    onAttachmentsChange?.(resolved);
  };
  const [connected, setConnected] = useState(false);
  const [active, setActive] = useState(0);
  const [listening, setListening] = useState(false);
  const [permissionOpen, setPermissionOpen] = useState(false);
  const [rowBox, setRowBox] = useState<{ top: number; height: number } | null>(null);
  const [engaged, setEngaged] = useState(false);
  const [modelBox, setModelBox] = useState<{ top: number; height: number } | null>(null);
  const [modelHovered, setModelHovered] = useState<number | null>(null);
  const [attachHovered, setAttachHovered] = useState<number | null>(null);
  const [attachBox, setAttachBox] = useState<{ top: number; height: number } | null>(null);
  const [modelMenuLeft, setModelMenuLeft] = useState(0);
  const [attachMenuLeft, setAttachMenuLeft] = useState(0);
  const [permissionMenuLeft, setPermissionMenuLeft] = useState(0);
  const menuPortal = inset || portalMenus;
  const [autoFlipUp, setAutoFlipUp] = useState(false);
  const menuFlipUp = inset || menusFlipUp === true || (menusFlipUp === "auto" && autoFlipUp);
  const MODEL_MENU_WIDTH = 224;
  const ATTACH_MENU_WIDTH = 288;
  const composerAnchorRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const modelRef = useRef<HTMLButtonElement>(null);
  const permissionRef = useRef<HTMLButtonElement>(null);
  const plusRef = useRef<HTMLButtonElement>(null);
  const rowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const modelRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const attachRowRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const dictationTimerRef = useRef<number | null>(null);
  const menuOpenRef = useRef({ modelOpen: false, plusOpen: false, permissionOpen: false, tokenMenu: false });
  const [prevDraftSeed, setPrevDraftSeed] = useState(draftSeed);
  const [prevDraftSeedVersion, setPrevDraftSeedVersion] = useState(draftSeedVersion);
  const [menuScopeKey, setMenuScopeKey] = useState("");

  const token = dismissed ? null : parseToken(draft);
  const menu: "at" | "slash" | null = plusOpen ? null : token?.kind ?? null;
  const query = token?.query ?? "";
  const nextMenuScopeKey = `${menu ?? ""}:${query}`;

  if (draftSeed !== undefined && (draftSeed !== prevDraftSeed || draftSeedVersion !== prevDraftSeedVersion)) {
    setPrevDraftSeed(draftSeed);
    setPrevDraftSeedVersion(draftSeedVersion);
    setDraft(draftSeed);
    setDismissed(false);
  }

  if (nextMenuScopeKey !== menuScopeKey) {
    setMenuScopeKey(nextMenuScopeKey);
    setActive(0);
    setEngaged(false);
    setAttachHovered(null);
  }

  useDomLayout(() => {
    menuOpenRef.current = { modelOpen, plusOpen, permissionOpen, tokenMenu: menu !== null };
  });

  const appliedSeedRef = useRef({ seed: draftSeed, version: 0 });
  useDomLayout(() => {
    const prev = appliedSeedRef.current;
    appliedSeedRef.current = { seed: draftSeed, version: draftSeedVersion };
    if (draftSeedVersion === 0) return;
    if (draftSeed === prev.seed && draftSeedVersion === prev.version) return;
    inputRef.current?.focus();
  });

  useMountEffect(() => {
    return () => {
      if (dictationTimerRef.current !== null) window.clearTimeout(dictationTimerRef.current);
    };
  });

  const rows: AgentComposerMenuRow[] =
    menu === "slash"
      ? catalogCommands.filter((c) => c.name.slice(1).startsWith(query)).map((c) => ({ key: c.key, name: c.name, desc: c.desc }))
      : [];

  const attachQuery = plusOpen ? "" : menu === "at" ? query : "";
  const attachQueryNorm = attachQuery.toLowerCase();
  const attachMenuRows: AgentComposerMenuRow[] = catalogSources
    .filter((s) => s.name.toLowerCase().includes(attachQueryNorm))
    .map((s) => ({ key: s.key, name: s.name, desc: s.desc }));
  const attachUploadRows = attachMenuRows.filter((row) => catalogSources.find((s) => s.key === row.key)?.attach);
  const attachToolRows = attachMenuRows.filter((row) => !catalogSources.find((s) => s.key === row.key)?.attach);
  const attachFlatRows = [...attachUploadRows, ...attachToolRows];
  const sourcesMenuOpen = plusOpen || menu === "at";

  const portalFlip = menusFlipUp === "auto" ? ("auto" as const) : menuFlipUp;

  const modelMenuPortalStyle = usePromptBarDropdownPlacement(
    modelOpen,
    modelRef,
    MODEL_MENU_WIDTH,
    portalFlip,
    composerAnchorRef,
  );
  const attachMenuPortalStyle = usePromptBarDropdownPlacement(
    sourcesMenuOpen,
    plusRef,
    ATTACH_MENU_WIDTH,
    portalFlip,
    composerAnchorRef,
  );
  const permissionMenuPortalStyle = usePromptBarDropdownPlacement(
    permissionOpen,
    permissionRef,
    MODEL_MENU_WIDTH,
    portalFlip,
    composerAnchorRef,
  );
  const slashMenuPortalStyle = usePromptBarDropdownPlacement(
    menu === "slash",
    composerAnchorRef,
    ATTACH_MENU_WIDTH,
    portalFlip,
    composerAnchorRef,
  );

  const modelIndex = catalogModels.findIndex((m) => m.key === model.key);

  useDomLayout(() => {
    if (menu === "slash") {
      const target = rowRefs.current[active];
      if (target) {
        const { offsetTop: top, offsetHeight: height } = target;
        setRowBox((box) => (box && box.top === top && box.height === height ? box : { top, height }));
      }
    }
    if (modelOpen) {
      const target = modelRowRefs.current[modelHovered ?? modelIndex];
      if (target) {
        const { offsetTop: top, offsetHeight: height } = target;
        setModelBox((box) => (box && box.top === top && box.height === height ? box : { top, height }));
      }
    }
    if (sourcesMenuOpen) {
      const target = attachRowRefs.current[attachHovered ?? (menu === "at" ? active : 0)];
      if (target) {
        const { offsetTop: top, offsetHeight: height } = target;
        setAttachBox((box) => (box && box.top === top && box.height === height ? box : { top, height }));
      }
    }
    if (menuPortal) return;
    const anchor = composerAnchorRef.current;
    if (!anchor) return;
    const anchorRect = anchor.getBoundingClientRect();
    const menuLeft = (trigger: HTMLElement | null, width: number) => {
      if (!trigger) return null;
      const triggerRect = trigger.getBoundingClientRect();
      return Math.max(0, Math.min(triggerRect.left - anchorRect.left, anchorRect.width - width));
    };
    const nextModelLeft = modelOpen ? menuLeft(modelRef.current, MODEL_MENU_WIDTH) : null;
    const nextAttachLeft = sourcesMenuOpen ? menuLeft(plusRef.current, ATTACH_MENU_WIDTH) : null;
    const nextPermissionLeft = permissionOpen ? menuLeft(permissionRef.current, MODEL_MENU_WIDTH) : null;
    if (nextModelLeft !== null) setModelMenuLeft((left) => (left === nextModelLeft ? left : nextModelLeft));
    if (nextAttachLeft !== null) setAttachMenuLeft((left) => (left === nextAttachLeft ? left : nextAttachLeft));
    if (nextPermissionLeft !== null) setPermissionMenuLeft((left) => (left === nextPermissionLeft ? left : nextPermissionLeft));
  });

  useMountEffect(() => {
    const close = (event: PointerEvent) => {
      const { modelOpen: modelMenuOpen, plusOpen: plusMenuOpen, permissionOpen: permissionMenuOpen, tokenMenu } =
        menuOpenRef.current;
      if (!modelMenuOpen && !plusMenuOpen && !permissionMenuOpen && !tokenMenu) return;
      if (!(event.target as Element).closest("[data-promptbar], [data-promptbar-menu]")) {
        setPlusOpen(false);
        setModelOpen(false);
        setPermissionOpen(false);
        setDismissed(true);
        setModelHovered(null);
        setAttachHovered(null);
      }
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  });

  const closeMenus = () => {
    setPlusOpen(false);
    setModelOpen(false);
    setPermissionOpen(false);
    setModelHovered(null);
    setAttachHovered(null);
  };

  const PERMISSIONS: PermissionMode[] = ["auto", "ask", "locked"];

  const selectModel = (next: AgentComposerModel) => {
    setModel(next);
    setModelOpen(false);
    setModelHovered(null);
  };

  const toggleDictation = () => {
    if (dictationTimerRef.current !== null) {
      window.clearTimeout(dictationTimerRef.current);
      dictationTimerRef.current = null;
      setListening(false);
      return;
    }
    setListening(true);
    dictationTimerRef.current = window.setTimeout(() => {
      setDraft((draftCurrent) => (draftCurrent ? `${draftCurrent.trimEnd()} ${dictationSample}` : dictationSample));
      setListening(false);
      dictationTimerRef.current = null;
      inputRef.current?.focus();
    }, 2200);
  };

  const pick = (row: AgentComposerMenuRow) => {
    if (row.person || row.key.startsWith("person:")) {
      setDraft(`${token ? draft.slice(0, token.start) : draft}@${row.name} `);
      setPlusOpen(false);
      setDismissed(false);
      inputRef.current?.focus();
      return;
    }
    const source = catalogSources.find((s) => s.key === row.key);
    if (source?.attach) {
      setAttachments((current) => [...current, attachPool[current.length % attachPool.length]]);
      if (token) setDraft(draft.slice(0, token.start));
    } else if (menu === "at" || plusOpen) {
      setDraft(`${token ? draft.slice(0, token.start) : draft}@${row.name} `);
    } else {
      setDraft(`${token ? draft.slice(0, token.start) : draft}${row.name} `);
    }
    setPlusOpen(false);
    setDismissed(false);
    inputRef.current?.focus();
  };

  const renderSourceRow = (row: AgentComposerMenuRow, index: number, listOffset: number) => {
    const source = catalogSources.find((s) => s.key === row.key);
    const showIcon = source?.brand || source?.glyph;
    const rowIndex = listOffset + index;
    return (
      <button
        key={row.key}
        type="button"
        disabled={disabled}
        ref={(el) => {
          attachRowRefs.current[rowIndex] = el;
        }}
        onMouseDown={(event) => event.preventDefault()}
        onMouseEnter={() => {
          setAttachHovered(rowIndex);
          if (menu === "at") {
            setActive(rowIndex);
            setEngaged(true);
          }
        }}
        onClick={() => pick(row)}
        className="relative z-10 flex min-h-9 w-full items-center gap-2.5 rounded-[8px] px-2 py-1.5 text-left disabled:pointer-events-none"
      >
        {showIcon && (
          <span className="flex size-6 shrink-0 items-center justify-center rounded-[7px] bg-field text-ink-2 shadow-hairline">
            {source?.brand ? AGENT_COMPOSER_BRANDS[source.brand] : (
              <AgentComposerIcon size={14}>{AGENT_COMPOSER_GLYPHS[source?.glyph ?? "clip"]}</AgentComposerIcon>
            )}
          </span>
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate text-[12.5px] font-medium text-ink">{row.name}</span>
          <span className="block truncate text-[11.5px] text-ink-3">{row.desc}</span>
        </span>
        {source?.connect ? (
          <span
            role="button"
            tabIndex={-1}
            onClick={(event) => {
              event.stopPropagation();
              setConnected((current) => !current);
            }}
            className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium transition-colors duration-100 ${
              connected ? "bg-green/15 text-green" : "bg-accent-muted text-accent-ink hover:bg-hover"
            }`}
          >
            {connected ? "Connected" : "Connect"}
          </span>
        ) : null}
      </button>
    );
  };

  const attachMenuBody = (
    <>
      <div
        className="relative max-h-[min(18rem,42vh)] overflow-y-auto overscroll-contain"
        onMouseLeave={() => setAttachHovered(null)}
      >
        <span
          aria-hidden
          className="pointer-events-none absolute inset-x-1 rounded-[8px] bg-hover"
          style={{
            top: attachBox?.top ?? 0,
            height: attachBox?.height ?? 0,
            opacity: attachBox && (attachHovered !== null || (menu === "at" && engaged)) ? 1 : 0,
            transition:
              "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
          }}
        />
        {attachUploadRows.length > 0 ? (
          <>
            <MenuSectionLabel>Upload</MenuSectionLabel>
            {attachUploadRows.map((row, i) => renderSourceRow(row, i, 0))}
          </>
        ) : null}
        {attachToolRows.length > 0 ? (
          <>
            <MenuSectionLabel>Sources &amp; tools</MenuSectionLabel>
            {attachToolRows.map((row, i) => renderSourceRow(row, i, attachUploadRows.length))}
          </>
        ) : null}
        {attachFlatRows.length === 0 ? (
          <div className="px-2 py-3 text-[12px] text-ink-3">
            {attachQuery ? `No matches for “${attachQuery}”` : "No sources available"}
          </div>
        ) : null}
      </div>
      <MenuHint>
        {menu === "at"
          ? "↑↓ to navigate · Enter to insert · Esc to close"
          : "Files upload locally in this demo. Type @ in the prompt to search everything."}
      </MenuHint>
    </>
  );

  const canSend =
    !disabled && permission !== "locked" && (draft.trim().length > 0 || attachments.length > 0);

  const send = () => {
    if (!canSend) return;
    onSend?.(draft.trim(), attachments);
    setDraft("");
    setAttachments([]);
    closeMenus();
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (menu === "at" && attachFlatRows.length > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setEngaged(true);
        setActive((current) => {
          const next = (current + (event.key === "ArrowDown" ? 1 : attachFlatRows.length - 1)) % attachFlatRows.length;
          setAttachHovered(next);
          return next;
        });
        return;
      }
      if ((event.key === "Enter" && !event.shiftKey) || event.key === "Tab") {
        event.preventDefault();
        pick(attachFlatRows[active]);
        return;
      }
    }
    if (menu === "slash" && rows.length > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        setEngaged(true);
        setActive((current) => (current + (event.key === "ArrowDown" ? 1 : rows.length - 1)) % rows.length);
        return;
      }
      if ((event.key === "Enter" && !event.shiftKey) || event.key === "Tab") {
        event.preventDefault();
        pick(rows[active]);
        return;
      }
    }
    if (event.key === "Escape") {
      setDismissed(true);
      closeMenus();
      return;
    }
    if (event.key === "Enter" && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      send();
    }
  };

  const menuOpen = Boolean(menu || modelOpen || plusOpen || permissionOpen);

  const measureAutoFlip = () => {
    const box = composerAnchorRef.current?.getBoundingClientRect();
    if (!box) return;
    const up = box.top > window.innerHeight - box.bottom;
    setAutoFlipUp((current) => (current === up ? current : up));
  };
  const flipModeRef = useRef(menusFlipUp);
  useDomLayout(() => {
    flipModeRef.current = menusFlipUp;
    if (menusFlipUp === "auto") measureAutoFlip();
  });
  useMountEffect(() => {
    const onResize = () => {
      if (flipModeRef.current === "auto") measureAutoFlip();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  });

  return (
    <div
      data-promptbar
      data-menu-open={menuOpen ? "" : undefined}
      className={cx("relative w-full", menuOpen && `isolate ${PROMPT_BAR_MENU_LAYER}`, className)}
    >
      <div ref={composerAnchorRef} className={`relative overflow-visible ${menuOpen ? PROMPT_BAR_MENU_LAYER : ""}`}>
        <PromptBarDropdown
          open={sourcesMenuOpen}
          portal={menuPortal}
          portalStyle={attachMenuPortalStyle}
          anchoredStyle={
            menuPortal
              ? undefined
              : menuFlipUp
                ? {
                    position: "absolute",
                    left: attachMenuLeft,
                    bottom: "calc(100% + 6px)",
                    width: ATTACH_MENU_WIDTH,
                    zIndex: 50,
                  }
                : {
                    position: "absolute",
                    left: attachMenuLeft,
                    top: "calc(100% + 6px)",
                    width: ATTACH_MENU_WIDTH,
                    zIndex: 50,
                  }
          }
          className={`${PROMPT_BAR_MENU_LAYER} ${PROMPT_BAR_DROPDOWN_PANEL} ${menuPortal ? "" : "absolute"}`}
          origin={menuFlipUp ? "bottom left" : "top left"}
        >
          {attachMenuBody}
        </PromptBarDropdown>

        <PromptBarDropdown
          open={modelOpen}
          portal={menuPortal}
          portalStyle={modelMenuPortalStyle}
          anchoredStyle={
            menuPortal
              ? undefined
              : menuFlipUp
                ? {
                    position: "absolute",
                    left: modelMenuLeft,
                    bottom: "calc(100% + 6px)",
                    width: MODEL_MENU_WIDTH,
                    zIndex: 50,
                  }
                : {
                    position: "absolute",
                    left: modelMenuLeft,
                    top: "calc(100% + 6px)",
                    width: MODEL_MENU_WIDTH,
                    zIndex: 50,
                  }
          }
          className={`${PROMPT_BAR_MENU_LAYER} ${PROMPT_BAR_DROPDOWN_PANEL} ${menuPortal ? "" : "absolute"}`}
          origin={menuFlipUp ? "bottom left" : "top left"}
        >
          <div onMouseLeave={() => setModelHovered(null)}>
            <MenuSectionLabel>Model</MenuSectionLabel>
            <div className="relative">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-1 rounded-[8px] bg-hover"
                style={{
                  top: modelBox?.top ?? 0,
                  height: modelBox?.height ?? 0,
                  opacity: modelBox && modelHovered !== null ? 1 : 0,
                  transition:
                    "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
                }}
              />
              {catalogModels.map((m, i) => (
                <button
                  key={m.key}
                  type="button"
                  ref={(el) => {
                    modelRowRefs.current[i] = el;
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => setModelHovered(i)}
                  onClick={() => {
                    selectModel(m);
                    inputRef.current?.focus();
                  }}
                  className="relative z-10 flex min-h-9 w-full items-center gap-2 rounded-[8px] px-2 py-1.5 text-left"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-[12.5px] font-medium text-ink">{m.name}</span>
                    <span className="block truncate text-[11px] text-ink-3">
                      {m.key === "peach-1"
                        ? "Best for long reasoning"
                        : m.key === "peach-lite"
                          ? "Quick replies"
                          : "On-device only"}
                    </span>
                  </span>
                  <span className="shrink-0 rounded-full bg-field px-2 py-0.5 text-[10.5px] font-medium text-ink-2 shadow-hairline">
                    {m.tag}
                  </span>
                  <span
                    className={`flex size-5 shrink-0 items-center justify-center text-ink ${m.key === model.key ? "" : "invisible"}`}
                  >
                    <AgentComposerIcon size={13} strokeWidth={2.5}>
                      <path d="M20 6L9 17l-5-5" />
                    </AgentComposerIcon>
                  </span>
                </button>
              ))}
            </div>
            <MenuHint>Dictation and attachments use the selected model.</MenuHint>
          </div>
        </PromptBarDropdown>

        <PromptBarDropdown
          open={permissionOpen}
          portal={menuPortal}
          portalStyle={permissionMenuPortalStyle}
          anchoredStyle={
            menuPortal
              ? undefined
              : {
                  position: "absolute",
                  left: permissionMenuLeft,
                  top: menuFlipUp ? undefined : "calc(100% + 6px)",
                  bottom: menuFlipUp ? "calc(100% + 6px)" : undefined,
                  width: MODEL_MENU_WIDTH,
                  zIndex: 50,
                }
          }
          className={`${PROMPT_BAR_MENU_LAYER} ${PROMPT_BAR_DROPDOWN_PANEL} ${menuPortal ? "" : "absolute"}`}
          origin={menuFlipUp ? "bottom left" : "top left"}
        >
          <MenuSectionLabel>Permission</MenuSectionLabel>
          {PERMISSIONS.map((mode) => (
            <button
              key={mode}
              type="button"
              onMouseDown={(event) => event.preventDefault()}
              onClick={() => {
                onPermissionChange?.(mode);
                setPermissionOpen(false);
                inputRef.current?.focus();
              }}
              className="flex min-h-9 w-full items-center gap-2 rounded-control px-2 py-1.5 text-left text-meta text-ink hover:bg-hover"
            >
              <span className="flex-1 font-medium">{PERMISSION_LABELS[mode]}</span>
              {permission === mode ? (
                <AgentComposerIcon size={13} strokeWidth={2.5}>
                  <path d="M20 6L9 17l-5-5" />
                </AgentComposerIcon>
              ) : null}
            </button>
          ))}
          <MenuHint>Controls whether tools run without asking.</MenuHint>
        </PromptBarDropdown>

        <PromptBar
          variant={variant}
          inset={inset}
          tall={tall}
          disabled={disabled}
          placeholder={placeholder}
          listening={listening}
          beamActive={beamActive}
          beamSize={beamSize}
          leadingSlot={leadingSlot}
          value={draft}
          onChange={(next) => {
            setDraft(next);
            setDismissed(false);
            setPlusOpen(false);
          }}
          onKeyDown={handleKeyDown}
          inputRef={inputRef}
          attachments={attachments}
          onRemoveAttachment={(i) => setAttachments((current) => current.filter((_, j) => j !== i))}
          canSend={canSend}
          onSend={send}
          permission={permission}
          requestApprovalLabel={requestApprovalLabel}
          modelName={model.name}
          plusOpen={plusOpen}
          sourcesMenuOpen={sourcesMenuOpen}
          modelOpen={modelOpen}
          permissionOpen={permissionOpen}
          onPlusClick={() => {
            setModelOpen(false);
            setPermissionOpen(false);
            setAttachHovered(null);
            setPlusOpen((current) => !current);
            inputRef.current?.focus();
          }}
          onPermissionClick={() => {
            setPlusOpen(false);
            setModelOpen(false);
            setAttachHovered(null);
            setPermissionOpen((current) => !current);
          }}
          onModelClick={() => {
            setPlusOpen(false);
            setPermissionOpen(false);
            setAttachHovered(null);
            setModelOpen((current) => {
              if (current) setModelHovered(null);
              return !current;
            });
          }}
          onDictationClick={toggleDictation}
          plusRef={plusRef}
          modelRef={modelRef}
          permissionRef={permissionRef}
        />

        <PromptBarDropdown
          open={menu === "slash"}
          portal={menuPortal}
          portalStyle={slashMenuPortalStyle}
          anchoredStyle={
            menuPortal
              ? undefined
              : menuFlipUp
                ? {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    bottom: "100%",
                    marginBottom: 8,
                    zIndex: 50,
                  }
                : {
                    position: "absolute",
                    left: 0,
                    right: 0,
                    top: "100%",
                    marginTop: 8,
                    zIndex: 50,
                  }
          }
          className={cx(
            PROMPT_BAR_MENU_LAYER,
            PROMPT_BAR_DROPDOWN_PANEL,
            !menuPortal && (menuFlipUp ? "absolute inset-x-0 bottom-full mb-2" : "absolute inset-x-0 top-full mt-2"),
          )}
          origin={menuFlipUp ? "bottom center" : "top center"}
        >
          <div onMouseLeave={() => setEngaged(false)}>
            <MenuSectionLabel>Commands</MenuSectionLabel>
            <div className="relative max-h-[min(16rem,40vh)] overflow-y-auto overscroll-contain">
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-1 rounded-[6px] bg-hover"
                style={{
                  top: rowBox?.top ?? 0,
                  height: rowBox?.height ?? 0,
                  opacity: rowBox && engaged && rows.length > 0 ? 1 : 0,
                  transition:
                    "top 220ms cubic-bezier(0.23,1,0.32,1), height 220ms cubic-bezier(0.23,1,0.32,1), opacity 150ms ease",
                }}
              />
              {rows.map((row, i) => (
                <button
                  key={row.key}
                  type="button"
                  disabled={disabled}
                  ref={(el) => {
                    rowRefs.current[i] = el;
                  }}
                  onMouseDown={(event) => event.preventDefault()}
                  onMouseEnter={() => {
                    setActive(i);
                    setEngaged(true);
                  }}
                  onClick={() => pick(row)}
                  className="relative z-10 flex min-h-9 w-full items-center gap-2.5 rounded-[8px] px-2 py-1 text-left disabled:pointer-events-none"
                >
                  <span className="shrink-0 text-[12.5px] font-medium text-ink">{row.name}</span>
                  <span className="min-w-0 flex-1 truncate text-[12px] text-ink-3">{row.desc}</span>
                </button>
              ))}
              {rows.length === 0 && (
                <div className="flex h-9 items-center px-2 text-[12px] text-ink-3">
                  No matches for “{query}”
                </div>
              )}
            </div>
            <MenuHint>↑↓ to navigate · Enter to run · Esc to close</MenuHint>
          </div>
        </PromptBarDropdown>
      </div>
    </div>
  );
}

export type { AgentComposerCatalog, AgentComposerPerson, PromptBarPerson } from "@/components/types";
