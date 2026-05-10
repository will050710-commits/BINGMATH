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

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-1";

const passage1Questions = [
  {
    id: "p1q1",
    text: "1. The primary purpose of the passage is to",
    options: [
      "A. argue that urban agriculture should replace industrial farming",
      "B. describe the benefits and challenges of urban farming",
      "C. explain why cities are unsuitable for growing food",
      "D. compare urban and rural agricultural yields",
    ],
    answer: "B",
  },
  {
    id: "p1q2",
    text: "2. According to the passage, rooftop gardens primarily help cities by",
    options: [
      "A. increasing property values in residential areas",
      "B. reducing stormwater runoff and lowering temperatures",
      "C. replacing traditional parks and public spaces",
      "D. providing jobs for unskilled workers",
    ],
    answer: "B",
  },
  {
    id: "p1q3",
    text: "3. The word 'mitigate' in paragraph 3 most nearly means",
    options: [
      "A. eliminate",
      "B. worsen",
      "C. lessen",
      "D. study",
    ],
    answer: "C",
  },
  {
    id: "p1q4",
    text: "4. Which statement best describes the author's view of urban agriculture?",
    options: [
      "A. It is an impractical trend that wastes resources",
      "B. It is a promising but complex solution with real trade-offs",
      "C. It will soon replace all conventional food systems",
      "D. It benefits only wealthy neighborhoods",
    ],
    answer: "B",
  },
  {
    id: "p1q5",
    text: "5. Based on the passage, which is identified as a significant challenge for urban farming?",
    options: [
      "A. Lack of interest from city residents",
      "B. Competition from local supermarkets",
      "C. High startup costs and limited space",
      "D. Insufficient sunlight in most urban areas",
    ],
    answer: "C",
  },
];

const passage2Questions = [
  {
    id: "p2q1",
    text: "6. The central claim of the passage is that",
    options: [
      "A. sleep deprivation only affects academic performance",
      "B. teenagers should start school later to improve health outcomes",
      "C. parents are responsible for teenagers' sleep schedules",
      "D. technology is the sole cause of teen sleep loss",
    ],
    answer: "B",
  },
  {
    id: "p2q2",
    text: "7. According to the passage, the biological reason teenagers stay up late is",
    options: [
      "A. addiction to social media and devices",
      "B. a natural shift in circadian rhythm during adolescence",
      "C. homework demands from schools",
      "D. anxiety caused by academic pressure",
    ],
    answer: "B",
  },
  {
    id: "p2q3",
    text: "8. The author uses the phrase 'fighting biology' (paragraph 2) to suggest that",
    options: [
      "A. teenagers are rebellious by nature",
      "B. early school times conflict with teenagers' natural sleep cycles",
      "C. students should study biology to understand sleep",
      "D. medical research is needed before any policy changes",
    ],
    answer: "B",
  },
  {
    id: "p2q4",
    text: "9. Districts that delayed school start times reported which outcome?",
    options: [
      "A. Higher dropout rates among students",
      "B. Increased teacher absenteeism",
      "C. Improved attendance and test scores",
      "D. Greater traffic congestion in the morning",
    ],
    answer: "C",
  },
  {
    id: "p2q5",
    text: "10. Which of the following, if true, would most strengthen the author's argument?",
    options: [
      "A. Many teenagers use phones after midnight regardless of school start time",
      "B. A study shows students at schools starting at 8:30 AM outperform those starting at 7:30 AM",
      "C. Some parents prefer early start times for childcare convenience",
      "D. Teachers report no difference in student alertness based on start time",
    ],
    answer: "B",
  },
];

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

  const saveAnswer = (id, value) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`, JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  };

  const allQuestions = [...passage1Questions, ...passage2Questions];

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
          <div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 1 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>

      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>

          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28, marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Growing Food in the City</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Urban agriculture — the practice of growing food within city limits — has gained considerable momentum in recent decades. From rooftop gardens in New York to community plots in Singapore, cities around the world are experimenting with ways to integrate food production into densely populated environments. Proponents argue that urban farming can strengthen food security, reduce transportation emissions, and reconnect residents with the origins of their food.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Green infrastructure, particularly rooftop gardens and vertical farms, offers environmental co-benefits beyond food production. These installations can intercept rainfall, reducing stormwater runoff that strains municipal drainage systems. They also lower ambient temperatures through evapotranspiration — a process that mitigates the urban heat island effect, which occurs when impervious surfaces absorb and re-emit solar radiation as heat.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Despite these promising attributes, urban agriculture faces substantial hurdles. Land in cities is expensive, and competition for rooftop or vacant lot space is fierce. Soil contamination from industrial history is a recurring concern, often requiring costly remediation before cultivation can begin. Start-up costs — for irrigation systems, grow lights, and structural reinforcement — can be prohibitive for community organisations operating on thin budgets.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Advocates nonetheless remain optimistic. As vertical farming technology matures and local governments introduce supportive zoning policies, urban agriculture may evolve from a niche pursuit into a meaningful contributor to city food systems. Whether it can scale to meet meaningful proportions of urban nutritional demand remains an open question — one that researchers, planners, and communities are actively working to answer.</p>
          </div>

          {/* PASSAGE 2 */}
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>The Case for Later School Start Times</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Sleep science has consistently shown that adolescents require between eight and ten hours of sleep per night for optimal cognitive function and emotional regulation. Yet surveys across numerous countries reveal that the average teenager sleeps far fewer hours — a deficit with measurable consequences for mental health, academic performance, and long-term physical well-being.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Part of this shortfall is biological. During puberty, a hormonal shift delays the release of melatonin, the body's sleep-inducing hormone, pushing teenagers toward later bedtimes. Asking a 15-year-old to rise at 6 AM for a 7:30 school start is, in effect, fighting biology. The adolescent brain at that hour is still physiologically in sleep mode, regardless of willpower or caffeine.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>A growing body of evidence supports delaying school start times. Districts in the United States that shifted start times to 8:30 AM or later reported significant improvements in student attendance, graduation rates, and standardised test performance. Rates of traffic accidents among teen drivers also dropped — an unsurprising finding given the link between sleep deprivation and impaired reaction times.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Critics raise practical concerns: working parents who rely on early school schedules, logistical challenges for bus routing, and the disruption to after-school sports and activities. These are legitimate considerations, but they are solvable problems — unlike the neurological consequences of chronic sleep deprivation in adolescence, which research suggests may have lasting effects on brain development.</p>
          </div>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#fafafa", borderLeft: "1px solid #e8e8e8" }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#0B4F5C", marginBottom: 20 }}>Questions 1–10 (Multiple Choice)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {allQuestions.map((q) => (
                <div key={q.id} style={{ background: "#f9f9f9", borderRadius: 10, padding: "16px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: 600, color: "#333", marginBottom: 12, lineHeight: 1.5 }}>{q.text}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map((opt) => (
                      <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", color: "#333", fontWeight: answers[q.id] === opt ? 700 : 400, lineHeight: 1.5 }}>
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => saveAnswer(q.id, opt)} style={{ marginTop: 3, flexShrink: 0 }} />
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
        <NavCard href="/L10-test1-section1" label="SECTION 1" active />
        <NavCard href="/L10-test1-section2" label="SECTION 2"  />
        <NavCard href="/L10-test1-section3" label="SECTION 3"  />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration: "none" }}>
      <div style={{
        border: `2px solid ${active ? "#0B4F5C" : "#d0d0d0"}`,
        borderRadius: 8,
        padding: "10px 24px",
        color: active ? "#fff" : "#333",
        fontWeight: 600,
        fontSize: 14,
        cursor: "pointer",
        background: active ? "#0B4F5C" : "#f9f9f9",
        transition: "all 0.2s ease",
      }}
        onMouseEnter={e => { if (!active) { e.currentTarget.style.background = "#0B4F5C"; e.currentTarget.style.color = "#fff"; e.currentTarget.style.borderColor = "#0B4F5C"; } }}
        onMouseLeave={e => { if (!active) { e.currentTarget.style.background = "#f9f9f9"; e.currentTarget.style.color = "#333"; e.currentTarget.style.borderColor = "#d0d0d0"; } }}
      >
        {label}
      </div>
    </Link>
  );
}
