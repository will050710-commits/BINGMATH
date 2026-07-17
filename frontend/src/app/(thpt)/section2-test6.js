"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section2";
const SECTION = "section2";
const TEST_KEY = "reading-test-6";
const questions = ["1. CRISPR-Cas9 technology was originally derived from a bacterial immune system.",
  "2. The Nobel Prize for CRISPR development was awarded in 2012, the same year the technology was developed.",
  "3. Casgevy was the first CRISPR-based medical therapy to receive regulatory approval.",
  "4. All countries regulate CRISPR-edited crops under the same frameworks as traditional GMOs.",
  "5. He Jiankui received widespread support from the international scientific community for his germline editing experiment."];
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
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 6 — Section 2: IELTS True / False / Not Given</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Gene Editing and the CRISPR Revolution</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>CRISPR-Cas9 — a molecular tool adapted from a bacterial immune system — has transformed the field of genetic engineering since its development as a precise gene-editing technology in 2012. Unlike earlier methods, which were expensive, slow, and imprecise, CRISPR allows researchers to target specific DNA sequences with high accuracy and edit, delete, or replace them at relatively low cost and in a fraction of the time. The 2020 Nobel Prize in Chemistry was awarded to Jennifer Doudna and Emmanuelle Charpentier for its development.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>In medicine, CRISPR has shown early but striking promise. Clinical trials are underway for conditions including sickle cell disease, beta-thalassaemia, and certain forms of inherited blindness. In 2023, regulators in the United Kingdom and the United States approved the first CRISPR-based therapy — Casgevy — for the treatment of sickle cell disease, marking a landmark moment in the history of genetic medicine. Researchers are also investigating CRISPR's potential in oncology, using it to engineer patients' immune cells to better recognise and attack tumour cells.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Agricultural applications are equally significant. CRISPR can be used to develop crop varieties with improved disease resistance, drought tolerance, or nutritional profiles, often without introducing foreign DNA — a distinction that some regulatory systems treat differently from traditional genetically modified organisms (GMOs). Several countries, including the United States and Japan, have established that some CRISPR-edited crops fall outside existing GMO regulatory frameworks, potentially accelerating their path to market.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The technology also raises profound ethical questions. In 2018, Chinese scientist He Jiankui announced the birth of twin girls whose embryos he had edited using CRISPR, claiming to have conferred resistance to HIV infection. The announcement provoked near-universal condemnation from the scientific community: the editing had targeted germline cells, meaning the changes would be heritable, the experiment lacked adequate safety evidence, and informed consent processes were questioned. He was subsequently imprisoned. The episode underscored the urgent need for international governance frameworks to guide the responsible development of human germline editing.</p>
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
        <NavCard href="/section1-L10-6" label="SECTION 1" />
        <NavCard href="/section2-L10-6" label="SECTION 2" active />
        <NavCard href="/section3-L10-6" label="SECTION 3" />
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
