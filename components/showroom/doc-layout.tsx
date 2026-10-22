"use client";

import Link from "next/link";
import { useState } from "react";
import {
  Button as AriaButton,
  Dialog as AriaDialog,
  DialogTrigger as AriaDialogTrigger,
  Modal as AriaModal,
  ModalOverlay as AriaModalOverlay,
} from "react-aria-components";
import { Menu, X } from "reicon-react";
import { Logo } from "@/components/atoms/logo";
import { DocNav, type NavEntry } from "@/components/showroom/doc-nav";
import { ThemeToggle } from "@/components/primitives/theme-toggle";
import { SITE } from "@/lib/site";
import type { TemplateEntry } from "@/lib/templates";
import { useIsMobile } from "@/lib/use-mobile";

/**
 * Hamburger trigger + slide-in sheet carrying the nav tree. The trigger is
 * always mounted and hidden above the mobile breakpoint by CSS, so SSR and
 * pre-hydration frames already show it on small viewports — no topbar shift
 * when hydration flips `useIsMobile`.
 */
function MobileNav({ entries, templates }: { entries: NavEntry[]; templates: TemplateEntry[] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <AriaDialogTrigger isOpen={isOpen} onOpenChange={setIsOpen}>
      <AriaButton className="doc-nav-toggle" aria-label="Open navigation">
        <Menu className="size-5" aria-hidden />
      </AriaButton>
      <AriaModalOverlay isDismissable className="doc-nav-sheet-overlay">
        <AriaModal className="doc-nav-sheet">
          <AriaDialog className="doc-nav-sheet-panel" aria-label="Site navigation">
            {({ close }) => (
              <>
                <div className="doc-nav-sheet-head">
                  <Link href="/" className="doc-nav-brand" onClick={close}>
                    <Logo size={20} />
                    {SITE.name}
                  </Link>
                  <AriaButton
                    className="doc-nav-sheet-close"
                    aria-label="Close navigation"
                    onPress={close}
                  >
                    <X className="size-4" aria-hidden />
                  </AriaButton>
                </div>
                <div className="doc-nav-sheet-scroll">
                  <DocNav
                    entries={entries}
                    templates={templates}
                    onNavigate={close}
                    showPreviews={false}
                  />
                </div>
              </>
            )}
          </AriaDialog>
        </AriaModal>
      </AriaModalOverlay>
    </AriaDialogTrigger>
  );
}

export function DocLayout({
  entries,
  templates = [],
  children,
}: {
  entries: NavEntry[];
  templates?: TemplateEntry[];
  children: React.ReactNode;
}) {
  const isMobile = useIsMobile();

  return (
    <div className="doc-shell relative bg-page text-ink">
      <div className="doc-scroll-fade" aria-hidden />

      <header className="doc-topbar">
        <div className="doc-topbar-side">
          <MobileNav entries={entries} templates={templates} />
          <Link href="/" className="doc-nav-brand">
            <Logo size={20} />
            {SITE.name}
          </Link>
        </div>

        <div className="doc-utilities">
          <ThemeToggle appearance="segmented" size="small" />
          <Link
            href={SITE.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="doc-utility-link"
            aria-label="GitHub"
          >
            <GitHubIcon />
          </Link>
        </div>
      </header>

      <div className="doc-frame">
        {isMobile ? null : (
          <aside className="doc-aside">
            <DocNav entries={entries} templates={templates} />
          </aside>
        )}

        <main className="doc-main">{children}</main>
      </div>
    </div>
  );
}

function GitHubIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path
        d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z"
      />
    </svg>
  );
}
