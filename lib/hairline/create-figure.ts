import type { FigureSpec, HairlineMountOptions } from "@/lib/hairline/types";
import HL from "@/lib/hairline/kernel.js";

const { inject, tour, LAP } = HL;

const NS = "http://www.w3.org/2000/svg";
const mounted = new WeakMap<HTMLElement, () => void>();

function intensity(value: unknown): number {
  const n =
    typeof value === "string" && value.trim() !== ""
      ? Number(value)
      : value;
  if (typeof n !== "number" || !Number.isFinite(n)) return 0.5;
  return Math.min(1, Math.max(0, n));
}

function parameter(range: [number, number, number], value: unknown): number {
  const [lo, mid, hi] = range;
  const i = intensity(value);
  const v =
    i <= 0.5 ? lo + (i / 0.5) * (mid - lo) : mid + ((i - 0.5) / 0.5) * (hi - lo);
  return Math.round(v * 1000) / 1000;
}

export type HairlineFigureOptions = HairlineMountOptions;

/** Mount a Peach-authored Hairline figure on a host element (same contract as @lucasmarkes/hairline). */
export function createFigure(
  spec: FigureSpec,
  el: HTMLElement,
  options: HairlineFigureOptions = {},
) {
  if (typeof document === "undefined") {
    throw new Error(
      `hairline: ${spec.id} needs a DOM. Mount it from a client component after the element exists.`,
    );
  }

  mounted.get(el)?.();

  const opts = { ...options };
  const doc = el.ownerDocument;
  const root = el.getRootNode();
  inject(
    (root.nodeType === 9 || "host" in root ? root : doc) as
      | Document
      | ShadowRoot
      | HTMLElement,
  );

  const owned = new Set<string>();
  const attr = (name: string, value: string | null) => {
    if (!owned.has(name) && el.hasAttribute(name)) return;
    if (value === null) {
      el.removeAttribute(name);
      owned.delete(name);
    } else {
      el.setAttribute(name, value);
      owned.add(name);
    }
  };

  const dress = () => {
    attr(
      "data-hairline-theme",
      opts.theme === "light" || opts.theme === "dark" ? opts.theme : null,
    );
    attr(
      "aria-label",
      el.hasAttribute("aria-labelledby")
        ? null
        : typeof opts.label === "string"
          ? opts.label
          : spec.label,
    );
  };

  attr("data-hairline", spec.id);
  attr("role", "img");
  dress();

  const svg = doc.createElementNS(NS, "svg");
  svg.setAttribute("viewBox", "0 0 400 320");
  svg.setAttribute("aria-hidden", "true");
  el.appendChild(svg);

  let text: string | null = null;
  let playing: { stop: () => void } | null = null;

  const read = {
    get textContent() {
      return text;
    },
    set textContent(value: string | null) {
      const next = value ?? "";
      if (next === text) return;
      text = next;
      const fn = opts.onRead;
      if (typeof fn === "function") {
        try {
          fn(next);
        } catch (err) {
          console.error(err);
        }
      }
    },
  };

  let value = parameter(spec.range, opts.intensity);
  playing = opts.play === true ? tour(el, spec.tour ?? LAP) : null;

  let engine: { set: (v: number) => void; destroy: () => void };
  try {
    engine = spec.engine({ stage: el, svg, read }, value);
  } catch (err) {
    playing?.stop();
    throw err;
  }

  if (text === null) read.textContent = spec.rest;

  let dead = false;
  const destroy = () => {
    if (dead) return;
    dead = true;
    if (mounted.get(el) === destroy) mounted.delete(el);
    playing?.stop();
    playing = null;
    engine.destroy();
    svg.remove();
    for (const name of owned) el.removeAttribute(name);
    owned.clear();
  };

  mounted.set(el, destroy);

  return {
    update(next: Partial<HairlineFigureOptions>) {
      if (dead || !next) return;
      if (next.intensity !== undefined) opts.intensity = next.intensity;
      if (next.theme !== undefined) opts.theme = next.theme;
      if (next.label !== undefined) opts.label = next.label;
      if (next.onRead !== undefined) opts.onRead = next.onRead;
      if (next.play !== undefined) opts.play = next.play;
      const v = parameter(spec.range, opts.intensity);
      if (v !== value) {
        value = v;
        engine.set(v);
      }
      const play = opts.play === true;
      if (play !== !!playing) {
        playing?.stop();
        playing = play ? tour(el, spec.tour ?? LAP) : null;
      }
      dress();
    },
    destroy,
  };
}
