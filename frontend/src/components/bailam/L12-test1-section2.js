"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-L12-1_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-L12-1";
const questions = ["1. Commercial developments in this domain have accelerated rapidly over the past decade.","2. Opponents and critics argue that current resource allocation is completely equitable.","3. Empirical evidence confirms that key environmental and biological indicators have been affected.","4. International treaties and regulatory frameworks were originally designed for modern commercial consumer scale.","5. Global scientific consensus recommends updating governance structures and international cooperation."];
const options = ["TRUE", "FALSE", "NOT GIVEN"];

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
  const saveAnswer = (q, value) => {
    const updated = { ...answers, [q]: value };
    setAnswers(updated);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`, JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  };
  return (
    <div style={{ width: "100%", height: "100vh", display: "flex", flexDirection: "column", background: "#f5f5f5" }}>
      <header style={{ background: "#ffffff", borderBottom: "1px solid #e0e0e0", padding: "16px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", boxShadow: "0 2px 8px rgba(0,0,0,0.06)", flexShrink: 0 }}>
        <div><div style={{ fontWeight: "bold", fontSize: 20, color: "#0B4F5C", letterSpacing: 1 }}>DUOSTEAM</div><div style={{ color: "#555", fontSize: 14, marginTop: 2 }}>Bilingual Math Test 1 — Section 2: IELTS True / False / Not Given (Grade 12)</div></div>
        <div style={{ background: "#fff0f0", border: "1px solid #ffcccc", borderRadius: 8, padding: "8px 20px", fontWeight: 600, fontSize: 18, color: "#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <div style={{ flex: 1, overflowY: "auto", padding: 28 }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 20, fontWeight: "bold", color: "#0B4F5C", marginBottom: 16 }}>Grade 12 Academic Topic 1C: Environmental & Industrial Policy Analysis</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Global industrial operations and environmental governance face critical inflection points in the twenty-first century. Rapid technological adoption and expanding consumer markets have heightened resource consumption, generating complex ecological externalities across terrestrial and marine ecosystems.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Socio-economic analysts analyze the balance between economic expansion and environmental preservation. While technological innovation yields cleaner production methodologies and renewable energy storage systems, global waste management infrastructure often lags behind material production rates.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Regulatory frameworks, such as international biodiversity agreements and extended producer responsibility legislation, attempt to establish enforceable sustainability benchmarks. However, jurisdictional enforcement challenges and geopolitical economic disparities complicate global compliance.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Experts stress that achieving long-term systemic stability demands circular economic integration. Redesigning products for durability, establishing modular recycling networks, and fostering international policy alignment represent essential steps toward ecological resilience.</p>
          </div>
        </div>
        <div style={{ flex: 1, overflowY: "auto", padding: 28, background: "#fafafa", borderLeft: "1px solid #e8e8e8" }}>
          <div style={{ background: "#ffffff", borderRadius: 12, boxShadow: "0 4px 12px rgba(0,0,0,0.08)", padding: 28 }}>
            <h3 style={{ fontSize: 18, fontWeight: "bold", color: "#0B4F5C", marginBottom: 8 }}>Questions 1–5</h3>
            <p style={{ color: "#666", fontSize: 14, marginBottom: 20 }}>Do the following statements agree with the information given in the passage?</p>
            <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
              {questions.map((q, idx) => (
                <div key={idx} style={{ background: "#f9f9f9", borderRadius: 10, padding: "16px 20px", boxShadow: "0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight: 600, color: "#333", marginBottom: 12, lineHeight: 1.5 }}>{q}</p>
                  <div style={{ display: "flex", gap: 16 }}>
                    {options.map(opt => (
                      <label key={opt} style={{ display: "flex", alignItems: "center", gap: 6, cursor: "pointer", color: "#333", fontWeight: answers[idx] === opt ? 700 : 400 }}>
                        <input type="radio" name={`q-${idx}`} value={opt} checked={answers[idx] === opt} onChange={() => saveAnswer(idx, opt)}/>
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
        <NavCard href="/L12-test1-section1" label="SECTION 1" /><NavCard href="/L12-test1-section2" label="SECTION 2" active/><NavCard href="/L12-test1-section3" label="SECTION 3" />
        
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
