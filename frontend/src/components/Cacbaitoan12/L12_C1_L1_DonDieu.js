"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/authContext";
import Link from "next/link";
import DuoTranslate from "../DuoMCB/DuoTranslate";

const SH = ({ icon, title }) => (
  <div style={{ display:"flex",alignItems:"center",gap:12,fontSize:22,fontWeight:700,color:"#38bdf8",marginBottom:20,paddingBottom:12,borderBottom:"2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

const RS = ({ items, onReset, scoreLabel, t }) => (
  <div style={{ background: "rgba(255,255,255,0.05)", padding: 24, borderRadius: 12, border: "1px solid rgba(255,255,255,0.1)" }}>
    <div style={{ textAlign:"center",marginBottom:24 }}>
      <div style={{ fontSize:48,marginBottom:8 }}>{items.filter(i=>i.correct).length===items.length?"🏆":items.filter(i=>i.correct).length>=items.length*0.6?"👍":"💪"}</div>
      <div style={{ fontSize:26,fontWeight:700,color:"white" }}>{items.filter(i=>i.correct).length} / {items.length}</div>
      <div style={{ color:"#93c5fd",fontSize:16,marginTop:4 }}>{scoreLabel}</div>
    </div>
    <div style={{ display:"flex",flexDirection:"column",gap:12,marginBottom:24 }}>
      {items.map((item,idx)=>(
        <div key={idx} style={{ padding:"14px 18px",borderRadius:10,background:item.correct?"rgba(16,185,129,0.15)":"rgba(239,68,68,0.15)",border:`1px solid ${item.correct?"rgba(16,185,129,0.3)":"rgba(239,68,68,0.3)"}` }}>
          <div style={{ display:"flex",alignItems:"flex-start",gap:10 }}>
            <span style={{ fontSize:18,flexShrink:0 }}>{item.correct?"✅":"❌"}</span>
            <div style={{ flex:1 }}>
              <div style={{ fontSize:15,fontWeight:600,color:"white",marginBottom:4 }}>{t("Câu","Q")} {idx+1}: {item.qText}</div>
              {!item.correct&&<div style={{ fontSize:14,color:"#fca5a5" }}>{t("Đáp án đúng:","Correct:")} <strong>{item.correctText}</strong></div>}
              {item.yourText&&!item.correct&&<div style={{ fontSize:14,color:"#cbd5e1" }}>{t("Bạn chọn:","You chose:")} {item.yourText}</div>}
            </div>
          </div>
        </div>
      ))}
    </div>
    <div style={{ textAlign:"center" }}>
      <button onClick={onReset} style={{ padding:"10px 24px",background:"#0284c7",color:"white",border:"none",borderRadius:8,fontWeight:600,fontSize:15,cursor:"pointer",transition:"background 0.2s" }} onMouseEnter={e=>e.currentTarget.style.background="#0369a1"} onMouseLeave={e=>e.currentTarget.style.background="#0284c7"}>🔄 {t("Chơi lại","Play Again")}</button>
    </div>
  </div>
);

export default function L12_C1_L1_DonDieu() {
  const { user, saveGameResult } = useAuth();
  const [lang,setLang]=useState("vi");
  const [activeTab, setActiveTab]=useState("w");
  
  // MCQ state
  const [mi,setMi]=useState(0),[ms,setMs]=useState(null),[msc,setMsc]=useState(0),[md,setMd]=useState(false),[mh,setMh]=useState([]);
  
  // TF state
  const [ti,setTi]=useState(0),[tf,setTf]=useState(false),[ts,setTs]=useState(0),[td,setTd]=useState(false),[th,setTh]=useState([]);

  const t=(vi,en)=>lang==="vi"?vi:en;

  const mcQ=[
    {
      q:t("Nếu f'(x) > 0 với mọi x thuộc khoảng (a, b) thì hàm số f(x) có tính chất gì trên khoảng đó?","If f'(x) > 0 for all x in the interval (a, b), what property does the function f(x) have on that interval?"),
      o:[t("Đồng biến (Tăng)","Increasing"),t("Nghịch biến (Giảm)","Decreasing"),t("Không đổi","Constant"),t("Vừa tăng vừa giảm","Both increasing and decreasing")],
      a:0,
      ex:t("Theo định lý về mối liên hệ giữa đạo hàm và tính đơn điệu, f'(x) > 0 thì hàm số đồng biến.","By the theorem linking derivatives and monotonicity, if f'(x) > 0, the function is increasing.")
    },
    {
      q:t("Tìm các khoảng đồng biến của hàm số y = x² - 4x + 3?","Find the increasing intervals of the function y = x² - 4x + 3?"),
      o:["(-∞; 2)","(2; +∞)","(-∞; +∞)","(1; 3)"],
      a:1,
      ex:t("Ta có y' = 2x - 4. y' > 0 ⇔ x > 2. Do đó hàm số đồng biến trên khoảng (2; +∞).","We have y' = 2x - 4. y' > 0 ⇔ x > 2. Thus the function is increasing on (2; +∞).")
    },
    {
      q:t("Điều kiện để điểm x₀ là điểm cực đại của hàm số f(x) liên tục là gì?","What is the condition for point x₀ to be a local maximum of a continuous function f(x)?"),
      o:[t("Đạo hàm f'(x) đổi dấu từ dương sang âm khi qua x₀","f'(x) changes sign from positive to negative when passing x₀"),t("Đạo hàm f'(x) đổi dấu từ âm sang dương khi qua x₀","f'(x) changes sign from negative to positive when passing x₀"),t("Đạo hàm f'(x) không đổi dấu khi qua x₀","f'(x) does not change sign"),t("Đạo hàm luôn bằng 0","Derivative is always zero")],
      a:0,
      ex:t("Nếu đạo hàm đổi dấu từ dương sang âm, đồ thị đi lên rồi đi xuống, tạo thành điểm cực đại.","If f'(x) changes from positive to negative, the graph goes up then down, forming a local maximum.")
    },
    {
      q:t("Hàm số y = x³ - 3x có bao nhiêu điểm cực trị?","How many local extrema does the function y = x³ - 3x have?"),
      o:["0","1","2","3"],
      a:2,
      ex:t("y' = 3x² - 3 = 0 ⇔ x = ±1. Đạo hàm đổi dấu qua cả hai điểm này, nên hàm số có 2 điểm cực trị.","y' = 3x² - 3 = 0 ⇔ x = ±1. Since y' changes sign passing both points, there are 2 local extrema.")
    }
  ];

  const tfC=[
    {s:t("Nếu f'(x) = 0 với mọi x thuộc khoảng (a, b) thì hàm số f(x) là hàm hằng trên khoảng đó.","If f'(x) = 0 for all x in the interval (a, b), then f(x) is a constant function on that interval."),a:true,ex:t("ĐÚNG — Đạo hàm bằng 0 trên khoảng tương ứng với hàm hằng.","TRUE — Zero derivative on an interval corresponds to a constant function.")},
    {s:t("Nếu f'(x₀) = 0 thì x₀ chắc chắn là điểm cực trị của hàm số.","If f'(x₀) = 0, then x₀ is definitely a local extremum point."),a:false,ex:t("SAI — Đạo hàm bằng 0 là điều kiện cần nhưng chưa đủ; đạo hàm phải đổi dấu khi đi qua x₀ (ví dụ y = x³ có y'(0)=0 nhưng không có cực trị).","FALSE — Having f'(x₀) = 0 is a necessary but not sufficient condition; the derivative must change sign passing through x₀ (e.g. y = x³ has y'(0)=0 but no local extremum).")},
    {s:t("Hàm số đồng biến trên khoảng (a, b) thì đồ thị của nó đi lên từ trái sang phải trên khoảng đó.","If a function is increasing on (a, b), its graph goes up from left to right on that interval."),a:true,ex:t("ĐÚNG — Định nghĩa hình học của tính đồng biến.","TRUE — Geometric definition of an increasing function.")},
    {s:t("Đạo hàm của hàm số y = 1/x luôn âm trên các khoảng xác định của nó, vì vậy hàm số nghịch biến trên (-∞; +∞).","The derivative of y = 1/x is always negative on its domains, so the function is decreasing on (-∞; +∞)."),a:false,ex:t("SAI — Hàm số nghịch biến trên từng khoảng (-∞; 0) và (0; +∞), không thể kết luận nghịch biến trên hợp của chúng hay trên toàn trục thực.","FALSE — It is decreasing on each separate interval (-∞, 0) and (0, +∞), but not on their union or (-∞, +∞).")}
  ];

  const sel=(i)=>{
    if(ms!==null)return;
    setMs(i);
    const c=i===mcQ[mi].a;
    if(c)setMsc(s=>s+1);
    setMh(h=>[...h,{q:mi,s:i,c}]);
  };
  const nx=()=>{
    if(mi+1>=mcQ.length)setMd(true);
    else{setMi(i=>i+1);setMs(null);}
  };
  const rm=()=>{
    setMi(0);setMs(null);setMsc(0);setMd(false);setMh([]);
  };

  const ta=(a)=>{
    if(tf)return;
    setTf(true);
    const c=a===tfC[ti].a;
    if(c)setTs(s=>s+1);
    setTh(h=>[...h,{q:ti,g:a,c}]);
  };
  const tn=()=>{
    if(ti+1>=tfC.length)setTd(true);
    else{setTi(i=>i+1);setTf(false);}
  };
  const rt=()=>{
    setTi(0);setTf(false);setTs(0);setTd(false);setTh([]);
  };

  const mri=mh.map(h=>({correct:h.c,qText:mcQ[h.q].q,correctText:mcQ[h.q].o[mcQ[h.q].a],yourText:mcQ[h.q].o[h.s]}));
  const tri=th.map(h=>({correct:h.c,qText:tfC[h.q].s,correctText:tfC[h.q].a?t("ĐÚNG","TRUE"):t("SAI","FALSE"),yourText:h.g?t("ĐÚNG","TRUE"):t("SAI","FALSE")}));

  useEffect(() => {
    if (md && user) {
      saveGameResult({
        lesson_slug: "L12-C1-L1",
        mode: "mc",
        score: msc,
        total: mcQ.length
      }).catch(()=>{});
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "L12-C1-L1",
        mode: "tf",
        score: ts,
        total: tfC.length
      }).catch(()=>{});
    }
  }, [td, ts, user]);

  const tabs=[
    ["w","🚀",t("Khởi động","Warm-Up")],
    ["k1","📖",t("1. Tính đơn điệu","1. Monotonicity")],
    ["k2","📖",t("2. Dấu đạo hàm","2. Derivative Sign")],
    ["k3","📖",t("3. Cực trị hàm số","3. Local Extrema")],
    ["th","✏️",t("Thực hành MCQ","MCQ Quiz")],
    ["tfTab","✏️",t("Thực hành T/F","True/False Quiz")],
    ["trans","🌐",t("Dịch Thuật","Translation Help")]
  ];

  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "100vh", color: "white", paddingBottom: 60 }}>
      <div style={{ width: "1200px", maxWidth: "95%", paddingTop: 40 }}>
        
        {/* Navigation & Language toggle */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 32 }}>
          <Link href="/Cacbaitoan12" style={{ textDecoration: "none" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.7)", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              ← Grade 12 Lessons
            </div>
          </Link>
          <button onClick={()=>setLang(lang==="vi"?"en":"vi")} style={{ padding:"8px 16px", background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.4)", borderRadius:8, color:"#38bdf8", fontWeight:600, cursor:"pointer" }}>
            🌐 {lang==="vi"?"English Mode":"Chế độ tiếng Việt"}
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 13, textTransform: "uppercase", color: "#38bdf8", fontWeight: 700, letterSpacing: 1.5 }}>
            Grade 12 · Chapter 1 · Lesson 1
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>
            {t("Tính đơn điệu & Cực trị hàm số","Monotonicity & Extremum of Functions")}
          </h1>
        </div>

        {/* Tab layout */}
        <div style={{ display:"grid", gridTemplateColumns:"260px 1fr", gap:32, alignItems:"start" }}>
          
          {/* Tab Navigation */}
          <div style={{ background:"rgba(255,255,255,0.03)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:12, padding:16, display:"flex", flexDirection:"column", gap:8 }}>
            {tabs.map(([id,icon,label])=>(
              <div key={id} onClick={()=>setActiveTab(id)} style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 16px", borderRadius:8, cursor:"pointer", transition:"all 0.2s", background:activeTab===id?"rgba(56,189,248,0.15)":"transparent", border:activeTab===id?"1px solid rgba(56,189,248,0.3)":"1px solid transparent", color:activeTab===id?"#38bdf8":"rgba(255,255,255,0.7)" }}
                onMouseEnter={e => { if(activeTab!==id) e.currentTarget.style.background="rgba(255,255,255,0.05)" }}
                onMouseLeave={e => { if(activeTab!==id) e.currentTarget.style.background="transparent" }}
              >
                <span style={{ fontSize:16 }}>{icon}</span>
                <span style={{ fontSize:14, fontWeight:600 }}>{label}</span>
              </div>
            ))}
          </div>

          {/* Tab Content Display */}
          <div style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, padding:32, minHeight: 400 }}>
            
            {/* WARM-UP */}
            {activeTab==="w" && (
              <div>
                <SH icon="🚀" title={t("Hoạt động khởi động","Warm-Up Activity")} />
                <p style={{ lineHeight:1.75, color:"rgba(255,255,255,0.85)" }}>
                  {t("Trong chương trình lớp 12, khảo sát hàm số là chủ đề cốt lõi giúp ta hiểu sâu về xu hướng biến thiên của các đại lượng thực tế (như doanh thu, tốc độ, nhiệt độ). Bằng cách sử dụng công cụ đạo hàm từ lớp 11, ta có thể dễ dàng tìm ra những khoảng tăng/giảm và vị trí đạt đỉnh cao nhất hay thấp nhất của hàm số mà không cần vẽ toàn bộ đồ thị.","In Grade 12, studying functions is a core topic that helps us understand the trend of real-world quantities (such as revenue, speed, or temperature). By utilizing the derivative tool introduced in Grade 11, we can easily find the increasing/decreasing intervals and the exact peak or valley locations of a function without drawing the entire graph.")}
                </p>
                <div style={{ marginTop: 24, padding: 16, background: "rgba(56,189,248,0.08)", borderRadius: 8, border: "1px solid rgba(56,189,248,0.2)" }}>
                  <h4 style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 8 }}>💡 {t("Hãy suy nghĩ","Think about it")}</h4>
                  <p style={{ margin:0, fontSize:14, lineHeight:1.6 }}>
                    {t("Tại sao đạo hàm bằng 0 hoặc không xác định lại đóng vai trò quyết định trong việc tìm các điểm cực trị?","Why do points where the derivative is zero or undefined play a decisive role in finding local extrema?")}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 1 */}
            {activeTab==="k1" && (
              <div>
                <SH icon="📖" title={t("1. Tính đơn điệu của hàm số","1. Monotonicity of Functions")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Cho hàm số y = f(x) xác định trên khoảng K.","Let function y = f(x) be defined on interval K.")}
                </p>
                <ul>
                  <li><strong>{t("Đồng biến (Increasing)","Increasing")}</strong>: {t("Hàm số f(x) đồng biến trên K nếu với mọi x₁, x₂ ∈ K, x₁ < x₂ thì f(x₁) < f(x₂). Đồ thị đi lên từ trái sang phải.","Function f(x) is increasing on K if for all x₁, x₂ ∈ K, x₁ < x₂ implies f(x₁) < f(x₂). The graph goes upwards from left to right.")}</li>
                  <li><strong>{t("Nghịch biến (Decreasing)","Decreasing")}</strong>: {t("Hàm số f(x) nghịch biến trên K nếu với mọi x₁, x₂ ∈ K, x₁ < x₂ thì f(x₁) > f(x₂). Đồ thị đi xuống từ trái sang phải.","Function f(x) is decreasing on K if for all x₁, x₂ ∈ K, x₁ < x₂ implies f(x₁) > f(x₂). The graph goes downwards from left to right.")}</li>
                </ul>
              </div>
            )}

            {/* TAB 2 */}
            {activeTab==="k2" && (
              <div>
                <SH icon="📖" title={t("2. Điều kiện đủ để hàm số đơn điệu","2. Sufficient Condition using Derivatives")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Cho hàm số f(x) có đạo hàm trên khoảng K.","Let f(x) be differentiable on interval K.")}
                </p>
                <ul>
                  <li>{t("Nếu f'(x) > 0 với mọi x ∈ K thì hàm số f(x) đồng biến trên K.","If f'(x) > 0 for all x ∈ K, then f(x) is increasing on K.")}</li>
                  <li>{t("Nếu f'(x) < 0 với mọi x ∈ K thì hàm số f(x) nghịch biến trên K.","If f'(x) < 0 for all x ∈ K, then f(x) is decreasing on K.")}</li>
                  <li>{t("Nếu f'(x) = 0 với mọi x ∈ K thì hàm số f(x) là hàm hằng trên K.","If f'(x) = 0 for all x ∈ K, then f(x) is constant on K.")}</li>
                </ul>
              </div>
            )}

            {/* TAB 3 */}
            {activeTab==="k3" && (
              <div>
                <SH icon="📖" title={t("3. Cực trị của hàm số","3. Local Extrema")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Giả sử hàm số f(x) liên tục trên khoảng (a, b) chứa điểm x₀.","Assume f(x) is continuous on interval (a, b) containing x₀.")}
                </p>
                <ul>
                  <li><strong>{t("Điểm cực đại (Local Maximum)","Local Maximum")}</strong>: {t("Nếu f'(x) đổi dấu từ dương sang âm khi qua x₀ thì x₀ là điểm cực đại của hàm số.","If f'(x) changes sign from positive to negative when passing x₀, then x₀ is a local maximum.")}</li>
                  <li><strong>{t("Điểm cực tiểu (Local Minimum)","Local Minimum")}</strong>: {t("Nếu f'(x) đổi dấu từ âm sang dương khi qua x₀ thì x₀ là điểm cực tiểu của hàm số.","If f'(x) changes sign from negative to positive when passing x₀, then x₀ is a local minimum.")}</li>
                </ul>
              </div>
            )}

            {/* MCQ PRACTICE */}
            {activeTab==="th" && (
              <div>
                <SH icon="✏️" title={t("Trắc nghiệm lựa chọn (MCQ)","Multiple Choice Quiz")} />
                {!md ? (
                  <div>
                    <div style={{ marginBottom: 20, fontSize: 16, fontWeight: 600 }}>
                      {t("Câu hỏi","Question")} {mi + 1} / {mcQ.length}: {mcQ[mi].q}
                    </div>
                    <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom: 24 }}>
                      {mcQ[mi].o.map((opt, i) => (
                        <button key={i} onClick={()=>sel(i)} style={{
                          textAlign: "left",
                          padding: "14px 20px",
                          borderRadius: 8,
                          background: ms===i ? (i===mcQ[mi].a ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "rgba(255,255,255,0.05)",
                          border: `1px solid ${ms===i ? (i===mcQ[mi].a ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)") : "rgba(255,255,255,0.12)"}`,
                          color: "white",
                          cursor: ms!==null ? "not-allowed" : "pointer",
                          fontWeight: 500
                        }}>
                          {opt}
                        </button>
                      ))}
                    </div>
                    {ms !== null && (
                      <div style={{ marginBottom: 24, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontWeight: 700, color: ms===mcQ[mi].a?"#34d399":"#f87171", marginBottom: 6 }}>
                          {ms===mcQ[mi].a ? t("Chính xác! 🎉","Correct! 🎉") : t("Chưa đúng ❌","Incorrect ❌")}
                        </div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{mcQ[mi].ex}</div>
                      </div>
                    )}
                    {ms !== null && (
                      <button onClick={nx} style={{ padding: "10px 24px", background: "#0ea5e9", border:"none", borderRadius:8, color:"white", fontWeight:600, cursor:"pointer" }}>
                        {mi+1===mcQ.length ? t("Hoàn thành","Finish") : t("Tiếp theo →","Next →")}
                      </button>
                    )}
                  </div>
                ) : (
                  <RS items={mri} onReset={rm} scoreLabel={t("Kết quả bài thi trắc nghiệm","Your MCQ Score")} t={t} />
                )}
              </div>
            )}

            {/* TF PRACTICE */}
            {activeTab==="tfTab" && (
              <div>
                <SH icon="✏️" title={t("Trắc nghiệm Đúng/Sai (True/False)","True/False Quiz")} />
                {!td ? (
                  <div>
                    <div style={{ marginBottom: 24, fontSize: 16, fontWeight: 600 }}>
                      {t("Câu hỏi","Question")} {ti + 1} / {tfC.length}: {tfC[ti].s}
                    </div>
                    <div style={{ display:"flex", gap:16, marginBottom: 24 }}>
                      <button onClick={()=>ta(true)} style={{
                        flex:1,
                        padding: "16px",
                        borderRadius: 8,
                        background: tf ? (tfC[ti].a===true ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "rgba(255,255,255,0.05)",
                        border: `1px solid ${tf ? (tfC[ti].a===true ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)") : "rgba(255,255,255,0.12)"}`,
                        color: "white",
                        fontWeight: 700,
                        cursor: tf ? "not-allowed" : "pointer"
                      }}>
                        🟢 {t("ĐÚNG","TRUE")}
                      </button>
                      <button onClick={()=>ta(false)} style={{
                        flex:1,
                        padding: "16px",
                        borderRadius: 8,
                        background: tf ? (tfC[ti].a===false ? "rgba(16,185,129,0.2)" : "rgba(239,68,68,0.2)") : "rgba(255,255,255,0.05)",
                        border: `1px solid ${tf ? (tfC[ti].a===false ? "rgba(16,185,129,0.5)" : "rgba(239,68,68,0.5)") : "rgba(255,255,255,0.12)"}`,
                        color: "white",
                        fontWeight: 700,
                        cursor: tf ? "not-allowed" : "pointer"
                      }}>
                        🔴 {t("SAI","FALSE")}
                      </button>
                    </div>
                    {tf && (
                      <div style={{ marginBottom: 24, padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, border: "1px solid rgba(255,255,255,0.08)" }}>
                        <div style={{ fontWeight: 700, color: th[ti]?.c?"#34d399":"#f87171", marginBottom: 6 }}>
                          {th[ti]?.c ? t("Chính xác! 🎉","Correct! 🎉") : t("Chưa đúng ❌","Incorrect ❌")}
                        </div>
                        <div style={{ fontSize: 14, color: "rgba(255,255,255,0.8)" }}>{tfC[ti].ex}</div>
                      </div>
                    )}
                    {tf && (
                      <button onClick={tn} style={{ padding: "10px 24px", background: "#0ea5e9", border:"none", borderRadius:8, color:"white", fontWeight:600, cursor:"pointer" }}>
                        {ti+1===tfC.length ? t("Hoàn thành","Finish") : t("Tiếp theo →","Next →")}
                      </button>
                    )}
                  </div>
                ) : (
                  <RS items={tri} onReset={rt} scoreLabel={t("Kết quả bài thi Đúng/Sai","Your True/False Score")} t={t} />
                )}
              </div>
            )}

            {/* TRANSLATION */}
            {activeTab==="trans" && (
              <div>
                <SH icon="🌐" title={t("Trợ giúp dịch thuật học tập","Translation & Definition Tool")} />
                <p style={{ fontSize: 14, color: "rgba(255,255,255,0.7)", marginBottom: 24 }}>
                  {t("Bôi đen hoặc nhập bất kỳ từ tiếng Anh toán học nào vào khung bên dưới để tra cứu định nghĩa song ngữ tức thời.","Select or type any mathematical English term below to inspect instant bilingual definition support.")}
                </p>
                <DuoTranslate />
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
