"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSyncExternalStore, type ReactNode } from "react";
import { Monitor } from "reicon-react";
import { buttonStyles } from "@/components/atoms/button";
import { TEMPLATES } from "@/lib/templates";
import { cx } from "@/lib/utils";

/* Templates are full product screens — desktop reference layouts. Below the
 * md breakpoint the gate swaps the shell for a notice instead of shipping a
 * cramped, clipped frame. Keyed off min-width:768px so it lines up with the
 * md: classes below (unlike use-mobile's max-width query, which would leave
 * a 1px dead zone at exactly 768px). */
const DESKTOP_QUERY = "(min-width: 768px)";

function subscribeDesktop(onChange: () => void) {
  const query = window.matchMedia(DESKTOP_QUERY);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

const desktopSnapshot = () => window.matchMedia(DESKTOP_QUERY).matches;

/** Server snapshot is `true` — desktop-first SSR, same convention as use-mobile. */
function useIsDesktop() {
  return useSyncExternalStore(subscribeDesktop, desktopSnapshot, () => true);
}

export function DesktopGate({ children }: { children: ReactNode }) {
  const isDesktop = useIsDesktop();
  const pathname = usePathname();
  const slug = pathname.replace(/\/+$/, "").split("/").pop();
  const template = TEMPLATES.find((entry) => entry.slug === slug);

  return (
    <>
      {/* SSR-visible on phones; hidden at md and up. */}
      <div className="flex min-h-dvh flex-col items-center justify-center gap-5 bg-page px-6 text-center md:hidden">
        <span className="flex size-14 items-center justify-center rounded-panel border border-line bg-surface text-ink-2 shadow-hairline">
          <Monitor className="size-6" aria-hidden />
        </span>
        <div className="flex flex-col items-center gap-1.5">
          {template ? (
            <p className="text-caption uppercase tracking-[0.02em] text-ink-3">
              {template.product} · {template.title}
            </p>
          ) : null}
          <h1 className="text-body-strong text-ink">Desktop only</h1>
          <p className="max-w-[34ch] text-caption text-ink-3">
            This screen is a full desktop layout — open it on a larger display to explore it live.
          </p>
        </div>
        <Link
          href="/library"
          className={cx(buttonStyles.base, buttonStyles.size.small, buttonStyles.variant.secondary)}
        >
          Browse the library
        </Link>
      </div>

      {/* The shell only mounts on wide viewports; the wrapper's `hidden`
       * covers the pre-hydration frame on phones. */}
      <div className="hidden md:block">{isDesktop ? children : null}</div>
    </>
  );
}
