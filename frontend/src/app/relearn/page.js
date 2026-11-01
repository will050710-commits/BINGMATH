"use client";

// Đợt 4E + Phase 2 (WP-A3) — "Sổ Tay Lỗi Sai Thông Minh & Bản Đồ Năng Lực":
// - Tự động đồng bộ câu làm sai từ đề thi (/api/tests/grade), bài tập giáo viên giao
//   (/api/student/assignments/{id}/submit) và luyện tập (/api/quiz/attempt).
// - Bộ lọc "Tất cả" vs "Ôn lại các câu làm sai tuần này".
// - Nút 1-Click "Nhờ DuoMCB giảng lại câu này".
// - Bản đồ năng lực (Competency Heatmap: Xanh/Vàng/Đỏ) & 3 gợi ý hành động mỗi ngày.

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { authFetch } from "@/lib/authFetch";

const RATINGS = [
  { key: "again", label: "Quên rồi", hint: "ôn lại sớm", color: "#f87171" },
  { key: "hard", label: "Khó", hint: "vẫn nhớ chút", color: "#fbbf24" },
  { key: "good", label: "Được", hint: "nhớ bình thường", color: "#4ade80" },
  { key: "easy", label: "Dễ", hint: "quá dễ", color: "#22d3ee" },
];

const BAND_STYLE = {
  strong: { label: "Vững kiến thức", color: "#4ade80", bg: "rgba(34, 197, 94, 0.14)", border: "rgba(34, 197, 94, 0.45)" },
  review: { label: "Cần ôn tập", color: "#fbbf24", bg: "rgba(250, 204, 21, 0.14)", border: "rgba(250, 204, 21, 0.45)" },
  weak: { label: "Hổng kiến thức", color: "#f87171", bg: "rgba(248, 113, 113, 0.14)", border: "rgba(248, 113, 113, 0.45)" },
};

function formatDue(daysUntil) {
  if (daysUntil === null || daysUntil === undefined) return "chưa có lịch";
  if (daysUntil <= 0) return "đến hạn ngay";
  if (daysUntil < 1) return `còn ${Math.max(1, Math.round(daysUntil * 24))} giờ`;
  return `còn ${Math.round(daysUntil)} ngày`;
}

export default function RelearnPage() {
  const [due, setDue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [heatmap, setHeatmap] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [thisWeekCount, setThisWeekCount] = useState(0);
  const [filterMode, setFilterMode] = useState("all"); // 'all' | 'this_week'
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async (mode = filterMode) => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch(`/api/relearn/due?limit=25&filter=${encodeURIComponent(mode)}`);
      if (res.status === 401) {
        setError("Cần đăng nhập để xem lộ trình ôn tập của em.");
        setDue([]);
        setUpcoming([]);
        return;
      }
      if (!res.ok) {
        setError(`Không tải được lộ trình ôn tập (HTTP ${res.status}).`);
        return;
      }
      const data = await res.json();
      setDue(Array.isArray(data.due) ? data.due : []);
      setUpcoming(Array.isArray(data.upcoming) ? data.upcoming : []);
      setHeatmap(Array.isArray(data.competency_heatmap) ? data.competency_heatmap : []);
      setRecommendations(Array.isArray(data.daily_recommendations) ? data.daily_recommendations : []);
      setThisWeekCount(Number(data.this_week_count || 0));
      setRetention(typeof data.retention_target === "number" ? data.retention_target : null);
    } catch (err) {
      setError("Không kết nối được máy chủ. Em thử lại sau nhé.");
      console.warn("[relearn] load failed:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, [filterMode]);

  useEffect(() => {
    load(filterMode);
  }, [filterMode, load]);

  async function review(cardId, rating) {
    setBusyId(cardId);
    setNotice("");
    try {
      const res = await authFetch("/api/relearn/review", {
        method: "POST",
        body: JSON.stringify({ card_id: cardId, rating }),
      });
      if (!res.ok) {
        setNotice(`Không ghi được đánh giá (HTTP ${res.status}).`);
        return;
      }
      const data = await res.json();
      const when = data?.next_due ? new Date(data.next_due).toLocaleString("vi-VN") : "sớm";
      setNotice(`Đã ghi nhận “${rating}” — lần ôn kế tiếp: ${when} (sau ${data?.interval_days ?? 0} ngày).`);
      await load(filterMode);
    } catch (err) {
      setNotice("Không gửi được đánh giá, em kiểm tra kết nối nhé.");
      console.warn("[relearn] review failed:", err?.message || err);
    } finally {
      setBusyId(null);
    }
  }

  const card = {
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(34,211,238,0.22)",
    borderRadius: 14,
    padding: "14px 16px",
    marginTop: 12,
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", padding: "36px 18px" }}>
      <div style={{ maxWidth: 920, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>
            📓 Sổ Tay Lỗi Sai FSRS & Bản Đồ Năng Lực
          </h1>
          <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
            <Link href="/classes" style={{ color: "#4ade80" }}>🎒 Lớp học & Bài tập</Link>
            <Link href="/khampha" style={{ color: "#67e8f9" }}>📈 Khám phá đồ thị</Link>
            <Link href="/ketqua" style={{ color: "#67e8f9" }}>← Về trang kết quả</Link>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.65)", fontSize: 13, marginTop: 6 }}>
          Mọi câu làm sai trong đề thi, bài tập giáo viên giao và luyện tập đều tự động chuyển thành thẻ ôn FSRS
          {retention ? ` (mục tiêu ghi nhớ ${Math.round(retention * 100)}%)` : ""}.
        </p>

        {error && (
          <div style={{ ...card, borderColor: "rgba(248,113,113,0.5)", background: "rgba(248,113,113,0.10)" }}>
            {error} {error.includes("đăng nhập") && <Link href="/login" style={{ color: "#fca5a5" }}>Đăng nhập</Link>}
          </div>
        )}
        {notice && (
          <div style={{ ...card, borderColor: "rgba(74,222,128,0.4)", background: "rgba(74,222,128,0.08)", fontSize: 13 }}>
            {notice}
          </div>
        )}

        {/* WP-A3: Daily Recommendations */}
        {!loading && recommendations.length > 0 && (
          <div
            style={{
              ...card,
              marginTop: 18,
              borderColor: "rgba(56, 189, 248, 0.35)",
              background: "rgba(14, 165, 233, 0.08)",
            }}
          >
            <div style={{ fontSize: 14, fontWeight: 800, color: "#38bdf8", marginBottom: 10 }}>
              🎯 3 Gợi ý hành động hôm nay cho em
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 10 }}>
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={rec.href || "/duomcb"}
                  style={{
                    display: "block",
                    padding: "10px 12px",
                    borderRadius: 10,
                    background: "rgba(15, 23, 42, 0.75)",
                    border: "1px solid rgba(56, 189, 248, 0.25)",
                    color: "#f8fafc",
                    textDecoration: "none",
                  }}
                >
                  <div style={{ fontWeight: 700, fontSize: 13, color: "#67e8f9" }}>{rec.title}</div>
                  <div style={{ fontSize: 11.5, color: "#94a3b8", marginTop: 4 }}>{rec.description}</div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* WP-A3: Competency Heatmap */}
        {!loading && heatmap.length > 0 && (
          <div style={{ ...card, marginTop: 16 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8, marginBottom: 10 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: "#f8fafc" }}>
                🗺️ Bản đồ năng lực theo chuyên đề (Competency Heatmap)
              </span>
              <div style={{ display: "flex", gap: 10, fontSize: 11.5 }}>
                <span style={{ color: "#4ade80" }}>🟢 Vững (≥75%)</span>
                <span style={{ color: "#fbbf24" }}>🟡 Cần ôn (50–74%)</span>
                <span style={{ color: "#f87171" }}>🔴 Hổng (&lt;50%)</span>
              </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 10 }}>
              {heatmap.map((h) => {
                const st = BAND_STYLE[h.band] || BAND_STYLE.review;
                return (
                  <div
                    key={h.topic}
                    style={{
                      padding: "10px 12px",
                      borderRadius: 10,
                      background: st.bg,
                      border: `1px solid ${st.border}`,
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: 13, color: "#f8fafc" }}>{h.topic}</div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5, marginTop: 4, color: st.color }}>
                      <span>{st.label}</span>
                      <strong>{h.accuracy_pct}%</strong>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div style={{ display: "flex", gap: 10, marginTop: 22, flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={() => setFilterMode("all")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: filterMode === "all" ? "1px solid #22d3ee" : "1px solid rgba(255,255,255,0.16)",
              background: filterMode === "all" ? "rgba(34,211,238,0.16)" : "transparent",
              color: filterMode === "all" ? "#67e8f9" : "#94a3b8",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            📋 Tất cả thẻ ôn
          </button>
          <button
            type="button"
            onClick={() => setFilterMode("this_week")}
            style={{
              padding: "8px 14px",
              borderRadius: 999,
              border: filterMode === "this_week" ? "1px solid #fbbf24" : "1px solid rgba(255,255,255,0.16)",
              background: filterMode === "this_week" ? "rgba(251,191,36,0.16)" : "transparent",
              color: filterMode === "this_week" ? "#fbbf24" : "#94a3b8",
              fontWeight: 700,
              fontSize: 12.5,
              cursor: "pointer",
            }}
          >
            🔥 Ôn lại các câu làm sai tuần này ({thisWeekCount})
          </button>
        </div>

        {loading ? (
          <div style={{ ...card, color: "rgba(255,255,255,0.6)" }}>Đang tải lộ trình ôn tập…</div>
        ) : (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginTop: 20, marginBottom: 4 }}>
              Đến hạn ({due.length})
            </h2>
            {due.length === 0 ? (
              <div style={{ ...card, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                Hôm nay chưa có thẻ nào đến hạn ở bộ lọc này. Em làm thêm đề kiểm tra hoặc bài tập lớp để bổ sung thẻ mới nhé.
              </div>
            ) : (
              due.map((item) => {
                const tutorQuery = `Giảng lại thật dễ hiểu và cho 1 ví dụ tương tự về: ${item.skill || item.topic} (${item.reason || "em vừa làm sai"})`;
                return (
                  <div key={item.id} style={card}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                      <div>
                        <div style={{ fontWeight: 800 }}>{item.skill || item.topic || "Kỹ năng"}</div>
                        <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
                          {item.topic ? `${item.topic} · ` : ""}{item.reason || "kỹ năng yếu"}
                          {item.lapses ? ` · đã quên ${item.lapses} lần` : ""}
                        </div>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                        <Link
                          href={`/duomcb?q=${encodeURIComponent(tutorQuery)}`}
                          style={{
                            padding: "5px 10px",
                            borderRadius: 8,
                            background: "rgba(56, 189, 248, 0.14)",
                            border: "1px solid rgba(56, 189, 248, 0.45)",
                            color: "#38bdf8",
                            fontSize: 12,
                            fontWeight: 700,
                            textDecoration: "none",
                          }}
                        >
                          🤖 Nhờ DuoMCB giảng lại câu này
                        </Link>
                        <div style={{ fontSize: 12, color: "#fbbf24", whiteSpace: "nowrap" }}>
                          ⏰ {formatDue(item.days_until_due)}
                        </div>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
                      {RATINGS.map((r) => (
                        <button
                          key={r.key}
                          type="button"
                          disabled={busyId === item.id}
                          onClick={() => review(item.id, r.key)}
                          title={r.hint}
                          style={{
                            flex: "1 1 120px",
                            padding: "9px 10px",
                            borderRadius: 10,
                            cursor: busyId === item.id ? "wait" : "pointer",
                            background: "rgba(255,255,255,0.05)",
                            border: `1px solid ${r.color}55`,
                            color: r.color,
                            fontFamily: "inherit",
                            fontWeight: 700,
                            fontSize: 13,
                          }}
                        >
                          {r.label}
                          <span style={{ display: "block", fontWeight: 400, fontSize: 11, opacity: 0.7 }}>{r.hint}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                );
              })
            )}

            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginTop: 28, marginBottom: 4 }}>
              Sắp tới ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <div style={{ ...card, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Chưa có thẻ nào được lên lịch.</div>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} style={{ ...card, display: "flex", justifyContent: "space-between", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                  <div style={{ fontSize: 13.5 }}>
                    <b>{item.skill || item.topic || "Kỹ năng"}</b>
                    {item.topic ? <span style={{ opacity: 0.65 }}> · {item.topic}</span> : null}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <Link
                      href={`/duomcb?q=${encodeURIComponent(`Giảng lại kỹ năng: ${item.skill || item.topic}`)}`}
                      style={{ fontSize: 12, color: "#38bdf8", textDecoration: "none" }}
                    >
                      🤖 Giảng lại
                    </Link>
                    <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>
                      {formatDue(item.days_until_due)} · {item.interval_days || 0} ngày
                    </div>
                  </div>
                </div>
              ))
            )}
          </>
        )}
      </div>
    </div>
  );
}
