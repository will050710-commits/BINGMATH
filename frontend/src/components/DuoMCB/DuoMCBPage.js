"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBPage.module.css";
import Image from "next/image";
import { createSession, chat, generateVideo } from "./duoServer";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";

const isClient = typeof window !== "undefined";

function getDB() {
  if (!isClient) return Promise.resolve(null);
  return new Promise((resolve, reject) => {
    const request = window.indexedDB.open("duomcb_db", 1);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains("sessions")) {
        db.createObjectStore("sessions");
      }
    };
    request.onsuccess = (e) => resolve(e.target.result);
    request.onerror = (e) => reject(e.target.error);
  });
}

async function dbSet(key, value) {
  if (!isClient) return;
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.put(value, key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

async function dbGet(key) {
  if (!isClient) return null;
  const db = await getDB();
  if (!db) return null;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readonly");
    const store = tx.objectStore("sessions");
    const req = store.get(key);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function dbDelete(key) {
  if (!isClient) return;
  const db = await getDB();
  if (!db) return;
  return new Promise((resolve, reject) => {
    const tx = db.transaction("sessions", "readwrite");
    const store = tx.objectStore("sessions");
    const req = store.delete(key);
    req.onsuccess = () => resolve();
    req.onerror = () => reject(req.error);
  });
}

const SUGGESTED = [
  { icon: "📝", text: "Solve x² - 5x + 6 = 0 step by step" },
  { icon: "📊", text: "Explain mean, median and standard deviation" },
  { icon: "📐", text: "Give me bilingual exercises on trigonometry" },
  { icon: "🧪", text: "What is Newton's second law of motion?" },
];

const TOOLS = [
  { id: "hint",     icon: "💡", label: "Gợi Ý Socratic",     desc: "Hướng dẫn từng bước nhỏ" },
  { id: "solution", icon: "📖", label: "Giải Đầy Đủ",        desc: "Lời giải chi tiết hoàn chỉnh" },
  { id: "video",    icon: "🎬", label: "Tạo Video Giải",      desc: "Video hoạt hình giải bài" },
];

// ── LaTeX & Markdown Parser Helper Functions ──────────────────────────────
function parseMathAndText(text) {
  if (!text) return [];
  // Normalize escaped backslashes (e.g. \\frac -> \frac) which are common in JSON LLM outputs
  const cleanedText = text.replace(/\\\\/g, "\\");
  const tokens = [];
  let index = 0;
  
  while (index < cleanedText.length) {
    const nextBlock = cleanedText.indexOf("$$", index);
    const nextBlockBracket = cleanedText.indexOf("\\[", index);
    const nextInline = cleanedText.indexOf("$", index);
    const nextInlineParen = cleanedText.indexOf("\\(", index);
    
    const finders = [
      { type: "block_dollar", index: nextBlock, startLen: 2, endDelim: "$$" },
      { type: "block_bracket", index: nextBlockBracket, startLen: 2, endDelim: "\\]" },
      { type: "inline_dollar", index: nextInline, startLen: 1, endDelim: "$" },
      { type: "inline_paren", index: nextInlineParen, startLen: 2, endDelim: "\\)" }
    ].filter(f => f.index !== -1).sort((a, b) => a.index - b.index);
    
    if (finders.length === 0) {
      tokens.push({ type: "text", content: cleanedText.substring(index) });
      break;
    }
    
    const first = finders[0];
    
    if (first.index > index) {
      tokens.push({ type: "text", content: cleanedText.substring(index, first.index) });
    }
    
    const searchStart = first.index + first.startLen;
    const endIdx = cleanedText.indexOf(first.endDelim, searchStart);
    
    if (endIdx === -1) {
      tokens.push({ type: "text", content: cleanedText.substring(first.index) });
      break;
    }
    
    const mathContent = cleanedText.substring(searchStart, endIdx);
    const isBlock = first.type.startsWith("block");
    tokens.push({ type: "math", content: mathContent, isBlock });
    
    index = endIdx + first.endDelim.length;
  }
  
  return tokens;
}

function renderTextWithMarkdown(text, key, styles) {
  const lines = text.split("\n");
  return (
    <span key={key}>
      {lines.map((line, lineIdx) => {
        let content = line;
        let isHeader = false;
        let isBullet = false;
        
        if (content.startsWith("### ")) {
          content = content.replace("### ", "");
          isHeader = true;
        } else if (content.startsWith("## ")) {
          content = content.replace("## ", "");
          isHeader = true;
        } else if (content.startsWith("# ")) {
          content = content.replace("# ", "");
          isHeader = true;
        }
        
        if (content.trim().startsWith("- ")) {
          content = content.trim().replace("- ", "");
          isBullet = true;
        } else if (content.trim().startsWith("* ")) {
          content = content.trim().replace("* ", "");
          isBullet = true;
        }
        
        const boldRegex = /\*\*([\s\S]*?)\*\*/g;
        const parts = [];
        let lastIdx = 0;
        let match;
        
        while ((match = boldRegex.exec(content)) !== null) {
          if (match.index > lastIdx) {
            parts.push(content.substring(lastIdx, match.index));
          }
          parts.push(<strong key={match.index}>{match[1]}</strong>);
          lastIdx = boldRegex.lastIndex;
        }
        
        if (lastIdx < content.length) {
          parts.push(content.substring(lastIdx));
        }
        
        const renderedLine = parts.length > 0 ? parts : content;
        
        if (isHeader) {
          return (
            <h3 key={lineIdx} className={styles.msgHeader}>
              {renderedLine}
            </h3>
          );
        }
        
        if (isBullet) {
          return (
            <li key={lineIdx} className={styles.msgListItem}>
              {renderedLine}
            </li>
          );
        }
        
        return (
          <span key={lineIdx}>
            {renderedLine}
            {lineIdx < lines.length - 1 && <br />}
          </span>
        );
      })}
    </span>
  );
}

// ── Label Collision Avoidance System ──────────────────────────────────────
let labelBoxes = [];

function resetLabelBoxes() {
  labelBoxes = [];
}

function registerAvoidanceBox(bx, by, bw, bh) {
  labelBoxes.push({ x: bx, y: by, w: bw, h: bh });
}

function drawAvoidanceText(ctx, text, px, py, color, font = "bold 11px 'Sora',sans-serif") {
  ctx.save();
  ctx.font = font;
  const metrics = ctx.measureText(text);
  const w = metrics.width + 10;
  const h = 15;
  const candidates = [
    { ox: 10, oy: -8, align: "left", baseline: "middle" },
    { ox: -10, oy: -8, align: "right", baseline: "middle" },
    { ox: 0, oy: -14, align: "center", baseline: "bottom" },
    { ox: 0, oy: 14, align: "center", baseline: "top" },
    { ox: 10, oy: 8, align: "left", baseline: "middle" },
    { ox: -10, oy: 8, align: "right", baseline: "middle" },
    // Expanded offsets to handle high density labels
    { ox: 0, oy: -26, align: "center", baseline: "bottom" },
    { ox: 0, oy: 26, align: "center", baseline: "top" },
    { ox: 22, oy: -8, align: "left", baseline: "middle" },
    { ox: -22, oy: -8, align: "right", baseline: "middle" },
  ];
  
  let best = null;
  
  for (const c of candidates) {
    const tx = px + c.ox;
    const ty = py + c.oy;
    
    let bx = tx;
    if (c.align === "center") bx = tx - w / 2;
    else if (c.align === "right") bx = tx - w;
    
    let by = ty;
    if (c.baseline === "bottom") by = ty - h;
    else if (c.baseline === "top") by = ty;
    else by = ty - h / 2;
    
    let overlap = false;
    for (const box of labelBoxes) {
      if (bx < box.x + box.w && bx + w > box.x && by < box.y + box.h && by + h > box.y) {
        overlap = true;
        break;
      }
    }
    
    if (!overlap) {
      best = { tx, ty, align: c.align, baseline: c.baseline, bx, by };
      break;
    }
  }
  
  if (!best) {
    const tx = px + 12;
    const ty = py - 8 + labelBoxes.length * 16; // 16px instead of 4px step to prevent overlapping stacked texts
    best = { tx, ty, align: "left", baseline: "middle", bx: tx, by: ty - h / 2 };
  }
  
  labelBoxes.push({ x: best.bx, y: best.by, w, h });
  
  ctx.fillStyle = "rgba(10, 10, 15, 0.82)";
  ctx.beginPath();
  ctx.rect(best.bx - 2, best.by - 2, w + 4, h + 4);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.textAlign = best.align;
  ctx.textBaseline = best.baseline;
  ctx.fillText(text, best.tx, best.ty);
  ctx.restore();
}

// ── Math Visualization Helpers (pure canvas drawing) ──────────────────────

function mkToCanvas(xRange, yRange, pad, plotW, plotH) {
  return {
    cx: (mx) => pad.left + ((mx - xRange[0]) / (xRange[1] - xRange[0])) * plotW,
    cy: (my) => pad.top + plotH - ((my - yRange[0]) / (yRange[1] - yRange[0])) * plotH,
  };
}

function drawAxes(ctx, xRange, yRange, pad, plotW, plotH, alpha) {
  const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
  const xStep = Math.max(1, Math.round((xRange[1] - xRange[0]) / 8));
  const yStep = Math.max(1, Math.round((yRange[1] - yRange[0]) / 6));

  ctx.save();
  // Grid
  ctx.globalAlpha = alpha * 0.22;
  ctx.strokeStyle = "#4b5563";
  ctx.lineWidth = 0.5;
  for (let xi = Math.ceil(xRange[0] / xStep) * xStep; xi <= xRange[1]; xi += xStep) {
    ctx.beginPath(); ctx.moveTo(cx(xi), pad.top); ctx.lineTo(cx(xi), pad.top + plotH); ctx.stroke();
  }
  for (let yi = Math.ceil(yRange[0] / yStep) * yStep; yi <= yRange[1]; yi += yStep) {
    ctx.beginPath(); ctx.moveTo(pad.left, cy(yi)); ctx.lineTo(pad.left + plotW, cy(yi)); ctx.stroke();
  }

  ctx.globalAlpha = alpha;
  ctx.strokeStyle = "#6b7280";
  ctx.lineWidth = 1.5;

  // X-axis
  if (yRange[0] <= 0 && yRange[1] >= 0) {
    const y0 = cy(0);
    ctx.beginPath(); ctx.moveTo(pad.left, y0); ctx.lineTo(pad.left + plotW + 10, y0); ctx.stroke();
    ctx.fillStyle = "#6b7280";
    ctx.beginPath(); ctx.moveTo(pad.left + plotW + 10, y0 - 4); ctx.lineTo(pad.left + plotW + 16, y0); ctx.lineTo(pad.left + plotW + 10, y0 + 4); ctx.fill();
    ctx.font = "11px 'Sora',sans-serif"; ctx.fillStyle = "#9ca3af"; ctx.textAlign = "left";
    ctx.fillText("x", pad.left + plotW + 18, y0 + 4);
    for (let xi = Math.ceil(xRange[0] / xStep) * xStep; xi <= xRange[1]; xi += xStep) {
      if (xi !== 0) {
        ctx.globalAlpha = alpha * 0.7; ctx.font = "10px monospace"; ctx.fillStyle = "#4b5563"; ctx.textAlign = "center";
        ctx.fillText(xi, cx(xi), y0 + 13);
      }
    }
    ctx.globalAlpha = alpha;
  }

  // Y-axis
  if (xRange[0] <= 0 && xRange[1] >= 0) {
    const x0 = cx(0);
    ctx.beginPath(); ctx.moveTo(x0, pad.top + plotH + 10); ctx.lineTo(x0, pad.top - 10); ctx.stroke();
    ctx.fillStyle = "#6b7280";
    ctx.beginPath(); ctx.moveTo(x0 - 4, pad.top - 10); ctx.lineTo(x0, pad.top - 16); ctx.lineTo(x0 + 4, pad.top - 10); ctx.fill();
    ctx.font = "11px 'Sora',sans-serif"; ctx.fillStyle = "#9ca3af"; ctx.textAlign = "center";
    ctx.fillText("y", x0, pad.top - 18);
    if (yRange[0] <= 0 && xRange[0] <= 0) {
      ctx.font = "10px monospace"; ctx.fillStyle = "#4b5563"; ctx.textAlign = "right";
      ctx.fillText("O", x0 - 4, cy(0) + 13);
    }
    for (let yi = Math.ceil(yRange[0] / yStep) * yStep; yi <= yRange[1]; yi += yStep) {
      if (yi !== 0) {
        ctx.globalAlpha = alpha * 0.7; ctx.font = "10px monospace"; ctx.fillStyle = "#4b5563"; ctx.textAlign = "right";
        ctx.fillText(yi, x0 - 6, cy(yi) + 4);
      }
    }
    ctx.globalAlpha = alpha;
  }
  ctx.restore();
}

// Draw the correct parabola-petal tile:
// 4 petals occupying each quadrant, each bounded by 2 parabolas with vertex at center.
// Petal in Q1: region where y <= (1/half)x² AND x <= (1/half)y²  (concave toward corner)
// This creates the correct dark-petal-in-each-quadrant shape matching the math problem.
function drawPetalTile(ctx, cx2, cy2, size, t, squareSide, lang = "vi") {
  const half = size / 2;
  const ht = Math.min(1, t / 0.25);

  // White/light square background
  ctx.save();
  ctx.globalAlpha = ht;
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(cx2 - half, cy2 - half, size, size);
  // Square border
  ctx.strokeStyle = "#374151";
  ctx.lineWidth = 2;
  ctx.strokeRect(cx2 - half, cy2 - half, size, size);
  ctx.restore();

  // Draw the 4 dark petals. Each petal sits in one quadrant.
  // The petal in a quadrant is the region between two parabolas opening from center toward the corner.
  // For quadrant with corner at (±half, ±half):
  //   The two bounding parabolas in Q1 (corner top-right):
  //     Parabola A opens rightward: x = half - (y²/half)  →  passes through (half,0) and (0,half)
  //     Parabola B opens upward:    y = half - (x²/half)  →  passes through (0,half) and (half,0)
  //   The petal region in Q1 is: x >= half - y²/half  AND  y >= half - x²/half
  //   i.e. it's the lens between the two "inward" parabola arcs.

  const petalColor = "#2a2a2a"; // dark like the problem image

  const quadrants = [
    { sx: 1,  sy: 1  },  // top-right (Q1)
    { sx: -1, sy: 1  },  // top-left (Q2)
    { sx: -1, sy: -1 },  // bottom-left (Q3)
    { sx: 1,  sy: -1 },  // bottom-right (Q4)
  ];

  const steps = 60;

  quadrants.forEach(({ sx, sy }, idx) => {
    const petalT = Math.min(1, Math.max(0, (t - 0.2 - idx * 0.08) / 0.5));
    if (petalT <= 0) return;

    // Build the petal path:
    // Arc A: from (0, 0) to (sx*half, sy*half) along y = sy * (x/sx)^2 / half
    // Arc B: from (sx*half, sy*half) back to (0, 0) along x = sx * (y/sy)^2 / half
    const ptsA = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps; // 0→1
      const x = sx * u * half;
      const y = sy * u * u * half;
      ptsA.push([cx2 + x, cy2 - y]); // note: canvas y-axis is inverted
    }

    const ptsB = [];
    for (let i = steps; i >= 0; i--) {
      const u = i / steps; // 1→0
      const x = sx * u * u * half;
      const y = sy * u * half;
      ptsB.push([cx2 + x, cy2 - y]);
    }

    const allPts = [...ptsA, ...ptsB];

    ctx.save();
    ctx.globalAlpha = petalT;

    // Fill the petal
    ctx.fillStyle = petalColor;
    ctx.beginPath();
    ctx.moveTo(allPts[0][0], allPts[0][1]);
    for (let i = 1; i < allPts.length; i++) {
      ctx.lineTo(allPts[i][0], allPts[i][1]);
    }
    ctx.closePath();
    ctx.fill();

    // Stroke outline with slight glow
    ctx.strokeStyle = "#1a1a1a";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.restore();
  });

  // Labels
  if (t > 0.85) {
    const labelT = Math.min(1, (t - 0.85) / 0.15);
    ctx.save();
    ctx.globalAlpha = labelT;

    // Bottom dimension
    ctx.font = "bold 12px 'Sora',sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    ctx.fillText(`${squareSide} dm`, cx2, cy2 + half + 18);

    // Right dimension
    ctx.textAlign = "left";
    ctx.fillText(`${squareSide} dm`, cx2 + half + 8, cy2);

    // Cost labels
    ctx.font = "bold 10px 'Sora',sans-serif";
    ctx.fillStyle = "#374151";
    ctx.textAlign = "center";
    if (lang === "en") {
      ctx.fillText("Petals (black): 400k/m²", cx2, cy2 - half - 10);
      ctx.fillStyle = "#6b7280";
      ctx.fillText("Empty area (white): 300k/m²", cx2, cy2 + half + 30);
    } else {
      ctx.fillText("Cánh hoa (đen): 400k/m²", cx2, cy2 - half - 10);
      ctx.fillStyle = "#6b7280";
      ctx.fillText("Phần trống (trắng): 300k/m²", cx2, cy2 + half + 30);
    }

    ctx.restore();
  }
}

function convertLegacyToInstructions(data) {
  const type = data.type || "other";
  const viz = data.viz || {};
  const instructions = [];
  
  if (type === "quadratic" || type === "calculus") {
    const xRange = viz.xRange || [-4, 6];
    const yRange = viz.yRange || [-3, 8];
    const { a = 1, b = 0, c = 0 } = viz;
    instructions.push({ cmd: "setup", xRange, yRange });
    instructions.push({ cmd: "grid" });
    instructions.push({ cmd: "axes" });
    
    instructions.push({
      cmd: "function",
      expr: `${a}*x*x + (${b})*x + (${c})`,
      color: "#00d8fe",
      label: `y = ${a}x² + ${b}x + ${c}`,
      startAt: 0.2,
      endAt: 0.7,
      glow: true
    });
    
    if (type === "calculus" && viz.from != null && viz.to != null) {
      instructions.push({
        cmd: "shape",
        type: "polygon",
        pts: [
          [viz.from, 0],
          ...Array.from({ length: 41 }, (_, idx) => {
            const mx = viz.from + (idx / 40) * (viz.to - viz.from);
            return [mx, a*mx*mx + b*mx + c];
          }),
          [viz.to, 0]
        ],
        color: "#6366f1",
        fill: true,
        label: viz.area ? `S ≈ ${viz.area}` : null,
        startAt: 0.7,
        endAt: 0.95
      });
    }
    
    if (viz.roots && viz.roots.length) {
      viz.roots.forEach((root, idx) => {
        instructions.push({
          cmd: "point",
          x: root,
          y: 0,
          color: "#f59e0b",
          label: `x=${Number.isInteger(root) ? root : root.toFixed(2)}`,
          startAt: 0.72 + idx * 0.05
        });
      });
    }
    
    if (viz.vertex) {
      instructions.push({
        cmd: "point",
        x: viz.vertex[0],
        y: viz.vertex[1],
        color: "#a78bfa",
        label: `(${Number.isInteger(viz.vertex[0]) ? viz.vertex[0] : viz.vertex[0].toFixed(1)}, ${Number.isInteger(viz.vertex[1]) ? viz.vertex[1] : viz.vertex[1].toFixed(1)})`,
        startAt: 0.82
      });
      instructions.push({
        cmd: "camera",
        targetX: viz.vertex[0],
        targetY: viz.vertex[1],
        zoom: 1.6,
        startAt: 0.8
      });
    }
  } else if (type === "linear" || type === "system") {
    const xRange = viz.xRange || [-5, 5];
    const yRange = viz.yRange || [-5, 8];
    instructions.push({ cmd: "setup", xRange, yRange });
    instructions.push({ cmd: "grid" });
    instructions.push({ cmd: "axes" });
    
    const lines = viz.lines || [];
    const lineColors = ["#00d8fe", "#f59e0b", "#a78bfa", "#4ade80"];
    lines.forEach((line, idx) => {
      instructions.push({
        cmd: "function",
        expr: `${line.m}*x + (${line.b})`,
        color: lineColors[idx % lineColors.length],
        label: line.label,
        startAt: 0.2 + idx * 0.15,
        endAt: 0.65 + idx * 0.15,
        glow: true
      });
    });
    
    if (viz.intersection) {
      const { x: ix, y: iy } = viz.intersection;
      instructions.push({
        cmd: "point",
        x: ix,
        y: iy,
        color: "#4ade80",
        label: `(${Number.isInteger(ix) ? ix : ix.toFixed(1)}, ${Number.isInteger(iy) ? iy : iy.toFixed(1)})`,
        startAt: 0.78
      });
      instructions.push({
        cmd: "camera",
        targetX: ix,
        targetY: iy,
        zoom: 1.5,
        startAt: 0.78
      });
    }
  } else if (type === "trigonometry") {
    const xRange = viz.xRange || [0, 6.28];
    const yRange = viz.yRange || [-1.6, 1.6];
    instructions.push({ cmd: "setup", xRange, yRange });
    instructions.push({ cmd: "grid" });
    instructions.push({ cmd: "axes" });
    
    const fn = viz.fn || "sin";
    const amp = viz.amplitude || 1;
    const period = viz.period || Math.PI * 2;
    const phase = viz.phase || 0;
    instructions.push({
      cmd: "function",
      expr: `${amp}*Math.${fn}((2*Math.PI/(${period}))*x + (${phase}))`,
      color: "#00d8fe",
      label: `y = ${amp}${fn}(x)`,
      startAt: 0.22,
      endAt: 0.77,
      glow: true
    });
  } else if (type === "geometry") {
    const shapes = viz.shapes || [];
    const titleLower = (data.title || "").toLowerCase();
    const isPetalTile = titleLower.includes("viên gạch") || titleLower.includes("cánh hoa") ||
      titleLower.includes("parabol") || titleLower.includes("petal") || titleLower.includes("tile") ||
      titleLower.includes("gạch") || titleLower.includes("hoa");
      
    if (isPetalTile || shapes.length === 0) {
      instructions.push({ cmd: "setup", xRange: [-2, 2], yRange: [-2, 2] });
      instructions.push({
        cmd: "shape",
        type: "petal_tile",
        startAt: 0.1,
        endAt: 0.9
      });
    } else {
      let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
      shapes.forEach(s => {
        if (s.t === "circle") { minX = Math.min(minX, s.cx - s.r); maxX = Math.max(maxX, s.cx + s.r); minY = Math.min(minY, s.cy - s.r); maxY = Math.max(maxY, s.cy + s.r); }
        else if (s.t === "triangle" && s.pts) { for (const [px, py] of s.pts) { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); } }
        else if (s.t === "rect") { minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x + s.w); minY = Math.min(minY, s.y); maxY = Math.max(maxY, s.y + s.h); }
      });
      const margin = Math.max((maxX - minX), (maxY - minY)) * 0.3 + 1;
      instructions.push({ cmd: "setup", xRange: [minX - margin, maxX + margin], yRange: [minY - margin, maxY + margin] });
      
      const shapeColors = ["#00d8fe", "#f59e0b", "#a78bfa", "#4ade80", "#f87171"];
      shapes.forEach((s, idx) => {
        const color = s.color || shapeColors[idx % shapeColors.length];
        if (s.t === "circle") {
          instructions.push({
            cmd: "shape",
            type: "circle",
            cx: s.cx,
            cy: s.cy,
            r: s.r,
            color,
            label: s.r ? `r=${s.r}` : null,
            fill: true,
            startAt: 0.15 + idx * 0.12,
            endAt: 0.6 + idx * 0.12
          });
        } else if (s.t === "triangle" || s.t === "polygon") {
          instructions.push({
            cmd: "shape",
            type: s.t,
            pts: s.pts,
            color,
            label: s.labels ? s.labels.join("") : null,
            fill: true,
            startAt: 0.15 + idx * 0.12,
            endAt: 0.6 + idx * 0.12
          });
        } else if (s.t === "rect") {
          instructions.push({
            cmd: "shape",
            type: "rect",
            x: s.x,
            y: s.y,
            w: s.w,
            h: s.h,
            color,
            fill: true,
            startAt: 0.15 + idx * 0.12,
            endAt: 0.6 + idx * 0.12
          });
        }
      });
    }
  } else {
    instructions.push({ cmd: "setup", xRange: [-2, 2], yRange: [-2, 2] });
    instructions.push({
      cmd: "shape",
      type: "generic_pulse",
      startAt: 0.05,
      endAt: 0.95
    });
  }
  
  return instructions;
}

function drawVisualizationPanel(ctx, data, panelW, panelH, t, lang = "vi") {
  const pad = { top: 44, bottom: 36, left: 42, right: 14 };
  const plotW = panelW - pad.left - pad.right;
  const plotH = panelH - pad.top - pad.bottom;

  resetLabelBoxes();
  ctx.save();

  // Dark Manim-like background
  ctx.fillStyle = "#0c0c0b";
  ctx.fillRect(0, 0, panelW, panelH);

  // Parse instructions
  let instructions = [];
  if (data.viz && Array.isArray(data.viz.instructions)) {
    instructions = data.viz.instructions;
  } else {
    instructions = convertLegacyToInstructions(data);
  }

  // Find setup command to know bounds
  const setupCmd = instructions.find(inst => inst.cmd === "setup") || { xRange: [-5, 5], yRange: [-5, 5] };
  const xRange = setupCmd.xRange || [-5, 5];
  const yRange = setupCmd.yRange || [-5, 5];

  const xMid = (xRange[0] + xRange[1]) / 2;
  const yMid = (yRange[0] + yRange[1]) / 2;

  // Active camera center and zoom interpolation
  let camX = xMid;
  let camY = yMid;
  let camZoom = 1.0;

  const camInsts = instructions.filter(inst => inst.cmd === "camera");
  camInsts.sort((a, b) => a.startAt - b.startAt);

  let lastCamX = xMid;
  let lastCamY = yMid;
  let lastCamZoom = 1.0;

  for (const inst of camInsts) {
    const { targetX, targetY, zoom: instZoom = 1.0, startAt, endAt = startAt + 0.2 } = inst;
    if (t >= startAt) {
      const factor = Math.min(1, (t - startAt) / (endAt - startAt));
      const ease = factor * factor * (3 - 2 * factor); // smoothstep
      camX = lastCamX + (targetX - lastCamX) * ease;
      camY = lastCamY + (targetY - lastCamY) * ease;
      camZoom = lastCamZoom + (instZoom - lastCamZoom) * ease;
      
      if (t >= endAt) {
        lastCamX = targetX;
        lastCamY = targetY;
        lastCamZoom = instZoom;
      }
    }
  }

  // Camera-aware mapping coordinates
  const cx = (x) => {
    const dx = x - camX;
    const x_rel = camX + dx * camZoom;
    return pad.left + ((x_rel - xRange[0]) / (xRange[1] - xRange[0])) * plotW;
  };

  const cy = (y) => {
    const dy = y - camY;
    const y_rel = camY + dy * camZoom;
    return pad.top + plotH - ((y_rel - yRange[0]) / (yRange[1] - yRange[0])) * plotH;
  };

  // Safe evaluate helper
  const safeEvaluate = (expr, xVal) => {
    const sanitized = expr
      .replace(/Math\./g, "")
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/exp/g, "Math.exp")
      .replace(/log/g, "Math.log")
      .replace(/pow/g, "Math.pow")
      .replace(/sqrt/g, "Math.sqrt")
      .replace(/pi/g, "Math.PI")
      .replace(/PI/g, "Math.PI")
      .replace(/e/g, "Math.E");
    try {
      const fn = new Function("x", `return ${sanitized};`);
      return fn(xVal);
    } catch {
      return 0;
    }
  };

  // Run each instruction
  instructions.forEach(inst => {
    const cmd = inst.cmd;

    if (cmd === "grid") {
      const xStep = Math.max(1, Math.round((xRange[1] - xRange[0]) / 8));
      const yStep = Math.max(1, Math.round((yRange[1] - yRange[0]) / 6));
      ctx.save();
      ctx.globalAlpha = (inst.alpha || 0.22) * Math.min(1, t / 0.25);
      ctx.strokeStyle = inst.color || "#4b5563";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.rect(pad.left, pad.top, plotW, plotH);
      ctx.clip();
      
      for (let xi = Math.ceil(xRange[0]/xStep)*xStep; xi <= xRange[1]; xi += xStep) {
        ctx.beginPath(); ctx.moveTo(cx(xi), pad.top); ctx.lineTo(cx(xi), pad.top + plotH); ctx.stroke();
      }
      for (let yi = Math.ceil(yRange[0]/yStep)*yStep; yi <= yRange[1]; yi += yStep) {
        ctx.beginPath(); ctx.moveTo(pad.left, cy(yi)); ctx.lineTo(pad.left + plotW, cy(yi)); ctx.stroke();
      }
      ctx.restore();

    } else if (cmd === "axes") {
      ctx.save();
      ctx.globalAlpha = (inst.alpha || 1.0) * Math.min(1, t / 0.25);
      ctx.strokeStyle = inst.color || "#6b7280";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.rect(pad.left, pad.top, plotW, plotH);
      ctx.clip();
      
      const yZero = cy(0);
      if (yZero >= pad.top && yZero <= pad.top + plotH) {
        ctx.beginPath(); ctx.moveTo(pad.left, yZero); ctx.lineTo(pad.left + plotW, yZero); ctx.stroke();
      }
      const xZero = cx(0);
      if (xZero >= pad.left && xZero <= pad.left + plotW) {
        ctx.beginPath(); ctx.moveTo(xZero, pad.top); ctx.lineTo(xZero, pad.top + plotH); ctx.stroke();
      }
      ctx.restore();

      // Draw axis labels
      ctx.save();
      ctx.fillStyle = "#9ca3af";
      ctx.font = "12px sans-serif";
      const { xLabel = "x", yLabel = "y" } = inst;
      
      // X label near the right end of X axis
      const yZeroText = Math.max(pad.top + 10, Math.min(pad.top + plotH - 10, yZero));
      ctx.fillText(xLabel, pad.left + plotW - 15, yZeroText - 10);
      
      // Y label near the top end of Y axis
      const xZeroText = Math.max(pad.left + 10, Math.min(pad.left + plotW - 20, xZero));
      ctx.fillText(yLabel, xZeroText + 10, pad.top + 15);
      ctx.restore();

    } else if (cmd === "function") {
      const { expr, color = "#00d8fe", width = 2.5, glow = true, label, startAt = 0.2, endAt = startAt + 0.5, domain } = inst;
      const curveT = Math.min(1, Math.max(0, (t - startAt) / (endAt - startAt)));
      if (curveT > 0) {
        const startX = domain ? domain[0] : xRange[0];
        const endX = domain ? domain[1] : xRange[1];
        const totalPts = 120;
        const drawPts = Math.floor(totalPts * curveT);
        ctx.save();
        ctx.beginPath();
        ctx.rect(pad.left, pad.top, plotW, plotH);
        ctx.clip();
        
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (glow) {
          ctx.shadowColor = color;
          ctx.shadowBlur = 10;
        }
        ctx.beginPath();
        let started = false;
        for (let i = 0; i <= drawPts; i++) {
          const mx = startX + (i / totalPts) * (endX - startX);
          const my = safeEvaluate(expr, mx);
          const sx = cx(mx);
          const sy = cy(my);
          if (isNaN(sy) || !isFinite(sy) || sy < pad.top || sy > pad.top + plotH) {
            started = false;
            continue;
          }
          if (!started) { ctx.moveTo(sx, sy); started = true; }
          else { ctx.lineTo(sx, sy); }
        }
        ctx.stroke();
        ctx.restore();
        
        if (curveT >= 0.8 && label) {
          const midMx = domain ? (domain[0] + domain[1]) / 2 : (xRange[0] + xRange[1]) / 2;
          const midMy = safeEvaluate(expr, midMx);
          if (midMy >= yRange[0] && midMy <= yRange[1]) {
            drawAvoidanceText(ctx, label, cx(midMx), cy(midMy), color);
          }
        }
      }

    } else if (cmd === "point") {
      const { x, y, color = "#fbbf24", label, glow = true, startAt = 0.7, showDot = true } = inst;
      const ptT = Math.min(1, Math.max(0, (t - startAt) / 0.15));
      if (ptT > 0) {
        if (showDot) {
          ctx.save();
          ctx.globalAlpha = ptT;
          ctx.fillStyle = color;
          if (glow) {
            ctx.shadowColor = color;
            ctx.shadowBlur = 12;
          }
          ctx.beginPath(); ctx.arc(cx(x), cy(y), 5.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
        
        if (ptT > 0.8 && label) {
          registerAvoidanceBox(cx(x) - 6, cy(y) - 6, 12, 12);
          drawAvoidanceText(ctx, label, cx(x), cy(y), color);
        }
      }

    } else if (cmd === "text") {
      const { x, y, text: txt, color = "#9ca3af", size = 12, align = "center", startAt = 0.2 } = inst;
      const textT = Math.min(1, Math.max(0, (t - startAt) / 0.15));
      if (textT > 0 && txt) {
        ctx.save();
        ctx.globalAlpha = textT;
        ctx.fillStyle = color;
        ctx.font = `${size}px sans-serif`;
        ctx.textAlign = align;
        ctx.fillText(txt, cx(x), cy(y));
        ctx.restore();
      }

    } else if (cmd === "line") {
      const { p1, p2, color = "#faf9f5", width = 2.0, isVector = false, isPhoton = false, label, startAt = 0.2, endAt = startAt + 0.4, dashed = false, dashPattern = [4, 4] } = inst;
      const lineT = Math.min(1, Math.max(0, (t - startAt) / (endAt - startAt)));
      if (lineT > 0) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = width;
        if (dashed) {
          ctx.setLineDash(dashPattern);
        }
        ctx.beginPath();
        ctx.rect(pad.left, pad.top, plotW, plotH);
        ctx.clip();
        
        const x1 = p1[0], y1 = p1[1];
        const x2 = p2[0], y2 = p2[1];
        const currX2 = x1 + (x2 - x1) * lineT;
        const currY2 = y1 + (y2 - y1) * lineT;
        const sx1 = cx(x1), sy1 = cy(y1);
        const sx2 = cx(currX2), sy2 = cy(currY2);
        
        if (isPhoton) {
          const dx = sx2 - sx1; const dy = sy2 - sy1;
          const len = Math.sqrt(dx*dx + dy*dy);
          const waves = 9.0; const amp = 6.0;
          const ux = dx / (len || 1); const uy = dy / (len || 1);
          const nx = -uy; const ny = ux;
          ctx.beginPath();
          for (let i = 0; i <= 80 * lineT; i++) {
            const u = i / 80;
            const px = sx1 + dx * u + nx * amp * Math.sin(u * waves * 2 * Math.PI);
            const py = sy1 + dy * u + ny * amp * Math.sin(u * waves * 2 * Math.PI);
            if (i === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
          }
          ctx.stroke();
        } else {
          ctx.beginPath(); ctx.moveTo(sx1, sy1); ctx.lineTo(sx2, sy2); ctx.stroke();
          
          if (isVector && lineT >= 1.0) {
            const dx = sx2 - sx1; const dy = sy2 - sy1;
            const angle = Math.atan2(dy, dx);
            const arrowSize = 8;
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.moveTo(sx2, sy2);
            ctx.lineTo(sx2 - arrowSize * Math.cos(angle - Math.PI/6), sy2 - arrowSize * Math.sin(angle - Math.PI/6));
            ctx.lineTo(sx2 - arrowSize * Math.cos(angle + Math.PI/6), sy2 - arrowSize * Math.sin(angle + Math.PI/6));
            ctx.closePath(); ctx.fill();
          }
        }
        ctx.restore();
        
        if (lineT >= 0.8 && label) {
          drawAvoidanceText(ctx, label, (sx1 + sx2) / 2, (sy1 + sy2) / 2, color);
        }
      }

    } else if (cmd === "shape") {
      const { type: shapeType, color = "#6366f1", fill = false, label, startAt = 0.2, endAt = startAt + 0.4 } = inst;
      const shapeT = Math.min(1, Math.max(0, (t - startAt) / (endAt - startAt)));
      if (shapeT > 0) {
        ctx.save();
        ctx.strokeStyle = color;
        ctx.lineWidth = 2.0;
        ctx.beginPath();
        ctx.rect(pad.left, pad.top, plotW, plotH);
        ctx.clip();
        
        if (shapeType === "circle") {
          const { cx: scx, cy: scy, r: sr } = inst;
          const baseRad = Math.abs(cx(scx + sr) - cx(scx));
          ctx.beginPath(); ctx.arc(cx(scx), cy(scy), baseRad, 0, Math.PI * 2 * shapeT); ctx.stroke();
          if (fill && shapeT >= 1.0) {
            ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fill();
          }
          ctx.restore();
          if (shapeT >= 0.8 && label) drawAvoidanceText(ctx, label, cx(scx), cy(scy), color);

        } else if (shapeType === "rect") {
          const { x: rx, y: ry, w: rw, h: rh } = inst;
          const screenW = cx(rx + rw) - cx(rx); const screenH = cy(ry) - cy(ry + rh);
          const sx = cx(rx); const sy = cy(ry + rh);
          ctx.beginPath(); ctx.rect(sx, sy, screenW * shapeT, screenH); ctx.stroke();
          if (fill && shapeT >= 1.0) {
            ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fillRect(sx, sy, screenW, screenH);
          }
          ctx.restore();
          if (shapeT >= 0.8 && label) drawAvoidanceText(ctx, label, sx + screenW / 2, sy + screenH / 2, color);

        } else if ((shapeType === "triangle" || shapeType === "polygon") && inst.pts) {
          const pts = inst.pts; const n = pts.length;
          ctx.beginPath(); ctx.moveTo(cx(pts[0][0]), cy(pts[0][1]));
          const drawSides = Math.floor(n * shapeT);
          for (let i = 1; i <= drawSides; i++) ctx.lineTo(cx(pts[i % n][0]), cy(pts[i % n][1]));
          if (shapeT >= 1.0) ctx.closePath();
          ctx.stroke();
          if (fill && shapeT >= 1.0) {
            ctx.fillStyle = color; ctx.globalAlpha = 0.15; ctx.fill();
          }
          ctx.restore();
          if (shapeT >= 0.8 && label) {
            let avgX = 0, avgY = 0; pts.forEach(([px, py]) => { avgX += px; avgY += py; });
            drawAvoidanceText(ctx, label, cx(avgX / n), cy(avgY / n), color);
          }
        } else if (shapeType === "petal_tile") {
          ctx.restore();
          const size = Math.min(panelW - 80, panelH - 80);
          drawPetalTile(ctx, panelW / 2, panelH / 2, size, t, 4, lang);
        } else if (shapeType === "generic_pulse") {
          ctx.restore();
          drawGenericViz(ctx, data, panelW, panelH, t, lang);
        } else {
          ctx.restore();
        }
      }
    }
  });

  // "VISUALIZATION" label
  if (t > 0.05) {
    ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.05) / 0.15) * 0.5;
    ctx.font = "10px 'Sora',sans-serif"; ctx.fillStyle = "#6366f1"; ctx.textAlign = "left";
    ctx.fillText(lang === "en" ? "▶ VISUALIZATION" : "▶ TRỰC QUAN HÓA", pad.left, 16);
    ctx.restore();
  }

  ctx.restore();
}

function drawGenericViz(ctx, data, panelW, panelH, t, lang = "vi") {
  const cx = panelW / 2; const cy = panelH / 2;
  const ringCount = 3;
  for (let i = 0; i < ringCount; i++) {
    const ringT = Math.min(1, Math.max(0, (t - i * 0.08) / 0.3));
    if (ringT <= 0) continue;
    ctx.save(); ctx.globalAlpha = ringT * (0.4 - i * 0.1);
    ctx.strokeStyle = i === 0 ? "#00d8fe" : i === 1 ? "#6366f1" : "#a78bfa";
    ctx.lineWidth = 2;
    ctx.beginPath(); ctx.arc(cx, cy, 40 + i * 30, 0, Math.PI * 2 * ringT); ctx.stroke();
    ctx.restore();
  }
  const pulse = 1 + 0.06 * Math.sin(t * Math.PI * 8);
  ctx.save(); ctx.globalAlpha = Math.min(1, t / 0.2);
  ctx.fillStyle = "#00d8fe"; ctx.shadowColor = "#00d8fe"; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  ctx.save(); ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.4) / 0.2));
  ctx.font = "bold 13px 'Sora',sans-serif"; ctx.fillStyle = "#6b7280"; ctx.textAlign = "center";
  ctx.fillText(lang === "en" ? (data?.title || "DuoMCB Visualizing...") : (data?.title || "DuoMCB Đang vẽ..."), cx, cy + 50);
  ctx.restore();
}

// ── Inline Video Player (renders in chat message, not a modal overlay) ──
function InlineVideoPlayer({ question, imageBase64, sessionId }) {
  const canvasRef = useRef(null);
  const videoRef = useRef(null);
  const animRef = useRef(null);
  const progressFillRef = useRef(null);
  // ── Use a ref for isPlaying so the animation loop never needs it as a
  //    React dependency — prevents the loop from being cancelled/restarted
  //    on every setProgress() call which was causing the erratic bar.
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [lang, setLang] = useState("vi"); // "vi" | "en"
  const [progress, setProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [videoData, setVideoData] = useState(null);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loadingVideo, setLoadingVideo] = useState(false);
  const [loadingVideoText, setLoadingVideoText] = useState("Đang kết xuất chuyển động...");
  const [videoDuration, setVideoDuration] = useState(16);
  const frameRef = useRef(0);
  const progressTickRef = useRef(0); // throttle counter
  const totalFrames = 480;

  // Keep ref in sync with state (for buttons that toggle play/pause)
  function setIsPlaying(val) {
    const next = typeof val === "function" ? val(isPlayingRef.current) : val;
    isPlayingRef.current = next;
    setIsPlayingState(next);
    if (videoRef.current) {
      if (next) {
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }

  const handleSeek = (e) => {
    const pct = parseFloat(e.target.value);
    setProgress(pct);
    if (progressFillRef.current) {
      progressFillRef.current.style.width = `${pct}%`;
    }
    
    if (videoUrl && videoRef.current) {
      const dur = videoRef.current.duration || videoDuration;
      videoRef.current.currentTime = (pct / 100) * dur;
    } else {
      frameRef.current = Math.floor((pct / 100) * totalFrames);
    }
  };

  useEffect(() => {
    async function fetchData() {
      setLoadingSteps(true);
      try {
        const { chat: chatFn } = await import("./duoServer");

        const vizSchemaDoc = `Format the JSON visualization data as a sequence of drawing instructions to represent the math problem visually.
We support a set of visual commands in the "instructions" array:
1. {"cmd": "setup", "xRange": [min, max], "yRange": [min, max]} -> Sets up the coordinate bounds. Always run this first.
2. {"cmd": "grid"} -> Draws Cartesian coordinates grid.
3. {"cmd": "axes", "xLabel": "TEXT", "yLabel": "TEXT"} -> Draws coordinate X and Y axes with custom labels (e.g. xLabel="t (h)", yLabel="v (km/h)").
4. {"cmd": "function", "expr": "MATH_EXPR_IN_JS", "color": "HEX", "label": "TEXT", "glow": true, "startAt": float, "endAt": float, "domain": [min, max]} -> Plots a function f(x) curve. Use standard JavaScript Math operators or x (e.g. "x*x - 2*x", "Math.sin(x)"). Use "domain" (e.g. [0, 3]) to restrict the drawing domain of the function instead of drawing infinitely.
5. {"cmd": "point", "x": float, "y": float, "color": "HEX", "label": "TEXT", "glow": true, "startAt": float, "showDot": bool} -> Draws a point at (x, y). Set "showDot": false to only show the label without the circular bullet.
6. {"cmd": "line", "p1": [x,y], "p2": [x,y], "color": "HEX", "width": float, "isVector": bool, "isPhoton": bool, "label": "TEXT", "startAt": float, "endAt": float, "dashed": bool, "dashPattern": [4, 4]} -> Draws a line. Set "dashed": true for dashed guidelines.
7. {"cmd": "text", "x": float, "y": float, "text": "TEXT", "color": "HEX", "size": int, "align": "center|left|right", "startAt": float} -> Draws an arbitrary text label at coordinates (x, y) to mark ticks or write variables.
8. {"cmd": "shape", "type": "rect|circle|triangle|polygon|petal_tile|generic_pulse", "color": "HEX", "fill": bool, "label": "TEXT", "startAt": float, "endAt": float, ...dims} -> Draws geometric shapes.
9. {"cmd": "camera", "targetX": float, "targetY": float, "zoom": float, "startAt": float, "endAt": float} -> Smoothly pans/zooms camera to focus on a coordinate.

Example viz object:
{"instructions": [
  {"cmd": "setup", "xRange": [-1, 4], "yRange": [-1, 11]},
  {"cmd": "grid"},
  {"cmd": "axes", "xLabel": "t (h)", "yLabel": "v (km/h)"},
  {"cmd": "function", "expr": "-0.75*x*x + 3*x + 6", "domain": [0, 3], "color": "#00d8fe", "label": "v = -0.75t² + 3t + 6", "startAt": 0.2, "glow": true},
  {"cmd": "line", "p1": [2, 0], "p2": [2, 9], "color": "#9ca3af", "dashed": true, "startAt": 0.7},
  {"cmd": "line", "p1": [0, 9], "p2": [2, 9], "color": "#9ca3af", "dashed": true, "startAt": 0.7},
  {"cmd": "point", "x": 2, "y": 9, "color": "#fbbf24", "label": "I(2; 9)", "startAt": 0.75},
  {"cmd": "text", "x": 2, "y": -0.5, "text": "2", "startAt": 0.75},
  {"cmd": "text", "x": -0.3, "y": 9, "text": "9", "startAt": 0.75},
  {"cmd": "text", "x": -0.3, "y": 6, "text": "6", "startAt": 0.75},
  {"cmd": "camera", "targetX": 2, "targetY": 9, "zoom": 1.5, "startAt": 0.75}
]}`;

        const prompt = imageBase64
          ? `You are an expert math tutor and visualizer.
Analyze the math problem in the provided image and generate both:
1. Detailed step-by-step solution in Vietnamese (up to 10 steps).
2. Detailed step-by-step solution in English (up to 10 steps).
3. A sequence of drawing instructions to represent the problem visually.

Return ONLY a single valid JSON object with the following schema:
{
  "type": "custom",
  "title": "SHORT_TITLE_OF_THE_PROBLEM",
  "stepsVI": ["Bước 1...", "Bước 2..."],
  "stepsEN": ["Step 1...", "Step 2..."],
  "viz": {
    "instructions": [VIZ_COMMANDS]
  }
}

Guidelines:
- stepsVI/stepsEN: Use LaTeX for ALL math expressions (inline $like this$, block $$like this$$).
- stepsVI must end with "✓ Đáp án: [kết quả]". stepsEN must end with "✓ Answer: [final answer]".
- viz instructions: Use the following schema:
${vizSchemaDoc}

CRITICAL RULES FOR MATHEMATHICAL CONSISTENCY & ACCURACY:
1. All steps and explanations must be mathematically correct, highly concise, and directly solve the problem. Avoid rambling, off-topic, or conversational filler.
2. The coordinate ranges (xRange, yRange) and drawn elements MUST match the math values in the steps.
3. For geometric tile problems (e.g., painting a square tile of side length A containing a flower petal):
   - Setup a coordinate range fitting the tile (e.g. xRange=[-1, A+1], yRange=[-1, A+1]).
   - Draw a "petal_tile" shape command centered at x=A/2, y=A/2, with size=A.
   - Example for side length 4: {"cmd": "shape", "type": "petal_tile", "x": 2, "y": 2, "size": 4, "startAt": 0.1, "endAt": 0.9}
   - NEVER draw random circles or arbitrary squares that do not represent the actual tile side length.
4. For functions, the equations, domain limits, vertices, and points plotted in "instructions" MUST BE IDENTICAL to the values calculated in stepsVI and stepsEN.
5. REPRESENTATIVE DIAGRAMS FOR NUMBER-LESS PROBLEMS:
   - If the problem does not contain any numerical values (e.g. a general geometry proof or theorem like "tam giác ABC vuông tại A, đường cao AH"), you MUST still generate a representative visualization diagram!
   - Assume standard, clean, and reasonable numerical coordinates to represent the geometric entities.
   - Example: For a right triangle ABC at A, define A=[0,0], B=[0,3], C=[4,0] and draw the lines.
   - NEVER skip drawing or return "Không có đủ thông tin" on the visualization panel just because the problem is symbolic. Always illustrate it with a representative figure.
6. COLOR & LABELS RULE FOR PREMIUM VISUALS:
   - Use vibrant, contrasting hex colors (#f43f5e for red, #3b82f6 for blue, #10b981 for green, #eab308 for yellow, #a855f7 for purple) for lines and shapes to distinguish different geometric parts. Do NOT draw everything in plain white/black.
   - Label all vertices (A, B, C, D, etc.) clearly using point commands with "label": "A" or text commands next to the coordinates.
   - Highlight sub-regions or key parts of the geometry using the "shape" command with fill: true (draws semi-transparent color fill) to make it easy to follow.
7. ABSOLUTE LATEX DELIMITER RULE:
   - You MUST wrap EVERY single math symbol, fraction, variable, or equation in stepsVI and stepsEN in dollar signs (e.g. use $x$, $\\frac{AB}{\\sin C}$, $18^\\circ$, NOT x, \\frac{AB}{\\sin C}, or 18^o).
   - If a step does not have dollar signs around its LaTeX math elements, the math rendering will fail.

Output ONLY raw JSON. No markdown code block wrappers, no preamble, no extra text.`
          : `You are an expert math tutor and visualizer.
Solve this math problem: "${question}"
Generate both:
1. Detailed step-by-step solution in Vietnamese (up to 10 steps).
2. Detailed step-by-step solution in English (up to 10 steps).
3. A sequence of drawing instructions to represent the problem visually.

Return ONLY a single valid JSON object with the following schema:
{
  "type": "custom",
  "title": "SHORT_TITLE_OF_THE_PROBLEM",
  "stepsVI": ["Bước 1...", "Bước 2..."],
  "stepsEN": ["Step 1...", "Step 2..."],
  "viz": {
    "instructions": [VIZ_COMMANDS]
  }
}

Guidelines:
- stepsVI/stepsEN: Use LaTeX for ALL math expressions (inline $like this$, block $$like this$$).
- stepsVI must end with "✓ Đáp án: [kết quả]". stepsEN must end with "✓ Answer: [final answer]".
- viz instructions: Use the following schema:
${vizSchemaDoc}

CRITICAL RULES FOR MATHEMATHICAL CONSISTENCY & ACCURACY:
1. All steps and explanations must be mathematically correct, highly concise, and directly solve the problem. Avoid rambling, off-topic, or conversational filler.
2. The coordinate ranges (xRange, yRange) and drawn elements MUST match the math values in the steps.
3. For geometric tile problems (e.g., painting a square tile of side length A containing a flower petal):
   - Setup a coordinate range fitting the tile (e.g. xRange=[-1, A+1], yRange=[-1, A+1]).
   - Draw a "petal_tile" shape command centered at x=A/2, y=A/2, with size=A.
   - Example for side length 4: {"cmd": "shape", "type": "petal_tile", "x": 2, "y": 2, "size": 4, "startAt": 0.1, "endAt": 0.9}
   - NEVER draw random circles or arbitrary squares that do not represent the actual tile side length.
4. For functions, the equations, domain limits, vertices, and points plotted in "instructions" MUST BE IDENTICAL to the values calculated in stepsVI and stepsEN.
5. REPRESENTATIVE DIAGRAMS FOR NUMBER-LESS PROBLEMS:
   - If the problem does not contain any numerical values (e.g. a general geometry proof or theorem like "tam giác ABC vuông tại A, đường cao AH"), you MUST still generate a representative visualization diagram!
   - Assume standard, clean, and reasonable numerical coordinates to represent the geometric entities.
   - Example: For a right triangle ABC at A, define A=[0,0], B=[0,3], C=[4,0] and draw the lines.
   - NEVER skip drawing or return "Không có đủ thông tin" on the visualization panel just because the problem is symbolic. Always illustrate it with a representative figure.
6. COLOR & LABELS RULE FOR PREMIUM VISUALS:
   - Use vibrant, contrasting hex colors (#f43f5e for red, #3b82f6 for blue, #10b981 for green, #eab308 for yellow, #a855f7 for purple) for lines and shapes to distinguish different geometric parts. Do NOT draw everything in plain white/black.
   - Label all vertices (A, B, C, D, etc.) clearly using point commands with "label": "A" or text commands next to the coordinates.
   - Highlight sub-regions or key parts of the geometry using the "shape" command with fill: true (draws semi-transparent color fill) to make it easy to follow.
7. ABSOLUTE LATEX DELIMITER RULE:
   - You MUST wrap EVERY single math symbol, fraction, variable, or equation in stepsVI and stepsEN in dollar signs (e.g. use $x$, $\\frac{AB}{\\sin C}$, $18^\\circ$, NOT x, \\frac{AB}{\\sin C}, or 18^o).
   - If a step does not have dollar signs around its LaTeX math elements, the math rendering will fail.

Output ONLY raw JSON. No markdown, no preamble.`;

        const response = await chatFn(sessionId, prompt, {
          image: imageBase64 || null,
          mode: "solution",
        });
        const reply = response?.reply || "";

        let vizParsed = { type: "other", title: question || "Math Problem", viz: {}, stepsVI: [], stepsEN: [] };
        try {
          const cleaned = reply
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            // Pre-process raw JSON text to double-escape LaTeX backslashes inside string values,
            // while preserving valid escapes like \"
            // Also strip any trailing commas in objects or arrays
            const jsonText = jsonMatch[0]
              .replace(/"(\\.|[^"\\])*"/g, (match) => {
                return match.replace(/\\(?!")/g, "\\\\");
              })
              .replace(/,\s*([\}\]])/g, "$1");

            const obj = JSON.parse(jsonText);
            vizParsed = {
              type: obj.type || "custom",
              title: obj.title || question || "Math Problem",
              viz: obj.viz || { instructions: obj.instructions || [] },
              stepsVI: obj.stepsVI || [],
              stepsEN: obj.stepsEN || [],
            };
          }
        } catch (e) {
          console.error("Failed to parse JSON visualization response", e);
        }

        const rawStepsEN = vizParsed.stepsEN || [];
        const rawStepsVI = vizParsed.stepsVI || [];
        const solutionReply = rawStepsVI.join("\n");

        if (vizParsed.type === "other") {
          const combined = (solutionReply + " " + (question || "")).toLowerCase();
          if (/viên gạch|gạch hoa|cánh hoa|petal|tile.*parabol|parabol.*tile/.test(combined)) {
            vizParsed.type = "geometry";
            vizParsed.title = vizParsed.title.includes("hoa") || vizParsed.title.includes("gạch")
              ? vizParsed.title : vizParsed.title + " (gạch hoa)";
          } else if (/x²|x\^2|quadratic|phương trình bậc hai|delta|discriminant|parabola/.test(combined)) {
            vizParsed.type = "quadratic";
          } else if (/sin|cos|tan|trigon/.test(combined)) {
            vizParsed.type = "trigonometry";
            vizParsed.viz = { fn: /cos/.test(combined) ? "cos" : /tan/.test(combined) ? "tan" : "sin", amplitude: 1, period: Math.PI * 2, phase: 0, xRange: [0, 6.28], yRange: [-1.6, 1.6] };
          } else if (/integral|tích phân|area under|diện tích dưới/.test(combined)) {
            vizParsed.type = "calculus";
          } else if (/y\s*=\s*[\d-]*x|linear|đường thẳng/.test(combined)) {
            vizParsed.type = "linear";
          }
        }

        const problemTitle = vizParsed.title || (question ? question.substring(0, 60) : "Bài toán");
        const stepsEN = rawStepsEN.length > 0
          ? [problemTitle, ...rawStepsEN]
          : [problemTitle, "Step 1: Analyze the problem", "Step 2: Apply the method", "✓ See full solution"];
        const stepsVI = rawStepsVI.length > 0
          ? [problemTitle, ...rawStepsVI]
          : [problemTitle, "Bước 1: Phân tích đề bài", "Bước 2: Áp dụng công thức", "✓ Xem lời giải đầy đủ"];

        setVideoData({ ...vizParsed, stepsEN, stepsVI });

        // Dựng video bằng Matplotlib trên backend
        const instructions = vizParsed.viz?.instructions || [];
        if (instructions.length > 0) {
          setLoadingVideo(true);
          setLoadingVideoText("Đang kết xuất chuyển động...");
          try {
            const vidRes = await generateVideo(instructions);
            if (vidRes && !vidRes.error && vidRes.url) {
              setVideoUrl(vidRes.url);
            }
          } catch (vidErr) {
            console.error("Failed to generate video:", vidErr);
          } finally {
            setLoadingVideo(false);
          }
        }
      } catch {
        setVideoData({
          type: "other",
          title: question || "Math Problem",
          stepsEN: ["Step 1: Read and understand", "Step 2: Identify the method", "Step 3: Calculate", "✓ Check the answer"],
          stepsVI: ["Bước 1: Đọc và hiểu đề bài", "Bước 2: Xác định phương pháp", "Bước 3: Tính toán", "✓ Kiểm tra kết quả"],
          viz: {}
        });
      } finally {
        setLoadingSteps(false);
        setIsPlaying(true);
      }
    }
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ── Canvas animation loop ──────────────────────────────────────────────
  // Key design: isPlaying is read from isPlayingRef (a ref) inside the loop,
  // so `isPlaying` state is NOT a dependency. This prevents the loop from
  // being cancelled and restarted on every state update.
  // We write the progress bar width directly to DOM via a Ref for 60fps smoothness,
  // and we throttle the state-driven `progress` to every 4 frames (15fps) which is
  // performant and ensures KaTeX steps show up perfectly on time.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingSteps || !videoData) return;
    const ctx = canvas.getContext("2d");
    const W = 400; const H = 380;
    canvas.width = W; canvas.height = H;

    function drawFrame(frame) {
      const t = frame / totalFrames;
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = "rgba(99,102,241,0.06)";
      for (let gx = 20; gx < W; gx += 40)
        for (let gy = 20; gy < H; gy += 40) {
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
        }
      drawVisualizationPanel(ctx, videoData, W, H, t, lang);
      ctx.save(); ctx.globalAlpha = 0.15;
      ctx.font = "8px 'Sora',sans-serif"; ctx.fillStyle = "#00d8fe"; ctx.textAlign = "left";
      ctx.fillText("DuoMath AI", 8, H - 5);
      ctx.restore();
    }

    function tick() {
      // Advance frame only when playing (read from ref — no closure stale-ness)
      if (isPlayingRef.current) {
        frameRef.current = (frameRef.current + 1) % totalFrames;
      }
      drawFrame(frameRef.current);
      
      const pct = (frameRef.current / totalFrames) * 100;
      if (progressFillRef.current) {
        progressFillRef.current.style.width = `${pct}%`;
      }

      // Throttle: update progress state only every 4 frames to avoid
      // flooding React with excessive re-renders.
      progressTickRef.current = (progressTickRef.current + 1) % 4;
      if (progressTickRef.current === 0) {
        setProgress(pct);
      }
      animRef.current = requestAnimationFrame(tick);
    }

    drawFrame(frameRef.current);
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [loadingSteps, videoData, lang]); // lang is added here to update visual immediately on language change

  const totalSec = videoUrl ? Math.round(videoDuration) : Math.round(totalFrames / 30);

  return (
    <div className={styles.inlineVideoContainer}>
      {/* Header */}
      <div className={styles.inlineVideoHeader}>
        <div className={styles.videoModalTitle}>
          <span>🎬</span>
          <span>DuoMath Video Giải</span>
          <span className={styles.videoBadge}>AI Generated</span>
          {videoData?.type && videoData.type !== "other" && (
            <span className={styles.videoTypeBadge}>{videoData.type.toUpperCase()}</span>
          )}
        </div>
      </div>

      {/* Body: canvas (left) + HTML KaTeX solution panel (right) */}
      <div className={styles.inlineVideoBody}>
        {/* LEFT: visualization canvas or video */}
        <div className={styles.inlineVizPanel}>
          {loadingSteps ? (
            <div className={styles.videoLoadingOverlay}>
              <div className={styles.videoLoadingSpinner} />
              <p className={styles.videoLoadingText}>AI đang phân tích...</p>
            </div>
          ) : loadingVideo ? (
            <div className={styles.videoLoadingOverlay}>
              <div className={styles.videoLoadingSpinner} />
              <p className={styles.videoLoadingText}>{loadingVideoText}</p>
            </div>
          ) : videoUrl ? (
            <video 
              ref={videoRef}
              src={videoUrl} 
              autoPlay 
              loop 
              onTimeUpdate={(e) => {
                const vid = e.target;
                if (vid.duration) {
                  const pct = (vid.currentTime / vid.duration) * 100;
                  setProgress(pct);
                  if (progressFillRef.current) {
                    progressFillRef.current.style.width = `${pct}%`;
                  }
                }
              }}
              onPlay={() => setIsPlayingState(true)}
              onPause={() => setIsPlayingState(false)}
              onLoadedMetadata={(e) => {
                if (e.target.duration) {
                  setVideoDuration(e.target.duration);
                }
              }}
              className={styles.inlineVideoTag}
              style={{ width: "100%", height: "100%", borderRadius: "8px", objectFit: "contain" }}
            />
          ) : (
            <canvas ref={canvasRef} className={styles.inlineCanvas} />
          )}
        </div>

        {/* RIGHT: HTML solution panel — KaTeX renders LaTeX properly */}
        <div className={styles.inlineSolutionPanel}>
          {/* Language toggle tabs */}
          <div className={styles.langTabs}>
            <button
              className={lang === "vi" ? styles.langTabActive : styles.langTab}
              onClick={() => setLang("vi")}
            >
              🇻🇳 Tiếng Việt
            </button>
            <button
              className={lang === "en" ? styles.langTabActive : styles.langTab}
              onClick={() => setLang("en")}
            >
              🇬🇧 English
            </button>
          </div>

          {loadingSteps ? (
            <p className={styles.solutionLoading}>
              {lang === "vi" ? "Đang tải lời giải..." : "Loading solution..."}
            </p>
          ) : (
            <div className={styles.solutionSteps}>
              {(() => {
                // Pick the right step list based on selected language
                const steps = lang === "en"
                  ? (videoData?.stepsEN || videoData?.steps || [])
                  : (videoData?.stepsVI || videoData?.steps || []);
                return steps.map((step, i) => {
                  const totalSteps = steps.length;
                  // Steps appear progressively: title at 0%, last step at 75%
                  // (reduced from 82% so ALL steps are visible well before video ends)
                  const stepThreshold = i === 0 ? 0 : (i / totalSteps) * 75;
                  const isVisible = progress >= stepThreshold;
                  if (!isVisible) return null;
                  const isAnswer = step.startsWith("✓") ||
                    step.toLowerCase().includes("đáp án") ||
                    step.toLowerCase().includes("answer:");
                  const isTitle = i === 0;
                  return (
                    <div
                      key={`${lang}-${i}`}
                      className={`${styles.solutionStep} ${isAnswer ? styles.solutionAnswer : ""} ${isTitle ? styles.solutionTitle : ""}`}
                    >
                      {!isTitle && (
                        <span className={styles.solutionBullet} style={{ background: isAnswer ? "#4ade80" : "#6366f1" }} />
                      )}
                      <span className={styles.solutionText}>
                        {parseMathAndText(step).map((token, idx) => {
                          if (token.type === "text") return renderTextWithMarkdown(token.content, idx, styles);
                          try {
                            return (
                              <span
                                key={idx}
                                dangerouslySetInnerHTML={{
                                  __html: katex.renderToString(token.content.trim(), {
                                    displayMode: token.isBlock, throwOnError: false
                                  })
                                }}
                                style={token.isBlock ? { display: "block", margin: "0.3em 0" } : {}}
                              />
                            );
                          } catch { return <code key={idx}>{token.content}</code>; }
                        })}
                      </span>
                    </div>
                  );
                });
              })()}
            </div>
          )}
        </div>
      </div>

      {/* Progress bar / Scrubber */}
      <div className={styles.videoProgressBarContainer}>
        <input 
          type="range"
          min="0"
          max="100"
          step="0.1"
          value={progress}
          onChange={handleSeek}
          className={styles.videoProgressSlider}
          disabled={loadingSteps || loadingVideo}
        />
        <div className={styles.videoProgressBar}>
          <div ref={progressFillRef} className={styles.videoProgressFill} style={{ width: `${progress}%` }} />
        </div>
      </div>

      {/* Controls */}
      <div className={styles.videoControls}>
        <div className={styles.videoControlsLeft}>
          <button className={styles.videoCtrlBtn} onClick={() => setIsPlaying(p => !p)} disabled={loadingSteps}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className={styles.videoCtrlBtn} onClick={() => {
            if (videoRef.current) {
              videoRef.current.currentTime = 0;
              videoRef.current.play().catch(() => {});
            }
            frameRef.current = 0;
            setProgress(0);
            setIsPlaying(true);
          }} disabled={loadingSteps}>
            🔄
          </button>
          <span className={styles.videoDuration}>{Math.floor((progress / 100) * totalSec)}s / {totalSec}s</span>
        </div>
        {question && (
          <span className={styles.videoProblemText}>
            📋 {question.length > 55 ? question.substring(0, 55) + "…" : question}
          </span>
        )}
      </div>
    </div>
  );
}


// ── Tools Dropdown ────────────────────────────────────────────────────────
function ToolsDropdown({ onSelect, disabled }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className={styles.toolsDropdownWrapper} ref={ref}>
      <button
        className={styles.toolsBtn}
        onClick={() => !disabled && setOpen(o => !o)}
        disabled={disabled}
        title="Công cụ AI"
      >
        <span>⚙️</span>
        <span>Tools</span>
        <span className={`${styles.toolsChevron} ${open ? styles.toolsChevronOpen : ""}`}>▾</span>
      </button>
      {open && (
        <div className={styles.toolsMenu}>
          <div className={styles.toolsMenuHeader}>Chọn công cụ AI</div>
          {TOOLS.map(t => (
            <button
              key={t.id}
              className={styles.toolsMenuItem}
              onClick={() => { setOpen(false); onSelect(t.id); }}
            >
              <span className={styles.toolsMenuIcon}>{t.icon}</span>
              <div className={styles.toolsMenuText}>
                <span className={styles.toolsMenuLabel}>{t.label}</span>
                <span className={styles.toolsMenuDesc}>{t.desc}</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DuoMCBPage() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [savedHistory, setSavedHistory] = useState([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem("duomcb_history") || "[]");
      setSavedHistory(saved);
    } catch (e) {
      setSavedHistory([]);
    }
  }, []);

  useEffect(() => {
    if (!sessionId) return;
    if (messages.length > 0) {
      dbSet(`duomcb_session_${sessionId}`, messages).catch(e => {
        console.error("Failed to save session to IndexedDB", e);
      });
    }
  }, [messages, sessionId]);

  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { initSession(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);
  // Close mobile sidebar when resizing to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 769) setMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function initSession() {
    const sid = await createSession();
    setSessionId(sid || "offline-" + Date.now());
  }

  async function ensureSession() {
    let sid = sessionId;
    if (!sid || sid.startsWith("offline-")) {
      sid = await createSession();
      if (!sid) sid = "offline-" + Date.now();
      setSessionId(sid);
    }
    return sid;
  }

  function pushToHistory(firstMsg, sid) {
    if (!sid) return;
    const title = firstMsg.substring(0, 44) + (firstMsg.length > 44 ? "…" : "");
    const entry = { id: sid, title, date: new Date().toLocaleDateString("vi-VN") };
    const updated = [entry, ...savedHistory.filter(h => h.id !== sid)].slice(0, 20);
    setSavedHistory(updated);
    try { localStorage.setItem("duomcb_history", JSON.stringify(updated)); } catch {}
  }

  async function loadChat(sid) {
    try {
      const saved = await dbGet(`duomcb_session_${sid}`);
      if (saved) {
        setSessionId(sid);
        setMessages(saved);
      }
    } catch (e) {
      console.error("Failed to load session from IndexedDB", e);
    }
  }

  async function deleteChat(sid, e) {
    if (e) e.stopPropagation();
    try {
      await dbDelete(`duomcb_session_${sid}`);
      const updated = savedHistory.filter(h => h.id !== sid);
      setSavedHistory(updated);
      localStorage.setItem("duomcb_history", JSON.stringify(updated));
      if (sessionId === sid) {
        newChat();
      }
    } catch (e) {
      console.error("Failed to delete session", e);
    }
  }

  function saveConversation() {
    if (messages.length === 0) return;
    const lines = messages.map(m => {
      const role = m.role === "user" ? "[Bạn]" : "[DuoMCB]";
      const content = m.type === "video" ? `[🎬 Video Giải: ${m.question || ""}]` : (m.content || "");
      return `${role}: ${content}`;
    });
    const text = `DuoMCB – Cuộc trò chuyện\n${"─".repeat(40)}\n${lines.join("\n\n")}\n${"─".repeat(40)}\nXuất lúc: ${new Date().toLocaleString("vi-VN")}`;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `duomcb-${Date.now()}.txt`;
    a.click(); URL.revokeObjectURL(url);
  }

  function handleImageSelect(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target.result);
      setImageBase64(ev.target.result);
      setShowImageModal(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  async function sendImageMessage(mode) {
    setShowImageModal(false);
    if (mode === "video") {
      const sid = await ensureSession();
      const videoMsg = {
        id: Date.now(), role: "assistant", type: "video",
        question: input.trim() || "Bài toán từ ảnh",
        imageBase64: imageBase64,
        sessionId: sid,
      };
      if (messages.length === 0) pushToHistory("Bài toán từ ảnh", sid);
      setMessages(prev => [...prev, videoMsg]);
      setImagePreview(null); setImageBase64(null);
      return;
    }
    const modeText = mode === "hint"
      ? "Provide A FEW HINTS to solve this problem without giving the answer"
      : "Look at the problem in this image and solve it STEP BY STEP for me.";
    const userMsg = { role: "user", content: modeText, image: imagePreview, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const sid = await ensureSession();
    if (messages.length === 0) {
      const cleanTitle = mode === "hint" ? "Gợi ý bài toán từ ảnh" : "Giải bài toán từ ảnh";
      pushToHistory(cleanTitle, sid);
    }
    try {
      const data = await chat(sid, modeText, { image: imageBase64, mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply || "", id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Không thể xử lý ảnh. Vui lòng thử lại.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false); setImagePreview(null); setImageBase64(null);
    }
  }

  async function sendMessage(text, mode = "hint") {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (mode === "video") {
      const sid = await ensureSession();
      if (messages.length === 0) pushToHistory(msg, sid);
      setMessages(prev => [...prev, {
        id: Date.now(), role: "assistant", type: "video",
        question: msg, imageBase64: null, sessionId: sid,
      }]);
      setInput("");
      return;
    }

    setInput("");
    const sid = await ensureSession();
    if (messages.length === 0) pushToHistory(msg, sid);
    setMessages(prev => [...prev, { role: "user", content: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const data = await chat(sid, msg, { mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error();
      setMessages(prev => [...prev, { role: "assistant", content: data.reply, id: Date.now() + 1 }]);
    } catch {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Không thể kết nối. Vui lòng thử lại.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
    }
  }

  function handleToolSelect(toolId) {
    const msg = input.trim();
    if (!msg && toolId !== "video") return;
    sendMessage(msg || null, toolId);
  }

  function newChat() {
    setMessages([]); initSession(); inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.root}>
      {/* ── IMAGE MODAL ── */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>🖼️ Ảnh đã tải lên</span>
              <button className={styles.modalClose} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>✕</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className={styles.modalPreview} />
            <p className={styles.modalQuestion}>Bạn muốn DuoMCB làm gì với bài toán này?</p>
            <div className={styles.modalActions}>
              <button className={styles.hintBtn} onClick={() => sendImageMessage("hint")}>💡 Gợi ý</button>
              <button className={styles.answerBtn} onClick={() => sendImageMessage("answer")}>📖 Giải đầy đủ</button>
              <button className={styles.videoModalBtn} onClick={() => sendImageMessage("video")}>🎬 Video Giải</button>
            </div>
          </div>
        </div>
      )}

      {/* ── MOBILE SIDEBAR BACKDROP ── */}
      {mobileMenuOpen && (
        <div
          className={styles.sidebarBackdrop}
          onClick={() => setMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed} ${mobileMenuOpen ? styles.sidebarMobileOpen : ""}`}>
        <div className={styles.sidebarTop}>
          <div className={styles.logo}>
            <span className={styles.logoIcon}></span>
            {sidebarOpen && <span className={styles.logoText}>DuoMCB</span>}
          </div>
          <button className={styles.toggleBtn} onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? "◀" : "▶"}
          </button>
        </div>
        {sidebarOpen && (
          <>
            <button className={styles.newChatBtn} onClick={newChat}>
              <span>✏️</span> New Chat
            </button>
            <div className={styles.historySection}>
              <p className={styles.historyLabel}>Recent</p>
              {savedHistory.length === 0 ? (
                <p style={{ fontSize: "12px", color: "#4b5563", padding: "4px 10px" }}>Chưa có cuộc trò chuyện</p>
              ) : savedHistory.map(h => (
                <div key={h.id} className={`${styles.historyItemWrapper} ${sessionId === h.id ? styles.historyItemActive : ""}`}>
                  <button className={styles.historyItem} onClick={() => loadChat(h.id)}>
                    <span className={styles.historyIcon}>💬</span>
                    <span className={styles.historyTitle} title={h.title}>{h.title}</span>
                  </button>
                  <button className={styles.deleteChatBtn} onClick={(e) => deleteChat(h.id, e)} title="Xóa phiên chat">
                    ✕
                  </button>
                </div>
              ))}
            </div>
            <div className={styles.sidebarFooter}>
              <div className={styles.modelBadge}>
                <span className={styles.modelDot} />
                llama-3.3-70b
              </div>
            </div>
          </>
        )}
      </aside>

      {/* ── MAIN ── */}
      <main className={styles.main}>
        <header className={styles.header}>
          {/* Hamburger — only shows on mobile via CSS */}
          <button
            className={styles.mobileMenuBtn}
            onClick={() => setMobileMenuOpen(o => !o)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
          <span className={styles.headerTitle}>DuoMCB</span>
          <span className={styles.headerSub}>Bilingual AI Tutor</span>
          <div className={styles.headerActions}>
            {messages.length > 0 && (
              <button className={styles.saveBtn} onClick={saveConversation} title="Lưu cuộc trò chuyện">
                💾 Lưu
              </button>
            )}
            <Link href="/">Go back</Link>
          </div>
        </header>

        <div className={styles.chatArea}>
          {isEmpty ? (
            <div className={styles.welcome}>
              <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB Logo" width={64} height={64} style={{ width: 64, height: "auto" }} />
              <h1 className={styles.welcomeTitle}>Hello, I&apos;m DuoMCB</h1>
              <p className={styles.welcomeSub}>Your bilingual <strong>DUOMATH</strong> chatbot!</p>
              <div className={styles.suggestions}>
                {SUGGESTED.map((s, i) => (
                  <button key={i} className={styles.suggestionCard} onClick={() => sendMessage(s.text)}>
                    <span className={styles.suggestionIcon}>{s.icon}</span>
                    <span>{s.text}</span>
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className={styles.messages}>
              {messages.map(m => {
                if (m.type === "video") {
                  return (
                    <div key={m.id} className={`${styles.msgRow} ${styles.botRow}`}>
                      <div className={styles.avatar}>
                        <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB" width={32} height={32} />
                      </div>
                      <div className={styles.inlineVideoWrapper}>
                        <InlineVideoPlayer
                          question={m.question}
                          imageBase64={m.imageBase64}
                          sessionId={m.sessionId}
                        />
                      </div>
                    </div>
                  );
                }
                return (
                  <div key={m.id} className={`${styles.msgRow} ${m.role === "user" ? styles.userRow : styles.botRow}`}>
                    {m.role === "assistant" && (
                      <div className={styles.avatar}>
                        <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB" width={32} height={32} />
                      </div>
                    )}
                    <div className={`${styles.bubble} ${m.role === "user" ? styles.userBubble : styles.botBubble}`}>
                      {m.image && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={m.image} alt="Uploaded" className={styles.bubbleImage} />
                      )}
                      {parseMathAndText(m.content || "").map((token, idx) => {
                        if (token.type === "text") return renderTextWithMarkdown(token.content, idx, styles);
                        try {
                          const html = katex.renderToString(token.content.trim(), { displayMode: token.isBlock, throwOnError: false });
                          return (
                            <span key={idx} dangerouslySetInnerHTML={{ __html: html }}
                              style={token.isBlock ? { display: "block", margin: "0.5em 0" } : {}} />
                          );
                        } catch { return <code key={idx}>{token.content}</code>; }
                      })}
                    </div>
                    {m.role === "user" && <div className={styles.userAvatar}>👤</div>}
                  </div>
                );
              })}
              {loading && (
                <div className={`${styles.msgRow} ${styles.botRow}`}>
                  <div className={styles.avatar}>
                    <Image src="/images/duosteamicon-removebg-preview.webp" alt="DuoMCB" width={32} height={32} />
                  </div>
                  <div className={`${styles.bubble} ${styles.botBubble} ${styles.typingBubble}`}>
                    <span className={styles.dot} /><span className={styles.dot} /><span className={styles.dot} />
                  </div>
                </div>
              )}
              <div ref={bottomRef} />
            </div>
          )}
        </div>

        {/* ── Input bar ── */}
        <div className={styles.inputBar}>
          <div className={styles.inputWrapper}>
            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleImageSelect} />
            <button className={styles.imageBtn} onClick={() => fileInputRef.current?.click()} title="Tải ảnh lên" disabled={loading}>+</button>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Hỏi DuoMCB... hoặc tải ảnh đề bài lên"
              value={input}
              rows={1}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(null, "hint"); } }}
            />
            <ToolsDropdown onSelect={handleToolSelect} disabled={loading} />
            <button
              className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ""}`}
              onClick={() => sendMessage(null, "hint")}
              disabled={!input.trim() || loading}
            >➤</button>
          </div>
          <p className={styles.disclaimer}>DuoMCB có thể mắc lỗi. Hãy kiểm tra lại các đáp án quan trọng.</p>
        </div>
      </main>
    </div>
  );
}
