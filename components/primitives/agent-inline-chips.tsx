import type { HTMLAttributes, ReactNode } from "react";
import { cx } from "@/lib/utils";


export type ToolChipProps = HTMLAttributes<HTMLSpanElement> & {
  children: ReactNode;
};

export function ToolChip({ className, children, ...props }: ToolChipProps) {
  return (
    <span
      className={cx(
        "inline-flex max-w-full items-center rounded-md bg-inset px-1.5 py-0.5 text-code text-ink shadow-hairline",
        className,
      )}
      {...props}
    >
      <span className="truncate">{children}</span>
    </span>
  );
}

export type RiskLevel = "low" | "medium" | "high";

const RISK_COPY: Record<RiskLevel, string> = {
  low: "Low risk",
  medium: "Medium risk",
  high: "High risk",
};

const RISK_DOT: Record<RiskLevel, string> = {
  low: "bg-green",
  medium: "bg-warning",
  high: "bg-red",
};

export type RiskChipProps = HTMLAttributes<HTMLSpanElement> & {
  level?: RiskLevel;
  label?: string;
};

export function RiskChip({ className, level = "medium", label, ...props }: RiskChipProps) {
  return (
    <span
      className={cx(
        "inline-flex shrink-0 items-center gap-1.5 rounded-full bg-warning-muted px-2 py-0.5 text-caption font-medium text-warning",
        className,
      )}
      {...props}
    >
      <span className={cx("size-1.5 shrink-0 rounded-full", RISK_DOT[level])} aria-hidden />
      {label ?? RISK_COPY[level]}
    </span>
  );
}

export type EditChipKind = "add" | "remove";

export type EditChipProps = HTMLAttributes<HTMLSpanElement> & {
  kind: EditChipKind;
  children: ReactNode;
};

export function EditChip({ className, kind, children, ...props }: EditChipProps) {
  return (
    <span
      className={cx(
        "rounded-md px-0.5 text-body",
        kind === "remove" && "bg-red-muted text-red line-through decoration-red/60",
        kind === "add" && "bg-green-muted text-green",
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}
