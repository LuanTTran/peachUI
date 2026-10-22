import type {
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  Ref,
} from "react";
import { cx, sortCx } from "@/lib/utils";

type ButtonGroupSize = "medium" | "small";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

const styles = sortCx({
  group: [
    "inline-flex items-stretch isolate",
    "rounded-2lg border border-line bg-surface shadow-xs",
    "divide-x divide-line overflow-hidden",
  ].join(" "),

  item: [
    "inline-flex items-center justify-center gap-1 whitespace-nowrap",
    "bg-surface text-ink font-sans select-none cursor-pointer",
    "transition-[background-color,color] duration-150 ease",
    "outline-none focus-visible:relative focus-visible:z-10 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-accent",
    "hover:bg-hover active:bg-hover-2",
    "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:text-ink-3",
  ].join(" "),

  size: {
    medium: "h-[34px] px-3 text-body-medium",
    small: "h-[30px] px-2.5 text-body-medium",
  },

  iconOnlySize: {
    medium: "w-[34px] px-0",
    small: "w-[30px] px-0",
  },

  icon: {
    medium: "size-5 shrink-0",
    small: "size-[18px] shrink-0",
  },

  selected: "bg-hover",
});

export interface ButtonGroupProps {
  size?: ButtonGroupSize;
  children: ReactNode;
  className?: string;
  "aria-label"?: string;
  ref?: Ref<HTMLDivElement>;
}

export function ButtonGroup({ size = "medium", children, className, ref, ...props }: ButtonGroupProps) {
  return (
    <div ref={ref} role="group" data-size={size} className={cx(styles.group, className)} {...props}>
      {children}
    </div>
  );
}

export interface ButtonGroupItemProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  size?: ButtonGroupSize;
  selected?: boolean;
  iconOnly?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export function ButtonGroupItem({
  size = "medium",
  selected = false,
  iconOnly = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  type = "button",
  ref,
  ...props
}: ButtonGroupItemProps) {
  return (
    <button
      ref={ref}
      type={type}
      aria-pressed={selected || undefined}
      className={cx(
        styles.item,
        styles.size[size],
        iconOnly && styles.iconOnlySize[size],
        selected && styles.selected,
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={cx(styles.icon[size])} aria-hidden /> : null}
      {!iconOnly && children !== undefined && children !== null && <span>{children}</span>}
      {!iconOnly && Trailing ? <Trailing className={cx(styles.icon[size])} aria-hidden /> : null}
    </button>
  );
}
