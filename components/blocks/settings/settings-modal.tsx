"use client";

import { useRef, useState, type ComponentType, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { BookOpen, BranchUp, Card, Code, Database, GraduationCap, Hierarchy, Palette, Plug, Setting, Store, X } from "reicon-react";
import { Setting4Filled, TickCircleFilled } from "@/components/atoms/icons";
import { AnimatePresence, motion } from "@/components/lib/motion";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";
import { SettingsGeneral } from "@/components/blocks/settings/settings-general";
import { SettingsProfile } from "@/components/blocks/settings/settings-profile";
import { SettingsStorage } from "@/components/blocks/settings/settings-storage";
import { SettingsTools } from "@/components/blocks/settings/settings-tools";

/**
 * Figma sources: "Settings/Profile" (node 4081:13943) and
 * "Settings/General" (node 4079:13037).
 *
 * The app-wide settings modal, opened from any sidebar's "Settings" item.
 *
 * Shell (1:1 with Figma):
 *   backdrop  color/bg_separator — black at 20%.
 *   panel     871×614 (max-height 614), radius/3xl (24px), white, shadow/xs.
 *   rail      240px desktop / 192px compact, bg background/secondary, 1px right border, p 10 —
 *             same group/item recipe as the board-team dropdown menus
 *             (label pl-8, items p-8 radius/2lg icon-20 + body-medium),
 *             selected row bg background/secondary/hover.
 *   content   px 32, title row fixed,
 *             the page itself scrolls when taller than the shell (General).
 *
 * Open/close animation: the panel fades + blurs in from scale 0.85 (300ms),
 * the backdrop cross-fades; the same transition plays in reverse on close,
 * and the modal unmounts only after the exit transition finishes.
 */

export type SettingsPage = "general" | "profile" | "storage" | "tools" | "marketplace";

export interface SettingsModalProps {
  /** Controlled open state, owned by the host page, sidebar, or menu. */
  isOpen: boolean;
  /** Called by the backdrop, close button, and Escape key. */
  onClose: () => void;
  /** Page selected each time the modal opens. */
  defaultPage?: SettingsPage;
  /** Optional marketplace pane, including its own fixed header and scroll region. */
  marketplace?: ReactNode;
}

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

interface NavEntry {
  label: string;
  icon: IconComponent;
  /** Only pages that exist are navigable; the rest render as static rows. */
  page?: SettingsPage;
}

const NAV_GROUPS: { label: string; items: NavEntry[] }[] = [
  {
    label: "Settings",
    items: [
      { label: "General", icon: Setting, page: "general" },
      { label: "Profile", icon: GraduationCap, page: "profile" },
      { label: "Marketplace", icon: Store, page: "marketplace" },
      { label: "Appearance", icon: Palette },
      { label: "Billing", icon: Card },
      { label: "Automation", icon: Hierarchy },
      { label: "Tools", icon: Setting4Filled, page: "tools" },
      { label: "Storage", icon: Database, page: "storage" },
    ],
  },
  {
    label: "Desktop app",
    items: [
      { label: "General", icon: Setting },
      { label: "Plugins", icon: Plug },
      { label: "Developer", icon: Code },
    ],
  },
  {
    label: "Customize",
    items: [
      { label: "Skills", icon: BookOpen },
      { label: "Git", icon: BranchUp },
    ],
  },
];

const PAGE_TITLES: Record<SettingsPage, string> = {
  general: "General",
  profile: "Profile",
  storage: "Storage",
  tools: "Tools",
  marketplace: "Marketplace",
};

export function SettingsModal({
  isOpen,
  onClose,
  defaultPage = "general",
  marketplace,
}: SettingsModalProps) {
  if (typeof document === "undefined") return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <SettingsModalOverlay
          onClose={onClose}
          defaultPage={defaultPage}
          marketplace={marketplace}
        />
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}

/**
 * The dialog itself. Mount-gated by the parent, so every open is a fresh
 * instance on `defaultPage`, the mount animation is the entrance, and
 * `autoFocus` lands focus on the panel — no mount/visible choreography.
 */
function SettingsModalOverlay({
  onClose,
  defaultPage,
  marketplace,
}: {
  onClose: () => void;
  defaultPage: SettingsPage;
  marketplace?: ReactNode;
}) {
  const [page, setPage] = useState<SettingsPage>(defaultPage);

  // "Saved" toast — floats half-out of the panel's bottom edge for ~2s
  // whenever a profile field commits a change (Enter / blur). Three phases
  // so the motion is directional: it rises in from below ("hidden" starting
  // offset) and keeps drifting upward while fading out ("leaving" offset).
  const [savedPhase, setSavedPhase] = useState<"hidden" | "shown" | "leaving">("hidden");
  const savedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const showSavedToast = () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
    setSavedPhase("shown");
    savedTimer.current = setTimeout(() => {
      setSavedPhase("leaving");
      // Reset to the below-the-edge start once the fade-out finished, so the
      // next save rises in from the bottom again (invisible: opacity 0 → 0).
      savedTimer.current = setTimeout(() => setSavedPhase("hidden"), 220);
    }, 2000);
  };

  useMountEffect(() => () => {
    if (savedTimer.current) clearTimeout(savedTimer.current);
  });

  // Top fade over the scrolling page so rows dissolve under the title row
  // instead of cutting sharply (same recipe as the medical alerts feed).
  const [contentScrolled, setContentScrolled] = useState(false);

  return (
    <div
      className="fixed inset-0 z-100 flex items-center justify-center p-4"
      role="presentation"
      onKeyDown={(event) => {
        if (event.key === "Escape") onClose();
      }}
    >
      {/* Backdrop — dark-mode modal reference uses black at 70%. */}
      <motion.button
        type="button"
        aria-label="Close settings"
        tabIndex={-1}
        onClick={onClose}
        className="absolute inset-0 cursor-default bg-black/60"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      />

      {/* Animated wrapper — carries the open/close transition for the panel
          AND the saved toast, which straddles the panel's bottom edge and so
          must live outside the panel's overflow-clip. */}
      <motion.div
        className="relative transform-gpu will-change-[opacity,transform,filter]"
        // Kept light on purpose: an 8px blur over the full 871×614 panel
        // forces a huge re-filter every frame of the scale-down, which is
        // what made the close stutter. 4px + GPU promotion stays smooth.
        initial={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
        animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }}
        exit={{ opacity: 0, scale: 0.85, filter: "blur(4px)" }}
        transition={{ duration: 0.3, ease: [0.32, 0.72, 0, 1] }}
      >
      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Settings"
        tabIndex={-1}
        autoFocus
        className={cx(
          "relative flex h-[614px] max-h-[calc(100dvh-32px)] w-[871px] max-w-[calc(100vw-32px)]",
          // overflow-CLIP, not hidden: hidden boxes are still programmatically
          // scrollable, so focusing a switch's hidden input in a row clipped
          // by the inner scroller made the browser scroll-reveal it through
          // the panel too — shifting the whole modal content up with no way
          // back. clip forbids scrolling outright.
          "overflow-clip rounded-3xl bg-page shadow-xs outline-none",
        )}
      >
        {/* Nav rail — the board-team dropdown group/item recipe */}
        <nav
          aria-label="Settings sections"
          className="flex w-14 shrink-0 flex-col gap-5 overflow-y-auto border-e border-line bg-canvas p-2.5 sm:w-48 lg:w-60"
        >
          {NAV_GROUPS.map((group) => (
            <div key={group.label} className="flex w-full flex-col gap-1.5 pt-1">
              <span className="hidden ps-2 text-body-medium text-ink-2 sm:block">{group.label}</span>
              <div className="flex w-full flex-col gap-1">
                {group.items.filter(item => item.page !== "marketplace" || marketplace != null).map((item) => {
                  const selected = item.page !== undefined && item.page === page;
                  return (
                    <button
                      key={`${group.label}:${item.label}`}
                      type="button"
                      aria-label={item.label}
                      title={item.label}
                      aria-current={selected ? "page" : undefined}
                      onClick={
                        item.page
                          ? () => {
                              setPage(item.page!);
                              setContentScrolled(false);
                            }
                          : undefined
                      }
                      className={cx(
                        "flex w-full cursor-pointer items-center gap-2 rounded-2lg p-2 text-start",
                        "outline-none transition-colors duration-150 ease focus-visible:ring-2 focus-visible:ring-accent",
                        selected
                          ? "bg-hover"
                          : "hover:bg-hover/60",
                      )}
                    >
                      <item.icon className="size-5 shrink-0 text-ink-2" aria-hidden />
                      <span
                        className={cx(
                          "hidden truncate text-body-medium sm:block",
                          selected ? "text-ink" : "text-ink-2",
                        )}
                      >
                        {item.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>

        {/* Content pane — fixed title row, scrollable page below */}
        <div className="flex min-w-0 flex-1 flex-col">
          {page === "marketplace" && marketplace != null ? marketplace : <>
          {/* Storage keeps a tighter title gap: its page already carries
              10px of scroll-safe headroom for the upload progress badge, so
              the shared pb-3 read as a double margin above the dropzone. */}
          <div
            className={cx(
              "flex shrink-0 items-center justify-between px-8 pt-8",
              page === "storage" ? "pb-1.5" : "pb-3",
            )}
          >
            <h2 className="text-title-3-medium text-ink">{PAGE_TITLES[page]}</h2>
            <button
              type="button"
              aria-label="Close settings"
              onClick={onClose}
              className={cx(
                "flex size-6 shrink-0 cursor-pointer items-center justify-center rounded-full",
                "bg-hover-2 text-ink-2",
                "transition-colors duration-150 ease hover:bg-line",
                "outline-none focus-visible:ring-2 focus-visible:ring-accent",
              )}
            >
              <X className="size-4" aria-hidden />
            </button>
          </div>
          <div className="relative min-h-0 flex-1">
            <div
              className="h-full overflow-y-auto px-8 pb-8"
              onScroll={(e) => setContentScrolled(e.currentTarget.scrollTop > 0)}
            >
              {page === "profile" ? (
                <SettingsProfile onSaved={showSavedToast} />
              ) : page === "storage" ? (
                <SettingsStorage />
              ) : page === "tools" ? (
                <SettingsTools />
              ) : (
                <SettingsGeneral />
              )}
            </div>
            {/* Progressive top fade — eases in once the page is scrolled so
                content dissolves under the title row instead of hard-cutting. */}
            <div
              aria-hidden
              className={cx(
                "pointer-events-none absolute inset-x-0 top-0 h-10 bg-linear-to-b from-surface to-transparent",
                "transition-opacity duration-200 ease-out",
                contentScrolled ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
          </>}
        </div>
      </div>

      {/* Saved toast — straddles the panel's bottom edge, half in / half out. */}
      <div
        aria-live="polite"
        className={cx(
          "pointer-events-none absolute bottom-0 left-1/2 z-10 flex -translate-x-1/2 items-center gap-1",
          "rounded-full border border-line bg-surface py-1 pe-2.5 ps-1.5 shadow-dropdown",
          "transition-[opacity,transform,filter] duration-200 ease-out",
          savedPhase === "shown" && "translate-y-1/2 opacity-100 scale-100 blur-0",
          // Starts below the resting spot, rises in; keeps drifting up on exit.
          savedPhase === "hidden" && "translate-y-[calc(50%+12px)] opacity-0 scale-90 blur-[2px]",
          savedPhase === "leaving" && "translate-y-[calc(50%-10px)] opacity-0 scale-90 blur-[2px]",
        )}
      >
        <TickCircleFilled className="size-4 shrink-0 text-green" aria-hidden />
        <span className="text-body-2-medium whitespace-nowrap text-ink">Saved</span>
      </div>
      </motion.div>
    </div>
  );
}
