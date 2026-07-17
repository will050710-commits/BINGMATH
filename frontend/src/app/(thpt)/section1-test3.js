/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-3";

const passage1Questions = [{ id:"p1q1", text:"1. The passage primarily argues that procrastination is", options:["A. a failure of intelligence and planning ability", "B. caused mainly by poor organisation skills", "C. fundamentally a problem of emotional regulation", "D. always a symptom of clinical anxiety"], answer:"C" },
  { id:"p1q2", text:"2. According to the passage, the prefrontal cortex is responsible for", options:["A. generating immediate emotional responses", "B. long-term planning and rational goal pursuit", "C. producing feelings of anxiety and avoidance", "D. controlling the body's response to stress"], answer:"B" },
  { id:"p1q3", text:"3. The word 'aversive' in paragraph 2 most nearly means", options:["A. challenging", "B. unpleasant or repellent", "C. time-consuming", "D. unclear or ambiguous"], answer:"B" },
  { id:"p1q4", text:"4. Based on the passage, why do time-management tools show limited effectiveness for chronic procrastinators?", options:["A. They are too complicated to use consistently", "B. They do not address the underlying emotional cause", "C. They require too much willpower to implement", "D. They ignore the role of digital distractions"], answer:"B" },
  { id:"p1q5", text:"5. Which of the following best illustrates an 'implementation intention' as described in the passage?", options:["A. Making a list of all tasks due this week", "B. Rewarding yourself after completing a difficult project", "C. Deciding to write for one hour at 9 AM at the library every Monday", "D. Downloading a productivity app to track your habits"], answer:"C" }];

const passage2Questions = [{ id:"p2q1", text:"6. The main argument of this passage is that", options:["A. social media causes depression in all teenagers", "B. the link between social media and mental health is complex and not fully understood", "C. governments should ban social media for people under 18", "D. teenagers who use social media perform better at school"], answer:"B" },
  { id:"p2q2", text:"7. According to the passage, one reason social media use may harm mental health is that", options:["A. teenagers spend too much money on devices", "B. it encourages face-to-face communication", "C. it promotes constant social comparison with others", "D. it reduces the time available for sport"], answer:"C" },
  { id:"p2q3", text:"8. The word 'passive' in paragraph 2 most nearly means", options:["A. inactive or receiving without participating", "B. aggressive or forceful", "C. creative and productive", "D. emotional and sensitive"], answer:"A" },
  { id:"p2q4", text:"9. Based on the passage, researchers found that passive social media use is", options:["A. more beneficial than active engagement", "B. associated with lower wellbeing than active use", "C. unrelated to mood or self-esteem", "D. only harmful for users over 25"], answer:"B" },
  { id:"p2q5", text:"10. Which of the following best describes the author's attitude toward social media?", options:["A. Strongly negative — social media should be banned", "B. Strongly positive — social media benefits everyone", "C. Balanced — acknowledging both benefits and risks", "D. Indifferent — the author presents no opinion"], answer:"C" }];

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
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Social Media and Teenage Wellbeing</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Over the past decade, the number of teenagers using social media platforms has grown dramatically. Today, most young people in developed countries spend several hours each day on platforms such as Instagram, TikTok, and YouTube. While social media offers clear benefits — keeping friends connected, sharing creative content, and accessing news — researchers and parents have raised concerns about its impact on young people's mental health and wellbeing.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Studies have found a link between heavy social media use and increased levels of anxiety and depression among teenagers, particularly girls. One reason for this is social comparison: platforms are designed to show carefully selected highlights of other people's lives, which can make users feel that their own lives are less exciting or successful. Researchers distinguish between passive use — scrolling and viewing content without interacting — and active use, such as messaging friends and sharing posts. Passive use, they found, is more strongly associated with negative feelings and lower self-esteem.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>However, the relationship between social media and mental health is not straightforward. Not all teenagers are equally affected. Those who already feel lonely or anxious may use social media more frequently as a way to cope, which could mean that poor mental health leads to heavier use, rather than the other way around. Additionally, some studies show that social media can reduce loneliness and improve mood when used to maintain meaningful friendships, particularly for teenagers in rural areas or those with limited social opportunities.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Experts generally recommend a balanced approach rather than a complete ban. Encouraging teenagers to be aware of how they feel while using social media, to limit passive scrolling, and to prioritise face-to-face interaction are strategies that many psychologists support. Parents, schools, and technology companies all have a role to play in helping young people develop healthy digital habits.</p>
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
        <NavCard href="/section1-L10-3" label="SECTION 1" active />
        <NavCard href="/section2-L10-3" label="SECTION 2" />
        <NavCard href="/section3-L10-3" label="SECTION 3" />
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
