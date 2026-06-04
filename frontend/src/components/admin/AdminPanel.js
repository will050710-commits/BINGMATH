/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useMathMapStore } from "@/context/MathMapStore";

// ── Helpers ────────────────────────────────────────────────────────────────
function formatDate(iso) {
  if (!iso) return "—";
  try { return new Date(iso).toLocaleString("vi-VN"); } catch { return iso; }
}

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)} ngày trước`;
  if (h >= 1) return `${h}h trước`;
  return `${m} phút trước`;
}

function countdown24h(qualifiedAt) {
  if (!qualifiedAt) return null;
  const msLeft = new Date(qualifiedAt).getTime() + 24 * 3600 * 1000 - Date.now();
  if (msLeft <= 0) return "Sẵn sàng lên Ranked!";
  const h = Math.floor(msLeft / 3600000);
  const m = Math.floor((msLeft % 3600000) / 60000);
  return `${h}h ${m}m nữa`;
}

// ── Status badge ───────────────────────────────────────────────────────────
function SBadge({ status }) {
  const cfg = {
    pending:   { label: "PENDING",   color: "#94a3b8", bg: "rgba(148,163,184,0.12)" },
    qualified: { label: "QUALIFIED", color: "#fbbf24", bg: "rgba(251,191,36,0.12)" },
    ranked:    { label: "RANKED",    color: "#22d3ee", bg: "rgba(34,211,238,0.12)" },
    rejected:  { label: "REJECTED",  color: "#f87171", bg: "rgba(248,113,113,0.12)" },
  }[status] || { label: status?.toUpperCase() || "?", color: "#94a3b8", bg: "rgba(148,163,184,0.1)" };
  return (
    <span style={{
      fontSize: 10, fontWeight: 800, color: cfg.color, background: cfg.bg,
      border: `1px solid ${cfg.color}44`, borderRadius: 4, padding: "2px 8px", letterSpacing: 0.5,
    }}>
      {cfg.label}
    </span>
  );
}

// ── MathMap review card ────────────────────────────────────────────────────
function MapReviewCard({ map, onApprove, onReject, onForceRanked, onDelete, isSuperAdmin, showCountdown }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectForm, setShowRejectForm] = useState(false);
  const cdText = showCountdown ? countdown24h(map.qualifiedAt) : null;

  return (
    <div style={{
      background: "rgba(15,23,42,0.7)",
      border: "1px solid rgba(255,255,255,0.07)",
      borderRadius: 12, overflow: "hidden", marginBottom: 10,
    }}>
      {/* Header */}
      <div style={{
        display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
        cursor: "pointer",
      }} onClick={() => setExpanded(v => !v)}>
        {/* Thumbnail */}
        <div style={{
          width: 48, height: 48, borderRadius: 8, flexShrink: 0,
          background: map.thumbnail_color || "linear-gradient(135deg,#a78bfa,#6d28d9)",
          display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22,
        }}>
          {map.icon || "📐"}
        </div>

        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 3 }}>
            <SBadge status={map.status} />
            <span style={{ fontSize: 14, fontWeight: 700, color: "white" }}>{map.title}</span>
          </div>
          <div style={{ fontSize: 11, color: "rgba(255,255,255,0.45)" }}>
            by <span style={{ color: "#7dd3fc" }}>{map.creator}</span>
            {" · "}{map.grade}
            {" · "}{map.question_count} câu
            {" · "}submitted {timeAgo(map.submittedAt)}
          </div>
          {showCountdown && cdText && (
            <div style={{ fontSize: 10, color: "#fbbf24", marginTop: 3, fontWeight: 600 }}>
              ⏱ {cdText}
            </div>
          )}
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 6, flexShrink: 0 }} onClick={e => e.stopPropagation()}>
          {map.status === "pending" && (
            <>
              <button
                onClick={() => onApprove(map.id)}
                style={{
                  padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  background: "rgba(74,222,128,0.15)", border: "1px solid rgba(74,222,128,0.4)",
                  color: "#4ade80", cursor: "pointer",
                }}
              >✅ Duyệt</button>
              <button
                onClick={() => setShowRejectForm(v => !v)}
                style={{
                  padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)",
                  color: "#f87171", cursor: "pointer",
                }}
              >❌ Từ chối</button>
            </>
          )}
          {map.status === "qualified" && isSuperAdmin && (
            <button
              onClick={() => onForceRanked(map.id)}
              style={{
                padding: "7px 14px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(34,211,238,0.15)", border: "1px solid rgba(34,211,238,0.4)",
                color: "#22d3ee", cursor: "pointer",
              }}
            >⚡ Force Ranked</button>
          )}
          {!map.isSeed && (
            <button
              onClick={() => { if (confirm(`Xóa "${map.title}"?`)) onDelete(map.id); }}
              style={{
                padding: "7px 10px", borderRadius: 7, fontSize: 12,
                background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.2)",
                color: "#f87171", cursor: "pointer",
              }}
            >🗑</button>
          )}
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: 12, padding: "7px 2px" }}>
            {expanded ? "▼" : "▶"}
          </span>
        </div>
      </div>

      {/* Reject form */}
      {showRejectForm && (
        <div style={{
          padding: "10px 16px", background: "rgba(239,68,68,0.05)",
          borderTop: "1px solid rgba(239,68,68,0.15)",
        }}>
          <div style={{ fontSize: 12, color: "#f87171", fontWeight: 600, marginBottom: 6 }}>
            Lý do từ chối (tùy chọn):
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <input
              type="text"
              value={rejectReason}
              onChange={e => setRejectReason(e.target.value)}
              placeholder="VD: Nội dung không phù hợp, câu hỏi sai..."
              style={{
                flex: 1, padding: "8px 12px", borderRadius: 7,
                background: "rgba(255,255,255,0.06)", border: "1px solid rgba(239,68,68,0.3)",
                color: "white", fontSize: 12, outline: "none",
              }}
            />
            <button
              onClick={() => { onReject(map.id, rejectReason); setShowRejectForm(false); }}
              style={{
                padding: "8px 16px", borderRadius: 7, fontSize: 12, fontWeight: 700,
                background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)",
                color: "#f87171", cursor: "pointer",
              }}
            >Xác nhận từ chối</button>
          </div>
        </div>
      )}

      {/* Expanded detail */}
      {expanded && (
        <div style={{
          padding: "12px 16px",
          borderTop: "1px solid rgba(255,255,255,0.05)",
          display: "flex", flexDirection: "column", gap: 10,
        }}>
          {map.description && (
            <div style={{ fontSize: 12, color: "rgba(255,255,255,0.6)", lineHeight: 1.6 }}>
              {map.description}
            </div>
          )}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {(map.tags || []).map(tag => (
              <span key={tag} style={{
                fontSize: 10, color: "#a78bfa", background: "rgba(167,139,250,0.1)",
                border: "1px solid rgba(167,139,250,0.25)", borderRadius: 4, padding: "2px 7px",
              }}>{tag}</span>
            ))}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
            {[
              ["📬 Submitted", formatDate(map.submittedAt)],
              ["✅ Qualified", formatDate(map.qualifiedAt)],
              ["🏆 Ranked", formatDate(map.rankedAt)],
            ].map(([k, v]) => (
              <div key={k} style={{ background: "rgba(255,255,255,0.04)", borderRadius: 6, padding: "6px 10px" }}>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)" }}>{k}</div>
                <div style={{ fontSize: 11, color: "white", marginTop: 2 }}>{v}</div>
              </div>
            ))}
          </div>
          {/* Questions preview */}
          {(map.questions || []).length > 0 && (
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", marginBottom: 6 }}>
                Preview câu hỏi ({map.questions.length}):
              </div>
              {map.questions.slice(0, 3).map((q, i) => (
                <div key={q.id || i} style={{
                  padding: "6px 10px", background: "rgba(255,255,255,0.03)",
                  border: "1px solid rgba(255,255,255,0.05)", borderRadius: 6, marginBottom: 4,
                  fontSize: 12, color: "rgba(255,255,255,0.65)",
                }}>
                  <span style={{ color: "#22d3ee", fontWeight: 700, marginRight: 6 }}>{i + 1}.</span>
                  {q.content_vi || "(Chưa có nội dung)"}
                </div>
              ))}
              {map.questions.length > 3 && (
                <div style={{ fontSize: 11, color: "rgba(255,255,255,0.3)", marginTop: 4 }}>
                  + {map.questions.length - 3} câu nữa...
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ── Admin management panel ─────────────────────────────────────────────────
function AdminManagementTab({ admins, isSuperAdmin, onGrant, onRevoke, superAdminEmail }) {
  const [newEmail, setNewEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleGrant = () => {
    const e = newEmail.trim().toLowerCase();
    if (!e || !e.includes("@")) { setError("Email không hợp lệ"); return; }
    if (admins.map(x => x.toLowerCase()).includes(e)) { setError("Email này đã có quyền admin"); return; }
    onGrant(newEmail.trim());
    setNewEmail("");
    setError("");
    setSuccess(`Đã cấp quyền admin cho ${newEmail.trim()}`);
    setTimeout(() => setSuccess(""), 3000);
  };

  return (
    <div>
      {/* Grant form */}
      <div style={{
        background: "rgba(167,139,250,0.06)", border: "1px solid rgba(167,139,250,0.15)",
        borderRadius: 12, padding: 20, marginBottom: 20,
      }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: "#a78bfa", marginBottom: 14 }}>
          ➕ Cấp quyền Admin mới
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          <input
            type="email"
            value={newEmail}
            onChange={e => { setNewEmail(e.target.value); setError(""); }}
            placeholder="Nhập địa chỉ email..."
            onKeyDown={e => e.key === "Enter" && handleGrant()}
            style={{
              flex: 1, padding: "10px 14px", borderRadius: 8,
              background: "rgba(255,255,255,0.07)", border: "1px solid rgba(167,139,250,0.3)",
              color: "white", fontSize: 13, outline: "none",
            }}
          />
          <button onClick={handleGrant} style={{
            padding: "10px 22px", borderRadius: 8, fontSize: 13, fontWeight: 700,
            background: "linear-gradient(135deg, #a78bfa, #6d28d9)",
            border: "none", color: "white", cursor: "pointer",
            boxShadow: "0 4px 12px rgba(167,139,250,0.35)",
          }}>Cấp quyền</button>
        </div>
        {error && <div style={{ marginTop: 8, fontSize: 12, color: "#f87171" }}>⚠️ {error}</div>}
        {success && <div style={{ marginTop: 8, fontSize: 12, color: "#4ade80" }}>✅ {success}</div>}
      </div>

      {/* Admin list */}
      <div style={{ fontSize: 13, fontWeight: 700, color: "rgba(255,255,255,0.5)", marginBottom: 10 }}>
        Danh sách Admin ({admins.length})
      </div>
      {admins.map(email => {
        const isSuper = email.toLowerCase() === superAdminEmail.toLowerCase();
        return (
          <div key={email} style={{
            display: "flex", alignItems: "center", gap: 12, padding: "12px 16px",
            background: isSuper ? "rgba(251,191,36,0.06)" : "rgba(15,23,42,0.6)",
            border: isSuper ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(255,255,255,0.07)",
            borderRadius: 10, marginBottom: 8,
          }}>
            <div style={{
              width: 36, height: 36, borderRadius: "50%",
              background: isSuper ? "linear-gradient(135deg,#fbbf24,#f59e0b)" : "linear-gradient(135deg,#a78bfa,#6d28d9)",
              display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0,
            }}>
              {isSuper ? "👑" : "🛡️"}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "white" }}>{email}</div>
              <div style={{ fontSize: 11, color: isSuper ? "#fbbf24" : "rgba(255,255,255,0.4)" }}>
                {isSuper ? "Super Admin (không thể xóa)" : "Admin"}
              </div>
            </div>
            {!isSuper && (
              <button
                onClick={() => { if (confirm(`Thu hồi quyền admin của ${email}?`)) onRevoke(email); }}
                style={{
                  padding: "6px 14px", borderRadius: 7, fontSize: 12, fontWeight: 600,
                  background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.25)",
                  color: "#f87171", cursor: "pointer",
                }}
              >Thu hồi</button>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Main AdminPanel Component ──────────────────────────────────────────────
export default function AdminPanel() {
  const {
    maps, admins, currentUser, hydrated,
    login, logout,
    isSuperAdmin, isAdmin,
    grantAdmin, revokeAdmin,
    approveMap, rejectMap, forceRanked, deleteMap,
    getMapsByStatus,
    SUPER_ADMIN_EMAIL,
  } = useMathMapStore();

  const [tab, setTab] = useState("pending");
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotif = useCallback((msg, type = "success") => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3000);
  }, []);

  const handleApprove = useCallback((id) => {
    approveMap(id);
    showNotif("✅ Đã duyệt — MathMap chuyển sang Qualified");
  }, [approveMap, showNotif]);

  const handleReject = useCallback((id, reason) => {
    rejectMap(id, reason);
    showNotif("❌ Đã từ chối MathMap", "error");
  }, [rejectMap, showNotif]);

  const handleForceRanked = useCallback((id) => {
    forceRanked(id);
    showNotif("⚡ Force-promoted lên Ranked!", "success");
  }, [forceRanked, showNotif]);

  const handleDelete = useCallback((id) => {
    deleteMap(id);
    showNotif("🗑 Đã xóa MathMap", "error");
  }, [deleteMap, showNotif]);

  const handleLogin = async () => {
    setLoginLoading(true);
    setLoginError("");
    await new Promise(r => setTimeout(r, 600));
    const result = login(loginEmail, loginPass);
    setLoginLoading(false);
    if (!result.ok) setLoginError(result.error);
  };

  const pendingMaps   = getMapsByStatus("pending");
  const qualifiedMaps = getMapsByStatus("qualified");
  const rankedMaps    = getMapsByStatus("ranked");
  const rejectedMaps  = getMapsByStatus("rejected");

  // ─── Loading ────────────────────────────────────────────────────────────
  if (!hydrated) {
    return (
      <div style={{
        minHeight: "100vh", background: "#020617",
        display: "flex", alignItems: "center", justifyContent: "center",
        color: "white", fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 40, marginBottom: 12, animation: "spin 1s linear infinite" }}>⚙️</div>
          <div style={{ color: "rgba(255,255,255,0.5)" }}>Đang tải...</div>
        </div>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  // ─── Login gate ──────────────────────────────────────────────────────────
  if (!currentUser || !isAdmin(currentUser.email)) {
    return (
      <div style={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #020617 0%, #0a0a1a 40%, #150a2e 100%)",
        display: "flex", alignItems: "center", justifyContent: "center",
        fontFamily: "'Inter', sans-serif",
      }}>
        <div style={{
          width: "100%", maxWidth: 440, padding: 40,
          background: "rgba(15,23,42,0.8)", backdropFilter: "blur(16px)",
          border: "1px solid rgba(167,139,250,0.2)", borderRadius: 20,
          boxShadow: "0 24px 64px rgba(0,0,0,0.5)",
        }}>
          {/* Logo */}
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>🛡️</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: "white", letterSpacing: 1 }}>
              DUO<span style={{ color: "#22d3ee" }}>MATH</span>
              <span style={{
                fontSize: 12, fontWeight: 700, color: "#a78bfa",
                background: "rgba(167,139,250,0.12)", border: "1px solid rgba(167,139,250,0.3)",
                borderRadius: 6, padding: "2px 8px", marginLeft: 8, letterSpacing: 1,
              }}>ADMIN</span>
            </div>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginTop: 6 }}>
              Đăng nhập để quản lý MathMap
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", display: "block", marginBottom: 6 }}>
                Email Admin
              </label>
              <input
                type="email"
                value={loginEmail}
                onChange={e => { setLoginEmail(e.target.value); setLoginError(""); }}
                placeholder="admin@example.com"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(167,139,250,0.25)",
                  color: "white", fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(167,139,250,0.25)"}
              />
            </div>

            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: "#93c5fd", display: "block", marginBottom: 6 }}>
                Mật khẩu
              </label>
              <input
                type="password"
                value={loginPass}
                onChange={e => { setLoginPass(e.target.value); setLoginError(""); }}
                placeholder="••••••••••"
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                style={{
                  width: "100%", padding: "12px 14px", borderRadius: 10,
                  background: "rgba(255,255,255,0.07)", border: "1px solid rgba(167,139,250,0.25)",
                  color: "white", fontSize: 14, outline: "none", boxSizing: "border-box",
                }}
                onFocus={e => e.target.style.borderColor = "rgba(167,139,250,0.6)"}
                onBlur={e => e.target.style.borderColor = "rgba(167,139,250,0.25)"}
              />
            </div>

            {loginError && (
              <div style={{
                padding: "10px 14px", background: "rgba(239,68,68,0.1)",
                border: "1px solid rgba(239,68,68,0.3)", borderRadius: 8,
                fontSize: 13, color: "#f87171",
              }}>
                ⚠️ {loginError}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loginLoading}
              style={{
                padding: "13px 0", borderRadius: 10, fontSize: 15, fontWeight: 800,
                background: loginLoading ? "rgba(167,139,250,0.3)" : "linear-gradient(135deg, #a78bfa, #6d28d9)",
                border: "none", color: "white", cursor: loginLoading ? "default" : "pointer",
                boxShadow: "0 4px 20px rgba(167,139,250,0.4)", marginTop: 4,
                transition: "all 0.2s",
              }}
            >
              {loginLoading ? "⏳ Đang xác thực..." : "🛡️ Đăng nhập Admin"}
            </button>
          </div>

          <div style={{
            marginTop: 20, padding: "12px 14px",
            background: "rgba(34,211,238,0.05)", border: "1px solid rgba(34,211,238,0.15)",
            borderRadius: 8, fontSize: 12, color: "rgba(255,255,255,0.45)", lineHeight: 1.6,
          }}>
            💡 Chỉ những email được cấp quyền admin mới có thể đăng nhập. Super Admin có thể cấp quyền cho email khác tại tab Quản lý Admin.
          </div>

          <div style={{ marginTop: 16, textAlign: "center" }}>
            <Link href="/bmf" style={{ fontSize: 13, color: "rgba(255,255,255,0.35)", textDecoration: "none" }}>
              ← Quay lại BMF Forum
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const amISuperAdmin = isSuperAdmin(currentUser.email);

  // ─── Admin Dashboard ─────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: "100vh",
      background: "linear-gradient(135deg, #020617 0%, #0a0a1a 100%)",
      fontFamily: "'Inter', sans-serif", color: "white",
    }}>
      {/* Notification */}
      {notification && (
        <div style={{
          position: "fixed", top: 20, right: 20, zIndex: 9999,
          padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 600,
          background: notification.type === "error" ? "rgba(239,68,68,0.9)" : "rgba(74,222,128,0.9)",
          color: "white", boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
          animation: "slideInRight 0.3s ease",
        }}>
          {notification.msg}
        </div>
      )}

      {/* Header */}
      <header style={{
        display: "flex", alignItems: "center", gap: 16, padding: "14px 28px",
        background: "rgba(2,6,23,0.9)", backdropFilter: "blur(12px)",
        borderBottom: "1px solid rgba(167,139,250,0.15)",
        flexWrap: "wrap",
      }}>
        <Link href="/mrm" style={{ textDecoration: "none" }}>
          <span style={{ fontSize: 20, fontWeight: 900, color: "white", letterSpacing: 2 }}>
            DUO<span style={{ color: "#22d3ee" }}>MATH</span>
          </span>
        </Link>
        <span style={{ color: "rgba(255,255,255,0.2)" }}>›</span>
        <span style={{ fontSize: 14, color: "#a78bfa", fontWeight: 700 }}>🛡️ Admin Panel</span>

        <div style={{ flex: 1 }} />

        {/* Current user */}
        <div style={{
          display: "flex", alignItems: "center", gap: 10,
          background: amISuperAdmin ? "rgba(251,191,36,0.08)" : "rgba(167,139,250,0.08)",
          border: amISuperAdmin ? "1px solid rgba(251,191,36,0.2)" : "1px solid rgba(167,139,250,0.2)",
          borderRadius: 10, padding: "7px 14px",
        }}>
          <span style={{ fontSize: 16 }}>{amISuperAdmin ? "👑" : "🛡️"}</span>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, color: "white" }}>{currentUser.email}</div>
            <div style={{ fontSize: 10, color: amISuperAdmin ? "#fbbf24" : "#a78bfa" }}>
              {amISuperAdmin ? "Super Admin" : "Admin"}
            </div>
          </div>
        </div>

        <button onClick={logout} style={{
          padding: "8px 16px", borderRadius: 8, fontSize: 13,
          background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.12)",
          color: "rgba(255,255,255,0.7)", cursor: "pointer",
        }}>Đăng xuất</button>

        <Link href="/bmf" style={{ textDecoration: "none" }}>
          <button style={{
            padding: "8px 14px", borderRadius: 8, fontSize: 13,
            background: "rgba(34,211,238,0.08)", border: "1px solid rgba(34,211,238,0.2)",
            color: "#22d3ee", cursor: "pointer",
          }}>← Forum</button>
        </Link>
      </header>

      {/* Stats bar */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,26,0.7)",
      }}>
        {[
          { label: "Pending", count: pendingMaps.length, color: "#94a3b8", icon: "⏳" },
          { label: "Qualified", count: qualifiedMaps.length, color: "#fbbf24", icon: "✅" },
          { label: "Ranked", count: rankedMaps.length, color: "#22d3ee", icon: "🏆" },
          { label: "Rejected", count: rejectedMaps.length, color: "#f87171", icon: "❌" },
          { label: "Tổng maps", count: maps.length, color: "#a78bfa", icon: "📚" },
        ].map((s, i) => (
          <div key={s.label} style={{
            flex: 1, padding: "14px 20px", textAlign: "center",
            borderRight: i < 4 ? "1px solid rgba(255,255,255,0.05)" : "none",
          }}>
            <div style={{ fontSize: 20, marginBottom: 2 }}>{s.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: s.color }}>{s.count}</div>
            <div style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", marginTop: 1 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{
        display: "flex", borderBottom: "1px solid rgba(255,255,255,0.06)",
        background: "rgba(10,10,26,0.8)", padding: "0 28px",
      }}>
        {[
          { key: "pending",   label: `⏳ Pending (${pendingMaps.length})` },
          { key: "qualified", label: `✅ Qualified (${qualifiedMaps.length})` },
          { key: "ranked",    label: `🏆 Ranked (${rankedMaps.length})` },
          { key: "rejected",  label: `❌ Từ chối (${rejectedMaps.length})` },
          ...(amISuperAdmin ? [{ key: "admins", label: "👑 Quản lý Admin" }] : []),
        ].map(t => (
          <button key={t.key} onClick={() => setTab(t.key)} style={{
            padding: "13px 20px", border: "none", cursor: "pointer",
            background: "transparent",
            fontSize: 13, fontWeight: tab === t.key ? 700 : 400,
            color: tab === t.key ? "#a78bfa" : "rgba(255,255,255,0.5)",
            borderBottom: tab === t.key ? "2px solid #a78bfa" : "2px solid transparent",
            marginBottom: -1, transition: "all 0.2s", whiteSpace: "nowrap",
          }}>{t.label}</button>
        ))}
      </div>

      {/* Content */}
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "24px 28px" }}>

        {/* Pending tab */}
        {tab === "pending" && (
          <>
            {pendingMaps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>
                  Không có MathMap nào đang chờ duyệt!
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
                  {pendingMaps.length} bài đang chờ kiểm duyệt — Click vào bài để xem chi tiết và câu hỏi
                </div>
                {pendingMaps.map(m => (
                  <MapReviewCard
                    key={m.id} map={m}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onForceRanked={handleForceRanked}
                    onDelete={handleDelete}
                    isSuperAdmin={amISuperAdmin}
                    showCountdown={false}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* Qualified tab */}
        {tab === "qualified" && (
          <>
            {qualifiedMaps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>📭</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Không có MathMap đang chờ Ranked</div>
              </div>
            ) : (
              <>
                <div style={{
                  padding: "10px 16px", background: "rgba(251,191,36,0.07)",
                  border: "1px solid rgba(251,191,36,0.2)", borderRadius: 10, marginBottom: 16,
                  fontSize: 12, color: "rgba(255,255,255,0.6)",
                }}>
                  ⏱ Các bài này sẽ tự động lên <strong style={{ color: "#22d3ee" }}>Ranked</strong> sau 24h kể từ khi được duyệt.
                  {amISuperAdmin && " Super Admin có thể Force Ranked ngay."}
                </div>
                {qualifiedMaps.map(m => (
                  <MapReviewCard
                    key={m.id} map={m}
                    onApprove={handleApprove}
                    onReject={handleReject}
                    onForceRanked={handleForceRanked}
                    onDelete={handleDelete}
                    isSuperAdmin={amISuperAdmin}
                    showCountdown={true}
                  />
                ))}
              </>
            )}
          </>
        )}

        {/* Ranked tab */}
        {tab === "ranked" && (
          <>
            <div style={{ fontSize: 13, color: "rgba(255,255,255,0.4)", marginBottom: 16 }}>
              {rankedMaps.length} bài đang live trên BMF Forum
            </div>
            {rankedMaps.map(m => (
              <MapReviewCard
                key={m.id} map={m}
                onApprove={handleApprove}
                onReject={handleReject}
                onForceRanked={handleForceRanked}
                onDelete={handleDelete}
                isSuperAdmin={amISuperAdmin}
                showCountdown={false}
              />
            ))}
          </>
        )}

        {/* Rejected tab */}
        {tab === "rejected" && (
          <>
            {rejectedMaps.length === 0 ? (
              <div style={{ textAlign: "center", padding: "60px 20px" }}>
                <div style={{ fontSize: 48, marginBottom: 12 }}>✨</div>
                <div style={{ fontSize: 16, color: "rgba(255,255,255,0.5)" }}>Chưa có bài nào bị từ chối</div>
              </div>
            ) : (
              rejectedMaps.map(m => (
                <MapReviewCard
                  key={m.id} map={m}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  onForceRanked={handleForceRanked}
                  onDelete={handleDelete}
                  isSuperAdmin={amISuperAdmin}
                  showCountdown={false}
                />
              ))
            )}
          </>
        )}

        {/* Admin management tab (super admin only) */}
        {tab === "admins" && amISuperAdmin && (
          <AdminManagementTab
            admins={admins}
            isSuperAdmin={amISuperAdmin}
            onGrant={grantAdmin}
            onRevoke={revokeAdmin}
            superAdminEmail={SUPER_ADMIN_EMAIL}
          />
        )}
      </div>

      <style>{`
        @keyframes slideInRight {
          from { transform: translateX(60px); opacity: 0; }
          to   { transform: translateX(0);    opacity: 1; }
        }
      `}</style>
    </div>
  );
}
