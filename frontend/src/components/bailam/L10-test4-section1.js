/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "reading-test-4_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-4";

const passage1Questions = [{ id:"p1q1", text:"1. The primary purpose of the passage is to", options:["A. argue that sleep deprivation permanently damages memory", "B. explain the neurological process by which memories become long-term", "C. describe treatments for memory-related disorders", "D. compare different types of intelligence"], answer:"B" },
  { id:"p1q2", text:"2. According to paragraph 2, systems consolidation differs from synaptic consolidation in that it", options:["A. occurs within hours of learning", "B. involves only the hippocampus", "C. happens over a much longer time period", "D. is limited to emotional memories"], answer:"C" },
  { id:"p1q3", text:"3. The word 'durable' in paragraph 1 most nearly means", options:["A. complex", "B. long-lasting", "C. easily retrieved", "D. emotionally significant"], answer:"B" },
  { id:"p1q4", text:"4. Based on the passage, which study design would best demonstrate the sleep-dependent memory consolidation effect?", options:["A. Testing participants immediately after they study new material", "B. Comparing recall of participants who slept after learning versus those who stayed awake", "C. Measuring brain activity during REM sleep", "D. Having participants study the same material for different lengths of time"], answer:"B" },
  { id:"p1q5", text:"5. The passage suggests that cramming is an ineffective study strategy because it", options:["A. causes excessive stress that impairs learning", "B. prevents the testing effect from occurring", "C. does not allow time for consolidation between study sessions", "D. overloads working memory with too much information"], answer:"C" }];

const passage2Questions = [{ id:"p2q1", text:"6. The central problem described in the passage is", options:["A. the high cost of developing new antibiotics", "B. the growing inability of antibiotics to kill resistant bacteria", "C. the overprescription of antibiotics for viral infections", "D. the lack of public awareness about antibiotic misuse"], answer:"B" },
  { id:"p2q2", text:"7. According to paragraph 2, antibiotic resistance develops because", options:["A. bacteria intentionally mutate to survive treatment", "B. patients fail to complete their full course of antibiotics", "C. resistant mutations give bacteria a natural selection advantage", "D. doctors prescribe incorrect doses of antibiotics"], answer:"C" },
  { id:"p2q3", text:"8. The word 'proliferate' in paragraph 2 most nearly means", options:["A. mutate rapidly", "B. become more harmful", "C. multiply and spread", "D. develop immunity"], answer:"C" },
  { id:"p2q4", text:"9. Based on the passage, why have pharmaceutical companies reduced investment in antibiotic development?", options:["A. The science of antibiotic development has become too complex", "B. Short-course antibiotics generate less revenue than chronic disease drugs", "C. Regulatory agencies have made approval too fast", "D. There are already enough effective antibiotics available"], answer:"B" },
  { id:"p2q5", text:"10. Which of the following would best address the market logic problem described in paragraph 3?", options:["A. Requiring doctors to prescribe newer antibiotics over older ones", "B. Creating financial incentives for companies to develop antibiotics despite low revenue", "C. Banning the agricultural use of antibiotics immediately", "D. Extending the course of antibiotic treatment for all infections"], answer:"B" }];

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
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 4 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28, marginBottom:24 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Science of Memory Consolidation</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Human memory is not a single, unified system but a collection of distinct processes that work together to encode, store, and retrieve information. Neuroscientists distinguish between working memory — the limited-capacity system that holds information in conscious awareness for immediate use — and long-term memory, which can store vast quantities of information indefinitely. The conversion of short-term impressions into durable long-term memories is called consolidation, and its mechanisms have become one of the most intensively studied areas in cognitive neuroscience.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Consolidation occurs in two overlapping phases. Synaptic consolidation happens within hours of learning, as molecular changes at the synapse stabilise newly formed connections between neurons. Systems consolidation, which unfolds over weeks, months, or even years, involves the gradual transfer of memories from the hippocampus — a seahorse-shaped brain structure critical for forming new memories — to distributed cortical networks where they become independent of the hippocampus.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Sleep plays a central role in both phases. During slow-wave sleep, the hippocampus repeatedly reactivates recent memories, sending signals to the cortex. During REM sleep, the brain appears to integrate new memories with existing knowledge structures, a process that may explain the creative insights that sometimes follow a night of sleep. Studies in which participants learn material before sleeping consistently show stronger recall than those who learn and are immediately tested, a phenomenon researchers call the sleep-dependent memory consolidation effect.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The implications for education are substantial. Distributed practice — studying material across multiple spaced sessions rather than in a single massed session — allows consolidation to occur between study periods, dramatically improving retention. Testing oneself on material, even before learning it fully, has similarly been shown to enhance later recall, an effect known as the testing effect or retrieval practice premium. These findings suggest that traditional cramming strategies may be among the least effective approaches to acquiring durable knowledge.</p>
          </div>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Antibiotic Resistance: A Growing Global Crisis</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Antibiotics — compounds that kill or inhibit the growth of bacteria — have been among the most transformative medical innovations in history. Since the discovery of penicillin in 1928 and its widespread deployment after World War II, antibiotics have saved hundreds of millions of lives by rendering previously fatal infections treatable. Surgical procedures, cancer chemotherapy, and organ transplantation — all of which require suppressing the immune system or creating vulnerability to infection — would be virtually impossible without reliable antibiotics.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The bacteria these drugs target are, however, subject to natural selection. Any mutation that confers resistance to an antibiotic gives the bacterium a survival advantage; resistant strains proliferate while susceptible ones are killed. This evolutionary pressure is enormously accelerated by the widespread overuse of antibiotics — in human medicine, where they are frequently prescribed for viral infections they cannot treat, and in agriculture, where they are routinely added to animal feed to promote growth. The World Health Organisation estimates that, without corrective action, antimicrobial resistance could cause ten million deaths annually by 2050.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Compounding the crisis is a stark slowdown in the development of new antibiotics. The pipeline of novel antibiotic candidates has dried to a trickle because pharmaceutical development is guided by market logic: antibiotics taken for short courses generate less revenue than drugs for chronic conditions taken indefinitely. The regulatory pathways for antibiotic approval are also complex and expensive. Several large pharmaceutical companies have exited the field entirely in recent years.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Addressing antimicrobial resistance requires a coordinated global response. Stewardship programmes — structured efforts to ensure antibiotics are prescribed only when necessary and in appropriate doses — have demonstrated effectiveness. International agreements to limit agricultural use, incentive structures to revive pharmaceutical investment, and rapid diagnostic tools that allow clinicians to distinguish bacterial from viral infections all form part of a comprehensive strategy that public health experts describe as urgently needed.</p>
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
        <NavCard href="/L10-test4-section1" label="SECTION 1" active />
        <NavCard href="/L10-test4-section2" label="SECTION 2" />
        <NavCard href="/L10-test4-section3" label="SECTION 3" />
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
