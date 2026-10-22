"use client";

/**
 * PeachUI — AgentRun · RunCanvas (block part)
 * @tier block
 * @requires app/globals.css
 *
 * The run graph on a dotted editor canvas. Nodes sit on a
 * vertical spine (trigger → context → router → orchestrator),
 * the orchestrator fans out into a row of task nodes, and sink
 * nodes collect the outcome. Every card drags freely — the
 * connectors are measured beziers that follow it. Edges light
 * in the source node's hue once data has crossed, and stream
 * dots while the target node is still working.
 */

import {
  useRef,
  useState,
  type ComponentType,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from "react";
import { useMountEffect } from "@/lib/use-mount-effect";
import { CheckCircle, Minus } from "reicon-react";
import { cx } from "@/lib/utils";

const PAD_TOP = 30;
const PAD_BOTTOM = 34;
const ROW_GAP = 62;
/* kind pill (20px) + gap-1.5 (6px) above the card proper */
const PILL_OFFSET = 26;
const DRAG_THRESHOLD = 3;
const CANVAS_MARGIN = 10;

const mix = (hue: string, pct: number, base = "var(--surface)") =>
  `color-mix(in srgb, ${hue} ${pct}%, ${base})`;

export type FlowNodeStatus = "pending" | "active" | "done" | "skipped";
export type FlowEdgeTone = "idle" | "lit" | "flow" | "error";

export interface FlowNodeSpec {
  id: string;
  /** spine = vertical pipeline · task = orchestrator fan-out · sink = terminal. */
  role: "spine" | "task" | "sink";
  /** 0–1 horizontal center. Spine and task nodes are laid out automatically. */
  x?: number;
  w: number;
  /** CSS color for the icon chip, kind pill, and outgoing edges. */
  hue: string;
  /** Small tinted label floating above the card. */
  kind?: string;
  Icon: ComponentType<{ className?: string }>;
  title: string;
  /** Second line for compact cards that carry no body. */
  caption?: string;
  status: FlowNodeStatus;
  statusText: string;
  /** Inset detail under the header row. */
  body?: ReactNode;
  dimmed?: boolean;
}

export interface FlowEdgeSpec {
  from: string;
  to: string;
  tone: FlowEdgeTone;
  /** Stroke color once data has crossed — the source node's hue. */
  hue?: string;
}

interface Placement {
  row: number;
  x: number;
  w: number;
}

/* Spine nodes stack down the middle; tasks share chunked rows so the
 * fan-out never overflows narrow canvases; sinks take the last row. */
function layoutNodes(nodes: FlowNodeSpec[], cw: number) {
  const placements = new Map<string, Placement>();
  let row = 0;
  for (const node of nodes.filter((n) => n.role === "spine")) {
    placements.set(node.id, { row: row++, x: 0.5, w: Math.min(node.w, cw * 0.94) });
  }
  const tasks = nodes.filter((n) => n.role === "task");
  const perRow = cw < 640 ? 2 : Math.max(tasks.length, 1);
  tasks.forEach((node, i) => {
    const rowIndex = row + Math.floor(i / perRow);
    const chunkStart = Math.floor(i / perRow) * perRow;
    const count = Math.min(perRow, tasks.length - chunkStart);
    placements.set(node.id, {
      row: rowIndex,
      x: (i % perRow + 0.5) / count,
      w: Math.min(node.w, cw / count - 20),
    });
  });
  row += Math.ceil(tasks.length / perRow);
  const sinks = nodes.filter((n) => n.role === "sink");
  sinks.forEach((node) => {
    placements.set(node.id, { row, x: node.x ?? 0.5, w: Math.min(node.w, cw * 0.62) });
  });
  return { placements, rowCount: row + (sinks.length > 0 ? 1 : 0) };
}

const estHeight = (node: FlowNodeSpec) =>
  (node.kind ? PILL_OFFSET : 0) + (node.body ? 88 : 42);

function StatusGlyph({ status }: { status: FlowNodeStatus }) {
  if (status === "done") {
    return <CheckCircle className="size-4 shrink-0 text-green" aria-hidden />;
  }
  if (status === "active") {
    return (
      <span
        className="size-3.5 shrink-0 animate-spin rounded-full border-2 border-accent border-t-transparent motion-reduce:animate-none"
        aria-hidden
      />
    );
  }
  if (status === "skipped") {
    return <Minus className="size-4 shrink-0 text-ink-3" aria-hidden />;
  }
  return (
    <span className="flex size-4 shrink-0 items-center justify-center" aria-hidden>
      <span className="size-1.5 rounded-full bg-line-strong" />
    </span>
  );
}

const STATUS_TEXT_TONE: Record<FlowNodeStatus, string> = {
  done: "text-green",
  active: "text-ink-2",
  pending: "text-ink-3",
  skipped: "text-ink-3",
};

export interface RunCanvasProps {
  nodes: FlowNodeSpec[];
  edges: FlowEdgeSpec[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  reduced: boolean;
  /** Overlay chrome in the canvas corners — run chip, hints. */
  hud?: ReactNode;
  hint?: ReactNode;
  /** Bottom-sheet detail, absolutely positioned inside the canvas. */
  detail?: ReactNode;
  className?: string;
}

export function RunCanvas({
  nodes,
  edges,
  selectedId,
  onSelect,
  reduced,
  hud,
  hint,
  detail,
  className,
}: RunCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef(new Map<string, HTMLElement>());
  const [width, setWidth] = useState(0);
  const [heights, setHeights] = useState<Record<string, number>>({});
  const [offsets, setOffsets] = useState<Record<string, { dx: number; dy: number }>>({});
  const [dragging, setDragging] = useState<string | null>(null);
  const drag = useRef<{
    id: string;
    startX: number;
    startY: number;
    baseDx: number;
    baseDy: number;
    moved: boolean;
  } | null>(null);

  /* Cards measure themselves — heights and the canvas width feed the
   * row layout and the connector anchors, so nothing is hardcoded. The
   * observer lives in a ref so each node's callback ref can subscribe
   * its own element on attach and drop it on detach (keyed remounts
   * re-fire the ref, which is what re-observes a swapped node set). */
  const roRef = useRef<ResizeObserver | null>(null);

  useMountEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const measure = () => {
      setWidth(canvas.clientWidth);
      setHeights((prev) => {
        const next = { ...prev };
        let changed = false;
        nodeRefs.current.forEach((el, id) => {
          const h = el.offsetHeight;
          if (h && Math.abs(h - (next[id] ?? 0)) > 0.5) {
            next[id] = h;
            changed = true;
          }
        });
        return changed ? next : prev;
      });
    };
    const observer = new ResizeObserver(measure);
    roRef.current = observer;
    measure();
    observer.observe(canvas);
    nodeRefs.current.forEach((el) => observer.observe(el));
    return () => {
      roRef.current = null;
      observer.disconnect();
    };
  });

  const cw = width || 720;
  const { placements, rowCount } = layoutNodes(nodes, cw);

  const rowHeights = Array.from({ length: rowCount }, (_, r) =>
    Math.max(
      ...nodes
        .filter((node) => placements.get(node.id)?.row === r)
        .map((node) => heights[node.id] ?? estHeight(node)),
      44,
    ),
  );
  const rowY: number[] = [];
  for (let r = 0; r < rowCount; r++) {
    rowY[r] = r === 0 ? PAD_TOP : rowY[r - 1] + rowHeights[r - 1] + ROW_GAP;
  }
  const canvasH = (rowY[rowCount - 1] ?? PAD_TOP) + (rowHeights[rowCount - 1] ?? 0) + PAD_BOTTOM;

  const place = (node: FlowNodeSpec) => {
    const p = placements.get(node.id)!;
    const off = offsets[node.id];
    return {
      w: p.w,
      cx: p.x * cw + (off?.dx ?? 0),
      top: rowY[p.row] + (off?.dy ?? 0),
    };
  };

  /* Card anchor points — kind pills sit above the card, so the top
   * anchor drops past them. */
  const anchors = (node: FlowNodeSpec) => {
    const { cx: centerX, top } = place(node);
    return {
      top: { x: centerX, y: top + (node.kind ? PILL_OFFSET : 0) },
      bottom: { x: centerX, y: top + (heights[node.id] ?? estHeight(node)) },
    };
  };

  const nodeById = (id: string) => nodes.find((node) => node.id === id)!;

  const bezier = (edge: FlowEdgeSpec) => {
    const from = anchors(nodeById(edge.from)).bottom;
    const to = anchors(nodeById(edge.to)).top;
    const k = Math.min(Math.max(Math.abs(to.y - from.y) * 0.55, 24), 88);
    return `M ${from.x} ${from.y} C ${from.x} ${from.y + k}, ${to.x} ${to.y - k}, ${to.x} ${to.y}`;
  };

  /* ── dragging — pointer capture on the card wrapper ── */
  const onPointerDown = (node: FlowNodeSpec) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const off = offsets[node.id];
    drag.current = {
      id: node.id,
      startX: event.clientX,
      startY: event.clientY,
      baseDx: off?.dx ?? 0,
      baseDy: off?.dy ?? 0,
      moved: false,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (node: FlowNodeSpec) => (event: ReactPointerEvent<HTMLDivElement>) => {
    const d = drag.current;
    if (!d || d.id !== node.id) return;
    const dx = d.baseDx + event.clientX - d.startX;
    const dy = d.baseDy + event.clientY - d.startY;
    if (!d.moved && Math.hypot(dx - d.baseDx, dy - d.baseDy) < DRAG_THRESHOLD) return;
    d.moved = true;
    setDragging(node.id);

    /* keep the card inside the canvas */
    const p = placements.get(node.id)!;
    const h = heights[node.id] ?? estHeight(node);
    const baseCx = p.x * cw;
    const baseTop = rowY[p.row];
    const nextCx = Math.min(Math.max(baseCx + dx, p.w / 2 + CANVAS_MARGIN), cw - p.w / 2 - CANVAS_MARGIN);
    const nextTop = Math.min(Math.max(baseTop + dy, CANVAS_MARGIN), canvasH - h - CANVAS_MARGIN);
    setOffsets((current) => ({ ...current, [node.id]: { dx: nextCx - baseCx, dy: nextTop - baseTop } }));
  };

  const onPointerUp = (node: FlowNodeSpec) => () => {
    const d = drag.current;
    if (d?.id === node.id) {
      setDragging(null);
      /* a real drag shouldn't also toggle the detail sheet */
      if (d.moved) setTimeout(() => (drag.current = null), 0);
      else drag.current = null;
    }
  };

  const wasDragged = () => drag.current?.moved === true;

  return (
    <div
      ref={canvasRef}
      onPointerDown={(event) => {
        if (!(event.target as Element).closest("[data-node],[data-sheet]")) onSelect(null);
      }}
      className={cx("relative w-full select-none overflow-hidden bg-canvas", className)}
      style={{
        height: canvasH,
        backgroundImage: "radial-gradient(var(--line-strong) 1px, transparent 1.3px)",
        backgroundSize: "22px 22px",
        backgroundPosition: "center",
      }}
    >
      {hud}
      {hint}

      {/* connectors */}
      <svg width={cw} height={canvasH} className="pointer-events-none absolute inset-0" aria-hidden>
        {edges.map((edge) => {
          const d = bezier(edge);
          if (edge.tone === "flow" && !reduced) {
            return (
              <path
                key={`${edge.from}-${edge.to}`}
                d={d}
                fill="none"
                stroke={edge.hue ?? "var(--accent)"}
                strokeWidth={2}
                strokeLinecap="round"
                strokeDasharray="0.1 7.9"
                className="route-flow"
                style={{
                  ["--route-shift" as string]: "-8px",
                  ["--route-duration" as string]: "0.5s",
                }}
              />
            );
          }
          const stroke =
            edge.tone === "error"
              ? "var(--red)"
              : edge.tone === "lit" || edge.tone === "flow"
                ? (edge.hue ?? "var(--accent)")
                : "var(--line-strong)";
          return (
            <path
              key={`${edge.from}-${edge.to}`}
              d={d}
              fill="none"
              stroke={stroke}
              strokeWidth={edge.tone === "lit" ? 1.5 : 1.25}
              strokeOpacity={edge.tone === "error" ? 0.45 : 1}
              strokeDasharray={edge.tone === "error" ? "3 5" : undefined}
              className="transition-[stroke] duration-150"
            />
          );
        })}
      </svg>

      {/* nodes */}
      {nodes.map((node) => {
        const { w, cx: centerX, top } = place(node);
        const selected = selectedId === node.id;
        const row = placements.get(node.id)!.row;
        return (
          <div
            key={node.id}
            data-node
            ref={(el) => {
              if (!el) return;
              nodeRefs.current.set(node.id, el);
              roRef.current?.observe(el);
              return () => {
                roRef.current?.unobserve(el);
                nodeRefs.current.delete(node.id);
              };
            }}
            onPointerDown={onPointerDown(node)}
            onPointerMove={onPointerMove(node)}
            onPointerUp={onPointerUp(node)}
            className="absolute flex -translate-x-1/2 flex-col items-start gap-1.5"
            style={{
              left: centerX,
              top,
              width: w,
              zIndex: dragging === node.id ? 3 : selected ? 2 : 1,
              opacity: node.dimmed ? 0.6 : node.status === "pending" ? 0.78 : 1,
              transition: "opacity 200ms ease",
              animation: reduced
                ? undefined
                : `fade-up 420ms cubic-bezier(0.23, 1, 0.32, 1) ${row * 70}ms both`,
            }}
          >
            {node.kind ? (
              <span
                className="inline-flex h-5 items-center rounded-md px-1.5 text-caption-2-medium"
                style={{
                  background: mix(node.hue, 14, "var(--page)"),
                  color: mix(node.hue, 85, "var(--ink)"),
                }}
              >
                {node.kind}
              </span>
            ) : null}
            <button
              type="button"
              aria-pressed={selected}
              onClick={() => {
                if (wasDragged()) return;
                onSelect(selected ? null : node.id);
              }}
              className={cx(
                "w-full cursor-grab touch-none rounded-card bg-surface text-left shadow-card outline-none",
                "transition-shadow duration-150 active:cursor-grabbing",
                "focus-visible:ring-2 focus-visible:ring-accent",
                selected
                  ? "ring-2 ring-accent"
                  : node.status === "active"
                    ? "ring-[1.5px] ring-accent"
                    : node.status === "done" && !node.dimmed
                      ? "ring-1 ring-green/60"
                      : "hover:shadow-raised",
              )}
            >
              <div className="flex items-center gap-2 px-3 pt-2.5">
                <span
                  className="flex size-6 shrink-0 items-center justify-center rounded-md"
                  style={{
                    background: mix(node.hue, 12),
                    color: mix(node.hue, 88, "var(--ink)"),
                    boxShadow: `0 0 0 1px ${mix(node.hue, 22)}`,
                  }}
                  aria-hidden
                >
                  <node.Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-body-2-medium text-ink">{node.title}</span>
                  {node.caption && !node.body ? (
                    <span className="block truncate text-caption-2-regular text-ink-3">
                      {node.caption}
                    </span>
                  ) : null}
                </span>
                <span className="flex shrink-0 items-center gap-1.5">
                  {node.statusText ? (
                    <span
                      className={cx(
                        "text-caption-2-regular tabular-nums",
                        STATUS_TEXT_TONE[node.status],
                      )}
                    >
                      {node.statusText}
                    </span>
                  ) : null}
                  <StatusGlyph status={node.status} />
                </span>
              </div>
              {node.body ? (
                <div className="mx-2 mb-2 mt-2 rounded-lg bg-canvas px-2.5 py-2">{node.body}</div>
              ) : (
                <div className="pb-2.5" />
              )}
            </button>
          </div>
        );
      })}

      {detail}
    </div>
  );
}
