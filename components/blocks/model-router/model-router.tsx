"use client";

/**
 * PeachUI — ModelRouter (block)
 * @tier block
 * @deps segmented-control, select, switch, table, button, icon-button, close-button, status-dot
 * @requires app/globals.css
 *
 * Routing policy surface: blended cost, gateway split, per-model metrics, backup routing.
 * Keyboard: segment and table rows follow react-aria patterns; deploy is a primary action.
 *
 * Host wiring (example — replace defaults with your API):
 * // const summary = await fetchRouterSummary(projectId);
 * // const routes = await fetchActiveRoutes(projectId);
 * // <ModelRouter summary={summary} routes={routes} onDeployPolicy={() => publish(projectId)} />
 */

import { useState } from "react";
import { More2, Setting } from "reicon-react";
import { Button } from "@/components/atoms/button";
import { CloseButton } from "@/components/atoms/close-button";
import { IconButton } from "@/components/atoms/icon-button";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/atoms/segmented-control";
import { Select, SelectItem } from "@/components/atoms/select";
import { Switch } from "@/components/atoms/switch";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import {
  defaultModelRouterModels,
  defaultModelRouterProjects,
  defaultModelRouterRoutes,
  defaultModelRouterSummary,
} from "@/components/data/model-router-defaults";
import { GatewayViz } from "@/components/blocks/model-router/gateway-viz";
import { ModelPicker } from "@/components/blocks/model-router/model-picker";
import { RouteDot } from "@/components/blocks/model-router/route-dot";
import type {
  ModelRoute,
  ModelRouterLabels,
  ModelRouterModel,
  ModelRouterPolicyMode,
  ModelRouterProject,
  ModelRouterSummary,
} from "@/components/types";
import { defaultModelRouterLabels } from "@/components/types";
import { fadeUpStagger } from "@/components/lib/block-motion";
import { cx } from "@/lib/utils";

export type ModelRouterVariant = "standalone" | "embedded";

export type ModelRouterProps = {
  className?: string;
  variant?: ModelRouterVariant;
  projects?: ModelRouterProject[];
  defaultProjectId?: string;
  projectId?: string;
  onProjectChange?: (projectId: string) => void;
  models?: ModelRouterModel[];
  routes?: ModelRoute[];
  summary?: ModelRouterSummary;
  defaultPolicyMode?: ModelRouterPolicyMode;
  policyMode?: ModelRouterPolicyMode;
  onPolicyModeChange?: (mode: ModelRouterPolicyMode) => void;
  defaultFallbackEnabled?: boolean;
  fallbackEnabled?: boolean;
  onFallbackEnabledChange?: (enabled: boolean) => void;
  defaultFallbackPrimaryId?: string;
  fallbackPrimaryId?: string;
  onFallbackPrimaryChange?: (modelId: string) => void;
  defaultFallbackRetryId?: string;
  fallbackRetryId?: string;
  onFallbackRetryChange?: (modelId: string) => void;
  policyRevision?: string;
  environmentLabel?: string;
  labels?: Partial<ModelRouterLabels>;
  onSettings?: () => void;
  onClose?: () => void;
  onDeployPolicy?: () => void;
  isDeploying?: boolean;
};

function formatCostPer1k(value: number) {
  return `$${value.toFixed(4)}`;
}

function formatPercent(value: number) {
  return `${value.toFixed(value >= 1 ? 1 : 2)}%`;
}

function formatLatency(seconds: number) {
  return seconds.toFixed(2);
}

export function ModelRouter({
  className,
  variant = "standalone",
  projects = defaultModelRouterProjects,
  defaultProjectId = projects[0]?.id ?? "assistant-prod",
  projectId: projectIdProp,
  onProjectChange,
  models = defaultModelRouterModels,
  routes = defaultModelRouterRoutes,
  summary = defaultModelRouterSummary,
  defaultPolicyMode = "balanced",
  policyMode: policyModeProp,
  onPolicyModeChange,
  defaultFallbackEnabled = true,
  fallbackEnabled: fallbackEnabledProp,
  onFallbackEnabledChange,
  defaultFallbackPrimaryId = models[0]?.id ?? "claude-opus-4-6",
  fallbackPrimaryId: fallbackPrimaryIdProp,
  onFallbackPrimaryChange,
  defaultFallbackRetryId = models[2]?.id ?? "claude-haiku-4-5",
  fallbackRetryId: fallbackRetryIdProp,
  onFallbackRetryChange,
  policyRevision = "Routing policy v3",
  environmentLabel = "assistant-prod",
  labels: labelsProp,
  onSettings,
  onClose,
  onDeployPolicy,
  isDeploying = false,
}: ModelRouterProps) {
  const labels = { ...defaultModelRouterLabels, ...labelsProp };
  const embedded = variant === "embedded";

  const [projectId, setProjectId] = useState(defaultProjectId);
  const activeProjectId = projectIdProp ?? projectId;

  const [policyMode, setPolicyMode] = useState<ModelRouterPolicyMode>(defaultPolicyMode);
  const activePolicyMode = policyModeProp ?? policyMode;

  const [fallbackEnabled, setFallbackEnabled] = useState(defaultFallbackEnabled);
  const activeFallback = fallbackEnabledProp ?? fallbackEnabled;

  const [fallbackPrimaryId, setFallbackPrimaryId] = useState(defaultFallbackPrimaryId);
  const activePrimaryId = fallbackPrimaryIdProp ?? fallbackPrimaryId;

  const [fallbackRetryId, setFallbackRetryId] = useState(defaultFallbackRetryId);
  const activeRetryId = fallbackRetryIdProp ?? fallbackRetryId;

  const setProject = (id: string) => {
    setProjectId(id);
    onProjectChange?.(id);
  };

  const setMode = (mode: ModelRouterPolicyMode) => {
    setPolicyMode(mode);
    onPolicyModeChange?.(mode);
  };

  const setFallback = (enabled: boolean) => {
    setFallbackEnabled(enabled);
    onFallbackEnabledChange?.(enabled);
  };

  return (
    <section
      className={cx(
        "flex w-full flex-col overflow-hidden",
        embedded
          ? "bg-transparent"
          : "max-w-[40rem] rounded-card border border-line bg-surface shadow-card",
        className,
      )}
      aria-labelledby="model-router-title"
    >
      {!embedded ? (
        <header className="flex items-center justify-between gap-2 border-b border-line-soft px-3 py-2">
          <h2 id="model-router-title" className="min-w-0 truncate text-headline-medium text-ink">
            {labels.title}
          </h2>
          <div className="flex shrink-0 items-center gap-1.5">
            <Select
              aria-label={labels.projectLabel}
              selectedKey={activeProjectId}
              onSelectionChange={(key) => {
                if (key != null) setProject(String(key));
              }}
              size="sm"
              className="w-auto min-w-[8.5rem]"
            >
              {projects.map((project) => (
                <SelectItem key={project.id} id={project.id} textValue={project.label}>
                  {project.label}
                </SelectItem>
              ))}
            </Select>
            <IconButton icon={Setting} aria-label={labels.settings} size="small" onClick={() => onSettings?.()} />
            <CloseButton aria-label={labels.close} size="xs" onClick={() => onClose?.()} />
          </div>
        </header>
      ) : (
        <h2 id="model-router-title" className="px-1 pb-1.5 text-headline-medium text-ink">
          {labels.title}
        </h2>
      )}

      <div className={cx("flex flex-col gap-2", embedded ? "px-0 py-1.5" : "p-1.5")}>
        <div
          className="rounded-panel border border-line-soft bg-canvas px-3 py-2.5"
          style={fadeUpStagger(0)}
        >
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-overline">{labels.blendedCost}</p>
              <p className="mt-1 text-metric tabular-nums">
                {formatCostPer1k(summary.blendedCostPer1k)}
                <span className="ms-1 text-body text-ink-3">/ 1K tokens</span>
              </p>
              <p className="mt-1.5 text-caption text-ink-3 tabular-nums">
                <span>
                  {Math.round(summary.requestsPerSec)} {labels.requestsPerSec}
                </span>
                <span aria-hidden className="mx-1.5">
                  ·
                </span>
                <span>
                  {labels.p95} {formatLatency(summary.p95Seconds)} s
                </span>
                <span aria-hidden className="mx-1.5">
                  ·
                </span>
                <span>
                  {formatPercent(summary.errorPercent)} {labels.errors}
                </span>
              </p>
            </div>
            <SegmentedControl
              aria-label={labels.policyMode}
              selectedKeys={[activePolicyMode]}
              onSelectionChange={(keys) => {
                const next = [...(keys as Set<string>)][0] as ModelRouterPolicyMode | undefined;
                if (next) setMode(next);
              }}
              className="shrink-0"
            >
              <SegmentedControlItem id="cost">{labels.costMode}</SegmentedControlItem>
              <SegmentedControlItem id="balanced">{labels.balancedMode}</SegmentedControlItem>
              <SegmentedControlItem id="quality">{labels.qualityMode}</SegmentedControlItem>
            </SegmentedControl>
          </div>

          <GatewayViz routes={routes} label={labels.gateway} className="mt-3" />
        </div>

        <div className="px-1.5 pt-1" style={fadeUpStagger(1)}>
          <p className="mb-1 px-0.5 text-overline">{labels.routes}</p>
          <Table size="sm" aria-label={labels.routes} containerClassName="-mx-0.5">
            <TableHeader>
              <TableColumn id="route" isRowHeader className="min-w-[9rem]">
                {labels.routes}
              </TableColumn>
              <TableColumn id="share" className="w-[4.5rem] text-end">
                {labels.share}
              </TableColumn>
              <TableColumn id="latency" className="hidden w-[6.5rem] text-end sm:table-cell">
                {labels.latency}
              </TableColumn>
              <TableColumn id="cost" className="w-[4.5rem] text-end">
                {labels.costPer1k}
              </TableColumn>
              <TableColumn id="errors" className="w-[4.5rem] text-end">
                {labels.errorsColumn}
              </TableColumn>
            </TableHeader>
            <TableBody>
              {routes.map((route) => (
                <TableRow key={route.id} id={route.id}>
                  <TableCell>
                    <div className="flex min-w-0 items-center gap-2">
                      <RouteDot color={route.color} />
                      <div className="min-w-0">
                        <p className="truncate text-body-2-medium text-ink">{route.name}</p>
                        <p className="truncate text-micro uppercase tracking-wide text-ink-3">
                          {route.provider}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-end font-mono text-code tabular-nums text-ink-2">
                    {route.sharePercent}%
                  </TableCell>
                  <TableCell className="hidden text-end font-mono text-code tabular-nums text-ink-2 sm:table-cell">
                    {formatLatency(route.p50Seconds)} / {formatLatency(route.p95Seconds)}
                  </TableCell>
                  <TableCell className="text-end font-mono text-code tabular-nums text-ink-2">
                    {formatCostPer1k(route.costPer1k)}
                  </TableCell>
                  <TableCell className="text-end font-mono text-code tabular-nums text-ink-2">
                    {formatPercent(route.errorPercent)}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

        <div className="mt-2 flex flex-col gap-2 border-t border-line-soft pt-2 sm:flex-row sm:items-center sm:justify-between">
          <Switch
            isSelected={activeFallback}
            onChange={setFallback}
            size="md"
            className="shrink-0"
          >
            <span className="text-body-medium text-ink">{labels.fallback}</span>
          </Switch>
          <div
            className={cx(
              "flex min-w-0 flex-wrap items-center gap-1 text-body text-ink-2",
              !activeFallback && "opacity-50",
            )}
          >
            <span>{labels.whenModelFails}</span>
            <ModelPicker
              variant="inline"
              models={models}
              selectedId={activePrimaryId}
              onChange={(id) => {
                setFallbackPrimaryId(id);
                onFallbackPrimaryChange?.(id);
              }}
              ariaLabel={labels.modelPickerLabel}
              isDisabled={!activeFallback}
            />
            <span>{labels.retryOn}</span>
            <ModelPicker
              variant="inline"
              models={models}
              selectedId={activeRetryId}
              onChange={(id) => {
                setFallbackRetryId(id);
                onFallbackRetryChange?.(id);
              }}
              ariaLabel={labels.modelPickerLabel}
              isDisabled={!activeFallback}
            />
          </div>
        </div>
        </div>
      </div>

      <footer
        className={cx(
          "flex items-center justify-between gap-2 border-t border-line-soft",
          embedded ? "pt-2" : "bg-canvas px-3 py-2",
        )}
      >
        <div className="flex min-w-0 items-center gap-2">
          <IconButton icon={More2} aria-label={labels.moreActions} size="small" className="shrink-0" />
          <span aria-hidden className="h-3 w-px shrink-0 bg-line" />
          <p className="truncate text-caption text-ink-3">
            {labels.policyLive(policyRevision, environmentLabel)}
          </p>
        </div>
        <Button
          type="button"
          variant="primary"
          size="small"
          disabled={isDeploying}
          onClick={() => onDeployPolicy?.()}
        >
          {labels.deployPolicy}
        </Button>
      </footer>
    </section>
  );
}

export type {
  ModelRoute,
  ModelRouterLabels,
  ModelRouterModel,
  ModelRouterPolicyMode,
  ModelRouterProject,
  ModelRouterSummary,
} from "@/components/types";
export { defaultModelRouterLabels } from "@/components/types";
export {
  defaultModelRouterModels,
  defaultModelRouterProjects,
  defaultModelRouterRoutes,
  defaultModelRouterSummary,
} from "@/components/data/model-router-defaults";
