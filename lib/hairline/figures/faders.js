/**
 * Faders: a small mixer strip with four channel faders. The channel under the
 * pointer follows its height on a spring; the others settle back to their rest
 * levels, which are uneven on purpose so the still frame is a composition.
 * The most-raised fader's edge carries the bright mark at rest. The read-out
 * names the channel, `ch n`. The slider is the gain: how far the pointer's
 * height reaches up the slot.
 *
 * The pattern: a field with discrete zones. Position is continuous (a spring
 * per fader), the choice is which slot the pointer stands over, tested on
 * rest geometry so a sliding cap cannot flip it.
 *
 * Source: authored with hairline-create (faders.js at the repo root).
 */
import HL from "../kernel.js";

const {
  Cam, clamp, facing, fit, mk, pointer, poly, prism, proj, put, rings, rrect, ringAt,
  register, spring, stepS, solid, disposer, reflect, unproj,
} = HL;

const CH = 4;
const X0 = -58, X1 = 58, Y0 = -34, Y1 = 34, PT = 5;
const SLOT = 18, CW = 14, CD = 10, CH_Z = 5;
const CX = [-36, -12, 12, 36];
const REST = [-14, 2, 16, -8];
const MARK = 2;

export function mount({ stage, svg, read }, value) {
  const bag = disposer();
  let gain = value;

  const C = Cam(45, 0.5, 1.95);
  fit(C, [
    [X0, Y0, 0], [X1, Y1, 0], [X1, Y0, 0], [X0, Y1, 0],
    [X0, Y0, PT + CH_Z], [X1, Y1, PT + CH_Z],
  ], 200, 166);
  const P = proj(C), front = facing(C);

  const g = mk("g", {}, svg);
  const panel = rings(X0, Y0, X1, Y1, 7, 2);
  reflect(svg, g, P, front, panel[0], 0, 12);
  put(solid(g), prism(P, front, panel[0], panel[1], 0, PT));

  const strip = mk("g", {}, g);
  for (const cx of CX) {
    const slot = rrect(cx - 1.8, -SLOT - 3, cx + 1.8, SLOT + 3, 1.6, 4);
    mk("path", { d: poly(ringAt(P, slot, PT)), class: "nf lo" }, strip);
  }

  const faders = CX.map((cx, i) => {
    const grp = mk("g", {}, strip);
    return {
      i, cx, grp,
      sil: mk("path", { class: "sil" }, grp),
      cr: mk("path", { class: "nf lo" }, grp),
      y: spring(REST[i]),
      drawn: NaN,
    };
  });

  function draw(f, cy) {
    if (Math.abs(cy - f.drawn) < 0.05) return;
    f.drawn = cy;
    const [ring, inner] = rings(f.cx - CW / 2, cy - CD / 2, f.cx + CW / 2, cy + CD / 2, 1.8, 1);
    put({ sil: f.sil, cr: f.cr }, prism(P, front, ring, inner, PT, PT + CH_Z));
  }

  const B = register(stage, (dt) => {
    let moving = false;
    for (const f of faders) {
      if (stepS(f.y, dt)) moving = true;
      draw(f, f.y.x);
    }
    return moving;
  });
  bag.add(B.unregister);

  // Channel pick in world space on the panel's rest top: column by x, within
  // slot reach by y. A cap mid-slide never flips the choice.
  let act = -1;
  function move(pt) {
    const [wx, wy] = unproj(C, pt[0], pt[1], PT);
    let a = -1;
    if (wy > -SLOT - 10 && wy < SLOT + 10) {
      let bd = 11;
      for (const f of faders) {
        const q = Math.abs(wx - f.cx);
        if (q < bd) { bd = q; a = f.i; }
      }
    }
    if (a !== act) {
      act = a;
      for (const f of faders) f.sil.classList.toggle("hi", f.i === a);
      read.textContent = a < 0 ? "rest" : "ch " + (a + 1);
    }
    for (const f of faders) {
      if (f.i !== a) f.y.t = REST[f.i];
    }
    if (a >= 0) faders[a].y.t = clamp(wy * gain, -SLOT, SLOT);
    B.wake();
  }

  for (const f of faders) draw(f, REST[f.i]);
  faders[MARK].sil.classList.add("hi");
  bag.add(pointer(stage, {
    move,
    leave: () => {
      act = -1;
      for (const f of faders) { f.y.t = REST[f.i]; f.sil.classList.remove("hi"); }
      faders[MARK].sil.classList.add("hi");
      read.textContent = "rest";
      B.wake();
    },
  }));
  bag.add(() => svg.replaceChildren());

  return {
    set: (v) => { gain = v; },
    destroy: bag.dispose,
  };
}
