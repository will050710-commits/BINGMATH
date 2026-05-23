"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-4_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-4";
const questions = ["1. Visible matter — stars, galaxies, and gas — makes up roughly 27 percent of the universe's total content.",
  "2. Vera Rubin's galaxy rotation observations were the first evidence ever proposed for dark matter.",
  "3. WIMPs interact with ordinary matter through gravity and the weak nuclear force.",
  "4. All underground dark matter detection experiments have confirmed the presence of WIMPs.",
  "5. Some physicists propose that modifications to gravity theory could eliminate the need for dark matter."];
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
    <div style={{ width:"100%", height:"100vh", display:"flex", flexDirection:"column", background:"#f5f5f5" }}>
      <header style={{ background:"#ffffff", borderBottom:"1px solid #e0e0e0", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:"bold", fontSize:20, color:"#0B4F5C", letterSpacing:1 }}>DUOSTEAM</div>
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 4 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Dark Matter and the Invisible Universe</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The universe that we can see — all the stars, galaxies, planets, and gas clouds visible with telescopes — constitutes only about five percent of its total mass-energy content. Approximately 27 percent is believed to consist of dark matter: a substance that does not emit, absorb, or reflect light and is therefore invisible to all conventional telescopes, yet exerts gravitational effects on visible matter that can be measured and mapped.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Evidence for dark matter emerged in the 1930s when Swiss astronomer Fritz Zwicky measured the velocities of galaxies in the Coma Cluster and found they were moving far too fast to be held together by the gravity of visible matter alone. In the 1970s, Vera Rubin and Kent Ford's observations of galaxy rotation curves provided compelling independent evidence: the outer regions of spiral galaxies orbit at speeds that should tear them apart unless surrounded by a halo of invisible mass. These findings have since been corroborated by gravitational lensing — the bending of light from distant objects by the gravitational field of intervening matter — and by the cosmic microwave background radiation.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Despite overwhelming indirect evidence for dark matter's existence, its fundamental nature remains unknown. The leading candidate for several decades has been weakly interacting massive particles (WIMPs), hypothetical subatomic particles that interact with ordinary matter only through gravity and the weak nuclear force. Numerous experiments designed to detect WIMPs directly — including underground detectors shielded from cosmic radiation — have so far returned null results, leading some physicists to consider alternative candidates such as axions or sterile neutrinos.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>A minority of physicists argue that dark matter may not exist at all, suggesting instead that the anomalies attributed to it might be explained by modifications to the theory of gravity. Modified Newtonian Dynamics (MOND) and its relativistic extensions can account for some observations but struggle to explain others, particularly the behaviour of galaxy clusters in collision events. The mainstream consensus remains that dark matter is real, but the quest to identify its particle nature continues.</p>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"#fafafa", borderLeft:"1px solid #e8e8e8" }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:18, fontWeight:"bold", color:"#0B4F5C", marginBottom:8 }}>Questions 1–5</h3>
            <p style={{ fontSize:14, color:"#777", marginBottom:20, lineHeight:1.6 }}>Do the following statements agree with the information given in the passage?<br/>Write <strong>TRUE</strong> if the statement agrees, <strong>FALSE</strong> if it contradicts, <strong>NOT GIVEN</strong> if there is no information.</p>
            <div style={{ display:"flex", flexDirection:"column", gap:16 }}>
              {questions.map((q,i)=>(
                <div key={i} style={{ background:"#f9f9f9", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight:600, color:"#333", marginBottom:12, lineHeight:1.6 }}>{q}</p>
                  <div style={{ display:"flex", gap:20, flexWrap:"wrap" }}>
                    {options.map(opt=>(
                      <label key={opt} style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer", color:"#333", fontWeight:answers[i]===opt?700:400 }}>
                        <input type="radio" name={`q${i}`} value={opt} checked={answers[i]===opt} onChange={()=>saveAnswer(i,opt)} />
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
        <NavCard href="/L10-test4-section1" label="SECTION 1" />
        <NavCard href="/L10-test4-section2" label="SECTION 2" active />
        <NavCard href="/L10-test4-section3" label="SECTION 3" />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`, borderRadius:8, padding:"10px 24px", color:active?"#fff":"#333", fontWeight:600, fontSize:14, cursor:"pointer", background:active?"#0B4F5C":"#f9f9f9", transition:"all 0.2s ease" }}
        onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}}
        onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}}
      >{label}</div>
    </Link>
  );
}
