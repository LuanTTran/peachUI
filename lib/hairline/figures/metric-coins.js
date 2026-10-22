/**
 * Metric coins: a short stack of round coins — the top coin is bright at rest.
 */
import HL from "../kernel.js";

const {
  Cam,
  clamp,
  circ,
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

function coinRings(cx, cy, R, b) {
  const outer = circ(R, 22).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  const inner = circ(Math.max(0.4, R - b), 18).map((q) => ({
    ...q,
    u: q.u + cx,
    v: q.v + cy,
  }));
  return [outer, inner];
}

const COINS = [
  { cx: 128, cy: 88, R: 10, h: 4.2, hi: false },
  { cx: 140, cy: 82, R: 11, h: 4.6, hi: false },
  { cx: 152, cy: 76, R: 12, h: 5, hi: false },
  { cx: 164, cy: 70, R: 13, h: 5.4, hi: true },
];

export function mount({ stage, svg, read }, value) {
  let spread = clamp(value, 0, 1);
  const bag = disposer();
  const C = Cam(46, 0.52, 2.05);
  const PB = 4;
  fit(
    C,
    [
      [108, 52, -PB],
      [182, 98, -PB],
      [146, 72, 0],
      [164, 70, 24],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const tray = rings(112, 90, 186, 100, 7, 1.4);
  reflect(svg, g, P, front, tray[0], 0, 7);
  put(solid(g), prism(P, front, tray[0], tray[1], -PB, 0));

  const coins = COINS.map((c, i) => {
    const [ring, inner] = coinRings(c.cx, c.cy, c.R, 0.85);
    const el = solid(mk("g", {}, g));
    const dot = flatDot(g, C, 0.5, c.hi ? "dot m" : "dot off");
    return { i, ...c, ring, inner, el, dot, sp: spring(c.h, { eps: 0.04 }), drawn: NaN };
  });

  function drawCoin(b) {
    const spreadLift = spread * (b.i + 1) * 0.8;
    const h = Math.max(0.55, b.sp.x);
    if (h === b.drawn && !spread) return;
    b.drawn = h;
    put(b.el, prism(P, front, b.ring, b.inner, 0, h + spreadLift));
    place(b.dot, P(b.cx, b.cy, h + spreadLift + 0.35));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of coins) {
      if (stepS(b.sp, dt)) moving = true;
      drawCoin(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let pick = -1;
  const centers = coins.map((b) => P(b.cx, b.cy, b.h)[0]);

  function hit([sx]) {
    let best = -1;
    let d0 = Infinity;
    for (let i = 0; i < coins.length; i++) {
      const d = Math.abs(sx - centers[i]);
      if (d < d0) {
        d0 = d;
        best = i;
      }
    }
    return d0 > 42 ? -1 : best;
  }

  function retarget() {
    for (const b of coins) {
      const base = b.h + spread * (b.i + 1) * 0.8;
      if (pick < 0) {
        b.sp.t = base;
        b.el.sil.classList.toggle("hi", b.hi);
        b.dot.className.baseVal = b.hi ? "dot m" : "dot off";
        continue;
      }
      b.sp.t = base + (b.i === pick ? 4 : 0);
      const on = b.i === pick;
      b.el.sil.classList.toggle("hi", on);
      b.dot.className.baseVal = on ? "dot" : "dot off";
    }
    read.textContent = pick < 0 ? "rest" : `coin ${pick + 1}`;
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
      spread = clamp(v, 0, 1);
      retarget();
    },
    destroy: bag.dispose,
  };
}
