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

const LEGACY_KEY = "reading-test-2_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-2";

const passage1Questions = [
  {
    id: "p1q1",
    text: "1. The main idea of the passage is that",
    options: [
      "A. solar energy is the only viable renewable alternative to fossil fuels",
      "B. the transition to renewable energy requires overcoming both technical and economic barriers",
      "C. wind power is more cost-effective than solar in all geographic contexts",
      "D. governments should privatise all energy infrastructure immediately",
    ],
    answer: "B",
  },
  {
    id: "p1q2",
    text: "2. According to paragraph 2, the 'intermittency problem' refers to",
    options: [
      "A. the difficulty of training engineers for the renewable sector",
      "B. the fact that renewable sources do not produce power continuously",
      "C. fluctuations in government subsidies for clean energy",
      "D. the irregular pace of technological development",
    ],
    answer: "B",
  },
  {
    id: "p1q3",
    text: "3. The word 'incumbent' in paragraph 3 most closely means",
    options: [
      "A. emerging",
      "B. costly",
      "C. currently dominant",
      "D. environmentally harmful",
    ],
    answer: "C",
  },
  {
    id: "p1q4",
    text: "4. The author's tone toward the energy transition can best be described as",
    options: [
      "A. pessimistic and dismissive",
      "B. cautiously optimistic",
      "C. enthusiastic and uncritical",
      "D. neutral and indifferent",
    ],
    answer: "B",
  },
  {
    id: "p1q5",
    text: "5. Which evidence from the passage best supports the claim that renewable energy is becoming economically competitive?",
    options: [
      "A. Several countries have committed to net-zero emissions targets",
      "B. The cost of solar panels has fallen by over 90% in the past decade",
      "C. Wind farms are being built offshore to capture stronger winds",
      "D. Battery technology improves steadily every year",
    ],
    answer: "B",
  },
];

const passage2Questions = [
  {
    id: "p2q1",
    text: "6. The passage primarily argues that",
    options: [
      "A. people always make economically rational decisions",
      "B. default options have little effect on individual behaviour",
      "C. subtle design choices can significantly influence human decision-making",
      "D. financial incentives are the most effective tool for behaviour change",
    ],
    answer: "C",
  },
  {
    id: "p2q2",
    text: "7. The term 'nudge' as used in the passage refers to",
    options: [
      "A. a financial penalty for poor choices",
      "B. a law mandating certain behaviours",
      "C. an environmental adjustment that guides behaviour without compulsion",
      "D. a type of advertising campaign",
    ],
    answer: "C",
  },
  {
    id: "p2q3",
    text: "8. The organ donation example is used in the passage to demonstrate",
    options: [
      "A. that citizens distrust government health agencies",
      "B. the power of opt-out defaults in increasing participation rates",
      "C. that medical education improves donation rates",
      "D. that laws are more effective than nudges",
    ],
    answer: "B",
  },
  {
    id: "p2q4",
    text: "9. According to the passage, a key criticism of nudge theory is that",
    options: [
      "A. it is too expensive to implement at scale",
      "B. it manipulates people without their full awareness or consent",
      "C. it only works in healthcare settings",
      "D. nudges have no measurable effect on behaviour",
    ],
    answer: "B",
  },
  {
    id: "p2q5",
    text: "10. Based on the passage, which scenario best exemplifies a 'nudge'?",
    options: [
      "A. A government imposes a tax on sugary drinks",
      "B. A school cafeteria places fruit at eye level and less healthy foods out of sight",
      "C. A city bans single-use plastic bags",
      "D. An employer deducts pension contributions automatically and penalises opt-outs",
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

      {/* HEADER */}
      <header style={{
        background: "#ffffff", borderBottom: "1px solid #e0e0e0",
        padding: "16px 32px", display: "flex", alignItems: "center",
        justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0,
      }}>
        <div>
          <div style={{ fontWeight: "bold", fontSize: 20, color: "#0B4F5C", letterSpacing: 1 }}>DUOSTEAM</div>
          <div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 2 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>

      {/* BODY */}
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>

        {/* PASSAGES */}
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>

          {/* PASSAGE 1 */}
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28, marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>The Renewable Energy Revolution</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>The global energy landscape is undergoing a profound transformation. Driven by falling costs, advancing technology, and mounting pressure to address climate change, renewable energy sources — particularly solar and wind — are rapidly gaining market share at the expense of fossil fuels. In many regions, new renewable installations are now cheaper to build and operate than the cheapest coal plants. The cost of utility-scale solar photovoltaics, for instance, plummeted by more than 90 percent between 2010 and 2023, a rate of cost reduction with few parallels in industrial history.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Yet the transition is not without complexity. The intermittency problem — the fact that the sun does not always shine and the wind does not always blow — poses a significant engineering challenge. Electrical grids built for the predictable output of coal and gas plants must be redesigned to accommodate variable renewable generation. Energy storage, particularly grid-scale batteries, is central to this challenge. While battery costs have also fallen sharply, deploying storage at the scale needed to fully decarbonise electricity grids remains a formidable task.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Political economy presents another layer of difficulty. Incumbent fossil fuel industries employ millions of workers and wield considerable political influence. In regions where coal or oil are major employers, transitions can generate significant social disruption. Managed transitions — including retraining programmes and targeted investment in affected communities — are widely regarded by economists as essential to sustaining political support for climate policy.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Despite these challenges, projections from major energy agencies suggest that renewable capacity will continue to expand rapidly through the 2030s. The question is no longer whether the world will transition away from fossil fuels, but how quickly and equitably that transition can be managed.</p>
          </div>

          {/* PASSAGE 2 */}
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Nudging Behaviour: The Science of Choice Architecture</h3>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Classical economic theory rests on the assumption that individuals are rational agents who consistently make decisions in their own best interest. Decades of behavioural research, however, tell a more complicated story. People are subject to cognitive biases, mental shortcuts, and a tendency toward inertia that routinely leads them to make choices that conflict with their stated preferences and long-term goals. Behavioural economics seeks to understand these patterns — and, increasingly, to harness them for public benefit.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>The concept of the 'nudge', popularised by economists Richard Thaler and Cass Sunstein, refers to any aspect of the choice environment that predictably alters behaviour without forbidding options or significantly changing economic incentives. A nudge exploits the tendency toward inertia by making the socially desirable option the default. If employees must actively opt out of a workplace pension scheme rather than opt in, participation rates rise substantially. If a cafeteria places fruit at eye level and relegates unhealthy options to lower shelves, students select more nutritious meals — without any rule being imposed.</p>
            <p style={{ color: "#333", lineHeight: 1.85, marginBottom: 12 }}>Perhaps the most cited example is organ donation. Countries that use opt-out systems — where citizens are presumed to consent to donation unless they formally withdraw — consistently have far higher donation rates than countries relying on opt-in consent. The difference in outcomes stems not from any difference in values or education, but simply from the power of the default.</p>
            <p style={{ color: "#333", lineHeight: 1.85 }}>Critics raise ethical concerns. If nudges influence behaviour without people's full knowledge, do they undermine genuine autonomy? Proponents counter that all environments involve defaults — the question is not whether to design them, but whether to design them thoughtfully, with citizens' welfare in mind. As governments worldwide adopt nudge units and behavioural insight teams, this ethical debate is unlikely to be resolved soon.</p>
          </div>
        </div>

        {/* QUESTIONS PANEL */}
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

      {/* FOOTER */}
      <footer style={{ background: "#ffffff", borderTop: "1px solid #e0e0e0", display: "flex", justifyContent: "center", alignItems: "center", gap: 16, padding: "12px 32px", height: 72, flexShrink: 0, boxShadow: "0 -2px 8px rgba(0,0,0,0.05)" }}>
        <NavCard href="/L10-test2-section1" label="SECTION 1" active />
        <NavCard href="/L10-test2-section2" label="SECTION 2" />
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
