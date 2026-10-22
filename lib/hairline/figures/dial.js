/**
 * Dial: a knob on a low plate, ringed by a tick arc. The pointer's angle
 * round the dial sets where it points, on a spring, snapped to the slider's
 * detent spacing; the tick nearest its mark goes bright while the pointer is
 * on the plate. At rest it sits a notch past ten o'clock with the mark
 * bright. The read-out is the angle in degrees. The slider is the detent
 * spacing, in degrees — 0 is free.
 *
 * The pattern: a continuous input — the pointer's bearing — driving one
 * spring, with the choice (nearest tick) falling out of it.
 *
 * Source: authored with hairline-create (dial.js at the repo root).
 */
import HL from "../kernel.js";

const {
  Cam, clamp, circ, facing, fit, mk, pointer, prism, proj, put, rad, rrect,
  register, seg, spring, stepS, solid, disposer, reflect, unproj,
} = HL;

const X0 = -44, X1 = 44, Y0 = -34, Y1 = 34, PT = 4;
const DR = 24, DH = 11, DX = 0, DY = -2, TOP = PT + DH;
const TICKS = 9, TA0 = -135, TA1 = 135, TR0 = 30, TR1 = 34;
const REST_A = -115;

export function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let detent = value;

  const C = Cam(45, 0.5, 2.1);
  fit(C, [
    [X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0],
    [DX, DY, TOP],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const plateR = rrect(X0, Y0, X1, Y1, 7, 6);
  const plateI = rrect(X0 + 2, Y0 + 2, X1 - 2, Y1 - 2, 5, 6);
  reflect(svg, g, P, front, plateR, 0, 12);
  put(solid(g), prism(P, front, plateR, plateI, 0, PT));

  // tick arc on the plate top
  const ticks = [];
  for (let t = 0; t < TICKS; t++) {
    const a = rad(TA0 + (t / (TICKS - 1)) * (TA1 - TA0));
    const el = mk("path", {
      d: seg(
        P(DX + TR0 * Math.cos(a), DY + TR0 * Math.sin(a), PT),
        P(DX + TR1 * Math.cos(a), DY + TR1 * Math.sin(a), PT),
      ),
      class: "nf lo",
    }, g);
    ticks.push(el);
  }

  const dg = mk("g", {}, g);
  const dial = solid(dg);
  const mark = mk("path", { class: "nf" }, dg);
  // knurls: four notches round the top edge, so the turn reads
  const knurls = [0, 1, 2, 3].map(() => mk("path", { class: "nf lo" }, dg));

  let active = false;
  function draw(a) {
    const shifted = (r) => r.map((q) => ({ ...q, u: q.u + DX, v: q.v + DY }));
    put(dial, prism(P, front, shifted(circ(DR, 18)), shifted(circ(DR - 1.6, 18)), PT, TOP));
    mark.setAttribute("d", seg(
      P(DX + 9 * Math.cos(a), DY + 9 * Math.sin(a), TOP),
      P(DX + 19 * Math.cos(a), DY + 19 * Math.sin(a), TOP),
    ));
    knurls.forEach((el, t) => {
      const ka = a + rad(90 * t + 45);
      el.setAttribute("d", seg(
        P(DX + (DR - 1) * Math.cos(ka), DY + (DR - 1) * Math.sin(ka), TOP),
        P(DX + (DR - 7) * Math.cos(ka), DY + (DR - 7) * Math.sin(ka), TOP),
      ));
    });
    const idx = clamp(Math.round((a * 180 / Math.PI - TA0) / ((TA1 - TA0) / (TICKS - 1))), 0, TICKS - 1);
    ticks.forEach((el, t) => el.classList.toggle("hi", active && t === idx));
  }

  const ang = spring(rad(REST_A));
  const B = register(stage, (dt) => {
    const moving = stepS(ang, dt);
    draw(ang.x);
    return moving;
  });
  bag.add(B.unregister);

  /** The pointer's bearing round the dial, snapped to the detent. */
  function move([sx, sy]) {
    const [wx, wy] = unproj(C, sx, sy, TOP);
    let a = Math.atan2(wy - DY, wx - DX);
    const lo = rad(TA0), hi = rad(TA1);
    if (a < lo - 0.6 || a > hi + 0.6) { leave(); return; }
    active = true;
    a = clamp(a, lo, hi);
    if (detent > 0) a = Math.round(a / rad(detent)) * rad(detent);
    ang.t = a;
    mark.classList.add("hi");
    read.textContent = Math.round(a * 180 / Math.PI) + "°";
    B.wake();
  }

  function leave() {
    if (!active && ang.t === rad(REST_A)) return;
    active = false;
    ang.t = rad(REST_A);
    mark.classList.add("hi");
    read.textContent = "rest";
    B.wake();
  }

  draw(ang.x);
  mark.classList.add("hi");
  bag.add(pointer(stage, { move, leave }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { detent = v; },
    destroy: bag.dispose,
  };
}
