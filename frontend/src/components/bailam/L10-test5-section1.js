/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-5";

const passage1Questions = [{ id:"p1q1", text:"1. The Easterlin Paradox, as described in the passage, suggests that", options:["A. poor countries are always less happy than rich ones", "B. rising national income reliably increases happiness", "C. income growth within a country does not consistently raise happiness", "D. absolute income matters more than relative income"], answer:"C" },
  { id:"p1q2", text:"2. According to the Kahneman-Deaton study, above $75,000 per year", options:["A. both emotional well-being and life evaluation plateau", "B. emotional well-being plateaus but life evaluation continues rising", "C. life evaluation plateaus but emotional well-being continues rising", "D. happiness becomes entirely unrelated to income"], answer:"B" },
  { id:"p1q3", text:"3. The word 'hedonic' in paragraph 1 most closely relates to", options:["A. political analysis", "B. objective financial measurement", "C. the study of pleasure and subjective well-being", "D. historical economic theory"], answer:"C" },
  { id:"p1q4", text:"4. Based on the passage, which factor is NOT mentioned as contributing to high happiness rankings?", options:["A. Social trust", "B. Quality of governance", "C. Level of technological innovation", "D. Access to healthcare"], answer:"C" },
  { id:"p1q5", text:"5. The primary purpose of the final paragraph is to", options:["A. argue that GDP should be abandoned as a measure", "B. show that happiness research has begun influencing government policy", "C. explain why Scandinavian countries are economically successful", "D. critique the methodology of happiness surveys"], answer:"B" }];

const passage2Questions = [{ id:"p2q1", text:"6. The central claim of the passage is that", options:["A. all cities should prioritise walkability above all other design factors", "B. the built environment significantly shapes human behaviour and health", "C. broken windows theory is the most important concept in urban planning", "D. climate change is the primary driver of urban design decisions"], answer:"B" },
  { id:"p2q2", text:"7. According to paragraph 2, walkable areas improve health through which mechanisms?", options:["A. Lower crime rates and cleaner air", "B. Reduced car use, more incidental exercise, and more social interaction", "C. Better access to healthcare facilities", "D. Higher property values and economic growth"], answer:"B" },
  { id:"p2q3", text:"8. The word 'robust' as used in paragraph 3 most closely means", options:["A. controversial", "B. surprising", "C. well-supported by evidence", "D. recent and newly discovered"], answer:"C" },
  { id:"p2q4", text:"9. The passage treats broken windows theory with", options:["A. strong endorsement based on multiple studies", "B. outright rejection as discredited", "C. qualified acceptance, noting mixed evidence", "D. indifference, since it is peripheral to the main argument"], answer:"C" },
  { id:"p2q5", text:"10. Based on the final paragraph, governments are increasingly viewing urban design as", options:["A. primarily a matter of aesthetic preference", "B. mainly useful for reducing traffic congestion", "C. a form of public health intervention", "D. an obstacle to economic development"], answer:"C" }];

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

  const saveAnswer = (id, value) => {
    const updated = { ...answers, [id]: value };
    setAnswers(updated);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`, JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  };

  const allQuestions = [...passage1Questions, ...passage2Questions];

  return (
    <div style={{ width:"100%", height:"100vh", display:"flex", flexDirection:"column", background:"#f5f5f5" }}>
      <header style={{ background:"#ffffff", borderBottom:"1px solid #e0e0e0", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:"bold", fontSize:20, color:"#0B4F5C", letterSpacing:1 }}>DUOSTEAM</div>
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 5 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28, marginBottom:24 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Economics of Happiness</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>For most of economic history, rising national income was assumed to be synonymous with rising human welfare. GDP per capita — the total value of goods and services produced, divided by population — became the dominant metric for assessing societal progress. This assumption has been challenged by a growing body of research in the economics of happiness, or hedonic economics, which examines the relationship between objective measures of wealth and subjective well-being.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>One of the most cited findings in this field is the Easterlin Paradox, named after economist Richard Easterlin, who observed in 1974 that while richer countries tend to be happier than poorer ones at any given point in time, increases in per capita income within a country over time do not consistently produce increases in average happiness. The paradox suggests that relative income — how wealthy one is compared to one's peers — may matter more than absolute income above a certain threshold.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Subsequent research has complicated the picture. A landmark 2010 study by economists Daniel Kahneman and Angus Deaton found that emotional well-being increased with income up to approximately $75,000 per year in the United States, but plateaued beyond that level. Life evaluation — how people rate their lives on a satisfaction scale — continued to rise with income, however. This distinction between day-to-day emotional experience and overall life satisfaction has become central to the field.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Countries consistently topping happiness rankings, such as the Scandinavian nations, suggest that GDP is only one component of the equation. Factors such as social trust, quality of governance, freedom from corruption, healthcare access, and work-life balance appear to account for much of the variation in national happiness scores. These findings have begun to influence policy, with several national governments — including those of New Zealand and Bhutan — formally adopting well-being frameworks alongside traditional economic indicators.</p>
          </div>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Architecture of Cities and Human Behaviour</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The built environment — the streets, buildings, public spaces, and infrastructure that humans construct — exerts a profound and often underestimated influence on behaviour, health, and social cohesion. Urban planners and architects have long understood that design choices shape how people move through and use space. But a newer body of interdisciplinary research has begun to quantify these effects with greater precision, revealing that the configuration of cities can influence everything from rates of physical activity to levels of social capital.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>One of the most robust findings concerns the relationship between neighbourhood walkability and health outcomes. Areas with mixed land use — where homes, shops, workplaces, and parks are in close proximity — consistently produce residents who walk more, drive less, and report better physical and mental health. The mechanisms are multiple: walkable areas reduce reliance on cars, encourage incidental physical activity, and create opportunities for social interaction that strengthen community bonds.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Street-level design also affects perceptions of safety and social behaviour. Research on 'broken windows' theory — the idea that visible signs of disorder, such as broken windows or graffiti, encourage further disorder — has generated debate, with some studies supporting the hypothesis and others finding that concentrated poverty, not aesthetics, drives crime rates. What does appear robust is that well-maintained, human-scaled streets with active ground-floor uses — shops, cafes, visible residents — reduce perceived danger and encourage pedestrian presence.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>As cities worldwide confront challenges of rapid urbanisation, climate adaptation, and post-pandemic reconfiguration of work and mobility patterns, urban design is increasingly recognised as a public health intervention. Investments in cycling infrastructure, green space, and transit-oriented development are being evaluated not just for their transportation benefits but for their contributions to physical activity, mental health, and social equity.</p>
          </div>
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"#fafafa", borderLeft:"1px solid #e8e8e8" }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:18, fontWeight:"bold", color:"#0B4F5C", marginBottom:20 }}>Questions 1–10 (Multiple Choice)</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {allQuestions.map((q) => (
                <div key={q.id} style={{ background:"#f9f9f9", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight:600, color:"#333", marginBottom:12, lineHeight:1.5 }}>{q.text}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                    {q.options.map((opt) => (
                      <label key={opt} style={{ display:"flex", alignItems:"flex-start", gap:8, cursor:"pointer", color:"#333", fontWeight:answers[q.id]===opt?700:400, lineHeight:1.5 }}>
                        <input type="radio" name={q.id} value={opt} checked={answers[q.id]===opt} onChange={()=>saveAnswer(q.id,opt)} style={{ marginTop:3, flexShrink:0 }} />
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
        <NavCard href="/L10-test5-section1" label="SECTION 1" active />
        <NavCard href="/L10-test5-section2" label="SECTION 2" />
        <NavCard href="/L10-test5-section3" label="SECTION 3" />
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`, borderRadius:8, padding:"10px 24px", color:active?"#fff":"#333", fontWeight:600, fontSize:14, cursor:"pointer", background:active?"#0B4F5C":"#f9f9f9", transition:"all 0.2s ease" }}
        onMouseEnter={e=>{ if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";} }}
        onMouseLeave={e=>{ if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";} }}
      >{label}</div>
    </Link>
  );
}
