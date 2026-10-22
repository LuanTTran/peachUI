"use client";

import { useRef, useState, type ReactNode, type TransitionEvent } from "react";
import { CloudUpload, DocumentText2, FileText, Image } from "reicon-react";
import { useReducedMotion } from "motion/react";
import { useElementSize } from "@/lib/use-element-size";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

const DEFAULT_MAX_BYTES = 8 * 1024 * 1024;
const DEFAULT_EXTENSIONS = ["pdf", "jpg", "jpeg", "png", "xlsx"] as const;

type UploadPhase = "idle" | "uploading" | "complete";
type StaggerState = "shown" | "hiding" | "hidden";

export interface FileUploadProps {
  onUploadComplete?: (file: File) => void;
  allowedExtensions?: readonly string[];
  maxBytes?: number;
  renderFileIcon?: (file: File) => ReactNode;
  className?: string;
}

export function formatFileSize(bytes: number) {
  if (bytes >= 1024 * 1024) {
    const mb = bytes / (1024 * 1024);
    return `${mb >= 10 ? Math.round(mb) : Math.round(mb * 10) / 10} MB`;
  }
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

function extensionFor(fileName: string) {
  return fileName.split(".").pop()?.toLowerCase() ?? "";
}

function DefaultFileIcon({ file }: { file: File }) {
  const extension = extensionFor(file.name);
  const Icon = extension === "xlsx"
    ? DocumentText2
    : ["jpg", "jpeg", "png"].includes(extension)
      ? Image
      : FileText;

  return <Icon className="size-6 shrink-0 text-ink-2" aria-hidden />;
}

function useStaggerState(active: boolean): {
  state: StaggerState;
  onTransitionEnd: (event: TransitionEvent) => void;
} {
  const reduced = useReducedMotion() ?? false;
  const [prevActive, setPrevActive] = useState(active);
  const [hiding, setHiding] = useState(false);

  if (prevActive !== active) {
    setPrevActive(active);
    setHiding(!active && !reduced);
  }
  if (reduced && hiding) setHiding(false);

  return {
    state: active ? "shown" : hiding ? "hiding" : "hidden",
    onTransitionEnd: (event) => {
      if (event.propertyName === "opacity") setHiding(false);
    },
  };
}

const staggerContainer = (state: StaggerState) =>
  cx("t-stagger", state === "shown" && "is-shown", state === "hiding" && "is-hiding");

const staggerLine = (state: StaggerState) =>
  cx(
    state === "shown" &&
      "translate-y-0 opacity-100 blur-0 [transition:opacity_var(--stagger-dur)_var(--stagger-ease),translate_var(--stagger-dur)_var(--stagger-ease),filter_var(--stagger-dur)_var(--stagger-ease)]",
    state === "hiding" && "translate-y-0 opacity-0 blur-0 [transition:opacity_200ms_ease]",
    state === "hidden" && "translate-y-3 opacity-0 blur-[3px] transition-none",
  );

function ringPath(width: number, height: number, inset: number, radius: number) {
  const x0 = inset;
  const y0 = inset;
  const x1 = width - inset;
  const y1 = height - inset;
  const arc = (endX: number, endY: number) =>
    `A ${radius} ${radius} 0 0 1 ${endX} ${endY}`;

  return [
    `M ${width / 2} ${y0}`,
    `H ${x1 - radius}`,
    arc(x1, y0 + radius),
    `V ${y1 - radius}`,
    arc(x1 - radius, y1),
    `H ${x0 + radius}`,
    arc(x0, y1 - radius),
    `V ${y0 + radius}`,
    arc(x0 + radius, y0),
    "Z",
  ].join(" ");
}

export function FileUpload({
  onUploadComplete,
  allowedExtensions = DEFAULT_EXTENSIONS,
  maxBytes = DEFAULT_MAX_BYTES,
  renderFileIcon,
  className,
}: FileUploadProps) {
  const [phase, setPhase] = useState<UploadPhase>("idle");
  const [progress, setProgress] = useState(0);
  const [file, setFile] = useState<File | null>(null);
  const [rejection, setRejection] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const [boxRef, boxSize] = useElementSize<HTMLDivElement>();
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useMountEffect(() => {
    const pending = timers.current;
    return () => pending.forEach(clearTimeout);
  });

  const startUpload = (nextFile: File) => {
    const extension = extensionFor(nextFile.name);
    if (!allowedExtensions.map((value) => value.toLowerCase()).includes(extension)) {
      setRejection(`Only ${allowedExtensions.map((value) => value.toUpperCase()).join(", ")} files are supported`);
      timers.current.push(setTimeout(() => setRejection(null), 2600));
      return;
    }
    if (nextFile.size > maxBytes) {
      setRejection(`That file is larger than ${formatFileSize(maxBytes)}`);
      timers.current.push(setTimeout(() => setRejection(null), 2600));
      return;
    }

    setFile(nextFile);
    setProgress(0);
    setPhase("uploading");

    let value = 0;
    const tick = () => {
      value = Math.min(100, value + 2 + Math.random() * 5);
      setProgress(Math.round(value));
      if (value < 100) {
        timers.current.push(setTimeout(tick, 90));
        return;
      }

      setPhase("complete");
      timers.current.push(
        setTimeout(() => {
          onUploadComplete?.(nextFile);
          setPhase("idle");
          setFile(null);
        }, 1600),
      );
    };
    timers.current.push(setTimeout(tick, 250));
  };

  const busy = phase !== "idle";
  const box = boxSize && boxSize.width > 0 ? boxSize : { width: 533, height: 164 };
  const progressPath = ringPath(box.width, box.height, 1, 15);
  const idleReveal = useStaggerState(!busy);
  const busyReveal = useStaggerState(busy);
  const uploadingLine = useStaggerState(phase === "uploading");
  const completeLine = useStaggerState(phase === "complete");
  const allowedLabel = allowedExtensions
    .filter((extension) => extension.toLowerCase() !== "jpeg")
    .map((extension) => extension.toUpperCase())
    .join(", ");

  return (
    <div
      ref={boxRef}
      role="button"
      tabIndex={busy ? -1 : 0}
      aria-label="Upload a file"
      onClick={() => !busy && inputRef.current?.click()}
      onKeyDown={(event) => {
        if (!busy && (event.key === "Enter" || event.key === " ")) {
          event.preventDefault();
          inputRef.current?.click();
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
        if (!busy) setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        const droppedFile = event.dataTransfer.files?.[0];
        if (droppedFile && !busy) startUpload(droppedFile);
      }}
      className={cx(
        "group relative h-[164px] w-full shrink-0 rounded-2xl outline-none",
        "transition-colors duration-300 ease-out",
        busy ? "bg-surface" : "cursor-pointer bg-canvas",
        "focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
        className,
      )}
    >
      <input
        ref={inputRef}
        type="file"
        aria-label="Choose a file to upload"
        accept={allowedExtensions.map((extension) => `.${extension}`).join(",")}
        className="sr-only"
        tabIndex={-1}
        onChange={(event) => {
          const selectedFile = event.target.files?.[0];
          event.target.value = "";
          if (selectedFile) startUpload(selectedFile);
        }}
      />

      <div
        aria-hidden
        className={cx(
          "pointer-events-none absolute inset-0 rounded-2xl border-2 border-dashed",
          dragOver
            ? "border-line-strong"
            : "border-line-strong group-hover:border-line-strong",
          "transition-[opacity,border-color] duration-300 ease-out",
          busy ? "opacity-0" : "opacity-100",
        )}
      />

      <svg
        aria-hidden
        viewBox={`0 0 ${box.width} ${box.height}`}
        preserveAspectRatio="none"
        className={cx(
          "pointer-events-none absolute inset-0 size-full transition-opacity duration-300 ease-out",
          busy ? "opacity-100" : "opacity-0",
        )}
      >
        <rect
          x={1}
          y={1}
          width={box.width - 2}
          height={box.height - 2}
          rx={15}
          fill="none"
          stroke="var(--line)"
          strokeWidth={2}
        />
        <path
          d={progressPath}
          fill="none"
          stroke="var(--color-accent-400)"
          strokeWidth={2}
          strokeLinecap="round"
          pathLength={100}
          strokeDasharray={`${busy ? (progress >= 100 ? 102 : progress) : 0} 200`}
          className="transition-[stroke-dasharray] duration-200 ease-linear"
        />
      </svg>

      <div
        aria-hidden
        className={cx(
          "absolute -top-[9.5px] left-1/2 -translate-x-1/2 rounded-md bg-accent px-1.5 py-0.5",
          "text-caption-1-medium whitespace-nowrap text-on-accent tabular-nums",
          "[transition:opacity_160ms_ease-out,filter_160ms_ease-out,translate_300ms_ease-out]",
          busy ? "translate-y-0 opacity-100 blur-0" : "-translate-y-2.5 opacity-0 blur-[2px]",
        )}
      >
        {progress}%
      </div>

      <div
        className={cx(
          "absolute inset-0 flex flex-col items-center justify-center gap-3.5",
          staggerContainer(idleReveal.state),
          busy && "pointer-events-none",
        )}
        onTransitionEnd={idleReveal.onTransitionEnd}
      >
        <span className="t-stagger-line t-stagger-line--1 flex size-10 items-center justify-center rounded-full bg-line-strong p-2.5">
          <CloudUpload
            className="size-6 shrink-0 text-ink-3 transition-colors duration-150 ease group-hover:text-ink-2"
            aria-hidden
          />
        </span>
        <div className="flex flex-col items-center gap-2 text-center">
          <p
            className={cx(
              "t-stagger-line t-stagger-line--2 text-body-medium",
              rejection ? "text-red" : "text-ink-2",
            )}
          >
            {rejection ?? (
              <>
                Drag and drop to upload or <span className="text-accent-500">select</span>
              </>
            )}
          </p>
          <p className="t-stagger-line t-stagger-line--3 text-body-2-regular text-ink-3">
            {allowedLabel} (max {formatFileSize(maxBytes)})
          </p>
        </div>
      </div>

      <div
        className={cx(
          "absolute inset-0 flex flex-col items-center justify-center",
          staggerContainer(busyReveal.state),
          !busy && "pointer-events-none",
        )}
        onTransitionEnd={busyReveal.onTransitionEnd}
      >
        <span className="t-stagger-line t-stagger-line--1 flex size-10 items-center justify-center rounded-full border border-line bg-surface p-2">
          {file && (renderFileIcon ? renderFileIcon(file) : <DefaultFileIcon file={file} />)}
        </span>
        <p className="t-stagger-line t-stagger-line--2 mt-3.5 max-w-[90%] truncate text-body-medium text-ink">
          {file?.name}
        </p>
        <div className="t-stagger-line t-stagger-line--3 relative mt-1 h-[18px] w-full">
          <p
            className={cx(
              "absolute inset-x-0 text-center text-body-2-regular text-ink-2",
              staggerLine(uploadingLine.state),
            )}
            onTransitionEnd={uploadingLine.onTransitionEnd}
          >
            Uploading {file ? formatFileSize(file.size) : ""}
            ...
          </p>
          <p
            className={cx(
              "absolute inset-x-0 text-center text-body-2-regular text-ink-2",
              staggerLine(completeLine.state),
            )}
            onTransitionEnd={completeLine.onTransitionEnd}
          >
            Upload complete
          </p>
        </div>
      </div>
    </div>
  );
}
