import { cx } from "@/lib/utils";

export const AVATAR_ART_IDS = [
  "orbit",
  "stack",
  "ridge",
  "fold",
  "beam",
  "loop",
  "node",
  "wave",
] as const;

export type AvatarArtId = (typeof AVATAR_ART_IDS)[number];

const GLYPHS: Record<AvatarArtId, { sil: string; hi?: string }> = {
  orbit: {
    sil: "M24 11a7 7 0 1 1 0 14a7 7 0 1 1 0-14M10 38c4-6 10-9 14-9s10 3 14 9",
    hi: "M21 16a3 3 0 1 1 6 0",
  },
  stack: {
    sil: "M17 20l7-4 7 4v8l-7 4-7-4v-8M14 36h20l-3-6H17l-3 6z",
    hi: "M24 16v8",
  },
  ridge: {
    sil: "M12 34l6-18h12l6 18M18 22h12M15 30h18",
    hi: "M24 14v6",
  },
  fold: {
    sil: "M14 36c2-10 6-16 10-18s8 8 10 18M24 12a5 5 0 1 1 0 10a5 5 0 1 1 0-10",
    hi: "M22 17h4",
  },
  beam: {
    sil: "M24 10l9 5v12l-9 5-9-5V15l9-5zM24 18v10",
    hi: "M20 20l4-2 4 2",
  },
  loop: {
    sil: "M24 11c-5 0-9 3-9 7s4 7 9 7 9-3 9-7-4-7-9-7M11 36c5-5 9-7 13-7s8 2 13 7",
    hi: "M24 14a3 3 0 1 1 0 6",
  },
  node: {
    sil: "M24 12a6 6 0 1 1 0 12a6 6 0 1 1 0-12M8 38c5-8 11-11 16-11s11 3 16 11",
    hi: "M24 20v4",
  },
  wave: {
    sil: "M13 35c3-8 7-12 11-12s8 4 11 12M24 11c3 0 5 2 5 5s-2 5-5 5-5-2-5-5 2-5 5-5",
    hi: "M21 15l6 3",
  },
};

export function avatarArtForKey(key: string): AvatarArtId {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h + key.charCodeAt(i) * (i + 3)) | 0;
  return AVATAR_ART_IDS[Math.abs(h) % AVATAR_ART_IDS.length];
}

type AvatarArtGlyphProps = {
  id: AvatarArtId;
  className?: string;
};

export function AvatarArtGlyph({ id, className }: AvatarArtGlyphProps) {
  const { sil, hi } = GLYPHS[id];
  return (
    <svg
      viewBox="0 0 48 48"
      className={cx("size-full overflow-visible", className)}
      aria-hidden
    >
      <path
        d={sil}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.35"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-ink-3"
      />
      {hi ? (
        <path
          d={hi}
          fill="none"
          stroke="currentColor"
          strokeWidth="1.35"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-ink-2"
        />
      ) : null}
    </svg>
  );
}
