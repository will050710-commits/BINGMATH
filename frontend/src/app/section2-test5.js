"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-5";
const questions = ["1. A truckload of textiles is landfilled or incinerated approximately once every second worldwide.",
  "2. Cotton covers more than 10 percent of global farmland.",
  "3. Synthetic fibres release microplastic particles into waterways during the washing process.",
  "4. All major fashion brands have implemented binding supply-chain regulations since the Rana Plaza collapse.",
  "5. Researchers argue that individual consumer choices alone are sufficient to solve fast fashion's environmental problems."];
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
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 5 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Fast Fashion and Environmental Cost</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The fashion industry is among the most resource-intensive sectors in the global economy. The rise of 'fast fashion' — a business model centred on rapidly cycling through large volumes of low-cost garments that reflect current trends — has dramatically accelerated consumption while compressing garment lifespans. The Ellen MacArthur Foundation estimates that a truckload of textiles is either landfilled or incinerated every second globally, while the average garment is worn only seven to ten times before disposal.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The environmental footprint of textile production is vast. Cotton cultivation, which accounts for approximately 24 percent of global insecticide use despite covering only 2.4 percent of farmland, is a significant source of chemical pollution and water consumption — a single cotton t-shirt requires roughly 2,700 litres of water to produce. Synthetic fibres, which now account for the majority of textiles produced, shed microscopic plastic particles called microfibres during washing, contributing substantially to microplastic pollution in waterways and oceans.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Garment manufacturing is also associated with poor labour conditions in many producer countries. The 2013 collapse of the Rana Plaza factory complex in Bangladesh, which killed 1,134 workers who had been ordered to work in a building with visible structural cracks, brought international attention to the human cost of cheap fashion. Although some major brands subsequently joined transparency initiatives, critics argue that meaningful improvement in supply chain conditions requires binding regulation rather than voluntary pledges.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Consumer responses to fast fashion's problems are growing, including the rise of secondhand markets, clothing rental platforms, and the slow fashion movement, which advocates for durable, ethically produced garments purchased less frequently. However, the scale of these alternatives remains small relative to overall fashion consumption. Researchers note that individual behavioural change, while valuable, is insufficient without structural shifts in how fashion is produced, priced, and regulated.</p>
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
        <NavCard href="/section1-L10-5" label="SECTION 1" />
        <NavCard href="/section2-L10-5" label="SECTION 2" active />
        <NavCard href="/section3-L10-5" label="SECTION 3" />
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
