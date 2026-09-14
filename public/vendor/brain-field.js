// <brain-field> — ambient particle brain. Triangular glyphs sampled inside a
// brain silhouette, given volume and a slow oscillating rotation. Not scroll-tied.
(function () {
  const PALETTES = {
    neon: ["#8052ff", "#ffb829", "#15846e", "#a98bff", "#5b7cff", "#ff6fd8"],
    ink: ["#4a2ba8", "#8a5a00", "#0d5244", "#5b3fb0", "#2c3f8f", "#7a3560"],
    steel: ["#345984", "#44668b", "#546171", "#7e93aa", "#242d38", "#889cb0"]
  };
  // Brain silhouette as a union of ellipses in normalized space (x right, y up).
  const LOBES = [
    [-0.62, 0.10, 0.34, 0.30],   // frontal lobe
    [-0.26, 0.28, 0.38, 0.30],   // superior frontal
    [0.10, 0.30, 0.40, 0.29],    // parietal crown
    [0.48, 0.16, 0.34, 0.28],    // occipital
    [-0.02, 0.02, 0.62, 0.30],   // central mass
    [-0.34, -0.24, 0.34, 0.20],  // temporal lobe
    [0.06, -0.22, 0.30, 0.18],   // temporal continuation
    [0.52, -0.26, 0.22, 0.17],   // cerebellum
    [0.30, -0.46, 0.10, 0.20]    // brainstem
  ];
  // Lateral fissure and the notch under the cerebellum, carved back out.
  const CARVE = [
    [-0.16, -0.13, 0.30, 0.055],
    [0.30, -0.14, 0.16, 0.05]
  ];

  function field(x, y) {
    let best = -1;
    for (let i = 0; i < LOBES.length; i++) {
      const l = LOBES[i];
      const dx = (x - l[0]) / l[2], dy = (y - l[1]) / l[3];
      const v = 1 - Math.sqrt(dx * dx + dy * dy);
      if (v > best) best = v;
    }
    if (best <= 0) return best;
    for (let i = 0; i < CARVE.length; i++) {
      const c = CARVE[i];
      const dx = (x - c[0]) / c[2], dy = (y - c[1]) / c[3];
      if (dx * dx + dy * dy < 1) return -1;
    }
    return best;
  }

  class BrainField extends HTMLElement {
    connectedCallback() {
      if (this._built) return;
      this._built = true;
      this.style.display = "block";
      this.style.position = "relative";
      if (!this.style.height) this.style.height = "100%";
      /* Two modes.

         On a pointer device the canvas is fixed to the viewport, so the field can
         drift outside its own box and lean with the scroll — the designed look.

         On a touch device that same arrangement is what makes the animation feel
         like it cannot keep up: a viewport-fixed layer is repainted through every
         frame of a momentum scroll, and the scroll lean is deliberately eased
         behind the real scroll position, which on a fast flick reads as lag.
         So there the canvas is absolutely positioned inside the host and ignores
         both scroll and pointer. The browser then just moves the layer with the
         page — nothing to repaint, nothing to fall behind. */
      this.ambientOnly =
        window.matchMedia("(hover: none), (pointer: coarse), (max-width: 720px)").matches;

      this.canvas = document.createElement("canvas");
      this.canvas.style.cssText = this.ambientOnly
        ? "display:block;position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:0;will-change:transform;transform:translateZ(0)"
        : "display:block;position:fixed;inset:0;width:100vw;height:100vh;pointer-events:none;z-index:0";
      this.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this.mouse = { x: 0, y: 0 };
      this.ptr = { x: -1e5, y: -1e5, vx: 0, vy: 0, live: false };
      this.scatter = 0;
      this.scroll = 0;
      this.scrollEased = 0;
      this.reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      /* Reading the host's box here would force a layout on every scroll event.
         The host never moves relative to the document, so its offset is measured
         once in resize() and scrollY — which costs nothing — does the rest. */
      this._onScroll = () => {
        const vh = window.innerHeight || 1;
        const top = (this._docTop || 0) - window.scrollY;
        // 0 when the field's top hits the viewport top, 1 once it has scrolled a viewport past.
        this.scroll = Math.max(-1, Math.min(1, -top / vh));
      };
      if (!this.ambientOnly) {
        this._onScroll();
        window.addEventListener("scroll", this._onScroll, { passive: true });
      }

      this._onMove = (e) => {
        const r = this.getBoundingClientRect();
        if (!r.width || !r.height) return;
        this.mouse.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        this.mouse.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        const px = e.clientX, py = e.clientY;
        const prev = this.ptr;
        this.ptr = {
          x: px, y: py,
          vx: prev ? px - prev.x : 0,
          vy: prev ? py - prev.y : 0,
          live: true
        };
        this._ptrSeen = performance.now();
      };
      if (!this.ambientOnly) window.addEventListener("pointermove", this._onMove, { passive: true });
      this._onResizeWin = () => this.resize();
      window.addEventListener("resize", this._onResizeWin);

      this._ro = new ResizeObserver(() => this.resize());
      this._ro.observe(this);

      /* Stop drawing once the field has scrolled away. It was animating the whole
         way down the page before — invisible work competing with the scroll for
         the main thread, and on a phone, with the battery. */
      this._io = new IntersectionObserver(
        ([entry]) => {
          this.onScreen = entry.isIntersecting;
          if (this.onScreen) this.start();
          else this.stop();
        },
        { rootMargin: "120px" }
      );
      this._io.observe(this);
      /* The cached document offset goes stale if anything above the field reflows.
         The host's own size often does not change when that happens, so the
         observer above would not fire — these are the two moments it matters. */
      window.addEventListener("load", this._onResizeWin);
      if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(() => this.resize()).catch(() => {});
      }
      this.seed();
      this.resize();
      this.start();
    }

    disconnectedCallback() {
      window.removeEventListener("pointermove", this._onMove);
      window.removeEventListener("resize", this._onResizeWin);
      window.removeEventListener("load", this._onResizeWin);
      window.removeEventListener("scroll", this._onScroll);
      if (this._ro) this._ro.disconnect();
      if (this._io) this._io.disconnect();
      this.stop();
    }

    /* These read from attributes, so they need setters that write back to them.
       Without one, any framework that assigns the property rather than the
       attribute — React 19 does, whenever the name exists on the element —
       throws on a getter-only accessor, and the attribute is never set. */
    get palette() {
      return PALETTES[this.getAttribute("palette")] || PALETTES.neon;
    }

    set palette(value) {
      this.reflect("palette", value);
    }

    // Reflect a property onto its attribute, re-seeding if the field is already built.
    reflect(name, value) {
      const next = value == null ? "" : String(value);
      if (this.getAttribute(name) === next) return;
      this.setAttribute(name, next);
      if (this._built) {
        this.seed();
        this.resize();
      }
    }

    get wireColor() {
      return this.getAttribute("palette") === "neon" ? "#a98bff" : "#64798f";
    }

    get hotColor() {
      return this.getAttribute("wire-hot") || (this.getAttribute("palette") === "neon" ? "#ffb829" : "#345984");
    }

    get count() {
      const n = parseInt(this.getAttribute("count") || "", 10);
      const asked = Number.isFinite(n) ? Math.max(200, Math.min(4000, n)) : 1900;
      /* Every node costs two passes a frame plus its share of the wiring. A phone
         renders the same silhouette from far fewer of them, and the budget it has
         is better spent holding 60fps. */
      return this.ambientOnly ? Math.round(asked * 0.4) : asked;
    }

    set count(value) {
      this.reflect("count", value);
    }

    seed() {
      const target = this.count;
      const pal = this.palette;
      const pts = [];
      let guard = 0;
      while (pts.length < target && guard < target * 260) {
        guard++;
        const x = Math.random() * 2.1 - 1.05;
        const y = Math.random() * 1.7 - 0.85;
        const f = field(x, y);
        if (f <= 0) continue;
        // Shell weighting: dense near the surface, sparse scatter inside.
        const keep = Math.exp(-f * 3.4) * 0.92 + 0.08;
        if (Math.random() > keep) continue;
        const thickness = 0.58 * Math.sqrt(Math.max(f, 0.02));
        pts.push({
          x, y,
          z: (Math.random() * 2 - 1) * thickness,
          size: 1.3 + Math.random() * 2.1,
          color: pal[(Math.random() * pal.length) | 0],
          spin: Math.random() * Math.PI * 2,
          spinRate: (Math.random() - 0.5) * 0.5,
          ox: 0, oy: 0, vx: 0, vy: 0, spinV: 0,
          phase: Math.random() * Math.PI * 2,
          drift: 0.006 + Math.random() * 0.014
        });
      }
      this.points = pts;
      this.buildLinks();

      const ambientCount = Math.round(target * 0.13);
      this.ambient = Array.from({ length: ambientCount }, () => ({
        x: Math.random() * 2.4 - 1.2,
        y: Math.random() * 2.2 - 1.1,
        size: 1.1 + Math.random() * 1.6,
        color: pal[(Math.random() * pal.length) | 0],
        spin: Math.random() * Math.PI * 2,
        spinRate: (Math.random() - 0.5) * 0.3,
        phase: Math.random() * Math.PI * 2,
        drift: 0.01 + Math.random() * 0.02,
        alpha: 0.12 + Math.random() * 0.2
      }));
    }

    // Nearest-neighbour synapses via a coarse spatial hash, plus travelling pulses.
    buildLinks() {
      const pts = this.points;
      const cell = 0.12;
      const key = (a, b, c) => a + "|" + b + "|" + c;
      const grid = new Map();
      pts.forEach((p, i) => {
        const k = key(Math.round(p.x / cell), Math.round(p.y / cell), Math.round(p.z / cell));
        let bucket = grid.get(k);
        if (!bucket) { bucket = []; grid.set(k, bucket); }
        bucket.push(i);
      });
      const links = [];
      const maxLinks = Math.min(pts.length, 1500);
      for (let i = 0; i < pts.length && links.length < maxLinks; i++) {
        const p = pts[i];
        const gx = Math.round(p.x / cell), gy = Math.round(p.y / cell), gz = Math.round(p.z / cell);
        let best = -1, bestD = Infinity;
        for (let dx = -1; dx <= 1; dx++) {
          for (let dy = -1; dy <= 1; dy++) {
            for (let dz = -1; dz <= 1; dz++) {
              const bucket = grid.get(key(gx + dx, gy + dy, gz + dz));
              if (!bucket) continue;
              for (const j of bucket) {
                if (j <= i) continue;
                const q = pts[j];
                const d = (p.x - q.x) ** 2 + (p.y - q.y) ** 2 + (p.z - q.z) ** 2;
                if (d < bestD) { bestD = d; best = j; }
              }
            }
          }
        }
        if (best >= 0 && bestD < cell * cell * 4) links.push([i, best]);
      }
      this.links = links;

      const pulseCount = Math.max(14, Math.round(links.length * 0.075));
      this.pulses = Array.from({ length: pulseCount }, () => ({
        link: (Math.random() * links.length) | 0,
        t: Math.random(),
        speed: 0.35 + Math.random() * 0.75,
        hot: Math.random() < 0.3
      }));
    }

    resize() {
      const r = this.getBoundingClientRect();
      if (!r.width || !r.height) return;
      // Where the host sits in the document, so draw() never has to read layout.
      this._docTop = r.top + window.scrollY;
      this._docLeft = r.left + window.scrollX;
      // A fixed canvas has to cover the viewport; a host-local one only its box.
      const vw = this.ambientOnly ? r.width : window.innerWidth;
      const vh = this.ambientOnly ? r.height : window.innerHeight;
      /* Past ~1.5x the extra pixels buy nothing on a phone and cost fill rate on
         every frame, which is exactly what a mid-range device runs out of. */
      const dpr = Math.min(window.devicePixelRatio || 1, this.ambientOnly ? 1.5 : 2);
      this.canvas.width = Math.round(vw * dpr);
      this.canvas.height = Math.round(vh * dpr);
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this.w = vw;
      this.h = vh;
      this.hostW = r.width;
      this.hostH = r.height;
      const fill = parseFloat(this.getAttribute("fill") || "");
      /* fill > 1 deliberately draws wider than the box, which the viewport-fixed
         canvas is happy to do. A host-sized one would just crop it, so there the
         field is scaled to fit instead. */
      const asked = Number.isFinite(fill) ? fill : 1;
      const f = this.ambientOnly ? Math.min(asked, 1) : asked;
      // 2.28 x-extent and 1.72 y-extent cover the widest silhouette plus the ambient ring.
      this.scale = Math.min(r.width / (2.28 / f), r.height / (1.72 / f));
      if (this.reduced) this.draw(0);
    }

    start() {
      if (this.reduced) { this.draw(0); return; }
      if (this._raf) return;
      // Keep the clock across pauses so the brain does not jump on re-entry.
      const t0 = performance.now() - (this._elapsed || 0) * 1000;
      const loop = (now) => {
        this._elapsed = (now - t0) / 1000;
        this.draw(this._elapsed);
        this._raf = requestAnimationFrame(loop);
      };
      this._raf = requestAnimationFrame(loop);
    }

    stop() {
      if (this._raf) cancelAnimationFrame(this._raf);
      this._raf = null;
    }

    tri(path, cx, cy, r, spin) {
      for (let i = 0; i < 3; i++) {
        const a = spin + (i * Math.PI * 2) / 3;
        const px = cx + Math.cos(a) * r, py = cy + Math.sin(a) * r;
        if (i === 0) path.moveTo(px, py); else path.lineTo(px, py);
      }
      path.closePath();
    }

    draw(t) {
      const ctx = this.ctx;
      if (!ctx || !this.w) return;
      ctx.clearRect(0, 0, this.w, this.h);
      this.scrollEased += (this.scroll - this.scrollEased) * 0.08;
      const sc = this.ambientOnly ? 0 : this.scrollEased;

      /* Never read layout here — this runs every frame, and getBoundingClientRect
         forces the browser to flush pending layout each time, which is what made
         scrolling stutter. The host's document offset is cached by resize(), and
         a ResizeObserver keeps it current. */
      const host = this.ambientOnly
        ? { left: 0, top: 0, width: this.hostW, height: this.hostH }
        : {
            left: (this._docLeft || 0) - window.scrollX,
            top: (this._docTop || 0) - window.scrollY,
            width: this.hostW,
            height: this.hostH
          };
      const cx = host.left + host.width / 2;
      const cy = host.top + host.height / 2 + sc * host.height * 0.16;
      const s = this.scale * (1 + sc * 0.06);

      const mx = this.mouse.x * 0.05, my = this.mouse.y * 0.035;
      const ang = Math.sin(t * 0.085) * 0.34 + mx + sc * 0.62;
      const tilt = Math.sin(t * 0.061) * 0.07 + my + sc * 0.12;
      const ca = Math.cos(ang), sa = Math.sin(ang);
      const camera = 3.3;

      const byColor = new Map();
      const pen = (color) => {
        let g = byColor.get(color);
        if (!g) { g = []; byColor.set(color, g); }
        return g;
      };

      // Ambient drifting glyphs behind the mass.
      const amb = new Map();
      for (const p of this.ambient) {
        const px = cx + p.x * s * 1.06 + Math.sin(t * p.drift * 6 + p.phase) * 10;
        const py = cy - (p.y * s * 1.06 + Math.cos(t * p.drift * 5 + p.phase) * 10);
        let g = amb.get(p.color);
        if (!g) { g = []; amb.set(p.color, g); }
        g.push([px, py, p.size, p.spin + t * p.spinRate, p.alpha]);
      }
      for (const [color, list] of amb) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (const [px, py, r, spin, alpha] of list) {
          ctx.globalAlpha = alpha;
          const path = new Path2D();
          this.tri(path, px, py, r, spin);
          ctx.stroke(path);
        }
      }
      ctx.globalAlpha = 1;

      // Thinking wave: a plane of activation sweeping the mass, lighting nodes as it passes.
      const wavePhase = (t * 0.26) % 2.6 - 1.3;
      const waveDir = Math.sin(t * 0.043);

      // Brain mass: rotate around the vertical axis and project.
      for (const p of this.points) {
        const breathe = Math.sin(t * p.drift * 5 + p.phase) * 0.012;
        const x = p.x + breathe, y = p.y + breathe * 0.6;
        const xr = x * ca + p.z * sa;
        const zr = -x * sa + p.z * ca;
        const yr = y + zr * tilt;
        const k = camera / (camera - zr);
        p._px = cx + xr * s * k;
        p._py = cy - yr * s * k;
        p._r = p.size * k;
        const depth = (zr + 0.6) / 1.2;
        p._a = 0.3 + Math.max(0, Math.min(1, depth)) * 0.7;
        p._home = 0;
        p._hx = p._px;
        p._hy = p._py;
        // Activation from the sweeping wave, measured along a slowly turning axis.
        const along = p.x * (1 - Math.abs(waveDir)) + p.y * waveDir;
        const d = Math.abs(along - wavePhase);
        p._lit = d < 0.16 ? Math.pow(1 - d / 0.16, 2) : 0;
      }

      // Pointer impulse + momentum: nodes near the cursor are kicked away with the
      // cursor's own velocity, fly free across the viewport, then spring home.
      const ptr = this.ptr;
      const live =
        !this.ambientOnly && ptr.live && performance.now() - (this._ptrSeen || 0) < 2200;
      const dt = Math.min(0.05, Math.max(0.001, t - (this._lastT || t)));
      this._lastT = t;
      const radius = Math.min(host.width, host.height) * 0.34;
      const speed = live ? Math.min(60, Math.hypot(ptr.vx, ptr.vy)) : 0;
      let maxDisp = 0;

      for (const p of this.points) {
        if (live) {
          const dx = p._hx + p.ox - ptr.x;
          const dy = p._hy + p.oy - ptr.y;
          const d = Math.hypot(dx, dy);
          if (d < radius && d > 0.001) {
            const fall = Math.pow(1 - d / radius, 2);
            const kick = fall * (140 + speed * 26);
            p.vx += (dx / d) * kick * dt;
            p.vy += (dy / d) * kick * dt;
            // The cursor drags them along its own path as well.
            p.vx += ptr.vx * fall * 5.5;
            p.vy += ptr.vy * fall * 5.5;
            p.spinV += (Math.random() - 0.5) * fall * 22;
          }
        }
        // Spring home, lightly damped so the return has drift rather than a snap.
        p.vx += -p.ox * 5.6 * dt;
        p.vy += -p.oy * 5.6 * dt;
        const damp = Math.pow(0.945, dt * 60);
        p.vx *= damp;
        p.vy *= damp;
        p.spinV *= Math.pow(0.93, dt * 60);
        p.ox += p.vx * dt;
        p.oy += p.vy * dt;
        const disp = Math.hypot(p.ox, p.oy);
        if (disp > maxDisp) maxDisp = disp;
        p._px = p._hx + p.ox;
        p._py = p._hy + p.oy;
        p._scat = Math.min(1, disp / 90);
        p._r *= 1 + p._scat * 0.45;
        p._a *= 1 - p._scat * 0.35;
      }
      this._disp = maxDisp;

      // Synapses: faint wiring between neighbouring nodes, brightening under the wave.
      const link = this.links || [];
      ctx.lineWidth = 1;
      for (let i = 0; i < link.length; i++) {
        const a = this.points[link[i][0]], b = this.points[link[i][1]];
        const al = Math.min(a._a, b._a);
        if (al < 0.34) continue;
        // Wiring snaps as the nodes are torn apart.
        const tear = Math.max(a._scat || 0, b._scat || 0);
        if (tear > 0.26) continue;
        const lit = Math.max(a._lit, b._lit);
        ctx.strokeStyle = lit > 0.05 ? this.hotColor : this.wireColor;
        ctx.globalAlpha = ((al - 0.34) * 0.3 + lit * 0.5) * (1 - tear * 3.4);
        ctx.beginPath();
        ctx.moveTo(a._px, a._py);
        ctx.lineTo(b._px, b._py);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;

      // Firing: packets running the wiring, brightest where the node is nearest.
      for (const pulse of this.pulses || []) {
        pulse.t += dt * pulse.speed;
        if (pulse.t > 1) {
          pulse.t = 0;
          pulse.link = (Math.random() * link.length) | 0;
          pulse.speed = 0.35 + Math.random() * 0.75;
          pulse.hot = Math.random() < 0.3;
        }
        const pair = link[pulse.link];
        if (!pair) continue;
        const a = this.points[pair[0]], b = this.points[pair[1]];
        const e = pulse.t * pulse.t * (3 - 2 * pulse.t);
        const px = a._px + (b._px - a._px) * e;
        const py = a._py + (b._py - a._py) * e;
        const depth = Math.min(a._a, b._a);
        const fade = Math.sin(pulse.t * Math.PI);
        const rad = (pulse.hot ? 3.4 : 2.2) * depth;
        const glow = ctx.createRadialGradient(px, py, 0, px, py, rad * 3.4);
        glow.addColorStop(0, this.hotColor);
        glow.addColorStop(1, "rgba(255,255,255,0)");
        ctx.globalAlpha = 0.5 * fade * depth;
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, rad * 3.4, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 0.95 * fade * depth;
        ctx.fillStyle = this.hotColor;
        ctx.beginPath();
        ctx.arc(px, py, rad * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalAlpha = 1;

      for (const p of this.points) {
        pen(p.color).push([p._px, p._py, p._r * (1 + p._lit * 0.7), p.spin + t * p.spinRate + (p._scat || 0) * 3.2, Math.min(1, p._a + p._lit * 0.5)]);
        if (p._lit > 0.25) {
          const rad = p._r * 5 * p._lit;
          const g = ctx.createRadialGradient(p._px, p._py, 0, p._px, p._py, rad);
          g.addColorStop(0, this.hotColor);
          g.addColorStop(1, "rgba(255,255,255,0)");
          ctx.globalAlpha = 0.4 * p._lit * p._a;
          ctx.fillStyle = g;
          ctx.beginPath();
          ctx.arc(p._px, p._py, rad, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      ctx.globalAlpha = 1;
      for (const [color, list] of byColor) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        for (const [px, py, r, spin, alpha] of list) {
          ctx.globalAlpha = alpha;
          const path = new Path2D();
          this.tri(path, px, py, r, spin);
          ctx.stroke(path);
        }
      }
      ctx.globalAlpha = 1;
    }
  }

  if (!window.customElements.get("brain-field")) {
    window.customElements.define("brain-field", BrainField);
  }
})();
