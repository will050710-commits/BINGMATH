"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-L12-1_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-L12-1";
const passage1Questions = [{"id":"p1q1","text":"1. The primary purpose of Passage 1 is to","options":["A. advocate for a complete ban on technology","B. examine key advancements, societal impacts, and governance in the field","C. prove that global progress is impossible","D. detail basic elementary arithmetic"],"answer":"B"},{"id":"p1q2","text":"2. According to the passage, historical analogies demonstrate that technological shifts","options":["A. cause permanent societal collapse","B. initially disrupt labor before leading to long-term adaptation and growth","C. have zero impact on economic productivity","D. only occur in agricultural sectors"],"answer":"B"},{"id":"p1q3","text":"3. The author highlights current advancements to show how they differ from past disruptions in","options":["A. geographical location","B. speed, cognitive scope, and structural impact","C. language of instruction","D. biological composition"],"answer":"B"},{"id":"p1q4","text":"4. The word 'pivotal' or 'divergent' in context refers to factors that are","options":["A. minor and unimportant","B. central, transformative, or differing","C. completely stationary","D. invisible"],"answer":"B"},{"id":"p1q5","text":"5. Which policy approach is recommended to ensure an equitable transition?","options":["A. Halting all scientific research","B. Proactive governance, educational reform, and robust social safety nets","C. Eliminating public infrastructure spending","D. Restricting internet access"],"answer":"B"}];
const passage2Questions = [{"id":"p2q1","text":"6. Modern scientific research demonstrates that complex cognitive processes flourish when","options":["A. heavy financial penalties are imposed","B. core psychological and structural supportive conditions are fulfilled","C. individuals operate under extreme physical isolation","D. routine tasks are repeated indefinitely"],"answer":"B"},{"id":"p2q2","text":"7. According to the passage, memory consolidation or system regulation occurs primarily through","options":["A. random muscle movements","B. structured neurological cycles during dedicated rest and recovery","C. continuous high-intensity physical stress","D. artificial dietary supplements"],"answer":"B"},{"id":"p2q3","text":"8. The author cites recent empirical studies to highlight that executive function depends on","options":["A. prefrontal cortex integrity and metabolic maintenance","B. arbitrary luck","C. external physical appearance","D. manual hand dexterity"],"answer":"A"},{"id":"p2q4","text":"9. The word 'detrimental' or 'paramount' in context means","options":["A. beneficial or secondary","B. damaging / crucial","C. ancient","D. temporary"],"answer":"B"},{"id":"p2q5","text":"10. Based on the passage, failing to address underlying structural maintenance leads to","options":["A. immediate peak performance","B. impaired cognitive function, elevated risk, and systemic burnout","C. total immunity to fatigue","D. spontaneous skill acquisition"],"answer":"B"}];

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
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e0e0e0", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <div><div style={{ fontWeight: "bold", fontSize: 20, color: "#0B4F5C", letterSpacing: 1 }}>DUOSTEAM</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 1 — Section 1: SAT Reading (Multiple Choice) (Grade 12)</div></div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28, marginBottom: 24 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Grade 12 Academic Topic 1A: Advanced Systems & Global Dynamics</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Modern technological and economic systems are undergoing rapid evolution across global markets. Advanced algorithmic automation, machine learning models, and complex data networks are transforming traditional operational paradigms. From high-frequency financial markets to healthcare diagnostics, automated systems demonstrate unprecedented processing capacity and analytical precision.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Economists and policy analysts present contrasting perspectives regarding the structural implications of these transformations. Proponents contend that technological integration enhances systemic efficiency, creates high-value specialization opportunities, and drives sustainable economic productivity. They draw parallels to historical industrial transitions where structural disruptions eventually yielded broader economic prosperity.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Conversely, researchers highlight significant socio-economic vulnerabilities accompanying rapid technological shifts. Cognitive automation directly intersects with knowledge-intensive professions, challenging long-held assumptions regarding skill durability. Without proactive workforce adaptation and resilient socio-economic safety nets, technological acceleration risks widening inequality gaps.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Addressing these complex dynamics requires coordinated institutional frameworks. Educational paradigms must emphasize adaptive problem-solving, interdisciplinary synthesis, and emotional intelligence. Simultaneously, regulatory bodies are tasked with establishing transparent governance structures that balance innovative progress with ethical accountability.</p>
          </div>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <div style={{ display: "inline-block", background: "#0B4F5C", color: "white", fontSize: 12, fontWeight: 700, padding: "3px 12px", borderRadius: 20, marginBottom: 12, letterSpacing: 1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Grade 12 Academic Topic 1B: Cognitive Architecture & Biological Systems</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Biological and cognitive architectures operate through intricate, self-regulating feedback mechanisms. In human neurology, executive functions—including working memory, cognitive flexibility, and inhibitory control—are mediated by complex prefrontal networks. Understanding these physiological mechanisms provides vital insights into human learning and behavioral adaptation.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Recent neuro-imaging investigations emphasize the physiological necessity of systematic recovery cycles. During deep sleep states, specialized waste-clearance mechanisms, such as the glymphatic system, actively remove metabolic bi-products from neural tissue. Simultaneously, synaptic consolidation transfers temporary hippocampal representations into durable neocortical networks.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Environmental stressors and chronic operational strain exert pronounced effects on neural plasticity. Sustained cognitive overload compromises prefrontal activation, heightening emotional reactivity and impairing long-term decision-making accuracy. These empirical findings underscore the biological constraints governing human cognitive capacity.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Mitigating cognitive degradation requires evidence-based lifestyle intervention and structural environment design. Prioritizing systematic sleep hygiene, targeted cognitive exercise, and balanced environmental stimuli preserves neurological health and sustains high-level intellectual performance throughout adulthood.</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#fafafa", borderLeft: "1px solid #e8e8e8" }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#0B4F5C", marginBottom: 20 }}>Questions 1–10 (Multiple Choice)</h3>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {allQuestions.map(q => (
                <div key={q.id} style={{ background: "#f9f9f9", borderRadius: 10, padding: "16px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: 600, color: "#333", marginBottom: 12, lineHeight: 1.5 }}>{q.text}</p>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {q.options.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "flex-start", gap: 8, cursor: "pointer", color: "#333", fontWeight: answers[q.id] === opt ? 700 : 400, lineHeight: 1.5 }}>
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id] === opt} onChange={() => saveAnswer(q.id, opt)} style={{ marginTop: 3, flexShrink: 0 }}/>
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
      <footer style={{background:"#ffffff",borderTop:"1px solid #e0e0e0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,padding:"12px 32px",height:72,flexShrink:0,boxShadow:"0 -2px 8px rgba(0,0,0,0.05)"}}>
        <NavCard href="/L12-test1-section1" label="SECTION 1" active/><NavCard href="/L12-test1-section2" label="SECTION 2" /><NavCard href="/L12-test1-section3" label="SECTION 3" />
        
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
