"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-L11-1";
const passage1Questions = [{id:"p1q1",text:"1. The primary purpose of the passage is to",options:["A. argue that the 1951 Refugee Convention should be abolished","B. describe the scale and legal complexity of climate-driven displacement","C. explain why Bangladesh is uniquely vulnerable to flooding","D. predict exactly how many people will be displaced by 2050"],answer:"B"},
  {id:"p1q2",text:"2. According to the passage, climate migrants differ from refugees in that",options:["A. they are displaced by greater distances","B. they are not protected by the 1951 Refugee Convention","C. they choose to migrate voluntarily","D. their numbers are smaller than political refugees"],answer:"B"},
  {id:"p1q3",text:"3. The word 'ambiguous' in paragraph 2 most nearly means",options:["A. clearly defined","B. unfair or unjust","C. uncertain or unclear","D. illegal"],answer:"C"},
  {id:"p1q4",text:"4. Based on the passage, which best explains why adaptation alone is insufficient?",options:["A. Adaptation technologies are too expensive for all nations","B. The pace of displacement may exceed adaptation capacity in vulnerable regions","C. International organisations refuse to fund adaptation projects","D. Pacific Island nations have rejected adaptation measures"],answer:"B"},
  {id:"p1q5",text:"5. The World Bank projection mentioned in the passage refers to",options:["A. the current number of climate migrants globally","B. the cost of coastal defence infrastructure","C. the potential number of internally displaced people by 2050","D. the number of nations that will become uninhabitable"],answer:"C"}];
const passage2Questions = [{id:"p2q1",text:"6. Prospect theory challenged classical economics by showing that",options:["A. people always prefer larger sums of money","B. brain imaging can predict economic decisions","C. people evaluate outcomes relative to a reference point and weight losses more heavily than gains","D. the amygdala controls all financial decision-making"],answer:"C"},
  {id:"p2q2",text:"7. The word 'reactivity' in paragraph 3 most closely means",options:["A. chemical activity in the bloodstream","B. the speed at which neurons fire","C. the strength of a brain region's response to stimuli","D. deliberate resistance to emotional responses"],answer:"C"},
  {id:"p2q3",text:"8. Based on the passage, experienced traders differ from novices in that they",options:["A. earn higher returns on financial investments","B. show less amygdala activation when making risky decisions","C. rely entirely on prefrontal cortex processing","D. are less affected by framing effects"],answer:"B"},
  {id:"p2q4",text:"9. The ethical question raised in the final paragraph concerns",options:["A. whether brain imaging should be used in medical diagnosis","B. whether using framing effects to influence behaviour crosses into manipulation","C. whether prospect theory should be applied to criminal sentencing","D. whether emotional decision-making is inherently inferior to analytical thinking"],answer:"B"},
  {id:"p2q5",text:"10. Which of the following best describes the organisation of the passage?",options:["A. A problem is presented and a solution is proposed","B. A theory is described"," neurological evidence is presented"," and implications are discussed","C. Two opposing theories are compared and a conclusion is drawn","D. A historical event is described and its legacy is assessed"],answer:"B"}];

export default function Page() {
  const router = useRouter();
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
  const saveAnswer=(id,value)=>{
    const updated={...answers,[id]:value};
    setAnswers(updated);
    const exam=localStorage.getItem("currentTest")||TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`,JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY,JSON.stringify(updated));
  };
  const allQuestions=[...passage1Questions,...passage2Questions];
  return(
    <div style={{width:"100%",height:"100vh",display:"flex",flexDirection:"column",background:"#f5f5f5"}}>
      <header style={{background:"#ffffff",borderBottom:"1px solid #e0e0e0",padding:"16px 32px",display:"flex",alignItems:"center",justifyContent:"space-between",boxShadow:"0 2px 8px rgba(0,0,0,0.06)",flexShrink:0}}>
        <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 1 — Section 1: SAT Reading (Multiple Choice)</div></div>
        <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28,marginBottom:24}}>
            <div style={{display:"inline-block",background:"#0B4F5C",color:"white",fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:12,letterSpacing:1}}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>Climate Migration: The Next Global Crisis</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Climate change is driving an unprecedented wave of human displacement. Rising sea levels, intensifying droughts, and increasingly frequent extreme weather events are rendering parts of the planet uninhabitable, pushing millions of people — the so-called climate migrants — to relocate within their own countries or across international borders. The World Bank projects that without significant action on emissions and adaptation, up to 216 million people could be forced to migrate within their own regions by 2050.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Unlike refugees fleeing persecution, climate migrants occupy an ambiguous legal status under international law. The 1951 Refugee Convention, which forms the bedrock of international refugee protection, does not recognise environmental displacement as a basis for refugee status. This legal gap leaves climate migrants without the protections afforded to political refugees, creating what experts describe as a protection vacuum at precisely the moment when the scale of displacement is accelerating.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The geography of climate migration is already reshaping societies. In Bangladesh — one of the world's most climate-vulnerable nations, where land is lost to flooding and saltwater intrusion — an estimated 400,000 people per year move to Dhaka, already among the most densely populated cities on Earth. In sub-Saharan Africa, desertification and erratic rainfall are driving farmers off land their families have tended for generations. Pacific Island communities face the prospect of entire nations becoming uninhabitable as sea levels rise.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Adaptation investment offers partial solutions. Coastal defences, drought-resistant crops, and early warning systems can buy time. But many researchers argue that the scale and pace of displacement will ultimately exceed adaptation capacity in the most vulnerable regions, making migration not a failure of policy but a rational survival strategy that international frameworks must urgently recognise and support.</p>
          </div>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <div style={{display:"inline-block",background:"#0B4F5C",color:"white",fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:12,letterSpacing:1}}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>The Neuroscience of Decision-Making Under Risk</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Every decision involving uncertainty engages a complex network of brain regions that weigh potential gains against potential losses. Classic economic theory assumed that human decision-makers are rational agents who calculate expected values — multiplying the probability of an outcome by its magnitude — and choose the option with the highest expected return. Decades of research in behavioural economics and cognitive neuroscience have complicated this picture significantly.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>A foundational insight came from psychologists Daniel Kahneman and Amos Tversky, whose prospect theory demonstrated that people evaluate outcomes relative to a reference point rather than in absolute terms, and that losses loom larger psychologically than equivalent gains — a phenomenon called loss aversion. Brain imaging studies have since identified the amygdala as playing a key role in processing potential losses, with greater amygdala activation correlating with greater reluctance to accept risky choices.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The prefrontal cortex, by contrast, is associated with deliberate, analytical evaluation of options. Research suggests that the relative influence of emotional versus analytical processing depends on factors including time pressure, cognitive load, and individual differences in risk tolerance. Experienced traders, for example, show less amygdala reactivity and more stable prefrontal activation when making financial decisions — a pattern consistent with the hypothesis that expertise involves, in part, down-regulating emotional responses to risk.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>These findings have practical implications beyond finance. Medical decision-making, criminal sentencing, and public health communication all involve choices under uncertainty where emotional and analytical processes interact. Framing effects — the demonstrated tendency for people to respond differently to options presented as gains versus losses — have been used in public health campaigns to nudge behaviour, raising ethical questions about the boundary between legitimate persuasion and manipulation.</p>
          </div>
        </div>
        <div style={{flex:1,overflowY:"auto",padding:28,background:"#fafafa",borderLeft:"1px solid #e8e8e8"}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <h3 style={{fontSize:18,fontWeight:"bold",color:"#0B4F5C",marginBottom:20}}>Questions 1–10 (Multiple Choice)</h3>
            <div style={{display:"flex",flexDirection:"column",gap:20}}>
              {allQuestions.map(q=>(
                <div key={q.id} style={{background:"#f9f9f9",borderRadius:10,padding:"16px 20px",boxShadow:"0 2px 6px rgba(0,0,0,0.05)"}}>
                  <p style={{fontWeight:600,color:"#333",marginBottom:12,lineHeight:1.5}}>{q.text}</p>
                  <div style={{display:"flex",flexDirection:"column",gap:8}}>
                    {q.options.map(opt=>(
                      <label key={opt} style={{display:"flex",alignItems:"flex-start",gap:8,cursor:"pointer",color:"#333",fontWeight:answers[q.id]===opt?700:400,lineHeight:1.5}}>
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id]===opt} onChange={()=>saveAnswer(q.id,opt)} style={{marginTop:3,flexShrink:0}}/>
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
      <footer style={{background:"#ffffff",borderTop:"1px solid #e0e0e0",display:"flex",justifyContent:"center",alignItems:"center",gap:16,padding:"12px 32px",height:72,flexShrink:0,boxShadow:"0 -2px 8px rgba(0,0,0,0.05)"}}>
        <NavCard href="/L11-test1-section1" label="SECTION 1" active/><NavCard href="/L11-test1-section2" label="SECTION 2"/><NavCard href="/L11-test1-section3" label="SECTION 3"/>
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){
  return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);
}
