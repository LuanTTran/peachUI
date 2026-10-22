"use client";

/**
 * PeachUI — AppShell (block)
 * @tier block
 * @deps sidebar, page-mast, jump-field
 * @requires app/globals.css
 *
 * Dashboard frame: floating sidebar, page mast, and main column.
 * Quick search and ⌘K open the jump field (W3 shell template).
 */

import { useCallback, useState, type ReactNode } from "react";
import { Home, Plus } from "reicon-react";
import { Avatar } from "@/components/atoms/avatar";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Button } from "@/components/atoms/button";
import { JumpField } from "@/components/blocks/jump-field";
import { PageMast } from "@/components/blocks/page-mast";
import { DashboardSidebar } from "@/components/blocks/sidebar/sidebar";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type AppShellProps = {
  className?: string;
  children?: ReactNode;
};

export function AppShell({ className, children }: AppShellProps) {
  const [selected, setSelected] = useState("home");
  const [navOpen, setNavOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);

  const openJump = useCallback(() => {
    setJumpOpen(true);
  }, []);

  const closeJump = useCallback(() => {
    setJumpOpen(false);
  }, []);

  useMountEffect(() => {
    const onShortcut = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() !== "k") return;
      if (!event.metaKey && !event.ctrlKey) return;
      event.preventDefault();
      setJumpOpen((open) => !open);
    };
    window.addEventListener("keydown", onShortcut);
    return () => window.removeEventListener("keydown", onShortcut);
  });

  return (
    <div
      className={cx(
        "relative flex h-[min(720px,85vh)] w-full min-h-[480px] min-w-0 gap-3 overflow-hidden rounded-window border border-line bg-page p-3",
        className,
      )}
    >
      <div className="hidden h-full min-w-0 shrink-0 overflow-visible lg:block">
        <DashboardSidebar
          className="h-full"
          selected={selected}
          onSelectedChange={setSelected}
          onQuickSearch={openJump}
        />
      </div>

      {navOpen ? (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <button
            type="button"
            aria-label="Close navigation"
            onClick={() => setNavOpen(false)}
            className="absolute inset-0 cursor-pointer bg-ink/40"
          />
          <div className="relative flex h-full p-3">
            <DashboardSidebar
              mobile
              selected={selected}
              onSelectedChange={setSelected}
              onClose={() => setNavOpen(false)}
              onQuickSearch={() => {
                setNavOpen(false);
                openJump();
              }}
              className="flex h-full"
            />
          </div>
        </div>
      ) : null}

      <main className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto px-1 pb-4 pt-1 sm:pt-2">
          <PageMast
            title="Dashboard"
            heading="Dashboard"
            icon={Home}
            menuOpen={navOpen}
            onMenuClick={() => setNavOpen((open) => !open)}
            breadcrumb={
              <Breadcrumb>
                <BreadcrumbItem href="#">
                  <Avatar size="xs" color="blue" initials="P" />
                  PeachUI
                </BreadcrumbItem>
                <BreadcrumbItem href="#">
                  <Avatar size="xs" color="neutral" initials="G" />
                  Growth
                </BreadcrumbItem>
                <BreadcrumbItem current icon={Home}>Dashboard</BreadcrumbItem>
              </Breadcrumb>
            }
            actions={
              <>
                <Button variant="secondary" size="medium">Filters</Button>
                <Button variant="primary" size="medium" leadingIcon={Plus}>
                  Create ticket
                </Button>
              </>
            }
          />

          {children ?? (
            <section className="rounded-panel border border-line-soft bg-surface p-4 shadow-hairline">
              <h2 className="text-body-strong text-ink">Main content</h2>
              <p className="mt-2 max-w-[52ch] text-body text-pretty text-ink-3">
                Shell template demo: sidebar quick search and ⌘K open the jump field. Pass children
                or use the Dashboard block for KPIs and a record ledger.
              </p>
            </section>
          )}
        </div>
      </main>

      <JumpField isOpen={jumpOpen} onClose={closeJump} />
    </div>
  );
}
