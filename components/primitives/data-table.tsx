"use client";

import { useMemo, useState } from "react";
import { Archive, Copy, Download, Edit, More2, Search, Trash, User } from "reicon-react";
import { Focusable } from "react-aria-components";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import type { ColumnDef, PaginationState, SortingState } from "@tanstack/react-table";
import { Avatar } from "@/components/atoms/avatar";
import { Chip } from "@/components/atoms/chip";
import { StatusDot } from "@/components/atoms/status-dot";
import { IconButton } from "@/components/atoms/icon-button";
import { Checkbox } from "@/components/atoms/checkbox";
import {
  Dropdown,
  DropdownGroup,
  DropdownItem,
  DropdownPopover,
  DropdownTrigger,
} from "@/components/atoms/dropdown";
import { InputBase } from "@/components/atoms/input";
import { Pagination } from "@/components/atoms/pagination";
import {
  SegmentedControl,
  SegmentedControlItem,
} from "@/components/atoms/segmented-control";
import { Select, SelectItem } from "@/components/atoms/select";
import type { SelectSize } from "@/components/atoms/select";
import {
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@/components/atoms/table";
import type { TableSize } from "@/components/atoms/table";
import { Tooltip, TooltipTrigger } from "@/components/atoms/tooltip";
import { ChevronSortDown } from "@/components/atoms/chevrons";
import {
  copyForPreset,
  groupsForPreset,
  metricBucketsForPreset,
  rowsForPreset,
  segmentsForPreset,
  type DataTableCopy,
  type DataTableDemoPreset,
  type DemoTableRow,
} from "@/components/data/data-table-demo-presets";
import { cx } from "@/lib/utils";

const DEFAULT_PAGE_SIZE: Record<DataTableDemoPreset, number> = {
  commerce: 8,
  directory: 10,
};

const MORE_MENU_ICONS = [User, Copy, Download, Archive] as const;

function PurchaseSelect({
  value,
  name,
  size = "md",
  copy,
}: {
  value: DemoTableRow["purchase"];
  name: string;
  size?: SelectSize;
  copy: DataTableCopy;
}) {
  const { purchaseOptions: labels } = copy;
  return (
    <Select
      aria-label={copy.purchaseSelectAria(name)}
      defaultSelectedKey={value}
      size={size}
      className={size === "sm" ? "w-[132px]" : "w-[142px]"}
    >
      <SelectItem id="completed" textValue={labels.completed}>
        <StatusDot color="green" />
        {labels.completed}
      </SelectItem>
      <SelectItem id="waiting" textValue={labels.waiting}>
        <StatusDot color="yellow" />
        {labels.waiting}
      </SelectItem>
      <SelectItem id="processing" textValue={labels.processing}>
        <StatusDot color="indigo" />
        {labels.processing}
      </SelectItem>
    </Select>
  );
}

function SortChevron({ dir }: { dir: false | "asc" | "desc" }) {
  return (
    <ChevronSortDown
      className={cx(
        "size-6 shrink-0 transition-[transform,color] duration-150",
        dir === "asc" && "rotate-180",
        dir ? "text-ink-2" : "text-ink-3",
      )}
    />
  );
}

function RowActionButton({
  icon,
  label,
}: {
  icon: typeof Edit;
  label: string;
}) {
  return (
    <TooltipTrigger delay={200}>
      <Focusable>
        <IconButton icon={icon} size="small" aria-label={label} />
      </Focusable>
      <Tooltip size="md">{label}</Tooltip>
    </TooltipTrigger>
  );
}

function RowMoreMenu({ name, copy }: { name: string; copy: DataTableCopy }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Dropdown isOpen={isOpen} onOpenChange={setIsOpen}>
      <TooltipTrigger delay={200}>
        <DropdownTrigger
          aria-label={copy.moreMenuAria(name)}
          className={cx(
            "relative inline-flex size-8 shrink-0 items-center justify-center rounded-2lg",
            "border border-line bg-surface text-ink shadow-xs",
            "transition-[background-color,border-color,box-shadow,color] duration-150 ease",
            "hover:border-line-strong hover:bg-hover",
            isOpen && "border-line-strong bg-hover-2",
          )}
        >
          <More2 className="size-4 shrink-0" aria-hidden />
        </DropdownTrigger>
        <Tooltip size="md">{copy.moreMenuTooltip}</Tooltip>
      </TooltipTrigger>
      <DropdownPopover aria-label={copy.moreMenuAria(name)} placement="bottom end" className="w-[220px] p-2">
        <DropdownGroup>
          {copy.moreMenuItems.map(({ label }, index) => {
            const Icon = MORE_MENU_ICONS[index] ?? User;
            return (
            <DropdownItem key={label} onSelect={() => setIsOpen(false)} className="px-2 py-1.5">
              <Icon className="size-[18px] shrink-0 text-ink-2" aria-hidden />
              <span className="truncate text-body-medium whitespace-nowrap text-ink">{label}</span>
            </DropdownItem>
            );
          })}
        </DropdownGroup>
      </DropdownPopover>
    </Dropdown>
  );
}

export function DataTableExample({
  showSizeToggle = true,
  pageSize,
  preset = "commerce",
}: {
  showSizeToggle?: boolean;
  pageSize?: number;
  preset?: DataTableDemoPreset;
} = {}) {
  const resolvedPageSize = pageSize ?? DEFAULT_PAGE_SIZE[preset];
  const copy = copyForPreset(preset);
  const allRows = rowsForPreset(preset);
  const metricBuckets = metricBucketsForPreset(preset);
  const segments = segmentsForPreset(preset);
  const groups = groupsForPreset(preset);
  const [sorting, setSorting] = useState<SortingState>([]);
  const [rowSelection, setRowSelection] = useState<Record<string, boolean>>({ "1": true, "2": true });
  const [pagination, setPagination] = useState<PaginationState>({
    pageIndex: 0,
    pageSize: resolvedPageSize,
  });
  const [priceFilter, setPriceFilter] = useState("all");
  const [productFilter, setProductFilter] = useState("all");
  const [regionFilter, setRegionFilter] = useState("all");
  const [query, setQuery] = useState("");
  const [size, setSize] = useState<TableSize>("md");
  const avatarSize = size === "sm" ? "xs" : "sm";

  const data = useMemo(() => {
    const bucket = metricBuckets.find((b) => b.id === priceFilter) ?? metricBuckets[0];
    const q = query.trim().toLowerCase();
    return allRows.filter(
      (c) =>
        bucket.test(c.price) &&
        (productFilter === "all" || c.product === productFilter) &&
        (regionFilter === "all" || c.region === regionFilter) &&
        (q === "" || c.name.toLowerCase().includes(q)),
    );
  }, [allRows, metricBuckets, priceFilter, productFilter, regionFilter, query]);

  const columns = useMemo<ColumnDef<DemoTableRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: copy.nameColumn,
        cell: ({ row }) => {
          const c = row.original;
          return (
            <div className="flex min-w-0 items-center gap-2">
              <Checkbox
                slot={null}
                aria-label={`Select ${c.name}`}
                isSelected={row.getIsSelected()}
                onChange={(v) => row.toggleSelected(!!v)}
              />
              <Avatar
                size={avatarSize}
                color={c.initialsColor}
                art={c.avatarArt}
                alt={c.name}
              />
              <span className="truncate text-body-medium text-ink">{c.name}</span>
            </div>
          );
        },
      },
      {
        id: "purchase",
        enableSorting: false,
        header: copy.purchaseColumn,
        cell: ({ row }) => (
          <PurchaseSelect value={row.original.purchase} name={row.original.name} size={size} copy={copy} />
        ),
      },
      {
        id: "status",
        enableSorting: false,
        header: copy.statusColumn,
        cell: ({ row }) => (
          <Chip variant={size === "sm" ? "caption" : "bold"} color={row.original.status.color}>
            {row.original.status.label}
          </Chip>
        ),
      },
      {
        accessorKey: "updatedTs",
        header: copy.updatedColumn,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-body-medium text-ink">{row.original.updated}</span>
        ),
      },
      {
        accessorKey: "price",
        header: copy.priceColumn,
        cell: ({ row }) => (
          <Chip variant={size === "sm" ? "caption" : "subtle"} color="gray">
            {copy.formatMetric(row.original.price)}
          </Chip>
        ),
      },
      {
        id: "actions",
        enableSorting: false,
        header: copy.actionsColumn,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-2.5">
            <RowActionButton icon={Trash} label={copy.rowDelete} />
            <RowActionButton icon={Edit} label={copy.rowEdit} />
            <RowMoreMenu name={row.original.name} copy={copy} />
          </div>
        ),
      },
    ],
    [avatarSize, copy, size],
  );

  const table = useReactTable({
    data,
    columns,
    getRowId: (row) => row.id,
    state: { sorting, rowSelection, pagination },
    onSortingChange: setSorting,
    onRowSelectionChange: setRowSelection,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    enableRowSelection: true,
  });

  const resetPage = () => table.setPageIndex(0);
  const headers = table.getHeaderGroups()[0].headers;
  const rows = table.getRowModel().rows;
  const totalPages = table.getPageCount();
  const colWidths: Record<string, string> = {
    name: "w-[240px]",
    purchase: "w-[172px]",
    status: "w-[168px]",
    updatedTs: "w-[160px]",
    price: "w-[140px]",
    actions: "w-[132px]",
  };

  return (
    <div className="flex w-full flex-col items-center gap-5">
    <section
      className={cx(
        "flex w-full flex-col rounded-2xl border border-line pt-2",
        totalPages > 1 ? "pb-3" : "pb-0",
      )}
    >
      <div className="flex w-full flex-col items-start gap-3 px-3 py-1 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col justify-center">
          <p className="text-body-medium whitespace-nowrap text-ink-3">{copy.resultsLead}</p>
          <p className="text-body-medium whitespace-nowrap text-ink">
            {copy.resultsCount(data.length)}
          </p>
        </div>
        <div className="-mx-3 flex w-[calc(100%+1.5rem)] items-center gap-2.5 overflow-x-auto px-3 sm:mx-0 sm:w-auto sm:flex-wrap sm:justify-end sm:overflow-visible sm:px-0">
          <Select
            aria-label={copy.filterMetricAria}
            className="shrink-0"
            popoverClassName="min-w-40"
            selectedKey={priceFilter}
            onSelectionChange={(k) => {
              setPriceFilter(String(k));
              resetPage();
            }}
          >
            {metricBuckets.map((b) => (
              <SelectItem key={b.id} id={b.id} textValue={b.label}>
                {b.label}
              </SelectItem>
            ))}
          </Select>
          <Select
            aria-label={copy.filterSegmentAria}
            className="shrink-0"
            popoverClassName="min-w-40"
            selectedKey={productFilter}
            onSelectionChange={(k) => {
              setProductFilter(String(k));
              resetPage();
            }}
          >
            <SelectItem id="all" textValue={copy.filterSegmentAll}>
              {copy.filterSegmentAll}
            </SelectItem>
            {segments.map((p) => (
              <SelectItem key={p} id={p} textValue={p}>
                {p}
              </SelectItem>
            ))}
          </Select>
          <Select
            aria-label={copy.filterGroupAria}
            className="shrink-0"
            popoverClassName="min-w-40"
            selectedKey={regionFilter}
            onSelectionChange={(k) => {
              setRegionFilter(String(k));
              resetPage();
            }}
          >
            <SelectItem id="all" textValue={copy.filterGroupAll}>
              {copy.filterGroupAll}
            </SelectItem>
            {groups.map((r) => (
              <SelectItem key={r} id={r} textValue={r}>
                {r}
              </SelectItem>
            ))}
          </Select>
          <InputBase
            aria-label={copy.searchAria}
            placeholder={copy.searchPlaceholder}
            leadingIcon={Search}
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              resetPage();
            }}
            fieldClassName="min-w-[153px] flex-1 rounded-full bg-canvas sm:w-[153px] sm:min-w-0 sm:flex-none"
            className="text-body-medium"
          />
        </div>
      </div>

      <div className="mt-2">
        <Table aria-label={copy.tableAria} size={size} selectionMode="none" className="min-w-[1000px]">
          <TableHeader>
            {headers.map((header) => {
              const id = header.column.id;
              const canSort = header.column.getCanSort();
              const label = flexRender(header.column.columnDef.header, header.getContext());
              return (
                <TableColumn key={header.id} id={header.id} isRowHeader={id === "name"} className={colWidths[id]}>
                  {id === "name" ? (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        slot={null}
                        aria-label={copy.selectPageAria}
                        isSelected={table.getIsAllPageRowsSelected()}
                        isIndeterminate={table.getIsSomePageRowsSelected() && !table.getIsAllPageRowsSelected()}
                        onChange={(v) => table.toggleAllPageRowsSelected(!!v)}
                      />
                      <button
                        type="button"
                        onClick={header.column.getToggleSortingHandler()}
                        className="flex cursor-pointer items-center gap-0.5"
                      >
                        {label}
                        <SortChevron dir={header.column.getIsSorted()} />
                      </button>
                    </div>
                  ) : canSort ? (
                    <button
                      type="button"
                      onClick={header.column.getToggleSortingHandler()}
                      className="flex cursor-pointer items-center gap-0.5"
                    >
                      {label}
                      <SortChevron dir={header.column.getIsSorted()} />
                    </button>
                  ) : (
                    label
                  )}
                </TableColumn>
              );
            })}
          </TableHeader>
          <TableBody
            renderEmptyState={() => (
              <div className="flex h-40 items-center justify-center text-body-medium text-ink-3">
                {copy.emptyState}
              </div>
            )}
          >
            {rows.map((row) => {
              const selected = row.getIsSelected();
              return (
                <TableRow
                  key={row.id}
                  id={row.id}
                  style={
                    selected
                      ? { backgroundColor: "var(--canvas)" }
                      : undefined
                  }
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={colWidths[cell.column.id]}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {totalPages > 1 && (
        <div className="border-t border-line px-3 pt-3">
          <Pagination
            page={pagination.pageIndex + 1}
            totalPages={totalPages}
            onChange={(p) => table.setPageIndex(p - 1)}
          />
        </div>
      )}
    </section>

      {showSizeToggle && (
        <SegmentedControl
          aria-label={copy.densityAria}
          selectedKeys={new Set([size])}
          onSelectionChange={(keys) => {
            const next = [...keys][0];
            if (next) setSize(next as TableSize);
          }}
        >
          <SegmentedControlItem id="md">{copy.densityNormal}</SegmentedControlItem>
          <SegmentedControlItem id="sm">{copy.densityCompact}</SegmentedControlItem>
        </SegmentedControl>
      )}
    </div>
  );
}
