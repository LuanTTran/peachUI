import type {
  AnchorHTMLAttributes,
  ButtonHTMLAttributes,
  ComponentType,
  ReactNode,
  Ref,
} from "react";
import { cx, sortCx } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
type ButtonSize = "medium" | "small" | "xs";

type IconComponent = ComponentType<{
  className?: string;
  "aria-hidden"?: boolean | "true" | "false";
}>;

export interface ButtonProps
  extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  ref?: Ref<HTMLButtonElement>;
}

export interface ButtonLinkProps
  extends Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children"> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  iconOnly?: boolean;
  leadingIcon?: IconComponent;
  trailingIcon?: IconComponent;
  children?: ReactNode;
  ref?: Ref<HTMLAnchorElement>;
}

const styles = sortCx({
  base: [
    "inline-flex items-center justify-center gap-0.5 whitespace-nowrap overflow-hidden",
    "font-sans select-none cursor-pointer",
    "button-press-motion",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
    "disabled:cursor-not-allowed aria-disabled:cursor-not-allowed",
  ].join(" "),

  size: {
    medium: "h-9 rounded-2lg p-2 text-body-medium",
    small:  "h-8 rounded-lg px-2 py-1.5 text-body-medium",
    xs:     "h-6 rounded-sm px-2 text-caption-1-semibold",
  },

  iconOnlySize: {
    medium: "",
    small:  "size-8 p-0",
    xs:     "size-6 p-0",
  },

  icon: {
    medium: "size-5 shrink-0",
    small:  "size-[18px] shrink-0",
    xs:     "size-3.5 shrink-0",
  },

  label: {
    medium: "inline-flex items-center justify-center px-1 shrink-0",
    small:  "inline-flex items-center justify-center px-0.5 shrink-0",
    xs:     "inline-flex items-center justify-center px-0.5 shrink-0",
  },

  variant: {
    primary: [
      "bg-gradient-accent",
      "disabled:text-disabled disabled:shadow-none",
      "aria-disabled:text-disabled aria-disabled:shadow-none",
    ].join(" "),
    danger: [
      "bg-gradient-danger",
      "disabled:text-red/50 disabled:shadow-none",
      "aria-disabled:text-red/50 aria-disabled:shadow-none",
    ].join(" "),
    secondary: [
      "bg-surface text-ink",
      "border border-line shadow-xs",
      "hover:bg-hover  hover:border-line-strong",
      "active:bg-hover-2 active:border-line-strong",
      "disabled:bg-disabled-bg disabled:border-line disabled:text-ink-3 disabled:shadow-none",
      "aria-disabled:bg-disabled-bg aria-disabled:border-line aria-disabled:text-ink-3 aria-disabled:shadow-none",
    ].join(" "),
    ghost: [
      "bg-accent-muted text-accent-ink",
      "hover:bg-accent/20 active:bg-accent/25",
      "disabled:bg-disabled-bg disabled:text-disabled disabled:shadow-none",
      "aria-disabled:bg-disabled-bg aria-disabled:text-disabled aria-disabled:shadow-none",
    ].join(" "),
  },
});

export function Button({
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  type = "button",
  ref,
  ...props
}: ButtonProps) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        styles.base,
        styles.size[size],
        styles.variant[variant],
        iconOnly && styles.iconOnlySize[size],
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={cx(styles.icon[size])} aria-hidden /> : null}
      {!iconOnly && children !== undefined && children !== null && (
        <span className={styles.label[size]}>{children}</span>
      )}
      {!iconOnly && Trailing ? (
        <Trailing className={cx(styles.icon[size])} aria-hidden />
      ) : null}
    </button>
  );
}

export function ButtonLink({
  variant = "primary",
  size = "medium",
  iconOnly = false,
  leadingIcon: Leading,
  trailingIcon: Trailing,
  children,
  className,
  ref,
  ...props
}: ButtonLinkProps) {
  return (
    <a
      ref={ref}
      className={cx(
        styles.base,
        styles.size[size],
        styles.variant[variant],
        iconOnly && styles.iconOnlySize[size],
        className,
      )}
      {...props}
    >
      {Leading ? <Leading className={cx(styles.icon[size])} aria-hidden /> : null}
      {!iconOnly && children !== undefined && children !== null && (
        <span className={styles.label[size]}>{children}</span>
      )}
      {!iconOnly && Trailing ? (
        <Trailing className={cx(styles.icon[size])} aria-hidden />
      ) : null}
    </a>
  );
}

export const buttonStyles = styles;
