import { Avatar, type AvatarProps } from "@/components/atoms/avatar";
import { cx } from "@/lib/utils";

export type AvatarStackItem = {
  name: string;
  src?: string;
};

type AvatarStackSize = NonNullable<AvatarProps["size"]>;

const stackOverlap: Record<AvatarStackSize, string> = {
  xs: "-ml-1",
  sm: "-ml-1",
  md: "-ml-1.5",
  lg: "-ml-2",
};

const overflowSize: Record<AvatarStackSize, string> = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-[11px]",
  lg: "size-9 text-[12px]",
};

function initialsFromName(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

const palette = ["blue", "lime", "pink", "neutral"] as const;

function colorForIndex(index: number) {
  return palette[index % palette.length];
}

export function AvatarStack({
  items,
  size = "sm",
  max = 4,
  className,
}: {
  items: AvatarStackItem[];
  size?: AvatarStackSize;
  max?: number;
  className?: string;
}) {
  const visible = items.slice(0, max);
  const overflow = items.length - visible.length;
  const overlap = stackOverlap[size];

  return (
    <div className={cx("flex items-center pl-0.5", className)}>
      {visible.map((person, index) => (
        <span
          key={`${person.name}-${index}`}
          className="relative inline-flex"
          style={{ zIndex: index + 1 }}
        >
          <Avatar
            size={size}
            src={person.src}
            alt={person.name}
            initials={initialsFromName(person.name)}
            color={colorForIndex(index)}
            className={cx(index > 0 && overlap, index > 0 && "ring-2 ring-surface")}
          />
        </span>
      ))}
      {overflow > 0 ? (
        <span
          className={cx(
            "relative inline-flex items-center justify-center rounded-full bg-inset font-mono font-medium text-ink-2 shadow-hairline ring-2 ring-surface",
            overlap,
            overflowSize[size],
          )}
          style={{ zIndex: visible.length + 1 }}
          aria-hidden
        >
          +{overflow}
        </span>
      ) : null}
    </div>
  );
}
