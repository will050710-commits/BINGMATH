"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-L11-2_section2";
const SECTION="section2";
const TEST_KEY="reading-test-L11-2";
const questions=["1. Vaccines protect against disease by introducing a weakened form of a pathogen that causes mild illness.",
  "2. Edward Jenner's vaccination principle was derived from his observation that cowpox exposure appeared to protect against smallpox.",
  "3. Smallpox was the first human disease to be eradicated through vaccination.",
  "4. mRNA vaccines deliver antigen proteins directly into the bloodstream.",
  "5. The WHO identified vaccine hesitancy as a global health threat before the COVID-19 pandemic."];
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
        <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 2 — Section 2: IELTS True / False / Not Given</div></div>
        <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>Vaccines: Mechanism, History, and Hesitancy</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Vaccines work by introducing an antigen — a molecule that the immune system recognises as foreign — into the body without causing disease. This stimulates the immune system to produce antibodies and, crucially, to generate immunological memory: specialised cells that persist long after the initial exposure and can mount a rapid defence if the real pathogen is encountered. The result is protection against infection or severe disease without the risks of natural infection.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The history of vaccination begins with Edward Jenner's 1796 observation that milkmaids who had contracted cowpox appeared immune to smallpox. Jenner's subsequent demonstration that deliberate inoculation with cowpox material protected against smallpox established the principle of vaccination — from the Latin vacca, meaning cow. Over the following two centuries, vaccines were developed against dozens of infectious diseases; smallpox was declared eradicated in 1980, the only human disease to have been eliminated through vaccination.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Modern vaccines employ diverse mechanisms. Traditional inactivated or attenuated vaccines use killed or weakened pathogens. Subunit vaccines introduce specific proteins from a pathogen. The mRNA vaccines developed for COVID-19 introduced a new platform: rather than delivering antigen directly, they deliver genetic instructions that prompt the body's own cells to produce the antigen. This approach offers manufacturing speed and flexibility advantages that have attracted significant ongoing investment.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Vaccine hesitancy — defined by the World Health Organisation as the reluctance or refusal to vaccinate despite the availability of vaccines — was identified by the WHO in 2019 as one of the ten greatest threats to global health. Contributing factors include misinformation spread through social media, distrust of pharmaceutical companies and government health authorities, and concerns about side effects that, while typically mild, are occasionally more serious. Research suggests that addressing hesitancy requires community engagement, trusted messengers, and clear communication about risk-benefit profiles rather than simply correcting factual misinformation.</p>
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
        <NavCard href="/L11-test2-section1" label="SECTION 1"/><NavCard href="/L11-test2-section2" label="SECTION 2" active/><NavCard href="/L11-test2-section3" label="SECTION 3"/>
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){
  return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);
}
