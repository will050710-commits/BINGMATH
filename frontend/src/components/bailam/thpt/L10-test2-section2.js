/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  startTimer,
  getRemainingTime,
  formatTime,
  clearTestSession,
} from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-2_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-2";

const questions = [
  "1. Artificial intelligence systems currently possess genuine self-awareness and subjective experience.",
  "2. Machine learning models improve their performance by processing large quantities of labelled data.",
  "3. Researchers unanimously agree that artificial general intelligence will be achieved within the next decade.",
  "4. Algorithmic bias can result in discriminatory outcomes for individuals from historically marginalised groups.",
  "5. Regulation of artificial intelligence is more advanced in the European Union than in any other jurisdiction.",
];
const options = ["TRUE", "FALSE", "NOT GIVEN"];

export default function Page() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    localStorage.setItem("currentTest", TEST_KEY);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    const timerExists = localStorage.getItem(`end-${TEST_KEY}`);
    if (!timerExists) {
      clearTestSession(TEST_KEY);
      startTimer(TEST_KEY, 60);
    }
    const saved =
      localStorage.getItem(`${exam}_${SECTION}`) ||
      localStorage.getItem(LEGACY_KEY);
    if (saved) {
      setTimeout(() => setAnswers(JSON.parse(saved)), 0);
    }
    const interval = setInterval(() => {
      const remain = getRemainingTime(TEST_KEY);
      setTime(formatTime(remain));
      if (remain <= 0) { clearInterval(interval); router.push("/ketqua"); }
    }, 1000);
    return () => clearInterval(interval);
  }, [router]);

  const saveAnswer = (q, value) => {
    const updated = { ...answers, [q]: value };
    setAnswers(updated);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`, JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  };

  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>

      {/* HEADER */}
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e0e0e0", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 20, color: "#0B4F5C", letterSpacing: 1 }}>DUOSTEAM</div>
          <div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 2 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* PASSAGE */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Artificial Intelligence: Promise and Peril</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Artificial intelligence has moved from the realm of science fiction into the fabric of daily life with remarkable speed. Virtual assistants, recommendation algorithms, medical imaging tools, and autonomous vehicles all rely on forms of AI that were theoretical concepts only decades ago. At the heart of this transformation is machine learning — a subfield of AI in which systems improve their performance on a task by being exposed to large quantities of labelled data, rather than by following explicit programmer-defined rules.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>It is important to distinguish between narrow AI, which excels at specific tasks, and the theoretical construct of artificial general intelligence (AGI) — a system capable of performing any intellectual task that a human being can. Current AI systems, however sophisticated, remain firmly in the narrow category. They process patterns in data with impressive efficiency but lack genuine comprehension, consciousness, or subjective experience. The question of when or whether AGI will be achieved is fiercely debated among researchers, with estimates ranging from decades to centuries, and some prominent scientists arguing it may never be realised in the form imagined by popular culture.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>One of the most pressing concerns surrounding AI deployment is the problem of algorithmic bias. Machine learning models trained on historical data can perpetuate and even amplify existing social inequalities. Facial recognition systems, for example, have been documented to perform less accurately on darker-skinned faces, largely because training datasets have historically over-represented lighter-skinned individuals. In criminal justice, predictive risk tools have been shown to score Black defendants as higher risk at rates that critics argue reflect systemic racial bias embedded in historical data rather than genuine predictive accuracy.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Regulatory responses have varied across jurisdictions. The European Union moved early to establish a comprehensive legal framework — the AI Act — which categorises AI systems by risk level and imposes requirements accordingly. Other major economies, including the United States and China, have pursued more sector-specific or voluntary approaches, though both have accelerated regulatory activity in recent years. Whether the EU's framework represents the global gold standard or an overreaching regulatory burden remains a matter of genuine debate among policymakers and industry observers.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Ultimately, the trajectory of AI development will depend not only on technical progress, but on the social, legal, and ethical frameworks within which that progress occurs. The decisions made by governments, researchers, and corporations in the coming years will shape whether AI becomes primarily a tool of human flourishing or a source of new inequalities and vulnerabilities.</p>
          </div>
        </div>

        {/* QUESTIONS */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#fafafa", borderLeft: "1px solid #e8e8e8" }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#0B4F5C", marginBottom: 8 }}>Questions 1–5</h3>
            <p style={{ fontSize: 14, color: "#777", marginBottom: 20, lineHeight: 1.6 }}>
              Do the following statements agree with the information given in the passage?<br />
              Write <strong>TRUE</strong> if the statement agrees with the information,<br />
              <strong>FALSE</strong> if the statement contradicts the information,<br />
              <strong>NOT GIVEN</strong> if there is no information on this.
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {questions.map((q, i) => (
                <div key={i} style={{ background: "#f9f9f9", borderRadius: 10, padding: "16px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: 600, color: "#333", marginBottom: 12, lineHeight: 1.6 }}>{q}</p>
                  <div style={{ display: "flex", gap: 20, flexWrap: "wrap" }}>
                    {options.map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", color: "#333", fontWeight: answers[i] === opt ? 700 : 400 }}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i] === opt} onChange={() => saveAnswer(i, opt)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "12px 32px", height: 72, flexShrink: 0, boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}>
        <NavCard href="/L10-test2-section1" label="SECTION 1" />
        <NavCard href="/L10-test2-section2" label="SECTION 2" active />
        <NavCard href="/L10-test2-section3" label="SECTION 3" />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{ border: `2px solid ${active ? "#0B4F5C" : "#d0d0d0"}`, borderRadius: 8, padding: "10px 24px", color: active ? "#fff" : "#333", fontWeight: 600, fontSize: 14, cursor: "pointer", background: active ? "#0B4F5C" : "#f9f9f9", transition: "all 0.2s ease" }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#0B4F5C"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#0B4F5C"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#d0d0d0"; } }}
      >{label}</div>
    </Link>
  );
}
