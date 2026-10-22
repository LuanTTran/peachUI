/** Subset of the vendored kernel API used by Peach figures and `createFigure`. */
export type HairlineKernel = {
  inject: (root: Document | ShadowRoot | HTMLElement) => void;
  tour: (
    stage: HTMLElement,
    stops: ([number, number] | null)[],
    onStop?: (index: number) => void,
  ) => { stop: () => void };
  LAP: ([number, number] | null)[];
};
