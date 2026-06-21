"use client";
import { useState, useEffect, useRef } from "react";
import styles from "./DuoMCBPage.module.css";
import Image from "next/image";
import { createSession, chat } from "./duoServer";
import Link from "next/link";
import katex from "katex";
import "katex/dist/katex.min.css";

const SUGGESTED = [
  { icon: "📐", text: "Solve x² - 5x + 6 = 0 step by step" },
  { icon: "📊", text: "Explain mean, median and standard deviation" },
  { icon: "📝", text: "Give me bilingual exercises on trigonometry" },
  { icon: "🧪", text: "What is Newton's second law of motion?" },
];

const TOOLS = [
  { id: "hint",     icon: "💡", label: "Gợi Ý Socratic",     desc: "Hướng dẫn từng bước nhỏ" },
  { id: "solution", icon: "📖", label: "Giải Đầy Đủ",        desc: "Lời giải chi tiết hoàn chỉnh" },
  { id: "video",    icon: "🎬", label: "Tạo Video Giải",      desc: "Video hoạt hình giải bài" },
];

// ── LaTeX & Markdown Parser Helper Functions ────────────────────────────────
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

// ── Math Visualization Helpers (pure canvas drawing) ─────────────────────

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

function drawVisualizationPanel(ctx, data, panelW, panelH, t) {
  const type = data.type || "other";
  const viz = data.viz || {};
  const pad = { top: 44, bottom: 36, left: 42, right: 14 };
  const plotW = panelW - pad.left - pad.right;
  const plotH = panelH - pad.top - pad.bottom;

  ctx.save();

  if (type === "quadratic" || type === "calculus") {
    const xRange = viz.xRange || [-4, 6];
    const yRange = viz.yRange || [-3, 8];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    const axesT = Math.min(1, t / 0.25);
    drawAxes(ctx, xRange, yRange, pad, plotW, plotH, axesT);

    // Draw parabola / curve
    const curveT = Math.min(1, Math.max(0, (t - 0.2) / 0.5));
    if (curveT > 0) {
      const { a = 1, b = 0, c = 0 } = viz;
      const totalPts = 120;
      const drawPts = Math.floor(totalPts * curveT);
      ctx.save();
      ctx.strokeStyle = "#00d8fe"; ctx.lineWidth = 2.5;
      ctx.shadowColor = "#00d8fe"; ctx.shadowBlur = 10;
      ctx.beginPath();
      let started = false;
      for (let i = 0; i <= drawPts; i++) {
        const mx = xRange[0] + (i / totalPts) * (xRange[1] - xRange[0]);
        const my = a * mx * mx + b * mx + c;
        if (my < yRange[0] - 2 || my > yRange[1] + 2) { ctx.stroke(); ctx.beginPath(); started = false; continue; }
        if (!started) { ctx.moveTo(cx(mx), cy(my)); started = true; } else ctx.lineTo(cx(mx), cy(my));
      }
      ctx.stroke();
      ctx.restore();

      // Shade area for calculus
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
        if (viz.area != null) {
          ctx.font = "bold 12px 'Sora',sans-serif"; ctx.fillStyle = "#c4b5fd"; ctx.textAlign = "center";
          ctx.fillText(`S ≈ ${viz.area}`, cx((from + to) / 2), cy(0) - 10);
        }
        ctx.restore();
      }
    }

    // Roots
    const rootT = Math.min(1, Math.max(0, (t - 0.72) / 0.18));
    if (rootT > 0 && viz.roots && viz.roots.length) {
      ctx.save(); ctx.globalAlpha = rootT;
      for (const root of viz.roots) {
        if (root < xRange[0] || root > xRange[1]) continue;
        ctx.fillStyle = "#f59e0b"; ctx.shadowColor = "#f59e0b"; ctx.shadowBlur = 12;
        ctx.beginPath(); ctx.arc(cx(root), cy(0), 5.5, 0, Math.PI * 2); ctx.fill();
        ctx.shadowBlur = 0; ctx.font = "bold 12px 'Sora',sans-serif"; ctx.fillStyle = "#fbbf24"; ctx.textAlign = "center";
        const fmtRoot = Number.isInteger(root) ? root : root.toFixed(2);
        ctx.fillText(`x=${fmtRoot}`, cx(root), cy(0) - 14);
      }
      ctx.restore();
    }

    // Vertex
    const vtxT = Math.min(1, Math.max(0, (t - 0.82) / 0.18));
    if (vtxT > 0 && viz.vertex) {
      const [vx, vy] = viz.vertex;
      ctx.save(); ctx.globalAlpha = vtxT;
      ctx.fillStyle = "#a78bfa"; ctx.shadowColor = "#a78bfa"; ctx.shadowBlur = 12;
      ctx.beginPath(); ctx.arc(cx(vx), cy(vy), 5.5, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.font = "bold 11px 'Sora',sans-serif"; ctx.fillStyle = "#c4b5fd"; ctx.textAlign = "center";
      const fvx = Number.isInteger(vx) ? vx : vx.toFixed(2);
      const fvy = Number.isInteger(vy) ? vy : vy.toFixed(2);
      ctx.fillText(`(${fvx},${fvy})`, cx(vx), cy(vy) + 17);
      ctx.restore();
    }

  } else if (type === "linear" || type === "system") {
    const xRange = viz.xRange || [-5, 5];
    const yRange = viz.yRange || [-5, 8];
    const { cx, cy } = mkToCanvas(xRange, yRange, pad, plotW, plotH);
    drawAxes(ctx, xRange, yRange, pad, plotW, plotH, Math.min(1, t / 0.25));

    const lineColors = ["#00d8fe", "#f59e0b", "#a78bfa", "#4ade80"];
    const lines = viz.lines || [];
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
        if (my < yRange[0] - 1 || my > yRange[1] + 1) { ctx.stroke(); ctx.beginPath(); s2 = false; continue; }
        if (!s2) { ctx.moveTo(cx(mx), cy(my)); s2 = true; } else ctx.lineTo(cx(mx), cy(my));
      }
      ctx.stroke();
      if (line.label && lT > 0.75) {
        const midMx = (xRange[0] + xRange[1]) / 2;
        const midMy = line.m * midMx + line.b;
        if (midMy >= yRange[0] && midMy <= yRange[1]) {
          ctx.shadowBlur = 0; ctx.font = "bold 12px 'Sora',sans-serif"; ctx.fillStyle = color; ctx.textAlign = "left";
          ctx.fillText(line.label, cx(midMx) + 8, cy(midMy) - 8);
        }
      }
      ctx.restore();
    });

    if (viz.intersection && t > 0.78) {
      const iT = Math.min(1, (t - 0.78) / 0.18);
      const { x: ix, y: iy } = viz.intersection;
      ctx.save(); ctx.globalAlpha = iT;
      ctx.fillStyle = "#4ade80"; ctx.shadowColor = "#4ade80"; ctx.shadowBlur = 14;
      ctx.beginPath(); ctx.arc(cx(ix), cy(iy), 7, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0; ctx.font = "bold 12px 'Sora',sans-serif"; ctx.fillStyle = "#4ade80"; ctx.textAlign = "left";
      const fix = Number.isInteger(ix) ? ix : ix.toFixed(2);
      const fiy = Number.isInteger(iy) ? iy : iy.toFixed(2);
      ctx.fillText(`(${fix}, ${fiy})`, cx(ix) + 10, cy(iy) - 8);
      ctx.restore();
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

      // Pi labels on x axis
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
    if (shapes.length === 0) { drawGenericViz(ctx, data, panelW, panelH, t); ctx.restore(); return; }

    // Fit all shapes into viewport
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

    shapes.forEach((s, idx) => {
      const sT = Math.min(1, Math.max(0, (t - 0.15 - idx * 0.12) / 0.45));
      if (sT <= 0) return;
      const color = s.color || shapeColors[idx % shapeColors.length];
      ctx.save(); ctx.globalAlpha = sT; ctx.strokeStyle = color; ctx.lineWidth = 2.5;
      ctx.shadowColor = color; ctx.shadowBlur = 12;

      if (s.t === "circle") {
        // Draw circle arc progressively
        const endAngle = Math.PI * 2 * sT;
        ctx.beginPath(); ctx.arc(cx(s.cx), cy(s.cy), Math.abs(cx(s.cx + s.r) - cx(s.cx)), 0, endAngle); ctx.stroke();
        if (sT > 0.8) {
          ctx.shadowBlur = 0; ctx.setLineDash([4, 4]); ctx.lineWidth = 1.5; ctx.strokeStyle = color;
          ctx.beginPath(); ctx.moveTo(cx(s.cx), cy(s.cy)); ctx.lineTo(cx(s.cx + s.r), cy(s.cy)); ctx.stroke();
          ctx.setLineDash([]);
          ctx.font = "bold 12px 'Sora',sans-serif"; ctx.fillStyle = color; ctx.textAlign = "left";
          const fmtR = Number.isInteger(s.r) ? s.r : s.r.toFixed(2);
          ctx.fillText(`r=${fmtR}`, cx(s.cx + s.r / 2) + 4, cy(s.cy) - 8);
          // Center dot
          ctx.fillStyle = color; ctx.shadowBlur = 0;
          ctx.beginPath(); ctx.arc(cx(s.cx), cy(s.cy), 3.5, 0, Math.PI * 2); ctx.fill();
        }
      } else if (s.t === "triangle" && s.pts && s.pts.length === 3) {
        const numSides = Math.floor(3 * sT);
        ctx.beginPath(); ctx.moveTo(cx(s.pts[0][0]), cy(s.pts[0][1]));
        for (let i = 1; i <= numSides; i++) ctx.lineTo(cx(s.pts[i % 3][0]), cy(s.pts[i % 3][1]));
        if (sT >= 1) ctx.closePath();
        ctx.stroke();
        if (sT > 0.9) {
          ctx.shadowBlur = 0; ctx.globalAlpha = sT * 0.18; ctx.fillStyle = color; ctx.fill();
          ctx.globalAlpha = sT;
          const labels = s.labels || ["A", "B", "C"];
          ctx.font = "bold 13px 'Sora',sans-serif"; ctx.fillStyle = color;
          for (let i = 0; i < 3; i++) {
            const [px, py] = s.pts[i];
            const offX = px < (minX + maxX) / 2 ? -18 : 10;
            const offY = py < (minY + maxY) / 2 ? 15 : -8;
            ctx.textAlign = "left"; ctx.fillText(labels[i], cx(px) + offX, cy(py) + offY);
          }
          // Side lengths
          if (s.sides) {
            ctx.font = "11px 'Sora',sans-serif"; ctx.fillStyle = "#9ca3af";
            for (let i = 0; i < Math.min(s.sides.length, 3); i++) {
              const p1 = s.pts[i], p2 = s.pts[(i + 1) % 3];
              ctx.textAlign = "center";
              ctx.fillText(s.sides[i], cx((p1[0] + p2[0]) / 2), cy((p1[1] + p2[1]) / 2) - 8);
            }
          }
        }
      } else if (s.t === "rect") {
        const rw = Math.abs(cx(s.x + s.w) - cx(s.x));
        const rh = Math.abs(cy(s.y) - cy(s.y + s.h));
        const rx = cx(s.x); const ry = cy(s.y + s.h);
        // Animate drawing by clipping width progressively
        ctx.beginPath(); ctx.rect(rx, ry, rw * sT, rh); ctx.stroke();
        if (sT > 0.85) {
          ctx.shadowBlur = 0; ctx.globalAlpha = sT * 0.15; ctx.fillStyle = color;
          ctx.fillRect(rx, ry, rw, rh);
          ctx.globalAlpha = sT;
          ctx.font = "11px 'Sora',sans-serif"; ctx.fillStyle = "#9ca3af"; ctx.textAlign = "center";
          const fw = Number.isInteger(s.w) ? s.w : s.w.toFixed(1);
          const fh = Number.isInteger(s.h) ? s.h : s.h.toFixed(1);
          ctx.fillText(fw, rx + rw / 2, ry + rh + 14);
          ctx.fillText(fh, rx - 16, ry + rh / 2);
        }
      }
      ctx.restore();
    });

    // Extra labels
    if (viz.labels && t > 0.7) {
      ctx.save(); ctx.globalAlpha = Math.min(1, (t - 0.7) / 0.2);
      ctx.font = "12px 'Sora',sans-serif"; ctx.fillStyle = "#9ca3af"; ctx.textAlign = "center";
      for (const lbl of viz.labels) ctx.fillText(lbl.text, cx(lbl.x), cy(lbl.y));
      ctx.restore();
    }

  } else {
    drawGenericViz(ctx, data, panelW, panelH, t);
  }

  // "Visualization" label
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
  // Animated rings
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
  // Pulsing center
  const pulse = 1 + 0.06 * Math.sin(t * Math.PI * 8);
  ctx.save(); ctx.globalAlpha = Math.min(1, t / 0.2);
  ctx.fillStyle = "#00d8fe"; ctx.shadowColor = "#00d8fe"; ctx.shadowBlur = 20;
  ctx.beginPath(); ctx.arc(cx, cy, 12 * pulse, 0, Math.PI * 2); ctx.fill();
  ctx.restore();
  // Label
  ctx.save(); ctx.globalAlpha = Math.min(1, Math.max(0, (t - 0.4) / 0.2));
  ctx.font = "bold 13px 'Sora',sans-serif"; ctx.fillStyle = "#6b7280"; ctx.textAlign = "center";
  ctx.fillText(data.title || "Giải bài toán", cx, cy + 60);
  ctx.restore();
}

function drawStepsPanel(ctx, steps, startX, panelW, panelH, t) {
  if (!steps || steps.length === 0) return;
  const lineH = Math.min(34, (panelH - 40) / steps.length);
  const startY = 28;

  // Panel label
  ctx.save(); ctx.globalAlpha = Math.min(1, t / 0.15) * 0.55;
  ctx.font = "10px 'Sora',sans-serif"; ctx.fillStyle = "#6366f1"; ctx.textAlign = "left";
  ctx.fillText("▶ SOLUTION", startX, 16);
  ctx.restore();

  steps.forEach((step, i) => {
    const stepStart = i / steps.length;
    const stepEnd = (i + 0.5) / steps.length;
    const sT = Math.min(1, Math.max(0, (t - stepStart * 0.85) / ((stepEnd - stepStart) * 0.85 + 0.12)));
    if (sT <= 0) return;

    const y = startY + i * lineH + lineH * 0.6;
    const isAnswer = step.startsWith("✓") || step.toLowerCase().includes("answer") || step.toLowerCase().includes("kết quả");
    const isTitle = i === 0;
    const color = isAnswer ? "#4ade80" : isTitle ? "#9ca3af" : "#e5e7eb";
    const fontSize = isTitle ? 11 : isAnswer ? 13 : 12;

    // Active step underline
    if (sT < 1 && !isTitle) {
      ctx.save(); ctx.globalAlpha = sT * 0.6;
      ctx.fillStyle = "#6366f1";
      ctx.fillRect(startX, y + 5, panelW * 0.9 * sT, 1.5);
      ctx.restore();
    }

    ctx.save();
    ctx.globalAlpha = Math.min(1, sT * 2.5);

    // Bullet dot for non-title steps
    if (!isTitle) {
      ctx.fillStyle = isAnswer ? "#4ade80" : "#6366f1";
      ctx.shadowColor = isAnswer ? "#4ade80" : "#6366f1";
      ctx.shadowBlur = isAnswer ? 8 : 4;
      ctx.beginPath(); ctx.arc(startX + 5, y - 3, 3, 0, Math.PI * 2); ctx.fill();
      ctx.shadowBlur = 0;
    }

    ctx.font = `${isAnswer ? "bold " : ""}${fontSize}px 'Sora',sans-serif`;
    ctx.fillStyle = color;
    ctx.textAlign = "left";

    // Typewriter reveal for current step
    const textX = isTitle ? startX : startX + 14;
    const maxW = panelW - (isTitle ? 4 : 18);
    const chars = isTitle ? step.length : Math.floor(step.length * Math.min(1, sT * 1.8));
    const displayText = step.substring(0, chars);

    // Word wrap naively in canvas
    wrapText(ctx, displayText, textX, y, maxW, fontSize + 4);
    ctx.restore();
  });
}

function wrapText(ctx, text, x, y, maxW, lineH) {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  for (const word of words) {
    const test = line ? line + " " + word : word;
    if (ctx.measureText(test).width > maxW && line) {
      ctx.fillText(line, x, curY);
      line = word; curY += lineH;
      if (curY > y + lineH * 2) { ctx.fillText(line + "…", x, curY); return; }
    } else line = test;
  }
  if (line) ctx.fillText(line, x, curY);
}

// ── Video Player Modal ────────────────────────────────────────────────────
function VideoModal({ question, imageBase64, sessionId, onClose }) {
  const canvasRef = useRef(null);
  const animRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [shared, setShared] = useState(false);
  const [loadingSteps, setLoadingSteps] = useState(true);
  const [videoData, setVideoData] = useState(null);
  const frameRef = useRef(0);
  const totalFrames = 480; // ~16 seconds at 30fps

  // Fetch structured visualization data from AI
  useEffect(() => {
    async function fetchData() {
      setLoadingSteps(true);
      try {
        const vizPrompt = imageBase64
          ? `Analyze the math problem in this image. Return ONLY valid JSON (no markdown, no explanation, no code blocks). Use this schema:
{"type":"quadratic|linear|system|geometry|trigonometry|calculus|other","title":"short title","steps":["Step 1: ...","Step 2: ...","✓ Answer: ..."],"viz":{}}
For viz based on type:
- quadratic: {"a":1,"b":-5,"c":6,"roots":[2,3],"vertex":[2.5,-0.25],"xRange":[-1,6],"yRange":[-2,5]}
- linear: {"lines":[{"m":2,"b":1,"label":"y=2x+1"}],"xRange":[-3,5],"yRange":[-4,8]}
- system: {"lines":[{"m":2,"b":1,"label":"L1"},{"m":-1,"b":4,"label":"L2"}],"intersection":{"x":1,"y":3},"xRange":[-2,5],"yRange":[-2,7]}
- geometry: {"shapes":[{"t":"circle","cx":0,"cy":0,"r":5}]}  or  {"shapes":[{"t":"triangle","pts":[[0,0],[4,0],[2,3]],"labels":["A","B","C"],"sides":["4","3","5"]}]}  or  {"shapes":[{"t":"rect","x":0,"y":0,"w":4,"h":3}]}
- trigonometry: {"fn":"sin","amplitude":1,"period":6.283,"phase":0,"xRange":[0,6.28],"yRange":[-1.6,1.6]}
- calculus: {"a":1,"b":-4,"c":0,"from":0,"to":4,"area":"10.67","xRange":[-1,5],"yRange":[-3,5]}
- other: {}`
          : `Analyze this math problem: "${question}"
Return ONLY valid JSON (no markdown, no explanation). Schema:
{"type":"quadratic|linear|system|geometry|trigonometry|calculus|other","title":"short title","steps":["Step 1: ...","Step 2: ...","✓ Answer: ..."],"viz":{}}
For viz based on type:
- quadratic: {"a":1,"b":-5,"c":6,"roots":[2,3],"vertex":[2.5,-0.25],"xRange":[-1,6],"yRange":[-2,5]}
- linear: {"lines":[{"m":2,"b":1,"label":"y=2x+1"}],"xRange":[-3,5],"yRange":[-4,8]}
- system: {"lines":[{"m":2,"b":1,"label":"L1"},{"m":-1,"b":4,"label":"L2"}],"intersection":{"x":1,"y":3},"xRange":[-2,5],"yRange":[-2,7]}
- geometry: {"shapes":[{"t":"circle","cx":0,"cy":0,"r":5}]}  or  {"shapes":[{"t":"triangle","pts":[[0,0],[4,0],[2,3]],"labels":["A","B","C"],"sides":["4","3","5"]}]}  or  {"shapes":[{"t":"rect","x":0,"y":0,"w":4,"h":3}]}
- trigonometry: {"fn":"sin","amplitude":1,"period":6.283,"phase":0,"xRange":[0,6.28],"yRange":[-1.6,1.6]}
- calculus: {"a":1,"b":-4,"c":0,"from":0,"to":4,"area":"10.67","xRange":[-1,5],"yRange":[-3,5]}
- other: {}`;

        const { chat: chatFn } = await import("./duoServer");
        const data = await chatFn(sessionId, vizPrompt, {
          image: imageBase64 || null,
          mode: "solution",
        });

        const reply = data?.reply || "";
        let parsed = null;
        try {
          // Extract JSON from response (handles markdown code blocks too)
          const jsonMatch = reply.match(/```(?:json)?\s*([\s\S]*?)```/) || reply.match(/(\{[\s\S]*\})/);
          const jsonStr = jsonMatch ? jsonMatch[1].trim() : reply.trim();
          parsed = JSON.parse(jsonStr);
          // Ensure steps array exists and has content
          if (!parsed.steps || parsed.steps.length === 0) {
            parsed.steps = ["Giải bài toán", "Bước 1: Phân tích đề bài", "Bước 2: Áp dụng công thức", "✓ Hoàn thành"];
          }
        } catch {
          // AI didn't return valid JSON — parse as plain text steps
          const rawLines = reply.split("\n").map(l => l.trim()).filter(Boolean);
          const steps = [question ? question.substring(0, 50) : "Giải bài toán..."];
          for (const line of rawLines) {
            const clean = line.replace(/^#+\s*/, "").replace(/^\*\*(.+)\*\*$/, "$1").trim();
            if (clean.length > 3) steps.push(clean.substring(0, 72));
            if (steps.length >= 7) break;
          }
          parsed = { type: "other", title: question || "Math Problem", steps, viz: {} };
        }
        setVideoData(parsed);
      } catch {
        setVideoData({
          type: "other",
          title: question || "Math Problem",
          steps: ["Bước 1: Đọc và hiểu đề bài", "Bước 2: Xác định phương pháp", "Bước 3: Tính toán", "✓ Kiểm tra kết quả"],
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

  // Canvas animation — split panel: left = visualization, right = steps
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || loadingSteps || !videoData) return;
    const ctx = canvas.getContext("2d");
    const W = 800; const H = 450;
    canvas.width = W; canvas.height = H;
    const vizW = Math.floor(W * 0.54); // left panel width
    const divX = vizW + 12;
    const stepsX = divX + 16;
    const stepsPanelW = W - stepsX - 12;

    function drawFrame(frame) {
      const t = frame / totalFrames;

      // Background
      ctx.fillStyle = "#0a0a0f";
      ctx.fillRect(0, 0, W, H);

      // Subtle dot grid
      ctx.fillStyle = "rgba(99,102,241,0.06)";
      for (let gx = 20; gx < W; gx += 40) {
        for (let gy = 20; gy < H; gy += 40) {
          ctx.beginPath(); ctx.arc(gx, gy, 1, 0, Math.PI * 2); ctx.fill();
        }
      }

      // Panel divider (glowing vertical line)
      const divAlpha = Math.min(1, t / 0.12);
      ctx.save();
      ctx.globalAlpha = divAlpha * 0.35;
      const grad = ctx.createLinearGradient(divX, 0, divX, H);
      grad.addColorStop(0, "transparent");
      grad.addColorStop(0.3, "#6366f1");
      grad.addColorStop(0.7, "#6366f1");
      grad.addColorStop(1, "transparent");
      ctx.strokeStyle = grad; ctx.lineWidth = 1;
      ctx.beginPath(); ctx.moveTo(divX, 0); ctx.lineTo(divX, H); ctx.stroke();
      ctx.restore();

      // ── Left: math visualization ──
      ctx.save();
      ctx.beginPath(); ctx.rect(0, 0, vizW, H); ctx.clip();
      drawVisualizationPanel(ctx, videoData, vizW, H, t);
      ctx.restore();

      // ── Right: solution steps ──
      ctx.save();
      ctx.beginPath(); ctx.rect(stepsX, 0, stepsPanelW, H); ctx.clip();
      ctx.translate(stepsX, 0);
      drawStepsPanel(ctx, videoData.steps || [], 0, stepsPanelW, H, t);
      ctx.restore();

      // Watermark
      ctx.save();
      ctx.globalAlpha = 0.2;
      ctx.font = "10px 'Sora',sans-serif";
      ctx.fillStyle = "#00d8fe"; ctx.textAlign = "left";
      ctx.fillText("DuoMath AI Video", 10, H - 8);
      ctx.restore();
    }

    function animate() {
      if (!isPlaying) return;
      frameRef.current = (frameRef.current + 1) % totalFrames;
      drawFrame(frameRef.current);
      setProgress((frameRef.current / totalFrames) * 100);
      animRef.current = requestAnimationFrame(animate);
    }

    drawFrame(frameRef.current);
    if (isPlaying) animRef.current = requestAnimationFrame(animate);
    return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
  }, [isPlaying, loadingSteps, videoData]);

  function togglePlay() { setIsPlaying(p => !p); }
  function handleShare() {
    setShared(true);
    setTimeout(() => setShared(false), 2000);
    navigator.clipboard?.writeText(window.location.href).catch(() => {});
  }

  const totalSec = Math.round(totalFrames / 30);

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.videoModal} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className={styles.videoModalHeader}>
          <div className={styles.videoModalTitle}>
            <span className={styles.videoModalIcon}>🎬</span>
            <span>DuoMath Video Giải</span>
            <span className={styles.videoBadge}>AI Generated</span>
            {videoData && videoData.type !== "other" && (
              <span className={styles.videoTypeBadge}>{videoData.type}</span>
            )}
          </div>
          <button className={styles.modalClose} onClick={onClose}>✕</button>
        </div>

        {/* Canvas player */}
        <div className={styles.videoWrapper}>
          {loadingSteps ? (
            <div className={styles.videoLoadingOverlay}>
              <div className={styles.videoLoadingSpinner} />
              <p className={styles.videoLoadingText}>AI đang phân tích và tạo visualization...</p>
            </div>
          ) : (
            <canvas ref={canvasRef} className={styles.videoCanvas} />
          )}
          {/* Progress bar */}
          <div className={styles.videoProgressBar}>
            <div className={styles.videoProgressFill} style={{ width: `${progress}%` }} />
          </div>
        </div>

        {/* Controls */}
        <div className={styles.videoControls}>
          <div className={styles.videoControlsLeft}>
            <button className={styles.videoCtrlBtn} onClick={togglePlay} title={isPlaying ? "Pause" : "Play"} disabled={loadingSteps}>
              {isPlaying ? "⏸" : "▶"}
            </button>
            <button className={styles.videoCtrlBtn} onClick={() => { frameRef.current = 0; setProgress(0); }} title="Replay" disabled={loadingSteps}>
              🔄
            </button>
            <span className={styles.videoDuration}>
              {Math.floor((progress / 100) * totalSec)}s / {totalSec}s
            </span>
          </div>
          <button
            className={`${styles.shareBtn} ${shared ? styles.shareBtnSuccess : ""}`}
            onClick={handleShare}
          >
            {shared ? "✓ Đã sao chép!" : "🔗 Chia sẻ Video"}
          </button>
        </div>

        {/* Problem label */}
        {question && (
          <div className={styles.videoProblemLabel}>
            <span className={styles.videoProblemIcon}>📝</span>
            <span className={styles.videoProblemText}>{question}</span>
          </div>
        )}
      </div>
    </div>
  );
}


// ── Tools Dropdown ─────────────────────────────────────────────────────────
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
  const [videoQuestion, setVideoQuestion] = useState(null);
  const [videoImage, setVideoImage] = useState(null);
  const [showVideo, setShowVideo] = useState(false);
  const [chatHistory] = useState([
    { id: 1, title: "Quadratic equations help", date: "Today" },
    { id: 2, title: "Statistics exercises", date: "Today" },
    { id: 3, title: "Newton's laws review", date: "Yesterday" },
  ]);
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

  // ── Image file selection ──
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

  // ── Send image with chosen mode ──
  async function sendImageMessage(mode) {
    setShowImageModal(false);
    if (mode === "video") {
      setVideoQuestion(input.trim() || "Bài toán từ ảnh");
      setVideoImage(imageBase64); // pass the image so VideoModal can analyze it
      setShowVideo(true);
      return;
    }
    const modeText = mode === "hint"
      ? "Provide A FEW HINTS to solve this problem without giving the answer"
      : "Look at the problem in this image and solve it STEP BY STEP for me.";

    const userMsg = { role: "user", content: modeText, image: imagePreview, id: Date.now() };
    setMessages((prev) => [...prev, userMsg]);
    setLoading(true);

    const sid = await ensureSession();

    try {
      const data = await chat(sid, modeText, { image: imageBase64, mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error("bad response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply || data.error, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Không thể xử lý ảnh. Vui lòng thử lại sau.", id: Date.now() + 1 }]);
    } finally {
      setLoading(false);
      setImagePreview(null);
      setImageBase64(null);
    }
  }

  // ── Send text message ──
  async function sendMessage(text, mode = "hint") {
    const msg = text || input.trim();
    if (!msg || loading) return;

    if (mode === "video") {
      setVideoQuestion(msg);
      setVideoImage(null); // text-only, no image
      setShowVideo(true);
      setInput("");
      return;
    }

    setInput("");
    const sid = await ensureSession();
    setMessages((prev) => [...prev, { role: "user", content: msg, id: Date.now() }]);
    setLoading(true);
    try {
      const data = await chat(sid, msg, { mode: mode === "hint" ? "hint" : "solution" });
      if (data.error) throw new Error("bad response");
      setMessages((prev) => [...prev, { role: "assistant", content: data.reply, id: Date.now() + 1 }]);
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "⚠️ Không thể kết nối với máy chủ DuoMCB. Vui lòng thử lại sau.", id: Date.now() + 1 }]);
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
    setMessages([]);
    initSession();
    inputRef.current?.focus();
  }

  const isEmpty = messages.length === 0;

  return (
    <div className={styles.root}>

      {/* ── VIDEO MODAL ── */}
      {showVideo && (
        <VideoModal
          question={videoQuestion}
          imageBase64={videoImage}
          sessionId={sessionId}
          onClose={() => { setShowVideo(false); setVideoImage(null); }}
        />
      )}

      {/* ── IMAGE MODAL ── */}
      {showImageModal && (
        <div className={styles.modalOverlay} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>
          <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <span>🖼️ Ảnh đã tải lên</span>
              <button className={styles.modalClose} onClick={() => { setShowImageModal(false); setImagePreview(null); setImageBase64(null); }}>✕</button>
            </div>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={imagePreview} alt="Preview" className={styles.modalPreview} />
            <p className={styles.modalQuestion}>Bạn muốn DuoMCB làm gì với bài toán này?</p>
            <div className={styles.modalActions}>
              <button className={styles.hintBtn} onClick={() => sendImageMessage("hint")}>
                💡 Gợi ý
              </button>
              <button className={styles.answerBtn} onClick={() => sendImageMessage("answer")}>
                📖 Giải đầy đủ
              </button>
              <button className={styles.videoModalBtn} onClick={() => sendImageMessage("video")}>
                🎬 Video Giải
              </button>
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
              {chatHistory.map((h) => (
                <button key={h.id} className={styles.historyItem}>
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
          <div className={styles.headerActions}> <Link href="/">Go back</Link></div>
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
              {messages.map((m) => (
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
                      if (token.type === "text") {
                        return renderTextWithMarkdown(token.content, idx, styles);
                      } else {
                        try {
                          const html = katex.renderToString(token.content.trim(), {
                            displayMode: token.isBlock,
                            throwOnError: false
                          });
                          return (
                            <span 
                              key={idx} 
                              dangerouslySetInnerHTML={{ __html: html }} 
                              style={token.isBlock ? { display: "block", margin: "0.5em 0" } : {}}
                            />
                          );
                        } catch (err) {
                          return <code key={idx}>{token.content}</code>;
                        }
                      }
                    })}
                  </div>
                  {m.role === "user" && <div className={styles.userAvatar}>👤</div>}
                </div>
              ))}
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
            <button className={styles.imageBtn} onClick={() => fileInputRef.current?.click()} title="Tải ảnh lên" disabled={loading}>
              +
            </button>
            <textarea
              ref={inputRef}
              className={styles.input}
              placeholder="Hỏi DuoMCB... hoặc tải ảnh đề bài lên"
              value={input}
              rows={1}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); sendMessage(null, "hint"); } }}
            />
            {/* Tools dropdown */}
            <ToolsDropdown onSelect={handleToolSelect} disabled={loading} />
            <button
              className={`${styles.sendBtn} ${input.trim() && !loading ? styles.sendActive : ""}`}
              onClick={() => sendMessage(null, "hint")}
              disabled={!input.trim() || loading}
              title="Gửi (Hint mặc định)"
            >➤</button>
          </div>
          <p className={styles.disclaimer}>DuoMCB có thể mắc lỗi. Hãy kiểm tra lại các đáp án quan trọng.</p>
        </div>
      </main>
    </div>
  );
}
