'use client';
import { useState, useMemo } from 'react';
import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid, ResponsiveContainer,
  ReferenceDot, ReferenceLine,
} from 'recharts';
import * as math from 'mathjs';
import MathVizTitle from './MathVizTitle';

const CURVE_COLOR = '#e6533c';
const TANGENT_COLOR = '#3b82f6';
const AREA_COLOR = '#10b981';

function safeCompile(expr) {
  try { return math.parse(expr).compile(); } catch { return null; }
}
function safeDerivative(expr) {
  try { return math.derivative(expr, 'x').compile(); } catch { return null; }
}
function fmt(n, d = 2) { return Number.isFinite(n) ? n.toFixed(d) : '—'; }

export default function MathVizFunctionPlot({ data }) {
  // Parse data prop
  const paramSpecs = data?.params ? Object.entries(data.params) : [['a',{min:-3,max:3,default:1,step:0.1}],['b',{min:-5,max:5,default:0,step:0.1}],['c',{min:-5,max:5,default:0,step:0.1}]];
  const initParamValues = () => Object.fromEntries(paramSpecs.map(([k,s]) => [k, s.default]));
  const expr = data?.expr || 'a*x^2 + b*x + c';
  const xDomain = data?.x_domain || [-6, 6];
  const overlays = data?.overlays || [];
  const showTangent = overlays.some(o => o.kind === 'tangent_at');
  const tangentX0 = overlays.find(o => o.kind === 'tangent_at')?.x0 ?? 1.0;
  const showArea = overlays.some(o => o.kind === 'shade_area');
  const areaFrom = overlays.find(o => o.kind === 'shade_area')?.from ?? 0;
  const areaTo = overlays.find(o => o.kind === 'shade_area')?.to ?? 2;
  const showExtrema = overlays.some(o => o.kind === 'extrema');

  const [paramValues, setParamValues] = useState(initParamValues);
  const [localShowTangent, setLocalShowTangent] = useState(showTangent);
  const [x0, setX0] = useState(tangentX0);
  const [localShowArea, setLocalShowArea] = useState(showArea);
  const [localAreaFrom, setLocalAreaFrom] = useState(areaFrom);
  const [localAreaTo, setLocalAreaTo] = useState(areaTo);

  const updateParam = (key, val) => setParamValues(prev => ({ ...prev, [key]: val }));

  const compiled = useMemo(() => safeCompile(expr), [expr]);
  const derivCompiled = useMemo(() => safeDerivative(expr), [expr]);

  const evalF = (x, params) => {
    if (!compiled) return null;
    try {
      const v = compiled.evaluate({ x, ...params, pi: Math.PI, e: Math.E });
      return typeof v === 'number' && Number.isFinite(v) ? v : null;
    } catch { return null; }
  };

  const evalDeriv = (x, params) => {
    if (derivCompiled) {
      try {
        const v = derivCompiled.evaluate({ x, ...params, pi: Math.PI, e: Math.E });
        if (typeof v === 'number' && Number.isFinite(v)) return v;
      } catch {}
    }
    const h = 1e-4;
    const f1 = evalF(x + h, params), f2 = evalF(x - h, params);
    return f1 != null && f2 != null ? (f1 - f2) / (2 * h) : null;
  };

  const [xMin, xMax] = xDomain;

  const data_pts = useMemo(() => {
    const N = 300, pts = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      pts.push({ x, y: evalF(x, paramValues) });
    }
    return pts;
  }, [xMin, xMax, expr, paramValues]); // eslint-disable-line

  const yDomain = useMemo(() => {
    const ys = data_pts.map(p => p.y).filter(v => v != null);
    if (!ys.length) return [-5, 5];
    let lo = Math.min(...ys), hi = Math.max(...ys);
    if (lo === hi) { lo -= 1; hi += 1; }
    const pad = (hi - lo) * 0.15;
    return [lo - pad, hi + pad];
  }, [data_pts]);

  const clampedX0 = Math.min(xMax, Math.max(xMin, x0));
  const fAtX0 = evalF(clampedX0, paramValues);
  const slopeAtX0 = evalDeriv(clampedX0, paramValues);

  const tangentData = useMemo(() => {
    if (!localShowTangent || fAtX0 == null || slopeAtX0 == null) return [];
    return [
      { x: xMin, ty: fAtX0 + slopeAtX0 * (xMin - clampedX0) },
      { x: xMax, ty: fAtX0 + slopeAtX0 * (xMax - clampedX0) },
    ];
  }, [localShowTangent, fAtX0, slopeAtX0, xMin, xMax, clampedX0]);

  const clampedFrom = Math.min(xMax, Math.max(xMin, Math.min(localAreaFrom, localAreaTo)));
  const clampedTo = Math.min(xMax, Math.max(xMin, Math.max(localAreaFrom, localAreaTo)));

  const areaData = useMemo(() => {
    if (!localShowArea) return [];
    const N = 120, pts = [];
    for (let i = 0; i <= N; i++) {
      const x = clampedFrom + ((clampedTo - clampedFrom) * i) / N;
      pts.push({ x, y: evalF(x, paramValues) });
    }
    return pts;
  }, [localShowArea, clampedFrom, clampedTo, expr, paramValues]); // eslint-disable-line

  const areaValue = useMemo(() => {
    if (!localShowArea) return null;
    const N = 400, h = (clampedTo - clampedFrom) / N;
    if (h <= 0) return 0;
    let sum = 0;
    for (let i = 0; i <= N; i++) {
      const x = clampedFrom + i * h;
      const y = evalF(x, paramValues);
      const w = i === 0 || i === N ? 0.5 : 1;
      sum += (y ?? 0) * w;
    }
    return sum * h;
  }, [localShowArea, clampedFrom, clampedTo, expr, paramValues]); // eslint-disable-line

  const reset = () => { setParamValues(initParamValues()); setX0(tangentX0); setLocalAreaFrom(areaFrom); setLocalAreaTo(areaTo); };

  const container = { background:'#0d1117', borderRadius:12, padding:16, color:'#e2e8f0', margin:'12px 0', border:'1px solid #30363d' };
  const chipStyle = { background:'#161b22', border:'1px solid #30363d', borderRadius:8, padding:'8px 12px', marginRight:8, marginBottom:8, display:'inline-block' };
  const labelStyle = { fontSize:10, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.05em' };
  const valueStyle = { fontSize:13, fontFamily:'monospace', color:'#e2e8f0', marginTop:4 };
  const sliderLabelStyle = { display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b949e', marginBottom:4 };

  return (
    <div style={container}>
      <MathVizTitle icon="📈" title={data?.title} fallback="Đồ thị hàm số" />
      <div style={{ fontSize:11, fontFamily:'monospace', background:'#161b22', borderRadius:6, padding:'6px 10px', marginBottom:12, color:'#79c0ff' }}>f(x) = {expr}</div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart margin={{ top:8, right:12, bottom:0, left:-18 }}>
          <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
          <XAxis dataKey="x" type="number" domain={xDomain} stroke="#30363d" tick={{ fill:'#8b949e', fontSize:11 }} />
          <YAxis type="number" domain={yDomain} stroke="#30363d" tick={{ fill:'#8b949e', fontSize:11 }} />
          <ReferenceLine y={0} stroke="#30363d" />
          {localShowArea && areaData.length > 0 && (
            <Area data={areaData} dataKey="y" type="monotone" stroke="none" fill={AREA_COLOR} fillOpacity={0.28} isAnimationActive={false} connectNulls={false} />
          )}
          <Line data={data_pts} dataKey="y" type="monotone" stroke={CURVE_COLOR} strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={false} />
          {localShowTangent && tangentData.length > 0 && (
            <Line data={tangentData} dataKey="ty" type="linear" stroke={TANGENT_COLOR} strokeWidth={2} strokeDasharray="6 4" dot={false} isAnimationActive={false} />
          )}
          {fAtX0 != null && (
            <ReferenceDot x={clampedX0} y={fAtX0} r={5} fill="#f0f6fc" stroke={CURVE_COLOR} />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display:'flex', flexWrap:'wrap', marginTop:12 }}>
        <div style={chipStyle}><div style={labelStyle}>Point</div><div style={valueStyle}>({fmt(clampedX0)}, {fmt(fAtX0 ?? NaN)})</div></div>
        <div style={chipStyle}><div style={labelStyle}>f&apos;(x₀)</div><div style={{...valueStyle, color: localShowTangent ? TANGENT_COLOR : '#8b949e'}}>{localShowTangent ? fmt(slopeAtX0 ?? NaN, 3) : '—'}</div></div>
        {localShowArea && <div style={chipStyle}><div style={labelStyle}>∫ f(x)dx</div><div style={{...valueStyle, color:AREA_COLOR}}>{fmt(areaValue ?? NaN, 3)}</div></div>}
      </div>

      <div style={{ marginTop:16 }}>
        {paramSpecs.map(([key, spec]) => (
          <div key={key} style={{ marginBottom:12 }}>
            <div style={sliderLabelStyle}><span>{key}</span><span>{fmt(paramValues[key])}</span></div>
            <input type="range" min={spec.min} max={spec.max} step={spec.step} value={paramValues[key]}
              onChange={e => updateParam(key, parseFloat(e.target.value))}
              style={{ width:'100%', accentColor:CURVE_COLOR }} />
          </div>
        ))}
        {localShowTangent && (
          <div style={{ marginBottom:12 }}>
            <div style={sliderLabelStyle}><span>x₀ (tiếp tuyến)</span><span>{fmt(clampedX0)}</span></div>
            <input type="range" min={xMin} max={xMax} step={(xMax-xMin)/200} value={clampedX0}
              onChange={e => setX0(parseFloat(e.target.value))} style={{ width:'100%', accentColor:TANGENT_COLOR }} />
          </div>
        )}
      </div>
      <button onClick={reset} style={{ marginTop:8, padding:'6px 14px', fontSize:12, background:'#21262d', color:'#e2e8f0', border:'1px solid #30363d', borderRadius:6, cursor:'pointer' }}>↺ Reset</button>
    </div>
  );
}
