/* eslint-disable react/no-unescaped-entities */
"use client";
import { startTimer, getRemainingTime, formatTime, clearTestSession } from "@/utils/testTimer";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section1";
const SECTION = "section1";
const TEST_KEY = "reading-test-6";

const passage1Questions = [{ id:"p1q1", text:"1. The primary purpose of the passage is to", options:["A. argue that deep-sea mining should be immediately prohibited", "B. describe the state of deep-sea exploration and the tensions around its resources", "C. celebrate recent technological advances in ocean research", "D. explain the biology of hydrothermal vent ecosystems"], answer:"B" },
  { id:"p1q2", text:"2. According to paragraph 2, modern AUVs have enabled scientists to", options:["A. send humans to depths previously inaccessible", "B. conduct deep surveys without continuous human control", "C. eliminate the need for sonar technology", "D. map the entire ocean floor at high resolution"], answer:"B" },
  { id:"p1q3", text:"3. The word 'elusive' in paragraph 4 most nearly means", options:["A. dangerous", "B. confidential", "C. difficult to achieve", "D. unjust"], answer:"C" },
  { id:"p1q4", text:"4. The passage presents deep-sea mining proponents as arguing that", options:["A. the ecological impacts are already well understood", "B. cobalt and nickel are not necessary for the energy transition", "C. extraction could supply battery metals with less surface-area impact than land mining", "D. the ISA has already developed an adequate regulatory framework"], answer:"C" },
  { id:"p1q5", text:"5. Critics of deep-sea mining are concerned primarily because", options:["A. the technology for extraction is not yet reliable", "B. most of the resources are in territorial waters", "C. the ecosystems being disturbed are poorly understood and slow to recover", "D. international law does not permit deep-sea extraction"], answer:"C" }];

const passage2Questions = [{ id:"p2q1", text:"6. The central tension described in the passage is between", options:["A. platform companies and traditional taxi firms", "B. the flexibility gig work offers and the precarity it can create", "C. minimum wage laws and free market competition", "D. UK employment law and California employment law"], answer:"B" },
  { id:"p2q2", text:"7. According to the passage, classifying gig workers as independent contractors allows platforms to", options:["A. pay them higher rates than salaried employees", "B. give them more flexible working hours", "C. avoid obligations including minimum wage and employment protections", "D. access a larger pool of potential workers"], answer:"C" },
  { id:"p2q3", text:"8. The word 'precarity' in paragraph 1 most nearly means", options:["A. creativity and innovation", "B. financial insecurity and instability", "C. excessive regulation", "D. a sense of professional autonomy"], answer:"B" },
  { id:"p2q4", text:"9. Studies on gig worker earnings suggest that net pay", options:["A. consistently exceeds minimum wage when all factors are included", "B. is often below minimum wage once costs and unpaid waiting time are accounted for", "C. varies primarily based on the worker's level of education", "D. is higher than reported because tips are not included in official data"], answer:"B" },
  { id:"p2q5", text:"10. A 'portable benefits system' as described in the passage would address the gig economy problem by", options:["A. requiring all gig workers to become full-time employees", "B. attaching benefits to individual workers regardless of which platform they use", "C. subsidising platform companies to provide better pay", "D. banning algorithmic management of worker performance"], answer:"B" }];

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
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 6 — Section 1: SAT Reading (Multiple Choice)</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28, marginBottom:24 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 1 — Questions 1–5</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>Deep-Sea Exploration: The Final Frontier</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The deep ocean — broadly defined as water below 200 metres, where sunlight no longer penetrates — covers more than 95 percent of Earth's habitable volume and remains among the least explored environments on the planet. Despite covering over half of Earth's surface, less than 20 percent of the ocean floor has been mapped at high resolution, and direct human observation of the deep sea has been limited to a tiny fraction of this vast domain. In the words of oceanographer Robert Ballard, we know more about the surface of Mars than we do about the ocean floor.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>This knowledge gap has begun to narrow as advances in remotely operated vehicles (ROVs), autonomous underwater vehicles (AUVs), and underwater acoustics have dramatically expanded researchers' ability to survey the deep. Modern AUVs can operate for days without human intervention, collecting high-resolution sonar maps, water samples, and imagery across thousands of square kilometres. These technologies have enabled discoveries that have fundamentally revised scientific understanding: vast hydrothermal vent systems supporting ecosystems powered not by sunlight but by chemosynthesis, seamounts harbouring extraordinary biodiversity, and deep-water coral forests that dwarf their tropical counterparts in age and size.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Commercial interest has complicated the scientific picture. Deep-sea mining — the extraction of polymetallic nodules, cobalt-rich crusts, and seafloor massive sulphides from the ocean floor — is attracting growing investment as demand for battery metals including cobalt, nickel, and manganese accelerates with the energy transition. Proponents argue that deep-sea extraction could supply these critical minerals with a smaller surface footprint than terrestrial mining. Critics counter that the ecological impacts of seafloor disturbance — on slow-growing, poorly understood ecosystems that may take centuries to recover — are inadequately characterised.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The governance of deep-sea resources remains contested. Under the United Nations Convention on the Law of the Sea, the International Seabed Authority (ISA) is responsible for regulating mining in international waters. In 2021, a 'two-year rule' was triggered requiring the ISA to develop a regulatory framework, but agreement on protective standards has proved elusive as state and commercial interests compete with conservation objectives. Scientists and civil society groups have called for a moratorium on commercial deep-sea mining until sufficient baseline data are available to assess and manage environmental risk.</p>
          </div>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <div style={{ display:"inline-block", background:"#0B4F5C", color:"white", fontSize:12, fontWeight:700, padding:"3px 12px", borderRadius:20, marginBottom:12, letterSpacing:1 }}>PASSAGE 2 — Questions 6–10</div>
            <h3 style={{ fontSize:20, fontWeight:"bold", color:"#0B4F5C", marginBottom:16 }}>The Gig Economy: Flexibility and Precarity</h3>
            <p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The gig economy — a labour market characterised by short-term contracts, freelance work, and platform-mediated task completion rather than permanent employment — has grown rapidly in the past decade. Platforms such as ride-hailing services, food delivery applications, and freelance marketplaces connect millions of workers with consumers and clients, often providing income flexibility that traditional employment cannot. For some workers, particularly those managing care responsibilities or pursuing portfolio careers, gig work offers genuine autonomy. For others, it represents economic precarity dressed up as entrepreneurial freedom.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Central to debates about gig work is the question of worker classification. Most platform companies classify their workers as independent contractors rather than employees, which exempts them from obligations including minimum wage guarantees, overtime pay, employer contributions to social insurance, and protections against unfair dismissal. This classification has been challenged in courts across multiple jurisdictions: the UK Supreme Court ruled in 2021 that Uber drivers are 'workers' entitled to minimum wage and holiday pay; California's Proposition 22, which classified drivers as contractors, was initially struck down before being reinstated on appeal.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>Research on gig worker earnings paints a complex picture. Studies in several countries have found that while headline hourly rates can appear competitive, accounting for time spent waiting for jobs, vehicle maintenance, insurance costs, and the absence of employment benefits frequently reveals net earnings below minimum wage. Moreover, algorithmic management — the use of automated systems to assign tasks, set pay rates, and rate workers — creates new forms of workplace control that critics argue replicate or exceed the intensity of traditional supervision while stripping workers of the protections that accompanied it.</p>
<p style={{ color:"#333", lineHeight:1.85, marginBottom:12 }}>The policy response is evolving. Several jurisdictions have introduced or are considering legislation that would extend basic protections to gig workers without necessarily converting them to full employees. Portable benefits systems — in which benefits are attached to workers rather than to specific employers and accumulate across multiple gig engagements — represent one proposed model. As artificial intelligence accelerates the automation of tasks currently performed by human gig workers, the urgency of establishing sustainable frameworks for platform labour has intensified.</p>
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
        <NavCard href="/L10-test6-section1" label="SECTION 1" active />
        <NavCard href="/L10-test6-section2" label="SECTION 2" />
        <NavCard href="/L10-test6-section3" label="SECTION 3" />
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
