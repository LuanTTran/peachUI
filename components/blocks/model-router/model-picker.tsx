"use client";

import { Check } from "reicon-react";
import { Select, SelectItem } from "@/components/atoms/select";
import { RouteDot } from "@/components/blocks/model-router/route-dot";
import type { ModelRouterModel } from "@/components/types";
import { cx } from "@/lib/utils";

function formatCost(value: number) {
  if (value >= 0.01) return `$${value.toFixed(3)}`;
  return `$${value.toFixed(4)}`;
}

export type ModelPickerProps = {
  models: ModelRouterModel[];
  selectedId: string;
  onChange: (id: string) => void;
  ariaLabel: string;
  className?: string;
  /** Inline trigger for fallback copy; menu trigger for the header project field. */
  variant?: "inline" | "field";
  isDisabled?: boolean;
};

export function ModelPicker({
  models,
  selectedId,
  onChange,
  ariaLabel,
  className,
  variant = "field",
  isDisabled = false,
}: ModelPickerProps) {
  const selected = models.find((m) => m.id === selectedId) ?? models[0];

  return (
    <Select
      aria-label={ariaLabel}
      isDisabled={isDisabled}
      selectedKey={selected?.id}
      onSelectionChange={(key) => {
        if (key != null) onChange(String(key));
      }}
      className={cx(variant === "inline" ? "inline-flex w-auto min-w-0" : "min-w-[9.5rem]", className)}
      size="sm"
      triggerClassName={cx(
        variant === "inline" &&
          "border-0 bg-transparent px-1 py-0 shadow-none hover:bg-hover hover:border-transparent",
      )}
      renderValue={() =>
        selected ? (
          <span className="inline-flex min-w-0 items-center gap-1.5">
            <RouteDot color={selected.color} />
            <span className="truncate text-body-2-medium text-ink">{selected.name}</span>
          </span>
        ) : null
      }
    >
      {models.map((model) => (
        <SelectItem key={model.id} id={model.id} textValue={model.name}>
          <span className="flex w-full min-w-0 items-center gap-2">
            <RouteDot color={model.color} />
            <span className="min-w-0 flex-1 truncate">{model.name}</span>
            <span className="shrink-0 font-mono text-caption text-ink-3 tabular-nums">
              {formatCost(model.costPer1k)}
            </span>
            {model.id === selectedId ? <Check className="size-4 shrink-0 text-ink" aria-hidden /> : null}
          </span>
        </SelectItem>
      ))}
    </Select>
  );
}
