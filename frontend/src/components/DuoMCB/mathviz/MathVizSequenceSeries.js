'use client';
import { useState, useMemo } from 'react';
import {
  ComposedChart, Bar, Line, Cell, XAxis, YAxis, CartesianGrid, ResponsiveContainer, Tooltip,
} from 'recharts';
import { RotateCcw } from 'lucide-react';
import MathVizTitle from './MathVizTitle';

const BAR_COLOR = '#00E5FF';
const HIGHLIGHT_COLOR = '#FF3CAC';
const SUM_COLOR = '#FFD400';

export default function MathVizSequenceSeries({ data }) {
  const initKind = data?.kind || 'arithmetic';
  const initU1 = data?.params?.u1?.default ?? 2;
  const initDiffOrRatio = data?.params?.d_or_q?.default ?? (data?.params?.d?.default ?? 3);
  const initN = data?.params?.n_terms?.default ?? 10;
  const initShowSum = data?.show_partial_sum ?? true;
  const initHighlight = data?.highlight_term ?? 5;

  const [kind, setKind] = useState(initKind);
  const [u1, setU1] = useState(initU1);
  const [stepVal, setStepVal] = useState(initDiffOrRatio);
  const [nTerms, setNTerms] = useState(initN);
  const [showSum, setShowSum] = useState(initShowSum);
  const [highlightTerm, setHighlightTerm] = useState(initHighlight);

  const seriesData = useMemo(() => {
    const pts = [];
    let runningSum = 0;
    for (let n = 1; n <= nTerms; n++) {
      let un = 0;
      if (kind === 'arithmetic') {
        un = u1 + (n - 1) * stepVal;
      } else {
        un = u1 * Math.pow(stepVal, n - 1);
      }
      runningSum += un;
      pts.push({ n: `u${n}`, termIndex: n, un, sn: runningSum });
    }
    return pts;
  }, [kind, u1, stepVal, nTerms]);

  const targetTermVal = seriesData.find((d) => d.termIndex === highlightTerm)?.un;
  const totalSum = seriesData[seriesData.length - 1]?.sn;

  const reset = () => {
    setKind(initKind);
    setU1(initU1);
    setStepVal(initDiffOrRatio);
    setNTerms(initN);
    setShowSum(initShowSum);
    setHighlightTerm(initHighlight);
  };

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };
  const labelStyle = { fontSize: 10, color: '#8b949e', textTransform: 'uppercase', letterSpacing: '0.05em' };
  const valueStyle = { fontSize: 13, fontFamily: 'monospace', color: '#e2e8f0', marginTop: 4 };

  return (
    <div style={container}>
      <MathVizTitle icon="📊" title={data?.title} fallback={kind === 'arithmetic' ? 'Cấp số cộng' : 'Cấp số nhân'} />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        <button
          onClick={() => setKind('arithmetic')}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, border: '1px solid', cursor: 'pointer',
            background: kind === 'arithmetic' ? '#00E5FF' : '#21262d',
            color: kind === 'arithmetic' ? '#000' : '#e2e8f0',
            borderColor: kind === 'arithmetic' ? '#00E5FF' : '#30363d',
            fontWeight: kind === 'arithmetic' ? 600 : 400,
          }}
        >
          Cấp số cộng (d)
        </button>
        <button
          onClick={() => setKind('geometric')}
          style={{
            padding: '6px 14px', borderRadius: 20, fontSize: 12, border: '1px solid', cursor: 'pointer',
            background: kind === 'geometric' ? '#00E5FF' : '#21262d',
            color: kind === 'geometric' ? '#000' : '#e2e8f0',
            borderColor: kind === 'geometric' ? '#00E5FF' : '#30363d',
            fontWeight: kind === 'geometric' ? 600 : 400,
          }}
        >
          Cấp số nhân (q)
        </button>
      </div>

      <ResponsiveContainer width="100%" height={240}>
        <ComposedChart data={seriesData} margin={{ top: 8, right: 12, bottom: 0, left: -18 }}>
          <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
          <XAxis dataKey="n" stroke="#30363d" tick={{ fill: '#8b949e', fontSize: 11 }} />
          <YAxis stroke="#30363d" tick={{ fill: '#8b949e', fontSize: 11 }} />
          <Tooltip
            contentStyle={{ background: '#161b22', border: '1px solid #30363d', borderRadius: 8, color: '#e2e8f0' }}
          />
          <Bar dataKey="un" name="Số hạng un" isAnimationActive={false}>
            {seriesData.map((d) => (
              <Cell key={d.termIndex} fill={d.termIndex === highlightTerm ? HIGHLIGHT_COLOR : BAR_COLOR} />
            ))}
          </Bar>
          {showSum && (
            <Line
              type="monotone" dataKey="sn" name="Tổng riêng phần Sn"
              stroke={SUM_COLOR} strokeWidth={2.5} dot={{ fill: SUM_COLOR, r: 3 }}
            />
          )}
        </ComposedChart>
      </ResponsiveContainer>

      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: 12 }}>
        <div style={chipStyle}>
          <div style={labelStyle}>Công thức tổng quát</div>
          <div style={valueStyle}>
            {kind === 'arithmetic' ? `un = ${u1} + (n-1)·${stepVal}` : `un = ${u1} · (${stepVal})^(n-1)`}
          </div>
        </div>
        <div style={chipStyle}>
          <div style={labelStyle}>Số hạng u{highlightTerm}</div>
          <div style={{ ...valueStyle, color: HIGHLIGHT_COLOR }}>{targetTermVal ?? '—'}</div>
        </div>
        {showSum && (
          <div style={chipStyle}>
            <div style={labelStyle}>Tổng S{nTerms}</div>
            <div style={{ ...valueStyle, color: SUM_COLOR }}>{totalSum ?? '—'}</div>
          </div>
        )}
      </div>

      <div style={{ marginTop: 16 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12 }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
              <span>Số hạng đầu u1</span><span>{u1}</span>
            </div>
            <input
              type="range" min="-10" max="10" step="1" value={u1}
              onChange={(e) => setU1(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: BAR_COLOR }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
              <span>{kind === 'arithmetic' ? 'Công sai d' : 'Công bội q'}</span><span>{stepVal}</span>
            </div>
            <input
              type="range" min={kind === 'arithmetic' ? -5 : 0.5} max={kind === 'arithmetic' ? 5 : 3}
              step={kind === 'arithmetic' ? 1 : 0.1} value={stepVal}
              onChange={(e) => setStepVal(parseFloat(e.target.value))}
              style={{ width: '100%', accentColor: BAR_COLOR }}
            />
          </div>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#8b949e', marginBottom: 4 }}>
              <span>Số lượng số hạng n</span><span>{nTerms}</span>
            </div>
            <input
              type="range" min="3" max="25" step="1" value={nTerms}
              onChange={(e) => setNTerms(parseInt(e.target.value, 10))}
              style={{ width: '100%', accentColor: BAR_COLOR }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 12 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#e2e8f0', cursor: 'pointer' }}>
            <input type="checkbox" checked={showSum} onChange={(e) => setShowSum(e.target.checked)} />
            Hiện đường tổng riêng phần Sn
          </label>
          <button
            onClick={reset}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              background: '#21262d', color: '#e2e8f0', border: '1px solid #30363d', borderRadius: 6, padding: '4px 12px', fontSize: 12, cursor: 'pointer',
            }}
          >
            <RotateCcw size={13} /> Đặt lại
          </button>
        </div>
      </div>
    </div>
  );
}
