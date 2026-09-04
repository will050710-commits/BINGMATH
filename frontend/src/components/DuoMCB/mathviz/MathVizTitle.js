'use client';
import katex from 'katex';
import 'katex/dist/katex.min.css';

export default function MathVizTitle({ icon, title, fallback }) {
  const raw = title || fallback || '';
  if (!raw) return null;

  // Split by $...$ or $$...$$
  const parts = raw.split(/(\$\$[\s\S]*?\$\$|\$[^\$]*?\$)/g);

  return (
    <div style={{ fontSize: 14, fontWeight: 600, color: '#e2e8f0', marginBottom: 12, display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 4 }}>
      {icon && <span style={{ marginRight: 4 }}>{icon}</span>}
      {parts.map((part, idx) => {
        if (!part) return null;
        if (part.startsWith('$') && part.endsWith('$')) {
          const isBlock = part.startsWith('$$') && part.endsWith('$$');
          const mathExpr = isBlock ? part.slice(2, -2).trim() : part.slice(1, -1).trim();
          try {
            const html = katex.renderToString(mathExpr, { displayMode: false, throwOnError: false });
            return <span key={idx} dangerouslySetInnerHTML={{ __html: html }} style={{ color: '#00E5FF' }} />;
          } catch {
            return <span key={idx} style={{ color: '#00E5FF', fontFamily: 'monospace' }}>{mathExpr}</span>;
          }
        }
        return <span key={idx}>{part}</span>;
      })}
    </div>
  );
}
