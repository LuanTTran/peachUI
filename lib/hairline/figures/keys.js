/**
 * Keys: a low slab holding eleven keys, four by three less a bar where the
 * spacebar would be. The key under the pointer sinks and its neighbours dip
 * in turn, staggered outwards on the 700ms lift curve. Heights rest slightly
 * uneven so the still frame is not a flat grid; the spacebar's edge carries
 * the bright mark at rest. The read-out names the key, `key c·r`, or `space`.
 * The slider is the stagger, in ms.
 *
 * The pattern: discrete items, as Riffle's cards — tweens, a Manhattan
 * stagger, and a hit test on rest positions so a sinking cap cannot flip it.
 *
 * Source: authored with hairline-create (keys.js at the repo root).
 */
import HL from "../kernel.js";

const {
  Cam, clamp, facing, fit, mk, pointer, prism, proj, put, rings, solid,
  tdone, tset, tval, tween, disposer, reflect, register,
} = HL;

const COLS = 4, ROWS = 2;
const X0 = -46, X1 = 46, Y0 = -30, Y1 = 30, PT = 4;
const KS = 14, PIT = 19, KH = 6, SINK = 4.4;
const CXX = [-28.5, -9.5, 9.5, 28.5], CYY = [-19, 0];
const REST_K = [0.3, 0, 0.5, 0.2, 0.9, 0, 0.4, 0.7];
const REST_BAR = 0.6;

const keys = [];
for (let j = 0; j < ROWS; j++)
  for (let i = 0; i < COLS; i++)
    keys.push({ i, j, x: CXX[i], y: CYY[j], w: KS, rest: REST_K[j * COLS + i], name: `key ${i + 1}·${j + 1}` });
keys.push({ i: 0, j: 2, x: -28.5, y: 19, w: KS, rest: 0.2, name: "key 1·3" });
keys.push({ i: 1.5, j: 2, x: 0, y: 19, w: 33, rest: REST_BAR, name: "space" });
keys.push({ i: 3, j: 2, x: 28.5, y: 19, w: KS, rest: 0, name: "key 4·3" });
const N = keys.length;

export function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 2.05);
  fit(C, [
    [X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0],
    [X0, Y0, PT + KH], [X1, Y1, PT + KH],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const plate = rings(X0, Y0, X1, Y1, 7, 2);
  reflect(svg, g, P, front, plate[0], 0, 12);
  put(solid(g), prism(P, front, plate[0], plate[1], 0, PT));

  const kg = mk("g", {}, g);
  const caps = keys.map((k) => {
    const grp = mk("g", {}, kg);
    return {
      ...k, grp,
      sil: mk("path", { class: "sil" }, grp),
      cr: mk("path", { class: "nf lo" }, grp),
      tw: tween(k.rest), target: k.rest,
    };
  });
  const bar = caps.findIndex((k) => k.name === "space");

  function draw(k, press) {
    const z1 = PT + KH - press;
    const [ring, inner] = rings(k.x - k.w / 2, k.y - KS / 2, k.x + k.w / 2, k.y + KS / 2, 2.4, 1);
    const p = prism(P, front, ring, inner, PT - 0.5, z1);
    k.sil.setAttribute("d", p.sil);
    k.cr.setAttribute("d", p.crease);
  }

  // Key pick on rest positions, screen space — a cap mid-sink never flips it.
  const pc = P(CXX[0], CYY[0], PT + KH), pn = P(CXX[1], CYY[0], PT + KH);
  const hitR2 = Math.pow(Math.hypot(pn[0] - pc[0], pn[1] - pc[1]) * 0.62, 2);
  function hit([sx, sy]) {
    let best = -1, bd = hitR2;
    for (let k = 0; k < N; k++) {
      const c = P(caps[k].x, caps[k].y, PT + KH);
      const q = (c[0] - sx) * (c[0] - sx) + (c[1] - sy) * (c[1] - sy);
      if (q < bd) { bd = q; best = k; }
    }
    return best;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const k of caps) {
      draw(k, tval(k.tw, now));
      if (!tdone(k.tw, now)) moving = true;
    }
    return moving;
  });
  bag.add(B.unregister);

  let act = -1;
  function setActive(a) {
    if (a === act) return;
    const now = performance.now(), from = a >= 0 ? a : act;
    act = a;
    for (let k = 0; k < N; k++) {
      const kx = caps[k];
      const dd = Math.abs(kx.i - caps[from].i) + Math.abs(kx.j - caps[from].j);
      if (a >= 0) {
        const da = Math.abs(kx.i - caps[a].i) + Math.abs(kx.j - caps[a].j);
        kx.target = k === a ? SINK : Math.max(kx.rest, clamp(2.2 - 0.9 * da, 0, 2.2));
      } else {
        kx.target = kx.rest;
      }
      tset(kx.tw, kx.target, now, dd * stag);
      kx.sil.classList.toggle("hi", k === a || (a < 0 && k === bar));
    }
    if (a >= 0) kg.appendChild(caps[a].grp);
    read.textContent = a < 0 ? "rest" : caps[a].name;
    B.wake();
  }

  for (const k of caps) draw(k, k.rest);
  caps[bar].sil.classList.add("hi");
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}
