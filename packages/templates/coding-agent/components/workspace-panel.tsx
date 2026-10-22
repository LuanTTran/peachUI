"use client";

/**
 * Right workspace panel — Code / Preview tabs.
 * Code = file tab strip + code view + pinned diff card. Preview = fake browser.
 * Floats as a rounded panel card; the view switcher is the shared
 * SegmentedControl atom.
 */

import type { CSSProperties } from "react";
import { CloseButton } from "@/components/atoms/close-button";
import { SegmentedControl, SegmentedControlItem } from "@/components/atoms/segmented-control";
import type { DiffPatch, StudioFile } from "../data";
import { CodeView } from "./code-view";
import { DiffCard, type DiffStatus } from "./diff-card";
import { AppPreview } from "./app-preview";
import { cx } from "@/lib/utils";

export type PanelTab = "code" | "preview";

export function WorkspacePanel({
  tab,
  onTabChange,
  onClose,
  files,
  openFileId,
  onOpenFile,
  diff,
  diffStatus,
  onApprove,
  onRequestChanges,
  previewBanner,
  previewBadge,
  className,
  style,
}: {
  tab: PanelTab;
  onTabChange: (tab: PanelTab) => void;
  onClose: () => void;
  files: StudioFile[];
  openFileId: string;
  onOpenFile: (id: string) => void;
  diff: DiffPatch | null;
  diffStatus: DiffStatus | "none";
  onApprove: () => void;
  onRequestChanges: () => void;
  previewBanner: boolean;
  previewBadge: boolean;
  className?: string;
  /** Desktop column width override (inline style wins over width classes). */
  style?: CSSProperties;
}) {
  const openFile = files.find((file) => file.id === openFileId) ?? files[0];

  return (
    <aside
      aria-label="Workspace"
      style={style}
      className={cx(
        "flex w-full flex-col overflow-hidden rounded-3xl border border-surface bg-canvas shadow-raised",
        className,
      )}
    >
      {/* panel tab bar */}
      <div className="flex h-11 shrink-0 items-center gap-2 border-b border-line px-3">
        <SegmentedControl
          aria-label="Workspace view"
          selectedKeys={[tab]}
          onSelectionChange={(keys) => {
            const next = [...keys][0];
            if (next === "code" || next === "preview") onTabChange(next);
          }}
        >
          <SegmentedControlItem id="code">Code</SegmentedControlItem>
          <SegmentedControlItem id="preview">
            <span className="inline-flex items-center gap-1.5">
              Preview
              {previewBadge ? (
                <span className="size-1.5 rounded-full bg-accent" aria-label="Updated" />
              ) : null}
            </span>
          </SegmentedControlItem>
        </SegmentedControl>
        <CloseButton
          size="sm"
          aria-label="Close workspace panel"
          onClick={onClose}
          className="ml-auto"
        />
      </div>

      {tab === "code" ? (
        <div className="flex min-h-0 flex-1 flex-col" role="tabpanel">
          {/* file tabs */}
          <div className="flex shrink-0 items-stretch gap-4 overflow-x-auto px-4" role="tablist" aria-label="Open files">
            {files.map((file) => {
              const name = file.path.split("/").pop() ?? file.path;
              const active = file.id === openFile?.id;
              return (
                <button
                  key={file.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => onOpenFile(file.id)}
                  className={cx(
                    "relative flex min-h-9 shrink-0 items-center gap-1.5 font-mono text-caption-1-regular transition-colors duration-100",
                    "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:transition-colors",
                    active ? "text-ink after:bg-accent" : "text-ink-3 after:bg-transparent hover:text-ink-2",
                  )}
                >
                  {name}
                  {file.changed ? <span className="size-1.5 rounded-full bg-accent" aria-label="Modified" /> : null}
                </button>
              );
            })}
          </div>

          {/* code tray — flush to the panel edges, one hairline above */}
          <div className="min-h-0 flex-1 overflow-y-auto border-t border-line bg-surface">
            {diff && diffStatus !== "none" ? (
              <div className="p-2">
                <DiffCard
                  patch={diff}
                  status={diffStatus}
                  onApprove={onApprove}
                  onRequestChanges={onRequestChanges}
                />
              </div>
            ) : null}
            <p className="px-4 pb-1 pt-3 font-mono text-caption-2-regular text-ink-3">
              {openFile?.path.split("/").map((part, i, parts) => (
                <span key={i} className={i === parts.length - 1 ? "text-ink-2" : undefined}>
                  {part}
                  {i < parts.length - 1 ? <span className="px-1 opacity-60">/</span> : null}
                </span>
              ))}
            </p>
            <CodeView lines={openFile?.lines ?? []} />
          </div>
        </div>
      ) : (
        <div className="min-h-0 flex-1" role="tabpanel">
          <AppPreview banner={previewBanner} />
        </div>
      )}
    </aside>
  );
}
