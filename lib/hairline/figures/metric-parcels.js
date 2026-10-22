/**
 * Metric parcels: three shipment boxes in a queue — front box has tape and reads first.
 */
import HL from "../kernel.js";

const {
  Cam,
  clamp,
  facing,
  fit,
  flatDot,
  mk,
  place,
  pointer,
  prism,
  proj,
  put,
  reflect,
  register,
  rings,
  solid,
  spring,
  stepS,
  disposer,
} = HL;

const PARCELS = [
  { x: 74, w: 36, d: 34, h: 32, tape: true, tab: true, hi: true },
  { x: 116, w: 30, d: 30, h: 26, tape: false, tab: false, hi: false },
  { x: 152, w: 28, d: 28, h: 24, tape: false, tab: false, hi: false },
];

function neighborLift(d, reach) {
  if (d <= 0) return 1;
  if (d >= reach) return 0;
  return 1 - d / reach;
}

export function mount({ stage, svg, read }, value) {
  let reach = value;
  const bag = disposer();
  const C = Cam(44, 0.5, 1.92);
  const yMid = 78;
  const PB = 5;
  const xs = PARCELS.map((p) => p.x);
  const last = PARCELS[PARCELS.length - 1];
  fit(
    C,
    [
      [xs[0] - 10, yMid - 28, -PB],
      [last.x + last.w + 10, yMid + 28, -PB],
      [xs[0], yMid, 0],
      [last.x + last.w, yMid, 0],
      [PARCELS[0].x, yMid, PARCELS[0].h + 14],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const plinth = rings(xs[0] - 12, yMid - 22, last.x + last.w + 12, yMid + 22, 7, 1.6);
  reflect(svg, g, P, front, plinth[0], 0, 9);
  put(solid(g), prism(P, front, plinth[0], plinth[1], -PB, 0));

  const parcels = PARCELS.map((p, i) => {
    const [ring, inner] = rings(
      p.x,
      yMid - p.d / 2,
      p.x + p.w,
      yMid + p.d / 2,
      3.5,
      0.95,
    );
    const body = solid(mk("g", {}, g));
    const tape =
      p.tape
        ? solid(mk("g", {}, g))
        : null;
    const tab =
      p.tab
        ? solid(mk("g", {}, g))
        : null;
    const dot = flatDot(g, C, 0.52, p.hi ? "dot m" : "dot off");
    return {
      i,
      ...p,
      ring,
      inner,
      body,
      tape,
      tab,
      dot,
      sp: spring(p.h, { eps: 0.05 }),
      drawn: NaN,
    };
  });

  function drawParcel(b) {
    const h = Math.max(0.8, b.sp.x);
    if (h === b.drawn) return;
    b.drawn = h;
    put(b.body, prism(P, front, b.ring, b.inner, 0, h));
    if (b.tape) {
      const [tRing, tInner] = rings(
        b.x + 4,
        yMid - b.d / 2 + 6,
        b.x + b.w - 4,
        yMid - b.d / 2 + 11,
        1.2,
        0.45,
      );
      put(b.tape, prism(P, front, tRing, tInner, h - 0.2, h + 1.4));
    }
    if (b.tab) {
      const [tabRing, tabInner] = rings(
        b.x + b.w - 9,
        yMid - 4,
        b.x + b.w + 2,
        yMid + 6,
        1.5,
        0.4,
      );
      put(b.tab, prism(P, front, tabRing, tabInner, h * 0.55, h * 0.55 + 5));
    }
    place(b.dot, P(b.x + b.w / 2, yMid, h + 0.45));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of parcels) {
      if (stepS(b.sp, dt)) moving = true;
      drawParcel(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let pick = -1;
  const centers = parcels.map((b) => P(b.x + b.w / 2, yMid, b.h)[0]);

  function hit([sx]) {
    let best = -1;
    let d0 = Infinity;
    for (let i = 0; i < parcels.length; i++) {
      const d = Math.abs(sx - centers[i]);
      if (d < d0) {
        d0 = d;
        best = i;
      }
    }
    return d0 > 50 ? -1 : best;
  }

  function retarget() {
    const lift = 12;
    for (const b of parcels) {
      if (pick < 0) {
        b.sp.t = b.h;
        b.body.sil.classList.toggle("hi", b.hi);
        b.dot.className.baseVal = b.hi ? "dot m" : "dot off";
        continue;
      }
      const d = Math.abs(b.i - pick);
      b.sp.t = b.h + lift * neighborLift(d, reach);
      const on = b.i === pick;
      b.body.sil.classList.toggle("hi", on);
      b.dot.className.baseVal = on ? "dot" : "dot off";
    }
    read.textContent = pick < 0 ? "rest" : `parcel ${pick + 1}`;
    B.wake();
  }

  retarget();
  bag.add(
    pointer(stage, {
      move: (p) => {
        pick = hit(p);
        retarget();
      },
      leave: () => {
        pick = -1;
        retarget();
      },
    }),
  );
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => {
      reach = clamp(v, 0.85, 2.1);
      if (pick >= 0) retarget();
    },
    destroy: bag.dispose,
  };
}
