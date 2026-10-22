"use client";

/**
 * PeachUI — Dropzone (block)
 * @tier block
 * @deps chip, button, close-button, file-upload, icons, motion, hairline (file-spread)
 * @requires app/globals.css
 *
 * Multi-file drop target and a scrolling queue. The host owns every row:
 * this block validates a drop, then calls `onAdd` / `onReject`. Progress,
 * completion, and connection failures arrive through `items`.
 *
 * Keyboard: Tab reaches the drop target; Enter or Space opens the file
 * dialog. Retry, remove, and Clear are buttons. Drag-and-drop is the
 * pointer path for the same add action.
 */

import { useId, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { DocumentText2, File, FileText, Film, Gallery, Refresh } from "reicon-react";
import { DropzoneIconHairline } from "@/components/blocks/dropzone/dropzone-icon-hairline";
import { blockEase, zoneTransition } from "@/components/lib/block-motion";
import { Button } from "@/components/atoms/button";
import { Chip, type ChipProps } from "@/components/atoms/chip";
import { CloseButton } from "@/components/atoms/close-button";
import { formatFileSize } from "@/components/atoms/file-upload";
import { TickCircleFilled, WarningFilled } from "@/components/atoms/icons";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const DEFAULT_ACCEPT = ["pdf", "png", "jpg", "jpeg", "xlsx"] as const;
const DEFAULT_MAX_BYTES = 25 * 1024 * 1024;
const DEFAULT_MAX_FILES = 8;

export type DropzoneItemStatus = "uploading" | "complete" | "error";
export type DropzoneItemError = "size" | "connection";
export type DropzoneRejectReason = "type" | "size" | "limit";

export type DropzoneItem = {
  id: string;
  name: string;
  /** Total size in bytes. */
  size: number;
  /** Bytes transferred. Complete rows can omit this. */
  loaded?: number;
  /** Whole seconds remaining while uploading. */
  secondsLeft?: number;
  status: DropzoneItemStatus;
  error?: DropzoneItemError;
};

export type DropzoneRejection = {
  name: string;
  reason: DropzoneRejectReason;
};

export type DropzoneLabels = {
  invite: string;
  browse: string;
  hint: (types: string, maxSize: string) => string;
  releaseOne: string;
  releaseMany: (count: number) => string;
  empty: string;
  clear: string;
  retry: string;
  remove: (name: string) => string;
  /** Loaded amount, total size, and seconds remaining. Pass 0 seconds to omit the time. */
  progress: (loaded: string, total: string, seconds: number) => string;
  uploading: (active: number, total: number, loaded: string, size: string) => string;
  uploaded: (done: number, total: number) => string;
  sizeError: (maxSize: string) => string;
  connectionError: string;
  typeError: (types: string) => string;
  limitError: (maxFiles: number) => string;
  skipped: (types: string, maxSize: string, maxFiles: number) => string;
  uploadedHidden: string;
  queueLabel: string;
};

export const defaultDropzoneLabels: DropzoneLabels = {
  invite: "Add files, or",
  browse: "browse",
  hint: (types, maxSize) => `${types}. Up to ${maxSize} each.`,
  releaseOne: "Drop 1 file to add it",
  releaseMany: (count) => `Drop ${count} files to add them`,
  empty: "Files you add show up here.",
  clear: "Clear",
  retry: "Try again",
  remove: (name) => `Remove ${name}`,
  progress: (loaded, total, seconds) =>
    seconds > 0
      ? `${loaded} of ${total} · ${seconds === 1 ? "1 second left" : `${seconds} seconds left`}`
      : `${loaded} of ${total}`,
  uploading: (active, total, loaded, size) => `Uploading ${active} of ${total} · ${loaded} of ${size}`,
  uploaded: (done, total) => `${done} of ${total} uploaded`,
  sizeError: (maxSize) => `Choose a file up to ${maxSize}.`,
  connectionError: "Check your connection and try again.",
  typeError: (types) => `Use a ${types} file.`,
  limitError: (maxFiles) => `You can add up to ${maxFiles} files.`,
  skipped: (types, maxSize, maxFiles) =>
    `Some files were skipped. Use a ${types} file up to ${maxSize}. You can add up to ${maxFiles} files.`,
  uploadedHidden: "Uploaded",
  queueLabel: "Files",
};

export type DropzoneProps = {
  items: DropzoneItem[];
  /** Extensions without dots. Unknown types are refused and never added. */
  accept?: readonly string[];
  /** Largest file the zone will accept, in bytes. */
  maxBytes?: number;
  /** Most files the queue can hold at once. Further drops are refused. */
  maxFiles?: number;
  onAdd: (files: File[]) => void;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
  onClear: () => void;
  onReject?: (rejections: DropzoneRejection[]) => void;
  labels?: Partial<DropzoneLabels>;
  className?: string;
};

type FileKind = "pdf" | "image" | "sheet" | "video" | "file";

const KIND_CHIP: Record<FileKind, NonNullable<ChipProps["color"]>> = {
  pdf: "rose",
  image: "purple",
  sheet: "lime",
  video: "yellow",
  file: "neutral",
};

const KIND_ICON = {
  pdf: FileText,
  image: Gallery,
  sheet: DocumentText2,
  video: Film,
  file: File,
} as const;

const iconSwap = {
  initial: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  animate: { opacity: 1, scale: 1, filter: "blur(0px)" },
  exit: { opacity: 0, scale: 0.25, filter: "blur(4px)" },
  transition: { type: "spring" as const, duration: 0.3, bounce: 0 },
};

function extensionFor(name: string) {
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ext === name.toLowerCase() ? "" : ext;
}

function kindFor(name: string): FileKind {
  const ext = extensionFor(name);
  if (ext === "pdf") return "pdf";
  if (["png", "jpg", "jpeg", "gif", "webp"].includes(ext)) return "image";
  if (["xls", "xlsx", "csv"].includes(ext)) return "sheet";
  if (["mp4", "mov", "webm"].includes(ext)) return "video";
  return "file";
}

function typeList(accept: readonly string[]) {
  const labels = accept
    .filter((ext) => ext.toLowerCase() !== "jpeg")
    .map((ext) => ext.toUpperCase());
  if (labels.length <= 1) return labels[0] ?? "supported";
  return `${labels.slice(0, -1).join(", ")}, or ${labels[labels.length - 1]}`;
}

function dragFileCount(transfer: DataTransfer) {
  return Array.from(transfer.items).filter((item) => item.kind === "file").length;
}

function formatBytes(bytes: number) {
  if (bytes <= 0) return "0 KB";
  return formatFileSize(bytes);
}

function TypeMark({ name }: { name: string }) {
  const kind = kindFor(name);
  const Icon = KIND_ICON[kind];
  const ext = (extensionFor(name) || "file").slice(0, 4).toUpperCase();

  return (
    <Chip variant="caption" color={KIND_CHIP[kind]} className="mt-0.5 shrink-0 gap-1">
      <Icon className="size-3 shrink-0" aria-hidden />
      {ext}
    </Chip>
  );
}

function FileRow({
  item,
  maxSizeLabel,
  labels,
  reduced,
  onRemove,
  onRetry,
}: {
  item: DropzoneItem;
  maxSizeLabel: string;
  labels: DropzoneLabels;
  reduced: boolean;
  onRemove: (id: string) => void;
  onRetry: (id: string) => void;
}) {
  const loaded = item.loaded ?? (item.status === "complete" ? item.size : 0);
  const ratio = item.size > 0 ? Math.min(1, Math.max(0, loaded / item.size)) : 0;
  const failed = item.status === "error";
  const showBar = item.status === "uploading" || (failed && item.error === "connection" && loaded > 0);
  const detail = failed
    ? item.error === "size"
      ? labels.sizeError(maxSizeLabel)
      : labels.connectionError
    : item.status === "complete"
      ? formatBytes(item.size)
      : labels.progress(formatBytes(loaded), formatBytes(item.size), item.secondsLeft ?? 0);

  return (
    <motion.li
      layout={reduced ? false : "position"}
      initial={reduced ? { opacity: 0 } : { opacity: 0, y: 8, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={reduced ? { opacity: 0 } : { opacity: 0, y: 4 }}
      transition={{ duration: reduced ? 0 : 0.22, ease: blockEase }}
      className="px-3 py-2.5"
    >
      <div className="flex items-start gap-2.5">
        <TypeMark name={item.name} />
        <div className="min-w-0 flex-1">
          <p className="flex min-w-0 items-center gap-1.5">
            <span className="truncate text-body-strong">{item.name}</span>
            <AnimatePresence initial={false}>
              {item.status === "complete" ? (
                <motion.span
                  key="done"
                  className="inline-flex shrink-0 text-green"
                  initial={reduced ? { opacity: 0 } : iconSwap.initial}
                  animate={iconSwap.animate}
                  exit={reduced ? { opacity: 0 } : iconSwap.exit}
                  transition={reduced ? { duration: 0 } : iconSwap.transition}
                >
                  <TickCircleFilled className="size-3.5" aria-hidden />
                  <span className="sr-only">{labels.uploadedHidden}</span>
                </motion.span>
              ) : null}
            </AnimatePresence>
          </p>
          <p className={cx("text-meta tabular-nums", failed && "text-red")}>{detail}</p>
          {showBar ? (
            <div
              className="mt-2 h-1 overflow-hidden rounded-full bg-line-soft"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={item.size}
              aria-valuenow={Math.round(loaded)}
              aria-label={labels.progress(formatBytes(loaded), formatBytes(item.size), item.secondsLeft ?? 0)}
            >
              <span
                className={cx(
                  "block h-full w-full origin-left motion-reduce:transition-none",
                  "transition-transform duration-300 ease-out",
                  failed ? "bg-red" : "bg-accent",
                )}
                style={{ transform: `scaleX(${ratio})` }}
              />
            </div>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {failed && item.error === "connection" ? (
            <Button
              variant="secondary"
              size="xs"
              iconOnly
              leadingIcon={Refresh}
              aria-label={labels.retry}
              onClick={() => onRetry(item.id)}
            />
          ) : null}
          <CloseButton size="sm" aria-label={labels.remove(item.name)} onClick={() => onRemove(item.id)} />
        </div>
      </div>
    </motion.li>
  );
}

export function Dropzone({
  items,
  accept = DEFAULT_ACCEPT,
  maxBytes = DEFAULT_MAX_BYTES,
  maxFiles = DEFAULT_MAX_FILES,
  onAdd,
  onRemove,
  onRetry,
  onClear,
  onReject,
  labels: labelsProp,
  className,
}: DropzoneProps) {
  const labels = { ...defaultDropzoneLabels, ...labelsProp };
  const reduced = useReducedMotion() ?? false;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const noticeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeId = useId();
  const [dragOver, setDragOver] = useState(false);
  const [dragCount, setDragCount] = useState(0);
  const [zoneEngaged, setZoneEngaged] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const spreadIntensity = dragOver || zoneEngaged ? 1 : 0;

  const types = typeList(accept);
  const maxSizeLabel = formatFileSize(maxBytes);
  const hint = labels.hint(types, maxSizeLabel);

  useMountEffect(() => () => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
  });

  const showNotice = (message: string) => {
    if (noticeTimer.current) clearTimeout(noticeTimer.current);
    setNotice(message);
    noticeTimer.current = setTimeout(() => setNotice(null), 4000);
  };

  const noticeFor = (rejections: DropzoneRejection[]) => {
    const reasons = new Set(rejections.map((rejection) => rejection.reason));
    if (reasons.size > 1) return labels.skipped(types, maxSizeLabel, maxFiles);
    if (reasons.has("type")) return labels.typeError(types);
    if (reasons.has("size")) return labels.sizeError(maxSizeLabel);
    return labels.limitError(maxFiles);
  };

  const takeFiles = (list: FileList | null) => {
    if (!list?.length) return;
    const allowed = new Set(accept.map((ext) => ext.toLowerCase()));
    const room = Math.max(0, maxFiles - items.length);
    const accepted: File[] = [];
    const rejections: DropzoneRejection[] = [];

    for (const file of Array.from(list)) {
      const ext = extensionFor(file.name);
      if (!allowed.has(ext)) {
        rejections.push({ name: file.name, reason: "type" });
        continue;
      }
      if (file.size > maxBytes) {
        rejections.push({ name: file.name, reason: "size" });
        continue;
      }
      if (accepted.length >= room) {
        rejections.push({ name: file.name, reason: "limit" });
        continue;
      }
      accepted.push(file);
    }

    if (accepted.length > 0) onAdd(accepted);
    if (rejections.length > 0) {
      onReject?.(rejections);
      showNotice(noticeFor(rejections));
    }
  };

  const uploading = items.filter((item) => item.status === "uploading");
  const complete = items.filter((item) => item.status === "complete");
  const failed = items.some((item) => item.status === "error");
  const countable = items.filter((item) => item.error !== "size");
  const loadedBytes = countable.reduce((sum, item) => {
    if (item.status === "complete") return sum + item.size;
    return sum + (item.loaded ?? 0);
  }, 0);
  const totalBytes = countable.reduce((sum, item) => sum + item.size, 0);
  const summary = uploading.length > 0
    ? labels.uploading(uploading.length, items.length, formatBytes(loadedBytes), formatBytes(totalBytes))
    : labels.uploaded(complete.length, items.length);

  return (
    <section
      className={cx(
        "flex w-full max-w-110 flex-col overflow-hidden rounded-card border border-line bg-surface shadow-card",
        className,
      )}
    >
      <div className="shrink-0 p-2">
        <input
          ref={inputRef}
          type="file"
          multiple
          tabIndex={-1}
          accept={accept.map((ext) => `.${ext}`).join(",")}
          className="sr-only"
          onChange={(event) => {
            takeFiles(event.target.files);
            event.target.value = "";
          }}
        />
        <motion.button
          type="button"
          aria-describedby={notice ? noticeId : undefined}
          transition={zoneTransition}
          onClick={() => inputRef.current?.click()}
          onFocus={() => setZoneEngaged(true)}
          onBlur={() => setZoneEngaged(false)}
          onPointerEnter={() => setZoneEngaged(true)}
          onPointerLeave={() => setZoneEngaged(false)}
          onDragEnter={(event) => {
            event.preventDefault();
            dragDepth.current += 1;
            setDragOver(true);
            setDragCount(dragFileCount(event.dataTransfer));
          }}
          onDragOver={(event) => {
            event.preventDefault();
            event.dataTransfer.dropEffect = "copy";
          }}
          onDragLeave={() => {
            dragDepth.current = Math.max(0, dragDepth.current - 1);
            if (dragDepth.current === 0) setDragOver(false);
          }}
          onDrop={(event) => {
            event.preventDefault();
            dragDepth.current = 0;
            setDragOver(false);
            takeFiles(event.dataTransfer.files);
          }}
          className={cx(
            "flex w-full cursor-pointer flex-col items-center gap-4 rounded-control border px-4 py-8 text-center",
            "outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2",
            "transition-[background-color,border-color,transform] duration-200 motion-reduce:transition-none",
            dragOver
              ? "border-solid border-accent bg-accent-muted"
              : zoneEngaged
                ? "border-dashed border-line-strong bg-hover"
                : "border-dashed border-line bg-canvas",
          )}
          style={{ transitionTimingFunction: blockEase.join(",") }}
        >
          <span
            className={cx(
              "relative flex size-16 items-center justify-center overflow-visible rounded-full border border-line-soft",
              "shadow-hairline transition-[background-color,border-color,box-shadow] duration-200 motion-reduce:transition-none",
              dragOver
                ? "border-accent/30 bg-surface text-accent-ink shadow-card"
                : zoneEngaged
                  ? "border-line-strong bg-surface text-ink"
                  : "bg-canvas text-ink-2",
            )}
            style={{ transitionTimingFunction: blockEase.join(",") }}
          >
            <DropzoneIconHairline
              intensity={reduced ? (spreadIntensity > 0 ? 1 : 0) : spreadIntensity}
              className="text-ink"
            />
          </span>
          <span className="pointer-events-none flex flex-col items-center gap-1">
            <AnimatePresence initial={false} mode="popLayout">
              <motion.span
                key={dragOver ? "release-copy" : "idle-copy"}
                className="text-section-title"
                initial={reduced ? { opacity: 0 } : { opacity: 0, y: 6, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={reduced ? { opacity: 0 } : { opacity: 0, y: -4 }}
                transition={{ duration: reduced ? 0 : zoneTransition.duration, ease: blockEase }}
              >
                {dragOver ? (
                  dragCount === 1 ? labels.releaseOne : labels.releaseMany(Math.max(dragCount, 1))
                ) : (
                  <>
                    {labels.invite} <span className="text-accent-600">{labels.browse}</span>
                  </>
                )}
              </motion.span>
            </AnimatePresence>
            <span className="text-caption">{hint}</span>
          </span>
        </motion.button>
        <p id={noticeId} role="status" className={cx("px-2 pt-2 text-center text-meta text-red", !notice && "sr-only")}>
          {notice ?? ""}
        </p>
      </div>

      <div className="flex min-h-0 flex-col">
        {items.length === 0 ? (
          <p className="px-4 py-4 text-meta text-ink-3">{labels.empty}</p>
        ) : (
          <ul aria-label={labels.queueLabel} className="max-h-60 min-h-0 divide-y divide-line-soft overflow-y-auto overscroll-contain">
            <AnimatePresence initial={false}>
              {items.map((item) => (
                <FileRow
                  key={item.id}
                  item={item}
                  maxSizeLabel={maxSizeLabel}
                  labels={labels}
                  reduced={reduced}
                  onRemove={onRemove}
                  onRetry={onRetry}
                />
              ))}
            </AnimatePresence>
          </ul>
        )}
      </div>

      {items.length > 0 ? (
        <footer className="flex shrink-0 items-center justify-between gap-3 border-t border-line-soft px-3 py-2.5">
          <p className="flex min-w-0 items-center gap-1.5 text-meta tabular-nums">
            {uploading.length === 0 && failed ? (
              <WarningFilled className="size-3.5 shrink-0 text-warning" aria-hidden />
            ) : null}
            {uploading.length === 0 && !failed ? (
              <TickCircleFilled className="size-3.5 shrink-0 text-green" aria-hidden />
            ) : null}
            <span className="truncate">{summary}</span>
          </p>
          <Button variant="secondary" size="small" onClick={onClear}>
            {labels.clear}
          </Button>
        </footer>
      ) : null}
    </section>
  );
}
