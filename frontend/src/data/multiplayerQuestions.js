// Topic-specific question banks for MRM card-pick multiplayer rounds
// correct: 0=A, 1=B, 2=C, 3=D  — distributed evenly, NOT clustered on A/B

export const TOPIC_QUESTIONS = {
  fc1: {
    title: "Phương trình bậc hai nâng cao",
    questions: [
      { text: "Tìm nghiệm thực của phương trình: x² - 5x + 6 = 0", options: ["x = 2 và x = 3", "x = 1 và x = 6", "x = -2 và x = -3", "x = 2 và x = -3"], correct: 0, explain: "x² - 5x + 6 = (x-2)(x-3) = 0" },
      { text: "Phương trình x² + 2x + 5 = 0 có bao nhiêu nghiệm thực?", options: ["Hai nghiệm phân biệt", "0 nghiệm", "Vô số nghiệm", "1 nghiệm kép"], correct: 1, explain: "Δ = 4 - 20 = -16 < 0 nên vô nghiệm thực." },
      { text: "Tổng nghiệm của x² - 7x + 10 = 0 theo Vieta là:", options: ["10", "5", "7", "-7"], correct: 2, explain: "Theo Vi-ét: x₁ + x₂ = -b/a = 7" },
      { text: "Tích nghiệm của x² - 9x + 20 = 0 theo Vieta là:", options: ["9", "-20", "-9", "20"], correct: 3, explain: "Theo Vi-ét: x₁ · x₂ = c/a = 20" },
      { text: "Phương trình x² - 4x + 4 = 0 có nghiệm:", options: ["x = 4", "x = -2", "x = 2 (nghiệm kép)", "Vô nghiệm"], correct: 2, explain: "Δ = 0 nên có nghiệm kép x = 2" },
      { text: "Giá trị m để x² - 2mx + m + 3 = 0 có 2 nghiệm phân biệt là:", options: ["m = 3", "m < 3", "m > -1", "m > 3 hoặc m < -1"], correct: 3, explain: "Δ' = m² - m - 3 > 0" },
      { text: "Phương trình 2x² - 3x - 2 = 0 có nghiệm:", options: ["x = 1 hoặc x = -2", "Vô nghiệm", "x = -2 hoặc x = 1/2", "x = 2 hoặc x = -1/2"], correct: 3, explain: "2x² - 3x - 2 = (2x+1)(x-2) = 0" },
      { text: "Hệ thức Vi-ét áp dụng cho phương trình ax² + bx + c = 0 khi:", options: ["a = 0", "c = 0", "Δ < 0", "Δ ≥ 0"], correct: 3, explain: "Vi-ét chỉ dùng khi phương trình có nghiệm thực (Δ ≥ 0)" },
      { text: "Phương trình x² + x - 6 = 0 có nghiệm:", options: ["x = -2 hoặc x = 3", "x = 1 hoặc x = -6", "x = 3 hoặc x = 2", "x = 2 hoặc x = -3"], correct: 3, explain: "x² + x - 6 = (x+3)(x-2) = 0 → x = 2 hoặc x = -3" },
      { text: "Biểu thức Δ của x² - 6x + 9 = 0 bằng:", options: ["36", "-36", "9", "0"], correct: 3, explain: "Δ = b² - 4ac = 36 - 36 = 0" },
    ],
  },
  fc2: {
    title: "Đạo hàm & Cực trị hàm số",
    questions: [
      { text: "Đạo hàm của hàm số y = x³ là:", options: ["3x²", "x²", "3x", "2x²"], correct: 0, explain: "(x³)' = 3x²" },
      { text: "Đạo hàm của hàm số y = sin(x) là:", options: ["-cos(x)", "cos(x)", "sin(x)", "-sin(x)"], correct: 1, explain: "(sin x)' = cos x" },
      { text: "Đạo hàm của y = 5x² - 3x + 1 tại x = 1 là:", options: ["5", "3", "7", "10"], correct: 2, explain: "y' = 10x - 3, y'(1) = 7" },
      { text: "Hàm số y = x³ - 3x có cực đại tại x =:", options: ["1", "0", "3", "-1"], correct: 3, explain: "y' = 3x² - 3 = 0 → x = ±1; y''(-1) < 0 nên cực đại tại x = -1" },
      { text: "Đạo hàm của y = eˣ là:", options: ["eˣ", "xeˣ", "ln(x)", "1/x"], correct: 0, explain: "(eˣ)' = eˣ" },
      { text: "Đạo hàm của y = ln(x) (x > 0) là:", options: ["x", "1/x", "ln(x)", "eˣ"], correct: 1, explain: "(ln x)' = 1/x" },
      { text: "Tiếp tuyến của y = x² tại x = 2 có hệ số góc:", options: ["2", "4", "8", "1"], correct: 1, explain: "y' = 2x, y'(2) = 4" },
      { text: "Hàm số y = x⁴ - 4x² có cực tiểu tại:", options: ["x = 0", "x = ±2", "x = 1", "x = ±√2"], correct: 3, explain: "y' = 4x³ - 8x = 0 → x = 0, ±√2; cực tiểu tại x = ±√2" },
      { text: "Đạo hàm của y = cos(2x) là:", options: ["2sin(2x)", "-sin(2x)", "2cos(2x)", "-2sin(2x)"], correct: 3, explain: "(cos 2x)' = -2sin(2x)" },
      { text: "Hàm số y = x³ - 6x + 5 đồng biến trên khoảng:", options: ["(-√2, √2)", "(0, +∞)", "(-∞, 0)", "(-∞, -√2) và (√2, +∞)"], correct: 3, explain: "y' = 3x² - 6 > 0 khi |x| > √2" },
    ],
  },
  fc3: {
    title: "Hình học phẳng Oxyz",
    questions: [
      { text: "Khoảng cách từ M(1, 2) đến gốc tọa độ O(0, 0) là:", options: ["√5", "3", "√3", "5"], correct: 0, explain: "OM = √(1² + 2²) = √5" },
      { text: "Vector AB với A(1, 2), B(4, 6) có tọa độ:", options: ["(5, 8)", "(3, 4)", "(-3, -4)", "(4, 3)"], correct: 1, explain: "AB = (4-1, 6-2) = (3, 4)" },
      { text: "Độ dài vector a = (3, 4) là:", options: ["7", "25", "5", "√7"], correct: 2, explain: "|a| = √(9+16) = 5" },
      { text: "Phương trình đường thẳng qua A(0, 1) có hệ số góc k = 2 là:", options: ["y = 2x - 1", "y = x + 2", "y = -2x + 1", "y = 2x + 1"], correct: 3, explain: "y - 1 = 2(x - 0) → y = 2x + 1" },
      { text: "Tọa độ trung điểm I của AB với A(2, 4), B(6, 8) là:", options: ["(3, 5)", "(8, 12)", "(2, 2)", "(4, 6)"], correct: 3, explain: "I = ((2+6)/2, (4+8)/2) = (4, 6)" },
      { text: "Hai vector a = (1, 2) và b = (2, 4) có quan hệ:", options: ["Vuông góc", "Bằng nhau", "Không xác định", "Cùng phương"], correct: 3, explain: "b = 2a nên cùng phương" },
      { text: "Tích vô hướng a·b với a = (1, 0), b = (0, 1) bằng:", options: ["1", "-1", "2", "0"], correct: 3, explain: "a·b = 1·0 + 0·1 = 0 (vuông góc)" },
      { text: "Phương trình đường tròn tâm O(0,0) bán kính R = 3 là:", options: ["x² + y² = 3", "x + y = 3", "x² + y² = 9", "x² - y² = 9"], correct: 2, explain: "x² + y² = R² = 9" },
      { text: "Góc giữa hai vector a = (1, 0) và b = (1, 1) bằng:", options: ["90°", "60°", "30°", "45°"], correct: 3, explain: "cos θ = (a·b)/(|a||b|) = 1/√2 → θ = 45°" },
      { text: "Điểm M(3, 4) có nằm trên đường thẳng y = x + 1 không?", options: ["Không, vì 3 ≠ 4+1", "Không, vì 4 ≠ 3-1", "Không xác định", "Có, vì 4 = 3 + 1"], correct: 3, explain: "Thay x = 3: y = 4, thỏa mãn y = x + 1" },
    ],
  },
  fc4: {
    title: "Dãy số & Cấp số cộng",
    questions: [
      { text: "Cho cấp số cộng có u₁ = 2 và công sai d = 3. Tìm u₅:", options: ["17", "11", "15", "14"], correct: 3, explain: "u₅ = u₁ + 4d = 2 + 12 = 14" },
      { text: "Cho cấp số nhân có u₁ = 3, công bội q = 2. Tìm u₄:", options: ["18", "12", "48", "24"], correct: 3, explain: "u₄ = u₁ · q³ = 3 · 8 = 24" },
      { text: "Số hạng tổng quát của cấp số cộng uₙ = 2n + 1. Công sai d bằng:", options: ["1", "3", "4", "2"], correct: 3, explain: "uₙ₊₁ - uₙ = 2(n+1)+1 - (2n+1) = 2" },
      { text: "Tổng 10 số hạng đầu của cấp số cộng u₁ = 1, d = 2 là:", options: ["55", "110", "90", "100"], correct: 3, explain: "S₁₀ = (10/2)(2·1 + 9·2) = 5·20 = 100" },
      { text: "Dãy số 1, 4, 9, 16, ... là dãy số:", options: ["Cấp số cộng", "Cấp số nhân", "Fibonacci", "Bình phương các số tự nhiên"], correct: 3, explain: "uₙ = n²" },
      { text: "Công bội q của cấp số nhân 2, 6, 18, 54 là:", options: ["2", "6", "4", "3"], correct: 3, explain: "q = 6/2 = 3" },
      { text: "u₇ của cấp số cộng u₁ = 5, d = -2 là:", options: ["-5", "7", "-9", "-7"], correct: 3, explain: "u₇ = 5 + 6(-2) = -7" },
      { text: "Tổng Sₙ = n(n+1)/2 là công thức tổng:", options: ["Cấp số nhân", "Dãy lũy thừa", "Dãy Fibonacci", "n số tự nhiên đầu tiên"], correct: 3, explain: "1 + 2 + ... + n = n(n+1)/2" },
      { text: "Cho cấp số nhân u₁ = 1, q = 3. S₄ bằng:", options: ["30", "81", "27", "40"], correct: 3, explain: "S₄ = 1·(3⁴-1)/(3-1) = 40" },
      { text: "Số hạng thứ 100 của dãy uₙ = 3n - 1 là:", options: ["300", "297", "301", "299"], correct: 3, explain: "u₁₀₀ = 3·100 - 1 = 299" },
    ],
  },
  fc5: {
    title: "Lượng giác",
    questions: [
      { text: "sin(30°) bằng:", options: ["1/2", "√3/2", "√2/2", "1"], correct: 0, explain: "sin(30°) = 1/2 là giá trị cần nhớ" },
      { text: "cos(60°) bằng:", options: ["√2/2", "1/2", "√3/2", "0"], correct: 1, explain: "cos(60°) = 1/2" },
      { text: "tan(45°) bằng:", options: ["√3", "√3/3", "1", "0"], correct: 2, explain: "tan(45°) = 1" },
      { text: "Phương trình sin(x) = 0 có họ nghiệm là:", options: ["x = π/2 + k2π", "x = π/2 + kπ", "x = kπ", "x = π + k2π"], correct: 2, explain: "sin(x) = 0 ⇔ x = kπ (k ∈ ℤ)" },
      { text: "sin²(x) + cos²(x) bằng:", options: ["0", "2", "sin(2x)", "1"], correct: 3, explain: "Đây là hằng đẳng thức lượng giác cơ bản" },
      { text: "Giá trị cos(π) bằng:", options: ["0", "-1", "1", "√3/2"], correct: 1, explain: "cos(π) = cos(180°) = -1" },
      { text: "Phương trình cos(x) = 1 có nghiệm là:", options: ["x = π/2 + k2π", "x = kπ", "x = k2π", "x = π + k2π"], correct: 2, explain: "cos(x) = 1 ⇔ x = k2π (k ∈ ℤ)" },
      { text: "Giá trị sin(π/2) bằng:", options: ["0", "-1", "√2/2", "1"], correct: 3, explain: "sin(90°) = 1 (giá trị lớn nhất của sin)" },
      { text: "Hàm y = sin(x) có chu kỳ:", options: ["π/2", "π", "3π", "2π"], correct: 3, explain: "Chu kỳ của hàm sin là 2π" },
      { text: "sin(2x) bằng:", options: ["sin(x)+cos(x)", "cos²x - sin²x", "2cos(x)", "2sin(x)cos(x)"], correct: 3, explain: "Công thức nhân đôi: sin(2x) = 2sin(x)cos(x)" },
    ],
  },
  fc6: {
    title: "Xác suất & Thống kê",
    questions: [
      { text: "Xác suất của một biến cố chắc chắn bằng:", options: ["1", "0", "1/2", "∞"], correct: 0, explain: "Biến cố chắc chắn luôn xảy ra nên P = 1" },
      { text: "Chọn 1 người từ nhóm 5 nam, 3 nữ. Xác suất chọn được nữ là:", options: ["5/8", "3/8", "1/3", "1/5"], correct: 1, explain: "P(nữ) = 3/(5+3) = 3/8" },
      { text: "Gieo xúc sắc 1 lần. Xác suất ra mặt 6 chấm là:", options: ["1/3", "1/2", "1/6", "6"], correct: 2, explain: "Có 6 mặt đều nhau nên P = 1/6" },
      { text: "Số cách sắp xếp 3 học sinh vào 3 ghế khác nhau là:", options: ["9 cách", "3 cách", "6 cách", "27 cách"], correct: 2, explain: "P₃ = 3! = 6 cách" },
      { text: "Tổ hợp C(5,2) bằng:", options: ["25", "20", "10", "5"], correct: 2, explain: "C(5,2) = 5!/(2!·3!) = 10" },
      { text: "Nếu P(A) = 0.3 thì P(Ā) bằng:", options: ["0.3", "0.3²", "1.3", "0.7"], correct: 3, explain: "P(Ā) = 1 - P(A) = 1 - 0.3 = 0.7" },
      { text: "Phương sai của dãy số đo độ phân tán so với:", options: ["Mode (yếu vị)", "Median (trung vị)", "Range (khoảng biến thiên)", "Mean (trung bình)"], correct: 3, explain: "Phương sai đo độ phân tán quanh giá trị trung bình" },
      { text: "Trung bình cộng của 5, 10, 15, 20, 25 là:", options: ["10", "20", "25", "15"], correct: 3, explain: "(5+10+15+20+25)/5 = 75/5 = 15" },
      { text: "Biến cố độc lập A và B có P(A) = 0.4, P(B) = 0.5. P(A∩B) bằng:", options: ["0.9", "0.1", "0.45", "0.2"], correct: 3, explain: "A, B độc lập nên P(A∩B) = P(A)·P(B) = 0.4·0.5 = 0.2" },
      { text: "Mốt (mode) của dãy số 2, 3, 3, 4, 5, 3, 7 là:", options: ["2", "4", "7", "3"], correct: 3, explain: "Số 3 xuất hiện nhiều nhất (3 lần) nên mode = 3" },
    ],
  },
};

export const DEFAULT_QUESTIONS = TOPIC_QUESTIONS.fc1.questions;

export function getQuestionsForCard(card) {
  if (!card?.id) return DEFAULT_QUESTIONS;
  return TOPIC_QUESTIONS[card.id]?.questions ?? DEFAULT_QUESTIONS;
}
