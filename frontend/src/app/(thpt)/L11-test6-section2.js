"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const LEGACY_KEY="readingTest_section2";const SECTION="section2";const TEST_KEY="reading-test-L11-6";
const questions=["1. Lithium-ion battery costs increased by approximately 90 percent between 2010 and 2023.","2. Pumped hydropower currently provides the majority of global energy storage capacity.","3. Lithium-ion batteries are cost-effective for both short- and long-duration storage requirements.","4. Green hydrogen is produced by using renewable electricity to split water through electrolysis.","5. Most analysts expect green hydrogen to reach cost competitiveness in some applications by the early 2030s."];const options=["TRUE","FALSE","NOT GIVEN"];
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
      <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 6 — Section 2: IELTS True / False / Not Given</div></div>
      <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
    </header>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:28}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
          <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>Renewable Energy Storage Solutions</h3><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The intermittency of wind and solar power — the fact that generation depends on weather conditions rather than demand — is a central engineering challenge for grids seeking to rely heavily on renewables. When the sun does not shine and the wind does not blow, alternative sources of electricity must fill the gap; when generation exceeds demand, surplus energy is either wasted or must be stored. The development of cost-effective, large-scale energy storage is therefore widely regarded as essential to deep decarbonisation of electricity systems.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Lithium-ion batteries — the technology that powers smartphones and electric vehicles — have dominated grid-scale storage deployment in recent years, with costs falling by approximately 90 percent between 2010 and 2023. Grid-scale lithium-ion installations, capable of discharging electricity for four to eight hours, are now economically competitive with gas peaking plants in many markets. However, lithium-ion batteries are less cost-effective for longer-duration storage requirements — those of twelve hours or more — which limits their ability to address seasonal variability in renewable generation.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>A range of alternative storage technologies are under development. Pumped hydropower — which uses surplus electricity to pump water to an elevated reservoir, releasing it through turbines when electricity is needed — is the most established long-duration storage technology, providing approximately 90 percent of current global energy storage capacity. Flow batteries, compressed air energy storage, gravity-based systems, and hydrogen produced through electrolysis are among the longer-duration alternatives attracting research investment.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Hydrogen has attracted particular interest as a potential long-duration storage medium and as a decarbonisation pathway for sectors that are difficult to electrify, including heavy industry and shipping. Green hydrogen — produced by using renewable electricity to split water into hydrogen and oxygen through electrolysis — is currently more expensive than hydrogen produced from fossil fuels, but costs are falling rapidly as electrolyser technology improves and renewable electricity prices decline. Most analysts project that green hydrogen will reach cost competitiveness in some applications by the early 2030s.</p>
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
      <NavCard href="/section1-L11-6" label="SECTION 1"/><NavCard href="/section2-L11-6" label="SECTION 2" active/><NavCard href="/section3-L11-6" label="SECTION 3"/>
    </footer>
  </div>);
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
