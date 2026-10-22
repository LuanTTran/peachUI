import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  Ref,
} from "react";
import { cx, sortCx } from "@/lib/utils";

type IconButtonSize = "medium" | "small";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface IconButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  icon: IconComponent;
  size?: IconButtonSize;
  "aria-label": string;
  ref?: Ref<HTMLButtonElement>;
}

export interface IconLinkButtonProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  icon: IconComponent;
  size?: IconButtonSize;
  "aria-label": string;
  ref?: Ref<HTMLAnchorElement>;
}

const styles = sortCx({
  base: [
    "relative inline-flex shrink-0 items-center justify-center overflow-visible rounded-2lg",
    "bg-surface text-ink",
    "border border-line shadow-xs",
    "select-none cursor-pointer",
    "transition-[background-color,border-color,box-shadow,color] duration-150 ease",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
    "hover:bg-hover hover:border-line-strong",
    "active:bg-hover-2 active:border-line-strong",
    "disabled:cursor-not-allowed disabled:bg-disabled-bg disabled:border-line disabled:text-disabled disabled:opacity-60 disabled:shadow-none",
  ].join(" "),
  size: {
    medium: "size-9",
    small: "size-8",
  },
  icon: {
    medium: "size-5 shrink-0",
    small: "size-4 shrink-0",
  },
});

export function IconButton({
  icon: Icon,
  size = "medium",
  className,
  type = "button",
  ref,
  ...props
}: IconButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(styles.base, styles.size[size], className)}
      {...props}
    >
      <Icon className={cx(styles.icon[size])} aria-hidden />
    </button>
  );
}

export function IconLinkButton({
  icon: Icon,
  size = "medium",
  className,
  ref,
  ...props
}: IconLinkButtonProps) {
  return (
    <a
      ref={ref}
      className={cx(styles.base, styles.size[size], className)}
      {...props}
    >
      <Icon className={cx(styles.icon[size])} aria-hidden />
    </a>
  );
}
