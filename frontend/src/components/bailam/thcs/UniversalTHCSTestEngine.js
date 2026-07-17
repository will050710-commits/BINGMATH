/* eslint-disable react-hooks/exhaustive-deps */
/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, getTimeSpent } from "@/utils/testTimer";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { gradeTest } from "@/utils/grader";
import { useRouter } from "next/navigation";
import { THCS_TESTS_DATA } from "@/data/thcsTestsData";

export default function UniversalTHCSTestEngine({ grade, test, section }) {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [answers, setAnswers] = useState({});

  const testId = `reading-test-L${grade}-${test}`;
  const sectionKey = `section${section}`;
  const legacyKey = `${testId}_${sectionKey}`;

  const testData = THCS_TESTS_DATA[testId];

  useEffect(() => {
    if (!testData) return;

    localStorage.setItem("currentTest", testId);
    const timerExists = localStorage.getItem(`end-${testId}`);
    if (!timerExists) {
      startTimer(testId, 60); // 60 minutes
    }

    const saved = localStorage.getItem(`${testId}_${sectionKey}`) || localStorage.getItem(legacyKey);
    if (saved) {
      try {
        setAnswers(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }

    const interval = setInterval(() => {
      const remain = getRemainingTime(testId);
      setTime(formatTime(remain));
      if (remain <= 0) {
        clearInterval(interval);
        submitTest();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [testId, sectionKey]);

  const saveAnswer = (id, value) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    localStorage.setItem(`${testId}_${sectionKey}`, JSON.stringify(updated));
    localStorage.setItem(legacyKey, JSON.stringify(updated));
  };

  const submitTest = useCallback(() => {
    const seconds = getTimeSpent(testId);
    localStorage.setItem("lastTimeSpent", seconds);
    gradeTest();
    router.push("/ketqua");
  }, [testId, router]);

  if (!testData) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", background: "#f5f7fb", color: "#666" }}>
        <h3>Loading Test Data...</h3>
      </div>
    );
  }

  // --- SECTION 1 & 2: READING PASSAGES ---
  if (section === 1 || section === 2) {
    const readingData = testData[sectionKey];
    return (
      <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
        {/* HEADER */}
        <header style={{
          background: "#ffffff",
          borderBottom: "1px solid #e2e8f0",
          padding: "16px 32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
          flexShrink: 0,
        }}>
          <div>
            <div style={{ fontWeight: "800", fontSize: 22, color: "#0d9488", letterSpacing: 1.5 }}>DUOSTEAM</div>
            <div style={{ color: "#475569", fontSize: 14, marginTop: 4, fontWeight: "500" }}>
              Lớp {grade} ({testData.level}) — Section {section}: Reading Comprehension
            </div>
          </div>
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 18, color: "#ef4444", fontFamily: "monospace" }}>
            ⏱ {time}
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          {/* LEFT: PASSAGE TEXT */}
          <div style={{ flex: 1.2, overflowY: "auto", padding: 32, borderRight: "1px solid #e2e8f0", background: "#ffffff" }}>
            <div style={{ background: "#f0fdfa", borderRadius: 12, borderLeft: "4px solid #0d9488", padding: 24, boxShadow: "0 1px 3px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "inline-block", background: "#0d9488", color: "white", fontSize: 11, fontWeight: 800, padding: "4px 14px", borderRadius: 20, marginBottom: 16, letterSpacing: 1 }}>
                PASSAGE
              </div>
              <h3 style={{ fontSize: 24, fontWeight: "800", color: "#0f172a", marginBottom: 18 }}>{readingData.passageTitle}</h3>
              <p style={{ color: "#334155", lineHeight: 1.9, fontSize: 16.5, whiteSpace: "pre-line" }}>{readingData.passageText}</p>
            </div>
          </div>

          {/* RIGHT: QUESTIONS */}
          <div style={{ flex: 1, overflowY: "auto", padding: 32, background: "#f8fafc" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {readingData.questions.map((q, idx) => (
                <div key={q.id} style={{ background: "#ffffff", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                  <p style={{ fontWeight: "700", fontSize: 16, color: "#1e293b", marginBottom: 16, lineHeight: 1.5 }}>
                    {q.text}
                  </p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {q.options.map((opt) => {
                      const isSelected = answers[q.id] === opt;
                      return (
                        <button
                          key={opt}
                          onClick={() => saveAnswer(q.id, opt)}
                          style={{
                            textAlign: "left",
                            padding: "14px 20px",
                            borderRadius: 10,
                            border: isSelected ? "2px solid #0d9488" : "1.5px solid #e2e8f0",
                            background: isSelected ? "#f0fdfa" : "#ffffff",
                            color: isSelected ? "#0f766e" : "#334155",
                            fontWeight: isSelected ? "600" : "500",
                            fontSize: 15,
                            cursor: "pointer",
                            transition: "all 0.2s ease",
                            outline: "none"
                          }}
                        >
                          {opt}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FOOTER */}
        <footer style={{
          background: "#ffffff",
          borderTop: "1px solid #e2e8f0",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          gap: 16,
          padding: "16px 32px",
          boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
          flexShrink: 0
        }}>
          <NavCard href={`/L${grade}-test${test}-section1`} label="SECTION 1: READING 1" active={section === 1} />
          <NavCard href={`/L${grade}-test${test}-section2`} label="SECTION 2: READING 2" active={section === 2} />
          <NavCard href={`/L${grade}-test${test}-section3`} label="SECTION 3: BILINGUAL MATH" active={false} />
        </footer>
      </div>
    );
  }

  // --- SECTION 3: MATH (SHORT-ANSWER) ---
  const mathData = testData.section3;
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#f8fafc", fontFamily: "system-ui, sans-serif" }}>
      {/* HEADER */}
      <header style={{
        background: "#ffffff",
        borderBottom: "1px solid #e2e8f0",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)",
        flexShrink: 0
      }}>
        <div>
          <div style={{ fontWeight: "800", fontSize: 22, color: "#0d9488", letterSpacing: 1.5 }}>DUOSTEAM</div>
          <div style={{ color: "#475569", fontSize: 14, marginTop: 4, fontWeight: "500" }}>
            Lớp {grade} ({testData.level}) — Section 3: Bilingual Math (ToanMath)
          </div>
        </div>
        <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 10, padding: "10px 24px", fontWeight: 700, fontSize: 18, color: "#ef4444", fontFamily: "monospace" }}>
          ⏱ {time}
        </div>
      </header>

      {/* CONTENT */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        {/* LEFT: MATH PROBLEMS */}
        <div style={{ flex: 1.2, overflowY: "auto", padding: 32, background: "#ffffff", borderRight: "1px solid #e2e8f0" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            {mathData.mathProblems.map((prob) => (
              <div key={prob.id} style={{ background: "#f8fafc", borderRadius: 12, padding: 24, border: "1px solid #e2e8f0", boxShadow: "0 1px 3px rgba(0,0,0,0.02)" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 14 }}>
                  <div style={{ background: "#0d9488", color: "white", fontWeight: 700, fontSize: 12, padding: "4px 14px", borderRadius: 20 }}>
                    {prob.label}
                  </div>
                  <div style={{ fontSize: 12, color: "#64748b", fontStyle: "italic" }}>
                    Nguồn: {prob.source}
                  </div>
                </div>
                {prob.parts.map((part, pIdx) => (
                  <p key={pIdx} style={{ color: "#1e293b", lineHeight: 1.8, fontSize: 16, fontWeight: "500", marginBottom: 8 }}>
                    {part}
                  </p>
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT: ANSWER INPUTS */}
        <div style={{ flex: 1, overflowY: "auto", padding: 32, background: "#f1f5f9" }}>
          <div style={{ background: "#ffffff", borderRadius: 16, border: "1px solid #e2e8f0", padding: 32, boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05)" }}>
            <h3 style={{ fontSize: 20, fontWeight: "800", color: "#0f172a", marginBottom: 24 }}>Nhập Đáp Án</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              {mathData.mathProblems.map((prob) => (
                <div key={prob.id} style={{ background: "#f8fafc", borderRadius: 12, padding: 20, border: "1px solid #e2e8f0" }}>
                  <p style={{ fontWeight: "700", color: "#0d9488", marginBottom: 16 }}>{prob.label}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {prob.fields.map((fieldLabel, fIdx) => {
                      const key = `${prob.id}-${fIdx}`;
                      return (
                        <div key={fIdx} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          <label style={{ fontSize: 14, color: "#475569", fontWeight: "600" }}>{fieldLabel}</label>
                          <input
                            type="text"
                            value={answers[key] || ""}
                            onChange={(e) => saveAnswer(key, e.target.value)}
                            style={{
                              width: "100%",
                              border: "1.5px solid #cbd5e1",
                              borderRadius: 10,
                              padding: "12px 16px",
                              fontSize: 15,
                              color: "#0f172a",
                              outline: "none",
                              background: "#ffffff",
                              boxSizing: "border-box",
                              transition: "all 0.2s"
                            }}
                            placeholder="Nhập câu trả lời..."
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{
        background: "#ffffff",
        borderTop: "1px solid #e2e8f0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: "16px 32px",
        boxShadow: "0 -4px 6px -1px rgba(0,0,0,0.05)",
        flexShrink: 0
      }}>
        <NavCard href={`/L${grade}-test${test}-section1`} label="SECTION 1: READING 1" active={false} />
        <NavCard href={`/L${grade}-test${test}-section2`} label="SECTION 2: READING 2" active={false} />
        <NavCard href={`/L${grade}-test${test}-section3`} label="SECTION 3: BILINGUAL MATH" active={true} />
        <button
          onClick={submitTest}
          style={{
            background: "#ef4444",
            color: "white",
            border: "none",
            borderRadius: 10,
            padding: "12px 32px",
            fontWeight: "700",
            fontSize: 15,
            cursor: "pointer",
            boxShadow: "0 4px 6px -1px rgba(239, 68, 68, 0.2)",
            transition: "all 0.2s ease"
          }}
        >
          NỘP BÀI
        </button>
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        border: active ? "2px solid #0d9488" : "1.5px solid #cbd5e1",
        borderRadius: 10,
        padding: "12px 28px",
        color: active ? "#ffffff" : "#475569",
        fontWeight: "700",
        fontSize: 14,
        cursor: "pointer",
        background: active ? "#0d9488" : "#ffffff",
        transition: "all 0.2s ease"
      }}>
        {label}
      </div>
    </Link>
  );
}
