"use client";

/**
 * PeachUI — PageMast (block)
 * @tier block
 * @deps breadcrumb, icon-button, button (actions slot)
 * @requires app/globals.css
 *
 * Page header above main content: breadcrumb trail, title, and actions.
 * Host supplies breadcrumb children and action buttons.
 */

import type { ComponentType, ReactNode } from "react";
import { Menu, X } from "reicon-react";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { IconButton } from "@/components/atoms/icon-button";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export type PageMastProps = {
  className?: string;
  /** Visible page name in the breadcrumb when using `title` alone is not enough. */
  title: string;
  /** Main heading; defaults to `title`. */
  heading?: string;
  /** Icon on the current breadcrumb item. */
  icon?: IconComponent;
  /** Breadcrumb trail; pass `<BreadcrumbItem>` children. When omitted, only the current page item is shown. */
  breadcrumb?: ReactNode;
  /** Right-side toolbar (buttons, menus). */
  actions?: ReactNode;
  /** Opens the mobile navigation drawer; shows the menu control below `lg`. */
  onMenuClick?: () => void;
  /** When the drawer is open, swap the menu icon for close. */
  menuOpen?: boolean;
  menuLabel?: string;
  menuCloseLabel?: string;
};

export function PageMast({
  className,
  title,
  heading = title,
  icon: Icon,
  breadcrumb,
  actions,
  onMenuClick,
  menuOpen = false,
  menuLabel = "Open navigation",
  menuCloseLabel = "Close navigation",
}: PageMastProps) {
  const showMenu = Boolean(onMenuClick);

  return (
    <header className={cx("flex w-full flex-col gap-2", className)}>
      {breadcrumb ?? (
        <Breadcrumb>
          <BreadcrumbItem current icon={Icon}>{title}</BreadcrumbItem>
        </Breadcrumb>
      )}

      <div className="flex w-full flex-wrap items-end justify-between gap-2">
        <div className="flex min-w-0 items-center gap-1.5">
          {showMenu ? (
            <IconButton
              icon={menuOpen ? X : Menu}
              size="medium"
              aria-label={menuOpen ? menuCloseLabel : menuLabel}
              onClick={onMenuClick}
              className="lg:hidden"
            />
          ) : null}
          <h1 className="text-section-title text-balance whitespace-nowrap px-1 text-ink">
            {heading}
          </h1>
        </div>
        {actions ? (
          <div className="flex flex-wrap items-center justify-end gap-2.5">{actions}</div>
        ) : null}
      </div>
    </header>
  );
}
