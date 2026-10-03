"use client";

// frontend/src/app/nganhangde/page.js
//
// Phase 4 (integration-guide item 2.8) — the VNHSGE question bank ("Ngân hàng
// đề THPT"), backed by /api/exam/vnhsge/*.
//
// Two things this page is careful about:
//   1. The credit line from the bank's own rows (source + licence + attribution)
//      is always on screen. The import script refuses to write without one, and
//      showing it here is what keeps that promise to the data's authors.
//   2. An empty bank is a normal state, not an error: it explains how to load a
//      dump instead of pretending to be broken. The sample shipped with the repo
//      is DuoMath's own content, so the page is never empty for no reason.
//
// Public on purpose (no login): it is static study material, not per-user data.

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { resolveApiBase } from "@/lib/apiBase";

const PAGE_SIZE = 10;
const QUIZ_SIZE = 5;
const LETTERS = ["A", "B", "C", "D"];

/** The base URL is resolved per call (never at module load) — see lib/apiBase.js. */
async function apiGet(path) {
  const res = await fetch(`${resolveApiBase()}${path}`);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.detail || `HTTP ${res.status}`);
  return data;
}

export default function QuestionBankPage() {
  const [meta, setMeta] = useState(null);
  const [notice, setNotice] = useState("");
  const [subject, setSubject] = useState("");
  const [items, setItems] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [revealed, setRevealed] = useState({});
  const [mode, setMode] = useState("browse"); // browse | practice
  const [quiz, setQuiz] = useState({ questions: [], picked: {} });
  const [quizBusy, setQuizBusy] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await apiGet("/api/exam/vnhsge/meta");
        if (!cancelled) setMeta(data);
      } catch (err) {
        if (!cancelled) setNotice(`Không tải được thông tin ngân hàng đề: ${err.message}`);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const loadQuestions = useCallback(async (slug, offset) => {
    setLoading(true);
    try {
      const query = new URLSearchParams({ limit: String(PAGE_SIZE), offset: String(offset) });
      if (slug) query.set("subject", slug);
      const data = await apiGet(`/api/exam/vnhsge/questions?${query.toString()}`);
      setTotal(data.total);
      setItems((prev) => (offset === 0 ? data.questions : [...prev, ...data.questions]));
      setNotice("");
    } catch (err) {
      setNotice(`Không tải được câu hỏi: ${err.message}`);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    setRevealed({});
    loadQuestions(subject, 0);
  }, [subject, loadQuestions]);

  // Practice mode asks for the answers ON PURPOSE: the page grades locally and
  // only shows the key after the student commits to a choice. It is a study
  // tool, not an exam server.
  const startQuiz = async () => {
    setQuizBusy(true);
    try {
      const query = new URLSearchParams({ count: String(QUIZ_SIZE), with_answers: "true" });
      if (subject) query.set("subject", subject);
      const data = await apiGet(`/api/exam/vnhsge/random?${query.toString()}`);
      if (data.questions.length === 0) {
        setNotice("Ngân hàng chưa có câu hỏi cho môn này — hãy nhập dữ liệu trước (xem gợi ý bên dưới).");
      } else {
        setQuiz({ questions: data.questions, picked: {} });
        setMode("practice");
        setNotice("");
      }
    } catch (err) {
      setNotice(`Không tạo được đề luyện tập: ${err.message}`);
    } finally {
      setQuizBusy(false);
    }
  };

  const pickAnswer = (questionId, index) =>
    setQuiz((prev) => ({ ...prev, picked: { ...prev.picked, [questionId]: index } }));

  const answered = Object.keys(quiz.picked).length;
  const correct = quiz.questions.filter((q) => quiz.picked[q.id] === q.answer_index).length;

  const card = {
    border: "1px solid rgba(148,163,184,0.22)",
    background: "rgba(9,14,30,0.6)",
    borderRadius: 14,
    padding: 14,
    marginTop: 12,
  };
  const chip = (active) => ({
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 11px",
    borderRadius: 999,
    cursor: "pointer",
    color: active ? "#04101f" : "#cbd5e1",
    background: active ? "linear-gradient(135deg,#67e8f9,#22d3ee)" : "rgba(30,41,59,0.7)",
    border: "1px solid rgba(148,163,184,0.25)",
  });
  const choiceRow = {
    fontSize: 13,
    padding: "7px 10px",
    borderRadius: 9,
    background: "rgba(30,41,59,0.5)",
    border: "1px solid rgba(148,163,184,0.18)",
    color: "#dbeafe",
  };
  const choiceCorrect = { background: "rgba(16,185,129,0.18)", border: "1px solid rgba(16,185,129,0.55)", color: "#a7f3d0" };
  const choiceWrong = { background: "rgba(248,113,113,0.16)", border: "1px solid rgba(248,113,113,0.5)", color: "#fecaca" };
  const ghost = {
    marginTop: 10,
    fontSize: 12,
    fontWeight: 700,
    padding: "6px 10px",
    borderRadius: 9,
    cursor: "pointer",
    color: "#67e8f9",
    background: "rgba(30,41,59,0.6)",
    border: "1px solid rgba(148,163,184,0.25)",
  };

  return (
    <div style={{ minHeight: "100vh", background: "#05070f", color: "#e2e8f0", padding: "40px 18px" }}>
      <div style={{ maxWidth: 860, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
          <h1 style={{ fontSize: 24, fontWeight: 900, margin: 0 }}>📚 Ngân hàng đề THPT</h1>
          <div style={{ display: "flex", gap: 14, fontSize: 13 }}>
            <Link href="/khampha" style={{ color: "#67e8f9" }}>📈 Khám phá</Link>
            <Link href="/relearn" style={{ color: "#67e8f9" }}>🔁 Ôn tập</Link>
          </div>
        </div>
        <p style={{ color: "rgba(255,255,255,0.6)", fontSize: 13, marginTop: 6, lineHeight: 1.7 }}>
          Đề trắc nghiệm theo môn, lấy từ ngân hàng đề đã nhập bằng script (<code>import_vnhsge.py</code>).
          Em đọc câu hỏi, tự chọn đáp án trước khi xem đáp án đúng và lời giải.
        </p>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 14 }}>
          <button onClick={() => { setSubject(""); setMode("browse"); }} style={chip(subject === "" && mode === "browse")}>
            Tất cả{meta ? ` (${meta.total})` : ""}
          </button>
          {(meta?.subjects ?? []).filter((item) => item.count > 0).map((item) => (
            <button
              key={item.slug}
              onClick={() => { setSubject(item.slug); setMode("browse"); }}
              style={chip(subject === item.slug && mode === "browse")}
            >
              {item.label} ({item.count})
            </button>
          ))}
          <button
            onClick={startQuiz}
            disabled={quizBusy}
            style={{ ...chip(false), color: "#fde68a", background: "rgba(120,53,15,0.45)", border: "1px solid rgba(251,191,36,0.35)", cursor: quizBusy ? "wait" : "pointer" }}
          >
            🎯 Luyện tập {QUIZ_SIZE} câu{subject ? " theo môn" : ""}
          </button>
          {mode === "practice" && <button onClick={() => setMode("browse")} style={ghost}>← Về danh sách</button>}
        </div>

        {notice && (
          <div style={{ marginTop: 14, border: "1px solid rgba(251,191,36,0.45)", background: "rgba(120,53,15,0.3)", borderRadius: 10, padding: "8px 10px", fontSize: 12.5, color: "#fde68a" }}>
            {notice}
          </div>
        )}

        {mode === "practice" && quiz.questions.length > 0 && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 13, color: "rgba(226,232,240,0.8)" }}>
              Đã trả lời <b>{answered}/{quiz.questions.length}</b>
              {answered > 0 && <> · đúng <b style={{ color: "#86efac" }}>{correct}</b></>}
            </div>
            {quiz.questions.map((question, index) => {
              const picked = quiz.picked[question.id];
              const answeredThis = picked !== undefined;
              return (
                <div key={question.id} style={card}>
                  <div style={{ fontSize: 12, color: "rgba(148,163,184,0.9)", marginBottom: 6 }}>
                    Câu {index + 1} · {question.subject_label}
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, fontWeight: 600 }}>{question.question}</div>
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {question.choices.map((choice, choiceIndex) => {
                      const isAnswer = choiceIndex === question.answer_index;
                      const isPicked = picked === choiceIndex;
                      const extra = !answeredThis ? {} : isAnswer ? choiceCorrect : isPicked ? choiceWrong : { opacity: 0.5 };
                      return (
                        <button
                          key={choiceIndex}
                          disabled={answeredThis}
                          onClick={() => pickAnswer(question.id, choiceIndex)}
                          style={{ ...choiceRow, ...extra, textAlign: "left", cursor: answeredThis ? "default" : "pointer" }}
                        >
                          <b>{LETTERS[choiceIndex]}.</b>&nbsp;{choice}
                          {answeredThis && isAnswer ? "  ✓" : ""}
                          {answeredThis && isPicked && !isAnswer ? "  ✗" : ""}
                        </button>
                      );
                    })}
                  </div>
                  {answeredThis && question.explanation && (
                    <div style={{ marginTop: 8, fontSize: 12.5, color: "rgba(190,242,100,0.85)", lineHeight: 1.7 }}>
                      💡 {question.explanation}
                    </div>
                  )}
                </div>
              );
            })}
            {answered === quiz.questions.length && (
              <div style={{ ...card, borderColor: "rgba(34,211,238,0.4)" }}>
                <b>Kết quả: {correct}/{quiz.questions.length}</b>{" "}
                {correct === quiz.questions.length ? "— tuyệt đối! 🎉" : "— xem lại lời giải rồi làm đề khác nhé."}
                <div style={{ marginTop: 8 }}>
                  <button onClick={startQuiz} disabled={quizBusy} style={ghost}>🎯 Làm đề khác</button>
                </div>
              </div>
            )}
          </div>
        )}

        {mode === "browse" && (
          <div style={{ marginTop: 16 }}>
            {items.map((question, index) => {
              const open = Boolean(revealed[question.id]);
              return (
                <div key={question.id} style={card}>
                  <div style={{ fontSize: 12, color: "rgba(148,163,184,0.9)", marginBottom: 6 }}>
                    Câu {index + 1} · {question.subject_label}
                    {question.source ? ` · nguồn: ${question.source}` : ""}
                  </div>
                  <div style={{ fontSize: 14.5, lineHeight: 1.65, fontWeight: 600 }}>{question.question}</div>
                  <div style={{ display: "grid", gap: 6, marginTop: 10 }}>
                    {question.choices.map((choice, choiceIndex) => (
                      <div
                        key={choiceIndex}
                        style={{ ...choiceRow, ...(open && choiceIndex === question.answer_index ? choiceCorrect : {}) }}
                      >
                        <b>{LETTERS[choiceIndex]}.</b>&nbsp;{choice}
                        {open && choiceIndex === question.answer_index ? "  ✓" : ""}
                      </div>
                    ))}
                  </div>
                  {open && question.explanation && (
                    <div style={{ marginTop: 8, fontSize: 12.5, color: "rgba(190,242,100,0.85)", lineHeight: 1.7 }}>
                      💡 {question.explanation}
                    </div>
                  )}
                  <button
                    onClick={() => setRevealed((prev) => ({ ...prev, [question.id]: !prev[question.id] }))}
                    style={{ ...ghost, color: open ? "#cbd5e1" : "#67e8f9" }}
                  >
                    {open ? "Ẩn đáp án" : "Hiện đáp án"}
                  </button>
                </div>
              );
            })}

            {loading && <div style={{ marginTop: 12, fontSize: 13, color: "rgba(255,255,255,0.6)" }}>Đang tải câu hỏi…</div>}

            {!loading && items.length === 0 && total === 0 && (
              <div style={{ ...card, borderColor: "rgba(251,191,36,0.4)" }}>
                <b>Ngân hàng đang trống.</b> Đây là trạng thái bình thường trước khi nhập dữ liệu — nội dung không
                tự sinh ra. Nhập một tệp đề đã kiểm tra giấy phép bằng:
                <div style={{ marginTop: 8, fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace", fontSize: 12, color: "#a5f3fc", wordBreak: "break-word" }}>
                  {meta?.import_hint || "python backend/scripts/import_vnhsge.py --help"}
                </div>
                <div style={{ marginTop: 6, fontSize: 12.5, color: "rgba(226,232,240,0.7)" }}>
                  Bản mẫu có sẵn trong repo: <code>backend/data/vnhsge_sample.jsonl</code> (nội dung do BingMath tự soạn).
                </div>
              </div>
            )}

            {!loading && items.length > 0 && items.length < total && (
              <button onClick={() => loadQuestions(subject, items.length)} style={{ ...ghost, marginTop: 14 }}>
                Xem thêm ({items.length}/{total})
              </button>
            )}
          </div>
        )}

        <div style={{ marginTop: 24, fontSize: 12, color: "rgba(148,163,184,0.75)", lineHeight: 1.8, borderTop: "1px solid rgba(148,163,184,0.18)", paddingTop: 12 }}>
          {meta?.license_note ? <>📝 {meta.license_note}</> : "📝 Chưa có dòng ghi công (ngân hàng trống)."}
          <div style={{ marginTop: 4 }}>
            Dữ liệu đề được nhập bằng script và lưu trong cơ sở dữ liệu của máy chủ, không nằm trong mã nguồn.
          </div>
        </div>
      </div>
    </div>
  );
}
