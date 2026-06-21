"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBPage.module.css";
import Image from "next/image";
import { createSession, chat } from "./duoServer";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";

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
  const tokens = [];
  let index = 0;
  
  while (index < text.length) {
    const nextBlock = text.indexOf("$$", index);
    const nextBlockBracket = text.indexOf("\\[", index);
    const nextInline = text.indexOf("$", index);
    const nextInlineParen = text.indexOf("\\(", index);
    
    const finders = [
      { type: "block_dollar", index: nextBlock, startLen: 2, endDelim: "$$" },
      { type: "block_bracket", index: nextBlockBracket, startLen: 2, endDelim: "\\]" },
      { type: "inline_dollar", index: nextInline, startLen: 1, endDelim: "$" },
      { type: "inline_paren", index: nextInlineParen, startLen: 2, endDelim: "\\)" }
    ].filter(f => f.index !== -1).sort((a, b) => a.index - b.index);
    
    if (finders.length === 0) {
      tokens.push({ type: "text", content: text.substring(index) });
      break;
    }
    
    const first = finders[0];
    
    if (first.index > index) {
      tokens.push({ type: "text", content: text.substring(index, first.index) });
    }
    
    const searchStart = first.index + first.startLen;
    const endIdx = text.indexOf(first.endDelim, searchStart);
    
    if (endIdx === -1) {
      tokens.push({ type: "text", content: text.substring(first.index) });
      break;
    }
    
    const mathContent = text.substring(searchStart, endIdx);
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
    const tx = px + 10;
    const ty = py - 8 + labelBoxes.length * 4;
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
function drawPetalTile(ctx, cx2, cy2, size, t, squareSide) {
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
    // Arc A: from (sx*half, 0) to (0, sy*half) along x = sx*(half - y²/half)
    // Arc B: from (0, sy*half) back to (sx*half, 0) along y = sy*(half - x²/half)
    const ptsA = [];
    for (let i = 0; i <= steps; i++) {
      const u = i / steps; // 0→1
      const y = sy * u * half;
      const x = sx * (half - (y * y) / half);
      ptsA.push([cx2 + x, cy2 - y]); // note: canvas y-axis is inverted
    }

    const ptsB = [];
    for (let i = steps; i >= 0; i--) {
      const u = i / steps;
      const x = sx * u * half;
      const y = sy * (half - (x * x) / half);
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
    ctx.fillText("Cánh hoa (đen): 400k/m²", cx2, cy2 - half - 10);
    ctx.fillStyle = "#6b7280";
    ctx.fillText("Phần trống (trắng): 300k/m²", cx2, cy2 + half + 30);

    ctx.restore();
  }
}

function drawVisualizationPanel(ctx, data, panelW, panelH, t) {
  const type = data.type || "other";
  const viz = data.viz || {};
  const pad = { top: 44, bottom: 36, left: 42, right: 14 };
  const plotW = panelW - pad.left - pad.right;
  const plotH = panelH - pad.top - pad.bottom;

  resetLabelBoxes();
  ctx.save();

  if (type === "quadratic" || type === "calculus") {
    const xRange = viz.xRange || [-4, 6];
    const yRange = viz.yRange || [-3, 8];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    drawAxes(ctx, xRange, yRange, pad, plotW, plotH, Math.min(1, t / 0.25));

    const { a = 1, b = 0, c = 0 } = viz;

    const curveT = Math.min(1, Math.max(0, (t - 0.2) / 0.5));
    if (curveT > 0) {
      const totalPts = 120;
      const drawPts = Math.floor(totalPts * curveT);
      ctx.save();
      ctx.beginPath(); ctx.rect(pad.left, pad.top, plotW, plotH); ctx.clip();
      ctx.strokeStyle = "#00d8fe"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00d8fe"; ctx.shadowBlur = 10;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= drawPts; i++) {
        const mx = xRange[0] + (i / totalPts) * (xRange[1] - xRange[0]);
        const my = a * mx * mx + b * mx + c;
        if (!started) { ctx.moveTo(cx(mx), cy(my)); started = true; } else ctx.lineTo(cx(mx), cy(my));
      }
      ctx.stroke();
      ctx.restore();

      if (type === "calculus" && viz.from != null && viz.to != null && curveT > 0.8) {
        const areaT = Math.min(1, (t - 0.7) / 0.25);
        const from = viz.from; const to = viz.to;
        ctx.save(); ctx.globalAlpha = areaT * 0.3;
        ctx.fillStyle = "#6366f1";
        ctx.beginPath(); ctx.moveTo(cx(from), cy(0));
        for (let i = 0; i <= 80; i++) {
          const mx = from + (i / 80) * (to - from);
          const my = a * mx * mx + b * mx + c;
          ctx.lineTo(cx(mx), cy(Math.max(yRange[0], Math.min(yRange[1], my))));
        }
        ctx.lineTo(cx(to), cy(0)); ctx.closePath(); ctx.fill();
        ctx.globalAlpha = areaT; ctx.strokeStyle = "#a78bfa"; ctx.lineWidth = 1.5; ctx.setLineDash([4, 3]);
        ctx.beginPath(); ctx.moveTo(cx(from), cy(0)); ctx.lineTo(cx(from), cy(a * from * from + b * from + c)); ctx.stroke();
        ctx.beginPath(); ctx.moveTo(cx(to), cy(0)); ctx.lineTo(cx(to), cy(a * to * to + b * to + c)); ctx.stroke();
        ctx.setLineDash([]);
        ctx.restore();
        if (viz.area != null) {
          drawAvoidanceText(ctx, `S ≈ ${viz.area}`, cx((from + to) / 2), cy(0), "#c4b5fd", "bold 12px 'Sora',sans-serif");
        }
      }
    }

    const rootT = Math.min(1, Math.max(0, (t - 0.72) / 0.18));
    if (rootT > 0 && viz.roots && viz.roots.length) {
      for (const root of viz.roots) {
        if (root < xRange[0] || root > xRange[1]) continue;
        ctx.save(); ctx.globalAlpha = rootT;
        ctx.fillStyle = "#f59e0b"; ctx.shadowColor = "#f59e0b"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(cx(root), cy(0), 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.restore();
        const fmtRoot = Number.isInteger(root) ? root : root.toFixed(2);
        registerAvoidanceBox(cx(root) - 6, cy(0) - 6, 12, 12);
        drawAvoidanceText(ctx, `x=${fmtRoot}`, cx(root), cy(0), "#fbbf24", "bold 12px 'Sora',sans-serif");
      }
    }

    const vtxT = Math.min(1, Math.max(0, (t - 0.82) / 0.18));
    if (vtxT > 0 && viz.vertex) {
      const [vx, vy] = viz.vertex;
      ctx.save(); ctx.globalAlpha = vtxT;
      ctx.fillStyle = "#a78bfa"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(cx(vx), cy(vy), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const fvx = Number.isInteger(vx) ? vx : vx.toFixed(2);
      const fvy = Number.isInteger(vy) ? vy : vy.toFixed(2);
      registerAvoidanceBox(cx(vx) - 6, cy(vy) - 6, 12, 12);
      drawAvoidanceText(ctx, `(${fvx},${fvy})`, cx(vx), cy(vy), "#c4b5fd", "bold 11px 'Sora',sans-serif");
    }

  } else if (type === "linear" || type === "system") {
    const xRange = viz.xRange || [-5, 5];
    const yRange = viz.yRange || [-5, 8];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    drawAxes(ctx, xRange, yRange, pad, plotW, plotH, Math.min(1, t / 0.25));

    const lineColors = ["#00d8fe", "#f59e0b", "#a78bfa", "#4ade80"];
    const lines = viz.lines || [];

    ctx.save();
    ctx.beginPath(); ctx.rect(pad.left, pad.top, plotW, plotH); ctx.clip();
    lines.forEach((line, idx) => {
      const lT = Math.min(1, Math.max(0, (t - 0.2 - idx * 0.18) / 0.45));
      if (lT <= 0) return;
      const color = lineColors[idx % lineColors.length];
      const totalPts = 60; const drawPts = Math.floor(totalPts * lT);
      ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.shadowColor = color; ctx.shadowBlur = 8;
      ctx.beginPath(); let s2 = false;
      for (let i = 0; i <= drawPts; i++) {
        const mx = xRange[0] + (i / totalPts) * (xRange[1] - xRange[0]);
        const my = line.m * mx + line.b;
        if (!s2) { ctx.moveTo(cx(mx), cy(my)); s2 = true; } else ctx.lineTo(cx(mx), cy(my));
      }
      ctx.stroke(); ctx.restore();
    });
    ctx.restore();

    lines.forEach((line, idx) => {
      const lT = Math.min(1, Math.max(0, (t - 0.2 - idx * 0.18) / 0.45));
      if (lT <= 0.75 || !line.label) return;
      const color = lineColors[idx % lineColors.length];
      const midMx = (xRange[0] + xRange[1]) / 2;
      const midMy = line.m * midMx + line.b;
      if (midMy >= yRange[0] && midMy <= yRange[1]) {
        drawAvoidanceText(ctx, line.label, cx(midMx), cy(midMy), color, "bold 11px 'Sora',sans-serif");
      }
    });

    if (viz.intersection && t > 0.78) {
      const { x: ix, y: iy } = viz.intersection;
      ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.78) / 0.18);
      ctx.fillStyle = "#4ade80"; ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(cx(ix), cy(iy), 7, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
      const fix = Number.isInteger(ix) ? ix : ix.toFixed(2);
      const fiy = Number.isInteger(iy) ? iy : iy.toFixed(2);
      registerAvoidanceBox(cx(ix) - 8, cy(iy) - 8, 16, 16);
      drawAvoidanceText(ctx, `(${fix}, ${fiy})`, cx(ix), cy(iy), "#4ade80", "bold 12px 'Sora',sans-serif");
    }

  } else if (type === "trigonometry") {
    const xRange = viz.xRange || [0, 6.28];
    const yRange = viz.yRange || [-1.6, 1.6];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    drawAxes(ctx, xRange, yRange, pad, plotW, plotH, Math.min(1, t / 0.25));

    const fn = viz.fn || "sin";
    const amp = viz.amplitude || 1;
    const period = viz.period || Math.PI * 2;
    const phase = viz.phase || 0;
    const curveT = Math.min(1, Math.max(0, (t - 0.22) / 0.55));
    if (curveT > 0) {
      const totalPts = 150; const drawPts = Math.floor(totalPts * curveT);
      ctx.save(); ctx.strokeStyle = "#00d8fe"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00d8fe"; ctx.shadowBlur = 10;
      ctx.beginPath(); let st = false;
      for (let i = 0; i <= drawPts; i++) {
        const mx = xRange[0] + (i / totalPts) * (xRange[1] - xRange[0]);
        const raw = fn === "cos" ? Math.cos((2 * Math.PI / period) * mx + phase)
          : fn === "tan" ? Math.tan((2 * Math.PI / period) * mx + phase)
          : Math.sin((2 * Math.PI / period) * mx + phase);
        const my = amp * raw;
        if (Math.abs(my) > 2.5) { ctx.stroke(); ctx.beginPath(); st = false; continue; }
        if (!st) { ctx.moveTo(cx(mx), cy(my)); st = true; } else ctx.lineTo(cx(mx), cy(my));
      }
      ctx.stroke(); ctx.restore();

      if (curveT > 0.7 && yRange[0] <= 0 && yRange[1] >= 0) {
        ctx.save(); ctx.globalAlpha = Math.min(1, (curveT - 0.7) / 0.3);
        ctx.font = "10px monospace"; ctx.fillStyle = "#6b7280"; ctx.textAlign = "center";
        const piVals = [["π/2", Math.PI / 2], ["π", Math.PI], ["3π/2", 3 * Math.PI / 2], ["2π", 2 * Math.PI]];
        for (const [lbl, val] of piVals) {
          if (val >= xRange[0] && val <= xRange[1]) ctx.fillText(lbl, cx(val), cy(0) + 13);
        }
        ctx.restore();
      }
    }

  } else if (type === "geometry") {
    const shapes = viz.shapes || [];
    const titleLower = (data.title || "").toLowerCase();
    const isPetalTile = titleLower.includes("viên gạch") || titleLower.includes("cánh hoa") ||
      titleLower.includes("parabol") || titleLower.includes("petal") || titleLower.includes("tile") ||
      titleLower.includes("gạch") || titleLower.includes("hoa");

    const rectShape = shapes.find(s => s.t === "rect");
    const squareSide = rectShape ? Math.max(rectShape.w, rectShape.h) : 4;

    if (isPetalTile || shapes.length === 0) {
      const cx2 = panelW / 2;
      const cy2 = panelH / 2;
      const size = Math.min(panelW - 80, panelH - 80);
      drawPetalTile(ctx, cx2, cy2, size, t, squareSide);
      ctx.restore();
      return;
    }

    // Generic geometry shapes
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const s of shapes) {
      if (s.t === "circle") { minX = Math.min(minX, s.cx - s.r); maxX = Math.max(maxX, s.cx + s.r); minY = Math.min(minY, s.cy - s.r); maxY = Math.max(maxY, s.cy + s.r); }
      else if (s.t === "triangle" && s.pts) { for (const [px, py] of s.pts) { minX = Math.min(minX, px); maxX = Math.max(maxX, px); minY = Math.min(minY, py); maxY = Math.max(maxY, py); } }
      else if (s.t === "rect") { minX = Math.min(minX, s.x); maxX = Math.max(maxX, s.x + s.w); minY = Math.min(minY, s.y); maxY = Math.max(maxY, s.y + s.h); }
    }
    const margin = Math.max((maxX - minX), (maxY - minY)) * 0.3 + 1;
    const xRange = [minX - margin, maxX + margin];
    const yRange = [minY - margin, maxY + margin];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    const shapeColors = ["#00d8fe", "#f59e0b", "#a78bfa", "#4ade80", "#f87171"];

    ctx.save();
    ctx.beginPath(); ctx.rect(pad.left, pad.top, plotW, plotH); ctx.clip();
    shapes.forEach((s, idx) => {
      const sT = Math.min(1, Math.max(0, (t - 0.15 - idx * 0.12) / 0.45));
      if (sT <= 0) return;
      const color = s.color || shapeColors[idx % shapeColors.length];
      ctx.save(); ctx.globalAlpha = sT; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.shadowColor = color; ctx.shadowBlur = 12;

      if (s.t === "circle") {
        const endAngle = Math.PI * 2 * sT;
        ctx.beginPath(); ctx.arc(cx(s.cx), cy(s.cy), Math.abs(cx(s.cx + s.r) - cx(s.cx)), 0, endAngle); ctx.stroke();
        ctx.restore();
        if (sT > 0.8) {
          ctx.save(); ctx.strokeStyle = color; ctx.lineWidth = 1.5; ctx.setLineDash([4, 4]);
          ctx.beginPath(); ctx.moveTo(cx(s.cx), cy(s.cy)); ctx.lineTo(cx(s.cx + s.r), cy(s.cy)); ctx.stroke();
          ctx.restore();
          registerAvoidanceBox(cx(s.cx) - 4, cy(s.cy) - 4, 8, 8);
          const fmtR = Number.isInteger(s.r) ? s.r : s.r.toFixed(2);
          drawAvoidanceText(ctx, `r=${fmtR}`, cx(s.cx + s.r / 2), cy(s.cy), color);
          ctx.save(); ctx.fillStyle = color;
          ctx.beginPath(); ctx.arc(cx(s.cx), cy(s.cy), 3.5, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }
      } else if (s.t === "triangle" && s.pts && s.pts.length === 3) {
        const numSides = Math.floor(3 * sT);
        ctx.beginPath(); ctx.moveTo(cx(s.pts[0][0]), cy(s.pts[0][1]));
        for (let i = 1; i <= numSides; i++) ctx.lineTo(cx(s.pts[i % 3][0]), cy(s.pts[i % 3][1]));
        if (sT >= 1) ctx.closePath();
        ctx.stroke(); ctx.restore();
        if (sT > 0.9) {
          const labels = s.labels || ["A", "B", "C"];
          for (let i = 0; i < 3; i++) {
            const [px, py] = s.pts[i];
            registerAvoidanceBox(cx(px) - 6, cy(py) - 6, 12, 12);
            drawAvoidanceText(ctx, labels[i], cx(px), cy(py), color, "bold 13px 'Sora',sans-serif");
          }
          if (s.sides) {
            for (let i = 0; i < Math.min(s.sides.length, 3); i++) {
              const p1 = s.pts[i], p2 = s.pts[(i + 1) % 3];
              drawAvoidanceText(ctx, s.sides[i], cx((p1[0] + p2[0]) / 2), cy((p1[1] + p2[1]) / 2), "#9ca3af", "11px 'Sora',sans-serif");
            }
          }
        }
      } else if (s.t === "rect") {
        const rw = Math.abs(cx(s.x + s.w) - cx(s.x));
        const rh = Math.abs(cy(s.y) - cy(s.y + s.h));
        const rx = cx(s.x); const ry = cy(s.y + s.h);
        ctx.beginPath(); ctx.rect(rx, ry, rw * sT, rh); ctx.stroke();
        ctx.restore();
        if (sT > 0.85) {
          ctx.save(); ctx.globalAlpha = sT * 0.15; ctx.fillStyle = color;
          ctx.fillRect(rx, ry, rw, rh); ctx.restore();
          registerAvoidanceBox(rx - 4, ry - 4, rw + 8, rh + 8);
          const fw = Number.isInteger(s.w) ? s.w : s.w.toFixed(1);
          const fh = Number.isInteger(s.h) ? s.h : s.h.toFixed(1);
          drawAvoidanceText(ctx, fw, rx + rw / 2, ry + rh, "#9ca3af", "11px 'Sora',sans-serif");
          drawAvoidanceText(ctx, fh, rx, ry + rh / 2, "#9ca3af", "11px 'Sora',sans-serif");
        }
      } else {
        ctx.restore();
      }
    });
    ctx.restore();

    if (viz.labels && t > 0.7) {
      for (const lbl of viz.labels) {
        drawAvoidanceText(ctx, lbl.text, cx(lbl.x), cy(lbl.y), "#9ca3af", "12px 'Sora',sans-serif");
      }
    }

  } else {
    drawGenericViz(ctx, data, panelW, panelH, t);
  }

  // "VISUALIZATION" label
  if (t > 0.05) {
    ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.05) / 0.15) * 0.5;
    ctx.font = "10px 'Sora',sans-serif"; ctx.fillStyle = "#6366f1"; ctx.textAlign = "left";
    ctx.fillText("▶ VISUALIZATION", pad.left, 16);
    ctx.restore();
  }

  ctx.restore();
}

function drawGenericViz(ctx, data, panelW, panelH, t) {
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
  ctx.fillText(data?.title || "DuoMCB Visualizing...", cx, cy + 50);
  ctx.restore();
}

// ── Inline Video Player (renders in chat message, not a modal overlay) ──
function InlineVideoPlayer({ question, imageBase64, sessionId }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  // ── Use a ref for isPlaying so the animation loop never needs it as a
  //    React dependency — prevents the loop from being cancelled/restarted
  //    on every setProgress() call which was causing the erratic bar.
  const isPlayingRef = useRef(false);
  const [isPlaying, setIsPlayingState] = useState(false);
  const [lang, setLang] = useState("vi"); // "vi" | "en"
  const [progress, setProgress] = useState(0);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [videoData, setVideoData] = useState(null);
  const frameRef = useRef(0);
  const progressTickRef = useRef(0); // throttle counter
  const totalFrames = 480;

  // Keep ref in sync with state (for buttons that toggle play/pause)
  function setIsPlaying(val) {
    const next = typeof val === "function" ? val(isPlayingRef.current) : val;
    isPlayingRef.current = next;
    setIsPlayingState(next);
  }

  useEffect(() => {
    async function fetchData() {
      setLoadingSteps(true);
      try {
        const { chat: chatFn } = await import("./duoServer");

        // ── Stage 1: Fetch EN and VI solutions in PARALLEL ─────────────────
        const makeStepPrompt = (lang) => {
          const langInstr = lang === "en"
            ? "Respond ONLY in English."
            : "Trả lời HOÀN TOÀN bằng tiếng Việt.";
          const endLine = lang === "en"
            ? 'End with "✓ Answer: [final answer]".'
            : 'Kết thúc bằng "✓ Đáp án: [kết quả cuối]"."';
          const base = imageBase64
            ? `You are a math tutor. Analyze the math problem in the provided image and give a COMPLETE, detailed step-by-step solution. ${langInstr}
Use LaTeX for ALL math expressions: inline $like this$, block $$like this$$.
Format as a numbered list (up to 10 steps). ${endLine}
ONLY output the solution steps. No preamble, no JSON, no code blocks.`
            : `You are a math tutor. Solve this math problem COMPLETELY step-by-step: "${question}"
${langInstr}
Use LaTeX for ALL math expressions: inline $like this$, block $$like this$$.
Format as a numbered list (up to 10 steps). ${endLine}
ONLY output the solution steps. No preamble, no JSON, no code blocks.`;
          return base;
        };

        const [solutionDataEN, solutionDataVI] = await Promise.all([
          chatFn(sessionId, makeStepPrompt("en"), { image: imageBase64 || null, mode: "solution" }),
          chatFn(sessionId, makeStepPrompt("vi"), { image: imageBase64 || null, mode: "solution" }),
        ]);

        const parseSteps = (reply) =>
          (reply || "")
            .split("\n")
            .map(l => l.replace(/^\d+[.)\s]+/, "").trim())
            .filter(l => l.length > 2)
            .slice(0, 10);

        const rawStepsEN = parseSteps(solutionDataEN?.reply);
        const rawStepsVI = parseSteps(solutionDataVI?.reply);
        // Use the English steps for viz-context classification
        const solutionReply = solutionDataEN?.reply || solutionDataVI?.reply || "";

        // Stage 2: Visualization JSON
        // We also pass rawSteps as context to help the AI classify the viz type
        const solutionContext = rawSteps.slice(0, 3).join(" | ");
        const vizSchemaDoc = `Types and their viz objects:
- quadratic  → {"a":N,"b":N,"c":N,"roots":[r1,r2],"vertex":[vx,vy],"xRange":[min,max],"yRange":[min,max]}
- linear     → {"lines":[{"m":N,"b":N,"label":"eq"}],"xRange":[min,max],"yRange":[min,max]}
- system     → {"lines":[{"m":N,"b":N,"label":"eq"},{"m":N,"b":N,"label":"eq"}],"intersection":{"x":N,"y":N},"xRange":[min,max],"yRange":[min,max]}
- geometry   → {"shapes":[{"t":"rect","x":N,"y":N,"w":N,"h":N},{"t":"circle","cx":N,"cy":N,"r":N},{"t":"triangle","pts":[[x1,y1],[x2,y2],[x3,y3]],"labels":["A","B","C"]}]}
- trigonometry → {"fn":"sin|cos|tan","amplitude":N,"period":N,"phase":N,"xRange":[min,max],"yRange":[min,max]}
- calculus   → {"a":N,"b":N,"c":N,"from":N,"to":N,"area":"STRING","xRange":[min,max],"yRange":[min,max]}
- other      → {}`;

        const vizPrompt = imageBase64
          ? `You are a math problem classifier. Look at the image carefully and classify the math problem type, then output the appropriate JSON visualization data.

Here are the first solution steps already extracted (use them to help classify):
"${solutionContext}"

Return ONLY a single valid JSON object with this schema:
{"type":"TYPE","title":"SHORT_TITLE_IN_PROBLEM_LANGUAGE","viz":VIZ_OBJECT}

${vizSchemaDoc}

Classification rules:
1. If the problem involves a SQUARE or RECTANGULAR tile/brick decorated with parabolic curves, petals, or flower shapes (viên gạch, gạch hoa, cánh hoa, parabol, tile) → type="geometry", title MUST contain "hoa" or "gạch", shapes=[{"t":"rect","x":0,"y":0,"w":SIDE,"h":SIDE}]
2. If the problem involves ax²+bx+c, quadratic equations, parabola graph, roots/delta → type="quadratic", extract a,b,c,roots,vertex
3. If the problem involves a line y=mx+b or linear equation → type="linear"
4. If the problem involves two equations/lines intersecting → type="system"
5. If the problem involves sin/cos/tan functions → type="trigonometry"
6. If the problem involves integrals or area under curve → type="calculus"
7. If the problem involves triangles, circles, rectangles (not tile petals) → type="geometry"
8. Otherwise → type="other"

Output ONLY the JSON. No markdown, no explanation, no extra text.`
          : `Given this math problem: "${question}"
Here are the first solution steps (use them to help classify):
"${solutionContext}"

Return ONLY a single valid JSON object:
{"type":"TYPE","title":"SHORT_TITLE","viz":VIZ_OBJECT}

${vizSchemaDoc}

Classification rules:
1. If problem involves parabola tile / flower petal tile / viên gạch / cánh hoa → type="geometry", title contains "hoa" or "gạch"
2. If ax²+bx+c, quadratic, roots/delta → type="quadratic"
3. Linear y=mx+b → type="linear"
4. Two intersecting lines → type="system"
5. sin/cos/tan → type="trigonometry"
6. Integral/area under curve → type="calculus"
7. Triangles, circles, rectangles (not petal tiles) → type="geometry"
8. Otherwise → type="other"

Output ONLY the JSON. No markdown, no extra text.`;

        const vizData = await chatFn(sessionId, vizPrompt, {
          image: imageBase64 || null,
          mode: "solution",
        });
        const vizReply = vizData?.reply || "";

        let vizParsed = { type: "other", title: question || "Math Problem", viz: {} };
        try {
          const cleaned = vizReply
            .replace(/```json\s*/gi, "")
            .replace(/```\s*/g, "")
            .trim();
          const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const obj = JSON.parse(jsonMatch[0]);
            vizParsed = {
              type: obj.type || "other",
              title: obj.title || question || "Math Problem",
              viz: obj.viz || {},
            };
          }
        } catch {
          // JSON parse failed — stick with generic viz
        }

        // ── Fallback: if AI returned "other" but solution text hints at a type,
        //    promote it to the right type so we show a useful visualization.
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
  // being cancelled and restarted on every setProgress() state update.
  // setProgress is throttled: only called every 8 frames (~7.5fps for the bar)
  // so React re-renders are infrequent and the bar moves smoothly.
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
      drawVisualizationPanel(ctx, videoData, W, H, t);
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
      // Throttle: update progress state only every 8 frames to avoid
      // flooding React with re-renders that would cancel this loop.
      progressTickRef.current = (progressTickRef.current + 1) % 8;
      if (progressTickRef.current === 0) {
        setProgress((frameRef.current / totalFrames) * 100);
      }
      animRef.current = requestAnimationFrame(tick);
    }

    drawFrame(frameRef.current);
    animRef.current = requestAnimationFrame(tick);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingSteps, videoData]); // NOT isPlaying — controlled via isPlayingRef

  const totalSec = Math.round(totalFrames / 30);

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
        {/* LEFT: visualization canvas */}
        <div className={styles.inlineVizPanel}>
          {loadingSteps ? (
            <div className={styles.videoLoadingOverlay}>
              <div className={styles.videoLoadingSpinner} />
              <p className={styles.videoLoadingText}>AI đang phân tích...</p>
            </div>
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

      {/* Progress bar */}
      <div className={styles.videoProgressBar}>
        <div className={styles.videoProgressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Controls */}
      <div className={styles.videoControls}>
        <div className={styles.videoControlsLeft}>
          <button className={styles.videoCtrlBtn} onClick={() => setIsPlaying(p => !p)} disabled={loadingSteps}>
            {isPlaying ? "⏸" : "▶"}
          </button>
          <button className={styles.videoCtrlBtn} onClick={() => { frameRef.current = 0; setProgress(0); setIsPlaying(true); }} disabled={loadingSteps}>
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
  const [imagePreview, setImagePreview] = useState(null);
  const [imageBase64, setImageBase64] = useState(null);
  const [showImageModal, setShowImageModal] = useState(false);
  const [savedHistory, setSavedHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem("duomcb_history") || "[]"); }
    catch { return []; }
  });
  const bottomRef = useRef(null);
  const inputRef = useRef(null);
  const fileInputRef = useRef(null);

  useEffect(() => { initSession(); }, []);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, loading]);

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

  function pushToHistory(firstMsg) {
    const title = firstMsg.substring(0, 44) + (firstMsg.length > 44 ? "…" : "");
    const entry = { id: Date.now(), title, date: new Date().toLocaleDateString("vi-VN") };
    const updated = [entry, ...savedHistory].slice(0, 20);
    setSavedHistory(updated);
    try { localStorage.setItem("duomcb_history", JSON.stringify(updated)); } catch {}
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
      if (messages.length === 0) pushToHistory("Bài toán từ ảnh");
      setMessages(prev => [...prev, videoMsg]);
      setImagePreview(null); setImageBase64(null);
      return;
    }
    const modeText = mode === "hint"
      ? "Provide A FEW HINTS to solve this problem without giving the answer"
      : "Look at the problem in this image and solve it STEP BY STEP for me.";
    const userMsg = { role: "user", content: modeText, image: imagePreview, id: Date.now() };
    setMessages(prev => [...prev, userMsg]);
    if (messages.length === 0) pushToHistory(modeText);
    setLoading(true);
    const sid = await ensureSession();
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
      if (messages.length === 0) pushToHistory(msg);
      setMessages(prev => [...prev, {
        id: Date.now(), role: "assistant", type: "video",
        question: msg, imageBase64: null, sessionId: sid,
      }]);
      setInput("");
      return;
    }

    setInput("");
    if (messages.length === 0) pushToHistory(msg);
    const sid = await ensureSession();
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

      {/* ── SIDEBAR ── */}
      <aside className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarOpen : styles.sidebarClosed}`}>
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
                <button key={h.id} className={styles.historyItem} onClick={newChat}>
                  <span className={styles.historyIcon}>💬</span>
                  <span className={styles.historyTitle}>{h.title}</span>
                </button>
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
