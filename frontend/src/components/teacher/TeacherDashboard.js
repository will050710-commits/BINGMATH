"use client";
import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/context/authContext";
import { resolveApiBase } from "@/lib/apiBase";

const BASE = resolveApiBase();

async function teacherFetch(path, opts = {}) {
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

const SAMPLE_QUESTIONS = [
  {
    id: "q-1",
    topic: "Hàm số & Đạo hàm",
    question: "Cho hàm số y = x^3 - 3x + 2. Giá trị cực đại của hàm số bằng bao nhiêu?",
    options: [
      { id: "a", text_vi: "4" },
      { id: "b", text_vi: "0" },
      { id: "c", text_vi: "2" },
      { id: "d", text_vi: "-1" },
    ],
    correct_answer: "a",
    explanation: "y' = 3x^2 - 3 = 0 <=> x = ±1. Tại x = -1 thì y(-1) = 4 là giá trị cực đại.",
  },
  {
    id: "q-2",
    topic: "Hình học phẳng",
    question: "Trong mặt phẳng Oxy, đường tròn (C): (x - 1)^2 + (y + 2)^2 = 9 có bán kính R bằng:",
    options: [
      { id: "a", text_vi: "9" },
      { id: "b", text_vi: "3" },
      { id: "c", text_vi: "6" },
      { id: "d", text_vi: "sqrt(3)" },
    ],
    correct_answer: "b",
    explanation: "Phương trình đường tròn có R^2 = 9 nên bán kính R = 3.",
  },
];

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("classes"); // 'classes' | 'assignments' | 'analytics'
  const [classes, setClasses] = useState([]);
  const [selectedClassId, setSelectedClassId] = useState(null);
  const [members, setMembers] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  // Create classroom form
  const [newClassName, setNewClassName] = useState("");
  const [newClassGrade, setNewClassGrade] = useState("Lớp 12");
  const [newClassDesc, setNewClassDesc] = useState("");
  const [inviteInput, setInviteInput] = useState("");

  // Create assignment form
  const [assignTitle, setAssignTitle] = useState("");
  const [assignInstructions, setAssignInstructions] = useState("");
  const [assignSourceType, setAssignSourceType] = useState("custom_quiz");
  const [assignDueAt, setAssignDueAt] = useState("");
  const [assignTimeLimit, setAssignTimeLimit] = useState(45);
  const [assignMaxAttempts, setAssignMaxAttempts] = useState(2);
  const [assignAllowHint, setAssignAllowHint] = useState(true);
  const [questions, setQuestions] = useState(SAMPLE_QUESTIONS);

  const showToast = useCallback((msg, isError = false) => {
    setToast({ msg, isError });
    setTimeout(() => setToast(null), 4000);
  }, []);

  const loadClasses = useCallback(async () => {
    setLoading(true);
    const { ok, data } = await teacherFetch("/api/teacher/classes");
    if (ok && Array.isArray(data.classes)) {
      setClasses(data.classes);
      if (data.classes.length > 0 && !selectedClassId) {
        setSelectedClassId(data.classes[0].id);
      }
    }
    setLoading(false);
  }, [selectedClassId]);

  const loadClassDetails = useCallback(async (cid) => {
    if (!cid) return;
    const [mRes, aRes, anRes] = await Promise.all([
      teacherFetch(`/api/teacher/classes/${cid}/members`),
      teacherFetch(`/api/teacher/classes/${cid}/assignments`),
      teacherFetch(`/api/teacher/classes/${cid}/analytics`),
    ]);
    if (mRes.ok) setMembers(mRes.data.members || []);
    if (aRes.ok) setAssignments(aRes.data.assignments || []);
    if (anRes.ok) setAnalytics(anRes.data);
  }, []);

  useEffect(() => {
    loadClasses();
  }, [loadClasses]);

  useEffect(() => {
    if (selectedClassId) {
      loadClassDetails(selectedClassId);
    }
  }, [selectedClassId, loadClassDetails]);

  const selectedClass = classes.find((c) => c.id === selectedClassId) || null;

  async function handleCreateClass(e) {
    e.preventDefault();
    if (!newClassName.trim()) return;
    const { ok, data } = await teacherFetch("/api/teacher/classes", {
      method: "POST",
      body: JSON.stringify({
        name: newClassName.trim(),
        grade: newClassGrade,
        description: newClassDesc.trim(),
      }),
    });
    if (ok && data.classroom) {
      showToast(`Đã tạo lớp "${data.classroom.name}" (Mã mời: ${data.classroom.invite_code})`);
      setNewClassName("");
      setNewClassDesc("");
      await loadClasses();
      setSelectedClassId(data.classroom.id);
    } else {
      showToast(data.detail || "Không thể tạo lớp học.", true);
    }
  }

  async function handleInviteStudents(e) {
    e.preventDefault();
    if (!selectedClassId || !inviteInput.trim()) return;
    const { ok, data } = await teacherFetch(`/api/teacher/classes/${selectedClassId}/invite`, {
      method: "POST",
      body: JSON.stringify({ identifiers: inviteInput }),
    });
    if (ok) {
      const invitedCount = (data.invited || []).length;
      const notFoundCount = (data.not_found || []).length;
      showToast(
        `Đã gửi lời mời tới ${invitedCount} học sinh` +
          (notFoundCount > 0 ? ` (Không tìm thấy: ${data.not_found.join(", ")})` : "")
      );
      setInviteInput("");
      await loadClassDetails(selectedClassId);
      await loadClasses();
    } else {
      showToast(data.detail || "Lỗi khi mời học sinh.", true);
    }
  }

  async function handleRegenerateCode() {
    if (!selectedClassId) return;
    const { ok, data } = await teacherFetch(`/api/teacher/classes/${selectedClassId}/invite`, {
      method: "POST",
      body: JSON.stringify({ regenerate_code: true }),
    });
    if (ok) {
      showToast(`Mã mời mới: ${data.invite_code}`);
      await loadClasses();
    }
  }

  async function handleRemoveStudent(studentId, name) {
    if (!selectedClassId) return;
    const { ok } = await teacherFetch(
      `/api/teacher/classes/${selectedClassId}/members/${studentId}`,
      { method: "DELETE" }
    );
    if (ok) {
      showToast(`Đã xóa ${name} khỏi lớp.`);
      await loadClassDetails(selectedClassId);
      await loadClasses();
    }
  }

  async function handleCreateAssignment(e) {
    e.preventDefault();
    if (!selectedClassId || !assignTitle.trim()) {
      showToast("Vui lòng chọn lớp và nhập tiêu đề bài tập.", true);
      return;
    }
    const { ok, data } = await teacherFetch(
      `/api/teacher/classes/${selectedClassId}/assignments`,
      {
        method: "POST",
        body: JSON.stringify({
          title: assignTitle.trim(),
          instructions: assignInstructions.trim(),
          source_type: assignSourceType,
          source_ref: { questions },
          due_at: assignDueAt ? new Date(assignDueAt).toISOString() : null,
          time_limit_min: Number(assignTimeLimit) || 45,
          max_attempts: Number(assignMaxAttempts) || 1,
          allow_ai_hint: assignAllowHint,
        }),
      }
    );
    if (ok) {
      showToast(`Đã giao bài tập "${assignTitle}" cho lớp!`);
      setAssignTitle("");
      setAssignInstructions("");
      await loadClassDetails(selectedClassId);
      await loadClasses();
    } else {
      showToast(data.detail || "Không thể giao bài tập.", true);
    }
  }

  async function handleDeleteAssignment(assignmentId) {
    if (!selectedClassId) return;
    const { ok } = await teacherFetch(
      `/api/teacher/classes/${selectedClassId}/assignments/${assignmentId}`,
      { method: "DELETE" }
    );
    if (ok) {
      showToast("Đã xóa bài tập.");
      await loadClassDetails(selectedClassId);
      await loadClasses();
    }
  }

  function addBlankQuestion() {
    const idx = questions.length + 1;
    setQuestions([
      ...questions,
      {
        id: `q-${idx}`,
        topic: "Đại số",
        question: "",
        options: [
          { id: "a", text_vi: "" },
          { id: "b", text_vi: "" },
          { id: "c", text_vi: "" },
          { id: "d", text_vi: "" },
        ],
        correct_answer: "a",
        explanation: "",
      },
    ]);
  }

  function updateQuestion(idx, patch) {
    setQuestions((prev) => prev.map((q, i) => (i === idx ? { ...q, ...patch } : q)));
  }

  function updateOption(qIdx, optIdx, textVal) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIdx) return q;
        const nextOpts = (q.options || []).map((o, oi) =>
          oi === optIdx ? { ...o, text_vi: textVal } : o
        );
        return { ...q, options: nextOpts };
      })
    );
  }

  function copyInviteText(text, label) {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      showToast(`Đã sao chép ${label}: ${text}`);
    }
  }

  return (
    <div style={{ minHeight: "100vh", background: "#0b0f19", color: "#e2e8f0", padding: "28px 24px" }}>
      <div style={{ maxWidth: 1220, margin: "0 auto" }}>
        {/* Header */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 16,
            paddingBottom: 20,
            borderBottom: "1px solid #1e293b",
            marginBottom: 24,
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <span
                style={{
                  background: "rgba(56, 189, 248, 0.16)",
                  border: "1px solid #38bdf8",
                  color: "#38bdf8",
                  padding: "3px 10px",
                  borderRadius: 999,
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                👩‍🏫 BẢNG ĐIỀU KHIỂN GIÁO VIÊN
              </span>
              {user?.role === "admin" && (
                <Link
                  href="/admin"
                  style={{ fontSize: 12, color: "#f59e0b", textDecoration: "underline" }}
                >
                  ← Quay lại Admin Panel
                </Link>
              )}
            </div>
            <h1 style={{ fontSize: 26, fontWeight: 800, margin: "8px 0 4px", color: "#f8fafc" }}>
              Quản Lý Lớp Học & Giao Bài Tập
            </h1>
            <p style={{ margin: 0, fontSize: 13.5, color: "#94a3b8" }}>
              Tạo lớp học, mời học sinh qua mã 6 ký tự, giao bài tập về nhà và theo dõi các chuyên đề cả lớp hay sai.
            </p>
          </div>

          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
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
              🤖 Gia sư AI DuoMCB
            </Link>
            <Link
              href="/classes"
              style={{
                padding: "9px 14px",
                borderRadius: 10,
                background: "#1e293b",
                color: "#a7f3d0",
                border: "1px solid #334155",
                fontSize: 13,
                fontWeight: 600,
                textDecoration: "none",
              }}
            >
              🎒 Giao diện Học sinh
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

        {/* Class selector bar + Tabs */}
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "space-between",
            alignItems: "center",
            gap: 14,
            marginBottom: 22,
          }}
        >
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {[
              { id: "classes", label: "🏫 1. Lớp học & Học sinh" },
              { id: "assignments", label: "📝 2. Giao bài tập & Đề thi" },
              { id: "analytics", label: "📊 3. Thống kê & Sổ điểm" },
            ].map((t) => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                style={{
                  padding: "10px 18px",
                  borderRadius: 10,
                  border: activeTab === t.id ? "1px solid #38bdf8" : "1px solid #1e293b",
                  background: activeTab === t.id ? "rgba(56, 189, 248, 0.16)" : "#111827",
                  color: activeTab === t.id ? "#38bdf8" : "#94a3b8",
                  fontWeight: 700,
                  fontSize: 13.5,
                  cursor: "pointer",
                }}
              >
                {t.label}
              </button>
            ))}
          </div>

          {classes.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <span style={{ fontSize: 13, color: "#94a3b8" }}>Lớp đang chọn:</span>
              <select
                value={selectedClassId || ""}
                onChange={(e) => setSelectedClassId(Number(e.target.value))}
                style={{
                  padding: "8px 12px",
                  borderRadius: 8,
                  background: "#1e293b",
                  color: "#f8fafc",
                  border: "1px solid #38bdf8",
                  fontWeight: 700,
                  fontSize: 13.5,
                }}
              >
                {classes.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.grade}) — Mã: {c.invite_code}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* TAB 1: CLASSES & STUDENTS */}
        {activeTab === "classes" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: 20 }}>
            {/* Left column: Create class + Class list */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <form
                onSubmit={handleCreateClass}
                style={{
                  background: "#111827",
                  border: "1px solid #1e293b",
                  borderRadius: 14,
                  padding: 20,
                }}
              >
                <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                  ➕ Tạo lớp học mới
                </h3>
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  <input
                    type="text"
                    placeholder="Tên lớp (VD: Toán 12A1 — Ôn thi THPT QG)"
                    value={newClassName}
                    onChange={(e) => setNewClassName(e.target.value)}
                    required
                    style={{
                      padding: "10px 12px",
                      borderRadius: 8,
                      border: "1px solid #334155",
                      background: "#0b0f19",
                      color: "#f8fafc",
                      fontSize: 13.5,
                    }}
                  />
                  <div style={{ display: "flex", gap: 10 }}>
                    <select
                      value={newClassGrade}
                      onChange={(e) => setNewClassGrade(e.target.value)}
                      style={{
                        padding: "10px 12px",
                        borderRadius: 8,
                        border: "1px solid #334155",
                        background: "#0b0f19",
                        color: "#f8fafc",
                        fontSize: 13.5,
                        flex: 1,
                      }}
                    >
                      {["Lớp 6", "Lớp 7", "Lớp 8", "Lớp 9", "Lớp 10", "Lớp 11", "Lớp 12"].map(
                        (g) => (
                          <option key={g} value={g}>
                            {g}
                          </option>
                        )
                      )}
                    </select>
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
                      Tạo lớp
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Mô tả ngắn (lịch học, mục tiêu lớp...)"
                    value={newClassDesc}
                    onChange={(e) => setNewClassDesc(e.target.value)}
                    style={{
                      padding: "9px 12px",
                      borderRadius: 8,
                      border: "1px solid #334155",
                      background: "#0b0f19",
                      color: "#cbd5e1",
                      fontSize: 13,
                    }}
                  />
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
                  📋 Danh sách lớp của tôi ({classes.length})
                </h3>
                {loading ? (
                  <p style={{ color: "#64748b", fontSize: 13 }}>Đang tải danh sách lớp...</p>
                ) : classes.length === 0 ? (
                  <p style={{ color: "#64748b", fontSize: 13 }}>
                    Bạn chưa có lớp học nào. Hãy tạo lớp đầu tiên ở khung phía trên!
                  </p>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {classes.map((c) => {
                      const isSel = c.id === selectedClassId;
                      return (
                        <div
                          key={c.id}
                          onClick={() => setSelectedClassId(c.id)}
                          style={{
                            padding: 14,
                            borderRadius: 10,
                            border: isSel ? "1px solid #38bdf8" : "1px solid #1e293b",
                            background: isSel ? "rgba(56, 189, 248, 0.08)" : "#0b0f19",
                            cursor: "pointer",
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontWeight: 700, fontSize: 14.5, color: "#f8fafc" }}>
                                {c.name}{" "}
                                <span style={{ fontSize: 12, color: "#38bdf8", fontWeight: 600 }}>
                                  ({c.grade})
                                </span>
                              </div>
                              <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                                👨‍🎓 {c.member_count} học sinh • 📝 {c.assignment_count} bài tập • 📩{" "}
                                {c.invited_count} lời mời chờ
                              </div>
                            </div>
                            <div style={{ textAlign: "right" }}>
                              <div
                                style={{
                                  fontFamily: "monospace",
                                  fontSize: 14,
                                  fontWeight: 800,
                                  color: "#facc15",
                                  background: "rgba(250, 204, 21, 0.12)",
                                  padding: "4px 8px",
                                  borderRadius: 6,
                                  border: "1px solid rgba(250, 204, 21, 0.35)",
                                }}
                              >
                                {c.invite_code}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* Right column: Selected class invite + Student roster */}
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              {selectedClass ? (
                <>
                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #1e293b",
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        flexWrap: "wrap",
                        gap: 10,
                        marginBottom: 14,
                      }}
                    >
                      <div>
                        <h3 style={{ margin: 0, fontSize: 16, color: "#f8fafc" }}>
                          🔑 Mã mời lớp: <span style={{ color: "#facc15" }}>{selectedClass.invite_code}</span>
                        </h3>
                        <p style={{ margin: "4px 0 0", fontSize: 12.5, color: "#94a3b8" }}>
                          Học sinh nhập mã này tại trang Lớp học hoặc bấm vào link mời.
                        </p>
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <button
                          type="button"
                          onClick={() => copyInviteText(selectedClass.invite_code, "mã lớp")}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: "1px solid #334155",
                            background: "#1e293b",
                            color: "#e2e8f0",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          📋 Copy Mã
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            const origin = typeof window !== "undefined" ? window.location.origin : "";
                            copyInviteText(`${origin}/classes?join=${selectedClass.invite_code}`, "link mời");
                          }}
                          style={{
                            padding: "7px 12px",
                            borderRadius: 8,
                            border: "1px solid #38bdf8",
                            background: "rgba(56, 189, 248, 0.14)",
                            color: "#38bdf8",
                            fontSize: 12,
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          🔗 Copy Link
                        </button>
                        <button
                          type="button"
                          onClick={handleRegenerateCode}
                          style={{
                            padding: "7px 10px",
                            borderRadius: 8,
                            border: "1px solid #334155",
                            background: "transparent",
                            color: "#94a3b8",
                            fontSize: 12,
                            cursor: "pointer",
                          }}
                        >
                          🔄 Đổi mã
                        </button>
                      </div>
                    </div>

                    <form onSubmit={handleInviteStudents} style={{ display: "flex", gap: 8 }}>
                      <input
                        type="text"
                        placeholder="Nhập email hoặc username học sinh (cách nhau bởi dấu phẩy)..."
                        value={inviteInput}
                        onChange={(e) => setInviteInput(e.target.value)}
                        style={{
                          flex: 1,
                          padding: "9px 12px",
                          borderRadius: 8,
                          border: "1px solid #334155",
                          background: "#0b0f19",
                          color: "#f8fafc",
                          fontSize: 13,
                        }}
                      />
                      <button
                        type="submit"
                        style={{
                          padding: "9px 16px",
                          borderRadius: 8,
                          border: "none",
                          background: "#10b981",
                          color: "#052e16",
                          fontWeight: 700,
                          fontSize: 13,
                          cursor: "pointer",
                        }}
                      >
                        Mời vào lớp
                      </button>
                    </form>
                  </div>

                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #1e293b",
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <h3 style={{ margin: "0 0 12px", fontSize: 16, color: "#f8fafc" }}>
                      👨‍🎓 Danh sách học sinh ({members.length})
                    </h3>
                    {members.length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        Chưa có học sinh nào trong lớp. Hãy chia sẻ mã mời{" "}
                        <strong style={{ color: "#facc15" }}>{selectedClass.invite_code}</strong> hoặc mời trực tiếp bằng email/username.
                      </p>
                    ) : (
                      <div style={{ overflowX: "auto" }}>
                        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                          <thead>
                            <tr style={{ borderBottom: "1px solid #1e293b", color: "#94a3b8", textAlign: "left" }}>
                              <th style={{ padding: "8px 6px" }}>Học sinh</th>
                              <th style={{ padding: "8px 6px" }}>Trạng thái</th>
                              <th style={{ padding: "8px 6px" }}>Bài đã nộp</th>
                              <th style={{ padding: "8px 6px" }}>Điểm TB</th>
                              <th style={{ padding: "8px 6px" }}></th>
                            </tr>
                          </thead>
                          <tbody>
                            {members.map((m) => (
                              <tr key={m.student_id} style={{ borderBottom: "1px solid #1e293b" }}>
                                <td style={{ padding: "9px 6px" }}>
                                  <div style={{ fontWeight: 600, color: "#f8fafc" }}>
                                    {m.display_name || m.username}
                                  </div>
                                  <div style={{ fontSize: 11.5, color: "#64748b" }}>{m.email}</div>
                                </td>
                                <td style={{ padding: "9px 6px" }}>
                                  <span
                                    style={{
                                      padding: "2px 8px",
                                      borderRadius: 999,
                                      fontSize: 11.5,
                                      fontWeight: 600,
                                      background:
                                        m.status === "active"
                                          ? "rgba(34, 197, 94, 0.16)"
                                          : "rgba(245, 158, 11, 0.16)",
                                      color: m.status === "active" ? "#4ade80" : "#fbbf24",
                                    }}
                                  >
                                    {m.status === "active" ? "Đang học" : "Chờ xác nhận"}
                                  </span>
                                </td>
                                <td style={{ padding: "9px 6px", color: "#cbd5e1" }}>
                                  {m.submitted_count || 0}
                                </td>
                                <td style={{ padding: "9px 6px", fontWeight: 700, color: "#38bdf8" }}>
                                  {m.avg_score != null ? `${m.avg_score}/10` : "—"}
                                </td>
                                <td style={{ padding: "9px 6px", textAlign: "right" }}>
                                  <button
                                    type="button"
                                    onClick={() =>
                                      handleRemoveStudent(m.student_id, m.display_name || m.username)
                                    }
                                    style={{
                                      background: "transparent",
                                      border: "1px solid #ef4444",
                                      color: "#f87171",
                                      borderRadius: 6,
                                      padding: "3px 8px",
                                      fontSize: 11.5,
                                      cursor: "pointer",
                                    }}
                                  >
                                    Xóa
                                  </button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #1e293b",
                    borderRadius: 14,
                    padding: 24,
                    color: "#64748b",
                  }}
                >
                  Hãy chọn hoặc tạo một lớp học ở cột bên trái để quản lý học sinh.
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: ASSIGNMENTS */}
        {activeTab === "assignments" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 20 }}>
            <form
              onSubmit={handleCreateAssignment}
              style={{
                background: "#111827",
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                📝 Giao bài tập / Đề kiểm tra mới
              </h3>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                <input
                  type="text"
                  placeholder="Tiêu đề bài tập (VD: Bài tập chương 1 — Hàm số & Cực trị)"
                  value={assignTitle}
                  onChange={(e) => setAssignTitle(e.target.value)}
                  required
                  style={{
                    padding: "10px 12px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0b0f19",
                    color: "#f8fafc",
                    fontSize: 13.5,
                  }}
                />
                <textarea
                  rows={2}
                  placeholder="Hướng dẫn làm bài cho học sinh..."
                  value={assignInstructions}
                  onChange={(e) => setAssignInstructions(e.target.value)}
                  style={{
                    padding: "9px 12px",
                    borderRadius: 8,
                    border: "1px solid #334155",
                    background: "#0b0f19",
                    color: "#cbd5e1",
                    fontSize: 13,
                  }}
                />
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                      Loại nguồn đề
                    </label>
                    <select
                      value={assignSourceType}
                      onChange={(e) => setAssignSourceType(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #334155",
                        background: "#0b0f19",
                        color: "#f8fafc",
                        fontSize: 13,
                      }}
                    >
                      <option value="custom_quiz">Bộ câu hỏi tự chọn</option>
                      <option value="thpt_test">Ngân hàng đề THPT</option>
                      <option value="thcs_test">Ngân hàng đề THCS</option>
                      <option value="vnhsge">Đề chuẩn THPT Quốc gia</option>
                      <option value="ai_test">Đề tự luyện AI</option>
                    </select>
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                      Hạn nộp
                    </label>
                    <input
                      type="datetime-local"
                      value={assignDueAt}
                      onChange={(e) => setAssignDueAt(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #334155",
                        background: "#0b0f19",
                        color: "#f8fafc",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                      Thời gian làm bài (phút)
                    </label>
                    <input
                      type="number"
                      min={5}
                      max={180}
                      value={assignTimeLimit}
                      onChange={(e) => setAssignTimeLimit(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #334155",
                        background: "#0b0f19",
                        color: "#f8fafc",
                        fontSize: 13,
                      }}
                    />
                  </div>
                  <div>
                    <label style={{ fontSize: 12, color: "#94a3b8", display: "block", marginBottom: 4 }}>
                      Số lượt nộp tối đa
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={10}
                      value={assignMaxAttempts}
                      onChange={(e) => setAssignMaxAttempts(e.target.value)}
                      style={{
                        width: "100%",
                        padding: "8px 10px",
                        borderRadius: 8,
                        border: "1px solid #334155",
                        background: "#0b0f19",
                        color: "#f8fafc",
                        fontSize: 13,
                      }}
                    />
                  </div>
                </div>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    fontSize: 13,
                    color: "#bae6fd",
                    cursor: "pointer",
                  }}
                >
                  <input
                    type="checkbox"
                    checked={assignAllowHint}
                    onChange={(e) => setAssignAllowHint(e.target.checked)}
                  />
                  💡 Cho phép học sinh bật gợi ý từng bước (Socratic Mode) khi làm bài
                </label>

                {/* Question Builder */}
                <div
                  style={{
                    borderTop: "1px solid #1e293b",
                    paddingTop: 12,
                    marginTop: 4,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: 10,
                    }}
                  >
                    <span style={{ fontSize: 13, fontWeight: 700, color: "#f8fafc" }}>
                      Danh sách câu hỏi ({questions.length} câu)
                    </span>
                    <button
                      type="button"
                      onClick={addBlankQuestion}
                      style={{
                        padding: "5px 10px",
                        borderRadius: 6,
                        border: "1px solid #38bdf8",
                        background: "rgba(56, 189, 248, 0.12)",
                        color: "#38bdf8",
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      + Thêm câu hỏi
                    </button>
                  </div>

                  <div style={{ display: "flex", flexDirection: "column", gap: 10, maxHeight: 340, overflowY: "auto" }}>
                    {questions.map((q, qIdx) => (
                      <div
                        key={q.id || qIdx}
                        style={{
                          padding: 12,
                          borderRadius: 8,
                          background: "#0b0f19",
                          border: "1px solid #1e293b",
                        }}
                      >
                        <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                          <input
                            type="text"
                            placeholder="Chuyên đề (VD: Hàm số)"
                            value={q.topic}
                            onChange={(e) => updateQuestion(qIdx, { topic: e.target.value })}
                            style={{
                              width: 140,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #334155",
                              background: "#111827",
                              color: "#38bdf8",
                              fontSize: 12,
                            }}
                          />
                          <input
                            type="text"
                            placeholder={`Nội dung câu ${qIdx + 1}...`}
                            value={q.question}
                            onChange={(e) => updateQuestion(qIdx, { question: e.target.value })}
                            style={{
                              flex: 1,
                              padding: "6px 8px",
                              borderRadius: 6,
                              border: "1px solid #334155",
                              background: "#111827",
                              color: "#f8fafc",
                              fontSize: 12.5,
                            }}
                          />
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 6, marginBottom: 6 }}>
                          {(q.options || []).map((opt, optIdx) => (
                            <input
                              key={opt.id}
                              type="text"
                              placeholder={`Đáp án ${opt.id.toUpperCase()}`}
                              value={opt.text_vi}
                              onChange={(e) => updateOption(qIdx, optIdx, e.target.value)}
                              style={{
                                padding: "5px 8px",
                                borderRadius: 6,
                                border: "1px solid #1e293b",
                                background: "#111827",
                                color: "#cbd5e1",
                                fontSize: 12,
                              }}
                            />
                          ))}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <label style={{ fontSize: 12, color: "#94a3b8" }}>
                            Đáp án đúng:{" "}
                            <select
                              value={q.correct_answer}
                              onChange={(e) => updateQuestion(qIdx, { correct_answer: e.target.value })}
                              style={{
                                background: "#111827",
                                color: "#4ade80",
                                border: "1px solid #334155",
                                borderRadius: 4,
                                padding: "2px 6px",
                              }}
                            >
                              <option value="a">A</option>
                              <option value="b">B</option>
                              <option value="c">C</option>
                              <option value="d">D</option>
                            </select>
                          </label>
                          {questions.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setQuestions(questions.filter((_, i) => i !== qIdx))}
                              style={{
                                background: "transparent",
                                border: "none",
                                color: "#f87171",
                                fontSize: 11.5,
                                cursor: "pointer",
                              }}
                            >
                              Xóa câu này
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <button
                  type="submit"
                  style={{
                    padding: "11px 18px",
                    borderRadius: 10,
                    border: "none",
                    background: "#0284c7",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: 14,
                    cursor: "pointer",
                  }}
                >
                  🚀 Giao bài tập cho lớp
                </button>
              </div>
            </form>

            {/* Existing Assignments */}
            <div
              style={{
                background: "#111827",
                border: "1px solid #1e293b",
                borderRadius: 14,
                padding: 20,
              }}
            >
              <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                📚 Bài tập đã giao ({assignments.length})
              </h3>
              {assignments.length === 0 ? (
                <p style={{ color: "#64748b", fontSize: 13 }}>
                  Lớp này chưa có bài tập nào. Hãy tạo bài tập ở khung bên trái!
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                  {assignments.map((a) => (
                    <div
                      key={a.id}
                      style={{
                        padding: 14,
                        borderRadius: 10,
                        background: "#0b0f19",
                        border: "1px solid #1e293b",
                      }}
                    >
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14.5, color: "#f8fafc" }}>{a.title}</div>
                          <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>
                            ⏱ {a.time_limit_min} phút • 🔢 {a.question_count || 0} câu • Tối đa{" "}
                            {a.max_attempts} lượt
                          </div>
                          {a.due_at && (
                            <div style={{ fontSize: 12, color: "#fbbf24", marginTop: 4 }}>
                              📅 Hạn nộp: {new Date(a.due_at).toLocaleString("vi-VN")}
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(a.id)}
                          style={{
                            background: "transparent",
                            border: "1px solid #ef4444",
                            color: "#f87171",
                            borderRadius: 6,
                            padding: "4px 8px",
                            fontSize: 11.5,
                            cursor: "pointer",
                          }}
                        >
                          Xóa
                        </button>
                      </div>
                      <div
                        style={{
                          marginTop: 10,
                          paddingTop: 8,
                          borderTop: "1px solid #1e293b",
                          display: "flex",
                          justifyContent: "space-between",
                          fontSize: 12.5,
                        }}
                      >
                        <span style={{ color: "#86efac" }}>
                          ✅ Đã nộp: {a.submitted_students || 0} học sinh
                        </span>
                        <span style={{ color: "#38bdf8", fontWeight: 700 }}>
                          Điểm TB: {a.avg_score != null ? `${a.avg_score}/10` : "Chưa có"}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 3: ANALYTICS & GRADEBOOK */}
        {activeTab === "analytics" && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            {!analytics ? (
              <p style={{ color: "#64748b" }}>Đang tải dữ liệu thống kê lớp học...</p>
            ) : (
              <>
                {/* Top Summary Cards */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                    gap: 14,
                  }}
                >
                  {[
                    {
                      label: "Sĩ số đang học",
                      val: analytics.summary?.active_students || 0,
                      color: "#38bdf8",
                    },
                    {
                      label: "Nộp bài đúng hạn",
                      val: analytics.summary?.on_time_students || 0,
                      color: "#4ade80",
                    },
                    {
                      label: "Nộp muộn",
                      val: analytics.summary?.late_students || 0,
                      color: "#fbbf24",
                    },
                    {
                      label: "Chưa nộp bài",
                      val: analytics.summary?.missing_students || 0,
                      color: "#f87171",
                    },
                  ].map((card, i) => (
                    <div
                      key={i}
                      style={{
                        background: "#111827",
                        border: "1px solid #1e293b",
                        borderRadius: 12,
                        padding: 16,
                      }}
                    >
                      <div style={{ fontSize: 12.5, color: "#94a3b8" }}>{card.label}</div>
                      <div style={{ fontSize: 26, fontWeight: 800, color: card.color, marginTop: 4 }}>
                        {card.val}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Score distribution + Top Wrong Topics */}
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))",
                    gap: 20,
                  }}
                >
                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #1e293b",
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                      📊 Phân phối điểm số của lớp
                    </h3>
                    {[
                      { key: "8_10", label: "Giỏi (8.0 – 10)", color: "#22c55e" },
                      { key: "65_8", label: "Khá (6.5 – 7.9)", color: "#38bdf8" },
                      { key: "4_65", label: "Trung bình (4.0 – 6.4)", color: "#f59e0b" },
                      { key: "0_4", label: "Cần kèm thêm (< 4.0)", color: "#ef4444" },
                    ].map((b) => {
                      const count = analytics.score_distribution?.[b.key] || 0;
                      const total = Math.max(1, analytics.summary?.total_submissions || 1);
                      const pct = Math.round((count / total) * 100);
                      return (
                        <div key={b.key} style={{ marginBottom: 12 }}>
                          <div
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              fontSize: 12.5,
                              marginBottom: 4,
                            }}
                          >
                            <span>{b.label}</span>
                            <span style={{ fontWeight: 700, color: b.color }}>
                              {count} lượt ({pct}%)
                            </span>
                          </div>
                          <div
                            style={{
                              height: 8,
                              borderRadius: 999,
                              background: "#0b0f19",
                              overflow: "hidden",
                            }}
                          >
                            <div
                              style={{
                                width: `${pct}%`,
                                height: "100%",
                                background: b.color,
                                borderRadius: 999,
                              }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  <div
                    style={{
                      background: "#111827",
                      border: "1px solid #1e293b",
                      borderRadius: 14,
                      padding: 20,
                    }}
                  >
                    <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                      🔥 Top 5 chủ đề cả lớp hay sai nhất
                    </h3>
                    {(analytics.top_wrong_topics || []).length === 0 ? (
                      <p style={{ color: "#64748b", fontSize: 13 }}>
                        Chưa ghi nhận chủ đề sai nhiều từ các bài nộp của lớp.
                      </p>
                    ) : (
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {analytics.top_wrong_topics.map((wt, idx) => (
                          <div
                            key={wt.topic}
                            style={{
                              display: "flex",
                              justifyContent: "space-between",
                              alignItems: "center",
                              padding: "10px 12px",
                              borderRadius: 8,
                              background: "#0b0f19",
                              border: "1px solid #1e293b",
                            }}
                          >
                            <div>
                              <span style={{ color: "#f87171", fontWeight: 800, marginRight: 8 }}>
                                #{idx + 1}
                              </span>
                              <span style={{ fontWeight: 600, color: "#f8fafc", fontSize: 13.5 }}>
                                {wt.topic}
                              </span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <span style={{ fontSize: 12, color: "#fca5a5" }}>
                                {wt.wrong_count} lượt sai
                              </span>
                              <Link
                                href={`/duomcb?q=${encodeURIComponent(
                                  `Soạn 3 bài tập chữa lỗi sai phổ biến về chuyên đề: ${wt.topic}`
                                )}`}
                                style={{
                                  fontSize: 11.5,
                                  color: "#38bdf8",
                                  textDecoration: "none",
                                  border: "1px solid #38bdf8",
                                  padding: "3px 8px",
                                  borderRadius: 6,
                                }}
                              >
                                🤖 Soạn bài chữa
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Gradebook Table */}
                <div
                  style={{
                    background: "#111827",
                    border: "1px solid #1e293b",
                    borderRadius: 14,
                    padding: 20,
                  }}
                >
                  <h3 style={{ margin: "0 0 14px", fontSize: 16, color: "#f8fafc" }}>
                    📖 Sổ điểm chi tiết từng học sinh
                  </h3>
                  {(analytics.gradebook || []).length === 0 ? (
                    <p style={{ color: "#64748b", fontSize: 13 }}>Chưa có học sinh hoạt động trong lớp.</p>
                  ) : (
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                        <thead>
                          <tr style={{ borderBottom: "1px solid #1e293b", color: "#94a3b8", textAlign: "left" }}>
                            <th style={{ padding: "8px 6px" }}>Học sinh</th>
                            <th style={{ padding: "8px 6px" }}>Khối</th>
                            <th style={{ padding: "8px 6px" }}>Tiến độ nộp bài</th>
                            <th style={{ padding: "8px 6px" }}>Điểm trung bình</th>
                            <th style={{ padding: "8px 6px" }}>Trạng thái</th>
                          </tr>
                        </thead>
                        <tbody>
                          {analytics.gradebook.map((g) => (
                            <tr key={g.student_id} style={{ borderBottom: "1px solid #1e293b" }}>
                              <td style={{ padding: "10px 6px", fontWeight: 600, color: "#f8fafc" }}>
                                {g.display_name}
                              </td>
                              <td style={{ padding: "10px 6px", color: "#94a3b8" }}>{g.grade || "—"}</td>
                              <td style={{ padding: "10px 6px", color: "#cbd5e1" }}>
                                {g.submitted_count}/{g.total_assignments} bài
                              </td>
                              <td style={{ padding: "10px 6px", fontWeight: 800, color: "#38bdf8" }}>
                                {g.avg_score != null ? `${g.avg_score}/10` : "—"}
                              </td>
                              <td style={{ padding: "10px 6px" }}>
                                <span
                                  style={{
                                    padding: "3px 9px",
                                    borderRadius: 999,
                                    fontSize: 11.5,
                                    fontWeight: 600,
                                    background:
                                      g.status === "submitted"
                                        ? "rgba(34, 197, 94, 0.16)"
                                        : g.status === "late"
                                        ? "rgba(245, 158, 11, 0.16)"
                                        : "rgba(239, 68, 68, 0.16)",
                                    color:
                                      g.status === "submitted"
                                        ? "#4ade80"
                                        : g.status === "late"
                                        ? "#fbbf24"
                                        : "#f87171",
                                  }}
                                >
                                  {g.status === "submitted"
                                    ? "Đúng hạn"
                                    : g.status === "late"
                                    ? "Nộp muộn"
                                    : "Chưa nộp"}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
