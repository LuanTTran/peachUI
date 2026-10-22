"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useRef, useState, type ReactNode } from "react";
import { useDomLayout } from "@/lib/use-dom-layout";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cn } from "@/lib/utils";

export interface NavTreeLeaf {
  key: string;
  href: string;
  label: string;
  /** Fired on pointer enter / focus — used by the docs preview card. */
  onHover?: (row: HTMLElement) => void;
}

interface NavTreeProps {
  icon: ReactNode;
  label: string;
  /** When set, the root row is a link (the group's index page). */
  href?: string;
  leaves: NavTreeLeaf[];
  onNavigate?: () => void;
  onRootHover?: () => void;
}

/* Horizontal space the elbow travels before the leaf's padding gutter. */
const ELBOW_R = 8;
/* Wire tip lands inside the leaf's left padding, before the label. */
const LEAF_PAD = 5;
/* Breathing room between the icon's bottom edge and the trunk's start. */
const TRUNK_GAP = 3;

type WireEnd = { x: number; y: number };
type TreeGeom = { x: number; top: number; leaves: Record<string, WireEnd> };

/** Continuous route from the icon stem down the trunk, out to the leaf. */
function routePath(g: TreeGeom, e: WireEnd) {
  const r = Math.min(ELBOW_R, Math.max(2, e.y - g.top - 1));
  return `M ${g.x} ${g.top} V ${e.y - r} Q ${g.x} ${e.y} ${g.x + r} ${e.y} H ${e.x}`;
}

/** Structure-only branch: just the corner, drawn over the trunk's line. */
function elbowPath(g: TreeGeom, e: WireEnd) {
  const r = Math.min(ELBOW_R, Math.max(2, e.y - g.top - 1));
  return `M ${g.x} ${e.y - r} Q ${g.x} ${e.y} ${g.x + r} ${e.y} H ${e.x}`;
}

function geomEqual(a: TreeGeom | null, b: TreeGeom) {
  if (!a || Math.abs(a.x - b.x) > 0.5 || Math.abs(a.top - b.top) > 0.5) return false;
  const aKeys = Object.keys(a.leaves);
  const bKeys = Object.keys(b.leaves);
  if (aKeys.length !== bKeys.length) return false;
  return bKeys.every((key) => {
    const ea = a.leaves[key];
    const eb = b.leaves[key];
    return ea && Math.abs(ea.x - eb.x) < 0.5 && Math.abs(ea.y - eb.y) < 0.5;
  });
}

/**
 * Tree nav whose selection indicator is a wire: a trunk drops from the group
 * icon and elbows reach each leaf. Hover ghost-draws a route, click sends a
 * pulse down it, and the route stays lit for the current page.
 */
export function NavTree({ icon, label, href, leaves, onNavigate, onRootHover }: NavTreeProps) {
  const pathname = usePathname();
  const treeRef = useRef<HTMLDivElement>(null);
  const iconRef = useRef<HTMLSpanElement>(null);
  const [geom, setGeom] = useState<TreeGeom | null>(null);
  const [hovered, setHovered] = useState<string | null>(null);
  const [travel, setTravel] = useState<{ key: string; d: string; id: number } | null>(null);
  const [burst, setBurst] = useState<{ x: number; y: number; id: number } | null>(null);
  const [sent, setSent] = useState(false);
  const seq = useRef(0);

  const measureRef = useRef<() => void>(() => {});
  useDomLayout(() => {
    measureRef.current = () => {
      const tree = treeRef.current;
      const iconEl = iconRef.current;
      if (!tree || !iconEl) return;
      const box = tree.getBoundingClientRect();
      const ic = iconEl.getBoundingClientRect();
      const next: TreeGeom = {
        x: ic.left - box.left + ic.width / 2,
        top: ic.bottom - box.top + TRUNK_GAP,
        leaves: {},
      };
      tree.querySelectorAll<HTMLElement>("[data-leaf]").forEach((li) => {
        const key = li.dataset.leaf;
        if (!key) return;
        const r = li.getBoundingClientRect();
        next.leaves[key] = { x: r.left - box.left + LEAF_PAD, y: r.top - box.top + r.height / 2 };
      });
      setGeom((prev) => (geomEqual(prev, next) ? prev : next));
    };
    measureRef.current();
  });
  useMountEffect(() => {
    const tree = treeRef.current;
    if (!tree) return;
    const ro = new ResizeObserver(() => measureRef.current());
    ro.observe(tree);
    return () => ro.disconnect();
  });

  const activeKey = leaves.find((leaf) => pathname === leaf.href)?.key ?? null;
  const rootActive = href ? pathname === href : false;
  const groupLive = rootActive || activeKey !== null;
  const reducedMotion =
    typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function sendTo(leaf: NavTreeLeaf) {
    setSent(true);
    const end = geom?.leaves[leaf.key];
    if (geom && end && !reducedMotion)
      setTravel({ key: leaf.key, d: routePath(geom, end), id: ++seq.current });
    onNavigate?.();
  }

  const lastLeafY = geom
    ? Math.max(geom.top, ...leaves.map((leaf) => geom.leaves[leaf.key]?.y ?? geom.top))
    : 0;
  const activeEnd = geom && activeKey !== null ? geom.leaves[activeKey] : null;

  const rootInner = (
    <>
      <span
        ref={iconRef}
        className="nav-tree-icon"
        data-sent={sent || undefined}
        onAnimationEnd={() => setSent(false)}
        aria-hidden
      >
        {icon}
      </span>
      {label}
    </>
  );

  return (
    <div ref={treeRef} className="nav-tree" data-live={groupLive || undefined}>
      {href ? (
        <Link
          href={href}
          className="nav-tree-root"
          data-active={rootActive || undefined}
          onClick={() => {
            setSent(true);
            onNavigate?.();
          }}
          onPointerEnter={onRootHover}
        >
          {rootInner}
        </Link>
      ) : (
        <p className="nav-tree-root" onPointerEnter={onRootHover}>
          {rootInner}
        </p>
      )}

      <svg className="nav-tree-wires" aria-hidden>
        {geom ? (
          <>
            <path className="nav-tree-trunk" d={`M ${geom.x} ${geom.top} V ${lastLeafY}`} />
            {leaves.map((leaf) => {
              const end = geom.leaves[leaf.key];
              return end ? (
                <path key={leaf.key} className="nav-tree-elbow" d={elbowPath(geom, end)} />
              ) : null;
            })}
            {leaves.map((leaf) => {
              const end = geom.leaves[leaf.key];
              if (!end) return null;
              const state =
                leaf.key === activeKey
                  ? "is-active"
                  : leaf.key === travel?.key
                    ? "is-travel"
                    : leaf.key === hovered
                      ? "is-ghost"
                      : null;
              return (
                <path
                  key={leaf.key}
                  className={cn("nav-tree-wire", state)}
                  d={routePath(geom, end)}
                  pathLength={1}
                />
              );
            })}
            {activeEnd ? <circle className="nav-tree-dot" cx={activeEnd.x} cy={activeEnd.y} r={2.5} /> : null}
          </>
        ) : null}
      </svg>

      <ul className="nav-tree-list">
        {leaves.map((leaf) => {
          const active = pathname === leaf.href;
          return (
            <li
              key={leaf.key}
              data-leaf={leaf.key}
              data-active={active || undefined}
              onPointerEnter={(e) => {
                if (e.pointerType === "touch") return;
                setHovered(leaf.key);
                leaf.onHover?.(e.currentTarget);
              }}
              onPointerLeave={() => setHovered(null)}
              onFocus={(e) => {
                setHovered(leaf.key);
                leaf.onHover?.(e.currentTarget);
              }}
              onBlur={() => setHovered(null)}
            >
              <Link
                href={leaf.href}
                className={cn("doc-nav-link", active && "doc-nav-link-active")}
                aria-current={active ? "page" : undefined}
                onClick={() => sendTo(leaf)}
              >
                {leaf.label}
              </Link>
            </li>
          );
        })}
      </ul>

      {travel ? (
        <span
          key={travel.id}
          className="nav-tree-pulse"
          style={{ offsetPath: `path("${travel.d}")` }}
          onAnimationEnd={() => {
            setTravel(null);
            const end = geom?.leaves[travel.key];
            if (end) setBurst({ x: end.x, y: end.y, id: ++seq.current });
          }}
        />
      ) : null}
      {burst ? (
        <span
          key={burst.id}
          className="nav-tree-burst"
          style={{ left: burst.x, top: burst.y }}
          onAnimationEnd={() => setBurst(null)}
        >
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden>
            <path
              d="M6 0 L7.4 4.6 L12 6 L7.4 7.4 L6 12 L4.6 7.4 L0 6 L4.6 4.6 Z"
              fill="currentColor"
            />
          </svg>
        </span>
      ) : null}
    </div>
  );
}
