"use client";

// Đợt 4E — "Ôn tập hôm nay": the student-facing half of the FSRS feature.
//
// /ketqua already seeds one spaced-repetition card per weak skill (the Vercel
// feedback route posts them to POST /api/relearn/seed). This page is where the
// student ACTS on that schedule: it lists the cards that are due, lets them
// rate how the recall went (again / hard / good / easy) and shows what is
// coming up next. The backend does the FSRS maths and returns the new due date.
//
// Uses `authFetch` so the Firebase ID token is attached — the relearn endpoints
// are per-user and answer 401 without it (which is why /ketqua can seed cards
// for a logged-in student only).

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";

import { authFetch } from "@/lib/authFetch";

const RATINGS = [
  { key: "again", label: "Quên rồi", hint: "ôn lại sớm", color: "#f87171" },
  { key: "hard", label: "Khó", hint: "vẫn nhớ chút", color: "#fbbf24" },
  { key: "good", label: "Được", hint: "nhớ bình thường", color: "#4ade80" },
  { key: "easy", label: "Dễ", hint: "quá dễ", color: "#22d3ee" },
];

function formatDue(daysUntil) {
  if (daysUntil === null || daysUntil === undefined) return "chưa có lịch";
  if (daysUntil <= 0) return "đến hạn ngay";
  if (daysUntil < 1) return `còn ${Math.max(1, Math.round(daysUntil * 24))} giờ`;
  return `còn ${Math.round(daysUntil)} ngày`;
}

export default function RelearnPage() {
  const [due, setDue] = useState([]);
  const [upcoming, setUpcoming] = useState([]);
  const [retention, setRetention] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const res = await authFetch("/api/relearn/due?limit=20");
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
      setRetention(typeof data.retention_target === "number" ? data.retention_target : null);
    } catch (err) {
      setError("Không kết nối được máy chủ. Em thử lại sau nhé.");
      console.warn("[relearn] load failed:", err?.message || err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

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
      await load();
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
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", padding: "40px 18px" }}>
      <div style={{ maxWidth: 820, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>🔁 Ôn tập hôm nay</h1>
          <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
            <Link href="/khampha" style={{ color: "#67e8f9" }}>📈 Khám phá đồ thị</Link>
            <Link href="/ketqua" style={{ color: "#67e8f9" }}>← Về trang kết quả</Link>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6 }}>
          Mỗi kỹ năng yếu trong bài kiểm tra được biến thành một thẻ ôn tập. Em tự đánh giá mức độ nhớ —
          thuật toán FSRS sẽ hẹn ngày ôn tiếp theo
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

        {loading ? (
          <div style={{ ...card, color: "rgba(255,255,255,0.6)" }}>Đang tải lộ trình ôn tập…</div>
        ) : (
          <>
            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginTop: 24, marginBottom: 4 }}>
              Đến hạn ({due.length})
            </h2>
            {due.length === 0 ? (
              <div style={{ ...card, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>
                Hôm nay chưa có thẻ nào đến hạn. Em làm thêm một bài kiểm tra để bổ sung thẻ mới nhé.
              </div>
            ) : (
              due.map((item) => (
                <div key={item.id} style={card}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontWeight: 800 }}>{item.skill || item.topic || "Kỹ năng"}</div>
                      <div style={{ fontSize: 12.5, color: "rgba(255,255,255,0.6)" }}>
                        {item.topic ? `${item.topic} · ` : ""}{item.reason || "kỹ năng yếu"}
                        {item.lapses ? ` · đã quên ${item.lapses} lần` : ""}
                      </div>
                    </div>
                    <div style={{ fontSize: 12, color: "#fbbf24", whiteSpace: "nowrap" }}>
                      ⏰ {formatDue(item.days_until_due)}
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
              ))
            )}

            <h2 style={{ fontSize: 16, fontWeight: 800, color: "#67e8f9", marginTop: 28, marginBottom: 4 }}>
              Sắp tới ({upcoming.length})
            </h2>
            {upcoming.length === 0 ? (
              <div style={{ ...card, color: "rgba(255,255,255,0.6)", fontSize: 13 }}>Chưa có thẻ nào được lên lịch.</div>
            ) : (
              upcoming.map((item) => (
                <div key={item.id} style={{ ...card, display: "flex", justifyContent: "space-between", gap: 10 }}>
                  <div style={{ fontSize: 13.5 }}>
                    <b>{item.skill || item.topic || "Kỹ năng"}</b>
                    {item.topic ? <span style={{ opacity: 0.65 }}> · {item.topic}</span> : null}
                  </div>
                  <div style={{ fontSize: 12, color: "rgba(255,255,255,0.65)", whiteSpace: "nowrap" }}>
                    {formatDue(item.days_until_due)} · {item.interval_days || 0} ngày
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
