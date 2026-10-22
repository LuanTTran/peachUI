"use client";

import type { Ref } from "react";
import {
  Cell,
  Column,
  Row,
  Table as AriaTable,
  TableBody,
  TableHeader,
} from "react-aria-components";
import type { TableProps as AriaTableProps } from "react-aria-components";
import { cx } from "@/lib/utils";

export type TableSize = "sm" | "md";

export interface TableProps extends Omit<AriaTableProps, "className"> {
  size?: TableSize;
  className?: string;
  containerClassName?: string;
  ref?: Ref<HTMLTableElement>;
}

export function Table({ size = "md", className, containerClassName, ref, ...props }: TableProps) {
  return (
    <div className={cx("w-full overflow-x-auto", containerClassName)}>
      <AriaTable
        ref={ref}
        {...props}
        className={cx("peach-table", size === "sm" && "peach-table-sm", className)}
      />
    </div>
  );
}

export {
  TableHeader,
  Column as TableColumn,
  TableBody,
  Row as TableRow,
  Cell as TableCell,
};
