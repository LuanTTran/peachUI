/**
 * Drawers: a parts cabinet of twelve shallow drawers. The one under the
 * pointer slides open and its neighbours budge, staggered outwards by
 * distance on the 700ms lift curve. A few drawers stand ajar at rest so the
 * still frame is a composition; the most open one carries the bright pull.
 * The read-out names the drawer, `drawer c·r`. The slider is the stagger.
 *
 * The pattern: discrete items, as Riffle's cards. A grid of tweens, a
 * stagger by Manhattan distance, and a hit test on each drawer's target pose
 * so a drawer mid-slide cannot flip the choice.
 *
 * Source: authored with hairline-create (drawers.js at the repo root).
 */
import HL from "../kernel.js";

const {
  Cam, clamp, facing, fit, prism, proj, put, rings, seg, solid,
  tdone, tset, tval, tween, disposer, mk, pointer, reflect, register,
} = HL;

const COLS = 4, ROWS = 3, N = COLS * ROWS;
const X0 = -66, X1 = 66, Y0 = -30, YF = 40, HB = 76, HT = 84;
const DW = 24, DH = 17, PTX = 30, PTZ = 22;
const DEPTH = 4, OPEN = 20, NUDGE = 8, FALL = 3.4;
const REST = [0, 0, 7, 0, 0, 4, 0, 0, 9, 0, 0, 3];
const MARK = 8;

const colX = (i) => -45 + i * PTX;
const rowZ = (j) => 21 + j * PTZ;

export function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let stag = value;

  const C = Cam(45, 0.5, 1.75);
  const reach = YF + OPEN + 6;
  fit(C, [
    [X0 - 3, Y0 - 3, 0], [X1 + 3, reach, 0], [X1 + 3, Y0 - 3, 0], [X0 - 3, reach, 0],
    [X0 - 3, reach, HT], [X1 + 3, Y0 - 3, HT], [X0 - 3, Y0 - 3, HT], [X1 + 3, reach, HT],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const plinth = rings(X0 - 2.5, Y0 - 2.5, X1 + 2.5, YF + 2.5, 8, 1.6);
  reflect(svg, g, P, front, plinth[0], 0, 14);

  const base = mk("g", {}, g);
  put(solid(base), prism(P, front, plinth[0], plinth[1], 0, 7));
  const body = rings(X0, Y0, X1, YF, 8, 2);
  put(solid(base), prism(P, front, body[0], body[1], 7, HB));

  const dg = mk("g", {}, g);
  const drawers = [];
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const grp = mk("g", {}, dg);
      const sil = mk("path", { class: "sil" }, grp);
      const cr = mk("path", { class: "nf lo" }, grp);
      const pull = mk("path", { class: "nf lo" }, grp);
      const k = j * COLS + i;
      drawers.push({ i, j, grp, sil, cr, pull, tw: tween(REST[k]), target: REST[k] });
    }
  }

  const cornice = rings(X0 - 3, Y0 - 3, X1 + 3, YF + 3, 9, 1.6);
  put(solid(mk("g", {}, g)), prism(P, front, cornice[0], cornice[1], HB, HT));

  /** One drawer's paths at open amount o: a slab that deepens as it slides. */
  function draw(d, o) {
    const cx = colX(d.i), cz = rowZ(d.j);
    const y1 = YF + o, y0 = y1 - (DEPTH + 0.7 * o);
    const [ring, inner] = rings(cx - DW / 2, y0, cx + DW / 2, y1, 2, 1);
    const p = prism(P, front, ring, inner, cz - DH / 2, cz + DH / 2);
    d.sil.setAttribute("d", p.sil);
    d.cr.setAttribute("d", p.crease);
    d.pull.setAttribute("d", seg(P(cx - 5, y1, cz), P(cx + 5, y1, cz)));
  }

  // Hit test on each drawer's target pose, in screen space, so a drawer mid-
  // slide still answers the pointer sitting on it.
  const pc = P(colX(0), YF, rowZ(0)), pn = P(colX(1), YF, rowZ(0));
  const hitR2 = Math.pow(Math.hypot(pn[0] - pc[0], pn[1] - pc[1]) * 0.62, 2);
  function hit([x, y]) {
    let best = -1, bd = hitR2;
    for (let k = 0; k < N; k++) {
      const d = drawers[k], c = P(colX(d.i), YF + d.target, rowZ(d.j));
      const q = (c[0] - x) * (c[0] - x) + (c[1] - y) * (c[1] - y);
      if (q < bd) { bd = q; best = k; }
    }
    return best;
  }

  const B = register(stage, (_dt, now) => {
    let moving = false;
    for (const d of drawers) {
      draw(d, tval(d.tw, now));
      if (!tdone(d.tw, now)) moving = true;
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
      const d = drawers[k];
      const dd = Math.abs(d.i - drawers[from].i) + Math.abs(d.j - drawers[from].j);
      if (a >= 0) {
        const da = Math.abs(d.i - drawers[a].i) + Math.abs(d.j - drawers[a].j);
        d.target = k === a ? OPEN : Math.max(REST[k], clamp(NUDGE - FALL * da, 0, NUDGE));
      } else {
        d.target = REST[k];
      }
      tset(d.tw, d.target, now, dd * stag);
      d.sil.classList.toggle("hi", k === a);
      d.pull.classList.toggle("hi", k === a || (a < 0 && k === MARK));
    }
    if (a >= 0) dg.appendChild(drawers[a].grp);
    read.textContent = a < 0 ? "rest" : "drawer " + (drawers[a].i + 1) + "·" + (ROWS - drawers[a].j);
    B.wake();
  }

  for (const d of drawers) draw(d, d.target);
  drawers[MARK].pull.classList.add("hi");
  bag.add(pointer(stage, { move: (p) => setActive(hit(p)), leave: () => setActive(-1) }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { stag = v; },
    destroy: bag.dispose,
  };
}
