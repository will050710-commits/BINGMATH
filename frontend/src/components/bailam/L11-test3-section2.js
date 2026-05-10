"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const LEGACY_KEY="readingTest_section2";const SECTION="section2";const TEST_KEY="reading-test-L11-3";
const questions=["1. Space programme technologies have contributed to a range of everyday consumer products.","2. NASA's annual budget has remained at approximately 4.4 percent of the US federal budget since the Apollo era.","3. The 1967 Outer Space Treaty explicitly permits private companies to extract and own resources from asteroids.","4. SpaceX's Falcon 9 significantly reduced the cost of delivering cargo to low Earth orbit.","5. Some critics argue that resources spent on human deep-space exploration could more effectively address terrestrial problems."];const options=["TRUE","FALSE","NOT GIVEN"];
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
      <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 3 — Section 2: IELTS True / False / Not Given</div></div>
      <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
    </header>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:28}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
          <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>Space Exploration: Costs, Benefits, and Ethics</h3><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Space exploration has delivered substantial scientific and technological returns since the launch of Sputnik 1 in 1957. Technologies developed for space programmes — including memory foam, water purification filters, scratch-resistant lenses, and the cameras in smartphones — have found widespread applications in everyday life. Space-based systems underpin global positioning, weather forecasting, telecommunications, and disaster monitoring. Scientific knowledge gained from planetary exploration, astronomy, and microgravity research would be unobtainable by other means.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The financial costs of space exploration are substantial but often overstated in popular discourse. NASA's annual budget, which peaked at approximately 4.4 percent of the US federal budget during the Apollo era, now represents approximately 0.5 percent — roughly $25 billion in 2023. The private sector has transformed the economics of launch services: SpaceX's Falcon 9 rocket reduced the cost of delivering cargo to low Earth orbit by a factor of approximately ten compared with previous vehicles, and the company's Starship system promises further reductions.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The emergence of commercial space companies has raised questions about the governance of space resources and the appropriate role of private enterprise beyond Earth's atmosphere. The 1967 Outer Space Treaty prohibits national appropriation of celestial bodies but does not explicitly address resource extraction by private entities. Several countries, including the United States and Luxembourg, have enacted national legislation allowing their companies to own resources extracted from asteroids and other celestial bodies, a legal framework whose compatibility with the Outer Space Treaty remains contested.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Human spaceflight — particularly missions beyond low Earth orbit — raises acute ethical questions about risk, resource allocation, and the obligations of wealthy spacefaring nations to those without such capabilities. Proponents of returning to the Moon and eventual Mars missions argue that the long-term survival of humanity requires becoming a multi-planetary species. Critics contend that the resources devoted to human deep-space exploration could more effectively address pressing terrestrial problems, and that the benefits of exploration should be shared equitably rather than accruing primarily to wealthy nations and companies.</p>
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
      <NavCard href="/L11-test3-section1" label="SECTION 1"/><NavCard href="/L11-test3-section2" label="SECTION 2" active/><NavCard href="/L11-test3-section3" label="SECTION 3"/>
    </footer>
  </div>);
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
