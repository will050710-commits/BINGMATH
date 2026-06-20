/* eslint-disable @next/next/no-img-element */
"use client";
import Link from "next/link";
import { motion } from "framer-motion";
import MathGraphSVG from "./MathGraphSVG";

// ─── LESSON SVG ICONS ─────────────────────────────────────────────────────────
// Each returns a small 28x28 SVG icon specific to the math topic.
function IconProposition({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <rect x="3" y="6" width="22" height="3" rx="1.5" fill={color} opacity="0.9"/>
      <rect x="3" y="13" width="16" height="3" rx="1.5" fill={color} opacity="0.6"/>
      <rect x="3" y="20" width="19" height="3" rx="1.5" fill={color} opacity="0.4"/>
      <path d="M21 21 L25 14 L21 7" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}
function IconSets({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <circle cx="10" cy="14" r="7" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
      <circle cx="18" cy="14" r="7" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
      <path d="M14 8 Q16 11 16 14 Q16 17 14 20 Q12 17 12 14 Q12 11 14 8Z" fill={color} fillOpacity="0.35"/>
    </svg>
  );
}
function IconSetOps({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <circle cx="9" cy="12" r="6" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.08"/>
      <circle cx="17" cy="12" r="6" stroke={color} strokeWidth="1.4" fill={color} fillOpacity="0.08"/>
      <path d="M13 7 Q18 9.5 18 12 Q18 14.5 13 17 Q8 14.5 8 12 Q8 9.5 13 7Z" fill={color} fillOpacity="0.4"/>
      <line x1="6" y1="23" x2="22" y2="23" stroke={color} strokeWidth="1" opacity="0.4"/>
      <text x="14" y="26" textAnchor="middle" fill={color} fontSize="4" fontWeight="bold">∩ ∪ ∖</text>
    </svg>
  );
}
function IconReview({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <circle cx="14" cy="14" r="10" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.08"/>
      <path d="M14 8 L14 14 L18 17" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="1.5" fill={color}/>
    </svg>
  );
}
function IconInequality({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="4" y1="14" x2="24" y2="14" stroke={color} strokeWidth="1.2" opacity="0.4"/>
      <line x1="4" y1="24" x2="24" y2="4" stroke={color} strokeWidth="1.5" strokeDasharray="2 2"/>
      <polygon points="4,24 4,14 14,14" fill={color} fillOpacity="0.22"/>
      <text x="20" y="10" fill={color} fontSize="7" fontWeight="bold">≤</text>
    </svg>
  );
}
function IconSystem({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M4 8 L24 20" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <path d="M4 20 L24 8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.6"/>
      <circle cx="14" cy="14" r="2.5" fill={color}/>
      <text x="2" y="7" fill={color} fontSize="5" fontWeight="bold">⫤</text>
    </svg>
  );
}
function IconFunction({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M3 24 Q5 20 8 16 Q11 12 14 14 Q17 16 20 12 Q23 8 25 4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="3" y1="24" x2="25" y2="24" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="3" y1="3" x2="3" y2="24" stroke={color} strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}
function IconParabola({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M3 23 Q14 2 25 23" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="3" y1="23" x2="25" y2="23" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="14" y1="3" x2="14" y2="23" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
    </svg>
  );
}
function IconTrigValue({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M2 14 Q7 3 14 14 Q21 25 26 14" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="2" y1="14" x2="26" y2="14" stroke={color} strokeWidth="1" opacity="0.4"/>
    </svg>
  );
}
function IconCosineRule({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <polygon points="3,24 25,24 14,5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
      <path d="M8 24 A5 5 0 0 1 3 24" stroke={color} strokeWidth="1.5" fill="none"/>
      <text x="12" y="12" fill={color} fontSize="4.5" fontWeight="bold">c²</text>
    </svg>
  );
}
function IconSineRule({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <polygon points="3,24 25,24 10,5" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.12"/>
      <text x="4" y="21" fill={color} fontSize="4" fontWeight="bold">a</text>
      <text x="22" y="15" fill={color} fontSize="4" fontWeight="bold">b</text>
      <text x="14" y="27" fill={color} fontSize="4" fontWeight="bold">c</text>
      <text x="8" y="13" fill={color} fontSize="5" fontWeight="bold">sin</text>
    </svg>
  );
}
function IconTriangle({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <polygon points="4,24 24,24 14,4" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.15"/>
      <line x1="14" y1="4" x2="14" y2="24" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <circle cx="4" cy="24" r="2" fill={color} opacity="0.7"/>
      <circle cx="24" cy="24" r="2" fill={color} opacity="0.7"/>
      <circle cx="14" cy="4" r="2" fill={color} opacity="0.7"/>
    </svg>
  );
}
function IconVector({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="4" y1="24" x2="22" y2="8" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polygon points="22,8 16,10 18,16" fill={color}/>
      <circle cx="4" cy="24" r="2" fill={color} fillOpacity="0.5"/>
    </svg>
  );
}
function IconVectorSum({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="20" x2="13" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="13,8 9,10 10,14" fill={color}/>
      <line x1="13" y1="8" x2="23" y2="20" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <polygon points="23,20 19,16 17,21" fill={color} opacity="0.7"/>
      <line x1="3" y1="20" x2="23" y2="20" stroke={color} strokeWidth="1.8" strokeLinecap="round" strokeDasharray="2 2"/>
    </svg>
  );
}
function IconScalar({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="4" y1="20" x2="14" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.5"/>
      <polygon points="14,8 11,12 14,14" fill={color} fillOpacity="0.5"/>
      <line x1="4" y1="24" x2="24" y2="4" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <polygon points="24,4 19,7 21,12" fill={color}/>
      <text x="2" y="27" fill={color} fontSize="5.5" fontWeight="bold">k→</text>
    </svg>
  );
}
function IconDotProduct({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="14" x2="25" y2="8" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <polygon points="25,8 20,8 22,12" fill={color}/>
      <line x1="3" y1="14" x2="20" y2="24" stroke={color} strokeWidth="1.5" strokeLinecap="round" opacity="0.7"/>
      <polygon points="20,24 17,19 21,19" fill={color} opacity="0.7"/>
      <circle cx="3" cy="14" r="2.5" fill={color}/>
      <text x="12" y="18" fill={color} fontSize="7" fontWeight="bold">·</text>
    </svg>
  );
}
function IconGeometry({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <rect x="5" y="8" width="18" height="13" rx="1" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.1"/>
      <line x1="5" y1="14" x2="23" y2="14" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <line x1="14" y1="8" x2="14" y2="21" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.5"/>
      <text x="14" y="26" textAnchor="middle" fill={color} fontSize="4.5" fontWeight="bold">S = l × w</text>
    </svg>
  );
}
function IconArea({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <polygon points="4,22 14,4 24,22" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.5"/>
      <line x1="14" y1="4" x2="14" y2="22" stroke={color} strokeWidth="1" strokeDasharray="2 2" opacity="0.6"/>
      <line x1="10" y1="22" x2="10" y2="18" stroke={color} strokeWidth="1.5"/>
      <line x1="9" y1="18" x2="11" y2="18" stroke={color} strokeWidth="1.5"/>
      <text x="14" y="27" textAnchor="middle" fill={color} fontSize="4" fontWeight="bold">S = ½bh</text>
    </svg>
  );
}
function IconDiscriminant({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M3 24 Q14 2 25 24" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <line x1="3" y1="24" x2="25" y2="24" stroke={color} strokeWidth="1" opacity="0.4"/>
      <text x="11" y="17" fill={color} fontSize="8" fontWeight="bold">Δ</text>
    </svg>
  );
}
function IconQuadIneq({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M3 20 Q14 3 25 20" stroke={color} strokeWidth="2" strokeLinecap="round" fill={color} fillOpacity="0.12"/>
      <line x1="3" y1="20" x2="25" y2="20" stroke={color} strokeWidth="1.5" opacity="0.5"/>
      <text x="5" y="26" fill={color} fontSize="5" fontWeight="bold">≥ 0</text>
    </svg>
  );
}
function IconQuadEq({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M3 22 Q9 4 14 8 Q19 12 25 4" stroke={color} strokeWidth="2" strokeLinecap="round" fill="none"/>
      <circle cx="11" cy="15" r="2" fill={color} fillOpacity="0.6"/>
      <circle cx="20" cy="11" r="2" fill={color} fillOpacity="0.6"/>
      <text x="3" y="27" fill={color} fontSize="4" fontWeight="bold">ax²+bx+c</text>
    </svg>
  );
}
function IconCounting({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <circle cx="8" cy="10" r="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1"/>
      <circle cx="20" cy="10" r="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1"/>
      <circle cx="14" cy="20" r="3" fill={color} fillOpacity="0.25" stroke={color} strokeWidth="1"/>
      <line x1="8" y1="10" x2="20" y2="10" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="8" y1="10" x2="14" y2="20" stroke={color} strokeWidth="1" opacity="0.5"/>
      <line x1="20" y1="10" x2="14" y2="20" stroke={color} strokeWidth="1" opacity="0.5"/>
    </svg>
  );
}
function IconPermutation({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <text x="3" y="16" fill={color} fontSize="9" fontWeight="900">n!</text>
      <text x="3" y="26" fill={color} fontSize="5.5" fontWeight="bold">C(n,k)</text>
    </svg>
  );
}
function IconBinomial({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      {[0,1,2,3,4].map((v,i) => (
        <rect key={i} x={3+i*4.5} y={26-v*5} width={3.5} height={v*5} fill={color} fillOpacity={0.3+i*0.1} rx="0.5"/>
      ))}
      <text x="3" y="10" fill={color} fontSize="5.5" fontWeight="bold">(a+b)ⁿ</text>
    </svg>
  );
}
function IconCoords({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="14" x2="25" y2="14" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <line x1="14" y1="3" x2="14" y2="25" stroke={color} strokeWidth="1.2" opacity="0.6"/>
      <polygon points="25,14 22,12 22,16" fill={color}/>
      <polygon points="14,3 12,6 16,6" fill={color}/>
      <circle cx="19" cy="9" r="2.5" fill={color} fillOpacity="0.6"/>
      <text x="20" y="9" fill={color} fontSize="4.5">(x,y)</text>
    </svg>
  );
}
function IconLine({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="14" x2="25" y2="14" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="14" y1="3" x2="14" y2="25" stroke={color} strokeWidth="1" opacity="0.4"/>
      <line x1="3" y1="22" x2="25" y2="6" stroke={color} strokeWidth="2" strokeLinecap="round"/>
      <text x="16" y="24" fill={color} fontSize="4.5" fontWeight="bold">y=mx+b</text>
    </svg>
  );
}
function IconCircle({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="14" x2="25" y2="14" stroke={color} strokeWidth="1" opacity="0.35"/>
      <line x1="14" y1="3" x2="14" y2="25" stroke={color} strokeWidth="1" opacity="0.35"/>
      <circle cx="14" cy="14" r="9" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/>
      <line x1="14" y1="14" x2="21" y2="10" stroke={color} strokeWidth="1.5" strokeLinecap="round"/>
      <circle cx="14" cy="14" r="1.5" fill={color}/>
    </svg>
  );
}
function IconEllipse({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <line x1="3" y1="14" x2="25" y2="14" stroke={color} strokeWidth="1" opacity="0.35"/>
      <line x1="14" y1="3" x2="14" y2="25" stroke={color} strokeWidth="1" opacity="0.35"/>
      <ellipse cx="14" cy="14" rx="10" ry="6" stroke={color} strokeWidth="1.8" fill={color} fillOpacity="0.1"/>
      <circle cx="9" cy="14" r="1.5" fill={color} fillOpacity="0.7"/>
      <circle cx="19" cy="14" r="1.5" fill={color} fillOpacity="0.7"/>
    </svg>
  );
}
function IconSampleSpace({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <rect x="3" y="3" width="22" height="22" rx="3" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.06"/>
      <circle cx="14" cy="14" r="7" stroke={color} strokeWidth="1.5" fill={color} fillOpacity="0.18"/>
      <text x="10" y="17" fill={color} fontSize="7" fontWeight="bold">Ω</text>
    </svg>
  );
}
function IconProbability({ color }) {
  return (
    <svg viewBox="0 0 28 28" width="18" height="18" fill="none">
      <path d="M14 4 L14 24 M4 14 L24 14" stroke={color} strokeWidth="1" opacity="0.35"/>
      <path d="M4 24 L14 4 L24 24 Z" fill={color} fillOpacity="0.18" stroke={color} strokeWidth="1.2"/>
      <text x="9" y="23" fill={color} fontSize="5" fontWeight="bold">P(A)</text>
    </svg>
  );
}

// Map slug → icon component
const LESSON_ICONS = {
  "Menh-de": IconProposition,
  "Tap-hop": IconSets,
  "phep-toan-tap-hop": IconSetOps,
  "OnTapChuong1": IconReview,
  "Bpt-bac-nhat-2-an": IconInequality,
  "Lesson5_HeBPTBacNhatHaiAn": IconSystem,
  "chuong2-10": IconReview,
  "Ham-so-va-do-thi": IconFunction,
  "Ham-so-bac-hai": IconParabola,
  "on-tap-chuong-3": IconReview,
  "gia-tri-luong-giac": IconTrigValue,
  "Lesson10_DinhLiCosin": IconCosineRule,
  "Lesson11_DinhLiSin": IconSineRule,
  "Lesson12_GiaiTamGiac": IconTriangle,
  "Lesson13_KhaiNiemVecto": IconVector,
  "Lesson14_TongHieuVecto": IconVectorSum,
  "Lesson15_TichSoVecto": IconScalar,
  "Lesson16_TichVoHuong": IconDotProduct,
  "OnTapChuong4": IconReview,
  "Lesson17_OnTapChuong5": IconReview,
  "Lesson18_HinhHocDoLuong1": IconGeometry,
  "Lesson19_HinhHocDoLuong2": IconArea,
  "Lesson20_OnTapChuong6": IconReview,
  "Lesson21_DauTamThucBacHai": IconDiscriminant,
  "Lesson22_GiaiBPTBacHai": IconQuadIneq,
  "Lesson23_PhuongTrinhQuyVeBacHai": IconQuadEq,
  "Lesson24_OnTapChuong7": IconReview,
  "Lesson25_QuyTacCongNhan": IconCounting,
  "Lesson26_HoanViChinhHopToHop": IconPermutation,
  "Lesson27_NhiThucNewton": IconBinomial,
  "Lesson28_OnTapChuong8": IconReview,
  "Lesson29_ToaDoVecto": IconCoords,
  "Lesson30_DuongThang": IconLine,
  "Lesson31_DuongTron": IconCircle,
  "Lesson32_Elip": IconEllipse,
  "Lesson33_OnTapChuong9": IconReview,
  "Lesson34_KhongGianMau": IconSampleSpace,
  "Lesson35_XacSuatBienCo": IconProbability,
  "Lesson36_OnTapChuong10": IconReview,
};

// ─── BENTO CARD DATA ─────────────────────────────────────────────────────────
// Each lesson has a thumbnail (emoji/icon), title, slug, and done status.
const BENTO_CARDS = [
  {
    id: "ch1",
    size: "large",
    chapter: "Chapter 1",
    title: "Propositions & Sets",
    titleVi: "Mệnh Đề & Tập Hợp",
    graphType: "venn",
    accentColor: "#22d3ee",
    glowColor: "rgba(34,211,238,0.25)",
    badge: "Set Theory",
    lessons: [
      { thumb: "⊢", title: "Mathematical Propositions", titleVi: "Mệnh Đề Toán Học", slug: "Menh-de", done: true },
      { thumb: "∈", title: "Sets", titleVi: "Tập Hợp", slug: "Tap-hop", done: true },
      { thumb: "∩", title: "Set Operations", titleVi: "Phép Toán Tập Hợp", slug: "phep-toan-tap-hop", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.1", titleVi: "Ôn Tập Chương 1", slug: "OnTapChuong1", done: true },
    ],
  },
  {
    id: "ch2",
    size: "medium",
    chapter: "Chapter 2",
    title: "Linear Inequalities",
    titleVi: "Bất Phương Trình",
    graphType: "inequality",
    accentColor: "#10b981",
    glowColor: "rgba(16,185,129,0.25)",
    badge: "2-Variable",
    lessons: [
      { thumb: "≤", title: "Linear Inequalities in 2 Variables", titleVi: "BPT Bậc Nhất Hai Ẩn", slug: "Bpt-bac-nhat-2-an", done: true },
      { thumb: "⫤", title: "Systems of Linear Inequalities", titleVi: "Hệ BPT Bậc Nhất Hai Ẩn", slug: "Lesson5_HeBPTBacNhatHaiAn", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.2", titleVi: "Ôn Tập Chương 2", slug: "chuong2-10", done: true },
    ],
  },
  {
    id: "ch3",
    size: "medium",
    chapter: "Chapter 3",
    title: "Quadratic Functions",
    titleVi: "Hàm Số Bậc Hai",
    graphType: "parabola",
    accentColor: "#818cf8",
    glowColor: "rgba(129,140,248,0.25)",
    badge: "y = ax² + bx + c",
    lessons: [
      { thumb: "f(x)", title: "Functions and Graphs", titleVi: "Hàm Số và Đồ Thị", slug: "Ham-so-va-do-thi", done: true },
      { thumb: "∪", title: "Quadratic Functions", titleVi: "Hàm Số Bậc Hai", slug: "Ham-so-bac-hai", done: true },
      { thumb: "📝", title: "Practice & Review – Ch.3", titleVi: "Ôn Tập Chương 3", slug: "on-tap-chuong-3", done: true },
    ],
  },
  {
    id: "ch4-5",
    size: "wide",
    chapter: "Chapter 4 – 5",
    title: "Trigonometry & Vectors",
    titleVi: "Hệ Thức Lượng & Vectơ",
    graphType: "vectors",
    accentColor: "#a78bfa",
    glowColor: "rgba(167,139,250,0.25)",
    badge: "Geometry",
    lessons: [
      { thumb: "sin", title: "Trigonometric Values (0°–180°)", titleVi: "Giá Trị Lượng Giác", slug: "gia-tri-luong-giac", done: true },
      { thumb: "cos²", title: "Law of Cosines", titleVi: "Định Lí Cosin", slug: "Lesson10_DinhLiCosin", done: true },
      { thumb: "sinA", title: "Law of Sines", titleVi: "Định Lí Sin", slug: "Lesson11_DinhLiSin", done: true },
      { thumb: "△", title: "Solving Triangles", titleVi: "Giải Tam Giác", slug: "Lesson12_GiaiTamGiac", done: true },
      { thumb: "→", title: "Introduction to Vectors", titleVi: "Khái Niệm Vectơ", slug: "Lesson13_KhaiNiemVecto", done: true },
      { thumb: "a+b", title: "Sum & Difference of Vectors", titleVi: "Tổng & Hiệu Vectơ", slug: "Lesson14_TongHieuVecto", done: true },
      { thumb: "k→", title: "Scalar Multiplication", titleVi: "Tích Số Vectơ", slug: "Lesson15_TichSoVecto", done: true },
      { thumb: "·", title: "Dot Product", titleVi: "Tích Vô Hướng", slug: "Lesson16_TichVoHuong", done: true },
      { thumb: "📝", title: "Practice – Ch.4", titleVi: "Ôn Tập Chương 4", slug: "OnTapChuong4", done: true },
      { thumb: "📝", title: "Practice – Ch.5", titleVi: "Ôn Tập Chương 5", slug: "Lesson17_OnTapChuong5", done: true },
    ],
  },
  {
    id: "ch6",
    size: "small",
    chapter: "Chapter 6",
    title: "Geometry & Measurement",
    titleVi: "Hình Học Đo Lường",
    graphType: "trig",
    accentColor: "#38bdf8",
    glowColor: "rgba(56,189,248,0.25)",
    badge: "Measurement",
    lessons: [
      { thumb: "□", title: "Geometric Shapes & Properties", titleVi: "Hình Học & Diện Tích", slug: "Lesson18_HinhHocDoLuong1", done: true },
      { thumb: "S=", title: "Area and Perimeter", titleVi: "Diện Tích & Chu Vi", slug: "Lesson19_HinhHocDoLuong2", done: true },
      { thumb: "📝", title: "Practice – Ch.6", titleVi: "Ôn Tập Chương 6", slug: "Lesson20_OnTapChuong6", done: true },
    ],
  },
  {
    id: "ch7",
    size: "small",
    chapter: "Chapter 7",
    title: "Quadratic Inequalities",
    titleVi: "Bất Phương Trình Bậc Hai",
    graphType: "parabola",
    accentColor: "#fb7185",
    glowColor: "rgba(251,113,133,0.25)",
    badge: "Δ = b² - 4ac",
    lessons: [
      { thumb: "Δ", title: "Sign of a Quadratic Trinomial", titleVi: "Dấu Tam Thức Bậc Hai", slug: "Lesson21_DauTamThucBacHai", done: true },
      { thumb: "≥0", title: "Solving Quadratic Inequalities", titleVi: "Giải BPT Bậc Hai", slug: "Lesson22_GiaiBPTBacHai", done: true },
      { thumb: "⇒", title: "Equations Reducible to Quadratic", titleVi: "PT Quy Về Bậc Hai", slug: "Lesson23_PhuongTrinhQuyVeBacHai", done: true },
      { thumb: "📝", title: "Practice – Ch.7", titleVi: "Ôn Tập Chương 7", slug: "Lesson24_OnTapChuong7", done: true },
    ],
  },
  {
    id: "ch8",
    size: "medium",
    chapter: "Chapter 8",
    title: "Combinatorial Algebra",
    titleVi: "Tổ Hợp & Hoán Vị",
    graphType: "venn",
    accentColor: "#fbbf24",
    glowColor: "rgba(251,191,36,0.25)",
    badge: "C(n,k)",
    lessons: [
      { thumb: "×+", title: "Addition & Multiplication Principles", titleVi: "Quy Tắc Cộng & Nhân", slug: "Lesson25_QuyTacCongNhan", done: true },
      { thumb: "n!", title: "Permutations, Arrangements & Combinations", titleVi: "Hoán Vị, Chỉnh Hợp & Tổ Hợp", slug: "Lesson26_HoanViChinhHopToHop", done: true },
      { thumb: "Cₙᵏ", title: "Binomial Theorem", titleVi: "Nhị Thức Newton", slug: "Lesson27_NhiThucNewton", done: true },
      { thumb: "📝", title: "Practice – Ch.8", titleVi: "Ôn Tập Chương 8", slug: "Lesson28_OnTapChuong8", done: true },
    ],
  },
  {
    id: "ch9",
    size: "large",
    chapter: "Chapter 9",
    title: "Coordinate Geometry",
    titleVi: "Phương Pháp Tọa Độ",
    graphType: "ellipse",
    accentColor: "#6366f1",
    glowColor: "rgba(99,102,241,0.25)",
    badge: "Analytic Geometry",
    lessons: [
      { thumb: "(x,y)", title: "Coordinates of a Vector", titleVi: "Tọa Độ Vectơ", slug: "Lesson29_ToaDoVecto", done: true },
      { thumb: "y=mx", title: "Lines in the Coordinate Plane", titleVi: "Đường Thẳng", slug: "Lesson30_DuongThang", done: true },
      { thumb: "○", title: "Circles in the Coordinate Plane", titleVi: "Đường Tròn", slug: "Lesson31_DuongTron", done: true },
      { thumb: "⬭", title: "Ellipse (Introduction)", titleVi: "Elip", slug: "Lesson32_Elip", done: true },
      { thumb: "📝", title: "Practice – Ch.9", titleVi: "Ôn Tập Chương 9", slug: "Lesson33_OnTapChuong9", done: true },
    ],
  },
  {
    id: "ch10",
    size: "medium",
    chapter: "Chapter 10",
    title: "Probability",
    titleVi: "Xác Suất",
    graphType: "venn",
    accentColor: "#34d399",
    glowColor: "rgba(52,211,153,0.25)",
    badge: "P(A)",
    lessons: [
      { thumb: "Ω", title: "Sample Spaces and Events", titleVi: "Không Gian Mẫu", slug: "Lesson34_KhongGianMau", done: true },
      { thumb: "P(A)", title: "Probability of an Event", titleVi: "Xác Suất Biến Cố", slug: "Lesson35_XacSuatBienCo", done: true },
      { thumb: "📝", title: "Practice – Ch.10", titleVi: "Ôn Tập Chương 10", slug: "Lesson36_OnTapChuong10", done: true },
    ],
  },
];

// ─── LESSON PILL COMPONENT ────────────────────────────────────────────────────
function LessonPill({ lesson, accentColor }) {
  return (
    <Link href={`/${lesson.slug}`} onClick={(e) => e.stopPropagation()} style={{ textDecoration: "none" }}>
      <motion.div
        whileHover={{ scale: 1.03, y: -2 }}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          background: "rgba(255,255,255,0.05)",
          border: "1px solid rgba(255,255,255,0.09)",
          borderRadius: 10,
          padding: "7px 10px",
          cursor: "pointer",
          transition: "all 0.2s",
        }}
        onMouseEnter={e => {
          e.currentTarget.style.background = accentColor + "15";
          e.currentTarget.style.borderColor = accentColor + "40";
        }}
        onMouseLeave={e => {
          e.currentTarget.style.background = "rgba(255,255,255,0.05)";
          e.currentTarget.style.borderColor = "rgba(255,255,255,0.09)";
        }}
      >
        {/* SVG Icon badge */}
        {(() => {
          const IconComp = LESSON_ICONS[lesson.slug];
          return (
            <div style={{
              flexShrink: 0,
              width: 34,
              height: 34,
              borderRadius: 8,
              background: accentColor + "18",
              border: `1px solid ${accentColor}35`,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "all 0.2s",
            }}>
              {IconComp
                ? <IconComp color={accentColor} />
                : <span style={{ fontSize: lesson.thumb?.length > 2 ? 9 : 13, fontWeight: 800, color: accentColor, fontFamily: "'Courier New', monospace", letterSpacing: -0.5 }}>{lesson.thumb}</span>
              }
            </div>
          );
        })()}

        {/* Title stack */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{
            fontSize: 12,
            fontWeight: 600,
            color: "rgba(255,255,255,0.82)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            lineHeight: 1.3,
          }}>
            {lesson.title}
          </div>
          <div style={{
            fontSize: 10,
            color: "rgba(255,255,255,0.35)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            marginTop: 1,
          }}>
            {lesson.titleVi}
          </div>
        </div>

        {/* Arrow */}
        <div style={{ color: accentColor, fontSize: 11, opacity: 0.6, flexShrink: 0 }}>›</div>
      </motion.div>
    </Link>
  );
}

// ─── BENTO CARD COMPONENT ─────────────────────────────────────────────────────
function BentoCard({ card }) {
  const firstDoneLesson = card.lessons.find((l) => l.done);
  const href = firstDoneLesson ? `/${firstDoneLesson.slug}` : null;

  const cardContent = (
    <motion.div
      whileHover="hover"
      initial="initial"
      style={{
        height: "100%",
        background: "rgba(15, 23, 42, 0.55)",
        border: `1px solid rgba(255,255,255,0.07)`,
        borderRadius: 20,
        overflow: "hidden",
        position: "relative",
        cursor: href ? "pointer" : "default",
        display: "flex",
        flexDirection: "column",
        padding: "24px",
        gap: 14,
        backdropFilter: "blur(12px)",
        transition: "border-color 0.3s ease",
      }}
      whileHover={{
        borderColor: card.accentColor + "50",
        boxShadow: `0 20px 50px rgba(0,0,0,0.5), 0 0 30px ${card.glowColor}`,
        y: -5,
        transition: { duration: 0.3 },
      }}
    >
      {/* Ambient glow overlay revealed on hover */}
      <motion.div
        variants={{
          initial: { opacity: 0 },
          hover: { opacity: 1 },
        }}
        style={{
          position: "absolute",
          inset: 0,
          background: `radial-gradient(circle at 20% 20%, ${card.glowColor} 0%, transparent 65%)`,
          pointerEvents: "none",
          zIndex: 0,
        }}
      />

      {/* SVG Graph — auto-draws on hover */}
      <div style={{ position: "relative", zIndex: 1, height: card.size === "wide" ? 72 : 80, flexShrink: 0, display: "flex", alignItems: "center" }}>
        <MathGraphSVG type={card.graphType} color={card.accentColor} />
      </div>

      {/* Card Info */}
      <div style={{ position: "relative", zIndex: 1, flex: 1 }}>
        <div style={{
          display: "inline-block",
          fontSize: 10, fontWeight: 800,
          color: card.accentColor,
          background: card.accentColor + "18",
          border: `1px solid ${card.accentColor}44`,
          borderRadius: 20,
          padding: "3px 10px",
          letterSpacing: 0.5,
          textTransform: "uppercase",
          marginBottom: 8,
        }}>
          {card.badge}
        </div>

        <div style={{ fontSize: 11, fontWeight: 600, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 4 }}>
          {card.chapter}
        </div>

        <h2 style={{ fontSize: card.size === "large" || card.size === "wide" ? 20 : 17, fontWeight: 800, color: "white", marginBottom: 2, lineHeight: 1.2 }}>
          {card.title}
        </h2>
        <div style={{ fontSize: 12, color: card.accentColor, fontWeight: 600, marginBottom: 14 }}>
          {card.titleVi}
        </div>

        {/* Lesson pills with thumbnails */}
        <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
          {card.lessons.map((l) =>
            l.done ? (
              <LessonPill key={l.slug} lesson={l} accentColor={card.accentColor} />
            ) : (
              <div key={l.slug} style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                background: "rgba(255,255,255,0.02)",
                border: "1px solid rgba(255,255,255,0.04)",
                borderRadius: 10,
                padding: "7px 10px",
                opacity: 0.45,
              }}>
                <div style={{
                  width: 32, height: 32, borderRadius: 7,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.06)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontSize: 13, color: "rgba(255,255,255,0.3)",
                }}>
                  {l.thumb || "🔜"}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "rgba(255,255,255,0.3)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                    {l.title}
                  </div>
                  <div style={{ fontSize: 10, color: "rgba(255,255,255,0.18)", marginTop: 1 }}>{l.titleVi}</div>
                </div>
                <div style={{ fontSize: 10, color: "rgba(255,255,255,0.2)", flexShrink: 0 }}>🔜</div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Arrow indicator */}
      {href && (
        <motion.div
          variants={{
            initial: { opacity: 0, x: -4 },
            hover: { opacity: 1, x: 0 },
          }}
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            color: card.accentColor,
            fontSize: 18,
            fontWeight: 700,
            zIndex: 1,
          }}
        >
          →
        </motion.div>
      )}
    </motion.div>
  );

  return cardContent;
}

// ─── PAGE COMPONENT ──────────────────────────────────────────────────────────
export default function CacBaiLamPage() {
  // Stats bar data
  const stats = [
    { label: "Chapters", value: "10" },
    { label: "Lessons", value: "36+" },
    { label: "Bilingual", value: "EN/VI" },
    { label: "Mini Games", value: "3 types" },
  ];

  return (
    <div style={{
      width: "100%",
      minHeight: "100vh",
      background: "linear-gradient(160deg, #020c1b 0%, #0a1628 15%, #0c2340 35%, #0e3158 50%, #0a3d5c 65%, #063d56 80%, #042f46 100%)",
      position: "relative",
      overflow: "hidden",
      color: "white",
    }}>

      {/* ── Ambient background glows ── */}
      <div aria-hidden="true" style={{ position: "fixed", inset: 0, zIndex: 0, pointerEvents: "none" }}>
        <div style={{
          position: "absolute", inset: 0,
          background: "radial-gradient(ellipse 70% 50% at 15% 25%, rgba(6,182,212,0.09) 0%, transparent 60%), radial-gradient(ellipse 60% 60% at 80% 70%, rgba(99,102,241,0.08) 0%, transparent 60%)",
        }} />
        <div style={{
          position: "absolute", inset: 0,
          backgroundImage: "radial-gradient(circle, rgba(56,189,248,0.035) 1px, transparent 1px)",
          backgroundSize: "36px 36px",
        }} />
      </div>

      <div style={{ width: "1280px", maxWidth: "95%", margin: "0 auto", paddingTop: 50, paddingBottom: 80, position: "relative", zIndex: 1 }}>

        {/* ── Back button ── */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.4 }}>
          <Link href="/Cacbaitoan" style={{ textDecoration: "none" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: 8,
              background: "rgba(255,255,255,0.06)",
              border: "1px solid rgba(255,255,255,0.12)",
              borderRadius: 8, padding: "7px 14px", marginBottom: 40,
              fontSize: 13, fontWeight: 600, color: "rgba(255,255,255,0.7)",
              cursor: "pointer", transition: "all 0.2s",
            }}
              onMouseEnter={e => { e.currentTarget.style.color = "white"; e.currentTarget.style.borderColor = "rgba(56,189,248,0.4)"; e.currentTarget.style.background = "rgba(56,189,248,0.08)"; }}
              onMouseLeave={e => { e.currentTarget.style.color = "rgba(255,255,255,0.7)"; e.currentTarget.style.borderColor = "rgba(255,255,255,0.12)"; e.currentTarget.style.background = "rgba(255,255,255,0.06)"; }}
            >
              ← Chọn lớp
            </div>
          </Link>
        </motion.div>

        {/* ── Hero Header ── */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
          style={{ marginBottom: 56 }}
        >
          <div style={{
            display: "inline-block",
            fontSize: 11, fontWeight: 800,
            color: "#38bdf8",
            background: "rgba(56,189,248,0.10)",
            border: "1px solid rgba(56,189,248,0.25)",
            borderRadius: 20,
            padding: "4px 14px",
            letterSpacing: 1.2,
            textTransform: "uppercase",
            marginBottom: 16,
          }}>
            Bilingual Curriculum · Grade 10
          </div>

          <h1 style={{
            fontSize: "clamp(28px, 5vw, 48px)",
            fontWeight: 900,
            background: "linear-gradient(135deg, #ffffff 60%, #93c5fd 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            marginBottom: 12,
            lineHeight: 1.1,
          }}>
            Toán Lớp 10 — Grade 10
          </h1>

          <p style={{ color: "rgba(255,255,255,0.55)", fontSize: 17, maxWidth: 640, lineHeight: 1.7 }}>
            Chọn bài học để bắt đầu. Mỗi thẻ đại diện cho một chương trong chương trình
            Toán 10 song ngữ Anh–Việt theo chuẩn SAT/IELTS Math.
          </p>

          {/* Stats bar */}
          <div style={{
            display: "flex", flexWrap: "wrap", gap: 0,
            marginTop: 28,
            background: "rgba(255,255,255,0.04)",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 12,
            overflow: "hidden",
            width: "fit-content",
          }}>
            {stats.map((s, i) => (
              <div key={s.label} style={{
                padding: "12px 24px",
                borderRight: i < stats.length - 1 ? "1px solid rgba(255,255,255,0.08)" : "none",
                textAlign: "center",
              }}>
                <div style={{ fontSize: 18, fontWeight: 900, color: "white" }}>{s.value}</div>
                <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: 0.8, marginTop: 2 }}>{s.label}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ── BENTO GRID ── */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(12, 1fr)",
          gridAutoRows: "auto",
          gap: 20,
        }}>
          {BENTO_CARDS.map((card, i) => {
            const colSpanMap = {
              large:  "span 5",
              medium: "span 4",
              small:  "span 3",
              wide:   "span 12",
            };
            const colSpan = colSpanMap[card.size] || "span 4";

            return (
              <motion.div
                key={card.id}
                style={{ gridColumn: colSpan }}
                initial={{ opacity: 0, y: 28, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.55, delay: i * 0.06, ease: [0.16, 1, 0.3, 1] }}
              >
                <BentoCard card={card} />
              </motion.div>
            );
          })}
        </div>

        {/* ── Bottom tip ── */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          style={{ marginTop: 48, textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 13 }}
        >
          💡 Di chuột vào mỗi thẻ để xem đồ thị toán học tự vẽ · Hover a card to see the math graph animate
        </motion.div>
      </div>

      <style jsx global>{`
        @media (max-width: 900px) {
          div[style*="gridTemplateColumns"] > div {
            grid-column: span 12 !important;
          }
        }
        @media (min-width: 901px) and (max-width: 1100px) {
          div[style*="gridTemplateColumns"] > div[style*="span 5"],
          div[style*="gridTemplateColumns"] > div[style*="span 4"] {
            grid-column: span 6 !important;
          }
          div[style*="gridTemplateColumns"] > div[style*="span 3"] {
            grid-column: span 4 !important;
          }
        }
      `}</style>
    </div>
  );
}
