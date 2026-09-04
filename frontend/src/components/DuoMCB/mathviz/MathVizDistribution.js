'use client';
import { useState, useMemo } from 'react';
import {
  ComposedChart, BarChart, Bar, Cell, Line, Area, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, ReferenceDot, ReferenceLine,
} from 'recharts';
import * as math from 'mathjs';
import MathVizTitle from './MathVizTitle';

const BAR_COLOR = '#6366f1';
const HIGHLIGHT_COLOR = '#e6533c';
const CURVE_COLOR = '#6366f1';
const CDF_FILL = '#a5b4fc';

function erf(x) {
  const sign = x < 0 ? -1 : 1, ax = Math.abs(x);
  const a1=0.254829592,a2=-0.284496736,a3=1.421413741,a4=-1.453152027,a5=1.061405429,p=0.3275911;
  const t = 1/(1+p*ax);
  return sign*(1-((((a5*t+a4)*t+a3)*t+a2)*t+a1)*t*Math.exp(-ax*ax));
}

const KIND_SPECS = {
  binomial: {
    label:'Nhị thức B(n,p)', formula:'B(n, p)', discrete:true,
    paramSpecs:[['n',{min:1,max:40,default:10,step:1}],['p',{min:0,max:1,default:0.5,step:0.01}]],
    support:(v)=>{const o=[];for(let k=0;k<=v.n;k++)o.push(k);return o;},
    pmf:(k,v)=>math.combinations(v.n,k)*Math.pow(v.p,k)*Math.pow(1-v.p,v.n-k),
    mean:(v)=>v.n*v.p, variance:(v)=>v.n*v.p*(1-v.p),
  },
  normal: {
    label:'Phân phối chuẩn N(μ,σ²)', formula:'N(μ, σ²)', discrete:false,
    paramSpecs:[['mu',{min:-10,max:10,default:0,step:0.1}],['sigma',{min:0.1,max:5,default:1,step:0.1}]],
    domain:(v)=>[v.mu-4*v.sigma,v.mu+4*v.sigma],
    pdf:(x,v)=>(1/(v.sigma*Math.sqrt(2*Math.PI)))*Math.exp(-((x-v.mu)**2)/(2*v.sigma**2)),
    cdf:(x,v)=>0.5*(1+erf((x-v.mu)/(v.sigma*Math.sqrt(2)))),
    mean:(v)=>v.mu, variance:(v)=>v.sigma**2,
  },
  uniform_discrete: {
    label:'Đều rời rạc', formula:'U{a,...,b}', discrete:true,
    paramSpecs:[['a',{min:-10,max:10,default:1,step:1}],['b',{min:-10,max:20,default:6,step:1}]],
    support:(v)=>{const lo=Math.min(v.a,v.b),hi=Math.max(v.a,v.b),o=[];for(let k=lo;k<=hi;k++)o.push(k);return o;},
    pmf:(k,v)=>1/(Math.abs(v.b-v.a)+1),
    mean:(v)=>(v.a+v.b)/2, variance:(v)=>{const n=Math.abs(v.b-v.a)+1;return(n*n-1)/12;},
  },
};

const KIND_KEYS = Object.keys(KIND_SPECS);
function fmt(n, d=3) { return Number.isFinite(n) ? n.toFixed(d) : '—'; }
function initialParamValues(specs) { return Object.fromEntries(specs.map(([k,s])=>[k,s.default])); }

export default function MathVizDistribution({ data }) {
  // Map data.kind to local kind key (e.g. 'binomial' stays, 'normal' stays)
  const initKind = data?.kind && KIND_SPECS[data.kind] ? data.kind : 'binomial';

  // Merge data.params defaults into paramSpecs
  function getInitParams(kind) {
    const spec = KIND_SPECS[kind];
    const base = initialParamValues(spec.paramSpecs);
    if (data?.params && kind === initKind) {
      Object.entries(data.params).forEach(([k, v]) => {
        if (v?.default !== undefined && k in base) base[k] = v.default;
      });
    }
    return base;
  }

  const [kind, setKind] = useState(initKind);
  const [paramValues, setParamValues] = useState(() => getInitParams(initKind));
  const [point, setPoint] = useState(data?.highlight_k ?? 5);

  const spec = KIND_SPECS[kind];

  const switchKind = (nextKind) => {
    const np = getInitParams(nextKind);
    setKind(nextKind); setParamValues(np);
    setPoint(KIND_SPECS[nextKind].discrete ? Math.round(KIND_SPECS[nextKind].mean(np)) : KIND_SPECS[nextKind].mean(np));
  };

  const updateParam = (key, val) => setParamValues(prev => ({ ...prev, [key]: val }));
  const mean = spec.mean(paramValues), variance = spec.variance(paramValues), stdDev = Math.sqrt(Math.max(0, variance));

  const support = useMemo(() => spec.discrete ? spec.support(paramValues) : [], [spec, paramValues]); // eslint-disable-line
  const barData = useMemo(() => spec.discrete ? support.map(k => ({k, p:spec.pmf(k, paramValues)})) : [], [spec, support, paramValues]); // eslint-disable-line

  const clampedK = spec.discrete ? Math.min(support[support.length-1]??0, Math.max(support[0]??0, Math.round(point))) : null;
  const pmfAtK = spec.discrete ? spec.pmf(clampedK, paramValues) : null;
  const cdfAtK = spec.discrete ? support.filter(k=>k<=clampedK).reduce((acc,k)=>acc+spec.pmf(k,paramValues),0) : null;

  const [dMin, dMax] = spec.discrete ? [0,0] : spec.domain(paramValues);
  const curveData = useMemo(() => {
    if (spec.discrete) return [];
    const N=240,pts=[];
    for(let i=0;i<=N;i++){const x=dMin+((dMax-dMin)*i)/N;pts.push({x,y:spec.pdf(x,paramValues)});}
    return pts;
  }, [spec, dMin, dMax, paramValues]); // eslint-disable-line

  const clampedX = spec.discrete ? null : Math.min(dMax, Math.max(dMin, point));
  const cdfAreaData = useMemo(() => {
    if (spec.discrete) return [];
    const N=160,pts=[];
    for(let i=0;i<=N;i++){const x=dMin+((clampedX-dMin)*i)/N;pts.push({x,y:spec.pdf(x,paramValues)});}
    return pts;
  }, [spec, dMin, clampedX, paramValues]); // eslint-disable-line
  const pdfAtX = spec.discrete ? null : spec.pdf(clampedX, paramValues);
  const cdfAtX = spec.discrete ? null : spec.cdf(clampedX, paramValues);

  const reset = () => switchKind(kind);

  const container = { background:'#0d1117', borderRadius:12, padding:16, color:'#e2e8f0', margin:'12px 0', border:'1px solid #30363d' };
  const chipStyle = { background:'#161b22', border:'1px solid #30363d', borderRadius:8, padding:'8px 12px', marginRight:8, marginBottom:8, display:'inline-block' };
  const labelStyle = { fontSize:10, color:'#8b949e', textTransform:'uppercase', letterSpacing:'0.05em' };
  const valueStyle = { fontSize:13, fontFamily:'monospace', color:'#e2e8f0', marginTop:4 };

  return (
    <div style={container}>
      <MathVizTitle icon="📊" title={data?.title} fallback="Phân phối xác suất" />

      <div style={{ display:'flex', flexWrap:'wrap', gap:8, marginBottom:12 }}>
        {KIND_KEYS.map(k => (
          <button key={k} onClick={() => switchKind(k)}
            style={{ padding:'6px 12px', borderRadius:20, fontSize:12, border:'1px solid', cursor:'pointer',
              background: kind===k ? '#6366f1' : '#21262d',
              color: kind===k ? '#fff' : '#e2e8f0',
              borderColor: kind===k ? '#6366f1' : '#30363d' }}>
            {KIND_SPECS[k].label}
          </button>
        ))}
      </div>

      <ResponsiveContainer width="100%" height={240}>
        {spec.discrete ? (
          <BarChart data={barData} margin={{top:8,right:12,bottom:0,left:-18}}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="k" stroke="#30363d" tick={{fill:'#8b949e',fontSize:11}} />
            <YAxis stroke="#30363d" tick={{fill:'#8b949e',fontSize:11}} />
            <Bar dataKey="p" isAnimationActive={false}>
              {barData.map(d => <Cell key={d.k} fill={d.k===clampedK?HIGHLIGHT_COLOR:BAR_COLOR} />)}
            </Bar>
          </BarChart>
        ) : (
          <ComposedChart margin={{top:8,right:12,bottom:0,left:-18}}>
            <CartesianGrid stroke="#21262d" strokeDasharray="3 3" />
            <XAxis dataKey="x" type="number" domain={[dMin,dMax]} stroke="#30363d" tick={{fill:'#8b949e',fontSize:11}} />
            <YAxis type="number" stroke="#30363d" tick={{fill:'#8b949e',fontSize:11}} />
            <ReferenceLine y={0} stroke="#30363d" />
            <ReferenceLine x={mean} stroke="#8b949e" strokeDasharray="4 4" />
            <Area data={cdfAreaData} dataKey="y" type="monotone" stroke="none" fill={CDF_FILL} fillOpacity={0.45} isAnimationActive={false} connectNulls={false} />
            <Line data={curveData} dataKey="y" type="monotone" stroke={CURVE_COLOR} strokeWidth={2.5} dot={false} isAnimationActive={false} connectNulls={false} />
            {pdfAtX!=null && <ReferenceDot x={clampedX} y={pdfAtX} r={5} fill={HIGHLIGHT_COLOR} stroke="white" />}
          </ComposedChart>
        )}
      </ResponsiveContainer>

      <div style={{ display:'flex', flexWrap:'wrap', marginTop:12 }}>
        <div style={chipStyle}><div style={labelStyle}>Mean μ</div><div style={valueStyle}>{fmt(mean,3)}</div></div>
        <div style={chipStyle}><div style={labelStyle}>Var σ²</div><div style={valueStyle}>{fmt(variance,3)}</div></div>
        <div style={chipStyle}><div style={labelStyle}>Std σ</div><div style={valueStyle}>{fmt(stdDev,3)}</div></div>
        <div style={chipStyle}><div style={labelStyle}>{spec.discrete?'P(X=k)':'f(x)'}</div><div style={{...valueStyle,color:HIGHLIGHT_COLOR}}>{spec.discrete?fmt(pmfAtK,4):fmt(pdfAtX,4)}</div></div>
      </div>
      <div style={{...chipStyle, width:'100%', boxSizing:'border-box', marginRight:0}}>
        <div style={labelStyle}>{spec.discrete?`P(X ≤ ${clampedK})`:`P(X ≤ ${fmt(clampedX,2)})`}</div>
        <div style={{...valueStyle,color:'#818cf8'}}>{spec.discrete?fmt(cdfAtK,4):fmt(cdfAtX,4)}</div>
      </div>

      <div style={{ marginTop:16 }}>
        {spec.paramSpecs.map(([key, ps]) => (
          <div key={key} style={{ marginBottom:12 }}>
            <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b949e', marginBottom:4 }}><span>{key}</span><span>{fmt(paramValues[key], key==='p'?2:1)}</span></div>
            <input type="range" min={ps.min} max={ps.max} step={ps.step} value={paramValues[key]} onChange={e=>updateParam(key,parseFloat(e.target.value))} style={{ width:'100%', accentColor:BAR_COLOR }} />
          </div>
        ))}
        <div style={{ marginBottom:12 }}>
          <div style={{ display:'flex', justifyContent:'space-between', fontSize:12, color:'#8b949e', marginBottom:4 }}><span>{spec.discrete?'k':'x'}</span><span>{spec.discrete?clampedK:fmt(clampedX,2)}</span></div>
          <input type="range" min={spec.discrete?support[0]??0:dMin} max={spec.discrete?support[support.length-1]??0:dMax}
            step={spec.discrete?1:(dMax-dMin)/200} value={spec.discrete?clampedK:clampedX}
            onChange={e=>setPoint(parseFloat(e.target.value))} style={{ width:'100%', accentColor:HIGHLIGHT_COLOR }} />
        </div>
      </div>
      <button onClick={reset} style={{ padding:'6px 14px', fontSize:12, background:'#21262d', color:'#e2e8f0', border:'1px solid #30363d', borderRadius:6, cursor:'pointer' }}>↺ Reset</button>
    </div>
  );
}
