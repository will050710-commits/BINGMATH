'use client';
import { useEffect, useRef, useState, useId } from 'react';
import JXG from 'jsxgraph';
import '@/styles/jsxgraph.css';
import { ZoomIn, ZoomOut, RotateCcw, CheckCircle2, AlertTriangle, Compass } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

export default function MathVizJSXGraph({ data, onSwitchToSvg }) {
  const containerRef = useRef(null);
  const boardRef = useRef(null);
  const rawId = useId();
  const boardId = `jxgbox_${rawId.replace(/:/g, '_')}`;
  const [isClient, setIsClient] = useState(false);
  const [boardReady, setBoardReady] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const verification = data?._verification;

  useEffect(() => {
    if (!isClient || !containerRef.current) return;

    // 1. Gather all points from data
    const rawPoints = [];
    const pointsMap = {};

    // From layers
    if (Array.isArray(data?.layers)) {
      for (const layer of data.layers) {
        if (layer.kind === 'points' && Array.isArray(layer.data)) {
          for (const p of layer.data) {
            const id = p.id || p.name;
            if (id && Number.isFinite(p.x) && Number.isFinite(p.y)) {
              pointsMap[id] = { id, x: Number(p.x), y: Number(p.y), color: p.color };
            }
          }
        } else if ((layer.kind === 'polygon' || layer.kind === 'polyline') && Array.isArray(layer.points)) {
          for (const p of layer.points) {
            const id = p.id || p.name;
            if (id && Number.isFinite(p.x) && Number.isFinite(p.y)) {
              pointsMap[id] = { id, x: Number(p.x), y: Number(p.y), color: p.color };
            }
          }
        } else if (layer.kind === 'line' || layer.kind === 'segment' || layer.kind === 'ray') {
          for (const end of ['from', 'to']) {
            const p = layer[end];
            if (p && typeof p === 'object' && (p.id || p.name) && Number.isFinite(p.x) && Number.isFinite(p.y)) {
              const id = p.id || p.name;
              pointsMap[id] = { id, x: Number(p.x), y: Number(p.y) };
            }
          }
        } else if (layer.kind === 'circle' && layer.center) {
          const c = layer.center;
          const id = c.id || c.name || 'O';
          if (Number.isFinite(c.x) && Number.isFinite(c.y)) {
            pointsMap[id] = { id, x: Number(c.x), y: Number(c.y) };
          }
        }
      }
    }

    // From top-level points
    if (Array.isArray(data?.points)) {
      for (const p of data.points) {
        const id = p.id || p.name;
        if (id && Number.isFinite(p.x) && Number.isFinite(p.y)) {
          pointsMap[id] = { id, x: Number(p.x), y: Number(p.y), color: p.color };
        }
      }
    }

    // From constructions with numerical coordinates (fallback/seed)
    if (Array.isArray(data?.constructions)) {
      for (const c of data.constructions) {
        if (c.point && Number.isFinite(c.x) && Number.isFinite(c.y) && !pointsMap[c.point]) {
          pointsMap[c.point] = { id: c.point, x: Number(c.x), y: Number(c.y), color: c.color };
        }
      }
    }

    const allPts = Object.values(pointsMap);
    const xs = allPts.map((p) => p.x);
    const ys = allPts.map((p) => p.y);

    let bbox = [-6, 6, 6, -6];
    if (xs.length > 0 && ys.length > 0) {
      const minX = Math.min(...xs);
      const maxX = Math.max(...xs);
      const minY = Math.min(...ys);
      const maxY = Math.max(...ys);
      const span = Math.max(maxX - minX, maxY - minY, 6);
      const midX = (minX + maxX) / 2;
      const midY = (minY + maxY) / 2;
      const half = span / 2 + 1.8;
      bbox = [midX - half, midY + half, midX + half, midY - half];
    }

    // Initialize board
    if (boardRef.current) {
      try {
        JXG.JSXGraph.freeBoard(boardRef.current);
      } catch (e) {
        console.debug('Failed to free previous board:', e);
      }
    }

    const board = JXG.JSXGraph.initBoard(boardId, {
      boundingbox: bbox,
      axis: false,
      grid: false,
      showCopyright: false,
      showNavigation: false,
      keepaspectratio: true,
      renderer: 'svg',
    });

    boardRef.current = board;
    const jxgPts = {};

    // Determine derived point names from constructions
    const constructionMap = {};
    if (Array.isArray(data?.constructions)) {
      for (const c of data.constructions) {
        if (c.point) constructionMap[c.point] = c;
      }
    }

    // 2. Create free points first
    for (const p of allPts) {
      if (!constructionMap[p.id]) {
        jxgPts[p.id] = board.create('point', [p.x, p.y], {
          name: p.id,
          size: 3.5,
          strokeColor: p.color || '#38bdf8',
          fillColor: p.color || '#38bdf8',
          fixed: false,
          highlight: true,
          label: {
            offset: [8, 8],
            fontSize: 13,
            color: '#f8fafc',
            cssStyle: 'font-weight: 600; text-shadow: 0 1px 3px rgba(0,0,0,0.8);',
          },
        });
      }
    }

    // 3. Create constructions (geometric deduction)
    const jxgCircles = {};
    const jxgLines = {};

    if (Array.isArray(data?.constructions)) {
      for (const c of data.constructions) {
        const ptName = c.point;
        const type = c.type;
        const ofPts = c.of || [];

        try {
          if (type === 'orthocenter' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const [pA, pB, pC] = ofPts.map((id) => jxgPts[id]);
            const lineBC = board.create('line', [pB, pC], { visible: false });
            const altA = board.create('perpendicular', [lineBC, pA], {
              strokeColor: '#f43f5e',
              strokeWidth: 1.2,
              dash: 2,
              visible: c.show_lines !== false,
            });
            const lineAC = board.create('line', [pA, pC], { visible: false });
            const altB = board.create('perpendicular', [lineAC, pB], {
              strokeColor: '#f43f5e',
              strokeWidth: 1.2,
              dash: 2,
              visible: c.show_lines !== false,
            });
            if (ptName) {
              jxgPts[ptName] = board.create('intersection', [altA, altB, 0], {
                name: ptName,
                size: 3.5,
                strokeColor: c.color || '#f43f5e',
                fillColor: c.color || '#f43f5e',
                label: { offset: [8, 8], fontSize: 13, color: c.color || '#f43f5e', cssStyle: 'font-weight: 700;' },
              });
            }
          } else if ((type === 'circumcenter' || type === 'circumcircle') && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const [pA, pB, pC] = ofPts.map((id) => jxgPts[id]);
            const cCircle = board.create('circumcircle', [pA, pB, pC], {
              strokeColor: c.color || '#3b82f6',
              strokeWidth: 1.8,
              fillColor: c.color || '#3b82f6',
              fillOpacity: 0.05,
              visible: c.hide_circle ? false : true,
            });
            jxgCircles[c.circle_id || 'circumcircle'] = cCircle;
            if (ptName) {
              jxgPts[ptName] = board.create('center', [cCircle], {
                name: ptName,
                size: 3.5,
                strokeColor: c.color || '#3b82f6',
                fillColor: c.color || '#3b82f6',
                label: { offset: [8, 8], fontSize: 13, color: c.color || '#60a5fa', cssStyle: 'font-weight: 600;' },
              });
            }
          } else if ((type === 'incenter' || type === 'incircle') && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const [pA, pB, pC] = ofPts.map((id) => jxgPts[id]);
            const inCircle = board.create('incircle', [pA, pB, pC], {
              strokeColor: c.color || '#10b981',
              strokeWidth: 1.8,
              fillColor: c.color || '#10b981',
              fillOpacity: 0.05,
              visible: c.hide_circle ? false : true,
            });
            jxgCircles[c.circle_id || 'incircle'] = inCircle;
            if (ptName) {
              jxgPts[ptName] = board.create('incenter', [pA, pB, pC], {
                name: ptName,
                size: 3.5,
                strokeColor: c.color || '#10b981',
                fillColor: c.color || '#10b981',
                label: { offset: [8, 8], fontSize: 13, color: c.color || '#34d399', cssStyle: 'font-weight: 600;' },
              });
            }
          } else if (type === 'centroid' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const [pA, pB, pC] = ofPts.map((id) => jxgPts[id]);
            const mBC = board.create('midpoint', [pB, pC], { visible: false });
            const mAC = board.create('midpoint', [pA, pC], { visible: false });
            const medA = board.create('line', [pA, mBC], { visible: false });
            const medB = board.create('line', [pB, mAC], { visible: false });
            if (ptName) {
              jxgPts[ptName] = board.create('intersection', [medA, medB, 0], {
                name: ptName,
                size: 3.5,
                strokeColor: c.color || '#f59e0b',
                fillColor: c.color || '#f59e0b',
                label: { offset: [8, 8], fontSize: 13, color: c.color || '#fbbf24', cssStyle: 'font-weight: 600;' },
              });
            }
          } else if (type === 'midpoint' && ofPts.length === 2 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]]) {
            jxgPts[ptName] = board.create('midpoint', [jxgPts[ofPts[0]], jxgPts[ofPts[1]]], {
              name: ptName,
              size: 3,
              strokeColor: c.color || '#a855f7',
              fillColor: c.color || '#a855f7',
              label: { offset: [8, 8], fontSize: 13, color: c.color || '#c084fc' },
            });
          } else if (type === 'foot' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const pFrom = jxgPts[ofPts[0]];
            const pL1 = jxgPts[ofPts[1]];
            const pL2 = jxgPts[ofPts[2]];
            const baseLine = board.create('line', [pL1, pL2], { visible: false });
            const perp = board.create('perpendicular', [baseLine, pFrom], {
              strokeColor: c.color || '#94a3b8',
              strokeWidth: 1.2,
              dash: 2,
              visible: c.show_line || false,
            });
            jxgPts[ptName] = board.create('intersection', [baseLine, perp, 0], {
              name: ptName,
              size: 3,
              strokeColor: c.color || '#94a3b8',
              fillColor: c.color || '#94a3b8',
              label: { offset: [8, 8], fontSize: 12, color: c.color || '#cbd5e1' },
            });
          } else if (type === 'angle_bisector_foot' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const pV = jxgPts[ofPts[0]];
            const p1 = jxgPts[ofPts[1]];
            const p2 = jxgPts[ofPts[2]];
            const bisLine = board.create('bisector', [p1, pV, p2], {
              strokeColor: c.color || '#f59e0b',
              strokeWidth: 1.2,
              dash: 3,
              visible: c.show_line || false,
            });
            const oppLine = board.create('line', [p1, p2], { visible: false });
            jxgPts[ptName] = board.create('intersection', [bisLine, oppLine, 0], {
              name: ptName,
              size: 3,
              strokeColor: c.color || '#f59e0b',
              fillColor: c.color || '#f59e0b',
              label: { offset: [8, 8], fontSize: 12, color: c.color || '#fbbf24' },
            });
          } else if (type === 'angle_bisector' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const p1 = jxgPts[ofPts[0]];
            const pV = jxgPts[ofPts[1]];
            const p2 = jxgPts[ofPts[2]];
            board.create('bisector', [p1, pV, p2], {
              strokeColor: c.color || '#f59e0b',
              strokeWidth: 1.3,
              dash: 3,
            });
          } else if (type === 'perpendicular_bisector' && ofPts.length === 2 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]]) {
            const [p1, p2] = ofPts.map((id) => jxgPts[id]);
            const seg = board.create('line', [p1, p2], { visible: false });
            const mid = board.create('midpoint', [p1, p2], { visible: false });
            board.create('perpendicular', [seg, mid], {
              strokeColor: c.color || '#06b6d4',
              strokeWidth: 1.3,
              dash: 2,
            });
          } else if (type === 'parallel' && ofPts.length >= 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const pThrough = jxgPts[ofPts[0]];
            const baseLine = board.create('line', [jxgPts[ofPts[1]], jxgPts[ofPts[2]]], { visible: false });
            board.create('parallel', [baseLine, pThrough], {
              strokeColor: c.color || '#8b5cf6',
              strokeWidth: 1.5,
              dash: c.dash || 0,
            });
          } else if (type === 'intersection' && ofPts.length === 4 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]] && jxgPts[ofPts[3]]) {
            const line1 = board.create('line', [jxgPts[ofPts[0]], jxgPts[ofPts[1]]], { visible: false });
            const line2 = board.create('line', [jxgPts[ofPts[2]], jxgPts[ofPts[3]]], { visible: false });
            jxgPts[ptName] = board.create('intersection', [line1, line2, 0], {
              name: ptName,
              size: 3.5,
              strokeColor: c.color || '#ec4899',
              fillColor: c.color || '#ec4899',
              label: { offset: [8, 8], fontSize: 13, color: c.color || '#f472b6', cssStyle: 'font-weight: 600;' },
            });
          } else if (type === 'ratio_point' && ofPts.length === 2 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]]) {
            const p1 = jxgPts[ofPts[0]];
            const p2 = jxgPts[ofPts[1]];
            const ratio = typeof c.ratio === 'number' ? c.ratio : 0.5;
            jxgPts[ptName] = board.create('point', [
              () => p1.X() + ratio * (p2.X() - p1.X()),
              () => p1.Y() + ratio * (p2.Y() - p1.Y()),
            ], {
              name: ptName,
              size: 3,
              strokeColor: c.color || '#06b6d4',
              fillColor: c.color || '#06b6d4',
              label: { offset: [8, 8], fontSize: 12, color: c.color || '#22d3ee' },
            });
          } else if (type === 'reflection' && ofPts.length >= 2 && jxgPts[ofPts[0]]) {
            const pTarget = jxgPts[ofPts[0]];
            if (ofPts.length === 3 && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
              const baseLine = board.create('line', [jxgPts[ofPts[1]], jxgPts[ofPts[2]]], { visible: false });
              jxgPts[ptName] = board.create('reflection', [pTarget, baseLine], {
                name: ptName,
                size: 3,
                strokeColor: c.color || '#e879f9',
                fillColor: c.color || '#e879f9',
                label: { offset: [8, 8], fontSize: 12, color: c.color || '#f0abfc' },
              });
            } else if (ofPts.length === 2 && jxgPts[ofPts[1]]) {
              jxgPts[ptName] = board.create('mirrorpoint', [pTarget, jxgPts[ofPts[1]]], {
                name: ptName,
                size: 3,
                strokeColor: c.color || '#e879f9',
                fillColor: c.color || '#e879f9',
                label: { offset: [8, 8], fontSize: 12, color: c.color || '#f0abfc' },
              });
            }
          } else if (type === 'nine_point_center' && ofPts.length === 3 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]] && jxgPts[ofPts[2]]) {
            const [pA, pB, pC] = ofPts.map((id) => jxgPts[id]);
            const mA = board.create('midpoint', [pB, pC], { visible: false });
            const mB = board.create('midpoint', [pC, pA], { visible: false });
            const mC = board.create('midpoint', [pA, pB], { visible: false });
            const eulerCircle = board.create('circumcircle', [mA, mB, mC], {
              strokeColor: c.color || '#ec4899',
              strokeWidth: 1.5,
              dash: 3,
              fillColor: c.color || '#ec4899',
              fillOpacity: 0.03,
              visible: c.hide_circle ? false : true,
            });
            jxgCircles[c.circle_id || 'euler_circle'] = eulerCircle;
            if (ptName) {
              jxgPts[ptName] = board.create('center', [eulerCircle], {
                name: ptName,
                size: 3,
                strokeColor: c.color || '#ec4899',
                fillColor: c.color || '#ec4899',
                label: { offset: [8, 8], fontSize: 12, color: c.color || '#f472b6' },
              });
            }
          } else if (type === 'point_on_circle' && ofPts.length === 2 && jxgPts[ofPts[0]] && jxgPts[ofPts[1]]) {
            const pCenter = jxgPts[ofPts[0]];
            const pRadius = jxgPts[ofPts[1]];
            const angle = typeof c.angle === 'number' ? c.angle : 0;
            jxgPts[ptName] = board.create('point', [
              () => {
                const r = Math.hypot(pRadius.X() - pCenter.X(), pRadius.Y() - pCenter.Y());
                return pCenter.X() + r * Math.cos(angle);
              },
              () => {
                const r = Math.hypot(pRadius.X() - pCenter.X(), pRadius.Y() - pCenter.Y());
                return pCenter.Y() + r * Math.sin(angle);
              },
            ], {
              name: ptName,
              size: 3.5,
              strokeColor: c.color || '#38bdf8',
              fillColor: c.color || '#38bdf8',
              label: { offset: [8, 8], fontSize: 13, color: c.color || '#f8fafc' },
            });
          } else if (pointsMap[ptName]) {
            // Fallback to resolved numerical position if primitive not direct
            const p = pointsMap[ptName];
            jxgPts[ptName] = board.create('point', [p.x, p.y], {
              name: ptName,
              size: 3.5,
              strokeColor: '#ec4899',
              fillColor: '#ec4899',
              fixed: false,
              label: { offset: [8, 8], fontSize: 13, color: '#f472b6' },
            });
          }
        } catch (err) {
          console.debug(`JSXGraph failed to construct ${ptName}:`, err);
          if (pointsMap[ptName] && !jxgPts[ptName]) {
            const p = pointsMap[ptName];
            jxgPts[ptName] = board.create('point', [p.x, p.y], {
              name: ptName,
              size: 3.5,
              strokeColor: '#ec4899',
              fillColor: '#ec4899',
              fixed: false,
              label: { offset: [8, 8], fontSize: 13, color: '#f472b6' },
            });
          }
        }
      }
    }

    // Ensure all remaining points in pointsMap are drawn
    for (const p of allPts) {
      if (!jxgPts[p.id]) {
        jxgPts[p.id] = board.create('point', [p.x, p.y], {
          name: p.id,
          size: 3.5,
          strokeColor: p.color || '#38bdf8',
          fillColor: p.color || '#38bdf8',
          fixed: false,
          label: { offset: [8, 8], fontSize: 13, color: '#f8fafc' },
        });
      }
    }

    // 4. Render layers (polygons, lines, rays, circles, arcs, angles)
    if (Array.isArray(data?.layers)) {
      for (const layer of data.layers) {
        try {
          if (layer.kind === 'polygon' && Array.isArray(layer.points)) {
            const polyPts = layer.points.map((p) => jxgPts[p.id || p.name]).filter(Boolean);
            if (polyPts.length >= 3) {
              board.create('polygon', polyPts, {
                borders: {
                  strokeColor: layer.color || '#38bdf8',
                  strokeWidth: layer.strokeWidth || 2,
                  dash: layer.style === 'dashed' ? 2 : 0,
                },
                fillColor: layer.color || '#38bdf8',
                fillOpacity: typeof layer.fillOpacity === 'number' ? layer.fillOpacity : 0.08,
                highlight: true,
              });
            }
          } else if (layer.kind === 'line' || layer.kind === 'segment') {
            const fromId = layer.from?.id || layer.from?.name;
            const toId = layer.to?.id || layer.to?.name;
            const pFrom = jxgPts[fromId] || (layer.from && Number.isFinite(layer.from.x) ? board.create('point', [layer.from.x, layer.from.y], { visible: false }) : null);
            const pTo = jxgPts[toId] || (layer.to && Number.isFinite(layer.to.x) ? board.create('point', [layer.to.x, layer.to.y], { visible: false }) : null);
            if (pFrom && pTo) {
              board.create('segment', [pFrom, pTo], {
                strokeColor: layer.color || '#60a5fa',
                strokeWidth: layer.strokeWidth || 1.8,
                dash: layer.style === 'dashed' ? 3 : (layer.style === 'dotted' ? 1 : 0),
                name: layer.label || '',
                withLabel: Boolean(layer.label),
                label: { offset: [6, 6], fontSize: 11, color: layer.color || '#94a3b8' },
              });
            }
          } else if (layer.kind === 'ray') {
            const fromId = layer.from?.id || layer.from?.name;
            const toId = layer.to?.id || layer.to?.name;
            const pFrom = jxgPts[fromId];
            const pTo = jxgPts[toId];
            if (pFrom && pTo) {
              board.create('line', [pFrom, pTo], {
                straightFirst: false,
                straightLast: true,
                strokeColor: layer.color || '#60a5fa',
                strokeWidth: layer.strokeWidth || 1.5,
                dash: layer.style === 'dashed' ? 3 : 0,
              });
            }
          } else if (layer.kind === 'circle') {
            if (layer.through_3pts && layer.through_3pts.length === 3) {
              const [p1, p2, p3] = layer.through_3pts.map((id) => jxgPts[id]).filter(Boolean);
              if (p1 && p2 && p3) {
                board.create('circumcircle', [p1, p2, p3], {
                  strokeColor: layer.color || '#3b82f6',
                  strokeWidth: layer.strokeWidth || 1.8,
                  fillColor: layer.color || '#3b82f6',
                  fillOpacity: typeof layer.fillOpacity === 'number' ? layer.fillOpacity : 0.05,
                });
              }
            } else if (layer.center && layer.through && jxgPts[layer.through?.id || layer.through?.name]) {
              const cId = layer.center?.id || layer.center?.name;
              const centerPt = jxgPts[cId] || [layer.center?.x || 0, layer.center?.y || 0];
              const throughPt = jxgPts[layer.through?.id || layer.through?.name];
              board.create('circle', [centerPt, throughPt], {
                strokeColor: layer.color || '#3b82f6',
                strokeWidth: layer.strokeWidth || 1.8,
                fillColor: layer.color || '#3b82f6',
                fillOpacity: typeof layer.fillOpacity === 'number' ? layer.fillOpacity : 0.05,
              });
            } else {
              const cId = layer.center?.id || layer.center?.name;
              const centerPt = jxgPts[cId] || [layer.center?.x || 0, layer.center?.y || 0];
              const r = layer.r || 3;
              board.create('circle', [centerPt, r], {
                strokeColor: layer.color || '#3b82f6',
                strokeWidth: layer.strokeWidth || 1.8,
                fillColor: layer.color || '#3b82f6',
                fillOpacity: typeof layer.fillOpacity === 'number' ? layer.fillOpacity : 0.05,
              });
            }
          } else if (layer.kind === 'arc') {
            const cId = layer.center?.id || layer.center?.name;
            const pCenter = jxgPts[cId] || [layer.center?.x || 0, layer.center?.y || 0];
            const pFrom = jxgPts[layer.from?.id || layer.from?.name];
            const pTo = jxgPts[layer.to?.id || layer.to?.name];
            if (pCenter && pFrom && pTo) {
              board.create('arc', [pCenter, pFrom, pTo], {
                strokeColor: layer.color || '#3b82f6',
                strokeWidth: layer.strokeWidth || 1.8,
              });
            }
          } else if (layer.kind === 'angle') {
            const pts = (layer.points || layer.of || []).map((p) => jxgPts[typeof p === 'string' ? p : (p.id || p.name)]).filter(Boolean);
            if (pts.length === 3) {
              board.create('angle', pts, {
                type: layer.right_angle ? 'square' : 'sector',
                radius: layer.radius || 0.6,
                fillColor: layer.color || '#fbbf24',
                fillOpacity: 0.2,
                strokeColor: layer.color || '#fbbf24',
                strokeWidth: 1.2,
                orthoType: 'square',
                orthoSensitivity: 5,
              });
            }
          } else if (layer.kind === 'polyline' && Array.isArray(layer.points)) {
            const pts = layer.points.map((p) => jxgPts[p.id || p.name]).filter(Boolean);
            if (pts.length >= 2) {
              for (let i = 0; i < pts.length - 1; i++) {
                board.create('segment', [pts[i], pts[i + 1]], {
                  strokeColor: layer.color || '#38bdf8',
                  strokeWidth: layer.strokeWidth || 1.8,
                  dash: layer.style === 'dashed' ? 2 : 0,
                });
              }
            }
          }
        } catch (err) {
          console.debug('Error rendering JSXGraph layer:', err);
        }
      }
    }

    // If single mode triangle/polygon
    if (data?.mode === 'triangle' && Array.isArray(data?.points) && data.points.length === 3) {
      const triPts = data.points.map((p) => jxgPts[p.id]).filter(Boolean);
      if (triPts.length === 3) {
        board.create('polygon', triPts, {
          borders: { strokeColor: '#38bdf8', strokeWidth: 2 },
          fillColor: '#38bdf8',
          fillOpacity: 0.1,
        });
      }
    }

    board.update();
    setBoardReady(true);

    return () => {
      if (boardRef.current) {
        try {
          JXG.JSXGraph.freeBoard(boardRef.current);
          boardRef.current = null;
        } catch (e) {
          console.debug('Cleanup board error:', e);
        }
      }
    };
  }, [data, isClient, boardId]);

  const handleZoomIn = () => {
    if (boardRef.current) boardRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (boardRef.current) boardRef.current.zoomOut();
  };

  const handleReset = () => {
    if (boardRef.current) {
      boardRef.current.zoom100();
    }
  };

  return (
    <div
      style={{
        background: 'linear-gradient(145deg, #090d16, #0f172a)',
        borderRadius: 16,
        padding: 16,
        border: '1px solid rgba(56, 189, 248, 0.2)',
        boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.5)',
        width: '100%',
        maxWidth: 560,
        margin: '12px auto',
        position: 'relative',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <MathVizTitle
          icon={<Compass size={18} style={{ color: '#38bdf8' }} />}
          title={data?.title}
          fallback="Hình học phẳng 2D (Adjusting Mode)"
        />

        {onSwitchToSvg && (
          <button
            onClick={onSwitchToSvg}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: '1px solid rgba(255, 255, 255, 0.15)',
              color: '#94a3b8',
              borderRadius: 6,
              padding: '4px 8px',
              fontSize: 11,
              cursor: 'pointer',
              transition: 'all 0.2s',
            }}
            title="Switch to simple static display mode"
          >
            Simple Display
          </button>
        )}
      </div>

      {/* Verification status badge */}
      {verification && (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 6,
            padding: '6px 12px',
            borderRadius: 8,
            fontSize: 12,
            marginBottom: 10,
            background: verification.status === 'verified' ? 'rgba(34, 197, 94, 0.12)' : 'rgba(234, 179, 8, 0.12)',
            border: `1px solid ${verification.status === 'verified' ? 'rgba(34, 197, 94, 0.3)' : 'rgba(234, 179, 8, 0.3)'}`,
            color: verification.status === 'verified' ? '#4ade80' : '#facc15',
          }}
        >
          {verification.status === 'verified' ? (
            <>
              <CheckCircle2 size={14} />
              <span>
                <strong>Đã kiểm chứng hình học chuẩn xác</strong> ({verification.passed_count}/{verification.total_checked} quan hệ)
              </span>
            </>
          ) : (
            <>
              <AlertTriangle size={14} />
              <span>
                <strong>Lưu ý:</strong> Một số quan hệ chưa khớp hoàn toàn. JSXGraph sẽ tự động điều chỉnh dựng hình.
              </span>
            </>
          )}
        </div>
      )}

      {/* Board container */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          aspectRatio: '1 / 1',
          background: '#040711',
          borderRadius: 12,
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.08)',
        }}
      >
        <div
          id={boardId}
          ref={containerRef}
          className="jxgbox"
          style={{
            width: '100%',
            height: '100%',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />

        {/* Floating controls */}
        <div
          style={{
            position: 'absolute',
            right: 12,
            bottom: 12,
            display: 'flex',
            flexDirection: 'column',
            gap: 6,
            zIndex: 10,
          }}
        >
          <button
            onClick={handleZoomIn}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
            title="Thu phóng gần"
          >
            <ZoomIn size={16} />
          </button>
          <button
            onClick={handleZoomOut}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
            title="Thu phóng xa"
          >
            <ZoomOut size={16} />
          </button>
          <button
            onClick={handleReset}
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: 'rgba(15, 23, 42, 0.85)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: '#f8fafc',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              backdropFilter: 'blur(4px)',
            }}
            title="Khôi phục góc nhìn"
          >
            <RotateCcw size={16} />
          </button>
        </div>
      </div>

      <div style={{ marginTop: 8, fontSize: 11, color: '#64748b', textAlign: 'center' }}>
        💡 <em>Mẹo: Đang ở <strong>Adjusting Mode</strong> — Bạn có thể kéo thả các đỉnh tự do để quan sát đường tròn ngoại tiếp, nội tiếp, tiếp tuyến và đường cao tự động cập nhật chuẩn xác!</em>
      </div>
    </div>
  );
}
