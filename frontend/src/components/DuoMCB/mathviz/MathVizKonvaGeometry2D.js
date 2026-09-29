'use client';
import { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import Konva from 'konva';
import {
  RotateCcw, Plus, Trash2, ZoomIn, ZoomOut, Maximize2, Minimize2,
  Move, Palette, Download, Sparkles, Link2
} from 'lucide-react';
import MathVizTitle from './MathVizTitle';
import GgbExportButton from '../../duomath/GgbExportButton';
// Đợt 8 / 4I: the shared vocabulary + the generic point walk, so this engine
// stops keeping its own list of "kinds that have points".
import { collectLayerPoints, canonicalKind, ENGINE_SUPPORT } from '@/lib/mathvizKinds';
// Đợt 8 / 4I: outline sampling shared with the JSXGraph engine, so a `region`
// (straight edges and arcs in one closed path) and an `ellipse` use ONE definition
// of where the curve goes instead of two that can disagree.
import {
  sampleArcPoints, sampleEllipse, sampleSectorOutline, sampleRegionOutline, pointsToFlat,
} from '@/lib/mathvizOutline';

const CANVAS_SIZE = 520;
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

function dist(a, b) {
  return Math.hypot(a.x - b.x, a.y - b.y);
}

function angleAtDeg(points, i) {
  const n = points.length;
  const prev = points[(i - 1 + n) % n], cur = points[i], next = points[(i + 1) % n];
  const v1 = { x: prev.x - cur.x, y: prev.y - cur.y };
  const v2 = { x: next.x - cur.x, y: next.y - cur.y };
  const mag = Math.hypot(v1.x, v1.y) * Math.hypot(v2.x, v2.y);
  if (mag === 0) return 0;
  const cos = Math.min(1, Math.max(-1, (v1.x * v2.x + v1.y * v2.y) / mag));
  return (Math.acos(cos) * 180) / Math.PI;
}

function polygonArea(points) {
  let sum = 0;
  const n = points.length;
  for (let i = 0; i < n; i++) {
    const p = points[i], q = points[(i + 1) % n];
    sum += p.x * q.y - q.x * p.y;
  }
  return Math.abs(sum) / 2;
}

function centroidOf(points) {
  const n = points.length;
  return { x: points.reduce((s, p) => s + p.x, 0) / n, y: points.reduce((s, p) => s + p.y, 0) / n };
}

function circumcenter(A, B, C) {
  const d = 2 * (A.x * (B.y - C.y) + B.x * (C.y - A.y) + C.x * (A.y - B.y));
  if (Math.abs(d) < 1e-9) return null;
  const ux = ((A.x ** 2 + A.y ** 2) * (B.y - C.y) + (B.x ** 2 + B.y ** 2) * (C.y - A.y) + (C.x ** 2 + C.y ** 2) * (A.y - B.y)) / d;
  const uy = ((A.x ** 2 + A.y ** 2) * (C.x - B.x) + (B.x ** 2 + B.y ** 2) * (A.x - C.x) + (C.x ** 2 + C.y ** 2) * (B.x - A.x)) / d;
  return { x: ux, y: uy };
}

function footOnLine(P, L1, L2) {
  const dx = L2.x - L1.x, dy = L2.y - L1.y;
  const len2 = dx * dx + dy * dy;
  const t = len2 > 1e-9 ? ((P.x - L1.x) * dx + (P.y - L1.y) * dy) / len2 : 0;
  return { x: L1.x + t * dx, y: L1.y + t * dy };
}

// ── Arc / sector geometry (đợt 8 / 4I) ────────────────────────────────────────
// Konva.Arc is parametrised as (rotation, angle, clockwise) in SCREEN degrees,
// which is a different shape from the MathViz layer's (center, from, to), so the
// conversion lives here instead of being repeated inline at the call site.
// Added because "arc" and "sector" are part of the checked vocabulary
// (backend/mathviz_contract.py) while this engine drew neither: an arc layer
// simply produced nothing and the figure came out visibly truncated.
function konvaArcParams(centerPx, fromPx, toPx, largeArc) {
  const [cx, cy] = centerPx;
  const radius = Math.max(0.5, Math.hypot(fromPx[0] - cx, fromPx[1] - cy));
  const start = Math.atan2(fromPx[1] - cy, fromPx[0] - cx);
  const end = Math.atan2(toPx[1] - cy, toPx[0] - cx);
  // In screen coordinates (y down) a positive cross product is the
  // clockwise-on-screen direction, which is Konva's positive rotation.
  const cross = (fromPx[0] - cx) * (toPx[1] - cy) - (fromPx[1] - cy) * (toPx[0] - cx);
  const clockwise = cross > 0;
  let sweep = end - start;
  if (clockwise) { while (sweep < 0) sweep += Math.PI * 2; }
  else { while (sweep > 0) sweep -= Math.PI * 2; }
  // "large_arc" asks for the reflex side of the same chord.
  if (largeArc && Math.abs(sweep) < Math.PI) sweep -= Math.sign(sweep) * Math.PI * 2;
  const toDeg = (rad) => (rad * 180) / Math.PI;
  return { radius, rotation: toDeg(start), angle: Math.abs(toDeg(sweep)), clockwise };
}

/** A point reference → pixel pair: inline {x,y}, or an id resolved in-scene. */
function layerPointPx(ref, toPxFn, idIndex) {
  if (ref && Number.isFinite(ref.x) && Number.isFinite(ref.y)) return toPxFn(ref.x, ref.y);
  const id = typeof ref === 'string' ? ref : (ref && (ref.id || ref.name));
  if (id && idIndex && idIndex[id]) return toPxFn(idIndex[id].x, idIndex[id].y);
  return null;
}

function computeTriangleCenters(A, B, C) {
  const a = dist(B, C);
  const b = dist(C, A);
  const c = dist(A, B);
  const s = (a + b + c) / 2;
  const area = Math.abs((B.x - A.x) * (C.y - A.y) - (C.x - A.x) * (B.y - A.y)) / 2;
  const centroid = { x: (A.x + B.x + C.x) / 3, y: (A.y + B.y + C.y) / 3 };

  const incenter = (a + b + c > 1e-9) ? {
    x: (a * A.x + b * B.x + c * C.x) / (a + b + c),
    y: (a * A.y + b * B.y + c * C.y) / (a + b + c),
  } : centroid;
  const inradius = s > 1e-9 ? area / s : 0;

  const circum = circumcenter(A, B, C);
  const circumradius = circum ? dist(circum, A) : 0;

  const orthocenter = circum ? {
    x: A.x + B.x + C.x - 2 * circum.x,
    y: A.y + B.y + C.y - 2 * circum.y,
  } : centroid;

  return {
    a, b, c, s, area, centroid, incenter, inradius,
    circum, circumradius, orthocenter,
    fA: footOnLine(A, B, C),
    fB: footOnLine(B, C, A),
    fC: footOnLine(C, A, B),
  };
}

const DEFAULT_TRIANGLE = [{ id: 'A', x: -3, y: -2 }, { id: 'B', x: 3, y: -2 }, { id: 'C', x: 0, y: 3 }];
const DEFAULT_QUAD = [{ id: 'A', x: -3, y: -2 }, { id: 'B', x: 3, y: -2 }, { id: 'C', x: 3, y: 2 }, { id: 'D', x: -3, y: 2 }];
const DEFAULT_CIRCLE = { center: { x: 0, y: 0 }, r: 3 };
const DEFAULT_ELLIPSE = { center: { x: 0, y: 0 }, a: 4, b: 2.5 };

export default function MathVizKonvaGeometry2D({ data, onSwitchEngine }) {
  const containerRef = useRef(null);
  const stageRef = useRef(null);
  const initialDataRef = useRef(JSON.parse(JSON.stringify(data || {})));

  const modeMap = {
    composite: 'Tổng hợp (Nhiều lớp)',
    triangle: 'Tam giác',
    quadrilateral: 'Tứ giác',
    circle: 'Đường tròn',
    ellipse: 'Hình Elip',
    polygon: 'Đa giác đều'
  };

  const hasLayers = Array.isArray(data?.layers) && data.layers.length > 0;
  const initMode = hasLayers ? 'Tổng hợp (Nhiều lớp)' : (modeMap[data?.mode] || (data?.ellipse ? 'Hình Elip' : (data?.polygon || data?.sides ? 'Đa giác đều' : 'Tam giác')));
  const initPoints = data?.points || (initMode === 'Tam giác' ? DEFAULT_TRIANGLE : DEFAULT_QUAD);

  const [mode, setMode] = useState(initMode);
  const [layers, setLayers] = useState(data?.layers || []);
  const [triPts, setTriPts] = useState(initMode === 'Tam giác' ? initPoints : DEFAULT_TRIANGLE);
  const [quadPts, setQuadPts] = useState(initMode === 'Tứ giác' ? initPoints : DEFAULT_QUAD);
  const [circle, setCircle] = useState(data?.center ? { center: data.center, r: data.radius || 3 } : DEFAULT_CIRCLE);
  const [ellipse, setEllipse] = useState(data?.ellipse || { center: data?.center || { x: 0, y: 0 }, a: data?.a || 4, b: data?.b || 2.5 });
  const [polySides, setPolySides] = useState(data?.sides || data?.n || 6);
  const [polyRadius, setPolyRadius] = useState(data?.radius || data?.r || 3.5);
  const [polyCenter, setPolyCenter] = useState(data?.center || { x: 0, y: 0 });

  const [showLengths, setShowLengths] = useState(data?.measurements?.show_side_lengths ?? true);
  const [showAngles, setShowAngles] = useState(data?.measurements?.show_angles ?? true);
  const [showMedians, setShowMedians] = useState(data?.measurements?.show_centroid_medians ?? false);
  const [showOrthocenter, setShowOrthocenter] = useState(data?.measurements?.show_orthocenter ?? false);
  const [showCircumcircle, setShowCircumcircle] = useState(data?.measurements?.show_circumcircle ?? false);
  const [showIncenter, setShowIncenter] = useState(data?.measurements?.show_incenter ?? false);
  const [showFoci, setShowFoci] = useState(true);

  // Zoom, Pan & Background Customization
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [bgTheme, setBgTheme] = useState('dark');
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Connect & Point Selection
  const [connectMode, setConnectMode] = useState(true);
  const [selectedPointId, setSelectedId] = useState(null);
  const [userLines, setUserLines] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [cursorMathPos, setCursorMathPos] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeSelectedLine, setActiveSelectedLine] = useState(null);

  const points = mode === 'Tam giác' ? triPts : mode === 'Tứ giác' ? quadPts : null;
  const setPoints = mode === 'Tam giác' ? setTriPts : setQuadPts;
  const isLightBg = bgTheme === 'light';

  // Keyboard shortcut for Fullscreen Escape
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') setIsFullscreen(false);
    };
    if (isFullscreen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isFullscreen]);

  // Unified Viewport Calculation
  const { span, centerX, centerY, dynamicScale, dynamicOrigin } = useMemo(() => {
    let allX = [], allY = [];
    if (layers && layers.length > 0) {
      layers.forEach((l) => {
        if (l.points) l.points.forEach((p) => { if (Number.isFinite(p.x)) allX.push(p.x); if (Number.isFinite(p.y)) allY.push(p.y); });
        if (l.data) l.data.forEach((p) => { if (Number.isFinite(p.x)) allX.push(p.x); if (Number.isFinite(p.y)) allY.push(p.y); });
        if (l.from) { if (Number.isFinite(l.from.x)) allX.push(l.from.x); if (Number.isFinite(l.from.y)) allY.push(l.from.y); }
        if (l.to) { if (Number.isFinite(l.to.x)) allX.push(l.to.x); if (Number.isFinite(l.to.y)) allY.push(l.to.y); }
        if (l.center && (l.r || l.radius)) {
          const r = l.r || l.radius;
          allX.push(l.center.x - r, l.center.x + r);
          allY.push(l.center.y - r, l.center.y + r);
        }
      });
    }
    if (points && points.length > 0) {
      points.forEach((p) => { if (Number.isFinite(p.x)) allX.push(p.x); if (Number.isFinite(p.y)) allY.push(p.y); });
    }
    if (mode === 'Đường tròn') {
      allX.push(circle.center.x - circle.r, circle.center.x + circle.r);
      allY.push(circle.center.y - circle.r, circle.center.y + circle.r);
    }
    if (mode === 'Hình Elip') {
      allX.push(ellipse.center.x - (ellipse.a || 4), ellipse.center.x + (ellipse.a || 4));
      allY.push(ellipse.center.y - (ellipse.b || 2.5), ellipse.center.y + (ellipse.b || 2.5));
    }

    if (allX.length === 0) { allX = [-4, 4]; allY = [-4, 4]; }
    const minX = Math.min(...allX), maxX = Math.max(...allX);
    const minY = Math.min(...allY), maxY = Math.max(...allY);
    const spanX = Math.max(7.5, (maxX - minX) * 1.35);
    const spanY = Math.max(7.5, (maxY - minY) * 1.35);
    const s = Math.max(spanX, spanY);
    const cx = (minX + maxX) / 2;
    const cy = (minY + maxY) / 2;
    const scale = (CANVAS_SIZE * 0.8) / s;
    const origin = {
      x: CANVAS_SIZE / 2 - cx * scale,
      y: CANVAS_SIZE / 2 + cy * scale,
    };
    return { span: s, centerX: cx, centerY: cy, dynamicScale: scale, dynamicOrigin: origin };
  }, [layers, points, mode, circle, ellipse]);

  const effectiveScale = dynamicScale * zoomLevel;
  const toLen = useCallback((m) => (Number.isFinite(m) ? m : 0) * effectiveScale, [effectiveScale]);

  const toPx = useCallback((x, y) => {
    const rawX = dynamicOrigin.x + x * dynamicScale;
    const rawY = dynamicOrigin.y - y * dynamicScale;
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    return [
      cx + (rawX - cx) * zoomLevel + panOffset.x,
      cy + (rawY - cy) * zoomLevel + panOffset.y,
    ];
  }, [dynamicOrigin, dynamicScale, zoomLevel, panOffset]);

  const toMath = useCallback((px, py) => {
    const cx = CANVAS_SIZE / 2;
    const cy = CANVAS_SIZE / 2;
    const rawX = (px - panOffset.x - cx) / zoomLevel + cx;
    const rawY = (py - panOffset.y - cy) / zoomLevel + cy;
    return [
      (rawX - dynamicOrigin.x) / dynamicScale,
      (dynamicOrigin.y - rawY) / dynamicScale,
    ];
  }, [dynamicOrigin, dynamicScale, zoomLevel, panOffset]);

  // Collect all interactive points
  const allInteractivePoints = useMemo(() => {
    const pts = [];
    if (layers) {
      layers.forEach((lay) => {
        if (lay.points) lay.points.forEach((p) => pts.push(p));
        if (lay.data) lay.data.forEach((p) => pts.push(p));
      });
    }
    if (points) {
      points.forEach((p, i) => pts.push({ ...p, id: p.id || String.fromCharCode(65 + i) }));
    }
    return pts;
  }, [layers, points]);

  // Regular Polygon Points
  const polyPoints = useMemo(() => {
    if (mode !== 'Đa giác đều') return [];
    const sides = Math.max(3, Math.min(12, polySides || 6));
    const pts = [];
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      pts.push({
        id: String.fromCharCode(65 + i),
        x: polyCenter.x + polyRadius * Math.cos(angle),
        y: polyCenter.y + polyRadius * Math.sin(angle)
      });
    }
    return pts;
  }, [mode, polySides, polyCenter, polyRadius]);

  const activePoints = mode === 'Đa giác đều' ? polyPoints : points;
  const n = activePoints ? activePoints.length : 0;
  const sides = activePoints ? activePoints.map((p, i) => dist(p, activePoints[(i + 1) % n])) : [];
  const angles = activePoints ? activePoints.map((_, i) => angleAtDeg(activePoints, i)) : [];
  const area = activePoints ? polygonArea(activePoints) : 0;
  const perimeter = sides.reduce((a, b) => a + b, 0);
  const centroid = activePoints ? centroidOf(activePoints) : null;
  const triGeo = (mode === 'Tam giác' && points && points.length === 3) ? computeTriangleCenters(points[0], points[1], points[2]) : null;

  // Ellipse computations
  const elA = Math.max(0.8, ellipse.a || 4);
  const elB = Math.max(0.5, ellipse.b || 2.5);
  const elMajor = Math.max(elA, elB);
  const elMinor = Math.min(elA, elB);
  const elC = Math.sqrt(Math.max(0, elMajor ** 2 - elMinor ** 2));

  // Reset Function
  const reset = () => {
    const d = initialDataRef.current;
    setMode(initMode);
    setLayers(d?.layers ? JSON.parse(JSON.stringify(d.layers)) : []);
    setTriPts(d?.points || DEFAULT_TRIANGLE);
    setQuadPts(d?.points || DEFAULT_QUAD);
    setCircle(d?.center ? { center: d.center, r: d.radius || 3 } : DEFAULT_CIRCLE);
    setEllipse(d?.ellipse || { center: d?.center || { x: 0, y: 0 }, a: d?.a || 4, b: d?.b || 2.5 });
    setPolySides(d?.sides || d?.n || 6);
    setPolyRadius(d?.radius || d?.r || 3.5);
    setPolyCenter(d?.center || { x: 0, y: 0 });
    setUserLines([]);
    setConnectingFrom(null);
    setActiveSelectedLine(null);
    setSelectedId(null);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
  };

  // Export Canvas snapshot as PNG
  const exportSnapshot = () => {
    if (!stageRef.current) return;
    const uri = stageRef.current.toDataURL({ pixelRatio: 2.5 });
    const link = document.createElement('a');
    link.download = `mathviz_${mode.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}.png`;
    link.href = uri;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // ==========================================
  // KONVA STAGE RENDERING PIPELINE
  // ==========================================
  useEffect(() => {
    if (!containerRef.current) return;

    if (stageRef.current) {
      stageRef.current.destroy();
    }

    const container = containerRef.current;
    const width = container.clientWidth || CANVAS_SIZE;
    const height = container.clientHeight || CANVAS_SIZE;

    const stage = new Konva.Stage({
      container: container,
      width: width,
      height: height,
    });
    stageRef.current = stage;

    // Theme color palettes
    const palette = isLightBg ? {
      bg: '#ffffff',
      grid: '#e2e8f0',
      axis: '#94a3b8',
      text: '#0f172a',
      polyStroke: '#0284c7',
      polyFill: 'rgba(2, 132, 199, 0.12)',
      circleStroke: '#3b82f6',
      lineStroke: '#0284c7',
      pointFill: '#0284c7',
      pointGlow: 'rgba(2, 132, 199, 0.4)',
      badgeBg: 'rgba(255, 255, 255, 0.95)',
      badgeBorder: '#cbd5e1',
    } : {
      bg: '#0a0e17',
      grid: 'rgba(255, 255, 255, 0.05)',
      axis: 'rgba(255, 255, 255, 0.15)',
      text: '#e2e8f0',
      polyStroke: '#39FF14',
      polyFill: 'rgba(57, 255, 20, 0.12)',
      circleStroke: '#38bdf8',
      lineStroke: '#38bdf8',
      pointFill: '#FFD400',
      pointGlow: 'rgba(255, 212, 0, 0.5)',
      badgeBg: 'rgba(13, 17, 23, 0.92)',
      badgeBorder: 'rgba(255, 255, 255, 0.15)',
    };

    // 1. BACKGROUND LAYER
    const bgLayer = new Konva.Layer();
    stage.add(bgLayer);

    const bgRect = new Konva.Rect({
      x: 0,
      y: 0,
      width: width,
      height: height,
      fill: palette.bg,
    });
    bgLayer.add(bgRect);

    // Dynamic grid range
    const viewSpan = (span / Math.min(1, zoomLevel)) + (Math.hypot(panOffset.x, panOffset.y) / (dynamicScale * zoomLevel));
    const gMin = Math.floor(centerX - viewSpan / 2) - 4;
    const gMax = Math.ceil(centerX + viewSpan / 2) + 4;

    for (let g = gMin; g <= gMax; g++) {
      const [gx1, gy1] = toPx(g, gMin);
      const [gx2, gy2] = toPx(g, gMax);
      const [hx1, hy1] = toPx(gMin, g);
      const [hx2, hy2] = toPx(gMax, g);

      bgLayer.add(new Konva.Line({
        points: [gx1, gy1, gx2, gy2],
        stroke: g === 0 ? palette.axis : palette.grid,
        strokeWidth: g === 0 ? 1.5 : 1,
      }));
      bgLayer.add(new Konva.Line({
        points: [hx1, hy1, hx2, hy2],
        stroke: g === 0 ? palette.axis : palette.grid,
        strokeWidth: g === 0 ? 1.5 : 1,
      }));
    }

    // 2. GEOMETRY LAYER
    const geomLayer = new Konva.Layer();
    stage.add(geomLayer);

    // Multi-Layer mode (Composite)
    if (hasLayers && layers) {
      // Every point any layer declares, indexed by id (đợt 8 / 4I). Layers may
      // reference a point by id alone ({"kind":"angle","points":["B","A","C"]},
      // {"kind":"label","at":"Q"}), and until this index existed such a layer
      // simply drew nothing.
      const layerIdIndex = {};
      collectLayerPoints(layers).forEach((pt) => { layerIdIndex[pt.id] = pt; });

      layers.forEach((lay) => {
        const layColor = lay.color || palette.polyStroke;

        if ((lay.kind === 'polygon' || lay.kind === 'triangle') && lay.points && lay.points.length >= 3) {
          const flatPts = [];
          lay.points.forEach((p) => {
            const [px, py] = toPx(p.x, p.y);
            flatPts.push(px, py);
          });
          geomLayer.add(new Konva.Line({
            points: flatPts,
            closed: true,
            fill: lay.fill || 'rgba(57, 255, 20, 0.1)',
            stroke: layColor,
            strokeWidth: 2.2,
            lineCap: 'round',
            lineJoin: 'round',
            shadowColor: layColor,
            shadowBlur: 8,
            shadowOpacity: 0.3,
          }));
        } else if (lay.kind === 'circle' && lay.center) {
          const [cx, cy] = toPx(lay.center.x, lay.center.y);
          const rPx = toLen(lay.r || lay.radius || 3);
          geomLayer.add(new Konva.Circle({
            x: cx,
            y: cy,
            radius: rPx,
            stroke: layColor,
            strokeWidth: 2.2,
            shadowColor: layColor,
            shadowBlur: 6,
            shadowOpacity: 0.35,
          }));
        } else if ((lay.kind === 'line' || lay.kind === 'segment' || lay.kind === 'ray') && (lay.from || lay.to)) {
          const from = layerPointPx(lay.from, toPx, layerIdIndex);
          const to = layerPointPx(lay.to, toPx, layerIdIndex);
          if (from && to) {
            // A ray has no end: extend past `to` to the canvas edge, so it can
            // never be mistaken for the segment it would otherwise look like.
            let end = to;
            if (lay.kind === 'ray') {
              const dx = to[0] - from[0], dy = to[1] - from[1];
              const len = Math.hypot(dx, dy) || 1;
              const reach = width * 1.5;
              end = [to[0] + (dx / len) * reach, to[1] + (dy / len) * reach];
            }
            geomLayer.add(new Konva.Line({
              points: [from[0], from[1], end[0], end[1]],
              stroke: layColor,
              strokeWidth: 2,
              dash: lay.style === 'dashed' ? [6, 5] : undefined,
              lineCap: 'round',
            }));
          }
        } else if ((lay.kind === 'arc' || lay.kind === 'sector') && lay.center) {
          const center = layerPointPx(lay.center, toPx, layerIdIndex);
          const from = layerPointPx(lay.from, toPx, layerIdIndex);
          const to = layerPointPx(lay.to, toPx, layerIdIndex);
          if (center && from && to) {
            const largeArc = lay.large_arc === true || lay.arc === 'major';
            const isSector = lay.kind === 'sector';
            if (isSector) {
              // A sector is a closed wedge, so it is drawn as a filled polygon built
              // from the shared outline (two radii + the arc) — the same maths as the
              // SVG engine, which is why both now agree pixel-for-pixel.
              geomLayer.add(new Konva.Line({
                points: pointsToFlat(sampleSectorOutline(center, from, to, largeArc)),
                closed: true,
                fill: lay.fill || 'rgba(56, 189, 248, 0.2)',
                stroke: layColor,
                strokeWidth: 2,
                lineCap: 'round',
              }));
            } else {
              const params = konvaArcParams(center, from, to, largeArc);
              geomLayer.add(new Konva.Arc({
                x: center[0],
                y: center[1],
                // A ring of zero thickness IS the open curve; the 0.999 factor
                // keeps the arc visible instead of collapsing it.
                innerRadius: params.radius * 0.999,
                outerRadius: params.radius,
                rotation: params.rotation,
                angle: params.angle,
                clockwise: params.clockwise,
                stroke: layColor,
                strokeWidth: 2,
                dash: lay.style === 'dashed' ? [6, 5] : undefined,
              }));
            }
          }
        } else if (lay.kind === 'region') {
          // Was reported as "unsupported by Konva" until the outline walk was shared
          // with the JSXGraph engine. A curved region needs a custom path, and Konva
          // supplies one: a Shape whose sceneFunc traces the sampled outline.
          const outline = sampleRegionOutline(lay.path || lay.points, (ref) => {
            if (ref && Number.isFinite(ref.x) && Number.isFinite(ref.y)) return [ref.x, ref.y];
            const id = typeof ref === 'string' ? ref : (ref && (ref.id || ref.name));
            const hit = id ? layerIdIndex[id] : null;
            return hit ? [hit.x, hit.y] : null;
          });
          const flat = pointsToFlat(outline.map(([x, y]) => toPx(x, y)));
          if (flat.length >= 6) {
            geomLayer.add(new Konva.Shape({
              fill: lay.fill || 'rgba(148, 163, 184, 0.3)',
              stroke: lay.color || undefined,
              strokeWidth: lay.color ? (lay.strokeWidth || 1) : 0,
              listening: false,
              sceneFunc: (ctx, shape) => {
                ctx.beginPath();
                ctx.moveTo(flat[0], flat[1]);
                for (let i = 2; i < flat.length; i += 2) ctx.lineTo(flat[i], flat[i + 1]);
                ctx.closePath();
                ctx.fillStrokeShape(shape);
              },
            }));
          }
        } else if (lay.kind === 'polyline' && Array.isArray(lay.points)) {
          const pts = lay.points.map((p) => layerPointPx(p, toPx, layerIdIndex)).filter(Boolean);
          if (pts.length >= 2) {
            geomLayer.add(new Konva.Line({
              points: pts.flat(),
              stroke: layColor,
              strokeWidth: 2,
              dash: lay.style === 'dashed' ? [6, 5] : undefined,
              lineCap: 'round',
              lineJoin: 'round',
              tension: 0,
            }));
          }
        } else if (lay.kind === 'ellipse' && lay.center) {
          const center = layerPointPx(lay.center, toPx, layerIdIndex);
          if (center) {
            // Sampled through the shared helper (JSXGraph does the same), so the two
            // engines draw the same ellipse instead of each approximating its own.
            const outlineMath = sampleEllipse(
              [lay.center.x ?? 0, lay.center.y ?? 0],
              lay.a || lay.rx || 3, lay.b || lay.ry || 2,
            );
            geomLayer.add(new Konva.Line({
              points: pointsToFlat(outlineMath.map(([x, y]) => toPx(x, y))),
              closed: true,
              fill: lay.fill || 'rgba(255, 60, 172, 0.12)',
              stroke: layColor,
              strokeWidth: 2.2,
              dash: lay.style === 'dashed' ? [6, 5] : undefined,
            }));
          }
        } else if (lay.kind === 'angle') {
          const refs = lay.points || lay.of || [];
          const pts = refs.map((p) => layerPointPx(p, toPx, layerIdIndex)).filter(Boolean);
          if (pts.length === 3) {
            // Vertex is the SECOND entry (A-B-C), as the contract documents.
            const [p0, vertex, p2] = pts;
            const rPx = Math.max(14, Math.min(32, (lay.radius || 0.6) * effectiveScale));
            const a1 = Math.atan2(p0[1] - vertex[1], p0[0] - vertex[0]);
            const a2 = Math.atan2(p2[1] - vertex[1], p2[0] - vertex[0]);
            const arm1 = [vertex[0] + Math.cos(a1) * rPx, vertex[1] + Math.sin(a1) * rPx];
            const arm2 = [vertex[0] + Math.cos(a2) * rPx, vertex[1] + Math.sin(a2) * rPx];
            const rightAngle = lay.right_angle === true;
            const corner = [arm1[0] + (arm2[0] - vertex[0]), arm1[1] + (arm2[1] - vertex[1])];
            geomLayer.add(new Konva.Line({
              points: rightAngle
                ? [arm1[0], arm1[1], corner[0], corner[1], arm2[0], arm2[1]]
                : [...arm1, ...arm2],
              stroke: lay.color || '#fbbf24',
              strokeWidth: 1.6,
              closed: false,
            }));
            if (!rightAngle) {
              // Mark the MINOR sweep, which is the angle a textbook draws: below
              // 180° go clockwise from arm1, otherwise start at arm2 instead.
              const toDeg = (rad) => (rad * 180) / Math.PI;
              const a1Deg = toDeg(a1), a2Deg = toDeg(a2);
              const cwSweep = ((a2Deg - a1Deg) % 360 + 360) % 360;
              const minor = cwSweep <= 180
                ? { rotation: a1Deg, angle: cwSweep }
                : { rotation: a2Deg, angle: 360 - cwSweep };
              geomLayer.add(new Konva.Wedge({
                x: vertex[0],
                y: vertex[1],
                radius: rPx,
                angle: Math.max(1, minor.angle),
                rotation: minor.rotation,
                fill: lay.fill || 'rgba(251, 191, 36, 0.25)',
                stroke: lay.color || '#fbbf24',
                strokeWidth: 1,
              }));
            }
          }
        } else if (lay.kind === 'points' && Array.isArray(lay.data)) {
          // Point badges are drawn on the points layer further down, but the
          // branch has to exist for every leaf this engine claims (the node
          // guard checks the claim against the branches).
          lay.data.forEach((pt) => {
            // A point without numeric coordinates is not a point the contract
            // recognises (mathviz_contract.iter_point_dicts requires both), so it
            // is skipped rather than handed to Konva as NaN.
            if (!pt || !Number.isFinite(pt.x) || !Number.isFinite(pt.y)) return;
            const [px, py] = toPx(pt.x, pt.y);
            geomLayer.add(new Konva.Circle({
              x: px, y: py, radius: 4.2,
              fill: pt.color || palette.pointFill,
              stroke: palette.badgeBorder,
              strokeWidth: 1,
            }));
          });
        } else if (lay.kind === 'label') {
          const at = layerPointPx(lay.at || lay.point, toPx, layerIdIndex);
          if (at) {
            geomLayer.add(new Konva.Text({
              x: at[0] + 6,
              y: at[1] - 16,
              text: String(lay.text || lay.label || ''),
              fontSize: lay.fontSize || 13,
              fontStyle: 'bold',
              fill: lay.color || palette.text,
            }));
          }
        }
      });
    }

    // Standard Modes (Triangle, Quadrilateral, Polygon, Circle, Ellipse)
    if ((mode === 'Tam giác' || mode === 'Tứ giác' || mode === 'Đa giác đều') && activePoints && activePoints.length >= 3) {
      const flatPts = [];
      activePoints.forEach((p) => {
        const [px, py] = toPx(p.x, p.y);
        flatPts.push(px, py);
      });

      geomLayer.add(new Konva.Line({
        points: flatPts,
        closed: true,
        fill: palette.polyFill,
        stroke: palette.polyStroke,
        strokeWidth: 2.4,
        lineCap: 'round',
        lineJoin: 'round',
        shadowColor: palette.polyStroke,
        shadowBlur: 10,
        shadowOpacity: 0.35,
      }));

      // Side length dimension badges
      if (showLengths) {
        for (let i = 0; i < activePoints.length; i++) {
          const p1 = activePoints[i], p2 = activePoints[(i + 1) % activePoints.length];
          const [x1, y1] = toPx(p1.x, p1.y);
          const [x2, y2] = toPx(p2.x, p2.y);
          const mx = (x1 + x2) / 2;
          const my = (y1 + y2) / 2;
          const len = dist(p1, p2);

          const badgeGroup = new Konva.Group({ x: mx - 16, y: my - 9 });
          badgeGroup.add(new Konva.Rect({
            width: 32,
            height: 17,
            fill: palette.badgeBg,
            stroke: palette.badgeBorder,
            strokeWidth: 0.8,
            cornerRadius: 4,
            shadowColor: '#000',
            shadowBlur: 4,
            shadowOpacity: 0.2,
          }));
          badgeGroup.add(new Konva.Text({
            x: 0,
            y: 3,
            width: 32,
            text: fmt(len, 1),
            fontSize: 10,
            fontStyle: 'bold',
            fill: palette.text,
            align: 'center',
          }));
          geomLayer.add(badgeGroup);
        }
      }

      // Special centers in Triangle mode
      if (mode === 'Tam giác' && triGeo && points && points.length === 3) {
        // Circumcircle
        if (showCircumcircle && triGeo.circum) {
          const [cx, cy] = toPx(triGeo.circum.x, triGeo.circum.y);
          const rPx = toLen(triGeo.circumradius);
          geomLayer.add(new Konva.Circle({
            x: cx,
            y: cy,
            radius: rPx,
            stroke: '#3b82f6',
            strokeWidth: 1.8,
            dash: [5, 4],
          }));
          geomLayer.add(new Konva.Circle({ x: cx, y: cy, radius: 4, fill: '#3b82f6' }));
        }
        // Incircle
        if (showIncenter && triGeo.incenter) {
          const [ix, iy] = toPx(triGeo.incenter.x, triGeo.incenter.y);
          const inRPx = toLen(triGeo.inradius);
          geomLayer.add(new Konva.Circle({
            x: ix,
            y: iy,
            radius: inRPx,
            stroke: '#10b981',
            strokeWidth: 1.8,
            dash: [4, 4],
          }));
          geomLayer.add(new Konva.Circle({ x: ix, y: iy, radius: 4, fill: '#10b981' }));
        }
        // Medians & Centroid G
        if (showMedians && triGeo.centroid) {
          const [gx, gy] = toPx(triGeo.centroid.x, triGeo.centroid.y);
          points.forEach((p, idx) => {
            const opp1 = points[(idx + 1) % 3], opp2 = points[(idx + 2) % 3];
            const midX = (opp1.x + opp2.x) / 2, midY = (opp1.y + opp2.y) / 2;
            const [px, py] = toPx(p.x, p.y);
            const [mx, my] = toPx(midX, midY);
            geomLayer.add(new Konva.Line({
              points: [px, py, mx, my],
              stroke: '#8b5cf6',
              strokeWidth: 1.2,
              dash: [4, 4],
            }));
          });
          geomLayer.add(new Konva.Circle({ x: gx, y: gy, radius: 4.5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 1 }));
        }
        // Orthocenter H & Altitudes
        if (showOrthocenter && triGeo.orthocenter) {
          const [hx, hy] = toPx(triGeo.orthocenter.x, triGeo.orthocenter.y);
          [
            { p: points[0], f: triGeo.fA },
            { p: points[1], f: triGeo.fB },
            { p: points[2], f: triGeo.fC }
          ].forEach(({ p, f }) => {
            const [px, py] = toPx(p.x, p.y);
            const [fx, fy] = toPx(f.x, f.y);
            geomLayer.add(new Konva.Line({
              points: [px, py, fx, fy],
              stroke: '#f43f5e',
              strokeWidth: 1.4,
              dash: [5, 4],
            }));
          });
          geomLayer.add(new Konva.Circle({ x: hx, y: hy, radius: 4.5, fill: '#f43f5e', stroke: '#fff', strokeWidth: 1 }));
        }
      }
    }

    // Circle Mode
    if (mode === 'Đường tròn') {
      const [cx, cy] = toPx(circle.center.x, circle.center.y);
      const rPx = toLen(circle.r);
      geomLayer.add(new Konva.Circle({
        x: cx,
        y: cy,
        radius: rPx,
        stroke: '#00E5FF',
        strokeWidth: 2.5,
        fill: 'rgba(0, 229, 255, 0.08)',
        shadowColor: '#00E5FF',
        shadowBlur: 10,
        shadowOpacity: 0.35,
      }));
      geomLayer.add(new Konva.Circle({ x: cx, y: cy, radius: 4, fill: '#00E5FF' }));
    }

    // Ellipse Mode
    if (mode === 'Hình Elip') {
      const [cx, cy] = toPx(ellipse.center.x, ellipse.center.y);
      const aPx = toLen(elA);
      const bPx = toLen(elB);
      geomLayer.add(new Konva.Ellipse({
        x: cx,
        y: cy,
        radiusX: aPx,
        radiusY: bPx,
        stroke: '#ff3cac',
        strokeWidth: 2.5,
        fill: 'rgba(255, 60, 172, 0.08)',
        shadowColor: '#ff3cac',
        shadowBlur: 10,
        shadowOpacity: 0.35,
      }));
      if (showFoci) {
        const [f1x, f1y] = toPx(ellipse.center.x - elC, ellipse.center.y);
        const [f2x, f2y] = toPx(ellipse.center.x + elC, ellipse.center.y);
        geomLayer.add(new Konva.Circle({ x: f1x, y: f1y, radius: 4, fill: '#FFD400', stroke: '#fff', strokeWidth: 1 }));
        geomLayer.add(new Konva.Circle({ x: f2x, y: f2y, radius: 4, fill: '#FFD400', stroke: '#fff', strokeWidth: 1 }));
      }
    }

    // User-created lines
    userLines.forEach((ul) => {
      const [x1, y1] = toPx(ul.from.x, ul.from.y);
      const [x2, y2] = toPx(ul.to.x, ul.to.y);
      const isSelected = activeSelectedLine && activeSelectedLine.id === ul.id;

      geomLayer.add(new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: isSelected ? '#00E5FF' : ul.color || '#38bdf8',
        strokeWidth: isSelected ? 3.2 : 2.2,
        dash: ul.style === 'dashed' ? [6, 4] : undefined,
        lineCap: 'round',
      }));

      if (ul.label) {
        const mx = (x1 + x2) / 2;
        const my = (y1 + y2) / 2;
        const tag = new Konva.Group({ x: mx - 14, y: my - 10 });
        tag.add(new Konva.Rect({
          width: 28,
          height: 16,
          fill: palette.badgeBg,
          stroke: isSelected ? '#00E5FF' : palette.badgeBorder,
          cornerRadius: 3,
        }));
        tag.add(new Konva.Text({
          x: 0,
          y: 3,
          width: 28,
          text: ul.label,
          fontSize: 10,
          fontStyle: 'bold',
          fill: isSelected ? '#00E5FF' : palette.text,
          align: 'center',
        }));
        geomLayer.add(tag);
      }
    });

    // 3. POINTS AND LABELS LAYER
    const pointsLayer = new Konva.Layer();
    stage.add(pointsLayer);

    const renderPointBadge = (pt, ptIdx, isSelected, draggable = true) => {
      const [px, py] = toPx(pt.x, pt.y);
      const ptColor = pt.color || palette.pointFill;

      const group = new Konva.Group({
        x: px,
        y: py,
        draggable: draggable && !connectMode,
      });

      // Glowing outer ring on hover/select
      const glowRing = new Konva.Circle({
        radius: isSelected ? 9 : 7,
        fill: isSelected ? '#00E5FF' : palette.pointGlow,
        opacity: isSelected ? 0.8 : 0.4,
      });
      group.add(glowRing);

      // Core vertex dot
      const dot = new Konva.Circle({
        radius: isSelected ? 6 : 4.8,
        fill: isSelected ? '#00E5FF' : ptColor,
        stroke: isLightBg ? '#0f172a' : '#ffffff',
        strokeWidth: 1.5,
        shadowColor: ptColor,
        shadowBlur: 6,
        shadowOpacity: 0.5,
      });
      group.add(dot);

      // Point Name Badge (Pill)
      if (pt.id) {
        const badgeWidth = Math.max(18, pt.id.length * 8 + 8);
        const labelGroup = new Konva.Group({ x: 9, y: -18 });
        labelGroup.add(new Konva.Rect({
          width: badgeWidth,
          height: 16,
          fill: palette.badgeBg,
          stroke: isSelected ? '#00E5FF' : palette.badgeBorder,
          strokeWidth: isSelected ? 1.5 : 0.8,
          cornerRadius: 4,
          shadowColor: '#000',
          shadowBlur: 4,
          shadowOpacity: 0.25,
        }));
        labelGroup.add(new Konva.Text({
          x: 0,
          y: 3,
          width: badgeWidth,
          text: pt.id,
          fontSize: 10.5,
          fontStyle: 'bold',
          fill: isSelected ? '#00E5FF' : palette.text,
          align: 'center',
        }));
        group.add(labelGroup);
      }

      // Cursor styles & Events
      group.on('mouseenter', () => {
        stage.container().style.cursor = connectMode ? 'crosshair' : 'grab';
        glowRing.opacity(0.8);
        pointsLayer.batchDraw();
      });
      group.on('mouseleave', () => {
        stage.container().style.cursor = 'default';
        glowRing.opacity(isSelected ? 0.8 : 0.4);
        pointsLayer.batchDraw();
      });

      // Pointer Down / Click / Drag
      group.on('pointerdown', () => {
        if (connectMode) {
          setConnectingFrom({ id: pt.id, x: pt.x, y: pt.y });
          setSelectedId(pt.id);
        } else {
          setSelectedId(pt.id);
        }
      });

      group.on('dragmove', (e) => {
        const [mx, my] = toMath(e.target.x(), e.target.y());
        const nx = Number(mx.toFixed(2));
        const ny = Number(my.toFixed(2));

        if (points) {
          setPoints((prev) => prev.map((p, idx) => (idx === ptIdx ? { ...p, x: nx, y: ny } : p)));
        }
      });

      pointsLayer.add(group);
    };

    // Render active vertices
    if (points) {
      points.forEach((pt, idx) => {
        renderPointBadge(pt, idx, selectedPointId === pt.id);
      });
    }

    // Render composite layer points
    if (layers) {
      layers.forEach((lay) => {
        if (lay.data) {
          lay.data.forEach((pt, pIdx) => {
            renderPointBadge(pt, pIdx, selectedPointId === pt.id, false);
          });
        }
      });
    }

    // 4. INTERACTION LAYER (Rubberband line & Snap indicators)
    const interactLayer = new Konva.Layer();
    stage.add(interactLayer);

    if (connectingFrom && cursorMathPos) {
      const [x1, y1] = toPx(connectingFrom.x, connectingFrom.y);
      const targetX = hoveredPoint ? hoveredPoint.x : cursorMathPos.x;
      const targetY = hoveredPoint ? hoveredPoint.y : cursorMathPos.y;
      const [x2, y2] = toPx(targetX, targetY);

      interactLayer.add(new Konva.Line({
        points: [x1, y1, x2, y2],
        stroke: '#00E5FF',
        strokeWidth: 2.2,
        dash: [6, 4],
      }));
      interactLayer.add(new Konva.Circle({ x: x1, y: y1, radius: 6, stroke: '#00E5FF', strokeWidth: 2 }));
      interactLayer.add(new Konva.Circle({ x: x2, y: y2, radius: 5, fill: '#00E5FF' }));

      if (hoveredPoint) {
        const [hx, hy] = toPx(hoveredPoint.x, hoveredPoint.y);
        interactLayer.add(new Konva.Circle({
          x: hx,
          y: hy,
          radius: 12,
          stroke: '#00E5FF',
          strokeWidth: 2,
          dash: [4, 3],
        }));
      }
    }

    // Stage level pointer events
    stage.on('pointermove', () => {
      const pos = stage.getPointerPosition();
      if (!pos) return;
      const [mx, my] = toMath(pos.x, pos.y);
      setCursorMathPos({ x: mx, y: my, px: pos.x, py: pos.y });

      // Check snapping
      let closest = null;
      let minDist = 22;
      allInteractivePoints.forEach((pt) => {
        const [ppx, ppy] = toPx(pt.x, pt.y);
        const d = Math.hypot(ppx - pos.x, ppy - pos.y);
        if (d < minDist) {
          minDist = d;
          closest = pt;
        }
      });
      setHoveredPoint(closest);
    });

    stage.on('pointerup', () => {
      if (connectingFrom && hoveredPoint) {
        if (connectingFrom.id !== hoveredPoint.id) {
          const newLine = {
            id: `user_l_${connectingFrom.id || 'P'}_${hoveredPoint.id || 'Q'}_${Date.now()}`,
            from: { id: connectingFrom.id, x: connectingFrom.x, y: connectingFrom.y },
            to: { id: hoveredPoint.id, x: hoveredPoint.x, y: hoveredPoint.y },
            label: `${connectingFrom.id || ''}${hoveredPoint.id || ''}`,
            color: '#00E5FF',
          };
          setUserLines((prev) => {
            const exists = prev.some(l => (l.from.id === connectingFrom.id && l.to.id === hoveredPoint.id) || (l.from.id === hoveredPoint.id && l.to.id === connectingFrom.id));
            if (exists) return prev;
            return [...prev, newLine];
          });
          setActiveSelectedLine(newLine);
        }
      }
      setConnectingFrom(null);
    });

    stage.batchDraw();

    return () => {
      stage.destroy();
    };
  }, [
    isLightBg, mode, layers, points, activePoints, circle, ellipse,
    polySides, polyCenter, polyRadius, showLengths, showAngles,
    showMedians, showOrthocenter, showCircumcircle, showIncenter, showFoci,
    zoomLevel, panOffset, dynamicScale, dynamicOrigin, span, centerX, centerY,
    selectedPointId, connectingFrom, cursorMathPos, hoveredPoint, userLines, activeSelectedLine,
    toPx, toMath, toLen, hasLayers, triGeo, allInteractivePoints
  ]);

  // Wheel zoom
  const onWheelZoom = (e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoomLevel((prev) => Math.min(6.0, Math.max(0.4, Number((prev * zoomFactor).toFixed(2)))));
  };

  const chipStyle = {
    background: isLightBg ? '#f8fafc' : '#161b22',
    border: isLightBg ? '1px solid #e2e8f0' : '1px solid #30363d',
    borderRadius: 8,
    padding: '6px 12px',
    marginRight: 8,
    marginBottom: 8,
    display: 'inline-block',
  };
  const labelStyle = { fontSize: 10.5, color: isLightBg ? '#64748b' : '#8b949e', marginBottom: 2 };
  const valueStyle = { fontSize: 13.5, fontWeight: 'bold', color: isLightBg ? '#0f172a' : '#f0f6fc' };

  // What this engine will NOT draw (đợt 8 / 4I). Konva is the one engine whose
  // support list is deliberately smaller than the contract (a mixed `region`
  // needs a custom sceneFunc we do not ship), so it is also the one engine where
  // saying so out loud matters most — the student sees the notice and can switch
  // to JSXGraph/SVG with the buttons right next to it.
  const konvaNotices = useMemo(() => {
    const notes = [];
    const missing = [];
    (data?.layers || []).forEach((lay) => {
      const kind = canonicalKind(lay?.kind);
      if (kind && ENGINE_SUPPORT.konva.indexOf(kind) === -1 && missing.indexOf(kind) === -1) {
        missing.push(kind);
      }
    });
    if (missing.length > 0) {
      notes.push(`Engine Konva chưa vẽ được: ${missing.join(', ')} — em chuyển sang JSXGraph/SVG ở trên để xem đủ hình.`);
    }
    const report = data?._render;
    if (report && Array.isArray(report.skipped) && report.skipped.length > 0) {
      const names = report.skipped.map((item) => item?.kind).filter(Boolean).join(', ');
      notes.push(`${report.skipped.length} lớp bị bỏ (kind lạ${names ? `: ${names}` : ''}).`);
    }
    if (report && Array.isArray(report.constructions_unsolved) && report.constructions_unsolved.length > 0) {
      notes.push(`${report.constructions_unsolved.length} dựng hình chưa giải được toạ độ chính xác.`);
    }
    // A tangency placed by a guaranteed property (collinear between the centres)
    // rather than exactly — reported so the drawing never claims more precision
    // than the solver actually established.
    if (report && Array.isArray(report.approximate) && report.approximate.length > 0) {
      const names = report.approximate.filter(Boolean).join(', ');
      notes.push(`${report.approximate.length} điểm tiếp xúc vẽ gần đúng (thẳng hàng hai tâm`
        + `${names ? `: ${names}` : ''}).`);
    }
    return notes;
  }, [data]);

  return (
    <div
      style={{
        background: isLightBg ? '#ffffff' : '#0d1117',
        border: isLightBg ? '1px solid #e2e8f0' : '1px solid #30363d',
        borderRadius: isFullscreen ? 0 : 12,
        padding: 16,
        color: isLightBg ? '#0f172a' : '#e2e8f0',
        margin: '12px 0',
        position: isFullscreen ? 'fixed' : 'relative',
        top: isFullscreen ? 0 : 'auto',
        left: isFullscreen ? 0 : 'auto',
        width: isFullscreen ? '100vw' : '100%',
        height: isFullscreen ? '100vh' : 'auto',
        zIndex: isFullscreen ? 999999 : 1,
        boxShadow: isFullscreen ? 'none' : '0 12px 36px rgba(0, 0, 0, 0.35)',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* What this engine cannot draw, said out loud (đợt 8 / 4I). A figure that
          loses a part must never be a silent surprise. */}
      {konvaNotices.length > 0 && (
        <div style={{
          marginBottom: 10, padding: '7px 11px', borderRadius: 8,
          background: 'rgba(245, 158, 11, 0.12)',
          border: '1px solid rgba(245, 158, 11, 0.4)',
          color: '#fbbf24', fontSize: 11.5, lineHeight: 1.5,
        }}>
          {konvaNotices.map((note) => (<div key={note}>⚠️ {note}</div>))}
        </div>
      )}

      {/* Title & Engine Switcher Bar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10, flexWrap: 'wrap', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 16 }}>✨</span>
          <MathVizTitle title={data?.title || 'Hình học phẳng 2D (Konva HQ Canvas)'} />
        </div>

        {/* Engine switcher buttons */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
          <GgbExportButton data={data} />
          <div style={{
            display: 'flex',
            background: isLightBg ? '#f1f5f9' : '#161b22',
            padding: '2px 4px',
            borderRadius: 7,
            border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
          }}>
            <button
              style={{
                background: '#0284c7',
                color: '#fff',
                border: 'none',
                borderRadius: 5,
                padding: '3px 9px',
                fontSize: 11,
                fontWeight: 'bold',
                cursor: 'default',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              <Sparkles size={12} /> Konva HQ
            </button>
            <button
              onClick={() => onSwitchEngine && onSwitchEngine('svg')}
              title="Chuyển về Engine SVG gốc"
              style={{
                background: 'transparent',
                color: isLightBg ? '#64748b' : '#8b949e',
                border: 'none',
                borderRadius: 5,
                padding: '3px 9px',
                fontSize: 11,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              SVG Vector
            </button>
            <button
              onClick={() => onSwitchEngine && onSwitchEngine('jsxgraph')}
              title="Chuyển sang Engine JSXGraph"
              style={{
                background: 'transparent',
                color: isLightBg ? '#64748b' : '#8b949e',
                border: 'none',
                borderRadius: 5,
                padding: '3px 9px',
                fontSize: 11,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              JSXGraph
            </button>
          </div>
        </div>
      </div>

      {/* Main Interactive Stage & Side Panel Layout */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isFullscreen ? '1fr 320px' : 'minmax(320px, 1fr) 260px',
        gap: 16,
        flex: 1,
        minHeight: 0,
      }}>
        {/* Left: Konva Canvas Container */}
        <div
          onWheel={onWheelZoom}
          style={{
            position: 'relative',
            width: '100%',
            height: isFullscreen ? 'calc(100vh - 80px)' : CANVAS_SIZE,
            background: isLightBg ? '#ffffff' : '#0a0e17',
            borderRadius: 10,
            overflow: 'hidden',
            border: isLightBg ? '1px solid #e2e8f0' : '1px solid #21262d',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <div
            ref={containerRef}
            style={{
              width: CANVAS_SIZE,
              height: CANVAS_SIZE,
              touchAction: 'none',
            }}
          />

          {/* Floating Glassmorphism Toolbar HUD */}
          <div
            style={{
              position: 'absolute',
              bottom: 14,
              right: 14,
              display: 'flex',
              alignItems: 'center',
              gap: 4,
              background: isLightBg ? 'rgba(255, 255, 255, 0.92)' : 'rgba(13, 17, 23, 0.9)',
              padding: '4px 6px',
              borderRadius: 8,
              border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.25)',
              backdropFilter: 'blur(6px)',
              zIndex: 10,
            }}
          >
            <button
              onClick={() => setConnectMode((v) => !v)}
              title={connectMode ? 'Chế độ: Nối điểm (Bấm để chuyển sang Di chuyển đỉnh)' : 'Chế độ: Di chuyển đỉnh (Bấm để chuyển sang Nối điểm)'}
              style={{
                background: connectMode ? '#0284c7' : (isLightBg ? '#f1f5f9' : '#21262d'),
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: connectMode ? '#fff' : (isLightBg ? '#0f172a' : '#e2e8f0'),
                borderRadius: 5,
                padding: '0 8px',
                height: 28,
                fontSize: 11,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
                cursor: 'pointer',
              }}
            >
              {connectMode ? <Link2 size={13} /> : <Move size={13} />}
              <span>{connectMode ? 'Nối điểm' : 'Kéo điểm'}</span>
            </button>

            <div style={{ width: 1, height: 16, background: isLightBg ? '#cbd5e1' : '#30363d', margin: '0 2px' }} />

            <button
              onClick={() => setZoomLevel((z) => Math.min(6.0, Number((z * 1.25).toFixed(2))))}
              title="Phóng to"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isLightBg ? '#0f172a' : '#e2e8f0',
                borderRadius: 5,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ZoomIn size={14} />
            </button>
            <span style={{ fontSize: 11, fontFamily: 'monospace', minWidth: 40, textAlign: 'center', color: '#00e5ff', fontWeight: 'bold' }}>
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z / 1.25).toFixed(2))))}
              title="Thu nhỏ"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isLightBg ? '#0f172a' : '#e2e8f0',
                borderRadius: 5,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <ZoomOut size={14} />
            </button>
            <button
              onClick={() => { setZoomLevel(1.0); setPanOffset({ x: 0, y: 0 }); }}
              title="Đặt lại 100%"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isLightBg ? '#475569' : '#8b949e',
                borderRadius: 5,
                padding: '0 6px',
                height: 28,
                fontSize: 10.5,
                fontWeight: 'bold',
                cursor: 'pointer',
              }}
            >
              100%
            </button>

            <div style={{ width: 1, height: 16, background: isLightBg ? '#cbd5e1' : '#30363d', margin: '0 2px' }} />

            <button
              onClick={exportSnapshot}
              title="Xuất ảnh PNG chất lượng cao"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: '#10b981',
                borderRadius: 5,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Download size={14} />
            </button>

            <button
              onClick={() => setBgTheme((t) => (t === 'dark' ? 'light' : 'dark'))}
              title="Đổi chủ đề Sáng / Tối"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isLightBg ? '#d97706' : '#FFD400',
                borderRadius: 5,
                width: 28,
                height: 28,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <Palette size={14} />
            </button>

            <button
              onClick={() => setIsFullscreen((v) => !v)}
              title={isFullscreen ? 'Thoát toàn màn hình (ESC)' : 'Toàn màn hình'}
              style={{
                background: isFullscreen ? '#f59e0b' : (isLightBg ? '#f1f5f9' : '#21262d'),
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isFullscreen ? '#000' : '#00e5ff',
                borderRadius: 5,
                padding: '0 8px',
                height: 28,
                fontSize: 10.5,
                fontWeight: 'bold',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: 4,
              }}
            >
              {isFullscreen ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
            </button>
          </div>
        </div>

        {/* Right: Readouts & Controls Panel */}
        <div style={{
          overflowY: 'auto',
          maxHeight: isFullscreen ? 'calc(100vh - 80px)' : CANVAS_SIZE,
          paddingRight: 4,
        }}>
          {/* Readout statistics */}
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
            {(mode === 'Tam giác' || mode === 'Tứ giác' || mode === 'Đa giác đều') && (
              <>
                <div style={chipStyle}>
                  <div style={labelStyle}>Diện tích S</div>
                  <div style={{ ...valueStyle, color: '#39FF14' }}>{fmt(area)}</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Chu vi P</div>
                  <div style={valueStyle}>{fmt(perimeter)}</div>
                </div>
                {centroid && (
                  <div style={chipStyle}>
                    <div style={labelStyle}>Trọng tâm G</div>
                    <div style={valueStyle}>({fmt(centroid.x, 1)}, {fmt(centroid.y, 1)})</div>
                  </div>
                )}
              </>
            )}
            {mode === 'Đường tròn' && (
              <>
                <div style={chipStyle}>
                  <div style={labelStyle}>Bán kính R</div>
                  <div style={{ ...valueStyle, color: '#00E5FF' }}>{fmt(circle.r, 1)}</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Diện tích S</div>
                  <div style={valueStyle}>{fmt(Math.PI * circle.r ** 2)}</div>
                </div>
              </>
            )}
          </div>

          {/* User connected lines */}
          {userLines.length > 0 && (
            <div style={{ background: isLightBg ? '#f8fafc' : '#161b22', borderRadius: 8, padding: 12, border: isLightBg ? '1px solid #e2e8f0' : '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: isLightBg ? '#0f172a' : '#e2e8f0' }}>
                  ✏️ Các đường do bạn nối ({userLines.length})
                </div>
                <button
                  onClick={() => { setUserLines([]); setActiveSelectedLine(null); }}
                  style={{ background: 'none', border: 'none', color: '#f85149', fontSize: 10, cursor: 'pointer' }}
                >
                  Xóa tất cả
                </button>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {userLines.map((ul) => (
                  <div
                    key={ul.id}
                    onClick={() => setActiveSelectedLine(ul)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: activeSelectedLine?.id === ul.id ? 'rgba(0, 229, 255, 0.2)' : (isLightBg ? '#e2e8f0' : '#0d1117'),
                      border: activeSelectedLine?.id === ul.id ? '1px solid #00e5ff' : '1px solid #30363d',
                      borderRadius: 4,
                      padding: '3px 6px',
                      cursor: 'pointer',
                    }}
                  >
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: activeSelectedLine?.id === ul.id ? '#00e5ff' : '#38bdf8' }}>
                      {ul.label}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setUserLines((prev) => prev.filter((l) => l.id !== ul.id));
                        if (activeSelectedLine?.id === ul.id) setActiveSelectedLine(null);
                      }}
                      style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 0 }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Toggle Options */}
          <div style={{ background: isLightBg ? '#f8fafc' : '#161b22', borderRadius: 8, padding: 12, border: isLightBg ? '1px solid #e2e8f0' : '1px solid #30363d', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: isLightBg ? '#0f172a' : '#e2e8f0', marginBottom: 8 }}>Tùy chọn hiển thị</div>
            {(mode === 'Tam giác' || mode === 'Tứ giác' || mode === 'Đa giác đều') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: isLightBg ? '#475569' : '#8b949e' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showLengths} onChange={(e) => setShowLengths(e.target.checked)} /> Độ dài cạnh
                </label>
                {mode === 'Tam giác' && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showMedians} onChange={(e) => setShowMedians(e.target.checked)} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6', display: 'inline-block' }} />
                      Trọng tâm G & Trung tuyến
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showOrthocenter} onChange={(e) => setShowOrthocenter(e.target.checked)} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f43f5e', display: 'inline-block' }} />
                      Trực tâm H & Đường cao
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showCircumcircle} onChange={(e) => setShowCircumcircle(e.target.checked)} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#3b82f6', display: 'inline-block' }} />
                      Tâm & Đường tròn ngoại tiếp (O, R)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showIncenter} onChange={(e) => setShowIncenter(e.target.checked)} />
                      <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10b981', display: 'inline-block' }} />
                      Tâm & Đường tròn nội tiếp (I, r)
                    </label>
                  </>
                )}
              </div>
            )}
            {mode === 'Hình Elip' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: isLightBg ? '#475569' : '#8b949e' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showFoci} onChange={(e) => setShowFoci(e.target.checked)} /> Tiêu điểm F₁, F₂
                </label>
              </div>
            )}
          </div>

          {/* Reset Button */}
          <button
            onClick={reset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: isLightBg ? '#f1f5f9' : '#21262d',
              color: isLightBg ? '#0f172a' : '#e2e8f0',
              border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              cursor: 'pointer',
              fontWeight: 'bold',
            }}
          >
            <RotateCcw size={14} /> Đặt lại hình vẽ
          </button>
        </div>
      </div>
    </div>
  );
}
