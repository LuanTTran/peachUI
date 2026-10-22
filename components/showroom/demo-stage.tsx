import { cn } from "@/lib/utils";

type DemoStageProps = {
  /** Wide articles let the demo claim the full column width. */
  wide?: boolean;
  children: React.ReactNode;
};

/**
 * Block demos render at real size inside the scrolling `.doc-main` column —
 * same model as the legacy catalog and boardui detail views. Horizontal
 * overflow is handled on wide entries; miniatures (nav hover cards) scale
 * separately in `doc-nav`.
 */
export function DemoStage({ wide = false, children }: DemoStageProps) {
  return (
    <div className={cn("doc-demo-stage", wide && "doc-demo-stage--wide")}>{children}</div>
  );
}
