/**
 * Metric return: service counter with a parcel sliding into the return chute.
 */
import HL from "../kernel.js";

const {
  Cam,
  clamp,
  facing,
  fit,
  flatDot,
  lerp,
  mk,
  open,
  place,
  pointer,
  prism,
  proj,
  put,
  reflect,
  register,
  rings,
  seg,
  solid,
  spring,
  stepS,
  disposer,
} = HL;

const PB = 5;

export function mount({ stage, svg, read }, value) {
  let slide = clamp(value, 0, 1);
  const bag = disposer();
  const C = Cam(41, 0.52, 1.95);
  const yMid = 82;
  fit(
    C,
    [
      [84, yMid - 32, -PB],
      [216, yMid + 30, -PB],
      [150, yMid, 0],
      [150, yMid, 30],
    ],
    200,
    166,
  );
  const P = proj(C);
  const front = facing(C);

  const g = mk("g", {}, svg);
  const counter = rings(92, yMid + 2, 208, yMid + 24, 7, 1.7);
  reflect(svg, g, P, front, counter[0], 0, 9);
  put(solid(g), prism(P, front, counter[0], counter[1], -PB, 0));

  const chuteBack = rings(162, yMid - 20, 198, yMid + 6, 3, 0.75);
  const chuteLeft = rings(162, yMid - 20, 170, yMid + 6, 2, 0.55);
  const chuteRight = rings(190, yMid - 20, 198, yMid + 6, 2, 0.55);
  put(solid(g), prism(P, front, chuteBack[0], chuteBack[1], 4, 18));
  put(solid(g), prism(P, front, chuteLeft[0], chuteLeft[1], 4, 18));
  put(solid(g), prism(P, front, chuteRight[0], chuteRight[1], 4, 18));

  const arrow = mk("path", { class: "dash lo" }, g);

  const pack = {
    el: solid(mk("g", {}, g)),
    dot: flatDot(g, C, 0.5, "dot m"),
    sp: spring(24, { eps: 0.05 }),
    ring: null,
    x0: 108,
    drawn: NaN,
  };

  function packRings(x0) {
    return rings(x0, yMid - 20, x0 + 30, yMid + 4, 3.5, 0.9);
  }

  function drawArrow(x0) {
    const a = P(x0 + 8, yMid - 4, 26);
    const b = P(x0 + 22, yMid - 10, 28);
    const c = P(172, yMid - 8, 20);
    const d = P(178, yMid - 4, 18);
    arrow.setAttribute(
      "d",
      open([a, b, c]) + seg(c, d),
    );
  }

  function drawPack() {
    const h = Math.max(0.8, pack.sp.x);
    if (h === pack.drawn && !slide) return;
    pack.drawn = h;
    put(pack.el, prism(P, front, pack.ring[0], pack.ring[1], 0, h));
    place(pack.dot, P(pack.x0 + 15, yMid - 8, h + 0.35));
    drawArrow(pack.x0);
  }

  pack.el.sil.classList.add("hi");

  let pick = -1;

  function layout() {
    pack.x0 = lerp(104, 148, slide);
    pack.ring = packRings(pack.x0);
    pack.drawn = NaN;
    pack.sp.t = 24 + (pick >= 0 ? 4 : 0);
    read.textContent = pick < 0 ? "rest" : "return";
  }

  layout();

  const B = register(stage, (dt) => {
    let moving = false;
    if (stepS(pack.sp, dt)) moving = true;
    drawPack();
    return moving;
  });
  bag.add(B.unregister);

  function hit([sx]) {
    const c = P(pack.x0 + 15, yMid - 8, 24)[0];
    return Math.abs(sx - c) < 48 ? 0 : -1;
  }

  drawPack();
  bag.add(
    pointer(stage, {
      move: (p) => {
        pick = hit(p);
        layout();
        B.wake();
      },
      leave: () => {
        pick = -1;
        layout();
        B.wake();
      },
    }),
  );
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => {
      slide = clamp(v, 0, 1);
      layout();
      B.wake();
    },
    destroy: bag.dispose,
  };
}
