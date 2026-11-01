"use client";
import { useState, useEffect, useCallback } from "react";

const REASON_LABELS = {
  cheating:      { label: "Gian lận / Hack",         icon: "⚠️", color: "#fbbf24" },
  harassment:    { label: "Quấy rối / Thù địch",     icon: "😡", color: "#f97316" },
  inappropriate: { label: "Nội dung không phù hợp",  icon: "🔞", color: "#ef4444" },
  spam:          { label: "Spam / Quảng cáo",         icon: "📢", color: "#94a3b8" },
  other:         { label: "Lý do khác",               icon: "📝", color: "#7dd3fc" },
};

function timeAgo(iso) {
  if (!iso) return "";
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const m = Math.floor(diff / 60000);
  if (h >= 24) return `${Math.floor(h / 24)} ngày trước`;
  if (h >= 1) return `${h}h trước`;
  return `${m} phút trước`;
}

export default function AdminReportsTab({ adminFetch, showNotif }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending"); // "pending" | "resolved" | "all"
  const [resolveModal, setResolveModal] = useState(null);
  const [resolveNote, setResolveNote] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchReports = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await adminFetch("/api/admin/reports");
    if (ok) setReports(Array.isArray(data) ? data : data?.reports || []);
    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    fetchReports();
  }, [fetchReports]);

  const handleResolve = async (reportId, action) => {
    setActionLoading(reportId);
    const { ok } = await adminFetch(`/api/admin/reports/${reportId}/resolve`, {
      method: "POST",
      body: JSON.stringify({ action, admin_note: resolveNote }),
    });
    if (ok) {
      showNotif(
        action === "ban_user"
          ? "🔨 Đã ban người dùng và đóng báo cáo"
          : "✅ Đã đóng báo cáo"
      );
      fetchReports();
      setResolveModal(null);
      setResolveNote("");
    } else {
      showNotif("❌ Lỗi khi xử lý báo cáo", "error");
    }
    setActionLoading(null);
  };

  const filtered = reports.filter((r) => {
    if (filter === "pending") return r.status === "pending";
    if (filter === "resolved") return r.status !== "pending";
    return true;
  });

  const pendingCount = reports.filter((r) => r.status === "pending").length;

  if (loading) {
    return (
      <div style={{ textAlign: "center", padding: "60px 20px" }}>
        <div
          style={{
            fontSize: 36,
            marginBottom: 12,
            animation: "spin 1s linear infinite",
          }}
        >
          ⚙️
        </div>
        <div style={{ color: "rgba(255,255,255,0.4)" }}>
          Đang tải báo cáo...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Filter bar */}
      <div
        style={{ display: "flex", gap: 8, marginBottom: 16, flexWrap: "wrap" }}
      >
        {[
          { key: "pending", label: `⏳ Chờ xử lý (${pendingCount})` },
          { key: "resolved", label: "✅ Đã xử lý" },
          { key: "all", label: `📋 Tất cả (${reports.length})` },
        ].map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            style={{
              padding: "7px 16px",
              borderRadius: 8,
              fontSize: 12,
              fontWeight: 600,
              cursor: "pointer",
              background:
                filter === f.key
                  ? "rgba(239,68,68,0.15)"
                  : "rgba(255,255,255,0.05)",
              border:
                filter === f.key
                  ? "1px solid rgba(239,68,68,0.4)"
                  : "1px solid rgba(255,255,255,0.1)",
              color:
                filter === f.key ? "#f87171" : "rgba(255,255,255,0.6)",
            }}
          >
            {f.label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "60px 20px" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
          <div style={{ color: "rgba(255,255,255,0.4)", fontSize: 15 }}>
            {filter === "pending"
              ? "Không có báo cáo nào đang chờ!"
              : "Chưa có báo cáo nào."}
          </div>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {filtered.map((r) => {
            const reasonInfo = REASON_LABELS[r.reason] || {
              label: r.reason,
              icon: "📝",
              color: "#94a3b8",
            };
            const isPending = r.status === "pending";
            return (
              <div
                key={r.id}
                style={{
                  background: "rgba(15,23,42,0.7)",
                  border: isPending
                    ? "1px solid rgba(239,68,68,0.2)"
                    : "1px solid rgba(255,255,255,0.07)",
                  borderRadius: 12,
                  padding: "14px 16px",
                }}
              >
                <div
                  style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
                >
                  <div
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 10,
                      flexShrink: 0,
                      background: `${reasonInfo.color}18`,
                      border: `1px solid ${reasonInfo.color}40`,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: 18,
                    }}
                  >
                    {reasonInfo.icon}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        display: "flex",
                        flexWrap: "wrap",
                        gap: 8,
                        alignItems: "center",
                        marginBottom: 4,
                      }}
                    >
                      <span
                        style={{
                          fontSize: 13,
                          fontWeight: 700,
                          color: "white",
                        }}
                      >
                        <span style={{ color: "#7dd3fc" }}>
                          {r.reporter_username || "—"}
                        </span>
                        <span
                          style={{
                            color: "rgba(255,255,255,0.4)",
                            fontWeight: 400,
                          }}
                        >
                          {" "}
                          báo cáo{" "}
                        </span>
                        <span style={{ color: "#f87171" }}>
                          {r.reported_username || "—"}
                        </span>
                      </span>
                      <span
                        style={{
                          fontSize: 10,
                          fontWeight: 700,
                          color: reasonInfo.color,
                          background: `${reasonInfo.color}15`,
                          border: `1px solid ${reasonInfo.color}40`,
                          borderRadius: 4,
                          padding: "1px 7px",
                        }}
                      >
                        {reasonInfo.label}
                      </span>
                      {!isPending && (
                        <span
                          style={{
                            fontSize: 10,
                            fontWeight: 700,
                            color: "#4ade80",
                            background: "rgba(74,222,128,0.1)",
                            border: "1px solid rgba(74,222,128,0.25)",
                            borderRadius: 4,
                            padding: "1px 7px",
                          }}
                        >
                          ĐÃ XỬ LÝ
                        </span>
                      )}
                    </div>

                    {r.note && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "rgba(255,255,255,0.55)",
                          marginBottom: 4,
                          fontStyle: "italic",
                        }}
                      >
                        &quot;{r.note}&quot;
                      </div>
                    )}

                    {r.admin_note && (
                      <div
                        style={{
                          fontSize: 11,
                          color: "#a78bfa",
                          marginBottom: 4,
                        }}
                      >
                        📝 Admin: {r.admin_note}
                      </div>
                    )}

                    <div
                      style={{
                        fontSize: 10,
                        color: "rgba(255,255,255,0.3)",
                      }}
                    >
                      {timeAgo(r.created_at)}
                    </div>
                  </div>

                  {isPending && (
                    <button
                      onClick={() => {
                        setResolveModal(r);
                        setResolveNote("");
                      }}
                      style={{
                        padding: "7px 14px",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 700,
                        background: "rgba(167,139,250,0.12)",
                        border: "1px solid rgba(167,139,250,0.3)",
                        color: "#a78bfa",
                        cursor: "pointer",
                        flexShrink: 0,
                        whiteSpace: "nowrap",
                      }}
                    >
                      🔍 Xử lý
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resolve modal */}
      {resolveModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.75)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: 20,
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: 480,
              background: "rgba(15,23,42,0.98)",
              border: "1px solid rgba(167,139,250,0.25)",
              borderRadius: 16,
              padding: 24,
              boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
            }}
          >
            <div
              style={{
                fontSize: 16,
                fontWeight: 800,
                color: "white",
                marginBottom: 4,
              }}
            >
              🔍 Xử lý báo cáo
            </div>
            <div
              style={{
                fontSize: 12,
                color: "rgba(255,255,255,0.45)",
                marginBottom: 16,
              }}
            >
              <span style={{ color: "#7dd3fc" }}>
                {resolveModal.reporter_username}
              </span>
              {" → "}
              <span style={{ color: "#f87171" }}>
                {resolveModal.reported_username}
              </span>
              {" · "}
              {REASON_LABELS[resolveModal.reason]?.label || resolveModal.reason}
            </div>

            {resolveModal.note && (
              <div
                style={{
                  padding: "10px 12px",
                  marginBottom: 14,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: 8,
                  fontSize: 12,
                  color: "rgba(255,255,255,0.6)",
                  fontStyle: "italic",
                }}
              >
                {`"${resolveModal.note}"`}
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label
                style={{
                  display: "block",
                  fontSize: 12,
                  fontWeight: 600,
                  color: "rgba(255,255,255,0.5)",
                  marginBottom: 8,
                }}
              >
                Ghi chú admin (tùy chọn)
              </label>
              <textarea
                value={resolveNote}
                onChange={(e) => setResolveNote(e.target.value)}
                placeholder="Kết quả điều tra, lý do quyết định..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(167,139,250,0.25)",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>

            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              <button
                onClick={() => setResolveModal(null)}
                style={{
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 600,
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleResolve(resolveModal.id, "dismiss")}
                disabled={Boolean(actionLoading)}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "rgba(74,222,128,0.1)",
                  border: "1px solid rgba(74,222,128,0.3)",
                  color: "#4ade80",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {actionLoading === resolveModal.id ? "⏳" : "✅ Bỏ qua báo cáo"}
              </button>
              <button
                onClick={() => handleResolve(resolveModal.id, "warn_user")}
                disabled={Boolean(actionLoading)}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "rgba(251,191,36,0.1)",
                  border: "1px solid rgba(251,191,36,0.3)",
                  color: "#fbbf24",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {actionLoading === resolveModal.id ? "⏳" : "⚠️ Cảnh cáo"}
              </button>
              <button
                onClick={() => handleResolve(resolveModal.id, "ban_user")}
                disabled={Boolean(actionLoading)}
                style={{
                  flex: 1,
                  padding: "9px 16px",
                  borderRadius: 8,
                  background: "rgba(239,68,68,0.15)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "#f87171",
                  cursor: "pointer",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {actionLoading === resolveModal.id ? "⏳" : "🔨 Ban người dùng"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
