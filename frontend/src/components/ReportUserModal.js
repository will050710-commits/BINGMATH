/* eslint-disable @next/next/no-img-element */
"use client";
import { useState } from "react";
import { useAuth } from "@/context/authContext";

// ── Shared API fetch helper (same pattern as authContext) ────────────────────
const BASE =
  process.env.NEXT_PUBLIC_BACKEND_URL ||
  (typeof window !== "undefined" &&
  window.location.hostname !== "localhost" &&
  window.location.hostname !== "127.0.0.1"
    ? "https://duomath.onrender.com"
    : "http://localhost:5000");

async function apiFetch(path, opts = {}, idToken = null) {
  const hdrs = { "Content-Type": "application/json", ...opts.headers };
  if (idToken) hdrs["Authorization"] = `Bearer ${idToken}`;
  const res = await fetch(`${BASE}${path}`, { ...opts, headers: hdrs });
  const data = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data };
}

const REPORT_REASONS = [
  { id: "cheating",     label: "Gian lận / Hack",        icon: "⚠️", desc: "Dùng bot, cheat tool, hoặc exploit bug" },
  { id: "harassment",  label: "Quấy rối / Thù địch",    icon: "😡", desc: "Nhắn tin xúc phạm, đe dọa người khác" },
  { id: "inappropriate", label: "Nội dung không phù hợp", icon: "🔞", desc: "Tên, avatar hoặc chat có nội dung xấu" },
  { id: "spam",         label: "Spam / Quảng cáo",        icon: "📢", desc: "Gửi tin nhắn rác hoặc quảng cáo" },
  { id: "other",        label: "Lý do khác",              icon: "📝", desc: "Mô tả chi tiết trong phần ghi chú" },
];

// ── ReportUserModal ──────────────────────────────────────────────────────────
export default function ReportUserModal({ targetUsername, targetUserId, onClose }) {
  const { user } = useAuth();
  const [reportedUsernameInput, setReportedUsernameInput] = useState("");
  const [selectedReason, setSelectedReason] = useState("");
  const [extraNote, setExtraNote] = useState("");
  const [step, setStep] = useState("form"); // "form" | "submitting" | "done" | "error"
  const [errorMsg, setErrorMsg] = useState("");

  const actualTargetUsername = targetUsername || reportedUsernameInput;

  const handleSubmit = async () => {
    if (!selectedReason) return;
    if (!actualTargetUsername.trim()) { setErrorMsg("Vui lòng nhập tên người dùng cần báo cáo."); return; }
    if (!user) { setErrorMsg("Bạn cần đăng nhập để báo cáo."); return; }

    setStep("submitting");
    try {
      const { auth } = await import("@/lib/firebase");
      const idToken = auth.currentUser ? await auth.currentUser.getIdToken() : null;

      const body = {
        reason: selectedReason,
        note: extraNote.trim() || undefined,
      };

      if (targetUserId) body.reported_user_id = targetUserId;
      else body.reported_username = actualTargetUsername.trim();

      const { ok, data } = await apiFetch("/api/reports", {
        method: "POST",
        body: JSON.stringify(body),
      }, idToken);

      if (ok) {
        setStep("done");
      } else {
        setErrorMsg(data?.error || "Đã xảy ra lỗi. Vui lòng thử lại.");
        setStep("error");
      }
    } catch (e) {
      console.error(e);
      setErrorMsg("Không thể kết nối đến máy chủ.");
      setStep("error");
    }
  };

  const reasonObj = REPORT_REASONS.find(r => r.id === selectedReason);

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(2,6,23,0.85)",
        backdropFilter: "blur(14px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 20,
      }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div style={{
        width: "100%", maxWidth: 480,
        background: "rgba(10,15,35,0.97)",
        border: "1px solid rgba(239,68,68,0.25)",
        borderRadius: 20,
        boxShadow: "0 28px 80px rgba(0,0,0,0.7), 0 0 40px rgba(239,68,68,0.08)",
        overflow: "hidden",
        animation: "reportModalIn 0.3s cubic-bezier(0.34,1.56,0.64,1)",
      }}>

        {/* Header */}
        <div style={{
          padding: "20px 24px",
          background: "rgba(239,68,68,0.07)",
          borderBottom: "1px solid rgba(239,68,68,0.15)",
          display: "flex", alignItems: "center", gap: 12,
        }}>
          <div style={{
            width: 40, height: 40, borderRadius: "50%",
            background: "rgba(239,68,68,0.15)",
            border: "1px solid rgba(239,68,68,0.3)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20, flexShrink: 0,
          }}>🚩</div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 800, color: "white" }}>
              Báo cáo người dùng
            </div>
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.5)", marginTop: 2 }}>
              {targetUsername ? (
                <span style={{ color: "#f87171", fontWeight: 700 }}>@{targetUsername}</span>
              ) : (
                <span>Nhập tên người dùng cần báo cáo</span>
              )}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
            color: "rgba(255,255,255,0.6)", borderRadius: 8,
            width: 32, height: 32, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>×</button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 24px" }}>

          {/* FORM STATE */}
          {(step === "form" || step === "error") && (
            <>
              {!targetUsername && (
                <div style={{ marginBottom: 16 }}>
                  <label style={{
                    display: "block", fontSize: 12, fontWeight: 700,
                    color: "rgba(255,255,255,0.5)",
                    textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
                  }}>
                    Tên người dùng cần báo cáo *
                  </label>
                  <input
                    type="text"
                    value={reportedUsernameInput}
                    onChange={e => setReportedUsernameInput(e.target.value)}
                    placeholder="Nhập chính xác username..."
                    style={{
                      width: "100%", padding: "10px 12px", borderRadius: 8,
                      background: "rgba(255,255,255,0.05)",
                      border: "1px solid rgba(255,255,255,0.12)",
                      color: "white", fontSize: 13, outline: "none",
                      boxSizing: "border-box",
                    }}
                    onFocus={e => e.target.style.borderColor = "rgba(239,68,68,0.4)"}
                    onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                  />
                </div>
              )}

              <div style={{
                fontSize: 12, fontWeight: 700, color: "rgba(255,255,255,0.5)",
                textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12,
              }}>
                Chọn lý do báo cáo *
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
                {REPORT_REASONS.map(r => (
                  <button
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    style={{
                      padding: "12px 14px",
                      background: selectedReason === r.id
                        ? "rgba(239,68,68,0.12)"
                        : "rgba(255,255,255,0.04)",
                      border: selectedReason === r.id
                        ? "1px solid rgba(239,68,68,0.5)"
                        : "1px solid rgba(255,255,255,0.08)",
                      borderRadius: 10, cursor: "pointer",
                      display: "flex", alignItems: "center", gap: 12,
                      textAlign: "left", transition: "all 0.15s",
                    }}
                    onMouseEnter={e => {
                      if (selectedReason !== r.id) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.07)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.15)";
                      }
                    }}
                    onMouseLeave={e => {
                      if (selectedReason !== r.id) {
                        e.currentTarget.style.background = "rgba(255,255,255,0.04)";
                        e.currentTarget.style.borderColor = "rgba(255,255,255,0.08)";
                      }
                    }}
                  >
                    <span style={{ fontSize: 20, flexShrink: 0 }}>{r.icon}</span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "white" }}>{r.label}</div>
                      <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)", marginTop: 1 }}>{r.desc}</div>
                    </div>
                    {selectedReason === r.id && (
                      <div style={{
                        width: 18, height: 18, borderRadius: "50%",
                        background: "#ef4444", flexShrink: 0,
                        display: "flex", alignItems: "center", justifyContent: "center",
                        fontSize: 11, color: "white", fontWeight: 900,
                      }}>✓</div>
                    )}
                  </button>
                ))}
              </div>

              {/* Extra note */}
              <div style={{ marginBottom: 16 }}>
                <label style={{
                  display: "block", fontSize: 12, fontWeight: 700,
                  color: "rgba(255,255,255,0.5)",
                  textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 8,
                }}>
                  Ghi chú thêm (tùy chọn)
                </label>
                <textarea
                  value={extraNote}
                  onChange={e => setExtraNote(e.target.value)}
                  rows={3}
                  placeholder="Mô tả chi tiết sự việc bạn muốn báo cáo..."
                  maxLength={500}
                  style={{
                    width: "100%", padding: "10px 12px", borderRadius: 8,
                    background: "rgba(255,255,255,0.05)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "white", fontSize: 13, outline: "none",
                    boxSizing: "border-box", resize: "vertical", fontFamily: "inherit",
                    lineHeight: 1.5, minHeight: 72,
                  }}
                  onFocus={e => e.target.style.borderColor = "rgba(239,68,68,0.4)"}
                  onBlur={e => e.target.style.borderColor = "rgba(255,255,255,0.12)"}
                />
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.3)", marginTop: 4, textAlign: "right" }}>
                  {extraNote.length}/500 ký tự
                </div>
              </div>

              {/* Error banner */}
              {step === "error" && errorMsg && (
                <div style={{
                  padding: "10px 12px", marginBottom: 14,
                  background: "rgba(239,68,68,0.1)",
                  border: "1px solid rgba(239,68,68,0.3)",
                  borderRadius: 8, fontSize: 13, color: "#f87171",
                }}>
                  ⚠️ {errorMsg}
                </div>
              )}

              {/* Info note */}
              <div style={{
                padding: "10px 12px", marginBottom: 16,
                background: "rgba(34,211,238,0.05)",
                border: "1px solid rgba(34,211,238,0.12)",
                borderRadius: 8, fontSize: 11, color: "rgba(255,255,255,0.4)",
                lineHeight: 1.5,
              }}>
                💡 Báo cáo sẽ được Admin xem xét trong vòng 24h. Báo cáo sai sự thật có thể dẫn đến tài khoản bạn bị hạn chế.
              </div>

              {/* Footer buttons */}
              <div style={{ display: "flex", gap: 10 }}>
                <button
                  onClick={onClose}
                  style={{
                    flex: 1, padding: "11px 0", borderRadius: 10,
                    background: "rgba(255,255,255,0.06)",
                    border: "1px solid rgba(255,255,255,0.12)",
                    color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: 600, cursor: "pointer",
                    transition: "all 0.2s",
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.1)"}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.06)"}
                >
                  Hủy
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={!selectedReason}
                  style={{
                    flex: 2, padding: "11px 0", borderRadius: 10,
                    background: selectedReason
                      ? "linear-gradient(135deg, #ef4444, #b91c1c)"
                      : "rgba(239,68,68,0.2)",
                    border: selectedReason
                      ? "1px solid rgba(239,68,68,0.5)"
                      : "1px solid rgba(239,68,68,0.15)",
                    color: selectedReason ? "white" : "rgba(255,255,255,0.3)",
                    fontSize: 13, fontWeight: 700, cursor: selectedReason ? "pointer" : "not-allowed",
                    boxShadow: selectedReason ? "0 4px 16px rgba(239,68,68,0.3)" : "none",
                    transition: "all 0.2s",
                  }}
                >
                  🚩 Gửi báo cáo
                  {reasonObj && <span style={{ fontWeight: 400, opacity: 0.8 }}> · {reasonObj.label}</span>}
                </button>
              </div>
            </>
          )}

          {/* SUBMITTING STATE */}
          {step === "submitting" && (
            <div style={{ textAlign: "center", padding: "40px 20px" }}>
              <div style={{ fontSize: 40, marginBottom: 16, animation: "spin 1s linear infinite" }}>⏳</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 15 }}>Đang gửi báo cáo...</div>
            </div>
          )}

          {/* DONE STATE */}
          {step === "done" && (
            <div style={{ textAlign: "center", padding: "32px 20px" }}>
              <div style={{
                width: 64, height: 64, borderRadius: "50%",
                background: "rgba(74,222,128,0.15)",
                border: "2px solid rgba(74,222,128,0.4)",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 32, margin: "0 auto 16px",
              }}>✅</div>
              <div style={{ fontSize: 18, fontWeight: 800, color: "white", marginBottom: 8 }}>
                Báo cáo đã được gửi!
              </div>
              <div style={{ fontSize: 13, color: "rgba(255,255,255,0.5)", lineHeight: 1.6, marginBottom: 24 }}>
                Cảm ơn bạn đã giúp duy trì môi trường DuoMath lành mạnh.<br/>
                Admin sẽ xem xét báo cáo về <span style={{ color: "#f87171", fontWeight: 700 }}>@{targetUsername}</span> trong vòng 24h.
              </div>
              <button
                onClick={onClose}
                style={{
                  padding: "10px 32px", borderRadius: 10,
                  background: "linear-gradient(135deg, #4ade80, #16a34a)",
                  border: "none", color: "white", fontSize: 14, fontWeight: 700,
                  cursor: "pointer", boxShadow: "0 4px 16px rgba(74,222,128,0.3)",
                }}
              >
                Đóng
              </button>
            </div>
          )}

        </div>
      </div>

      <style>{`
        @keyframes reportModalIn {
          from { transform: scale(0.88) translateY(20px); opacity: 0; }
          to   { transform: scale(1) translateY(0); opacity: 1; }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
