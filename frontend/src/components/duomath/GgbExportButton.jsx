'use client';

// frontend/src/components/duomath/GgbExportButton.jsx
//
// The "⬇ .ggb" action on the geometry widget (Roadmap Q4/2026 item 2).
//
// Why a separate component instead of more JSX inside MathVizGeometry2D.js:
// that file is already ~2500 lines and renders two interchangeable engines,
// so the export lives in one small place the SVG/JSXGraph headers can each
// mount, and its state stays out of the drawing code.
//
// Honest UI rules, matching the rest of Phase 4:
//   * nothing is exported when there is nothing to export (no dead button);
//   * the object counts shown are the SERVER's, i.e. what actually went into
//     the file — the local estimate only decides whether to show the button;
//   * when part of the figure cannot be drawn in GeoGebra, the student is told
//     ("N phần chưa hỗ trợ") instead of finding a silently short file.

import { useState } from 'react';
import { countExportableGeometry, downloadGgb, fetchGgbCommands } from '@/lib/ggbExport';

const BUTTON_BASE = {
  display: 'flex',
  alignItems: 'center',
  gap: 4,
  borderRadius: 6,
  padding: '4px 10px',
  fontSize: 11,
  fontWeight: 600,
  cursor: 'pointer',
};

export default function GgbExportButton({ data }) {
  const [status, setStatus] = useState(null);   // { tone: 'ok'|'warn'|'error', text }
  const [busy, setBusy] = useState('');
  const summary = countExportableGeometry(data);

  if (summary.objects === 0) return null;

  const runDownload = async () => {
    setBusy('ggb');
    setStatus(null);
    try {
      const result = await downloadGgb(data);
      const parts = [`✓ ${result.objects ?? summary.objects} đối tượng`];
      if (result.skipped > 0) parts.push(`${result.skipped} phần chưa hỗ trợ`);
      parts.push('mở bằng GeoGebra');
      setStatus({ tone: result.skipped > 0 ? 'warn' : 'ok', text: parts.join(' · ') });
    } catch (error) {
      setStatus({ tone: 'error', text: error.message || 'Không xuất được tệp .ggb.' });
    } finally {
      setBusy('');
    }
  };

  const runCopy = async () => {
    setBusy('copy');
    setStatus(null);
    try {
      const { commands, skipped } = await fetchGgbCommands(data);
      if (!commands.length) {
        setStatus({ tone: 'warn', text: 'Không có lệnh nào để chép.' });
        return;
      }
      await navigator.clipboard.writeText(commands.join('\n'));
      setStatus({
        tone: skipped.length ? 'warn' : 'ok',
        text: `✓ đã chép ${commands.length} lệnh · dán vào ô nhập của geogebra.org`,
      });
    } catch (error) {
      setStatus({ tone: 'error', text: error.message || 'Không chép được lệnh.' });
    } finally {
      setBusy('');
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
      <button
        type="button"
        onClick={runDownload}
        disabled={busy !== ''}
        title="Tải hình này về dưới dạng tệp GeoGebra (.ggb) rồi mở bằng GeoGebra để kéo-thả, đo và dựng thêm"
        style={{
          ...BUTTON_BASE,
          background: 'rgba(16, 185, 129, 0.15)',
          border: '1px solid rgba(16, 185, 129, 0.4)',
          color: '#34d399',
          opacity: busy === 'ggb' ? 0.6 : 1,
        }}
      >
        <span>{busy === 'ggb' ? '⏳' : '⬇'}</span>
        <span>.ggb</span>
      </button>

      <button
        type="button"
        onClick={runCopy}
        disabled={busy !== ''}
        title="Chép danh sách lệnh (A = (1, 2), Polygon(A, B, C)…) để dán vào ô nhập của GeoGebra"
        style={{
          ...BUTTON_BASE,
          background: 'rgba(148, 163, 184, 0.12)',
          border: '1px solid rgba(148, 163, 184, 0.35)',
          color: '#cbd5e1',
          opacity: busy === 'copy' ? 0.6 : 1,
        }}
      >
        <span>{busy === 'copy' ? '⏳' : '📋'}</span>
        <span>Lệnh</span>
      </button>

      {status && (
        <span
          style={{
            fontSize: 10.5,
            color: status.tone === 'error' ? '#f87171' : status.tone === 'warn' ? '#fbbf24' : '#34d399',
          }}
        >
          {status.text}
        </span>
      )}
    </div>
  );
}
