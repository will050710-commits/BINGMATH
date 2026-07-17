"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const LEGACY_KEY="readingTest_section2";const SECTION="section2";const TEST_KEY="reading-test-L11-5";
const questions=["1. The EU AI Act requires all AI systems to be fully transparent and explainable to users.","2. Deep neural networks often produce decisions without explanations humans can understand.","3. The EU's approach to AI governance prioritises innovation speed over rights protection.","4. AI systems inevitably embed value choices about how to balance competing priorities.","5. China, the United States, and the EU have adopted identical frameworks for AI governance."];const options=["TRUE","FALSE","NOT GIVEN"];
export default function Page(){
  const router=useRouter();const [time,setTime]=useState("");const [answers,setAnswers]=useState({});
  useEffect(()=>{
    localStorage.setItem("currentTest",TEST_KEY);const exam=localStorage.getItem("currentTest")||TEST_KEY;
    const timerExists=localStorage.getItem(`end-${TEST_KEY}`);
    if(!timerExists){clearTestSession(TEST_KEY);startTimer(TEST_KEY,60);}
    const saved=localStorage.getItem(`${exam}_${SECTION}`)||localStorage.getItem(LEGACY_KEY);
    if(saved)setTimeout(()=>setAnswers(JSON.parse(saved)),0);
    const interval=setInterval(()=>{const remain=getRemainingTime(TEST_KEY);setTime(formatTime(remain));if(remain<=0){clearInterval(interval);router.push("/ketqua");}},1000);
    return()=>clearInterval(interval);
  },[router]);
  const saveAnswer=(q,value)=>{const updated={...answers,[q]:value};setAnswers(updated);const exam=localStorage.getItem("currentTest")||TEST_KEY;localStorage.setItem(`${exam}_${SECTION}`,JSON.stringify(updated));localStorage.setItem(LEGACY_KEY,JSON.stringify(updated));};
  return(<div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:"#f5f5f5"}}>
    <header style={{background:"#fff",borderBottom:"1px solid #e0e0e0",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",flexShrink:0}}>
      <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 5 — Section 2: IELTS True / False / Not Given</div></div>
      <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
    </header>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:28}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
          <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>The Ethics of Artificial Intelligence</h3><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Artificial intelligence systems are increasingly making or informing decisions that affect people's lives in profound ways — determining credit scores, influencing medical diagnoses, assisting in criminal sentencing, and filtering job applications. This expansion of AI decision-making has brought renewed attention to fundamental questions about fairness, accountability, transparency, and the appropriate scope of automated systems. These concerns have given rise to the field of AI ethics, which draws on philosophy, law, computer science, and social science.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>One central concern is the problem of explainability. Many powerful AI systems — particularly deep neural networks — operate as 'black boxes': they produce outputs without providing explanations that humans can understand and evaluate. This opacity creates challenges for accountability: if an AI system denies someone a loan or contributes to a criminal sentence, the inability to explain the reasoning makes it difficult to identify errors, challenge decisions, or establish responsibility. The EU AI Act addresses this by requiring high-risk AI systems to be sufficiently transparent for meaningful human oversight.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The question of whose values AI systems should reflect is equally complex. AI systems are designed by specific teams in specific cultural contexts, trained on data that reflects existing social patterns, and deployed globally across diverse societies with different ethical frameworks. Decisions about how to balance competing values — efficiency versus fairness, privacy versus security, individual autonomy versus collective welfare — are embedded in AI systems, often without explicit acknowledgement.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Emerging governance frameworks reflect different philosophical traditions. The EU's approach is precautionary and rights-based, prioritising the protection of fundamental rights over innovation speed. The United States has historically favoured a more permissive, innovation-first approach, though this is evolving. China has introduced its own AI regulations, with a particular emphasis on national security and social stability. Whether an effective international governance framework for AI can emerge despite these differences is among the most consequential open questions in global technology policy.</p>
        </div>
      </div>
      <div style={{flex:1,overflowY:"auto",padding:28,background:"#fafafa",borderLeft:"1px solid #e8e8e8"}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
          <h3 style={{fontSize:18,fontWeight:"bold",color:"#0B4F5C",marginBottom:8}}>Questions 1–5</h3>
          <p style={{fontSize:14,color:"#777",marginBottom:20,lineHeight:1.6}}>Write <strong>TRUE</strong>, <strong>FALSE</strong>, or <strong>NOT GIVEN</strong>.</p>
          <div style={{display:"flex",flexDirection:"column",gap:16}}>
            {questions.map((q,i)=>(<div key={i} style={{background:"#f9f9f9",borderRadius:10,padding:"16px 20px",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
              <p style={{fontWeight:600,color:"#333",marginBottom:12,lineHeight:1.6}}>{q}</p>
              <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                {options.map(opt=>(<label key={opt} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:"#333",fontWeight:answers[i]===opt?700:400}}>
                  <input type="radio" name={`q${i}`} value={opt} checked={answers[i]===opt} onChange={()=>saveAnswer(i,opt)}/>{opt}
                </label>))}
              </div>
            </div>))}
          </div>
        </div>
      </div>
    </div>
    <footer style={{background:"#fff",borderTop:"1px solid #e0e0e0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,padding:"12px 32px",height:72,flexShrink:0,boxShadow:"0 -2px 8px rgba(0,0,0,0.05)"}}>
      <NavCard href="/section1-L11-5" label="SECTION 1"/><NavCard href="/section2-L11-5" label="SECTION 2" active/><NavCard href="/section3-L11-5" label="SECTION 3"/>
    </footer>
  </div>);
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
