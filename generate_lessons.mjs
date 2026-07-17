/**
 * THCS Lesson Factory — generates all 40 lesson JS files for Grades 6-9
 * using the PremiumLessonEngine layout.
 * Run with: node generate_lessons.mjs
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
// Write directly to the active project folder
const BASE = path.join(__dirname, "frontend/src/components/thcs");

const ACCENT = "#14b8a6";

function makeLessonFile({ grade, chapter, lesson, titleVi, titleEn, slug, backPath,
  warmupVi, warmupEn, thinkVi, thinkEn,
  k1TitleVi, k1TitleEn, k1Vi, k1En,
  k2TitleVi, k2TitleEn, k2Vi, k2En,
  k3TitleVi, k3TitleEn, k3Vi, k3En,
  mcq, tfc, fill,
  glossary
}) {
  const mcqStr = mcq.map(q => `    { q: t(${JSON.stringify(q.qVi)}, ${JSON.stringify(q.qEn)}), o: [${q.opts.map(o => JSON.stringify(o)).join(", ")}], a: ${q.a}, ex: t(${JSON.stringify(q.exVi)}, ${JSON.stringify(q.exEn)}) }`).join(",\n");
  const tfcStr = tfc.map(q => `    { s: t(${JSON.stringify(q.sVi)}, ${JSON.stringify(q.sEn)}), a: ${q.a}, ex: t(${JSON.stringify(q.exVi)}, ${JSON.stringify(q.exEn)}) }`).join(",\n");
  const fillStr = fill.map(q => `    { id: "${q.id}", template: t(${JSON.stringify(q.tVi)}, ${JSON.stringify(q.tEn)}), ans: "${q.ans}", alt: [${q.alt.map(a => JSON.stringify(a)).join(", ")}], hint: t(${JSON.stringify(q.hVi)}, ${JSON.stringify(q.hEn)}) }`).join(",\n");
  const glossaryStr = glossary.map(([en, vi]) => `["${en}", "${vi}"]`).join(", ");

  return `"use client";
import { useState } from "react";
import PremiumLessonEngine from "@/components/thpt/Cacbaitoan10/PremiumLessonEngine";

const SH = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "${ACCENT}", marginBottom: 20, paddingBottom: 12, borderBottom: "2px solid rgba(255,255,255,0.08)" }}>
    <span>{icon}</span><span>{title}</span>
  </div>
);

export default function Lesson_${slug.replace(/-/g, "_")}() {
  const [lang, setLang] = useState("vi");
  const t = (vi, en) => (lang === "vi" ? vi : en);

  const lessonSlug = "${slug}";
  const chapterTitle = {
    vi: "Chương ${chapter} · Grade ${grade}",
    en: "Chapter ${chapter} · Grade ${grade}"
  };
  const lessonTitle = {
    vi: "Bài ${lesson}: ${titleVi}",
    en: "Lesson ${lesson}: ${titleEn}"
  };

  const learningObjectives = [
    { vi: "Hiểu kiến thức trọng tâm của bài học.", en: "Understand key concepts of the lesson." },
    { vi: "Luyện tập bài tập tương tác.", en: "Practice interactive exercises." }
  ];

  const navItems = [
    ["w", "🚀", "Khởi động", "Warm-up"],
    ["k1", "📖", "1. Khái niệm", "1. Concept"],
    ["k2", "📖", "2. Chi tiết", "2. Details"],
    ["k3", "📖", "3. Ứng dụng", "3. Applications"],
    ["miniGame", "🎮", "Luyện tập", "Practice"],
    ["trans", "🌐", "Từ điển", "Glossary"]
  ];

  const mcQuestions = [
${mcqStr}
  ];

  const tfCards = [
${tfcStr}
  ];

  const fillQuestions = [
${fillStr}
  ];

  const renderTheory = ({ t, lang }) => (
    <>
      {/* KHỞI ĐỘNG */}
      <section id="w" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🚀" title={t("Khởi động", "Warm-Up")} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, color: "rgba(255,255,255,0.85)", fontSize: 15 }}>{t(${JSON.stringify(warmupVi)}, ${JSON.stringify(warmupEn)})}</p>
          <div style={{ marginTop: 16, padding: 12, background: "rgba(20,184,166,0.08)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.2)" }}>
            <span style={{ color: "${ACCENT}", fontWeight: 700 }}>💡 {t("Hãy suy nghĩ", "Think about it")}:</span>
            <p style={{ margin: "4px 0 0 0", fontSize: 14 }}>{t(${JSON.stringify(thinkVi)}, ${JSON.stringify(thinkEn)})}</p>
          </div>
        </div>
      </section>

      {/* KIẾN THỨC 1 */}
      <section id="k1" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t(${JSON.stringify(k1TitleVi)}, ${JSON.stringify(k1TitleEn)})} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t(${JSON.stringify(k1Vi)}, ${JSON.stringify(k1En)})}</p>
        </div>
      </section>

      {/* KIẾN THỨC 2 */}
      <section id="k2" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t(${JSON.stringify(k2TitleVi)}, ${JSON.stringify(k2TitleEn)})} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t(${JSON.stringify(k2Vi)}, ${JSON.stringify(k2En)})}</p>
        </div>
      </section>

      {/* KIẾN THỨC 3 */}
      <section id="k3" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="📖" title={t(${JSON.stringify(k3TitleVi)}, ${JSON.stringify(k3TitleEn)})} />
        <div style={{ padding: 20, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)" }}>
          <p style={{ lineHeight: 1.75, fontSize: 15 }}>{t(${JSON.stringify(k3Vi)}, ${JSON.stringify(k3En)})}</p>
        </div>
      </section>

      {/* TỪ ĐIỂN */}
      <section id="trans" style={{ scrollMarginTop: 80, marginBottom: 64 }}>
        <SH icon="🌐" title={t("Từ điển Toán học", "Math Glossary")} />
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
          {[${glossaryStr}].map(([en, vi]) => (
            <div key={en} style={{ padding: "12px 16px", background: "rgba(20,184,166,0.06)", borderRadius: 8, border: "1px solid rgba(20,184,166,0.15)" }}>
              <div style={{ fontWeight: 700, color: "${ACCENT}", fontSize: 14 }}>{en}</div>
              <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 2 }}>{vi}</div>
            </div>
          ))}
        </div>
      </section>
    </>
  );

  return (
    <PremiumLessonEngine
      lessonSlug={lessonSlug}
      chapterTitle={chapterTitle}
      lessonTitle={lessonTitle}
      learningObjectives={learningObjectives}
      navItems={navItems}
      mcQuestions={mcQuestions}
      tfCards={tfCards}
      fillQuestions={fillQuestions}
      renderTheory={renderTheory}
      lang={lang}
      setLang={setLang}
    />
  );
}
`;
}

// ══════════════════════════════════════════════════════════════════════════════
// LESSON DATA DEFINITIONS FOR ALL 40 LESSONS
// ══════════════════════════════════════════════════════════════════════════════
const LESSONS = [
  // ── GRADE 6 ─────────────────────────────────────────────────────────────────
  {
    file: "Cacbaitoan6/L6_C1_L1.js", grade:6, chapter:1, lesson:1,
    slug:"L6-C1-L1", backPath:"Cacbaitoan6",
    titleVi:"Tập Hợp", titleEn:"Introduction to Sets",
    warmupVi:"Khi bạn xếp các đồ dùng học tập lên bàn: bút, sách, thước, chúng tạo thành một tập hợp. Tập hợp là gì? Hãy cùng khám phá!",
    warmupEn:"When you place school items on the table: pens, books, rulers, they form a set. What is a set? Let's find out!",
    thinkVi:"Một nhóm các học sinh cao trên 1m50 có phải là một tập hợp không?", thinkEn:"Is a group of students taller than 1.50m a set?",
    k1TitleVi:"1. Khái niệm tập hợp", k1TitleEn:"1. Definition of a Set",
    k1Vi:"Tập hợp là nhóm các đối tượng được xác định rõ ràng. Mỗi đối tượng là một phần tử.",
    k1En:"A set is a well-defined collection of objects. Each object is called an element.",
    k2TitleVi:"2. Kí hiệu thuộc và không thuộc", k2TitleEn:"2. Membership Symbols",
    k2Vi:"Kí hiệu ∈ chỉ phần tử thuộc tập hợp. Kí hiệu ∉ chỉ phần tử không thuộc tập hợp.",
    k2En:"The symbol ∈ denotes membership. The symbol ∉ denotes non-membership.",
    k3TitleVi:"3. Cách mô tả tập hợp", k3TitleEn:"3. Describing a Set",
    k3Vi:"Có hai cách: Liệt kê các phần tử hoặc chỉ ra tính chất đặc trưng của các phần tử.",
    k3En:"Two ways: Listing the elements or specifying the characteristic property of the elements.",
    mcq:[
      { qVi:"Cho A = {2; 4; 6}. Phát biểu nào ĐÚNG?", qEn:"Let A = {2; 4; 6}. Which statement is TRUE?", opts:["2 ∉ A","5 ∈ A","4 ∈ A","A có 2 phần tử"], a:2, exVi:"4 là phần tử nằm trong tập hợp A.", exEn:"4 is an element in set A." },
      { qVi:"Tập hợp B các số tự nhiên nhỏ hơn 5 là:", qEn:"Set B of natural numbers less than 5 is:", opts:["{1; 2; 3; 4}","{0; 1; 2; 3; 4}","{0; 1; 2; 3; 4; 5}","{1; 2; 3; 4; 5}"], a:1, exVi:"Số tự nhiên bắt đầu từ 0.", exEn:"Natural numbers start from 0." }
    ],
    tfc:[
      { sVi:"Mọi tập hợp đều có ít nhất 1 phần tử.", sEn:"Every set has at least 1 element.", a:false, exVi:"SAI — Tập rỗng { } không có phần tử nào.", exEn:"FALSE — The empty set { } has no elements." }
    ],
    fill:[
      { id:"f1", tVi:"Tập rỗng kí hiệu là ___", tEn:"The empty set is symbolized by ___", ans:"∅", alt:["O","empty"], hVi:"Kí hiệu tròn gạch chéo", hEn:"Circle with slash" }
    ],
    glossary:[["Set", "Tập hợp"], ["Element", "Phần tử"], ["Empty set", "Tập hợp rỗng"]]
  },
  {
    file: "Cacbaitoan6/L6_C1_L2.js", grade:6, chapter:1, lesson:2,
    slug:"L6-C1-L2", backPath:"Cacbaitoan6",
    titleVi:"Số Tự Nhiên & Số Nguyên Tố", titleEn:"Natural Numbers & Primes",
    warmupVi:"Số nguyên tố giống như những khối gạch xây dựng nên mọi số tự nhiên khác. Chúng ta hãy tìm hiểu về chúng!",
    warmupEn:"Primes are like building blocks of all other natural numbers. Let's study them!",
    thinkVi:"Có số nguyên tố chẵn nào khác số 2 không?", thinkEn:"Is there any other even prime number besides 2?",
    k1TitleVi:"1. Số tự nhiên", k1TitleEn:"1. Natural Numbers",
    k1Vi:"Tập hợp N = {0; 1; 2; 3; ...}. Tập hợp N* = {1; 2; 3; ...} không chứa số 0.",
    k1En:"Set N = {0; 1; 2; 3; ...}. Set N* = {1; 2; 3; ...} excludes zero.",
    k2TitleVi:"2. Số nguyên tố", k2TitleEn:"2. Prime Numbers",
    k2Vi:"Số nguyên tố là số tự nhiên lớn hơn 1, chỉ có hai ước là 1 và chính nó.",
    k2En:"A prime is a natural number greater than 1 with exactly two divisors: 1 and itself.",
    k3TitleVi:"3. Hợp số", k3TitleEn:"3. Composite Numbers",
    k3Vi:"Hợp số là số tự nhiên lớn hơn 1 và có nhiều hơn 2 ước.",
    k3En:"A composite number is a natural number greater than 1 with more than 2 divisors.",
    mcq:[
      { qVi:"Số nào sau đây là số nguyên tố?", qEn:"Which of the following is a prime?", opts:["1","4","9","5"], a:3, exVi:"5 chỉ chia hết cho 1 và 5.", exEn:"5 is only divisible by 1 and 5." }
    ],
    tfc:[
      { sVi:"Số 1 là số nguyên tố.", sEn:"Number 1 is a prime number.", a:false, exVi:"SAI — Số 1 không là số nguyên tố cũng không là hợp số.", exEn:"FALSE — 1 is neither prime nor composite." }
    ],
    fill:[
      { id:"f1", tVi:"Số nguyên tố nhỏ nhất là ___", tEn:"The smallest prime number is ___", ans:"2", alt:["hai"], hVi:"Số chẵn duy nhất", hEn:"The only even prime" }
    ],
    glossary:[["Prime", "Số nguyên tố"], ["Composite", "Hợp số"], ["Divisor", "Ước"]]
  },
  {
    file: "Cacbaitoan6/L6_C1_L3.js", grade:6, chapter:1, lesson:3,
    slug:"L6-C1-L3", backPath:"Cacbaitoan6",
    titleVi:"ƯCLN & BCNN", titleEn:"GCD & LCM",
    warmupVi:"Để chia đều 24 cái kẹo và 36 cái bánh vào các túi, số túi nhiều nhất có thể là bao nhiêu? Đó là bài toán ƯCLN!",
    warmupEn:"To divide 24 candies and 36 cakes equally into bags, what is the maximum number of bags? That's GCD!",
    thinkVi:"Có thể tìm BCNN bằng cách nào nhanh nhất?", thinkEn:"What is the fastest way to find LCM?",
    k1TitleVi:"1. Ước chung lớn nhất (ƯCLN)", k1TitleEn:"1. Greatest Common Divisor (GCD)",
    k1Vi:"ƯCLN của hai hay nhiều số là số lớn nhất trong tập hợp các ước chung của chúng.",
    k1En:"GCD is the largest number that divides all given numbers without a remainder.",
    k2TitleVi:"2. Bội chung nhỏ nhất (BCNN)", k2TitleEn:"2. Least Common Multiple (LCM)",
    k2Vi:"BCNN của hai hay nhiều số là số nhỏ nhất khác 0 trong tập hợp các bội chung của chúng.",
    k2En:"LCM is the smallest non-zero positive integer that is a multiple of all given numbers.",
    k3TitleVi:"3. Cách tìm nhanh", k3TitleEn:"3. Finding Methods",
    k3Vi:"Phân tích ra thừa số nguyên tố, chọn các thừa số chung và riêng với số mũ thích hợp.",
    k3En:"Factorize into primes, choose common and unique factors with correct exponents.",
    mcq:[
      { qVi:"ƯCLN(12, 18) =", qEn:"GCD(12, 18) =", opts:["2","3","6","12"], a:2, exVi:"Ước chung của 12 và 18: 1, 2, 3, 6.", exEn:"Common divisors are 1, 2, 3, 6." }
    ],
    tfc:[
      { sVi:"BCNN của 4 và 6 là 24.", sEn:"LCM of 4 and 6 is 24.", a:false, exVi:"SAI — BCNN(4,6) = 12.", exEn:"FALSE — LCM(4,6) = 12." }
    ],
    fill:[
      { id:"f1", tVi:"BCNN của 5 và 7 là ___", tEn:"LCM of 5 and 7 is ___", ans:"35", alt:["ba mươi lăm"], hVi:"5 và 7 nguyên tố cùng nhau", hEn:"5 and 7 are coprime" }
    ],
    glossary:[["GCD", "ƯCLN"], ["LCM", "BCNN"], ["Coprime", "Nguyên tố cùng nhau"]]
  },
  {
    file: "Cacbaitoan6/L6_C2_L1.js", grade:6, chapter:2, lesson:1,
    slug:"L6-C2-L1", backPath:"Cacbaitoan6",
    titleVi:"Số Nguyên & Phép Tính", titleEn:"Integers & Operations",
    warmupVi:"Số âm dùng để chỉ nhiệt độ dưới 0 độ C hoặc số tiền nợ. Hãy làm quen với các số nguyên!",
    warmupEn:"Negative numbers represent temperature below 0°C or debt. Let's learn integers!",
    thinkVi:"Số -5 và -10, số nào lớn hơn?", thinkEn:"Which is larger, -5 or -10?",
    k1TitleVi:"1. Tập hợp số nguyên Z", k1TitleEn:"1. Set of Integers Z",
    k1Vi:"Gồm số nguyên âm, số 0 và số nguyên dương: Z = {...; -2; -1; 0; 1; 2; ...}.",
    k1En:"Consists of negative integers, zero, and positive integers: Z = {...; -2; -1; 0; 1; 2; ...}.",
    k2TitleVi:"2. Phép cộng và trừ số nguyên", k2TitleEn:"2. Addition & Subtraction",
    k2Vi:"Cộng hai số cùng dấu hoặc khác dấu. Trừ hai số nguyên: a - b = a + (-b).",
    k2En:"Add same or different sign numbers. Subtraction is adding the opposite: a - b = a + (-b).",
    k3TitleVi:"3. Trục số", k3TitleEn:"3. Number Line",
    k3Vi:"Số bên phải luôn lớn hơn số bên trái trên trục số nằm ngang.",
    k3En:"On a horizontal number line, the number to the right is always larger.",
    mcq:[
      { qVi:"(-5) + (-3) =", qEn:"(-5) + (-3) =", opts:["-8","8","-2","2"], a:0, exVi:"Cộng hai số âm ta cộng hai phần tự nhiên rồi đặt dấu trừ.", exEn:"Add natural values and prefix with a negative sign." }
    ],
    tfc:[
      { sVi:"Số 0 là số nguyên dương.", sEn:"Zero is a positive integer.", a:false, exVi:"SAI — 0 không âm cũng không dương.", exEn:"FALSE — 0 is neither negative nor positive." }
    ],
    fill:[
      { id:"f1", tVi:"Số đối của -7 là ___", tEn:"The opposite of -7 is ___", ans:"7", alt:["bảy"], hVi:"Đổi dấu", hEn:"Change sign" }
    ],
    glossary:[["Integer", "Số nguyên"], ["Negative", "Số âm"], ["Opposite", "Số đối"]]
  },
  {
    file: "Cacbaitoan6/L6_C2_L2.js", grade:6, chapter:2, lesson:2,
    slug:"L6-C2-L2", backPath:"Cacbaitoan6",
    titleVi:"Quy Tắc Dấu", titleEn:"Sign Rules",
    warmupVi:"Khi tính điểm trong trò chơi, mỗi lần đúng được +5, mỗi lần sai bị -3. Nếu bạn sai 4 lần liên tiếp, bạn mất bao nhiêu điểm? Đây chính là bài toán nhân số nguyên âm!",
    warmupEn:"In a game, each correct answer gives +5, each wrong answer -3. If you get 4 wrong in a row, how many points do you lose? This is exactly the problem of multiplying negative integers!",
    thinkVi:"Kết quả của (-3) × (-4) là dương hay âm? Vì sao?", thinkEn:"Is the result of (-3) × (-4) positive or negative? Why?",
    k1TitleVi:"1. Nhân hai số nguyên", k1TitleEn:"1. Multiplying Two Integers",
    k1Vi:"(+) × (+) = (+); (−) × (−) = (+); (+) × (−) = (−); (−) × (+) = (−). Hai số cùng dấu nhân nhau ra dương, khác dấu ra âm.",
    k1En:"(+)×(+)=(+); (−)×(−)=(+); (+)×(−)=(−); (−)×(+)=(−). Same signs → positive; different signs → negative.",
    k2TitleVi:"2. Chia hai số nguyên", k2TitleEn:"2. Dividing Integers",
    k2Vi:"Quy tắc dấu khi chia giống hệt khi nhân. (+) ÷ (−) = (−); (−) ÷ (−) = (+).",
    k2En:"Division sign rules mirror multiplication. (+)÷(−)=(−); (−)÷(−)=(+).",
    k3TitleVi:"3. Lũy thừa số nguyên âm", k3TitleEn:"3. Powers of Negative Integers",
    k3Vi:"(−a)^n = a^n nếu n chẵn (dương); (−a)^n = −a^n nếu n lẻ (âm). Ví dụ: (−2)⁴ = 16; (−2)³ = −8.",
    k3En:"(−a)^n = a^n if n is even (positive); (−a)^n = −a^n if n is odd (negative). Ex: (−2)⁴ = 16; (−2)³ = −8.",
    mcq:[
      { qVi:"(-3) × 4 = ?", qEn:"(-3) × 4 = ?", opts:["-12","12","-7","7"], a:0, exVi:"Khác dấu → âm: 3×4 = 12, kết quả là -12.", exEn:"Different signs → negative: 3×4=12, result is -12." },
      { qVi:"(-5) × (-6) = ?", qEn:"(-5) × (-6) = ?", opts:["-30","30","-11","11"], a:1, exVi:"Cùng dấu âm → dương: 5×6 = 30.", exEn:"Both negative → positive: 5×6=30." }
    ],
    tfc:[
      { sVi:"Tích của hai số nguyên âm luôn là số nguyên dương.", sEn:"The product of two negative integers is always positive.", a:true, exVi:"ĐÚNG — âm × âm = dương.", exEn:"TRUE — negative × negative = positive." }
    ],
    fill:[
      { id:"f1", tVi:"(-2) nhân (-2) nhân (-2) = ___", tEn:"(-2) times (-2) times (-2) = ___", ans:"-8", alt:[" âm tám"], hVi:"Mũ lẻ ra âm", hEn:"Odd power yields negative" }
    ],
    glossary:[["Product", "Tích"], ["Quotient", "Thương"], ["Power", "Lũy thừa"]]
  },
  {
    file: "Cacbaitoan6/L6_C2_L3.js", grade:6, chapter:2, lesson:3,
    slug:"L6-C2-L3", backPath:"Cacbaitoan6",
    titleVi:"Bội & Ước của Số Nguyên", titleEn:"Multiples & Divisors",
    warmupVi:"Bạn xếp 24 cái kẹo vào các túi đều nhau. Bạn có thể xếp thành 2 túi, 3 túi, 4 túi, 6 túi hoặc 8 túi. Những số 2,3,4,6,8 chính là các ước của 24!",
    warmupEn:"You arrange 24 candies into equal bags. You can make 2, 3, 4, 6 or 8 bags. The numbers 2, 3, 4, 6, 8 are exactly the divisors of 24!",
    thinkVi:"Số 12 có bao nhiêu ước? Hãy liệt kê tất cả.", thinkEn:"How many divisors does 12 have? List them all.",
    k1TitleVi:"1. Khái niệm bội và ước", k1TitleEn:"1. Multiples & Divisors Concepts",
    k1Vi:"Số nguyên a là bội của b nếu a ÷ b có dư bằng 0. Khi đó b là ước của a. Ký hiệu: b | a.",
    k1En:"Integer a is a multiple of b if a ÷ b has remainder 0. Then b is a divisor of a. Notation: b | a.",
    k2TitleVi:"2. Tìm ước và bội", k2TitleEn:"2. Finding Divisors & Multiples",
    k2Vi:"Ước của 12: ±1, ±2, ±3, ±4, ±6, ±12. Bội của 3: 0, ±3, ±6, ±9, ±12, ...",
    k2En:"Divisors of 12: ±1, ±2, ±3, ±4, ±6, ±12. Multiples of 3: 0, ±3, ±6, ±9, ±12, ...",
    k3TitleVi:"3. Tính chất chia hết", k3TitleEn:"3. Divisibility Properties",
    k3Vi:"Nếu a⋮m và b⋮m thì (a+b)⋮m và (a−b)⋮m. Nếu a⋮b và b⋮c thì a⋮c.",
    k3En:"If a|m and b|m then (a+b)|m and (a−b)|m. If a|b and b|c then a|c.",
    mcq:[
      { qVi:"Số nào sau đây là ước của 30?", qEn:"Which is a divisor of 30?", opts:["7","8","9","6"], a:3, exVi:"30 ÷ 6 = 5 dư 0, nên 6 là ước của 30.", exEn:"30 ÷ 6 = 5 remainder 0, so 6 is a divisor of 30." }
    ],
    tfc:[
      { sVi:"Số 0 là bội của mọi số nguyên khác 0.", sEn:"0 is a multiple of every nonzero integer.", a:true, exVi:"ĐÚNG — 0 = a × 0 với mọi a ≠ 0.", exEn:"TRUE — 0 = a × 0 for all a ≠ 0." }
    ],
    fill:[
      { id:"f1", tVi:"Số ước tự nhiên của 6 là ___", tEn:"The number of natural divisors of 6 is ___", ans:"4", alt:["bốn"], hVi:"Các ước là 1, 2, 3, 6.", hEn:"The divisors are 1, 2, 3, 6." }
    ],
    glossary:[["Divisor", "Ước"], ["Multiple", "Bội"], ["Divisibility", "Tính chia hết"]]
  },
  {
    file: "Cacbaitoan6/L6_C3_L1.js", grade:6, chapter:3, lesson:1,
    slug:"L6-C3-L1", backPath:"Cacbaitoan6",
    titleVi:"Phân Số & Rút Gọn", titleEn:"Fractions & Simplification",
    warmupVi:"Bạn ăn 3 miếng pizza trong số 8 miếng. Bạn đã ăn 3/8 cái pizza. Nhưng nếu bạn ăn 4 trong 6 miếng, thì 4/6 = 2/3. Đây là rút gọn phân số!",
    warmupEn:"You eat 3 slices out of 8. You ate 3/8 of the pizza. But if you eat 4 out of 6 slices, 4/6 = 2/3. This is fraction simplification!",
    thinkVi:"Làm thế nào để biết hai phân số có bằng nhau không?", thinkEn:"How can you tell if two fractions are equal?",
    k1TitleVi:"1. Định nghĩa phân số", k1TitleEn:"1. Fraction Definition",
    k1Vi:"Phân số a/b (b≠0) biểu diễn a phần trong b phần bằng nhau. Tử số a, mẫu số b.",
    k1En:"Fraction a/b (b≠0) represents a parts out of b equal parts. Numerator a, denominator b.",
    k2TitleVi:"2. Phân số bằng nhau", k2TitleEn:"2. Equivalent Fractions",
    k2Vi:"a/b = c/d ⟺ a×d = b×c. Nhân/chia tử và mẫu cùng một số khác 0 → phân số bằng nhau.",
    k2En:"a/b = c/d ⟺ a×d = b×c. Multiply/divide both numerator and denominator by same nonzero number.",
    k3TitleVi:"3. Rút gọn phân số", k3TitleEn:"3. Simplifying Fractions",
    k3Vi:"Chia cả tử và mẫu cho ƯCLN(tử, mẫu). Phân số tối giản khi ƯCLN = 1.",
    k3En:"Divide both numerator and denominator by GCD. Lowest terms when GCD = 1.",
    mcq:[
      { qVi:"Rút gọn phân số 18/24:", qEn:"Simplify 18/24:", opts:["3/4","2/3","5/8","9/12"], a:0, exVi:"18 và 24 chia hết cho 6.", exEn:"18 and 24 are divisible by 6." }
    ],
    tfc:[
      { sVi:"Phân số 3/6 và 1/2 bằng nhau.", sEn:"Fractions 3/6 and 1/2 are equal.", a:true, exVi:"ĐÚNG — Cùng rút gọn về 1/2.", exEn:"TRUE — Both simplify to 1/2." }
    ],
    fill:[
      { id:"f1", tVi:"Tử số của phân số 5/9 là ___", tEn:"The numerator of 5/9 is ___", ans:"5", alt:["năm"], hVi:"Số ở trên", hEn:"The top number" }
    ],
    glossary:[["Numerator", "Tử số"], ["Denominator", "Mẫu số"], ["Simplify", "Rút gọn"]]
  },
  {
    file: "Cacbaitoan6/L6_C3_L2.js", grade:6, chapter:3, lesson:2,
    slug:"L6-C3-L2", backPath:"Cacbaitoan6",
    titleVi:"Số Thập Phân & Phần Trăm", titleEn:"Decimals & Percentages",
    warmupVi:"Một chiếc áo giảm giá 25%. Nếu giá gốc là 200,000đ thì bạn tiết kiệm được bao nhiêu? Hiểu phần trăm giúp bạn mua sắm thông minh hơn!",
    warmupEn:"A shirt is 25% off. If the original price is 200,000 VND, how much do you save? Understanding percentages helps you shop smarter!",
    thinkVi:"0.75 = 75% = 3/4. Tại sao ba cách viết này đều có giá trị bằng nhau?", thinkEn:"0.75 = 75% = 3/4. Why are these three representations equal?",
    k1TitleVi:"1. Số thập phân", k1TitleEn:"1. Decimal Numbers",
    k1Vi:"Số thập phân gồm phần nguyên và phần thập phân ngăn cách bởi dấu phẩy.",
    k1En:"Decimals have an integer part and fractional part separated by a decimal point.",
    k2TitleVi:"2. Đổi phân số ↔ thập phân", k2TitleEn:"2. Converting Fractions & Decimals",
    k2Vi:"Phân số → thập phân: chia tử cho mẫu. 3/4 = 0,75.",
    k2En:"Fraction → decimal: divide numerator by denominator. 3/4 = 0.75.",
    k3TitleVi:"3. Phần trăm (%)", k3TitleEn:"3. Percentages",
    k3Vi:"a% = a/100. Đổi phần trăm sang thập phân: chia cho 100.",
    k3En:"a% = a/100. Convert percent to decimal: divide by 100.",
    mcq:[
      { qVi:"0,625 = ?", qEn:"0.625 = ?", opts:["5/8","6/8","3/5","1/2"], a:0, exVi:"0,625 = 625/1000 = 5/8.", exEn:"0.625 = 625/1000 = 5/8." }
    ],
    tfc:[
      { sVi:"0,1 = 10%.", sEn:"0.1 = 10%.", a:true, exVi:"ĐÚNG — 0,1 = 10/100 = 10%.", exEn:"TRUE — 0.1 = 10/100 = 10%." }
    ],
    fill:[
      { id:"f1", tVi:"2/5 đổi ra phần trăm là ___ %", tEn:"2/5 converted to percentage is ___ %", ans:"40", alt:["bốn mươi"], hVi:"2/5 = 0.4", hEn:"2/5 = 0.4" }
    ],
    glossary:[["Decimal", "Số thập phân"], ["Percentage", "Phần trăm"], ["Discount", "Giảm giá"]]
  },
  {
    file: "Cacbaitoan6/L6_C4_L1.js", grade:6, chapter:4, lesson:1,
    slug:"L6-C4-L1", backPath:"Cacbaitoan6",
    titleVi:"Điểm, Đường Thẳng & Đoạn Thẳng", titleEn:"Points, Lines & Segments",
    warmupVi:"Một con kiến bò thẳng từ điểm A đến điểm B rồi tiếp tục sang C. Làm sao biết AB + BC = AC hay không? Đây là bài toán về đoạn thẳng cơ bản nhất!",
    warmupEn:"An ant walks straight from A to B then continues to C. How do you know if AB + BC = AC? This is the most fundamental problem about line segments!",
    thinkVi:"Nếu M nằm giữa A và B thì AM + MB = AB. Điều này luôn đúng không?", thinkEn:"If M is between A and B then AM + MB = AB. Is this always true?",
    k1TitleVi:"1. Điểm và đường thẳng", k1TitleEn:"1. Points and Lines",
    k1Vi:"Điểm là đối tượng cơ bản, không có kích thước. Đường thẳng trải dài vô tận hai phía. Qua 2 điểm phân biệt có đúng 1 đường thẳng.",
    k1En:"A point has no dimensions. A line extends infinitely in both directions. Through 2 distinct points there is exactly 1 line.",
    k2TitleVi:"2. Đoạn thẳng và tia", k2TitleEn:"2. Segments and Rays",
    k2Vi:"Đoạn thẳng AB: phần giữa A và B (có 2 đầu mút). Tia Ox: xuất phát từ O qua x, kéo dài vô hạn về 1 phía.",
    k2En:"Segment AB: the part between A and B (has 2 endpoints). Ray Ox: starts at O, goes through x, extends infinitely in one direction.",
    k3TitleVi:"3. Tính chất trung điểm", k3TitleEn:"3. Midpoint Properties",
    k3Vi:"M là trung điểm của AB khi: M nằm giữa A, B và AM = MB = AB/2.",
    k3En:"M is the midpoint of AB when: M is between A and B, and AM = MB = AB/2.",
    mcq:[
      { qVi:"Cho AB = 12cm, M là trung điểm AB. AM = ?", qEn:"AB = 12cm, M is midpoint. AM = ?", opts:["12cm","6cm","4cm","3cm"], a:1, exVi:"AM = AB/2 = 6cm.", exEn:"AM = AB/2 = 6cm." }
    ],
    tfc:[
      { sVi:"Tia và đoạn thẳng đều có hai đầu mút.", sEn:"Both rays and segments have two endpoints.", a:false, exVi:"SAI — Tia chỉ có một đầu mút (gốc).", exEn:"FALSE — A ray has only one endpoint (origin)." }
    ],
    fill:[
      { id:"f1", tVi:"Qua 2 điểm phân biệt vẽ được ___ đường thẳng.", tEn:"Through 2 distinct points we can draw ___ line(s).", ans:"1", alt:["một"], hVi:"Duy nhất", hEn:"Unique" }
    ],
    glossary:[["Point", "Điểm"], ["Line", "Đường thẳng"], ["Segment", "Đoạn thẳng"]]
  },
  {
    file: "Cacbaitoan6/L6_C4_L2.js", grade:6, chapter:4, lesson:2,
    slug:"L6-C4-L2", backPath:"Cacbaitoan6",
    titleVi:"Góc & Đo Góc", titleEn:"Angles & Measurement",
    warmupVi:"Kim giờ và kim phút của đồng hồ tạo thành một góc. Lúc 3 giờ, góc đó là 90°. Lúc 6 giờ là 180°. Bạn có biết lúc mấy giờ góc là 0° không?",
    warmupEn:"The hour and minute hands of a clock form an angle. At 3 o'clock it's 90°. At 6 o'clock it's 180°. Can you find when the angle is 0°?",
    thinkVi:"Góc bẹt là 180°. Góc nào lớn hơn 90° nhưng nhỏ hơn 180°?", thinkEn:"A straight angle is 180°. What type of angle is greater than 90° but less than 180°?",
    k1TitleVi:"1. Định nghĩa góc", k1TitleEn:"1. Angle Definition",
    k1Vi:"Góc xOy là hình gồm hai tia Ox và Oy có chung gốc O. O là đỉnh, Ox và Oy là hai cạnh.",
    k1En:"Angle xOy is formed by two rays Ox and Oy with common endpoint O. O is the vertex, Ox and Oy are the sides.",
    k2TitleVi:"2. Các loại góc", k2TitleEn:"2. Types of Angles",
    k2Vi:"Góc nhọn: 0° < α < 90°. Góc vuông: α = 90°. Góc tù: 90° < α < 180°. Góc bẹt: α = 180°.",
    k2En:"Acute: 0° < α < 90°. Right: α = 90°. Obtuse: 90° < α < 180°. Straight: α = 180°.",
    k3TitleVi:"3. Tia phân giác góc", k3TitleEn:"3. Angle Bisector",
    k3Vi:"Tia phân giác của góc xOy là tia Oz nằm giữa Ox, Oy và ∠xOz = ∠zOy = ∠xOy / 2.",
    k3En:"The angle bisector of xOy is ray Oz between Ox and Oy where ∠xOz = ∠zOy = ∠xOy / 2.",
    mcq:[
      { qVi:"Góc có số đo 130° là góc gì?", qEn:"An angle measuring 130° is a(n):", opts:["Góc nhọn","Góc vuông","Góc tù","Góc bẹt"], a:2, exVi:"90° < 130° < 180° → Góc tù.", exEn:"90° < 130° < 180° → Obtuse angle." }
    ],
    tfc:[
      { sVi:"Góc vuông có số đo bằng 90°.", sEn:"A right angle measures 90°.", a:true, exVi:"ĐÚNG — Đây là định nghĩa góc vuông.", exEn:"TRUE — This is the definition of a right angle." }
    ],
    fill:[
      { id:"f1", tVi:"Góc bẹt có số đo là ___ độ", tEn:"A straight angle measures ___ degrees", ans:"180", alt:["một trăm tám mươi"], hVi:"Bằng 2 lần góc vuông", hEn:"Twice a right angle" }
    ],
    glossary:[["Angle", "Góc"], ["Vertex", "Đỉnh"], ["Obtuse", "Tù"]]
  },

  // ── GRADE 7 ─────────────────────────────────────────────────────────────────
  {
    file: "Cacbaitoan7/L7_C1_L1.js", grade:7, chapter:1, lesson:1,
    slug:"L7-C1-L1", backPath:"Cacbaitoan7",
    titleVi:"Số Hữu Tỉ", titleEn:"Rational Numbers",
    warmupVi:"Số hữu tỉ là tập số mở rộng chứa tất cả các số có thể viết dưới dạng phân số. Hãy cùng khám phá số hữu tỉ!",
    warmupEn:"Rational numbers expand the number system to include all numbers that can be written as fractions. Let's explore!",
    thinkVi:"Mọi số nguyên có phải là số hữu tỉ không?", thinkEn:"Is every integer a rational number?",
    k1TitleVi:"1. Khái niệm số hữu tỉ", k1TitleEn:"1. Concept of Rational Numbers",
    k1Vi:"Số hữu tỉ là số viết được dưới dạng phân số a/b (a, b ∈ Z, b≠0). Kí hiệu tập hợp là Q.",
    k1En:"A rational number is any number that can be expressed as a/b (a, b ∈ Z, b≠0). Denoted by Q.",
    k2TitleVi:"2. Biểu diễn trên trục số", k2TitleEn:"2. Representation on Number Line",
    k2Vi:"Tương tự phân số, mỗi số hữu tỉ được biểu diễn bởi một điểm trên trục số.",
    k2En:"Similar to fractions, each rational number is represented by a point on the number line.",
    k3TitleVi:"3. So sánh số hữu tỉ", k3TitleEn:"3. Comparing Rational Numbers",
    k3Vi:"Đưa về cùng mẫu số dương rồi so sánh tử số.",
    k3En:"Convert to equivalent fractions with a positive denominator then compare numerators.",
    mcq:[
      { qVi:"Tập hợp số hữu tỉ được kí hiệu là:", qEn:"The set of rational numbers is symbolized by:", opts:["N","Z","Q","R"], a:2, exVi:"Q là kí hiệu tập hợp số hữu tỉ.", exEn:"Q is the symbol for rational numbers." }
    ],
    tfc:[
      { sVi:"Số 0 không phải số hữu tỉ.", sEn:"Zero is not a rational number.", a:false, exVi:"SAI — 0 = 0/1 nên là số hữu tỉ.", exEn:"FALSE — 0 = 0/1, so it is a rational number." }
    ],
    fill:[
      { id:"f1", tVi:"Số hữu tỉ viết được dưới dạng phân số a/b với mẫu số b phải khác ___", tEn:"A rational number is written as a/b where the denominator b must not be ___", ans:"0", alt:["không"], hVi:"Số không", hEn:"Zero" }
    ],
    glossary:[["Rational", "Hữu tỉ"], ["Fraction", "Phân số"], ["Integer", "Số nguyên"]]
  },
  {
    file: "Cacbaitoan7/L7_C1_L2.js", grade:7, chapter:1, lesson:2,
    slug:"L7-C1-L2", backPath:"Cacbaitoan7",
    titleVi:"Phép Tính Trên Số Hữu Tỉ", titleEn:"Operations on Rationals",
    warmupVi:"Khi bạn cộng, trừ, nhân, chia các phân số, bạn đang thực hiện các phép tính trên số hữu tỉ.",
    warmupEn:"When you add, subtract, multiply, and divide fractions, you calculate with rational numbers.",
    thinkVi:"Khi nhân chia số hữu tỉ ta quy về nhân chia những đối tượng nào?", thinkEn:"How do we multiply/divide rational numbers?",
    k1TitleVi:"1. Cộng và trừ", k1TitleEn:"1. Addition & Subtraction",
    k1Vi:"Quy đồng mẫu số rồi cộng hoặc trừ tử số.",
    k1En:"Find common denominator then add or subtract the numerators.",
    k2TitleVi:"2. Nhân và chia", k2TitleEn:"2. Multiplication & Division",
    k2Vi:"Nhân tử với tử, mẫu với mẫu. Chia: Nhân với phân số nghịch đảo.",
    k2En:"Multiply numerators and denominators. Division is multiplying by reciprocal.",
    k3TitleVi:"3. Tính chất phép tính", k3TitleEn:"3. Properties of Operations",
    k3Vi:"Có tính giao hoán, kết hợp và phân phối.",
    k3En:"Operations are commutative, associative, and distributive.",
    mcq:[
      { qVi:"1/2 + 1/3 =", qEn:"1/2 + 1/3 =", opts:["2/5","5/6","1/5","1/6"], a:1, exVi:"1/2 + 1/3 = 3/6 + 2/6 = 5/6.", exEn:"1/2 + 1/3 = 3/6 + 2/6 = 5/6." }
    ],
    tfc:[
      { sVi:"Chia số hữu tỉ cho 0 luôn có kết quả bằng 0.", sEn:"Dividing a rational number by 0 always results in 0.", a:false, exVi:"SAI — Không thể chia cho số 0.", exEn:"FALSE — Division by 0 is undefined." }
    ],
    fill:[
      { id:"f1", tVi:"Nghịch đảo của 3/4 là ___", tEn:"The reciprocal of 3/4 is ___", ans:"4/3", alt:["4/3"], hVi:"Đổi tử và mẫu", hEn:"Swap numerator and denominator" }
    ],
    glossary:[["Reciprocal", "Số nghịch đảo"], ["Common denominator", "Mẫu chung"], ["Commutative", "Giao hoán"]]
  },
  {
    file: "Cacbaitoan7/L7_C1_L3.js", grade:7, chapter:1, lesson:3,
    slug:"L7-C1-L3", backPath:"Cacbaitoan7",
    titleVi:"Số Thực & Căn Bậc Hai", titleEn:"Real Numbers & Square Roots",
    warmupVi:"Số nào nhân với chính nó bằng 9? Đó là 3 và -3. Số nào nhân với chính nó bằng 2? Đó là một số vô tỉ!",
    warmupEn:"What number times itself is 9? It is 3 and -3. What number times itself is 2? That is an irrational number!",
    thinkVi:"Số thực bao gồm những tập hợp số nào?", thinkEn:"What sets compose the real numbers?",
    k1TitleVi:"1. Số vô tỉ", k1TitleEn:"1. Irrational Numbers",
    k1Vi:"Số viết dưới dạng số thập phân vô hạn không tuần hoàn. Ví dụ: √2, π.",
    k1En:"Numbers represented as non-repeating infinite decimals. E.g. √2, π.",
    k2TitleVi:"2. Căn bậc hai số học", k2TitleEn:"2. Arithmetic Square Root",
    k2Vi:"Căn bậc hai số học của số a không âm là số x không âm sao cho x² = a.",
    k2En:"The arithmetic square root of non-negative number a is non-negative x such that x² = a.",
    k3TitleVi:"3. Tập hợp số thực R", k3TitleEn:"3. Set of Real Numbers R",
    k3Vi:"Bao gồm số hữu tỉ và số vô tỉ. Kí hiệu tập hợp là R.",
    k3En:"Includes both rational and irrational numbers. Denoted by R.",
    mcq:[
      { qVi:"Căn bậc hai số học của 16 là:", qEn:"The arithmetic square root of 16 is:", opts:["4","-4","±4","8"], a:0, exVi:"Căn số học luôn không âm: √16 = 4.", exEn:"Arithmetic square root is always non-negative: √16 = 4." }
    ],
    tfc:[
      { sVi:"Mọi số thực đều là số hữu tỉ.", sEn:"Every real number is a rational number.", a:false, exVi:"SAI — √2 là số thực nhưng không phải số hữu tỉ.", exEn:"FALSE — √2 is a real number but not rational." }
    ],
    fill:[
      { id:"f1", tVi:"Căn bậc hai số học của 0 là ___", tEn:"The arithmetic square root of 0 is ___", ans:"0", alt:["không"], hVi:"Số không", hEn:"Zero" }
    ],
    glossary:[["Square root", "Căn bậc hai"], ["Irrational", "Vô tỉ"], ["Real number", "Số thực"]]
  },
  {
    file: "Cacbaitoan7/L7_C2_L1.js", grade:7, chapter:2, lesson:1,
    slug:"L7-C2-L1", backPath:"Cacbaitoan7",
    titleVi:"Tỉ Lệ Thức", titleEn:"Ratios & Proportionality",
    warmupVi:"Công thức pha sơn: 2 phần xanh : 3 phần trắng. Nếu bạn cần 12 lít xanh thì cần bao nhiêu lít trắng? Tỉ lệ thức giúp giải quyết bài toán này!",
    warmupEn:"Paint mixing ratio: 2 parts blue to 3 parts white. If you need 12 liters of blue, how much white do you need? Proportionality solves this!",
    thinkVi:"a/b = c/d thì a × d = b × c. Tại sao tích chéo bằng nhau?", thinkEn:"a/b = c/d means a × d = b × c. Why are cross-products equal?",
    k1TitleVi:"1. Tỉ số và tỉ lệ thức", k1TitleEn:"1. Ratios & Proportions",
    k1Vi:"Tỉ số a:b = a/b (b≠0). Tỉ lệ thức a:b = c:d ⟺ a/b = c/d ⟺ a×d = b×c.",
    k1En:"Ratio a:b = a/b (b≠0). Proportion a:b = c:d ⟺ a/b = c/d ⟺ a×d = b×c.",
    k2TitleVi:"2. Tính chất tỉ lệ thức", k2TitleEn:"2. Properties of Proportions",
    k2Vi:"Nếu a/b = c/d thì: (a+b)/b = (c+d)/d; a/(a+b) = c/(c+d); (a-b)/b = (c-d)/d.",
    k2En:"If a/b = c/d then: (a+b)/b = (c+d)/d; a/(a+b) = c/(c+d); (a-b)/b = (c-d)/d.",
    k3TitleVi:"3. Dãy tỉ số bằng nhau", k3TitleEn:"3. Equal Ratio Chains",
    k3Vi:"a/b = c/d = e/f = (a+c+e)/(b+d+f). Đây là tính chất dãy tỉ số bằng nhau.",
    k3En:"a/b = c/d = e/f = (a+c+e)/(b+d+f). This is the property of equal ratio chains.",
    mcq:[
      { qVi:"Tìm x biết: x/5 = 6/10", qEn:"Find x: x/5 = 6/10", opts:["2","3","4","6"], a:1, exVi:"x×10 = 5×6 = 30, x = 3.", exEn:"x×10 = 5×6 = 30, x = 3." }
    ],
    tfc:[
      { sVi:"Nếu a/b = c/d thì a×d = b×c.", sEn:"If a/b = c/d then a×d = b×c.", a:true, exVi:"ĐÚNG — Đây là tính chất tích chéo của tỉ lệ thức.", exEn:"TRUE — This is the cross-multiplication property of proportions." }
    ],
    fill:[
      { id:"f1", tVi:"Tìm x biết: 4/x = 8/14, x = ___", tEn:"Find x: 4/x = 8/14, x = ___", ans:"7", alt:["bảy"], hVi:"Tích chéo: 4×14/8", hEn:"Cross multiply: 4×14/8" }
    ],
    glossary:[["Ratio", "Tỉ số"], ["Proportion", "Tỉ lệ thức"], ["Cross-multiplication", "Tích chéo"]]
  },
  {
    file: "Cacbaitoan7/L7_C2_L2.js", grade:7, chapter:2, lesson:2,
    slug:"L7-C2-L2", backPath:"Cacbaitoan7",
    titleVi:"Tỉ Lệ Thuận & Nghịch", titleEn:"Direct & Inverse Proportion",
    warmupVi:"Nếu đi nhanh gấp đôi, thời gian đến nơi giảm còn một nửa. Nếu mua gấp đôi số hàng, tổng tiền tăng gấp đôi. Đây là hai loại tỉ lệ khác nhau!",
    warmupEn:"If you travel twice as fast, it takes half the time. If you buy twice the goods, the total cost doubles. These are two different types of proportion!",
    thinkVi:"Vận tốc và thời gian (quãng đường không đổi) tỉ lệ thuận hay nghịch?", thinkEn:"Speed and time (fixed distance) — are they directly or inversely proportional?",
    k1TitleVi:"1. Tỉ lệ thuận", k1TitleEn:"1. Direct Proportion",
    k1Vi:"y tỉ lệ thuận với x: y = kx (k ≠ 0). Nếu x tăng k lần thì y tăng k lần. Ký hiệu y ∝ x.",
    k1En:"y is directly proportional to x: y = kx (k ≠ 0). If x multiplies by k, y multiplies by k. Notation y ∝ x.",
    k2TitleVi:"2. Tỉ lệ nghịch", k2TitleEn:"2. Inverse Proportion",
    k2Vi:"y tỉ lệ nghịch với x: y = k/x (k ≠ 0). Nếu x tăng k lần thì y giảm k lần. x×y = k = hằng số.",
    k2En:"y is inversely proportional to x: y = k/x (k ≠ 0). If x multiplies by k, y divides by k. x×y = k = constant.",
    k3TitleVi:"3. Bài toán ứng dụng", k3TitleEn:"3. Applied Problems",
    k3Vi:"Xác định loại tỉ lệ → lập bảng → tìm hệ số k → tính toán. Lưu ý: Tỉ lệ thuận: y₁/y₂ = x₁/x₂; Tỉ lệ nghịch: y₁×x₁ = y₂×x₂.",
    k3En:"Identify proportion type → set up table → find k → calculate. Note: Direct: y₁/y₂ = x₁/x₂; Inverse: y₁×x₁ = y₂×x₂.",
    mcq:[
      { qVi:"Biết y tỉ lệ thuận với x, y=6 khi x=2. Khi x=5, y=?", qEn:"y is directly proportional to x. y=6 when x=2. When x=5, y=?", opts:["10","12","15","18"], a:2, exVi:"k = y/x = 6/2 = 3. y = 3×5 = 15.", exEn:"k = y/x = 6/2 = 3. y = 3×5 = 15." }
    ],
    tfc:[
      { sVi:"Vận tốc và thời gian (quãng đường không đổi) tỉ lệ thuận.", sEn:"Speed and time (fixed distance) are directly proportional.", a:false, exVi:"SAI — v×t = s (hằng số) → tỉ lệ nghịch.", exEn:"FALSE — v×t = s (constant) → inverse proportion." }
    ],
    fill:[
      { id:"f1", tVi:"Nếu y tỉ lệ thuận với x theo hệ số k=3, thì x=2 cho y= ___", tEn:"If y is directly proportional to x with k=3, then x=2 yields y= ___", ans:"6", alt:["sáu"], hVi:"y = 3*x", hEn:"y = 3*x" }
    ],
    glossary:[["Direct proportion", "Tỉ lệ thuận"], ["Inverse proportion", "Tỉ lệ nghịch"], ["Constant", "Hằng số"]]
  },
  {
    file: "Cacbaitoan7/L7_C3_L1.js", grade:7, chapter:3, lesson:1,
    slug:"L7-C3-L1", backPath:"Cacbaitoan7",
    titleVi:"Thu Thập & Biểu Diễn Số Liệu", titleEn:"Data Collection & Representation",
    warmupVi:"Lớp bạn có 30 học sinh, bạn muốn biết môn học yêu thích của mọi người. Bạn sẽ thu thập và trình bày dữ liệu đó như thế nào? Đây là bài học về thống kê!",
    warmupEn:"Your class has 30 students and you want to know everyone's favorite subject. How do you collect and present that data? This is a lesson in statistics!",
    thinkVi:"Biểu đồ cột và biểu đồ hình tròn khác nhau như thế nào?", thinkEn:"How are bar charts and pie charts different?",
    k1TitleVi:"1. Thu thập số liệu", k1TitleEn:"1. Collecting Data",
    k1Vi:"Dấu hiệu thống kê X. Giá trị của dấu hiệu: x₁, x₂,... Tần số nₖ là số lần giá trị xₖ xuất hiện.",
    k1En:"Statistical characteristic X. Values: x₁, x₂,... Frequency nₖ is how many times value xₖ appears.",
    k2TitleVi:"2. Bảng phân phối tần số", k2TitleEn:"2. Frequency Distribution Table",
    k2Vi:"Bảng liệt kê giá trị và tần số tương ứng. Tổng tần số = n (cỡ mẫu). Tần suất fₖ = nₖ/n.",
    k2En:"Table listing values and corresponding frequencies. Sum of frequencies = n (sample size). Relative frequency fₖ = nₖ/n.",
    k3TitleVi:"3. Biểu đồ thống kê", k3TitleEn:"3. Statistical Charts",
    k3Vi:"Biểu đồ cột: so sánh các nhóm. Biểu đồ đoạn thẳng: xu hướng theo thời gian. Biểu đồ hình tròn: tỉ lệ phần.",
    k3En:"Bar chart: compare groups. Line chart: trends over time. Pie chart: proportional parts.",
    mcq:[
      { qVi:"Tần số là gì?", qEn:"What is frequency?", opts:["Số lần giá trị xuất hiện","Giá trị trung bình","Tổng số liệu","Giá trị nhỏ nhất"], a:0, exVi:"Tần số là số lần xuất hiện của mỗi giá trị trong dãy số liệu.", exEn:"Frequency is the number of times each value appears in the dataset." }
    ],
    tfc:[
      { sVi:"Tổng tất cả tần số bằng cỡ mẫu n.", sEn:"The sum of all frequencies equals the sample size n.", a:true, exVi:"ĐÚNG — Σnₖ = n.", exEn:"TRUE — Σnₖ = n." }
    ],
    fill:[
      { id:"f1", tVi:"Cỡ mẫu n=20, tần số của giá trị x=5 là 4. Tần suất là ___ %", tEn:"Sample size n=20, frequency of value x=5 is 4. Relative frequency is ___ %", ans:"20", alt:["hai mươi"], hVi:"4/20 = 20%", hEn:"4/20 = 20%" }
    ],
    glossary:[["Frequency", "Tần số"], ["Sample size", "Cỡ mẫu"], ["Bar chart", "Biểu đồ cột"]]
  },
  {
    file: "Cacbaitoan7/L7_C3_L2.js", grade:7, chapter:3, lesson:2,
    slug:"L7-C3-L2", backPath:"Cacbaitoan7",
    titleVi:"Số Trung Bình Cộng, Mốt, Trung Vị", titleEn:"Mean, Mode & Median",
    warmupVi:"Điểm của 5 bài kiểm tra: 7, 8, 6, 9, 7. Điểm trung bình là bao nhiêu? Điểm nào xuất hiện nhiều nhất? Điểm ở giữa sau khi sắp xếp là gì?",
    warmupEn:"Scores from 5 tests: 7, 8, 6, 9, 7. What is the average? Which score appears most? What is the middle value after sorting?",
    thinkVi:"Khi nào nên dùng trung vị thay vì trung bình cộng để đại diện cho dữ liệu?", thinkEn:"When should you use median instead of mean to represent data?",
    k1TitleVi:"1. Số trung bình cộng (Mean)", k1TitleEn:"1. Arithmetic Mean",
    k1Vi:"x̄ = (x₁+x₂+...+xₙ)/n = Σ(xᵢ×nᵢ)/n (với bảng phân phối tần số).",
    k1En:"x̄ = (x₁+x₂+...+xₙ)/n = Σ(xᵢ×nᵢ)/n (with frequency distribution).",
    k2TitleVi:"2. Mốt (Mode)", k2TitleEn:"2. Mode",
    k2Vi:"Mốt M₀ là giá trị xuất hiện nhiều nhất. Dữ liệu có thể có 1, nhiều hoặc không có mốt.",
    k2En:"Mode M₀ is the most frequent value. Data may have one, multiple, or no mode.",
    k3TitleVi:"3. Trung vị (Median)", k3TitleEn:"3. Median",
    k3Vi:"Sắp xếp tăng dần. Nếu n lẻ: trung vị = phần tử giữa. Nếu n chẵn: trung vị = trung bình 2 phần tử giữa.",
    k3En:"Sort ascending. If n is odd: median = middle element. If n is even: median = average of 2 middle elements.",
    mcq:[
      { qVi:"Dữ liệu: 4,6,3,8,4,7,4. Mốt là:", qEn:"Data: 4,6,3,8,4,7,4. Mode is:", opts:["3","4","6","7"], a:1, exVi:"4 xuất hiện 3 lần, nhiều nhất.", exEn:"4 appears 3 times, the most." }
    ],
    tfc:[
      { sVi:"Trung vị chia dữ liệu đã sắp xếp thành hai nửa bằng nhau.", sEn:"The median divides sorted data into two equal halves.", a:true, exVi:"ĐÚNG — Đây là định nghĩa trung vị.", exEn:"TRUE — This is the definition of median." }
    ],
    fill:[
      { id:"f1", tVi:"Trung bình cộng của 3, 5, 7 là ___", tEn:"The mean of 3, 5, 7 is ___", ans:"5", alt:["năm"], hVi:"(3+5+7)/3", hEn:"(3+5+7)/3" }
    ],
    glossary:[["Mean", "Số trung bình cộng"], ["Mode", "Mốt"], ["Median", "Trung vị"]]
  },
  {
    file: "Cacbaitoan7/L7_C4_L1.js", grade:7, chapter:4, lesson:1,
    slug:"L7-C4-L1", backPath:"Cacbaitoan7",
    titleVi:"Đơn Thức & Đa Thức", titleEn:"Monomials & Polynomials",
    warmupVi:"Diện tích hình chữ nhật có chiều dài (x+3) và chiều rộng 2 là 2(x+3) = 2x+6. Đây là một đa thức trong x! Đại số giúp ta biểu diễn bài toán tổng quát.",
    warmupEn:"Area of a rectangle with length (x+3) and width 2 is 2(x+3) = 2x+6. This is a polynomial in x! Algebra lets us express general problems.",
    thinkVi:"2x² + 3x - 5: đây là đa thức bậc mấy? Có bao nhiêu hạng tử?", thinkEn:"2x² + 3x - 5: what degree is this polynomial? How many terms does it have?",
    k1TitleVi:"1. Đơn thức", k1TitleEn:"1. Monomials",
    k1Vi:"Đơn thức là biểu thức đại số gồm 1 hạng tử: tích của số và các biến. Bậc = tổng số mũ. Ví dụ: -3x²y³ bậc 5.",
    k1En:"A monomial is an algebraic expression with one term: product of a number and variables. Degree = sum of exponents. E.g. -3x²y³ has degree 5.",
    k2TitleVi:"2. Đa thức", k2TitleEn:"2. Polynomials",
    k2Vi:"Đa thức là tổng của nhiều đơn thức. Bậc của đa thức = bậc của hạng tử bậc cao nhất. 2x³ - 4x + 7 bậc 3.",
    k2En:"A polynomial is a sum of monomials. Degree = highest degree term. 2x³ - 4x + 7 has degree 3.",
    k3TitleVi:"3. Đa thức một biến", k3TitleEn:"3. Single-Variable Polynomials",
    k3Vi:"P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Hệ số cao nhất aₙ ≠ 0. Hệ số tự do a₀.",
    k3En:"P(x) = aₙxⁿ + aₙ₋₁xⁿ⁻¹ + ... + a₁x + a₀. Leading coefficient aₙ ≠ 0. Constant term a₀.",
    mcq:[
      { qVi:"Bậc của đơn thức 4x³y²:", qEn:"Degree of monomial 4x³y²:", opts:["3","2","5","6"], a:2, exVi:"Bậc = 3+2 = 5.", exEn:"Degree = 3+2 = 5." }
    ],
    tfc:[
      { sVi:"Đa thức 3x² + 2x + 1 có 4 hạng tử.", sEn:"The polynomial 3x² + 2x + 1 has 4 terms.", a:false, exVi:"SAI — Nó có 3 hạng tử: 3x², 2x, 1.", exEn:"FALSE — It has 3 terms: 3x², 2x, 1." }
    ],
    fill:[
      { id:"f1", tVi:"Bậc của đa thức x^5 - 3x^2 + 1 là ___", tEn:"The degree of polynomial x^5 - 3x^2 + 1 is ___", ans:"5", alt:["năm"], hVi:"Mũ lớn nhất", hEn:"The largest exponent" }
    ],
    glossary:[["Monomial", "Đơn thức"], ["Polynomial", "Đa thức"], ["Degree", "Bậc"]]
  },
  {
    file: "Cacbaitoan7/L7_C4_L2.js", grade:7, chapter:4, lesson:2,
    slug:"L7-C4-L2", backPath:"Cacbaitoan7",
    titleVi:"Cộng & Trừ Đa Thức", titleEn:"Adding & Subtracting Polynomials",
    warmupVi:"Chu vi mảnh vườn hình chữ nhật có chiều dài (3x+2) m và chiều rộng (x+4) m là: 2(3x+2) + 2(x+4) = 8x+12. Đây là cộng đa thức!",
    warmupEn:"Perimeter of a rectangle with length (3x+2) m and width (x+4) m: 2(3x+2) + 2(x+4) = 8x+12. This is polynomial addition!",
    thinkVi:"Để cộng (3x² - 2x + 1) + (x² + 4x - 3), bạn phải nhóm những hạng tử nào?", thinkEn:"To add (3x² - 2x + 1) + (x² + 4x - 3), which terms do you group?",
    k1TitleVi:"1. Cộng đa thức", k1TitleEn:"1. Adding Polynomials",
    k1Vi:"Nhóm các hạng tử đồng dạng rồi cộng. (2x² + 3x) + (x² - x + 5) = 3x² + 2x + 5.",
    k1En:"Group like terms then add. (2x² + 3x) + (x² - x + 5) = 3x² + 2x + 5.",
    k2TitleVi:"2. Trừ đa thức", k2TitleEn:"2. Subtracting Polynomials",
    k2Vi:"Đổi dấu tất cả hạng tử của đa thức trừ rồi cộng. (5x² - 3) - (2x² + x - 1) = 3x² - x - 2.",
    k2En:"Change the sign of every term in the subtracted polynomial then add. (5x² - 3) - (2x² + x - 1) = 3x² - x - 2.",
    k3TitleVi:"3. Sắp xếp đa thức", k3TitleEn:"3. Ordering Polynomials",
    k3Vi:"Sắp xếp theo bậc giảm dần: P(x) = 4x³ - 2x² + 0x + 7. Điền hệ số 0 cho hạng tử thiếu.",
    k3En:"Arrange by descending degree: P(x) = 4x³ - 2x² + 0x + 7. Fill in 0 for missing terms.",
    mcq:[
      { qVi:"(2x + 3) + (4x - 1) = ?", qEn:"(2x + 3) + (4x - 1) = ?", opts:["6x+4","6x+2","6x-2","8x+2"], a:1, exVi:"Nhóm: (2x+4x) + (3-1) = 6x + 2.", exEn:"Group: (2x+4x) + (3-1) = 6x + 2." }
    ],
    tfc:[
      { sVi:"Khi trừ đa thức, đổi dấu TẤT CẢ các hạng tử của đa thức trừ.", sEn:"When subtracting a polynomial, change ALL signs of the subtracted polynomial.", a:true, exVi:"ĐÚNG — -(a+b-c) = -a-b+c.", exEn:"TRUE — -(a+b-c) = -a-b+c." }
    ],
    fill:[
      { id:"f1", tVi:"(3x^2) + (5x^2) = ___ x^2", tEn:"(3x^2) + (5x^2) = ___ x^2", ans:"8", alt:["tám"], hVi:"Cộng hệ số: 3 + 5", hEn:"Add coefficients: 3 + 5" }
    ],
    glossary:[["Like terms", "Hạng tử đồng dạng"], ["Simplify", "Thu gọn"], ["Sum", "Tổng"]]
  },
  {
    file: "Cacbaitoan7/L7_C4_L3.js", grade:7, chapter:4, lesson:3,
    slug:"L7-C4-L3", backPath:"Cacbaitoan7",
    titleVi:"Nghiệm Của Đa Thức", titleEn:"Roots of Polynomials",
    warmupVi:"Nhiệt độ theo giờ mô tả bởi P(t) = -t² + 6t - 5. Hỏi vào lúc mấy giờ nhiệt độ bằng 0? Đây là bài toán tìm nghiệm đa thức!",
    warmupEn:"Temperature over hours modeled by P(t) = -t² + 6t - 5. At what times is the temperature 0? This is a polynomial root problem!",
    thinkVi:"Nếu P(a) = 0 thì a là nghiệm của P. Đa thức bậc n có nhiều nhất bao nhiêu nghiệm?", thinkEn:"If P(a) = 0, then a is a root of P. At most how many roots does a degree-n polynomial have?",
    k1TitleVi:"1. Giá trị đa thức", k1TitleEn:"1. Polynomial Values",
    k1Vi:"Giá trị của P(x) tại x=a ký hiệu P(a): thay x=a vào đa thức và tính. P(x)=3x-2 → P(1)=1, P(2)=4.",
    k1En:"Value of P(x) at x=a, written P(a): substitute x=a and calculate. P(x)=3x-2 → P(1)=1, P(2)=4.",
    k2TitleVi:"2. Nghiệm của đa thức", k2TitleEn:"2. Roots of Polynomials",
    k2Vi:"a là nghiệm của P(x) nếu P(a) = 0. Đa thức bậc n có nhiều nhất n nghiệm thực.",
    k2En:"a is a root of P(x) if P(a) = 0. A degree-n polynomial has at most n real roots.",
    k3TitleVi:"3. Tìm nghiệm đơn giản", k3TitleEn:"3. Finding Simple Roots",
    k3Vi:"Với đa thức bậc 1: ax + b = 0 → x = -b/a. Với bậc 2: dùng công thức nghiệm hoặc nhẩm.",
    k3En:"For degree 1: ax + b = 0 → x = -b/a. For degree 2: use quadratic formula or inspection.",
    mcq:[
      { qVi:"P(x) = 2x - 6. Nghiệm của P(x) là:", qEn:"P(x) = 2x - 6. Root of P(x) is:", opts:["x=1","x=3","x=6","x=2"], a:1, exVi:"2x-6=0 → x=3.", exEn:"2x-6=0 → x=3." }
    ],
    tfc:[
      { sVi:"Đa thức bậc n có nhiều nhất n nghiệm.", sEn:"A degree-n polynomial has at most n roots.", a:true, exVi:"ĐÚNG — Đây là Định lý nghiệm của đa thức.", exEn:"TRUE — This is the Polynomial Root Theorem." }
    ],
    fill:[
      { id:"f1", tVi:"Nghiệm của đa thức x + 9 là ___", tEn:"The root of the polynomial x + 9 is ___", ans:"-9", alt:["âm chín"], hVi:"x + 9 = 0", hEn:"x + 9 = 0" }
    ],
    glossary:[["Root", "Nghiệm"], ["Evaluate", "Tính giá trị"], ["Theorem", "Định lý"]]
  },

  // ── GRADE 8 ─────────────────────────────────────────────────────────────────
  {
    file: "Cacbaitoan8/L8_C1_L1.js", grade:8, chapter:1, lesson:1,
    slug:"L8-C1-L1", backPath:"Cacbaitoan8",
    titleVi:"Hằng Đẳng Thức Đáng Nhớ", titleEn:"Notable Algebraic Identities",
    warmupVi:"Hằng đẳng thức giúp ta nhân nhanh các đa thức mà không cần nhân từng hạng tử. Hãy tìm hiểu 7 hằng đẳng thức đáng nhớ nhé!",
    warmupEn:"Algebraic identities allow us to multiply polynomials quickly without expanding term-by-term. Let's learn them!",
    thinkVi:"(a + b)² có bằng a² + b² không?", thinkEn:"Does (a + b)² equal a² + b²?",
    k1TitleVi:"1. Bình phương của một tổng/hiệu", k1TitleEn:"1. Square of a Sum/Difference",
    k1Vi:"(a+b)² = a² + 2ab + b². (a-b)² = a² - 2ab + b².",
    k1En:"(a+b)² = a² + 2ab + b². (a-b)² = a² - 2ab + b².",
    k2TitleVi:"2. Hiệu hai bình phương", k2TitleEn:"2. Difference of Two Squares",
    k2Vi:"a² - b² = (a - b)(a + b). Rất hữu ích để phân tích thành nhân tử.",
    k2En:"a² - b² = (a - b)(a + b). Very useful for factoring.",
    k3TitleVi:"3. Lập phương của một tổng/hiệu", k3TitleEn:"3. Cube of a Sum/Difference",
    k3Vi:"(a+b)³ = a³ + 3a²b + 3ab² + b³. (a-b)³ = a³ - 3a²b + 3ab² - b³.",
    k3En:"(a+b)³ = a³ + 3a²b + 3ab² + b³. (a-b)³ = a³ - 3a²b + 3ab² - b³.",
    mcq:[
      { qVi:"Khai triển (x + 2)² ta được:", qEn:"Expand (x + 2)²:", opts:["x² + 4","x² + 2x + 4","x² + 4x + 4","x² + 4x + 2"], a:2, exVi:"(x+2)² = x² + 2*x*2 + 2² = x² + 4x + 4.", exEn:"(x+2)² = x² + 2*x*2 + 2² = x² + 4x + 4." }
    ],
    tfc:[
      { sVi:"(a - b)² = (b - a)².", sEn:"(a - b)² = (b - a)².", a:true, exVi:"ĐÚNG — Vì (-x)² = x².", exEn:"TRUE — Since (-x)² = x²." }
    ],
    fill:[
      { id:"f1", tVi:"Khai triển: x^2 - 9 = (x - 3)(x + ___)", tEn:"Expand: x^2 - 9 = (x - 3)(x + ___)", ans:"3", alt:["ba"], hVi:"Hiệu hai bình phương", hEn:"Difference of squares" }
    ],
    glossary:[["Identity", "Hằng đẳng thức"], ["Expansion", "Khai triển"], ["Square", "Bình phương"]]
  },
  {
    file: "Cacbaitoan8/L8_C1_L2.js", grade:8, chapter:1, lesson:2,
    slug:"L8-C1-L2", backPath:"Cacbaitoan8",
    titleVi:"Phân Tích Đa Thức Thành Nhân Tử", titleEn:"Polynomial Factorization",
    warmupVi:"Phân tích đa thức thành nhân tử là biến đổi một đa thức thành tích của những đa thức khác, giống như phân tích một số thành các thừa số nguyên tố.",
    warmupEn:"Polynomial factorization is transforming a polynomial into a product of other polynomials, similar to prime factorization.",
    thinkVi:"Tại sao phân tích thành nhân tử lại giúp giải phương trình dễ dàng hơn?", thinkEn:"Why does factoring help in solving equations?",
    k1TitleVi:"1. Phương pháp đặt nhân tử chung", k1TitleEn:"1. Common Factor Method",
    k1Vi:"Tìm nhân tử chung của tất cả hạng tử rồi đưa ra ngoài dấu ngoặc: ab + ac = a(b+c).",
    k1En:"Find the common factor of all terms and extract it: ab + ac = a(b+c).",
    k2TitleVi:"2. Phương pháp dùng hằng đẳng thức", k2TitleEn:"2. Using Identities",
    k2Vi:"Áp dụng các hằng đẳng thức đáng nhớ để viết đa thức dưới dạng tích.",
    k2En:"Apply notable algebraic identities to express the polynomial as a product.",
    k3TitleVi:"3. Phương pháp nhóm hạng tử", k3TitleEn:"3. Grouping Terms",
    k3Vi:"Nhóm các hạng tử thích hợp để làm xuất hiện nhân tử chung hoặc hằng đẳng thức.",
    k3En:"Group appropriate terms together to reveal common factors or identities.",
    mcq:[
      { qVi:"Phân tích x² - 4x thành nhân tử:", qEn:"Factor x² - 4x:", opts:["x(x - 4)","x(x + 4)","(x - 2)²","(x - 2)(x + 2)"], a:0, exVi:"Đặt x làm nhân tử chung: x(x - 4).", exEn:"Extract x as common factor: x(x - 4)." }
    ],
    tfc:[
      { sVi:"Không phải đa thức nào cũng phân tích được thành nhân tử trên tập số thực.", sEn:"Not every polynomial can be factored over the real numbers.", a:true, exVi:"ĐÚNG — Ví dụ x² + 1 không thể phân tích tiếp.", exEn:"TRUE — E.g. x² + 1 cannot be factored further." }
    ],
    fill:[
      { id:"f1", tVi:"Phân tích x^2 - 25 = (x - 5)(x + ___)", tEn:"Factor x^2 - 25 = (x - 5)(x + ___)", ans:"5", alt:["năm"], hVi:"Hiệu hai bình phương", hEn:"Difference of squares" }
    ],
    glossary:[["Factorization", "Phân tích thành nhân tử"], ["Factor", "Nhân tử"], ["Grouping", "Nhóm hạng tử"]]
  },
  {
    file: "Cacbaitoan8/L8_C1_L3.js", grade:8, chapter:1, lesson:3,
    slug:"L8-C1-L3", backPath:"Cacbaitoan8",
    titleVi:"Phân Thức Đại Số", titleEn:"Algebraic Fractions",
    warmupVi:"Khi ta chia đa thức này cho đa thức kia, ta nhận được một phân thức đại số. Hãy cùng tìm hiểu định nghĩa và tính chất của nó!",
    warmupEn:"When we divide one polynomial by another, we get an algebraic fraction. Let's study its definition and properties!",
    thinkVi:"Điều kiện xác định của một phân thức đại số là gì?", thinkEn:"What is the domain condition of an algebraic fraction?",
    k1TitleVi:"1. Định nghĩa phân thức", k1TitleEn:"1. Definition of Fraction",
    k1Vi:"Biểu thức có dạng A/B, trong đó A và B là các đa thức, B khác đa thức 0.",
    k1En:"An expression of the form A/B, where A and B are polynomials, and B is not the zero polynomial.",
    k2TitleVi:"2. Tính chất cơ bản", k2TitleEn:"2. Fundamental Properties",
    k2Vi:"Nhân hoặc chia cả tử và mẫu với cùng một đa thức khác 0 ta được phân thức bằng phân thức đã cho.",
    k2En:"Multiply or divide numerator and denominator by same non-zero polynomial to get equivalent fraction.",
    k3TitleVi:"3. Rút gọn phân thức", k3TitleEn:"3. Simplification",
    k3Vi:"Phân tích tử và mẫu thành nhân tử rồi chia cả tử và mẫu cho nhân tử chung.",
    k3En:"Factor both numerator and denominator, then cancel the common factors.",
    mcq:[
      { qVi:"Phân thức (x - 1)/(x - 2) xác định khi:", qEn:"The fraction (x - 1)/(x - 2) is defined when:", opts:["x ≠ 1","x ≠ 2","x ≠ 0","x ≠ -2"], a:1, exVi:"Mẫu số phải khác 0: x - 2 ≠ 0 ⟺ x ≠ 2.", exEn:"The denominator must be non-zero: x - 2 ≠ 0 ⟺ x ≠ 2." }
    ],
    tfc:[
      { sVi:"(x - 1)/x = x - 1.", sEn:"(x - 1)/x = x - 1.", a:false, exVi:"SAI — Không thể rút gọn x ở tử và mẫu như vậy.", exEn:"FALSE — You cannot cancel x like that." }
    ],
    fill:[
      { id:"f1", tVi:"Để phân thức A/B xác định thì đa thức B phải khác ___", tEn:"For fraction A/B to be defined, polynomial B must be different from ___", ans:"0", alt:["không"], hVi:"Đa thức không", hEn:"Zero polynomial" }
    ],
    glossary:[["Algebraic fraction", "Phân thức đại số"], ["Domain", "Điều kiện xác định"], ["Cancel", "Triệt tiêu / Rút gọn"]]
  },
  {
    file: "Cacbaitoan8/L8_C2_L1.js", grade:8, chapter:2, lesson:1,
    slug:"L8-C2-L1", backPath:"Cacbaitoan8",
    titleVi:"Phương Trình Bậc Nhất Một Ẩn", titleEn:"One-Variable Linear Equations",
    warmupVi:"Một cây cầu dài gấp đôi một con đường. Tổng cộng là 900m. Cây cầu dài bao nhiêu? Đặt x là độ dài con đường: x + 2x = 900. Đây là phương trình bậc nhất!",
    warmupEn:"A bridge is twice as long as a road. Together they are 900m. How long is the bridge? Let x = road length: x + 2x = 900. This is a linear equation!",
    thinkVi:"Phương trình 3x + 5 = 14 có bao nhiêu nghiệm? Làm sao tìm?", thinkEn:"How many solutions does 3x + 5 = 14 have? How do you find them?",
    k1TitleVi:"1. Định nghĩa phương trình", k1TitleEn:"1. Equation Definition",
    k1Vi:"Phương trình bậc nhất: ax + b = 0 (a≠0). Nghiệm: x = -b/a. Hai phương trình tương đương có cùng tập nghiệm.",
    k1En:"Linear equation: ax + b = 0 (a≠0). Solution: x = -b/a. Equivalent equations have the same solution set.",
    k2TitleVi:"2. Giải phương trình", k2TitleEn:"2. Solving Equations",
    k2Vi:"Các bước: Chuyển vế (đổi dấu), thu gọn hai vế, chia cả hai vế cho hệ số của ẩn.",
    k2En:"Steps: Transpose (change sign), simplify both sides, divide both sides by the coefficient.",
    k3TitleVi:"3. Bài toán có lời văn", k3TitleEn:"3. Word Problems",
    k3Vi:"Bước 1: Đặt ẩn (chọn x). Bước 2: Lập phương trình. Bước 3: Giải. Bước 4: Kiểm tra, trả lời.",
    k3En:"Step 1: Set variable (choose x). Step 2: Write equation. Step 3: Solve. Step 4: Check and answer.",
    mcq:[
      { qVi:"Giải phương trình: 3x - 9 = 0", qEn:"Solve: 3x - 9 = 0", opts:["x=1","x=2","x=3","x=9"], a:2, exVi:"3x=9 → x=3.", exEn:"3x=9 → x=3." },
      { qVi:"Giải: 2x + 5 = 13", qEn:"Solve: 2x + 5 = 13", opts:["x=3","x=4","x=5","x=9"], a:1, exVi:"2x=8 → x=4.", exEn:"2x=8 → x=4." }
    ],
    tfc:[
      { sVi:"Phương trình bậc nhất có đúng một nghiệm.", sEn:"A linear equation has exactly one solution.", a:true, exVi:"ĐÚNG — ax+b=0 (a≠0) → x=-b/a là nghiệm duy nhất.", exEn:"TRUE — ax+b=0 (a≠0) → x=-b/a is the unique solution." }
    ],
    fill:[
      { id:"f1", tVi:"Nghiệm của phương trình 5x - 10 = 0 là x = ___", tEn:"The solution of 5x - 10 = 0 is x = ___", ans:"2", alt:["hai"], hVi:"5x = 10", hEn:"5x = 10" }
    ],
    glossary:[["Linear equation", "Phương trình bậc nhất"], ["Solution", "Nghiệm"], ["Transpose", "Chuyển vế"]]
  },
  {
    file: "Cacbaitoan8/L8_C2_L2.js", grade:8, chapter:2, lesson:2,
    slug:"L8-C2-L2", backPath:"Cacbaitoan8",
    titleVi:"Phương Trình Chứa Ẩn Ở Mẫu", titleEn:"Equations with Variable Denominators",
    warmupVi:"Khoảng cách 1/(x+1) + 1/(x-1) = 0. Nhìn thấy x ở mẫu? Bạn cần loại bỏ mẫu, nhưng phải kiểm tra điều kiện x ≠ ±1!",
    warmupEn:"The expression 1/(x+1) + 1/(x-1) = 0. See x in the denominator? You need to clear it, but must check the condition x ≠ ±1!",
    thinkVi:"Tại sao phải tìm điều kiện xác định trước khi giải phương trình chứa ẩn ở mẫu?", thinkEn:"Why must you find the domain conditions before solving equations with variable denominators?",
    k1TitleVi:"1. Điều kiện xác định", k1TitleEn:"1. Domain Conditions",
    k1Vi:"ĐKXĐ: tập hợp giá trị x làm cho tất cả mẫu ≠ 0. Phải tìm ĐKXĐ trước khi giải.",
    k1En:"Domain condition (DC): set of x-values making all denominators ≠ 0. Must find DC before solving.",
    k2TitleVi:"2. Quy trình giải", k2TitleEn:"2. Solution Process",
    k2Vi:"1. Tìm ĐKXĐ. 2. Quy đồng mẫu. 3. Nhân hai vế với mẫu chung (khử mẫu). 4. Giải. 5. Kiểm tra.",
    k2En:"1. Find domain condition. 2. Find LCD. 3. Multiply both sides by LCD (clear denominators). 4. Solve. 5. Check.",
    k3TitleVi:"3. Loại nghiệm ngoại lai", k3TitleEn:"3. Excluding Extraneous Solutions",
    k3Vi:"Nghiệm tìm được phải thỏa ĐKXĐ. Nếu vi phạm ĐKXĐ thì đó là nghiệm ngoại lai, loại bỏ.",
    k3En:"Solutions found must satisfy the domain condition. If they violate DC, they are extraneous solutions and must be rejected.",
    mcq:[
      { qVi:"ĐKXĐ của phương trình 1/x + 2/(x-3) = 5 là:", qEn:"Domain condition of 1/x + 2/(x-3) = 5:", opts:["x≠0","x≠3","x≠0 và x≠3","x≠-3"], a:2, exVi:"Mẫu x≠0 và mẫu (x-3)≠0 → x≠3.", exEn:"Denominators x≠0 and (x-3)≠0 → x≠3." }
    ],
    tfc:[
      { sVi:"Luôn phải kiểm tra nghiệm so với ĐKXĐ.", sEn:"You must always check solutions against the domain condition.", a:true, exVi:"ĐÚNG — Nghiệm vi phạm ĐKXĐ là nghiệm ngoại lai.", exEn:"TRUE — Solutions violating the domain condition are extraneous." }
    ],
    fill:[
      { id:"f1", tVi:"Phương trình x/(x-1) = 1/(x-1) có ĐKXĐ là x khác ___", tEn:"The equation x/(x-1) = 1/(x-1) has domain x different from ___", ans:"1", alt:["một"], hVi:"Mẫu số x-1 khác 0", hEn:"Denominator x-1 not zero" }
    ],
    glossary:[["Domain", "Điều kiện xác định"], ["Extraneous", "Ngoại lai"], ["Denominator", "Mẫu số"]]
  },
  {
    file: "Cacbaitoan8/L8_C2_L3.js", grade:8, chapter:2, lesson:3,
    slug:"L8-C2-L3", backPath:"Cacbaitoan8",
    titleVi:"Bài Toán Ứng Dụng Phương Trình", titleEn:"Applied Equation Problems",
    warmupVi:"Tàu A và Tàu B khởi hành từ hai bến, cách nhau 240km, đi ngược chiều. Tàu A vận tốc 60 km/h, Tàu B 80 km/h. Sau bao lâu gặp nhau? Đây là bài toán chuyển động kinh điển!",
    warmupEn:"Ships A and B leave from ports 240km apart, heading toward each other. Ship A: 60 km/h, Ship B: 80 km/h. When do they meet? This is a classic motion problem!",
    thinkVi:"Bước quan trọng nhất khi giải bài toán có lời văn bằng phương trình là gì?", thinkEn:"What is the most important step when solving a word problem using equations?",
    k1TitleVi:"1. Phương pháp giải toán có lời văn", k1TitleEn:"1. Word Problem Method",
    k1Vi:"B1: Đọc đề, tóm tắt. B2: Đặt ẩn, điều kiện. B3: Lập phương trình. B4: Giải. B5: Kiểm tra, kết luận.",
    k1En:"Step 1: Read & summarize. Step 2: Set variable & conditions. Step 3: Write equation. Step 4: Solve. Step 5: Check & conclude.",
    k2TitleVi:"2. Bài toán chuyển động", k2TitleEn:"2. Motion Problems",
    k2Vi:"v = s/t; s = v×t; t = s/v. Hai vật ngược chiều: s₁+s₂ = d. Cùng chiều đuổi nhau: s₁-s₂ = d.",
    k2En:"v = s/t; s = v×t; t = s/v. Opposite directions: s₁+s₂ = d. Same direction (chase): s₁-s₂ = d.",
    k3TitleVi:"3. Bài toán số học & công việc", k3TitleEn:"3. Arithmetic & Work Problems",
    k3Vi:"Hai số hơn kém nhau k đơn vị: lớn - bé = k. Công việc: năng suất × thời gian = khối lượng.",
    k3En:"Two numbers differ by k: large - small = k. Work: rate × time = amount of work.",
    mcq:[
      { qVi:"Tàu A (60km/h) và B (80km/h) ngược chiều, cách 280km. Gặp sau:", qEn:"Ship A (60km/h) and B (80km/h) opposite direction, 280km apart. Meet after:", opts:["2h","2.5h","3h","3.5h"], a:0, exVi:"(60+80)×t = 280 → t = 280/140 = 2h.", exEn:"(60+80)×t = 280 → t = 280/140 = 2h." }
    ],
    tfc:[
      { sVi:"Trong bài toán chuyển động, s = v × t.", sEn:"In motion problems, s = v × t.", a:true, exVi:"ĐÚNG — Quãng đường = vận tốc × thời gian.", exEn:"TRUE — Distance = speed × time." }
    ],
    fill:[
      { id:"f1", tVi:"Nếu hai số tự nhiên hơn kém nhau 5 và có tổng là 15, số bé là ___", tEn:"If two natural numbers differ by 5 and sum to 15, the smaller number is ___", ans:"5", alt:["năm"], hVi:"x + (x+5) = 15", hEn:"x + (x+5) = 15" }
    ],
    glossary:[["Motion", "Chuyển động"], ["Rate", "Năng suất"], ["Variable", "Ẩn số"]]
  },
  {
    file: "Cacbaitoan8/L8_C3_L1.js", grade:8, chapter:3, lesson:1,
    slug:"L8-C3-L1", backPath:"Cacbaitoan8",
    titleVi:"Bất Phương Trình Bậc Nhất Một Ẩn", titleEn:"One-Variable Linear Inequalities",
    warmupVi:"Giá vé tàu lửa tối thiểu 50,000đ. Bạn có x đồng. Điều kiện để đủ tiền mua vé: x ≥ 50,000. Đây là bất phương trình! Khác phương trình ở chỗ dấu = đổi thành <, >, ≤, ≥.",
    warmupEn:"Train ticket minimum price 50,000 VND. You have x VND. Condition to afford a ticket: x ≥ 50,000. This is an inequality! Unlike an equation, = becomes <, >, ≤, or ≥.",
    thinkVi:"Giải 2x + 3 > 7. Nghiệm là tất cả x thỏa mãn, biểu diễn trên trục số.", thinkEn:"Solve 2x + 3 > 7. The solution is all x that satisfy it, shown on a number line.",
    k1TitleVi:"1. Bất phương trình và nghiệm", k1TitleEn:"1. Inequalities & Solutions",
    k1Vi:"BPT bậc nhất: ax + b > 0 (a≠0). Tập nghiệm là một khoảng. Ký hiệu: x > c hoặc x ≤ c.",
    k1En:"Linear inequality: ax + b > 0 (a≠0). Solution set is an interval. Notation: x > c or x ≤ c.",
    k2TitleVi:"2. Quy tắc biến đổi BPT", k2TitleEn:"2. Inequality Transformation Rules",
    k2Vi:"Cộng/trừ cùng số → chiều bất đẳng thức không đổi. Nhân/chia số DƯƠNG → không đổi. Nhân/chia số ÂM → ĐỔI CHIỀU bất đẳng thức.",
    k2En:"Add/subtract same number → direction unchanged. Multiply/divide by POSITIVE → unchanged. Multiply/divide by NEGATIVE → REVERSE inequality direction.",
    k3TitleVi:"3. Biểu diễn tập nghiệm", k3TitleEn:"3. Graphing Solution Sets",
    k3Vi:"Biểu diễn tập nghiệm trên trục số bằng nửa đường thẳng. Dấu ≤, ≥: điểm đầu tô đặc. Dấu <, >: điểm đầu để trống.",
    k3En:"Represent solution set on number line as a half-line. ≤, ≥: filled circle. <, >: open circle.",
    mcq:[
      { qVi:"Giải: 2x - 4 > 6:", qEn:"Solve: 2x - 4 > 6:", opts:["x>1","x>5","x<5","x>-5"], a:1, exVi:"2x>10 → x>5.", exEn:"2x>10 → x>5." }
    ],
    tfc:[
      { sVi:"Nhân cả hai vế với -2 thì đổi chiều bất đẳng thức.", sEn:"Multiplying both sides by -2 reverses the inequality.", a:true, exVi:"ĐÚNG — Nhân/chia với số âm phải đổi chiều.", exEn:"TRUE — Multiplying/dividing by a negative number reverses the inequality." }
    ],
    fill:[
      { id:"f1", tVi:"Giải BPT: -2x < 6. Ta được x > ___", tEn:"Solve BPT: -2x < 6. We get x > ___", ans:"-3", alt:["âm ba"], hVi:"Chia cho -2 và đổi chiều", hEn:"Divide by -2 and reverse" }
    ],
    glossary:[["Inequality", "Bất phương trình"], ["Interval", "Khoảng"], ["Reverse", "Đổi chiều"]]
  },
  {
    file: "Cacbaitoan8/L8_C3_L2.js", grade:8, chapter:3, lesson:2,
    slug:"L8-C3-L2", backPath:"Cacbaitoan8",
    titleVi:"Giải & Biểu Diễn BPT", titleEn:"Solving & Graphing Inequalities",
    warmupVi:"Nhiệt độ phải trên 0°C để nước không đóng băng. Bạn biết T > 0 — đây là bất phương trình! Hãy vẽ tập nghiệm lên trục số.",
    warmupEn:"Temperature must be above 0°C to keep water from freezing. You know T > 0 — this is an inequality! Let's graph the solution on a number line.",
    thinkVi:"Bất phương trình 2x + 1 ≥ 3x - 5 có tập nghiệm là gì?", thinkEn:"What is the solution set of 2x + 1 ≥ 3x - 5?",
    k1TitleVi:"1. Phương pháp giải BPT", k1TitleEn:"1. Solving Inequality Steps",
    k1Vi:"B1: Chuyển vế. B2: Thu gọn. B3: Chia cho hệ số (chú ý đổi chiều khi chia âm). B4: Biểu diễn.",
    k1En:"Step 1: Transpose. Step 2: Simplify. Step 3: Divide by coefficient (note reversal if negative). Step 4: Graph.",
    k2TitleVi:"2. BPT liên hợp", k2TitleEn:"2. Compound Inequalities",
    k2Vi:"a < x < b biểu diễn đoạn mở. a ≤ x ≤ b biểu diễn đoạn đóng. Giải từng phần rồi giao nhau.",
    k2En:"a < x < b represents an open interval. a ≤ x ≤ b a closed interval. Solve each part then intersect.",
    k3TitleVi:"3. Ứng dụng thực tế", k3TitleEn:"3. Real-World Applications",
    k3Vi:"Chi phí ≤ ngân sách: tổng chi phí ≤ M. Khoảng cách an toàn: d ≥ d_min. Điểm đỗ: điểm ≥ ngưỡng.",
    k3En:"Cost ≤ budget: total cost ≤ M. Safe distance: d ≥ d_min. Passing grade: score ≥ threshold.",
    mcq:[
      { qVi:"Giải: 3x + 7 ≥ x + 15:", qEn:"Solve: 3x + 7 ≥ x + 15:", opts:["x≥4","x≤4","x≥-4","x≤8"], a:0, exVi:"2x≥8 → x≥4.", exEn:"2x≥8 → x≥4." }
    ],
    tfc:[
      { sVi:"BPT x² > 0 có tập nghiệm là x > 0.", sEn:"Inequality x² > 0 has solution x > 0.", a:false, exVi:"SAI — x² > 0 khi x ≠ 0, nên tập nghiệm là x ≠ 0.", exEn:"FALSE — x² > 0 for all x ≠ 0, so solution set is x ≠ 0." }
    ],
    fill:[
      { id:"f1", tVi:"Tập nghiệm của x + 2 > 5 là x > ___", tEn:"The solution set of x + 2 > 5 is x > ___", ans:"3", alt:["ba"], hVi:"x > 5 - 2", hEn:"x > 5 - 2" }
    ],
    glossary:[["Compound inequality", "BPT liên hợp"], ["Open interval", "Khoảng mở"], ["Closed interval", "Đoạn đóng"]]
  },
  {
    file: "Cacbaitoan8/L8_C4_L1.js", grade:8, chapter:4, lesson:1,
    slug:"L8-C4-L1", backPath:"Cacbaitoan8",
    titleVi:"Hình Lăng Trụ & Hình Hộp Chữ Nhật", titleEn:"Prisms & Rectangular Boxes",
    warmupVi:"Một thùng carton dạng hình hộp chữ nhật dài 40cm, rộng 30cm, cao 20cm. Cần bao nhiêu giấy bìa để làm thùng? Bao nhiêu thể tích chứa được? Đây là bài toán hình học không gian!",
    warmupEn:"A cardboard box is 40cm long, 30cm wide, 20cm tall. How much cardboard is needed? What volume can it hold? This is a 3D geometry problem!",
    thinkVi:"Hình lăng trụ và hình hộp chữ nhật khác nhau thế nào?", thinkEn:"How are prisms and rectangular boxes different?",
    k1TitleVi:"1. Hình hộp chữ nhật", k1TitleEn:"1. Rectangular Boxes (Cuboids)",
    k1Vi:"Diện tích xung quanh: Sxq = 2(a+b)×h. Diện tích toàn phần: Stp = Sxq + 2×a×b. Thể tích: V = a×b×h.",
    k1En:"Lateral area: Slat = 2(a+b)×h. Total surface area: Stot = Slat + 2×a×b. Volume: V = a×b×h.",
    k2TitleVi:"2. Hình lăng trụ đứng", k2TitleEn:"2. Right Prisms",
    k2Vi:"Sxq = chu vi đáy × chiều cao. V = diện tích đáy × chiều cao. Hai đáy song song, bằng nhau.",
    k2En:"Lateral area = perimeter of base × height. V = base area × height. Two parallel equal bases.",
    k3TitleVi:"3. Hình lập phương", k3TitleEn:"3. Cubes",
    k3Vi:"Hình lập phương: a=b=h=a. Stp = 6a². V = a³. Trường hợp đặc biệt của hình hộp chữ nhật.",
    k3En:"Cube: all sides equal a. Stot = 6a². V = a³. Special case of rectangular box.",
    mcq:[
      { qVi:"Hình hộp chữ nhật 5×4×3cm. Thể tích:", qEn:"Rectangular box 5×4×3cm. Volume:", opts:["30cm³","40cm³","60cm³","120cm³"], a:2, exVi:"V = 5×4×3 = 60 cm³.", exEn:"V = 5×4×3 = 60 cm³." }
    ],
    tfc:[
      { sVi:"Hình lập phương là trường hợp đặc biệt của hình hộp chữ nhật.", sEn:"A cube is a special case of a rectangular box.", a:true, exVi:"ĐÚNG — Hình hộp với a=b=c là hình lập phương.", exEn:"TRUE — A box with a=b=c is a cube." }
    ],
    fill:[
      { id:"f1", tVi:"Thể tích hình lập phương cạnh 2cm là ___ cm³", tEn:"Volume of a cube with side 2cm is ___ cm³", ans:"8", alt:["tám"], hVi:"2^3", hEn:"2^3" }
    ],
    glossary:[["Prism", "Lăng trụ"], ["Cube", "Lập phương"], ["Volume", "Thể tích"]]
  },
  {
    file: "Cacbaitoan8/L8_C4_L2.js", grade:8, chapter:4, lesson:2,
    slug:"L8-C4-L2", backPath:"Cacbaitoan8",
    titleVi:"Hình Chóp & Hình Nón", titleEn:"Pyramids & Cones",
    warmupVi:"Kim tự tháp Ai Cập là hình chóp tứ giác khổng lồ. Để biết cần bao nhiêu đá, người Ai Cập cổ đại phải tính thể tích hình chóp. Cùng khám phá công thức này!",
    warmupEn:"The Egyptian pyramids are massive square pyramids. To know how much stone was needed, ancient Egyptians had to calculate pyramid volume. Let's explore this formula!",
    thinkVi:"Hình nón giống hình chóp như thế nào? Khác ở điểm nào?", thinkEn:"How is a cone similar to a pyramid? How are they different?",
    k1TitleVi:"1. Hình chóp", k1TitleEn:"1. Pyramids",
    k1Vi:"Hình chóp có một đáy đa giác và các mặt bên là tam giác hội tụ tại đỉnh. V = (1/3)×Sđáy×h.",
    k1En:"A pyramid has a polygon base and triangular side faces meeting at an apex. V = (1/3)×base area×h.",
    k2TitleVi:"2. Diện tích xung quanh hình chóp", k2TitleEn:"2. Lateral Area of Pyramids",
    k2Vi:"Sxq = (1/2)×chu vi đáy×đường slant (l). Đường slant l = √(h² + r²) (hình chóp đều).",
    k2En:"Slat = (1/2)×base perimeter×slant height (l). Slant height l = √(h² + r²) (regular pyramid).",
    k3TitleVi:"3. Hình nón", k3TitleEn:"3. Cones",
    k3Vi:"Hình nón có đáy tròn bán kính r, chiều cao h, đường sinh l = √(r²+h²). Sxq = πrl. V = (1/3)πr²h.",
    k3En:"Cone has circular base radius r, height h, slant height l = √(r²+h²). Slat = πrl. V = (1/3)πr²h.",
    mcq:[
      { qVi:"Hình chóp đáy vuông cạnh 6cm, cao 4cm. V=?", qEn:"Square pyramid with base 6cm, height 4cm. V=?", opts:["48cm³","72cm³","96cm³","144cm³"], a:0, exVi:"V = (1/3)×6²×4 = (1/3)×144 = 48 cm³.", exEn:"V = (1/3)×6²×4 = (1/3)×144 = 48 cm³." }
    ],
    tfc:[
      { sVi:"V_nón = (1/3)πr²h.", sEn:"V_cone = (1/3)πr²h.", a:true, exVi:"ĐÚNG — Công thức thể tích hình nón.", exEn:"TRUE — The volume formula for a cone." }
    ],
    fill:[
      { id:"f1", tVi:"Nếu hình chóp có diện tích đáy là 30 và chiều cao là 5, thể tích là ___", tEn:"If a pyramid has base area 30 and height 5, its volume is ___", ans:"50", alt:["năm mươi"], hVi:"1/3 * 30 * 5", hEn:"1/3 * 30 * 5" }
    ],
    glossary:[["Pyramid", "Hình chóp"], ["Cone", "Hình nón"], ["Slant height", "Đường sinh"]]
  },

  // ── GRADE 9 ─────────────────────────────────────────────────────────────────
  {
    file: "Cacbaitoan9/L9_C1_L1.js", grade:9, chapter:1, lesson:1,
    slug:"L9-C1-L1", backPath:"Cacbaitoan9",
    titleVi:"Căn Bậc Hai & Tính Chất", titleEn:"Square Roots & Properties",
    warmupVi:"Phép toán ngược của bình phương là căn bậc hai. Căn bậc hai giúp ta tìm cạnh của một hình vuông khi biết diện tích của nó.",
    warmupEn:"The inverse operation of squaring is the square root. Square roots help us find the side of a square when its area is known.",
    thinkVi:"√a xác định khi nào?", thinkEn:"Under what conditions is √a defined?",
    k1TitleVi:"1. Khái niệm căn bậc hai", k1TitleEn:"1. Concept of Square Roots",
    k1Vi:"Căn bậc hai của số thực a không âm là số x sao cho x² = a. Số dương a có đúng hai căn bậc hai là √a và -√a.",
    k1En:"A square root of a non-negative real number a is a number x such that x² = a. A positive number a has two square roots: √a and -√a.",
    k2TitleVi:"2. Căn bậc hai số học", k2TitleEn:"2. Arithmetic Square Root",
    k2Vi:"Kí hiệu √a biểu diễn căn bậc hai số học (không âm) của a. √a = x ⟺ (x ≥ 0 và x² = a).",
    k2En:"The symbol √a denotes the non-negative arithmetic square root of a. √a = x ⟺ (x ≥ 0 and x² = a).",
    k3TitleVi:"3. Điều kiện xác định", k3TitleEn:"3. Domain Condition",
    k3Vi:"Căn thức √A xác định (hay có nghĩa) khi A lấy giá trị không âm: A ≥ 0.",
    k3En:"The radical expression √A is defined (has meaning) when A is non-negative: A ≥ 0.",
    mcq:[
      { qVi:"Căn bậc hai số học của 9 là:", qEn:"The arithmetic square root of 9 is:", opts:["3","-3","±3","81"], a:0, exVi:"Căn bậc hai số học luôn không âm, √9 = 3.", exEn:"The arithmetic square root is always non-negative, √9 = 3." }
    ],
    tfc:[
      { sVi:"Mọi số thực đều có căn bậc hai số học.", sEn:"Every real number has an arithmetic square root.", a:false, exVi:"SAI — Số âm không có căn bậc hai số học trong tập số thực.", exEn:"FALSE — Negative numbers have no real square roots." }
    ],
    fill:[
      { id:"f1", tVi:"Căn thức √(x - 3) xác định khi x ≥ ___", tEn:"The radical √(x - 3) is defined when x ≥ ___", ans:"3", alt:["ba"], hVi:"x - 3 >= 0", hEn:"x - 3 >= 0" }
    ],
    glossary:[["Square root", "Căn bậc hai"], ["Arithmetic", "Số học"], ["Radical", "Căn thức"]]
  },
  {
    file: "Cacbaitoan9/L9_C1_L2.js", grade:9, chapter:1, lesson:2,
    slug:"L9-C1-L2", backPath:"Cacbaitoan9",
    titleVi:"Rút Gọn Biểu Thức Căn", titleEn:"Simplifying Radical Expressions",
    warmupVi:"Để rút gọn các biểu thức chứa căn phức tạp, ta cần áp dụng các phép biến đổi như đưa thừa số ra ngoài/vào trong dấu căn, trục căn thức ở mẫu.",
    warmupEn:"To simplify complex radical expressions, we need to apply transformations like extracting/inserting factors, rationalizing denominators.",
    thinkVi:"√(A²) bằng gì?", thinkEn:"What is √(A²) equal to?",
    k1TitleVi:"1. Hằng đẳng thức √(A²) = |A|", k1TitleEn:"1. Identity √(A²) = |A|",
    k1Vi:"Với mọi đa thức A, √(A²) = |A|. Nếu A ≥ 0 thì |A| = A. Nếu A < 0 thì |A| = -A.",
    k1En:"For any expression A, √(A²) = |A|. If A ≥ 0, |A| = A. If A < 0, |A| = -A.",
    k2TitleVi:"2. Đưa thừa số ra ngoài/vào trong căn", k2TitleEn:"2. Extracting/Inserting Factors",
    k2Vi:"√(A²B) = |A|√B (với B ≥ 0). A√B = √(A²B) (với A ≥ 0, B ≥ 0).",
    k2En:"√(A²B) = |A|√B (with B ≥ 0). A√B = √(A²B) (with A ≥ 0, B ≥ 0).",
    k3TitleVi:"3. Trục căn thức ở mẫu", k3TitleEn:"3. Rationalizing Denominators",
    k3Vi:"Nhân cả tử và mẫu với biểu thức liên hợp để làm mất căn thức ở mẫu số.",
    k3En:"Multiply numerator and denominator by conjugate expression to eliminate radicals in denominator.",
    mcq:[
      { qVi:"Rút gọn biểu thức √18 + √8:", qEn:"Simplify √18 + √8:", opts:["√26","5","5√2","2√5"], a:2, exVi:"√18 = 3√2, √8 = 2√2. Tổng: 5√2.", exEn:"√18 = 3√2, √8 = 2√2. Total: 5√2." }
    ],
    tfc:[
      { sVi:"√(x²) = x với mọi x.", sEn:"√(x²) = x for all x.", a:false, exVi:"SAI — √(x²) = |x|. Nếu x âm thì √(x²) = -x.", exEn:"FALSE — √(x²) = |x|. If x is negative, √(x²) = -x." }
    ],
    fill:[
      { id:"f1", tVi:"Trục căn thức: 1/(√2) = (√2) / ___", tEn:"Rationalize: 1/(√2) = (√2) / ___", ans:"2", alt:["hai"], hVi:"Nhân cả tử và mẫu với √2", hEn:"Multiply numerator and denominator by √2" }
    ],
    glossary:[["Simplify", "Rút gọn"], ["Conjugate", "Biểu thức liên hợp"], ["Rationalize", "Trục căn thức"]]
  },
  {
    file: "Cacbaitoan9/L9_C1_L3.js", grade:9, chapter:1, lesson:3,
    slug:"L9-C1-L3", backPath:"Cacbaitoan9",
    titleVi:"Căn Bậc Ba", titleEn:"Cube Roots",
    warmupVi:"Căn bậc ba là phép toán ngược của lũy thừa bậc ba. Hãy cùng tìm hiểu định nghĩa và tính chất của nó!",
    warmupEn:"The cube root is the inverse operation of cubing. Let's study its definition and properties!",
    thinkVi:"Số âm có căn bậc ba không?", thinkEn:"Do negative numbers have cube roots?",
    k1TitleVi:"1. Định nghĩa căn bậc ba", k1TitleEn:"1. Definition of Cube Roots",
    k1Vi:"Căn bậc ba của số a là số x sao cho x³ = a. Kí hiệu là ³√a.",
    k1En:"The cube root of a number a is a number x such that x³ = a. Denoted by ³√a.",
    k2TitleVi:"2. Tính chất căn bậc ba", k2TitleEn:"2. Properties",
    k2Vi:"³√a < ³√b ⟺ a < b. ³√(ab) = ³√a × ³√b. ³√(a/b) = ³√a / ³√b (b≠0).",
    k2En:"³√a < ³√b ⟺ a < b. ³√(ab) = ³√a × ³√b. ³√(a/b) = ³√a / ³√b (b≠0).",
    k3TitleVi:"3. Nhận xét quan trọng", k3TitleEn:"3. Key Remarks",
    k3Vi:"Mọi số thực đều có duy nhất một căn bậc ba. Không cần điều kiện không âm.",
    k3En:"Every real number has exactly one unique cube root. No non-negativity constraint.",
    mcq:[
      { qVi:"Căn bậc ba của -27 là:", qEn:"The cube root of -27 is:", opts:["3","-3","±3","Vô nghiệm"], a:1, exVi:"(-3)³ = -27.", exEn:"(-3)³ = -27." }
    ],
    tfc:[
      { sVi:"Số âm không có căn bậc ba.", sEn:"Negative numbers do not have cube roots.", a:false, exVi:"SAI — Mọi số thực đều có căn bậc ba.", exEn:"FALSE — Every real number has a cube root." }
    ],
    fill:[
      { id:"f1", tVi:"Căn bậc ba của 8 là ___", tEn:"The cube root of 8 is ___", ans:"2", alt:["hai"], hVi:"2^3 = 8", hEn:"2^3 = 8" }
    ],
    glossary:[["Cube root", "Căn bậc ba"], ["Cube", "Lũy thừa bậc ba"], ["Unique", "Duy nhất"]]
  },
  {
    file: "Cacbaitoan9/L9_C2_L1.js", grade:9, chapter:2, lesson:1,
    slug:"L9-C2-L1", backPath:"Cacbaitoan9",
    titleVi:"Hàm Số Bậc Nhất", titleEn:"Linear Functions",
    warmupVi:"Hàm số bậc nhất mô tả mối quan hệ tỉ lệ tuyến tính trong thực tế, ví dụ như tiền taxi theo số km. Đồ thị của nó là một đường thẳng.",
    warmupEn:"Linear functions describe linear relationships in real life, such as taxi fare based on kilometers. Its graph is a straight line.",
    thinkVi:"Khi nào hàm số bậc nhất đồng biến?", thinkEn:"When is a linear function increasing?",
    k1TitleVi:"1. Định nghĩa", k1TitleEn:"1. Definition",
    k1Vi:"Hàm số bậc nhất có dạng y = ax + b, trong đó a và b là các số cho trước, a ≠ 0.",
    k1En:"A linear function is of the form y = ax + b, where a and b are given constants, a ≠ 0.",
    k2TitleVi:"2. Tính biến thiên", k2TitleEn:"2. Monotonicity",
    k2Vi:"Hàm số y = ax + b đồng biến trên R khi a > 0, nghịch biến trên R khi a < 0.",
    k2En:"The function y = ax + b is increasing on R if a > 0, and decreasing on R if a < 0.",
    k3TitleVi:"3. Hệ số góc", k3TitleEn:"3. Slope",
    k3Vi:"Hệ số a được gọi là hệ số góc của đường thẳng y = ax + b. Hệ số b là tung độ gốc.",
    k3En:"a is the slope of the line y = ax + b. b is the y-intercept.",
    mcq:[
      { qVi:"Hàm số nào sau đây đồng biến?", qEn:"Which of the following functions is increasing?", opts:["y = -2x + 1","y = 3x - 5","y = -x","y = 2 - 4x"], a:1, exVi:"Hệ số góc a = 3 > 0 nên hàm đồng biến.", exEn:"Slope a = 3 > 0, so the function is increasing." }
    ],
    tfc:[
      { sVi:"Đồ thị hàm số y = ax + b đi qua gốc tọa độ khi b = 0.", sEn:"The graph of y = ax + b passes through the origin when b = 0.", a:true, exVi:"ĐÚNG — y = ax đi qua (0,0).", exEn:"TRUE — y = ax passes through (0,0)." }
    ],
    fill:[
      { id:"f1", tVi:"Hệ số góc của đường thẳng y = -5x + 3 là ___", tEn:"The slope of the line y = -5x + 3 is ___", ans:"-5", alt:["âm năm"], hVi:"Hệ số đứng trước x", hEn:"The coefficient of x" }
    ],
    glossary:[["Linear function", "Hàm số bậc nhất"], ["Slope", "Hệ số góc"], ["y-intercept", "Tung độ gốc"]]
  },
  {
    file: "Cacbaitoan9/L9_C2_L2.js", grade:9, chapter:2, lesson:2,
    slug:"L9-C2-L2", backPath:"Cacbaitoan9",
    titleVi:"Hàm Số Bậc Hai y = ax²", titleEn:"Quadratic Function y = ax²",
    warmupVi:"Quả bóng ném lên không trung theo đường Parabol. Độ cao h(t) = -5t² + 20t. Đây là hàm số bậc hai! Đồ thị của nó là đường cong hình chữ U.",
    warmupEn:"A ball thrown upward follows a parabolic path. Height h(t) = -5t² + 20t. This is a quadratic function! Its graph is a U-shaped curve.",
    thinkVi:"y = 2x² và y = -2x²: đồ thị khác nhau như thế nào? Khi nào parabol mở lên trên?", thinkEn:"y = 2x² vs y = -2x². How do their graphs differ? When does the parabola open upward?",
    k1TitleVi:"1. Hàm số y = ax²", k1TitleEn:"1. Quadratic Function y = ax²",
    k1Vi:"a > 0: parabol mở lên, đỉnh (0,0) là điểm nhỏ nhất. a < 0: mở xuống, đỉnh là điểm lớn nhất. |a| lớn → parabol hẹp hơn.",
    k1En:"a > 0: parabola opens up, vertex (0,0) is minimum. a < 0: opens down, vertex is maximum. Larger |a| → narrower parabola.",
    k2TitleVi:"2. Tính chất hàm số bậc hai", k2TitleEn:"2. Properties of Quadratic Functions",
    k2Vi:"Đối xứng qua trục y. Với a>0: đồng biến x>0, nghịch biến x<0. Với a<0: ngược lại. y ≥ 0 khi a>0.",
    k2En:"Symmetric about y-axis. For a>0: increasing on x>0, decreasing on x<0. For a<0: opposite. y ≥ 0 when a>0.",
    k3TitleVi:"3. Bảng giá trị và vẽ đồ thị", k3TitleEn:"3. Value Table & Graphing",
    k3Vi:"Lập bảng x=-2,-1,0,1,2 → tính y. Vẽ các điểm → nối mượt bằng đường cong.",
    k3En:"Make table for x=-2,-1,0,1,2 → calculate y. Plot points → connect smoothly with a curve.",
    mcq:[
      { qVi:"Đồ thị y = -3x² mở về phía:", qEn:"The graph of y = -3x² opens:", opts:["Phía trên","Phía dưới","Phải","Trái"], a:1, exVi:"a = -3 < 0 → parabol mở xuống.", exEn:"a = -3 < 0 → parabola opens downward." }
    ],
    tfc:[
      { sVi:"Đỉnh của đồ thị y = ax² luôn là điểm gốc tọa độ O(0,0).", sEn:"The vertex of y = ax² is always the origin O(0,0).", a:true, exVi:"ĐÚNG — Vì đây là hàm bậc hai dạng đơn giản y = ax².", exEn:"TRUE — Since this is the simple quadratic form y = ax²." }
    ],
    fill:[
      { id:"f1", tVi:"Giá trị của y = 2x^2 tại x = 3 là ___", tEn:"The value of y = 2x^2 at x = 3 is ___", ans:"18", alt:["mười tám"], hVi:"2 * 3^2", hEn:"2 * 3^2" }
    ],
    glossary:[["Quadratic", "Bậc hai"], ["Parabola", "Parabol"], ["Vertex", "Đỉnh"]]
  },
  {
    file: "Cacbaitoan9/L9_C2_L3.js", grade:9, chapter:2, lesson:3,
    slug:"L9-C2-L3", backPath:"Cacbaitoan9",
    titleVi:"Vẽ & Đọc Đồ Thị Hàm Số", titleEn:"Graphing & Reading Functions",
    warmupVi:"Nhiệt độ thay đổi theo giờ trong một ngày có thể biểu diễn bằng đồ thị. Đọc được đồ thị giúp bạn biết nhiều thông tin nhanh hơn đọc bảng số liệu!",
    warmupEn:"Temperature changes throughout the day can be shown as a graph. Reading graphs gives you information faster than reading a table!",
    thinkVi:"Nhìn vào đồ thị, làm sao biết hàm số đồng biến hay nghịch biến tại một khoảng?", thinkEn:"From a graph, how can you tell if a function is increasing or decreasing on an interval?",
    k1TitleVi:"1. Đọc thông tin từ đồ thị", k1TitleEn:"1. Reading Graph Information",
    k1Vi:"Điểm (a, b) trên đồ thị → f(a) = b. Hàm đồng biến: đồ thị đi lên từ trái sang phải. Nghịch biến: đi xuống.",
    k1En:"Point (a, b) on graph → f(a) = b. Increasing: graph goes up left to right. Decreasing: goes down.",
    k2TitleVi:"2. Giao điểm với trục", k2TitleEn:"2. Intercepts",
    k2Vi:"Giao với trục Ox (y=0): nghiệm của hàm. Giao với trục Oy (x=0): giá trị f(0). Tọa độ giao điểm.",
    k2En:"Intersection with Ox (y=0): zeros of the function. Intersection with Oy (x=0): value f(0). Coordinates of intercepts.",
    k3TitleVi:"3. Vẽ đồ thị", k3TitleEn:"3. Drawing Graphs",
    k3Vi:"B1: Lập bảng giá trị. B2: Vẽ hệ trục tọa độ. B3: Đánh dấu các điểm. B4: Nối mượt (cong hoặc thẳng).",
    k3En:"Step 1: Make value table. Step 2: Draw coordinate axes. Step 3: Plot points. Step 4: Connect smoothly (curve or line).",
    mcq:[
      { qVi:"Điểm (3, -2) nằm trên đồ thị → f(3) = ?", qEn:"Point (3, -2) is on the graph → f(3) = ?", opts:["3","-3","2","-2"], a:3, exVi:"Điểm (a, b) trên đồ thị có nghĩa f(a) = b, nên f(3) = -2.", exEn:"Point (a, b) on graph means f(a) = b, so f(3) = -2." }
    ],
    tfc:[
      { sVi:"Mỗi điểm trên đồ thị y=f(x) có tọa độ (x, f(x)).", sEn:"Every point on the graph y=f(x) has coordinates (x, f(x)).", a:true, exVi:"ĐÚNG — Định nghĩa đồ thị hàm số.", exEn:"TRUE — Definition of the graph of a function." }
    ],
    fill:[
      { id:"f1", tVi:"Giao điểm của y = 2x - 4 với trục tung Oy có tung độ bằng ___", tEn:"The y-intercept of y = 2x - 4 has y-coordinate of ___", ans:"-4", alt:["âm bốn"], hVi:"Cho x = 0", hEn:"Set x = 0" }
    ],
    glossary:[["Intercept", "Giao điểm"], ["Coordinate", "Tọa độ"], ["Curve", "Đường cong"]]
  },
  {
    file: "Cacbaitoan9/L9_C3_L1.js", grade:9, chapter:3, lesson:1,
    slug:"L9-C3-L1", backPath:"Cacbaitoan9",
    titleVi:"Hệ Phương Trình Bậc Nhất Hai Ẩn", titleEn:"Two-Variable Linear Systems",
    warmupVi:"Mua 3 bút và 2 vở hết 28,000đ. Mua 1 bút và 4 vở hết 24,000đ. Hỏi giá mỗi loại? Đây cần hệ phương trình hai ẩn!",
    warmupEn:"3 pens + 2 notebooks cost 28,000 VND. 1 pen + 4 notebooks cost 24,000 VND. Find the price of each. This requires a two-variable system!",
    thinkVi:"Hệ phương trình bậc nhất hai ẩn có bao nhiêu nghiệm? Khi nào vô nghiệm?", thinkEn:"How many solutions can a two-variable linear system have? When is it inconsistent?",
    k1TitleVi:"1. Hệ phương trình bậc nhất hai ẩn", k1TitleEn:"1. Two-Variable Linear System",
    k1Vi:"Hệ: {ax+by=c; dx+ey=f}. Nghiệm là cặp (x₀, y₀) thỏa cả hai phương trình đồng thời.",
    k1En:"System: {ax+by=c; dx+ey=f}. Solution is pair (x₀, y₀) satisfying both equations simultaneously.",
    k2TitleVi:"2. Phương pháp thế", k2TitleEn:"2. Substitution Method",
    k2Vi:"B1: Biểu diễn một ẩn theo ẩn kia từ PT1. B2: Thế vào PT2. B3: Giải PT một ẩn. B4: Tính ẩn còn lại.",
    k2En:"Step 1: Express one variable from Eq 1. Step 2: Substitute into Eq 2. Step 3: Solve one-variable eq. Step 4: Find remaining variable.",
    k3TitleVi:"3. Phương pháp cộng đại số", k3TitleEn:"3. Elimination Method",
    k3Vi:"Nhân các phương trình với hệ số phù hợp để triệt tiêu một ẩn. Cộng hai phương trình lại.",
    k3En:"Multiply equations by suitable coefficients to eliminate one variable. Add the equations.",
    mcq:[
      { qVi:"Giải hệ: x+y=5; x-y=1:", qEn:"Solve: x+y=5; x-y=1:", opts:["(2,3)","(3,2)","(4,1)","(1,4)"], a:1, exVi:"Cộng hai vế: 2x = 6 → x = 3. Thay vào: y = 2.", exEn:"Add: 2x = 6 → x = 3. Substitute: y = 2." }
    ],
    tfc:[
      { sVi:"Hai phương trình song song (cùng hệ số góc) → hệ vô nghiệm.", sEn:"Two parallel equations (same slope) → inconsistent system.", a:true, exVi:"ĐÚNG — Hai đường song song không giao nhau.", exEn:"TRUE — Parallel lines do not intersect." }
    ],
    fill:[
      { id:"f1", tVi:"Giải hệ: x + y = 3; x - y = 1. Nghiệm x = ___", tEn:"Solve: x + y = 3; x - y = 1. Solution x = ___", ans:"2", alt:["hai"], hVi:"Cộng hai vế ta được 2x = 4", hEn:"Add equations to get 2x = 4" }
    ],
    glossary:[["System of equations", "Hệ phương trình"], ["Substitution", "Thế"], ["Elimination", "Cộng đại số"]]
  },
  {
    file: "Cacbaitoan9/L9_C3_L2.js", grade:9, chapter:3, lesson:2,
    slug:"L9-C3-L2", backPath:"Cacbaitoan9",
    titleVi:"Phương Trình Bậc Hai Một Ẩn", titleEn:"One-Variable Quadratic Equations",
    warmupVi:"Diện tích hình chữ nhật là 12m², chiều dài hơn chiều rộng 1m. Gọi chiều rộng là x: x(x+1)=12 → x²+x-12=0. Đây là phương trình bậc hai!",
    warmupEn:"Rectangle area is 12m², length exceeds width by 1m. Let width = x: x(x+1)=12 → x²+x-12=0. This is a quadratic equation!",
    thinkVi:"Phương trình bậc hai ax²+bx+c=0 có thể có 0, 1 hoặc 2 nghiệm. Điều gì quyết định số nghiệm?", thinkEn:"Quadratic ax²+bx+c=0 can have 0, 1, or 2 roots. What determines the number of roots?",
    k1TitleVi:"1. Phương trình bậc hai", k1TitleEn:"1. Quadratic Equations",
    k1Vi:"ax²+bx+c=0 (a≠0). Biệt thức Δ = b²-4ac. Δ>0: 2 nghiệm; Δ=0: 1 nghiệm kép; Δ<0: vô nghiệm thực.",
    k1En:"ax²+bx+c=0 (a≠0). Discriminant Δ = b²-4ac. Δ>0: 2 roots; Δ=0: 1 repeated root; Δ<0: no real roots.",
    k2TitleVi:"2. Công thức nghiệm", k2TitleEn:"2. Quadratic Formula",
    k2Vi:"x = (-b ± √Δ) / 2a = (-b ± √(b²-4ac)) / 2a.",
    k2En:"x = (-b ± √Δ) / 2a = (-b ± √(b²-4ac)) / 2a.",
    k3TitleVi:"3. Hệ thức Viète", k3TitleEn:"3. Vieta's Formulas",
    k3Vi:"Nếu x₁, x₂ là nghiệm: x₁+x₂ = -b/a; x₁×x₂ = c/a.",
    k3En:"If x₁, x₂ are roots: x₁+x₂ = -b/a; x₁×x₂ = c/a.",
    mcq:[
      { qVi:"Giải x² - 5x + 6 = 0:", qEn:"Solve x² - 5x + 6 = 0:", opts:["x=2;x=3","x=1;x=6","x=-2;x=-3","x=2;x=-3"], a:0, exVi:"Δ=25-24=1. x=(5±1)/2 → x=3 hoặc x=2.", exEn:"Δ=25-24=1. x=(5±1)/2 → x=3 or x=2." }
    ],
    tfc:[
      { sVi:"Biệt thức Δ = b² - 4ac.", sEn:"The discriminant Δ = b² - 4ac.", a:true, exVi:"ĐÚNG — Đây là công thức biệt thức của PT bậc hai.", exEn:"TRUE — This is the discriminant formula for quadratic equations." }
    ],
    fill:[
      { id:"f1", tVi:"Nếu x^2 - 4x + 4 = 0, thì nghiệm kép x = ___", tEn:"If x^2 - 4x + 4 = 0, then the repeated root x = ___", ans:"2", alt:["hai"], hVi:"(x - 2)^2 = 0", hEn:"(x - 2)^2 = 0" }
    ],
    glossary:[["Discriminant", "Biệt thức"], ["Repeated root", "Nghiệm kép"], ["Vieta's formulas", "Hệ thức Viète"]]
  },
  {
    file: "Cacbaitoan9/L9_C4_L1.js", grade:9, chapter:4, lesson:1,
    slug:"L9-C4-L1", backPath:"Cacbaitoan9",
    titleVi:"Đường Tròn & Tính Chất Cơ Bản", titleEn:"Circles & Basic Properties",
    warmupVi:"Bánh xe đạp là hình tròn. Mọi điểm trên vành đều cách trục bánh một khoảng bằng nhau — đó là bán kính. Tại sao bánh xe tròn lại lăn trơn mà bánh vuông thì không?",
    warmupEn:"A bicycle wheel is a circle. Every point on the rim is equally distant from the axle — that's the radius. Why does a round wheel roll smoothly but a square wheel doesn't?",
    thinkVi:"Đường kính có quan hệ gì với bán kính? Dây cung và cung tròn khác nhau thế nào?", thinkEn:"How is diameter related to radius? How are an arc and a chord different?",
    k1TitleVi:"1. Định nghĩa đường tròn", k1TitleEn:"1. Circle Definition",
    k1Vi:"Đường tròn (O;R): tập hợp điểm cách O một khoảng = R. Điểm trong: d<R. Điểm ngoài: d>R. Đường kính D = 2R.",
    k1En:"Circle (O;R): set of points at distance R from O. Inside: d<R. Outside: d>R. Diameter D = 2R.",
    k2TitleVi:"2. Dây cung và đường kính", k2TitleEn:"2. Chords and Diameters",
    k2Vi:"Dây cung AB: đoạn thẳng nối 2 điểm trên đường tròn. Đường kính là dây cung lớn nhất (qua tâm).",
    k2En:"Chord AB: line segment connecting 2 points on the circle. Diameter is the longest chord (through center).",
    k3TitleVi:"3. Tiếp tuyến đường tròn", k3TitleEn:"3. Tangent Lines",
    k3Vi:"Tiếp tuyến: đường thẳng chỉ tiếp xúc đường tròn tại 1 điểm. Tiếp tuyến ⊥ bán kính tại điểm tiếp xúc.",
    k3En:"Tangent: line touching circle at exactly 1 point. Tangent ⊥ radius at point of tangency.",
    mcq:[
      { qVi:"Đường tròn (O;5cm). Khoảng cách từ O đến điểm M = 3cm. M là:", qEn:"Circle (O;5cm). Distance from O to M = 3cm. M is:", opts:["Nằm ngoài","Nằm trên","Nằm trong","Là tâm"], a:2, exVi:"3 < 5 = R → M nằm bên trong đường tròn.", exEn:"3 < 5 = R → M is inside the circle." }
    ],
    tfc:[
      { sVi:"Đường kính là bán kính nhân 2.", sEn:"Diameter equals radius times 2.", a:true, exVi:"ĐÚNG — D = 2R.", exEn:"TRUE — D = 2R." }
    ],
    fill:[
      { id:"f1", tVi:"Đường tròn bán kính R=5cm có đường kính bằng ___ cm", tEn:"A circle with radius R=5cm has diameter of ___ cm", ans:"10", alt:["mười"], hVi:"2 * R", hEn:"2 * R" }
    ],
    glossary:[["Circle", "Đường tròn"], ["Radius", "Bán kính"], ["Tangent", "Tiếp tuyến"]]
  },
  {
    file: "Cacbaitoan9/L9_C4_L2.js", grade:9, chapter:4, lesson:2,
    slug:"L9-C4-L2", backPath:"Cacbaitoan9",
    titleVi:"Góc Nội Tiếp & Tứ Giác Nội Tiếp", titleEn:"Inscribed Angles & Cyclic Quadrilaterals",
    warmupVi:"Nhìn từ hai điểm khác nhau trên cùng một bờ hồ về một cây cầu, bạn thấy góc cùng bằng nhau — đây là tính chất góc nội tiếp! Tất cả góc nội tiếp chắn cùng cung đều bằng nhau.",
    warmupEn:"Viewing a bridge from two different points on the same shore, you see equal angles — this is the inscribed angle theorem! All inscribed angles subtending the same arc are equal.",
    thinkVi:"Góc nội tiếp và góc tâm cùng chắn một cung có quan hệ gì?", thinkEn:"What is the relationship between an inscribed angle and a central angle subtending the same arc?",
    k1TitleVi:"1. Góc nội tiếp", k1TitleEn:"1. Inscribed Angles",
    k1Vi:"Góc nội tiếp: góc có đỉnh trên đường tròn, hai cạnh là dây cung. Góc nội tiếp = (1/2) × góc tâm cùng chắn cung.",
    k1En:"Inscribed angle: vertex on circle, sides are chords. Inscribed angle = (1/2) × central angle subtending same arc.",
    k2TitleVi:"2. Hệ quả góc nội tiếp", k2TitleEn:"2. Inscribed Angle Corollaries",
    k2Vi:"Các góc nội tiếp cùng chắn một cung thì bằng nhau. Góc nội tiếp chắn nửa đường tròn = 90° (góc Thales).",
    k2En:"Inscribed angles subtending the same arc are equal. Inscribed angle in a semicircle = 90° (Thales' theorem).",
    k3TitleVi:"3. Tứ giác nội tiếp", k3TitleEn:"3. Cyclic Quadrilaterals",
    k3Vi:"Tứ giác ABCD nội tiếp đường tròn nếu 4 đỉnh cùng nằm trên đường tròn. Hai góc đối bù nhau: A+C = B+D = 180°.",
    k3En:"Quadrilateral ABCD is cyclic if all 4 vertices lie on the circle. Opposite angles are supplementary: A+C = B+D = 180°.",
    mcq:[
      { qVi:"Góc tâm AOB = 80°. Góc nội tiếp AMB (M trên cung lớn):", qEn:"Central angle AOB = 80°. Inscribed angle AMB (M on major arc):", opts:["80°","40°","160°","20°"], a:1, exVi:"Góc nội tiếp = (1/2)×góc tâm = 80°/2 = 40°.", exEn:"Inscribed angle = (1/2)×central angle = 80°/2 = 40°." }
    ],
    tfc:[
      { sVi:"Tứ giác nội tiếp có tổng hai góc đối = 180°.", sEn:"A cyclic quadrilateral has opposite angles summing to 180°.", a:true, exVi:"ĐÚNG — Tính chất đặc trưng của tứ giác nội tiếp.", exEn:"TRUE — Characteristic property of cyclic quadrilaterals." }
    ],
    fill:[
      { id:"f1", tVi:"Góc nội tiếp chắn nửa đường tròn bằng ___ độ", tEn:"An inscribed angle subtending a semicircle is ___ degrees", ans:"90", alt:["chín mươi"], hVi:"Góc vuông", hEn:"Right angle" }
    ],
    glossary:[["Inscribed angle", "Góc nội tiếp"], ["Cyclic quadrilateral", "Tứ giác nội tiếp"], ["Semicircle", "Nửa đường tròn"]]
  }
];

// ══════════════════════════════════════════════════════════════════════════════
// GENERATE FILES
// ══════════════════════════════════════════════════════════════════════════════
let created = 0;
for (const lesson of LESSONS) {
  const dir = path.join(BASE, lesson.file.split("/")[0]);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  const filePath = path.join(BASE, lesson.file);
  const code = makeLessonFile(lesson);
  fs.writeFileSync(filePath, code, "utf8");
  console.log(`✅ GENERATED ${lesson.file}`);
  created++;
}
console.log(`\nDone. Generated ${created} files.`);
