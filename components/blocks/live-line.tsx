"use client";

/**
 * PeachUI — LiveLine (block)
 * @tier block
 * @requires app/globals.css
 *
 * Real-time line on one canvas. Values, the vertical range, and the clock
 * ease toward the latest sample instead of jumping.
 *
 * Tribute: this follows Liveline by Benji Taylor
 * (https://benji.org/liveline, MIT) — one canvas, one animation frame,
 * an 8% ease, and a range that snaps outward so the line is never clipped.
 * Color comes from PeachUI tokens, including light and dark.
 */

import { memo, useRef, type RefObject } from "react";
import {
  frameLerp,
  lerp,
  liveLinePlot,
  niceTicks,
  paddedDomain,
  sampleMonotone,
  seriesInWindow,
  timeTicks,
  valueAtTime,
  type LiveLinePlot,
  type LiveLinePoint,
} from "@/lib/chart/live-line-engine";
import { useMountEffect } from "@/lib/use-mount-effect";
import { cx } from "@/lib/utils";

export type { LiveLinePoint };

export type LiveLineMomentum = "up" | "down" | "flat";

/** Semantic line colors — maps to theme tokens, not raw hues. */
export type LiveLineTone = "neutral" | "success" | "warning" | "danger";

export type LiveLineHover = {
  time: number;
  value: number;
};

/** `[price, size]` */
export type LiveLineOrder = [number, number];

export type LiveLineOrderbook = {
  bids: LiveLineOrder[];
  asks: LiveLineOrder[];
};

export type LiveLineProps = {
  data: LiveLinePoint[];
  value: number;
  /** Trailing window, in seconds. */
  window?: number;
  /** Dotted value grid, right value axis, and bottom time axis. */
  grid?: boolean;
  badge?: boolean;
  /** `true` reads direction from the line. A forced value pins it. */
  momentum?: boolean | LiveLineMomentum;
  fill?: boolean;
  loading?: boolean;
  /** Holds the picture. New samples wait, then the line catches up. */
  paused?: boolean;
  emptyText?: string;
  scrub?: boolean;
  /** Large live number over the plot, written at 60fps without re-renders. */
  showValue?: boolean;
  /** Tints the `showValue` number green or red with the direction. */
  valueMomentumColor?: boolean;
  /** Streams bid and ask sizes upward behind the line. */
  orderbook?: LiveLineOrderbook;
  formatValue?: (value: number) => string;
  formatTime?: (time: number) => string;
  formatOrder?: (size: number) => string;
  /** Per-frame ease at 60fps. `0.08` matches Liveline. */
  lerpSpeed?: number;
  onHover?: (point: LiveLineHover | null) => void;
  lineWidth?: number;
  tone?: LiveLineTone;
  className?: string;
  "aria-label"?: string;
};

const TOKEN_NAMES = [
  "--chart-1",
  "--chart-1-active",
  "--chart-2",
  "--chart-2-active",
  "--orange",
  "--accent",
  "--grid-line",
  "--ink",
  "--ink-3",
  "--on-accent",
  "--green",
  "--red",
  "--chart-cursor",
  "--surface",
] as const;

type TokenName = (typeof TOKEN_NAMES)[number];
type Rgba = [number, number, number, number];
type Palette = Record<TokenName, Rgba> & { font: string; mono: string };

const TONE_SERIES: Record<LiveLineTone, { soft: TokenName; active: TokenName }> = {
  neutral: { soft: "--chart-1", active: "--chart-1-active" },
  success: { soft: "--chart-2", active: "--chart-2-active" },
  warning: { soft: "--orange", active: "--accent" },
  danger: { soft: "--red", active: "--red" },
};

type Anim = {
  value: number;
  viewEnd: number;
  yMin: number;
  yMax: number;
  gutter: number;
  hold: boolean;
  holdValue: number;
  holdEnd: number;
  velocity: number;
  momentum: LiveLineMomentum;
  momentumShown: LiveLineMomentum;
  momentumOpacity: number;
  badgeColor: Rgba | null;
  loadingMix: number;
  scrubMix: number;
  scrubX: number;
  scrubTime: number | null;
  ready: boolean;
};

type Scrub = { time: number; pointer: boolean } | null;

type Frame = {
  data: LiveLinePoint[];
  value: number;
  windowSecs: number;
  grid: boolean;
  badge: boolean;
  momentum: boolean | LiveLineMomentum;
  fill: boolean;
  loading: boolean;
  paused: boolean;
  scrubEnabled: boolean;
  showValue: boolean;
  valueMomentumColor: boolean;
  orderbook: LiveLineOrderbook | undefined;
  formatValue: (value: number) => string;
  formatTime: (time: number) => string;
  formatOrder: (size: number) => string;
  lerpSpeed: number;
  lineWidth: number;
  tone: LiveLineTone;
};

type OrderLabel = { y: number; text: string; side: "bid" | "ask"; strength: number };

/* Layout, in CSS pixels. */
const AXIS_LABEL_X = 14;
const BADGE_PAD_X = 8;
const BADGE_TIP = 7;
const BADGE_HEIGHT = 22;
const VALUE_OVERLAY = 44;
const ORDER_SPACING = 22;
const ORDER_INSET = 16;
const TIME_LABEL_SPACING = 96;

const defaultFormatValue = (value: number) => value.toFixed(2);

function defaultFormatTime(time: number) {
  return new Date(time * 1000).toLocaleTimeString(undefined, { hour12: false });
}

const orderFormat = new Intl.NumberFormat("en-US", {
  notation: "compact",
  maximumSignificantDigits: 2,
});
const defaultFormatOrder = (size: number) => orderFormat.format(size);

function css([r, g, b, a]: Rgba, alpha = 1) {
  return `rgba(${r}, ${g}, ${b}, ${a * alpha})`;
}

function mixRgba(from: Rgba, to: Rgba, t: number): Rgba {
  return [
    lerp(from[0], to[0], t),
    lerp(from[1], to[1], t),
    lerp(from[2], to[2], t),
    lerp(from[3], to[3], t),
  ];
}

/** Resolves tokens to RGBA through a 1px canvas, so oklch and color-mix work. */
function readPalette(host: HTMLElement): Palette {
  const probe = document.createElement("span");
  probe.style.position = "absolute";
  probe.style.pointerEvents = "none";
  probe.style.fontFamily = "var(--font-mono-face, ui-monospace, monospace)";
  host.appendChild(probe);
  const style = getComputedStyle(probe);
  const swatch = document.createElement("canvas");
  swatch.width = 1;
  swatch.height = 1;
  const pixel = swatch.getContext("2d", { willReadFrequently: true });
  const palette = {
    font: getComputedStyle(host).fontFamily,
    mono: style.fontFamily,
  } as Palette;
  for (const name of TOKEN_NAMES) {
    probe.style.color = `var(${name})`;
    let rgba: Rgba = [0, 0, 0, 1];
    if (pixel) {
      pixel.clearRect(0, 0, 1, 1);
      pixel.fillStyle = style.color;
      pixel.fillRect(0, 0, 1, 1);
      const [r, g, b, a] = pixel.getImageData(0, 0, 1, 1).data;
      rgba = [r, g, b, a / 255];
    }
    palette[name] = rgba;
  }
  probe.remove();
  return palette;
}

function yFor(value: number, plot: LiveLinePlot, yMin: number, yMax: number) {
  const span = Math.max(yMax - yMin, 1e-6);
  return plot.top + plot.height - ((value - yMin) / span) * plot.height;
}

function xFor(time: number, plot: LiveLinePlot, start: number, windowSecs: number) {
  return plot.left + ((time - start) / windowSecs) * (plot.headX - plot.left);
}

function traceLine(ctx: CanvasRenderingContext2D, coords: { x: number; y: number }[]) {
  ctx.beginPath();
  coords.forEach((coord, index) => {
    if (index === 0) ctx.moveTo(coord.x, coord.y);
    else ctx.lineTo(coord.x, coord.y);
  });
}

function drawChevron(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  direction: "up" | "down",
  color: string,
) {
  const flip = direction === "up" ? -1 : 1;
  ctx.strokeStyle = color;
  ctx.beginPath();
  ctx.moveTo(x - 5, y - flip * 2.5);
  ctx.lineTo(x, y + flip * 2.5);
  ctx.lineTo(x + 5, y - flip * 2.5);
  ctx.stroke();
}

function badgePath(ctx: CanvasRenderingContext2D, x: number, y: number, width: number) {
  const radius = 6;
  const mid = y + BADGE_HEIGHT / 2;
  ctx.beginPath();
  ctx.moveTo(x - BADGE_TIP, mid);
  ctx.lineTo(x, y + 1);
  ctx.quadraticCurveTo(x + 1, y, x + 3, y);
  ctx.lineTo(x + width - radius, y);
  ctx.arcTo(x + width, y, x + width, y + radius, radius);
  ctx.lineTo(x + width, y + BADGE_HEIGHT - radius);
  ctx.arcTo(x + width, y + BADGE_HEIGHT, x + width - radius, y + BADGE_HEIGHT, radius);
  ctx.lineTo(x + 3, y + BADGE_HEIGHT);
  ctx.quadraticCurveTo(x + 1, y + BADGE_HEIGHT, x, y + BADGE_HEIGHT - 1);
  ctx.closePath();
}

function plotFor(frame: Frame, width: number, height: number, gutter: number) {
  return liveLinePlot(width, height, {
    gutter,
    axis: frame.grid,
    overlay: frame.showValue ? VALUE_OVERLAY : 0,
    momentum: frame.momentum !== false,
  });
}

const LiveLineSurface = memo(function LiveLineSurface({
  hostRef,
  canvasRef,
}: {
  hostRef: RefObject<HTMLDivElement | null>;
  canvasRef: RefObject<HTMLCanvasElement | null>;
}) {
  return (
    <div ref={hostRef} className="absolute inset-0">
      <canvas ref={canvasRef} className="block h-full w-full" aria-hidden />
    </div>
  );
});

export function LiveLine({
  data,
  value,
  window: windowSecs = 30,
  grid = true,
  badge = true,
  momentum = true,
  fill = true,
  loading = false,
  paused = false,
  emptyText = "No data to display",
  scrub: scrubEnabled = true,
  showValue = false,
  valueMomentumColor = false,
  orderbook,
  formatValue = defaultFormatValue,
  formatTime = defaultFormatTime,
  formatOrder = defaultFormatOrder,
  lerpSpeed = 0.08,
  onHover,
  lineWidth = 2,
  tone = "neutral",
  className,
  "aria-label": ariaLabel,
}: LiveLineProps) {
  const hostRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);
  const scrubRef = useRef<Scrub>(null);
  const viewRef = useRef<{ viewEnd: number; value: number; plot: LiveLinePlot | null }>({
    viewEnd: 0,
    value: 0,
    plot: null,
  });
  const reduceRef = useRef(false);
  const onHoverRef = useRef(onHover);
  const frameRef = useRef<Frame>(null!);
  /* Latest props for the canvas loop, so data ticks do not restart the frame. */
  /* eslint-disable react-hooks/refs */
  onHoverRef.current = onHover;
  frameRef.current = {
    data,
    value,
    windowSecs,
    grid,
    badge,
    momentum,
    fill,
    loading,
    paused,
    scrubEnabled,
    showValue,
    valueMomentumColor,
    orderbook,
    formatValue,
    formatTime,
    formatOrder,
    lerpSpeed,
    lineWidth,
    tone,
  };
  /* eslint-enable react-hooks/refs */

  const empty = !loading && data.length === 0;
  const label =
    ariaLabel ??
    (empty
      ? emptyText
      : paused
        ? `Live chart paused at ${formatValue(value)}`
        : `Live chart, ${formatValue(value)}`);

  useMountEffect(() => {
    const host = hostRef.current;
    const canvas = canvasRef.current;
    if (!host || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const motion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onMotion = () => {
      reduceRef.current = motion.matches;
    };
    onMotion();
    motion.addEventListener("change", onMotion);

    let palette = readPalette(host);
    const theme = new MutationObserver(() => {
      palette = readPalette(host);
    });
    theme.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });

    const anim: Anim = {
      value,
      viewEnd: Date.now() / 1000,
      yMin: value - 1,
      yMax: value + 1,
      gutter: 0,
      hold: false,
      holdValue: value,
      holdEnd: Date.now() / 1000,
      velocity: 0,
      momentum: "flat",
      momentumShown: "flat",
      momentumOpacity: 0,
      badgeColor: null,
      loadingMix: loading ? 1 : 0,
      scrubMix: 0,
      scrubX: 0,
      scrubTime: null,
      ready: false,
    };

    const stream = { labels: [] as OrderLabel[], travel: 0, churn: 0, bids: NaN, asks: NaN };

    let raf = 0;
    let last = performance.now();

    const resize = () => {
      const rect = host.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(host);

    const draw = (now: number) => {
      const dt = Math.min(Math.max(now - last, 0), 64);
      last = now;
      const frame = frameRef.current;
      const reduce = reduceRef.current;
      const cssWidth = canvas.clientWidth;
      const cssHeight = canvas.clientHeight;
      ctx.clearRect(0, 0, cssWidth, cssHeight);
      const lineColor = palette[TONE_SERIES[frame.tone].active];
      const softColor = palette[TONE_SERIES[frame.tone].soft];
      const monoFont = `400 11px ${palette.mono}`;
      const badgeFont = `500 12px ${palette.mono}`;

      const k = reduce ? 1 : frameLerp(frame.lerpSpeed, dt);
      const ui = reduce ? 1 : frameLerp(0.16, dt);
      const clock = Date.now() / 1000;

      if (frame.paused) {
        if (!anim.hold) {
          anim.hold = true;
          anim.holdValue = anim.value;
          anim.holdEnd = anim.viewEnd;
        }
      } else {
        anim.hold = false;
      }

      const targetValue = frame.paused ? anim.holdValue : frame.value;
      const targetEnd = frame.paused ? anim.holdEnd : clock;
      const previous = anim.value;
      anim.value = anim.ready ? lerp(anim.value, targetValue, k) : targetValue;
      anim.viewEnd = anim.ready ? lerp(anim.viewEnd, targetEnd, k) : targetEnd;
      anim.loadingMix = anim.ready
        ? lerp(anim.loadingMix, frame.loading ? 1 : 0, k)
        : frame.loading
          ? 1
          : 0;

      const seconds = Math.max(dt / 1000, 1 / 120);
      anim.velocity = lerp(anim.velocity, (anim.value - previous) / seconds, k);
      const spanGuess = Math.max(anim.yMax - anim.yMin, 1e-6);
      const autoDirection: LiveLineMomentum =
        Math.abs(anim.velocity) < spanGuess * 0.015 ? "flat" : anim.velocity > 0 ? "up" : "down";
      anim.momentum =
        frame.momentum === true
          ? autoDirection
          : frame.momentum === false
            ? "flat"
            : frame.momentum;
      if (anim.momentumShown !== anim.momentum) {
        anim.momentumOpacity = lerp(anim.momentumOpacity, 0, ui);
        if (anim.momentumOpacity < 0.04) anim.momentumShown = anim.momentum;
      } else {
        anim.momentumOpacity = lerp(anim.momentumOpacity, anim.momentumShown === "flat" ? 0 : 1, ui);
      }

      const start = anim.viewEnd - frame.windowSecs;
      const series = seriesInWindow(frame.data, start, anim.viewEnd, {
        time: anim.viewEnd,
        value: anim.value,
      });

      let lo = series[0]?.value ?? anim.value;
      let hi = lo;
      for (const point of series) {
        lo = Math.min(lo, point.value);
        hi = Math.max(hi, point.value);
      }
      const targetDomain = paddedDomain(lo, hi);
      if (!frame.paused) {
        anim.yMin = lo < anim.yMin || !anim.ready ? targetDomain.min : lerp(anim.yMin, targetDomain.min, k);
        anim.yMax = hi > anim.yMax || !anim.ready ? targetDomain.max : lerp(anim.yMax, targetDomain.max, k);
      }

      /* Right gutter fits the widest axis label or the badge, whichever wins. */
      const ticks = frame.grid ? niceTicks(anim.yMin, anim.yMax) : [];
      ctx.font = monoFont;
      let labelWidth = 0;
      for (const tick of ticks) {
        labelWidth = Math.max(labelWidth, ctx.measureText(frame.formatValue(tick)).width);
      }
      const badgeText = frame.formatValue(anim.value);
      ctx.font = badgeFont;
      const badgeTextWidth = frame.badge ? ctx.measureText(badgeText).width : 0;
      const targetGutter =
        frame.grid || frame.badge
          ? AXIS_LABEL_X + Math.max(labelWidth, badgeTextWidth) + BADGE_PAD_X + 6
          : 0;
      anim.gutter =
        targetGutter > anim.gutter || !anim.ready ? targetGutter : lerp(anim.gutter, targetGutter, k);
      anim.ready = true;

      const plot = plotFor(frame, cssWidth, cssHeight, anim.gutter);
      viewRef.current = { viewEnd: anim.viewEnd, value: anim.value, plot };

      const showEmpty = !frame.loading && frame.data.length === 0 && anim.loadingMix < 0.04;
      const alive = 1 - anim.loadingMix;
      const curve = sampleMonotone(series);
      const toX = (time: number) => xFor(time, plot, start, frame.windowSecs);
      const toY = (sample: number) => yFor(sample, plot, anim.yMin, anim.yMax);
      const waveTime = now / 1000;
      const fadeWidth = Math.min(48, plot.width * 0.12);

      const valueEl = valueRef.current;
      if (valueEl) {
        if (valueEl.textContent !== badgeText) valueEl.textContent = badgeText;
        const tint =
          frame.valueMomentumColor && anim.momentum !== "flat"
            ? `var(${anim.momentum === "up" ? "--green" : "--red"})`
            : "";
        if (valueEl.style.color !== tint) valueEl.style.color = tint;
        valueEl.style.opacity = showEmpty ? "0" : String(alive);
      }

      if (anim.loadingMix > 0.02) {
        ctx.save();
        ctx.globalAlpha = anim.loadingMix;
        ctx.beginPath();
        ctx.strokeStyle = css(lineColor);
        ctx.lineWidth = frame.lineWidth;
        ctx.lineCap = "round";
        ctx.lineJoin = "round";
        const breathe = reduce ? 0 : 0.65 + 0.35 * Math.sin(waveTime * 1.3);
        for (let i = 0; i <= 48; i += 1) {
          const x = plot.left + ((plot.headX - plot.left) * i) / 48;
          const y =
            plot.top +
            plot.height / 2 +
            Math.sin(x * 0.035 + waveTime * 1.7) * plot.height * 0.08 * breathe;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.restore();
      }

      const scrub = scrubRef.current;
      const scrubbing = Boolean(scrub && frame.scrubEnabled && anim.loadingMix < 0.5);
      if (scrub && scrubbing) {
        anim.scrubTime = scrub.time;
      }
      if (anim.scrubTime !== null) {
        anim.scrubX = Math.max(plot.left, Math.min(plot.headX, toX(anim.scrubTime)));
      }
      anim.scrubMix = lerp(anim.scrubMix, scrubbing ? 1 : 0, ui);
      const dimmed = anim.scrubMix > 0.01;

      if (!showEmpty && curve.length > 1 && anim.loadingMix < 0.98) {
        const coords = curve.map((point) => ({ x: toX(point.time), y: toY(point.value) }));
        const head = coords[coords.length - 1];
        const headAlpha = alive * (1 - 0.6 * anim.scrubMix);

        if (frame.grid) {
          ctx.save();
          ctx.strokeStyle = css(palette["--grid-line"]);
          ctx.lineWidth = 1;
          ctx.setLineDash([1, 4]);
          for (const tick of ticks) {
            const y = Math.round(toY(tick)) + 0.5;
            if (y < plot.top || y > plot.bottom) continue;
            ctx.beginPath();
            ctx.moveTo(plot.left, y);
            ctx.lineTo(plot.right, y);
            ctx.stroke();
          }
          ctx.setLineDash([]);
          const baseline = Math.round(plot.bottom) + 0.5;
          ctx.beginPath();
          ctx.moveTo(plot.left, baseline);
          ctx.lineTo(plot.right, baseline);
          ctx.stroke();

          ctx.font = monoFont;
          ctx.fillStyle = css(palette["--ink-3"]);
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          const span = plot.headX - plot.left;
          const maxLabels = Math.max(1, Math.floor(span / TIME_LABEL_SPACING));
          for (const time of timeTicks(start, anim.viewEnd, maxLabels)) {
            const x = Math.round(toX(time)) + 0.5;
            if (x < plot.left || x > plot.headX) continue;
            ctx.beginPath();
            ctx.moveTo(x, baseline);
            ctx.lineTo(x, baseline + 4);
            ctx.stroke();
            ctx.fillText(frame.formatTime(time), x, plot.bottom + 16);
          }
          ctx.restore();
        }

        const paintSeries = (alpha: number) => {
          if (frame.fill) {
            const gradient = ctx.createLinearGradient(0, plot.top, 0, plot.bottom);
            gradient.addColorStop(0, css(softColor, 0.16 * alpha));
            gradient.addColorStop(1, css(softColor, 0));
            traceLine(ctx, coords);
            ctx.lineTo(head.x, plot.bottom);
            ctx.lineTo(coords[0].x, plot.bottom);
            ctx.closePath();
            ctx.fillStyle = gradient;
            ctx.fill();
          }
          traceLine(ctx, coords);
          ctx.strokeStyle = css(lineColor, alpha);
          ctx.lineWidth = frame.lineWidth;
          ctx.lineJoin = "round";
          ctx.lineCap = "round";
          ctx.stroke();
        };
        const clipTo = (x0: number, x1: number) => {
          ctx.beginPath();
          ctx.rect(x0, plot.top - 12, x1 - x0, plot.height + 12);
          ctx.clip();
        };

        ctx.save();
        if (dimmed) {
          ctx.save();
          clipTo(plot.left, anim.scrubX);
          paintSeries(alive);
          ctx.restore();
          clipTo(anim.scrubX, plot.right);
          paintSeries(alive * (1 - 0.65 * anim.scrubMix));
        } else {
          clipTo(plot.left, plot.right);
          paintSeries(alive);
        }
        ctx.restore();

        /* The oldest edge dissolves instead of ending on a hard cut. */
        ctx.save();
        ctx.globalCompositeOperation = "destination-out";
        const fade = ctx.createLinearGradient(plot.left, 0, plot.left + fadeWidth, 0);
        fade.addColorStop(0, "rgba(0, 0, 0, 1)");
        fade.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = fade;
        ctx.fillRect(plot.left, 0, fadeWidth, cssHeight);
        ctx.restore();

        const book = frame.orderbook;
        if (book && !reduce && anim.loadingMix < 0.5) {
          const bidTotal = book.bids.reduce((sum, [, size]) => sum + size, 0);
          const askTotal = book.asks.reduce((sum, [, size]) => sum + size, 0);
          if (Number.isFinite(stream.bids)) {
            const total = Math.max(bidTotal + askTotal, 1e-9);
            const change =
              (Math.abs(bidTotal - stream.bids) + Math.abs(askTotal - stream.asks)) / total;
            stream.churn = Math.max(stream.churn * (1 - frameLerp(0.015, dt)), Math.min(1, change * 6));
          }
          stream.bids = bidTotal;
          stream.asks = askTotal;

          if (!frame.paused) {
            const pace = Math.min(1, (Math.abs(anim.velocity) / spanGuess) * 3);
            const rise = plot.height * 0.12 * (1 + 2.2 * Math.min(1, pace + stream.churn));
            const dy = (rise * dt) / 1000;
            for (const order of stream.labels) order.y -= dy;
            stream.travel += dy;
            const orders = book.bids.length + book.asks.length;
            let biggest = 0;
            for (const [, size] of book.bids) biggest = Math.max(biggest, size);
            for (const [, size] of book.asks) biggest = Math.max(biggest, size);
            while (stream.travel >= ORDER_SPACING && orders > 0) {
              stream.travel -= ORDER_SPACING;
              const side = Math.random() * orders < book.bids.length ? "bid" : "ask";
              const pool = side === "bid" ? book.bids : book.asks;
              const [, size] = pool[Math.floor(Math.random() * pool.length)];
              stream.labels.push({
                y: plot.bottom - 10 - stream.travel,
                text: frame.formatOrder(size),
                side,
                strength: biggest > 0 ? size / biggest : 0,
              });
            }
          }
          stream.labels = stream.labels.filter((order) => order.y > plot.top);

          ctx.save();
          ctx.globalCompositeOperation = "destination-over";
          ctx.font = badgeFont;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          for (const order of stream.labels) {
            const t = (plot.bottom - order.y) / plot.height;
            const life = Math.min(1, t / 0.1) * Math.min(1, (1 - t) / 0.3);
            const alpha = Math.max(0, life) * (0.4 + 0.6 * Math.sqrt(order.strength)) * alive;
            const color = palette[order.side === "bid" ? "--green" : "--red"];
            ctx.fillStyle = css(color, alpha * 0.5);
            ctx.fillText("+", plot.left + ORDER_INSET, order.y);
            ctx.fillStyle = css(color, alpha);
            ctx.fillText(order.text, plot.left + ORDER_INSET + 14, order.y);
          }
          ctx.restore();
        } else if (stream.labels.length > 0) {
          stream.labels = [];
          stream.bids = NaN;
        }

        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = css(lineColor, 0.45 * headAlpha);
        ctx.lineWidth = 1;
        const dashY = Math.round(head.y) + 0.5;
        ctx.beginPath();
        ctx.moveTo(plot.left, dashY);
        ctx.lineTo(head.x - 12, dashY);
        ctx.stroke();
        ctx.restore();

        if (!reduce && anim.loadingMix < 0.5) {
          const pulse = (waveTime % 2) / 2;
          ctx.beginPath();
          ctx.arc(head.x, head.y, 12 + pulse * 12, 0, Math.PI * 2);
          ctx.strokeStyle = css(lineColor, (1 - pulse) * 0.3 * headAlpha);
          ctx.lineWidth = 1;
          ctx.stroke();
        }
        ctx.beginPath();
        ctx.arc(head.x, head.y, 12, 0, Math.PI * 2);
        ctx.fillStyle = css(lineColor, 0.08 * headAlpha);
        ctx.fill();
        ctx.strokeStyle = css(lineColor, 0.3 * headAlpha);
        ctx.lineWidth = 1;
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(head.x, head.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = css(lineColor, headAlpha);
        ctx.fill();

        const shown = anim.momentumShown;
        if (frame.momentum !== false && shown !== "flat" && anim.momentumOpacity > 0.02) {
          ctx.save();
          ctx.lineWidth = 1.75;
          ctx.lineCap = "round";
          ctx.lineJoin = "round";
          const x = head.x + 22;
          const lead = shown === "up" ? -1 : 1;
          for (let i = 0; i < 2; i += 1) {
            const wave = reduce ? 1 - i * 0.4 : 0.5 + 0.5 * Math.sin(waveTime * 4 - i * 1.3);
            const alpha = (0.35 + 0.5 * wave) * anim.momentumOpacity * headAlpha;
            drawChevron(ctx, x, head.y + lead * (3.5 - i * 7), shown, css(palette["--ink-3"], alpha));
          }
          ctx.restore();
        }

        const badgeY = Math.min(cssHeight - BADGE_HEIGHT - 2, Math.max(2, head.y - BADGE_HEIGHT / 2));
        if (frame.badge) {
          const target =
            frame.momentum === false || anim.momentum === "flat"
              ? lineColor
              : palette[anim.momentum === "up" ? "--green" : "--red"];
          anim.badgeColor = anim.badgeColor ? mixRgba(anim.badgeColor, target, ui) : target;
          const bodyX = plot.right + AXIS_LABEL_X - BADGE_PAD_X;
          ctx.save();
          badgePath(ctx, bodyX, badgeY, badgeTextWidth + BADGE_PAD_X * 2);
          ctx.fillStyle = css(anim.badgeColor, headAlpha);
          ctx.fill();
          ctx.font = badgeFont;
          ctx.fillStyle = css(palette["--on-accent"], headAlpha);
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          ctx.fillText(badgeText, bodyX + BADGE_PAD_X, badgeY + BADGE_HEIGHT / 2 + 0.5);
          ctx.restore();
        }

        if (frame.grid) {
          ctx.save();
          ctx.font = monoFont;
          ctx.textAlign = "left";
          ctx.textBaseline = "middle";
          const badgeMid = badgeY + BADGE_HEIGHT / 2;
          for (const tick of ticks) {
            const y = toY(tick);
            if (y < plot.top - 4 || y > plot.bottom + 4) continue;
            const clearance = frame.badge
              ? Math.min(1, Math.max(0, (Math.abs(y - badgeMid) - 12) / 10))
              : 1;
            if (clearance <= 0.01) continue;
            ctx.fillStyle = css(palette["--ink-3"], clearance);
            ctx.fillText(frame.formatValue(tick), plot.right + AXIS_LABEL_X, y);
          }
          ctx.restore();
        }

        if (dimmed) {
          const sx = Math.round(anim.scrubX) + 0.5;
          ctx.save();
          ctx.globalAlpha = anim.scrubMix;
          ctx.beginPath();
          ctx.moveTo(sx, plot.top);
          ctx.lineTo(sx, plot.bottom);
          ctx.strokeStyle = css(palette["--chart-cursor"]);
          ctx.lineWidth = 1;
          ctx.stroke();

          const scrubTime = anim.scrubTime;
          const sample = scrubTime === null ? undefined : valueAtTime(series, scrubTime);
          if (scrubTime !== null && sample !== undefined) {
            const sy = toY(sample);
            ctx.beginPath();
            ctx.arc(anim.scrubX, sy, 4, 0, Math.PI * 2);
            ctx.fillStyle = css(lineColor);
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = css(palette["--surface"]);
            ctx.stroke();

            const valueText = frame.formatValue(sample);
            const timeText = `  ·  ${frame.formatTime(scrubTime)}`;
            ctx.font = badgeFont;
            const valueWidth = ctx.measureText(valueText).width;
            ctx.font = monoFont;
            const total = valueWidth + ctx.measureText(timeText).width;
            let tx = anim.scrubX + 8;
            if (tx + total > plot.right) tx = anim.scrubX - 8 - total;
            const ty = plot.top - 4;
            ctx.textAlign = "left";
            ctx.textBaseline = "middle";
            ctx.font = badgeFont;
            ctx.fillStyle = css(palette["--ink"]);
            ctx.fillText(valueText, tx, ty);
            ctx.font = monoFont;
            ctx.fillStyle = css(palette["--ink-3"]);
            ctx.fillText(timeText, tx + valueWidth, ty);
          }
          ctx.restore();
        }
      }

      raf = requestAnimationFrame(draw);
    };

    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      theme.disconnect();
      motion.removeEventListener("change", onMotion);
    };
  });

  const seriesNow = (frame: Frame, viewEnd: number) =>
    seriesInWindow(frame.data, viewEnd - frame.windowSecs, viewEnd, {
      time: viewEnd,
      value: viewRef.current.value,
    });

  const scrubAt = (clientX: number) => {
    const host = hostRef.current;
    const frame = frameRef.current;
    const plot = viewRef.current.plot;
    if (!host || !plot || !frame.scrubEnabled || frame.loading || empty) return;
    const rect = host.getBoundingClientRect();
    const ratio = (clientX - rect.left - plot.left) / Math.max(1, plot.headX - plot.left);
    const clamped = Math.max(0, Math.min(1, ratio));
    const viewEnd = viewRef.current.viewEnd || Date.now() / 1000;
    const time = viewEnd - frame.windowSecs + clamped * frame.windowSecs;
    scrubRef.current = { time, pointer: true };
    const sample = valueAtTime(seriesNow(frame, viewEnd), time);
    if (sample !== undefined) onHoverRef.current?.({ time, value: sample });
  };

  return (
    <div
      role="img"
      aria-label={label}
      aria-busy={loading || undefined}
      tabIndex={scrubEnabled && !empty ? 0 : undefined}
      className={cx(
        "relative h-full w-full min-h-0 touch-none select-none font-sans outline-none",
        scrubEnabled && !empty && "cursor-crosshair",
        className,
      )}
      onBlur={() => {
        scrubRef.current = null;
        onHoverRef.current?.(null);
      }}
      onPointerMove={(event) => scrubAt(event.clientX)}
      onPointerLeave={() => {
        if (scrubRef.current?.pointer) {
          scrubRef.current = null;
          onHoverRef.current?.(null);
        }
      }}
      onKeyDown={(event) => {
        if (!scrubEnabled || empty) return;
        const frame = frameRef.current;
        const viewEnd = viewRef.current.viewEnd || Date.now() / 1000;
        const current = scrubRef.current?.time ?? viewEnd;
        const step = frame.windowSecs * 0.04;
        let next = current;
        if (event.key === "ArrowLeft") next = current - step;
        else if (event.key === "ArrowRight") next = current + step;
        else if (event.key === "Home") next = viewEnd - frame.windowSecs;
        else if (event.key === "End") next = viewEnd;
        else if (event.key === "Escape") {
          scrubRef.current = null;
          onHoverRef.current?.(null);
          return;
        } else return;
        event.preventDefault();
        next = Math.max(viewEnd - frame.windowSecs, Math.min(viewEnd, next));
        scrubRef.current = { time: next, pointer: false };
        const sample = valueAtTime(seriesNow(frame, viewEnd), next);
        if (sample !== undefined) onHoverRef.current?.({ time: next, value: sample });
      }}
    >
      <LiveLineSurface hostRef={hostRef} canvasRef={canvasRef} />
      {showValue ? (
        <p
          ref={valueRef}
          aria-hidden
          className="pointer-events-none absolute top-0 left-0 font-mono text-title-1-medium text-ink tabular-nums transition-colors duration-300"
        />
      ) : null}
      {empty ? (
        <p className="pointer-events-none absolute inset-0 flex items-center justify-center text-caption-1-regular text-ink-3">
          {emptyText}
        </p>
      ) : null}
    </div>
  );
}
