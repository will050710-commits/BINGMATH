'use client';
import { useState } from 'react';
import { RotateCcw } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

const SCALE = 30;
const ORIGIN = { x: 180, y: 180 };
const toPx = (re, im) => [ORIGIN.x + re * SCALE, ORIGIN.y - im * SCALE];
const fmt = (n, d = 2) => (Number.isFinite(n) ? n.toFixed(d) : '—');

export default function MathVizComplexPlane({ data }) {
  const initPoints = data?.points || [{ re: 3, im: 4, label: { vi: 'z', en: 'z' }, color: '#39FF14' }];
  const initShowModArg = data?.show_modulus_argument ?? true;
  const initOp = data?.operation || { kind: 'multiply', with: { re: 0, im: 1 } };

  const [points, setPoints] = useState(initPoints);
  const [showModArg, setShowModArg] = useState(initShowModArg);
  const [showOp, setShowOp] = useState(true);

  const p0 = points[0] || { re: 3, im: 4 };
  const modulus = Math.hypot(p0.re, p0.im);
  const argRad = Math.atan2(p0.im, p0.re);
  const argDeg = (argRad * 180) / Math.PI;

  // Compute transformed point if operation exists (e.g., multiply by i: rotation by 90 deg)
  let transformedPt = null;
  if (initOp?.kind === 'multiply' && initOp?.with) {
    const w = initOp.with;
    transformedPt = {
      re: p0.re * w.re - p0.im * w.im,
      im: p0.re * w.im + p0.im * w.re,
      label: "z·i (quay 90°)",
      color: '#00E5FF',
    };
  } else if (initOp?.kind === 'conjugate') {
    transformedPt = {
      re: p0.re,
      im: -p0.im,
      label: "z̄ (liên hợp)",
      color: '#FF3CAC',
    };
  }

  const gridLines = [];
  for (let g = -5; g <= 5; g++) {
    const [gx1, gy1] = toPx(g, -5); const [gx2, gy2] = toPx(g, 5);
    const [hx1, hy1] = toPx(-5, g); const [hx2, hy2] = toPx(5, g);
    gridLines.push(<line key={`v${g}`} x1={gx1} y1={gy1} x2={gx2} y2={gy2} stroke="#21262d" strokeWidth="1" />);
    gridLines.push(<line key={`h${g}`} x1={hx1} y1={hy1} x2={hx2} y2={hy2} stroke="#21262d" strokeWidth="1" />);
  }

  const [ox, oy] = toPx(0, 0);
  const [px, py] = toPx(p0.re, p0.im);

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };
  const labelStyle = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', marginTop: 4 };

  return (
    <div style={container}>
      <MathVizTitle icon="🌐" title={data?.title} fallback="Mặt phẳng phức (Argand Diagram)" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* SVG Argand Plane */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 8, border: '1px solid #30363d' }}>
          <svg viewBox="0 0 360 360" style={{ width: '100%', height: 'auto', background: '#0d1117', borderRadius: 8 }}>
            {gridLines}
            {/* Axes */}
            <line x1="10" y1="180" x2="350" y2="180" stroke="#484f58" strokeWidth="1.5" />
            <line x1="180" y1="10" x2="180" y2="350" stroke="#484f58" strokeWidth="1.5" />
            <text x="340" y="174" fontSize="11" fill="#8b949e">Re</text>
            <text x="186" y="18" fontSize="11" fill="#8b949e">Im</text>

            {/* Modulus circle arc */}
            {showModArg && (
              <circle cx={ox} cy={oy} r={modulus * SCALE} fill="none" stroke="#FFD400" strokeWidth="1" strokeDasharray="3 3" opacity="0.4" />
            )}

            {/* Main Vector z */}
            <line x1={ox} y1={oy} x2={px} y2={py} stroke="#39FF14" strokeWidth="2.5" />
            <circle cx={px} cy={py} r="5" fill="#f0f6fc" stroke="#39FF14" strokeWidth="2" />
            <text x={px + 8} y={py - 6} fontSize="12" fontWeight="bold" fill="#39FF14">
              z({p0.re}, {p0.im})
            </text>

            {/* Transformed Vector if enabled */}
            {showOp && transformedPt && (() => {
              const [tx, ty] = toPx(transformedPt.re, transformedPt.im);
              return (
                <>
                  <line x1={ox} y1={oy} x2={tx} y2={ty} stroke={transformedPt.color} strokeWidth="2" strokeDasharray="5 3" />
                  <circle cx={tx} cy={ty} r="5" fill="#f0f6fc" stroke={transformedPt.color} strokeWidth="2" />
                  <text x={tx + 8} y={ty - 6} fontSize="12" fontWeight="bold" fill={transformedPt.color}>
                    {transformedPt.label}
                  </text>
                </>
              );
            })()}
          </svg>
        </div>

        {/* Readouts & Sliders */}
        <div>
          <div style={{ display: 'flex', flexWrap: 'wrap', marginBottom: 12 }}>
            <div style={chipStyle}>
              <div style={labelStyle}>Số phức z</div>
              <div style={{ ...valueStyle, color: '#39FF14' }}>{`${p0.re} ${p0.im >= 0 ? '+' : '-'} ${Math.abs(p0.im)}i`}</div>
            </div>
            <div style={chipStyle}>
              <div style={labelStyle}>Môđun |z|</div>
              <div style={{ ...valueStyle, color: '#FFD400' }}>{fmt(modulus, 3)}</div>
            </div>
            <div style={chipStyle}>
              <div style={labelStyle}>Acgumen φ (arg z)</div>
              <div style={{ ...valueStyle, color: '#00E5FF' }}>{fmt(argDeg, 1)}° ({fmt(argRad, 3)} rad)</div>
            </div>
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
              <span>Phần thực (Re)</span><span>{p0.re}</span>
            </div>
            <input
              type="range" min="-5" max="5" step="0.5" value={p0.re}
              onChange={(e) => setPoints([{ ...p0, re: parseFloat(e.target.value) }])}
              style={{ width: '100%', accentColor: '#39FF14' }}
            />
          </div>

          <div style={{ marginBottom: 12 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
              <span>Phần ảo (Im)</span><span>{p0.im}</span>
            </div>
            <input
              type="range" min="-5" max="5" step="0.5" value={p0.im}
              onChange={(e) => setPoints([{ ...p0, im: parseFloat(e.target.value) }])}
              style={{ width: '100%', accentColor: '#39FF14' }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6, fontSize: 12, color: '#e2e8f0' }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
              <input type="checkbox" checked={showModArg} onChange={(e) => setShowModArg(e.target.checked)} />
              Hiện vòng tròn môđun |z|
            </label>
            {transformedPt && (
              <label style={{ display: 'flex', alignItems: 'center', gap: 6, cursor: 'pointer' }}>
                <input type="checkbox" checked={showOp} onChange={(e) => setShowOp(e.target.checked)} />
                Hiện ảnh phép toán ({transformedPt.label})
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
