"use client";
// TokenGauges.js — P10: the admin token/quota meter.
//
// Backend contract: GET /api/admin/token-usage?days=N (admin-only) returns
//   { days, per_provider: [...], live_quota: {provider: {remaining, limit, reset}},
//     keys: { groq: [...], nvidia: [...] }, sources: {provider: "live+self-count"|"self-count"} }
//
// Honesty rule (same as the backend): a bar is only drawn when the provider
// actually SENT remaining/limit numbers (Cerebras/Groq headers). Gemini and
// NVIDIA have no quota headers, so their rows say "self-count" — a fabricated
// percentage would be worse than no gauge at all.
import { useCallback, useEffect, useState } from "react";
import { resolveApiBase } from "@/lib/apiBase";

const BASE = resolveApiBase();

async function adminFetch(path) {
  const { auth } = await import("@/lib/firebase");
  const hdrs = { "Content-Type": "application/json" };
  const cu = auth.currentUser;
  if (cu) {
    try { hdrs.Authorization = `Bearer ${await cu.getIdToken()}`; } catch (_) {}
  }
  const res = await fetch(`${BASE}${path}`, { headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

// Phải khớp token_meter.py: GAUGE_CRITICAL_PCT = 15, GAUGE_LOW_PCT = 30.
const CRITICAL_PCT = 15;
const LOW_PCT = 30;

function pctLeft(remaining, limit) {
  const r = Number(remaining);
  const l = Number(limit);
  if (!Number.isFinite(r) || !Number.isFinite(l) || l <= 0) return null;
  return Math.max(0, Math.min(100, (r / l) * 100));
}

function stateOf(pct) {
  if (pct === null) return "unknown";
  if (pct < CRITICAL_PCT) return "critical";
  if (pct < LOW_PCT) return "low";
  return "ok";
}

const STATE_STYLE = {
  ok:       { color: "#34d399", label: "OK" },
  low:      { color: "#fbbf24", label: "SẮP HẾT" },
  critical: { color: "#f87171", label: "CẠN" },
  unknown:  { color: "#94a3b8", label: "KHÔNG CÓ SỐ" },
};

function fmt(n) {
  try { return Number(n || 0).toLocaleString("vi-VN"); } catch { return String(n); }
}

function providerLabel(p) {
  return { cerebras: "Cerebras", groq: "Groq", gemini: "Gemini", nvidia: "NVIDIA", openrouter: "OpenRouter" }[p] || p;
}

function sourceBadge(sources, provider) {
  const src = (sources || {})[provider] || "";
  const live = src.indexOf("live") === 0;
  return (
    <span style={{
      fontSize: 9, fontWeight: 800, letterSpacing: 0.5, borderRadius: 4, padding: "1px 6px",
      color: live ? "#22d3ee" : "#94a3b8",
      background: live ? "rgba(34,211,238,0.12)" : "rgba(148,163,184,0.12)",
      border: `1px solid ${live ? "rgba(34,211,238,0.35)" : "rgba(148,163,184,0.3)"}`,
    }}>{live ? "LIVE" : "SELF-COUNT"}</span>
  );
}

function GaugeBar({ label, remaining, limit }) {
  const pct = pctLeft(remaining, limit);
  const st = STATE_STYLE[stateOf(pct)];
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 5 }}>
        <span style={{ color: "rgba(255,255,255,0.75)", fontWeight: 600 }}>{label}</span>
        <span style={{ color: st.color, fontWeight: 700 }}>
          {pct === null ? "—" : `${pct.toFixed(1)}%`}
          <span style={{ color: "rgba(255,255,255,0.4)", fontWeight: 400 }}>
            {"  "}{remaining != null && limit != null ? `(${fmt(remaining)} / ${fmt(limit)})` : ""}
          </span>
          <span style={{ color: st.color, marginLeft: 8, fontSize: 10, fontWeight: 800 }}>{st.label}</span>
        </span>
      </div>
      <div style={{ height: 10, borderRadius: 6, background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{
          width: `${pct === null ? 0 : pct}%`, height: "100%",
          background: st.color, borderRadius: 6, transition: "width 0.4s",
        }} />
      </div>
    </div>
  );
}

function suffixedPairs(snap) {
  // Ghép remaining[suffix] với limit[suffix] — tên hậu tố do provider đặt
  // (tokens-day, requests-minute, ...), nên đây là cách duy nhất không đoán.
  const out = [];
  const rem = (snap && snap.remaining) || {};
  const lim = (snap && snap.limit) || {};
  Object.keys(rem).forEach((suffix) => {
    if (lim[suffix] != null) {
      out.push({ suffix, remaining: Number(rem[suffix]), limit: Number(lim[suffix]) });
    }
  });
  if (!out.length && rem.tokens != null && lim.tokens != null) {
    out.push({ suffix: "tokens", remaining: Number(rem.tokens), limit: Number(lim.tokens) });
  }
  return out;
}

function KeyRows({ names, rows, sources }) {
  if (!rows || !rows.length) {
    return <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>Chưa có khoá nào được cấu hình.</div>;
  }
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
      {rows.map((k) => (
        <div key={`${names}-${k.index}`} style={{
          display: "flex", alignItems: "center", gap: 10, fontSize: 11,
          color: "rgba(255,255,255,0.65)",
        }}>
          <span style={{ fontFamily: "monospace", minWidth: 60 }}>{names} #{k.index + 1} {k.id}</span>
          <span style={{
            fontWeight: 800, fontSize: 10, borderRadius: 4, padding: "1px 6px",
            color: k.state === "live" ? "#34d399" : "#fbbf24",
            background: k.state === "live" ? "rgba(52,211,153,0.12)" : "rgba(251,191,36,0.12)",
          }}>{k.state === "live" ? "ĐANG CHẠY" : "COOLDOWN"}</span>
          {k.state !== "live" && <span>hồi phục sau {Math.round(k.cooldown_left_s)}s</span>}
          {k.failures > 0 && <span style={{ color: "rgba(248,113,113,0.8)" }}>{k.failures} lỗi</span>}
        </div>
      ))}
    </div>
  );
}

const th = { padding: "6px 10px", borderBottom: "1px solid rgba(255,255,255,0.1)", fontWeight: 600 };
const td = { padding: "6px 10px" };

export default function TokenGauges() {
  const [days, setDays] = useState(1);
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const load = useCallback(async (d) => {
    setLoading(true);
    setError("");
    try {
      const { ok, status, data: payload } = await adminFetch(`/api/admin/token-usage?days=${d}`);
      if (ok) setData(payload);
      else setError(status === 401 ? "Cần quyền admin để xem số liệu." : `Lỗi ${status}`);
    } catch (_) {
      setError("Không kết nối được backend.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(days); }, [days, load]);

  const card = {
    background: "rgba(15,23,42,0.7)", border: "1px solid rgba(255,255,255,0.07)",
    borderRadius: 12, padding: "16px 18px", marginBottom: 14,
  };
  const h = { fontSize: 14, fontWeight: 800, color: "white", marginBottom: 4 };
  const sub = { fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 12 };

  const sources = (data && data.sources) || {};
  const liveQuota = (data && data.live_quota) || {};
  const keys = (data && data.keys) || {};
  const perProvider = (data && data.per_provider) || [];

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14, flexWrap: "wrap" }}>
        <div style={{ fontSize: 16, fontWeight: 900, color: "white" }}>📊 Token &amp; Quota</div>
        {[1, 7, 30].map((d) => (
          <button key={d} onClick={() => setDays(d)} style={{
            padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
            border: days === d ? "1px solid rgba(167,139,250,0.5)" : "1px solid rgba(255,255,255,0.08)",
            background: days === d ? "rgba(167,139,250,0.15)" : "transparent",
            color: days === d ? "#c4b5fd" : "rgba(255,255,255,0.5)",
          }}>{d} ngày</button>
        ))}
        <button onClick={() => load(days)} style={{
          padding: "6px 12px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 700,
          border: "1px solid rgba(255,255,255,0.08)", background: "transparent",
          color: "rgba(255,255,255,0.6)",
        }}>↻ Làm mới</button>
        {loading && <span style={{ fontSize: 11, color: "rgba(255,255,255,0.4)" }}>Đang tải…</span>}
      </div>

      {error && <div style={{ ...card, color: "#f87171", fontSize: 12 }}>{error}</div>}

      <div style={card}>
        <div style={h}>Kim đo LIVE (đọc từ header của provider)</div>
        <div style={sub}>Bar chỉ vẽ khi provider THẬT SỰ gửi remaining/limit. Gemini và NVIDIA không gửi header quota — xem bảng tự đếm bên dưới, không vẽ kim giả.</div>
        {["cerebras", "groq"].map((p) => {
          const snap = liveQuota[p];
          const pairs = suffixedPairs(snap);
          return (
            <div key={p} style={{ marginBottom: 14 }}>
              <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 8 }}>
                <span style={{ fontWeight: 800, color: "white", fontSize: 13 }}>{providerLabel(p)}</span>
                {sourceBadge(sources, p)}
                {snap && snap.captured_at && (
                  <span style={{ fontSize: 10, color: "rgba(255,255,255,0.35)" }}>chụp lúc {snap.captured_at}</span>
                )}
              </div>
              {pairs.length ? pairs.map((pair) => (
                <GaugeBar key={pair.suffix} label={`${providerLabel(p)} · ${pair.suffix}`}
                          remaining={pair.remaining} limit={pair.limit} />
              )) : (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.35)" }}>
                  Chưa có ảnh chụp quota — sẽ xuất hiện sau câu trả lời đầu tiên của provider này.
                </div>
              )}
            </div>
          );
        })}
      </div>

      <div style={card}>
        <div style={h}>Bể khoá (xoay khi 429/401/413)</div>
        <div style={sub}>Khoá lỗi bị đưa vào cooldown; lượt kế tiếp chạy bằng khoá khác thay vì mất cả tầng.</div>
        <KeyRows names="Groq" rows={keys.groq} sources={sources} />
        <div style={{ height: 10 }} />
        <KeyRows names="NVIDIA" rows={keys.nvidia} sources={sources} />
      </div>

      <div style={card}>
        <div style={h}>Tự đếm theo provider/model</div>
        <div style={sub}>Tổng từ usage của chính các payload đã trả lời. &quot;Suy nghĩ&quot; = reasoning tokens — phần P8 phải chống bằng sàn 3072.</div>
        {perProvider.length === 0 ? (
          <div style={{ fontSize: 12, color: "rgba(255,255,255,0.35)" }}>Chưa có lượt gọi nào trong cửa sổ này.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
              <thead>
                <tr style={{ color: "rgba(255,255,255,0.45)", textAlign: "left" }}>
                  <th style={th}>Provider</th><th style={th}>Model</th>
                  <th style={th}>Lượt</th><th style={th}>Vào</th><th style={th}>Ra</th>
                  <th style={th}>Suy nghĩ</th><th style={th}>Tổng</th>
                </tr>
              </thead>
              <tbody>
                {perProvider.map((r, i) => (
                  <tr key={i} style={{ color: "rgba(255,255,255,0.75)", borderTop: "1px solid rgba(255,255,255,0.05)" }}>
                    <td style={td}>{providerLabel(r.provider)} {sourceBadge(sources, r.provider)}</td>
                    <td style={{ ...td, fontFamily: "monospace", fontSize: 11 }}>{r.model || "—"}</td>
                    <td style={td}>{fmt(r.calls)}</td>
                    <td style={td}>{fmt(r.input_tokens)}</td>
                    <td style={td}>{fmt(r.output_tokens)}</td>
                    <td style={{ ...td, color: r.reasoning_tokens > 0 ? "#fbbf24" : "inherit" }}>{fmt(r.reasoning_tokens)}</td>
                    <td style={{ ...td, fontWeight: 700 }}>{fmt(r.total_tokens)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
