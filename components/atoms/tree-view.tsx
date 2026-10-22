"use client";

import { useContext, useState } from "react";
import type { ComponentProps, ComponentType, ContextType, KeyboardEventHandler, ReactNode, Ref } from "react";
import { AnimatePresence, motion, useIsPresent, useReducedMotion } from "motion/react";
import { ChevronRight, File, Folder, FolderOpen } from "reicon-react";
import {
  Button as AriaButton,
  CollectionRendererContext,
  DefaultCollectionRenderer,
  Tree as AriaTree,
  TreeItem as AriaTreeItem,
  TreeItemContent,
  TreeStateContext,
} from "react-aria-components";
import type {
  Key,
  TreeProps as AriaTreeProps,
  TreeItemProps as AriaTreeItemProps,
} from "react-aria-components";
import { MENU_ITEM_ACTIVE } from "@/components/lib/menu-styles";
import { cx } from "@/lib/utils";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface TreeViewProps<T extends object> extends AriaTreeProps<T> {
  size?: "sm" | "md";
  showGuides?: boolean;
  onKeyDownCapture?: KeyboardEventHandler<HTMLDivElement>;
  ref?: Ref<HTMLDivElement>;
}

export function TreeView<T extends object>({
  size = "md",
  showGuides = true,
  selectionMode = "single",
  renderEmptyState = () => "No items.",
  className,
  onKeyDownCapture,
  ref,
  ...props
}: TreeViewProps<T>) {  const parentRenderer = useContext(CollectionRendererContext);
  const renderer = parentRenderer === DefaultCollectionRenderer && !props.dragAndDropHooks
    ? TREE_VIEW_RENDERER
    : parentRenderer;

  return (
    <div
      className="contents"
      onKeyDownCapture={(event) => {
        onKeyDownCapture?.(event);
        if (event.defaultPrevented || event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
        if (event.key !== "ArrowRight") return;
        const row = event.target;
        if (!(row instanceof HTMLElement) || row.getAttribute("role") !== "row" || row.getAttribute("aria-expanded") !== "true") return;

        const level = Number(row.getAttribute("aria-level"));
        const tree = row.closest('[role="treegrid"]');
        const rows = Array.from(tree?.querySelectorAll<HTMLElement>('[role="row"][data-key]') ?? [])
          .filter((item) => item.closest('[role="treegrid"]') === tree && !item.closest('[data-tree-view-exiting]'));
        for (let index = rows.indexOf(row) + 1; index < rows.length; index++) {
          const child = rows[index];
          if (Number(child.getAttribute("aria-level")) <= level) break;
          if (child.getAttribute("aria-disabled") !== "true") {
            event.preventDefault();
            event.stopPropagation();
            child.focus();
            return;
          }
        }
      }}
    >
      <CollectionRendererContext.Provider value={renderer}>
        <AriaTree
          {...props}
          ref={ref}
          selectionMode={selectionMode}
          data-size={size}
          data-show-guides={showGuides}
          renderEmptyState={renderEmptyState}
          className={(state) => cx(
            "group/tree-view flex w-full min-w-0 flex-col rounded-3xl border border-line bg-surface p-2 outline-none",
            renderer === TREE_VIEW_RENDERER ? "gap-0" : "gap-0.5",
            "data-[empty]:px-4 data-[empty]:py-8 data-[empty]:text-center data-[empty]:text-body-regular data-[empty]:text-ink-3",
            "data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent",
            typeof className === "function" ? className(state) : className,
          )}
        />
      </CollectionRendererContext.Provider>
    </div>
  );
}

export interface TreeViewItemProps<T extends object = object>
  extends Omit<AriaTreeItemProps<T>, "textValue" | "children"> {
  label: string;
  textValue?: string;
  icon?: IconComponent | null;
  expandedIcon?: IconComponent;
  iconClassName?: string;
  trailingContent?: ReactNode;
  children?: ReactNode;
  ref?: Ref<HTMLDivElement>;
}

export function TreeViewItem<T extends object = object>({
  label,
  textValue = label,
  icon,
  expandedIcon,
  iconClassName,
  trailingContent,
  children,
  className,
  style,
  ref,
  ...props
}: TreeViewItemProps<T>) {
  return (
    <AriaTreeItem
      {...props}
      ref={ref}
      textValue={textValue}
      style={(state) => ({
        paddingInlineStart: `calc(0.5rem + ${(state.level - 1)} * 1.25rem)`,
        ...(typeof style === "function" ? style(state) : style),
      })}
      className={(state) => cx(
        "relative flex min-h-9 min-w-0 cursor-pointer items-center gap-2 rounded-xl pe-2 text-body-regular text-ink outline-none",
        "transition-[background-color,color,box-shadow] duration-150 motion-reduce:transition-none",
        "group-data-[size=sm]/tree-view:min-h-8 group-data-[size=sm]/tree-view:text-body-2-regular",
        (state.isHovered || state.isPressed || state.isFocusVisible) && !state.isDisabled && MENU_ITEM_ACTIVE,
        state.isSelected && MENU_ITEM_ACTIVE,
        state.isFocusVisible && "ring-2 ring-inset ring-accent",
        state.isDisabled && "cursor-default text-ink-3",
        typeof className === "function" ? className(state) : className,
      )}
    >
      <TreeItemContent>
        {({ hasChildItems, isExpanded, isDisabled, level, state, id }) => {
          const Icon = icon === null ? null : (
            isExpanded && expandedIcon
              ? expandedIcon
              : icon ?? (hasChildItems ? (isExpanded ? FolderOpen : Folder) : File)
          );

          return (
            <>
              <TreeGuides state={state} id={id} level={level} expanded={hasChildItems && isExpanded} branchWidth={hasChildItems ? 12 : 16} />
              <span className="flex shrink-0 items-center gap-1">
                {hasChildItems ? (
                  <AriaButton
                    slot="chevron"
                    isDisabled={isDisabled}
                    className="flex size-5 shrink-0 cursor-pointer items-center justify-center rounded-md text-ink-3 outline-none transition-colors hover:text-ink data-[focus-visible]:ring-2 data-[focus-visible]:ring-accent"
                  >
                    <ChevronRight
                      aria-hidden
                      className={cx(
                        "size-4 opacity-50 transition-transform duration-150 motion-reduce:transition-none",
                        isExpanded && "rotate-90",
                      )}
                    />
                  </AriaButton>
                ) : (
                  <span aria-hidden className={cx("h-5 shrink-0", level > 1 ? "w-2" : "w-5")} />
                )}
                {Icon && <Icon aria-hidden className={cx(
                  "size-4 shrink-0 opacity-50",
                  hasChildItems ? "text-ink" : "text-ink-2",
                  iconClassName,
                )} />}
              </span>
              <span className="min-w-0 flex-1 truncate text-start"><bdi>{label}</bdi></span>
              {trailingContent != null && (
                <span className="ms-auto shrink-0 text-caption-1-regular text-ink-3">{trailingContent}</span>
              )}
            </>
          );
        }}
      </TreeItemContent>
      {children}
    </AriaTreeItem>
  );
}

export { Collection as TreeViewCollection } from "react-aria-components";

const TREE_VIEW_RENDERER = {
  ...DefaultCollectionRenderer,
  CollectionRoot: AnimatedTreeCollection,
};

function AnimatedTreeCollection({ collection, ...props }: ComponentProps<typeof DefaultCollectionRenderer.CollectionRoot>) {
  const state = useContext(TreeStateContext);
  if (!state) return <DefaultCollectionRenderer.CollectionRoot collection={collection} {...props} />;

  return (
    <AnimatePresence initial={false}>
      {Array.from(collection).filter((node) => node.type !== "content").map((node) => (
        <AnimatedTreeRow key={node.key} state={state}>
          {node.render?.(node)}
        </AnimatedTreeRow>
      ))}
    </AnimatePresence>
  );
}

type TreeState = NonNullable<ContextType<typeof TreeStateContext>>;

function TreeGuides({ state, id, level, expanded, branchWidth }: {
  state: TreeState;
  id: Key;
  level: number;
  expanded: boolean;
  branchWidth: number;
}) {
  const node = state.collection.getItem(id);
  if (!node) return null;

  const continuingLevels: number[] = [];
  let ancestor = node.parentKey != null ? state.collection.getItem(node.parentKey) : null;
  let ancestorLevel = level - 1;
  while (ancestor) {
    if (ancestor.type === "item") {
      if (ancestorLevel > 1 && ancestor.nextKey != null) continuingLevels.push(ancestorLevel - 2);
      ancestorLevel--;
    }
    ancestor = ancestor.parentKey != null ? state.collection.getItem(ancestor.parentKey) : null;
  }

  const axis = (depth: number) => `calc(1.125rem + ${depth} * 1.25rem)`;

  return (
    <span aria-hidden data-tree-view-guides className="pointer-events-none absolute inset-0 text-line-strong group-data-[show-guides=false]/tree-view:hidden">
      {continuingLevels.map((depth) => (
        <span key={depth} data-tree-view-trunk className="absolute -inset-y-px w-px bg-current" style={{ insetInlineStart: axis(depth) }} />
      ))}
      {level > 1 && (
        <span data-tree-view-branch className="absolute -inset-y-px" style={{ insetInlineStart: axis(level - 2), width: branchWidth }}>
          <span className="absolute start-0 top-0 w-px bg-current" style={{ bottom: "calc(50% + 6px)" }} />
          <svg
            width={branchWidth}
            height="7"
            viewBox={`0 0 ${branchWidth} 7`}
            fill="none"
            className={"absolute start-0"}
            style={{ top: "calc(50% - 6px)" }}
          >
            <path d={`M0.5 0 Q0.5 6 6.5 6 H${branchWidth - 0.5}`} stroke="currentColor" strokeWidth="1" />
          </svg>
          {node.nextKey != null && (
            <span data-tree-view-tail className="absolute start-0 bottom-0 w-px bg-current" style={{ top: "calc(50% - 6px)" }} />
          )}
        </span>
      )}
      {expanded && (
        <span data-tree-view-bridge className="absolute -bottom-px w-px bg-current" style={{ insetInlineStart: axis(level - 1), top: "calc(50% + 8px)" }} />
      )}
    </span>
  );
}

function AnimatedTreeRow({ state, children }: { state: TreeState; children: ReactNode }) {
  const isPresent = useIsPresent();
  const reduceMotion = useReducedMotion();
  const [lastPresentState, setLastPresentState] = useState(state);
  if (isPresent && lastPresentState !== state) setLastPresentState(state);

  return (
    <motion.div
      role="presentation"
      className="relative min-w-0 shrink-0 overflow-hidden"
      data-tree-view-exiting={!isPresent || undefined}
      aria-hidden={!isPresent || undefined}
      inert={!isPresent}
      initial={reduceMotion ? false : { height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, y: -4, filter: "blur(4px)" }}
      animate={{ height: "auto", paddingTop: 1, paddingBottom: 1, opacity: 1, y: 0, filter: "blur(0px)" }}
      exit={{ height: 0, paddingTop: 0, paddingBottom: 0, opacity: 0, y: reduceMotion ? 0 : -4, filter: reduceMotion ? "blur(0px)" : "blur(4px)" }}
      transition={{ duration: reduceMotion ? 0 : 0.28, ease: [0.22, 1, 0.36, 1] }}
    >
      <TreeStateContext.Provider value={isPresent ? state : lastPresentState}>
        {children}
      </TreeStateContext.Provider>
    </motion.div>
  );
}
