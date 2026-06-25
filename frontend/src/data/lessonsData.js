"use client";
import React from "react";

// Local Section Header and Theory Block helpers inside renderTheory
const SectionHeader = ({ icon, title }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 22, fontWeight: 700, color: "#22d3ee", marginBottom: 20, paddingBottom: 12, borderBottom: "1px solid rgba(255,255,255,0.08)" }}>
    <span style={{ fontSize: 24 }}>{icon}</span><span>{title}</span>
  </div>
);

const TheoryBlock = ({ children }) => (
  <div style={{ padding: "20px 22px", borderRadius: 12, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)", marginBottom: 20 }}>
    {children}
  </div>
);

const FormulaCard = ({ label, formula, note }) => (
  <div style={{ padding: "14px 16px", borderRadius: 10, background: "rgba(99,102,241,0.08)", border: "1px solid rgba(99,102,241,0.2)", textAlign: "center", margin: "10px 0" }}>
    <div style={{ fontSize: 11, color: "rgba(255,255,255,0.4)", marginBottom: 6, textTransform: "uppercase", letterSpacing: 0.5 }}>{label}</div>
    <div style={{ fontFamily: "monospace", fontSize: 18, color: "#a5b4fc", fontWeight: 700, marginBottom: 6 }}>{formula}</div>
    {note && <div style={{ fontSize: 12, color: "rgba(255,255,255,0.3)" }}>{note}</div>}
  </div>
);

// Lesson lists metadata to match slugs to titles
const GRADE_11_LESSONS = {
  // Chapter 1
  "L11-C1-L1": { ch: "Chương I · Hàm Số Lượng Giác", chEn: "Chapter I · Trigonometric Functions", title: "Bài 1 · Góc lượng giác và Giá trị lượng giác", titleEn: "Lesson 1 · Trigonometric Angles & Values", topic: "trig" },
  "L11-C1-L2": { ch: "Chương I · Hàm Số Lượng Giác", chEn: "Chapter I · Trigonometric Functions", title: "Bài 2 · Công thức lượng giác", titleEn: "Lesson 2 · Trigonometric Formulas", topic: "trig" },
  "L11-C1-L3": { ch: "Chương I · Hàm Số Lượng Giác", chEn: "Chapter I · Trigonometric Functions", title: "Bài 3 · Hàm số lượng giác và Đồ thị", titleEn: "Lesson 3 · Trigonometric Functions & Graphs", topic: "trig" },
  "L11-C1-L4": { ch: "Chương I · Hàm Số Lượng Giác", chEn: "Chapter I · Trigonometric Functions", title: "Bài 4 · Phương trình lượng giác cơ bản", titleEn: "Lesson 4 · Basic Trigonometric Equations", topic: "trig" },
  "L11-C1-L5": { ch: "Chương I · Hàm Số Lượng Giác", chEn: "Chapter I · Trigonometric Functions", title: "Bài 5 · Ôn tập Chương I", titleEn: "Lesson 5 · Practice & Review – Chapter 1", topic: "trig" },
  // Chapter 2
  "L11-C2-L1": { ch: "Chương II · Dãy Số & Cấp Số", chEn: "Chapter II · Sequences & Progressions", title: "Bài 1 · Dãy số", titleEn: "Lesson 1 · Sequences", topic: "sequences" },
  "L11-C2-L2": { ch: "Chương II · Dãy Số & Cấp Số", chEn: "Chapter II · Sequences & Progressions", title: "Bài 2 · Cấp số cộng", titleEn: "Lesson 2 · Arithmetic Progressions", topic: "sequences" },
  "L11-C2-L3": { ch: "Chương II · Dãy Số & Cấp Số", chEn: "Chapter II · Sequences & Progressions", title: "Bài 3 · Cấp số nhân", titleEn: "Lesson 3 · Geometric Progressions", topic: "sequences" },
  "L11-C2-L4": { ch: "Chương II · Dãy Số & Cấp Số", chEn: "Chapter II · Sequences & Progressions", title: "Bài 4 · Ôn tập Chương II", titleEn: "Lesson 4 · Practice & Review – Chapter 2", topic: "sequences" },
  // Chapter 3
  "L11-C3-L1": { ch: "Chương III · Giới Hạn & Liên Tục", chEn: "Chapter III · Limits & Continuity", title: "Bài 1 · Giới hạn của dãy số", titleEn: "Lesson 1 · Limits of Sequences", topic: "limits" },
  "L11-C3-L2": { ch: "Chương III · Giới Hạn & Liên Tục", chEn: "Chapter III · Limits & Continuity", title: "Bài 2 · Giới hạn của hàm số", titleEn: "Lesson 2 · Limits of Functions", topic: "limits" },
  "L11-C3-L3": { ch: "Chương III · Giới Hạn & Liên Tục", chEn: "Chapter III · Limits & Continuity", title: "Bài 3 · Hàm số liên tục", titleEn: "Lesson 3 · Continuous Functions", topic: "limits" },
  "L11-C3-L4": { ch: "Chương III · Giới Hạn & Liên Tục", chEn: "Chapter III · Limits & Continuity", title: "Bài 4 · Ôn tập Chương III", titleEn: "Lesson 4 · Practice & Review – Chapter 3", topic: "limits" },
  // Chapter 4
  "L11-C4-L1": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 1 · Đường thẳng và mặt phẳng trong không gian", titleEn: "Lesson 1 · Lines & Planes in Space", topic: "geometry" },
  "L11-C4-L2": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 2 · Hai đường thẳng song song", titleEn: "Lesson 2 · Two Parallel Lines", topic: "geometry" },
  "L11-C4-L3": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 3 · Đường thẳng song song mặt phẳng", titleEn: "Lesson 3 · Line and Plane Parallel", topic: "geometry" },
  "L11-C4-L4": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 4 · Hai mặt phẳng song song", titleEn: "Lesson 4 · Two Parallel Planes", topic: "geometry" },
  "L11-C4-L5": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 5 · Phép chiếu song song", titleEn: "Lesson 5 · Parallel Projection", topic: "geometry" },
  "L11-C4-L6": { ch: "Chương IV · Quan Hệ Song Song", chEn: "Chapter IV · Parallel Relations", title: "Bài 6 · Ôn tập Chương IV", titleEn: "Lesson 6 · Practice & Review – Chapter 4", topic: "geometry" },
  // Chapter 5
  "L11-C5-L1": { ch: "Chương V · Thống Kê", chEn: "Chapter V · Statistics", title: "Bài 1 · Số trung bình và Trung vị của mẫu số liệu ghép nhóm", titleEn: "Lesson 1 · Mean & Median of Grouped Data", topic: "stats" },
  "L11-C5-L2": { ch: "Chương V · Thống Kê", chEn: "Chapter V · Statistics", title: "Bài 2 · Tứ phân vị và Mốt của mẫu số liệu ghép nhóm", titleEn: "Lesson 2 · Quartiles & Mode of Grouped Data", topic: "stats" },
  "L11-C5-L3": { ch: "Chương V · Thống Kê", chEn: "Chapter V · Statistics", title: "Bài 3 · Ôn tập Chương V", titleEn: "Lesson 3 · Practice & Review – Chapter 5", topic: "stats" },
  // Chapter 6
  "L11-C6-L1": { ch: "Chương VI · Hàm Số Mũ & Lôgarit", chEn: "Chapter VI · Exponential & Logarithmic", title: "Bài 1 · Lũy thừa và Số mũ", titleEn: "Lesson 1 · Powers & Exponents", topic: "exponents" },
  "L11-C6-L2": { ch: "Chương VI · Hàm Số Mũ & Lôgarit", chEn: "Chapter VI · Exponential & Logarithmic", title: "Bài 2 · Lôgarit", titleEn: "Lesson 2 · Logarithms", topic: "exponents" },
  "L11-C6-L3": { ch: "Chương VI · Hàm Số Mũ & Lôgarit", chEn: "Chapter VI · Exponential & Logarithmic", title: "Bài 3 · Hàm số mũ và Hàm số lôgarit", titleEn: "Lesson 3 · Exponential & Logarithmic Functions", topic: "exponents" },
  "L11-C6-L4": { ch: "Chương VI · Hàm Số Mũ & Lôgarit", chEn: "Chapter VI · Exponential & Logarithmic", title: "Bài 4 · Phương trình và Bất phương trình mũ, lôgarit", titleEn: "Lesson 4 · Exponential & Logarithmic Equations/Inequalities", topic: "exponents" },
  "L11-C6-L5": { ch: "Chương VI · Hàm Số Mũ & Lôgarit", chEn: "Chapter VI · Exponential & Logarithmic", title: "Bài 5 · Ôn tập Chương VI", titleEn: "Lesson 5 · Practice & Review – Chapter 6", topic: "exponents" },
  // Chapter 7
  "L11-C7-L1": { ch: "Chương VII · Đạo Hàm", chEn: "Chapter VII · Derivatives", title: "Bài 1 · Định nghĩa và Ý nghĩa hình học của đạo hàm", titleEn: "Lesson 1 · Definition & Meaning of Derivatives", topic: "derivatives" },
  "L11-C7-L2": { ch: "Chương VII · Đạo Hàm", chEn: "Chapter VII · Derivatives", title: "Bài 2 · Quy tắc tính đạo hàm", titleEn: "Lesson 2 · Rules of Differentiation", topic: "derivatives" },
  "L11-C7-L3": { ch: "Chương VII · Đạo Hàm", chEn: "Chapter VII · Derivatives", title: "Bài 3 · Đạo hàm cấp hai", titleEn: "Lesson 3 · Second-Order Derivatives", topic: "derivatives" },
  "L11-C7-L4": { ch: "Chương VII · Đạo Hàm", chEn: "Chapter VII · Derivatives", title: "Bài 4 · Ôn tập Chương VII", titleEn: "Lesson 4 · Practice & Review – Chapter 7", topic: "derivatives" },
  // Chapter 8
  "L11-C8-L1": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 1 · Hai đường thẳng vuông góc", titleEn: "Lesson 1 · Two Perpendicular Lines", topic: "geometry" },
  "L11-C8-L2": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 2 · Đường thẳng vuông góc mặt phẳng", titleEn: "Lesson 2 · Line Perpendicular to Plane", topic: "geometry" },
  "L11-C8-L3": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 3 · Hai mặt phẳng vuông góc", titleEn: "Lesson 3 · Two Perpendicular Planes", topic: "geometry" },
  "L11-C8-L4": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 4 · Khoảng cách trong không gian", titleEn: "Lesson 4 · Distances in Space", topic: "geometry" },
  "L11-C8-L5": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 5 · Góc trong không gian", titleEn: "Lesson 5 · Angles in Space", topic: "geometry" },
  "L11-C8-L6": { ch: "Chương VIII · Quan Hệ Vuông Góc", chEn: "Chapter VIII · Perpendicular Relations", title: "Bài 6 · Ôn tập Chương VIII", titleEn: "Lesson 6 · Practice & Review – Chapter 8", topic: "geometry" },
  // Chapter 9
  "L11-C9-L1": { ch: "Chương IX · Xác Suất", chEn: "Chapter IX · Probability", title: "Bài 1 · Biến cố hợp, giao và độc lập", titleEn: "Lesson 1 · Union, Intersection & Independent Events", topic: "probability" },
  "L11-C9-L2": { ch: "Chương IX · Xác Suất", chEn: "Chapter IX · Probability", title: "Bài 2 · Quy tắc cộng và nhân xác suất", titleEn: "Lesson 2 · Addition & Multiplication Rules", topic: "probability" },
  "L11-C9-L3": { ch: "Chương IX · Xác Suất", chEn: "Chapter IX · Probability", title: "Bài 3 · Ôn tập Chương IX", titleEn: "Lesson 3 · Practice & Review – Chapter 9", topic: "probability" }
};

const GRADE_12_LESSONS = {
  // Chapter 1
  "L12-C1-L1": { ch: "Chương I · Ứng Dụng Đạo Hàm", chEn: "Chapter I · Applications of Derivatives", title: "Bài 1 · Đơn điệu và Cực trị của hàm số", titleEn: "Lesson 1 · Monotonicity & Extremum of Functions", topic: "derivatives" },
  "L12-C1-L2": { ch: "Chương I · Ứng Dụng Đạo Hàm", chEn: "Chapter I · Applications of Derivatives", title: "Bài 2 · Giá trị lớn nhất & nhỏ nhất của hàm số", titleEn: "Lesson 2 · Maximum & Minimum Values of Functions", topic: "derivatives" },
  "L12-C1-L3": { ch: "Chương I · Ứng Dụng Đạo Hàm", chEn: "Chapter I · Applications of Derivatives", title: "Bài 3 · Đường tiệm cận của đồ thị hàm số", titleEn: "Lesson 3 · Asymptotes of Graphs", topic: "derivatives" },
  "L12-C1-L4": { ch: "Chương I · Ứng Dụng Đạo Hàm", chEn: "Chapter I · Applications of Derivatives", title: "Bài 4 · Khảo sát và Vẽ đồ thị hàm số", titleEn: "Lesson 4 · Surveying & Graphing Functions", topic: "derivatives" },
  "L12-C1-L5": { ch: "Chương I · Ứng Dụng Đạo Hàm", chEn: "Chapter I · Applications of Derivatives", title: "Bài 5 · Ôn tập Chương I", titleEn: "Lesson 5 · Practice & Review – Chapter 1", topic: "derivatives" },
  // Chapter 2
  "L12-C2-L1": { ch: "Chương II · Tọa Độ Không Gian", chEn: "Chapter II · Space Coordinates", title: "Bài 1 · Vectơ trong không gian", titleEn: "Lesson 1 · Vectors in Space", topic: "geometry" },
  "L12-C2-L2": { ch: "Chương II · Tọa Độ Không Gian", chEn: "Chapter II · Space Coordinates", title: "Bài 2 · Hệ tọa độ trong không gian", titleEn: "Lesson 2 · Coordinate System in Space", topic: "geometry" },
  "L12-C2-L3": { ch: "Chương II · Tọa Độ Không Gian", chEn: "Chapter II · Space Coordinates", title: "Bài 3 · Biểu thức tọa độ của phép toán vectơ", titleEn: "Lesson 3 · Expressions of Vector Operations", topic: "geometry" },
  "L12-C2-L4": { ch: "Chương II · Tọa Độ Không Gian", chEn: "Chapter II · Space Coordinates", title: "Bài 4 · Ôn tập Chương II", titleEn: "Lesson 4 · Practice & Review – Chapter 2", topic: "geometry" },
  // Chapter 3
  "L12-C3-L1": { ch: "Chương III · Số Đặc Trưng Đo Độ Phân Tán", chEn: "Chapter III · Measures of Dispersion", title: "Bài 1 · Khoảng biến thiên và Khoảng tứ phân vị ghép nhóm", titleEn: "Lesson 1 · Range & Interquartile Range", topic: "stats" },
  "L12-C3-L2": { ch: "Chương III · Số Đặc Trưng Đo Độ Phân Tán", chEn: "Chapter III · Measures of Dispersion", title: "Bài 2 · Phương sai và Độ lệch chuẩn mẫu ghép nhóm", titleEn: "Lesson 2 · Variance & Standard Deviation", topic: "stats" },
  "L12-C3-L3": { ch: "Chương III · Số Đặc Trưng Đo Độ Phân Tán", chEn: "Chapter III · Measures of Dispersion", title: "Bài 3 · Ôn tập Chương III", titleEn: "Lesson 3 · Practice & Review – Chapter 3", topic: "stats" },
  // Chapter 4
  "L12-C4-L1": { ch: "Chương IV · Nguyên Hàm & Tích Phân", chEn: "Chapter IV · Integrals", title: "Bài 1 · Nguyên hàm", titleEn: "Lesson 1 · Antiderivatives", topic: "integrals" },
  "L12-C4-L2": { ch: "Chương IV · Nguyên Hàm & Tích Phân", chEn: "Chapter IV · Integrals", title: "Bài 2 · Tích phân", titleEn: "Lesson 2 · Integrals", topic: "integrals" },
  "L12-C4-L3": { ch: "Chương IV · Nguyên Hàm & Tích Phân", chEn: "Chapter IV · Integrals", title: "Bài 3 · Ứng dụng hình học của tích phân", titleEn: "Lesson 3 · Geometric Applications of Integrals", topic: "integrals" },
  "L12-C4-L4": { ch: "Chương IV · Nguyên Hàm & Tích Phân", chEn: "Chapter IV · Integrals", title: "Bài 4 · Ôn tập Chương IV", titleEn: "Lesson 4 · Practice & Review – Chapter 4", topic: "integrals" },
  // Chapter 5
  "L12-C5-L1": { ch: "Chương V · Hình Học Giải Tích Không Gian", chEn: "Chapter V · Space Analytic Geometry", title: "Bài 1 · Phương trình mặt phẳng", titleEn: "Lesson 1 · Equations of Planes", topic: "geometry" },
  "L12-C5-L2": { ch: "Chương V · Hình Học Giải Tích Không Gian", chEn: "Chapter V · Space Analytic Geometry", title: "Bài 2 · Phương trình đường thẳng", titleEn: "Lesson 2 · Equations of Lines", topic: "geometry" },
  "L12-C5-L3": { ch: "Chương V · Hình Học Giải Tích Không Gian", chEn: "Chapter V · Space Analytic Geometry", title: "Bài 3 · Phương trình mặt cầu", titleEn: "Lesson 3 · Equations of Spheres", topic: "geometry" },
  "L12-C5-L4": { ch: "Chương V · Hình Học Giải Tích Không Gian", chEn: "Chapter V · Space Analytic Geometry", title: "Bài 4 · Ôn tập Chương V", titleEn: "Lesson 4 · Practice & Review – Chapter 5", topic: "geometry" },
  // Chapter 6
  "L12-C6-L1": { ch: "Chương VI · Xác Suất Có Điều Kiện", chEn: "Chapter VI · Conditional Probability", title: "Bài 1 · Xác suất có điều kiện", titleEn: "Lesson 1 · Conditional Probability", topic: "probability" },
  "L12-C6-L2": { ch: "Chương VI · Xác Suất Có Điều Kiện", chEn: "Chapter VI · Conditional Probability", title: "Bài 2 · Công thức xác suất toàn phần & Bayes", titleEn: "Lesson 2 · Total Probability & Bayes' Formula", topic: "probability" },
  "L12-C6-L3": { ch: "Chương VI · Xác Suất Có Điều Kiện", chEn: "Chapter VI · Conditional Probability", title: "Bài 3 · Ôn tập Chương VI", titleEn: "Lesson 3 · Practice & Review – Chapter 6", topic: "probability" }
};

// Generate high quality interactive questions based on lesson topic
function generateLessonQuestions(slug, metadata) {
  const { topic, title, titleEn } = metadata;
  
  let mc = [];
  let tf = [];
  let fill = [];
  
  if (topic === "trig") {
    mc = [
      { q: "Radian measure of 90° angle is?", o: ["π/4", "π/3", "π/2", "π"], a: 2, ex: "90° = 90 × (π/180) = π/2 rad." },
      { q: "Which of the following is the correct sine addition formula?", o: ["sin(a+b) = sin a cos b + cos a sin b", "sin(a+b) = sin a cos b - cos a sin b", "sin(a+b) = cos a cos b - sin a sin b", "sin(a+b) = cos a cos b + sin a sin b"], a: 0, ex: "Standard trigonometric sum identity for Sine." },
      { q: "Find the general solution of sin x = 1?", o: ["x = π/2 + kπ", "x = π/2 + k2π", "x = kπ", "x = k2π"], a: 1, ex: "The sine function achieves its maximum value of 1 at π/2 + k2π." }
    ];
    tf = [
      { s: "The function y = tan x is defined for all real numbers.", a: false, ex: "FALSE — tan x is undefined for x = π/2 + kπ." },
      { s: "cos(2x) = 2cos²(x) - 1 is a valid double angle formula.", a: true, ex: "TRUE — Standard cosine double angle formula." }
    ];
    fill = [
      { id: "f1", tp: "The value of cos(π) is equal to ___", ans: "-1", alt: ["-1"], h: "Recall the unit circle at 180 degrees" }
    ];
  } else if (topic === "sequences") {
    mc = [
      { q: "Given an Arithmetic Progression with a1 = 3 and common difference d = 5. Find the 10th term.", o: ["45", "48", "53", "50"], a: 1, ex: "a10 = a1 + 9d = 3 + 9(5) = 48." },
      { q: "If a sequence is defined by un = 3^n, what type of progression is it?", o: ["Arithmetic", "Geometric", "Harmonic", "Fibonacci"], a: 1, ex: "un+1 / un = 3 (constant ratio), so it is a Geometric Progression." }
    ];
    tf = [
      { s: "The common difference of an arithmetic progression can be negative.", a: true, ex: "TRUE — For example, 10, 8, 6, 4... is an AP with d = -2." },
      { s: "Any sequence with a constant difference is geometric.", a: false, ex: "FALSE — A constant difference defines an Arithmetic Progression." }
    ];
    fill = [
      { id: "f1", tp: "For a GP with a1 = 2 and common ratio q = 3, the 3rd term is ___", ans: "18", alt: ["18"], h: "a3 = a1 * q^2 = 2 * 3^2" }
    ];
  } else if (topic === "limits") {
    mc = [
      { q: "Find the limit: lim (n -> ∞) (2n + 3)/(n - 1).", o: ["0", "1", "2", "∞"], a: 2, ex: "Divide numerator and denominator by n: lim (2 + 3/n)/(1 - 1/n) = 2." },
      { q: "A function f(x) is continuous at x0 if:", o: ["lim (x->x0) f(x) exists", "f(x0) is defined", "lim (x->x0) f(x) = f(x0)", "f'(x0) exists"], a: 2, ex: "Definition of continuity: limit matches the value of function at that point." }
    ];
    tf = [
      { s: "If a function is continuous on a closed interval [a, b], it must achieve a maximum value on that interval.", a: true, ex: "TRUE — Extreme Value Theorem (Weierstrass)." },
      { s: "The limit of 1/x as x approaches 0 exists and equals 0.", a: false, ex: "FALSE — The limit does not exist (goes to +∞ from right and -∞ from left)." }
    ];
    fill = [
      { id: "f1", tp: "Find lim (x -> 3) (x^2 - 9)/(x - 3) = ___", ans: "6", alt: ["6"], h: "Factor as (x-3)(x+3), cancel (x-3) and evaluate limit" }
    ];
  } else if (topic === "derivatives") {
    mc = [
      { q: "What is the derivative of f(x) = x^3 - 3x + 5?", o: ["3x^2 - 3", "3x^2 - 3x", "x^2 - 3", "3x^2"], a: 0, ex: "Apply power rule: d/dx(x^3) = 3x^2, d/dx(-3x) = -3." },
      { q: "If f'(x) changes sign from positive to negative at x0, then x0 is a point of:", o: ["Local Minimum", "Local Maximum", "Inflection", "Discontinuity"], a: 1, ex: "Derivative changes from positive (+) to negative (-) means function rises then falls, creating a maximum." }
    ];
    tf = [
      { s: "If f'(x0) = 0, then x0 must be a local extremum point.", a: false, ex: "FALSE — For y = x^3, y'(0) = 0 but x = 0 is an inflection point, not an extremum." },
      { s: "The derivative of sin(x) is cos(x).", a: true, ex: "TRUE — Basic derivative identity." }
    ];
    fill = [
      { id: "f1", tp: "Find the derivative of y = e^(2x) at x = 0. Answer: ___", ans: "2", alt: ["2"], h: "y' = 2e^(2x). Plug in x = 0." }
    ];
  } else if (topic === "integrals") {
    mc = [
      { q: "Find the antiderivative of f(x) = 2x.", o: ["x^2 + C", "2x^2 + C", "x + C", "2 + C"], a: 0, ex: "Integral of 2x dx is x^2 + C." },
      { q: "Calculate the definite integral of x from 0 to 2.", o: ["1", "2", "3", "4"], a: 1, ex: "Integral of x is x^2 / 2. Evaluating from 0 to 2 yields 4/2 - 0 = 2." }
    ];
    tf = [
      { s: "The integral of a sum of functions is equal to the sum of their integrals.", a: true, ex: "TRUE — Integration is a linear operator." },
      { s: "The area under y = cos(x) on [0, π] is always positive.", a: false, ex: "FALSE — cos(x) is negative on [π/2, π], so the integral is 0." }
    ];
    fill = [
      { id: "f1", tp: "Find the indefinite integral of 1/x dx (for x > 0): ln(x) + ___", ans: "C", alt: ["C", "c"], h: "Write the constant of integration" }
    ];
  } else if (topic === "geometry") {
    mc = [
      { q: "In 3D space, two distinct planes are either parallel or they intersect in a:", o: ["Point", "Line", "Ray", "Segment"], a: 1, ex: "Two intersecting planes intersect along a single unique straight line." },
      { q: "Find the dot product of vectors u = (1, 2, -1) and v = (3, 0, 4) in space.", o: ["7", "-1", "1", "0"], a: 1, ex: "u.v = (1)(3) + (2)(0) + (-1)(4) = 3 + 0 - 4 = -1." }
    ];
    tf = [
      { s: "Two lines that do not intersect must be parallel.", a: false, ex: "FALSE — In 3D space, they can be skew (không song song và không cắt nhau)." },
      { s: "A line perpendicular to two intersecting lines in a plane is perpendicular to that plane.", a: true, ex: "TRUE — Theorem linking line perpendicularity to a plane." }
    ];
    fill = [
      { id: "f1", tp: "If line a is parallel to plane P, then the number of points they share is ___", ans: "0", alt: ["0", "không"], h: "Parallel means no intersection" }
    ];
  } else { // stats or probability
    mc = [
      { q: "If A and B are independent events with P(A) = 0.5 and P(B) = 0.4. Find P(A ∩ B).", o: ["0.9", "0.1", "0.2", "0.3"], a: 2, ex: "P(A ∩ B) = P(A) * P(B) = 0.5 * 0.4 = 0.2." },
      { q: "In a grouped data table, the class containing the median is called:", o: ["Modal class", "Median class", "Mean class", "Interval class"], a: 1, ex: "The median class is the class containing the median value." }
    ];
    tf = [
      { s: "P(A | B) is always equal to P(B | A).", a: false, ex: "FALSE — By Bayes' Theorem, P(A|B) = P(B|A) * P(A) / P(B)." },
      { s: "The sum of all class frequencies equals the total sample size.", a: true, ex: "TRUE — Definition of relative or absolute frequency sums." }
    ];
    fill = [
      { id: "f1", tp: "If P(A) = 0.3, then the probability of its complement event P(A_bar) is ___", ans: "0.7", alt: ["0.7"], h: "1 - P(A)" }
    ];
  }

  return { mc, tf, fill };
}

// Generate the complete structured lesson object dynamically
export function getLessonData(slug) {
  if (!slug) return null;

  // 1. Identify Grade
  let metadata = null;
  let gradePrefix = "";
  if (slug.startsWith("L11-")) {
    metadata = GRADE_11_LESSONS[slug];
    gradePrefix = "Grade 11";
  } else if (slug.startsWith("L12-")) {
    metadata = GRADE_12_LESSONS[slug];
    gradePrefix = "Grade 12";
  }

  if (!metadata) return null;

  // 2. Set static curriculum resources
  const chapterTitle = { vi: metadata.ch, en: metadata.chEn };
  const lessonTitle = { vi: metadata.title, en: metadata.titleEn };
  
  const learningObjectives = [
    { vi: "Hiểu vững vàng lý thuyết toán học song ngữ.", en: "Master the bilingual mathematical theory." },
    { vi: "Thực hành giải bài tập mức độ đa dạng và thích ứng.", en: "Practice adaptive multi-level exercises." }
  ];

  const navItems = [
    ["videoBaiGiang", "🎬", "Video bài giảng", "Lesson Video"],
    ["miniGame", "🎮", "Luyện tập minigame", "Mini Game"],
    ["baiTap", "✏️", "Bài tập tổng hợp", "Practice Exercises"]
  ];

  // Pick a realistic sample video ID for mathematics
  const videoId = "KFgvOQtH0Z0"; 
  const videoSubtitles = [
    {
      start: 0,
      end: 10,
      words: [
        { text: "Welcome to this math lesson", vi: "Chào mừng bạn đến với bài học toán" },
        { text: "where we cover core formulas", vi: "nơi chúng ta tìm hiểu công thức chính", detail: "<b>core formulas</b>: công thức cốt lõi.", detailTitle: "Core Formulas" }
      ]
    },
    {
      start: 10,
      end: 9999,
      words: [
        { text: "Make sure to solve quiz questions", vi: "Đảm bảo bạn làm bài tập trắc nghiệm" },
        { text: "and test your knowledge step by step.", vi: "và tự kiểm tra kiến thức từng bước." }
      ]
    }
  ];

  // 3. Generate interactive questions
  const { mc, tf, fill } = generateLessonQuestions(slug, metadata);

  // 4. Render customized bilingual theory content dynamically using React elements
  const renderTheory = ({ t, lang, LessonVideoPlayer, videoId, videoSubtitles }) => {
    return (
      <div style={{ animation: "fadeIn 0.5s ease-both" }}>
        
        {/* Core Quick Theory Link Pills */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14, marginBottom: 32 }}>
          <article style={{ padding: 14, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", marginBottom: 3 }}>{t("Lĩnh vực", "Domain")}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#22d3ee" }}>{metadata.chEn.split("·")[1] || "Mathematics"}</div>
          </article>
          <article style={{ padding: 14, borderRadius: 10, background: "rgba(255, 255, 255, 0.04)", border: "1px solid rgba(255, 255, 255, 0.08)", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
            <div style={{ fontSize: 12, color: "rgba(255, 255, 255, 0.5)", marginBottom: 3 }}>{t("Lộ trình", "Pathway")}</div>
            <div style={{ fontSize: 15, fontWeight: 600, color: "#a5b4fc" }}>SAT Math Standard</div>
          </article>
        </div>

        {/* Theory Summary Section */}
        <section id="tomTat" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="📚" title={t("Tóm Tắt Lý Thuyết", "Theory Summary")} />
          <TheoryBlock>
            <h4 style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
              {t("1. Khái niệm cốt lõi", "1. Core Concept")}
            </h4>
            <p style={{ lineHeight: 1.7, margin: "0 0 16px", color: "rgba(255,255,255,0.8)" }}>
              {t(
                `Bài học này tập trung vào kiến thức trọng tâm của ${metadata.title.toLowerCase()}. Đây là chuyên đề cực kỳ quan trọng xuất hiện nhiều trong đề thi đại học THPT Quốc gia và bài thi chuẩn hóa quốc tế như SAT, AP Math.`,
                `This lesson focuses on the core principles of ${metadata.titleEn.toLowerCase()}. This is a fundamental topic heavily tested in SAT Math, AP, and standard High School curricula.`
              )}
            </p>

            <h4 style={{ color: "#38bdf8", fontWeight: 700, marginBottom: 8, fontSize: 16 }}>
              {t("2. Công thức quan trọng", "2. Core Formula")}
            </h4>
            
            {/* Generate appropriate LaTeX formulas dynamically depending on topic */}
            {metadata.topic === "trig" && (
              <FormulaCard 
                label={t("Công thức đổi số đo góc", "Angle Conversion Relation")} 
                formula="180° = π rad" 
                note={t("α (rad) = a° × (π / 180°)", "α (rad) = a° × (π / 180°)")} 
              />
            )}
            {metadata.topic === "sequences" && (
              <FormulaCard 
                label={t("Số hạng tổng quát Cấp số cộng", "Arithmetic Progression Term")} 
                formula="u_n = u_1 + (n - 1)d" 
                note={t("u_1: số hạng đầu, d: công sai", "u_1: initial term, d: common difference")} 
              />
            )}
            {metadata.topic === "limits" && (
              <FormulaCard 
                label={t("Hệ số giới hạn cơ bản", "Fundamental Limit Coefficient")} 
                formula="lim (1 / n^k) = 0  (k > 0)" 
                note={t("Khi n tiến ra vô cùng", "As n approaches infinity")} 
              />
            )}
            {metadata.topic === "derivatives" && (
              <FormulaCard 
                label={t("Đạo hàm lũy thừa", "Power Rule for Derivatives")} 
                formula="(x^n)' = n · x^(n-1)" 
                note={t("Với mọi n là số thực", "For any real number n")} 
              />
            )}
            {metadata.topic === "integrals" && (
              <FormulaCard 
                label={t("Tích phân cơ bản", "Basic Integral antiderivative")} 
                formula="∫ x^n dx = [x^(n+1) / (n+1)] + C" 
                note={t("Điều kiện n khác -1", "Where n is not equal to -1")} 
              />
            )}
            {metadata.topic === "geometry" && (
              <FormulaCard 
                label={t("Phương trình mặt phẳng đi qua M(x0, y0, z0)", "Equation of Plane passing M")} 
                formula="A(x-x_0) + B(y-y_0) + C(z-z_0) = 0" 
                note={t("Véc tơ pháp tuyến n = (A, B, C)", "Normal vector n = (A, B, C)")} 
              />
            )}
            {metadata.topic === "probability" && (
              <FormulaCard 
                label={t("Xác suất cổ điển", "Classical Probability formula")} 
                formula="P(A) = n(A) / n(Ω)" 
                note={t("Khi các kết quả đồng khả năng", "For equally likely outcomes")} 
              />
            )}
          </TheoryBlock>
        </section>

        {/* Video Lecture Section */}
        <section id="videoBaiGiang" style={{ scrollMarginTop: 80, marginBottom: 56 }}>
          <SectionHeader icon="🎬" title={t("Video Bài Giảng", "Video Lecture")} />
          <div style={{ borderRadius: 16, overflow: "hidden", border: "1px solid rgba(255,255,255,0.08)" }}>
            <LessonVideoPlayer
              videoId={videoId}
              subtitles={videoSubtitles}
              lang={lang}
              credit={t("Video hỗ trợ trực quan từ giảng viên quốc tế", "Visual explanation from international lecturers")}
            />
          </div>
        </section>

        {/* Practice Exercises Section */}
        <section id="baiTap" style={{ scrollMarginTop: 80, marginBottom: 20 }}>
          <SectionHeader icon="✏️" title={t("Bài Tập Luyện Tập", "Bilingual Exercises")} />
          
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
            <article style={{ padding: 20, borderRadius: 12, background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                <span style={{ background: "rgba(34,211,238,0.15)", color: "#22d3ee", padding: "2px 8px", borderRadius: 12, fontSize: 11, fontWeight: 700 }}>
                  Exercise 1
                </span>
                <span style={{ fontSize: 13, color: "rgba(255,255,255,0.4)" }}>SAT Math Grid-In</span>
              </div>
              <p style={{ margin: "0 0 12px", fontSize: 14.5, lineHeight: 1.6 }}>
                {t(
                  `Tìm lời giải và đáp án cho bài toán liên quan đến ${metadata.title.toLowerCase()} trong đề thi thử SAT Math gần nhất.`,
                  `Analyze and solve the mathematical problem relating to ${metadata.titleEn.toLowerCase()} extracted from the latest SAT test.`
                )}
              </p>
              <div style={{ fontSize: 13, color: "#6ee7b7", background: "rgba(5,150,105,0.1)", padding: "10px 14px", borderRadius: 8, border: "1px solid rgba(5,150,105,0.2)" }}>
                💡 <strong>{t("Gợi ý:", "Hint:")}</strong> {t("Hãy kiểm tra kỹ giả thuyết đề bài và vẽ hình (nếu có) trước khi làm phép tính.", "Double check constraints and sketch geometry figures before entering formulas.")}
              </div>
            </article>
          </div>
        </section>

      </div>
    );
  };

  return {
    chapterTitle,
    lessonTitle,
    learningObjectives,
    navItems,
    videoId,
    videoSubtitles,
    mcQuestions: mc,
    tfCards: tf,
    fillQuestions: fill,
    renderTheory
  };
}
