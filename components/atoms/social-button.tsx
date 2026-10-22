import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode, Ref } from "react";
import { cx, sortCx } from "@/lib/utils";
import { SOCIAL_COLOR_LOGOS } from "@/components/data/social-color-logos";
import {
  SOCIAL_PROVIDERS,
  type SocialProvider,
} from "@/components/data/social-providers";

export type SocialBrand = SocialProvider | "custom";
export type SocialButtonSize = "medium" | "small";
export type SocialButtonAppearance = "colorful" | "black" | "white";

export interface SocialBrandConfig {
  icon: ReactNode;
  label?: string;
  color?: string;
}

interface SocialButtonBaseProps {
  brand: SocialBrand;
  config?: SocialBrandConfig;
  size?: SocialButtonSize;
  appearance?: SocialButtonAppearance;
  iconOnly?: boolean;
  fullWidth?: boolean;
  children?: ReactNode;
  className?: string;
}

export interface SocialButtonProps
  extends SocialButtonBaseProps,
    Omit<ButtonHTMLAttributes<HTMLButtonElement>, "children" | "color"> {
  href?: never;
  ref?: Ref<HTMLButtonElement>;
}

export interface SocialButtonLinkProps
  extends SocialButtonBaseProps,
    Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "children" | "color"> {
  href: string;
  ref?: Ref<HTMLAnchorElement>;
}

const DARK_INVERTED_BRANDS = new Set<SocialBrand>(["apple", "github", "x"]);

const styles = sortCx({
  base: [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap overflow-hidden",
    "font-sans select-none cursor-pointer",
    "button-press-motion",
    "transition-[background-color,border-color,box-shadow,color,filter] duration-150 ease",
    "outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-accent",
    "disabled:cursor-not-allowed disabled:opacity-60 aria-disabled:cursor-not-allowed aria-disabled:opacity-60",
  ].join(" "),
  size: {
    medium: "h-9 w-[300px] rounded-2lg px-3 text-body-medium",
    small: "h-8 w-[250px] rounded-lg px-2.5 text-body-medium",
  },
  iconOnlySize: {
    medium: "size-9 w-9 rounded-2lg px-0",
    small: "size-8 w-8 rounded-lg px-0",
  },
  glyph: {
    medium: "size-[18px] shrink-0",
    small: "size-4 shrink-0",
  },
  appearance: {
    colorful: "text-on-accent shadow-xs",
    black:
      "bg-ink text-page shadow-xs hover:bg-ink/90 active:bg-ink/80",
    white: [
      "bg-surface text-ink",
      "border border-line shadow-xs",
      "hover:bg-hover hover:border-line-strong",
      "active:bg-hover-2 active:border-line-strong",
    ].join(" "),
  },
});

export function SocialButton({ href, ...props }: SocialButtonProps | SocialButtonLinkProps) {
  const {
    brand,
    config,
    size = "medium",
    appearance = "colorful",
    iconOnly = false,
    fullWidth = false,
    children,
    className,
    ref,
    ...rest
  } = props as SocialButtonBaseProps & {
    ref?: Ref<HTMLButtonElement & HTMLAnchorElement>;
  } & Record<string, unknown>;

  const custom = brand === "custom";
  const meta = custom ? undefined : SOCIAL_PROVIDERS[brand as SocialProvider];
  const label = custom ? (config?.label ?? "SSO") : meta!.label;
  const fill = custom ? (config?.color ?? "#000000") : meta!.brand;

  const colorLogo =
    appearance === "white" && !custom
      ? SOCIAL_COLOR_LOGOS[brand as SocialProvider]
      : undefined;

  const glyph = custom ? (
    <span className={cx(styles.glyph[size], "inline-flex items-center justify-center")}>
      {config?.icon}
    </span>
  ) : colorLogo ? (
    <svg
      viewBox={colorLogo.viewBox}
      aria-hidden
      className={cx(
        styles.glyph[size],
        DARK_INVERTED_BRANDS.has(brand) && "dark:[&_path]:fill-white",
      )}
      dangerouslySetInnerHTML={{ __html: colorLogo.body }}
    />
  ) : (
    <svg
      viewBox={meta!.viewBox}
      aria-hidden
      className={styles.glyph[size]}
      style={appearance === "white" ? { color: meta!.brand } : undefined}
    >
      <path d={meta!.path} fill="currentColor" />
    </svg>
  );

  const content = (
    <>
      {glyph}
      {iconOnly ? null : <span className="truncate">{children ?? `Continue with ${label}`}</span>}
    </>
  );

  const systemFill = appearance === "colorful" && fill.startsWith("var(");

  const classes = cx(
    styles.base,
    iconOnly ? styles.iconOnlySize[size] : styles.size[size],
    styles.appearance[appearance],
    systemFill
      ? "bg-gradient-accent"
      : appearance === "colorful" && "hover:brightness-[1.06] active:brightness-95",
    fullWidth && !iconOnly && "w-full",
    className,
  );

  const accessibleName = iconOnly ? `Continue with ${label}` : undefined;

  const inlineStyle =
    appearance === "colorful" && !systemFill
      ? {
          backgroundImage: `linear-gradient(180deg, ${fill} 0%, oklch(from ${fill} calc(l - 0.04) calc(c + 0.01) h) 100%)`,
        }
      : undefined;

  if (href !== undefined) {
    return (
      <a
        ref={ref as Ref<HTMLAnchorElement>}
        href={href}
        aria-label={accessibleName}
        className={classes}
        style={inlineStyle}
        {...(rest as AnchorHTMLAttributes<HTMLAnchorElement>)}
      >
        {content}
      </a>
    );
  }

  return (
    <button
      ref={ref as Ref<HTMLButtonElement>}
      type="button"
      aria-label={accessibleName}
      className={classes}
      style={inlineStyle}
      {...(rest as ButtonHTMLAttributes<HTMLButtonElement>)}
    >
      {content}
    </button>
  );
}

export { SOCIAL_PROVIDERS, type SocialProvider };
