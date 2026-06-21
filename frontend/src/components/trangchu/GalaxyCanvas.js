"use client";
import { useEffect, useRef } from "react";

/*
  HUD Galaxy Canvas — scrollable absolute background page layout
  v4:
    • Absolute positioning with canvas spanning the full document scroll height
    • Galaxy 1 (cyan/blue HUD) positioned at page top (~15% absolute height)
    • Galaxy 2 (purple/violet HUD) positioned at the absolute bottom (docH - 450px)
    • Denser star field (600+ stars) and constellation lines stretching from top to bottom
    • Seamless vertical color gradient from cyan (top) to purple (bottom) for stars and lines
    • Dynamically updates canvas height if the document content height changes
*/
export default function GalaxyCanvas() {
  const canvasRef = useRef(null);
  const rafRef    = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");

    let lastDocH = 0;

    // ── Resize canvas to match full document height ──────────────
    function resize() {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const docH = document.documentElement.scrollHeight || document.body.scrollHeight || window.innerHeight;
      lastDocH = docH;
      canvas.width  = window.innerWidth  * dpr;
      canvas.height = docH * dpr;
      canvas.style.width  = window.innerWidth  + "px";
      canvas.style.height = docH + "px";
      ctx.scale(dpr, dpr);
    }
    resize();
    window.addEventListener("resize", resize);

    // ── Deterministic PRNG ──────────────────────────────────────
    let seed = 77;
    const rand  = () => { seed = (seed * 1664525 + 1013904223) & 0x7fffffff; return seed / 0x7fffffff; };
    const rr    = (a, b) => a + rand() * (b - a);
    const gauss = () => Math.sqrt(-2 * Math.log(rand() + 1e-9)) * Math.cos(2 * Math.PI * rand());

    const W = () => parseInt(canvas.style.width)  || window.innerWidth;
    const H = () => parseInt(canvas.style.height) || window.innerHeight;

    // ────────────────────────────────────────────────────────────
    // GALAXY 1 — Cyan/Blue HUD (page top)
    // ────────────────────────────────────────────────────────────
    const G1_CX = () => W() * 0.62;

    const G1_ARM_N = 1800;
    const G1_ARMS  = 4;
    const G1_WIND  = 3.6;
    const g1Arm = [];
    for (let arm = 0; arm < G1_ARMS; arm++) {
      const offset = (arm / G1_ARMS) * Math.PI * 2;
      const n = Math.floor(G1_ARM_N / G1_ARMS);
      for (let i = 0; i < n; i++) {
        const t     = i / n;
        const r     = t;
        const angle = offset + G1_WIND * t + gauss() * 0.22 * (1 + t);
        const sct   = rr(0, 0.05 * (0.3 + t));
        g1Arm.push({
          rfrac: r + gauss() * sct,
          angle: angle + gauss() * sct,
          size:  rr(0.35, 2.0),
          alpha: rr(0.15, 0.95) * (1 - t * 0.45),
          cyan:  t < 0.5 ? 1 : 1 - (t - 0.5) * 1.5,
        });
      }
    }

    const g1Rings = [
      { rf: 0.28, dash: [12, 6],  ticks: 24, alpha: 0.55, lw: 1.8, label: "ORB-1" },
      { rf: 0.46, dash: [20, 8],  ticks: 36, alpha: 0.40, lw: 1.4, label: "ORB-2" },
      { rf: 0.64, dash: [8,  10], ticks: 48, alpha: 0.28, lw: 1.1, label: "ORB-3" },
      { rf: 0.80, dash: [4,  14], ticks: 60, alpha: 0.18, lw: 0.9, label: "ORB-4" },
      { rf: 0.98, dash: [2,  18], ticks: 72, alpha: 0.11, lw: 0.7, label: "ORB-5" },
    ];
    // Base radius fits the viewport size
    const G1_BASE = () => Math.min(window.innerWidth, window.innerHeight) * 0.52;

    const g1Labels = [
      { ring: 0, angle: 0.3,  text: "42.3 ly"     },
      { ring: 1, angle: 1.8,  text: "NGC-4321"     },
      { ring: 2, angle: 3.5,  text: "v: 220 km/s"  },
      { ring: 3, angle: 5.1,  text: "M: 1.5×10¹¹"  },
      { ring: 0, angle: 4.2,  text: "CORE"          },
    ];

    const NUM_RADIAL = 12;
    const g1GridAngles = Array.from({length: NUM_RADIAL}, (_, i) => (i / NUM_RADIAL) * Math.PI * 2);

    // ────────────────────────────────────────────────────────────
    // GALAXY 2 — Purple/Violet (page bottom)
    // ────────────────────────────────────────────────────────────
    const G2_CX = () => W() * 0.28;

    const G2_ARM_N = 1400;
    const G2_ARMS  = 3;
    const G2_WIND  = 3.2;
    const G2_BASE  = () => Math.min(window.innerWidth, window.innerHeight) * 0.38;

    const g2Arm = [];
    for (let arm = 0; arm < G2_ARMS; arm++) {
      const offset = (arm / G2_ARMS) * Math.PI * 2 + 0.5;
      const n = Math.floor(G2_ARM_N / G2_ARMS);
      for (let i = 0; i < n; i++) {
        const t     = i / n;
        const r     = t;
        const angle = offset + G2_WIND * t + gauss() * 0.25 * (1 + t);
        const sct   = rr(0, 0.055 * (0.3 + t));
        const purp  = t < 0.5 ? t * 2 : 1;
        g2Arm.push({
          rfrac: r + gauss() * sct,
          angle: angle + gauss() * sct,
          size:  rr(0.3, 1.8),
          alpha: rr(0.15, 0.90) * (1 - t * 0.5),
          purp,
        });
      }
    }

    const g2Rings = [
      { rf: 0.28, dash: [10, 7],  ticks: 20, alpha: 0.45, lw: 1.6 },
      { rf: 0.50, dash: [16, 9],  ticks: 32, alpha: 0.30, lw: 1.2 },
      { rf: 0.72, dash: [6,  12], ticks: 44, alpha: 0.18, lw: 0.9 },
      { rf: 0.90, dash: [3,  16], ticks: 56, alpha: 0.11, lw: 0.7 },
    ];

    const g2Labels = [
      { ring: 0, angle: 1.0,  text: "NEBULA-V"   },
      { ring: 1, angle: 2.8,  text: "λ: 656 nm"  },
      { ring: 2, angle: 4.6,  text: "d: 2.5 Mpc" },
    ];

    const G2_RADIAL = 10;
    const g2GridAngles = Array.from({length: G2_RADIAL}, (_, i) => (i / G2_RADIAL) * Math.PI * 2);

    // ────────────────────────────────────────────────────────────
    // DENSE STAR FIELD (600 stars)
    // ────────────────────────────────────────────────────────────
    const NUM_STARS = 600;
    const starData  = [];
    for (let i = 0; i < NUM_STARS; i++) {
      starData.push({
        fx: rand(),
        fy: rand(), // normalized Y relative to the entire document height
        r: rr(0.35, 2.4),
        bright: rr(0.25, 1.0),
        twinkle: rr(0, Math.PI * 2),
        twinkleSpeed: rr(0.4, 2.5),
      });
    }

    // ── Constellation edges ─────────────────────────────────────
    const CONN_DIST = 0.12;
    const edges = [];
    for (let i = 0; i < NUM_STARS; i++) {
      let links = 0;
      for (let j = i + 1; j < NUM_STARS && links < 3; j++) {
        const dx = starData[i].fx - starData[j].fx;
        const dy = starData[i].fy - starData[j].fy;
        if (Math.sqrt(dx*dx + dy*dy) < CONN_DIST && rand() < 0.07) {
          edges.push([i, j]);
          links++;
        }
      }
    }

    // ────────────────────────────────────────────────────────────
    // HEXAGON PARTICLES (scattered down the document)
    // ────────────────────────────────────────────────────────────
    const hexParticles = [];
    for (let i = 0; i < 22; i++) {
      hexParticles.push({
        fx: rand(),
        fy: rand(),
        size: rr(7, 30),
        alpha: rr(0.05, 0.20),
        rotSpeed: (rand() - 0.5) * 0.008,
        rot: rand() * Math.PI,
        floatPhase: rand() * Math.PI * 2,
        floatAmp: rr(6, 20),
        floatSpeed: rr(0.3, 0.7),
      });
    }

    let time    = 0;
    let ringRot = 0;

    // ────────────────────────────────────────────────────────────
    // DRAW LOOP
    // ────────────────────────────────────────────────────────────
    function draw() {
      const vw = W(), vh = H();
      time    += 0.016;
      ringRot += 0.0004;

      // Handle dynamic heights
      const docH = document.documentElement.scrollHeight || document.body.scrollHeight || window.innerHeight;
      if (docH !== lastDocH && Math.abs(docH - lastDocH) > 10) {
        resize();
      }

      ctx.clearRect(0, 0, vw, vh);

      // ── 1. Constellation lines with top-to-bottom gradient ───
      ctx.save();
      ctx.lineWidth = 0.5;
      for (const [i, j] of edges) {
        const ax = starData[i].fx * vw, ay = starData[i].fy * docH;
        const bx = starData[j].fx * vw, by = starData[j].fy * docH;

        const avgY = (starData[i].fy + starData[j].fy) / 2;
        const r = Math.floor(lerp(56, 168, avgY));
        const g = Math.floor(lerp(189, 85, avgY));
        const b = Math.floor(lerp(248, 247, avgY));

        const alpha = (0.04 + 0.03 * Math.sin(time * 0.3 + i * 0.2)).toFixed(3);
        ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
        ctx.beginPath(); ctx.moveTo(ax, ay); ctx.lineTo(bx, by); ctx.stroke();
      }
      ctx.restore();

      // ── 2. Stars with top-to-bottom gradient ─────────────────
      for (const s of starData) {
        const sx = s.fx * vw, sy = s.fy * docH;

        const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkle);
        const alpha   = s.bright * (0.35 + 0.65 * twinkle);

        // Linear interpolation from Cyan (56, 189, 248) to Purple (168, 85, 247)
        const r = Math.floor(lerp(56, 168, s.fy));
        const g = Math.floor(lerp(189, 85, s.fy));
        const b = Math.floor(lerp(248, 247, s.fy));

        ctx.save();
        ctx.fillStyle   = `rgba(${r},${g},${b},${alpha.toFixed(3)})`;
        ctx.shadowColor = `rgba(${r},${g},${b},0.45)`;
        ctx.shadowBlur  = s.r * 2.5;
        ctx.beginPath(); ctx.arc(sx, sy, s.r * (0.7 + 0.3 * twinkle), 0, Math.PI * 2); ctx.fill();
        ctx.restore();
      }

      // ── 3. Hexagons with top-to-bottom gradient ──────────────
      for (const h of hexParticles) {
        const hx = h.fx * vw;
        const hy = h.fy * docH + Math.sin(time * h.floatSpeed + h.floatPhase) * h.floatAmp;

        h.rot += h.rotSpeed;

        const r = Math.floor(lerp(0, 180, h.fy));
        const g = Math.floor(lerp(210, 80, h.fy));
        const b = Math.floor(lerp(255, 255, h.fy));

        ctx.save();
        ctx.translate(hx, hy); ctx.rotate(h.rot);
        ctx.strokeStyle = `rgba(${r},${g},${b},${h.alpha.toFixed(3)})`;
        ctx.lineWidth = 1;
        ctx.shadowColor = `rgba(${r},${g},${b},0.35)`; ctx.shadowBlur = h.size * 0.5;
        ctx.beginPath();
        for (let v = 0; v < 6; v++) {
          const ang = (v / 6) * Math.PI * 2 - Math.PI / 6;
          v === 0
            ? ctx.moveTo(Math.cos(ang) * h.size, Math.sin(ang) * h.size)
            : ctx.lineTo(Math.cos(ang) * h.size, Math.sin(ang) * h.size);
        }
        ctx.closePath(); ctx.stroke();
        ctx.restore();
      }

      // ══════════════════════════════════════════════════════════
      // GALAXY 1 — CYAN (page top)
      // ══════════════════════════════════════════════════════════
      const g1cx = G1_CX();
      const g1cy = Math.min(docH * 0.16, 420);
      const g1rb = G1_BASE();
      const g1r = g1rb * 0.88;

      // G1 radial grid
      ctx.save();
      for (const angle of g1GridAngles) {
        const a = angle + ringRot * 0.5;
        const ex = g1cx + Math.cos(a) * g1rb * 1.1;
        const ey = g1cy + Math.sin(a) * g1rb * 1.1;
        const grad = ctx.createLinearGradient(g1cx, g1cy, ex, ey);
        grad.addColorStop(0,   "rgba(0,212,255,0.0)");
        grad.addColorStop(0.25,"rgba(0,212,255,0.06)");
        grad.addColorStop(0.8, "rgba(0,212,255,0.03)");
        grad.addColorStop(1,   "rgba(0,212,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 0.6;
        ctx.setLineDash([6, 12]);
        ctx.beginPath(); ctx.moveTo(g1cx, g1cy); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.restore();

      // G1 orbital rings
      drawHUDRings(ctx, g1cx, g1cy, g1rb, g1Rings, ringRot, "0,212,255");

      // G1 spiral arm particles
      ctx.save();
      for (const p of g1Arm) {
        const px = g1cx + Math.cos(p.angle + ringRot) * p.rfrac * g1r;
        const py = g1cy + Math.sin(p.angle + ringRot) * p.rfrac * g1r * 0.78;
        const c  = p.cyan;
        const rr2 = Math.floor(lerp(20, 200, c));
        const gg  = Math.floor(lerp(140, 230, c));
        const bb  = Math.floor(lerp(200, 255, c));
        ctx.fillStyle = `rgba(${rr2},${gg},${bb},${p.alpha.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // G1 core glow
      drawCoreGlow(ctx, g1cx, g1cy, g1rb, "cyan", time);
      drawHUDSpikes(ctx, g1cx, g1cy, g1rb * 0.22, time, "0,220,255");

      // G1 labels
      ctx.save(); ctx.font = "10px 'Courier New', monospace"; ctx.textBaseline = "middle";
      for (const lbl of g1Labels) {
        const ring = g1Rings[lbl.ring];
        const r    = g1rb * ring.rf;
        const ang  = lbl.angle + ringRot * (lbl.ring % 2 === 0 ? 1 : -1);
        ctx.fillStyle = `rgba(0,220,255,${(ring.alpha * 2.2).toFixed(3)})`;
        ctx.fillText(lbl.text, g1cx + Math.cos(ang) * r + 8, g1cy + Math.sin(ang) * r * 0.78);
      }
      ctx.restore();

      // ══════════════════════════════════════════════════════════
      // GALAXY 2 — PURPLE/VIOLET (page bottom)
      // ══════════════════════════════════════════════════════════
      const g2cx = G2_CX();
      const g2cy = docH - 450;
      const g2rb = G2_BASE();
      const g2r = g2rb * 0.88;

      // G2 radial grid (purple)
      ctx.save();
      for (const angle of g2GridAngles) {
        const a = angle - ringRot * 0.4;
        const ex = g2cx + Math.cos(a) * g2rb * 1.1;
        const ey = g2cy + Math.sin(a) * g2rb * 1.1;
        const grad = ctx.createLinearGradient(g2cx, g2cy, ex, ey);
        grad.addColorStop(0,   "rgba(160,60,255,0.0)");
        grad.addColorStop(0.25,"rgba(160,60,255,0.06)");
        grad.addColorStop(0.8, "rgba(160,60,255,0.03)");
        grad.addColorStop(1,   "rgba(160,60,255,0)");
        ctx.strokeStyle = grad; ctx.lineWidth = 0.55;
        ctx.setLineDash([5, 13]);
        ctx.beginPath(); ctx.moveTo(g2cx, g2cy); ctx.lineTo(ex, ey); ctx.stroke();
      }
      ctx.setLineDash([]); ctx.restore();

      // G2 orbital rings (purple)
      drawHUDRings(ctx, g2cx, g2cy, g2rb, g2Rings, -ringRot, "180,80,255");

      // G2 spiral arm particles (purple gradient)
      ctx.save();
      for (const p of g2Arm) {
        const px = g2cx + Math.cos(p.angle - ringRot * 0.7) * p.rfrac * g2r;
        const py = g2cy + Math.sin(p.angle - ringRot * 0.7) * p.rfrac * g2r * 0.78;
        const pr  = Math.floor(lerp(80, 255, p.purp));
        const pg2 = Math.floor(lerp(20, 60, p.purp));
        const pb  = Math.floor(lerp(200, 180, p.purp));
        ctx.fillStyle = `rgba(${pr},${pg2},${pb},${p.alpha.toFixed(2)})`;
        ctx.beginPath(); ctx.arc(px, py, p.size, 0, Math.PI * 2); ctx.fill();
      }
      ctx.restore();

      // G2 core glow (purple)
      drawCoreGlow(ctx, g2cx, g2cy, g2rb, "purple", time);
      drawHUDSpikes(ctx, g2cx, g2cy, g2rb * 0.22, time + 1.5, "200,80,255");

      // G2 labels
      ctx.save(); ctx.font = "10px 'Courier New', monospace"; ctx.textBaseline = "middle";
      for (const lbl of g2Labels) {
        const ring = g2Rings[lbl.ring];
        const r    = g2rb * ring.rf;
        const ang  = lbl.angle - ringRot * (lbl.ring % 2 === 0 ? 0.8 : -0.8);
        ctx.fillStyle = `rgba(200,100,255,${(ring.alpha * 2.5).toFixed(3)})`;
        ctx.fillText(lbl.text, g2cx + Math.cos(ang) * r + 8, g2cy + Math.sin(ang) * r * 0.78);
      }
      ctx.restore();

      rafRef.current = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        zIndex: 0,
        pointerEvents: "none",
        opacity: 0.93,
      }}
    />
  );
}

// ── Shared helpers ─────────────────────────────────────────────────
function lerp(a, b, t) { return a + (b - a) * Math.max(0, Math.min(1, t)); }

function drawHUDRings(ctx, cx, cy, rb, rings, rot, rgb) {
  for (let ri = 0; ri < rings.length; ri++) {
    const ring = rings[ri];
    const r    = rb * ring.rf;
    const rr   = rot * (ri % 2 === 0 ? 1 : -1) * (1 + ri * 0.3);

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(rr);
    ctx.strokeStyle = `rgba(${rgb},${ring.alpha})`;
    ctx.lineWidth   = ring.lw;
    ctx.setLineDash(ring.dash);
    ctx.beginPath();
    ctx.ellipse(0, 0, r, r * 0.78, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);

    // ticks
    for (let t = 0; t < ring.ticks; t++) {
      const ang = (t / ring.ticks) * Math.PI * 2;
      const tl  = t % 4 === 0 ? 10 : t % 2 === 0 ? 6 : 3;
      ctx.strokeStyle = `rgba(${rgb},${Math.min(1, ring.alpha * 1.4).toFixed(3)})`;
      ctx.lineWidth   = t % 4 === 0 ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(Math.cos(ang) * (r - tl), Math.sin(ang) * (r - tl) * 0.78);
      ctx.lineTo(Math.cos(ang) * r,        Math.sin(ang) * r * 0.78);
      ctx.stroke();
    }

    // direction arrows
    for (let a = 0; a < 4; a++) {
      const ang = (a / 4) * Math.PI * 2 + 0.3;
      const px  = Math.cos(ang) * r;
      const py  = Math.sin(ang) * r * 0.78;
      const al  = ring.rf < 0.5 ? 9 : 6;
      ctx.save();
      ctx.translate(px, py); ctx.rotate(ang + Math.PI / 2);
      ctx.fillStyle = `rgba(${rgb},${Math.min(1, ring.alpha * 1.8).toFixed(3)})`;
      ctx.beginPath();
      ctx.moveTo(0, -al); ctx.lineTo(al * 0.4, al * 0.4);
      ctx.lineTo(-al * 0.4, al * 0.4); ctx.closePath(); ctx.fill();
      ctx.restore();
    }
    ctx.restore();
  }
}

function drawCoreGlow(ctx, cx, cy, rb, palette, time) {
  const pulse = 1 + 0.05 * Math.sin(time * (palette === "cyan" ? 1.8 : 1.3));

  if (palette === "cyan") {
    const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.36 * pulse);
    outer.addColorStop(0,   "rgba(0,200,255,0.18)"); outer.addColorStop(0.4, "rgba(0,120,200,0.07)"); outer.addColorStop(1, "rgba(0,0,80,0)");
    ctx.fillStyle = outer; ctx.beginPath(); ctx.ellipse(cx, cy, rb * 0.36 * pulse, rb * 0.28 * pulse, 0, 0, Math.PI * 2); ctx.fill();

    const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.13);
    mid.addColorStop(0, "rgba(140,240,255,0.70)"); mid.addColorStop(0.4, "rgba(0,180,255,0.28)"); mid.addColorStop(1, "rgba(0,80,200,0)");
    ctx.fillStyle = mid; ctx.beginPath(); ctx.ellipse(cx, cy, rb * 0.13, rb * 0.10, 0, 0, Math.PI * 2); ctx.fill();

    const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.045);
    inner.addColorStop(0, "rgba(255,255,255,1)"); inner.addColorStop(0.45, "rgba(180,240,255,0.8)"); inner.addColorStop(1, "rgba(0,200,255,0)");
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(cx, cy, rb * 0.045, 0, Math.PI * 2); ctx.fill();

    ctx.save(); ctx.shadowColor = "rgba(160,240,255,1)"; ctx.shadowBlur = 28;
    ctx.fillStyle = "rgba(255,255,255,1)"; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();

  } else { // purple
    const outer = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.36 * pulse);
    outer.addColorStop(0,   "rgba(160,60,255,0.18)"); outer.addColorStop(0.4, "rgba(100,20,200,0.07)"); outer.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = outer; ctx.beginPath(); ctx.ellipse(cx, cy, rb * 0.36 * pulse, rb * 0.28 * pulse, 0, 0, Math.PI * 2); ctx.fill();

    const mid = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.13);
    mid.addColorStop(0, "rgba(220,140,255,0.70)"); mid.addColorStop(0.4, "rgba(160,60,255,0.28)"); mid.addColorStop(1, "rgba(80,0,200,0)");
    ctx.fillStyle = mid; ctx.beginPath(); ctx.ellipse(cx, cy, rb * 0.13, rb * 0.10, 0, 0, Math.PI * 2); ctx.fill();

    const inner = ctx.createRadialGradient(cx, cy, 0, cx, cy, rb * 0.045);
    inner.addColorStop(0, "rgba(255,255,255,1)"); inner.addColorStop(0.45, "rgba(230,180,255,0.8)"); inner.addColorStop(1, "rgba(160,60,255,0)");
    ctx.fillStyle = inner; ctx.beginPath(); ctx.arc(cx, cy, rb * 0.045, 0, Math.PI * 2); ctx.fill();

    ctx.save(); ctx.shadowColor = "rgba(220,140,255,1)"; ctx.shadowBlur = 28;
    ctx.fillStyle = "rgba(255,255,255,1)"; ctx.beginPath(); ctx.arc(cx, cy, 2.5, 0, Math.PI * 2); ctx.fill(); ctx.restore();
  }
}

function drawHUDSpikes(ctx, cx, cy, len, time, rgb) {
  const pulse = 0.6 + 0.4 * Math.sin(time * 1.2);
  const L     = len * pulse;
  const spikes = [
    { ax: -L,        ay: 0,        bx: L,         by: 0       },
    { ax: 0,         ay: -L * 0.6, bx: 0,         by: L * 0.6 },
    { ax: -L * 0.65, ay: -L * 0.5, bx: L * 0.65,  by: L * 0.5 },
    { ax: L * 0.65,  ay: -L * 0.5, bx: -L * 0.65, by: L * 0.5 },
  ];
  ctx.save(); ctx.globalCompositeOperation = "screen";
  for (const sp of spikes) {
    const g = ctx.createLinearGradient(cx + sp.ax, cy + sp.ay, cx + sp.bx, cy + sp.by);
    g.addColorStop(0,    `rgba(${rgb},0)`);
    g.addColorStop(0.42, `rgba(${rgb},0)`);
    g.addColorStop(0.5,  `rgba(255,255,255,0.75)`);
    g.addColorStop(0.58, `rgba(${rgb},0)`);
    g.addColorStop(1,    `rgba(${rgb},0)`);
    ctx.strokeStyle = g; ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(cx + sp.ax, cy + sp.ay); ctx.lineTo(cx + sp.bx, cy + sp.by); ctx.stroke();
  }
  ctx.restore();
}
