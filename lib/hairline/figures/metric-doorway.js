/**
 * Metric doorway: shop entry with a visitor — head catches the bright edge at rest.
 */
import HL from "../kernel.js";

const {
  Cam,
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

const PB = 5;

function discRings(cx, cy, R, b) {
  const outer = circ(R, 18).map((q) => ({ ...q, u: q.u + cx, v: q.v + cy }));
  const inner = circ(Math.max(0.35, R - b), 14).map((q) => ({
    ...q,
    u: q.u + cx,
    v: q.v + cy,
  }));
  return [outer, inner];
}

export function mount({ stage, svg, read }, value) {
  let ajar = value;
  const bag = disposer();
  const C = Cam(42, 0.5, 1.88);
  const y0 = 46;
  const y1 = 102;
  const yStep = 104;
  fit(
    C,
    [
      [86, y0 - 6, -PB],
      [214, yStep + 10, -PB],
      [150, 72, 0],
      [150, 72, 44],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const stoop = rings(94, yStep - 2, 206, yStep + 12, 6, 1.5);
  reflect(svg, g, P, front, stoop[0], 0, 8);
  put(solid(g), prism(P, front, stoop[0], stoop[1], -PB, 0));

  function part(ringPair, h) {
    return {
      ring: ringPair,
      h,
      el: solid(mk("g", {}, g)),
      sp: spring(h, { eps: 0.05 }),
      drawn: NaN,
    };
  }

  const jambs = [
    part(rings(96, y0 + 4, 110, y1, 3, 0.85), 38),
    part(rings(190, y0 + 4, 204, y1, 3, 0.85), 38),
  ];
  const lintel = part(rings(94, y0 - 2, 206, y0 + 6, 2.5, 0.7), 7);
  const awning = part(rings(108, y0 - 10, 192, y0 - 2, 2, 0.6), 4);
  const visitorBody = part(rings(138, 62, 162, 88, 3.5, 0.8), 22);
  const visitorHead = part(discRings(150, 56, 5.5, 0.55), 7);
  const door = part(rings(114, y0 + 10, 176, y1 - 8, 3.5, 0.9), 32);

  const visitorDot = flatDot(g, C, 0.48, "dot m");

  function doorRing() {
    return rings(114 + ajar * 2, y0 + 10, 176 + ajar * 2, y1 - 8, 3.5, 0.9);
  }

  function drawPart(block) {
    const h = Math.max(0.7, block.sp.x);
    if (h === block.drawn) return;
    block.drawn = h;
    put(block.el, prism(P, front, block.ring[0], block.ring[1], 0, h));
  }

  function drawAll() {
    door.ring = doorRing();
    door.drawn = NaN;
    for (const j of jambs) drawPart(j);
    drawPart(lintel);
    drawPart(awning);
    drawPart(visitorBody);
    drawPart(visitorHead);
    drawPart(door);
    place(visitorDot, P(150, 72, 30));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const j of jambs) if (stepS(j.sp, dt)) moving = true;
    if (stepS(lintel.sp, dt)) moving = true;
    if (stepS(awning.sp, dt)) moving = true;
    if (stepS(visitorBody.sp, dt)) moving = true;
    if (stepS(visitorHead.sp, dt)) moving = true;
    if (stepS(door.sp, dt)) moving = true;
    drawAll();
    return moving;
  });
  bag.add(B.unregister);

  let pick = -1;

  function setHi() {
    const headOn = pick < 0 || pick === 0;
    const doorOn = pick === 1;
    visitorHead.el.sil.classList.toggle("hi", headOn);
    visitorBody.el.sil.classList.toggle("hi", false);
    door.el.sil.classList.toggle("hi", doorOn);
    visitorDot.className.baseVal = headOn ? "dot m" : "dot off";
  }

  function retarget() {
    setHi();
    read.textContent = pick < 0 ? "rest" : pick === 0 ? "visitor" : "door";
    B.wake();
  }

  drawAll();
  retarget();
  bag.add(
    pointer(stage, {
      move: ([sx]) => {
        const headX = P(150, 72, 28)[0];
        const doorX = P(145, 80, 30)[0];
        pick = Math.abs(sx - headX) < 46 ? 0 : Math.abs(sx - doorX) < 50 ? 1 : -1;
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
      ajar = v;
      door.drawn = NaN;
      drawAll();
    },
    destroy: bag.dispose,
  };
}
