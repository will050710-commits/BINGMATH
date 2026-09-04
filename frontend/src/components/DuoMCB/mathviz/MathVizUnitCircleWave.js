'use client';
import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer, ReferenceDot, ReferenceLine,
} from 'recharts';
import * as math from 'mathjs';
import { Play, Pause, RotateCcw } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

const PRESETS = {
  'sin(x)': Math.sin,
  'cos(x)': Math.cos,
  'tan(x)': Math.tan,
  'sec(x)': (x) => 1 / Math.cos(x),
  'csc(x)': (x) => 1 / Math.sin(x),
  'cot(x)': (x) => 1 / Math.tan(x),
  'sinh(x)': Math.sinh,
  'cosh(x)': Math.cosh,
  'tanh(x)': Math.tanh,
  'arcsin(x)': Math.asin,
  'arccos(x)': Math.acos,
  'arctan(x)': Math.atan,
  'versin(x)': (x) => 1 - Math.cos(x),
  'haversin(x)': (x) => (1 - Math.cos(x)) / 2,
  'sinc(x)': (x) => (x === 0 ? 1 : Math.sin(x) / x),
};
const FUNC_KEYS = [...Object.keys(PRESETS), 'Custom f(x)'];
const UNBOUNDED = new Set(['tan(x)', 'sec(x)', 'csc(x)', 'cot(x)']);
const BASE_RATE = 0.6; // rad/sec at 1x speed
const DEFAULT_COLOR = '#e6533c';

function safeCompile(expr) {
  try { return math.parse(expr).compile(); } catch { return null; }
}
function fmt(n, d = 2) { return Number.isFinite(n) ? n.toFixed(d) : '—'; }
function piLabel(mult) {
  if (Math.abs(mult) < 1e-9) return '0';
  const r = Math.round(mult * 100) / 100;
  return `${r}π`;
}

export default function MathVizUnitCircleWave({ data }) {
  const initPreset = data?.function?.preset || 'sin(x)';
  const initCustom = data?.function?.custom_expr || 'sin(x) + 0.5*sin(3*x)';
  const initRadius = data?.radius_expr || '1';
  const initAmp = data?.params?.amplitude?.default ?? 1;
  const initFreq = data?.params?.frequency?.default ?? 1;
  const initPhase = data?.params?.phase?.default ?? 0;
  const initVShift = data?.params?.vertical_shift?.default ?? 0;
  const initXRange = data?.params?.x_range?.default ?? 2;
  const initSpeed = data?.params?.speed?.default ?? 1;
  const initColor = data?.display?.graph_color || DEFAULT_COLOR;
  const initShowSine = data?.display?.show_sine_line ?? true;
  const initShowCosine = data?.display?.show_cosine_line ?? true;

  const [s, setS] = useState({
    funcKey: PRESETS[initPreset] ? initPreset : (initPreset === 'custom' ? 'Custom f(x)' : 'sin(x)'),
    customFx: initCustom,
    radiusExpr: initRadius,
    amplitude: initAmp,
    frequency: initFreq,
    phase: initPhase,
    vshift: initVShift,
    xRangeMult: initXRange,
    speed: initSpeed,
    color: initColor,
    showSine: initShowSine,
    showCosine: initShowCosine,
  });

  const [playing, setPlaying] = useState(true);
  const [animX, setAnimX] = useState(-initXRange * Math.PI);
  const rafRef = useRef(null);
  const lastTsRef = useRef(null);

  const update = (patch) => setS((prev) => ({ ...prev, ...patch }));

  const xMin = -s.xRangeMult * Math.PI;
  const xMax = s.xRangeMult * Math.PI;

  useEffect(() => { setAnimX(xMin); }, [s.xRangeMult]); // eslint-disable-line

  useEffect(() => {
    function tick(ts) {
      if (lastTsRef.current == null) lastTsRef.current = ts;
      const dt = (ts - lastTsRef.current) / 1000;
      lastTsRef.current = ts;
      if (playing) {
        setAnimX((prev) => {
          const span = xMax - xMin;
          let next = prev + dt * s.speed * BASE_RATE;
          if (span > 0) next = xMin + (((next - xMin) % span) + span) % span;
          return next;
        });
      }
      rafRef.current = requestAnimationFrame(tick);
    }
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [playing, s.speed, xMin, xMax]);

  const customFxCompiled = useMemo(() => safeCompile(s.customFx), [s.customFx]);
  const radiusCompiled = useMemo(() => safeCompile(s.radiusExpr), [s.radiusExpr]);

  const baseFn = useCallback((x) => {
    if (s.funcKey === 'Custom f(x)') {
      if (!customFxCompiled) return NaN;
      try {
        const v = customFxCompiled.evaluate({ x, t: x, pi: Math.PI, e: Math.E });
        return typeof v === 'number' ? v : NaN;
      } catch { return NaN; }
    }
    const f = PRESETS[s.funcKey];
    return f ? f(x) : NaN;
  }, [s.funcKey, customFxCompiled]);

  const radiusFn = useCallback((theta) => {
    if (!radiusCompiled) return 1;
    try {
      const v = radiusCompiled.evaluate({ x: theta, t: theta, pi: Math.PI, e: Math.E });
      return typeof v === 'number' && Number.isFinite(v) ? v : 1;
    } catch { return 1; }
  }, [radiusCompiled]);

  const yAt = useCallback((x) => {
    const raw = s.amplitude * baseFn(s.frequency * x + s.phase) + s.vshift;
    if (!Number.isFinite(raw)) return null;
    const clamp = UNBOUNDED.has(s.funcKey) ? 6 : Math.max(6, s.amplitude + Math.abs(s.vshift) + 1);
    return Math.abs(raw) > clamp ? null : raw;
  }, [s.amplitude, s.frequency, s.phase, s.vshift, s.funcKey, baseFn]);

  const chartData = useMemo(() => {
    const N = 300, pts = [];
    for (let i = 0; i <= N; i++) {
      const x = xMin + ((xMax - xMin) * i) / N;
      pts.push({ x, y: yAt(x) });
    }
    return pts;
  }, [xMin, xMax, yAt]);

  const rawTheta = s.frequency * animX + s.phase;
  const thetaWrapped = ((rawTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
  const currentY = yAt(animX);

  const shapePts = useMemo(() => {
    const N = 240, out = [];
    for (let i = 0; i <= N; i++) {
      const th = (2 * Math.PI * i) / N;
      const r = radiusFn(th);
      out.push([r * Math.cos(th), r * Math.sin(th)]);
    }
    return out;
  }, [radiusFn]);
  const maxR = useMemo(
    () => Math.max(1, ...shapePts.map(([px, py]) => Math.hypot(px, py))),
    [shapePts]
  );

  const scale = 88 / maxR;
  const cx = 130, cy = 130;
  const toPx = (x, y) => [cx + x * scale, cy - y * scale];

  const rTheta = radiusFn(thetaWrapped);
  const px = rTheta * Math.cos(thetaWrapped);
  const py = rTheta * Math.sin(thetaWrapped);
  const [pointX, pointY] = toPx(px, py);
  const [originX, originY] = toPx(0, 0);

  const pathD = shapePts.map(([x, y], i) => {
    const [sx, sy] = toPx(x, y);
    return `${i === 0 ? 'M' : 'L'}${sx.toFixed(1)},${sy.toFixed(1)}`;
  }).join(' ') + ' Z';

  const displayLabel = s.funcKey === 'Custom f(x)' ? 'f(x)' : s.funcKey;
  const period = (2 * Math.PI) / Math.abs(s.frequency || 1e-6);

  const xTicks = useMemo(() => {
    const ticks = [];
    for (let k = -Math.ceil(s.xRangeMult); k <= Math.ceil(s.xRangeMult); k++) ticks.push(k * Math.PI);
    return ticks.filter((t) => t >= xMin - 1e-6 && t <= xMax + 1e-6);
  }, [s.xRangeMult, xMin, xMax]);

  const reset = () => {
    setS({
      funcKey: PRESETS[initPreset] ? initPreset : (initPreset === 'custom' ? 'Custom f(x)' : 'sin(x)'),
      customFx: initCustom,
      radiusExpr: initRadius,
      amplitude: initAmp,
      frequency: initFreq,
      phase: initPhase,
      vshift: initVShift,
      xRangeMult: initXRange,
      speed: initSpeed,
      color: initColor,
      showSine: initShowSine,
      showCosine: initShowCosine,
    });
    setPlaying(true);
    setAnimX(-initXRange * Math.PI);
  };

  const sliders = [
    ['Biên độ (A)', s.amplitude, 0, 3, 0.1, (v) => update({ amplitude: v }), fmt(s.amplitude)],
    ['Tần số (ω)', s.frequency, 0.1, 5, 0.05, (v) => update({ frequency: v }), `${fmt(s.frequency)}×`],
    ['Độ lệch pha (φ)', s.phase, -3.14, 3.14, 0.01, (v) => update({ phase: v }), `${fmt(s.phase)} rad`],
    ['Dịch dọc', s.vshift, -3, 3, 0.1, (v) => update({ vshift: v }), fmt(s.vshift)],
    ['Khoảng x', s.xRangeMult, 1, 4, 1, (v) => update({ xRangeMult: v }), `±${s.xRangeMult}π`],
    ['Tốc độ', s.speed, 0, 3, 0.1, (v) => update({ speed: v }), `${fmt(s.speed)}×`],
  ];

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };
  const labelStyle = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', marginTop: 4 };

  return (
    <div style={container}>
      <MathVizTitle icon="🔄" title={data?.title} fallback="Vòng tròn lượng giác & Dạng sóng" />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* Unit circle SVG panel */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 12, border: '1px solid #30363d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Vòng tròn đơn vị</span>
            <span style={{ color: '#8b949e' }}>θ = {fmt(thetaWrapped)} rad</span>
          </div>
          <svg viewBox="0 0 260 260" style={{ width: '100%', height: 'auto', background: '#0d1117', borderRadius: 8 }}>
            <line x1="10" y1={cy} x2="250" y2={cy} stroke="#30363d" strokeWidth="1" />
            <line x1={cx} y1="10" x2={cx} y2="250" stroke="#30363d" strokeWidth="1" />
            <circle cx={cx} cy={cy} r="88" fill="none" stroke="#484f58" strokeWidth="1" strokeDasharray="4 4" />
            <path d={pathD} fill="none" stroke={s.color} strokeWidth="1.5" opacity="0.65" />
            {s.showCosine && (
              <line x1={originX} y1={pointY} x2={pointX} y2={pointY} stroke="#3b82f6" strokeWidth="3" />
            )}
            {s.showSine && (
              <line x1={pointX} y1={originY} x2={pointX} y2={pointY} stroke={s.color} strokeWidth="3" />
            )}
            <line x1={originX} y1={originY} x2={pointX} y2={pointY} stroke="#f0f6fc" strokeWidth="2" />
            <circle cx={pointX} cy={pointY} r="5" fill={s.color} stroke="#fff" strokeWidth="2" />
            <text x="252" y={cy - 6} fontSize="11" fill="#8b949e">x</text>
            <text x={cx + 8} y="16" fontSize="11" fill="#8b949e">y</text>
          </svg>
        </div>

        {/* Waveform panel */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 12, border: '1px solid #30363d' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8, fontSize: 12 }}>
            <span style={{ fontWeight: 600, color: '#e2e8f0' }}>Đồ thị sóng {displayLabel}</span>
            <span style={{ color: s.color, fontWeight: 600 }}>y = {fmt(currentY ?? NaN, 3)}</span>
          </div>
          <ResponsiveContainer width="100%" height={240}>
            <LineChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
              <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
              <XAxis
                dataKey="x" type="number" domain={[xMin, xMax]} ticks={xTicks}
                tickFormatter={(v) => piLabel(v / Math.PI)} stroke="#30363d" tick={{ fill: '#8b949e', fontSize: 11 }}
              />
              <YAxis stroke="#30363d" tick={{ fill: '#8b949e', fontSize: 11 }} domain={UNBOUNDED.has(s.funcKey) ? [-6, 6] : ['auto', 'auto']} />
              <ReferenceLine y={0} stroke="#30363d" />
              <Line
                type="monotone" dataKey="y" stroke={s.color} strokeWidth={2}
                dot={false} connectNulls={false} isAnimationActive={false}
              />
              {currentY != null && <ReferenceDot x={animX} y={currentY} r={5} fill={s.color} stroke="#fff" />}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Readout chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 12 }}>
        <div style={chipStyle}><div style={labelStyle}>HÀM SỐ</div><div style={valueStyle}>{displayLabel}</div></div>
        <div style={chipStyle}><div style={labelStyle}>CHU KỲ T</div><div style={valueStyle}>{piLabel(period / Math.PI)}</div></div>
        <div style={chipStyle}><div style={labelStyle}>BIÊN ĐỘ A</div><div style={valueStyle}>{fmt(s.amplitude)}</div></div>
        <div style={chipStyle}><div style={labelStyle}>PHA BAN ĐẦU φ</div><div style={valueStyle}>{fmt(s.phase)}</div></div>
      </div>

      {/* Controls */}
      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
          {FUNC_KEYS.map((k) => (
            <button
              key={k} onClick={() => update({ funcKey: k })}
              style={{
                padding: '4px 10px', borderRadius: 16, fontSize: 11, border: '1px solid', cursor: 'pointer',
                background: s.funcKey === k ? '#e6533c' : '#21262d',
                color: s.funcKey === k ? '#fff' : '#e2e8f0',
                borderColor: s.funcKey === k ? '#e6533c' : '#30363d',
              }}
            >
              {k}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          {sliders.map(([label, val, min, max, step, onCh, disp]) => (
            <div key={label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
                <span>{label}</span><span>{disp}</span>
              </div>
              <input
                type="range" min={min} max={max} step={step} value={val}
                onChange={(e) => onCh(parseFloat(e.target.value))}
                style={{ width: '100%', accentColor: s.color }}
              />
            </div>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 16 }}>
          <button
            onClick={() => setPlaying((p) => !p)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#238636', color: '#fff', border: 'none', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
            }}
          >
            {playing ? <Pause size={14} /> : <Play size={14} />} {playing ? 'Tạm dừng' : 'Tiếp tục'}
          </button>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#21262d', color: '#e2e8f0', border: '1px solid #30363d', borderRadius: 6, padding: '6px 14px', fontSize: 12, cursor: 'pointer',
            }}
          >
            <RotateCcw size={14} /> Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
