/* eslint-disable @next/next/no-img-element */
"use client";
import { useState, useEffect, useCallback } from "react";
import AdminRoleSelector, {
  AdminRoleBadge,
  resolveUserRole,
  ROLE_META,
} from "./AdminRoleSelector";

export default function AdminUsersTab({ adminFetch, showNotif }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all"); // "all" | "student" | "teacher" | "admin"
  const [banModal, setBanModal] = useState(null); // user object
  const [banReason, setBanReason] = useState("");
  const [actionLoading, setActionLoading] = useState(null);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await adminFetch("/api/admin/users");
    if (ok) {
      setUsers(Array.isArray(data) ? data : data?.users || []);
    }
    setLoading(false);
  }, [adminFetch]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleChangeRole = async (userId, nextRole) => {
    setActionLoading(`${userId}_role`);
    const { ok, data } = await adminFetch(`/api/admin/users/${userId}/role`, {
      method: "PATCH",
      body: JSON.stringify({ role: nextRole }),
    });
    if (ok) {
      const roleLabel = ROLE_META[nextRole]?.label || nextRole;
      showNotif(`✅ Đã cập nhật vai trò: ${roleLabel}`);
      fetchUsers();
    } else {
      showNotif(data?.detail || "❌ Lỗi khi đổi vai trò người dùng", "error");
    }
    setActionLoading(null);
  };

  const handleBan = async (userId, reason) => {
    setActionLoading(`${userId}_ban`);
    const { ok, data } = await adminFetch(`/api/admin/users/${userId}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: 1, reason }),
    });
    if (ok) {
      showNotif("🔨 Đã khóa tài khoản người dùng");
      fetchUsers();
      setBanModal(null);
      setBanReason("");
    } else {
      showNotif(data?.detail || "❌ Lỗi khi khóa người dùng", "error");
    }
    setActionLoading(null);
  };

  const handleUnban = async (userId) => {
    setActionLoading(`${userId}_unban`);
    const { ok, data } = await adminFetch(`/api/admin/users/${userId}/ban`, {
      method: "PATCH",
      body: JSON.stringify({ banned: 0, reason: "" }),
    });
    if (ok) {
      showNotif("✅ Đã mở khóa tài khoản người dùng");
      fetchUsers();
    } else {
      showNotif(data?.detail || "❌ Lỗi khi mở khóa", "error");
    }
    setActionLoading(null);
  };

  const filtered = users.filter((u) => {
    const matchesSearch =
      !search.trim() ||
      u.username?.toLowerCase().includes(search.toLowerCase()) ||
      u.email?.toLowerCase().includes(search.toLowerCase());
    if (!matchesSearch) return false;
    if (roleFilter === "all") return true;
    return resolveUserRole(u) === roleFilter;
  });

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
          Đang tải danh sách người dùng...
        </div>
      </div>
    );
  }

  return (
    <div>
      {/* Search + Role filter */}
      <div
        style={{
          display: "flex",
          gap: 10,
          marginBottom: 14,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="🔍 Tìm kiếm học sinh / giáo viên theo tên hoặc email..."
          style={{
            flex: 1,
            minWidth: 240,
            padding: "10px 14px",
            borderRadius: 10,
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.12)",
            color: "white",
            fontSize: 13,
            outline: "none",
            boxSizing: "border-box",
          }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {[
            { key: "all", label: `Tất cả (${users.length})` },
            {
              key: "student",
              label: `🎓 Học sinh (${users.filter((u) => resolveUserRole(u) === "student").length})`,
            },
            {
              key: "teacher",
              label: `👩‍🏫 Giáo viên (${users.filter((u) => resolveUserRole(u) === "teacher").length})`,
            },
            {
              key: "admin",
              label: `🛡️ Admin (${users.filter((u) => resolveUserRole(u) === "admin").length})`,
            },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setRoleFilter(f.key)}
              style={{
                padding: "8px 12px",
                borderRadius: 8,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                background:
                  roleFilter === f.key
                    ? "rgba(56,189,248,0.16)"
                    : "rgba(255,255,255,0.05)",
                border:
                  roleFilter === f.key
                    ? "1px solid rgba(56,189,248,0.45)"
                    : "1px solid rgba(255,255,255,0.1)",
                color:
                  roleFilter === f.key ? "#38bdf8" : "rgba(255,255,255,0.6)",
              }}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{
          fontSize: 12,
          color: "rgba(255,255,255,0.4)",
          marginBottom: 12,
        }}
      >
        Hiển thị {filtered.length} người dùng · Chọn vai trò{" "}
        <strong style={{ color: "#34d399" }}>👩‍🏫 Giáo viên</strong> để bổ nhiệm
        quyền quản lý lớp học &amp; giao bài tập.
      </div>

      {/* User list */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filtered.map((u) => (
          <div
            key={u.id}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              padding: "12px 16px",
              background: u.banned
                ? "rgba(239,68,68,0.05)"
                : "rgba(15,23,42,0.6)",
              border: u.banned
                ? "1px solid rgba(239,68,68,0.2)"
                : "1px solid rgba(255,255,255,0.07)",
              borderRadius: 10,
              flexWrap: "wrap",
            }}
          >
            {/* Avatar */}
            <div style={{ flexShrink: 0 }}>
              {u.avatar_url ? (
                <img
                  src={u.avatar_url}
                  alt={u.username || "Avatar"}
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    objectFit: "cover",
                    border: u.banned
                      ? "2px solid rgba(239,68,68,0.5)"
                      : "2px solid rgba(255,255,255,0.1)",
                  }}
                />
              ) : (
                <div
                  style={{
                    width: 40,
                    height: 40,
                    borderRadius: "50%",
                    background: u.banned
                      ? "rgba(239,68,68,0.2)"
                      : "linear-gradient(135deg,#6366f1,#0ea5e9)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "white",
                    fontWeight: 800,
                    fontSize: 16,
                  }}
                >
                  {(u.username || "U")[0].toUpperCase()}
                </div>
              )}
            </div>

            {/* Info */}
            <div style={{ flex: 1, minWidth: 180 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  flexWrap: "wrap",
                }}
              >
                <span
                  style={{ fontSize: 13, fontWeight: 700, color: "white" }}
                >
                  {u.username || "—"}
                </span>
                <AdminRoleBadge user={u} />
                {u.banned ? (
                  <span
                    style={{
                      fontSize: 10,
                      fontWeight: 700,
                      color: "#f87171",
                      background: "rgba(239,68,68,0.12)",
                      border: "1px solid rgba(239,68,68,0.3)",
                      borderRadius: 4,
                      padding: "1px 6px",
                    }}
                  >
                    BANNED
                  </span>
                ) : null}
              </div>
              <div
                style={{
                  fontSize: 11,
                  color: "rgba(255,255,255,0.45)",
                  marginTop: 2,
                }}
              >
                {u.email}
                {u.school && <span> · {u.school}</span>}
                {u.grade && <span> · Lớp {u.grade}</span>}
              </div>
              {u.banned && u.ban_reason && (
                <div style={{ fontSize: 10, color: "#f87171", marginTop: 2 }}>
                  Lý do khóa: {u.ban_reason}
                </div>
              )}
            </div>

            {/* Tests & XP */}
            <div
              style={{
                textAlign: "center",
                flexShrink: 0,
                minWidth: 70,
              }}
            >
              <div
                style={{ fontSize: 13, fontWeight: 800, color: "#fbbf24" }}
              >
                {u.tests_count ?? 0} đề
              </div>
              <div style={{ fontSize: 9, color: "rgba(255,255,255,0.35)" }}>
                {u.xp || 0} XP
              </div>
            </div>

            {/* Role Appointment Selector */}
            <div style={{ flexShrink: 0 }}>
              <AdminRoleSelector
                user={u}
                loading={actionLoading === `${u.id}_role`}
                onChangeRole={handleChangeRole}
              />
            </div>

            {/* Ban / Unban */}
            <div style={{ flexShrink: 0 }}>
              {u.banned ? (
                <button
                  onClick={() => handleUnban(u.id)}
                  disabled={actionLoading === `${u.id}_unban`}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    background: "rgba(74,222,128,0.12)",
                    border: "1px solid rgba(74,222,128,0.3)",
                    color: "#4ade80",
                    cursor: "pointer",
                  }}
                >
                  {actionLoading === `${u.id}_unban` ? "⏳" : "🔓 Mở khóa"}
                </button>
              ) : (
                <button
                  onClick={() => {
                    setBanModal(u);
                    setBanReason("");
                  }}
                  disabled={Boolean(u.is_admin)}
                  style={{
                    padding: "7px 14px",
                    borderRadius: 7,
                    fontSize: 12,
                    fontWeight: 700,
                    background: u.is_admin
                      ? "rgba(255,255,255,0.04)"
                      : "rgba(239,68,68,0.1)",
                    border: u.is_admin
                      ? "1px solid rgba(255,255,255,0.08)"
                      : "1px solid rgba(239,68,68,0.25)",
                    color: u.is_admin ? "rgba(255,255,255,0.2)" : "#f87171",
                    cursor: u.is_admin ? "not-allowed" : "pointer",
                  }}
                >
                  🔨 Ban
                </button>
              )}
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div
            style={{
              textAlign: "center",
              padding: "40px 20px",
              color: "rgba(255,255,255,0.4)",
            }}
          >
            Không tìm thấy người dùng nào
          </div>
        )}
      </div>

      {/* Ban modal */}
      {banModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            background: "rgba(0,0,0,0.7)",
            backdropFilter: "blur(8px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: 440,
              background: "rgba(15,23,42,0.98)",
              border: "1px solid rgba(239,68,68,0.3)",
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
                marginBottom: 16,
              }}
            >
              🔨 Khóa người dùng:{" "}
              <span style={{ color: "#f87171" }}>{banModal.username}</span>
            </div>
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
                Lý do khóa *
              </label>
              <textarea
                value={banReason}
                onChange={(e) => setBanReason(e.target.value)}
                placeholder="Nhập lý do khóa tài khoản người dùng này..."
                rows={3}
                style={{
                  width: "100%",
                  padding: "10px 12px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(239,68,68,0.25)",
                  color: "white",
                  fontSize: 13,
                  outline: "none",
                  boxSizing: "border-box",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
              />
            </div>
            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setBanModal(null)}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: 8,
                  background: "rgba(255,255,255,0.06)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  color: "white",
                  cursor: "pointer",
                  fontSize: 13,
                  fontWeight: 600,
                }}
              >
                Hủy
              </button>
              <button
                onClick={() => handleBan(banModal.id, banReason)}
                disabled={!banReason.trim() || Boolean(actionLoading)}
                style={{
                  flex: 2,
                  padding: "10px",
                  borderRadius: 8,
                  background: banReason.trim()
                    ? "rgba(239,68,68,0.8)"
                    : "rgba(239,68,68,0.2)",
                  border: "1px solid rgba(239,68,68,0.4)",
                  color: "white",
                  cursor: banReason.trim() ? "pointer" : "not-allowed",
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {actionLoading ? "⏳ Đang xử lý..." : "🔨 Xác nhận Khóa"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
