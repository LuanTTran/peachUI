/* eslint-disable @next/next/no-img-element */
import type { HTMLAttributes, Ref } from "react";
import { AvatarArtGlyph, type AvatarArtId } from "@/components/atoms/avatar-art";
import { cx, sortCx } from "@/lib/utils";

type AvatarSize = "xs" | "sm" | "md" | "lg";
type AvatarColor = "neutral" | "blue" | "lime" | "pink";

export interface AvatarProps extends HTMLAttributes<HTMLSpanElement> {
  size?: AvatarSize;
  color?: AvatarColor;
  src?: string;
  alt?: string;
  art?: AvatarArtId;
  initials?: string;
  ref?: Ref<HTMLSpanElement>;
}

const styles = sortCx({
  base: "inline-flex shrink-0 select-none items-center justify-center overflow-hidden rounded-full text-center align-middle transition-[width,height,font-size] duration-200 ease",
  size: {
    xs: "size-5 text-[10px] leading-[15px] font-semibold",
    sm: "size-6 text-caption-1-semibold tracking-normal",
    md: "size-8 text-headline-semibold",
    lg: "size-9 text-[18px] leading-6 font-semibold",
  },
  color: {
    neutral: "bg-hover-2 text-ink-2",
    blue: "bg-accent-muted text-accent-ink",
    lime: "bg-green-muted text-green",
    pink: "bg-red-muted text-red",
  },
});

export function Avatar({
  size = "md",
  color = "neutral",
  src,
  alt,
  art,
  initials,
  className,
  ref,
  ...props
}: AvatarProps) {
  const illustrated = !src && art;

  return (
    <span
      ref={ref}
      role={illustrated && alt ? "img" : undefined}
      aria-label={illustrated && alt ? alt : undefined}
      className={cx(
        styles.base,
        styles.size[size],
        styles.color[color],
        className,
      )}
      {...props}
    >
      {src ? (
        <img
          src={src}
          alt={alt ?? ""}
          loading="lazy"
          decoding="async"
          className="size-full object-cover"
        />
      ) : illustrated ? (
        <AvatarArtGlyph id={art} className="pointer-events-none size-[84%] shrink-0" />
      ) : (
        initials
      )}
    </span>
  );
}

export type { AvatarArtId } from "@/components/atoms/avatar-art";
