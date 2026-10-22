"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { createPortal } from "react-dom";
import { Component, Layout } from "reicon-react";
import { NavTree } from "@/components/showroom/nav-tree";
import { entryHref } from "@/lib/catalog/paths";
import { CATALOG } from "@/lib/catalog/registry";
import type { CatalogEntry } from "@/lib/catalog/types";
import type { TemplateEntry } from "@/lib/templates";
import { useMeasuredFootprint, type Footprint } from "@/lib/use-measured-footprint";
import { cn } from "@/lib/utils";

export type NavEntry = Pick<CatalogEntry, "tier" | "slug" | "title">;

type DocNavProps = {
  entries: NavEntry[];
  templates?: TemplateEntry[];
  onNavigate?: () => void;
  /** Hover/focus demo preview cards — off inside the mobile sheet. */
  showPreviews?: boolean;
};

type NavPreview = {
  slug: string;
  title: string;
  top: number;
  left: number;
  Demo: CatalogEntry["Demo"];
};

const BLOCK_ENTRIES = new Map(CATALOG.filter((e) => e.tier === "blocks").map((e) => [e.slug, e]));

/* Preview card geometry — see .doc-nav-preview-* in globals.css. */
const PREVIEW_CARD_WIDTH = 19 * 16;
const PREVIEW_CARD_PAD = 8;
const PREVIEW_STAGE_PAD_X = 12;
const PREVIEW_STAGE_PAD_TOP = 12;
const PREVIEW_STAGE_PAD_BOTTOM = 12;
const PREVIEW_STAGE_MAX_H = 15 * 16;
const PREVIEW_MIN_SCALE = 0.4;
const PREVIEW_MARGIN = 12;
/* Demos render inside this definite-width frame — the .doc-article column.
 * Percentage widths and container queries need it: in a shrink-to-fit box
 * `w-full` can't resolve and `container-type: inline-size` roots (e.g.
 * stepper-form) contribute zero intrinsic width, collapsing the demo. */
const PREVIEW_FRAME_W = 42 * 16;
/* Worst-case card height for viewport clamping (title + padding + stage). */
const PREVIEW_MAX_CARD_H = PREVIEW_CARD_PAD * 2 + 28 + PREVIEW_STAGE_MAX_H;

/* Remount-free size cache — repeat hovers open at the right scale. */
const PREVIEW_FOOTPRINTS = new Map<string, Footprint>();

/* First-paint guess before the frame measures: a centered, article-width
 * component — most demos land close to this. */
const PREVIEW_FALLBACK_FOOT: Footprint = {
  x: (PREVIEW_FRAME_W - 30 * 16) / 2,
  y: 0,
  width: 30 * 16,
  height: PREVIEW_STAGE_MAX_H,
};

/** Live miniature of a block demo, sized to the demo's natural footprint. */
function NavPreviewCard({ preview }: { preview: NavPreview }) {
  const [frameRef, measured] = useMeasuredFootprint<HTMLDivElement>(PREVIEW_FRAME_W, {
    initial: PREVIEW_FOOTPRINTS.get(preview.slug) ?? null,
    onMeasure: (f) => PREVIEW_FOOTPRINTS.set(preview.slug, f),
  });
  const Demo = preview.Demo;

  const stageInnerW = PREVIEW_CARD_WIDTH - PREVIEW_CARD_PAD * 2 - PREVIEW_STAGE_PAD_X * 2;
  const foot = measured ?? PREVIEW_FALLBACK_FOOT;
  const scale = Math.max(PREVIEW_MIN_SCALE, Math.min(1, stageInnerW / foot.width));
  const scaledH = foot.height * scale;
  const maxBodyH = PREVIEW_STAGE_MAX_H - PREVIEW_STAGE_PAD_TOP;
  const overflows = scaledH > maxBodyH + 1;
  const stageH = overflows
    ? PREVIEW_STAGE_MAX_H
    : PREVIEW_STAGE_PAD_TOP + scaledH + PREVIEW_STAGE_PAD_BOTTOM;

  return (
    <div
      className="doc-nav-preview"
      role="presentation"
      style={{ top: preview.top, left: preview.left }}
    >
      <p className="doc-nav-preview-title">{preview.title}</p>
      <div className="doc-nav-preview-stage" style={{ height: stageH }}>
        {/* Tray sized to the scaled footprint; the demo is translated so the
         * footprint's top-left lands on the tray's — clipped past the edge. */}
        <div
          className="doc-nav-preview-body"
          style={{ width: foot.width * scale, height: Math.min(scaledH, maxBodyH) }}
        >
          <div
            className="doc-nav-preview-demo"
            style={{ transform: `scale(${scale}) translate(${-foot.x}px, ${-foot.y}px)` }}
          >
            <div ref={frameRef} className="doc-nav-preview-frame">
              <Demo />
            </div>
          </div>
        </div>
        {overflows ? <div className="doc-nav-preview-fade" aria-hidden /> : null}
      </div>
    </div>
  );
}

function NavLink({
  href,
  label,
  onNavigate,
  onHover,
}: {
  href: string;
  label: string;
  onNavigate?: () => void;
  onHover?: (row: HTMLElement) => void;
}) {
  const pathname = usePathname();
  const active = pathname === href;
  return (
    <li
      data-active={active || undefined}
      onPointerEnter={
        onHover
          ? (e) => {
              if (e.pointerType === "touch") return;
              onHover(e.currentTarget);
            }
          : undefined
      }
      onFocus={onHover ? (e) => onHover(e.currentTarget) : undefined}
    >
      <Link
        href={href}
        className={cn("doc-nav-link", active && "doc-nav-link-active")}
        aria-current={active ? "page" : undefined}
        onClick={onNavigate}
      >
        {label}
      </Link>
    </li>
  );
}

export function DocNav({ entries, templates = [], onNavigate, showPreviews = true }: DocNavProps) {
  const liveTemplates = templates.filter((template) => template.status === "live");
  const [preview, setPreview] = useState<NavPreview | null>(null);

  function handleNavigate() {
    setPreview(null);
    onNavigate?.();
  }

  function peekAt(entry: NavEntry | null) {
    return (row: HTMLElement) => {
      const full = entry ? BLOCK_ENTRIES.get(entry.slug) : undefined;
      if (!full) {
        setPreview(null);
        return;
      }
      const rect = row.getBoundingClientRect();
      const top = Math.min(Math.max(rect.top - 8, PREVIEW_MARGIN), window.innerHeight - PREVIEW_MAX_CARD_H - PREVIEW_MARGIN);
      const left = Math.max(
        PREVIEW_MARGIN,
        Math.min(rect.right + 14, window.innerWidth - PREVIEW_CARD_WIDTH - PREVIEW_MARGIN),
      );
      setPreview({ slug: full.slug, title: full.title, top, left, Demo: full.Demo });
    };
  }

  return (
    <nav
      aria-label="Library"
      className="doc-nav"
      onMouseLeave={() => setPreview(null)}
      onWheel={() => setPreview(null)}
      onBlur={(e) => {
        const next = e.relatedTarget;
        if (!(next instanceof Node) || !e.currentTarget.contains(next)) setPreview(null);
      }}
    >
      <div className="doc-nav-group">
        <NavTree
          icon={<Component className="size-4" />}
          label="Blocks"
          href="/components"
          onNavigate={handleNavigate}
          onRootHover={showPreviews ? () => setPreview(null) : undefined}
          leaves={entries.map((entry) => ({
            key: entry.slug,
            href: entryHref(entry),
            label: entry.title,
            onHover: showPreviews ? peekAt(entry) : undefined,
          }))}
        />
      </div>

      {liveTemplates.length > 0 ? (
        <div className="doc-nav-group doc-nav-group--tail">
          <NavTree
            icon={<Layout className="size-4" />}
            label="Templates"
            onNavigate={handleNavigate}
            onRootHover={showPreviews ? () => setPreview(null) : undefined}
            leaves={liveTemplates.map((template) => ({
              key: template.slug,
              href: `/${template.slug}`,
              label: template.title,
              onHover: showPreviews ? peekAt(null) : undefined,
            }))}
          />
        </div>
      ) : null}

      {preview
        ? createPortal(<NavPreviewCard key={preview.slug} preview={preview} />, document.body)
        : null}
    </nav>
  );
}

/** Flat list for mobile sheet — same links, no grouping chrome. */
export function DocNavFlat({ entries, templates = [], onNavigate }: DocNavProps) {
  return (
    <ul className="doc-nav-list">
      <NavLink href="/components" label="Blocks overview" onNavigate={onNavigate} />
      {entries.map((entry) => (
        <NavLink key={`${entry.tier}-${entry.slug}`} href={entryHref(entry)} label={entry.title} onNavigate={onNavigate} />
      ))}
      {templates
        .filter((template) => template.status === "live")
        .map((template) => (
          <NavLink
            key={template.slug}
            href={`/${template.slug}`}
            label={template.title}
            onNavigate={onNavigate}
          />
        ))}
    </ul>
  );
}
