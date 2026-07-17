/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-4";

const passage1Questions = [{ id:"p1q1", text:"1. The primary purpose of the passage is to", options:["A. argue that sleep deprivation permanently damages memory", "B. explain the neurological process by which memories become long-term", "C. describe treatments for memory-related disorders", "D. compare different types of intelligence"], answer:"B" },
  { id:"p1q2", text:"2. According to paragraph 2, systems consolidation differs from synaptic consolidation in that it", options:["A. occurs within hours of learning", "B. involves only the hippocampus", "C. happens over a much longer time period", "D. is limited to emotional memories"], answer:"C" },
  { id:"p1q3", text:"3. The word 'durable' in paragraph 1 most nearly means", options:["A. complex", "B. long-lasting", "C. easily retrieved", "D. emotionally significant"], answer:"B" },
  { id:"p1q4", text:"4. Based on the passage, which study design would best demonstrate the sleep-dependent memory consolidation effect?", options:["A. Testing participants immediately after they study new material", "B. Comparing recall of participants who slept after learning versus those who stayed awake", "C. Measuring brain activity during REM sleep", "D. Having participants study the same material for different lengths of time"], answer:"B" },
  { id:"p1q5", text:"5. The passage suggests that cramming is an ineffective study strategy because it", options:["A. causes excessive stress that impairs learning", "B. prevents the testing effect from occurring", "C. does not allow time for consolidation between study sessions", "D. overloads working memory with too much information"], answer:"C" }];

const passage2Questions = [{ id:"p2q1", text:"6. The main purpose of this passage is to", options:["A. argue that all students must do volunteer work", "B. describe the benefits of volunteering for young people and communities", "C. compare different types of volunteer organisations", "D. explain why volunteering is declining among teenagers"], answer:"B" },
  { id:"p2q2", text:"7. According to the passage, one benefit of volunteering for young people is that", options:["A. they earn money to pay for university", "B. they develop practical skills and gain work experience", "C. they avoid spending time on social media", "D. they receive academic credits at school"], answer:"B" },
  { id:"p2q3", text:"8. The word 'initiative' in paragraph 3 most nearly means", options:["A. a government law", "B. a disagreement or conflict", "C. a new plan or action taken independently", "D. a financial reward"], answer:"C" },
  { id:"p2q4", text:"9. Based on the passage, what is a challenge that volunteer organisations commonly face?", options:["A. Attracting too many volunteers", "B. Keeping volunteers motivated and committed over time", "C. Getting permission from local governments", "D. Finding enough tasks for volunteers to do"], answer:"B" },
  { id:"p2q5", text:"10. Which statement would the author most likely agree with?", options:["A. Volunteering is only useful for people who cannot find paid jobs", "B. Schools should replace all clubs with mandatory community service", "C. Volunteering benefits both the individuals who volunteer and the wider community", "D. Online volunteering is always less effective than in-person volunteering"], answer:"C" }];

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
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Volunteering: Benefits for Young People and Communities</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Volunteering — giving time and effort to help others without payment — is practised by millions of young people around the world. Whether it involves helping at a local food bank, coaching younger children in sport, or cleaning up parks and public spaces, volunteering takes many forms. Despite the variety of activities, most forms of volunteering share a common quality: they benefit both the people being helped and those who are doing the helping.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>For young people, volunteering provides an opportunity to develop practical skills that are difficult to acquire in a classroom. Communication, teamwork, problem-solving, and leadership are all qualities that are regularly practised and strengthened through volunteer work. In addition, volunteering gives teenagers a chance to explore careers they might be interested in. A student considering a career in medicine, for example, might volunteer at a local hospital, gaining first-hand insight before committing to years of study.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Communities also benefit significantly from volunteer initiatives. Organisations that provide services to elderly residents, homeless people, or children from disadvantaged backgrounds often rely heavily on volunteers to operate. Without their support, many of these services simply could not exist. Research has also shown that communities with high levels of volunteering tend to have stronger social connections, greater trust between residents, and lower rates of crime.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Despite these benefits, volunteer organisations often face challenges in keeping their members engaged. Young people lead busy lives, and sustaining commitment over a long period can be difficult. Many organisations have found that offering flexible arrangements, recognising volunteers' contributions publicly, and creating a sense of community within the group are effective strategies for maintaining high levels of participation. Schools and universities also play a role by encouraging students to volunteer and by providing time and resources for them to do so.</p>
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
        <NavCard href="/section1-L10-4" label="SECTION 1" active />
        <NavCard href="/section2-L10-4" label="SECTION 2" />
        <NavCard href="/section3-L10-4" label="SECTION 3" />
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
