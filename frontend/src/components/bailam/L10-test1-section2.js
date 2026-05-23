/* eslint-disable react/no-unescaped-entities */
"use client";
import {
  startTimer,
  getRemainingTime,
  formatTime,
  clearTestSession,
} from "../../utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-1_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-1";

const questions = [
  "1. Microplastics have been found in environments previously considered pristine and untouched.",
  "2. The majority of ocean plastic enters the sea directly from ships and fishing vessels.",
  "3. Marine animals that ingest plastic fragments are unable to digest them.",
  "4. Scientists have determined that microplastics are harmless to human health at current exposure levels.",
  "5. Extended Producer Responsibility schemes shift financial responsibility to manufacturers.",
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
    if (saved) setAnswers(JSON.parse(saved));
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

      <header style={{
        background: "#ffffff",
        borderBottom: "1px solid #e0e0e0",
        padding: "16px 32px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
        flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 20, color: "#0B4F5C", letterSpacing: 1 }}>DUOSTEAM</div>
          <div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 1 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>The Plastic Ocean</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Every year, an estimated eight million tonnes of plastic waste enters the world's oceans, adding to the 150 million tonnes already circulating in marine environments. This plastic originates overwhelmingly from land-based sources — inadequate waste management systems that allow plastic to wash into rivers and ultimately reach the sea. Coastal communities in developing nations contribute disproportionately, not because of negligence, but due to infrastructure gaps that wealthy nations took decades to address.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Once at sea, plastic does not simply disappear. Ultraviolet radiation and wave action break larger items into microplastics — fragments smaller than five millimetres — that are virtually impossible to retrieve. These particles have been detected in Arctic sea ice, the deepest ocean trenches, and mountain snowfields, confirming that no ecosystem remains untouched. Marine organisms from zooplankton to whales ingest these fragments, which can block digestive tracts, create false feelings of satiation, and introduce toxic chemical additives into the food chain.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>The implications for human health are a subject of active research. Microplastics have been found in human blood, lung tissue, and breast milk, but the long-term effects of such exposure remain poorly understood. Current evidence does not allow scientists to conclude definitively whether these concentrations pose a significant health risk, and more longitudinal studies are needed before firm conclusions can be drawn.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Policy responses have been uneven. Some jurisdictions have introduced bans on single-use plastics; others have implemented Extended Producer Responsibility (EPR) laws, which require manufacturers to bear the financial cost of collecting and recycling the packaging they produce. Critics argue that voluntary corporate pledges have repeatedly failed to deliver meaningful reductions, and that binding international agreements — similar in ambition to the Paris Climate Accord — are necessary to drive systemic change.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Technological innovation offers partial solutions. Ocean cleanup devices, improved recycling technologies, and biodegradable materials are all under development. However, experts caution against over-reliance on technical fixes, arguing that reducing plastic production at the source is far more effective than attempting to manage the consequences downstream.</p>
          </div>
        </div>

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

      <footer style={{
        background: "#ffffff",
        borderTop: "1px solid #e0e0e0",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        gap: 16,
        padding: "12px 32px",
        height: 72,
        flexShrink: 0,
        boxShadow: "0 -2px 8px rgba(0,0,0,0.05)",
      }}>
        <NavCard href="/L10-test1-section1" label="SECTION 1" />
        <NavCard href="/L10-test1-section2" label="SECTION 2" active />
        <NavCard href="/L10-test1-section3" label="SECTION 3" />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        border: `2px solid ${active ? "#0B4F5C" : "#d0d0d0"}`,
        borderRadius: 8, padding: "10px 24px",
        color: active ? "#fff" : "#333",
        fontWeight: 600, fontSize: 14, cursor: "pointer",
        background: active ? "#0B4F5C" : "#f9f9f9",
        transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#0B4F5C"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#0B4F5C"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#d0d0d0"; } }}
      >{label}</div>
    </Link>
  );
}
