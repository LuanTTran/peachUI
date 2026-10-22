"use client";


import { useState } from "react";
import { ShieldCheck } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { fadeInStyle } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

export type PermissionScope = { id: string; label: string };

const DEFAULT_SCOPES: PermissionScope[] = [
  { id: "read", label: "Read /src" },
  { id: "write", label: "Write tokens/export.json" },
  { id: "net", label: "POST studio.peach-ui.dev" },
];

export type PermissionGateLabels = {
  title: string;
  subtitle: string;
  scopeLabel: string;
  deny: string;
  once: string;
  always: string;
  resolved: string;
  deniedMessage: string;
};

const DEFAULT_LABELS: PermissionGateLabels = {
  title: "Allow tool call?",
  subtitle: "publish release",
  scopeLabel: "Scope",
  deny: "Deny",
  once: "Allow once",
  always: "Always allow",
  resolved: "Allowed for this session",
  deniedMessage: "Tool call denied. The agent will try another approach.",
};

export type PermissionChoice = "deny" | "once" | "always";

export type PermissionGateVariant = "standalone" | "embedded";

export type PermissionGateProps = {
  toolName?: string;
  description?: string;
  scopes?: PermissionScope[];
  labels?: Partial<PermissionGateLabels>;
  onChoice?: (choice: PermissionChoice) => void;
  variant?: PermissionGateVariant;
  className?: string;
};

export function PermissionGate({
  toolName = "browser.navigate",
  description = "Open docs.peach-ui.dev and pre-fill the v0.4 release form.",
  scopes = DEFAULT_SCOPES,
  labels,
  onChoice,
  variant = "standalone",
  className,
}: PermissionGateProps = {}) {
  const l = { ...DEFAULT_LABELS, ...labels };
  const [choice, setChoice] = useState<PermissionChoice | null>(null);
  const embedded = variant === "embedded";

  const pick = (next: PermissionChoice) => {
    setChoice(next);
    onChoice?.(next);
  };

  const cardShell = cx(
    "overflow-hidden",
    embedded
      ? "rounded-panel border border-line bg-surface"
      : "rounded-card border border-line bg-surface shadow-card",
  );

  const subtitle = `${toolName} · ${l.subtitle}`;

  if (choice && choice !== "deny") {
    return (
      <div className={cx("w-full min-w-0", className)}>
        <div className={cx(cardShell, "px-3 py-3")} style={fadeInStyle}>
          <p className="text-body text-ink">
            <span className="text-body-medium">{toolName}</span>
            <span className="text-ink-3"> · </span>
            {l.resolved}
          </p>
        </div>
      </div>
    );
  }

  if (choice === "deny") {
    return (
      <div className={cx("w-full min-w-0", className)}>
        <div className={cx(cardShell, "bg-inset px-3 py-3 shadow-hairline")}>
          <p className="text-body text-pretty text-ink-2">{l.deniedMessage}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={cx("w-full min-w-0", className)}>
      <div className={cardShell}>
        <div className="flex items-start gap-3 border-b border-line-soft px-3 py-3">
          <span
            className="flex size-9 shrink-0 items-center justify-center rounded-control bg-inset text-ink shadow-hairline"
            aria-hidden
          >
            <ShieldCheck className="size-[18px]" />
          </span>
          <div className="min-w-0 flex-1">
            <h3 className="text-body-strong text-balance text-ink">{l.title}</h3>
            <p className="mt-0.5 truncate text-caption text-ink-3">{subtitle}</p>
          </div>
        </div>

        <div className="mx-3 my-3 rounded-panel bg-canvas px-3 py-3">
          <p className="text-caption text-pretty text-ink-2">{description}</p>
          <div className="mt-3 border-t border-line-soft pt-3">
            {scopes.map((scope) => (
              <div key={scope.id} className="flex gap-3 py-1 text-caption">
                <span className="w-14 shrink-0 text-ink-3">{l.scopeLabel}</span>
                <span className="min-w-0 font-mono text-ink">{scope.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
        <Button variant="ghost" size="small" type="button" onClick={() => pick("deny")}>
          {l.deny}
        </Button>
        <Button variant="secondary" size="small" type="button" onClick={() => pick("once")}>
          {l.once}
        </Button>
        <Button variant="primary" size="small" type="button" onClick={() => pick("always")}>
          {l.always}
        </Button>
      </div>
    </div>
  );
}
