export type HairlineMountOptions = {
  intensity?: number;
  theme?: "auto" | "light" | "dark";
  label?: string;
  onRead?: (text: string) => void;
  play?: boolean;
};

export type HairlineMountContext = {
  stage: HTMLElement;
  svg: SVGSVGElement;
  read: { textContent: string | null };
};

export type FigureSpec = {
  id: string;
  label: string;
  rest: string;
  range: [number, number, number];
  tour: ([number, number] | null)[];
  engine: (
    ctx: HairlineMountContext,
    value: number,
  ) => { set: (value: number) => void; destroy: () => void };
};
