"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
const LEGACY_KEY="readingTest_section2";const SECTION="section2";const TEST_KEY="reading-test-L11-4";
const questions=["1. In Asch's conformity experiments, all participants gave incorrect answers when confederates did so.","2. The presence of a single dissenter from the incorrect group significantly reduced conformity rates.","3. Conformity rates were higher in individualistic cultures than in collectivist cultures in Asch's research.","4. Normative social influence occurs when people conform because they believe the group has superior knowledge.","5. Groupthink has been linked to poor collective decision-making in organisational and policy contexts."];const options=["TRUE","FALSE","NOT GIVEN"];
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
      <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 4 — Section 2: IELTS True / False / Not Given</div></div>
      <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
    </header>
    <div style={{display:"flex",flex:1,overflow:"hidden"}}>
      <div style={{flex:1,overflowY:"auto",padding:28}}>
        <div style={{background:"#fff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
          <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>The Psychology of Social Conformity</h3><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Solomon Asch's conformity experiments, conducted in the 1950s, remain among the most widely cited demonstrations of social influence in psychology. In the experiments, participants were asked to match the length of a line to one of three comparison lines — a task with an objectively correct answer. When confederates of the experimenter deliberately gave the same incorrect answer, approximately 75 percent of participants conformed at least once, and around 32 percent of responses were incorrect overall. Asch concluded that the pressure to conform with a unanimous group could override individuals' direct perceptual evidence.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Subsequent research identified moderating factors. The likelihood of conformity decreased dramatically when even a single other person gave the correct answer — breaking the unanimity of the incorrect group. Conformity was also higher in collectivist cultures, where group harmony is more highly valued than individual assertion, than in individualistic cultures. Tasks where the correct answer was more ambiguous produced higher conformity rates than tasks with clear objective answers.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Informational and normative social influence represent two distinct mechanisms. Informational influence occurs when people conform because they genuinely believe the group has superior knowledge — particularly in ambiguous situations. Normative influence occurs when people conform to avoid social disapproval or ostracism, even when they privately believe the group is wrong. Brain imaging studies have found that conforming with a group that contradicts one's own perception is associated with activity in brain regions linked to social pain, suggesting that social exclusion and physical pain may share neural substrates.</p><p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The implications of conformity research extend beyond the laboratory. Groupthink — the tendency for cohesive groups to prioritise harmony and suppress dissent, leading to poor collective decisions — has been implicated in organisational failures and policy disasters. Understanding when and why individuals defer to group opinion, and designing environments that protect space for dissent, has become a priority in fields ranging from aviation safety to corporate governance.</p>
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
      <NavCard href="/L11-test4-section1" label="SECTION 1"/><NavCard href="/L11-test4-section2" label="SECTION 2" active/><NavCard href="/L11-test4-section3" label="SECTION 3"/>
    </footer>
  </div>);
}
function NavCard({href,label,active}){return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);}
