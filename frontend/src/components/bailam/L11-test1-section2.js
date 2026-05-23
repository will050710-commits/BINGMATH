"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-L11-1_section2";
const SECTION="section2";
const TEST_KEY="reading-test-L11-1";
const questions=["1. Nuclear energy currently generates approximately 17 percent of global electricity.",
  "2. Nuclear fission produces electricity through a process that is entirely different in principle from fossil fuel power generation.",
  "3. France has one of the lowest per-capita electricity carbon footprints in Europe.",
  "4. Radioactive waste from nuclear plants becomes safe within a few decades.",
  "5. Small modular reactors are already operating at full commercial scale in multiple countries."];
const options=["TRUE","FALSE","NOT GIVEN"];

export default function Page(){
  const router=useRouter();
  const [time,setTime]=useState("");
  const [answers,setAnswers]=useState({});
  useEffect(()=>{
    localStorage.setItem("currentTest",TEST_KEY);
    const exam=localStorage.getItem("currentTest")||TEST_KEY;
    const timerExists=localStorage.getItem(`end-${TEST_KEY}`);
    if(!timerExists){clearTestSession(TEST_KEY);startTimer(TEST_KEY,60);}
    const saved=localStorage.getItem(`${exam}_${SECTION}`)||localStorage.getItem(LEGACY_KEY);
    if(saved)setTimeout(()=>setAnswers(JSON.parse(saved)),0);
    const interval=setInterval(()=>{
      const remain=getRemainingTime(TEST_KEY);
      setTime(formatTime(remain));
      if(remain<=0){clearInterval(interval);router.push("/ketqua");}
    },1000);
    return()=>clearInterval(interval);
  },[router]);
  const saveAnswer=(q,value)=>{
    const updated={...answers,[q]:value};
    setAnswers(updated);
    const exam=localStorage.getItem("currentTest")||TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`,JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY,JSON.stringify(updated));
  };
  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:"#f5f5f5"}}>
      <header style={{background:"#ffffff",borderBottom:"1px solid #e0e0e0",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",flexShrink:0}}>
        <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 1 — Section 2: IELTS True / False / Not Given</div></div>
        <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>The History and Future of Nuclear Energy</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Nuclear power generates electricity through the controlled fission of uranium or plutonium atoms, releasing enormous quantities of energy from very small amounts of fuel. First developed commercially in the 1950s, nuclear energy provided approximately 10 percent of global electricity generation in 2023, down from a peak of 17 percent in the 1990s following the Chernobyl and Fukushima accidents, which prompted several nations to phase out or reduce their nuclear fleets.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The physics of nuclear fission involves splitting heavy atomic nuclei — typically uranium-235 or plutonium-239 — by bombarding them with neutrons. This releases energy and additional neutrons, which can trigger further fissions in a chain reaction. In a reactor, this chain reaction is maintained at a controlled rate using moderating materials and control rods. The heat generated is used to produce steam, which drives turbines to generate electricity — a process similar in principle to fossil fuel plants, but without combustion.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The case for nuclear energy as a low-carbon electricity source has regained prominence in debates about climate change mitigation. Nuclear plants produce minimal greenhouse gas emissions during operation and provide reliable baseload power — electricity available continuously regardless of weather conditions — unlike wind and solar, which are intermittent. France generates approximately 70 percent of its electricity from nuclear, maintaining one of the lowest per-capita electricity carbon footprints in Europe.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Concerns about nuclear energy focus on the management of radioactive waste, which remains hazardous for thousands of years, the risk of accidents, and the high capital costs of new plant construction. A new generation of reactor designs — including small modular reactors (SMRs) and designs based on thorium rather than uranium — promises greater safety and potentially lower costs, though these technologies remain largely unproven at commercial scale.</p>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:28,background:"#fafafa",borderLeft:"1px solid #e8e8e8"}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <h3 style={{fontSize:18,fontWeight:"bold",color:"#0B4F5C",marginBottom:8}}>Questions 1–5</h3>
            <p style={{fontSize:14,color:"#777",marginBottom:20,lineHeight:1.6}}>Write <strong>TRUE</strong>, <strong>FALSE</strong>, or <strong>NOT GIVEN</strong>.</p>
            <div style={{display:"flex",flexDirection:"column",gap:16}}>
              {questions.map((q,i)=>(
                <div key={i} style={{background:"#f9f9f9",borderRadius:10,padding:"16px 20px",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <p style={{fontWeight:600,color:"#333",marginBottom:12,lineHeight:1.6}}>{q}</p>
                  <div style={{display:"flex",gap:20,flexWrap:"wrap"}}>
                    {options.map(opt=>(<label key={opt} style={{display:"flex",alignItems:"center",gap:8,cursor:"pointer",color:"#333",fontWeight:answers[i]===opt?700:400}}><input type="radio" name={`q${i}`} value={opt} checked={answers[i]===opt} onChange={()=>saveAnswer(i,opt)}/>{opt}</label>))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer style={{background:"#ffffff",borderTop:"1px solid #e0e0e0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,padding:"12px 32px",height:72,flexShrink:0,boxShadow:"0 -2px 8px rgba(0,0,0,0.05)"}}>
        <NavCard href="/L11-test1-section1" label="SECTION 1"/><NavCard href="/L11-test1-section2" label="SECTION 2" active/><NavCard href="/L11-test1-section3" label="SECTION 3"/>
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){
  return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);
}
