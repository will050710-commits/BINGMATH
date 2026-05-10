"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-3";
const questions = ["1. The gut microbiome encodes more genes than the entire human genome.",
  "2. Infants born by caesarean section typically have identical microbiomes to vaginally born infants.",
  "3. High-fibre diets are consistently associated with greater gut microbial diversity.",
  "4. Scientists have definitively proven that gut bacteria directly cause depression in humans.",
  "5. Fermented foods can increase the number of beneficial bacterial species in the gut."];
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
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 3 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Microbiome and Human Health</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The human body is host to trillions of microorganisms — bacteria, fungi, viruses, and archaea — collectively called the microbiome. The gut microbiome alone, residing primarily in the large intestine, contains approximately 100 trillion microbial cells and encodes nearly 150 times more genes than the human genome. Far from being passive tenants, these microorganisms play active roles in digestion, immune system development, synthesis of vitamins, and even the regulation of mood and behaviour through what researchers have termed the gut-brain axis.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The composition of the gut microbiome is shaped by a multitude of factors including mode of birth, early diet, antibiotic exposure, geographic location, and long-term dietary patterns. Infants born vaginally acquire microbes from the birth canal, while those born by caesarean section are colonised primarily by skin and environmental bacteria — a difference that some researchers associate with altered immune development. Breastfeeding further shapes the infant microbiome through the transfer of beneficial bacteria and oligosaccharides that serve as microbial food.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Diet in adulthood is among the most powerful modifiers of microbial diversity. High-fibre diets rich in vegetables, legumes, and whole grains consistently support greater microbial diversity, which is generally associated with better health outcomes. Conversely, highly processed diets low in fibre are associated with reduced diversity and changes in microbial composition linked to increased inflammation and metabolic disease. Fermented foods — including yoghurt, kimchi, kefir, and sauerkraut — appear to directly enrich the microbiome with beneficial bacterial species.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The relationship between the microbiome and the brain is an area of intense current research. Animal studies have shown that germ-free mice — raised without any microbiome — display abnormal stress responses and anxiety-like behaviours that can be partially reversed by introducing specific bacterial strains. In humans, correlations have been identified between altered gut microbiome composition and conditions including depression, anxiety, and autism spectrum disorder, though establishing causal relationships in humans remains methodologically challenging.</p>
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
        <NavCard href="/L10-test3-section1" label="SECTION 1" />
        <NavCard href="/L10-test3-section2" label="SECTION 2" active />
        <NavCard href="/L10-test3-section3" label="SECTION 3" />
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
