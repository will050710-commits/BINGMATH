"use client";

export const ROLE_META = {
  student: {
    label: "Học sinh",
    badge: "STUDENT",
    icon: "🎓",
    color: "#38bdf8",
    bg: "rgba(56,189,248,0.12)",
    border: "rgba(56,189,248,0.3)",
  },
  teacher: {
    label: "Giáo viên",
    badge: "TEACHER",
    icon: "👩‍🏫",
    color: "#34d399",
    bg: "rgba(52,211,153,0.14)",
    border: "rgba(52,211,153,0.35)",
  },
  admin: {
    label: "Quản trị viên",
    badge: "ADMIN",
    icon: "🛡️",
    color: "#a78bfa",
    bg: "rgba(167,139,250,0.14)",
    border: "rgba(167,139,250,0.35)",
  },
};

export function resolveUserRole(user) {
  if (!user) return "student";
  const raw = String(user.role || "").toLowerCase();
  if (raw === "admin" || user.is_admin) return "admin";
  if (raw === "teacher" || user.is_teacher) return "teacher";
  return "student";
}

export function AdminRoleBadge({ user }) {
  const role = resolveUserRole(user);
  const meta = ROLE_META[role] || ROLE_META.student;
  return (
    <span
      style={{
        fontSize: 10,
        fontWeight: 700,
        color: meta.color,
        background: meta.bg,
        border: `1px solid ${meta.border}`,
        borderRadius: 4,
        padding: "1px 6px",
        display: "inline-flex",
        alignItems: "center",
        gap: 4,
      }}
    >
      <span>{meta.icon}</span>
      <span>{meta.badge}</span>
    </span>
  );
}

export default function AdminRoleSelector({
  user,
  disabled = false,
  loading = false,
  onChangeRole,
}) {
  const currentRole = resolveUserRole(user);
  const isSuper =
    String(user?.email || "").toLowerCase() === "will050710@gmail.com";

  return (
    <select
      aria-label={`Vai trò của ${user?.username || user?.email || "người dùng"}`}
      value={currentRole}
      disabled={disabled || loading || isSuper}
      onChange={(e) => {
        const nextRole = e.target.value;
        if (nextRole && nextRole !== currentRole && onChangeRole) {
          onChangeRole(user.id, nextRole);
        }
      }}
      style={{
        padding: "6px 10px",
        borderRadius: 7,
        fontSize: 12,
        fontWeight: 700,
        background: "rgba(15,23,42,0.85)",
        border: `1px solid ${(ROLE_META[currentRole] || ROLE_META.student).border}`,
        color: (ROLE_META[currentRole] || ROLE_META.student).color,
        cursor: disabled || loading || isSuper ? "not-allowed" : "pointer",
        outline: "none",
      }}
    >
      <option value="student">🎓 Học sinh</option>
      <option value="teacher">👩‍🏫 Giáo viên (Bổ nhiệm)</option>
      <option value="admin">🛡️ Admin</option>
    </select>
  );
}
