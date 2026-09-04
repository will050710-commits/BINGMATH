'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

const SCALE = 32;
const ORIGIN = { x: 200, y: 200 };
const toPx = (x, y) => [ORIGIN.x + x * SCALE, ORIGIN.y - y * SCALE];

export default function MathVizInequalityRegion({ data }) {
  const ineqs = data?.inequalities || [
    { expr: 'x + y \\le 4', color: '#39FF14' },
    { expr: 'x - y \\ge -1', color: '#00E5FF' },
    { expr: 'x \\ge 0', color: '#FFD400' },
    { expr: 'y \\ge 0', color: '#FF3CAC' },
  ];
  const domain = data?.domain || { x: [-2, 6], y: [-2, 6] };
  const vertices = data?.vertices_of_region || [[0, 0], [4, 0], [1.5, 2.5], [0, 4]];

  const [highlightFeasible, setHighlightFeasible] = useState(data?.highlight_feasible_region ?? true);

  const gridLines = [];
  for (let g = -6; g <= 6; g++) {
    const [gx1, gy1] = toPx(g, -6); const [gx2, gy2] = toPx(g, 6);
    const [hx1, hy1] = toPx(-6, g); const [hx2, hy2] = toPx(6, g);
    gridLines.push(<line key={`v${g}`} x1={gx1} y1={gy1} x2={gx2} y2={gy2} stroke="#21262d" strokeWidth="1" />);
    gridLines.push(<line key={`h${g}`} x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#21262d" strokeWidth="1" />);
  }

  const polyD = vertices.length > 0
    ? vertices.map(([x, y], i) => {
        const [px, py] = toPx(x, y);
        return `${i === 0 ? 'M' : 'L'}${px.toFixed(1)},${py.toFixed(1)}`;
      }).join(' ') + ' Z'
    : '';

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };

  return (
    <div style={container}>
      <MathVizTitle icon="📐" title={data?.title} fallback="Miền nghiệm hệ bất phương trình" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* SVG Plane */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 8, border: '1px solid #30363d' }}>
          <svg viewBox="0 0 400 400" style={{ width: '100%', height: 'auto', background: '#0d1117', borderRadius: 8 }}>
            {gridLines}
            <line x1="10" y1="200" x2="390" y2="200" stroke="#484f58" strokeWidth="1.5" />
            <line x1="200" y1="10" x2="200" y2="390" stroke="#484f58" strokeWidth="1.5" />
            <text x="385" y="194" fontSize="11" fill="#8b949e">x</text>
            <text x="206" y="18" fontSize="11" fill="#8b949e">y</text>

            {/* Feasible Region Polygon */}
            {highlightFeasible && polyD && (
              <path d={polyD} fill="#39FF14" fillOpacity="0.25" stroke="#39FF14" strokeWidth="2.5" />
            )}

            {/* Vertices Dots & Labels */}
            {vertices.map(([vx, vy], i) => {
              const [px, py] = toPx(vx, vy);
              return (
                <g key={i}>
                  <circle cx={px} cy={py} r="5" fill="#f0f6fc" stroke="#39FF14" strokeWidth="2" />
                  <text x={px + 8} y={py - 6} fontSize="11" fontWeight="bold" fill="#f0f6fc">
                    ({vx}, {vy})
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend & Details */}
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Hệ bất phương trình</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 16 }}>
            {ineqs.map((ineq, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, fontFamily: 'monospace' }}>
                <span style={{ width: 12, height: 12, borderRadius: 3, background: ineq.color || '#39FF14' }} />
                <span>{ineq.expr?.replace(/\\\\/g, '\\') || ineq.expr}</span>
              </div>
            ))}
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: '#e2e8f0', marginBottom: 8 }}>Các đỉnh của miền nghiệm</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {vertices.map(([vx, vy], i) => (
              <div key={i} style={chipStyle}>
                <span style={{ fontSize: 11, color: '#8b949e' }}>Đỉnh {i + 1}: </span>
                <span style={{ fontSize: 12, fontFamily: 'monospace', color: '#39FF14' }}>({vx}, {vy})</span>
              </div>
            ))}
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#e2e8f0', cursor: 'pointer' }}>
            <input type="checkbox" checked={highlightFeasible} onChange={(e) => setHighlightFeasible(e.target.checked)} />
            Tô sáng miền nghiệm khả thi
          </label>
        </div>
      </div>
    </div>
  );
}
