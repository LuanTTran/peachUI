/**
 * Plan-tiers: three subscription blocks on a plinth — left low, centre tall, right mid.
 * The pointer picks one by screen x; it lifts on a spring and takes the bright stroke;
 * neighbours rise less, the further away the less. The slider widens that reach.
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

const N = 3;
const W = 34;
const GAP = 18;
const X0 = 58;
const PB = 5;
const H = [26, 46, 34];

/** Share of the main lift a block gets at distance d (in block widths) from the chosen one. */
function neighborLift(d, reach) {
  if (d <= 0) return 1;
  if (d >= reach) return 0;
  return 1 - d / reach;
}

export function mount({ stage, svg, read }, value) {
  let reach = value;
  const bag = disposer();
  const C = Cam(45, 0.5, 1.55);
  const yMid = 72;
  const xs = Array.from({ length: N }, (_, i) => X0 + i * (W + GAP));
  fit(
    C,
    [
      [xs[0] - 8, yMid - 28, -PB],
      [xs[N - 1] + W + 8, yMid + 28, -PB],
      [xs[0], yMid, 0],
      [xs[N - 1] + W, yMid, 0],
      [xs[1], yMid, H[1] + 14],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const plinth = rings(xs[0] - 10, yMid - 22, xs[N - 1] + W + 10, yMid + 22, 8, 2);
  reflect(svg, g, P, front, plinth[0], 0, 12);
  put(solid(g), prism(P, front, plinth[0], plinth[1], -PB, 0));

  const blocks = xs.map((x, i) => {
    const [ring, inner] = rings(x, yMid - W / 2, x + W, yMid + W / 2, 4.5, 1.1);
    const el = solid(mk("g", {}, g));
    const dot = flatDot(g, C, 0.55, i === 1 ? "dot m" : "dot off");
    return {
      i,
      x,
      h0: H[i],
      ring,
      inner,
      el,
      dot,
      sp: spring(H[i], { eps: 0.05 }),
      drawn: NaN,
    };
  });

  function drawBlock(b) {
    const h = Math.max(0.8, b.sp.x);
    if (h === b.drawn) return;
    b.drawn = h;
    put(b.el, prism(P, front, b.ring, b.inner, 0, h));
    place(b.dot, P(b.x + W / 2, yMid, h + 0.4));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const b of blocks) {
      if (stepS(b.sp, dt)) moving = true;
      drawBlock(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let pick = -1;
  const centers = blocks.map((b) => P(b.x + W / 2, yMid, b.h0)[0]);

  function hit([sx]) {
    let best = -1;
    let d0 = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(sx - centers[i]);
      if (d < d0) {
        d0 = d;
        best = i;
      }
    }
    return d0 > 52 ? -1 : best;
  }

  function retarget() {
    const lift = 16;
    for (const b of blocks) {
      if (pick < 0) {
        b.sp.t = b.h0;
        b.el.sil.classList.toggle("hi", b.i === 1);
        b.dot.className.baseVal = b.i === 1 ? "dot m" : "dot off";
        continue;
      }
      const d = Math.abs(b.i - pick);
      b.sp.t = b.h0 + lift * neighborLift(d, reach);
      const on = b.i === pick;
      b.el.sil.classList.toggle("hi", on);
      b.dot.className.baseVal = on ? "dot" : "dot off";
    }
    read.textContent = pick < 0 ? "rest" : `tier ${pick + 1}`;
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
      reach = clamp(v, 0.8, 2.4);
      if (pick >= 0) retarget();
    },
    destroy: bag.dispose,
  };
}

