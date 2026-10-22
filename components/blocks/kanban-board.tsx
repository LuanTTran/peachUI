"use client";

/**
 * PeachUI — KanbanBoard (block)
 * @tier block
 * @deps board-card, kanban-column, avatar-stack, breadcrumb, button, icon-button, badge
 * @requires app/globals.css
 *
 * Controlled kanban with drag to reorder within a column or move across columns.
 */

import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useMemo, useState } from "react";
import { Bell, Filter, Inbox, Layout, Plus, SortDownUp } from "reicon-react";
import { Badge } from "@/components/atoms/badge";
import { Breadcrumb, BreadcrumbItem } from "@/components/atoms/breadcrumb";
import { Button } from "@/components/atoms/button";
import { IconButton } from "@/components/atoms/icon-button";
import { zoneTransition } from "@/components/lib/block-motion";
import {
  BoardCard,
  type BoardCardLabels,
  defaultBoardCardLabels,
} from "@/components/primitives/board-card";
import {
  KanbanColumn,
  type KanbanColumnLabels,
  defaultKanbanColumnLabels,
} from "@/components/primitives/kanban-column";
import { cx } from "@/lib/utils";

export type KanbanCardData = {
  id: string;
  title: string;
  ticket?: string;
  area?: string;
  priority?: "low" | "medium" | "high" | "urgent";
  project?: string;
  since?: string;
  completed?: string;
  assignees?: { name: string; src?: string }[];
};

export type KanbanColumnData = {
  id: string;
  title: string;
  limit?: number;
  cards: KanbanCardData[];
};

export type KanbanBoardLabels = {
  boardTitle: string;
  breadcrumbProduct: string;
  breadcrumbTeam: string;
  breadcrumbCurrent: string;
  notifications: string;
  inbox: string;
  sortBoard: string;
  filterBoard: string;
  boardLayout: string;
  newTicket: string;
  unreadCount: (count: number) => string;
  movedAnnouncement: (cardTitle: string, columnTitle: string) => string;
  column: KanbanColumnLabels;
  card: BoardCardLabels;
};

export const defaultKanbanBoardLabels: KanbanBoardLabels = {
  boardTitle: "Interface polish",
  breadcrumbProduct: "PeachUI",
  breadcrumbTeam: "Design",
  breadcrumbCurrent: "Sprint board",
  notifications: "Notifications",
  inbox: "Inbox",
  sortBoard: "Sort board",
  filterBoard: "Filter board",
  boardLayout: "Board layout",
  newTicket: "New ticket",
  unreadCount: (count) => `${count} unread notifications`,
  movedAnnouncement: (cardTitle, columnTitle) => `${cardTitle} moved to ${columnTitle}`,
  column: defaultKanbanColumnLabels,
  card: defaultBoardCardLabels,
};

export const defaultKanbanColumns: KanbanColumnData[] = [
  {
    id: "backlog",
    title: "Backlog",
    limit: 8,
    cards: [
      {
        id: "pu-38",
        ticket: "PU-38",
        area: "Agent handoff",
        priority: "low",
        project: "Catalog",
        title: "Explore approval cards for agent handoffs",
        since: "14 Sep",
        assignees: [{ name: "Maya Chen" }],
      },
      {
        id: "pu-41",
        ticket: "PU-41",
        area: "Docs",
        priority: "medium",
        project: "PeachUI",
        title: "Document token ramps for elevated surfaces",
        since: "12 Sep",
        assignees: [{ name: "Alex Rivera" }, { name: "Sam Okonkwo" }],
      },
      {
        id: "pu-44",
        ticket: "PU-44",
        area: "Forms",
        priority: "high",
        project: "Catalog",
        title: "Retry file upload when the session expires",
        since: "10 Sep",
        assignees: [{ name: "Jordan Lee" }],
      },
    ],
  },
  {
    id: "todo",
    title: "To do",
    limit: 6,
    cards: [
      {
        id: "pu-29",
        ticket: "PU-29",
        area: "Charts",
        priority: "medium",
        project: "Dashboard",
        title: "Tune chart contrast on dark dashboard cards",
        since: "15 Sep",
        assignees: [{ name: "Alex Rivera" }],
      },
      {
        id: "pu-33",
        ticket: "PU-33",
        area: "Motion",
        priority: "low",
        project: "Blocks",
        title: "Polish the transition between plan questions",
        since: "14 Sep",
        assignees: [{ name: "Maya Chen" }, { name: "Jordan Lee" }],
      },
      {
        id: "pu-35",
        ticket: "PU-35",
        area: "Tokens",
        priority: "high",
        project: "PeachUI",
        title: "Define semantic tokens for elevated surfaces",
        since: "13 Sep",
        assignees: [{ name: "Sam Okonkwo" }],
      },
    ],
  },
  {
    id: "in-progress",
    title: "In progress",
    limit: 5,
    cards: [
      {
        id: "pu-22",
        ticket: "PU-22",
        area: "Blocks",
        priority: "high",
        project: "Catalog",
        title: "Ship the kanban block with drag and drop",
        since: "16 Sep",
        assignees: [{ name: "Maya Chen" }],
      },
      {
        id: "pu-24",
        ticket: "PU-24",
        area: "Agent",
        priority: "urgent",
        project: "PeachUI",
        title: "Animate nested task groups as they stream in",
        since: "16 Sep",
        assignees: [{ name: "Sam Okonkwo" }],
      },
    ],
  },
  {
    id: "review",
    title: "Review",
    limit: 4,
    cards: [
      {
        id: "pu-18",
        ticket: "PU-18",
        area: "Copy",
        priority: "medium",
        project: "Catalog",
        title: "Permission gate copy for batch triage",
        since: "13 Sep",
        assignees: [{ name: "Jordan Lee" }],
      },
    ],
  },
  {
    id: "done",
    title: "Done",
    limit: 6,
    cards: [
      {
        id: "pu-11",
        ticket: "PU-11",
        area: "Primitives",
        priority: "low",
        project: "PeachUI",
        title: "Avatar stack for dense assignee rows",
        completed: "9 Sep",
        assignees: [{ name: "Alex Rivera" }],
      },
      {
        id: "pu-09",
        ticket: "PU-09",
        area: "Tables",
        priority: "medium",
        project: "Dashboard",
        title: "Record ledger empty state with a clear next step",
        completed: "7 Sep",
        assignees: [{ name: "Maya Chen" }],
      },
      {
        id: "pu-06",
        ticket: "PU-06",
        area: "Tokens",
        priority: "high",
        project: "PeachUI",
        title: "BoardUI blue accent on neutral chrome",
        completed: "6 Sep",
        assignees: [{ name: "Sam Okonkwo" }, { name: "Jordan Lee" }],
      },
      {
        id: "pu-04",
        ticket: "PU-04",
        area: "Typography",
        priority: "low",
        project: "Catalog",
        title: "Sentence case labels across form blocks",
        completed: "5 Sep",
        assignees: [{ name: "Alex Rivera" }],
      },
    ],
  },
];

export type KanbanBoardProps = {
  className?: string;
  columns: KanbanColumnData[];
  onColumnsChange: (columns: KanbanColumnData[]) => void;
  labels?: Partial<KanbanBoardLabels>;
  /** Shown on the notification icon when set. */
  notificationCount?: number;
};

function findColumnIndex(columns: KanbanColumnData[], id: string) {
  const byColumn = columns.findIndex((col) => col.id === id);
  if (byColumn >= 0) return byColumn;
  return columns.findIndex((col) => col.cards.some((card) => card.id === id));
}

function findCardIndex(column: KanbanColumnData, cardId: string) {
  return column.cards.findIndex((card) => card.id === cardId);
}

function cardById(columns: KanbanColumnData[], cardId: string) {
  for (const column of columns) {
    const match = column.cards.find((card) => card.id === cardId);
    if (match) return match;
  }
  return undefined;
}

function KanbanSortableCard({
  card,
  cardLabels,
}: {
  card: KanbanCardData;
  cardLabels: BoardCardLabels;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: card.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li ref={setNodeRef} style={style} className="list-none">
      <BoardCard
        title={card.title}
        ticket={card.ticket}
        area={card.area}
        priority={card.priority}
        project={card.project}
        since={card.since}
        completed={card.completed}
        assignees={card.assignees}
        labels={cardLabels}
        isDragging={isDragging}
        className={cx(
          "cursor-grab touch-none active:cursor-grabbing",
          isDragging && "opacity-40",
        )}
        {...attributes}
        {...listeners}
      />
    </li>
  );
}

function KanbanColumnDroppable({
  column,
  columnLabels,
  cardLabels,
}: {
  column: KanbanColumnData;
  columnLabels: KanbanColumnLabels;
  cardLabels: BoardCardLabels;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  const cardIds = useMemo(() => column.cards.map((card) => card.id), [column.cards]);

  return (
    <KanbanColumn
      title={column.title}
      count={column.cards.length}
      limit={column.limit}
      labels={columnLabels}
      isDropTarget={isOver}
      innerRef={setNodeRef}
    >
      <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
        <ul className="flex flex-col gap-2">
          {column.cards.map((card) => (
            <KanbanSortableCard key={card.id} card={card} cardLabels={cardLabels} />
          ))}
        </ul>
      </SortableContext>
    </KanbanColumn>
  );
}

export function KanbanBoard({
  className,
  columns,
  onColumnsChange,
  labels: labelsProp,
  notificationCount = 5,
}: KanbanBoardProps) {
  const labels: KanbanBoardLabels = {
    ...defaultKanbanBoardLabels,
    ...labelsProp,
    column: { ...defaultKanbanBoardLabels.column, ...labelsProp?.column },
    card: { ...defaultKanbanBoardLabels.card, ...labelsProp?.card },
  };

  const [activeId, setActiveId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState("");

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    }),
  );

  const activeCard = useMemo(() => {
    if (!activeId) return undefined;
    for (const column of columns) {
      const match = column.cards.find((card) => card.id === activeId);
      if (match) return match;
    }
    return undefined;
  }, [activeId, columns]);

  function handleDragStart(event: DragStartEvent) {
    setActiveId(String(event.active.id));
  }

  function handleDragCancel() {
    setActiveId(null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeCardId = String(active.id);
    const overId = String(over.id);

    const activeColIndex = findColumnIndex(columns, activeCardId);
    const overColIndex = findColumnIndex(columns, overId);
    if (activeColIndex < 0 || overColIndex < 0 || activeColIndex === overColIndex) return;

    const activeCol = columns[activeColIndex];
    const overCol = columns[overColIndex];
    const activeIndex = findCardIndex(activeCol, activeCardId);
    if (activeIndex < 0) return;

    const overIsColumn = overCol.id === overId;
    let overIndex = overIsColumn ? overCol.cards.length : findCardIndex(overCol, overId);
    if (overIndex < 0) overIndex = overCol.cards.length;

    const moving = activeCol.cards[activeIndex];
    const next = columns.map((col, index) => {
      if (index === activeColIndex) {
        return { ...col, cards: col.cards.filter((card) => card.id !== activeCardId) };
      }
      if (index === overColIndex) {
        const cards = [...col.cards];
        cards.splice(overIndex, 0, moving);
        return { ...col, cards };
      }
      return col;
    });

    onColumnsChange(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveId(null);
    if (!over) return;

    const activeCardId = String(active.id);
    const overId = String(over.id);

    const activeColIndex = findColumnIndex(columns, activeCardId);
    const overColIndex = findColumnIndex(columns, overId);
    if (activeColIndex < 0 || overColIndex < 0) return;

    const activeCol = columns[activeColIndex];
    const overCol = columns[overColIndex];
    const activeIndex = findCardIndex(activeCol, activeCardId);
    if (activeIndex < 0) return;

    if (activeColIndex === overColIndex) {
      const overIsColumn = overCol.id === overId;
      const overIndex = overIsColumn
        ? overCol.cards.length - 1
        : findCardIndex(overCol, overId);
      if (overIndex < 0) return;
      if (activeIndex === overIndex) return;

      const reordered = arrayMove(activeCol.cards, activeIndex, overIndex);
      onColumnsChange(
        columns.map((col, index) =>
          index === activeColIndex ? { ...col, cards: reordered } : col,
        ),
      );
      const moved = cardById(columns, activeCardId);
      if (moved) {
        setAnnouncement(labels.movedAnnouncement(moved.title, overCol.title));
      }
      return;
    }

    const moved = cardById(columns, activeCardId);
    const destTitle = columns[overColIndex]?.title ?? overCol.title;
    if (moved) {
      setAnnouncement(labels.movedAnnouncement(moved.title, destTitle));
    }
  }

  return (
    <div
      className={cx(
        "flex min-h-[min(560px,72vh)] min-w-0 flex-col overflow-hidden rounded-window border border-line bg-page shadow-hairline",
        className,
      )}
    >
      <p className="sr-only" aria-live="polite">{announcement}</p>

      <header className="flex shrink-0 flex-col gap-3 border-b border-line px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <Breadcrumb className="mb-1">
            <BreadcrumbItem href="#">{labels.breadcrumbProduct}</BreadcrumbItem>
            <BreadcrumbItem href="#">{labels.breadcrumbTeam}</BreadcrumbItem>
            <BreadcrumbItem current>{labels.breadcrumbCurrent}</BreadcrumbItem>
          </Breadcrumb>
          <h2 className="text-section-title text-balance tracking-tight text-ink">
            {labels.boardTitle}
          </h2>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-1" aria-hidden>
          <span className="relative inline-flex">
            <IconButton
              icon={Bell}
              size="medium"
              aria-label={labels.notifications}
              className="pointer-events-none opacity-60"
              tabIndex={-1}
              disabled
            />
            {notificationCount > 0 ? (
              <Badge
                color="primary"
                className="absolute -right-0.5 -top-0.5 min-w-4 justify-center px-1"
              >
                {notificationCount}
              </Badge>
            ) : null}
          </span>
          <IconButton
            icon={Inbox}
            size="medium"
            aria-label={labels.inbox}
            className="pointer-events-none opacity-60"
            tabIndex={-1}
            disabled
          />
          <IconButton
            icon={SortDownUp}
            size="medium"
            aria-label={labels.sortBoard}
            className="pointer-events-none opacity-60"
            tabIndex={-1}
            disabled
          />
          <IconButton
            icon={Filter}
            size="medium"
            aria-label={labels.filterBoard}
            className="pointer-events-none opacity-60"
            tabIndex={-1}
            disabled
          />
          <IconButton
            icon={Layout}
            size="medium"
            aria-label={labels.boardLayout}
            className="pointer-events-none opacity-60"
            tabIndex={-1}
            disabled
          />
          <Button
            variant="primary"
            size="small"
            leadingIcon={Plus}
            className="ml-1 pointer-events-none opacity-60"
            tabIndex={-1}
            disabled
          >
            {labels.newTicket}
          </Button>
        </div>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
      >
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <div className="flex min-w-max gap-2 lg:min-w-0">
            {columns.map((column) => (
              <KanbanColumnDroppable
                key={column.id}
                column={column}
                columnLabels={labels.column}
                cardLabels={labels.card}
              />
            ))}
          </div>
        </div>

        <DragOverlay dropAnimation={{ duration: zoneTransition.duration * 1000, easing: "ease-out" }}>
          {activeCard ? (
            <div className="w-[min(100%,228px)] cursor-grabbing">
              <BoardCard {...activeCard} labels={labels.card} isDragging />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  );
}
