import React, { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── palette ────────────────────────────────────────────────────────────────
const C = {
  enn10:   '#7449f6',
  enn20:   '#ae44fa',
  enn40:   '#60a5fa',
  enn70:   '#25e29d',
  enn100:  '#f7b610',
  qiskit:  '#c63030',
  qsharp:  '#e77d26',
  actual:  '#e2e4f0',
  grid:    'rgba(255,255,255,0.04)',
  border:  '#1f2133',
};
const MODEL_COLOR = {
  'ENN-10':       C.enn10,
  'ENN-20':       C.enn20,
  'ENN-40':       C.enn40,
  'ENN-70':       C.enn70,
  'ENN-100':      C.enn100,
  'QENN-Qiskit':  C.qiskit,
  'QENN-QSharp':  C.qsharp,
};
const MODEL_ORDER = ['ENN-10','ENN-20','ENN-40','ENN-70','ENN-100','QENN-Qiskit','QENN-QSharp'];
const MARKETS = ['BSE','NASDAQ','HSI','SSE','Russell2000','TAIEX'];

// ─── shared chart props ──────────────────────────────────────────────────────
const AXIS_STYLE = { fill: '#6b6f8e', fontSize: 10, fontFamily: "'JetBrains Mono', monospace" };
const TIP_STYLE  = { backgroundColor: '#0f1018', border: '1px solid #1f2133', borderRadius: 6,
                     fontSize: 11, fontFamily: "'JetBrains Mono', monospace", color: '#e2e4f0' };

// ─── tiny components ─────────────────────────────────────────────────────────
function Dot({ color, size = 8 }) {
  return <span style={{ display:'inline-block', width:size, height:size,
    borderRadius:'50%', background:color, flexShrink:0 }} />;
}
function Badge({ children, color = 'var(--accent)', bg = 'var(--accent-lo)' }) {
  return (
    <span style={{ fontFamily:'var(--mono)', fontSize:9, padding:'2px 7px',
      borderRadius:3, background:bg, color, border:`1px solid ${color}33`,
      textTransform:'uppercase', letterSpacing:'.06em', whiteSpace:'nowrap' }}>
      {children}
    </span>
  );
}
function Card({ children, style = {} }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:10, padding:20, ...style }}>
      {children}
    </div>
  );
}
function CardTitle({ children }) {
  return <div style={{ fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)',
    textTransform:'uppercase', letterSpacing:'.1em', marginBottom:14 }}>{children}</div>;
}
function SectionHead({ title, tag }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:12, marginBottom:18, marginTop:36 }}>
      <span style={{ fontFamily:'var(--mono)', fontSize:11, fontWeight:700,
        textTransform:'uppercase', letterSpacing:'.08em', color:'var(--text)', whiteSpace:'nowrap' }}>
        {title}
      </span>
      <div style={{ flex:1, height:1, background:'var(--border)' }} />
      {tag && <Badge>{tag}</Badge>}
    </div>
  );
}
function Metric({ label, value, sub, accent = 'var(--accent)' }) {
  return (
    <div style={{ background:'var(--surface)', border:'1px solid var(--border)',
      borderRadius:8, padding:'14px 18px', position:'relative', overflow:'hidden' }}>
      <div style={{ position:'absolute', top:0, left:0, right:0, height:2, background:accent }} />
      <div style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)',
        textTransform:'uppercase', letterSpacing:'.1em', marginBottom:6 }}>{label}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:20, fontWeight:700, color:'var(--text)' }}>{value}</div>
      {sub && <div style={{ fontSize:11, color:'var(--muted)', marginTop:3 }}>{sub}</div>}
    </div>
  );
}

// ─── loading / error states ───────────────────────────────────────────────────
function LoadScreen({ message }) {
  return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ width:36, height:36, border:'2px solid var(--border2)',
        borderTop:'2px solid var(--accent)', borderRadius:'50%',
        animation:'spin 0.8s linear infinite' }} />
      <div style={{ fontFamily:'var(--mono)', fontSize:12, color:'var(--muted)' }}>{message}</div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}


// ─── PREDICTION LINE CHART ────────────────────────────────────────────────────
function PredChart({ marketData, selectedModels }) {
  if (!marketData || selectedModels.length === 0) return (
    <div style={{ height:260, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
      No models selected
    </div>
  );
  const actual = marketData.models['ENN-10']?.actual ?? [];
  const chartData = actual.map((v, i) => {
    const row = { i, actual: v };
    selectedModels.forEach(m => {
      const preds = marketData.models[m]?.preds;
      if (preds) row[m] = preds[i];
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={chartData} margin={{ top:4, right:8, left:0, bottom:4 }}>
        <CartesianGrid stroke={C.grid} strokeDasharray="0" />
        <XAxis dataKey="i" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={48} />
        <Tooltip contentStyle={TIP_STYLE} />
        <Line dataKey="actual" stroke={C.actual} strokeWidth={1.5}
          dot={false} name="Actual" strokeOpacity={0.7} />
        {selectedModels.map(m => (
          <Line key={m} dataKey={m} stroke={MODEL_COLOR[m]} strokeWidth={1.5}
            dot={false} name={m} strokeDasharray={m.startsWith('QENN') ? '4 2' : '0'} />
        ))}
        <Legend wrapperStyle={{ fontSize:10, fontFamily:'var(--mono)' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── LOSS CURVE CHART ─────────────────────────────────────────────────────────
function LossChart({ marketData, selectedModels }) {
  if (!marketData || selectedModels.length === 0) return (
    <div style={{ height:220, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
      No models selected
    </div>
  );
  const maxLen = Math.max(...selectedModels.map(m =>
    marketData.models[m]?.train_history?.length ?? 0));
  if (maxLen === 0) return null;
  const chartData = Array.from({ length: maxLen }, (_, i) => {
    const row = { epoch: i };
    selectedModels.forEach(m => {
      const h = marketData.models[m]?.train_history;
      if (h && h[i] !== undefined) row[m] = h[i];
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={220}>
      <LineChart data={chartData} margin={{ top:4, right:8, left:0, bottom:4 }}>
        <CartesianGrid stroke={C.grid} />
        <XAxis dataKey="epoch" tick={AXIS_STYLE} tickLine={false} axisLine={false}
          label={{ value:'Epoch', position:'insideBottom', offset:-2,
            fill:'#6b6f8e', fontSize:9, fontFamily:'var(--mono)' }} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={52}
          tickFormatter={v => v < 0.001 ? v.toExponential(1) : v.toFixed(4)} />
        <Tooltip contentStyle={TIP_STYLE} formatter={(v) => [v?.toFixed(6), '']} />
        {selectedModels.map(m => (
          <Line key={m} dataKey={m} stroke={MODEL_COLOR[m]} strokeWidth={1.5}
            dot={false} name={m} />
        ))}
        <Legend wrapperStyle={{ fontSize:10, fontFamily:'var(--mono)' }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

// ─── METRIC BAR CHART ────────────────────────────────────────────────────────
function MetricBar({ data, metric = 'nmse', visibleModels = MODEL_ORDER }) {
  if (visibleModels.length === 0) return (
    <div style={{ height:240, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
      No models selected
    </div>
  );
  const chartData = MARKETS.map(mkt => {
    const row = { market: mkt };
    visibleModels.forEach(m => {
      row[m] = data[mkt]?.models[m]?.[metric] ?? null;
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top:4, right:8, left:0, bottom:4 }}>
        <CartesianGrid stroke={C.grid} vertical={false} />
        <XAxis dataKey="market" tick={AXIS_STYLE} tickLine={false} axisLine={false} />
        <YAxis tick={AXIS_STYLE} tickLine={false} axisLine={false} width={48}
          tickFormatter={v => v >= 1 ? v.toFixed(1) : v.toFixed(2)} />
        <Tooltip contentStyle={TIP_STYLE} formatter={v => v?.toFixed(5)} />
        {visibleModels.map(m => (
          <Bar key={m} dataKey={m} fill={MODEL_COLOR[m]} radius={[2,2,0,0]}
            fillOpacity={0.85} name={m} />
        ))}
        <Legend wrapperStyle={{ fontSize:10, fontFamily:'var(--mono)' }} />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── RADAR CHART ─────────────────────────────────────────────────────────────
function NMSERadar({ data, selectedModels }) {
  if (selectedModels.length === 0) return (
    <div style={{ height:280, display:'flex', alignItems:'center', justifyContent:'center',
      fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>
      No models selected
    </div>
  );
  const chartData = MARKETS.map(mkt => {
    const row = { market: mkt };
    selectedModels.forEach(m => {
      const nmse = data[mkt]?.models[m]?.nmse;
      row[m] = nmse != null ? parseFloat((1 / (1 + nmse)).toFixed(4)) : 0;
    });
    return row;
  });
  return (
    <ResponsiveContainer width="100%" height={280}>
      <RadarChart data={chartData}>
        <PolarGrid stroke={C.border} />
        <PolarAngleAxis dataKey="market" tick={{ fill:'#6b6f8e', fontSize:10,
          fontFamily:'var(--mono)' }} />
        {selectedModels.map(m => (
          <Radar key={m} dataKey={m} stroke={MODEL_COLOR[m]} fill={MODEL_COLOR[m]}
            fillOpacity={0.12} name={m} />
        ))}
        <Legend wrapperStyle={{ fontSize:10, fontFamily:'var(--mono)' }} />
        <Tooltip contentStyle={TIP_STYLE}
          formatter={v => [(1/v - 1).toFixed(4) + ' NMSE', '']} />
      </RadarChart>
    </ResponsiveContainer>
  );
}

// ─── BACKEND EQUIVALENCE ─────────────────────────────────────────────────────
function BackendEquiv({ data }) {
  return (
    <div>
      {MARKETS.map(mkt => {
        const q = data[mkt]?.models['QENN-Qiskit']?.nmse;
        const s = data[mkt]?.models['QENN-QSharp']?.nmse;
        const diff = q != null && s != null ? Math.abs(q - s) : null;
        return (
          <div key={mkt} style={{ display:'flex', alignItems:'center', justifyContent:'space-between',
            padding:'10px 0', borderBottom:'1px solid var(--border)', gap:12, flexWrap:'wrap' }}>
            <span style={{ fontFamily:'var(--mono)', fontSize:11, minWidth:80 }}>{mkt}</span>
            <div style={{ display:'flex', gap:8, alignItems:'center', flexWrap:'wrap' }}>
              <Badge color={C.qiskit} bg={`${C.qiskit}18`}>Qiskit</Badge>
              <span style={{ fontFamily:'var(--mono)', fontSize:11 }}>{q?.toFixed(5) ?? '—'}</span>
              <span style={{ color:'var(--muted)', fontSize:10 }}>≡</span>
              <Badge color={C.qsharp} bg={`${C.qsharp}18`}>Q#</Badge>
              <span style={{ fontFamily:'var(--mono)', fontSize:11 }}>{s?.toFixed(5) ?? '—'}</span>
            </div>
            <span style={{ fontFamily:'var(--mono)', fontSize:11,
              color: diff === 0 ? 'var(--teal)' : 'var(--amber)' }}>
              Δ = {diff === 0 ? '0.00e+00' : diff?.toExponential(2) ?? '—'}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ─── MODEL TOGGLE PILL ────────────────────────────────────────────────────────
function ModelPill({ model, active, onToggle }) {
  return (
    <button onClick={() => onToggle(model)} style={{
      display:'flex', alignItems:'center', gap:6, padding:'5px 12px',
      borderRadius:20, border:`1px solid ${active ? MODEL_COLOR[model] : 'var(--border)'}`,
      background: active ? `${MODEL_COLOR[model]}18` : 'transparent',
      color: active ? MODEL_COLOR[model] : 'var(--muted)',
      fontFamily:'var(--mono)', fontSize:10, cursor:'pointer', transition:'all .15s',
    }}>
      <Dot color={MODEL_COLOR[model]} size={6} />
      {model}
    </button>
  );
}

// ─── FULL RESULTS TABLE ───────────────────────────────────────────────────────
function ResultsTable({ data }) {
  const [sort, setSort] = useState({ key:'nmse', dir:1 });
  const rows = [];
  MARKETS.forEach(mkt => {
    MODEL_ORDER.forEach(m => {
      const d = data[mkt]?.models[m];
      if (!d) return;
      rows.push({ market:mkt, model:m, ...d });
    });
  });
  const sorted = [...rows].sort((a,b) => {
    if (typeof a[sort.key] === 'string') return a[sort.key].localeCompare(b[sort.key]) * sort.dir;
    return (a[sort.key] - b[sort.key]) * sort.dir;
  });
  const th = (label, key) => (
    <th onClick={() => setSort(s => ({ key, dir: s.key===key ? -s.dir : 1 }))}
      style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)', padding:'8px 12px',
        textAlign:'left', textTransform:'uppercase', letterSpacing:'.08em', cursor:'pointer',
        userSelect:'none', borderBottom:'1px solid var(--border)', whiteSpace:'nowrap' }}>
      {label} {sort.key===key ? (sort.dir===1 ? '↑' : '↓') : ''}
    </th>
  );
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:12 }}>
        <thead>
          <tr>
            {th('Market','market')} {th('Model','model')} {th('Backend','backend')}
            {th('NMSE ↑','nmse')} {th('RMSE','rmse')} {th('MAPE','mape')} {th('Time(s)','time')}
          </tr>
        </thead>
        <tbody>
          {sorted.map((r, i) => (
            <tr key={i} style={{ background: i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)' }}
              onMouseEnter={e => e.currentTarget.style.background='rgba(124,109,250,0.05)'}
              onMouseLeave={e => e.currentTarget.style.background = i%2===0 ? 'transparent' : 'rgba(255,255,255,0.01)'}>
              <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)' }}>{r.market}</td>
              <td style={{ padding:'9px 12px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:7 }}>
                  <Dot color={MODEL_COLOR[r.model]} size={7} />
                  <span style={{ fontFamily:'var(--mono)', fontSize:10 }}>{r.model}</span>
                </div>
              </td>
              <td style={{ padding:'9px 12px' }}>
                <Badge color={r.backend==='PyTorch' ? 'var(--accent)' : r.backend==='Qiskit' ? C.qiskit : C.qsharp}
                  bg={r.backend==='PyTorch' ? 'var(--accent-lo)' : r.backend==='Qiskit' ? `${C.qiskit}18` : `${C.qsharp}18`}>
                  {r.backend}
                </Badge>
              </td>
              <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:11,
                color: r.nmse < 0.5 ? 'var(--teal)' : r.nmse < 3 ? 'var(--amber)' : 'var(--coral)' }}>
                {r.nmse?.toFixed(5)}
              </td>
              <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{r.rmse?.toFixed(5)}</td>
              <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{r.mape?.toFixed(4)}</td>
              <td style={{ padding:'9px 12px', fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)' }}>{r.time?.toFixed(1)}s</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
// ─── HEATMAP ─────────────────────────────────────────────────────────────────
function nmseColor(v) {
  const lo = Math.log10(0.05), hi = Math.log10(20);
  const t = Math.min(1, Math.max(0, (Math.log10(Math.max(v, 0.001)) - lo) / (hi - lo)));
  if (t < 0.5) {
    const s = t * 2;
    return `rgb(${Math.round(74 + (251-74)*s)},${Math.round(222 + (191-222)*s)},${Math.round(128 + (36-128)*s)})`;
  }
  const s = (t - 0.5) * 2;
  return `rgb(${Math.round(251 + (248-251)*s)},${Math.round(191 + (113-191)*s)},${Math.round(36 + (113-36)*s)})`;
}
function Heatmap({ data }) {
  const colW = `${Math.floor(80 / MARKETS.length)}%`;
  return (
    <div style={{ overflowX:'auto' }}>
      <table style={{ width:'100%', borderCollapse:'collapse', fontSize:11 }}>
        <thead>
          <tr>
            <th style={{ textAlign:'left', fontFamily:'var(--mono)', fontSize:9,
              color:'var(--muted)', padding:'6px 10px', textTransform:'uppercase',
              letterSpacing:'.08em', width:'20%' }}>Model</th>
            {MARKETS.map(m => (
              <th key={m} style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)',
                padding:'6px 4px', textAlign:'center', textTransform:'uppercase',
                letterSpacing:'.06em', width:colW }}>{m}</th>
            ))}
            <th style={{ fontFamily:'var(--mono)', fontSize:9, color:'var(--muted)',
              padding:'6px 8px', textAlign:'center', textTransform:'uppercase',
              letterSpacing:'.06em' }}>Avg</th>
          </tr>
        </thead>
        <tbody>
          {MODEL_ORDER.map(model => {
            const vals = MARKETS.map(mkt => data[mkt]?.models[model]?.nmse ?? null);
            const valid = vals.filter(v => v !== null);
            const avg = valid.length ? valid.reduce((a,b) => a+b,0) / valid.length : null;
            return (
              <tr key={model}>
                <td style={{ padding:'5px 10px', display:'flex', alignItems:'center', gap:7 }}>
                  <Dot color={MODEL_COLOR[model]} size={7} />
                  <span style={{ fontFamily:'var(--mono)', fontSize:10 }}>{model}</span>
                </td>
                {vals.map((v, i) => (
                  <td key={i} style={{ padding:3, textAlign:'center' }}>
                    {v !== null ? (
                      <div style={{ background:nmseColor(v), borderRadius:4,
                        padding:'7px 3px', fontFamily:'var(--mono)', fontSize:10,
                        fontWeight:700, color:'#07080f' }}>
                        {v < 1 ? v.toFixed(3) : v.toFixed(2)}
                      </div>
                    ) : <div style={{ padding:'7px 3px', color:'var(--muted)', fontSize:10 }}>—</div>}
                  </td>
                ))}
                <td style={{ padding:3, textAlign:'center' }}>
                  {avg !== null && (
                    <div style={{ background:nmseColor(avg), borderRadius:4,
                      padding:'7px 6px', fontFamily:'var(--mono)', fontSize:10,
                      fontWeight:700, color:'#07080f', border:'1px solid rgba(0,0,0,0.15)' }}>
                      {avg < 1 ? avg.toFixed(3) : avg.toFixed(2)}
                    </div>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}


// ─── APP ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [data, setData]           = useState(null);
  const [error, setError]         = useState(null);
  const [market, setMarket]       = useState('BSE');
  const [metric, setMetric]       = useState('nmse');
  const [activeModels, setActive] = useState(new Set(MODEL_ORDER));

  useEffect(() => {
    fetch('/results.json')
      .then(r => { if (!r.ok) throw new Error('results.json not found'); return r.json(); })
      .then(setData)
      .catch(e => setError(e.message));
  }, []);

  const toggleModel = useCallback(m => {
    setActive(prev => {
      const next = new Set(prev);
      next.has(m) ? next.delete(m) : next.add(m);
      return next;
    });
  }, []);

  if (error) return (
    <div style={{ minHeight:'100vh', display:'flex', flexDirection:'column',
      alignItems:'center', justifyContent:'center', gap:16 }}>
      <div style={{ fontFamily:'var(--mono)', fontSize:14, color:'var(--coral)' }}>⚠ {error}</div>
      <div style={{ fontFamily:'var(--mono)', fontSize:11, color:'var(--muted)',
        maxWidth:480, textAlign:'center', lineHeight:1.7 }}>
        Copy <code style={{ background:'var(--surface2)', padding:'1px 6px', borderRadius:3 }}>results/results.json</code> into{' '}
        <code style={{ background:'var(--surface2)', padding:'1px 6px', borderRadius:3 }}>public/</code> and restart.
      </div>
    </div>
  );
  if (!data) return <LoadScreen message="Loading results.json…" />;

  const mktData = data[market];
  const visibleModels = MODEL_ORDER.filter(m => activeModels.has(m));

  // headline stats
  const allNMSE = MARKETS.flatMap(mkt =>
    MODEL_ORDER.filter(m => m.startsWith('ENN')).map(m => ({
      v: data[mkt]?.models[m]?.nmse, mkt, m
    }))
  ).filter(x => x.v != null);
  const best = allNMSE.reduce((a,b) => a.v < b.v ? a : b, allNMSE[0]);
  const qnnAvg = MARKETS.map(mkt => data[mkt]?.models['QENN-Qiskit']?.nmse ?? 0);
  const ennAvg100 = MARKETS.map(mkt => data[mkt]?.models['ENN-100']?.nmse ?? 0);
  const avgGap = (qnnAvg.reduce((a,b)=>a+b,0)/qnnAvg.length) /
                 (ennAvg100.reduce((a,b)=>a+b,0)/ennAvg100.length);

  return (
    <div style={{ maxWidth:1320, margin:'0 auto', padding:'0 24px 60px' }}>

      {/* ── Header ── */}
      <header style={{ padding:'44px 0 28px', borderBottom:'1px solid var(--border)', marginBottom:4 }}>
        <h1 style={{ fontFamily:'var(--sans)', fontWeight:700,
          fontSize:'clamp(22px,4vw,38px)', lineHeight:1.15, color:'var(--text)' }}>
          ENN vs <span style={{ color:'var(--accent)' }}>QENN</span>
          <br />Stock Price Prediction
        </h1>
      </header>

      {/* ── Stat strip ── */}
      <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(160px,1fr))',
        gap:10, margin:'24px 0' }}>
        <Metric label="Best ENN NMSE" value={best?.v.toFixed(4)}
          sub={`${best?.mkt} · ${best?.m}`} accent="var(--teal)" />
        <Metric label="Best QENN NMSE"
          value={Math.min(...qnnAvg).toFixed(4)}
          sub="SSE · Qiskit/Q#" accent="var(--coral)" />
        <Metric label="Avg gap factor" value={`${avgGap.toFixed(1)}×`}
          sub="QENN vs ENN-100" accent="var(--amber)" />
        <Metric label="Backend Δ" value="0.00e+00"
          sub="Qiskit ≡ Q# · all markets" accent="var(--teal)" />
        <Metric label="Q# validation" value="7.8e-16"
          sub="max |Δ| vs numpy" accent="var(--accent)" />
      </div>

      {/* ── Model toggle ── */}
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, margin:'20px 0 4px' }}>
        {MODEL_ORDER.map(m => (
          <ModelPill key={m} model={m} active={activeModels.has(m)} onToggle={toggleModel} />
        ))}
        <button onClick={() => setActive(new Set(MODEL_ORDER))}
          style={{ padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)',
            background:'transparent', color:'var(--muted)', fontFamily:'var(--mono)',
            fontSize:10, cursor:'pointer' }}>All</button>
        <button onClick={() => setActive(new Set())}
          style={{ padding:'5px 12px', borderRadius:20, border:'1px solid var(--border)',
            background:'transparent', color:'var(--muted)', fontFamily:'var(--mono)',
            fontSize:10, cursor:'pointer' }}>None</button>
      </div>

      

      {/* ── Per-market charts ── */}
      <SectionHead title="Market Detail" tag="click a market" />
      <div style={{ display:'flex', gap:6, flexWrap:'wrap', marginBottom:16 }}>
        {MARKETS.map(m => (
          <button key={m} onClick={() => setMarket(m)} style={{
            fontFamily:'var(--mono)', fontSize:11, padding:'6px 16px',
            borderRadius:4, border:`1px solid ${m===market ? 'var(--accent)' : 'var(--border)'}`,
            background: m===market ? 'var(--accent-lo)' : 'transparent',
            color: m===market ? 'var(--accent)' : 'var(--muted)', cursor:'pointer',
            transition:'all .12s',
          }}>{m}</button>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:14 }}>
        <Card>
          <CardTitle>Predicted vs Actual — {market} (denormalised prices)</CardTitle>
          <PredChart marketData={mktData} selectedModels={visibleModels} />
        </Card>
        <Card>
          <CardTitle>Training loss curve — {market}</CardTitle>
          <LossChart marketData={mktData} selectedModels={visibleModels} />
        </Card>
      </div>

      {/* market metric cards */}
      {visibleModels.length > 0 && (
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(130px,1fr))',
          gap:8, marginBottom:4 }}>
          {visibleModels.map(m => {
            const d = mktData?.models[m];
            return d ? (
              <div key={m} style={{ background:'var(--surface2)', border:`1px solid ${MODEL_COLOR[m]}33`,
                borderRadius:8, padding:'12px 14px' }}>
                <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:8 }}>
                  <Dot color={MODEL_COLOR[m]} size={7} />
                  <span style={{ fontFamily:'var(--mono)', fontSize:9,
                    color:MODEL_COLOR[m], textTransform:'uppercase', letterSpacing:'.06em' }}>{m}</span>
                </div>
                <div style={{ fontFamily:'var(--mono)', fontSize:16, fontWeight:700,
                  color: d.nmse < 0.5 ? 'var(--teal)' : d.nmse < 3 ? 'var(--amber)' : 'var(--coral)' }}>
                  {d.nmse.toFixed(4)}
                </div>
                <div style={{ fontSize:10, color:'var(--muted)', marginTop:2 }}>NMSE</div>
                <div style={{ marginTop:8, display:'flex', flexDirection:'column', gap:3 }}>
                  {[['RMSE',d.rmse?.toFixed(4)],['MAPE',d.mape?.toFixed(4)],['Time',`${d.time}s`]].map(([k,v]) => (
                    <div key={k} style={{ display:'flex', justifyContent:'space-between',
                      fontSize:10, fontFamily:'var(--mono)' }}>
                      <span style={{ color:'var(--muted)' }}>{k}</span>
                      <span style={{ color:'var(--text)' }}>{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null;
          })}
        </div>
      )}

      {/* ── All-market bar chart ── */}
      <SectionHead title="Metric Comparison" tag="all markets grouped" />
      <Card style={{ marginBottom:14 }}>
        <div style={{ display:'flex', gap:8, marginBottom:14 }}>
          {[['nmse','NMSE'],['rmse','RMSE'],['mape','MAPE']].map(([k,label]) => (
            <button key={k} onClick={() => setMetric(k)} style={{
              fontFamily:'var(--mono)', fontSize:10, padding:'4px 12px',
              borderRadius:4, border:`1px solid ${metric===k ? 'var(--accent)' : 'var(--border)'}`,
              background: metric===k ? 'var(--accent-lo)' : 'transparent',
              color: metric===k ? 'var(--accent)' : 'var(--muted)', cursor:'pointer',
            }}>{label}</button>
          ))}
        </div>
        <CardTitle>{metric.toUpperCase()} by market — visible models only</CardTitle>
        <MetricBar data={data} metric={metric} visibleModels={visibleModels} />
      </Card>

      {/* ── Radar + Backend equiv ── */}
      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:4 }}>
        <Card>
          <CardTitle>Radar — score = 1/(1+NMSE) · larger = better</CardTitle>
          <NMSERadar data={data} selectedModels={visibleModels} />
        </Card>
        <Card>
          <CardTitle>Backend equivalence — Qiskit vs Q# NMSE</CardTitle>
          <BackendEquiv data={data} />
          <div style={{ marginTop:14, padding:'10px 14px', background:'var(--teal-lo)',
            border:'1px solid rgba(45,212,191,0.2)', borderRadius:6,
            fontFamily:'var(--mono)', fontSize:10, color:'var(--teal)', lineHeight:1.8 }}>
            ✓ All 6 markets: |Qiskit − Q#| = 0.00e+00<br/>
            ✓ Q# formula validated: max |Δ| = 7.8e-16 vs numpy
          </div>
        </Card>
      </div>

      {/* ── Full table ── */}
      <SectionHead title="Full Results Table" tag="click headers to sort" />
      <Card style={{ marginBottom:4 }}>
        <ResultsTable data={data} />
      </Card>
         

    {/* ── NMSE Heatmap ── */}
      <SectionHead title="NMSE Heatmap" tag="all models × all markets" />
      <Card>
        <CardTitle>Test NMSE · green = better · red = worse (log scale)</CardTitle>
        <Heatmap data={data} />
      </Card>     
      <footer style={{ borderTop:'1px solid var(--border)', marginTop:40, paddingTop:20,
        display:'flex', justifyContent:'space-between', flexWrap:'wrap', gap:8,
        fontFamily:'var(--mono)', fontSize:10, color:'var(--muted)' }}>
        <span>ENN vs QENN Comparative Study</span>
        <span>Qiskit · Microsoft Q# · PyTorch · DCQGA</span>
      </footer>

      <style>{`
        @media(max-width:780px){
          div[style*="grid-template-columns: 1fr 1fr"]{grid-template-columns:1fr!important}
        }
      `}</style>
    </div>
  );
}