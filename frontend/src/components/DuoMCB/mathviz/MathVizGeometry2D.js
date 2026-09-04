'use client';
import { useState, useRef, useCallback, useMemo } from 'react';
import { RotateCcw, Plus, Trash2, Compass, Sparkles, ZoomIn, ZoomOut, Maximize2, Move, Palette } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

const CANVAS_SIZE = 520;
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

function dist(a, b) { return Math.hypot(a.x - b.x, a.y - b.y); }

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

  const exA = (-a + b + c !== 0) ? {
    x: (-a * A.x + b * B.x + c * C.x) / (-a + b + c),
    y: (-a * A.y + b * B.y + c * C.y) / (-a + b + c),
  } : null;
  const exB = (a - b + c !== 0) ? {
    x: (a * A.x - b * B.x + c * C.x) / (a - b + c),
    y: (a * A.y - b * B.y + c * C.y) / (a - b + c),
  } : null;
  const exC = (a + b - c !== 0) ? {
    x: (a * A.x + b * B.x - c * C.x) / (a + b - c),
    y: (a * A.y + b * B.y - c * C.y) / (a + b - c),
  } : null;
  const exradiusA = Math.abs(s - a) > 1e-9 ? area / Math.abs(s - a) : 0;
  const exradiusB = Math.abs(s - b) > 1e-9 ? area / Math.abs(s - b) : 0;
  const exradiusC = Math.abs(s - c) > 1e-9 ? area / Math.abs(s - c) : 0;

  return {
    a, b, c, s, area, centroid, incenter, inradius,
    circum, circumradius, orthocenter,
    exA, exB, exC, exradiusA, exradiusB, exradiusC,
    fA: footOnLine(A, B, C),
    fB: footOnLine(B, C, A),
    fC: footOnLine(C, A, B),
  };
}

function normalize(v) {
  const len = Math.hypot(v.x, v.y) || 1;
  return { x: v.x / len, y: v.y / len };
}

function dirOf(P, Q) {
  return normalize({ x: Q.x - P.x, y: Q.y - P.y });
}

function isPerp(d1, d2, tolDeg = 3.5) {
  const dot = d1.x * d2.x + d1.y * d2.y;
  return Math.abs(dot) < Math.sin((tolDeg * Math.PI) / 180);
}

function isParallelDir(d1, d2, tolDeg = 3.5) {
  const cross = d1.x * d2.y - d1.y * d2.x;
  return Math.abs(cross) < Math.sin((tolDeg * Math.PI) / 180);
}

function extendToCover(base, dir, points) {
  const ts = points.map((p) => (p.x - base.x) * dir.x + (p.y - base.y) * dir.y);
  let tMin = Math.min(...ts), tMax = Math.max(...ts);
  const margin = Math.max((tMax - tMin) * 0.18, 0.35);
  tMin -= margin; tMax += margin;
  return {
    p1: { x: base.x + dir.x * tMin, y: base.y + dir.y * tMin },
    p2: { x: base.x + dir.x * tMax, y: base.y + dir.y * tMax },
  };
}

function applyTransform(points, kind, params, center) {
  switch (kind) {
    case 'reflect_x': return points.map((p) => ({ ...p, y: -p.y }));
    case 'reflect_y': return points.map((p) => ({ ...p, x: -p.x }));
    case 'rotate': {
      const rad = (params.angle * Math.PI) / 180;
      return points.map((p) => {
        const dx = p.x - center.x, dy = p.y - center.y;
        return { ...p, x: center.x + dx * Math.cos(rad) - dy * Math.sin(rad), y: center.y + dx * Math.sin(rad) + dy * Math.cos(rad) };
      });
    }
    case 'translate': return points.map((p) => ({ ...p, x: p.x + (params.dx || 0), y: p.y + (params.dy || 0) }));
    case 'dilate': return points.map((p) => ({ ...p, x: center.x + (p.x - center.x) * (params.k || 1), y: center.y + (p.y - center.y) * (params.k || 1) }));
    default: return null;
  }
}

const DEFAULT_TRIANGLE = [{ id: 'A', x: -3, y: -2 }, { id: 'B', x: 3, y: -2 }, { id: 'C', x: 0, y: 3 }];
const DEFAULT_QUAD = [{ id: 'A', x: -3, y: -2 }, { id: 'B', x: 3, y: -2 }, { id: 'C', x: 3, y: 2 }, { id: 'D', x: -3, y: 2 }];
const DEFAULT_CIRCLE = { center: { x: 0, y: 0 }, r: 3 };
const DEFAULT_ELLIPSE = { center: { x: 0, y: 0 }, a: 4, b: 2.5 };

export default function MathVizGeometry2D({ data }) {
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
  const [showExcenters, setShowExcenters] = useState(data?.measurements?.show_excenters ?? false);
  const [showFoci, setShowFoci] = useState(true);

  const [transformKind, setTransformKind] = useState(data?.transform?.kind || 'none');
  const [rotateAngle, setRotateAngle] = useState(data?.transform?.params?.angle ?? 60);
  const [translate, setTranslate] = useState({ dx: data?.transform?.params?.dx ?? 3, dy: data?.transform?.params?.dy ?? 1 });
  const [dilateK, setDilateK] = useState(data?.transform?.params?.k ?? 1.6);

  // Zoom, Pan & Background Customization States
  const [zoomLevel, setZoomLevel] = useState(1.0);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [bgColor, setBgColor] = useState('#0d1117');
  const [bgTheme, setBgTheme] = useState('dark');

  // Drag-to-Connect, Point Focus & Angle Measurement States
  const [connectMode, setConnectMode] = useState(true);
  const [selectedPointId, setSelectedId] = useState(null);
  const [userLines, setUserLines] = useState([]);
  const [connectingFrom, setConnectingFrom] = useState(null);
  const [cursorMathPos, setCursorMathPos] = useState(null);
  const [hoveredPoint, setHoveredPoint] = useState(null);
  const [activeSelectedLine, setActiveSelectedLine] = useState(null);

  const svgRef = useRef(null);
  const dragRef = useRef({
    target: null,
    index: null,
    layerIndex: null,
    pointIndex: null,
    fromPt: null,
    startX: 0,
    startY: 0,
    movedDistance: 0,
    initialPoints: null,
    initialCenter: null,
    initialPan: { x: 0, y: 0 },
    typeInfo: null,
  });

  const points = mode === 'Tam giác' ? triPts : mode === 'Tứ giác' ? quadPts : null;
  const setPoints = mode === 'Tam giác' ? setTriPts : setQuadPts;

  // Auto-detect light background to adapt contrast
  const isLightBg = useMemo(() => {
    const clean = (bgColor || '#0d1117').replace('#', '');
    if (clean.length !== 6) return false;
    const r = parseInt(clean.substring(0, 2), 16) / 255;
    const g = parseInt(clean.substring(2, 4), 16) / 255;
    const b = parseInt(clean.substring(4, 6), 16) / 255;
    return 0.299 * r + 0.587 * g + 0.114 * b > 0.52;
  }, [bgColor]);

  // 1. Calculate dynamic coordinate bounds across all active elements to prevent clustering and expand spacing
  const allCoords = [];
  if (layers && layers.length > 0) {
    layers.forEach((lay) => {
      if (lay.points) lay.points.forEach((p) => allCoords.push({ x: p.x, y: p.y }));
      if (lay.data) lay.data.forEach((p) => allCoords.push({ x: p.x, y: p.y }));
      if (lay.from) allCoords.push({ x: lay.from.x, y: lay.from.y });
      if (lay.to) allCoords.push({ x: lay.to.x, y: lay.to.y });
      if (lay.center && lay.r) {
        allCoords.push({ x: lay.center.x - lay.r, y: lay.center.y - lay.r });
        allCoords.push({ x: lay.center.x + lay.r, y: lay.center.y + lay.r });
      }
    });
  }
  if (mode === 'Tam giác' || mode === 'Tứ giác') {
    (points || []).forEach((p) => allCoords.push({ x: p.x, y: p.y }));
  }
  userLines.forEach((ul) => {
    if (ul.from) allCoords.push({ x: ul.from.x, y: ul.from.y });
    if (ul.to) allCoords.push({ x: ul.to.x, y: ul.to.y });
  });
  if (mode === 'Đường tròn') {
    allCoords.push({ x: circle.center.x - circle.r, y: circle.center.y - circle.r });
    allCoords.push({ x: circle.center.x + circle.r, y: circle.center.y + circle.r });
  }
  if (mode === 'Hình Elip') {
    const ea = ellipse.a || 4, eb = ellipse.b || 2.5;
    allCoords.push({ x: ellipse.center.x - ea, y: ellipse.center.y - eb });
    allCoords.push({ x: ellipse.center.x + ea, y: ellipse.center.y + eb });
  }
  if (mode === 'Đa giác đều') {
    allCoords.push({ x: polyCenter.x - polyRadius, y: polyCenter.y - polyRadius });
    allCoords.push({ x: polyCenter.x + polyRadius, y: polyCenter.y + polyRadius });
  }

  let minX = -4.5, maxX = 4.5, minY = -4.5, maxY = 4.5;
  if (allCoords.length > 0) {
    const xs = allCoords.map((c) => c.x).filter(Number.isFinite);
    const ys = allCoords.map((c) => c.y).filter(Number.isFinite);
    if (xs.length > 0 && ys.length > 0) {
      minX = Math.min(...xs);
      maxX = Math.max(...xs);
      minY = Math.min(...ys);
      maxY = Math.max(...ys);
    }
  }

  const spanX = Math.max(7.5, (maxX - minX) * 1.38);
  const spanY = Math.max(7.5, (maxY - minY) * 1.38);
  const span = Math.max(spanX, spanY);
  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  const dynamicScale = (CANVAS_SIZE * 0.78) / span;
  const dynamicOrigin = {
    x: CANVAS_SIZE / 2 - centerX * dynamicScale,
    y: CANVAS_SIZE / 2 + centerY * dynamicScale,
  };

  // Coordinate transformations with Zoom & Pan around canvas center
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

  // Collect all discrete points for snapping and connecting
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

  // Collect all line segments in the scene for angle analysis
  const allSceneLines = useMemo(() => {
    const lines = [];
    if (layers) {
      layers.forEach((lay, li) => {
        if ((lay.kind === 'line' || lay.kind === 'segment') && lay.from && lay.to) {
          lines.push({ id: `lay_l_${li}`, from: lay.from, to: lay.to, label: lay.label || 'Line', color: lay.color || '#e2e8f0' });
        }
        if ((lay.kind === 'polygon' || lay.kind === 'triangle') && lay.points && lay.points.length >= 3) {
          const lp = lay.points;
          for (let i = 0; i < lp.length; i++) {
            const p1 = lp[i], p2 = lp[(i + 1) % lp.length];
            lines.push({ id: `poly_${li}_${p1.id || i}_${p2.id}`, from: p1, to: p2, label: `${p1.id || ''}${p2.id || ''}`, color: lay.color || '#39FF14' });
          }
        }
      });
    }
    if ((mode === 'Tam giác' || mode === 'Tứ giác') && points && points.length >= 3) {
      for (let i = 0; i < points.length; i++) {
        const p1 = points[i], p2 = points[(i + 1) % points.length];
        lines.push({ id: `std_edge_${i}`, from: p1, to: p2, label: `${p1.id || ''}${p2.id || ''}`, color: '#39FF14' });
      }
    }
    userLines.forEach((ul) => lines.push(ul));
    return lines;
  }, [layers, mode, points, userLines]);

  // Point pointer down: supports Drag-to-Connect and Click-to-Focus
  const onPointPointerDown = (e, pt, typeInfo) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    const startX = e.clientX;
    const startY = e.clientY;

    if (connectMode) {
      dragRef.current = {
        target: 'connecting_or_select',
        fromPt: pt,
        startX,
        startY,
        movedDistance: 0,
        typeInfo,
      };
    } else {
      dragRef.current = {
        target: typeInfo.target,
        index: typeInfo.index,
        layerIndex: typeInfo.layerIndex,
        pointIndex: typeInfo.pointIndex,
        fromPt: pt,
        startX,
        startY,
        movedDistance: 0,
      };
    }
  };

  const onPointerDownVertex = (e, index) => {
    const pt = points[index];
    if (pt) onPointPointerDown(e, pt, { target: 'vertex', index });
  };
  const onPointerDownCenter = (e) => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    dragRef.current = { target: 'center', startX: e.clientX, startY: e.clientY, movedDistance: 0 };
  };
  const onPointerDownHandle = (e, kind = 'radius') => {
    e.stopPropagation();
    e.target.setPointerCapture(e.pointerId);
    dragRef.current = { target: kind, startX: e.clientX, startY: e.clientY, movedDistance: 0 };
  };
  const onPointerDownLayerPoint = (e, layerIndex, pointIndex) => {
    const pt = layers[layerIndex]?.points?.[pointIndex];
    if (pt) onPointPointerDown(e, pt, { target: 'layer_point', layerIndex, pointIndex });
  };
  const onPointerDownLayerPointObj = (e, layerIndex, pointIndex) => {
    const pt = layers[layerIndex]?.data?.[pointIndex];
    if (pt) onPointPointerDown(e, pt, { target: 'layer_point_obj', layerIndex, pointIndex });
  };

  // Drag Entire Shape in Move Mode
  const onPointerDownShape = (e) => {
    if (connectMode) return;
    e.stopPropagation();
    if (svgRef.current) svgRef.current.setPointerCapture(e.pointerId);
    dragRef.current = {
      target: 'entire_shape',
      startX: e.clientX,
      startY: e.clientY,
      initialPoints: points ? JSON.parse(JSON.stringify(points)) : null,
      initialCenter: mode === 'Đa giác đều' ? { ...polyCenter } : mode === 'Đường tròn' ? { ...circle.center } : mode === 'Hình Elip' ? { ...ellipse.center } : null,
      movedDistance: 0,
    };
  };

  const onSvgPointerDown = (e) => {
    // If clicked on canvas background or dragging background to pan
    if (e.target === svgRef.current || e.target.tagName === 'svg' || e.target.tagName === 'line' || e.target.tagName === 'rect') {
      setSelectedId(null);
      if (!connectMode || e.button === 1 || e.shiftKey || e.altKey) {
        dragRef.current = {
          target: 'pan',
          startX: e.clientX,
          startY: e.clientY,
          initialPan: { ...panOffset },
          movedDistance: 0,
        };
        if (svgRef.current) svgRef.current.setPointerCapture(e.pointerId);
      }
    }
  };

  const onWheel = useCallback((e) => {
    e.preventDefault();
    const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
    setZoomLevel((prev) => Math.min(6.0, Math.max(0.4, Number((prev * zoomFactor).toFixed(2)))));
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!svgRef.current) return;
    const rect = svgRef.current.getBoundingClientRect();
    const px = ((e.clientX - rect.left) / rect.width) * CANVAS_SIZE;
    const py = ((e.clientY - rect.top) / rect.height) * CANVAS_SIZE;
    const [mx, my] = toMath(px, py);

    setCursorMathPos({ x: mx, y: my, px, py });

    // Snap to closest point within 24px
    let closest = null;
    let minDist = 24;
    allInteractivePoints.forEach((pt) => {
      const [ppx, ppy] = toPx(pt.x, pt.y);
      const d = Math.hypot(ppx - px, ppy - py);
      if (d < minDist) {
        minDist = d;
        closest = pt;
      }
    });
    setHoveredPoint(closest);

    const drag = dragRef.current;
    if (!drag.target) return;

    const dxClient = e.clientX - drag.startX;
    const dyClient = e.clientY - drag.startY;
    drag.movedDistance = Math.hypot(dxClient, dyClient);

    if (drag.target === 'connecting_or_select') {
      if (drag.movedDistance > 5) {
        drag.target = 'connecting';
        setConnectingFrom(drag.fromPt);
      }
      return;
    }

    if (drag.target === 'pan') {
      setPanOffset({
        x: drag.initialPan.x + dxClient,
        y: drag.initialPan.y + dyClient,
      });
      return;
    }

    if (drag.target === 'entire_shape') {
      const dMathX = dxClient / (dynamicScale * zoomLevel);
      const dMathY = -dyClient / (dynamicScale * zoomLevel);
      if ((mode === 'Tam giác' || mode === 'Tứ giác') && drag.initialPoints) {
        setPoints(drag.initialPoints.map(p => ({ ...p, x: Number((p.x + dMathX).toFixed(2)), y: Number((p.y + dMathY).toFixed(2)) })));
      } else if (mode === 'Đa giác đều' && drag.initialCenter) {
        setPolyCenter({ x: Number((drag.initialCenter.x + dMathX).toFixed(2)), y: Number((drag.initialCenter.y + dMathY).toFixed(2)) });
      } else if (mode === 'Đường tròn' && drag.initialCenter) {
        setCircle(prev => ({ ...prev, center: { x: Number((drag.initialCenter.x + dMathX).toFixed(2)), y: Number((drag.initialCenter.y + dMathY).toFixed(2)) } }));
      } else if (mode === 'Hình Elip' && drag.initialCenter) {
        setEllipse(prev => ({ ...prev, center: { x: Number((drag.initialCenter.x + dMathX).toFixed(2)), y: Number((drag.initialCenter.y + dMathY).toFixed(2)) } }));
      }
      return;
    }

    if (drag.target === 'vertex' && points) {
      setPoints((prev) => prev.map((p, i) => (i === drag.index ? { ...p, x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) } : p)));
    } else if (drag.target === 'layer_point') {
      setLayers((prev) =>
        prev.map((lay, li) => {
          if (li !== drag.layerIndex || !lay.points) return lay;
          const newPts = lay.points.map((p, pi) => (pi === drag.pointIndex ? { ...p, x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) } : p));
          return { ...lay, points: newPts };
        })
      );
    } else if (drag.target === 'layer_point_obj') {
      setLayers((prev) =>
        prev.map((lay, li) => {
          if (li !== drag.layerIndex || !lay.data) return lay;
          const newData = lay.data.map((p, pi) => (pi === drag.pointIndex ? { ...p, x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) } : p));
          return { ...lay, data: newData };
        })
      );
    } else if (drag.target === 'center') {
      if (mode === 'Đường tròn') setCircle((prev) => ({ ...prev, center: { x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) } }));
      else if (mode === 'Hình Elip') setEllipse((prev) => ({ ...prev, center: { x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) } }));
      else if (mode === 'Đa giác đều') setPolyCenter({ x: Number(mx.toFixed(2)), y: Number(my.toFixed(2)) });
    } else if (drag.target === 'radius') {
      if (mode === 'Đường tròn') setCircle((prev) => ({ ...prev, r: Math.max(0.5, Number(dist(prev.center, { x: mx, y: my }).toFixed(2))) }));
      else if (mode === 'Đa giác đều') setPolyRadius(Math.max(1, Number(dist(polyCenter, { x: mx, y: my }).toFixed(2))));
    } else if (drag.target === 'ellipse_a') {
      setEllipse((prev) => ({ ...prev, a: Math.max(0.8, Number(Math.abs(mx - prev.center.x).toFixed(2))) }));
    } else if (drag.target === 'ellipse_b') {
      setEllipse((prev) => ({ ...prev, b: Math.max(0.5, Number(Math.abs(my - prev.center.y).toFixed(2))) }));
    }
  }, [points, setPoints, mode, polyCenter, dynamicScale, dynamicOrigin, allInteractivePoints, toPx, toMath, zoomLevel]);

  const onPointerUp = () => {
    const drag = dragRef.current;
    if (drag.target === 'connecting_or_select') {
      if (drag.movedDistance <= 5 && drag.fromPt) {
        setSelectedId((prev) => (prev === drag.fromPt.id ? null : drag.fromPt.id));
      }
    } else if (drag.target === 'connecting' && drag.fromPt && hoveredPoint) {
      if (drag.fromPt.id !== hoveredPoint.id || Math.hypot(drag.fromPt.x - hoveredPoint.x, drag.fromPt.y - hoveredPoint.y) > 0.2) {
        const newLine = {
          id: `user_l_${drag.fromPt.id || 'P'}_${hoveredPoint.id || 'Q'}_${Date.now()}`,
          from: { id: drag.fromPt.id, x: drag.fromPt.x, y: drag.fromPt.y },
          to: { id: hoveredPoint.id, x: hoveredPoint.x, y: hoveredPoint.y },
          label: `${drag.fromPt.id || ''}${hoveredPoint.id || ''}`,
          color: '#00E5FF',
        };
        setUserLines((prev) => {
          const exists = prev.some(l => (l.from.id === drag.fromPt.id && l.to.id === hoveredPoint.id) || (l.from.id === hoveredPoint.id && l.to.id === drag.fromPt.id));
          if (exists) return prev;
          return [...prev, newLine];
        });
        setActiveSelectedLine(newLine);
      }
    }
    setConnectingFrom(null);
    dragRef.current = { target: null, index: null, layerIndex: null, pointIndex: null, fromPt: null, startX: 0, startY: 0, movedDistance: 0, initialPoints: null, initialCenter: null, initialPan: { x: 0, y: 0 }, typeInfo: null };
  };

  const initialDataRef = useRef(JSON.parse(JSON.stringify(data || {})));

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
    setShowLengths(d?.measurements?.show_side_lengths ?? true);
    setShowAngles(d?.measurements?.show_angles ?? true);
    setShowMedians(d?.measurements?.show_centroid_medians ?? false);
    setShowCircumcircle(d?.measurements?.show_circumcircle ?? false);
    setShowOrthocenter(d?.measurements?.show_orthocenter ?? false);
    setShowIncenter(d?.measurements?.show_incenter ?? false);
    setShowExcenters(d?.measurements?.show_excenters ?? false);
    setTransformKind(d?.transform?.kind || 'none');
    setUserLines([]);
    setConnectingFrom(null);
    setActiveSelectedLine(null);
    setSelectedId(null);
    setZoomLevel(1.0);
    setPanOffset({ x: 0, y: 0 });
    setBgColor('#0d1117');
    setBgTheme('dark');
  };

  // Polygon regular mode computation
  const polyPoints = [];
  if (mode === 'Đa giác đều') {
    const sides = Math.max(3, Math.min(12, polySides || 6));
    for (let i = 0; i < sides; i++) {
      const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
      polyPoints.push({
        id: String.fromCharCode(65 + i),
        x: polyCenter.x + polyRadius * Math.cos(angle),
        y: polyCenter.y + polyRadius * Math.sin(angle)
      });
    }
  }

  // polygon calculations
  const activePoints = mode === 'Đa giác đều' ? polyPoints : points;
  const n = activePoints ? activePoints.length : 0;
  const sides = activePoints ? activePoints.map((p, i) => dist(p, activePoints[(i + 1) % n])) : [];
  const angles = activePoints ? activePoints.map((_, i) => angleAtDeg(activePoints, i)) : [];
  const area = activePoints ? polygonArea(activePoints) : 0;
  const perimeter = sides.reduce((a, b) => a + b, 0);
  const centroid = activePoints ? centroidOf(activePoints) : null;
  const circum = mode === 'Tam giác' && points && points.length === 3 ? circumcenter(points[0], points[1], points[2]) : null;
  const triGeo = (mode === 'Tam giác' && points && points.length === 3) ? computeTriangleCenters(points[0], points[1], points[2]) : null;


  // Ellipse computations
  const elA = Math.max(0.8, ellipse.a || 4);
  const elB = Math.max(0.5, ellipse.b || 2.5);
  const elMajor = Math.max(elA, elB);
  const elMinor = Math.min(elA, elB);
  const elC = Math.sqrt(Math.max(0, elMajor ** 2 - elMinor ** 2));
  const elEccentricity = elMajor > 0 ? elC / elMajor : 0;
  const elArea = Math.PI * elA * elB;
  const elPerimeter = Math.PI * (3 * (elA + elB) - Math.sqrt((3 * elA + elB) * (elA + 3 * elB)));
  const transformParams = { angle: rotateAngle, ...translate, k: dilateK };
  const ghostPoints = points && transformKind !== 'none' ? applyTransform(points, transformKind, transformParams, centroid) : null;

  // Flatten all composite points for smart collision detection
  const allCompositePoints = [];
  if (layers) {
    layers.forEach((lay) => {
      if (lay.points) lay.points.forEach((p) => allCompositePoints.push(p));
      if (lay.data) lay.data.forEach((p) => allCompositePoints.push(p));
    });
  }

  // Helper for smart label offset with collision avoidance and pill badge
  const getSmartLabelPlacement = (pt, index, allPts) => {
    const [px, py] = toPx(pt.x, pt.y);
    let dx = 8, dy = -8;
    let textAnchor = 'start';

    if (!allPts || allPts.length <= 1) {
      return { lx: px + dx, ly: py + dy, textAnchor, px, py };
    }

    const closeNeighbors = allPts.filter((other, i) => i !== index && Math.hypot(other.x - pt.x, other.y - pt.y) * dynamicScale < 36);
    if (closeNeighbors.length > 0) {
      const isVertAligned = closeNeighbors.some((o) => Math.abs(o.x - pt.x) * dynamicScale < 14);
      const isHorizAligned = closeNeighbors.some((o) => Math.abs(o.y - pt.y) * dynamicScale < 14);
      if (isVertAligned) {
        if (index % 2 === 0) {
          dx = -12;
          dy = 4;
          textAnchor = 'end';
        } else {
          dx = 12;
          dy = 4;
          textAnchor = 'start';
        }
      } else if (isHorizAligned) {
        if (index % 2 === 0) {
          dx = 0;
          dy = -14;
          textAnchor = 'middle';
        } else {
          dx = 0;
          dy = 18;
          textAnchor = 'middle';
        }
      } else {
        let vx = 0, vy = 0;
        closeNeighbors.forEach((o) => {
          vx += pt.x - o.x;
          vy += pt.y - o.y;
        });
        const ang = Math.atan2(-vy, vx);
        dx = Math.cos(ang) * 16;
        dy = Math.sin(ang) * 16 + 4;
        textAnchor = dx < -4 ? 'end' : dx > 4 ? 'start' : 'middle';
      }
    }
    return { lx: px + dx, ly: py + dy, textAnchor, px, py };
  };

  // grid lines with dynamic range & contrast
  const gridLines = [];
  const gMin = Math.floor(centerX - span / 2) - 6;
  const gMax = Math.ceil(centerX + span / 2) + 6;
  const gridStroke = isLightBg ? '#e2e8f0' : '#1b212c';
  const axisStroke = isLightBg ? '#94a3b8' : '#30363d';
  for (let g = gMin; g <= gMax; g++) {
    const [gx1, gy1] = toPx(g, gMin);
    const [gx2, gy2] = toPx(g, gMax);
    const [hx1, hy1] = toPx(gMin, g);
    const [hx2, hy2] = toPx(gMax, g);
    gridLines.push(<line key={`v${g}`} x1={gx1} y1={gy1} x2={gx2} y2={gy2} stroke={gridStroke} strokeWidth="1" />);
    gridLines.push(<line key={`h${g}`} x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke={gridStroke} strokeWidth="1" />);
  }

  // Auto-detect Geometric Relationships (Right Angles, Parallel Segments, Equal-Length Segments)
  const geometricRelations = useMemo(() => {
    if (!allSceneLines || allSceneLines.length < 2) {
      return { rightAngles: [], parallelPairs: [], equalPairs: [], tickCountMap: {}, parallelSegSet: new Set() };
    }

    const rightAngles = [];
    const parallelPairs = [];
    const equalPairs = [];
    const pool = allSceneLines;

    for (let i = 0; i < pool.length; i++) {
      for (let j = i + 1; j < pool.length; j++) {
        const s1 = pool[i], s2 = pool[j];
        if (!s1.from || !s1.to || !s2.from || !s2.to) continue;

        const isSame = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y) < 0.2 || (p1.id && p2.id && p1.id === p2.id);

        let shared = null, o1 = null, o2 = null;
        if (isSame(s1.from, s2.from)) { shared = s1.from; o1 = s1.to; o2 = s2.to; }
        else if (isSame(s1.from, s2.to)) { shared = s1.from; o1 = s1.to; o2 = s2.from; }
        else if (isSame(s1.to, s2.from)) { shared = s1.to; o1 = s1.from; o2 = s2.to; }
        else if (isSame(s1.to, s2.to)) { shared = s1.to; o1 = s1.from; o2 = s2.from; }

        const d1 = dirOf(s1.from, s1.to);
        const d2 = dirOf(s2.from, s2.to);

        if (shared && o1 && o2) {
          const vd1 = dirOf(shared, o1);
          const vd2 = dirOf(shared, o2);
          if (isPerp(vd1, vd2, 3.5)) {
            rightAngles.push({ id: `ra_${s1.id}_${s2.id}`, at: shared, d1: vd1, d2: vd2, s1, s2 });
          }
        } else {
          if (isParallelDir(d1, d2, 3.5)) {
            parallelPairs.push([s1.id, s2.id]);
          }
        }

        const len1 = dist(s1.from, s1.to);
        const len2 = dist(s2.from, s2.to);
        if (len1 > 0.4 && len2 > 0.4 && Math.abs(len1 - len2) < 0.03 * Math.max(len1, len2, 0.01)) {
          equalPairs.push([s1.id, s2.id]);
        }
      }
    }

    // Union-Find for equal length classes
    const uf = {};
    const find = (x) => {
      uf[x] = uf[x] || x;
      while (uf[x] !== x) {
        uf[x] = uf[uf[x]];
        x = uf[x];
      }
      return x;
    };
    const union = (x, y) => {
      const rx = find(x), ry = find(y);
      if (rx !== ry) uf[rx] = ry;
    };

    equalPairs.forEach(([x, y]) => union(x, y));
    const equalMembers = new Set();
    equalPairs.forEach(([x, y]) => { equalMembers.add(x); equalMembers.add(y); });

    const rootOrder = [];
    equalMembers.forEach((id) => {
      const r = find(id);
      if (!rootOrder.includes(r)) rootOrder.push(r);
    });

    const tickCountMap = {};
    equalMembers.forEach((id) => {
      const r = find(id);
      tickCountMap[id] = (rootOrder.indexOf(r) % 3) + 1;
    });

    const parallelSegSet = new Set();
    parallelPairs.forEach(([x, y]) => {
      parallelSegSet.add(x);
      parallelSegSet.add(y);
    });

    return {
      rightAngles,
      parallelPairs,
      equalPairs,
      tickCountMap,
      parallelSegSet,
    };
  }, [allSceneLines]);

  // Angle inspection & active selected line intersections
  const lineIntersectionsAndAngles = useMemo(() => {
    if (!activeSelectedLine || !allSceneLines) return [];
    const results = [];
    const v1 = { x: activeSelectedLine.to.x - activeSelectedLine.from.x, y: activeSelectedLine.to.y - activeSelectedLine.from.y };
    const len1 = Math.hypot(v1.x, v1.y);
    if (len1 < 1e-5) return [];

    const isSamePt = (p1, p2) => Math.hypot(p1.x - p2.x, p1.y - p2.y) < 0.22 || (p1.id && p2.id && p1.id === p2.id);

    allSceneLines.forEach((other) => {
      if (other.id === activeSelectedLine.id) return;
      const v2 = { x: other.to.x - other.from.x, y: other.to.y - other.from.y };
      const len2 = Math.hypot(v2.x, v2.y);
      if (len2 < 1e-5) return;

      let vertex = null;
      let dirA = null, dirB = null;

      if (isSamePt(activeSelectedLine.from, other.from)) {
        vertex = activeSelectedLine.from;
        dirA = { x: activeSelectedLine.to.x - vertex.x, y: activeSelectedLine.to.y - vertex.y };
        dirB = { x: other.to.x - vertex.x, y: other.to.y - vertex.y };
      } else if (isSamePt(activeSelectedLine.from, other.to)) {
        vertex = activeSelectedLine.from;
        dirA = { x: activeSelectedLine.to.x - vertex.x, y: activeSelectedLine.to.y - vertex.y };
        dirB = { x: other.from.x - vertex.x, y: other.from.y - vertex.y };
      } else if (isSamePt(activeSelectedLine.to, other.from)) {
        vertex = activeSelectedLine.to;
        dirA = { x: activeSelectedLine.from.x - vertex.x, y: activeSelectedLine.from.y - vertex.y };
        dirB = { x: other.to.x - vertex.x, y: other.to.y - vertex.y };
      } else if (isSamePt(activeSelectedLine.to, other.to)) {
        vertex = activeSelectedLine.to;
        dirA = { x: activeSelectedLine.from.x - vertex.x, y: activeSelectedLine.from.y - vertex.y };
        dirB = { x: other.from.x - vertex.x, y: other.from.y - vertex.y };
      }

      if (vertex && dirA && dirB) {
        const magA = Math.hypot(dirA.x, dirA.y);
        const magB = Math.hypot(dirB.x, dirB.y);
        if (magA > 1e-5 && magB > 1e-5) {
          const uA = { x: dirA.x / magA, y: dirA.y / magA };
          const uB = { x: dirB.x / magB, y: dirB.y / magB };
          const dot = uA.x * uB.x + uA.y * uB.y;
          const deg = (Math.acos(Math.min(1, Math.max(-1, dot))) * 180) / Math.PI;
          const isRight = Math.abs(deg - 90) <= 2.5;

          results.push({
            vertex,
            uA,
            uB,
            angleDeg: deg,
            isRight,
            otherLine: other,
          });
        }
      }
    });
    return results;
  }, [activeSelectedLine, allSceneLines]);

  // Geometric Mark Renderers
  const renderRightAngleSquare = (mark, keyId) => {
    const [bx, by] = toPx(mark.at.x, mark.at.y);
    const s = 11;
    const v1 = normalize({ x: mark.d1.x, y: -mark.d1.y });
    const v2 = normalize({ x: mark.d2.x, y: -mark.d2.y });

    const p1 = { x: bx + v1.x * s, y: by + v1.y * s };
    const p2 = { x: bx + (v1.x + v2.x) * s, y: by + (v1.y + v2.y) * s };
    const p3 = { x: bx + v2.x * s, y: by + v2.y * s };

    return (
      <g key={keyId || mark.id} style={{ pointerEvents: 'none' }}>
        <polyline
          points={`${p1.x},${p1.y} ${p2.x},${p2.y} ${p3.x},${p3.y}`}
          fill={isLightBg ? 'rgba(2, 132, 199, 0.18)' : 'rgba(0, 229, 255, 0.25)'}
          stroke={isLightBg ? '#0284c7' : '#00E5FF'}
          strokeWidth="1.8"
        />
        <circle cx={bx + (v1.x + v2.x) * (s / 2)} cy={by + (v1.y + v2.y) * (s / 2)} r="1.6" fill={isLightBg ? '#0284c7' : '#00E5FF'} />
      </g>
    );
  };

  const renderTickMark = (p, q, count, keyId) => {
    const [p1x, p1y] = toPx(p.x, p.y);
    const [p2x, p2y] = toPx(q.x, q.y);
    const mid = { x: (p1x + p2x) / 2, y: (p1y + p2y) / 2 };
    const dir = normalize({ x: p2x - p1x, y: p2y - p1y });
    const perp = { x: -dir.y, y: dir.x };
    const gap = 3.5, len = 6.5;
    const items = [];
    for (let k = 0; k < count; k++) {
      const off = (k - (count - 1) / 2) * gap;
      const cx = mid.x + dir.x * off, cy = mid.y + dir.y * off;
      items.push(
        <line
          key={`${keyId}-${k}`}
          x1={cx - perp.x * len}
          y1={cy - perp.y * len}
          x2={cx + perp.x * len}
          y2={cy + perp.y * len}
          stroke={isLightBg ? '#b45309' : '#FFD400'}
          strokeWidth="1.8"
        />
      );
    }
    return <g key={keyId} style={{ pointerEvents: 'none' }}>{items}</g>;
  };

  const renderParallelMark = (p, q, keyId) => {
    const [p1x, p1y] = toPx(p.x, p.y);
    const [p2x, p2y] = toPx(q.x, q.y);
    const mid = { x: (p1x + p2x) / 2, y: (p1y + p2y) / 2 };
    const dir = normalize({ x: p2x - p1x, y: p2y - p1y });
    const perp = { x: -dir.y, y: dir.x };
    const cx = mid.x, cy = mid.y;
    const pts = `${cx - dir.x * 5 + perp.x * 3.5},${cy - dir.y * 5 + perp.y * 3.5} ${cx + dir.x * 5},${cy + dir.y * 5} ${cx - dir.x * 5 - perp.x * 3.5},${cy - dir.y * 5 - perp.y * 3.5}`;
    return (
      <polyline
        key={keyId}
        points={pts}
        fill="none"
        stroke={isLightBg ? '#059669' : '#10b981'}
        strokeWidth="1.8"
        style={{ pointerEvents: 'none' }}
      />
    );
  };

  // Generate intelligent suggestions for geometric connections
  const suggestedConnections = useMemo(() => {
    const existingKeys = new Set(
      allSceneLines.map((l) => `${l.from.id || ''}_${l.to.id || ''}`).concat(
        allSceneLines.map((l) => `${l.to.id || ''}_${l.from.id || ''}`)
      )
    );
    const getPt = (id) => allInteractivePoints.find((p) => p.id === id);
    const candidates = [];

    const addSuggestion = (id1, id2, title, desc, tag, isRight) => {
      const p1 = getPt(id1), p2 = getPt(id2);
      if (p1 && p2 && !existingKeys.has(`${id1}_${id2}`)) {
        candidates.push({ id1, id2, p1, p2, title, desc, tag, isRight });
      }
    };

    addSuggestion('A', 'D', 'Đường cao AD', 'Nối đỉnh A vuông góc cạnh đáy BC (Góc vuông 90°)', 'Đường cao', true);
    addSuggestion('B', 'E', 'Đường cao BE', 'Nối đỉnh B vuông góc cạnh AC (Góc vuông 90°)', 'Đường cao', true);
    addSuggestion('C', 'F', 'Đường cao CF', 'Nối đỉnh C vuông góc cạnh AB (Góc vuông 90°)', 'Đường cao', true);
    addSuggestion('E', 'F', 'Đoạn chân đường cao EF', 'Tạo tam giác trực tâm ΔDEF đồng dạng ΔABC', 'Trực tâm', false);
    addSuggestion('D', 'E', 'Đoạn chân đường cao DE', 'Cạnh của tam giác trực tâm ΔDEF', 'Trực tâm', false);
    addSuggestion('D', 'F', 'Đoạn chân đường cao DF', 'Cạnh của tam giác trực tâm ΔDEF', 'Trực tâm', false);
    addSuggestion('H', 'O', 'Đường thẳng Euler HO', 'Đường thẳng nối Trực tâm H và Tâm ngoại tiếp O', 'Euler', false);
    addSuggestion('A', 'M', 'Đường trung tuyến AM', 'Nối đỉnh A tới trung điểm M của cạnh BC', 'Trung tuyến', false);
    addSuggestion('A', 'I', 'Phân giác trong AI', 'Tia phân giác trong từ đỉnh A tới tâm nội tiếp I', 'Phân giác', false);
    addSuggestion('P', 'E', 'Đoạn thẳng PE', 'Liên kết điểm ngoài P tới tiếp điểm E', 'Cát tuyến', false);
    addSuggestion('Q', 'D', 'Đoạn thẳng QD', 'Liên kết cát tuyến tới chân đường cao D', 'Đối cực', false);
    addSuggestion('A', 'K', 'Đoạn thẳng AK', 'Cevian từ đỉnh A tới điểm K', 'Cevian', false);

    return candidates;
  }, [allInteractivePoints, allSceneLines]);

  const polyToPath = (pts) => pts.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${x},${y}`).join(' ') + ' Z';

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };
  const labelStyle = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', marginTop: 4 };

  return (
    <div style={container}>
      <MathVizTitle icon="📐" title={data?.title} fallback="Hình học phẳng 2D" />

      {/* Mode Selector and Tools Bar */}
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          {[...(layers && layers.length > 0 ? ['Tổng hợp (Nhiều lớp)'] : []), 'Tam giác', 'Tứ giác', 'Đường tròn', 'Hình Elip', 'Đa giác đều'].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              style={{
                padding: '6px 13px',
                borderRadius: 20,
                fontSize: 12,
                border: '1px solid',
                cursor: 'pointer',
                background: mode === m ? '#3b82f6' : '#21262d',
                color: mode === m ? '#fff' : '#e2e8f0',
                borderColor: mode === m ? '#3b82f6' : '#30363d',
              }}
            >
              {m}
            </button>
          ))}
        </div>

        {/* Right Tools: Background Theme & Connect Mode */}
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
          {/* Background Color Themes */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#161b22', padding: '3px 6px', borderRadius: 20, border: '1px solid #30363d' }}>
            <Palette size={13} color="#8b949e" style={{ marginLeft: 2 }} />
            {[
              { id: 'dark', label: 'Tối', color: '#0d1117' },
              { id: 'white', label: 'Trắng', color: '#ffffff' },
              { id: 'blueprint', label: 'Blueprint', color: '#0a192f' },
              { id: 'notebook', label: 'Ô ly', color: '#f8fafc' },
              { id: 'black', label: 'OLED', color: '#000000' },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => { setBgColor(t.color); setBgTheme(t.id); }}
                title={`Nền ${t.label}`}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 3,
                  padding: '3px 7px',
                  borderRadius: 14,
                  fontSize: 10.5,
                  fontWeight: bgColor === t.color ? 'bold' : 'normal',
                  border: bgColor === t.color ? '1px solid #00e5ff' : '1px solid transparent',
                  background: bgColor === t.color ? 'rgba(0, 229, 255, 0.15)' : 'transparent',
                  color: bgColor === t.color ? '#00e5ff' : '#8b949e',
                  cursor: 'pointer',
                }}
              >
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: t.color, border: '1px solid #484f58' }} />
                {t.label}
              </button>
            ))}
            <input
              type="color"
              value={bgColor}
              onChange={(e) => { setBgColor(e.target.value); setBgTheme('custom'); }}
              title="Tùy chọn mã màu nền tự do"
              style={{ width: 20, height: 20, padding: 0, border: 'none', background: 'transparent', cursor: 'pointer', borderRadius: 4 }}
            />
          </div>

          {/* Connect Mode Toggle */}
          <button
            onClick={() => { setConnectMode((v) => !v); setConnectingFrom(null); }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 5,
              padding: '5px 12px',
              borderRadius: 20,
              fontSize: 11.5,
              fontWeight: 'bold',
              border: '1px solid',
              cursor: 'pointer',
              background: connectMode ? 'rgba(0, 229, 255, 0.15)' : '#21262d',
              color: connectMode ? '#00e5ff' : '#8b949e',
              borderColor: connectMode ? '#00e5ff' : '#30363d',
              boxShadow: connectMode ? '0 0 10px rgba(0, 229, 255, 0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            <Compass size={13} />
            {connectMode ? '✏️ Nối điểm: BẬT' : '✋ Kéo hình'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* SVG Canvas with Interactive Zoom & Pan */}
        <div style={{ position: 'relative', background: '#161b22', borderRadius: 10, padding: 8, border: '1px solid #30363d', overflow: 'hidden' }}>
          <svg
            ref={svgRef}
            viewBox={`0 0 ${CANVAS_SIZE} ${CANVAS_SIZE}`}
            style={{ width: '100%', height: 'auto', background: bgColor, borderRadius: 8, touchAction: 'none', cursor: connectMode ? 'crosshair' : 'grab' }}
            onWheel={onWheel}
            onPointerDown={onSvgPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {gridLines}
            <line x1="0" y1={dynamicOrigin.y + panOffset.y} x2={CANVAS_SIZE} y2={dynamicOrigin.y + panOffset.y} stroke={axisStroke} strokeWidth="1.2" />
            <line x1={dynamicOrigin.x + panOffset.x} y1="0" x2={dynamicOrigin.x + panOffset.x} y2={CANVAS_SIZE} stroke={axisStroke} strokeWidth="1.2" />

            {/* Triangle, Quad, and Regular Polygon Rendering */}
            {(mode === 'Tam giác' || mode === 'Tứ giác' || mode === 'Đa giác đều') && activePoints && (
              <>
                {/* Circumcircle (O) */}
                {showCircumcircle && triGeo && triGeo.circum && mode === 'Tam giác' && (() => {
                  const [ccx, ccy] = toPx(triGeo.circum.x, triGeo.circum.y);
                  const rr = triGeo.circumradius * dynamicScale;
                  return (
                    <g>
                      <circle cx={ccx} cy={ccy} r={rr} fill="none" stroke="#3b82f6" strokeWidth="1.5" strokeDasharray="5 4" />
                      <circle cx={ccx} cy={ccy} r="4.5" fill="#3b82f6" stroke="#fff" strokeWidth="1.5" />
                      <text x={ccx + 8} y={ccy - 6} fontSize="11" fontWeight="bold" fill="#3b82f6">O (R={fmt(triGeo.circumradius, 1)})</text>
                    </g>
                  );
                })()}

                {/* Incircle (I) */}
                {showIncenter && triGeo && mode === 'Tam giác' && (() => {
                  const [icx, icy] = toPx(triGeo.incenter.x, triGeo.incenter.y);
                  const inR = triGeo.inradius * dynamicScale;
                  return (
                    <g>
                      <circle cx={icx} cy={icy} r={inR} fill="none" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
                      <circle cx={icx} cy={icy} r="4.5" fill="#10b981" stroke="#fff" strokeWidth="1.5" />
                      <text x={icx + 8} y={icy - 6} fontSize="11" fontWeight="bold" fill="#10b981">I (r={fmt(triGeo.inradius, 1)})</text>
                    </g>
                  );
                })()}

                {/* Orthocenter (H) + Altitudes */}
                {showOrthocenter && triGeo && mode === 'Tam giác' && (() => {
                  const [hx, hy] = toPx(triGeo.orthocenter.x, triGeo.orthocenter.y);
                  const [ax, ay] = toPx(points[0].x, points[0].y);
                  const [bx, by] = toPx(points[1].x, points[1].y);
                  const [cx, cy] = toPx(points[2].x, points[2].y);
                  const [fax, fay] = toPx(triGeo.fA.x, triGeo.fA.y);
                  const [fbx, fby] = toPx(triGeo.fB.x, triGeo.fB.y);
                  const [fcx, fcy] = toPx(triGeo.fC.x, triGeo.fC.y);
                  return (
                    <g stroke="#f43f5e" strokeWidth="1.2">
                      <line x1={ax} y1={ay} x2={fax} y2={fay} strokeDasharray="3 3" />
                      <line x1={bx} y1={by} x2={fbx} y2={fby} strokeDasharray="3 3" />
                      <line x1={cx} y1={cy} x2={fcx} y2={fcy} strokeDasharray="3 3" />
                      <circle cx={hx} cy={hy} r="4.5" fill="#f43f5e" stroke="#fff" strokeWidth="1.5" />
                      <text x={hx + 8} y={hy - 6} fontSize="11" fontWeight="bold" fill="#f43f5e" stroke="none">H</text>
                    </g>
                  );
                })()}

                {/* Centroid (G) + Medians */}
                {showMedians && triGeo && mode === 'Tam giác' && (() => {
                  const [gx, gy] = toPx(triGeo.centroid.x, triGeo.centroid.y);
                  return (
                    <g stroke="#8b5cf6" strokeWidth="1.2" strokeDasharray="3 3">
                      {activePoints.map((p, i) => {
                        const opp1 = activePoints[(i + 1) % n], opp2 = activePoints[(i + 2) % n];
                        const mid = { x: (opp1.x + opp2.x) / 2, y: (opp1.y + opp2.y) / 2 };
                        const [x1, y1] = toPx(p.x, p.y);
                        const [x2, y2] = toPx(mid.x, mid.y);
                        return <line key={`med${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#8b5cf6" strokeWidth="1.2" />;
                      })}
                      <circle cx={gx} cy={gy} r="4.5" fill="#8b5cf6" stroke="#fff" strokeWidth="1.5" />
                      <text x={gx + 8} y={gy - 6} fontSize="11" fontWeight="bold" fill="#8b5cf6" stroke="none">G</text>
                    </g>
                  );
                })()}

                {/* Excenters (Ia, Ib, Ic) + Excircles */}
                {showExcenters && triGeo && mode === 'Tam giác' && (() => (
                  <g stroke="#f59e0b" fill="none" strokeWidth="1.2">
                    {triGeo.exA && (
                      <>
                        <circle cx={toPx(triGeo.exA.x, triGeo.exA.y)[0]} cy={toPx(triGeo.exA.x, triGeo.exA.y)[1]} r={triGeo.exradiusA * dynamicScale} strokeDasharray="3 3" />
                        <circle cx={toPx(triGeo.exA.x, triGeo.exA.y)[0]} cy={toPx(triGeo.exA.x, triGeo.exA.y)[1]} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                        <text x={toPx(triGeo.exA.x, triGeo.exA.y)[0] + 6} y={toPx(triGeo.exA.x, triGeo.exA.y)[1] - 6} fontSize="10" fill="#f59e0b" stroke="none">Ia</text>
                      </>
                    )}
                    {triGeo.exB && (
                      <>
                        <circle cx={toPx(triGeo.exB.x, triGeo.exB.y)[0]} cy={toPx(triGeo.exB.x, triGeo.exB.y)[1]} r={triGeo.exradiusB * dynamicScale} strokeDasharray="3 3" />
                        <circle cx={toPx(triGeo.exB.x, triGeo.exB.y)[0]} cy={toPx(triGeo.exB.x, triGeo.exB.y)[1]} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                        <text x={toPx(triGeo.exB.x, triGeo.exB.y)[0] + 6} y={toPx(triGeo.exB.x, triGeo.exB.y)[1] - 6} fontSize="10" fill="#f59e0b" stroke="none">Ib</text>
                      </>
                    )}
                    {triGeo.exC && (
                      <>
                        <circle cx={toPx(triGeo.exC.x, triGeo.exC.y)[0]} cy={toPx(triGeo.exC.x, triGeo.exC.y)[1]} r={triGeo.exradiusC * dynamicScale} strokeDasharray="3 3" />
                        <circle cx={toPx(triGeo.exC.x, triGeo.exC.y)[0]} cy={toPx(triGeo.exC.x, triGeo.exC.y)[1]} r="4" fill="#f59e0b" stroke="#fff" strokeWidth="1" />
                        <text x={toPx(triGeo.exC.x, triGeo.exC.y)[0] + 6} y={toPx(triGeo.exC.x, triGeo.exC.y)[1] - 6} fontSize="10" fill="#f59e0b" stroke="none">Ic</text>
                      </>
                    )}
                  </g>
                ))()}

                <path
                  d={polyToPath(activePoints.map((p) => toPx(p.x, p.y)))}
                  fill="#39FF14"
                  fillOpacity="0.12"
                  stroke="#39FF14"
                  strokeWidth="2.5"
                  style={{ cursor: connectMode ? 'crosshair' : 'move' }}
                  onPointerDown={onPointerDownShape}
                />

                {showLengths && activePoints.map((p, i) => {
                  const q = activePoints[(i + 1) % n];
                  const mid = { x: (p.x + q.x) / 2, y: (p.y + q.y) / 2 };
                  const [lx, ly] = toPx(mid.x, mid.y);
                  return (
                    <text key={`len${i}`} x={lx} y={ly} fontSize="11" fontWeight="600" fill={isLightBg ? '#1e293b' : '#e2e8f0'} textAnchor="middle">
                      {fmt(sides[i], 1)}
                    </text>
                  );
                })}

                {showAngles && activePoints.map((p, i) => {
                  const [ax, ay] = toPx(p.x, p.y);
                  return (
                    <text key={`ang${i}`} x={ax} y={ay - 12} fontSize="10" fontWeight="bold" fill={isLightBg ? '#0284c7' : '#00E5FF'} textAnchor="middle">
                      {fmt(angles[i], 1)}°
                    </text>
                  );
                })}

                {activePoints.map((p, i) => {
                  const [x, y] = toPx(p.x, p.y);
                  const lblPlacement = getSmartLabelPlacement(p, i, activePoints);
                  const ptId = p.id || String.fromCharCode(65 + i);
                  const isPtSelected = selectedPointId === ptId;
                  const isPtConnected = selectedPointId
                    ? allSceneLines.some(l => (l.from.id === selectedPointId && l.to.id === ptId) || (l.to.id === selectedPointId && l.from.id === ptId) || ptId === selectedPointId)
                    : true;
                  const ptOpacity = selectedPointId ? (isPtConnected ? 1.0 : 0.25) : 1.0;

                  return (
                    <g key={ptId} opacity={ptOpacity} style={{ cursor: connectMode ? 'crosshair' : 'grab' }}>
                      {/* Invisible wider hit area for easy touch/mouse click */}
                      <circle
                        cx={x}
                        cy={y}
                        r="14"
                        fill="transparent"
                        onPointerDown={(e) => onPointPointerDown(e, { ...p, id: ptId }, { target: 'vertex', index: i })}
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r={isPtSelected ? 7 : 5.5}
                        fill={isPtSelected ? '#00E5FF' : isLightBg ? '#ffffff' : '#f0f6fc'}
                        stroke={isPtSelected ? '#00E5FF' : '#39FF14'}
                        strokeWidth={isPtSelected ? 3 : 2}
                        onPointerDown={(e) => onPointPointerDown(e, { ...p, id: ptId }, { target: 'vertex', index: i })}
                      />
                      <rect
                        x={lblPlacement.textAnchor === 'end' ? lblPlacement.lx - (ptId.length * 8 + 6) : lblPlacement.textAnchor === 'middle' ? lblPlacement.lx - (ptId.length * 4 + 3) : lblPlacement.lx - 2}
                        y={lblPlacement.ly - 11}
                        width={ptId.length * 8 + 8}
                        height={14}
                        rx="3"
                        fill={isLightBg ? 'rgba(255, 255, 255, 0.95)' : 'rgba(13, 17, 23, 0.85)'}
                        stroke={isPtSelected ? '#00e5ff' : isLightBg ? '#cbd5e1' : 'rgba(48, 54, 61, 0.6)'}
                        strokeWidth={isPtSelected ? 1.5 : 0.8}
                      />
                      <text x={lblPlacement.lx} y={lblPlacement.ly} fontSize="12" fontWeight="bold" fill={isPtSelected ? '#00e5ff' : isLightBg ? '#0f172a' : '#f0f6fc'} textAnchor={lblPlacement.textAnchor}>
                        {ptId}
                      </text>
                    </g>
                  );
                })}

                {mode === 'Đa giác đều' && (() => {
                  const [cx, cy] = toPx(polyCenter.x, polyCenter.y);
                  const [rx, ry] = toPx(polyCenter.x + polyRadius, polyCenter.y);
                  return (
                    <>
                      <circle cx={cx} cy={cy} r="5" fill="#f0f6fc" stroke="#00E5FF" strokeWidth="2" style={{ cursor: 'grab' }} onPointerDown={onPointerDownCenter} />
                      <text x={cx + 8} y={cy - 6} fontSize="12" fill="#f0f6fc">O({fmt(polyCenter.x, 1)}, {fmt(polyCenter.y, 1)})</text>
                      <circle cx={rx} cy={ry} r="5" fill="#FFD400" stroke="#fff" strokeWidth="2" style={{ cursor: 'ew-resize' }} onPointerDown={(e) => onPointerDownHandle(e, 'radius')} />
                    </>
                  );
                })()}

                {ghostPoints && (
                  <path
                    d={polyToPath(ghostPoints.map((p) => toPx(p.x, p.y)))}
                    fill="#00E5FF"
                    fillOpacity="0.08"
                    stroke="#00E5FF"
                    strokeWidth="2"
                    strokeDasharray="6 4"
                  />
                )}
              </>
            )}

            {/* Circle Mode */}
            {mode === 'Đường tròn' && (() => {
              const [cx, cy] = toPx(circle.center.x, circle.center.y);
              const rPx = circle.r * dynamicScale;
              return (
                <>
                  <circle cx={cx} cy={cy} r={rPx} fill="#00E5FF" fillOpacity="0.1" stroke="#00E5FF" strokeWidth="2.5" />
                  <circle cx={cx} cy={cy} r="5" fill="#f0f6fc" stroke="#00E5FF" strokeWidth="2" style={{ cursor: 'grab' }} onPointerDown={onPointerDownCenter} />
                  <text x={cx + 8} y={cy - 6} fontSize="12" fill="#f0f6fc">
                    O({fmt(circle.center.x, 1)}, {fmt(circle.center.y, 1)})
                  </text>
                  <circle cx={cx + rPx} cy={cy} r="5" fill="#FFD400" stroke="#fff" strokeWidth="2" style={{ cursor: 'ew-resize' }} onPointerDown={(e) => onPointerDownHandle(e, 'radius')} />
                </>
              );
            })()}

            {/* Multi-layer Composite Mode (Olympiad Geometry with multiple overlapping elements) */}
            {mode === 'Tổng hợp (Nhiều lớp)' && layers && (
              <>
                {layers.map((layer, lIdx) => {
                  if (layer.kind === 'circle') {
                    const cx = layer.center?.x ?? 0, cy = layer.center?.y ?? 0;
                    const [pcx, pcy] = toPx(cx, cy);
                    const rPx = (layer.r ?? 3) * dynamicScale;
                    return (
                      <g key={`lay_c_${lIdx}`}>
                        <circle
                          cx={pcx}
                          cy={pcy}
                          r={rPx}
                          fill={layer.fill || 'rgba(59, 130, 246, 0.06)'}
                          stroke={layer.color || '#3b82f6'}
                          strokeWidth={layer.strokeWidth || 2}
                          strokeDasharray={layer.style === 'dashed' ? '5 4' : undefined}
                        />
                        {layer.label && (
                          <g>
                            <rect
                              x={pcx + rPx * 0.7 - 2}
                              y={pcy - rPx * 0.7 - 10}
                              width={layer.label.length * 7 + 8}
                              height={14}
                              rx="3"
                              fill="rgba(13, 17, 23, 0.85)"
                            />
                            <text x={pcx + rPx * 0.7} y={pcy - rPx * 0.7} fontSize="11" fontWeight="bold" fill={layer.color || '#3b82f6'}>
                              {layer.label}
                            </text>
                          </g>
                        )}
                        <circle cx={pcx} cy={pcy} r="4" fill="#f0f6fc" stroke={layer.color || '#3b82f6'} strokeWidth="1.5" />
                      </g>
                    );
                  }
                  if (layer.kind === 'polygon' || layer.kind === 'triangle') {
                    const polyPts = (layer.points || []).map((p) => toPx(p.x, p.y));
                    return (
                      <g key={`lay_p_${lIdx}`}>
                        <path
                          d={polyToPath(polyPts)}
                          fill={layer.fill || 'rgba(57, 255, 20, 0.08)'}
                          stroke={layer.color || '#39FF14'}
                          strokeWidth={layer.strokeWidth || 2}
                        />
                        {layer.points &&
                          layer.points.map((p, pIdx) => {
                            const [px, py] = toPx(p.x, p.y);
                            const lblPlacement = getSmartLabelPlacement(p, pIdx, allCompositePoints);
                            const isPtSelected = selectedPointId === p.id;
                            const isPtConnected = selectedPointId
                              ? allSceneLines.some(l => (l.from.id === selectedPointId && l.to.id === p.id) || (l.to.id === selectedPointId && l.from.id === p.id) || p.id === selectedPointId)
                              : true;
                            const ptOpacity = selectedPointId ? (isPtConnected ? 1.0 : 0.25) : 1.0;

                            return (
                              <g key={`lay_p_pt_${lIdx}_${pIdx}`} opacity={ptOpacity} style={{ cursor: connectMode ? 'crosshair' : 'grab' }}>
                                {/* Invisible wider hit area */}
                                <circle
                                  cx={px}
                                  cy={py}
                                  r="14"
                                  fill="transparent"
                                  onPointerDown={(e) => onPointPointerDown(e, p, { target: 'layer_point', layerIndex: lIdx, pointIndex: pIdx })}
                                />
                                <circle
                                  cx={px}
                                  cy={py}
                                  r={isPtSelected ? 7 : 5.5}
                                  fill={isPtSelected ? '#00E5FF' : isLightBg ? '#ffffff' : '#f0f6fc'}
                                  stroke={isPtSelected ? '#00E5FF' : layer.color || '#39FF14'}
                                  strokeWidth={isPtSelected ? 3 : 2}
                                  onPointerDown={(e) => onPointPointerDown(e, p, { target: 'layer_point', layerIndex: lIdx, pointIndex: pIdx })}
                                />
                                {p.id && (
                                  <g>
                                    <rect
                                      x={lblPlacement.textAnchor === 'end' ? lblPlacement.lx - (p.id.length * 8 + 6) : lblPlacement.textAnchor === 'middle' ? lblPlacement.lx - (p.id.length * 4 + 3) : lblPlacement.lx - 2}
                                      y={lblPlacement.ly - 11}
                                      width={p.id.length * 8 + 8}
                                      height={14}
                                      rx="3"
                                      fill={isLightBg ? 'rgba(255, 255, 255, 0.95)' : 'rgba(13, 17, 23, 0.85)'}
                                      stroke={isPtSelected ? '#00e5ff' : isLightBg ? '#cbd5e1' : 'rgba(48, 54, 61, 0.6)'}
                                      strokeWidth={isPtSelected ? 1.5 : 0.8}
                                    />
                                    <text x={lblPlacement.lx} y={lblPlacement.ly} fontSize="12" fontWeight="bold" fill={isPtSelected ? '#00e5ff' : (isLightBg ? '#0f172a' : '#f0f6fc')} textAnchor={lblPlacement.textAnchor}>
                                      {p.id}
                                    </text>
                                  </g>
                                )}
                              </g>
                            );
                          })}
                      </g>
                    );
                  }
                  if (layer.kind === 'line' || layer.kind === 'segment') {
                    const [x1, y1] = toPx(layer.from?.x ?? 0, layer.from?.y ?? 0);
                    const [x2, y2] = toPx(layer.to?.x ?? 0, layer.to?.y ?? 0);
                    const strokeColor = (isLightBg && (!layer.color || layer.color === '#e2e8f0' || layer.color === '#fff')) ? '#334155' : (layer.color || '#e2e8f0');
                    const isLineConnected = selectedPointId ? (layer.from?.id === selectedPointId || layer.to?.id === selectedPointId) : true;
                    const lineOpacity = selectedPointId ? (isLineConnected ? 1.0 : 0.15) : 1.0;
                    return (
                      <g key={`lay_l_${lIdx}`} opacity={lineOpacity}>
                        <line
                          x1={x1}
                          y1={y1}
                          x2={x2}
                          y2={y2}
                          stroke={strokeColor}
                          strokeWidth={layer.strokeWidth || 1.8}
                          strokeDasharray={layer.style === 'dashed' ? '4 3' : undefined}
                        />
                        {layer.label && (
                          <g>
                            <rect
                              x={(x1 + x2) / 2 + 4}
                              y={(y1 + y2) / 2 - 12}
                              width={layer.label.length * 6.5 + 6}
                              height={12}
                              rx="2"
                              fill={isLightBg ? 'rgba(255, 255, 255, 0.92)' : 'rgba(13, 17, 23, 0.8)'}
                              stroke={isLightBg ? '#cbd5e1' : '#30363d'}
                              strokeWidth="0.8"
                            />
                            <text x={(x1 + x2) / 2 + 6} y={(y1 + y2) / 2 - 3} fontSize="10" fill={isLightBg ? '#1e293b' : (layer.color || '#94a3b8')}>
                              {layer.label}
                            </text>
                          </g>
                        )}
                      </g>
                    );
                  }
                  if (layer.kind === 'points' && layer.data) {
                    return (
                      <g key={`lay_pts_${lIdx}`}>
                        {layer.data.map((pt, ptIdx) => {
                          const [px, py] = toPx(pt.x, pt.y);
                          const lblPlacement = getSmartLabelPlacement(pt, ptIdx, allCompositePoints);
                          const isPtSelected = selectedPointId === pt.id;
                          const isPtConnected = selectedPointId
                            ? allSceneLines.some(l => (l.from.id === selectedPointId && l.to.id === pt.id) || (l.to.id === selectedPointId && l.from.id === pt.id) || pt.id === selectedPointId)
                            : true;
                          const ptOpacity = selectedPointId ? (isPtConnected ? 1.0 : 0.25) : 1.0;
                          return (
                            <g key={`lay_pts_item_${lIdx}_${ptIdx}`} opacity={ptOpacity} style={{ cursor: connectMode ? 'crosshair' : 'grab' }}>
                              {/* Invisible wider hit area */}
                              <circle
                                cx={px}
                                cy={py}
                                r="14"
                                fill="transparent"
                                onPointerDown={(e) => onPointPointerDown(e, pt, { target: 'layer_point_obj', layerIndex: lIdx, pointIndex: ptIdx })}
                              />
                              <circle
                                cx={px}
                                cy={py}
                                r={isPtSelected ? 7 : (pt.size || 5)}
                                fill={isPtSelected ? '#00E5FF' : pt.color || '#FFD400'}
                                stroke={isPtSelected ? '#00E5FF' : isLightBg ? '#0f172a' : '#fff'}
                                strokeWidth={isPtSelected ? 3 : 1.5}
                                onPointerDown={(e) => onPointPointerDown(e, pt, { target: 'layer_point_obj', layerIndex: lIdx, pointIndex: ptIdx })}
                              />
                              {pt.id && (
                                <g>
                                  <rect
                                    x={lblPlacement.textAnchor === 'end' ? lblPlacement.lx - (pt.id.length * 8 + 6) : lblPlacement.textAnchor === 'middle' ? lblPlacement.lx - (pt.id.length * 4 + 3) : lblPlacement.lx - 2}
                                    y={lblPlacement.ly - 11}
                                    width={pt.id.length * 8 + 8}
                                    height={14}
                                    rx="3"
                                    fill={isLightBg ? 'rgba(255, 255, 255, 0.95)' : 'rgba(13, 17, 23, 0.85)'}
                                    stroke={isPtSelected ? '#00e5ff' : isLightBg ? '#cbd5e1' : 'rgba(48, 54, 61, 0.6)'}
                                    strokeWidth={isPtSelected ? 1.5 : 0.8}
                                  />
                                  <text x={lblPlacement.lx} y={lblPlacement.ly} fontSize="12" fontWeight="bold" fill={isPtSelected ? '#00e5ff' : pt.color || (isLightBg ? '#0f172a' : '#FFD400')} textAnchor={lblPlacement.textAnchor}>
                                    {pt.id}
                                  </text>
                                </g>
                              )}
                            </g>
                          );
                        })}
                      </g>
                    );
                  }
                  return null;
                })}
              </>
            )}

            {/* Ellipse Mode */}
            {mode === 'Hình Elip' && (() => {
              const [cx, cy] = toPx(ellipse.center.x, ellipse.center.y);
              const aPx = elA * dynamicScale;
              const bPx = elB * dynamicScale;
              const f1 = elA >= elB ? { x: ellipse.center.x - elC, y: ellipse.center.y } : { x: ellipse.center.x, y: ellipse.center.y - elC };
              const f2 = elA >= elB ? { x: ellipse.center.x + elC, y: ellipse.center.y } : { x: ellipse.center.x, y: ellipse.center.y + elC };
              const [f1x, f1y] = toPx(f1.x, f1.y);
              const [f2x, f2y] = toPx(f2.x, f2.y);
              return (
                <>
                  <ellipse cx={cx} cy={cy} rx={aPx} ry={bPx} fill="#ff3cac" fillOpacity="0.1" stroke="#ff3cac" strokeWidth="2.5" />
                  {/* Major and minor axis guides */}
                  <line x1={cx - aPx} y1={cy} x2={cx + aPx} y2={cy} stroke="#484f58" strokeWidth="1" strokeDasharray="3 3" />
                  <line x1={cx} y1={cy - bPx} x2={cx} y2={cy + bPx} stroke="#484f58" strokeWidth="1" strokeDasharray="3 3" />
                  {/* Foci */}
                  {showFoci && (
                    <>
                      <circle cx={f1x} cy={f1y} r="4" fill="#FFD400" stroke="#fff" strokeWidth="1.5" />
                      <text x={f1x - 6} y={f1y - 8} fontSize="10" fontWeight="bold" fill="#FFD400">F₁</text>
                      <circle cx={f2x} cy={f2y} r="4" fill="#FFD400" stroke="#fff" strokeWidth="1.5" />
                      <text x={f2x - 6} y={f2y - 8} fontSize="10" fontWeight="bold" fill="#FFD400">F₂</text>
                    </>
                  )}
                  {/* Center handle */}
                  <circle cx={cx} cy={cy} r="5" fill="#f0f6fc" stroke="#ff3cac" strokeWidth="2" style={{ cursor: 'grab' }} onPointerDown={onPointerDownCenter} />
                  <text x={cx + 8} y={cy - 6} fontSize="12" fill="#f0f6fc">O({fmt(ellipse.center.x, 1)}, {fmt(ellipse.center.y, 1)})</text>
                  {/* a-axis handle */}
                  <circle cx={cx + aPx} cy={cy} r="5" fill="#00E5FF" stroke="#fff" strokeWidth="2" style={{ cursor: 'ew-resize' }} onPointerDown={(e) => onPointerDownHandle(e, 'ellipse_a')} />
                  <text x={cx + aPx + 6} y={cy + 4} fontSize="11" fill="#00E5FF">a={fmt(elA, 1)}</text>
                  {/* b-axis handle */}
                  <circle cx={cx} cy={cy - bPx} r="5" fill="#39FF14" stroke="#fff" strokeWidth="2" style={{ cursor: 'ns-resize' }} onPointerDown={(e) => onPointerDownHandle(e, 'ellipse_b')} />
                  <text x={cx + 6} y={cy - bPx - 4} fontSize="11" fill="#39FF14">b={fmt(elB, 1)}</text>
                </>
              );
            })()}

            {/* Automatically detected Right Angle Square Markers */}
            {geometricRelations.rightAngles.map((ra) => renderRightAngleSquare(ra))}

            {/* Automatically detected Parallel Arrow Marks */}
            {geometricRelations.parallelPairs.map(([id1, id2], pIdx) => {
              const l1 = allSceneLines.find((l) => l.id === id1);
              const l2 = allSceneLines.find((l) => l.id === id2);
              if (!l1 || !l2 || !l1.from || !l1.to || !l2.from || !l2.to) return null;
              return (
                <g key={`par_group_${pIdx}`}>
                  {renderParallelMark(l1.from, l1.to, `pm_${id1}_${pIdx}`)}
                  {renderParallelMark(l2.from, l2.to, `pm_${id2}_${pIdx}`)}
                </g>
              );
            })}

            {/* Automatically detected Equal Length Hash Tick Marks */}
            {Object.entries(geometricRelations.tickCountMap).map(([id, count]) => {
              const line = allSceneLines.find((l) => l.id === id);
              if (!line || !line.from || !line.to) return null;
              return renderTickMark(line.from, line.to, count, `tm_${id}`);
            })}

            {/* User-created lines */}
            {userLines.map((ul, ulIdx) => {
              const [x1, y1] = toPx(ul.from.x, ul.from.y);
              const [x2, y2] = toPx(ul.to.x, ul.to.y);
              const isSelected = activeSelectedLine && activeSelectedLine.id === ul.id;

              return (
                <g key={ul.id || `user_l_${ulIdx}`} onClick={(e) => { e.stopPropagation(); setActiveSelectedLine(ul); }} style={{ cursor: 'pointer' }}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke={isSelected ? '#00E5FF' : ul.color || '#38bdf8'}
                    strokeWidth={isSelected ? 3.2 : 2.4}
                    strokeDasharray={ul.style === 'dashed' ? '5 4' : undefined}
                  />
                  <circle cx={(x1 + x2) / 2} cy={(y1 + y2) / 2} r="3.5" fill={isSelected ? '#00E5FF' : '#38bdf8'} />
                  {ul.label && (
                    <g>
                      <rect
                        x={(x1 + x2) / 2 + 4}
                        y={(y1 + y2) / 2 - 13}
                        width={ul.label.length * 7 + 8}
                        height={15}
                        rx="3"
                        fill={isLightBg ? 'rgba(255, 255, 255, 0.95)' : 'rgba(13, 17, 23, 0.9)'}
                        stroke={isSelected ? '#00E5FF' : isLightBg ? '#cbd5e1' : '#30363d'}
                        strokeWidth="1"
                      />
                      <text x={(x1 + x2) / 2 + 8} y={(y1 + y2) / 2 - 2} fontSize="11" fontWeight="bold" fill={isSelected ? '#00E5FF' : isLightBg ? '#0369a1' : '#38bdf8'}>
                        {ul.label}
                      </text>
                    </g>
                  )}
                </g>
              );
            })}

            {/* Drag-to-Connect Live Rubberband Line */}
            {connectingFrom && cursorMathPos && (() => {
              const [x1, y1] = toPx(connectingFrom.x, connectingFrom.y);
              const targetX = hoveredPoint ? hoveredPoint.x : cursorMathPos.x;
              const targetY = hoveredPoint ? hoveredPoint.y : cursorMathPos.y;
              const [x2, y2] = toPx(targetX, targetY);

              return (
                <g style={{ pointerEvents: 'none' }}>
                  <line
                    x1={x1}
                    y1={y1}
                    x2={x2}
                    y2={y2}
                    stroke="#00E5FF"
                    strokeWidth="2.5"
                    strokeDasharray="6 4"
                  />
                  <circle cx={x1} cy={y1} r="7" fill="none" stroke="#00E5FF" strokeWidth="2" />
                  <circle cx={x2} cy={y2} r="6" fill="#00E5FF" />
                </g>
              );
            })()}

            {/* Hover Snap Indicator */}
            {hoveredPoint && (() => {
              const [hx, hy] = toPx(hoveredPoint.x, hoveredPoint.y);
              return (
                <circle
                  cx={hx}
                  cy={hy}
                  r="11"
                  fill="none"
                  stroke="#00E5FF"
                  strokeWidth="2.2"
                  strokeDasharray="3 2"
                  style={{ pointerEvents: 'none' }}
                />
              );
            })()}

            {/* Angle inspection & right angle square markers */}
            {lineIntersectionsAndAngles.map((ang, aIdx) => {
              const [vx, vy] = toPx(ang.vertex.x, ang.vertex.y);

              if (ang.isRight) {
                const s = 14;
                const dx1 = ang.uA.x * s;
                const dy1 = -ang.uA.y * s;
                const dx2 = ang.uB.x * s;
                const dy2 = -ang.uB.y * s;

                const p1x = vx + dx1, p1y = vy + dy1;
                const p2x = vx + dx1 + dx2, p2y = vy + dy1 + dy2;
                const p3x = vx + dx2, p3y = vy + dy2;

                return (
                  <g key={`right_ang_${aIdx}`} style={{ pointerEvents: 'none' }}>
                    <path
                      d={`M ${p1x} ${p1y} L ${p2x} ${p2y} L ${p3x} ${p3y}`}
                      fill="rgba(0, 229, 255, 0.25)"
                      stroke="#00E5FF"
                      strokeWidth="2"
                    />
                    <circle cx={vx + (dx1 + dx2) / 2} cy={vy + (dy1 + dy2) / 2} r="2" fill="#00E5FF" />
                  </g>
                );
              } else if (ang.angleDeg > 12 && ang.angleDeg < 168) {
                const rArc = 28;
                const ax1 = vx + ang.uA.x * rArc;
                const ay1 = vy - ang.uA.y * rArc;
                const ax2 = vx + ang.uB.x * rArc;
                const ay2 = vy - ang.uB.y * rArc;

                const bisX = (ang.uA.x + ang.uB.x) / 2;
                const bisY = (ang.uA.y + ang.uB.y) / 2;
                const bisMag = Math.hypot(bisX, bisY) || 1;
                const tx = vx + (bisX / bisMag) * 42;
                const ty = vy - (bisY / bisMag) * 42;

                return (
                  <g key={`ang_arc_${aIdx}`} style={{ pointerEvents: 'none' }}>
                    <path
                      d={`M ${ax1} ${ay1} A ${rArc} ${rArc} 0 0 ${ang.uA.x * ang.uB.y - ang.uA.y * ang.uB.x > 0 ? 0 : 1} ${ax2} ${ay2}`}
                      fill="none"
                      stroke={isLightBg ? '#d97706' : '#FFD400'}
                      strokeWidth="1.6"
                      strokeDasharray="3 2"
                    />
                    <rect
                      x={tx - 18}
                      y={ty - 9}
                      width="36"
                      height="18"
                      rx="4"
                      fill={isLightBg ? 'rgba(255, 255, 255, 0.95)' : 'rgba(13, 17, 23, 0.92)'}
                      stroke={isLightBg ? '#f59e0b' : '#FFD400'}
                      strokeWidth="1"
                    />
                    <text x={tx} y={ty + 4} fontSize="11" fontWeight="bold" fill={isLightBg ? '#b45309' : '#FFD400'} textAnchor="middle">
                      {fmt(ang.angleDeg, 1)}°
                    </text>
                  </g>
                );
              }
              return null;
            })}
          </svg>

          {/* Floating Zoom & Pan Controls Overlay */}
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              right: 16,
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
              onClick={() => setZoomLevel((z) => Math.min(6.0, Number((z * 1.25).toFixed(2))))}
              title="Phóng to (Cuộn chuột lên hoặc bấm vào đây)"
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
            <span
              style={{
                fontSize: 11,
                fontFamily: 'monospace',
                minWidth: 42,
                textAlign: 'center',
                color: isLightBg ? '#0284c7' : '#00e5ff',
                fontWeight: 'bold',
              }}
            >
              {Math.round(zoomLevel * 100)}%
            </span>
            <button
              onClick={() => setZoomLevel((z) => Math.max(0.4, Number((z / 1.25).toFixed(2))))}
              title="Thu nhỏ (Cuộn chuột xuống hoặc bấm vào đây)"
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
              title="Đặt lại mức phóng to 100% & Căn giữa góc nhìn"
              style={{
                background: isLightBg ? '#f1f5f9' : '#21262d',
                border: isLightBg ? '1px solid #cbd5e1' : '1px solid #30363d',
                color: isLightBg ? '#475569' : '#8b949e',
                borderRadius: 5,
                padding: '0 7px',
                height: 28,
                fontSize: 10.5,
                fontWeight: '600',
                cursor: 'pointer',
              }}
            >
              100%
            </button>
          </div>
        </div>

        {/* Readouts & Toggles */}
        <div>
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
                    <div style={valueStyle}>
                      ({fmt(centroid.x, 1)}, {fmt(centroid.y, 1)})
                    </div>
                  </div>
                )}
                {mode === 'Đa giác đều' && (
                  <div style={chipStyle}>
                    <div style={labelStyle}>Góc trong α</div>
                    <div style={{ ...valueStyle, color: '#00E5FF' }}>{fmt(((polySides - 2) * 180) / polySides, 1)}°</div>
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
                <div style={chipStyle}>
                  <div style={labelStyle}>Chu vi C</div>
                  <div style={valueStyle}>{fmt(2 * Math.PI * circle.r)}</div>
                </div>
              </>
            )}

            {mode === 'Hình Elip' && (
              <>
                <div style={chipStyle}>
                  <div style={labelStyle}>Bán trục (a, b)</div>
                  <div style={{ ...valueStyle, color: '#ff3cac' }}>({fmt(elA, 1)}, {fmt(elB, 1)})</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Tiêu cự 2c</div>
                  <div style={{ ...valueStyle, color: '#FFD400' }}>{fmt(2 * elC, 2)} (c={fmt(elC, 2)})</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Tâm sai e</div>
                  <div style={{ ...valueStyle, color: '#00E5FF' }}>{fmt(elEccentricity, 3)}</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Diện tích S</div>
                  <div style={valueStyle}>{fmt(elArea, 2)} (π·a·b)</div>
                </div>
                <div style={chipStyle}>
                  <div style={labelStyle}>Chu vi P</div>
                  <div style={valueStyle}>≈ {fmt(elPerimeter, 2)}</div>
                </div>
              </>
            )}
          </div>

          {/* Sliders for Polygon & Ellipse */}
          {mode === 'Đa giác đều' && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Số cạnh đa giác</div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 4 }}>
                <span>n cạnh</span>
                <span>{polySides}</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={polySides}
                onChange={(e) => setPolySides(+e.target.value)}
                style={{ width: '100%', accentColor: '#3b82f6' }}
              />
            </div>
          )}

          {mode === 'Hình Elip' && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Thông số bán trục</div>
              <div style={{ marginBottom: 6 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
                  <span>Bán trục a</span>
                  <span>{fmt(elA, 1)}</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="6"
                  step="0.25"
                  value={elA}
                  onChange={(e) => setEllipse((prev) => ({ ...prev, a: +e.target.value }))}
                  style={{ width: '100%', accentColor: '#00e5ff' }}
                />
              </div>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#8b949e', marginBottom: 2 }}>
                  <span>Bán trục b</span>
                  <span>{fmt(elB, 1)}</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="5"
                  step="0.25"
                  value={elB}
                  onChange={(e) => setEllipse((prev) => ({ ...prev, b: +e.target.value }))}
                  style={{ width: '100%', accentColor: '#39FF14' }}
                />
              </div>
            </div>
          )}

          {/* Bảng điều chỉnh Tọa độ & Tham số hình học */}
          <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>📍</span> Tọa độ & Tham số hình học
              </div>
              <span style={{ fontSize: 10, color: '#8b949e' }}>Nhập số hoặc kéo trên hình</span>
            </div>

            {/* Composite Mode (Nhiều lớp) Editable Points & Layers */}
            {mode === 'Tổng hợp (Nhiều lớp)' && layers && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {layers.map((lay, lIdx) => {
                  if (lay.kind === 'points' && lay.data) {
                    return (
                      <div key={`lay_ctrl_${lIdx}`} style={{ background: '#0d1117', borderRadius: 6, padding: 8, border: '1px solid #21262d' }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold', color: '#ff3cac', marginBottom: 6 }}>
                          Điểm tự do & Giao điểm ({lay.data.length} điểm)
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: 6 }}>
                          {lay.data.map((pt, ptIdx) => (
                            <div key={`pt_inp_${lIdx}_${ptIdx}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#161b22', padding: '4px 6px', borderRadius: 4, border: '1px solid #30363d' }}>
                              <span style={{ fontSize: 11, fontWeight: 'bold', color: pt.color || '#FFD400', minWidth: 18 }}>{pt.id}:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={Number.isFinite(pt.x) ? +pt.x.toFixed(2) : 0}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, data: l.data.map((p, pi) => pi === ptIdx ? { ...p, x: val } : p) } : l));
                                }}
                                style={{ width: 40, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                              />
                              <input
                                type="number"
                                step="0.1"
                                value={Number.isFinite(pt.y) ? +pt.y.toFixed(2) : 0}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, data: l.data.map((p, pi) => pi === ptIdx ? { ...p, y: val } : p) } : l));
                                }}
                                style={{ width: 40, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if ((lay.kind === 'polygon' || lay.kind === 'triangle') && lay.points) {
                    return (
                      <div key={`lay_ctrl_poly_${lIdx}`} style={{ background: '#0d1117', borderRadius: 6, padding: 8, border: '1px solid #21262d' }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold', color: lay.color || '#39FF14', marginBottom: 6 }}>
                          Đa giác / Tam giác ({lay.points.map(p => p.id).join('')})
                        </div>
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: 6 }}>
                          {lay.points.map((pt, ptIdx) => (
                            <div key={`poly_pt_inp_${lIdx}_${ptIdx}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#161b22', padding: '4px 6px', borderRadius: 4, border: '1px solid #30363d' }}>
                              <span style={{ fontSize: 11, fontWeight: 'bold', color: lay.color || '#39FF14', minWidth: 18 }}>{pt.id}:</span>
                              <input
                                type="number"
                                step="0.1"
                                value={Number.isFinite(pt.x) ? +pt.x.toFixed(2) : 0}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, points: l.points.map((p, pi) => pi === ptIdx ? { ...p, x: val } : p) } : l));
                                }}
                                style={{ width: 40, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                              />
                              <input
                                type="number"
                                step="0.1"
                                value={Number.isFinite(pt.y) ? +pt.y.toFixed(2) : 0}
                                onChange={(e) => {
                                  const val = +e.target.value;
                                  setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, points: l.points.map((p, pi) => pi === ptIdx ? { ...p, y: val } : p) } : l));
                                }}
                                style={{ width: 40, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  }
                  if (lay.kind === 'circle') {
                    return (
                      <div key={`lay_ctrl_circ_${lIdx}`} style={{ background: '#0d1117', borderRadius: 6, padding: 8, border: '1px solid #21262d', display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8 }}>
                        <div style={{ fontSize: 11, fontWeight: 'bold', color: lay.color || '#3b82f6', minWidth: 90 }}>
                          {lay.label || 'Đường tròn'}:
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10, color: '#8b949e' }}>Tâm:</span>
                          <input
                            type="number"
                            step="0.1"
                            value={Number.isFinite(lay.center?.x) ? +(lay.center.x).toFixed(2) : 0}
                            onChange={(e) => {
                              const val = +e.target.value;
                              setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, center: { ...(l.center || {}), x: val } } : l));
                            }}
                            style={{ width: 38, background: '#161b22', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                          />
                          <input
                            type="number"
                            step="0.1"
                            value={Number.isFinite(lay.center?.y) ? +(lay.center.y).toFixed(2) : 0}
                            onChange={(e) => {
                              const val = +e.target.value;
                              setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, center: { ...(l.center || {}), y: val } } : l));
                            }}
                            style={{ width: 38, background: '#161b22', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                          />
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          <span style={{ fontSize: 10, color: '#8b949e' }}>R:</span>
                          <input
                            type="number"
                            step="0.1"
                            min="0.2"
                            value={Number.isFinite(lay.r) ? +lay.r.toFixed(2) : 3}
                            onChange={(e) => {
                              const val = Math.max(0.2, +e.target.value);
                              setLayers((prev) => prev.map((l, li) => li === lIdx ? { ...l, r: val } : l));
                            }}
                            style={{ width: 38, background: '#161b22', border: '1px solid #484f58', borderRadius: 3, color: '#00e5ff', fontSize: 10, padding: '2px 3px' }}
                          />
                        </div>
                      </div>
                    );
                  }
                  return null;
                })}
              </div>
            )}

            {/* Standard Triangle & Quadrilateral Editable Points */}
            {(mode === 'Tam giác' || mode === 'Tứ giác') && points && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(115px, 1fr))', gap: 6 }}>
                {points.map((p, i) => (
                  <div key={`std_pt_inp_${i}`} style={{ display: 'flex', alignItems: 'center', gap: 4, background: '#0d1117', padding: '4px 6px', borderRadius: 4, border: '1px solid #30363d' }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', color: '#39FF14', minWidth: 18 }}>{p.id || String.fromCharCode(65 + i)}:</span>
                    <input
                      type="number"
                      step="0.1"
                      value={Number.isFinite(p.x) ? +p.x.toFixed(2) : 0}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setPoints((prev) => prev.map((pt, pi) => pi === i ? { ...pt, x: val } : pt));
                      }}
                      style={{ width: 40, background: '#161b22', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                    />
                    <input
                      type="number"
                      step="0.1"
                      value={Number.isFinite(p.y) ? +p.y.toFixed(2) : 0}
                      onChange={(e) => {
                        const val = +e.target.value;
                        setPoints((prev) => prev.map((pt, pi) => pi === i ? { ...pt, y: val } : pt));
                      }}
                      style={{ width: 40, background: '#161b22', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 10, padding: '2px 3px' }}
                    />
                  </div>
                ))}
              </div>
            )}

            {/* Circle Mode Editable Controls */}
            {mode === 'Đường tròn' && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>Tâm O:</span>
                  <input
                    type="number"
                    step="0.1"
                    value={Number.isFinite(circle.center.x) ? +circle.center.x.toFixed(2) : 0}
                    onChange={(e) => setCircle((prev) => ({ ...prev, center: { ...prev.center, x: +e.target.value } }))}
                    style={{ width: 44, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 11, padding: '2px 4px' }}
                  />
                  <input
                    type="number"
                    step="0.1"
                    value={Number.isFinite(circle.center.y) ? +circle.center.y.toFixed(2) : 0}
                    onChange={(e) => setCircle((prev) => ({ ...prev, center: { ...prev.center, y: +e.target.value } }))}
                    style={{ width: 44, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#e2e8f0', fontSize: 11, padding: '2px 4px' }}
                  />
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  <span style={{ fontSize: 11, color: '#8b949e' }}>Bán kính R:</span>
                  <input
                    type="number"
                    step="0.1"
                    min="0.5"
                    value={Number.isFinite(circle.r) ? +circle.r.toFixed(2) : 3}
                    onChange={(e) => setCircle((prev) => ({ ...prev, r: Math.max(0.5, +e.target.value) }))}
                    style={{ width: 44, background: '#0d1117', border: '1px solid #484f58', borderRadius: 3, color: '#00e5ff', fontSize: 11, padding: '2px 4px' }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Selected Point Focus Banner */}
          {selectedPointId && (
            <div style={{ background: 'rgba(0, 229, 255, 0.12)', borderRadius: 8, padding: '8px 12px', border: '1px solid #00e5ff', marginBottom: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 12, color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                <span>🎯</span> Đang tiêu điểm: <b style={{ color: '#00e5ff' }}>Điểm {selectedPointId}</b>
              </div>
              <button
                onClick={() => setSelectedId(null)}
                style={{ background: '#21262d', border: '1px solid #30363d', color: '#8b949e', borderRadius: 4, padding: '2px 8px', fontSize: 11, cursor: 'pointer' }}
              >
                Bỏ chọn
              </button>
            </div>
          )}

          {/* Detected Geometric Features Card */}
          {(geometricRelations.rightAngles.length > 0 || geometricRelations.parallelPairs.length > 0 || geometricRelations.equalPairs.length > 0) && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#39FF14', display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8 }}>
                <span>🔍</span> Nhận diện đặc trưng hình học
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, fontSize: 11 }}>
                {geometricRelations.rightAngles.length > 0 && (
                  <span style={{ background: 'rgba(0, 229, 255, 0.15)', color: '#00e5ff', border: '1px solid rgba(0, 229, 255, 0.3)', padding: '2px 8px', borderRadius: 12 }}>
                    📐 {geometricRelations.rightAngles.length} góc vuông (⟂)
                  </span>
                )}
                {geometricRelations.parallelPairs.length > 0 && (
                  <span style={{ background: 'rgba(16, 185, 129, 0.15)', color: '#10b981', border: '1px solid rgba(16, 185, 129, 0.3)', padding: '2px 8px', borderRadius: 12 }}>
                    ═ {geometricRelations.parallelPairs.length} cặp song song (∥)
                  </span>
                )}
                {geometricRelations.equalPairs.length > 0 && (
                  <span style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '2px 8px', borderRadius: 12 }}>
                    📏 {geometricRelations.equalPairs.length} cặp đoạn bằng nhau (=)
                  </span>
                )}
              </div>
            </div>
          )}

          {/* 1. Angle & Geometric Inspector */}
          {activeSelectedLine && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #00e5ff', marginBottom: 12, boxShadow: '0 0 12px rgba(0, 229, 255, 0.15)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 'bold', color: '#00e5ff', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <span>📐</span> Góc & Quan hệ: {activeSelectedLine.label || 'Đoạn thẳng'}
                </div>
                <button
                  onClick={() => setActiveSelectedLine(null)}
                  style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', fontSize: 11 }}
                >
                  ✕ Đóng
                </button>
              </div>
              <div style={{ fontSize: 11, color: '#8b949e', marginBottom: 8 }}>
                Độ dài: <span style={{ color: '#39FF14', fontFamily: 'monospace', fontWeight: 'bold' }}>{fmt(Math.hypot(activeSelectedLine.to.x - activeSelectedLine.from.x, activeSelectedLine.to.y - activeSelectedLine.from.y), 2)}</span>
              </div>
              {lineIntersectionsAndAngles.length > 0 ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {lineIntersectionsAndAngles.map((ang, aIdx) => (
                    <div
                      key={`insp_ang_${aIdx}`}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        background: ang.isRight ? 'rgba(0, 229, 255, 0.12)' : '#0d1117',
                        border: ang.isRight ? '1px solid #00e5ff' : '1px solid #30363d',
                        borderRadius: 6,
                        padding: '6px 8px',
                      }}
                    >
                      <div style={{ fontSize: 11, color: '#e2e8f0' }}>
                        Tại đỉnh <b style={{ color: '#FFD400' }}>{ang.vertex.id || 'G'}</b> với <b style={{ color: '#38bdf8' }}>{ang.otherLine.label || 'Cạnh'}</b>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: ang.isRight ? '#00e5ff' : '#FFD400', fontFamily: 'monospace' }}>
                        {ang.isRight ? '⟂ 90.0° (Vuông góc)' : `${fmt(ang.angleDeg, 1)}°`}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: 11, color: '#8b949e', fontStyle: 'italic' }}>
                  Chưa phát hiện góc chung với các cạnh khác. Hãy nối với các đỉnh lân cận.
                </div>
              )}
            </div>
          )}

          {/* 2. Smart Geometric Suggestions */}
          {suggestedConnections.length > 0 && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#38bdf8', display: 'flex', alignItems: 'center', gap: 6 }}>
                  <Sparkles size={14} color="#38bdf8" /> Gợi ý đường hình học liên quan
                </div>
                <span style={{ fontSize: 10, color: '#8b949e' }}>{suggestedConnections.length} gợi ý</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', paddingRight: 4 }}>
                {suggestedConnections.slice(0, 6).map((sug, sIdx) => (
                  <div
                    key={`sug_${sIdx}`}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      background: '#0d1117',
                      border: '1px solid #21262d',
                      borderRadius: 6,
                      padding: '6px 8px',
                      gap: 8,
                    }}
                  >
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: '#e2e8f0', display: 'flex', alignItems: 'center', gap: 6 }}>
                        <span>{sug.title}</span>
                        {sug.isRight && (
                          <span style={{ fontSize: 9, background: 'rgba(0, 229, 255, 0.2)', color: '#00e5ff', padding: '1px 4px', borderRadius: 3 }}>⟂ 90°</span>
                        )}
                      </div>
                      <div style={{ fontSize: 10, color: '#8b949e' }}>{sug.desc}</div>
                    </div>
                    <button
                      onClick={() => {
                        const newLine = {
                          id: `user_l_${sug.id1}_${sug.id2}_${Date.now()}`,
                          from: { id: sug.p1.id, x: sug.p1.x, y: sug.p1.y },
                          to: { id: sug.p2.id, x: sug.p2.x, y: sug.p2.y },
                          label: `${sug.id1}${sug.id2}`,
                          color: sug.isRight ? '#00e5ff' : '#38bdf8',
                        };
                        setUserLines((prev) => [...prev, newLine]);
                        setActiveSelectedLine(newLine);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        background: '#21262d',
                        border: '1px solid #388bfd',
                        borderRadius: 4,
                        color: '#388bfd',
                        fontSize: 10,
                        fontWeight: 'bold',
                        padding: '4px 8px',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      <Plus size={11} /> Nối nhanh
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 3. User Lines Manager */}
          {userLines.length > 0 && (
            <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0' }}>
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
                {userLines.map((ul, ulIdx) => (
                  <div
                    key={ul.id || `ul_tag_${ulIdx}`}
                    onClick={() => setActiveSelectedLine(ul)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 4,
                      background: activeSelectedLine?.id === ul.id ? 'rgba(0, 229, 255, 0.2)' : '#0d1117',
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
                      style={{ background: 'none', border: 'none', color: '#8b949e', cursor: 'pointer', padding: 0, display: 'flex', alignItems: 'center' }}
                    >
                      <Trash2 size={11} />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ background: '#161b22', borderRadius: 8, padding: 12, border: '1px solid #30363d', marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Tùy chọn hiển thị</div>
            {(mode === 'Tam giác' || mode === 'Tứ giác' || mode === 'Đa giác đều') && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#8b949e' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showLengths} onChange={(e) => setShowLengths(e.target.checked)} /> Độ dài cạnh
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showAngles} onChange={(e) => setShowAngles(e.target.checked)} /> Góc các đỉnh
                </label>
                {mode === 'Tam giác' && (
                  <>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showMedians} onChange={(e) => setShowMedians(e.target.checked)} />
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#8b5cf6' }} />
                      Trọng tâm G & Trung tuyến
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showOrthocenter} onChange={(e) => setShowOrthocenter(e.target.checked)} />
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f43f5e' }} />
                      Trực tâm H & Đường cao
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showCircumcircle} onChange={(e) => setShowCircumcircle(e.target.checked)} />
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#3b82f6' }} />
                      Tâm & Đường tròn ngoại tiếp (O, R)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showIncenter} onChange={(e) => setShowIncenter(e.target.checked)} />
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#10b981' }} />
                      Tâm & Đường tròn nội tiếp (I, r)
                    </label>
                    <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                      <input type="checkbox" checked={showExcenters} onChange={(e) => setShowExcenters(e.target.checked)} />
                      <span style={{ display: 'inline-block', width: 8, height: 8, borderRadius: '50%', background: '#f59e0b' }} />
                      Tâm & Đường tròn bàng tiếp (Ia, Ib, Ic)
                    </label>
                  </>
                )}
              </div>
            )}
            {mode === 'Hình Elip' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#8b949e' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                  <input type="checkbox" checked={showFoci} onChange={(e) => setShowFoci(e.target.checked)} /> Hiển thị tiêu điểm F₁, F₂
                </label>
              </div>
            )}
          </div>

          <button
            onClick={reset}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              background: '#21262d',
              color: '#e2e8f0',
              border: '1px solid #30363d',
              borderRadius: 6,
              padding: '6px 14px',
              fontSize: 12,
              cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}

