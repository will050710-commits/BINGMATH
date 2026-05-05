"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-L11-2";
const passage1Questions = [{id:"p1q1",text:"1. Synthetic biology, as described in the passage, treats living cells as",options:["A. subjects for basic scientific research only","B. programmable platforms for rational redesign","C. sources of naturally occurring therapeutic proteins","D. models for understanding evolutionary processes"],answer:"B"},
  {id:"p1q2",text:"2. According to paragraph 2, engineered nitrogen-fixing microorganisms could reduce",options:["A. tumour cell proliferation in cancer patients","B. the use of synthetic fertilisers whose production consumes significant energy","C. greenhouse gas emissions from livestock","D. dependence on imported food commodities"],answer:"B"},
  {id:"p1q3",text:"3. The word 'sequestering' in paragraph 3 most nearly means",options:["A. releasing gradually","B. capturing and storing","C. breaking down chemically","D. detecting and measuring"],answer:"B"},
  {id:"p1q4",text:"4. Based on the passage, biosafety frameworks like the Cartagena Protocol are considered inadequate because",options:["A. they were designed before modern synthetic biology techniques existed","B. they focus only on agricultural applications","C. they prohibit all release of engineered organisms","D. they lack international enforcement mechanisms"],answer:"A"},
  {id:"p1q5",text:"5. Which of the following best describes the author's overall stance toward synthetic biology?",options:["A. Enthusiastically supportive with no reservations","B. Largely positive but acknowledging significant governance challenges","C. Deeply sceptical of claimed applications","D. Neutral"," presenting only factual information without evaluation"],answer:"B"}];
const passage2Questions = [{id:"p2q1",text:"6. The urban heat island effect is primarily caused by",options:["A. increased industrial activity in city centres","B. air pollution blocking outgoing radiation","C. multiple factors including impervious surfaces and reduced vegetation","D. concentrated human body heat in densely populated areas"],answer:"C"},
  {id:"p2q2",text:"7. The 2003 European heatwave is cited in the passage to",options:["A. illustrate the failure of government emergency response systems","B. demonstrate the deadly consequences of urban heat for vulnerable populations","C. support the argument that cities should ban air conditioning","D. show that heatwaves are becoming more frequent"],answer:"B"},
  {id:"p2q3",text:"8. According to the passage, increasing urban tree cover by 10 percent could",options:["A. eliminate the urban heat island effect entirely","B. reduce local peak temperatures by roughly 1°C","C. decrease air pollution by 10 percent","D. reduce heatwave mortality by half"],answer:"B"},
  {id:"p2q4",text:"9. The word 'impervious' in paragraph 1 most nearly means",options:["A. resistant to penetration by water","B. dangerously hot in summer","C. made from artificial materials","D. unable to reflect sunlight"],answer:"A"},
  {id:"p2q5",text:"10. Based on the passage, climate change is expected to affect urban heat islands by",options:["A. reducing the frequency of heatwaves in coastal cities","B. increasing wind speeds that help cool urban areas","C. lowering the intensity of the urban heat island effect","D. raising baseline temperatures and increasing heatwave frequency"],answer:"D"}];

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
        <div><div style={{fontWeight:"bold",fontSize:20,color:"#0B4F5C",letterSpacing:1}}>DUOSTEAM</div><div style={{color:"#555",fontSize:14,marginTop:2}}>Bilingual Math Test 2 — Section 1: SAT Reading (Multiple Choice)</div></div>
        <div style={{background:"#fff0f0",border:"1px solid #ffcccc",borderRadius:8,padding:"8px 20px",fontWeight:600,fontSize:18,color:"#c00"}}>⏱ {time}</div>
      </header>
      <div style={{display:"flex",flex:1,overflow:"hidden"}}>
        <div style={{flex:1,overflowY:"auto",padding:28}}>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28,marginBottom:24}}>
            <div style={{display:"inline-block",background:"#0B4F5C",color:"white",fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:12,letterSpacing:1}}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>Synthetic Biology: Engineering Life</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Synthetic biology — the design and construction of new biological parts, devices, and systems, or the re-design of existing natural biological systems — sits at the intersection of molecular biology, engineering, and computational science. Drawing on tools including CRISPR gene editing, DNA synthesis, and bioinformatics, practitioners of synthetic biology aim to treat living cells as programmable platforms that can be rationally redesigned to perform desired functions.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The potential applications span an extraordinary range. In medicine, synthetic biology approaches are being used to engineer bacteria that can sense and destroy tumour cells, produce insulin and other therapeutic proteins at scale, and create living diagnostics that change colour in the presence of disease biomarkers. In agriculture, engineered microorganisms are being developed to fix nitrogen from the atmosphere, potentially reducing dependence on synthetic fertilisers whose production accounts for approximately 2 percent of global energy consumption.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Environmental applications are equally ambitious. Researchers have designed microorganisms capable of degrading specific plastic polymers, breaking down pollutants in contaminated soil, and even sequestering carbon dioxide from the atmosphere. Biosensors — biological systems engineered to detect and signal the presence of particular chemicals — are being developed for environmental monitoring and food safety testing.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The biosafety and governance challenges posed by synthetic biology are substantial. The deliberate release of engineered organisms into natural environments raises concerns about ecological disruption, horizontal gene transfer to wild populations, and the creation of unforeseen dependencies. International frameworks for biosafety — principally the Cartagena Protocol on Biosafety — predate the modern synthetic biology era and are widely regarded as inadequate for governing the current pace of innovation.</p>
          </div>
          <div style={{background:"#ffffff",borderRadius:12,boxShadow:"0 4px 12px rgba(0,0,0,0.08)",padding:28}}>
            <div style={{display:"inline-block",background:"#0B4F5C",color:"white",fontSize:12,fontWeight:700,padding:"3px 12px",borderRadius:20,marginBottom:12,letterSpacing:1}}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{fontSize:20,fontWeight:"bold",color:"#0B4F5C",marginBottom:16}}>The Urban Heat Island Effect</h3>
            <p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Cities are measurably warmer than the surrounding rural countryside — a phenomenon known as the urban heat island (UHI) effect. The temperature differential, which can reach 8°C or more in large metropolitan areas during calm, sunny conditions, results from a combination of factors: the replacement of vegetation and soil with impervious surfaces such as concrete and asphalt that absorb and retain solar heat; the reduction of evapotranspiration, the cooling process by which plants release water vapour; waste heat from vehicles, air conditioning units, and industrial processes; and the canyon-like geometry of city streets, which traps re-radiated heat.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>The health consequences of urban heat are significant. Heatwaves — already the deadliest form of extreme weather in many regions — are intensified and prolonged in cities. The elderly, people with cardiovascular or respiratory conditions, outdoor workers, and low-income residents who lack access to air conditioning bear a disproportionate burden. The 2003 European heatwave, which killed an estimated 70,000 people, demonstrated with brutal clarity the lethality of sustained heat in densely populated areas.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Mitigation strategies operate at multiple scales. At the building level, cool roofs — surfaces with high solar reflectance — and green roofs, planted with vegetation, can significantly reduce surface temperatures. At the neighbourhood scale, urban tree canopies provide shading and evaporative cooling; research suggests that increasing urban tree cover by 10 percent can reduce local peak temperatures by approximately 1°C. At the city scale, urban planning decisions — street orientation, building height-to-width ratios, and the preservation of parks and waterways — shape the overall UHI intensity.</p>
<p style={{color:"#333",lineHeight:1.85,marginBottom:12}}>Climate change is expected to amplify urban heat islands by raising baseline temperatures, increasing heatwave frequency, and potentially reducing wind speeds that help disperse heat. Urban adaptation strategies are therefore increasingly urgent, though they face challenges including high implementation costs, tenure complexity in dense urban areas, and the risk that increased tree cover in some contexts may actually trap pollutants at street level.</p>
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
        <NavCard href="/section1-L11-2" label="SECTION 1" active/><NavCard href="/section2-L11-2" label="SECTION 2"/><NavCard href="/section3-L11-2" label="SECTION 3"/>
      </footer>
    </div>
  );
}
function NavCard({href,label,active}){
  return(<Link href={href} style={{textDecoration:"none"}}><div style={{border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`,borderRadius:8,padding:"10px 24px",color:active?"#fff":"#333",fontWeight:600,fontSize:14,cursor:"pointer",background:active?"#0B4F5C":"#f9f9f9",transition:"all 0.2s ease"}} onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}} onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}} >{label}</div></Link>);
}
