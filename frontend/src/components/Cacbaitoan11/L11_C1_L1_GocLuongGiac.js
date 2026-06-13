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

export default function L11_C1_L1_GocLuongGiac() {
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
      q:t("Đơn vị radian của góc 180° là gì?","What is the radian unit of a 180° angle?"),
      o:["π/2","π","2π","3π/2"],
      a:1,
      ex:t("Ta có 180° tương ứng với π radian.","We have 180° corresponding to π radians.")
    },
    {
      q:t("Tìm độ dài cung tròn của đường tròn bán kính R=5cm có số đo góc tâm là 2 radian?","Find the arc length of a circle of radius R=5cm with a central angle measure of 2 radians?"),
      o:["2.5 cm","10 cm","5 cm","20 cm"],
      a:1,
      ex:t("Độ dài cung l = R.α = 5 × 2 = 10 cm.","Arc length l = R.α = 5 × 2 = 10 cm.")
    },
    {
      q:t("Góc lượng giác có số đo âm chỉ chiều quay nào?","An angle with a negative measure indicates which direction of rotation?"),
      o:[t("Cùng chiều kim đồng hồ","Clockwise"),t("Ngược chiều kim đồng hồ","Counter-clockwise"),t("Không quay","No rotation"),t("Cả hai chiều","Both directions")],
      a:0,
      ex:t("Chiều quay cùng chiều kim đồng hồ là chiều âm.","Clockwise rotation is the negative direction.")
    },
    {
      q:t("Điểm cuối của góc lượng giác 5π/2 trùng với điểm cuối của góc nào sau đây?","The terminal point of the trigonometric angle 5π/2 coincides with that of which angle?"),
      o:["π/2","π","3π/2","2π"],
      a:0,
      ex:t("5π/2 = 2π + π/2. Điểm cuối trùng với góc π/2.","5π/2 = 2π + π/2. Coincides with the terminal point of π/2.")
    }
  ];

  const tfC=[
    {s:t("Góc lượng giác là góc được tạo ra bởi tia đầu quay quanh gốc đến tia cuối.","A trigonometric angle is formed by rotating the initial ray around the origin to the terminal ray."),a:true,ex:t("ĐÚNG — Định nghĩa góc lượng giác.","TRUE — Definition of a trigonometric angle.")},
    {s:t("Số đo của góc lượng giác luôn nằm trong đoạn [0, 2π].","The measure of a trigonometric angle is always within the interval [0, 2π]."),a:false,ex:t("SAI — Số đo góc lượng giác có thể nhận giá trị thực bất kỳ.","FALSE — It can be any real number depending on the number of full rotations.")},
    {s:t("Công thức đổi từ độ sang radian là α (rad) = a° × (π / 180°).","The formula to convert degrees to radians is α (rad) = a° × (π / 180°)."),a:true,ex:t("ĐÚNG — Hệ thức chuyển đổi chuẩn.","TRUE — Standard conversion relationship.")},
    {s:t("Chiều quay dương trên đường tròn lượng giác là chiều cùng chiều kim đồng hồ.","The positive direction of rotation on the unit circle is clockwise."),a:false,ex:t("SAI — Chiều dương là chiều ngược chiều kim đồng hồ.","FALSE — The positive direction is counter-clockwise.")}
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
        lesson_slug: "L11-C1-L1",
        mode: "mc",
        score: msc,
        total: mcQ.length
      }).catch(()=>{});
    }
  }, [md, msc, user]);

  useEffect(() => {
    if (td && user) {
      saveGameResult({
        lesson_slug: "L11-C1-L1",
        mode: "tf",
        score: ts,
        total: tfC.length
      }).catch(()=>{});
    }
  }, [td, ts, user]);

  const tabs=[
    ["w","🚀",t("Khởi động","Warm-Up")],
    ["k1","📖",t("1. Góc lượng giác","1. Trigonometric Angles")],
    ["k2","📖",t("2. Số đo góc","2. Angle Measures")],
    ["k3","📖",t("3. Đường tròn LG","3. Unit Circle")],
    ["th","✏️",t("Thực hành MCQ","MCQ Quiz")],
    ["tfTab","✏️",t("Thực hành T/F","True/False Quiz")],
    ["trans","🌐",t("Dịch Thuật","Translation Help")]
  ];

  return (
    <div style={{ width: "100%", background: "#0a0a1a", display: "flex", justifyContent: "center", minHeight: "100vh", color: "white", paddingBottom: 60 }}>
      <div style={{ width: "1200px", maxWidth: "95%", paddingTop: 40 }}>
        
        {/* Navigation & Language toggle */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom: 32 }}>
          <Link href="/Cacbaitoan11" style={{ textDecoration: "none" }}>
            <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.12)", borderRadius:8, padding:"8px 16px", fontSize:13, fontWeight:600, color:"rgba(255,255,255,0.7)", cursor:"pointer", transition:"all 0.2s" }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.background = "rgba(56,189,248,0.1)"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.3)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; }}
            >
              ← Grade 11 Lessons
            </div>
          </Link>
          <button onClick={()=>setLang(lang==="vi"?"en":"vi")} style={{ padding:"8px 16px", background:"rgba(56,189,248,0.15)", border:"1px solid rgba(56,189,248,0.4)", borderRadius:8, color:"#38bdf8", fontWeight:600, cursor:"pointer" }}>
            🌐 {lang==="vi"?"English Mode":"Chế độ tiếng Việt"}
          </button>
        </div>

        {/* Title */}
        <div style={{ marginBottom: 32 }}>
          <span style={{ fontSize: 13, textTransform: "uppercase", color: "#38bdf8", fontWeight: 700, letterSpacing: 1.5 }}>
            Grade 11 · Chapter 1 · Lesson 1
          </span>
          <h1 style={{ fontSize: 32, fontWeight: 800, marginTop: 6 }}>
            {t("Góc lượng giác & Giá trị lượng giác","Trigonometric Angles & Values")}
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
                  {t("Trong đời sống thực tế, ta thường gặp các chuyển động quay liên tục như cánh quạt điện, kim đồng hồ hay bánh xe xe đạp. Góc hình học thông thường (từ 0° đến 180°) không đủ để mô tả những chuyển động quay vô hạn này. Đó là lý do toán học xây dựng khái niệm góc lượng giác có giá trị lớn hơn 180° hoặc mang giá trị âm.","In real life, we frequently see continuous rotation, such as fan blades, clock hands, or bicycle wheels. Standard geometric angles (from 0° to 180°) cannot describe these infinite rotations. This is why mathematicians defined trigonometric angles, which can be larger than 180° or even have negative values.")}
                </p>
                <div style={{ marginTop: 24, padding: 16, background: "rgba(56,189,248,0.08)", borderRadius: 8, border: "1px solid rgba(56,189,248,0.2)" }}>
                  <h4 style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 8 }}>💡 {t("Hãy suy nghĩ","Think about it")}</h4>
                  <p style={{ margin:0, fontSize:14, lineHeight:1.6 }}>
                    {t("Kim phút của đồng hồ quay một vòng hoàn chỉnh tương đương với một góc lượng giác là bao nhiêu độ? Tại sao nó lại có giá trị âm?","A clock's minute hand completes one full rotation. What is the trigonometric angle measure of this rotation, and why is it negative?")}
                  </p>
                </div>
              </div>
            )}

            {/* TAB 1 */}
            {activeTab==="k1" && (
              <div>
                <SH icon="📖" title={t("1. Góc lượng giác","1. Trigonometric Angles")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Cho hai tia Ou và Ov. Nếu ta quay tia Ou quanh gốc O đến khi trùng với tia Ov theo một chiều nhất định (dương hoặc âm) thì ta được một góc lượng giác ký hiệu là (Ou, Ov).","Given two rays Ou and Ov. If we rotate ray Ou around the origin O until it coincides with ray Ov in a specific direction (positive or negative), we get a trigonometric angle denoted as (Ou, Ov).")}
                </p>
                <ul>
                  <li><strong>{t("Tia đầu (Initial Ray)","Initial Ray")}</strong>: Ou</li>
                  <li><strong>{t("Tia cuối (Terminal Ray)","Terminal Ray")}</strong>: Ov</li>
                  <li><strong>{t("Chiều quay dương (Positive Direction)","Positive Direction")}</strong>: {t("Ngược chiều kim đồng hồ.","Counter-clockwise.")}</li>
                  <li><strong>{t("Chiều quay âm (Negative Direction)","Negative Direction")}</strong>: {t("Cùng chiều kim đồng hồ.","Clockwise.")}</li>
                </ul>
              </div>
            )}

            {/* TAB 2 */}
            {activeTab==="k2" && (
              <div>
                <SH icon="📖" title={t("2. Số đo của góc lượng giác","2. Angle Measures")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Số đo của góc lượng giác (Ou, Ov) bằng độ hoặc radian được ký hiệu là sđ(Ou, Ov).","The measure of a trigonometric angle (Ou, Ov) in degrees or radians is denoted as sđ(Ou, Ov).")}
                </p>
                <p style={{ lineHeight:1.75 }}>
                  {t("Vì tia Ou có thể quay nhiều vòng trước khi dừng lại ở Ov, nên hai góc lượng giác có cùng tia đầu và tia cuối sẽ sai khác nhau một bội nguyên của 360° (hoặc 2π radian).","Since ray Ou can rotate multiple times before stopping at Ov, any two trigonometric angles with the same initial and terminal rays differ by an integer multiple of 360° (or 2π radians).")}
                </p>
                <div style={{ padding: 16, background: "rgba(255,255,255,0.03)", borderRadius: 8, fontFamily: "monospace", margin: "16px 0", fontSize:15 }}>
                  sđ(Ou, Ov) = α + k.360° (k ∈ ℤ)<br/>
                  sđ(Ou, Ov) = α + k.2π (k ∈ ℤ)
                </div>
              </div>
            )}

            {/* TAB 3 */}
            {activeTab==="k3" && (
              <div>
                <SH icon="📖" title={t("3. Đường tròn lượng giác","3. Unit Circle")} />
                <p style={{ lineHeight:1.75 }}>
                  {t("Đường tròn lượng giác là đường tròn hệ tọa độ Oxy có tâm O, bán kính R = 1, gốc đường tròn nằm tại điểm A(1; 0) và chiều dương là chiều ngược chiều kim đồng hồ.","The unit circle is a circle centered at the origin O(0,0) in the Oxy coordinate system with radius R = 1. The starting point is A(1, 0), and the positive direction is counter-clockwise.")}
                </p>
                <p style={{ lineHeight:1.75 }}>
                  {t("Với mỗi góc lượng giác có số đo α, ta xác định duy nhất điểm M trên đường tròn sao cho góc lượng giác (OA, OM) bằng α. Điểm M được gọi là điểm biểu diễn của góc α.","For each trigonometric angle measure α, we determine a unique point M on the circle such that the trigonometric angle (OA, OM) equals α. Point M is the representative point of angle α.")}
                </p>
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
