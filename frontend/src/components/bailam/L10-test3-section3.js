"use client";
import { startTimer, getRemainingTime, formatTime, getTimeSpent } from "@/utils/testTimer";
import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { gradeTest } from "@/utils/grader";
import { useRouter } from "next/navigation";

const LEGACY_KEY = "readingTest_section3";
const SECTION = "section3";
const TEST_KEY = "reading-test-3";

const mathProblems = [
  { id:1, source:"Grade 10 — Semester I Exam, Nguyen Trai High School, 2023–2024", label:"Problem 1", parts:["a) Solve the system of inequalities: 2x − 1 > 3 and x + 4 < 10.", "b) Find all integers x satisfying: −2 ≤ 3x − 1 < 8."], fields:["Answer (a):", "Answer (b):"] },
  { id:2, source:"Grade 10 — Mid-term Exam, Ly Tu Trong High School, 2023–2024", label:"Problem 2", parts:["a) Given f(x) = x² − 3x + 2. Find the zeros of f(x).", "b) Determine the vertex and axis of symmetry of y = −x² + 4x − 3."], fields:["Answer (a):", "Answer (b):"] },
  { id:3, source:"Grade 10 — Semester I Exam, Tran Hung Dao High School, 2023–2024", label:"Problem 3", parts:["a) A committee of 3 is to be chosen from 5 men and 4 women. In how many ways can this be done if the committee must include at least 1 woman?", "b) How many 3-digit numbers can be formed using digits 1, 2, 3, 4, 5 with no repetition?"], fields:["Answer (a):", "Answer (b):"] },
  { id:4, source:"Grade 10 — Semester I Exam, Dinh Tien Hoang High School, 2022–2023", label:"Problem 4", parts:["Given triangle OAB in the coordinate plane with O(0,0), A(4,0), B(2,3).", "a) Find the coordinates of the centroid G of triangle OAB.", "b) Find the equation of the line passing through A and B."], fields:["Answer (a) — G:", "Answer (b) — line AB:"] },
  { id:5, source:"Grade 10 — End-of-Year Exam, Nguyen Hue High School, 2022–2023", label:"Problem 5", parts:["Given →u = (1, −2) and →v = (3, 1).", "a) Compute |→u| and |→v|.", "b) Find the angle θ between →u and →v (to the nearest degree)."], fields:["Answer (a):", "Answer (b) — θ:"] }
];

export default function Page() {
  const router = useRouter();
  const [time, setTime] = useState("");
  const [answers, setAnswers] = useState({});

  useEffect(() => {
    localStorage.setItem("currentTest", TEST_KEY);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    const timerExists = localStorage.getItem(`end-${TEST_KEY}`);
    if (timerExists) {
      const saved = localStorage.getItem(`${exam}_${SECTION}`) || localStorage.getItem(LEGACY_KEY);
      if (saved) setAnswers(JSON.parse(saved));
    } else {
      localStorage.removeItem(`${exam}_${SECTION}`);
      localStorage.removeItem(LEGACY_KEY);
    }
  }, []);

  const saveAnswer = (key, value) => {
    const updated = { ...answers, [key]: value };
    setAnswers(updated);
    const exam = localStorage.getItem("currentTest") || TEST_KEY;
    localStorage.setItem(`${exam}_${SECTION}`, JSON.stringify(updated));
    localStorage.setItem(LEGACY_KEY, JSON.stringify(updated));
  };

  const submitTest = useCallback(() => {
    const seconds = getTimeSpent(TEST_KEY);
    localStorage.setItem("lastTimeSpent", seconds);
    gradeTest();
    router.push("/ketqua");
  }, []);

  useEffect(() => {
    startTimer(TEST_KEY, 60);
    const interval = setInterval(() => {
      const remain = getRemainingTime(TEST_KEY);
      setTime(formatTime(remain));
      if (remain <= 0) { clearInterval(interval); submitTest(); }
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={{ width:"100%", height:"100vh", display:"flex", flexDirection:"column", background:"#f5f5f5" }}>
      <header style={{ background:"#ffffff", borderBottom:"1px solid #e0e0e0", padding:"16px 32px", display:"flex", alignItems:"center", justifyContent:"space-between", boxShadow:"0 2px 8px rgba(0,0,0,0.06)", flexShrink:0 }}>
        <div>
          <div style={{ fontWeight:"bold", fontSize:20, color:"#0B4F5C", letterSpacing:1 }}>DUOSTEAM</div>
          <div style={{ color:"#555", fontSize:14, marginTop:2 }}>Bilingual Math Test 3 — Section 3: Short-Answer Math (Grade 10)</div>
        </div>
        <div style={{ background:"#fff0f0", border:"1px solid #ffcccc", borderRadius:8, padding:"8px 20px", fontWeight:600, fontSize:18, color:"#c00" }}>⏱ {time}</div>
      </header>
      <div style={{ display:"flex", flex:1, overflow:"hidden" }}>
        <div style={{ flex:1, overflowY:"auto", padding:28 }}>
          {mathProblems.map(prob=>(
            <div key={prob.id} style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28, marginBottom:20 }}>
              <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:8 }}>
                <div style={{ background:"#0B4F5C", color:"white", fontWeight:700, fontSize:13, padding:"3px 14px", borderRadius:20 }}>{prob.label}</div>
                <div style={{ fontSize:12, color:"#999", fontStyle:"italic" }}>Source: {prob.source}</div>
              </div>
              {prob.parts.map((p,j)=>(
                <p key={j} style={{ color:"#333", lineHeight:1.8, marginBottom:6 }}>{p}</p>
              ))}
            </div>
          ))}
        </div>
        <div style={{ flex:1, overflowY:"auto", padding:28, background:"#fafafa", borderLeft:"1px solid #e8e8e8" }}>
          <div style={{ background:"#ffffff", borderRadius:12, boxShadow:"0 4px 12px rgba(0,0,0,0.08)", padding:28 }}>
            <h3 style={{ fontSize:18, fontWeight:"bold", color:"#0B4F5C", marginBottom:20 }}>Your Answers</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
              {mathProblems.map(prob=>(
                <div key={prob.id} style={{ background:"#f9f9f9", borderRadius:10, padding:"16px 20px", boxShadow:"0 2px 6px rgba(0,0,0,0.05)" }}>
                  <p style={{ fontWeight:700, color:"#0B4F5C", marginBottom:12 }}>{prob.label}</p>
                  <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                    {prob.fields.map((placeholder,i)=>{
                      const key=`${prob.id}-${i}`;
                      return (<input key={i} type="text" value={answers[key]||""} onChange={e=>saveAnswer(key,e.target.value)} placeholder={placeholder}
                        style={{ width:"100%", border:"1.5px solid #d0d0d0", borderRadius:8, padding:"10px 14px", fontSize:15, color:"black", outline:"none", background:"#fff", boxSizing:"border-box" }}
                        onFocus={e=>e.target.style.borderColor="#0B4F5C"} onBlur={e=>e.target.style.borderColor="#d0d0d0"} />);
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <footer style={{ background:"#ffffff", borderTop:"1px solid #e0e0e0", display:"flex", justifyContent:"center", alignItems:"center", gap:16, padding:"12px 32px", height:72, flexShrink:0, boxShadow:"0 -2px 8px rgba(0,0,0,0.05)" }}>
        <NavCard href="/L10-test3-section1" label="SECTION 1" />
        <NavCard href="/L10-test3-section2" label="SECTION 2" />
        <NavCard href="/L10-test3-section3" label="SECTION 3" active />
        <button onClick={submitTest} style={{ background:"#c00", color:"white", border:"none", borderRadius:8, padding:"10px 28px", fontWeight:600, fontSize:15, cursor:"pointer" }}
          onMouseEnter={e=>e.currentTarget.style.background="#a00"} onMouseLeave={e=>e.currentTarget.style.background="#c00"}>Nộp bài</button>
      </footer>
    </div>
  );
}

function NavCard({ href, label, active }) {
  return (
    <Link href={href} style={{ textDecoration:"none" }}>
      <div style={{ border:`2px solid ${active?"#0B4F5C":"#d0d0d0"}`, borderRadius:8, padding:"10px 24px", color:active?"#fff":"#333", fontWeight:600, fontSize:14, cursor:"pointer", background:active?"#0B4F5C":"#f9f9f9", transition:"all 0.2s ease" }}
        onMouseEnter={e=>{if(!active){e.currentTarget.style.background="#0B4F5C";e.currentTarget.style.color="#fff";e.currentTarget.style.borderColor="#0B4F5C";}}}
        onMouseLeave={e=>{if(!active){e.currentTarget.style.background="#f9f9f9";e.currentTarget.style.color="#333";e.currentTarget.style.borderColor="#d0d0d0";}}}
      >{label}</div>
    </Link>
  );
}
