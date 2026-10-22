"use client";


import type { ReactNode } from "react";
import { cx } from "@/lib/utils";

export type ConnectAppsStripLabels = {
  title: string;
};

export const defaultConnectAppsStripLabels: ConnectAppsStripLabels = {
  title: "Connect apps",
};

export type ConnectAppsStripProps = {
  className?: string;
  labels?: Partial<ConnectAppsStripLabels>;
  icons?: ReactNode;
  onPress?: () => void;
};

function GmailMark() {
  return (
    <svg width="14" height="11" viewBox="0 0 256 193" aria-hidden>
      <path d="M58.182 192.05V93.14L27.507 65.077 0 49.504v125.091c0 9.658 7.825 17.455 17.455 17.455h40.727Z" fill="#4285F4" />
      <path d="M197.818 192.05h40.727c9.659 0 17.455-7.826 17.455-17.455V49.505l-31.156 17.837-27.026 25.798v98.91Z" fill="#34A853" />
      <path d="m58.182 93.14-4.174-38.647 4.174-36.989L128 69.868l69.818-52.364 4.669 34.992-4.669 40.644L128 145.504 58.182 93.14Z" fill="#EA4335" />
      <path d="M197.818 17.504V93.14L256 49.504V26.231c0-21.585-24.64-33.89-41.89-20.945l-16.292 12.218Z" fill="#FBBC04" />
      <path d="m0 49.504 26.759 20.07L58.182 93.14V17.504L41.89 5.286C24.61-7.66 0 4.646 0 26.23v23.273Z" fill="#C5221F" />
    </svg>
  );
}

function SlackMark() {
  return (
    <svg width="14" height="14" viewBox="0 0 127 127" aria-hidden>
      <path d="M27.2 80c0 7.3-5.9 13.2-13.2 13.2C6.7 93.2.8 87.3.8 80c0-7.3 5.9-13.2 13.2-13.2h13.2V80zm6.6 0c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2v33c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V80z" fill="#E01E5A" />
      <path d="M47 27.2c-7.3 0-13.2-5.9-13.2-13.2C33.8 6.7 39.7.8 47 .8c7.3 0 13.2 5.9 13.2 13.2v13.2H47zm0 6.7c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H13.9C6.6 60.3.7 54.4.7 47.1c0-7.3 5.9-13.2 13.2-13.2H47z" fill="#36C5F0" />
      <path d="M99.9 47.1c0-7.3 5.9-13.2 13.2-13.2 7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H99.9V47.1zm-6.6 0c0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V13.9C66.9 6.6 72.8.7 80.1.7c7.3 0 13.2 5.9 13.2 13.2v33.2z" fill="#2EB67D" />
      <path d="M80.1 99.8c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2-7.3 0-13.2-5.9-13.2-13.2V99.8h13.2zm0-6.6c-7.3 0-13.2-5.9-13.2-13.2 0-7.3 5.9-13.2 13.2-13.2h33.1c7.3 0 13.2 5.9 13.2 13.2 0 7.3-5.9 13.2-13.2 13.2H80.1z" fill="#ECB22E" />
    </svg>
  );
}

function FigmaMark() {
  return (
    <svg width="10" height="14" viewBox="0 0 38 57" aria-hidden>
      <path d="M9.5 57A9.5 9.5 0 0 0 19 47.5V38H9.5a9.5 9.5 0 0 0 0 19z" fill="#0ACF83" />
      <path d="M0 28.5A9.5 9.5 0 0 1 9.5 19H19v19H9.5A9.5 9.5 0 0 1 0 28.5z" fill="#A259FF" />
      <path d="M0 9.5A9.5 9.5 0 0 1 9.5 0H19v19H9.5A9.5 9.5 0 0 1 0 9.5z" fill="#F24E1E" />
      <path d="M19 0h9.5a9.5 9.5 0 1 1 0 19H19V0z" fill="#FF7262" />
      <path d="M38 28.5a9.5 9.5 0 1 1-19 0 9.5 9.5 0 0 1 19 0z" fill="#1ABCFE" />
    </svg>
  );
}

function DefaultIcons() {
  return (
    <>
      <span className="flex size-7 items-center justify-center rounded-full border border-line bg-surface shadow-hairline">
        <GmailMark />
      </span>
      <span className="-ms-2 flex size-7 items-center justify-center rounded-full border border-line bg-surface shadow-hairline">
        <SlackMark />
      </span>
      <span className="-ms-2 flex size-7 items-center justify-center rounded-full border border-line bg-surface shadow-hairline">
        <FigmaMark />
      </span>
    </>
  );
}

export function ConnectAppsStrip({
  className,
  labels: labelsProp,
  icons,
  onPress,
}: ConnectAppsStripProps) {
  const labels = { ...defaultConnectAppsStripLabels, ...labelsProp };

  return (
    <button
      type="button"
      onClick={onPress}
      className={cx(
        "button-press-motion flex w-full items-center gap-2 rounded-b-card px-3 py-2.5 text-left transition-colors duration-150 hover:bg-hover",
        className,
      )}
    >
      <span className="flex items-center pl-0.5">{icons ?? <DefaultIcons />}</span>
      <span className="text-meta font-medium text-ink-2">{labels.title}</span>
    </button>
  );
}
