"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { resolveApiBase } from "@/lib/apiBase";

const BASE = resolveApiBase();

async function studentFetch(path, opts = {}) {
  const hdrs = { "Content-Type": "application/json", ...(opts.headers || {}) };
  try {
    const { auth } = await import("@/lib/firebase");
    const cu = auth?.currentUser;
    if (cu) {
      hdrs["Authorization"] = `Bearer ${await cu.getIdToken()}`;
    }
  } catch (_) {}
  if (!hdrs["Authorization"] && typeof window !== "undefined") {
    const tok = window.localStorage.getItem("duomath_token") || window.localStorage.getItem("token");
    if (tok) hdrs["Authorization"] = `Bearer ${tok}`;
  }
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

function formatDueCountdown(dueAt) {
  if (!dueAt) return { label: "Không giới hạn hạn nộp", urgent: false };
  const ms = new Date(dueAt).getTime() - Date.now();
  if (Number.isNaN(ms)) return { label: dueAt, urgent: false };
  if (ms < 0) return { label: "Đã quá hạn nộp", urgent: true };
  const hours = Math.floor(ms / 3600000);
  const days = Math.floor(hours / 24);
  if (days >= 1) return { label: `Còn ${days} ngày ${hours % 24}h`, urgent: days <= 1 };
  const mins = Math.floor((ms % 3600000) / 60000);
  return { label: `Còn ${hours}h ${mins}p`, urgent: true };
}

export default function StudentClassroomsView() {
  const [activeClasses, setActiveClasses] = useState([]);
  const [pendingInvites, setPendingInvites] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [inviteCode, setInviteCode] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Active homework modal state
  const [activeAssignment, setActiveAssignment] = useState(null);
  const [userAnswers, setUserAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState(null);
  const [startedAt, setStartedAt] = useState(null);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadData = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await studentFetch("/api/student/classes");
    if (ok) {
      setActiveClasses(data.active_classes || []);
      setPendingInvites(data.pending_invites || []);
      setAssignments(data.upcoming_assignments || []);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadData();
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const joinParam = params.get("join");
      if (joinParam) {
        setInviteCode(joinParam.toUpperCase());
      }
    }
  }, [loadData]);

  async function handleJoinByCode(e) {
    e.preventDefault();
    if (!inviteCode.trim()) return;
    const { ok, data } = await studentFetch("/api/student/classes/join", {
      method: "POST",
      body: JSON.stringify({ invite_code: inviteCode.trim().toUpperCase() }),
    });
    if (ok) {
      showToast(`Đã tham gia lớp "${data.classroom?.name || inviteCode}" thành công!`);
      setInviteCode("");
      await loadData();
    } else {
      showToast(data.detail || "Không thể tham gia lớp học. Kiểm tra lại mã mời.", true);
    }
  }

  async function handleAcceptInvite(classroomId, name) {
    const { ok, data } = await studentFetch("/api/student/classes/join", {
      method: "POST",
      body: JSON.stringify({ classroom_id: classroomId }),
    });
    if (ok) {
      showToast(`Đã chấp nhận lời mời vào lớp "${name}"!`);
      await loadData();
    } else {
      showToast(data.detail || "Lỗi khi chấp nhận lời mời.", true);
    }
  }

  async function openAssignment(assignmentId) {
    const { ok, data } = await studentFetch(`/api/student/assignments/${assignmentId}`);
    if (ok) {
      setActiveAssignment(data);
      setUserAnswers({});
      setSubmitResult(null);
      setStartedAt(Date.now());
    } else {
      showToast(data.detail || "Không thể mở bài tập.", true);
    }
  }

  async function handleSubmitAssignment(e) {
    e.preventDefault();
    if (!activeAssignment) return;
    setSubmitting(true);
    const durationSec = startedAt ? Math.round((Date.now() - startedAt) / 1000) : 0;
    const { ok, data } = await studentFetch(
      `/api/student/assignments/${activeAssignment.id}/submit`,
      {
        method: "POST",
        body: JSON.stringify({
          answers: userAnswers,
          duration_sec: durationSec,
        }),
      }
    );
    setSubmitting(false);
    if (ok) {
      setSubmitResult(data);
      showToast(`Nộp bài thành công! Điểm số: ${data.score}/10`);
      await loadData();
    } else {
      showToast(data.detail || "Không thể nộp bài.", true);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f19", color: "#e2e8f0", padding: "28px 20px" }}>
      <div style={{ maxWidth: 1120, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingBottom: 18,
            borderBottom: "1px solid #1e293b",
            marginBottom: 24,
          }}
        >
          <div>
            <span
              style={{
                background: "rgba(34, 197, 94, 0.16)",
                border: "1px solid #22c55e",
                color: "#4ade80",
                padding: "3px 10px",
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 700,
              }}
            >
              🎒 LỚP HỌC & BÀI TẬP CỦA EM
            </span>
            <h1 style={{ fontSize: 25, fontWeight: 800, margin: "8px 0 4px", color: "#f8fafc" }}>
              Không Gian Lớp Học & Bài Tập Về Nhà
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#94a3b8" }}>
              Nhập mã lớp 6 ký tự từ giáo viên, làm bài tập được giao và tự động đồng bộ câu sai vào lịch ôn FSRS.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10 }}>
            <Link
              href="/relearn"
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "#1e293b",
                color: "#fbbf24",
                border: "1px solid #334155",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              📓 Sổ tay lỗi sai FSRS
            </Link>
            <Link
              href="/duomcb"
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "#1e293b",
                color: "#38bdf8",
                border: "1px solid #334155",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              🤖 Hỏi Gia sư AI
            </Link>
          </div>
        </div>

        {toast && (
          <div
            style={{
              marginBottom: 18,
              padding: "12px 16px",
              borderRadius: 10,
              background: toast.isError ? "rgba(239, 68, 68, 0.16)" : "rgba(34, 197, 94, 0.16)",
              border: `1px solid ${toast.isError ? "#ef4444" : "#22c55e"}`,
              color: toast.isError ? "#fca5a5" : "#86efac",
              fontSize: 13.5,
              fontWeight: 600,
            }}
          >
            {toast.msg}
          </div>
        )}

        {/* Pending Invitations Banner */}
        {pendingInvites.length > 0 && (
          <div
            style={{
              marginBottom: 22,
              padding: 18,
              borderRadius: 14,
              background: "rgba(245, 158, 11, 0.12)",
              border: "1px solid #f59e0b",
            }}
          >
            <h3 style={{ margin: "0 0 10px", fontSize: 15, color: "#fbbf24" }}>
              📩 Lời mời tham gia lớp học từ Giáo viên ({pendingInvites.length})
            </h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {pendingInvites.map((inv) => (
                <div
                  key={inv.classroom_id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "10px 14px",
                    borderRadius: 10,
                    background: "#0b0f19",
                    border: "1px solid #334155",
                  }}
                >
                  <div>
                    <div style={{ fontWeight: 700, color: "#f8fafc" }}>
                      {inv.name} ({inv.grade})
                    </div>
                    <div style={{ fontSize: 12, color: "#94a3b8" }}>
                      Giáo viên: {inv.teacher_name || inv.teacher_username || "Giáo viên DuoMath"}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleAcceptInvite(inv.classroom_id, inv.name)}
                    style={{
                      padding: "8px 14px",
                      borderRadius: 8,
                      border: "none",
                      background: "#22c55e",
                      color: "#052e16",
                      fontWeight: 700,
                      fontSize: 13,
                      cursor: "pointer",
                    }}
                  >
                    ✅ Chấp nhận vào lớp
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Top row: Join Class by Code + Active Classes */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: 20,
            marginBottom: 24,
          }}
        >
          <form
            onSubmit={handleJoinByCode}
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ margin: "0 0 8px", fontSize: 16, color: "#f8fafc" }}>
              🔑 Tham gia lớp bằng mã mời 6 ký tự
            </h3>
            <p style={{ margin: "0 0 14px", fontSize: 12.5, color: "#94a3b8" }}>
              Nhập mã lớp do thầy/cô cung cấp (ví dụ: <code style={{ color: "#facc15" }}>DM8A2F</code>).
            </p>
            <div style={{ display: "flex", gap: 10 }}>
              <input
                type="text"
                maxLength={10}
                placeholder="Nhập mã lớp (VD: DM8A2F)"
                value={inviteCode}
                onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
                style={{
                  flex: 1,
                  padding: "10px 14px",
                  borderRadius: 8,
                  border: "1px solid #334155",
                  background: "#0b0f19",
                  color: "#facc15",
                  fontFamily: "monospace",
                  fontWeight: 800,
                  fontSize: 15,
                  letterSpacing: 1.5,
                }}
              />
              <button
                type="submit"
                style={{
                  padding: "10px 18px",
                  borderRadius: 8,
                  border: "none",
                  background: "#0284c7",
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                Vào lớp
              </button>
            </div>
          </form>

          <div
            style={{
              background: "#111827",
              border: "1px solid #1e293b",
              borderRadius: 14,
              padding: 20,
            }}
          >
            <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#f8fafc" }}>
              🏫 Lớp học đang tham gia ({activeClasses.length})
            </h3>
            {loading ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>Đang tải...</p>
            ) : activeClasses.length === 0 ? (
              <p style={{ color: "#64748b", fontSize: 13 }}>
                Em chưa tham gia lớp học nào. Hãy nhập mã mời 6 ký tự từ giáo viên ở khung bên trái nhé!
              </p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                {activeClasses.map((c) => (
                  <div
                    key={c.classroom_id}
                    style={{
                      padding: 12,
                      borderRadius: 10,
                      background: "#0b0f19",
                      border: "1px solid #1e293b",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 700, color: "#f8fafc", fontSize: 14 }}>{c.name}</div>
                      <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 2 }}>
                        GV: {c.teacher_name || c.teacher_username || "Giáo viên"} • {c.grade}
                      </div>
                    </div>
                    <span
                      style={{
                        fontFamily: "monospace",
                        fontSize: 12,
                        color: "#38bdf8",
                        background: "rgba(56, 189, 248, 0.12)",
                        padding: "3px 8px",
                        borderRadius: 6,
                      }}
                    >
                      {c.invite_code}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Homework & Assignments Section */}
        <div
          style={{
            background: "#111827",
            border: "1px solid #1e293b",
            borderRadius: 14,
            padding: 20,
          }}
        >
          <h3 style={{ margin: "0 0 14px", fontSize: 17, color: "#f8fafc" }}>
            📝 Bài tập & Đề kiểm tra giáo viên giao ({assignments.length})
          </h3>
          {assignments.length === 0 ? (
            <p style={{ color: "#64748b", fontSize: 13.5 }}>
              Hiện chưa có bài tập nào được giao trong các lớp của em.
            </p>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(310px, 1fr))", gap: 14 }}>
              {assignments.map((a) => {
                const dueInfo = formatDueCountdown(a.due_at);
                const canAttempt = (a.attempts_used || 0) < (a.max_attempts || 1);
                return (
                  <div
                    key={a.id}
                    style={{
                      padding: 16,
                      borderRadius: 12,
                      background: "#0b0f19",
                      border: a.is_completed ? "1px solid rgba(34, 197, 94, 0.4)" : "1px solid #1e293b",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      gap: 12,
                    }}
                  >
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                        <span style={{ fontSize: 11.5, color: "#38bdf8", fontWeight: 700 }}>
                          {a.classroom_name}
                        </span>
                        <span
                          style={{
                            fontSize: 11.5,
                            color: dueInfo.urgent ? "#fbbf24" : "#94a3b8",
                            fontWeight: 600,
                          }}
                        >
                          ⏰ {dueInfo.label}
                        </span>
                      </div>
                      <h4 style={{ margin: "6px 0 4px", fontSize: 15.5, color: "#f8fafc" }}>{a.title}</h4>
                      {a.instructions && (
                        <p style={{ margin: "0 0 8px", fontSize: 12.5, color: "#94a3b8" }}>
                          {a.instructions}
                        </p>
                      )}
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, fontSize: 12, color: "#cbd5e1" }}>
                        <span>⏱ {a.time_limit_min} phút</span>
                        <span>• 🔢 {a.question_count || 0} câu</span>
                        <span>
                          • Lượt làm: {a.attempts_used || 0}/{a.max_attempts || 1}
                        </span>
                        {a.allow_ai_hint ? (
                          <span style={{ color: "#38bdf8" }}>• 💡 Có gợi ý Socratic</span>
                        ) : null}
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        paddingTop: 10,
                        borderTop: "1px solid #1e293b",
                      }}
                    >
                      <div>
                        {a.best_score != null ? (
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#4ade80" }}>
                            🏆 Điểm cao nhất: {a.best_score}/10
                          </span>
                        ) : (
                          <span style={{ fontSize: 12.5, color: "#94a3b8" }}>Chưa nộp bài</span>
                        )}
                      </div>
                      <button
                        type="button"
                        disabled={!canAttempt}
                        onClick={() => openAssignment(a.id)}
                        style={{
                          padding: "8px 14px",
                          borderRadius: 8,
                          border: "none",
                          background: canAttempt ? "#0284c7" : "#334155",
                          color: canAttempt ? "#fff" : "#94a3b8",
                          fontWeight: 700,
                          fontSize: 12.5,
                          cursor: canAttempt ? "pointer" : "not-allowed",
                        }}
                      >
                        {canAttempt
                          ? a.is_completed
                            ? "Làm lại bài"
                            : "Làm bài ngay →"
                          : "Đã hết lượt"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Active Assignment Drawer / Modal */}
        {activeAssignment && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              background: "rgba(3, 7, 18, 0.82)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              zIndex: 1000,
              padding: 16,
            }}
          >
            <div
              style={{
                background: "#111827",
                border: "1px solid #334155",
                borderRadius: 16,
                width: "100%",
                maxWidth: 760,
                maxHeight: "90vh",
                overflowY: "auto",
                padding: 24,
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  paddingBottom: 14,
                  borderBottom: "1px solid #1e293b",
                  marginBottom: 16,
                }}
              >
                <div>
                  <div style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700 }}>
                    {activeAssignment.classroom_name} • ⏱ {activeAssignment.time_limit_min} phút
                  </div>
                  <h3 style={{ margin: "4px 0 0", fontSize: 18, color: "#f8fafc" }}>
                    {activeAssignment.title}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveAssignment(null)}
                  style={{
                    background: "transparent",
                    border: "1px solid #334155",
                    color: "#94a3b8",
                    borderRadius: 8,
                    padding: "6px 12px",
                    cursor: "pointer",
                  }}
                >
                  ✕ Đóng
                </button>
              </div>

              {submitResult ? (
                <div>
                  <div
                    style={{
                      padding: 18,
                      borderRadius: 12,
                      background: "rgba(34, 197, 94, 0.12)",
                      border: "1px solid #22c55e",
                      marginBottom: 16,
                    }}
                  >
                    <div style={{ fontSize: 22, fontWeight: 800, color: "#4ade80" }}>
                      🎉 Kết quả: {submitResult.score}/10 điểm
                    </div>
                    <p style={{ margin: "6px 0 0", fontSize: 13, color: "#cbd5e1" }}>
                      Các câu làm sai đã được tự động lưu vào{" "}
                      <Link href="/relearn" style={{ color: "#fbbf24", fontWeight: 700 }}>
                        Sổ tay lỗi sai FSRS (/relearn)
                      </Link>{" "}
                      để nhắc em ôn tập đúng thời điểm.
                    </p>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {(submitResult.details || []).map((d, i) => (
                      <div
                        key={d.id || i}
                        style={{
                          padding: 12,
                          borderRadius: 10,
                          background: "#0b0f19",
                          border: `1px solid ${d.is_correct ? "#22c55e" : "#ef4444"}`,
                        }}
                      >
                        <div style={{ fontWeight: 700, color: d.is_correct ? "#4ade80" : "#f87171" }}>
                          Câu {i + 1} ({d.topic}):{" "}
                          {d.is_correct
                            ? "✅ Đúng"
                            : d.correct_answer
                              ? `❌ Sai (Đáp án đúng: ${String(d.correct_answer).toUpperCase()})`
                              : "❌ Sai (Còn lượt làm lại — đáp án mở sau lượt cuối)"}
                        </div>
                        {d.explanation && (
                          <div style={{ fontSize: 12.5, color: "#cbd5e1", marginTop: 6 }}>
                            💡 Giải thích: {d.explanation}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <form onSubmit={handleSubmitAssignment} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {(activeAssignment.questions || []).map((q, idx) => (
                    <div
                      key={q.id}
                      style={{
                        padding: 16,
                        borderRadius: 12,
                        background: "#0b0f19",
                        border: "1px solid #1e293b",
                      }}
                    >
                      <div
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          marginBottom: 8,
                        }}
                      >
                        <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 700 }}>
                          Câu {idx + 1} • {q.topic}
                        </span>
                        {activeAssignment.allow_ai_hint ? (
                          <Link
                            href={`/duomcb?q=${encodeURIComponent(
                              `Cho em gợi ý từng bước (không giải hộ đáp án cuối) cho câu hỏi: ${q.question}`
                            )}`}
                            target="_blank"
                            style={{
                              fontSize: 11.5,
                              color: "#fbbf24",
                              textDecoration: "none",
                              border: "1px solid rgba(251, 191, 36, 0.4)",
                              padding: "2px 8px",
                              borderRadius: 6,
                            }}
                          >
                            💡 Gợi ý Socratic
                          </Link>
                        ) : null}
                      </div>
                      <div style={{ fontSize: 14.5, fontWeight: 600, color: "#f8fafc", marginBottom: 12 }}>
                        {q.question}
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                        {(q.options || []).map((opt) => {
                          const chosen = userAnswers[q.id] === opt.id;
                          return (
                            <label
                              key={opt.id}
                              style={{
                                display: "flex",
                                alignItems: "center",
                                gap: 8,
                                padding: "9px 12px",
                                borderRadius: 8,
                                border: chosen ? "1px solid #38bdf8" : "1px solid #1e293b",
                                background: chosen ? "rgba(56, 189, 248, 0.14)" : "#111827",
                                cursor: "pointer",
                                fontSize: 13.5,
                              }}
                            >
                              <input
                                type="radio"
                                name={`q-${q.id}`}
                                value={opt.id}
                                checked={chosen}
                                onChange={() =>
                                  setUserAnswers((prev) => ({ ...prev, [q.id]: opt.id }))
                                }
                              />
                              <strong style={{ color: "#38bdf8" }}>{opt.id.toUpperCase()}.</strong>{" "}
                              <span>{opt.text_vi || opt.text}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  ))}

                  <button
                    type="submit"
                    disabled={submitting}
                    style={{
                      padding: "12px 20px",
                      borderRadius: 10,
                      border: "none",
                      background: "#22c55e",
                      color: "#052e16",
                      fontWeight: 800,
                      fontSize: 14.5,
                      cursor: submitting ? "wait" : "pointer",
                    }}
                  >
                    {submitting ? "Đang chấm bài..." : "✅ Nộp bài tập"}
                  </button>
                </form>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
