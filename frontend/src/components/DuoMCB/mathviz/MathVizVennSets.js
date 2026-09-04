'use client';
import { useState } from 'react';
import MathVizTitle from './MathVizTitle';

export default function MathVizVennSets({ data }) {
  const sets = data?.sets || [
    { id: 'A', label: { vi: 'Tập A', en: 'Set A' }, color: '#39FF14', elements: [1, 2, 3, 4] },
    { id: 'B', label: { vi: 'Tập B', en: 'Set B' }, color: '#00E5FF', elements: [3, 4, 5, 6] },
  ];
  const initOp = data?.highlight_operation || 'intersection';
  const [activeOp, setActiveOp] = useState(initOp);

  const setA = sets[0] || { id: 'A', elements: [] };
  const setB = sets[1] || { id: 'B', elements: [] };

  const elemsA = new Set(setA.elements || []);
  const elemsB = new Set(setB.elements || []);

  const onlyA = [...elemsA].filter((x) => !elemsB.has(x));
  const onlyB = [...elemsB].filter((x) => !elemsA.has(x));
  const inter = [...elemsA].filter((x) => elemsB.has(x));
  const union = [...new Set([...elemsA, ...elemsB])];

  const getResultElements = () => {
    switch (activeOp) {
      case 'intersection': return inter;
      case 'union': return union;
      case 'difference': return onlyA;
      default: return [];
    }
  };

  const container = { background: '#0d1117', borderRadius: 12, padding: 16, color: '#e2e8f0', margin: '12px 0', border: '1px solid #30363d' };
  const chipStyle = { background: '#161b22', border: '1px solid #30363d', borderRadius: 8, padding: '8px 12px', marginRight: 8, marginBottom: 8, display: 'inline-block' };

  return (
    <div style={container}>
      <MathVizTitle icon="⭕" title={data?.title} fallback="Biểu đồ Venn" />

      <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
        {[
          ['intersection', 'Giao (A ∩ B)'],
          ['union', 'Hợp (A ∪ B)'],
          ['difference', 'Hiệu (A \\ B)'],
          ['none', 'Không tô'],
        ].map(([op, label]) => (
          <button
            key={op} onClick={() => setActiveOp(op)}
            style={{
              padding: '6px 12px', borderRadius: 16, fontSize: 12, border: '1px solid', cursor: 'pointer',
              background: activeOp === op ? '#00E5FF' : '#21262d',
              color: activeOp === op ? '#000' : '#e2e8f0',
              borderColor: activeOp === op ? '#00E5FF' : '#30363d',
              fontWeight: activeOp === op ? 600 : 400,
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
        {/* SVG Venn Circles */}
        <div style={{ background: '#161b22', borderRadius: 10, padding: 12, border: '1px solid #30363d' }}>
          <svg viewBox="0 0 360 220" style={{ width: '100%', height: 'auto', background: '#0d1117', borderRadius: 8 }}>
            <rect x="10" y="10" width="340" height="200" rx="8" fill="none" stroke="#30363d" strokeWidth="1.5" />
            <text x="24" y="32" fontSize="12" fill="#8b949e">Không gian mẫu Ω</text>

            {/* Circle A */}
            <circle
              cx="135" cy="115" r="75"
              fill={activeOp === 'union' || activeOp === 'difference' ? '#39FF14' : 'none'}
              fillOpacity="0.2"
              stroke="#39FF14" strokeWidth="2.5"
            />
            {/* Circle B */}
            <circle
              cx="225" cy="115" r="75"
              fill={activeOp === 'union' ? '#00E5FF' : 'none'}
              fillOpacity="0.2"
              stroke="#00E5FF" strokeWidth="2.5"
            />

            {/* Highlight intersection if active */}
            {activeOp === 'intersection' && (
              <path
                d="M 180 55 A 75 75 0 0 1 180 175 A 75 75 0 0 1 180 55"
                fill="#FFD400" fillOpacity="0.4" stroke="#FFD400" strokeWidth="2"
              />
            )}

            {/* Labels */}
            <text x="90" y="55" fontSize="14" fontWeight="bold" fill="#39FF14">{setA.label?.vi || 'Tập A'}</text>
            <text x="250" y="55" fontSize="14" fontWeight="bold" fill="#00E5FF">{setB.label?.vi || 'Tập B'}</text>

            {/* Elements */}
            <text x="110" y="120" fontSize="12" fill="#e2e8f0" textAnchor="middle">{onlyA.join(', ')}</text>
            <text x="180" y="120" fontSize="12" fontWeight="bold" fill="#FFD400" textAnchor="middle">{inter.join(', ')}</text>
            <text x="250" y="120" fontSize="12" fill="#e2e8f0" textAnchor="middle">{onlyB.join(', ')}</text>
          </svg>
        </div>

        {/* Elements readout */}
        <div>
          <div style={chipStyle}>
            <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase' }}>Kết quả phép toán</div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#00E5FF', marginTop: 4 }}>
              {`{ ${getResultElements().join(', ')} }`} ({getResultElements().length} phần tử)
            </div>
          </div>
          <div style={chipStyle}>
            <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase' }}>Tập A</div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#39FF14', marginTop: 4 }}>
              {`{ ${setA.elements?.join(', ')} }`}
            </div>
          </div>
          <div style={chipStyle}>
            <div style={{ fontSize: 10, color: '#8b949e', textTransform: 'uppercase' }}>Tập B</div>
            <div style={{ fontSize: 13, fontFamily: 'monospace', color: '#00E5FF', marginTop: 4 }}>
              {`{ ${setB.elements?.join(', ')} }`}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
