/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-3_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-3";

const passage1Questions = [{ id:"p1q1", text:"1. The passage primarily argues that procrastination is", options:["A. a failure of intelligence and planning ability", "B. caused mainly by poor organisation skills", "C. fundamentally a problem of emotional regulation", "D. always a symptom of clinical anxiety"], answer:"C" },
  { id:"p1q2", text:"2. According to the passage, the prefrontal cortex is responsible for", options:["A. generating immediate emotional responses", "B. long-term planning and rational goal pursuit", "C. producing feelings of anxiety and avoidance", "D. controlling the body's response to stress"], answer:"B" },
  { id:"p1q3", text:"3. The word 'aversive' in paragraph 2 most nearly means", options:["A. challenging", "B. unpleasant or repellent", "C. time-consuming", "D. unclear or ambiguous"], answer:"B" },
  { id:"p1q4", text:"4. Based on the passage, why do time-management tools show limited effectiveness for chronic procrastinators?", options:["A. They are too complicated to use consistently", "B. They do not address the underlying emotional cause", "C. They require too much willpower to implement", "D. They ignore the role of digital distractions"], answer:"B" },
  { id:"p1q5", text:"5. Which of the following best illustrates an 'implementation intention' as described in the passage?", options:["A. Making a list of all tasks due this week", "B. Rewarding yourself after completing a difficult project", "C. Deciding to write for one hour at 9 AM at the library every Monday", "D. Downloading a productivity app to track your habits"], answer:"C" }];

const passage2Questions = [{ id:"p2q1", text:"6. The central argument of the passage is that", options:["A. ocean acidification is less dangerous than warming", "B. coral reefs are too resilient to be permanently damaged", "C. acidification and warming together threaten reef survival", "D. reducing CO₂ emissions alone will save coral reefs"], answer:"C" },
  { id:"p2q2", text:"7. According to the passage, the drop in pH from 8.2 to 8.1 represents", options:["A. a 10% increase in acidity", "B. a 26% increase in hydrogen ion concentration", "C. a 30% increase in CO₂ absorption", "D. a relatively harmless change in ocean chemistry"], answer:"B" },
  { id:"p2q3", text:"8. The term 'synergistic' in paragraph 3 most closely means", options:["A. occurring simultaneously", "B. producing an effect greater than the sum of the parts", "C. cancelling each other out", "D. equal in magnitude"], answer:"B" },
  { id:"p2q4", text:"9. Based on the passage, coral bleaching is caused by", options:["A. increased carbonic acid dissolving coral skeletons", "B. reduced sunlight penetrating deeper water", "C. ocean warming triggering expulsion of symbiotic algae", "D. overfishing disrupting the reef ecosystem"], answer:"C" },
  { id:"p2q5", text:"10. Which of the following, if true, would most weaken the concern raised in paragraph 4?", options:["A. Many coral reef species have no commercial fishing value", "B. Reef-associated fisheries are declining at a faster rate than estimated", "C. Coastal communities have successfully switched to land-based food sources", "D. Tourism revenues from coral reefs have increased despite bleaching events"], answer:"C" }];

export default function Page() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    localStorage.setItem("currentTest", TEST_KEY);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    const timerExists = localStorage.getItem(`end-${TEST_KEY}`);
    if (!timerExists) { clearTestSession(TEST_KEY); startTimer(TEST_KEY, 60); }
    const saved = localStorage.getItem(`${exam}_${SECTION}`) || localStorage.getItem(LEGACY_KEY);
    if (saved) setTimeout(() => setAnswers(JSON.parse(saved)), 0);
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
    <div style={{ width:"100%", height:"100vh", display:"flex", flexDirection:"column", background:"#f5f5f5" }}>
      <header style={{ background:"#ffffff", borderBottom:"1px solid #e0e0e0", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:"bold", fontSize:20, color:"#0B4F5C", letterSpacing:1 }}>DUOSTEAM</div>
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 3 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28, marginBottom:24 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Psychology of Procrastination</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Procrastination — the voluntary delay of an intended action despite knowing it will lead to worse outcomes — is one of the most pervasive yet misunderstood human behaviours. For decades, researchers classified it primarily as a time-management problem, a failure of self-discipline rooted in poor planning. More recent work, however, has reframed procrastination as fundamentally an emotional regulation problem, a strategy for avoiding the negative feelings — anxiety, self-doubt, boredom — that a task provokes.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The neuroscience of procrastination centres on a conflict between the prefrontal cortex, which governs rational planning and long-term goals, and the limbic system, which drives immediate emotional responses. When a task feels threatening or aversive, the limbic system triggers an avoidance response. In chronic procrastinators, this emotional hijacking is more powerful, and the prefrontal cortex exerts less regulatory control. The result is that short-term mood relief — scrolling social media, organising an already-tidy desk — consistently wins out over long-term benefit.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>This emotional framing has significant implications for treatment. Strategies built purely on improving time management, such as to-do lists and scheduling apps, show limited effectiveness for chronic procrastinators because they address the symptom without the cause. More promising interventions include self-compassion — studies show that students who forgave themselves for procrastinating on an exam were subsequently less likely to procrastinate on the next one — and implementation intentions, where the individual commits to a specific when, where, and how of completing a task.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Cultural and technological factors also shape procrastination patterns. Research suggests that digital environments, with their near-infinite supply of immediately rewarding content, have systematically increased the opportunity cost of engaging with difficult work. The smartphone, in particular, has lowered the activation energy required for distraction to near zero. Addressing procrastination in contemporary life thus requires not only psychological intervention but deliberate environmental design.</p>
          </div>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Ocean Acidification and Coral Reef Decline</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Since the Industrial Revolution, the world's oceans have absorbed approximately 30 percent of the carbon dioxide released by human activities. While this has partially buffered the atmosphere from even more rapid warming, it has come at considerable cost to marine chemistry. As CO₂ dissolves in seawater, it forms carbonic acid, which dissociates to release hydrogen ions, lowering the ocean's pH. This process — ocean acidification — has already reduced average surface ocean pH from 8.2 to 8.1, a seemingly small change that represents a 26 percent increase in hydrogen ion concentration.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Coral reefs are among the ecosystems most vulnerable to acidification. Reef-building corals construct their skeletons from calcium carbonate, a compound whose availability depends critically on the saturation state of seawater. As acidity increases, carbonate ions become less abundant, making it energetically costly for corals to build and maintain their structures. In conditions projected for 2100 under high-emissions scenarios, many reefs may experience net dissolution — corals eroding faster than they can grow.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The problem is compounded by ocean warming, which triggers coral bleaching — the expulsion of symbiotic algae that give corals their colour and provide up to 90 percent of their energy needs through photosynthesis. Bleached corals can survive if temperatures return to normal quickly enough, but prolonged bleaching leads to starvation and death. The interaction between warming and acidification is not simply additive; research suggests that the combined stressors are synergistic, meaning their combined effect exceeds the sum of their individual impacts.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The consequences extend far beyond the aesthetic. Coral reefs cover less than one percent of the ocean floor yet support approximately 25 percent of all marine species, providing feeding, breeding, and nursery habitat. Their degradation threatens food security for hundreds of millions of people who depend on reef-associated fisheries. The economic value of reefs — through fisheries, tourism, and coastal protection — is estimated in the hundreds of billions of dollars annually.</p>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"#fafafa", borderLeft:"1px solid #e8e8e8" }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:18, fontWeight:"bold", color:"#0B4F5C", marginBottom:20 }}>Questions 1–10 (Multiple Choice)</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {allQuestions.map((q) => (
                <div key={q.id} style={{ background:"#f9f9f9", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight:600, color:"#333", marginBottom:12, lineHeight:1.5 }}>{q.text}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {q.options.map((opt) => (
                      <label key={opt} style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer", color:"#333", fontWeight:answers[q.id]===opt?700:400, lineHeight:1.5 }}>
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id]===opt} onChange={()=>saveAnswer(q.id,opt)} style={{ marginTop:3, flexShrink:0 }} />
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
      <footer style={{ background:"#ffffff", borderTop:"1px solid #e0e0e0", display:"flex", justifyContent:"center", alignItems:"center", gap:16, padding:"12px 32px", height:72, flexShrink:0, boxShadow:"0 -2px 8px rgba(0,0,0,0.05)" }}>
        <NavCard href="/L10-test3-section1" label="SECTION 1" active />
        <NavCard href="/L10-test3-section2" label="SECTION 2" />
        <NavCard href="/L10-test3-section3" label="SECTION 3" />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`, borderRadius:8, padding:"10px 24px", color:active?"#fff":"#333", fontWeight:600, fontSize:14, cursor:"pointer", background:active?"#0B4F5C":"#f9f9f9", transition:"all 0.2s ease" }}
        onMouseEnter={e=>{ if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";} }}
        onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";} }}
      >{label}</div>
    </Link>
  );
}
