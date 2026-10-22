/**
 * Math for LiveLine.
 *
 * The motion model follows Liveline by Benji Taylor
 * (https://benji.org/liveline): ease toward the latest sample, and let the
 * value range jump outward so the line is never clipped.
 */

export type LiveLinePoint = {
  time: number;
  value: number;
};

export function frameLerp(speed: number, dtMs: number): number {
  const dt = Math.min(Math.max(dtMs, 0), 64);
  return 1 - (1 - speed) ** (dt / 16.67);
}

export function lerp(current: number, target: number, t: number): number {
  return current + (target - current) * t;
}

/** Expand a min/max so a flat series still has a visible range. */
export function paddedDomain(min: number, max: number): { min: number; max: number } {
  const lo = Math.min(min, max);
  const hi = Math.max(min, max);
  const span = hi - lo;
  if (span < 1e-6) {
    const pad = Math.max(Math.abs(lo) * 0.05, 1);
    return { min: lo - pad, max: hi + pad };
  }
  const pad = span * 0.18;
  return { min: lo - pad, max: hi + pad };
}

/**
 * Points inside [start, end], plus the sample just before `start` so the
 * line meets the left edge instead of popping in.
 * Assumes chronological order.
 */
export function seriesInWindow(
  points: LiveLinePoint[],
  start: number,
  end: number,
  head: LiveLinePoint,
): LiveLinePoint[] {
  let before: LiveLinePoint | undefined;
  const out: LiveLinePoint[] = [];
  for (const point of points) {
    if (point.time < start) {
      before = point;
      continue;
    }
    if (point.time > end) break;
    out.push(point);
  }
  if (before && (out.length === 0 || out[0].time > start)) out.unshift(before);
  const last = out[out.length - 1];
  if (!last || head.time - last.time > 1e-3) out.push(head);
  else out[out.length - 1] = head;
  return out;
}

export function valueAtTime(points: LiveLinePoint[], time: number): number | undefined {
  const n = points.length;
  if (n === 0) return undefined;
  if (time <= points[0].time) return points[0].value;
  if (time >= points[n - 1].time) return points[n - 1].value;
  let lo = 0;
  let hi = n - 1;
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if (points[mid].time <= time) lo = mid;
    else hi = mid;
  }
  const span = points[hi].time - points[lo].time;
  const t = span === 0 ? 0 : (time - points[lo].time) / span;
  return points[lo].value + (points[hi].value - points[lo].value) * t;
}

/** Horizontal grid values inside the visible range. */
export function niceTicks(min: number, max: number, count = 4): number[] {
  if (!(max > min)) return [min];
  const rough = (max - min) / Math.max(count, 1);
  const pow = 10 ** Math.floor(Math.log10(rough));
  const err = rough / pow;
  const step = (err >= 7.5 ? 10 : err >= 3.5 ? 5 : err >= 1.5 ? 2 : 1) * pow;
  if (!(step > 0)) return [min, max];
  const start = Math.ceil((min + step * 1e-6) / step) * step;
  const ticks: number[] = [];
  for (let value = start; value < max - step * 0.15 && ticks.length < 6; value += step) {
    ticks.push(Number(value.toPrecision(12)));
  }
  return ticks;
}

/**
 * Fritsch–Carlson monotone cubic. Samples stay inside each segment's
 * min and max, so a live line does not ring past a spike.
 */
export function sampleMonotone(points: LiveLinePoint[], steps = 8): LiveLinePoint[] {
  const n = points.length;
  if (n <= 2) return points.slice();

  const h: number[] = [];
  const delta: number[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const span = points[i + 1].time - points[i].time;
    h.push(span);
    delta.push(span === 0 ? 0 : (points[i + 1].value - points[i].value) / span);
  }

  const slope = new Array<number>(n).fill(0);
  slope[0] = delta[0];
  slope[n - 1] = delta[n - 2];
  for (let i = 1; i < n - 1; i += 1) {
    slope[i] = delta[i - 1] * delta[i] <= 0 ? 0 : (delta[i - 1] + delta[i]) / 2;
  }
  for (let i = 0; i < n - 1; i += 1) {
    if (delta[i] === 0) {
      slope[i] = 0;
      slope[i + 1] = 0;
      continue;
    }
    const a = slope[i] / delta[i];
    const b = slope[i + 1] / delta[i];
    const hypot = a * a + b * b;
    if (hypot > 9) {
      const scale = 3 / Math.hypot(a, b);
      slope[i] = scale * a * delta[i];
      slope[i + 1] = scale * b * delta[i];
    }
  }

  const out: LiveLinePoint[] = [];
  for (let i = 0; i < n - 1; i += 1) {
    const span = h[i];
    const count = span === 0 ? 1 : steps;
    for (let s = 0; s < count; s += 1) {
      const t = s / count;
      const t2 = t * t;
      const t3 = t2 * t;
      const time = points[i].time + span * t;
      const value =
        (2 * t3 - 3 * t2 + 1) * points[i].value +
        (t3 - 2 * t2 + t) * span * slope[i] +
        (-2 * t3 + 3 * t2) * points[i + 1].value +
        (t3 - t2) * span * slope[i + 1];
      out.push({ time, value });
    }
  }
  out.push(points[n - 1]);
  return out;
}

/** Plot frame shared by LiveLine and anything layered under it. */
export type LiveLinePlot = {
  left: number;
  right: number;
  top: number;
  bottom: number;
  width: number;
  height: number;
  /** Where the live head sits. The time window ends here, short of `right`. */
  headX: number;
};

export function liveLinePlot(
  width: number,
  height: number,
  {
    gutter = 0,
    axis = false,
    overlay = 0,
    momentum = true,
  }: { gutter?: number; axis?: boolean; overlay?: number; momentum?: boolean } = {},
): LiveLinePlot {
  const left = 0;
  const right = Math.max(left + 16, width - Math.max(gutter, 12));
  const top = 16 + overlay;
  const bottom = Math.max(top + 8, height - (axis ? 28 : 12));
  const headX = Math.max(left + 8, right - (momentum ? 36 : 12));
  return { left, right, top, bottom, width: right - left, height: bottom - top, headX };
}

const TIME_STEPS = [1, 2, 5, 10, 15, 30, 60, 120, 300, 600, 900, 1800, 3600];

/** Round-second ticks for the time axis, at most `maxCount` across the window. */
export function timeTicks(start: number, end: number, maxCount: number): number[] {
  if (!(end > start) || maxCount < 1) return [];
  const rough = (end - start) / maxCount;
  const step = TIME_STEPS.find((s) => s >= rough) ?? Math.ceil(rough / 3600) * 3600;
  const ticks: number[] = [];
  for (let time = Math.ceil(start / step) * step; time <= end; time += step) ticks.push(time);
  return ticks;
}
