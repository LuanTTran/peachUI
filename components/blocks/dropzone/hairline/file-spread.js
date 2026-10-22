/**
 * File-spread figure source (hairline-create). Built with:
 *   node .agents/skills/hairline-create/build.mjs components/blocks/dropzone/hairline/file-spread.js
 *
 * Mounted from the dropzone block via `lib/hairline/figures/file-spread.js`.
 */
const {
  Cam,
  clamp,
  facing,
  fit,
  flatDot,
  lerp,
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
const W = 32;
const Y0 = 74;
const PB = 3;
const CX = 200;
const PEEK = 10;
const FAN = 40;
const H0 = [34, 44, 34];
const DRAW_ORDER = [0, 2, 1];

function centerX(i, spread) {
  const side = i === 0 ? -1 : i === 2 ? 1 : 0;
  const rest = side * PEEK;
  const open = side * FAN;
  return CX + lerp(rest, open, spread);
}

function mount({ stage, svg, read }, value) {
  let spreadAmt = clamp(value, 0, 1);
  const bag = disposer();
  const C = Cam(45, 0.5, 1.88);
  const xsWide = Array.from({ length: N }, (_, i) => centerX(i, 1) - W / 2);
  fit(
    C,
    [
      [xsWide[0] - 12, Y0 - 28, -PB],
      [xsWide[2] + W + 12, Y0 + 28, -PB],
      [centerX(1, 0), Y0, 0],
      [centerX(1, 1), Y0, 0],
      [centerX(1, 1), Y0, H0[1] + 16],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const tray = rings(xsWide[0] - 8, Y0 - 22, xsWide[2] + W + 8, Y0 + 22, 5, 1.4);
  reflect(svg, g, P, front, tray[0], 0, 8);
  put(solid(g), prism(P, front, tray[0], tray[1], -PB, 0));

  const spreadSpring = spring(spreadAmt, { eps: 0.03 });
  const cards = Array.from({ length: N }, (_, i) => {
    const el = solid(mk("g", {}, g));
    const dot = flatDot(g, C, 0.55, i === 1 ? "dot m" : "dot off");
    return {
      i,
      h0: H0[i],
      el,
      dot,
      lift: spring(H0[i], { eps: 0.05 }),
      drawn: NaN,
      ring: null,
      inner: null,
      x: centerX(i, spreadAmt) - W / 2,
    };
  });

  function layoutCard(b, spread) {
    const nextX = centerX(b.i, spread) - W / 2;
    if (nextX !== b.x) b.drawn = NaN;
    b.x = nextX;
    const [ring, inner] = rings(b.x, Y0 - W / 2, b.x + W, Y0 + W / 2, 4, 1.1);
    b.ring = ring;
    b.inner = inner;
  }

  function drawCard(b) {
    const h = Math.max(0.6, b.lift.x);
    if (h === b.drawn && b.ring) return;
    b.drawn = h;
    put(b.el, prism(P, front, b.ring, b.inner, 0, h));
    place(b.dot, P(b.x + W / 2, Y0, h + 0.4));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    if (stepS(spreadSpring, dt)) moving = true;
    const spread = spreadSpring.x;
    const sorted = DRAW_ORDER.map((idx) => cards[idx]);
    for (const b of sorted) {
      layoutCard(b, spread);
      if (stepS(b.lift, dt)) moving = true;
      drawCard(b);
    }
    return moving;
  });
  bag.add(B.unregister);

  let pick = -1;
  const restCenters = () =>
    cards.map((b) => P(centerX(b.i, 0), Y0, b.h0)[0]);

  function hit([sx]) {
    const centers = restCenters();
    let best = -1;
    let d0 = Infinity;
    for (let i = 0; i < N; i++) {
      const d = Math.abs(sx - centers[i]);
      if (d < d0) {
        d0 = d;
        best = i;
      }
    }
    return d0 > 56 ? -1 : best;
  }

  function retarget() {
    const spread = spreadSpring.t;
    const pickLift = 14;
    for (const b of cards) {
      const side = b.i === 1 ? 0 : 1;
      const tuckLift = side * (1 - spread) * 4;
      const fanLift = spread * (8 + side * 3);
      const d = pick < 0 ? 0 : Math.abs(b.i - pick);
      const extra =
        pick < 0 ? 0 : pickLift * (d === 0 ? 1 : Math.max(0, 1 - d * 0.5));
      b.lift.t = b.h0 - tuckLift + fanLift + extra;
      const on = pick >= 0 && b.i === pick;
      b.el.sil.classList.toggle("hi", on);
      b.dot.className.baseVal = on ? "dot" : b.i === 1 && pick < 0 ? "dot m" : "dot off";
    }
    read.textContent = pick < 0 ? "rest" : `file ${pick + 1}`;
    B.wake();
  }

  spreadSpring.t = spreadAmt;
  for (const b of cards) layoutCard(b, spreadAmt);
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
      spreadAmt = clamp(v, 0, 1);
      spreadSpring.t = spreadAmt;
      retarget();
    },
    destroy: bag.dispose,
  };
}

hairline({
  name: "file-spread",
  means:
    "Three file cards: the centre one fills the frame while the sides peek behind; they fan apart when the gesture opens.",
  rules: [1, 3, 5],
  range: [0.06, 0.2, 1],
  tour: [[168, 168], [200, 158], [232, 168], null],
  mount,
});
